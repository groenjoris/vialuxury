/**
 * Adjust a base price (for 2 persons) to a given party size.
 *
 * Scaling rules:
 * - 2 persons: base price
 * - 1 person: base - 50
 * - 3 persons: 2 * base - 50
 * - 4 persons: 2 * base
 * - n persons (>4): ceil(n/2) * base - (n is odd ? 50 : 0)
 *
 * @param basePrice - The base price for 2 persons.
 * @param persons - The number of persons.
 * @returns The adjusted price, rounded to the nearest integer.
 */
export function adjustPrice(basePrice: number, persons: number): number {
  if (persons <= 0) return basePrice
  if (persons % 2 === 0) return Math.round(basePrice * (persons / 2))
  return Math.round(basePrice * ((persons + 1) / 2) - 50)
}

/**
 * Adjust a base price with an added surcharge before scaling.
 *
 * The surcharge is applied to the 2-person base before person scaling,
 * so per-person arithmetic stays clean.
 *
 * @param basePrice - The base price for 2 persons.
 * @param persons - The number of persons.
 * @param surcharge - A fixed surcharge added before scaling.
 * @returns The adjusted price including the surcharge.
 */
export function adjustPriceWithSurcharge(
  basePrice: number,
  persons: number,
  surcharge: number,
): number {
  return adjustPrice(basePrice + surcharge, persons)
}

/**
 * Determine whether a given day is a "premium" calendar day using a
 * deterministic FNV-1a hash of `dealId|dayIso`. Roughly 75% of days
 * are premium; the remaining 25% show the base "from" price.
 *
 * @param dealId - The unique deal identifier.
 * @param dayIso - The ISO date string (e.g. "2026-03-15").
 * @returns `true` if the day is premium (carries a surcharge).
 */
export function isPremiumDay(dealId: string, dayIso: string): boolean {
  const key = `${dealId}|${dayIso}`
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 4) !== 0
}

/** Fixed surcharge for premium calendar days (in euros). */
export const CALENDAR_PREMIUM_SURCHARGE = 79

/** Default party size used for displayed prices. */
export const PRICED_PERSONS = 2

/** Default occupancy per hotel room. */
export const DEFAULT_ROOM_CAPACITY = 2

/**
 * Calculate the minimum number of rooms needed for a party size.
 *
 * @param persons - The number of guests.
 * @param capacity - Guests per room (defaults to {@link DEFAULT_ROOM_CAPACITY}).
 * @returns The minimum number of rooms (at least 1).
 */
export function minRoomsFor(persons: number, capacity: number = DEFAULT_ROOM_CAPACITY): number {
  if (persons <= 0) return 1
  if (capacity <= 0) capacity = DEFAULT_ROOM_CAPACITY
  return Math.max(1, Math.ceil(persons / capacity))
}

/**
 * Calculate the maximum number of rooms for a party size (no empty rooms).
 *
 * @param persons - The number of guests.
 * @returns The maximum number of rooms (at least 1).
 */
export function maxRoomsFor(persons: number): number {
  return Math.max(1, persons)
}

/**
 * Calculate the price for a specific arrival date, matching what the
 * calendar shows for that day.
 *
 * @param basePrice - The base price for 2 persons.
 * @param dealId - The deal identifier (used for premium-day hashing).
 * @param arrivalDate - An ISO date string, or `null` for the default "from" price.
 * @param persons - The number of persons.
 * @returns The total price for the given arrival date and party size.
 */
export function priceForArrival(
  basePrice: number,
  dealId: string | undefined | null,
  arrivalDate: string | null,
  persons: number,
): number {
  const surcharge =
    arrivalDate && dealId && isPremiumDay(dealId, arrivalDate)
      ? CALENDAR_PREMIUM_SURCHARGE
      : 0
  return adjustPrice(basePrice + surcharge, persons)
}
