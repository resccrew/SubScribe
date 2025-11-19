import { ref, computed } from 'vue'
import type { Subscription, Category } from '@/types/subscription'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  typeof window !== 'undefined' && window.location.hostname === 'resccrew.github.io'
    ? 'https://strict-bellanca-subscribe-b294309e.koyeb.app'
    : 'http://localhost:8000'
)

export function useSubscriptions() {
  const subscriptions = ref<Subscription[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const categories = ref<Category[]>([])

  const normalizeCategory = (cat: any): Subscription['category'] => {
    if (!cat) return undefined
    const s = String(cat).trim().toLowerCase().replace(/\s+/g, '')
    const map: Record<string, Subscription['category']> = {
      streaming: 'streaming',
      video: 'streaming',
      netflix: 'streaming',
      hbo: 'streaming',
      twitch: 'streaming',
      youtube: 'streaming',
      primevideo: 'streaming',
      disneyplus: 'streaming',
      music: 'music',
      spotify: 'music',
      applemusic: 'music',
      games: 'games',
      game: 'games',
      gaming: 'games',
      steam: 'games',
      education: 'education',
      study: 'education',
      course: 'education',
      health: 'health',
      fitness: 'health',
      sport: 'health',
      work: 'work',
      productivity: 'work',
      tools: 'work',
      finance: 'financial',
      financial: 'financial',
      bank: 'financial',
      shopping: 'shopping',
      shop: 'shopping',
      store: 'shopping',
      other: 'other',
      misc: 'other',
      miscellaneous: 'other',
    }
    if (map[s]) return map[s]
    const allowed = new Set<Subscription['category']>(['streaming','music','games','education','health','work','financial','shopping','other'])
    return allowed.has(s as any) ? (s as Subscription['category']) : undefined
  }

  const toSubscription = (doc: any): Subscription => {
    const bd = doc.billingDate ?? doc.billing_date
    const bdDate = bd ? new Date(bd) : undefined
    const safeBd = bdDate && !isNaN(bdDate.getTime()) ? bdDate : undefined
    return {
      id: doc.id ?? (doc._id ? String(doc._id) : undefined),
      userId: String(doc.userId ?? doc.user_id ?? ''),
      name: String(doc.name ?? ''),
      price: Number(doc.price ?? 0),
      currency: doc.currency ?? 'USD',
      cycle: (doc.cycle as 'monthly' | 'yearly') ?? 'monthly',
      billingDate: safeBd as any,
      reminderDays: doc.reminderDays ?? 3,
      category: normalizeCategory(doc.category ?? doc.name),
      createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined
    }
  }

  const monthlyTotal = computed(() => 
    subscriptions.value
      .filter(sub => sub.cycle === 'monthly')
      .reduce((sum, sub) => sum + sub.price, 0)
  )

  const yearlyTotal = computed(() => 
    subscriptions.value
      .filter(sub => sub.cycle === 'yearly')
      .reduce((sum, sub) => sum + sub.price, 0)
  )

  const upcomingPayments = computed(() => {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return subscriptions.value.filter(sub => {
      if (!sub.billingDate) return false
      const billingDate = new Date(sub.billingDate)
      return billingDate >= today && billingDate <= nextWeek
    }).sort((a, b) => {
      if (!a.billingDate || !b.billingDate) return 0
      return new Date(a.billingDate).getTime() - new Date(b.billingDate).getTime()
    })
  })

  const fetchSubscriptions = async (userId: string) => {
    if (!userId) return
    loading.value = true
    error.value = null

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 7000)

    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${userId}` , { signal: controller.signal })
      if (!response.ok) throw new Error('Failed to fetch subscriptions')

      const data = await response.json()
      subscriptions.value = Array.isArray(data) ? data.map(toSubscription) : []
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch subscriptions'
      error.value = message.includes('AbortError') ? 'Request timed out while loading' : message
      console.error('Error fetching subscriptions:', err)
    } finally {
      clearTimeout(timeout)
      loading.value = false
    }
  }

  const createSubscription = async (subscription: Omit<Subscription, 'id'>) => {
    loading.value = true
    error.value = null
    
    try {
      const payload: any = {
        userId: subscription.userId,
        name: subscription.name,
        price: subscription.price,
        billingDate: subscription.billingDate instanceof Date ? subscription.billingDate.toISOString() : subscription.billingDate,
        serviceLogo: undefined,
      }
      const response = await fetch(`${API_BASE_URL}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) throw new Error('Failed to create subscription')
      
      const newSubscription = toSubscription(await response.json())
      subscriptions.value.push(newSubscription)
      return newSubscription
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create subscription'
      console.error('Error creating subscription:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSubscription = async (id: string, updates: Omit<Partial<Subscription>, 'userId'>) => {
    loading.value = true
    error.value = null
    
    try {
      const payload: any = {
        name: updates.name,
        price: updates.price,
        billingDate: updates.billingDate instanceof Date ? updates.billingDate.toISOString() : updates.billingDate,
        serviceLogo: undefined,
      }
      const response = await fetch(`${API_BASE_URL}/subscriptions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) throw new Error('Failed to update subscription')
      
      const index = subscriptions.value.findIndex(sub => sub.id === id)
      if (index !== -1) {
        const { userId, ...rest } = updates as any
        const normalized = toSubscription({ ...subscriptions.value[index], ...rest })
        subscriptions.value[index] = normalized
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update subscription'
      console.error('Error updating subscription:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteSubscription = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete subscription')
      
      subscriptions.value = subscriptions.value.filter(sub => sub.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete subscription'
      console.error('Error deleting subscription:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getStats = async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${userId}/stats`)
      if (!response.ok) throw new Error('Failed to fetch stats')
      
      return await response.json()
    } catch (err) {
      console.error('Error fetching stats:', err)
      return { totalMonthly: 0, totalYearly: 0, count: 0 }
    }
  }

  const fetchCategories = async (userId: string) => {
    if (!userId) return
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/categories/${userId}`)
      if (!response.ok) throw new Error('Failed to fetch categories')

      const data = await response.json()
      categories.value = Array.isArray(data) ? data : []
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch categories'
      error.value = message
      console.error('Error fetching categories:', err)
    } finally {
      loading.value = false
    }
  }

  const createCategory = async (category: Omit<Category, 'id'>) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      })
      
      if (!response.ok) throw new Error('Failed to create category')
      
      const newCategory = await response.json()
      categories.value.push(newCategory)
      return newCategory
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create category'
      console.error('Error creating category:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteCategory = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete category')
      
      categories.value = categories.value.filter((cat: Category) => cat.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete category'
      console.error('Error deleting category:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    subscriptions,
    loading,
    error,
    monthlyTotal,
    yearlyTotal,
    upcomingPayments,
    fetchSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    getStats,
    categories,
    fetchCategories,
    createCategory,
    deleteCategory
  }
}