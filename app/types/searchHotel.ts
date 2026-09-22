import type { LocalizedString } from '~/i18n/types'

/** Multi Hotel Trip — een "vakantie" bestaat uit twee of drie hotels
 *  achter elkaar. Zo'n reis wordt als één SearchHotel-record met één deal
 *  door de zoekresultaten geleid; `trip` markeert het record en draagt de
 *  tussenstops (plaatsnamen) + quick-filter-tags. Alleen gebruikt door het
 *  Multi Hotel Trip-prototype; R1/R2 laten het veld leeg. */
export type MultiHotelTripType = 'auto' | 'fiets'
export interface MultiHotelTripStop {
  city: string
  hotelName: string
  /** Slug in de dataset; leeg voor hotels die (nog) niet in deals.json staan. */
  hotelSlug?: string
  /** Aantal nachten op deze stop (voor de vakantie-PDP). */
  nights?: number
  starRating?: number
  /** Foto voor hotels buiten de dataset (public/images/vakanties/...). */
  image?: string
  /** Ligging, voor het routekaartje op de card. */
  lat?: number
  lng?: number
  /** NL-provincie voor het bestemmingsfilter (streeknaam kan afwijken, bv. Twente → Overijssel). */
  province?: string
  /** Etappe vanaf het vorige hotel (voor de km/min-labels in de tijdlijn-variant). */
  travel?: { km: number; minutes: number }
}
export interface MultiHotelTripInfo {
  type: MultiHotelTripType
  stops: MultiHotelTripStop[]
  /** Quick-filter ids (zie utils-multi-hotel-trip/tripFilters.ts). */
  tags: string[]
  /** Routekaart uit de briefing (voor de vakantie-PDP). */
  routeImage?: string
  /** Omgevingsfoto: standaardfoto op de dealcard (hover op een nummer toont het hotel). */
  coverImage?: string
  /** Omgevingsfoto's (PDP-gallery na de cover); de collage-dealcard toont de eerste twee. */
  nearbyImages?: string[]
  /** Waar de card voorlopig naartoe linkt zolang er geen vakantie-PDP is. */
  pdpHref?: string
}

export interface SearchHotel {
  id: string
  slug: string
  name: string
  starRating: number
  city: string
  region: string
  /** Derived from `city` via dutchCities lookup; empty for hotels in cities
   *  we don't have a province mapping for (e.g. all BE hotels). */
  province?: string
  heroImage: string
  /** Up to 5 hotel photos for the deal-card carousel (grid view). Hero
   *  is the first entry; additional shots from the package's photos. */
  galleryImages?: string[]
  reviewScore: number
  reviewCount: number
  pitch: LocalizedString
  deals: SearchHotelDeal[]
  /** Optional special-deal label keys (e.g. 'wellness', 'super-deal').
   *  Maps to /images/labels/<key>.svg sticker shown over the hero image. */
  labels?: string[]
  /** Geographic coordinates for the hotel (used by /kaart). */
  coordinates?: { lat: number; lng: number }
  /** Map-only: hotel has zero available deals on the active arrival-date.
   *  Set by the /kaart page after applying date+duration filters. */
  soldOut?: boolean
  /** Map-only: hotel has deals but none of them match the active filters
   *  (nights / themes / arrangement / specials / budget / arrival). The
   *  pin renders in the disabled style and the hover-card text reads
   *  "Voldoet niet aan je zoekwensen" — clicking still opens the side
   *  panel with all of the hotel's deals. */
  unmatched?: boolean
  /** Multi Hotel Trip: gezet wanneer dit record een meerhotel-vakantie is. */
  trip?: MultiHotelTripInfo
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
  /** Long-form inclusion titles (`pkg.includesDetailed[i].title`) — same
   *  strings the deal-page sidebar lists under "In dit arrangement …
   *  is het volgende inbegrepen". Used by the v6 sidepanel cards which
   *  want the full, fully-formulated list rather than the compact
   *  `inclusions` set. */
  detailedInclusions?: LocalizedString[]
  /** Per-deal hero image (pkg.imageUrls[0]). */
  heroImage?: string
  /** Fallback image: first detailed inclusion's imageUrl. */
  inclusionImage?: string
  /** Identifies "diner inbegrepen" packages — drives primary-deal pick. */
  hasDinner?: boolean
  /** Raw theme strings from deals.json (e.g. "Beste wellness hotels",
   *  "Romantisch overnachten") — used by theme filter matching. */
  themes?: string[]
}
