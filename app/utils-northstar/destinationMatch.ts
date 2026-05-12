import type { SearchHotel } from '~/types/searchHotel'

export interface DestinationFilter {
  destinations: string[]   // province / region IDs (e.g. 'noord-holland', 'vlaanderen')
  cities: { name: string; province: string }[]
  hotels: { name: string; slug: string }[]
}

/**
 * Map destination popup IDs → exact province name as it appears on
 * `searchHotel.province` (derived from `dutchCities` in `deals-mapper.ts`).
 */
export const NL_PROVINCE_BY_ID: Record<string, string> = {
  'noord-holland': 'Noord-Holland',
  'zuid-holland': 'Zuid-Holland',
  'zeeland': 'Zeeland',
  'brabant': 'Noord-Brabant',
  'limburg': 'Limburg',
  'gelderland': 'Gelderland',
  'drenthe': 'Drenthe',
  'friesland': 'Friesland',
  'overijssel': 'Overijssel',
  'flevoland': 'Flevoland',
  'utrecht': 'Utrecht',
  'groningen': 'Groningen',
}

/** BE "destinations" we don't have a province field for — fall back to a
 *  country-level test against `region`. Good enough for the prototype. */
export const BE_DESTINATION_IDS = new Set(['ardennen', 'vlaanderen', 'belgische-kust', 'wallonie'])

/** Human-readable label per destination ID — used by the filter pills. */
export const DESTINATION_LABEL_BY_ID: Record<string, string> = {
  ...NL_PROVINCE_BY_ID,
  'ardennen': 'Ardennen',
  'vlaanderen': 'Vlaanderen',
  'belgische-kust': 'Belgische Kust',
  'wallonie': 'Wallonië',
}

export function hasActiveDestinationFilter(f: DestinationFilter): boolean {
  return f.destinations.length + f.cities.length + f.hotels.length > 0
}

export function hotelMatchesDestination(h: SearchHotel, f: DestinationFilter): boolean {
  if (!hasActiveDestinationFilter(f)) return true
  // Specific hotel pin always matches.
  if (f.hotels.some(x => x.slug === h.slug)) return true
  // Specific city match (case-insensitive on hotel.city).
  if (f.cities.some(c => c.name.toLowerCase() === h.city.toLowerCase())) return true
  // Province / region.
  if (f.destinations.some(id => {
    const province = NL_PROVINCE_BY_ID[id]
    if (province) return h.province === province
    if (BE_DESTINATION_IDS.has(id)) return /belg/i.test(h.region)
    return false
  })) return true
  return false
}
