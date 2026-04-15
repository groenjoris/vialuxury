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
    title: { nl: 'Upgrade naar luxer kamertype', en: 'Upgrade to a more luxurious room type' },
    description: {
      nl: 'Bij Hotel Ter Zand maken we je verblijf nog specialer. Je wordt standaard geüpgraded naar een luxer kamertype – zonder extra kosten.',
      en: 'At Hotel Ter Zand we make your stay even more special. You will be upgraded to a more luxurious room type as standard – at no extra cost.',
    },
    image: '/images/arrangement/upgrade.jpg',
  },
  {
    id: 'inc-breakfast',
    icon: 'free_breakfast',
    title: { nl: 'Dagelijks ontbijtbuffet', en: 'Daily breakfast buffet' },
    description: {
      nl: 'Begin de dag goed met het uitgebreide ontbijtbuffet. Vers eitje, luxe broodjes, salade en vers fruit.',
      en: 'Start the day right with the extensive breakfast buffet. Fresh eggs, luxury rolls, salad and fresh fruit.',
    },
    image: '/images/arrangement/breakfast.jpg',
    highlight: true,
  },
  {
    id: 'inc-welcome',
    icon: 'local_bar',
    title: { nl: 'Welkomstdrankje', en: 'Welcome drink' },
    description: {
      nl: 'Bij aankomst ontvang je een welkomstdrankje om je verblijf in stijl te beginnen.',
      en: 'Upon arrival you will receive a welcome drink to start your stay in style.',
    },
  },
  {
    id: 'inc-spa',
    icon: 'spa',
    title: { nl: 'Gebruik van wellness en fitness', en: 'Access to wellness and fitness' },
    description: {
      nl: "Exclusief voor gasten van ViaLuxury! Maak gebruik van de spa, 2 sauna's, Turks stoombad en zonnebank bij Grand Hotel Ter Duin (200m).",
      en: 'Exclusive for ViaLuxury guests! Use the spa, 2 saunas, Turkish steam bath and sunbed at Grand Hotel Ter Duin (200m).',
    },
    image: '/images/arrangement/spa.jpg',
  },
  {
    id: 'inc-pool',
    icon: 'pool',
    title: { nl: 'Gebruik van zwembad', en: 'Access to swimming pool' },
    description: {
      nl: 'Exclusief voor gasten van ViaLuxury! Overdekt zwembad op 200m afstand bij Grand Hotel Ter Duin.',
      en: 'Exclusive for ViaLuxury guests! Indoor swimming pool 200m away at Grand Hotel Ter Duin.',
    },
  },
]

/**
 * Room options shared across deals
 */
