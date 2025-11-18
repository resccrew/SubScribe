import { ref, computed } from 'vue'
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  type User 
} from 'firebase/auth'
import { auth, googleProvider, appleProvider } from '@/config/firebase'

const user = ref<User | null>(null)
const loading = ref(true)

onAuthStateChanged(auth, (firebaseUser) => {
  user.value = firebaseUser
  loading.value = false
})

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value)
  
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      return result.user
    } catch (error) {
      console.error('Google sign-in error:', error)
      throw error
    }
  }
  
  const signInWithApple = async () => {
    try {
      const result = await signInWithPopup(auth, appleProvider)
      return result.user
    } catch (error) {
      console.error('Apple sign-in error:', error)
      throw error
    }
  }
  
  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }
  
  return {
    user: computed(() => user.value),
    loading: computed(() => loading.value),
    isAuthenticated,
    signInWithGoogle,
    signInWithApple,
    logout
  }
}