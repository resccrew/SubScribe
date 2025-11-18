import { ref, computed } from 'vue'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from './useAuth'
import type { Subscription, SubscriptionSummary } from '@/types/subscription'

const subscriptions = ref<Subscription[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export function useSubscriptions() {
  const { user } = useAuth()
  
  const fetchSubscriptions = async () => {
    if (!user.value) return
    
    loading.value = true
    error.value = null
    
    try {
      const q = query(
        collection(db, 'subscriptions'),
        where('userId', '==', user.value.uid),
        orderBy('billingDate', 'asc')
      )
      
      const querySnapshot = await getDocs(q)
      subscriptions.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        billingDate: doc.data().billingDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Subscription[]
    } catch (err) {
      error.value = 'Failed to fetch subscriptions'
      console.error('Error fetching subscriptions:', err)
    } finally {
      loading.value = false
    }
  }
  
  const addSubscription = async (subscription: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user.value) throw new Error('User not authenticated')
    
    try {
      const docRef = await addDoc(collection(db, 'subscriptions'), {
        ...subscription,
        userId: user.value.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      await fetchSubscriptions()
      return docRef.id
    } catch (err) {
      error.value = 'Failed to add subscription'
      console.error('Error adding subscription:', err)
      throw err
    }
  }
  
  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    try {
      await updateDoc(doc(db, 'subscriptions', id), {
        ...updates,
        updatedAt: serverTimestamp()
      })
      
      await fetchSubscriptions()
    } catch (err) {
      error.value = 'Failed to update subscription'
      console.error('Error updating subscription:', err)
      throw err
    }
  }
  
  const deleteSubscription = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'subscriptions', id))
      await fetchSubscriptions()
    } catch (err) {
      error.value = 'Failed to delete subscription'
      console.error('Error deleting subscription:', err)
      throw err
    }
  }
  
  const summary = computed<SubscriptionSummary>(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    let monthlyTotal = 0
    let yearlyTotal = 0
    
    const upcomingPayments: Array<{
      subscription: Subscription
      daysUntil: number
    }> = []
    
    subscriptions.value.forEach(sub => {
      const billingDate = new Date(sub.billingDate)
      
      if (sub.cycle === 'monthly') {
        monthlyTotal += sub.price
        yearlyTotal += sub.price * 12
      } else {
        yearlyTotal += sub.price
      }
      
      const daysUntil = Math.ceil((billingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntil <= 7 && daysUntil >= 0) {
        upcomingPayments.push({ subscription: sub, daysUntil })
      }
    })
    
    upcomingPayments.sort((a, b) => a.daysUntil - b.daysUntil)
    
    return {
      monthlyTotal: Number(monthlyTotal.toFixed(2)),
      yearlyTotal: Number(yearlyTotal.toFixed(2)),
      upcomingPayments
    }
  })
  
  return {
    subscriptions: computed(() => subscriptions.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    summary,
    fetchSubscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription
  }
}