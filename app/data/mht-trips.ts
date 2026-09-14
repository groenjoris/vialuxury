/**
 * Multi Hotel Trip — de "vakanties": autoroutes (en één fietsvakantie) van
 * twee of drie hotels achter elkaar. Inhoud komt uit de briefing-PDF's
 * "Original No. 001–006" (vakanties voorbeeld content/) plus de echte
 * Fietsvakantie Twente & Salland uit deals.json.
 *
 * Elke vakantie wordt als één SearchHotel-record met één deal door de
 * bestaande zoekresultaten en dealcards geleid; `hotel.trip` markeert het
 * record (de card toont dan "Autovakantie"/"Fietsvakantie", de plaatsnamen
 * van de hotels en "Meerdere hotels"). Hotels die in deals.json staan
 * leveren hun eigen foto/sterren; de overige gebruiken de foto's uit de
 * PDF's (public/images/vakanties/<nr>/hotel-<n>.jpg).
 *
 * NB: er is nog geen vakantie-PDP. Een card linkt voorlopig naar de
 * dealpagina van een van de hotels uit de dataset, of anders terug naar de
 * vakantiepagina.
 */
import type { LocalizedString } from '~/i18n/types'
import type { SearchHotel, SearchHotelDeal, MultiHotelTripType, MultiHotelTripStop } from '~/types/searchHotel'
import { mappedHotels } from '~/data/deals-mapper'

interface StopSpec {
  /** Hotelnaam. Staat het hotel in deals.json (exacte `hotelName`), dan
   *  komen slug, foto en sterren uit de dataset; anders uit dit object. */
  name: string
  city: string
  nights: number
  stars?: number
  image?: string
}

interface TripSpec {
  id: string
  slug: string
  type: MultiHotelTripType
  stops: StopSpec[]
  title: LocalizedString
  pitch: LocalizedString
  price: number
  originalPrice: number
  /** Vaste korting over de hele reis; anders berekend uit de prijzen. */
  discountPercentage?: number
  /** Precies vier regels: de vinkjes op de card ("Arrangement voor 2 personen inclusief"). */
  highlights: LocalizedString[]
  /** Volledige inclusielijst (voor de vakantie-PDP). */
  inclusions: LocalizedString[]
  tags: string[]
  routeImage?: string
  /** Deal-slug uit de dataset voor de voorlopige PDP-link; leeg = vakantiepagina. */
  pdpDealOf?: string
}

const l = (nl: string, en: string): LocalizedString => ({ nl, en })

