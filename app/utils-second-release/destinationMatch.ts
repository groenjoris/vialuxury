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

/**
 * Province-level adjacency map. Used by the no-results state on
 * /search to suggest "Deze deals zijn dichtbij <Locatie>" when
 * the selected destination has zero matching hotels.
 *
 * Values are destination IDs (same keys as NL_PROVINCE_BY_ID).
 * BE destinations fall back to a "rest of BE" neighbour set via
 * `neighboursOf()` below.
 */
export const NL_NEIGHBOURS: Record<string, string[]> = {
  'noord-holland': ['zuid-holland', 'utrecht', 'flevoland', 'friesland'],
  'zuid-holland': ['noord-holland', 'utrecht', 'gelderland', 'brabant', 'zeeland'],
  'zeeland':      ['zuid-holland', 'brabant'],
  'brabant':      ['zuid-holland', 'zeeland', 'gelderland', 'limburg'],
  'limburg':      ['brabant', 'gelderland'],
  'gelderland':   ['utrecht', 'flevoland', 'overijssel', 'brabant', 'limburg'],
  'utrecht':      ['noord-holland', 'zuid-holland', 'gelderland', 'flevoland'],
  'flevoland':    ['noord-holland', 'friesland', 'overijssel', 'gelderland', 'utrecht'],
  'overijssel':   ['gelderland', 'drenthe', 'flevoland'],
  'drenthe':      ['friesland', 'groningen', 'overijssel'],
  'friesland':    ['groningen', 'drenthe', 'flevoland', 'noord-holland'],
  'groningen':    ['friesland', 'drenthe'],
}

export function neighboursOf(id: string): string[] {
  if (NL_NEIGHBOURS[id]) return NL_NEIGHBOURS[id]
  if (BE_DESTINATION_IDS.has(id)) {
    return [...BE_DESTINATION_IDS].filter(x => x !== id)
  }
  return []
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
