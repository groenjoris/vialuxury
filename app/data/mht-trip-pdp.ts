/**
 * Multi Hotel Trip — bouwt voor een vakantie-slug de `Deal` + `Hotel`
 * die de dealpagina (/multi-hotel-trip/deal/[slug]) verwacht, zodat de
 * bestaande pagina (zijbalk, kalender, prijs, reviews, FAQ …) ongewijzigd
 * blijft werken en alleen de vakantie-specifieke blokken afwijken.
 *
 * - Hotelnaam wordt "3 fantastische hotels"; sterren alleen wanneer alle
 *   hotels hetzelfde aantal hebben (anders 0 → geen sterren).
 * - Gallery: één foto per hotel in reisvolgorde (eerste = hero); hotels
 *   uit de dataset leveren extra foto's tot vijf beelden. `stickers`
 *   koppelt elke foto-id aan de hotelnaam voor de sticker op de foto.
 */
import type { Deal } from '~/types/deal'
import type { Hotel, HotelImage, Facility } from '~/types/hotel'
import type { LocalizedString } from '~/i18n/types'
import { tripDetailBySlug, type MultiHotelTripDetail, type MultiHotelTripDetailStop } from './mht-trips'
import { TRIP_ITINERARIES, type TripItinerarySpec } from './mht-trip-itineraries'
import { facilityIcon } from '~/utils-multi-hotel-trip/facilityIcon'
import { mappedHotelsByHotelPermalink } from './deals-mapper'
import {
  sharedBaseRoom,
  sharedHouseRules,
  sharedReviews,
  sharedReviewSummary,
  sharedNearbyTips,
  sharedFaq,
} from './shared-fixtures'

export interface MultiHotelTripPdp {
  trip: MultiHotelTripDetail
  deal: Deal
  hotel: Hotel
  /** Foto-id → hotelnaam (sticker op de foto in de gallery-pop-up). */
  stickers: Record<string, string>
  /** Redactionele inhoud (beschrijving, highlights, hotelinfo, dagprogramma). */
  content: TripItinerarySpec | null
  /** Dagprogramma, nog niet vertaald: de pagina zet dit om in tekst. */
  days: TripRawDay[]
}

/* ── Dagprogramma ─────────────────────────────────────────────────────── */
export type TripRawBlockKind = 'checkin' | 'checkout' | 'activity' | 'dinner' | 'homeward'
export interface TripRawBlock {
  kind: TripRawBlockKind
  /** Hotel waar het blok over gaat (inchecken/uitchecken/diner/terugreis). */
  stopIndex?: number
  /** Redactionele kop/tekst/foto (activiteit, onderweg, terugreis). */
  title?: LocalizedString
  text?: LocalizedString
  image?: string
  /** Dinerblok: "3-gangendiner" / "4-gangendiner" / "verrassingsdiner". */
  dinnerLabel?: LocalizedString
}
export interface TripRawDay {
  day: number
  /** Hotel van vannacht (null op de laatste dag). */
  stopIndex: number | null
  /** Op een uitcheckdag: het hotel dat je verlaat. */
  fromStopIndex?: number
  blocks: TripRawBlock[]
}

/** Dinerinclusie van een hotel: label en of het elke avond is. */
function dinnerOf(stop: MultiHotelTripDetailStop): { label: LocalizedString; daily: boolean } | null {
  const inc = stop.includes.find(i => /diner|dinner|menu/i.test(i.nl))
  if (!inc) return null
  const nl = inc.nl
  const gangen = nl.match(/(\d)-gangen/i)
  const label: LocalizedString = gangen
    ? { nl: `${gangen[1]}-gangendiner`, en: `${gangen[1]}-course dinner` }
    : /verrassing/i.test(nl)
      ? { nl: 'verrassingsdiner', en: 'surprise dinner' }
      : { nl: 'diner', en: 'dinner' }
  const daily = /dagelijks|^\s*2 x|beide|elke/i.test(nl) || /^\s*\d+ x .*diner/i.test(nl)
  return { label, daily }
}

function dinnerImageOf(stop: MultiHotelTripDetailStop): string | undefined {
  return stop.dinnerImage ?? stop.extraImages?.[0] ?? stop.image
}

/** Bouwt per dag de blokken: vaste blokken (inchecken, uitchecken, diner)
 *  uit de hotelgegevens, redactionele blokken uit `content.days`. */
