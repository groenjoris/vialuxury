import type { Hotel } from '~/types/hotel'
import type { Deal, DealVariant } from '~/types/deal'

export const hotelKasteelTerWorm: Hotel = {
  id: 'hotel-kasteel-ter-worm-1',
  slug: 'kasteel-ter-worm',
  name: 'Van der Valk Hotel Kasteel TerWorm',
  starRating: 4,
  location: {
    city: 'Heerlen',
    region: 'Zuid-Limburg',
    country: 'Nederland',
    coordinates: { lat: 50.8882, lng: 5.9814 },
    address: 'Terworm 5, 6411 RV Heerlen',
  },
  description:
    'Welkom bij Van der Valk Hotel Kasteel TerWorm, een exclusief kasteelhotel verscholen in het glooiende landschap van Zuid-Limburg. Dit monumentale kasteel uit de 14e eeuw is met liefde gerestaureerd en biedt een unieke combinatie van historische grandeur en modern comfort. Geniet van de gloednieuwe wellnessfaciliteiten, ontdek de Limburgse heuvels en laat je culinair verrassen in het sfeervolle restaurant.',
  images: [
    { id: 'img-1', url: '/images/kasteel/Kasteel_ter_Worm_08-06-2023_Website-25.jpg', alt: 'Ontbijt in kasteel TerWorm', position: 'hero' },
    { id: 'img-2', url: '/images/kasteel/prachthof-junior-suite.jpg', alt: 'Prachthof Junior Suite met uitzicht op de gracht', position: 'gallery' },
    { id: 'img-3', url: '/images/kasteel/6.jpg', alt: 'Wellness en sauna faciliteiten', position: 'gallery' },
    { id: 'img-4', url: '/images/kasteel/Van_der_Valk_Hotel_Heerlen-Heerlen-Schwimmbad-1-39961.jpg', alt: 'Binnenzwembad', position: 'gallery' },
    { id: 'img-5', url: '/images/kasteel/iStock-1189537172.jpg', alt: 'Glooiend landschap Zuid-Limburg', position: 'gallery' },
  ],
  facilities: [
    { icon: 'spa', label: 'Gloednieuwe wellness' },
    { icon: 'pool', label: 'Binnenzwembad' },
    { icon: 'restaurant', label: 'Culinair restaurant' },
    { icon: 'breakfast', label: 'Ontbijtbuffet' },
    { icon: 'parking', label: 'Gratis parkeren' },
    { icon: 'wifi', label: 'Gratis WiFi' },
    { icon: 'bar', label: 'Kasteelbar' },
    { icon: 'garden', label: 'Kasteeltuin' },
    { icon: 'fitness', label: 'Fitnessruimte' },
    { icon: 'bike', label: 'Fietsverhuur' },
    { icon: 'ev', label: 'Oplaadpunten EV' },
    { icon: 'meeting', label: 'Vergaderzalen' },
  ],
  reviews: {
    overallScore: 4.5,
    totalReviews: 124,
    categories: [
      { name: 'Hygiëne', icon: 'cleaning_services', score: 4.7 },
      { name: 'Service', icon: 'local_activity', score: 4.8 },
      { name: 'Kamers', icon: 'bed', score: 4.6 },
      { name: 'Locatie', icon: 'location_on', score: 4.9 },
      { name: 'Gastronomie', icon: 'restaurant', score: 4.7 },
      { name: 'Aankomst', icon: 'card_travel', score: 4.5 },
    ],
  },
  individualReviews: [
    {
      id: 'rev-1',
      author: 'MarcoB',
      date: '2026-03-15',
      score: 5,
      text: 'Wat een prachtig kasteel! De nieuwe wellness is fantastisch, de kamer had een geweldig uitzicht over het landgoed. Het diner was uitstekend.',
      arrangement: '3-daags verblijf met wellness & diner',
    },
    {
      id: 'rev-2',
      author: 'LisaV',
      date: '2026-03-10',
      score: 5,
      text: 'Perfecte plek voor een romantisch weekendje weg. De welkomstbubbels waren een mooie touch. Zeker aanrader!',
      arrangement: '2-daags verblijf met welkomstbubbels',
    },
    {
      id: 'rev-3',
      author: 'JanK',
      date: '2026-02-28',
      score: 4,
      text: 'Mooi hotel in een historische setting. De wellness is top, het zwembad is gezellig. Alleen de parkeerplaats was wat vol.',
      arrangement: '3-daags verblijf met wellness & diner',
    },
    {
      id: 'rev-4',
      author: 'AnneM',
      date: '2026-02-20',
      score: 5,
      text: 'De combinatie van het kasteel, de omgeving en de faciliteiten is echt uniek. We hebben heerlijk gewandeld in de heuvels en daarna genoten van de sauna.',
      images: ['/images/kasteel/iStock-1189537172.jpg'],
      arrangement: '4-daags verblijf met wellness & diner',
    },
    {
      id: 'rev-5',
      author: 'PeterD',
      date: '2026-02-14',
      score: 4,
      text: 'Goed arrangement via ViaLuxury. Het ontbijt is uitgebreid en lekker. De kamer in het kasteel heeft echt karakter.',
      arrangement: '2-daags verblijf met welkomstbubbels',
    },
    {
      id: 'rev-6',
      author: 'SophieR',
      date: '2026-01-30',
      score: 5,
      text: 'Schitterend! De wellness is splinternieuw en heerlijk. Het diner in het restaurant was van hoog niveau. Komen zeker terug.',
      arrangement: '3-daags verblijf met wellness & diner',
    },
  ],
  nearbyTips: [
    {
      id: 'tip-1',
      title: 'Verken de Kasteeltuinen',
      description: 'Maak een rustgevende wandeling door de uitgestrekte tuinen van Kasteel ter Worm. Bewonder de zorgvuldig onderhouden flora en de schilderachtige vijvers, een perfecte setting voor een ochtend- of namiddagwandeling.',
      image: '/images/kasteel/kasteeltuinen.jpg',
    },
    {
      id: 'tip-2',
      title: 'Bezoek het Thermenmuseum',
      description: 'Ontdek de Romeinse baden van Coriovallum, direct onder het centrum van Heerlen. Dit unieke museum toont de goed bewaarde resten van een Romeins badhuis uit de 1e eeuw na Christus — een fascinerende duik in de lokale geschiedenis.',
      image: '/images/kasteel/thermenmuseum.jpg',
    },
    {
      id: 'tip-3',
      title: 'Fietsen door Zuid-Limburg',
      description: 'Huur een fiets bij het hotel en verken de prachtige heuvels van Zuid-Limburg. Van rustige routes langs vakwerkhuizen en fruitboomgaarden tot uitdagende klimmetjes voor de sportieve fietser — voor elk niveau is er een route.',
      image: '/images/kasteel/fietsenzuidlimburg.jpg',
    },
    {
      id: 'tip-4',
      title: 'Ontdek lokale wijnen',
      description: 'Zuid-Limburg is de enige wijnregio van Nederland. Breng een bezoek aan een van de lokale wijngaarden voor een proeverij en ontdek de verrassend goede wijnen die hier geproduceerd worden op de zonnige hellingen.',
      image: '/images/kasteel/lokalewijnen.jpg',
    },
    {
      id: 'tip-5',
      title: 'Bonnefantenmuseum',
      description: 'Bezoek het Bonnefantenmuseum in Maastricht, op slechts 20 minuten rijden. Dit museum voor oude, moderne en hedendaagse kunst is gehuisvest in een opvallend gebouw ontworpen door Aldo Rossi aan de oevers van de Maas.',
      image: '/images/kasteel/bonnefantenmuseum.jpg',
    },
  ],
  faq: [
    {
      id: 'faq-1',
      question: 'Waar bevindt de wellness zich?',
      answer: 'De gloednieuwe wellness bevindt zich in het Van der Valk Hotel Heerlen, op slechts 5 minuten rijden van Kasteel TerWorm. Je kunt hier gratis gebruik van maken tijdens je verblijf.',
    },
    {
      id: 'faq-2',
      question: 'Is er parkeergelegenheid?',
      answer: 'Ja, er is gratis parkeergelegenheid bij het hotel. Reserveren is niet nodig.',
    },
    {
      id: 'faq-3',
      question: 'Kan ik het arrangement ook in het weekend boeken?',
      answer: 'Ja, het arrangement is ook in het weekend beschikbaar. Op vrijdag en zaterdag kan een toeslag gelden.',
    },
    {
      id: 'faq-4',
      question: 'Zijn huisdieren welkom?',
      answer: 'Ja, huisdieren zijn welkom in het hotel. Er kan een toeslag per nacht gelden.',
    },
    {
      id: 'faq-5',
      question: 'Hoe laat is het inchecken en uitchecken?',
      answer: 'Check-in is vanaf 15:00 uur. Check-out is tot 11:00 uur.',
    },
    {
      id: 'faq-6',
      question: 'Is het arrangement geschikt voor kinderen?',
      answer: 'Het arrangement is primair gericht op volwassenen, maar kinderen zijn welkom. Neem contact op voor de mogelijkheden.',
    },
  ],
}

