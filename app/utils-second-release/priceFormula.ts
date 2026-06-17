import { dealHash } from './scarcity'

/**
 * Pricing scheme (second release). All of this is baked into the PACKAGE
 * price (shown in the calendar); only room-TYPE upgrades are itemised in the
 * sidebar.
 *
 *   - `basePrice` = the Release-1 arrangement price for 2 persons / 1 room.
 *   - Per-person: each pair of guests costs one `basePrice`; a lone extra
 *     guest costs `basePrice − 50`.
 *       1p → base − 50 · 2p → base · 3p (= 2p + 1p) → 2·base − 50 …
 *   - Extra rooms: each room BEYOND the standard 2-per-room packing
 *     (ceil(persons/2)) costs +€150.
 *       4p/2k → standard · 4p/3k → +€150 · 4p/4k → +€300
 *   - 3-person room: replacing two 2-person rooms with one 3-person room
 *     SAVES €75 — so subtract €75 per 3-person room used.
 */
export function adjustPrice(
  basePrice: number,
  persons: number,
  rooms?: number,
  tripleRooms: number = 0,
): number {
  if (persons <= 0) return Math.round(basePrice)
  const standardRooms = Math.ceil(persons / 2)
  const r = rooms ?? standardRooms
  const personCost = basePrice * standardRooms - (persons % 2 === 1 ? 50 : 0)
  const extraRoomCost = Math.max(0, r - standardRooms) * 150
  const tripleSaving = Math.max(0, tripleRooms) * 75
  return Math.round(personCost + extraRoomCost - tripleSaving)
}

/** ~25% of the hotels (deterministic hash on the hotel/package slug) carry
 *  a 3-person room in inventory. */
export function hotelHasTripleRoom(hotelKey: string): boolean {
  return dealHash(`${hotelKey}|triple`) % 4 === 0
}

/** Number of 3-person rooms in the cheapest fitting config for this party
 *  (the auto-assignment: max(0, P − 2R), capped by room count + stock).
 *  Pass it to `adjustPrice`/`priceForArrival` as `tripleRooms` to get the
 *  cheapest headline price. */
export function cheapestTripleCount(hotelKey: string, persons: number, rooms: number): number {
  const need = Math.max(0, persons - 2 * rooms)
  return Math.min(need, rooms, tripleRoomsAvailable(hotelKey))
}

/** 1 or 2 triple rooms in stock, deterministic per hotel; 0 when the
 *  hotel has none. */
export function tripleRoomsAvailable(hotelKey: string): number {
  return hotelHasTripleRoom(hotelKey) ? 1 + (dealHash(`${hotelKey}|triple-avail`) % 2) : 0
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
  rooms?: number,
  tripleRooms: number = 0,
): number {
  const surcharge =
    arrivalDate && dealId && isPremiumDay(dealId, arrivalDate)
      ? CALENDAR_PREMIUM_SURCHARGE
      : 0
  return adjustPrice(basePrice + surcharge, persons, rooms, tripleRooms)
}
