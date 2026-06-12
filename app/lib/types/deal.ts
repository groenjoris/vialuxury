import type { LocalizedString } from './i18n'

/**
 * A curated hotel deal package for a specific number of nights,
 * with inclusions and room options.
 */
export interface Deal {
  /** Unique deal identifier. */
  id: string
  /** Slug of the associated hotel. */
  hotelSlug: string
  /** Number of nights in this deal. */
  nights: number
  /** Localized deal title. */
  title: LocalizedString
  /** Localized deal subtitle. */
  subtitle: LocalizedString
  /** Items included in the deal. */
  inclusions: DealInclusion[]
  /** The default room type for this deal. */
  baseRoomType: RoomOption
  /** Available room upgrades beyond the base room. */
  roomUpgrades: RoomOption[]
  /** Total price for the default configuration (2 persons, base room). */
  basePrice: number
  /** Original price before discount. */
  originalPrice: number
  /** Discount expressed as a percentage. */
  discountPercentage: number
  /** Price calculated per person. */
  pricePerPerson: number
}

/** A single inclusion within a deal (e.g. breakfast, spa access). */
export interface DealInclusion {
  /** Unique inclusion identifier. */
  id: string
  /** Icon key or path for the inclusion. */
  icon: string
  /** Localized inclusion title. */
  title: LocalizedString
  /** Localized inclusion description. */
  description: LocalizedString
  /** Optional image URL for the inclusion. */
  image?: string
  /** Whether this inclusion should be visually highlighted. */
  highlight?: boolean
}

/** A room type option within a deal. */
export interface RoomOption {
  /** Unique room option identifier. */
  id: string
  /** Localized room name. */
  name: LocalizedString
  /** Localized room description. */
  description: LocalizedString
  /** Description shown in the room block when this upgrade is selected. */
  upgradeDescription?: LocalizedString
  /** Room image URL. */
  image: string
  /** Additional price on top of the base room (0 for the base room). */
  priceExtra: number
  /** Whether this is the default room selection. */
  isDefault: boolean
  /** Whether the base room itself is an upgrade included in the deal. */
  isUpgrade?: boolean
  /** Maximum rooms of this type available. */
  maxAvailable?: number
  /** Localized list of room features. */
  features: LocalizedString[]
}

/** A sibling deal for the same hotel but with a different night count. */
export interface DealVariant {
  /** Unique variant identifier. */
  id: string
  /** Number of nights for this variant. */
  nights: number
  /** Localized label for the variant. */
  label: LocalizedString
  /** Base price for this variant. */
  basePrice: number
  /** Original price before discount. */
  originalPrice: number
  /** Whether this variant is currently available. */
  available: boolean
}

/** Travel group configuration for a booking. */
export interface TravelGroup {
  /** Number of adult travellers. */
  adults: number
  /** Child entries with age information. */
  children: ChildEntry[]
  /** Number of rooms requested. */
  rooms: number
}

/** A child within a travel group. */
export interface ChildEntry {
  /** Unique child entry identifier. */
  id: string
  /** Age of the child. */
  age: number
}

/** Computed pricing for a specific travel group configuration. */
export interface TravelGroupPricing {
  /** Total computed price. */
  totalPrice: number
  /** Original price before discount. */
  originalPrice: number
  /** Price per person. */
  pricePerPerson: number
  /** Itemised pricing breakdown. */
  breakdown: {
    /** Line-item label. */
    label: string
    /** Line-item amount. */
    amount: number
  }[]
}
