/**
 * Deterministic scarcity helpers for First Release deal cards + map.
 *
 * There is no real inventory data, so we derive a stable small "rooms
 * left" count (2–9) per deal from its id. The same deal therefore always
 * shows the same count across reloads, pages, and the map hover card.
 * The deal card sticker and the map hover scarcity bar must agree, so
 * both read from here.
 */

/** Stable per-id hash (also used for the deterministic image pick). */
export function dealHash(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** Rooms left for a deal — deterministic 2–9. */
export function roomsLeftForDeal(id: string): number {
  return 2 + (dealHash(id) % 8)
}

/** Whether a deal counts as scarce (fewer than 4 left). */
export function dealHasScarcity(id: string): boolean {
  return roomsLeftForDeal(id) < 4
}