const TRIPS: TripSpec[] = [
  // ── Original No. 001 ──────────────────────────────────────────────────
  {
    id: 'trip-noord-frankrijk',
    slug: 'ontdek-noord-frankrijk-en-de-opaalkust-in-7-dagen',
    type: 'auto',
    stops: [
      { name: 'Hotel Royal Beaulaincourt', city: 'Béthune', nights: 2, stars: 4, image: '/images/vakanties/001/hotel-1.jpg' },
      { name: 'Hôtel Château Tilques', city: 'Tilques', nights: 2, stars: 3, image: '/images/vakanties/001/hotel-2.jpg' },
      { name: 'Hôtel Château Cléry', city: "Hesdin-l'Abbé", nights: 2, stars: 3, image: '/images/vakanties/001/hotel-3.jpg' },
    ],
    title: l('Ontdek Noord-Frankrijk en de Opaalkust in 7 dagen', 'Discover Northern France and the Opal Coast in 7 days'),
    pitch: l('Béthune, de moerassen van Saint-Omer en de kastelen aan de Opaalkust — stad, natuur en kust in drie bijzondere hotels.', 'Béthune, the marshes of Saint-Omer and the castles of the Opal Coast in three special hotels.'),
    price: 919,
    originalPrice: 1490,
    discountPercentage: 35,
    highlights: [
      l('6 nachten / 3 hotels', '6 nights / 3 hotels'),
      l('3 x 3-gangendiner', '3 x 3-course dinner'),
      l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'),
      l('Gratis parkeren', 'Free parking'),
    ],
    inclusions: [
      l('2 x overnachting in Hotel Royal Beaulaincourt', '2 nights at Hotel Royal Beaulaincourt'),
      l('2 x overnachting in Hôtel Château Tilques', '2 nights at Hôtel Château Tilques'),
      l('2 x overnachting in Hôtel Château Cléry', '2 nights at Hôtel Château Cléry'),
      l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'),
      l('3 x 3-gangendiner (dag van aankomst)', '3 x 3-course dinner (day of arrival)'),
      l('Welkomstbubbels', 'Welcome bubbles'),
      l('Late check-out', 'Late check-out'),
      l('Gratis parkeren', 'Free parking'),
    ],
    tags: ['auto', 'kasteel', 'culinair', 'aan-zee'],
    routeImage: '/images/vakanties/001/route.jpg',
  },
  // ── Original No. 002 ──────────────────────────────────────────────────
  {
    id: 'trip-hanzesteden',
    slug: '7-daagse-roadtrip-langs-de-hanzesteden-zwolle-deventer-zutphen',
    type: 'auto',
    stops: [
      { name: 'Hotel Mooirivier', city: 'Dalfsen', nights: 2, stars: 4, image: '/images/vakanties/002/hotel-1.jpg' },
      { name: 'Hotel de Zwaan', city: 'Raalte', nights: 2, stars: 3, image: '/images/vakanties/002/hotel-2.jpg' },
      { name: "Hotel 's Gravenhof", city: 'Zutphen', nights: 2, stars: 4, image: '/images/vakanties/002/hotel-3.jpg' },
    ],
    title: l('7-daagse roadtrip langs de Hanzesteden Zwolle, Deventer & Zutphen', '7-day road trip along the Hanseatic cities Zwolle, Deventer & Zutphen'),
    pitch: l('Museum de Fundatie, het Bergkwartier en de verborgen hofjes van Zutphen — drie Hanzesteden vanuit drie hotels aan de IJssel.', 'Three Hanseatic cities from three hotels along the IJssel river.'),
    price: 1099,
    originalPrice: 1559,
    highlights: [
      l('6 nachten / 3 hotels', '6 nights / 3 hotels'),
      l('3 x diner (3- en 4-gangen)', '3 x dinner (3 and 4 courses)'),
      l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'),
      l('Wijnarrangement en museumentree', 'Wine pairing and museum entrance'),
    ],
    inclusions: [
      l('2 x overnachting in Hotel Mooirivier incl. wellness', '2 nights at Hotel Mooirivier incl. wellness'),
      l('2 x overnachting in Hotel de Zwaan incl. 4-gangendiner en wijnarrangement', '2 nights at Hotel de Zwaan incl. 4-course dinner and wine pairing'),
      l("2 x overnachting in Hotel 's Gravenhof incl. entreekaart Stedelijk Museum Zutphen en Museum Henriette Polak", "2 nights at Hotel 's Gravenhof incl. museum tickets"),
      l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'),
      l('3 x diner (dag van aankomst)', '3 x dinner (day of arrival)'),
      l('Gratis parkeren (Mooirivier)', 'Free parking (Mooirivier)'),
      l('Late check-out', 'Late check-out'),
    ],
    tags: ['auto', 'steden', 'culinair', 'wellness'],
    routeImage: '/images/vakanties/002/route.jpg',
    pdpDealOf: 'Hotel de Zwaan',
  },
  // ── Original No. 003 ──────────────────────────────────────────────────
  {
    id: 'trip-kastelen-landgoederen',
    slug: 'kastelen-en-landgoederen-7-daagse-autoroute',
    type: 'auto',
    stops: [
      { name: 'Landgoed Groot Warnsborn', city: 'Arnhem', nights: 2, stars: 4, image: '/images/vakanties/003/hotel-1.jpg' },
      { name: 'Kasteel Engelenburg', city: 'Brummen', nights: 2, stars: 4, image: '/images/vakanties/003/hotel-2.jpg' },
      { name: 'Landhuishotel De Bloemenbeek', city: 'De Lutte', nights: 2, stars: 4, image: '/images/vakanties/003/hotel-3.jpg' },
    ],
    title: l('Kastelen & Landgoederen: 7-daagse autoroute incl. 3 culinaire diners', 'Castles & Estates: 7-day road trip incl. 3 culinary dinners'),
    pitch: l('Van de Veluwe naar het Twentse coulisselandschap: zes nachten in drie bijzondere kastelen en landgoederen, met een Michelin-diner als finale.', 'From the Veluwe to the Twente landscape: six nights in three castles and estates, with a Michelin dinner as the finale.'),
    price: 1419,
    originalPrice: 2428,
    highlights: [
      l('6 nachten / 3 kastelen & landgoederen', '6 nights / 3 castles & estates'),
      l('3 x culinair diner (1 x Michelin)', '3 x culinary dinner (1 x Michelin)'),
      l('Kamerupgrade in elk hotel', 'Room upgrade at every hotel'),
      l('1 spa-dag en gratis parkeren', '1 spa day and free parking'),
    ],
    inclusions: [
      l('2 x overnachting in Landgoed Groot Warnsborn incl. kamerupgrade, 3-gangendiner en welkomstdrankje', '2 nights at Landgoed Groot Warnsborn incl. room upgrade, 3-course dinner and welcome drink'),
      l('2 x overnachting in Kasteel Engelenburg incl. kamerupgrade en culinair 3- of 4-gangendiner', '2 nights at Kasteel Engelenburg incl. room upgrade and culinary dinner'),
      l('2 x overnachting in Landhuishotel De Bloemenbeek incl. Superior kamer, 4-gangen-Michelin-diner en onbeperkt spa', '2 nights at Landhuishotel De Bloemenbeek incl. Superior room, 4-course Michelin dinner and unlimited spa'),
      l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'),
      l('Late check-out bij elk hotel', 'Late check-out at every hotel'),
      l('Gratis parkeren bij alle hotels', 'Free parking at all hotels'),
      l('Exclusieve ViaLuxury kastelen- & landgoederenroute', 'Exclusive ViaLuxury castles & estates route'),
    ],
    tags: ['auto', 'kasteel', 'culinair', 'superluxe', 'wellness', 'natuur'],
    routeImage: '/images/vakanties/003/route.jpg',
  },
  // ── Original No. 004 ──────────────────────────────────────────────────
  {
    id: 'trip-zuid-limburg-luxe',
    slug: 'bourgondisch-zuid-limburg-luxe-en-wellness-7-daagse-autoroute',
    type: 'auto',
    stops: [
      { name: 'Hotel Merici', city: 'Sittard', nights: 2, stars: 4 },
      { name: 'Hotel Winselerhof', city: 'Landgraaf', nights: 2, stars: 4 },
      { name: 'Van Oys Maastricht Retreat', city: 'Eijsden', nights: 2, stars: 5 },
    ],
    title: l('Bourgondisch Zuid-Limburg: luxe & wellness in 7 dagen', 'Burgundian South Limburg: luxury & wellness in 7 days'),
    pitch: l('Sittard, het Heuvelland en een 5-sterren Superior finale bij Van Oys — met drie diners uit Gault&Millau en de Michelin-gids.', 'Sittard, the hills and a 5-star Superior finale at Van Oys, with three dinners from Gault&Millau and the Michelin guide.'),
    price: 1449,
    originalPrice: 2293,
    highlights: [
      l('6 nachten / 3 hotels (1 x 5* Superior)', '6 nights / 3 hotels (1 x 5* Superior)'),
      l('3 x culinair diner (Gault&Millau, Michelin)', '3 x culinary dinner (Gault&Millau, Michelin)'),
      l('Dagje Maastricht en 1 spa-dag', 'A day in Maastricht and 1 spa day'),
      l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'),
    ],
    inclusions: [
      l("2 x overnachting in Hotel Merici incl. kamerupgrade, 3-gangendiner bij Restaurant George's en VIP-pas Maasmechelen Village", "2 nights at Hotel Merici incl. room upgrade, 3-course dinner at Restaurant George's and VIP pass Maasmechelen Village"),
      l("2 x overnachting in Hotel Winselerhof incl. 4-gangendiner bij Restaurant Pirandello en welkomstdrankje", '2 nights at Hotel Winselerhof incl. 4-course dinner at Restaurant Pirandello and welcome drink'),
      l('2 x overnachting in Van Oys Maastricht Retreat incl. Deluxe Room, 4-gangendiner bij Restaurant Maes en Oysana spa', '2 nights at Van Oys Maastricht Retreat incl. Deluxe Room, 4-course dinner at Restaurant Maes and Oysana spa'),
      l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'),
      l('Late check-out', 'Late check-out'),
      l('Gratis parkeren (Winselerhof)', 'Free parking (Winselerhof)'),
      l('Exclusieve ViaLuxury route', 'Exclusive ViaLuxury route'),
    ],
    tags: ['auto', 'superluxe', 'wellness', 'culinair'],
    routeImage: '/images/vakanties/004/route.jpg',
    pdpDealOf: 'Hotel Merici',
  },
  // ── Original No. 005 ──────────────────────────────────────────────────
  {
    id: 'trip-zuid-limburg',
    slug: 'bourgondisch-zuid-limburg-7-daagse-culinaire-autoroute',
    type: 'auto',
    stops: [
      { name: 'Hotel Merici', city: 'Sittard', nights: 2, stars: 4 },
      { name: 'Hotel Winselerhof', city: 'Landgraaf', nights: 2, stars: 4 },
      { name: 'Hotel Monastère', city: 'Maastricht', nights: 2, stars: 4, image: '/images/vakanties/005/hotel-3.jpg' },
    ],
    title: l('Bourgondisch Zuid-Limburg: 7-daagse culinaire autoroute', 'Burgundian South Limburg: 7-day culinary road trip'),
    pitch: l('Historisch Sittard, het glooiende Heuvelland en bruisend Maastricht — twee kloosters en een 16e-eeuwse herenboerderij.', 'Historic Sittard, the rolling hills and vibrant Maastricht: two monasteries and a 16th-century manor farm.'),
    price: 999,
    originalPrice: 1850,
    highlights: [
      l('6 nachten / 3 hotels', '6 nights / 3 hotels'),
      l('2 x culinair diner (Gault&Millau)', '2 x culinary dinner (Gault&Millau)'),
      l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'),
      l('Dagje Maastricht', 'A day in Maastricht'),
    ],
    inclusions: [
      l("2 x overnachting in Hotel Merici incl. kamerupgrade, 3-gangendiner bij Restaurant George's en VIP-pas Maasmechelen Village", "2 nights at Hotel Merici incl. room upgrade, 3-course dinner and VIP pass"),
      l('2 x overnachting in Hotel Winselerhof incl. 3-gangendiner, welkomstdrankje en wandel- en fietsroutes', '2 nights at Hotel Winselerhof incl. 3-course dinner, welcome drink and routes'),
      l('2 x overnachting in Hotel Monastère incl. Executive Room en fles wijn op de kamer', '2 nights at Hotel Monastère incl. Executive Room and a bottle of wine'),
      l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'),
      l('Late check-out', 'Late check-out'),
      l('Gratis parkeren (Winselerhof)', 'Free parking (Winselerhof)'),
      l('Exclusieve ViaLuxury route', 'Exclusive ViaLuxury route'),
    ],
    tags: ['auto', 'culinair', 'steden', 'budget'],
    routeImage: '/images/vakanties/005/route.jpg',
    pdpDealOf: 'Hotel Merici',
  },
  // ── Original No. 006 ──────────────────────────────────────────────────
  {
    id: 'trip-kustroute',
    slug: 'nederlandse-kustroute-6-daagse-autoroute',
    type: 'auto',
    stops: [
      { name: 'Grand Hotel Ter Duin', city: 'Burgh-Haamstede', nights: 2, stars: 4, image: '/images/vakanties/006/hotel-1.jpg' },
      { name: 'Inntel Hotels Den Haag Marina Beach', city: 'Scheveningen', nights: 1, stars: 4 },
      { name: 'Carlton Square', city: 'Haarlem', nights: 2, stars: 4, image: '/images/vakanties/006/hotel-3.jpg' },
    ],
    title: l('Nederlandse kustroute: 6 dagen langs Zeeland, Scheveningen en Noord-Holland', 'Dutch coastal route: 6 days along Zeeland, Scheveningen and North Holland'),
    pitch: l('Van de Zeeuwse stranden via Scheveningen naar Haarlem, Zandvoort en Bloemendaal — strand, wellness en stad in één kustvakantie.', 'From the Zeeland beaches via Scheveningen to Haarlem, Zandvoort and Bloemendaal: beach, wellness and city in one coastal holiday.'),
    price: 899,
    originalPrice: 1583,
    highlights: [
      l('5 nachten / 3 hotels', '5 nights / 3 hotels'),
      l('3 x 3-gangendiner', '3 x 3-course dinner'),
      l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'),
      l('Zwembad en wellness', 'Pool and wellness'),
    ],
    inclusions: [
      l('2 x overnachting in Grand Hotel Ter Duin incl. 3-gangendiner, tasting uurtje, zwembad en wellness', '2 nights at Grand Hotel Ter Duin incl. 3-course dinner, tasting hour, pool and wellness'),
      l('1 x overnachting in Inntel Hotels Den Haag Marina Beach incl. ontbijt met bubbels, 3-gangen verrassingsdiner en spa', '1 night at Inntel Hotels Den Haag Marina Beach incl. breakfast with bubbles, 3-course surprise dinner and spa'),
      l('2 x overnachting in Carlton Square incl. 3-gangenverrassingsmenu van de chef', "2 nights at Carlton Square incl. the chef's 3-course surprise menu"),
      l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'),
      l('Late check-out (Ter Duin)', 'Late check-out (Ter Duin)'),
      l('Exclusieve ViaLuxury route', 'Exclusive ViaLuxury route'),
    ],
    tags: ['auto', 'aan-zee', 'wellness', 'steden'],
    routeImage: '/images/vakanties/006/route.jpg',
    pdpDealOf: 'Inntel Hotels Den Haag Marina Beach',
  },
]

