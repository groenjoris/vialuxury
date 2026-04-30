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

import { adjustPrice as adjustPriceForPersons } from '~/utils/priceFormula'
import { isPremiumDay, CALENDAR_PREMIUM_SURCHARGE } from '~/utils/priceFormula'
import { isDealAvailable } from '~/utils/availability'

/** Roughly 75% of dates get room upgrades available. */
function hasUpgrades(dateStr: string): boolean {
  return dateHash(dateStr, 1) < 75
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

    // Not available in the past
    if (date.isBefore(today, 'day')) {
      availability.push({
        date: dateStr,
        available: false,
        totalPrice: 0,
      })
      continue
    }

    // Sold-out comes from the shared availability.json so the calendar
    // matches the search-card / map availability one-to-one.
    const soldOut = !isDealAvailable(deal.id || '', dateStr)

    if (soldOut) {
      availability.push({
        date: dateStr,
        available: false,
        soldOut: true,
        totalPrice: 0,
      })
      continue
    }

    // 25% of available days show the base "from" price (matches the search
    // card "vanaf" amount). The remaining 75% add a +€79 surcharge.
    // Apply the per-person formula to whichever base we end up with.
    const surcharge = isPremiumDay(deal.id || '', dateStr) ? CALENDAR_PREMIUM_SURCHARGE : 0
    const totalPrice = adjustPriceForPersons(deal.basePrice + surcharge, persons)

    const originalMultiplier = 1 / (1 - deal.discountPercentage / 100)
    const totalBeforeDiscount = Math.round(totalPrice * originalMultiplier)

    availability.push({
      date: dateStr,
      available: true,
      soldOut: false,
      totalPrice,
      originalPrice: totalBeforeDiscount,
      discountPercentage: deal.discountPercentage,
      ...(includeUpgradeAvailability ? { hasRoomUpgrades: hasUpgrades(dateStr) } : {}),
    })
  }

  return availability
}
