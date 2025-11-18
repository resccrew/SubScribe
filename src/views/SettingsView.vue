<template>
  <div class="min-h-screen p-6" style="background-color: var(--bg-page); color: var(--text-main); font-family: 'Space Grotesk', monospace;">
    <header class="flex items-center mb-10">
      <router-link to="/dashboard" class="p-2 rounded-full transition-colors hover:bg-[var(--bg-surface)]">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </router-link>
      <div class="flex-grow mr-8">
        <h1 class="text-3xl font-bold text-center">Settings</h1>
        <p class="text-center text-sm mt-1" style="color: var(--muted);">Manage your account and preferences</p>
      </div>
    </header>

    <transition name="fade-slide">
      <main v-if="pageReady" class="max-w-2xl mx-auto space-y-8">
      <div class="rounded-xl p-8" style="background-color: var(--bg-paper);">
        <h2 class="text-4xl font-bold leading-tight">
          Your<br />
          account
        </h2>
      </div>

      <div class="rounded-xl p-8 flex flex-col items-center justify-center space-y-6" style="background-color: var(--olive-dark); color: var(--bg-base);">
        <div class="w-full">
          <p class="text-xs uppercase tracking-widest" style="color: var(--muted);">Account</p>
        </div>
        <div class="w-28 h-28 rounded-full border overflow-hidden flex items-center justify-center" style="border-color: var(--bg-base);">
          <img v-if="user?.photoURL" :src="user.photoURL" alt="User Avatar" class="w-full h-full object-cover">
          <div v-else class="w-full h-full flex items-center justify-center" style="background-color: var(--olive); color: white;">
            <span v-if="user?.email" class="font-medium text-4xl">{{ user.email.charAt(0).toUpperCase() }}</span>
          </div>
        </div>
        <div class="text-center">
          <p class="font-medium text-lg" style="color: var(--bg-base);">{{ user?.email }}</p>
          <p class="text-sm opacity-80">Your current account</p>
        </div>
      </div>

      <div class="rounded-xl p-6" style="background-color: var(--bg-paper);">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium">Email reminders</h3>
            <p class="text-sm" style="color: var(--muted);">Receive reminders about upcoming payments</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="emailNotifications" type="checkbox" class="sr-only peer" @change="handleNotificationChange">
            <div class="w-11 h-6 bg-[var(--border)] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
          </label>
        </div>
      </div>

      <div class="rounded-xl p-6" style="background-color: var(--bg-paper);">
        <h2 class="text-xl font-semibold mb-4">About</h2>
        <div class="space-y-2 text-sm" style="color: var(--muted);">
          <p><strong class="font-medium" style="color: var(--text-main);">Version:</strong> BETA</p>
          <p><strong class="font-medium" style="color: var(--text-main);">Developer:</strong> SubScribe Team</p>
        </div>
      </div>

      <div class="rounded-xl p-8" style="background-color: var(--olive-dark);">
        <button @click="handleLogout" class="w-full font-medium py-3 px-4 rounded-lg transition-colors duration-200" style="background-color: transparent; color: var(--accent);">Log out</button>
      </div>
      </main>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { user, logout } = useAuth()

const emailNotifications = ref(true)
const pageReady = ref(false)

const handleLogout = async () => {
  try {
    await logout()
    router.push('/')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const handleNotificationChange = () => {
  localStorage.setItem('emailNotifications', emailNotifications.value.toString())
}

onMounted(() => {
  const saved = localStorage.getItem('emailNotifications')
  if (saved !== null) {
    emailNotifications.value = saved === 'true'
  }
  pageReady.value = true
})
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>