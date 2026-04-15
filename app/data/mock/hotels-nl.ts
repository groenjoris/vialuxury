import type { MapHotel, MapHotelPackage } from '~/types/mapHotel'
import type { LocalizedString } from '~/i18n/types'

/**
 * Generated demo dataset for the /kaart browse-map page.
 *
 * ~50 fake hotels distributed over the Netherlands. Output is fully
 * deterministic (seeded PRNG) so reloads don't shuffle pin positions and
 * Figma comparisons stay stable.
 */

// Mulberry32: tiny deterministic PRNG.
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20260411)
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]!
const between = (min: number, max: number) => min + rand() * (max - min)
const intBetween = (min: number, max: number) =>
  Math.floor(between(min, max + 1))

// Real Dutch cities clustered to feel realistic — pin density mimics the
// Figma frame which has obvious clusters around Amsterdam / Randstad.
const CITIES: { name: string; lat: number; lng: number; weight: number }[] = [
  { name: 'Amsterdam', lat: 52.3676, lng: 4.9041, weight: 8 },
  { name: 'Haarlem', lat: 52.3874, lng: 4.6462, weight: 2 },
  { name: 'Zaandam', lat: 52.4389, lng: 4.8295, weight: 1 },
  { name: 'Alkmaar', lat: 52.6324, lng: 4.7534, weight: 2 },
  { name: 'Den Haag', lat: 52.0705, lng: 4.3007, weight: 4 },
  { name: 'Rotterdam', lat: 51.9244, lng: 4.4777, weight: 4 },
  { name: 'Delft', lat: 52.0116, lng: 4.3571, weight: 1 },
  { name: 'Utrecht', lat: 52.0907, lng: 5.1214, weight: 4 },
  { name: 'Amersfoort', lat: 52.1561, lng: 5.3878, weight: 2 },
  { name: 'Hilversum', lat: 52.2292, lng: 5.1669, weight: 1 },
  { name: 'Nijmegen', lat: 51.8126, lng: 5.8372, weight: 2 },
  { name: 'Arnhem', lat: 51.9851, lng: 5.8987, weight: 2 },
  { name: 'Apeldoorn', lat: 52.2112, lng: 5.9699, weight: 2 },
  { name: 'Zwolle', lat: 52.5168, lng: 6.0830, weight: 2 },
  { name: 'Deventer', lat: 52.2660, lng: 6.1552, weight: 1 },
  { name: 'Enschede', lat: 52.2215, lng: 6.8937, weight: 1 },
  { name: 'Groningen', lat: 53.2194, lng: 6.5665, weight: 2 },
  { name: 'Leeuwarden', lat: 53.2012, lng: 5.7999, weight: 1 },
  { name: 'Assen', lat: 52.9967, lng: 6.5625, weight: 1 },
  { name: 'Maastricht', lat: 50.8514, lng: 5.6910, weight: 2 },
  { name: 'Eindhoven', lat: 51.4416, lng: 5.4697, weight: 2 },
  { name: "'s-Hertogenbosch", lat: 51.6978, lng: 5.3037, weight: 1 },
  { name: 'Tilburg', lat: 51.5555, lng: 5.0913, weight: 1 },
  { name: 'Breda', lat: 51.5719, lng: 4.7683, weight: 1 },
  { name: 'Middelburg', lat: 51.4988, lng: 3.6109, weight: 1 },
  { name: 'Burgh-Haamstede', lat: 51.6975, lng: 3.6953, weight: 1 },
]

