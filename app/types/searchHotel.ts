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
  deals: SearchHotelDeal[]
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
}
