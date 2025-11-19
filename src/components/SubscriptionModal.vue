<template>
  <transition name="slide-up">
    <div v-if="props.show" class="fixed inset-0 bg-base z-50 flex flex-col" style="background-color: var(--bg-base);">
      
      <!-- Header -->
      <header class="flex justify-between items-center p-4">
        <button @click="handleBack" class="p-2 rounded-full transition-colors hover:bg-black/5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h2 class="font-medium text-lg capitalize">{{ currentStep === 1 ? 'Add Subscription' : getCategoryTitle(form.category) }}</h2>
        <button @click="handleClose" class="p-2 rounded-full transition-colors hover:bg-black/5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </header>

      <main class="flex-grow overflow-y-auto px-6 pb-24">
        <!-- Step 1: Category Selection -->
        <div v-if="currentStep === 1">
          <h1 class="text-4xl font-bold mb-8">Choose your<br>category</h1>
          <div class="space-y-2">
            <button 
              v-for="category in categories" 
              :key="category.id" 
              @click="selectCategory(category.id)"
              class="w-full text-left p-4 rounded-xl transition-colors flex items-center"
              :style="{ backgroundColor: category.color, color: 'var(--text-main)' }"
            >
              <span class="font-medium">{{ category.name }}</span>
            </button>
            
          </div>
        </div>

        <!-- Step 2: Details Input -->
        <div v-if="currentStep === 2" class="flex flex-col h-full">
          <div class="text-center pt-8 pb-12 flex-shrink-0">
            <p class="text-sm uppercase tracking-widest" style="color: var(--muted);">{{ getCategoryTitle(form.category) }}</p>
            <div class="flex items-center justify-center text-6xl font-light" style="font-family: 'Space Grotesk', monospace;">
              <span class="font-sans text-4xl align-middle mr-1">$</span>
              <input 
                type="number" 
                v-model.number="form.price"
                step="0.01"
                min="0"
                required
                class="bg-transparent outline-none w-48 text-center"
                placeholder="0.0"
              />
            </div>
            <div 
              class="h-4 mt-4 cursor-ew-resize overflow-hidden"
              @mousedown.prevent="startDrag"
              @touchstart.prevent="startDrag"
            >
              <div 
                class="flex justify-center items-center h-full space-x-1"
                :class="{ 'snap-back': !isDragging }"
                :style="{ transform: `translateX(${sliderOffset}px)` }"
              >
                <div v-for="i in 51" :key="i" class="w-px h-full flex-shrink-0" :class="i === 26 ? 'h-4' : 'h-2'" style="background-color: var(--muted);"></div>
              </div>
            </div>
          </div>
          
          <div class="space-y-4 flex-shrink-0">
            <div>
              <label class="block text-sm font-medium text-[var(--muted)] mb-1">Subscription Name</label>
              <input v-model="form.name" type="text" required class="form-input" placeholder="e.g., Netflix"/>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-[var(--muted)] mb-1">Billing Cycle</label>
                <select v-model="form.cycle" required class="form-input">
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--muted)] mb-1">Next Bill</label>
                <input v-model="form.billingDate" type="date" required class="form-input"/>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer v-if="currentStep === 2" class="absolute bottom-0 left-0 right-0 p-4 bg-opacity-80 backdrop-blur-sm" style="background-color: var(--bg-base);">
        <div class="flex gap-3">
          <button v-if="subscription" @click="handleDelete" class="flex-1 btn-secondary" style="color: var(--accent);">Delete</button>
          <button @click="handleSubmit" class="flex-1 btn-primary">Save Subscription</button>
        </div>
      </footer>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Subscription } from '@/types/subscription'
import { CATEGORY_COLOR_MAP } from '@/types/subscription'

interface Props {
  show: boolean
  subscription?: Subscription | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  save: [subscription: Omit<Subscription, 'id' | 'userId'>]
  delete: [id: string]
}>()

const currentStep = ref(1)

interface FormData {
  name: string
  price: number
  currency: Subscription['currency']
  cycle: Subscription['cycle']
  billingDate: string
  reminderDays: Subscription['reminderDays']
  category: Subscription['category']
}

const initialFormState: FormData = {
  name: '',
  price: 0,
  currency: 'USD',
  cycle: 'monthly',
  billingDate: formatDateForInput(new Date()),
  reminderDays: 3,
  category: 'other',
}

const form = ref<FormData>({ ...initialFormState })

