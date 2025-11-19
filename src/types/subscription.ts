export interface Category {
  id?: string;
  userId: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Subscription {
  id?: string
  userId: string
  name: string
  price: number
  currency: 'USD' | 'EUR' | 'RUB' | 'GBP' | 'JPY'
  cycle: 'monthly' | 'yearly'
  billingDate: Date
  reminderDays: 1 | 3 | 7
  category?: 'streaming' | 'work' | 'music' | 'games' | 'other' | 'financial' | 'shopping' | 'education' | 'health'
  createdAt?: Date
  updatedAt?: Date
}

export interface SubscriptionSummary {
  monthlyTotal: number
  yearlyTotal: number
  upcomingPayments: Array<{
    subscription: Subscription
    daysUntil: number
  }>
}

export const CATEGORY_COLOR_MAP: Record<NonNullable<Subscription['category']>, string> = {
  streaming: 'hsl(120, 12%, 30%)',
  music: 'hsl(120, 12%, 40%)',
  games: 'hsl(120, 12%, 50%)',
  education: 'hsl(120, 12%, 60%)',
  health: 'hsl(120, 12%, 70%)',
  work: 'hsl(120, 12%, 35%)',
  financial: 'hsl(120, 12%, 45%)',
  shopping: 'hsl(120, 12%, 55%)',
  other: 'hsl(120, 12%, 65%)',
}