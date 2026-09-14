/**
 * ViaLuxury score — bespoke replacement for the generic 9.0 review score.
 *
 * Returns a stable, deterministic 7.0–10.0 score per hotel, a label band
 * (Comfy / Luxe / Super Luxe / Ultiem verwend), and four 0–10 subscores
 * (Omgeving / Kamer / Hotel / Value for Money) suitable for a small bar
 * chart. The numbers are NOT real review data — they're seeded from the
 * hotel's id + price + star rating so every render produces the same
 * values.
 */

import type { SearchHotel } from '~/types/searchHotel'

export type ViaLuxuryBand = 'Comfy' | 'Luxe' | 'Super Luxe' | 'Ultiem verwend'

export interface ViaLuxurySubscores {
  omgeving: number
  kamer: number
  hotel: number
  valueForMoney: number
}

export interface ViaLuxuryScore {
  score: number
  band: ViaLuxuryBand
  subscores: ViaLuxurySubscores
}

/** Stable 32-bit hash of a string — used as the per-hotel seed. */
function hash32(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function pseudoRand(seed: number): number {
  // xorshift32, returns [0, 1).
  let x = seed || 1
  x ^= x << 13
  x ^= x >>> 17
  x ^= x << 5
  return ((x >>> 0) % 1_000_000) / 1_000_000
}

function avgBasePrice(hotel: SearchHotel): number {
  if (!hotel.deals.length) return 0
  let sum = 0
  for (const d of hotel.deals) sum += d.basePrice
  return sum / hotel.deals.length
}

function bandFor(star: number): ViaLuxuryBand {
  if (star >= 5) return 'Super Luxe'
  if (star >= 4) return 'Luxe'
  return 'Comfy'
}

function bandRange(band: ViaLuxuryBand): [number, number] {
  switch (band) {
    case 'Comfy':            return [7.0, 7.9]
    case 'Luxe':             return [8.0, 8.9]
    case 'Super Luxe':       return [9.0, 9.9]
    case 'Ultiem verwend':   return [10.0, 10.0]
  }
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

/**
 * Compute the ViaLuxury score for a hotel.
 *
 * - `band` is set by `hotel.starRating` (5★ = Super Luxe, 4★ = Luxe,
 *   3★ or less = Comfy). The top 10 % most-expensive 5★ hotels are
 *   promoted to "Ultiem verwend" with a flat 10.0.
 * - The within-band score is set by where the hotel's avg basePrice
 *   sits relative to others in the same band, plus a tiny ±0.1 hash
 *   nudge so evenly-priced hotels don't all share the same score.
 * - The four subscores are seeded per-hotel so they're stable and feel
 *   plausible but don't have to add up to the headline score.
 */
export function viaLuxuryScore(
  hotel: SearchHotel,
  allHotels?: readonly SearchHotel[],
): ViaLuxuryScore {
  const star = hotel.starRating || 3
  let band = bandFor(star)
  const seed = hash32(hotel.id || hotel.slug || hotel.name)

  // --- price percentile within the band ---
  const myAvg = avgBasePrice(hotel)
  let percentile = 0.5
  if (allHotels && allHotels.length) {
    const sameBand = allHotels
      .filter(h => bandFor(h.starRating || 3) === band)
      .map(h => avgBasePrice(h))
      .sort((a, b) => a - b)
    if (sameBand.length > 1) {
      const idx = sameBand.findIndex(p => p >= myAvg)
      percentile = idx === -1 ? 1 : idx / (sameBand.length - 1)
    }
    // Promote the top-10 % priced 5★ hotels to Ultiem verwend.
    if (band === 'Super Luxe' && percentile >= 0.9) {
      band = 'Ultiem verwend'
    }
  }

  let score: number
  if (band === 'Ultiem verwend') {
    score = 10.0
  } else {
    const [lo, hi] = bandRange(band)
    const nudge = (pseudoRand(seed) - 0.5) * 0.2  // ±0.1
    score = round1(lo + (hi - lo) * percentile + nudge)
    if (score < lo) score = lo
    if (score > hi) score = hi
  }

  // --- subscores: each axis seeded with its own offset ---
  const sub = (axis: string, baseline: number) => {
    const r = pseudoRand(seed ^ hash32(axis))
    // Spread around the baseline with ±0.8.
    return round1(Math.max(5, Math.min(10, baseline + (r - 0.5) * 1.6)))
  }
  // Three quality axes loosely track the headline score.
  const omgeving = sub('omgeving', score)
  const kamer = sub('kamer', score)
  const hotelAxis = sub('hotel', score)
  // Value for Money: inverse-correlated with price percentile, so a
  // cheaper hotel within its band scores higher on VfM.
  const vfmBase = 7.5 + (1 - percentile) * 2.5
  const valueForMoney = sub('vfm', vfmBase)

  return {
    score,
    band,
    subscores: { omgeving, kamer, hotel: hotelAxis, valueForMoney },
  }
}
