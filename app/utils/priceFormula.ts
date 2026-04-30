/**
 * Price scaling formula based on number of persons.
 *   - 2 persons → base price
 *   - 1 person  → base − 50
 *   - 3 persons → 2·base − 50
 *   - 4 persons → 2·base
 *   - n persons (>4) → ceil(n/2) × base − (n is odd ? 50 : 0)
 *
 * The base price stored in deal data is for 2 persons.
 */
export function adjustPrice(basePrice: number, persons: number): number {
  if (persons <= 0) return basePrice
  if (persons % 2 === 0) return Math.round(basePrice * (persons / 2))
  return Math.round(basePrice * ((persons + 1) / 2) - 50)
}

/** Add a fixed surcharge (e.g. €79 for "premium" calendar days). The surcharge
 *  is applied on the 2-person base BEFORE scaling, so the per-person formula
 *  still produces clean values (the surcharge scales the same way). */
export function adjustPriceWithSurcharge(
  basePrice: number,
  persons: number,
  surcharge: number,
): number {
  return adjustPrice(basePrice + surcharge, persons)
}

/**
 * Deterministic 25%/75% split for calendar days. ~25% of available days show
 * the cheap "from" price (matches the price communicated in the search card),
 * the rest show base + €79.
 *
 * Uses an FNV-1a hash of `dealId|dayIso` so the same day for the same deal
 * always returns the same answer (no flicker, no SSR mismatch).
 */
export function isPremiumDay(dealId: string, dayIso: string): boolean {
  const key = `${dealId}|${dayIso}`
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  // 3 of 4 days are premium → 25% are at the "from" price.
  return ((h >>> 0) % 4) !== 0
}

export const CALENDAR_PREMIUM_SURCHARGE = 79

/**
 * Price for a specific arrival date — same number the calendar shows on that
 * day. Used by the search/map/hotel-page deal cards so the headline price
 * lines up with what the user sees if they then open the deal page.
 *
 * Pass `arrivalDate = null` to get the default "vanaf" price (no surcharge).
 *
 * Note: in the prototype we treat any flex window as exact (the user only
 * wants one number on the card, not a range), so this helper deliberately
 * ignores `selectedFlexibility`.
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
