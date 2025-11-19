<template>
  <div class="min-h-screen p-6" style="background-color: var(--bg-page); color: var(--text-main);" :style="{ transform: isMenuOpen ? 'translateX(-7rem)' : 'none', transition: 'transform 0.25s ease', paddingRight: isMenuOpen ? '0' : undefined }">
    <!-- Header: Avatar + Menu Icon -->
    <header class="flex justify-between items-center mb-10">
      <div class="w-10 h-10 rounded-full bg-gray-300">
        <img v-if="user?.photoURL" :src="user.photoURL" alt="User Avatar" class="w-full h-full rounded-full object-cover">
        <div v-else class="w-10 h-10 rounded-full flex items-center justify-center" style="background-color: var(--olive);">
           <span v-if="user?.email" class="text-white font-medium text-lg">{{ user.email.charAt(0).toUpperCase() }}</span>
        </div>
      </div>
      <div class="relative">
        <button @click="toggleMenu" class="p-2 rounded-full transition-colors hover:bg-black/5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="stroke-current">
            <path d="M4 6H20M4 12H20M4 18H20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </header>

    <main>
      <!-- Total Spent -->
      <section class="text-center mb-10">
        <p class="text-sm uppercase tracking-widest font-medium" style="color: var(--muted);">Total a month</p>
        <p class="text-6xl font-light mt-2" style="font-family: 'Space Grotesk', monospace;">
          <span class="font-sans text-4xl align-middle">$</span>{{ formatPrice(totalAMonth) }}
        </p>
      </section>

      <!-- Radial Chart -->
      <section class="mb-10">
        <div class="w-full aspect-square">
          <RadialChart :subscriptions="sortedSubscriptions" />
        </div>
      </section>

      <!-- Subscriptions List -->
      <section>
        <div class="space-y-4">
          <div v-if="loading" class="text-center" style="color: var(--muted);">Загрузка...</div>
          <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
          <div v-else-if="sortedSubscriptions.length === 0" class="text-center" style="color: var(--muted);">У вас пока нет подписок.</div>
          <div v-for="sub in sortedSubscriptions" :key="sub.id" class="flex items-center" @click="openEditModal(sub)">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center mr-4" :style="{ backgroundColor: getCategoryColor(sub.category) }">
              <span class="text-white font-medium text-xl">{{ sub.name.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="flex-grow">
              <p class="font-medium text-lg">{{ sub.name }}</p>
              <p class="text-sm" style="color: var(--muted);">{{ getCategoryName(sub.category) }}</p>
            </div>
            <div class="text-right">
              <p class="font-medium text-lg" style="font-family: 'Space Grotesk', monospace;">${{ formatPrice(sub.price) }}</p>
              <p class="text-xs" style="color: var(--muted);">{{ formatDate(sub.billingDate) }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
    
    <!-- Side Drawer Menu -->
    <transition name="drawer">
      <div v-if="isMenuOpen" class="fixed inset-0 z-50" @click.self="toggleMenu" style="background-color: transparent;">
        <div class="fixed right-0 top-0 h-full w-28 border-l" style="background-color: var(--bg-page); border-color: var(--border);">
          <div class="p-4 space-y-2">
            <p class="text-sm uppercase tracking-widest font-medium" style="color: var(--muted);">Menu</p>
            <router-link to="/settings" @click="toggleMenu" class="menu-item">Settings</router-link>
            <router-link to="/app-info" @click="toggleMenu" class="menu-item">О приложении</router-link>
            <div class="border-t my-2" style="border-color: var(--border);"></div>
            <button @click="handleLogout" class="menu-item text-left" style="color: var(--accent);">Logout</button>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- Floating Action Button -->
    <button 
      @click.stop.prevent="openAddModal"
      class="fixed bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 text-white rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110 z-50"
      style="background-color: var(--accent);"
      >
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m6-6H6"></path>
      </svg>
    </button>

    <!-- Modal -->
    <SubscriptionModal 
      :show="showModal"
      :subscription="editingSubscription"
      @close="closeModal"
      @save="handleSaveSubscription"
      @delete="handleDeleteSubscription"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useSubscriptions } from '@/composables/useSubscriptionsMongo'
import SubscriptionModal from '@/components/SubscriptionModal.vue'
import RadialChart from '@/components/RadialChart.vue'
import type { Subscription } from '@/types/subscription'

const { user, logout } = useAuth()
const { 
  subscriptions, 
  loading, 
  error,
  fetchSubscriptions, 
  createSubscription, 
  updateSubscription, 
  deleteSubscription 
} = useSubscriptions()

const showModal = ref(false)
const editingSubscription = ref<Subscription | null>(null)

const router = useRouter()
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const handleLogout = async () => {
  try {
    await logout()
    router.push('/') // Redirect to landing after logout
  } catch (error) {
    console.error("Logout failed", error)
  } finally {
    isMenuOpen.value = false
  }
}

// Sort by price descending to match the visual hierarchy of the example
const sortedSubscriptions = computed<Subscription[]>(() => {
  return [...subscriptions.value].sort((a, b) => b.price - a.price)
})

// Calculate total monthly cost by normalizing yearly subscriptions
const totalAMonth = computed<number>(() => {
  return subscriptions.value.reduce((sum: number, sub: Subscription) => {
    if (sub.cycle === 'monthly') {
      return sum + sub.price;
    } else if (sub.cycle === 'yearly') {
      return sum + sub.price / 12;
    }
    return sum;
  }, 0);
});

// Formats price to one decimal place, e.g., 1374.0
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(price)
}

// Formats date to a readable string like "Next on Jun 23"
const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString as any)
    if (isNaN(date.getTime())) return 'Date not set'
    return `Next on ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)}`
}

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
        return categoryMap[category] ?? 'Other';
  }
  return 'Other';
}

