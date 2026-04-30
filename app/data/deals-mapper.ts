/**
 * Maps the raw deals.json (ViaLuxury API export) into the SearchHotel/Deal/Hotel
 * type shapes used throughout the app.
 *
 * - Static build-time import of the 1MB JSON — fine for prototype.
 * - i18n strategy: NL=NL fallback (every string becomes {nl: str, en: str}).
 * - Missing fields (individual reviews, FAQ, nearby tips, room upgrades) come
 *   from shared-fixtures.ts.
 */
import dealsRaw from './deals.json'
import { CITY_COORDS, jitterCoordinates } from './city-coordinates'
import type { SearchHotel, SearchHotelDeal } from '~/types/searchHotel'
import type { Hotel, HotelImage, Facility, Review, ReviewSummary, NearbyTip, FaqItem } from '~/types/hotel'
import type { Deal, DealInclusion, RoomOption } from '~/types/deal'
import type { LocalizedString } from '~/i18n/types'
import {
  sharedReviews,
  sharedReviewSummary,
  sharedFaq,
  sharedNearbyTips,
  sharedHouseRules,
  sharedBaseRoom,
  sharedRoomUpgrades,
} from './shared-fixtures'
import { dutchCities } from './mock/dutch-cities'

// City → province lookup, lower-cased so we can match regardless of how the
// city was capitalised in deals.json. `dutchCities` covers the bulk of the
// list; the supplementary table below fills in the smaller hotel-only towns
// that appear in deals.json but not in the autosuggest set.
const EXTRA_CITY_PROVINCES: Record<string, string> = {
  'beetsterzwaag': 'Friesland',
  'burgh-haamstede': 'Zeeland',
  'delden': 'Overijssel',
  'eijsden': 'Limburg',
  'hilvarenbeek': 'Noord-Brabant',
  'hoofddorp': 'Noord-Holland',
  'hulshorst': 'Gelderland',
  'landgraaf': 'Limburg',
  'leersum': 'Utrecht',
  'nieuwkuijk': 'Noord-Brabant',
  'niftrik': 'Gelderland',
  'odoorn': 'Drenthe',
  'ommen': 'Overijssel',
  'raalte': 'Overijssel',
}
const cityToProvince = new Map<string, string>([
  ...dutchCities.map(c => [c.name.toLowerCase(), c.province] as [string, string]),
  ...Object.entries(EXTRA_CITY_PROVINCES),
])

// ===== Helpers =====

const loc = (str: string | null | undefined): LocalizedString => {
  const s = (str ?? '').trim()
  return { nl: s, en: s } as LocalizedString
}

const parseEuro = (s: string | null | undefined): number => {
  if (!s) return 0
  const m = s.match(/[\d.,]+/)
  if (!m) return 0
  // Handle "€1.299" (NL thousands sep) or "€229" or "€57,25"
  const cleaned = m[0].replace(/\./g, '').replace(',', '.')
  return Math.round(Number(cleaned) || 0)
}

const parsePct = (s: string | null | undefined): number => {
  if (!s) return 0
  return Math.abs(Number(String(s).replace(/[^\d-]/g, '')) || 0)
}