const HOTEL_PREFIXES = [
  'Grand Hotel',
  'Hotel',
  'Boutique Hotel',
  'Hotel & Spa',
  'Hotel Maritiem',
  'Royal',
  'Hotel De',
  'Landgoed',
  'Bilderberg',
]
const HOTEL_NAMES = [
  'Wellness',
  'Bosrijk',
  'Aurora',
  'Lumière',
  'Belvedère',
  'Duinzicht',
  'De Witte Raaf',
  'Het Zandkasteel',
  'Vondel',
  'Astoria',
  'De Stadsherberg',
  'Park',
  'Florence',
  'Chanson',
  'Plesman',
  'Het Klooster',
  'De Heeren',
  'Saint-Charles',
  'Maritime',
  'Het Wapen',
  'Hortus',
  'Esplanade',
]
const HERO_IMAGES = [
  '/images/hotel-ter-zand-hero.jpg',
  '/images/hotel-ter-zand-room.jpg',
  '/images/hotel-ter-zand-tower.jpg',
  '/images/hotel-ter-zand-pool.jpg',
]
const ALL_INCLUSIONS: LocalizedString[] = [
  { nl: 'Koninklijk ontbijt inbegrepen', en: 'Royal breakfast included' },
  { nl: '6-gangen Michelin diner bij Sense', en: '6 course Michelin diner at Sense' },
  { nl: 'Welkomstdrankje bij aankomst', en: 'Welcome drink on arrival' },
  { nl: 'Late check-out tot 14:00', en: 'Late check-out until 14:00' },
  { nl: 'Spa & wellness toegang', en: 'Spa & wellness access' },
  { nl: 'Gratis parkeren', en: 'Free parking' },
  { nl: 'Fietsverhuur voor 1 dag', en: 'Bike rental for 1 day' },
  { nl: 'Fles champagne', en: 'Bottle of champagne' },
  { nl: 'Hammam behandeling', en: 'Hammam treatment' },
  { nl: 'Dagelijkse schoonmaak', en: 'Daily housekeeping' },
]

function randomName(seedIdx: number): string {
  const prefix = HOTEL_PREFIXES[seedIdx % HOTEL_PREFIXES.length]!
  const name = HOTEL_NAMES[(seedIdx * 3 + 1) % HOTEL_NAMES.length]!
  return `${prefix} ${name}`
}

function randomPackage(idx: number, allSoldOut: boolean): MapHotelPackage {
  const nights = pick([1, 2, 3, 3, 4])
  const people = pick([2, 2, 2, 4])
  const basePerNight = intBetween(85, 240)
  const groupBase = basePerNight * nights * (people / 2)
  const discountPct = intBetween(20, 65)
  const originalPrice = Math.round(groupBase * 1.4)
  const priceFrom = Math.round(originalPrice * (1 - discountPct / 100))
  // Pick 3 visible inclusions plus a hidden tail count.
  const visible = [...ALL_INCLUSIONS]
    .sort(() => rand() - 0.5)
    .slice(0, 3)
  const totalInclusions = intBetween(6, 9)
  return {
    id: `pkg-${idx}`,
    nights,
    people,
    priceFrom,
    originalPrice,
    discountPct,
    inclusions: visible,
    totalInclusions,
    soldOut: allSoldOut,
  }
}

function buildHotels(): MapHotel[] {
  // Expand cities into a weighted draw bag.
  const bag: typeof CITIES = []
  for (const c of CITIES) for (let i = 0; i < c.weight; i++) bag.push(c)

  const hotels: MapHotel[] = []
  for (let i = 0; i < 52; i++) {
    const city = bag[Math.floor(rand() * bag.length)]!
    // Jitter ±0.05° (~5km) so multiple hotels in one city don't overlap.
    const lat = city.lat + between(-0.05, 0.05)
    const lng = city.lng + between(-0.05, 0.05)
    const soldOut = rand() < 0.1 // ~10% sold out
    const hasLowAvailability = !soldOut && rand() < 0.2 // ~20% persuasive
    const packageCount = soldOut ? intBetween(1, 3) : intBetween(1, 4)
    const packages: MapHotelPackage[] = []
    for (let p = 0; p < packageCount; p++) {
      packages.push(randomPackage(i * 10 + p, soldOut))
    }
    hotels.push({
      id: `mock-hotel-${i + 1}`,
      slug: `mock-hotel-${i + 1}`,
      name: randomName(i),
      starRating: pick([3, 4, 4, 4, 5]),
      city: city.name,
      country: 'Nederland',
      coordinates: { lat, lng },
      heroImage: HERO_IMAGES[i % HERO_IMAGES.length]!,
      packages,
      soldOut,
      ...(hasLowAvailability
        ? { lowAvailabilityCount: intBetween(1, 5) }
        : {}),
    })
  }
  return hotels
}

export const mockMapHotels: MapHotel[] = buildHotels()
