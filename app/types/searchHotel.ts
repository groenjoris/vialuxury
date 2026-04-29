import type { LocalizedString } from '~/i18n/types'

export interface SearchHotel {
  id: string
  slug: string
  name: string
  starRating: number
  city: string
  region: string
  heroImage: string
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
}
