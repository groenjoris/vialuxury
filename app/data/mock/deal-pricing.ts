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

/** String → 32-bit int seed (so each deal has its own price calendar). */
function strSeed(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return Math.abs(h | 0)
}

/**
 * Match the search-results card price formula so calendar's cheapest price
 * equals what we advertise on the search page.
 */
function adjustPriceForPersons(basePrice: number, persons: number): number {
  if (persons % 2 === 0) return Math.round(basePrice * (persons / 2))
  return Math.round(basePrice * ((persons + 1) / 2) - 50)
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

  // Deal-specific seed → each deal gets its own random price calendar.
  const seed = strSeed(deal.id || '')
  const cheapestForDeal = adjustPriceForPersons(deal.basePrice, persons)

  for (let day = 1; day <= daysInMonth; day++) {
    const date = startOfMonth.date(day)
    const dateStr = date.format('YYYY-MM-DD')

    // Not available in the past
    if (date.isBefore(today, 'day')) {
      availability.push({
        date: dateStr,
        available: false,
        totalPrice: 0,
      })
      continue
    }

    // 20% of dates show the cheapest price (= search-result price).
    // The remaining 80% add either +25 or +75 (50/50 split).
    const cheapBucket = dateHash(dateStr, 3 + seed) // mix in deal seed
    const isCheapDate = cheapBucket < 20
    let totalPrice = cheapestForDeal
    if (!isCheapDate) {
      const upBucket = dateHash(dateStr, 4 + seed)
      totalPrice += upBucket < 50 ? 25 : 75
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
