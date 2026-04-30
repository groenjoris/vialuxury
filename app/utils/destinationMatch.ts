import type { SearchHotel } from '~/types/searchHotel'

export interface DestinationFilter {
  destinations: string[]   // province / region IDs (e.g. 'noord-holland')
  cities: { name: string; province: string }[]
  hotels: { name: string; slug: string }[]
}

export function hasActiveDestinationFilter(f: DestinationFilter): boolean {
  return f.destinations.length + f.cities.length + f.hotels.length > 0
}

export function hotelMatchesDestination(h: SearchHotel, f: DestinationFilter): boolean {
  if (!hasActiveDestinationFilter(f)) return true
  // Specific hotel pick — always matches.
  if (f.hotels.some(x => x.slug === h.slug)) return true
  // City match (case-insensitive on hotel.city).
  if (f.cities.some(c => c.name.toLowerCase() === h.city.toLowerCase())) return true
  // Province / region — substring match against region or city.
  if (f.destinations.some(d => {
    const needle = d.toLowerCase().replace(/-/g, ' ')
    return h.region.toLowerCase().includes(needle) || h.city.toLowerCase().includes(needle)
  })) return true
  return false
}