// --- Package Reviews (separate from hotel reviews) ---
export const packageReviews = [
  {
    id: 'pkg-rev-1',
    author: 'ThomasH',
    date: '2026-03-20',
    score: 5,
    text: 'Super arrangement via ViaLuxury. Alles was perfect geregeld — van de welkomstbubbels tot het diner. De prijs-kwaliteitverhouding is uitstekend.',
  },
  {
    id: 'pkg-rev-2',
    author: 'ElsW',
    date: '2026-03-05',
    score: 5,
    text: 'Dit arrangement is echt een aanrader. De wellness was heerlijk en het ontbijt in het kasteel was bijzonder. Goed geregeld door ViaLuxury.',
  },
  {
    id: 'pkg-rev-3',
    author: 'RobV',
    date: '2026-02-18',
    score: 4,
    text: 'Fijn arrangement. Het hotel is prachtig, de wellness is nieuw en goed. Enige minpunt: het diner had iets meer variatie mogen hebben.',
  },
]

// --- Deal variants ---
export const dealKasteel2Nights: Deal = {
  id: 'deal-kasteel-2n',
  hotelSlug: 'kasteel-ter-worm',
  nights: 2,
  title: '2-daags kasteelverblijf met wellness & culinair diner',
  subtitle: 'Van der Valk Hotel Kasteel TerWorm',
  inclusions: [
    {
      id: 'inc-overnight-2',
      icon: 'hotel',
      title: '2x Overnachting',
      description: 'Bij dit arrangement zit een kamerupgrade naar een van de luxe junior Suites. Deze luxe kamer biedt uitzicht op de gracht rondom het kasteel. De kamer is uitgerust met comfortabele fauteuils en een groot bureau. De kamers bevinden zich op de eerste/tweede etage (enkel per trap te bereiken).',
      image: '/images/kasteel/prachthof-junior-suite.jpg',
    },
    {
      id: 'inc-breakfast-2',
      icon: 'free_breakfast',
      title: 'Dagelijks uitgebreid ontbijtbuffet',
      description: 'Start je dag met een uitgebreid ontbijtbuffet in de sfeervolle ontbijtzaal van het kasteel. Verse broodjes, lokale kazen, vers fruit en warme gerechten.',
      image: '/images/kasteel/Kasteel_ter_Worm_08-06-2023_Website-25.jpg',
      highlight: true,
    },
    {
      id: 'inc-welcome-2',
      icon: 'local_bar',
      title: 'Welkomstbubbels bij aankomst',
      description: 'Bij aankomst word je verwelkomd met een glas bubbels in de kasteelbar. De perfecte start van je verblijf.',
      image: '/images/kasteel/welkomstbubbels.jpg',
    },
    {
      id: 'inc-wellness-2',
      icon: 'spa',
      title: 'Toegang tot gloednieuwe wellness',
      description: 'Geniet van de splinternieuwe wellnessfaciliteiten in het nabijgelegen Van der Valk Hotel Heerlen. Diverse sauna\'s, een zoutwand en ontspanningsruimten.',
      image: '/images/kasteel/6.jpg',
      highlight: true,
    },
    {
      id: 'inc-pool-2',
      icon: 'pool',
      title: 'Gebruik van binnenzwembad',
      description: 'Verwen jezelf met een duik in het sfeervolle binnenzwembad met waterval, gelegen in het nabijgelegen Van der Valk Hotel Heerlen.',
      image: '/images/kasteel/Van_der_Valk_Hotel_Heerlen-Heerlen-Schwimmbad-1-39961.jpg',
    },
    {
      id: 'inc-dinner-2',
      icon: 'restaurant',
      title: 'Culinair 3-gangendiner (1 avond)',
      description: 'Geniet van een verfijnd 3-gangendiner in het restaurant van Kasteel TerWorm, bereid met verse seizoensproducten uit de regio.',
      image: '/images/kasteel/diner-terworm.jpg',
      highlight: true,
    },
  ],
  baseRoomType: {
    id: 'room-kasteel-std',
    name: 'De Prachthof Junior Suite',
    description: 'De Prachthof Junior Suite van ca. 45m² met uitzicht op de gracht rondom het kasteel.',
    image: '/images/kasteel/prachthof-junior-suite.jpg',
    priceExtra: 0,
    isDefault: true,
    isUpgrade: true,
    features: ['2x eenpersoonsbed', 'Bureau en zithoek', 'Telefoon', 'Föhn', 'Ligbad', 'Koffie- en theefaciliteiten'],
  },
  roomUpgrades: [
    {
      id: 'room-kasteel-junior',
      name: 'Kasteel Junior Suite',
      description: 'Geniet van luxe en ruimte in de Kasteel Junior Suite van Kasteel TerWorm. Met elegant interieur, comfortabele zithoek en prachtig uitzicht op de kasteeltuinen biedt deze suite een verfijnde ervaring.',
      image: '/images/kasteel/kasteel-junior-suite.jpg',
      priceExtra: 99,
      isDefault: false,
      features: ['Elegant interieur', 'Comfortabele zithoek', 'Ruime badkamer met moderne voorzieningen', 'Prachtig uitzicht op de kasteeltuinen'],
    },
    {
      id: 'room-kasteel-baron',
      name: 'Baronsuite',
      description: 'Ervaar ongeëvenaarde luxe en elegantie in de Baronsuite van Kasteel TerWorm. Deze statige suite biedt een weelderig interieur en een verfijnde sfeer, perfect voor een onvergetelijk verblijf.',
      image: '/images/kasteel/baronsuite.jpg',
      priceExtra: 198,
      isDefault: false,
      features: ['Ruime zit- en slaapruimte', 'Luxe kingsize bed', 'Elegante en klassieke inrichting', 'Nespresso-koffiemachine', 'Flatscreen TV', 'Gratis Wi-Fi', 'Minibar', 'Luxe badkamer met inloopdouche, bad en badjassen'],
    },
  ],
  basePrice: 299,
  originalPrice: 449,
  discountPercentage: 33,
  pricePerPerson: 149,
}

