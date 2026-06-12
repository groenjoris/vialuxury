import type { LocalizedString } from './i18n'

/** A bookable arrangement for a specific hotel. */
export interface Arrangement {
  /** Unique arrangement identifier. */
  id: string
  /** Associated hotel identifier. */
  hotelId: string
  /** URL-friendly hotel slug. */
  hotelSlug: string
  /** Localized arrangement title. */
  title: LocalizedString
  /** Default number of nights. */
  baseNights: number
  /** Maximum number of nights. */
  maxNights: number
  /** Minimum number of nights. */
  minNights: number
  /** Default number of persons. */
  basePersons: number
  /** Maximum number of persons. */
  maxPersons: number
  /** Minimum number of persons. */
  minPersons: number
  /** Items included in the base arrangement. */
  baseItems: ArrangementItem[]
  /** Optional extras the user can add. */
  configurableExtras: ConfigurableExtra[]
  /** Available room types for this arrangement. */
  roomTypes: RoomType[]
  /** Localized cancellation policy text. */
  cancellationPolicy: LocalizedString
  /** Discount expressed as a percentage. */
  discountPercentage: number
  /** Base price per night. */
  basePricePerNight: number
}

/** A single item within an arrangement (e.g. overnight stay, breakfast, activity). */
export interface ArrangementItem {
  /** Unique item identifier. */
  id: string
  /** Item category type. */
  type: 'overnight' | 'breakfast' | 'dinner' | 'activity' | 'spa' | 'amenity' | 'upgrade'
  /** Localized item title. */
  title: LocalizedString
  /** Localized title template with placeholders. */
  titleTemplate: LocalizedString
  /** Localized short description. */
  shortDescription: LocalizedString
  /** Localized full description. */
  description: LocalizedString
  /** Optional image URL. */
  image?: string
  /** Icon key or path. */
  icon: string
  /** Whether this item repeats per night. */
  isPerNight: boolean
  /** Whether this item repeats per person. */
  isPerPerson: boolean
  /** Whether this item is included in the base price. */
  included: boolean
}

/** An optional extra that can be added to an arrangement. */
export interface ConfigurableExtra {
  /** Unique extra identifier. */
  id: string
  /** Localized extra title. */
  title: LocalizedString
  /** Localized extra description. */
  description: LocalizedString
  /** Icon key or path. */
  icon: string
  /** Optional image URL. */
  image?: string
  /** Price per unit. */
  pricePerUnit: number
  /** How the price is calculated. */
  pricingBasis: 'per_night' | 'per_person' | 'per_person_per_night' | 'flat'
  /** Maximum quantity that can be added. */
  maxQuantity: number
  /** Whether this extra is selected by default. */
  defaultSelected: boolean
}

/** A room type available within an arrangement. */
export interface RoomType {
  /** Unique room type identifier. */
  id: string
  /** Localized room name. */
  name: LocalizedString
  /** Localized room description. */
  description: LocalizedString
  /** Price per night for this room type. */
  pricePerNight: number
  /** Room image URLs. */
  images: string[]
  /** Whether this is the default room type. */
  isDefault: boolean
}

/** The user's booking configuration state. */
export interface BookingConfiguration {
  /** Hotel slug for the booking. */
  hotelSlug: string
  /** Number of nights selected. */
  nights: number
  /** Number of persons. */
  persons: number
  /** Selected room type identifier. */
  roomTypeId: string
  /** Identifiers of selected extras. */
  selectedExtras: string[]
  /** Check-in date as ISO string, or null if not set. */
  checkInDate: string | null
  /** Check-out date as ISO string, or null if not set. */
  checkOutDate: string | null
}

/** Computed price breakdown for a booking configuration. */
export interface PriceBreakdown {
  /** Base price before room upgrades and extras. */
  basePrice: number
  /** Additional cost for room upgrade. */
  roomUpgradePrice: number
  /** Additional cost for selected extras. */
  extrasPrice: number
  /** Total price before discount is applied. */
  totalBeforeDiscount: number
  /** Discount expressed as a percentage. */
  discountPercentage: number
  /** Absolute discount amount. */
  discountAmount: number
  /** Final price after discount. */
  finalPrice: number
  /** Final price divided by number of persons. */
  pricePerPerson: number
}