/** De echte Fietsvakantie Twente & Salland uit deals.json (hotelrecord
 *  "Fietsvakantie 2026", pakket van 6 nachten). Zorgt dat "Met de fiets"
 *  ook iets oplevert. */
const FIETS_SOURCE_HOTEL = 'Fietsvakantie 2026'
const FIETS_NIGHTS = 6

function findHotel(name: string): SearchHotel | undefined {
  const lower = name.toLowerCase()
  return mappedHotels.find(h => h.name.toLowerCase() === lower)
}

function toStop(s: StopSpec): MultiHotelTripStop {
  const h = findHotel(s.name)
  return {
    city: s.city || h?.city || '',
    hotelName: h?.name ?? s.name,
    hotelSlug: h?.slug,
    nights: s.nights,
    starRating: h?.starRating ?? s.stars,
    image: h?.heroImage ?? s.image,
  }
}

function buildTrip(spec: TripSpec): SearchHotel | null {
  const stops = spec.stops.map(toStop)
  if (stops.length < 2) return null
  const known = spec.stops.map(s => findHotel(s.name)).filter((h): h is SearchHotel => !!h)
  const first = stops[0]!
  const nights = stops.reduce((n, s) => n + (s.nights ?? 0), 0)
  const stars = stops.map(s => s.starRating ?? 4)
  const avgStars = Math.round(stars.reduce((a, b) => a + b, 0) / stars.length)
  const avgScore = known.length
    ? Math.round((known.reduce((s, h) => s + h.reviewScore, 0) / known.length) * 10) / 10
    : 8.8
  const reviewCount = known.reduce((s, h) => s + h.reviewCount, 0)
  const discount = spec.discountPercentage ?? Math.round((1 - spec.price / spec.originalPrice) * 100)
  const pdpHotel = spec.pdpDealOf ? findHotel(spec.pdpDealOf) : undefined
  const pdpDeal = pdpHotel?.deals[0]
  const deal: SearchHotelDeal = {
    id: `${spec.id}-deal`,
    slug: pdpDeal?.slug ?? spec.slug,
    nights,
    title: spec.title,
    basePrice: spec.price,
    originalPrice: spec.originalPrice,
    discountPercentage: discount,
    highlights: spec.highlights,
    inclusions: spec.inclusions,
    detailedInclusions: spec.inclusions,
    heroImage: first.image,
    hasDinner: spec.inclusions.some(i => /diner/i.test(i.nl)),
    themes: spec.type === 'fiets' ? ['Fietsvakantie', 'Vakanties'] : ['Autovakantie', 'Vakanties'],
  }
  return {
    id: spec.id,
    slug: spec.slug,
    name: 'Meerdere hotels',
    starRating: avgStars,
    city: first.city,
    region: known[0]?.region ?? 'Nederland',
    province: known[0]?.province,
    heroImage: first.image ?? '',
    // Carrousel: één foto per hotel, in reisvolgorde.
    galleryImages: stops.map(s => s.image).filter((u): u is string => !!u),
    reviewScore: avgScore,
    reviewCount,
    pitch: spec.pitch,
    deals: [deal],
    coordinates: known[0]?.coordinates,
    trip: {
      type: spec.type,
      stops,
      tags: spec.tags,
      routeImage: spec.routeImage,
      pdpHref: pdpDeal ? `/multi-hotel-trip/deal/${pdpDeal.slug}` : '/multi-hotel-trip/vakanties',
    },
  }
}

