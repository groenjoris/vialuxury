/**
 * Multi Hotel Trip — de "vakanties": autoroutes (en één fietsvakantie) van
 * twee of drie hotels achter elkaar. Inhoud komt uit de briefing-PDF's
 * "Original No. 001–006" (vakanties voorbeeld content/) plus de echte
 * ViaLuxury-deal "Fietsvakantie 2026" (Twente & Salland).
 *
 * Elke vakantie wordt als één SearchHotel-record met één deal door de
 * bestaande zoekresultaten en dealcards geleid; `hotel.trip` markeert het
 * record (de card toont dan "Autovakantie"/"Fietsvakantie", de plaatsnamen
 * van de hotels en "Meerdere hotels"). Hotels die in deals.json staan
 * leveren hun eigen foto/sterren; de overige gebruiken de foto's uit de
 * PDF's (public/images/vakanties/<nr>/hotel-<n>.jpg). Voor No. 001 zijn
 * dat de door Joris aangeleverde high-res hotelfoto's (bron:
 * vakanties voorbeeld content/<hotel>/, verkleind met sips -Z 1600).
 *
 * De vakantie-PDP (/multi-hotel-trip/deal/<slug>) leest `tripDetailBySlug`:
 * per hotel de dagen, ligging en de "Inclusief"-lijst uit de PDF; de
 * zijbalk toont de samengevatte `inclusions`.
 */
import type { LocalizedString } from '~/i18n/types'
import type { SearchHotel, SearchHotelDeal, MultiHotelTripType, MultiHotelTripStop } from '~/types/searchHotel'
import { mappedHotels } from '~/data/deals-mapper'

interface StopSpec {
  /** Hotelnaam. Staat het hotel in deals.json (exacte `hotelName`), dan
   *  komen slug, foto en sterren uit de dataset; anders uit dit object. */
  name: string
  city: string
  /** Streek/provincie voor de locatieregel op de PDP ("Béthune, Noord-Frankrijk"). */
  region: string
  /** NL-provincie voor het bestemmingsfilter; alleen nodig als `region` geen
   *  provincie is (Twente, Salland → Overijssel). Buitenland: leeg. */
  province?: string
  nights: number
  stars?: number
  image?: string
  /** Ligging voor het routekaartje op de card. */
  lat: number
  lng: number
  /** "Inclusief"-vinkjes van dít hotel (PDF: "Arrangement voor 2 personen"). */
  includes: LocalizedString[]
  /** Extra foto's voor de PDP-gallery (hotels die niet in deals.json staan). */
  extraImages?: string[]
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
  /** Samengevatte inclusielijst over de hele reis (zijbalk van de PDP). */
  inclusions: LocalizedString[]
  tags: string[]
  routeImage?: string
}

const l = (nl: string, en: string): LocalizedString => ({ nl, en })

