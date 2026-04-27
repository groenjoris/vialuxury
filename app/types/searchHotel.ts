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
