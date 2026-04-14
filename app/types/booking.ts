export interface Arrangement {
  id: string
  hotelId: string
  hotelSlug: string
  title: string
  baseNights: number
  maxNights: number
  minNights: number
  basePersons: number
  maxPersons: number
  minPersons: number
  baseItems: ArrangementItem[]
  configurableExtras: ConfigurableExtra[]
  roomTypes: RoomType[]
  cancellationPolicy: string
  discountPercentage: number
  basePricePerNight: number
}

export interface ArrangementItem {
  id: string
  type: 'overnight' | 'breakfast' | 'dinner' | 'activity' | 'spa' | 'amenity' | 'upgrade'
  title: string
  titleTemplate: string
  shortDescription: string
  description: string
  image?: string
  icon: string
  isPerNight: boolean
  isPerPerson: boolean
  included: boolean
}

export interface ConfigurableExtra {
  id: string
  title: string
  description: string
  icon: string
  image?: string
  pricePerUnit: number
  pricingBasis: 'per_night' | 'per_person' | 'per_person_per_night' | 'flat'
  maxQuantity: number
  defaultSelected: boolean
}

export interface RoomType {
  id: string
  name: string
  description: string
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