export function buildTripDays(trip: MultiHotelTripDetail, content: TripItinerarySpec | null): TripRawDay[] {
  const stops = trip.stops
  const stopOn = (day: number) => stops.findIndex(s => day >= s.dayFrom && day <= s.dayTo)
  const out: TripRawDay[] = []
  for (let day = 1; day <= trip.nights + 1; day++) {
    const idx = stopOn(day)
    const prevIdx = day > 1 ? stopOn(day - 1) : -1
    const spec = content?.days.find(d => d.day === day)
    const blocks: TripRawBlock[] = []
    const pushActivities = () => {
      for (const a of spec?.activities ?? []) blocks.push({ kind: 'activity', title: a.title, text: a.text, image: a.image })
    }
    const pushDinner = (i: number, arrival: boolean) => {
      const d = dinnerOf(stops[i]!)
      if (!d) return
      if (arrival || d.daily) blocks.push({ kind: 'dinner', stopIndex: i, dinnerLabel: d.label, image: dinnerImageOf(stops[i]!) })
    }
    if (idx === -1) {
      // Laatste dag: uitchecken en terugreis.
      blocks.push({ kind: 'homeward', stopIndex: prevIdx, title: spec?.homeward?.title, text: spec?.homeward?.text, image: spec?.homeward?.image ?? stops[prevIdx]?.image })
      out.push({ day, stopIndex: null, fromStopIndex: prevIdx, blocks })
      continue
    }
    if (day === 1) {
      blocks.push({ kind: 'checkin', stopIndex: idx, image: stops[idx]!.image })
      pushActivities()
      pushDinner(idx, true)
      out.push({ day, stopIndex: idx, blocks })
      continue
    }
    if (idx !== prevIdx) {
      // Wisseldag: eerst onderweg (uitchecken), dan inchecken, dan diner.
      blocks.push({ kind: 'checkout', stopIndex: prevIdx, title: spec?.route?.title, text: spec?.route?.text, image: spec?.route?.image ?? stops[prevIdx]?.image })
      blocks.push({ kind: 'checkin', stopIndex: idx, image: stops[idx]!.image })
      pushActivities()
      pushDinner(idx, true)
      out.push({ day, stopIndex: idx, fromStopIndex: prevIdx, blocks })
      continue
    }
    // Verblijfsdag.
    pushActivities()
    pushDinner(idx, false)
    out.push({ day, stopIndex: idx, blocks })
  }
  return out
}

/* ── Hotel-pop-up ─────────────────────────────────────────────────────── */
export interface TripHotelDetails {
  name: string
  starRating?: number
  city: string
  region: string
  images: string[]
  description: LocalizedString
  facilities: { icon: string; label: string }[]
  includes: LocalizedString[]
}

const FALLBACK_ICON = '/icons/facilities/special.svg'
const stripHtml = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

/** Gegevens voor de hotel-pop-up: redactionele beschrijving/faciliteiten uit
 *  `content.hotels`, anders uit de dataset (deals.json), anders de pitch. */
export function tripHotelDetails(trip: MultiHotelTripDetail, content: TripItinerarySpec | null, stopIndex: number): TripHotelDetails | null {
  const stop = trip.stops[stopIndex]
  if (!stop) return null
  const info = content?.hotels[stop.hotelName]
  const ds = stop.hotelSlug ? mappedHotelsByHotelPermalink[stop.hotelSlug] : undefined
  const images = [stop.image, ...(stop.extraImages ?? []), ...(ds?.images ?? []).map(i => i.url)]
    .filter((u): u is string => !!u)
  const seen = new Set<string>()
  const uniqueImages = images.filter(u => { const k = u.split('?')[0]!; if (seen.has(k)) return false; seen.add(k); return true })
  const description: LocalizedString = info?.description
    ?? (ds ? { nl: stripHtml(ds.description.nl).split(/(?<=\.)\s/).slice(0, 3).join(' '), en: stripHtml(ds.description.en).split(/(?<=\.)\s/).slice(0, 3).join(' ') } : trip.pitch)
  const facilities = info
    ? info.facilities.map(label => ({ icon: facilityIcon(label) ?? FALLBACK_ICON, label }))
    : (ds?.facilities ?? []).map(f => ({ icon: facilityIcon(f.label.nl) ?? FALLBACK_ICON, label: f.label.nl }))
  return {
    name: stop.hotelName,
    starRating: stop.starRating,
    city: stop.city,
    region: stop.region,
    images: uniqueImages,
    description,
    facilities,
    includes: stop.includes,
  }
}

const l = (nl: string, en = nl): LocalizedString => ({ nl, en })

/** Maximaal aantal foto's per vakantie: de desktop-gallery toont hero + 4,
 *  de lightbox ("Alle foto's") en de mobiele carrousel tonen ze allemaal. */
const MAX_GALLERY = 20

