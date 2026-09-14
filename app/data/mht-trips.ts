/**
 * Multi Hotel Trip — mock "vakanties": reizen van twee of drie hotels achter
 * elkaar (autovakantie of fietsvakantie), 5 tot 8 nachten. Elke vakantie
 * wordt opgebouwd uit ECHTE hotels uit deals.json (foto's, plaatsnamen,
 * sterren, reviews) en als één SearchHotel-record met één deal door de
 * bestaande zoekresultaten + dealcards geleid (`hotel.trip` markeert het
 * record; de dealcard toont dan "Autovakantie"/"Fietsvakantie", de
 * plaatsnamen van de hotels en "Meerdere hotels").
 *
 * NB: de deal-slug verwijst voorlopig naar het arrangement van het EERSTE
 * hotel — de vakantie-PDP wordt nog gebrieft.
 */
import type { LocalizedString } from '~/i18n/types'
import type { SearchHotel, SearchHotelDeal, MultiHotelTripType } from '~/types/searchHotel'
import { mappedHotels } from '~/data/deals-mapper'

interface TripSpec {
  id: string
  slug: string
  type: MultiHotelTripType
  /** Hotelnamen zoals in deals.json (`hotelName`), in reisvolgorde. */
  hotels: string[]
  nights: number
  /** Korte regio-naam voor de titel, bv. "Zuid-Limburg". */
  region: string
  title: LocalizedString
  pitch: LocalizedString
  price: number
  originalPrice: number
  highlights: LocalizedString[]
  inclusions: LocalizedString[]
  tags: string[]
}

const l = (nl: string, en: string): LocalizedString => ({ nl, en })

