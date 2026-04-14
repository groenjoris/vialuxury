import type { DateAvailability } from '~/types/calendar'
import type { Deal } from '~/types/deal'
import dayjs from 'dayjs'

/** Deterministic hash-based flag: roughly 75% of dates get room upgrades available. */
function hasUpgrades(dateStr: string): boolean {
  let h = 0
  for (let i = 0; i < dateStr.length; i++) h = (h * 31 + dateStr.charCodeAt(i)) | 0
  return Math.abs(h) % 100 < 75
}

/**
 * Generate mock date availability for a deal variant.
 * Prices shown are the total deal price starting from that check-in date.
 */
export function generateDealAvailability(
  year: number,
  month: number,
  deal: Deal,
  persons: number,
  includeUpgradeAvailability = false,
): DateAvailability[] {
  const availability: DateAvailability[] = []
  const startOfMonth = dayjs(`${year}-${String(month).padStart(2, '0')}-01`)
  const daysInMonth = startOfMonth.daysInMonth()
  const today = dayjs()

  // Base rate per person per night (derived from deal)
  const baseRatePerPersonPerNight = Math.round(deal.basePrice / (deal.nights * 2))

  for (let day = 1; day <= daysInMonth; day++) {
    const date = startOfMonth.date(day)
    const dateStr = date.format('YYYY-MM-DD')
    const dayOfWeek = date.day()

    // Not available in the past
    if (date.isBefore(today, 'day')) {
      availability.push({
        date: dateStr,
        available: false,
        totalPrice: 0,
      })
      continue
    }

    // Weekend premium: Friday & Saturday check-ins
    let rateMultiplier = 1
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      rateMultiplier = 1.15
    }

    // Calculate total for this check-in date
    const nightlyRate = Math.round(baseRatePerPersonPerNight * rateMultiplier)
    const totalBeforeDiscount = nightlyRate * deal.nights * persons
    const discount = Math.round(totalBeforeDiscount * (deal.discountPercentage / 100))
    const totalPrice = totalBeforeDiscount - discount

    // Some dates unavailable (simulate bookings)
    const isAvailable = !(day % 7 === 0 && dayOfWeek === 3)

    availability.push({
      date: dateStr,
      available: isAvailable,
      totalPrice,
      originalPrice: totalBeforeDiscount,
      discountPercentage: deal.discountPercentage,
      ...(includeUpgradeAvailability && isAvailable
        ? { hasRoomUpgrades: hasUpgrades(dateStr) }
        : {}),
    })
  }

  return availability
}
