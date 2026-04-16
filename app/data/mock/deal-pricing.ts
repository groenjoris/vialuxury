import type { DateAvailability } from '~/types/calendar'
import type { Deal } from '~/types/deal'
import dayjs from 'dayjs'

/** Deterministic hash with good distribution for sequential date strings. */
function dateHash(dateStr: string, seed = 0): number {
  let h = seed ^ 0x811c9dc5
  for (let i = 0; i < dateStr.length; i++) {
    h ^= dateStr.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  h ^= h >>> 16
  return Math.abs(h) % 100
}

/** Roughly 75% of dates get room upgrades available. */
function hasUpgrades(dateStr: string): boolean {
  return dateHash(dateStr, 1) < 75
}

/** Roughly 10% of future dates are sold out. */
function isSoldOut(dateStr: string): boolean {
  return dateHash(dateStr, 2) < 10
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
    // deal.basePrice is already the discounted price (for 2 persons).
    // Scale proportionally for persons and weekend premium to avoid rounding drift.
    let totalPrice = Math.round(deal.basePrice * (persons / 2) * rateMultiplier)

    // 20% of dates show the cheapest price, 80% add €100
    const isCheapDate = dateHash(dateStr, 3) < 20
    if (!isCheapDate) {
      totalPrice += 100
    }

    const originalMultiplier = 1 / (1 - deal.discountPercentage / 100)
    const totalBeforeDiscount = Math.round(totalPrice * originalMultiplier)

    // ~10% of dates are sold out
    const soldOut = isSoldOut(dateStr)

    availability.push({
      date: dateStr,
      available: !soldOut,
      soldOut,
      totalPrice,
      originalPrice: totalBeforeDiscount,
      discountPercentage: deal.discountPercentage,
      ...(includeUpgradeAvailability && !soldOut
        ? { hasRoomUpgrades: hasUpgrades(dateStr) }
        : {}),
    })
  }

  return availability
}
