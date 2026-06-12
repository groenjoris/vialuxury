import type { LocalizedString } from './i18n'

/** A hotel summary used in search result listings. */
export interface SearchHotel {
  /** Unique hotel identifier. */
  id: string
  /** URL-friendly hotel slug. */
  slug: string
  /** Hotel display name. */
  name: string
  /** Star rating (e.g. 3, 4, 5). */
  starRating: number
  /** City where the hotel is located. */
  city: string
  /** Region where the hotel is located. */
  region: string
  /** Province derived from the city lookup. Empty for hotels without a mapping. */
  province?: string
  /** Primary hero image URL. */
  heroImage: string
  /** Up to 5 photos for the deal-card carousel in grid view. */
  galleryImages?: string[]
  /** Average review score. */
  reviewScore: number
  /** Total number of reviews. */
  reviewCount: number
  /** Short persuasive pitch text. */
  pitch: LocalizedString
  /** Available deals for this hotel. */
  deals: SearchHotelDeal[]
  /** Special label keys (e.g. 'wellness', 'super-deal') for badge overlays. */
  labels?: string[]
  /** Geographic coordinates for map display. */
  coordinates?: { lat: number; lng: number }
  /** Whether all deals are sold out for the selected arrival date. */
  soldOut?: boolean
  /** Whether the hotel has deals but none match the active filters. */
  unmatched?: boolean
}

/** A deal summary within a search hotel result. */
export interface SearchHotelDeal {
  /** Unique deal identifier. */
  id: string
  /** URL-friendly deal slug. */
  slug: string
  /** Number of nights. */
  nights: number
  /** Localized deal title. */
  title: LocalizedString
  /** Base price after discount. */
  basePrice: number
  /** Original price before discount. */
  originalPrice: number
  /** Discount expressed as a percentage. */
  discountPercentage: number
  /** Localized highlight strings. */
  highlights: LocalizedString[]
  /** Localized compact inclusion labels. */
  inclusions: LocalizedString[]
  /** Full-form inclusion titles for detailed display. */
  detailedInclusions?: LocalizedString[]
  /** Per-deal hero image URL. */
  heroImage?: string
  /** Fallback image from the first detailed inclusion. */
  inclusionImage?: string
  /** Whether dinner is included in this deal. */
  hasDinner?: boolean
  /** Raw theme strings used for filter matching. */
  themes?: string[]
}
