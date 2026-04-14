export interface DateAvailability {
  date: string
  available: boolean
  totalPrice: number
  originalPrice?: number
  discountPercentage?: number
  hasRoomUpgrades?: boolean
}

export interface CalendarMonth {
  year: number
  month: number
  days: CalendarDay[]
}

export interface CalendarDay {
  date: string
  dayOfMonth: number
  isCurrentMonth: boolean
  availability: DateAvailability | null
}
