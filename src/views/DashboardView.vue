<template>
  <div class="min-h-screen p-6" style="background-color: var(--bg-page); color: var(--text-main);" :style="{ transition: 'transform 0.25s ease' }">
    <div v-if="pageLoading" class="loader-overlay">
      <div class="loader-inner">
        <div class="loader-chart">
          <RadialChart :subscriptions="sortedSubscriptions" />
        </div>
        <div class="loader-title">SubScribe</div>
      </div>
    </div>
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
        <p class="text-sm uppercase tracking-widest font-medium" style="color: var(--muted);">Monthly Total</p>
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
          <div v-if="loading" class="text-center" style="color: var(--muted);">Loading...</div>
          <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
          <div v-else-if="sortedSubscriptions.length === 0" class="text-center" style="color: var(--muted);">You don't have any subscriptions yet.</div>
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
        <aside class="fixed right-0 top-0 h-full w-64 drawer-panel" style="background-color: var(--bg-paper); border-color: var(--border);">
          <div class="menu-header">MENU</div>
          <nav class="menu-list">
            <router-link to="/settings" @click="toggleMenu" class="menu-item">
              <svg class="menu-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8m8.14 4a6.14 6.14 0 0 1-.08 1l2.11 1.65a.5.5 0 0 1 .11.66l-2 3.46a.5.5 0 0 1-.62.22l-2.49-1a7.12 7.12 0 0 1-1.73 1l-.38 2.65a.5.5 0 0 1-.5.42h-4a.5.5 0 0 1-.5-.42l-.38-2.65a7.12 7.12 0 0 1-1.73-1l-2.49 1a.5.5 0 0 1-.62-.22l-2-3.46a.5.5 0 0 1 .11-.66L3.94 13a6.14 6.14 0 0 1 0-2L1.83 9.35a.5.5 0 0 1-.11-.66l2-3.46a.5.5 0 0 1 .62-.22l2.49 1a7.12 7.12 0 0 1 1.73-1l.38-2.65a.5.5 0 0 1 .5-.42h4a.5.5 0 0 1 .5.42l.38 2.65a7.12 7.12 0 0 1 1.73 1l2.49-1a.5.5 0 0 1 .62.22l2 3.46a.5.5 0 0 1-.11.66Z"/></svg>
              <span>Settings</span>
            </router-link>
            <router-link to="/app-info" @click="toggleMenu" class="menu-item">
              <svg class="menu-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M11 17h2v-6h-2v6m1-12A10 10 0 1 0 22 15A10 10 0 0 0 12 5m0 14A8 8 0 1 1 20 11A8 8 0 0 1 12 19m0-8a1 1 0 1 0-1-1a1 1 0 0 0 1 1"/></svg>
              <span>App Info</span>
            </router-link>
            <button @click="toggleTheme" class="menu-item">
              <svg class="menu-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1m7 10a7 7 0 1 1-7-7a7 7 0 0 1 7 7m-7 9a1 1 0 0 1-1-1v-2a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1M3 13a1 1 0 0 1-1-1v0a1 1 0 1 1 2 0v0a1 1 0 0 1-1 1m18 0a1 1 0 0 1-1-1v0a1 1 0 1 1 2 0v0a1 1 0 0 1-1 1M5.64 6.05a1 1 0 0 1 1.41 0l1.41 1.41a1 1 0 1 1-1.41 1.41L5.64 7.46a1 1 0 0 1 0-1.41m11.3 11.3a1 1 0 0 1 1.41 0l1.41 1.41a1 1 0 0 1-1.41 1.41l-1.41-1.41a1 1 0 0 1 0-1.41"/></svg>
              <span>Dark Mode</span>
              <span class="menu-switch" :class="{ on: theme === 'dark' }"><i></i></span>
            </button>
          </nav>
          <div class="menu-sep"></div>
          <button @click="handleLogout" class="menu-item logout">
            <svg class="menu-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M14.08 15.59L16.67 13H7v-2h9.67l-2.59-2.59L15.5 7l5 5l-5 5l-1.42-1.41M3 19V5h8v2H5v10h6v2H3Z"/></svg>
            <span>Logout</span>
          </button>
        </aside>
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
const theme = ref<'light' | 'dark'>('light')
const pageLoading = ref(true)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const applyTheme = (t: 'light' | 'dark') => {
  document.documentElement.classList.toggle('theme-dark', t === 'dark')
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    const styles = getComputedStyle(document.documentElement)
    meta.setAttribute('content', styles.getPropertyValue('--bg-page').trim())
  }
}

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('theme', theme.value)
  applyTheme(theme.value)
}

const currentThemeLabel = computed(() => theme.value === 'dark' ? 'On' : 'Off')

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
  const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  theme.value = savedTheme
  applyTheme(savedTheme)
  watch(user, (currentUser) => {
    if (currentUser?.uid) {
      fetchSubscriptions(currentUser.uid)
    } else {
      // Clear subscriptions if user logs out
      subscriptions.value = []
    }
  }, { immediate: true })
  watch([loading, subscriptions], ([isLoading]) => {
    if (!isLoading) {
      setTimeout(() => { pageLoading.value = false }, 400)
    } else {
      pageLoading.value = true
    }
  }, { immediate: true })
})
</script>

<style scoped>
.loader-overlay { position: fixed; inset: 0; background: var(--bg-page); display: grid; place-items: center; z-index: 60; }
.loader-inner { display: grid; place-items: center; gap: 12px; }
.loader-chart { width: 220px; height: 220px; filter: drop-shadow(0 8px 28px rgba(46,58,44,0.18)); }
.loader-title { font-weight: 700; letter-spacing: 0.02em; color: var(--olive); }
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-panel { transition: transform 360ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 360ms ease, opacity 240ms ease; }
.drawer-enter-from .drawer-panel { transform: translateX(110%); opacity: 0.6; }
.drawer-enter-to .drawer-panel { transform: translateX(0); opacity: 1; }
.drawer-leave-from .drawer-panel { transform: translateX(0); opacity: 1; }
.drawer-leave-to .drawer-panel { transform: translateX(110%); opacity: 0.6; }
</style>
<style scoped>
.drawer-panel { border-left: 1px solid var(--border); border-top-left-radius: 16px; border-bottom-left-radius: 16px; box-shadow: -16px 0 40px rgba(46,58,44,0.15); padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.menu-header { font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--muted); }
.menu-list { display: flex; flex-direction: column; gap: 8px; margin-top: 6px; }
.menu-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; transition: background-color 0.2s ease, transform 0.2s ease; color: var(--text-main); }
.menu-item:hover { background-color: var(--bg-surface); transform: translateX(-2px); }
.menu-icon { width: 20px; height: 20px; color: var(--olive); }
.menu-switch { margin-left: auto; width: 38px; height: 22px; border-radius: 9999px; background: var(--border); position: relative; }
.menu-switch i { position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 9999px; background: white; transition: transform 200ms ease; }
.menu-switch.on i { transform: translateX(16px); }
.menu-sep { height: 1px; background: var(--border); margin: 8px 0; }
.logout { color: var(--accent); }
</style>