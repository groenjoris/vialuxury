import type { LocalizedString } from './i18n'

/** A slim hotel summary used by the browse map view. */
export interface MapHotel {
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
  /** Country where the hotel is located. */
  country: string
  /** Geographic coordinates for pin placement. */
  coordinates: { lat: number; lng: number }
  /** Primary hero image URL. */
  heroImage: string
  /** Available packages for the map sidebar. */
  packages: MapHotelPackage[]
  /** Whether all packages are sold out for the selected dates. */
  soldOut: boolean
  /** Number of remaining packages across all variants (low-availability indicator). */
  lowAvailabilityCount?: number
}

/** A package summary within a map hotel listing. */
export interface MapHotelPackage {
  /** Unique package identifier. */
  id: string
  /** Number of nights. */
  nights: number
  /** Number of people. */
  people: number
  /** Final price per group after discount. */
  priceFrom: number
  /** Original undiscounted price (used for strikethrough display). */
  originalPrice: number
  /** Discount expressed as a percentage. */
  discountPct: number
  /** Localized compact inclusion labels. */
  inclusions: LocalizedString[]
  /** Total inclusions count for "+N more" display. */
  totalInclusions: number
  /** Whether this package is sold out. */
  soldOut: boolean
}
