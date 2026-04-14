import type { Deal, DealVariant, DealInclusion, RoomOption } from '~/types/deal'
import type { Hotel } from '~/types/hotel'
import { hotelTerZand } from './hotel-ter-zand'

/**
 * Deal inclusions shared across variants
 */
const sharedInclusions: DealInclusion[] = [
  {
    id: 'inc-upgrade',
    icon: 'upgrade',
    title: 'Upgrade naar luxer kamertype',
    description:
      'Bij Hotel Ter Zand maken we je verblijf nog specialer. Je wordt standaard geüpgraded naar een luxer kamertype – zonder extra kosten.',
    image: '/images/arrangement/upgrade.jpg',
  },
  {
    id: 'inc-breakfast',
    icon: 'free_breakfast',
    title: 'Dagelijks ontbijtbuffet',
    description:
      "Begin de dag goed met het uitgebreide ontbijtbuffet. Vers eitje, luxe broodjes, salade en vers fruit.",
    image: '/images/arrangement/breakfast.jpg',
    highlight: true,
  },
  {
    id: 'inc-welcome',
    icon: 'local_bar',
    title: 'Welkomstdrankje',
    description:
      'Bij aankomst ontvang je een welkomstdrankje om je verblijf in stijl te beginnen.',
  },
  {
    id: 'inc-spa',
    icon: 'spa',
    title: 'Gebruik van wellness en fitness',
    description:
      "Exclusief voor gasten van ViaLuxury! Maak gebruik van de spa, 2 sauna's, Turks stoombad en zonnebank bij Grand Hotel Ter Duin (200m).",
    image: '/images/arrangement/spa.jpg',
  },
  {
    id: 'inc-pool',
    icon: 'pool',
    title: 'Gebruik van zwembad',
    description:
      'Exclusief voor gasten van ViaLuxury! Overdekt zwembad op 200m afstand bij Grand Hotel Ter Duin.',
  },
]

/**
 * Room options shared across deals
 */
const roomOptions: { base: RoomOption; upgrades: RoomOption[] } = {
  base: {
    id: 'room-standard',
    name: 'Standaard Kamer',
    description: 'Comfortabele kamer met alle basisvoorzieningen. Ideaal voor een ontspannen verblijf.',
    image: '/images/rooms/standard.jpg',
    priceExtra: 0,
    isDefault: true,
    features: ['Gratis WiFi', 'Airconditioning', 'Flatscreen TV', 'Badkamer met regendouche'],
  },
  upgrades: [
    {
      id: 'room-superior',
      name: 'Superior Kamer',
      description: 'Ruimere kamer met zithoek en uitzicht op de tuin.',
      image: '/images/rooms/superior.jpg',
      priceExtra: 30,
      isDefault: false,
      features: ['Alles van Standaard', 'Zithoek', 'Uitzicht op de tuin', 'Nespresso apparaat'],
    },
    {
      id: 'room-deluxe',
      name: 'Deluxe Kamer',
      description: 'Luxe kamer met balkon en uitzicht op de duinen.',
      image: '/images/rooms/deluxe.jpg',
      priceExtra: 65,
      isDefault: false,
      features: ['Alles van Superior', 'Privé balkon', 'Uitzicht op de duinen', 'Luxe badproducten'],
    },
    {
      id: 'room-suite',
      name: 'Junior Suite',
      description: 'Ruime suite met aparte woonkamer en premium voorzieningen.',
      image: '/images/rooms/suite.jpg',
      priceExtra: 110,
      isDefault: false,
      features: ['Alles van Deluxe', 'Aparte woonkamer', 'Kingsize bed', 'Premium minibar'],
    },
  ],
}

/**
 * 2-night deal — includes 1x dinner
 */
export const deal2Nights: Deal = {
  id: 'deal-ter-zand-2n',
  hotelSlug: 'ter-zand',
  nights: 2,
  title: '2 nachten Hotel Ter Zand incl. ontbijt & 3-gangendiner',
  subtitle: 'Burgh-Haamstede, Zeeland',
  inclusions: [
    {
      id: 'inc-overnight-2',
      icon: 'hotel',
      title: '2x Overnachting',
      description:
        'Ervaar de rust van de Zeeuwse kust in een stijlvolle en comfortabele kamer. Op loopafstand van strand, bos en duinen.',
      image: '/images/arrangement/overnight.jpg',
    },
    ...sharedInclusions,
    {
      id: 'inc-dinner-2',
      icon: 'restaurant',
      title: 'Culinair 3-gangendiner (1 avond)',
      description:
        'Geniet van een verfijnd 3-gangendiner met verse, seizoensgebonden ingrediënten uit de streek.',
      image: '/images/arrangement/dinner.jpg',
      highlight: true,
    },
  ],
  baseRoomType: roomOptions.base,
  roomUpgrades: roomOptions.upgrades,
  basePrice: 399,
  originalPrice: 498,
  discountPercentage: 20,
  pricePerPerson: 199,
}