const isDragging = ref(false)
const startX = ref(0)
const sliderOffset = ref(0)

const isTouchEvent = (e: MouseEvent | TouchEvent): e is TouchEvent => 'touches' in e

const startDrag = (event: MouseEvent | TouchEvent) => {
  isDragging.value = true
  if (isTouchEvent(event)) {
    startX.value = event.touches[0]?.clientX ?? 0
  } else {
    startX.value = event.clientX
  }
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('touchmove', onDrag)
  window.addEventListener('mouseup', endDrag)
  window.addEventListener('touchend', endDrag)
}

const onDrag = (event: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return
  const currentX = isTouchEvent(event) ? (event.touches[0]?.clientX ?? 0) : event.clientX
  const deltaX = currentX - startX.value
  
  // Adjust the sensitivity factor as needed
  const sensitivity = 0.25;
  const priceChange = deltaX * sensitivity;

  const nextPrice = Number(form.value.price) + Number(priceChange)
  form.value.price = Math.max(0, Number(nextPrice.toFixed(2)))
  sliderOffset.value += deltaX
  
  startX.value = currentX
}

const endDrag = () => {
  isDragging.value = false
  sliderOffset.value = 0 // Animate back to center
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('touchmove', onDrag)
  window.removeEventListener('mouseup', endDrag)
  window.removeEventListener('touchend', endDrag)
}

const categories = ref<{id: Subscription['category'], name: string, budget: number, color: string}[]>([
  { id: 'streaming', name: 'Streaming', budget: 0.0, color: CATEGORY_COLOR_MAP.streaming },
  { id: 'music', name: 'Music', budget: 0.0, color: CATEGORY_COLOR_MAP.music },
  { id: 'games', name: 'Games', budget: 0.0, color: CATEGORY_COLOR_MAP.games },
  { id: 'education', name: 'Education', budget: 0.0, color: CATEGORY_COLOR_MAP.education },
  { id: 'health', name: 'Health', budget: 0.0, color: CATEGORY_COLOR_MAP.health },
  { id: 'work', name: 'Productivity', budget: 0.0, color: CATEGORY_COLOR_MAP.work },
  { id: 'financial', name: 'Finance', budget: 0.0, color: CATEGORY_COLOR_MAP.financial },
  { id: 'shopping', name: 'Shopping', budget: 0.0, color: CATEGORY_COLOR_MAP.shopping },
  { id: 'other', name: 'Other', budget: 0.0, color: CATEGORY_COLOR_MAP.other },
])

const getCategoryTitle = (category?: Subscription['category']): string => {
  const map: Record<string, string> = {
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
  return category ? (map[category] ?? 'Other') : 'Other'
}

function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

watch(() => props.show, (newShow) => {
  if (newShow) {
    if (props.subscription) {
      const bdRaw: any = (props.subscription as any).billingDate ?? (props.subscription as any).billing_date
      const bd = bdRaw ? new Date(bdRaw) : undefined
      const bdValid = bd && !isNaN(bd.getTime()) ? bd : new Date()
      form.value = {
        name: props.subscription.name,
        price: props.subscription.price,
        currency: props.subscription.currency,
        cycle: props.subscription.cycle,
        billingDate: formatDateForInput(bdValid),
        reminderDays: props.subscription.reminderDays,
        category: props.subscription.category || 'other'
      }
      currentStep.value = 2; // Skip to details when editing
    } else {
      form.value = { ...initialFormState, billingDate: formatDateForInput(new Date()) };
      currentStep.value = 1; // Start from category selection for new
    }
  }
})

const selectCategory = (categoryId: Subscription['category']) => {
  if (categoryId) {
    form.value.category = categoryId
    currentStep.value = 2
  }
}

const handleBack = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  } else {
    emit('close')
  }
}

const handleClose = () => {
  emit('close')
}

const handleSubmit = () => {
  if (!form.value.name.trim()) {
    alert('Please enter a subscription name.')
    return
  }
  if (form.value.price <= 0) {
    alert('Price must be greater than 0.')
    return
  }
  const formData = {
    ...form.value,
    billingDate: new Date(form.value.billingDate)
  }
  emit('save', formData)
  handleClose()
}

const handleDelete = () => {
  if (props.subscription?.id && confirm('Are you sure you want to delete this subscription?')) {
    emit('delete', props.subscription.id)
    handleClose()
  }
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

.snap-back {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>