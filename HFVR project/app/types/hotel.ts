export interface Hotel {
  id: string
  slug: string
  name: string
  starRating: number
  location: HotelLocation
  description: string
  images: HotelImage[]
  facilities: Facility[]
  reviews: ReviewSummary
  individualReviews: Review[]
  nearbyTips: NearbyTip[]
  faq: FaqItem[]
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
  alt: string
  position: 'hero' | 'gallery'
}

export interface Facility {
  icon: string
  label: string
}

export interface ReviewSummary {
  overallScore: number
  totalReviews: number
  categories: ReviewCategory[]
}

export interface ReviewCategory {
  name: string
  icon: string
  score: number
}

export interface Review {
  id: string
  author: string
  date: string
  score: number
  text: string
  images?: string[]
  arrangement?: string
}

export interface NearbyTip {
  id: string
  title: string
  description: string
  image: string
}

export interface FaqItem {
  id: string
  question: string
  answer: string
}
