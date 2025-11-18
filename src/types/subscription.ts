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