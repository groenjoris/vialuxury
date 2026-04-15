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
  title: string
  basePrice: number
  originalPrice: number
  discountPercentage: number
  highlights: string[]
  inclusions: string[]
}
