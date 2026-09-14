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
import { tripDetailBySlug, type MultiHotelTripDetail } from './mht-trips'
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
  /** Foto-id → hotelnaam (sticker in de gallery). */
  stickers: Record<string, string>
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

function buildHotel(trip: MultiHotelTripDetail, images: HotelImage[]): Hotel {
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
    description: trip.pitch,
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
    highlights: trip.highlights.map(text => ({ icon: '', text })),
  }
}

/** Vakantie-PDP-data voor een route-slug, of null als het geen vakantie is. */
export function tripPdpBySlug(slug: string): MultiHotelTripPdp | null {
  const trip = tripDetailBySlug[slug]
  if (!trip) return null
  const { images, stickers } = buildImages(trip)
  return { trip, deal: buildDeal(trip), hotel: buildHotel(trip, images), stickers }
}