function buildFietsvakantie(): SearchHotel | null {
  const src = findHotel(FIETS_SOURCE_HOTEL)
  const pkg = src?.deals.find(d => d.nights === FIETS_NIGHTS) ?? src?.deals[0]
  if (!src || !pkg) return null
  const stops: MultiHotelTripStop[] = [
    { city: 'Delden', hotelName: 'Hotel in Delden', nights: 2, starRating: 4 },
    { city: 'Raalte', hotelName: 'Hotel in Raalte', nights: 2, starRating: 4 },
    { city: 'Markelo', hotelName: 'Hotel in Markelo', nights: 2, starRating: 4 },
  ]
  const gallery = (src.galleryImages && src.galleryImages.length ? src.galleryImages : [src.heroImage]).slice(0, 3)
  const deal: SearchHotelDeal = {
    ...pkg,
    id: 'trip-fietsvakantie-twente-salland-deal',
    title: l('7-daagse fietsvakantie Twente & Salland: Delden – Raalte – Markelo incl. dagelijks 3-gangendiner', '7-day cycling holiday Twente & Salland: Delden – Raalte – Markelo incl. daily 3-course dinner'),
    highlights: [
      l(`${pkg.nights} nachten / 3 hotels`, `${pkg.nights} nights / 3 hotels`),
      l('Dagelijks 3-gangendiner', 'Daily 3-course dinner'),
      l('Dagelijkse bagagetransfer', 'Daily luggage transfer'),
      l('Prachtige fietsroutes op je telefoon', 'Beautiful cycling routes on your phone'),
    ],
    themes: ['Fietsvakantie', 'Vakanties'],
  }
  return {
    ...src,
    id: 'trip-fietsvakantie-twente-salland',
    slug: 'fietsvakantie-twente-en-salland-delden-raalte-markelo',
    name: 'Meerdere hotels',
    city: 'Delden',
    galleryImages: gallery,
    pitch: l('Rustige fietspaden, schilderachtige dorpen en elke avond een ander hotel — je bagage reist vooruit.', 'Quiet cycle paths, picturesque villages and a different hotel every night; your luggage travels ahead.'),
    deals: [deal],
    trip: {
      type: 'fiets',
      stops,
      tags: ['fiets', 'natuur', 'culinair'],
      pdpHref: `/multi-hotel-trip/deal/${pkg.slug}`,
    },
  }
}

/** Alle meerhotel-vakanties als SearchHotel-records (met `trip` gezet). */
export const tripSearchHotels: SearchHotel[] = [
  ...TRIPS.map(buildTrip),
  buildFietsvakantie(),
].filter((t): t is SearchHotel => t !== null)
