// Multi Hotel Trip checkout — vakantie (meerdere hotels) als boekbare reis:
// één cluster van kamers (één per hotel) met één prijs voor de hele reis; de
// gast kiest het aantal personen (2 per kamer). Gebouwd uit de reisdata (mht-trips.ts) en de redactionele
// hotelinfo (mht-trip-itineraries.ts) via tripPdpBySlug/tripHotelDetails.
import { tripPdpBySlug, tripHotelDetails } from '~/data/mht-trip-pdp'
import type { Facility } from '~/data/mht-checkout/deal'

// Karakteristieken (room amenities) per kamer — de reisdata kent die niet, dus
// een plausibele set per hotel in hetzelfde ontwerp/iconenset als de hotel-deal
// (CheckoutFacilityItem). Volgorde: bed, wifi, badkamer, uitzicht/ramen, extra's.
const ROOM_FACILITY_SETS: Facility[][] = [
  [
    { label: 'Kingsize bed', icon: 'bed' },
    { label: 'WiFi', icon: 'wifi' },
    { label: 'Regendouche', icon: 'shower' },
    { label: 'Smart TV', icon: 'tv' },
    { label: 'Kluis', icon: 'safe' },
    { label: 'Airco', icon: 'ac' },
  ],
  [
    { label: 'Queensize bed', icon: 'bed' },
    { label: 'WiFi', icon: 'wifi' },
    { label: 'Bad of douche', icon: 'shower' },
    { label: 'Zicht op het park', icon: 'window' },
    { label: 'Zithoek', icon: 'sofa' },
    { label: 'Leeslamp', icon: 'lamp' },
  ],
  [
    { label: 'Kingsize bed', icon: 'bed' },
    { label: 'WiFi', icon: 'wifi' },
    { label: 'Inloopdouche', icon: 'shower' },
    { label: 'Tuinzicht', icon: 'window' },
    { label: 'Flatscreen-tv', icon: 'tv' },
    { label: 'Kluis', icon: 'safe' },
  ],
]

export interface TripCheckoutHotel {
  name: string
  city: string
  nights: number
  starRating?: number
  /** Kamerfoto (anders hotelfoto). */
  image?: string
  roomName: string
  roomDescription: string
  /** Karakteristieken van de kamer (chips onder de beschrijving). */
  facilities: Facility[]
}

export interface TripCheckout {
  slug: string
  /** Reisnaam zoals op de dealpagina. */
  name: string
  /** "Autovakantie" / "Fietsvakantie" en de kleine variant voor in zinnen. */
  typeLabel: string
  typeWord: string
  nights: number
  /** Prijs van de hele vakantie (alle hotels, 2 personen). */
  price: number
  priceWas: number
  thumb: string
  includes: string[]
  hotels: TripCheckoutHotel[]
  /** Schaarste van de vakantie (demo) in de kolom "Je opties": in personen, niet in kamers of
   *  "stuks" ("Nog beschikbaar voor max 4 personen", mag over twee regels), want "Nog 2 beschikbaar"
   *  zegt bij een vakantie met drie hotels niet wat er nog is. */
  scarcity?: string
  /** Bij schaarste: het maximum aantal personen dat nog kan; de personenselector grijst de opties
   *  erboven uit (desktop: uitgegrijsde opties in het menu, mobiel: de plusknop stopt). */
  maxPersons?: number
}

/** Demo-schaarste: de vakantie is nog beschikbaar voor maximaal dit aantal personen (2 kamers per hotel). */
const TRIP_MAX_PERSONS = 4

export function tripCheckoutBySlug(slug: string): TripCheckout | null {
  const pdp = tripPdpBySlug(slug)
  if (!pdp) return null
  const { trip, content } = pdp
  const hotels: TripCheckoutHotel[] = trip.stops.map((s, i) => {
    const d = tripHotelDetails(trip, content, i)
    return {
      name: s.hotelName,
      city: s.city,
      nights: s.nights,
      starRating: s.starRating,
      image: d?.room?.image ?? s.image ?? d?.images[0],
      roomName: d?.room?.name.nl ?? 'Standaardkamer',
      roomDescription: d?.room?.description.nl ?? d?.description.nl ?? '',
      facilities: ROOM_FACILITY_SETS[i % ROOM_FACILITY_SETS.length]!,
    }
  })
  const typeLabel = trip.type === 'fiets' ? 'Fietsvakantie' : 'Autovakantie'
  return {
    slug,
    name: trip.title.nl,
    typeLabel,
    typeWord: typeLabel.toLowerCase(),
    nights: trip.nights,
    price: trip.price,
    priceWas: trip.originalPrice,
    thumb: trip.coverImage ?? trip.stops[0]?.image ?? '',
    includes: trip.inclusions.map(i => i.nl),
    hotels,
    scarcity: `Nog beschikbaar voor max ${TRIP_MAX_PERSONS} personen`,
    maxPersons: TRIP_MAX_PERSONS,
  }
}