const TRIPS: TripSpec[] = [
  {
    id: 'trip-zuid-limburg',
    slug: 'autovakantie-zuid-limburg-landgraaf-eijsden-sittard',
    type: 'auto',
    hotels: ['Hotel Winselerhof', 'Van Oys Maastricht Retreat', 'Hotel Merici'],
    nights: 6,
    region: 'Zuid-Limburg',
    title: l('7-daagse autovakantie door het Limburgse heuvelland incl. dagelijks diner', '7-day road trip through the hills of Limburg incl. daily dinner'),
    pitch: l('Drie luxe hotels tussen de wijngaarden en heuvels van Zuid-Limburg — met de auto van landgoed naar retreat.', 'Three luxury hotels among the vineyards and hills of South Limburg.'),
    price: 899,
    originalPrice: 1395,
    highlights: [
      l('3 hotels: Landgraaf – Eijsden – Sittard', '3 hotels: Landgraaf – Eijsden – Sittard'),
      l('Dagelijks 3-gangendiner', 'Daily 3-course dinner'),
      l('Wellness in twee van de drie hotels', 'Wellness at two of the three hotels'),
      l('Gratis parkeren bij elk hotel', 'Free parking at every hotel'),
    ],
    inclusions: [l('6 x overnachting', '6 nights'), l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'), l('Dagelijks 3-gangendiner', 'Daily 3-course dinner'), l('Routebeschrijving per dag', 'Daily route description')],
    tags: ['auto', 'superluxe', 'wellness', 'culinair'],
  },
  {
    id: 'trip-twente-salland',
    slug: 'fietsvakantie-twente-salland-ootmarsum-ommen-raalte',
    type: 'fiets',
    hotels: ['Hotel de Landmarke', 'Paping Hotel & Spa - Restaurant Vonck', 'Hotel de Zwaan'],
    nights: 6,
    region: 'Twente & Salland',
    title: l('7-daagse fietsvakantie Twente & Salland incl. dagelijks 3-gangendiner en bagagevervoer', '7-day cycling holiday Twente & Salland incl. daily dinner and luggage transfer'),
    pitch: l('Rustige fietspaden, schilderachtige dorpen en elke avond een ander luxe hotel — je bagage reist vooruit.', 'Quiet cycle paths, picturesque villages and a different luxury hotel every night.'),
    price: 1059,
    originalPrice: 1635,
    highlights: [
      l('Fietsroute: Ootmarsum – Ommen – Raalte', 'Cycling route: Ootmarsum – Ommen – Raalte'),
      l('Dagelijks 3-gangendiner', 'Daily 3-course dinner'),
      l('Dagelijkse bagagetransfer', 'Daily luggage transfer'),
      l('Fietsroutes op je telefoon', 'Cycling routes on your phone'),
    ],
    inclusions: [l('6 x overnachting', '6 nights'), l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'), l('Dagelijks 3-gangendiner', 'Daily 3-course dinner'), l('Bagagetransfer', 'Luggage transfer')],
    tags: ['fiets', 'natuur', 'wellness'],
  },
  {
    id: 'trip-kastelenroute',
    slug: 'autovakantie-kastelenroute-brabant-gelderland-utrechtse-heuvelrug',
    type: 'auto',
    hotels: ['Kasteel Steenenburg', 'Hotel Hoogeerd', 'Culinair Landgoed Parc Broekhuizen'],
    nights: 5,
    region: 'Kastelenroute',
    title: l('6-daagse kastelenroute: van kasteelhotel naar culinair landgoed', '6-day castle route: from castle hotel to culinary estate'),
    pitch: l('Slapen in een kasteel, dineren op een landgoed en onderweg de mooiste rivierlandschappen van Brabant en Gelderland.', 'Sleep in a castle, dine on an estate and drive the finest river landscapes in between.'),
    price: 1149,
    originalPrice: 1690,
    highlights: [
      l('3 hotels: Nieuwkuijk – Niftrik – Leersum', '3 hotels: Nieuwkuijk – Niftrik – Leersum'),
      l('2 x overnachten in een kasteel of landgoed', '2 nights in a castle or estate'),
      l('Culinair 4-gangendiner op Parc Broekhuizen', 'Culinary 4-course dinner at Parc Broekhuizen'),
      l('Welkomstdrankje bij elk hotel', 'Welcome drink at every hotel'),
    ],
    inclusions: [l('5 x overnachting', '5 nights'), l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'), l('2 x diner', '2 dinners'), l('Routebeschrijving per dag', 'Daily route description')],
    tags: ['auto', 'kasteel', 'culinair', 'superluxe'],
  },
  {
    id: 'trip-hollandse-kust',
    slug: 'fietsvakantie-hollandse-kust-scheveningen-burgh-haamstede',
    type: 'fiets',
    hotels: ['Carlton Beach', 'Hotel Ter Zand - Handwritten Collection'],
    nights: 5,
    region: 'Hollandse kust',
    title: l('6-daagse fietsvakantie langs de kust: van Scheveningen naar Schouwen-Duiveland', '6-day coastal cycling holiday from Scheveningen to Schouwen-Duiveland'),
    pitch: l('Duinen, strand en zeewind: fiets in vijf dagen langs de Hollandse en Zeeuwse kust met twee hotels direct aan zee.', 'Dunes, beach and sea breeze: cycle the Dutch coast with two hotels right on the beach.'),
    price: 749,
    originalPrice: 1098,
    highlights: [
      l('2 hotels: Scheveningen – Burgh-Haamstede', '2 hotels: Scheveningen – Burgh-Haamstede'),
      l('Beide hotels direct aan zee', 'Both hotels right on the beach'),
      l('Dagelijkse bagagetransfer', 'Daily luggage transfer'),
      l('Gebruik van zwembad en wellness', 'Use of pool and wellness'),
    ],
    inclusions: [l('5 x overnachting', '5 nights'), l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'), l('Bagagetransfer', 'Luggage transfer'), l('Fietsroutes op je telefoon', 'Cycling routes on your phone')],
    tags: ['fiets', 'aan-zee', 'budget'],
  },
  {
    id: 'trip-veluwe-achterhoek',
    slug: 'autovakantie-veluwe-achterhoek-twente-hulshorst-doetinchem-enschede',
    type: 'auto',
    hotels: ['Veluwe Hotel de Beyaerd', 'Hotel Villa Ruimzicht', 'Resort Bad Boekelo'],
    nights: 7,
    region: 'Veluwe & Achterhoek',
    title: l('8-daagse autovakantie Veluwe, Achterhoek en Twente incl. wellness', '8-day road trip Veluwe, Achterhoek and Twente incl. wellness'),
    pitch: l('Een week bossen, heide en landgoederen — met een wellnessresort als grande finale.', 'A week of forests, heathland and estates, finished off at a wellness resort.'),
    price: 1199,
    originalPrice: 1795,
    highlights: [
      l('3 hotels: Hulshorst – Doetinchem – Enschede', '3 hotels: Hulshorst – Doetinchem – Enschede'),
      l('Dagelijks 3-gangendiner', 'Daily 3-course dinner'),
      l('Onbeperkt gebruik wellness in Bad Boekelo', 'Unlimited wellness at Bad Boekelo'),
      l('Wandel- en autoroutes per dag', 'Daily walking and driving routes'),
    ],
    inclusions: [l('7 x overnachting', '7 nights'), l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'), l('Dagelijks 3-gangendiner', 'Daily 3-course dinner'), l('Gebruik wellness', 'Use of wellness')],
    tags: ['auto', 'natuur', 'wellness'],
  },
  {
    id: 'trip-randstad-steden',
    slug: 'autovakantie-drie-steden-amsterdam-utrecht-den-haag',
    type: 'auto',
    hotels: ['WestCord Fashion Hotel Amsterdam', 'Carlton President Utrecht', 'Hotel Des Indes'],
    nights: 5,
    region: 'Drie steden',
    title: l('6-daagse stedentrip: Amsterdam, Utrecht en Den Haag in één reis', '6-day city trip: Amsterdam, Utrecht and The Hague in one journey'),
    pitch: l('Drie steden, drie karakters — afgesloten met twee nachten in het chique Hotel Des Indes.', 'Three cities, three characters, finished with two nights at the chic Hotel Des Indes.'),
    price: 1299,
    originalPrice: 1980,
    highlights: [
      l('3 hotels: Amsterdam – Utrecht – Den Haag', '3 hotels: Amsterdam – Utrecht – The Hague'),
      l('2 nachten 5-sterren Hotel Des Indes', '2 nights at 5-star Hotel Des Indes'),
      l('High tea in Den Haag', 'High tea in The Hague'),
      l('Parkeren inbegrepen', 'Parking included'),
    ],
    inclusions: [l('5 x overnachting', '5 nights'), l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'), l('High tea', 'High tea'), l('Parkeren', 'Parking')],
    tags: ['auto', 'steden', 'superluxe', 'culinair'],
  },
  {
    id: 'trip-drenthe-overijssel',
    slug: 'fietsvakantie-drenthe-overijssel-odoorn-ootmarsum-enschede',
    type: 'fiets',
    hotels: ['Hotel de Oringer Marke & Stee', 'Hotel de Landmarke', 'Resort Bad Boekelo'],
    nights: 8,
    region: 'Drenthe & Overijssel',
    title: l('9-daagse fietsvakantie van de Drentse hunebedden naar Twente', '9-day cycling holiday from the Drenthe dolmens to Twente'),
    pitch: l('De langste route in ons aanbod: negen dagen fietsen door bos, heide en esdorpen met drie gastvrije hotels.', 'Our longest route: nine days of cycling through forests, heath and villages with three hotels.'),
    price: 999,
    originalPrice: 1520,
    highlights: [
      l('3 hotels: Odoorn – Ootmarsum – Enschede', '3 hotels: Odoorn – Ootmarsum – Enschede'),
      l('Dagelijkse bagagetransfer', 'Daily luggage transfer'),
      l('Dagelijks ontbijt en lunchpakket', 'Daily breakfast and packed lunch'),
      l('E-bike huur mogelijk', 'E-bike rental available'),
    ],
    inclusions: [l('8 x overnachting', '8 nights'), l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'), l('Lunchpakket', 'Packed lunch'), l('Bagagetransfer', 'Luggage transfer')],
    tags: ['fiets', 'natuur', 'budget'],
  },
  {
    id: 'trip-zeeland-brabant',
    slug: 'autovakantie-zeeland-brabant-burgh-haamstede-hilvarenbeek-eindhoven',
    type: 'auto',
    hotels: ['Hotel Ter Zand - Handwritten Collection', 'Safari Hotel Beekse Bergen', 'WestCord Hotel Eindhoven'],
    nights: 6,
    region: 'Zeeland & Brabant',
    title: l('7-daagse autovakantie van de Zeeuwse kust naar de Brabantse natuur', '7-day road trip from the Zeeland coast to the Brabant countryside'),
    pitch: l('Strand, safari en stad in één week — ideaal voor wie elke dag iets anders wil.', 'Beach, safari and city in one week — for those who want something different every day.'),
    price: 849,
    originalPrice: 1290,
    highlights: [
      l('3 hotels: Burgh-Haamstede – Hilvarenbeek – Eindhoven', '3 hotels: Burgh-Haamstede – Hilvarenbeek – Eindhoven'),
      l('Entree Safaripark Beekse Bergen', 'Entrance to Beekse Bergen safari park'),
      l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'),
      l('Gratis parkeren bij elk hotel', 'Free parking at every hotel'),
    ],
    inclusions: [l('6 x overnachting', '6 nights'), l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'), l('Entreekaarten safaripark', 'Safari park tickets'), l('Routebeschrijving per dag', 'Daily route description')],
    tags: ['auto', 'aan-zee', 'natuur', 'budget'],
  },
  {
    id: 'trip-friesland-drenthe',
    slug: 'fietsvakantie-friesland-drenthe-beetsterzwaag-odoorn',
    type: 'fiets',
    hotels: ['Landgoed Lauswolt', 'Hotel de Oringer Marke & Stee'],
    nights: 7,
    region: 'Friesland & Drenthe',
    title: l('8-daagse fietsvakantie Friesland & Drenthe vanaf een 5-sterren landgoed', '8-day cycling holiday Friesland & Drenthe starting from a 5-star estate'),
    pitch: l('Begin op het chique Landgoed Lauswolt en fiets in een week naar het hart van Drenthe.', 'Start at the chic Landgoed Lauswolt estate and cycle to the heart of Drenthe.'),
    price: 1249,
    originalPrice: 1860,
    highlights: [
      l('2 hotels: Beetsterzwaag – Odoorn', '2 hotels: Beetsterzwaag – Odoorn'),
      l('Wellness en spa op Landgoed Lauswolt', 'Wellness and spa at Landgoed Lauswolt'),
      l('Dagelijks 3-gangendiner', 'Daily 3-course dinner'),
      l('Dagelijkse bagagetransfer', 'Daily luggage transfer'),
    ],
    inclusions: [l('7 x overnachting', '7 nights'), l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'), l('Dagelijks 3-gangendiner', 'Daily 3-course dinner'), l('Bagagetransfer', 'Luggage transfer')],
    tags: ['fiets', 'natuur', 'superluxe', 'wellness'],
  },
  {
    id: 'trip-wellness-oost',
    slug: 'autovakantie-wellness-oost-nederland-nijmegen-ommen-enschede',
    type: 'auto',
    hotels: ['Sanadome Hotel Nijmegen', 'Paping Hotel & Spa - Restaurant Vonck', 'Resort Bad Boekelo'],
    nights: 5,
    region: 'Wellness Oost-Nederland',
    title: l('6-daagse wellness-roadtrip door Oost-Nederland: drie spa-hotels', '6-day wellness road trip through the east of the Netherlands: three spa hotels'),
    pitch: l('Van thermen naar sauna naar wellnessresort — zes dagen puur ontspannen.', 'From thermal baths to sauna to wellness resort — six days of pure relaxation.'),
    price: 799,
    originalPrice: 1215,
    highlights: [
      l('3 hotels: Nijmegen – Ommen – Enschede', '3 hotels: Nijmegen – Ommen – Enschede'),
      l('Onbeperkt wellness in elk hotel', 'Unlimited wellness at every hotel'),
      l('1 x massage naar keuze', '1 massage of your choice'),
      l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'),
    ],
    inclusions: [l('5 x overnachting', '5 nights'), l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'), l('Gebruik wellness', 'Use of wellness'), l('1 x massage', '1 massage')],
    tags: ['auto', 'wellness', 'budget'],
  },
]

function findHotel(name: string): SearchHotel | undefined {
  const lower = name.toLowerCase()
  return mappedHotels.find(h => h.name.toLowerCase() === lower)
    ?? mappedHotels.find(h => h.name.toLowerCase().startsWith(lower.split(' - ')[0]!))
}

function buildTrip(spec: TripSpec): SearchHotel | null {
  const stops = spec.hotels.map(findHotel).filter((h): h is SearchHotel => !!h)
  if (stops.length < 2) return null
  const first = stops[0]!
  const avgStars = Math.round(stops.reduce((s, h) => s + (h.starRating || 4), 0) / stops.length)
  const avgScore = Math.round((stops.reduce((s, h) => s + h.reviewScore, 0) / stops.length) * 10) / 10
  const reviewCount = stops.reduce((s, h) => s + h.reviewCount, 0)
  const discount = Math.round((1 - spec.price / spec.originalPrice) * 100)
  const deal: SearchHotelDeal = {
    id: `${spec.id}-deal`,
    // Voorlopig het arrangement van het eerste hotel als PDP (vakantie-PDP volgt).
    slug: first.deals[0]?.slug ?? spec.slug,
    nights: spec.nights,
    title: spec.title,
    basePrice: spec.price,
    originalPrice: spec.originalPrice,
    discountPercentage: discount,
    highlights: spec.highlights,
    inclusions: spec.inclusions,
    detailedInclusions: spec.inclusions,
    heroImage: first.heroImage,
    hasDinner: spec.inclusions.some(i => /diner/i.test(i.nl)),
    themes: spec.type === 'fiets' ? ['Fietsvakantie', 'Vakanties'] : ['Autovakantie', 'Vakanties'],
  }
  return {
    id: spec.id,
    slug: spec.slug,
    name: 'Meerdere hotels',
    starRating: avgStars,
    city: first.city,
    region: first.region,
    province: first.province,
    heroImage: first.heroImage,
    // Carrousel: één foto per hotel, in reisvolgorde.
    galleryImages: stops.map(h => h.heroImage).filter(Boolean),
    reviewScore: avgScore,
    reviewCount,
    pitch: spec.pitch,
    deals: [deal],
    coordinates: first.coordinates,
    trip: {
      type: spec.type,
      stops: stops.map(h => ({ city: h.city, hotelName: h.name, hotelSlug: h.slug })),
      tags: spec.tags,
    },
  }
}

/** Alle meerhotel-vakanties als SearchHotel-records (met `trip` gezet). */
export const tripSearchHotels: SearchHotel[] = TRIPS
  .map(buildTrip)
  .filter((t): t is SearchHotel => t !== null)
