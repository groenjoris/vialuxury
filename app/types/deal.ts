import type { LocalizedString } from '~/i18n/types'

/**
 * A Deal is a specific, curated package for a hotel.
 * Different nights = different deal with potentially different inclusions.
 */
export interface Deal {
  id: string
  hotelSlug: string
  nights: number
  title: LocalizedString
  subtitle: LocalizedString
  inclusions: DealInclusion[]
  baseRoomType: RoomOption
  roomUpgrades: RoomOption[]
  basePrice: number // Total price for default config (2 persons, base room)
  originalPrice: number // Before discount
  discountPercentage: number
  pricePerPerson: number
}

export interface DealInclusion {
  id: string
  icon: string
  title: LocalizedString
  description: LocalizedString
  image?: string
  highlight?: boolean // e.g. "Inclusief ontbijt" badge
}

export interface RoomOption {
  id: string
  name: LocalizedString
  description: LocalizedString
  image: string
  priceExtra: number // 0 for base, positive for upgrades
  isDefault: boolean
  isUpgrade?: boolean // true when the base room is an upgrade included in the deal
  features: LocalizedString[]
}

/**
 * Sibling deals for the same hotel but different night counts.
 */
export interface DealVariant {
  id: string
  nights: number
  label: LocalizedString
  basePrice: number
  originalPrice: number
  available: boolean
}

/**
 * Travel group configuration (modal).
 */
export interface TravelGroup {
  adults: number
  children: ChildEntry[]
  rooms: number
}

export interface ChildEntry {
  id: string
  age: number
}

export interface TravelGroupPricing {
  totalPrice: number
  originalPrice: number
  pricePerPerson: number
  breakdown: {
    label: string
    amount: number
  }[]
}