export const dealKasteel3Nights: Deal = {
  id: 'deal-kasteel-3n',
  hotelSlug: 'kasteel-ter-worm',
  nights: 3,
  title: '3-daags verblijf met gloednieuwe wellness in een exclusief kasteelhotel in Zuid-Limburg',
  subtitle: 'Van der Valk Hotel Kasteel TerWorm',
  inclusions: [
    {
      id: 'inc-overnight-3',
      icon: 'hotel',
      title: '3x Overnachting',
      description: 'Bij dit arrangement zit een kamerupgrade naar een van de luxe junior Suites. Deze luxe kamer biedt uitzicht op de gracht rondom het kasteel. De kamer is uitgerust met comfortabele fauteuils en een groot bureau. De kamers bevinden zich op de eerste/tweede etage (enkel per trap te bereiken).',
      image: '/images/kasteel/prachthof-junior-suite.jpg',
    },
    {
      id: 'inc-breakfast-3',
      icon: 'free_breakfast',
      title: 'Dagelijks uitgebreid ontbijtbuffet',
      description: 'Start elke dag met een uitgebreid ontbijtbuffet in de sfeervolle ontbijtzaal van het kasteel. Verse broodjes, lokale kazen, vers fruit en warme gerechten.',
      image: '/images/kasteel/Kasteel_ter_Worm_08-06-2023_Website-25.jpg',
      highlight: true,
    },
    {
      id: 'inc-welcome-3',
      icon: 'local_bar',
      title: 'Welkomstbubbels bij aankomst',
      description: 'Bij aankomst word je verwelkomd met een glas bubbels in de kasteelbar. De perfecte start van je kasteelverblijf.',
      image: '/images/kasteel/welkomstbubbels.jpg',
    },
    {
      id: 'inc-wellness-3',
      icon: 'spa',
      title: 'Toegang tot gloednieuwe wellness',
      description: 'Geniet onbeperkt van de splinternieuwe wellnessfaciliteiten in het nabijgelegen Van der Valk Hotel Heerlen. Diverse sauna\'s, een zoutwand, infraroodcabines en ontspanningsruimten.',
      image: '/images/kasteel/6.jpg',
      highlight: true,
    },
    {
      id: 'inc-pool-3',
      icon: 'pool',
      title: 'Gebruik van binnenzwembad',
      description: 'Verwen jezelf met een duik in het sfeervolle binnenzwembad met waterval, gelegen in het nabijgelegen Van der Valk Hotel Heerlen.',
      image: '/images/kasteel/Van_der_Valk_Hotel_Heerlen-Heerlen-Schwimmbad-1-39961.jpg',
    },
    {
      id: 'inc-dinner-3',
      icon: 'restaurant',
      title: 'Culinair 3-gangendiner (2 avonden)',
      description: 'Twee avonden genieten van een verfijnd 3-gangendiner in het restaurant van Kasteel TerWorm, bereid met verse seizoensproducten uit de regio.',
      image: '/images/kasteel/diner-terworm.jpg',
      highlight: true,
    },
  ],
  baseRoomType: dealKasteel2Nights.baseRoomType,
  roomUpgrades: dealKasteel2Nights.roomUpgrades,
  basePrice: 449,
  originalPrice: 669,
  discountPercentage: 33,
  pricePerPerson: 224,
}

