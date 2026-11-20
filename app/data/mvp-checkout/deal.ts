// Multi Hotel Trip checkout — hardcoded deal data, merged in from the
// flexibel-annuleren checkout prototype (vialuxury-checkout app/data/deal.ts).
// Matches the "Choose room and extras" Figma screen. Values are kept
// internally consistent so the order summary can react live to
// room-quantity and flexibility changes.
//
// NB: nog niet gekoppeld aan de gekozen deal op de dealpagina — dat volgt
// bij de Multi Hotel Trip-briefing van de checkout.

export interface Facility {
  label: string
  icon: string // key used by CheckoutFacilityItem
}

export interface Room {
  id: string
  packageName: string // e.g. "Pakket Pachthof Junior Suite"
  roomName: string // e.g. "Pachthof Junior Suite"
  priceWas: number
  priceNow: number
  maxPeople: number
  quantity: number
  image: string
  facilitiesIntro: string
  facilities: Facility[]
  cancelLabel?: string // cancellation option shown next to the room name in the summary
  scarcityBadge?: string // e.g. "Je hebt de laatste 2 kamers"
  upgradeText?: string // orange upgrade line, e.g. "Fantastische upgrade voor € 40"
  stockBadge?: string // green nudge, e.g. "Nog maar 4 pakketten"
}

export interface Hotel {
  name: string
  location: string
  checkInLabel: string
  checkInDate: string
  checkOutLabel: string
  checkOutDate: string
  nights: number
  thumb: string
}

const sharedFacilities: Facility[] = [
  { label: 'Kingsize bed', icon: 'bed' },
  { label: 'WiFi', icon: 'wifi' },
  { label: 'Inloopdouche', icon: 'shower' },
  { label: 'Geluidsisolerende ramen', icon: 'window' },
  { label: 'Smart TV', icon: 'tv' },
  { label: 'Bank', icon: 'sofa' },
  { label: 'Kluis', icon: 'safe' },
  { label: 'Leeslamp', icon: 'lamp' },
  { label: 'Airco', icon: 'ac' },
]

// Dealnaam zoals op de dealpagina (titel boven de hotelnaam).
export const dealName =
  '3-daags verblijf in een exclusief kasteelhotel incl. culinair 4-gangendiner'

export const hotel: Hotel = {
  name: 'Van der Valk Hotel Kasteel TerWorm',
  location: 'Heerlen',
  checkInLabel: 'Inchecken',
  checkInDate: 'di 20 mei',
  checkOutLabel: 'Uitchecken',
  checkOutDate: 'do 22 mei',
  nights: 2,
  thumb: '/images/rooms/hotel-thumb.jpg',
}

export const rooms: Room[] = [
  {
    id: 'junior',
    packageName: 'Arrangement Comfort Room',
    roomName: 'Comfort Room',
    priceWas: 597,
    priceNow: 329,
    maxPeople: 2,
    quantity: 1,
    image: '/images/rooms/junior-suite.jpg',
    facilitiesIntro:
      'De Comfort Room is circa 45 m² groot, met uitzicht op het kasteel. De kamer is uitgerust met:',
    facilities: sharedFacilities,
  },
  {
    id: 'senior',
    packageName: 'Arrangement DeLuxe Room',
    roomName: 'DeLuxe Room',
    priceWas: 669,
    priceNow: 369,
    maxPeople: 2,
    quantity: 0,
    image: '/images/rooms/senior-suite.jpg',
    facilitiesIntro:
      'Ervaar ongeëvenaarde luxe in de DeLuxe Room. Deze ruime kamer combineert een elegante, stijlvolle sfeer met moderne voorzieningen voor een onvergetelijk verblijf. Voorzieningen:',
    facilities: sharedFacilities,
    upgradeText: 'Fantastische upgrade voor € 40',
    stockBadge: 'Nog maar 4 pakketten',
  },
]

export const includes: string[] = [
  '2× Overnachting',
  'Dagelijks ontbijtbuffet',
  'Gebruik van het zwembad',
  'Gebruik van de wellness',
]

export const pricing = {
  flexibilityPerRoom: 15, // surcharge per room for flexible cancellation
  bookingFee: 24.95,
}

export const trustpilot = {
  score: '4,5',
  outOf: '5',
}
