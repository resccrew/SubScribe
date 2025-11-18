<template>
  <div class="min-h-screen p-6" style="background-color: var(--bg-page); color: var(--text-main);">
    <!-- Header -->
    <header class="flex justify-between items-center mb-10">
      <router-link to="/dashboard" class="p-2 rounded-full transition-colors hover:bg-black/5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="stroke-current">
          <path d="M15 18L9 12L15 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </router-link>
      <h1 class="text-xl font-semibold">Add Subscription</h1>
      <div class="w-10 h-10"></div>
    </header>

    <main>
      <div class="text-left mb-8">
        <h2 class="text-4xl font-bold">Add your</h2>
        <h2 class="text-4xl font-bold" style="color: var(--muted);">Budget Category</h2>
      </div>

      <!-- Categories List -->
      <div class="space-y-4">
        <div v-for="category in categoryTotals" :key="category.name" class="flex justify-between items-center p-4 rounded-xl" style="background-color: var(--bg-paper);">
          <span class="font-medium">{{ category.name }}</span>
          <span class="font-mono text-sm" style="color: var(--muted);">${{ category.total.toFixed(2) }}</span>
        </div>

        <!-- Add New Category Button -->
        <div @click="openAddCategoryModal" class="flex justify-center items-center p-4 rounded-xl cursor-pointer" style="background-color: var(--bg-paper-muted);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="stroke-current">
            <path d="M12 6V18M6 12H18" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </main>

    <!-- Add Category Modal -->
    <div v-if="showAddCategoryModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeAddCategoryModal">
      <div class="card p-6 rounded-xl w-full max-w-sm">
        <h3 class="text-lg font-semibold mb-4">Add New Category</h3>
        <input v-model="newCategoryName" type="text" placeholder="Category Name" class="form-input w-full mb-4">
        <div class="flex justify-end space-x-4">
          <button @click="closeAddCategoryModal" class="btn-secondary">Cancel</button>
          <button @click="addNewCategory" class="btn-primary">Add</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useSubscriptions } from '@/composables/useSubscriptionsMongo'
import type { Subscription, Category } from '@/types/subscription'

interface CategoryWithTotal extends Category {
  total: number;
  subscriptions: Subscription[];
}

const { user } = useAuth()
const { subscriptions, fetchSubscriptions, categories, fetchCategories, createCategory } = useSubscriptions()

const groupedSubscriptions = computed(() => {
  const groups: Record<string, Subscription[]> = {
    Financial: [],
    Shopping: [],
    Education: [],
    Health: [],
    Other: [],
  }

  for (const sub of subscriptions.value) {
    const categoryName = getCategoryName(sub.category)
    if (groups[categoryName]) {
      groups[categoryName].push(sub)
    } else if (groups.Other) {
      groups.Other.push(sub)
    }
  }
  return groups
})

const categoryTotals = computed<CategoryWithTotal[]>(() => {
  return categories.value.map((cat: Category) => {
    const subs = groupedSubscriptions.value[cat.name] || []
    const total = subs.reduce((sum, sub) => {
      if (sub.cycle === 'monthly') {
        return sum + sub.price
      } else if (sub.cycle === 'yearly') {
        return sum + sub.price / 12
      }
      return sum
    }, 0)
    return { ...cat, total, subscriptions: subs }
  })
})

const getCategoryName = (category?: string): string => {
  const categoryMap: Record<string, string> = {
    streaming: 'Streaming',
    music: 'Music',
    games: 'Games',
    education: 'Education',
    health: 'Health',
    work: 'Productivity',
    financial: 'Finance',
    shopping: 'Shopping',
    other: 'Other',
  }
    if (category && category in categoryMap) {
    return categoryMap[category]
  }
  return 'Other'
}

const showAddCategoryModal = ref(false)
const newCategoryName = ref('')

const openAddCategoryModal = () => {
  newCategoryName.value = ''
  showAddCategoryModal.value = true
}

const closeAddCategoryModal = () => {
  showAddCategoryModal.value = false
}

const addNewCategory = async () => {
  if (newCategoryName.value.trim() !== '' && user.value) {
    await createCategory({ name: newCategoryName.value, userId: user.value.uid })
    closeAddCategoryModal()
  }
}

onMounted(() => {
  watch(user, (currentUser) => {
    if (currentUser?.uid) {
      fetchSubscriptions(currentUser.uid)
      fetchCategories(currentUser.uid)
    }
  }, { immediate: true })
})
</script>

<style scoped>
</style>