export const dealKasteel4Nights: Deal = {
  id: 'deal-kasteel-4n',
  hotelSlug: 'kasteel-ter-worm',
  nights: 4,
  title: '4-daags luxe kasteelverblijf met wellness, 2x diner & fietsverhuur',
  subtitle: 'Van der Valk Hotel Kasteel TerWorm',
  inclusions: [
    ...dealKasteel3Nights.inclusions.map(inc => {
      if (inc.id === 'inc-overnight-3') return { ...inc, id: 'inc-overnight-4', title: '4x Overnachting' }
      return inc
    }),
    {
      id: 'inc-bike-4',
      icon: 'pedal_bike',
      title: 'Gratis fietsverhuur (1 dag)',
      description: 'Ontdek de prachtige Limburgse heuvels op de fiets. Inclusief routekaart met de mooiste routes door het Heuvelland.',
    },
  ],
  baseRoomType: dealKasteel2Nights.baseRoomType,
  roomUpgrades: dealKasteel2Nights.roomUpgrades,
  basePrice: 579,
  originalPrice: 864,
  discountPercentage: 33,
  pricePerPerson: 289,
}

export const dealVariantsKasteel: DealVariant[] = [
  { id: dealKasteel2Nights.id, nights: 2, label: '2 nachten', basePrice: dealKasteel2Nights.basePrice, originalPrice: dealKasteel2Nights.originalPrice, available: true },
  { id: dealKasteel3Nights.id, nights: 3, label: '3 nachten', basePrice: dealKasteel3Nights.basePrice, originalPrice: dealKasteel3Nights.originalPrice, available: true },
  { id: dealKasteel4Nights.id, nights: 4, label: '4 nachten', basePrice: dealKasteel4Nights.basePrice, originalPrice: dealKasteel4Nights.originalPrice, available: true },
]

export const dealsMapKasteel: Record<string, Deal> = {
  [dealKasteel2Nights.id]: dealKasteel2Nights,
  [dealKasteel3Nights.id]: dealKasteel3Nights,
  [dealKasteel4Nights.id]: dealKasteel4Nights,
}
