import type { LocalizedString } from '~/i18n/types'

export interface Hotel {
  id: string
  slug: string
  name: string
  starRating: number
  location: HotelLocation
  description: LocalizedString
  pitch?: LocalizedString
  houseRules?: HouseRule[]
  images: HotelImage[]
  facilities: Facility[]
  reviews: ReviewSummary
  individualReviews: Review[]
  nearbyTips: NearbyTip[]
  faq: FaqItem[]
  highlights?: { icon: string; text: LocalizedString }[]
}

export interface HotelLocation {
  city: string
  region: string
  country: string
  coordinates: { lat: number; lng: number }
  address: string
}

export interface HotelImage {
  id: string
  url: string
  alt: LocalizedString
  position: 'hero' | 'gallery'
}

export interface Facility {
  icon: string
  label: LocalizedString
}

export interface ReviewSummary {
  overallScore: number
  totalReviews: number
  categories: ReviewCategory[]
}

export interface ReviewCategory {
  name: LocalizedString
  icon: string
  score: number
}

export interface Review {
  id: string
  author: string
  date: string
  score: number
  text: LocalizedString
  images?: string[]
  arrangement?: LocalizedString
  dealId?: string
}

export interface NearbyTip {
  id: string
  title: LocalizedString
  description: LocalizedString
  image: string
}

export interface FaqItem {
  id: string
  question: LocalizedString
  answer: LocalizedString
}

export interface HouseRule {
  id: string
  title: LocalizedString
  description: LocalizedString
}