/**
 * 3-night deal — includes 2x dinner + bike rental
 */
export const deal3Nights: Deal = {
  id: 'deal-ter-zand-3n',
  hotelSlug: 'ter-zand',
  nights: 3,
  title: '3 nachten Hotel Ter Zand incl. ontbijt, 2x diner & fietsverhuur',
  subtitle: 'Burgh-Haamstede, Zeeland',
  inclusions: [
    {
      id: 'inc-overnight-3',
      icon: 'hotel',
      title: '3x Overnachting',
      description:
        'Drie ontspannen nachten in het hart van de Zeeuwse natuur. Op loopafstand van strand, bos en duinen.',
      image: '/images/arrangement/overnight.jpg',
    },
    ...sharedInclusions,
    {
      id: 'inc-dinner-3',
      icon: 'restaurant',
      title: 'Culinair 3-gangendiner (2 avonden)',
      description:
        'Twee avonden genieten van een verfijnd 3-gangendiner met verse, seizoensgebonden ingrediënten.',
      image: '/images/arrangement/dinner.jpg',
      highlight: true,
    },
    {
      id: 'inc-bike-3',
      icon: 'pedal_bike',
      title: 'Gratis fietsverhuur (1 dag)',
      description:
        'Ontdek de prachtige omgeving op de fiets. Inclusief kaart met de mooiste routes door de duinen.',
      image: '/images/tips/beach.jpg',
    },
  ],
  baseRoomType: roomOptions.base,
  roomUpgrades: roomOptions.upgrades,
  basePrice: 579,
  originalPrice: 724,
  discountPercentage: 20,
  pricePerPerson: 289,
}

/**
 * 4-night deal — includes 2x dinner + bike rental + spa treatment
 */
export const deal4Nights: Deal = {
  id: 'deal-ter-zand-4n',
  hotelSlug: 'ter-zand',
  nights: 4,
  title: '4 nachten Hotel Ter Zand incl. ontbijt, 2x diner, fietsverhuur & spa',
  subtitle: 'Burgh-Haamstede, Zeeland',
  inclusions: [
    {
      id: 'inc-overnight-4',
      icon: 'hotel',
      title: '4x Overnachting',
      description:
        'Vier heerlijke nachten verscholen tussen de duinen. De perfecte uitvalsbasis voor een ontspannen vakantie.',
      image: '/images/arrangement/overnight.jpg',
    },
    ...sharedInclusions,
    {
      id: 'inc-dinner-4',
      icon: 'restaurant',
      title: 'Culinair 3-gangendiner (2 avonden)',
      description:
        'Twee avonden genieten van een verfijnd 3-gangendiner met verse, seizoensgebonden ingrediënten.',
      image: '/images/arrangement/dinner.jpg',
      highlight: true,
    },
    {
      id: 'inc-bike-4',
      icon: 'pedal_bike',
      title: 'Gratis fietsverhuur (2 dagen)',
      description:
        'Twee dagen de omgeving verkennen op de fiets. Inclusief kaart met de mooiste routes.',
    },
    {
      id: 'inc-spa-treatment-4',
      icon: 'spa',
      title: 'Ontspannende spa behandeling',
      description:
        'Een luxe spa behandeling naar keuze bij de wellness van Grand Hotel Ter Duin.',
      image: '/images/extras/spa-treatment.jpg',
      highlight: true,
    },
  ],
  baseRoomType: roomOptions.base,
  roomUpgrades: roomOptions.upgrades,
  basePrice: 749,
  originalPrice: 936,
  discountPercentage: 20,
  pricePerPerson: 374,
}

/**
 * All deal variants for night-switcher display
 */
export const dealVariantsTerZand: DealVariant[] = [
  {
    id: deal2Nights.id,
    nights: 2,
    label: '2 nachten',
    basePrice: deal2Nights.basePrice,
    originalPrice: deal2Nights.originalPrice,
    available: true,
  },
  {
    id: deal3Nights.id,
    nights: 3,
    label: '3 nachten',
    basePrice: deal3Nights.basePrice,
    originalPrice: deal3Nights.originalPrice,
    available: true,
  },
  {
    id: deal4Nights.id,
    nights: 4,
    label: '4 nachten',
    basePrice: deal4Nights.basePrice,
    originalPrice: deal4Nights.originalPrice,
    available: true,
  },
]

/**
 * Lookup deal by ID
 */
export const dealsMap: Record<string, Deal> = {
  [deal2Nights.id]: deal2Nights,
  [deal3Nights.id]: deal3Nights,
  [deal4Nights.id]: deal4Nights,
}

/**
 * Get hotel data (reused from existing mock)
 */
export const hotel = hotelTerZand
