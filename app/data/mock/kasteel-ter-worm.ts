import type { Hotel } from '~/types/hotel'
import type { Deal, DealVariant } from '~/types/deal'
import type { LocalizedString } from '~/i18n/types'

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
  description: {
    nl: 'Welkom bij Van der Valk Hotel Kasteel TerWorm, een exclusief kasteelhotel verscholen in het glooiende landschap van Zuid-Limburg. Dit monumentale kasteel uit de 14e eeuw is met liefde gerestaureerd en biedt een unieke combinatie van historische grandeur en modern comfort. Geniet van de gloednieuwe wellnessfaciliteiten, ontdek de Limburgse heuvels en laat je culinair verrassen in het sfeervolle restaurant.',
    en: 'Welcome to Van der Valk Hotel Kasteel TerWorm, an exclusive castle hotel nestled in the rolling landscape of South Limburg. This monumental 14th-century castle has been lovingly restored and offers a unique combination of historic grandeur and modern comfort. Enjoy the brand-new wellness facilities, explore the Limburg hills and be surprised by the culinary delights of the atmospheric restaurant.',
  },
  images: [
    { id: 'img-1', url: '/images/kasteel/Kasteel_ter_Worm_08-06-2023_Website-25.jpg', alt: { nl: 'Ontbijt in kasteel TerWorm', en: 'Breakfast at castle TerWorm' }, position: 'hero' },
    { id: 'img-2', url: '/images/kasteel/prachthof-junior-suite.jpg', alt: { nl: 'Prachthof Junior Suite met uitzicht op de gracht', en: 'Prachthof Junior Suite with view of the moat' }, position: 'gallery' },
    { id: 'img-3', url: '/images/kasteel/6.jpg', alt: { nl: 'Wellness en sauna faciliteiten', en: 'Wellness and sauna facilities' }, position: 'gallery' },
    { id: 'img-4', url: '/images/kasteel/Van_der_Valk_Hotel_Heerlen-Heerlen-Schwimmbad-1-39961.jpg', alt: { nl: 'Binnenzwembad', en: 'Indoor swimming pool' }, position: 'gallery' },
    { id: 'img-5', url: '/images/kasteel/iStock-1189537172.jpg', alt: { nl: 'Glooiend landschap Zuid-Limburg', en: 'Rolling landscape of South Limburg' }, position: 'gallery' },
  ],
  facilities: [
    { icon: 'spa', label: { nl: 'Gloednieuwe wellness', en: 'Brand-new wellness' } },
    { icon: 'pool', label: { nl: 'Binnenzwembad', en: 'Indoor swimming pool' } },
    { icon: 'restaurant', label: { nl: 'Culinair restaurant', en: 'Fine dining restaurant' } },
    { icon: 'breakfast', label: { nl: 'Ontbijtbuffet', en: 'Breakfast buffet' } },
    { icon: 'parking', label: { nl: 'Gratis parkeren', en: 'Free parking' } },
    { icon: 'wifi', label: { nl: 'Gratis WiFi', en: 'Free WiFi' } },
    { icon: 'bar', label: { nl: 'Kasteelbar', en: 'Castle bar' } },
    { icon: 'garden', label: { nl: 'Kasteeltuin', en: 'Castle garden' } },
    { icon: 'fitness', label: { nl: 'Fitnessruimte', en: 'Fitness room' } },
    { icon: 'bike', label: { nl: 'Fietsverhuur', en: 'Bicycle rental' } },
    { icon: 'ev', label: { nl: 'Oplaadpunten EV', en: 'EV charging points' } },
    { icon: 'meeting', label: { nl: 'Vergaderzalen', en: 'Meeting rooms' } },
  ],
  reviews: {
    overallScore: 4.5,
    totalReviews: 124,
    categories: [
      { name: { nl: 'Hygiëne', en: 'Hygiene' }, icon: 'cleaning_services', score: 4.7 },
      { name: { nl: 'Service', en: 'Service' }, icon: 'local_activity', score: 4.8 },
      { name: { nl: 'Kamers', en: 'Rooms' }, icon: 'bed', score: 4.6 },
      { name: { nl: 'Locatie', en: 'Location' }, icon: 'location_on', score: 4.9 },
      { name: { nl: 'Gastronomie', en: 'Gastronomy' }, icon: 'restaurant', score: 4.7 },
      { name: { nl: 'Aankomst', en: 'Check-in' }, icon: 'card_travel', score: 4.5 },
    ],
  },
  individualReviews: [
    {
      id: 'rev-1',
      author: 'MarcoB',
      date: '2026-03-15',
      score: 5,
      text: {
        nl: 'Wat een prachtig kasteel! De nieuwe wellness is fantastisch, de kamer had een geweldig uitzicht over het landgoed. Het diner was uitstekend.',
        en: 'What a beautiful castle! The new wellness is fantastic, the room had an amazing view over the estate. The dinner was excellent.',
      },
      arrangement: { nl: '3-daags verblijf met wellness & diner', en: '3-day stay with wellness & dinner' },
    },
    {
      id: 'rev-2',
      author: 'LisaV',
      date: '2026-03-10',
      score: 5,
      text: {
        nl: 'Perfecte plek voor een romantisch weekendje weg. De welkomstbubbels waren een mooie touch. Zeker aanrader!',
        en: 'Perfect spot for a romantic weekend getaway. The welcome bubbles were a nice touch. Highly recommended!',
      },
      arrangement: { nl: '2-daags verblijf met welkomstbubbels', en: '2-day stay with welcome bubbles' },
    },
    {
      id: 'rev-3',
      author: 'JanK',
      date: '2026-02-28',
      score: 4,
      text: {
        nl: 'Mooi hotel in een historische setting. De wellness is top, het zwembad is gezellig. Alleen de parkeerplaats was wat vol.',
        en: 'Beautiful hotel in a historic setting. The wellness is top-notch, the pool is lovely. Only the parking lot was a bit full.',
      },
      arrangement: { nl: '3-daags verblijf met wellness & diner', en: '3-day stay with wellness & dinner' },
    },
    {
      id: 'rev-4',
      author: 'AnneM',
      date: '2026-02-20',
      score: 5,
      text: {
        nl: 'De combinatie van het kasteel, de omgeving en de faciliteiten is echt uniek. We hebben heerlijk gewandeld in de heuvels en daarna genoten van de sauna.',
        en: 'The combination of the castle, the surroundings and the facilities is truly unique. We had wonderful walks in the hills and then enjoyed the sauna.',
      },
      images: ['/images/kasteel/iStock-1189537172.jpg'],
      arrangement: { nl: '4-daags verblijf met wellness & diner', en: '4-day stay with wellness & dinner' },
    },
    {
      id: 'rev-5',
      author: 'PeterD',
      date: '2026-02-14',
      score: 4,
      text: {
        nl: 'Goed arrangement via ViaLuxury. Het ontbijt is uitgebreid en lekker. De kamer in het kasteel heeft echt karakter.',
        en: 'Great package via ViaLuxury. The breakfast is extensive and delicious. The room in the castle has real character.',
      },
      arrangement: { nl: '2-daags verblijf met welkomstbubbels', en: '2-day stay with welcome bubbles' },
    },
    {
      id: 'rev-6',
      author: 'SophieR',
      date: '2026-01-30',
      score: 5,
      text: {
        nl: 'Schitterend! De wellness is splinternieuw en heerlijk. Het diner in het restaurant was van hoog niveau. Komen zeker terug.',
        en: 'Gorgeous! The wellness is brand new and wonderful. The dinner in the restaurant was of a high standard. We will definitely return.',
      },
      arrangement: { nl: '3-daags verblijf met wellness & diner', en: '3-day stay with wellness & dinner' },
    },
  ],
  nearbyTips: [
    {
      id: 'tip-1',
      title: { nl: 'Verken de Kasteeltuinen', en: 'Explore the Castle Gardens' },
      description: {
        nl: 'Maak een rustgevende wandeling door de uitgestrekte tuinen van Kasteel ter Worm. Bewonder de zorgvuldig onderhouden flora en de schilderachtige vijvers, een perfecte setting voor een ochtend- of namiddagwandeling.',
        en: 'Take a relaxing stroll through the extensive gardens of Kasteel ter Worm. Admire the carefully maintained flora and the picturesque ponds, a perfect setting for a morning or afternoon walk.',
      },
      image: '/images/kasteel/kasteeltuinen.jpg',
    },
    {
      id: 'tip-2',
      title: { nl: 'Bezoek het Thermenmuseum', en: 'Visit the Thermenmuseum' },
      description: {
        nl: 'Ontdek de Romeinse baden van Coriovallum, direct onder het centrum van Heerlen. Dit unieke museum toont de goed bewaarde resten van een Romeins badhuis uit de 1e eeuw na Christus — een fascinerende duik in de lokale geschiedenis.',
        en: 'Discover the Roman baths of Coriovallum, right beneath the centre of Heerlen. This unique museum displays the well-preserved remains of a 1st-century Roman bathhouse — a fascinating dive into local history.',
      },
      image: '/images/kasteel/thermenmuseum.jpg',
    },
    {
      id: 'tip-3',
      title: { nl: 'Fietsen door Zuid-Limburg', en: 'Cycling through South Limburg' },
      description: {
        nl: 'Huur een fiets bij het hotel en verken de prachtige heuvels van Zuid-Limburg. Van rustige routes langs vakwerkhuizen en fruitboomgaarden tot uitdagende klimmetjes voor de sportieve fietser — voor elk niveau is er een route.',
        en: 'Rent a bicycle at the hotel and explore the beautiful hills of South Limburg. From peaceful routes past half-timbered houses and orchards to challenging climbs for the sporty cyclist — there is a route for every level.',
      },
      image: '/images/kasteel/fietsenzuidlimburg.jpg',
    },
    {
      id: 'tip-4',
      title: { nl: 'Ontdek lokale wijnen', en: 'Discover local wines' },
      description: {
        nl: 'Zuid-Limburg is de enige wijnregio van Nederland. Breng een bezoek aan een van de lokale wijngaarden voor een proeverij en ontdek de verrassend goede wijnen die hier geproduceerd worden op de zonnige hellingen.',
        en: 'South Limburg is the only wine region in the Netherlands. Visit one of the local vineyards for a tasting and discover the surprisingly fine wines produced here on the sunny slopes.',
      },
      image: '/images/kasteel/lokalewijnen.jpg',
    },
    {
      id: 'tip-5',
      title: { nl: 'Bonnefantenmuseum', en: 'Bonnefantenmuseum' },
      description: {
        nl: 'Bezoek het Bonnefantenmuseum in Maastricht, op slechts 20 minuten rijden. Dit museum voor oude, moderne en hedendaagse kunst is gehuisvest in een opvallend gebouw ontworpen door Aldo Rossi aan de oevers van de Maas.',
        en: 'Visit the Bonnefantenmuseum in Maastricht, just a 20-minute drive away. This museum of old, modern and contemporary art is housed in a striking building designed by Aldo Rossi on the banks of the Meuse.',
      },
      image: '/images/kasteel/bonnefantenmuseum.jpg',
    },
  ],
  faq: [
    {
      id: 'faq-1',
      question: { nl: 'Waar bevindt de wellness zich?', en: 'Where is the wellness located?' },
      answer: {
        nl: 'De gloednieuwe wellness bevindt zich in het Van der Valk Hotel Heerlen, op slechts 5 minuten rijden van Kasteel TerWorm. Je kunt hier gratis gebruik van maken tijdens je verblijf.',
        en: 'The brand-new wellness is located at Van der Valk Hotel Heerlen, just a 5-minute drive from Kasteel TerWorm. You can use it free of charge during your stay.',
      },
    },
    {
      id: 'faq-2',
      question: { nl: 'Is er parkeergelegenheid?', en: 'Is there parking available?' },
      answer: {
        nl: 'Ja, er is gratis parkeergelegenheid bij het hotel. Reserveren is niet nodig.',
        en: 'Yes, there is free parking at the hotel. No reservation is required.',
      },
    },
    {
      id: 'faq-3',
      question: { nl: 'Kan ik het arrangement ook in het weekend boeken?', en: 'Can I book the package on weekends as well?' },
      answer: {
        nl: 'Ja, het arrangement is ook in het weekend beschikbaar. Op vrijdag en zaterdag kan een toeslag gelden.',
        en: 'Yes, the package is also available on weekends. A surcharge may apply on Fridays and Saturdays.',
      },
    },
    {
      id: 'faq-4',
      question: { nl: 'Zijn huisdieren welkom?', en: 'Are pets welcome?' },
      answer: {
        nl: 'Ja, huisdieren zijn welkom in het hotel. Er kan een toeslag per nacht gelden.',
        en: 'Yes, pets are welcome at the hotel. A surcharge per night may apply.',
      },
    },
    {
      id: 'faq-5',
      question: { nl: 'Hoe laat is het inchecken en uitchecken?', en: 'What are the check-in and check-out times?' },
      answer: {
        nl: 'Check-in is vanaf 15:00 uur. Check-out is tot 11:00 uur.',
        en: 'Check-in is from 3:00 PM. Check-out is until 11:00 AM.',
      },
    },
    {
      id: 'faq-6',
      question: { nl: 'Is het arrangement geschikt voor kinderen?', en: 'Is the package suitable for children?' },
      answer: {
        nl: 'Het arrangement is primair gericht op volwassenen, maar kinderen zijn welkom. Neem contact op voor de mogelijkheden.',
        en: 'The package is primarily aimed at adults, but children are welcome. Please contact us for options.',
      },
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
  title: { nl: '2-daags kasteelverblijf met wellness & culinair diner', en: '2-day castle stay with wellness & fine dining dinner' },
  subtitle: { nl: 'Van der Valk Hotel Kasteel TerWorm', en: 'Van der Valk Hotel Kasteel TerWorm' },
  inclusions: [
    {
      id: 'inc-overnight-2',
      icon: 'hotel',
      title: { nl: '2x Overnachting', en: '2x Overnight stay' },
      description: {
        nl: 'Bij dit arrangement zit een kamerupgrade naar een van de luxe junior Suites. Deze luxe kamer biedt uitzicht op de gracht rondom het kasteel. De kamer is uitgerust met comfortabele fauteuils en een groot bureau. De kamers bevinden zich op de eerste/tweede etage (enkel per trap te bereiken).',
        en: 'This package includes a room upgrade to one of the luxurious Junior Suites. This elegant room offers a view of the moat surrounding the castle. The room is equipped with comfortable armchairs and a large desk. The rooms are located on the first/second floor (accessible by stairs only).',
      },
      image: '/images/kasteel/prachthof-junior-suite.jpg',
    },
    {
      id: 'inc-breakfast-2',
      icon: 'free_breakfast',
      title: { nl: 'Dagelijks uitgebreid ontbijtbuffet', en: 'Daily extensive breakfast buffet' },
      description: {
        nl: 'Start je dag met een uitgebreid ontbijtbuffet in de sfeervolle ontbijtzaal van het kasteel. Verse broodjes, lokale kazen, vers fruit en warme gerechten.',
        en: 'Start your day with an extensive breakfast buffet in the atmospheric breakfast hall of the castle. Fresh bread rolls, local cheeses, fresh fruit and hot dishes.',
      },
      image: '/images/kasteel/Kasteel_ter_Worm_08-06-2023_Website-25.jpg',
      highlight: true,
    },
    {
      id: 'inc-welcome-2',
      icon: 'local_bar',
      title: { nl: 'Welkomstbubbels bij aankomst', en: 'Welcome bubbles on arrival' },
      description: {
        nl: 'Bij aankomst word je verwelkomd met een glas bubbels in de kasteelbar. De perfecte start van je verblijf.',
        en: 'Upon arrival you will be welcomed with a glass of bubbles in the castle bar. The perfect start to your stay.',
      },
      image: '/images/kasteel/welkomstbubbels.jpg',
    },
    {
      id: 'inc-wellness-2',
      icon: 'spa',
      title: { nl: 'Toegang tot gloednieuwe wellness', en: 'Access to brand-new wellness' },
      description: {
        nl: 'Geniet van de splinternieuwe wellnessfaciliteiten in het nabijgelegen Van der Valk Hotel Heerlen. Diverse sauna\'s, een zoutwand en ontspanningsruimten.',
        en: 'Enjoy the brand-new wellness facilities at the nearby Van der Valk Hotel Heerlen. Various saunas, a salt wall and relaxation areas.',
      },
      image: '/images/kasteel/6.jpg',
      highlight: true,
    },
    {
      id: 'inc-pool-2',
      icon: 'pool',
      title: { nl: 'Gebruik van binnenzwembad', en: 'Use of indoor swimming pool' },
      description: {
        nl: 'Verwen jezelf met een duik in het sfeervolle binnenzwembad met waterval, gelegen in het nabijgelegen Van der Valk Hotel Heerlen.',
        en: 'Treat yourself to a dip in the atmospheric indoor swimming pool with waterfall, located at the nearby Van der Valk Hotel Heerlen.',
      },
      image: '/images/kasteel/Van_der_Valk_Hotel_Heerlen-Heerlen-Schwimmbad-1-39961.jpg',
    },
    {
      id: 'inc-dinner-2',
      icon: 'restaurant',
      title: { nl: 'Culinair 3-gangendiner (1 avond)', en: 'Fine dining 3-course dinner (1 evening)' },
      description: {
        nl: 'Geniet van een verfijnd 3-gangendiner in het restaurant van Kasteel TerWorm, bereid met verse seizoensproducten uit de regio.',
        en: 'Enjoy a refined 3-course dinner at the restaurant of Kasteel TerWorm, prepared with fresh seasonal produce from the region.',
      },
      image: '/images/kasteel/diner-terworm.jpg',
      highlight: true,
    },
  ],
  baseRoomType: {
    id: 'room-kasteel-std',
    name: { nl: 'De Prachthof Junior Suite', en: 'The Prachthof Junior Suite' },
    description: {
      nl: 'De Prachthof Junior Suite van ca. 45m² met uitzicht op de gracht rondom het kasteel.',
      en: 'The Prachthof Junior Suite of approx. 45m² with a view of the moat surrounding the castle.',
    },
    image: '/images/kasteel/prachthof-junior-suite.jpg',
    priceExtra: 0,
    isDefault: true,
    isUpgrade: true,
    features: [
      { nl: '2x eenpersoonsbed', en: '2x single bed' },
      { nl: 'Bureau en zithoek', en: 'Desk and seating area' },
      { nl: 'Telefoon', en: 'Telephone' },
      { nl: 'Föhn', en: 'Hair dryer' },
      { nl: 'Ligbad', en: 'Bathtub' },
      { nl: 'Koffie- en theefaciliteiten', en: 'Coffee and tea facilities' },
    ],
  },
  roomUpgrades: [
    {
      id: 'room-kasteel-junior',
      name: { nl: 'Kasteel Junior Suite', en: 'Castle Junior Suite' },
      description: {
        nl: 'Geniet van luxe en ruimte in de Kasteel Junior Suite van Kasteel TerWorm. Met elegant interieur, comfortabele zithoek en prachtig uitzicht op de kasteeltuinen biedt deze suite een verfijnde ervaring.',
        en: 'Enjoy luxury and space in the Castle Junior Suite at Kasteel TerWorm. With elegant interiors, a comfortable seating area and beautiful views of the castle gardens, this suite offers a refined experience.',
      },
      image: '/images/kasteel/kasteel-junior-suite.jpg',
      priceExtra: 99,
      isDefault: false,
      features: [
        { nl: 'Elegant interieur', en: 'Elegant interior' },
        { nl: 'Comfortabele zithoek', en: 'Comfortable seating area' },
        { nl: 'Ruime badkamer met moderne voorzieningen', en: 'Spacious bathroom with modern amenities' },
        { nl: 'Prachtig uitzicht op de kasteeltuinen', en: 'Beautiful view of the castle gardens' },
      ],
    },
    {
      id: 'room-kasteel-baron',
      name: { nl: 'Baronsuite', en: 'Baron Suite' },
      description: {
        nl: 'Ervaar ongeëvenaarde luxe en elegantie in de Baronsuite van Kasteel TerWorm. Deze statige suite biedt een weelderig interieur en een verfijnde sfeer, perfect voor een onvergetelijk verblijf.',
        en: 'Experience unparalleled luxury and elegance in the Baron Suite at Kasteel TerWorm. This stately suite features a lavish interior and a refined atmosphere, perfect for an unforgettable stay.',
      },
      image: '/images/kasteel/baronsuite.jpg',
      priceExtra: 198,
      isDefault: false,
      features: [
        { nl: 'Ruime zit- en slaapruimte', en: 'Spacious living and sleeping area' },
        { nl: 'Luxe kingsize bed', en: 'Luxury king-size bed' },
        { nl: 'Elegante en klassieke inrichting', en: 'Elegant and classic furnishing' },
        { nl: 'Nespresso-koffiemachine', en: 'Nespresso coffee machine' },
        { nl: 'Flatscreen TV', en: 'Flat-screen TV' },
        { nl: 'Gratis Wi-Fi', en: 'Free Wi-Fi' },
        { nl: 'Minibar', en: 'Minibar' },
        { nl: 'Luxe badkamer met inloopdouche, bad en badjassen', en: 'Luxury bathroom with walk-in shower, bath and bathrobes' },
      ],
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
  title: { nl: '3-daags verblijf met gloednieuwe wellness in een exclusief kasteelhotel in Zuid-Limburg', en: '3-day stay with brand-new wellness at an exclusive castle hotel in South Limburg' },
  subtitle: { nl: 'Van der Valk Hotel Kasteel TerWorm', en: 'Van der Valk Hotel Kasteel TerWorm' },
  inclusions: [
    {
      id: 'inc-overnight-3',
      icon: 'hotel',
      title: { nl: '3x Overnachting', en: '3x Overnight stay' },
      description: {
        nl: 'Bij dit arrangement zit een kamerupgrade naar een van de luxe junior Suites. Deze luxe kamer biedt uitzicht op de gracht rondom het kasteel. De kamer is uitgerust met comfortabele fauteuils en een groot bureau. De kamers bevinden zich op de eerste/tweede etage (enkel per trap te bereiken).',
        en: 'This package includes a room upgrade to one of the luxurious Junior Suites. This elegant room offers a view of the moat surrounding the castle. The room is equipped with comfortable armchairs and a large desk. The rooms are located on the first/second floor (accessible by stairs only).',
      },
      image: '/images/kasteel/prachthof-junior-suite.jpg',
    },
    {
      id: 'inc-breakfast-3',
      icon: 'free_breakfast',
      title: { nl: 'Dagelijks uitgebreid ontbijtbuffet', en: 'Daily extensive breakfast buffet' },
      description: {
        nl: 'Start elke dag met een uitgebreid ontbijtbuffet in de sfeervolle ontbijtzaal van het kasteel. Verse broodjes, lokale kazen, vers fruit en warme gerechten.',
        en: 'Start each day with an extensive breakfast buffet in the atmospheric breakfast hall of the castle. Fresh bread rolls, local cheeses, fresh fruit and hot dishes.',
      },
      image: '/images/kasteel/Kasteel_ter_Worm_08-06-2023_Website-25.jpg',
      highlight: true,
    },
    {
      id: 'inc-welcome-3',
      icon: 'local_bar',
      title: { nl: 'Welkomstbubbels bij aankomst', en: 'Welcome bubbles on arrival' },
      description: {
        nl: 'Bij aankomst word je verwelkomd met een glas bubbels in de kasteelbar. De perfecte start van je kasteelverblijf.',
        en: 'Upon arrival you will be welcomed with a glass of bubbles in the castle bar. The perfect start to your castle stay.',
      },
      image: '/images/kasteel/welkomstbubbels.jpg',
    },
    {
      id: 'inc-wellness-3',
      icon: 'spa',
      title: { nl: 'Toegang tot gloednieuwe wellness', en: 'Access to brand-new wellness' },
      description: {
        nl: 'Geniet onbeperkt van de splinternieuwe wellnessfaciliteiten in het nabijgelegen Van der Valk Hotel Heerlen. Diverse sauna\'s, een zoutwand, infraroodcabines en ontspanningsruimten.',
        en: 'Enjoy unlimited access to the brand-new wellness facilities at the nearby Van der Valk Hotel Heerlen. Various saunas, a salt wall, infrared cabins and relaxation areas.',
      },
      image: '/images/kasteel/6.jpg',
      highlight: true,
    },
    {
      id: 'inc-pool-3',
      icon: 'pool',
      title: { nl: 'Gebruik van binnenzwembad', en: 'Use of indoor swimming pool' },
      description: {
        nl: 'Verwen jezelf met een duik in het sfeervolle binnenzwembad met waterval, gelegen in het nabijgelegen Van der Valk Hotel Heerlen.',
        en: 'Treat yourself to a dip in the atmospheric indoor swimming pool with waterfall, located at the nearby Van der Valk Hotel Heerlen.',
      },
      image: '/images/kasteel/Van_der_Valk_Hotel_Heerlen-Heerlen-Schwimmbad-1-39961.jpg',
    },
    {
      id: 'inc-dinner-3',
      icon: 'restaurant',
      title: { nl: 'Culinair 3-gangendiner (2 avonden)', en: 'Fine dining 3-course dinner (2 evenings)' },
      description: {
        nl: 'Twee avonden genieten van een verfijnd 3-gangendiner in het restaurant van Kasteel TerWorm, bereid met verse seizoensproducten uit de regio.',
        en: 'Two evenings of enjoying a refined 3-course dinner at the restaurant of Kasteel TerWorm, prepared with fresh seasonal produce from the region.',
      },
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
  title: { nl: '4-daags luxe kasteelverblijf met wellness, 2x diner & fietsverhuur', en: '4-day luxury castle stay with wellness, 2x dinner & bicycle rental' },
  subtitle: { nl: 'Van der Valk Hotel Kasteel TerWorm', en: 'Van der Valk Hotel Kasteel TerWorm' },
  inclusions: [
    ...dealKasteel3Nights.inclusions.map(inc => {
      if (inc.id === 'inc-overnight-3') return { ...inc, id: 'inc-overnight-4', title: { nl: '4x Overnachting', en: '4x Overnight stay' } as LocalizedString }
      return inc
    }),
    {
      id: 'inc-bike-4',
      icon: 'pedal_bike',
      title: { nl: 'Gratis fietsverhuur (1 dag)', en: 'Free bicycle rental (1 day)' },
      description: {
        nl: 'Ontdek de prachtige Limburgse heuvels op de fiets. Inclusief routekaart met de mooiste routes door het Heuvelland.',
        en: 'Discover the beautiful Limburg hills by bicycle. Including a route map with the most scenic routes through the Heuvelland.',
      },
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
  { id: dealKasteel2Nights.id, nights: 2, label: { nl: '2 nachten', en: '2 nights' }, basePrice: dealKasteel2Nights.basePrice, originalPrice: dealKasteel2Nights.originalPrice, available: true },
  { id: dealKasteel3Nights.id, nights: 3, label: { nl: '3 nachten', en: '3 nights' }, basePrice: dealKasteel3Nights.basePrice, originalPrice: dealKasteel3Nights.originalPrice, available: true },
  { id: dealKasteel4Nights.id, nights: 4, label: { nl: '4 nachten', en: '4 nights' }, basePrice: dealKasteel4Nights.basePrice, originalPrice: dealKasteel4Nights.originalPrice, available: true },
]

export const dealsMapKasteel: Record<string, Deal> = {
  [dealKasteel2Nights.id]: dealKasteel2Nights,
  [dealKasteel3Nights.id]: dealKasteel3Nights,
  [dealKasteel4Nights.id]: dealKasteel4Nights,
}