const roomOptions: { base: RoomOption; upgrades: RoomOption[] } = {
  base: {
    id: 'room-standard',
    name: { nl: 'Standaard Kamer', en: 'Standard Room' },
    description: {
      nl: 'Comfortabele kamer met alle basisvoorzieningen. Ideaal voor een ontspannen verblijf.',
      en: 'Comfortable room with all basic amenities. Ideal for a relaxing stay.',
    },
    image: '/images/rooms/standard.jpg',
    priceExtra: 0,
    isDefault: true,
    features: [
      { nl: 'Gratis WiFi', en: 'Free WiFi' },
      { nl: 'Airconditioning', en: 'Air conditioning' },
      { nl: 'Flatscreen TV', en: 'Flat-screen TV' },
      { nl: 'Badkamer met regendouche', en: 'Bathroom with rain shower' },
    ],
  },
  upgrades: [
    {
      id: 'room-superior',
      name: { nl: 'Superior Kamer', en: 'Superior Room' },
      description: {
        nl: 'Ruimere kamer met zithoek en uitzicht op de tuin.',
        en: 'More spacious room with seating area and garden view.',
      },
      image: '/images/rooms/superior.jpg',
      priceExtra: 30,
      isDefault: false,
      features: [
        { nl: 'Alles van Standaard', en: 'Everything from Standard' },
        { nl: 'Zithoek', en: 'Seating area' },
        { nl: 'Uitzicht op de tuin', en: 'Garden view' },
        { nl: 'Nespresso apparaat', en: 'Nespresso machine' },
      ],
    },
    {
      id: 'room-deluxe',
      name: { nl: 'Deluxe Kamer', en: 'Deluxe Room' },
      description: {
        nl: 'Luxe kamer met balkon en uitzicht op de duinen.',
        en: 'Luxury room with balcony and dune views.',
      },
      image: '/images/rooms/deluxe.jpg',
      priceExtra: 65,
      isDefault: false,
      features: [
        { nl: 'Alles van Superior', en: 'Everything from Superior' },
        { nl: 'Privé balkon', en: 'Private balcony' },
        { nl: 'Uitzicht op de duinen', en: 'Dune views' },
        { nl: 'Luxe badproducten', en: 'Luxury bath products' },
      ],
    },
    {
      id: 'room-suite',
      name: { nl: 'Junior Suite', en: 'Junior Suite' },
      description: {
        nl: 'Ruime suite met aparte woonkamer en premium voorzieningen.',
        en: 'Spacious suite with separate living room and premium amenities.',
      },
      image: '/images/rooms/suite.jpg',
      priceExtra: 110,
      isDefault: false,
      features: [
        { nl: 'Alles van Deluxe', en: 'Everything from Deluxe' },
        { nl: 'Aparte woonkamer', en: 'Separate living room' },
        { nl: 'Kingsize bed', en: 'King-size bed' },
        { nl: 'Premium minibar', en: 'Premium minibar' },
      ],
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
  title: {
    nl: '2 nachten Hotel Ter Zand incl. ontbijt & 3-gangendiner',
    en: '2 nights Hotel Ter Zand incl. breakfast & 3-course dinner',
  },
  subtitle: { nl: 'Burgh-Haamstede, Zeeland', en: 'Burgh-Haamstede, Zeeland' },
  inclusions: [
    {
      id: 'inc-overnight-2',
      icon: 'hotel',
      title: { nl: '2x Overnachting', en: '2x Overnight stay' },
      description: {
        nl: 'Ervaar de rust van de Zeeuwse kust in een stijlvolle en comfortabele kamer. Op loopafstand van strand, bos en duinen.',
        en: 'Experience the tranquility of the Zeeland coast in a stylish and comfortable room. Within walking distance of the beach, forest and dunes.',
      },
      image: '/images/arrangement/overnight.jpg',
    },
    ...sharedInclusions,
    {
      id: 'inc-dinner-2',
      icon: 'restaurant',
      title: { nl: 'Culinair 3-gangendiner (1 avond)', en: 'Culinary 3-course dinner (1 evening)' },
      description: {
        nl: 'Geniet van een verfijnd 3-gangendiner met verse, seizoensgebonden ingrediënten uit de streek.',
        en: 'Enjoy a refined 3-course dinner with fresh, seasonal ingredients from the region.',
      },
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
  title: {
    nl: '3 nachten Hotel Ter Zand incl. ontbijt, 2x diner & fietsverhuur',
    en: '3 nights Hotel Ter Zand incl. breakfast, 2x dinner & bike rental',
  },
  subtitle: { nl: 'Burgh-Haamstede, Zeeland', en: 'Burgh-Haamstede, Zeeland' },
  inclusions: [
    {
      id: 'inc-overnight-3',
      icon: 'hotel',
      title: { nl: '3x Overnachting', en: '3x Overnight stay' },
      description: {
        nl: 'Drie ontspannen nachten in het hart van de Zeeuwse natuur. Op loopafstand van strand, bos en duinen.',
        en: 'Three relaxing nights in the heart of Zeeland nature. Within walking distance of the beach, forest and dunes.',
      },
      image: '/images/arrangement/overnight.jpg',
    },
    ...sharedInclusions,
    {
      id: 'inc-dinner-3',
      icon: 'restaurant',
      title: { nl: 'Culinair 3-gangendiner (2 avonden)', en: 'Culinary 3-course dinner (2 evenings)' },
      description: {
        nl: 'Twee avonden genieten van een verfijnd 3-gangendiner met verse, seizoensgebonden ingrediënten.',
        en: 'Two evenings enjoying a refined 3-course dinner with fresh, seasonal ingredients.',
      },
      image: '/images/arrangement/dinner.jpg',
      highlight: true,
    },
    {
      id: 'inc-bike-3',
      icon: 'pedal_bike',
      title: { nl: 'Gratis fietsverhuur (1 dag)', en: 'Free bike rental (1 day)' },
      description: {
        nl: 'Ontdek de prachtige omgeving op de fiets. Inclusief kaart met de mooiste routes door de duinen.',
        en: 'Explore the beautiful surroundings by bike. Includes a map with the most scenic routes through the dunes.',
      },
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
  title: {
    nl: '4 nachten Hotel Ter Zand incl. ontbijt, 2x diner, fietsverhuur & spa',
    en: '4 nights Hotel Ter Zand incl. breakfast, 2x dinner, bike rental & spa',
  },
  subtitle: { nl: 'Burgh-Haamstede, Zeeland', en: 'Burgh-Haamstede, Zeeland' },
  inclusions: [
    {
      id: 'inc-overnight-4',
      icon: 'hotel',
      title: { nl: '4x Overnachting', en: '4x Overnight stay' },
      description: {
        nl: 'Vier heerlijke nachten verscholen tussen de duinen. De perfecte uitvalsbasis voor een ontspannen vakantie.',
        en: 'Four wonderful nights tucked away among the dunes. The perfect base for a relaxing holiday.',
      },
      image: '/images/arrangement/overnight.jpg',
    },
    ...sharedInclusions,
    {
      id: 'inc-dinner-4',
      icon: 'restaurant',
      title: { nl: 'Culinair 3-gangendiner (2 avonden)', en: 'Culinary 3-course dinner (2 evenings)' },
      description: {
        nl: 'Twee avonden genieten van een verfijnd 3-gangendiner met verse, seizoensgebonden ingrediënten.',
        en: 'Two evenings enjoying a refined 3-course dinner with fresh, seasonal ingredients.',
      },
      image: '/images/arrangement/dinner.jpg',
      highlight: true,
    },
    {
      id: 'inc-bike-4',
      icon: 'pedal_bike',
      title: { nl: 'Gratis fietsverhuur (2 dagen)', en: 'Free bike rental (2 days)' },
      description: {
        nl: 'Twee dagen de omgeving verkennen op de fiets. Inclusief kaart met de mooiste routes.',
        en: 'Two days exploring the surroundings by bike. Includes a map with the most scenic routes.',
      },
    },
    {
      id: 'inc-spa-treatment-4',
      icon: 'spa',
      title: { nl: 'Ontspannende spa behandeling', en: 'Relaxing spa treatment' },
      description: {
        nl: 'Een luxe spa behandeling naar keuze bij de wellness van Grand Hotel Ter Duin.',
        en: 'A luxury spa treatment of your choice at the wellness centre of Grand Hotel Ter Duin.',
      },
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
    label: { nl: '2 nachten', en: '2 nights' },
    basePrice: deal2Nights.basePrice,
    originalPrice: deal2Nights.originalPrice,
    available: true,
  },
  {
    id: deal3Nights.id,
    nights: 3,
    label: { nl: '3 nachten', en: '3 nights' },
    basePrice: deal3Nights.basePrice,
    originalPrice: deal3Nights.originalPrice,
    available: true,
  },
  {
    id: deal4Nights.id,
    nights: 4,
    label: { nl: '4 nachten', en: '4 nights' },
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