// Decode common HTML entities in description text
const decodeEntities = (str: string): string => {
  if (!str) return ''
  const map: Record<string, string> = {
    '&rsquo;': '’', '&lsquo;': '‘',
    '&rdquo;': '”', '&ldquo;': '“',
    '&ndash;': '–', '&mdash;': '—',
    '&hellip;': '…',
    '&amp;': '&', '&quot;': '"', '&apos;': "'",
    '&aacute;': 'á', '&eacute;': 'é', '&iacute;': 'í', '&oacute;': 'ó', '&uacute;': 'ú',
    '&Aacute;': 'Á', '&Eacute;': 'É',
    '&euml;': 'ë', '&iuml;': 'ï', '&ouml;': 'ö', '&uuml;': 'ü', '&auml;': 'ä',
    '&ccedil;': 'ç', '&egrave;': 'è', '&agrave;': 'à',
    '&ntilde;': 'ñ',
    '&nbsp;': ' ',
  }
  return str.replace(/&[a-zA-Z]+;|&#\d+;/g, (m) => map[m] ?? m)
}

// Deterministic-ish review-score fallback per hotelId so cards differ but stay stable
const fallbackReviewScore = (hotelId: number, raw: number | null): number => {
  if (raw !== null && raw !== undefined) {
    // Most data is on a 5-scale; convert to 10-scale if it looks like 0-5
    return raw <= 5.5 ? Math.round(raw * 20) / 10 : raw
  }
  // Stable pseudo-random in [8.0, 9.5]
  const seed = hotelId * 9301 + 49297
  const r = (seed % 233280) / 233280
  return Math.round((8.0 + r * 1.5) * 10) / 10
}

const fallbackReviewCount = (hotelId: number): number => {
  const seed = hotelId * 1103515245 + 12345
  return Math.abs(seed % 350) + 50  // 50–400
}

// ===== Raw types (loose, just what we need) =====

interface RawPackage {
  id: number
  permalink: string
  hotelId: number
  hotelName: string
  title: string
  cardTitle: string
  cardSubtitle: string
  location: string
  country: string
  address: { street: string; city: string }
  rating: number
  reviewScore: number | null
  numberOfNights: number
  price: { current: string; original: string; discount: string; priceCents: number; perNight: string }
  includeLabels?: { breakfast?: boolean; dinner?: boolean; wellness?: boolean; swimmingPool?: boolean }
  includes: string[]
  themes: string[]
  map: { lat: number; lng: number }
  imageUrls: string[]
  description: string
  highlights: { title: string; iconUrl: string }[]
  photos: { full: string; thumbnail: string }[]
  includesDetailed: { title: string; description: string; imageUrl: string }[]
  amenities: { label: string; iconUrl: string }[]
  externalUrl: string
}

const packages: RawPackage[] = (dealsRaw as { packages: RawPackage[] }).packages

// ===== cardSubtitle classifier =====
// Some packages ship a deal-style cardSubtitle ("3-Daags verblijf …") and
// others a generic hotel pitch ("Verblijf in een 4* kloosterhotel"). We need
// both: a per-deal subtitle (always with day count) and a per-hotel pitch
// (always without day count). Helpers below split the data accordingly.

const DAY_COUNT_RE = /(\d+)[\s-]?(daags?e?|nachten|nacht|nights?|days?)/i

function hasDayCount(s: string): boolean {
  return DAY_COUNT_RE.test(s || '')
}

/** Strip leading "Exclusieve deal:" + any "X-daags" / "X daagse" prefix
 *  so deal titles never lead with the day count. The night-count is
 *  surfaced separately in the UI (e.g. "Arrangement voor 2 nachten"). */
function stripDayCount(s: string): string {
  if (!s) return s
  let out = s.replace(/^exclusieve deal:\s*/i, '')
  out = out.replace(/^\d+[\s-]?daags?e?[:\s]*/i, '')
  out = out.replace(/^(\d+)[-\s](nachten?|days?|nights?)[:\s]*/i, '')
  out = out.trim()
  return out.charAt(0).toUpperCase() + out.slice(1)
}

function pickDealTitle(pkg: RawPackage): string {
  const sub = pkg.cardSubtitle || pkg.title || ''
  return stripDayCount(sub)
}

function pickHotelPitch(pkgs: RawPackage[]): string {
  if (pkgs.length === 1) return pkgs[0].cardSubtitle || pkgs[0].title || ''
  const generic = pkgs.find(p => !hasDayCount(p.cardSubtitle || ''))
  if (generic) return generic.cardSubtitle || ''
  // All deal-style → derive by stripping the day-count prefix from primary
  return stripDayCount(pkgs[0].cardSubtitle || pkgs[0].title || '')
}

// ===== Mappers =====

function toSearchHotelDeal(pkg: RawPackage): SearchHotelDeal {
  return {
    id: `pkg-${pkg.id}`,
    slug: pkg.permalink,
    nights: pkg.numberOfNights,
    title: loc(pickDealTitle(pkg)),
    basePrice: pkg.price.priceCents / 100,
    originalPrice: parseEuro(pkg.price.original),
    discountPercentage: parsePct(pkg.price.discount),
    highlights: (pkg.highlights || []).slice(0, 3).map((h) => loc(h.title)),
    inclusions: (pkg.includes || []).slice(0, 6).map(loc),
    heroImage: pkg.imageUrls?.[0] || pkg.photos?.[0]?.full || '',
    inclusionImage: pkg.includesDetailed?.[0]?.imageUrl || '',
    hasDinner: pkg.includeLabels?.dinner === true,
    themes: pkg.themes || [],
  }
}

function toFacilities(pkg: RawPackage): Facility[] {
  return (pkg.amenities || []).map((a) => ({
    icon: a.iconUrl,
    label: loc(a.label),
  }))
}

function toHotelImages(pkg: RawPackage): HotelImage[] {
  const photos = pkg.photos || []
  const heroFromImageUrls = (pkg.imageUrls && pkg.imageUrls[0]) || photos[0]?.full || ''
  const out: HotelImage[] = []
  if (heroFromImageUrls) {
    out.push({ id: 'img-hero', url: heroFromImageUrls, alt: loc(pkg.hotelName), position: 'hero' })
  }
  photos.forEach((p, i) => {
    out.push({ id: `img-${i}`, url: p.full, alt: loc(pkg.hotelName), position: 'gallery' })
  })
  return out
}

function toReviewSummary(hotelId: number, raw: number | null): ReviewSummary {
  const score = fallbackReviewScore(hotelId, raw)
  const total = fallbackReviewCount(hotelId)
  return {
    overallScore: score,
    totalReviews: total,
    categories: sharedReviewSummary.categories,
  }
}

function toIndividualReviews(): Review[] {
  return sharedReviews
}

function toNearbyTips(): NearbyTip[] {
  return sharedNearbyTips
}

function toFaq(): FaqItem[] {
  return sharedFaq
}

function toDealInclusions(pkg: RawPackage): DealInclusion[] {
  return (pkg.includesDetailed || []).map((inc, i) => ({
    id: `inc-${i}`,
    icon: '',
    title: loc(inc.title),
    description: loc(inc.description),
    image: inc.imageUrl,
    highlight: i === 0,
  }))
}

function toBaseRoom(pkg: RawPackage): RoomOption {
  // Use first photo of package as room image fallback
  const fallbackImage = pkg.photos?.[0]?.full || pkg.imageUrls?.[1] || pkg.imageUrls?.[0] || ''
  return {
    ...sharedBaseRoom,
    image: fallbackImage || sharedBaseRoom.image,
  }
}

function toDeal(pkg: RawPackage): Deal {
  return {
    id: `pkg-${pkg.id}`,
    hotelSlug: pkg.permalink,  // For lookup we use the package permalink
    nights: pkg.numberOfNights,
    title: loc(pickDealTitle(pkg)),
    subtitle: loc(pkg.title),
    inclusions: toDealInclusions(pkg),
    baseRoomType: toBaseRoom(pkg),
    roomUpgrades: sharedRoomUpgrades,
    basePrice: pkg.price.priceCents / 100,
    originalPrice: parseEuro(pkg.price.original),
    discountPercentage: parsePct(pkg.price.discount),
    pricePerPerson: Math.round(pkg.price.priceCents / 100 / 2),
  }
}

function toHotel(pkg: RawPackage): Hotel {
  return {
    id: `hotel-${pkg.hotelId}`,
    slug: pkg.permalink,
    name: pkg.hotelName,
    starRating: pkg.rating,
    location: {
      city: pkg.location || pkg.address?.city || '',
      region: pkg.country || '',
      country: pkg.country || '',
      coordinates: { lat: pkg.map?.lat ?? 52.0, lng: pkg.map?.lng ?? 5.0 },
      address: pkg.address?.street || '',
    },
    description: loc(decodeEntities(pkg.description || '')),
    pitch: loc(pkg.cardSubtitle || ''),
    houseRules: sharedHouseRules,
    images: toHotelImages(pkg),
    facilities: toFacilities(pkg),
    reviews: toReviewSummary(pkg.hotelId, pkg.reviewScore),
    individualReviews: toIndividualReviews(),
    nearbyTips: toNearbyTips(),
    faq: toFaq(),
    highlights: (pkg.highlights || []).map((h) => ({ icon: h.iconUrl, text: loc(h.title) })),
  }
}

// ===== Aggregation =====

const packagesByHotelId = new Map<number, RawPackage[]>()
for (const pkg of packages) {
  const arr = packagesByHotelId.get(pkg.hotelId) ?? []
  arr.push(pkg)
  packagesByHotelId.set(pkg.hotelId, arr)
}

// ===== Public exports =====

/** All hotels for the search page, one entry per hotelId, deals[] = packages */
export const mappedHotels: SearchHotel[] = []

/** Permalink (package permalink) → Deal for /deal/[slug] page */
export const mappedPackagesByPermalink: Record<string, Deal> = {}

/** Permalink (package permalink) → Hotel for /deal/[slug] page (looks up by package) */
export const mappedHotelsByPackagePermalink: Record<string, Hotel> = {}

/** Hotel permalink → Hotel for /hotel/[slug] page */
export const mappedHotelsByHotelPermalink: Record<string, Hotel> = {}

for (const [hotelId, pkgs] of packagesByHotelId.entries()) {
  // Pick first package as "primary" for hotel-level fields
  const primary = pkgs[0]

  const score = fallbackReviewScore(hotelId, primary.reviewScore)
  const reviewCount = fallbackReviewCount(hotelId)

  const cityName = primary.location || primary.address?.city || ''
  const baseCoords = CITY_COORDS[cityName]
  const coordinates = baseCoords
    ? jitterCoordinates(baseCoords, `hotel-${hotelId}`)
    : undefined

  // Hotel permalink (e.g. 'carlton-beach') — used by /hotel/<slug> lookup.
  // Falls back to the first package permalink if the JSON lacks a clean
  // hotelPermalink for this hotelId.
  const hotelPermalink =
    (dealsRaw as { hotels: Array<{ hotelId: number; hotelPermalink: string }> })
      .hotels.find(h => h.hotelId === hotelId)?.hotelPermalink || primary.permalink

  const province = cityToProvince.get(cityName.toLowerCase()) ?? ''
  const searchHotel: SearchHotel = {
    id: `hotel-${hotelId}`,
    slug: hotelPermalink,
    name: primary.hotelName,
    starRating: primary.rating,
    city: cityName,
    region: primary.country || '',
    province,
    heroImage: primary.imageUrls?.[0] || primary.photos?.[0]?.full || '',
    reviewScore: score,
    reviewCount,
    pitch: loc(pickHotelPitch(pkgs)),
    deals: pkgs.map(toSearchHotelDeal),
    coordinates,
  }
  mappedHotels.push(searchHotel)

  // Hotel record for hotel-page lookup (one per hotel)
  const hotelRec = toHotel(primary)
  hotelRec.slug = hotelPermalink
  hotelRec.pitch = loc(pickHotelPitch(pkgs))
  mappedHotelsByHotelPermalink[hotelRec.slug] = hotelRec

  // Per-package: deal + hotel pointer
  for (const pkg of pkgs) {
    mappedPackagesByPermalink[pkg.permalink] = toDeal(pkg)
    // Hotel for the deal-page is the same hotel record but with images sourced from the specific package
    mappedHotelsByPackagePermalink[pkg.permalink] = {
      ...hotelRec,
      images: toHotelImages(pkg),
      description: loc(decodeEntities(pkg.description || '')),
    }
  }
}

// ===== Special-deal labels =====
// Each label is applied to exactly 2 hotels. Where possible we score hotels
// against label-specific signals (amenities, discount %, star rating); pure
// flavour labels (last-minute, nieuw) are filled deterministically from the
// remaining pool so the choice stays stable across reloads.
;(() => {
  type ScoreFn = (hotel: SearchHotel, raw: RawPackage[]) => number
  const used = new Set<string>()

  const haystack = (h: SearchHotel, pkgs: RawPackage[]) =>
    [
      pkgs.flatMap(p => (p.amenities || []).map(a => a.label)).join(' '),
      pkgs.flatMap(p => p.includes || []).join(' '),
      pkgs.map(p => p.title || '').join(' '),
      pkgs.map(p => p.cardSubtitle || '').join(' '),
      h.name,
    ]
      .join(' ')
      .toLowerCase()

  const maxDiscount = (pkgs: RawPackage[]) =>
    Math.max(0, ...pkgs.map(p => parsePct(p.price.discount)))

  function strHash(s: string): number {
    let h = 0x811c9dc5
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i)
      h = Math.imul(h, 0x01000193)
    }
    return Math.abs(h | 0)
  }

  function assign(label: string, score: ScoreFn, count = 2) {
    const ranked = mappedHotels
      .filter(h => !used.has(h.id))
      .map(h => ({ h, s: score(h, packagesByHotelId.get(parseHotelIdFromSearchId(h.id)) || []) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, count)
    for (const { h } of ranked) {
      used.add(h.id)
      h.labels = [...(h.labels || []), label]
    }
  }

  // Score functions (higher = better fit for that label)
  const wellnessScore: ScoreFn = (_h, pkgs) => {
    const t = haystack(_h, pkgs)
    return (t.match(/wellness|sauna|massage|thermen/g) || []).length
  }
  const spaScore: ScoreFn = (_h, pkgs) => {
    const t = haystack(_h, pkgs)
    return (t.match(/spa\b|jacuzzi|whirlpool|hammam/g) || []).length
  }
  const superDealScore: ScoreFn = (_h, pkgs) => maxDiscount(pkgs)
  const exclusiefScore: ScoreFn = (_h) => _h.starRating
  const flavourScore = (seed: string): ScoreFn => (h) => strHash(h.id + seed)

  // Order matters: most signal-rich labels first to give them best picks.
  assign('wellness', wellnessScore)
  assign('spa-kamer', spaScore)
  assign('super-deal', superDealScore)
  assign('exclusief', exclusiefScore)
  assign('last-minute', flavourScore('last-minute'))
  assign('nieuw', flavourScore('nieuw'))
})()

function parseHotelIdFromSearchId(searchId: string): number {
  // SearchHotel.id is `hotel-<n>`
  return Number(searchId.replace(/^hotel-/, '')) || 0
}

/** Default first deal permalink (used for breadcrumb/home defaults) */
export const defaultDealPermalink: string = mappedHotels[0]?.deals[0]?.slug ?? ''

/**
 * Curated short-list highlights per package — sourced from `pkg.includes[]`
 * (the 4-6 item curated list in deals.json, between includeLabels and themes).
 * Used by the deal-page hero highlights row.
 */
export const curatedHighlightsByPermalink: Record<string, LocalizedString[]> = {}
for (const pkg of packages) {
  curatedHighlightsByPermalink[pkg.permalink] = (pkg.includes || []).map(loc)
}

// ===== Sibling-deal helpers (for deal-page swap UX) =====

import type { DealVariant } from '~/types/deal'

/** Permalink → DealVariant[] (sibling packages for the same hotel) */
export const dealVariantsByPermalink: Record<string, DealVariant[]> = {}

/** Permalink → dealsMap {dealId → Deal} (for switching deals via store.switchDeal) */
export const dealsMapByPermalink: Record<string, Record<string, Deal>> = {}

for (const [hotelId, pkgs] of packagesByHotelId.entries()) {
  const variants: DealVariant[] = pkgs.map(pkg => ({
    id: `pkg-${pkg.id}`,
    nights: pkg.numberOfNights,
    label: loc(`${pkg.numberOfNights} ${pkg.numberOfNights === 1 ? 'nacht' : 'nachten'}`),
    basePrice: pkg.price.priceCents / 100,
    originalPrice: parseEuro(pkg.price.original),
    available: true,
  }))
  const dealsMap: Record<string, Deal> = {}
  for (const pkg of pkgs) dealsMap[`pkg-${pkg.id}`] = mappedPackagesByPermalink[pkg.permalink]

  for (const pkg of pkgs) {
    dealVariantsByPermalink[pkg.permalink] = variants
    dealsMapByPermalink[pkg.permalink] = dealsMap
  }
}
