/**
 * MapHotel — a slim hotel summary used by the /kaart browse map.
 *
 * The full `Hotel` interface (in ~/types/hotel.ts) is detail-page heavy
 * (FAQs, reviews, facilities…). The browse map only needs enough to render
 * a pin, hover card, and sidebar package list, so we keep this shape light
 * and decoupled.
 */

export interface MapHotel {
  id: string
  slug: string
  name: string
  starRating: number
  city: string
  country: string
  coordinates: { lat: number; lng: number }
  heroImage: string
  packages: MapHotelPackage[]
  /** True when ALL packages are sold out for the user's chosen dates. */
  soldOut: boolean
  /** Optional persuasive message: total packages remaining across all variants. */
  lowAvailabilityCount?: number
}

export interface MapHotelPackage {
  id: string
  nights: number
  people: number
  /** Final price per group (after discount). */
  priceFrom: number
  /** Original undiscounted price (used for the strikethrough). */
  originalPrice: number
  discountPct: number
  inclusions: string[]
  /** Total inclusions count (so we can render "+N more extras included!"). */
  totalInclusions: number
  soldOut: boolean
}