const TRIPS: TripSpec[] = [
  // ── Original No. 001 ──────────────────────────────────────────────────
  {
    id: 'trip-noord-frankrijk',
    slug: 'ontdek-noord-frankrijk-en-de-opaalkust-in-7-dagen',
    type: 'auto',
    stops: [
      { name: 'Hotel Royal Beaulaincourt', city: 'Béthune', region: 'Noord-Frankrijk', nights: 2, stars: 4, lat: 50.5305, lng: 2.6406, image: '/images/vakanties/001/beaulaincourt-1.jpg', extraImages: ['/images/vakanties/001/beaulaincourt-2.jpg', '/images/vakanties/001/beaulaincourt-3.jpg', '/images/vakanties/001/beaulaincourt-4.jpg'], includes: [l('2 x overnachting', '2 nights'), l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'), l('3-gangendiner (dag van aankomst)', '3-course dinner (day of arrival)'), l('Welkomstbubbels', 'Welcome bubbles'), l('Late check-out tot 15:00 uur', 'Late check-out until 15:00')] },
      { name: 'Hôtel Château Tilques', city: 'Tilques', region: 'Noord-Frankrijk', nights: 2, stars: 3, lat: 50.7797, lng: 2.2010, image: '/images/vakanties/001/tilques-1.jpg', extraImages: ['/images/vakanties/001/tilques-2.jpg', '/images/vakanties/001/tilques-3.jpg', '/images/vakanties/001/tilques-4.jpg', '/images/vakanties/001/tilques-5.jpg', '/images/vakanties/001/tilques-6.jpg'], includes: [l('2 x overnachting', '2 nights'), l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'), l('3-gangendiner (dag van aankomst)', '3-course dinner (day of arrival)'), l('Late check-out', 'Late check-out'), l('Gratis parkeren', 'Free parking')] },
      { name: 'Hôtel Château Cléry', city: "Hesdin-l'Abbé", region: 'Opaalkust', nights: 2, stars: 3, lat: 50.6725, lng: 1.7365, image: '/images/vakanties/001/clery-1.jpg', extraImages: ['/images/vakanties/001/clery-2.jpg', '/images/vakanties/001/clery-3.jpg', '/images/vakanties/001/clery-4.jpg', '/images/vakanties/001/clery-5.jpg', '/images/vakanties/001/clery-6.jpg', '/images/vakanties/001/clery-7.jpg', '/images/vakanties/001/clery-8.jpg', '/images/vakanties/001/clery-9.jpg'], includes: [l('2 x overnachting', '2 nights'), l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'), l('3-gangendiner (dag van aankomst)', '3-course dinner (day of arrival)'), l('Late check-out', 'Late check-out'), l('Gratis parkeren', 'Free parking')] },
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
      l('Welkomstbubbels (Beaulaincourt)', 'Welcome bubbles (Beaulaincourt)'),
      l('Late check-out bij elk hotel', 'Late check-out at every hotel'),
      l('Gratis parkeren (Tilques en Cléry)', 'Free parking (Tilques and Cléry)'),
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
      { name: 'Hotel Mooirivier', city: 'Dalfsen', region: 'Overijssel', nights: 2, stars: 4, lat: 52.5108, lng: 6.2589, image: '/images/vakanties/002/hotel-1.jpg', includes: [l('2 x overnachting', '2 nights'), l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'), l('3-gangendiner (dag van aankomst)', '3-course dinner (day of arrival)'), l('Gebruik van de wellness', 'Use of the wellness'), l('Gratis parkeren', 'Free parking')] },
      { name: 'Hotel de Zwaan', city: 'Raalte', region: 'Overijssel', nights: 2, stars: 3, lat: 52.3833, lng: 6.2667, image: '/images/vakanties/002/hotel-2.jpg', includes: [l('2 x overnachting', '2 nights'), l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'), l('4-gangendiner (dag van aankomst)', '4-course dinner (day of arrival)'), l('Wijnarrangement', 'Wine pairing'), l('Late check-out', 'Late check-out')] },
      { name: "Hotel 's Gravenhof", city: 'Zutphen', region: 'Gelderland', nights: 2, stars: 4, lat: 52.1383, lng: 6.2014, image: '/images/vakanties/002/hotel-3.jpg', includes: [l('2 x overnachting', '2 nights'), l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'), l('3-gangendiner', '3-course dinner'), l('Entreekaart Stedelijk Museum Zutphen en Museum Henriette Polak', 'Tickets Stedelijk Museum Zutphen and Museum Henriette Polak'), l('Late check-out', 'Late check-out')] },
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
      l('2 x overnachting in Hotel Mooirivier', '2 nights at Hotel Mooirivier'),
      l('2 x overnachting in Hotel de Zwaan', '2 nights at Hotel de Zwaan'),
      l("2 x overnachting in Hotel 's Gravenhof", "2 nights at Hotel 's Gravenhof"),
      l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'),
      l('3 x diner (2 x 3-gangen, 1 x 4-gangen)', '3 x dinner (2 x 3-course, 1 x 4-course)'),
      l('Wijnarrangement (De Zwaan)', 'Wine pairing (De Zwaan)'),
      l('Gebruik van de wellness (Mooirivier)', 'Use of the wellness (Mooirivier)'),
      l('Entree Stedelijk Museum Zutphen & Museum Henriette Polak', 'Tickets Stedelijk Museum Zutphen & Museum Henriette Polak'),
      l("Late check-out (De Zwaan en 's Gravenhof)", "Late check-out (De Zwaan and 's Gravenhof)"),
      l('Gratis parkeren (Mooirivier)', 'Free parking (Mooirivier)'),
    ],
    tags: ['auto', 'steden', 'culinair', 'wellness'],
    routeImage: '/images/vakanties/002/route.jpg',
  },
  // ── Original No. 003 ──────────────────────────────────────────────────
  {
    id: 'trip-kastelen-landgoederen',
    slug: 'kastelen-en-landgoederen-7-daagse-autoroute',
    type: 'auto',
    stops: [
      { name: 'Landgoed Groot Warnsborn', city: 'Arnhem', region: 'Gelderland', nights: 2, stars: 4, lat: 52.0247, lng: 5.8672, image: '/images/vakanties/003/hotel-1.jpg', includes: [l('2 x overnachting', '2 nights'), l('Kamerupgrade naar een luxe kamer', 'Room upgrade to a luxury room'), l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'), l('Culinair 3-gangendiner', 'Culinary 3-course dinner'), l('Welkomstdrankje met een lekkernij', 'Welcome drink with a treat'), l('Badjas en slippers', 'Bathrobe and slippers'), l('Late check-out tot 12:00 uur', 'Late check-out until 12:00'), l('Gratis parkeren', 'Free parking')] },
      { name: 'Kasteel Engelenburg', city: 'Brummen', region: 'Gelderland', nights: 2, stars: 4, lat: 52.0906, lng: 6.1553, image: '/images/vakanties/003/hotel-2.jpg', includes: [l('2 x overnachting', '2 nights'), l('Kamerupgrade naar luxe kamer (o.b.v.b.)', 'Room upgrade to a luxury room (subject to availability)'), l('Dagelijks royaal ontbijt', 'Daily generous breakfast'), l('Culinair 3- of 4-gangendiner', 'Culinary 3- or 4-course dinner'), l('Early check-in vanaf 14:00 uur', 'Early check-in from 14:00'), l('Late check-out tot 12:00 uur', 'Late check-out until 12:00'), l('Gratis parkeren', 'Free parking')] },
      { name: 'Landhuishotel De Bloemenbeek', city: 'De Lutte', region: 'Twente', province: 'Overijssel', nights: 2, stars: 4, lat: 52.3156, lng: 6.9797, image: '/images/vakanties/003/hotel-3.jpg', includes: [l('2 x overnachting', '2 nights'), l('Kamerupgrade naar Superior kamer (o.b.v.b.)', 'Room upgrade to a Superior room (subject to availability)'), l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'), l('4-gangen-Michelin-diner', '4-course Michelin dinner'), l('Onbeperkt gebruik van de spa', 'Unlimited use of the spa'), l('Late check-out tot 13:00 uur', 'Late check-out until 13:00'), l('Gratis parkeren', 'Free parking')] },
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
      l('2 x overnachting in Landgoed Groot Warnsborn', '2 nights at Landgoed Groot Warnsborn'),
      l('2 x overnachting in Kasteel Engelenburg', '2 nights at Kasteel Engelenburg'),
      l('2 x overnachting in Landhuishotel De Bloemenbeek', '2 nights at Landhuishotel De Bloemenbeek'),
      l('Kamerupgrade in elk hotel', 'Room upgrade at every hotel'),
      l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'),
      l('3 x culinair diner (waaronder 1 x 4-gangen-Michelin-diner)', '3 x culinary dinner (incl. 1 x 4-course Michelin dinner)'),
      l('Onbeperkt gebruik van de spa (De Bloemenbeek)', 'Unlimited use of the spa (De Bloemenbeek)'),
      l('Welkomstdrankje, badjas en slippers (Groot Warnsborn)', 'Welcome drink, bathrobe and slippers (Groot Warnsborn)'),
      l('Late check-out bij elk hotel', 'Late check-out at every hotel'),
      l('Gratis parkeren bij alle hotels', 'Free parking at all hotels'),
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
      { name: 'Hotel Merici', city: 'Sittard', region: 'Limburg', nights: 2, stars: 4, lat: 50.9994, lng: 5.8689, includes: [l('2 x overnachting', '2 nights'), l('Kamerupgrade naar luxer kamertype (o.b.v.b.)', 'Room upgrade (subject to availability)'), l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'), l("Culinair 3-gangendiner in Restaurant George's (dag van aankomst)", "Culinary 3-course dinner at Restaurant George's (day of arrival)"), l('VIP-pas voor Maasmechelen Village Outlet', 'VIP pass for Maasmechelen Village Outlet'), l('Late check-out tot 12:00 uur (o.b.v.b.)', 'Late check-out until 12:00 (subject to availability)')] },
      { name: 'Hotel Winselerhof', city: 'Landgraaf', region: 'Limburg', nights: 2, stars: 4, lat: 50.9133, lng: 6.0294, includes: [l('2 x overnachting', '2 nights'), l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'), l('4-gangendiner in Restaurant Pirandello (dag van aankomst)', '4-course dinner at Restaurant Pirandello (day of arrival)'), l('Welkomstdrankje', 'Welcome drink'), l('Gratis wandel- en fietsroutes', 'Free walking and cycling routes'), l('Late check-out tot 13:00 uur (o.b.v.b.)', 'Late check-out until 13:00 (subject to availability)'), l('Gratis parkeren', 'Free parking')] },
      { name: 'Van Oys Maastricht Retreat', city: 'Eijsden', region: 'Limburg', nights: 2, stars: 5, lat: 50.7783, lng: 5.7128, includes: [l('2 x overnachting', '2 nights'), l('Kamerupgrade naar Deluxe Room', 'Room upgrade to Deluxe Room'), l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'), l('4-gangendiner bij Restaurant Maes (Michelin-gids, avond naar keuze)', '4-course dinner at Restaurant Maes (Michelin guide, evening of your choice)'), l('Welkomstdrankje', 'Welcome drink'), l('Gebruik van Oysana spa', 'Use of the Oysana spa')] },
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
      l('2 x overnachting in Hotel Merici', '2 nights at Hotel Merici'),
      l('2 x overnachting in Hotel Winselerhof', '2 nights at Hotel Winselerhof'),
      l('2 x overnachting in Van Oys Maastricht Retreat (5* Superior)', '2 nights at Van Oys Maastricht Retreat (5* Superior)'),
      l('Kamerupgrade (Merici en Van Oys)', 'Room upgrade (Merici and Van Oys)'),
      l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'),
      l("3 x culinair diner (George's, Pirandello en Maes)", "3 x culinary dinner (George's, Pirandello and Maes)"),
      l('VIP-pas Maasmechelen Village Outlet', 'VIP pass Maasmechelen Village Outlet'),
      l('Gebruik van Oysana spa (Van Oys)', 'Use of the Oysana spa (Van Oys)'),
      l('Welkomstdrankje (Winselerhof en Van Oys)', 'Welcome drink (Winselerhof and Van Oys)'),
      l('Late check-out (Merici en Winselerhof)', 'Late check-out (Merici and Winselerhof)'),
      l('Gratis parkeren (Winselerhof)', 'Free parking (Winselerhof)'),
    ],
    tags: ['auto', 'superluxe', 'wellness', 'culinair'],
    routeImage: '/images/vakanties/004/route.jpg',
  },
  // ── Original No. 005 ──────────────────────────────────────────────────
  {
    id: 'trip-zuid-limburg',
    slug: 'bourgondisch-zuid-limburg-7-daagse-culinaire-autoroute',
    type: 'auto',
    stops: [
      { name: 'Hotel Merici', city: 'Sittard', region: 'Limburg', nights: 2, stars: 4, lat: 50.9994, lng: 5.8689, includes: [l('2 x overnachting', '2 nights'), l('Kamerupgrade naar luxer kamertype (o.b.v.b.)', 'Room upgrade (subject to availability)'), l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'), l("Culinair 3-gangendiner in Restaurant George's (dag van aankomst)", "Culinary 3-course dinner at Restaurant George's (day of arrival)"), l('VIP-pas voor Maasmechelen Village Outlet', 'VIP pass for Maasmechelen Village Outlet'), l('Late check-out tot 12:00 uur (o.b.v.b.)', 'Late check-out until 12:00 (subject to availability)')] },
      { name: 'Hotel Winselerhof', city: 'Landgraaf', region: 'Limburg', nights: 2, stars: 4, lat: 50.9133, lng: 6.0294, includes: [l('2 x overnachting', '2 nights'), l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'), l('4-gangendiner in Restaurant Pirandello (dag van aankomst)', '4-course dinner at Restaurant Pirandello (day of arrival)'), l('Welkomstdrankje', 'Welcome drink'), l('Gratis wandel- en fietsroutes', 'Free walking and cycling routes'), l('Late check-out tot 13:00 uur (o.b.v.b.)', 'Late check-out until 13:00 (subject to availability)'), l('Gratis parkeren', 'Free parking')] },
      { name: 'Hotel Monastère', city: 'Maastricht', region: 'Limburg', nights: 2, stars: 4, lat: 50.8514, lng: 5.6910, image: '/images/vakanties/005/hotel-3.jpg', includes: [l('2 x overnachting', '2 nights'), l('Kamerupgrade naar Executive Room (o.b.v.b.)', 'Room upgrade to Executive Room (subject to availability)'), l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'), l('Fles wijn op de kamer', 'Bottle of wine in the room'), l('Late check-out tot 12:00 uur (o.b.v.b.)', 'Late check-out until 12:00 (subject to availability)')] },
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
      l('2 x overnachting in Hotel Merici', '2 nights at Hotel Merici'),
      l('2 x overnachting in Hotel Winselerhof', '2 nights at Hotel Winselerhof'),
      l('2 x overnachting in Hotel Monastère', '2 nights at Hotel Monastère'),
      l('Kamerupgrade in elk hotel', 'Room upgrade at every hotel'),
      l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'),
      l("2 x culinair diner (George's en Pirandello)", "2 x culinary dinner (George's and Pirandello)"),
      l('VIP-pas Maasmechelen Village Outlet', 'VIP pass Maasmechelen Village Outlet'),
      l('Welkomstdrankje (Winselerhof) en fles wijn op de kamer (Monastère)', 'Welcome drink (Winselerhof) and bottle of wine in the room (Monastère)'),
      l('Late check-out bij elk hotel', 'Late check-out at every hotel'),
      l('Gratis parkeren (Winselerhof)', 'Free parking (Winselerhof)'),
    ],
    tags: ['auto', 'culinair', 'steden', 'budget'],
    routeImage: '/images/vakanties/005/route.jpg',
  },
  // ── Original No. 006 ──────────────────────────────────────────────────
  {
    id: 'trip-kustroute',
    slug: 'nederlandse-kustroute-6-daagse-autoroute',
    type: 'auto',
    stops: [
      { name: 'Grand Hotel Ter Duin', city: 'Burgh-Haamstede', region: 'Zeeland', nights: 2, stars: 4, lat: 51.7058, lng: 3.7494, image: '/images/vakanties/006/hotel-1.jpg', includes: [l('2 x overnachting', '2 nights'), l('Dagelijks ontbijtbuffet', 'Daily breakfast buffet'), l('3-gangendiner (dag van aankomst)', '3-course dinner (day of arrival)'), l('Tasting uurtje 17:00–18:00 uur', 'Tasting hour 17:00–18:00'), l('Welkomstdrankje', 'Welcome drink'), l('Gebruik van zwembad', 'Use of the pool'), l('Gebruik van wellness & fitness', 'Use of wellness & fitness'), l('Late check-out tot 12:00 uur', 'Late check-out until 12:00')] },
      { name: 'Inntel Hotels Den Haag Marina Beach', city: 'Scheveningen', region: 'Zuid-Holland', nights: 1, stars: 4, lat: 52.1078, lng: 4.2731, includes: [l('1 x overnachting', '1 night'), l('Uitgebreid ontbijtbuffet met bubbels', 'Extensive breakfast buffet with bubbles'), l('3-gangen verrassingsdiner', '3-course surprise dinner'), l('Gratis gebruik van binnen- en buitenzwembad', 'Free use of indoor and outdoor pool'), l('Onbeperkt gebruik van de spa en fitness', 'Unlimited use of the spa and fitness'), l('Gereduceerd parkeertarief', 'Reduced parking rate')] },
      { name: 'Carlton Square', city: 'Haarlem', region: 'Noord-Holland', nights: 2, stars: 4, lat: 52.3874, lng: 4.6462, image: '/images/vakanties/006/hotel-3.jpg', includes: [l('2 x overnachting', '2 nights'), l('Dagelijks uitgebreid ontbijt', 'Daily extensive breakfast'), l('3-gangenverrassingsmenu van de chef (dag van aankomst)', "Chef's 3-course surprise menu (day of arrival)"), l('Gratis plattegrond van de omgeving', 'Free map of the area')] },
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
      l('2 x overnachting in Grand Hotel Ter Duin', '2 nights at Grand Hotel Ter Duin'),
      l('1 x overnachting in Inntel Hotels Den Haag Marina Beach', '1 night at Inntel Hotels Den Haag Marina Beach'),
      l('2 x overnachting in Carlton Square', '2 nights at Carlton Square'),
      l('Dagelijks ontbijtbuffet (met bubbels bij Inntel)', 'Daily breakfast buffet (with bubbles at Inntel)'),
      l('3 x 3-gangendiner (dag van aankomst)', '3 x 3-course dinner (day of arrival)'),
      l('Tasting uurtje en welkomstdrankje (Ter Duin)', 'Tasting hour and welcome drink (Ter Duin)'),
      l('Zwembad, wellness en fitness (Ter Duin en Inntel)', 'Pool, wellness and fitness (Ter Duin and Inntel)'),
      l('Late check-out (Ter Duin)', 'Late check-out (Ter Duin)'),
      l('Gereduceerd parkeertarief (Inntel)', 'Reduced parking rate (Inntel)'),
    ],
    tags: ['auto', 'aan-zee', 'wellness', 'steden'],
    routeImage: '/images/vakanties/006/route.jpg',
  },
  // ── Fietsvakantie Twente & Salland (echte ViaLuxury-deal "Fietsvakantie 2026") ──
  {
    id: 'trip-fietsvakantie-twente-salland',
    slug: 'fietsvakantie-twente-en-salland-delden-raalte-markelo',
    type: 'fiets',
    stops: [
      { name: 'Hotel Wapen van Delden', city: 'Delden', region: 'Twente', province: 'Overijssel', nights: 2, stars: 4, lat: 52.2622, lng: 6.7113, image: 'https://asset.vialuxury.com/assets/9f13962b-27bb-43f9-b875-bd7b63b04c98?key=photo-full', extraImages: ['https://asset.vialuxury.com/assets/de37ddd8-3265-455d-b733-b4b123879a08?key=photo-full', 'https://asset.vialuxury.com/assets/ead7f055-ea8d-4d7b-a45b-b508d83b3396?key=photo-full'], includes: [l('2 x overnachting', '2 nights'), l('Dagelijks uitgebreid ontbijtbuffet', 'Daily extensive breakfast buffet'), l('2 x 3-gangendiner', '2 x 3-course dinner'), l('Welkomstfietstasje met water, regenponcho en bandenplaksetje', 'Welcome cycling bag with water, rain poncho and repair kit'), l('ViaLuxury welkomstcadeau', 'ViaLuxury welcome gift'), l('Bagagetransport naar Raalte', 'Luggage transfer to Raalte'), l('Gratis parkeren (gehele vakantie)', 'Free parking (whole holiday)')] },
      { name: 'Hotel de Zwaan', city: 'Raalte', region: 'Salland', province: 'Overijssel', nights: 2, stars: 3, lat: 52.3833, lng: 6.2667, includes: [l('2 x overnachting', '2 nights'), l('Dagelijks uitgebreid ontbijtbuffet', 'Daily extensive breakfast buffet'), l('2 x 3-gangendiner', '2 x 3-course dinner'), l('Fietsroutes Salland op je telefoon', 'Salland cycling routes on your phone'), l('Bagagetransport naar Markelo', 'Luggage transfer to Markelo')] },
      { name: 'Landhuishotel Herikerberg', city: 'Markelo', region: 'Twente', province: 'Overijssel', nights: 2, stars: 4, lat: 52.2361, lng: 6.5194, image: 'https://asset.vialuxury.com/assets/61164a46-85d5-4f32-8547-9f2c5727af3f?key=photo-full', extraImages: ['https://asset.vialuxury.com/assets/d79b8fd5-75cf-49a6-b558-5f28a85d9f1c?key=photo-full'], includes: [l('2 x overnachting', '2 nights'), l('Dagelijks uitgebreid ontbijtbuffet', 'Daily extensive breakfast buffet'), l('2 x 3-gangendiner', '2 x 3-course dinner'), l('Fietsroutes Twente op je telefoon', 'Twente cycling routes on your phone'), l('Bagagetransport terug naar Delden', 'Luggage transfer back to Delden')] },
    ],
    title: l('7-daagse fietsvakantie Twente & Salland: Delden – Raalte – Markelo incl. dagelijks 3-gangendiner', '7-day cycling holiday Twente & Salland: Delden – Raalte – Markelo incl. daily 3-course dinner'),
    pitch: l('Rustige fietspaden, schilderachtige dorpen en elke twee nachten een ander hotel — je bagage reist vooruit.', 'Quiet cycle paths, picturesque villages and a different hotel every two nights; your luggage travels ahead.'),
    price: 1059,
    originalPrice: 1635,
    discountPercentage: 35,
    highlights: [
      l('6 nachten / 3 hotels', '6 nights / 3 hotels'),
      l('Dagelijks 3-gangendiner', 'Daily 3-course dinner'),
      l('Dagelijkse bagagetransfer', 'Daily luggage transfer'),
      l('Fietsroutes op je telefoon', 'Cycling routes on your phone'),
    ],
    inclusions: [
      l('2 x overnachting in Hotel Wapen van Delden', '2 nights at Hotel Wapen van Delden'),
      l('2 x overnachting in Hotel de Zwaan', '2 nights at Hotel de Zwaan'),
      l('2 x overnachting in Landhuishotel Herikerberg', '2 nights at Landhuishotel Herikerberg'),
      l('Dagelijks uitgebreid ontbijtbuffet', 'Daily extensive breakfast buffet'),
      l('Dagelijks 3-gangendiner', 'Daily 3-course dinner'),
      l('Bagagetransport tussen de hotels', 'Luggage transfer between the hotels'),
      l('Fietsroutes Twente & Salland op je telefoon', 'Twente & Salland cycling routes on your phone'),
      l('Welkomstfietstasje en ViaLuxury welkomstcadeau', 'Welcome cycling bag and ViaLuxury welcome gift'),
      l('Gratis parkeren (gehele vakantie)', 'Free parking (whole holiday)'),
    ],
    tags: ['fiets', 'natuur', 'culinair'],
  },
]


const NL_PROVINCES = new Set(['Drenthe', 'Flevoland', 'Friesland', 'Gelderland', 'Groningen', 'Limburg', 'Noord-Brabant', 'Noord-Holland', 'Overijssel', 'Utrecht', 'Zeeland', 'Zuid-Holland'])
const isNlProvince = (s: string) => NL_PROVINCES.has(s)

/** Quick-filter-tags → thema-woorden die de gewone filters (filterTags.ts)
 *  herkennen, zodat een vakantie ook in de reguliere zoekresultaten op
 *  "Kasteelhotels", "Wellness", "Aan zee" enz. matcht. */
const TAG_THEMES: Record<string, string> = {
  kasteel: 'Kasteelhotels',
  wellness: 'Wellness',
  'aan-zee': 'Aan zee',
  natuur: 'In de natuur',
  culinair: 'Culinair genieten',
  steden: 'Stedentrip',
  fiets: 'Fietsvakantie',
  superluxe: '5-sterren luxe',
}

function findHotel(name: string): SearchHotel | undefined {
  const lower = name.toLowerCase()
  return mappedHotels.find(h => h.name.toLowerCase() === lower)
}

/** Eén hotel van een vakantie, zoals de vakantie-PDP het toont. */
export interface MultiHotelTripDetailStop extends MultiHotelTripStop {
  nights: number
  region: string
  /** "Inclusief"-vinkjes van dit hotel. */
  includes: LocalizedString[]
  /** Extra foto's voor de PDP-gallery (naast `image`). */
  extraImages?: string[]
  /** Eerste en laatste reisdag in dit hotel (dag 1 = aankomstdag). */
  dayFrom: number
  dayTo: number
}

/** Alles wat de vakantie-PDP nodig heeft, per vakantie-slug. */
export interface MultiHotelTripDetail {
  id: string
  slug: string
  type: MultiHotelTripType
  title: LocalizedString
  pitch: LocalizedString
  price: number
  originalPrice: number
  discountPercentage: number
  nights: number
  highlights: LocalizedString[]
  inclusions: LocalizedString[]
  stops: MultiHotelTripDetailStop[]
  tags: string[]
  routeImage?: string
  reviewScore: number
  reviewCount: number
}

function toStop(s: StopSpec, dayFrom: number): MultiHotelTripDetailStop {
  const h = findHotel(s.name)
  return {
    city: s.city || h?.city || '',
    region: s.region || h?.province || h?.region || '',
    province: s.province ?? (h?.province || (isNlProvince(s.region) ? s.region : undefined)),
    hotelName: h?.name ?? s.name,
    hotelSlug: h?.slug,
    nights: s.nights,
    starRating: h?.starRating ?? s.stars,
    image: h?.heroImage ?? s.image,
    lat: s.lat,
    lng: s.lng,
    includes: s.includes,
    extraImages: s.extraImages,
    dayFrom,
    dayTo: dayFrom + s.nights - 1,
  }
}

function buildTrip(spec: TripSpec): { hotel: SearchHotel; detail: MultiHotelTripDetail } | null {
  const stops: MultiHotelTripDetailStop[] = []
  let day = 1
  for (const s of spec.stops) {
    stops.push(toStop(s, day))
    day += s.nights
  }
  if (stops.length < 2) return null
  const known = spec.stops.map(s => findHotel(s.name)).filter((h): h is SearchHotel => !!h)
  const first = stops[0]!
  const nights = stops.reduce((n, s) => n + s.nights, 0)
  const stars = stops.map(s => s.starRating ?? 4)
  const avgStars = Math.round(stars.reduce((a, b) => a + b, 0) / stars.length)
  const avgScore = known.length
    ? Math.round((known.reduce((s, h) => s + h.reviewScore, 0) / known.length) * 10) / 10
    : 8.8
  const reviewCount = known.length ? known.reduce((s, h) => s + h.reviewCount, 0) : 164
  const discount = spec.discountPercentage ?? Math.round((1 - spec.price / spec.originalPrice) * 100)
  const pdpHref = `/multi-hotel-trip/deal/${spec.slug}`
  const deal: SearchHotelDeal = {
    id: `${spec.id}-deal`,
    slug: spec.slug,
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
    themes: [
      spec.type === 'fiets' ? 'Fietsvakantie' : 'Autovakantie',
      'Vakanties',
      ...spec.tags.map(t => TAG_THEMES[t]).filter((t): t is string => !!t),
    ],
  }
  const hotel: SearchHotel = {
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
      pdpHref,
    },
  }
  const detail: MultiHotelTripDetail = {
    id: spec.id,
    slug: spec.slug,
    type: spec.type,
    title: spec.title,
    pitch: spec.pitch,
    price: spec.price,
    originalPrice: spec.originalPrice,
    discountPercentage: discount,
    nights,
    highlights: spec.highlights,
    inclusions: spec.inclusions,
    stops,
    tags: spec.tags,
    routeImage: spec.routeImage,
    reviewScore: avgScore,
    reviewCount,
  }
  return { hotel, detail }
}

const built = TRIPS
  .map(buildTrip)
  .filter((t): t is { hotel: SearchHotel; detail: MultiHotelTripDetail } => t !== null)

/** Alle meerhotel-vakanties als SearchHotel-records (met `trip` gezet). */
export const tripSearchHotels: SearchHotel[] = built.map(b => b.hotel)

/** Vakantie-slug → detailrecord voor de vakantie-PDP. */
export const tripDetailBySlug: Record<string, MultiHotelTripDetail> = Object.fromEntries(
  built.map(b => [b.detail.slug, b.detail]),
)
