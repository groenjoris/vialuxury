import { dealHash } from './scarcity'

/**
 * Pricing formula (second release):
 *   - base price = arrangement for 2 persons in 1 room
 *   - +€50 per extra person (arrangement cost, independent of rooms)
 *   - +€150 per extra room
 *   - (+€50 per 3-person room used — see `cheapestConfigSurcharge`)
 */
export function adjustPrice(basePrice: number, persons: number, rooms: number = 1): number {
  if (persons <= 0) return basePrice
  const extraPersons = Math.max(0, persons - 2) * 50
  const extraRooms = Math.max(0, rooms - 1) * 150
  return Math.round(basePrice + extraPersons + extraRooms)
}

/** Add a fixed surcharge (e.g. €79 for "premium" calendar days) on top of
 *  the 2-person base before the persons/rooms extras are applied. */
export function adjustPriceWithSurcharge(
  basePrice: number,
  persons: number,
  surcharge: number,
  rooms: number = 1,
): number {
  return adjustPrice(basePrice + surcharge, persons, rooms)
}

/** Surcharge for a 3-person room (duplicated 2-person room + 3 single
 *  beds). */
export const TRIPLE_ROOM_EXTRA = 50

/** ~25% of the hotels (deterministic hash on the hotel/package slug) carry
 *  a 3-person room in inventory. */
export function hotelHasTripleRoom(hotelKey: string): boolean {
  return dealHash(`${hotelKey}|triple`) % 4 === 0
}

/** 1 or 2 triple rooms in stock, deterministic per hotel; 0 when the
 *  hotel has none. */
export function tripleRoomsAvailable(hotelKey: string): number {
  return hotelHasTripleRoom(hotelKey) ? 1 + (dealHash(`${hotelKey}|triple-avail`) % 2) : 0
}

/** Extra cost of the cheapest room configuration for this party: number
 *  of 3-person rooms needed (max(0, P − 2R), capped by stock) × €50. */
export function cheapestConfigSurcharge(hotelKey: string, persons: number, rooms: number): number {
  const need = Math.max(0, persons - 2 * rooms)
  const t = Math.min(need, rooms, tripleRoomsAvailable(hotelKey))
  return t * TRIPLE_ROOM_EXTRA
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
 * Party size the prototype prices + displays everywhere (sidebar, calendar,
 * cards, side-panels). The "Wie gaat er mee?" picker doesn't affect prices
 * yet — that linkage happens in the not-yet-built checkout — so every shown
 * price, and the "X personen" label next to it, use this single value. Change
 * it here when the real per-person pricing/occupancy goes live.
 */
export const PRICED_PERSONS = 2

/**
 * Default occupancy of a hotel room — a room sleeps 1, 2 or 3 people.
 */
export const DEFAULT_ROOM_CAPACITY = 3

/**
 * Minimum rooms for a given party size given the per-room capacity.
 *   1-3 people   → 1 room
 *   4-6 people   → 2 rooms
 *   7-9 people   → 3 rooms
 *   10-12 people → 4 rooms
 *   …
 */
export function minRoomsFor(persons: number, capacity: number = DEFAULT_ROOM_CAPACITY): number {
  if (persons <= 0) return 1
  if (capacity <= 0) capacity = DEFAULT_ROOM_CAPACITY
  return Math.max(1, Math.ceil(persons / capacity))
}

/** Upper bound: rooms can never exceed the number of guests (no empty rooms). */
export function maxRoomsFor(persons: number): number {
  return Math.max(1, persons)
}

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
  rooms: number = 1,
): number {
  const surcharge =
    arrivalDate && dealId && isPremiumDay(dealId, arrivalDate)
      ? CALENDAR_PREMIUM_SURCHARGE
      : 0
  return adjustPrice(basePrice + surcharge, persons, rooms)
}