function buildImages(trip: MultiHotelTripDetail): { images: HotelImage[]; stickers: Record<string, string> } {
  const images: HotelImage[] = []
  const stickers: Record<string, string> = {}
  // 1. Eén foto per hotel, in reisvolgorde.
  trip.stops.forEach((stop, i) => {
    if (!stop.image) return
    const id = `${trip.id}-img-${i}`
    images.push({ id, url: stop.image, alt: l(stop.hotelName), position: i === 0 ? 'hero' : 'gallery' })
    stickers[id] = stop.hotelName
  })
  // 2. Aanvullen met extra foto's — uit de dataset (hotels in deals.json) of
  //    uit `extraImages` van de stop (aangeleverde hotelfoto's) — round-robin
  //    over de hotels, zodat elk hotel in de zichtbare 1 + 4 gallery terugkomt.
  const used = new Set(images.map(img => img.url.split('?')[0]))
  const extras = trip.stops.map((stop) => {
    const h = stop.hotelSlug ? mappedHotelsByHotelPermalink[stop.hotelSlug] : undefined
    const urls = [...(stop.extraImages ?? []), ...(h?.images ?? []).map(img => img.url)]
    return {
      name: stop.hotelName,
      urls: urls.filter(u => !used.has(u.split('?')[0])),
    }
  })
  let round = 0
  while (images.length < MAX_GALLERY && extras.some(e => e.urls.length)) {
    for (const e of extras) {
      if (images.length >= MAX_GALLERY) break
      const url = e.urls.shift()
      if (!url) continue
      const id = `${trip.id}-extra-${round}-${images.length}`
      images.push({ id, url, alt: l(e.name), position: 'gallery' })
      stickers[id] = e.name
    }
    round++
  }
  return { images, stickers }
}

function buildDeal(trip: MultiHotelTripDetail): Deal {
  return {
    id: `${trip.id}-deal`,
    hotelSlug: trip.slug,
    nights: trip.nights,
    title: trip.title,
    subtitle: trip.pitch,
    inclusions: trip.inclusions.map((title, i) => ({
      id: `${trip.id}-inc-${i}`,
      icon: '',
      title,
      description: title,
    })),
    baseRoomType: sharedBaseRoom,
    // Geen kamerupgrades op vakantieniveau — de upgrades zitten per hotel
    // al in de "Inclusief"-lijsten.
    roomUpgrades: [],
    basePrice: trip.price,
    originalPrice: trip.originalPrice,
    discountPercentage: trip.discountPercentage,
    pricePerPerson: Math.round(trip.price / 2),
  }
}

function buildHotel(trip: MultiHotelTripDetail, images: HotelImage[], content: TripItinerarySpec | null): Hotel {
  const first = trip.stops[0]!
  const stars = trip.stops.map(s => s.starRating ?? 0)
  const sameStars = stars.every(s => s === stars[0])
  const known = trip.stops
    .map(s => (s.hotelSlug ? mappedHotelsByHotelPermalink[s.hotelSlug] : undefined))
    .filter((h): h is Hotel => !!h)
  // Faciliteiten: vereniging van de bekende hotels (op label), anders leeg.
  const facilities: Facility[] = []
  const seen = new Set<string>()
  for (const h of known) {
    for (const f of h.facilities) {
      const key = f.label.nl.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      facilities.push(f)
    }
  }
  return {
    id: trip.id,
    slug: trip.slug,
    name: `${trip.stops.length} fantastische hotels`,
    starRating: sameStars ? (stars[0] ?? 0) : 0,
    location: {
      city: first.city,
      region: first.region,
      country: known[0]?.location.country ?? 'Nederland',
      coordinates: { lat: first.lat ?? 52.0, lng: first.lng ?? 5.0 },
      address: '',
    },
    // Samenvattende beschrijving: alinea's als <p> zodat de dealpagina de
    // eerste alinea als teaser toont en de rest in de "Lees meer"-pop-up.
    description: content
      ? { nl: content.description.map(p => `<p>${p.nl}</p>`).join('\n'), en: content.description.map(p => `<p>${p.en}</p>`).join('\n') }
      : { nl: `<p>${trip.pitch.nl}</p>`, en: `<p>${trip.pitch.en}</p>` },
    pitch: trip.pitch,
    houseRules: sharedHouseRules,
    images,
    facilities,
    reviews: {
      overallScore: trip.reviewScore,
      totalReviews: trip.reviewCount,
      categories: sharedReviewSummary.categories,
    },
    individualReviews: sharedReviews,
    nearbyTips: known[0]?.nearbyTips ?? sharedNearbyTips,
    faq: sharedFaq,
    highlights: (content?.highlights ?? trip.highlights).map(text => ({ icon: '', text })),
  }
}

/** Vakantie-PDP-data voor een route-slug, of null als het geen vakantie is. */
export function tripPdpBySlug(slug: string): MultiHotelTripPdp | null {
  const trip = tripDetailBySlug[slug]
  if (!trip) return null
  const content = TRIP_ITINERARIES[trip.id] ?? null
  const { images, stickers } = buildImages(trip)
  return { trip, deal: buildDeal(trip), hotel: buildHotel(trip, images, content), stickers, content, days: buildTripDays(trip, content) }
}
