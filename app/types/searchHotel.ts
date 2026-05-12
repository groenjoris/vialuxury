import type { LocalizedString } from '~/i18n/types'

export interface SearchHotel {
  id: string
  slug: string
  name: string
  starRating: number
  city: string
  region: string
  /** Derived from `city` via dutchCities lookup; empty for hotels in cities
   *  we don't have a province mapping for (e.g. all BE hotels). */
  province?: string
  heroImage: string
  /** Up to 5 hotel photos for the deal-card carousel (grid view). Hero
   *  is the first entry; additional shots from the package's photos. */
  galleryImages?: string[]
  reviewScore: number
  reviewCount: number
  pitch: LocalizedString
  deals: SearchHotelDeal[]
  /** Optional special-deal label keys (e.g. 'wellness', 'super-deal').
   *  Maps to /images/labels/<key>.svg sticker shown over the hero image. */
  labels?: string[]
  /** Geographic coordinates for the hotel (used by /kaart). */
  coordinates?: { lat: number; lng: number }
  /** Map-only: hotel has zero available deals on the active arrival-date.
   *  Set by the /kaart page after applying date+duration filters. */
  soldOut?: boolean
  /** Map-only: hotel has deals but none of them match the active filters
   *  (nights / themes / arrangement / specials / budget / arrival). The
   *  pin renders in the disabled style and the hover-card text reads
   *  "Voldoet niet aan je zoekwensen" — clicking still opens the side
   *  panel with all of the hotel's deals. */
  unmatched?: boolean
}

export interface SearchHotelDeal {
  id: string
  slug: string
  nights: number
  title: LocalizedString
  basePrice: number
  originalPrice: number
  discountPercentage: number
  highlights: LocalizedString[]
  inclusions: LocalizedString[]
  /** Per-deal hero image (pkg.imageUrls[0]). */
  heroImage?: string
  /** Fallback image: first detailed inclusion's imageUrl. */
  inclusionImage?: string
  /** Identifies "diner inbegrepen" packages — drives primary-deal pick. */
  hasDinner?: boolean
  /** Raw theme strings from deals.json (e.g. "Beste wellness hotels",
   *  "Romantisch overnachten") — used by theme filter matching. */
  themes?: string[]
}
