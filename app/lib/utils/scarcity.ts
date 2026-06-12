/**
 * Compute a stable numeric hash from a string using a simple
 * multiplicative hash (factor 31). The same input always produces
 * the same non-negative integer.
 *
 * @param id - The input string to hash.
 * @returns A non-negative 32-bit integer.
 */
export function dealHash(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return Math.abs(h)
}

/**
 * Deterministic "rooms left" count for a deal (range 2-9).
 * The same deal ID always returns the same value.
 *
 * @param id - The deal identifier.
 * @returns A number between 2 and 9 inclusive.
 */
export function roomsLeftForDeal(id: string): number {
  return 2 + (dealHash(id) % 8)
}

/**
 * Check whether a deal counts as scarce (fewer than 4 rooms left).
 *
 * @param id - The deal identifier.
 * @returns `true` if the deal has fewer than 4 rooms remaining.
 */
export function dealHasScarcity(id: string): boolean {
  return roomsLeftForDeal(id) < 4
}
