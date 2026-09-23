// Multi Hotel Trip checkout — vakantie (meerdere hotels) als boekbaar
// "arrangement": één cluster van kamers (één per hotel) met één prijs voor de
// hele reis. Gebouwd uit de reisdata (mht-trips.ts) en de redactionele
// hotelinfo (mht-trip-itineraries.ts) via tripPdpBySlug/tripHotelDetails.
import { tripPdpBySlug, tripHotelDetails } from '~/data/mht-trip-pdp'

export interface TripCheckoutHotel {
  name: string
  city: string
  nights: number
  starRating?: number
  /** Kamerfoto (anders hotelfoto). */
  image?: string
  roomName: string
  roomDescription: string
}

export interface TripCheckout {
  slug: string
  /** Reisnaam zoals op de dealpagina. */
  name: string
  /** "Autovakantie" / "Fietsvakantie" en de kleine variant voor in zinnen. */
  typeLabel: string
  typeWord: string
  nights: number
  /** Prijs van het hele arrangement (alle hotels, 2 personen). */
  price: number
  priceWas: number
  thumb: string
  includes: string[]
  hotels: TripCheckoutHotel[]
  /** Schaarste van het arrangement (demo), bv. "Nog 2 arrangementen over". */
  scarcity?: string
}

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
    scarcity: 'Nog 2 arrangementen over',
  }
}
