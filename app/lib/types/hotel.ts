import type { LocalizedString } from './i18n'

/** Full hotel entity with all detail-page information. */
export interface Hotel {
  /** Unique hotel identifier. */
  id: string
  /** URL-friendly hotel slug. */
  slug: string
  /** Hotel display name. */
  name: string
  /** Star rating (e.g. 3, 4, 5). */
  starRating: number
  /** Hotel location details. */
  location: HotelLocation
  /** Localized hotel description. */
  description: LocalizedString
  /** Short persuasive pitch text. */
  pitch?: LocalizedString
  /** Hotel house rules. */
  houseRules?: HouseRule[]
  /** Hotel images for hero and gallery. */
  images: HotelImage[]
  /** Available hotel facilities. */
  facilities: Facility[]
  /** Aggregated review summary. */
  reviews: ReviewSummary
  /** Individual guest reviews. */
  individualReviews: Review[]
  /** Nearby points of interest and tips. */
  nearbyTips: NearbyTip[]
  /** Frequently asked questions. */
  faq: FaqItem[]
  /** Optional highlight badges with icon and text. */
  highlights?: { icon: string; text: LocalizedString }[]
}

/** Geographic and address information for a hotel. */
export interface HotelLocation {
  /** City name. */
  city: string
  /** Region or province name. */
  region: string
  /** Country name. */
  country: string
  /** Geographic coordinates. */
  coordinates: { lat: number; lng: number }
  /** Full street address. */
  address: string
}

/** A single hotel image. */
export interface HotelImage {
  /** Unique image identifier. */
  id: string
  /** Image URL. */
  url: string
  /** Localized alt text for accessibility. */
  alt: LocalizedString
  /** Where the image is displayed. */
  position: 'hero' | 'gallery'
}

/** A hotel facility entry (e.g. pool, parking). */
export interface Facility {
  /** Icon key or path. */
  icon: string
  /** Localized facility label. */
  label: LocalizedString
}

/** Aggregated review scores for a hotel. */
export interface ReviewSummary {
  /** Overall review score. */
  overallScore: number
  /** Total number of reviews. */
  totalReviews: number
  /** Per-category review scores. */
  categories: ReviewCategory[]
}

/** A single review score category (e.g. cleanliness, location). */
export interface ReviewCategory {
  /** Localized category name. */
  name: LocalizedString
  /** Icon key or path. */
  icon: string
  /** Score for this category. */
  score: number
}

/** An individual guest review. */
export interface Review {
  /** Unique review identifier. */
  id: string
  /** Author display name. */
  author: string
  /** Review date string. */
  date: string
  /** Numeric review score. */
  score: number
  /** Localized review text. */
  text: LocalizedString
  /** Optional image URLs attached to the review. */
  images?: string[]
  /** The arrangement the reviewer booked. */
  arrangement?: LocalizedString
  /** Associated deal identifier. */
  dealId?: string
}

/** A nearby point of interest or tip. */
export interface NearbyTip {
  /** Unique tip identifier. */
  id: string
  /** Localized tip title. */
  title: LocalizedString
  /** Localized tip description. */
  description: LocalizedString
  /** Tip image URL. */
  image: string
}

/** A frequently asked question. */
export interface FaqItem {
  /** Unique FAQ identifier. */
  id: string
  /** Localized question text. */
  question: LocalizedString
  /** Localized answer text. */
  answer: LocalizedString
}

/** A hotel house rule. */
export interface HouseRule {
  /** Unique rule identifier. */
  id: string
  /** Localized rule title. */
  title: LocalizedString
  /** Localized rule description. */
  description: LocalizedString
}
