import type { LocalizedString } from '~/i18n/types'

export interface Arrangement {
  id: string
  hotelId: string
  hotelSlug: string
  title: LocalizedString
  baseNights: number
  maxNights: number
  minNights: number
  basePersons: number
  maxPersons: number
  minPersons: number
  baseItems: ArrangementItem[]
  configurableExtras: ConfigurableExtra[]
  roomTypes: RoomType[]
  cancellationPolicy: LocalizedString
  discountPercentage: number
  basePricePerNight: number
}

export interface ArrangementItem {
  id: string
  type: 'overnight' | 'breakfast' | 'dinner' | 'activity' | 'spa' | 'amenity' | 'upgrade'
  title: LocalizedString
  titleTemplate: LocalizedString
  shortDescription: LocalizedString
  description: LocalizedString
  image?: string
  icon: string
  isPerNight: boolean
  isPerPerson: boolean
  included: boolean
}

export interface ConfigurableExtra {
  id: string
  title: LocalizedString
  description: LocalizedString
  icon: string
  image?: string
  pricePerUnit: number
  pricingBasis: 'per_night' | 'per_person' | 'per_person_per_night' | 'flat'
  maxQuantity: number
  defaultSelected: boolean
}

export interface RoomType {
  id: string
  name: LocalizedString
  description: LocalizedString
  pricePerNight: number
  images: string[]
  isDefault: boolean
}

export interface BookingConfiguration {
  hotelSlug: string
  nights: number
  persons: number
  roomTypeId: string
  selectedExtras: string[]
  checkInDate: string | null
  checkOutDate: string | null
}

export interface PriceBreakdown {
  basePrice: number
  roomUpgradePrice: number
  extrasPrice: number
  totalBeforeDiscount: number
  discountPercentage: number
  discountAmount: number
  finalPrice: number
  pricePerPerson: number
}