const categoryColorMap: Record<string, string> = {
  streaming: 'hsl(210, 80%, 50%)',
  music: 'hsl(270, 65%, 55%)',
  games: 'hsl(0, 70%, 55%)',
  education: 'hsl(30, 85%, 55%)',
  health: 'hsl(140, 50%, 45%)',
  work: 'hsl(190, 60%, 45%)',
  financial: 'hsl(50, 90%, 50%)',
  shopping: 'hsl(330, 70%, 55%)',
  other: 'hsl(120, 12%, 65%)',
}

const getCategoryColor = (category?: string): string => {
  const key = category || 'other';
    if (key in categoryColorMap) {
        return categoryColorMap[key] ?? 'var(--olive-dark)';
  }
  return 'var(--olive-dark)';
}




const openAddModal = () => {
  editingSubscription.value = null
  showModal.value = true
}

const openEditModal = (subscription: Subscription) => {
  editingSubscription.value = subscription
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingSubscription.value = null
}

const handleSaveSubscription = async (subscription: Omit<Subscription, 'id' | 'userId'>) => {
  try {
    const uid = user.value?.uid
    if (!uid) {
      error.value = 'You must be logged in.'
      return
    }

    if (editingSubscription.value?.id) {
      await updateSubscription(editingSubscription.value.id, subscription)
    } else {
      await createSubscription({ ...subscription, userId: uid })
    }
    // Refetch all subscriptions to ensure UI is up-to-date
    await fetchSubscriptions(uid)
    closeModal()
  } catch (err) {
    console.error('Failed to save subscription:', err)
    error.value = 'Failed to save subscription.'
  }
}

const handleDeleteSubscription = async (id: string) => {
  try {
    const uid = user.value?.uid
    if (!uid) {
      error.value = 'You must be logged in.'
      return
    }
    await deleteSubscription(id)
    await fetchSubscriptions(uid) // Refetch
    closeModal()
  } catch (err) {
    console.error('Failed to delete subscription:', err)
    error.value = 'Failed to delete subscription.'
  }
}

// Fetch subscriptions when the component is mounted or the user changes
onMounted(() => {
  watch(user, (currentUser) => {
    if (currentUser?.uid) {
      fetchSubscriptions(currentUser.uid)
    } else {
      // Clear subscriptions if user logs out
      subscriptions.value = []
    }
  }, { immediate: true })
})
</script>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.25s ease, opacity 0.2s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-from .fixed.right-0,
.drawer-leave-to .fixed.right-0 {
  transform: translateX(100%);
}
</style>
<style scoped>
.menu-item {
  display: block;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease;
}
.menu-item:hover {
  background-color: var(--bg-paper-muted);
}
</style>