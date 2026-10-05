/**
 * Multi Hotel Trip — redactionele inhoud van de vakantie-PDP, per vakantie:
 * de samenvattende beschrijving (eerste alinea = teaser, de rest in de
 * "Lees meer"-pop-up), de highlights, korte hotelbeschrijvingen met
 * faciliteiten (hotel-pop-up) en het dagprogramma.
 *
 * Het dagprogramma bevat alleen de redactionele blokken: wat je onderweg
 * kunt doen op een uitcheckdag (`route`), wat je kunt ontdekken op een
 * verblijfsdag (`activities`) en de terugreis (`homeward`). De vaste blokken
 * (inchecken, uitchecken, diner) bouwt `mht-trip-pdp.ts` zelf uit de
 * hotelgegevens. Teksten zijn gebaseerd op de briefing-PDF's ("Original No.
 * 001–006"); de streekfoto's komen van Wikimedia Commons (bronvermelding in
 * public/images/vakanties/CREDITS.md).
 */
import type { LocalizedString } from '~/i18n/types'

const l = (nl: string, en: string): LocalizedString => ({ nl, en })

export interface TripHotelInfo {
  description: LocalizedString
  /** Verleidelijke hoofdstuktitel in het reisschema "Per stad" — de bekende
   *  plek in de buurt i.p.v. de (onbekende) plaatsnaam van het hotel, bv.
   *  "Omgeving van het bruisende Lille". Zonder titel: "In en rond {plaats}". */
  chapterTitle?: LocalizedString
  /** Faciliteiten als labels; het icoon komt uit utils facilityIcon. */
  facilities: string[]
  /** Kamer(type) waarin je verblijft, voor het kamerblok in de hotel-pop-up. */
  room?: { name: LocalizedString; description: LocalizedString; image?: string }
  /** "Tips tijdens je reis" voor dit hotel ("Wat te doen tijdens je vakantie", variant Per stad):
   *  een eigen lijst, los van het dagprogramma. Zonder tips: de uitjes uit het dagprogramma (max. 3). */
  tips?: { title: LocalizedString; text: LocalizedString; image?: string }[]
}

/** "Meer over …"-pop-up bij een dagblok: het blok zelf blijft kort, de
 *  achtergrond (geschiedenis, tips) zit achter een klik. */
export interface TripMoreInfo {
  /** Linktekst: "Meer over de Opaalkust". */
  label: LocalizedString
  title: LocalizedString
  paragraphs: LocalizedString[]
  image?: string
}

export interface TripDayBlockSpec {
  title: LocalizedString
  text: LocalizedString
  image?: string
  more?: TripMoreInfo
  /** Etappefeiten onder de kop (fietsvakantie): "45 km · ca. 3 uur fietsen · licht heuvelachtig · lunch in Holten". */
  meta?: LocalizedString
}

export interface TripDaySpec {
  day: number
  /** Regel in de dagsamenvatting "Voorbeeld reisschema" ("Utrecht → Château Tilques · ca. 3 uur 45 min. ·
   *  3-gangendiner"); zonder regel bouwt de pagina er een uit de blokken. */
  summary?: LocalizedString
  /** Kop van de dag in het uitgebreide reisschema (i.p.v. het sjabloon "Aankomst in …"). */
  heading?: LocalizedString
  /** Eigen tekst voor het dinerblok (restaurantnaam, keuken) i.p.v. het sjabloon. */
  dinner?: { text: LocalizedString }
  /** Eigen tekst voor het incheckblok van deze dag (dag 1: de heenreis en de
   *  inchecktijd; wisseldag: aankomst bij het volgende hotel) i.p.v. de
   *  hotelbeschrijving — die zit achter "Meer over hotel …". */
  arrival?: { text: LocalizedString; image?: string }
  /** Eigen ontbijttekst voor deze ochtend (anders het vaste sjabloon; op een
   *  uitcheckdag het "laatste ontbijt"-sjabloon). `false` = geen apart
   *  ontbijtblok (het ontbijt wordt in het volgende blok genoemd). */
  breakfast?: { text: LocalizedString } | false
  /** Uitcheckdag: wat je onderweg naar het volgende hotel kunt doen. */
  route?: TripDayBlockSpec
  /** Verblijfsdag (of aankomstdag): 1–2 blokken. */
  activities?: TripDayBlockSpec[]
  /** Laatste dag: terugreis. */
  homeward?: TripDayBlockSpec
}

/** Omgevingshighlight op de fullscreen kaart: icoon op de kaart, hover met foto + uitleg. */
/** Soort bezienswaardigheid — bepaalt het icoontje in de witte pin op de grote kaart. */
export type TripPoiKind = 'city' | 'village' | 'castle' | 'nature' | 'museum' | 'beach' | 'water' | 'tower' | 'church' | 'shopping'

export interface TripMapHighlight {
  name: LocalizedString
  lat: number
  lng: number
  kind?: TripPoiKind
  text: LocalizedString
  image?: string
}

/** Reizigersbeoordeling van de hele vakantie (carrousel onder de minimap):
 *  kaart met een gekozen citaat (`quote`) en "Meer info" → pop-up met titel,
 *  maand van de vakantie, score en de volledige review (`text`). */
export interface TripReviewSpec {
  author: string
  /** Landcode voor het vlaggetje: NL, BE, DE. */
  country: 'NL' | 'BE' | 'DE'
  avatar?: string
  /** Maand van de vakantie (YYYY-MM). */
  month: string
  score: number
  title: LocalizedString
  quote: LocalizedString
  text: LocalizedString
}

export interface TripItinerarySpec {
  /** Drie beoordelingen van de vakantie onder "Je reis in het kort" (variant
   *  "Reviews"); zonder eigen reviews vallen we terug op die van het eerste hotel. */
  reviews?: TripReviewSpec[]
  /** Kop boven de beschrijving ("7-daagse reis met eigen vervoer in Noord-Frankrijk");
   *  zonder eigen titel het sjabloon `trip.introTitleAuto/Bike`. */
  introTitle?: LocalizedString
  /** "Het volgende is inbegrepen" — rijen over de volle breedte boven het
   *  reisschema: de hotels met een foto (`image`), de overige punten met een
   *  icoon (`icon`, /icons/facilities/…). */
  included?: { title: LocalizedString; text: LocalizedString; longText?: LocalizedString; image?: string; icon?: string }[]
  /** Alinea's; de eerste is de teaser op de pagina. */
  description: LocalizedString[]
  highlights: LocalizedString[]
  /** Op hotelnaam (zoals in mht-trips.ts). */
  hotels: Record<string, TripHotelInfo>
  days: TripDaySpec[]
  /** Alle in het dagprogramma genoemde plekken, voor de fullscreen kaart. */
  mapHighlights: TripMapHighlight[]
}

const img = (nr: string, key: string) => `/images/vakanties/${nr}/${key}.jpg`
/** Basis-URL van de foto's van de echte deal (asset.vialuxury.com). */
const A = 'https://asset.vialuxury.com/assets/'
const FIETS = {
  bike: 'https://asset.vialuxury.com/assets/de37ddd8-3265-455d-b733-b4b123879a08?key=photo-full',
  sunrise: 'https://asset.vialuxury.com/assets/1ea82fdb-df82-4166-a63e-552ce8f8d5a2?key=photo-full',
  cows: 'https://asset.vialuxury.com/assets/e514d19b-3163-49ad-8154-ded3d38f84a5?key=photo-full',
  cyclists: 'https://asset.vialuxury.com/assets/d79b8fd5-75cf-49a6-b558-5f28a85d9f1c?key=photo-full',
  map: 'https://asset.vialuxury.com/assets/2853cf0d-63cb-4998-9f75-471f2d2795b1?key=photo-full',
  deventer: 'https://asset.vialuxury.com/assets/ead7f055-ea8d-4d7b-a45b-b508d83b3396?key=photo-full',
}

export const TRIP_ITINERARIES: Record<string, TripItinerarySpec> = {
  // ── 001 Noord-Frankrijk & Opaalkust ───────────────────────────────────
  'trip-noord-frankrijk': {
    // Inhoud sinds 2026-10-05 volgens het reisdocument ("Info docu"): route Tilques → Cléry →
    // Béthune, voorbeeldprogramma, reis van dag tot dag, tips per hotel en de hotelinclusies.
    reviews: [
      { author: 'Marleen en Jos', country: 'NL', month: '2026-06', score: 9.4,
        title: l('Elke dag een ander decor', 'A different setting every day'),
        quote: l('De route is precies goed: nergens lang rijden en elke dag iets nieuws.', 'The route is just right: no long drives and something new every day.'),
        text: l('Drie heel verschillende hotels en alle drie een schot in de roos. Château Tilques heeft een park waar je \'s ochtends de reeën ziet, Cléry ligt op een kwartier van zee en het herenhuis in Béthune om de hoek van de Grand-Place. De route is precies goed: nergens lang rijden en elke dag iets nieuws.\n\nHet diner op de aankomstdag was elke keer een feest; bij Le Vert Mesnil duurde het wat lang, maar het was heerlijk. De bacôve door het Marais Audomarois en de kliffen van Cap Blanc-Nez waren voor ons de hoogtepunten. Wij gaan zeker nog eens.',
          'Three very different hotels and all three spot on. Château Tilques has a park where you see deer in the morning, Cléry is fifteen minutes from the sea and the mansion in Béthune is around the corner from the Grand-Place. The route is just right: no long drives and something new every day.\n\nDinner on the day of arrival was a treat every time; at Le Vert Mesnil it took a while, but it was delicious. The bacôve through the Marais Audomarois and the cliffs of Cap Blanc-Nez were our highlights. We will certainly go again.') },
      { author: 'Familie De Vries', country: 'NL', month: '2026-05', score: 9.0,
        title: l('Béthune als verrassende afsluiter', 'Béthune, a surprising finale'),
        quote: l('Fijn dat het ontbijt en het diner op de aankomstdag al geregeld waren.', 'Nice that breakfast and dinner on the day of arrival were already arranged.'),
        text: l('Béthune kenden we niet, maar wat een verrassende afsluiter: een levendig plein met terrassen en het belfort dat je \'s avonds verlicht ziet vanaf het hotel. Fijn dat het ontbijt en het diner op de aankomstdag al geregeld waren; na een dag rijden hoef je \'s avonds niets meer te zoeken.\n\nMet de kinderen was Nausicaá in Boulogne-sur-Mer het hoogtepunt, en het strand van Hardelot was ideaal om uit te waaien. De kamer in Béthune was aan de kleine kant, de kastelen waren ruim en rustig. Al met al een heel geslaagde week.',
          'We had never heard of Béthune, but what a surprising finale: a lively square with terraces and the belfry lit up in the evening, seen from the hotel. Nice that breakfast and dinner on the day of arrival were already arranged; after a day of driving there is nothing to look for in the evening.\n\nWith the children, Nausicaá in Boulogne-sur-Mer was the highlight, and the beach at Hardelot was ideal for a breath of fresh air. The room in Béthune was on the small side, the châteaux were spacious and quiet. All in all a very successful week.') },
      { author: 'Pieter', country: 'BE', avatar: '/images/reviews/pieter.jpg', month: '2026-04', score: 8.8,
        title: l('De Opaalkust als hart van de reis', 'The Opal Coast at the heart of the trip'),
        quote: l('De wandeling over de kliffen bij Cap Blanc-Nez vergeten we niet snel.', 'We will not soon forget the walk along the cliffs at Cap Blanc-Nez.'),
        text: l('Wij zochten een korte reis zonder lange dagen in de auto en dat is precies wat dit is. Twee nachten per hotel is genoeg om de omgeving te zien en toch tot rust te komen. Château Cléry vlak bij de kust was voor ons het hart van de reis; de wandeling over de kliffen bij Cap Blanc-Nez vergeten we niet snel.\n\nKleine kanttekening: parkeren in Béthune is even zoeken, de garage ligt een paar straten verderop. Het personeel in alle drie de hotels was hartelijk en het ontbijt overal ruim. Een aanrader voor wie Noord-Frankrijk nog niet kent.',
          'We were looking for a short trip without long days in the car and that is exactly what this is. Two nights per hotel is enough to see the area and still unwind. Château Cléry close to the coast was the heart of the trip for us; we will not soon forget the walk along the cliffs at Cap Blanc-Nez.\n\nSmall note: parking in Béthune takes some searching, the garage is a few streets away. The staff at all three hotels were warm and breakfast was generous everywhere. Recommended for anyone who does not yet know Northern France.') },
    ],
    description: [
      l('Ontdek een van de mooiste stukjes van Noord-Frankrijk. Zeven dagen lang reis je door drie totaal verschillende decors: de stille moerassen rond Saint-Omer, de krijtkust van de Opaalkust en het levendige Béthune met zijn UNESCO-belfort. Je verblijft steeds twee nachten in een bijzonder hotel en geniet op iedere aankomstdag van een 3-gangendiner.',
        'Discover one of the most beautiful parts of Northern France. For seven days you travel through three completely different settings: the quiet marshes around Saint-Omer, the chalk coast of the Opal Coast and lively Béthune with its UNESCO belfry. You always stay two nights in a special hotel and enjoy a 3-course dinner on every arrival day.'),
      l('Je begint bij Château Tilques, een karaktervol kasteel in een groen park vlak bij Saint-Omer. Daarna verblijf je bij Château Cléry in Hesdin-l\'Abbé, waar je binnen circa 15 minuten aan de Opaalkust staat. De laatste twee nachten slaap je bij Hotel Royal Beaulaincourt, midden in het historische centrum van Béthune.',
        'You start at Château Tilques, a characterful château in a green park near Saint-Omer. Then you stay at Château Cléry in Hesdin-l\'Abbé, from where you are on the Opal Coast in about 15 minutes. You spend the last two nights at Hotel Royal Beaulaincourt, in the heart of historic Béthune.'),
      l('De etappes zijn bewust kort: gemiddeld slechts 55 minuten, zodat je onderweg alle tijd hebt voor bijzondere plekken als de moerassen rond Saint-Omer, Cap Blanc-Nez en de monumentale pleinen van Arras. Vaar onderweg in een traditionele bacôve, wandel langs de krijtrotsen van de Opaalkust of dwaal door de oude vestingstad van Boulogne-sur-Mer.',
        'The legs are deliberately short, only 55 minutes on average, leaving plenty of time for special places such as the marshes around Saint-Omer, Cap Blanc-Nez and the monumental squares of Arras. Sail in a traditional bacôve, walk along the chalk cliffs of the Opal Coast or wander through the old fortified town of Boulogne-sur-Mer.'),
      l('Dankzij de korte etappes voelt ook een reisdag als een vakantiedag.',
        'Thanks to the short legs, even a travel day feels like a holiday.'),
    ],
    highlights: [
      l('6 nachten in 3 bijzondere hotels, waaronder twee kastelen', '6 nights in 3 special hotels, including two châteaux'),
      l('Inclusief 3 × 3-gangendiner op de dag van aankomst', 'Including 3 × 3-course dinner on the day of arrival'),
      l('Stad, natuur en kust in één reis', 'City, nature and coast in one trip'),
      l('Korte etappes van gemiddeld circa 55 minuten', 'Short legs of around 55 minutes on average'),
      l('Zwembad & sauna', 'Pool & sauna'),
      l('Gratis parkeren bij de kastelen', 'Free parking at the châteaux'),
    ],
    hotels: {
      'Château Tilques': {
        chapterTitle: l('Saint-Omer & omgeving', 'Saint-Omer & surroundings'),
        description: l('Een karaktervol 19e-eeuws kasteel van rode baksteen in een groen park van vier hectare, vlak bij Saint-Omer. De 53 kamers liggen verdeeld over het kasteel en de voormalige stallen; restaurant Le Vert Mesnil zit in een 17e-eeuws bijgebouw van het château. Met verwarmd binnenzwembad, tennisbaan en jeu de boules.',
          'A characterful 19th-century red-brick château in a green four-hectare park near Saint-Omer. The 53 rooms are spread over the château and the former stables; restaurant Le Vert Mesnil is in a 17th-century outbuilding of the château. With a heated indoor pool, tennis court and pétanque.'),
        facilities: ['Restaurant Le Vert Mesnil', 'Bar', 'Verwarmd binnenzwembad', 'Tennisbaan', 'Jeu de boules', 'Park van 4 hectare', 'Gratis parkeren', 'Gratis wifi'],
        room: { name: l('Chambre Charme', 'Chambre Charme'), description: l('De Chambre Charme ligt in het kasteel of de voormalige stallen en is ingericht in warme tinten met klassieke stoffen. Vanuit het raam kijk je uit over het park; de badkamer heeft een bad of ruime douche.', 'The Chambre Charme is located in the château or the former stables and is decorated in warm tones with classic fabrics. The window looks out over the park; the bathroom has a bath or a spacious shower.'), image: '/images/vakanties/001/tilques-4.jpg' },
        tips: [
          { title: l('Ontdek historisch Saint-Omer', 'Discover historic Saint-Omer'),
            text: l('Ontdek het historische centrum van Saint-Omer, dwaal door de karakteristieke straten en bewonder de indrukwekkende kathedraal.', 'Discover the historic centre of Saint-Omer, wander through its characteristic streets and admire the impressive cathedral.'),
            image: '/images/vakanties/001/nearby-saint-omer.jpg' },
          { title: l('Maak een rit met de authentieke stoomtrein', 'Ride the authentic steam train'),
            text: l('Stap aan boord van een historische stoomtrein en ontdek de Vallée de l\'Aa op een bijzondere en nostalgische manier.', 'Board a historic steam train and discover the Vallée de l\'Aa in a special, nostalgic way.'),
            image: '/images/vakanties/001/nearby-stoomtrein.jpg' },
          { title: l('Bezoek La Coupole', 'Visit La Coupole'),
            text: l('Duik in de geschiedenis bij La Coupole, een indrukwekkende voormalige bunker die tegenwoordig onderdak biedt aan een museum en planetarium.', 'Dive into history at La Coupole, an impressive former bunker that now houses a museum and planetarium.'),
            image: '/images/vakanties/001/placeholder-la-coupole.svg' },
          { title: l('Vaar met een traditionele bacôve door het Marais Audomarois', 'Sail a traditional bacôve through the Marais Audomarois'),
            text: l('Ontdek het bijzondere landschap rond Saint-Omer vanaf het water. Stap aan boord van een traditionele bacôve, een houten boot die van oudsher door de tuinders van het moeras werd gebruikt. Vaar door smalle waterwegen, langs eilandjes, rietkragen en moestuinen en ervaar het Marais Audomarois op een typisch lokale manier.', 'Discover the special landscape around Saint-Omer from the water. Board a traditional bacôve, a wooden boat long used by the marsh gardeners. Sail through narrow waterways, past islets, reed beds and vegetable gardens and experience the Marais Audomarois the local way.'),
            image: '/images/vakanties/001/nearby-marais.jpg' },
          { title: l('Restauranttip: Bacôve in Saint-Omer', 'Restaurant tip: Bacôve in Saint-Omer'),
            text: l('Maak van je vrije avond een culinaire belevenis bij Bacôve, het restaurant van chef Camille Delcroix. Het restaurant heeft één Michelinster en ontleent zijn naam aan de traditionele boten van het moeras. De keuken laat zich inspireren door Saint-Omer en de producten uit de omgeving.', 'Make your free evening a culinary experience at Bacôve, the restaurant of chef Camille Delcroix. The restaurant has one Michelin star and takes its name from the traditional boats of the marsh. The kitchen is inspired by Saint-Omer and local produce.'),
            image: '/images/vakanties/001/placeholder-restaurant-bacove.svg' },
        ],
      },
      'Château Cléry': {
        chapterTitle: l('Opaalkust & Boulogne-sur-Mer', 'Opal Coast & Boulogne-sur-Mer'),
        description: l('Een 18e-eeuws kasteel op een groen landgoed van vijf hectare in Hesdin-l\'Abbé, op circa 15 minuten van de Opaalkust en Boulogne-sur-Mer. De 28 kamers liggen in het kasteel en de bijgebouwen rond de tuin met hortensia\'s. Diner bij restaurant Le Berthier in de serre, ontspannen in de sauna.',
          'An 18th-century château on a green five-hectare estate in Hesdin-l\'Abbé, about 15 minutes from the Opal Coast and Boulogne-sur-Mer. The 28 rooms are in the château and outbuildings around the hydrangea garden. Dinner at restaurant Le Berthier in the conservatory, relaxation in the sauna.'),
        facilities: ['Restaurant Le Berthier in de serre', 'Bar', 'Sauna', 'Fitnessruimte', 'Landgoed van 5 hectare', 'Gratis parkeren', 'Gratis wifi', 'Fietsverhuur'],
        room: { name: l('Chambre Charme', 'Chambre Charme'), description: l('Een sfeervolle kamer in het kasteel of een van de bijgebouwen rond de tuin, met klassiek meubilair, een comfortabel bed en zicht op het landgoed. Rustig gelegen, op een steenworp van de serre en de sauna.', "A charming room in the château or one of the outbuildings around the garden, with classic furniture, a comfortable bed and views of the estate. Quietly located, a stone's throw from the conservatory and the sauna."), image: '/images/vakanties/001/clery-6.jpg' },
        tips: [
          { title: l('Ontdek de Opaalkust', 'Discover the Opal Coast'),
            text: l('Vanuit Château Cléry sta je in circa 15 minuten aan zee bij Hardelot-Plage. Wandel over het brede zandstrand, geniet van de zeelucht of neem plaats op een terras.', 'From Château Cléry you are by the sea at Hardelot-Plage in about 15 minutes. Walk along the wide sandy beach, enjoy the sea air or take a seat on a terrace.'),
            image: '/images/vakanties/001/placeholder-hardelot.svg' },
          { title: l('Ontdek Boulogne-sur-Mer', 'Discover Boulogne-sur-Mer'),
            text: l('Wandel door de historische ommuurde bovenstad, bewonder de basiliek en ontdek de haven en boulevard van deze veelzijdige kuststad.', 'Walk through the historic walled upper town, admire the basilica and discover the harbour and boulevard of this versatile coastal town.'),
            image: '/images/vakanties/001/nearby-boulogne.jpg' },
          { title: l('Bezoek Nausicaá', 'Visit Nausicaá'),
            text: l('Duik in de fascinerende onderwaterwereld van Nausicaá in Boulogne-sur-Mer, een indrukwekkend centrum dat volledig in het teken staat van de zee.', 'Dive into the fascinating underwater world of Nausicaá in Boulogne-sur-Mer, an impressive centre entirely devoted to the sea.'),
            image: '/images/vakanties/001/nearby-nausicaa.jpg' },
          { title: l('Bewonder Les Deux Caps', 'Admire Les Deux Caps'),
            text: l('Voor het spectaculairste landschap van de Opaalkust rijd je in circa 40 minuten naar Cap Blanc-Nez en Cap Gris-Nez, samen bekend als Les Deux Caps. Wandel langs de kliffen en geniet van weidse uitzichten over Het Kanaal. Bij helder weer kun je vanaf Cap Gris-Nez zelfs de Engelse kust zien liggen.', 'For the most spectacular scenery of the Opal Coast, drive about 40 minutes to Cap Blanc-Nez and Cap Gris-Nez, together known as Les Deux Caps. Walk along the cliffs and enjoy sweeping views over the Channel. On a clear day you can even see the English coast from Cap Gris-Nez.'),
            image: '/images/vakanties/001/blancnez.jpg' },
          { title: l('Daal af in de crypte van Boulogne-sur-Mer', 'Descend into the crypt of Boulogne-sur-Mer'),
            text: l('Onder de basiliek Notre-Dame wacht een verrassende ondergrondse wereld. Wandel door een doolhof van circa 1.400 m² en ontdek archeologische vondsten, eeuwenoude kunst en bijzondere muurschilderingen. De verschillende ruimtes vertellen samen meer dan 2.000 jaar geschiedenis van Boulogne-sur-Mer.', 'Beneath the Notre-Dame basilica lies a surprising underground world. Walk through a maze of about 1,400 m² and discover archaeological finds, centuries-old art and remarkable murals. Together the rooms tell more than 2,000 years of the history of Boulogne-sur-Mer.'),
            image: '/images/vakanties/001/placeholder-crypte.svg' },
          { title: l('Ontmoet de ambachtslieden van de Boulonnais', 'Meet the craftspeople of the Boulonnais'),
            text: l('Ontdek tijdens je dag aan de kust ook de ambachtelijke kant van de regio. In en rondom Wimereux vind je lokale makers, waaronder een ambachtelijke koekjesmaker waar zoete en hartige lekkernijen met zoveel mogelijk regionale ingrediënten worden gemaakt.', 'During your day on the coast, also discover the artisan side of the region. In and around Wimereux you will find local makers, including an artisan biscuit maker who makes sweet and savoury treats with as many regional ingredients as possible.'),
            image: '/images/vakanties/001/placeholder-ambachtslieden.svg' },
          { title: l('Restauranttip: Gogaille in Wissant', 'Restaurant tip: Gogaille in Wissant'),
            text: l('Combineer je dag aan de Opaalkust met een lunch of diner bij Gogaille in Wissant. Deze sfeervolle bistro werkt met verse producten en kiest voor een lokale, seizoensgebonden en huisgemaakte Franse keuken.', 'Combine your day on the Opal Coast with lunch or dinner at Gogaille in Wissant. This atmospheric bistro works with fresh produce and serves local, seasonal, homemade French cuisine.'),
            image: '/images/vakanties/001/placeholder-gogaille.svg' },
        ],
      },
      'Hotel Royal Beaulaincourt': {
        chapterTitle: l('Béthune & omgeving', 'Béthune & surroundings'),
        description: l('Een 18e-eeuws hôtel particulier midden in het historische centrum van Béthune, in 2023 volledig gerestaureerd tot een viersterrenhotel met 34 kamers. Achter de klassieke gevel vind je een lichte binnenplaats, een bistronomisch restaurant met lokale en seizoensgebonden ingrediënten en een bar in de oude salons. De Grand-Place met het belfort ligt om de hoek.',
          'An 18th-century private mansion in the heart of historic Béthune, fully restored in 2023 into a four-star hotel with 34 rooms. Behind the classical façade: a bright courtyard, a bistronomic restaurant using local, seasonal ingredients and a bar in the old salons. The Grand-Place and belfry are around the corner.'),
        facilities: ['Restaurant (bistronomisch)', 'Bar', 'Terras op de binnenplaats', 'Gratis wifi', 'Airconditioning', 'Lift', 'Fietsenstalling', 'Parkeergarage nabij (betaald)'],
        room: { name: l('Privilege Room', 'Privilege Room'), description: l('Verblijf in het stijlvolle Privilege Room, waar comfort en elegantie samenkomen. De kamer is ruim en smaakvol ingericht en biedt alle gemakken voor een ontspannen verblijf in het hart van Béthune.', 'Stay in the stylish Privilege Room, where comfort and elegance meet. The room is spacious and tastefully furnished and offers every convenience for a relaxed stay in the heart of Béthune.'), image: '/images/vakanties/001/beaulaincourt-3.jpg' },
        tips: [
          { title: l('Ontdek Béthune', 'Discover Béthune'),
            text: l('Vanuit het hotel wandel je zo het historische centrum van Béthune in. De Grand\'Place met zijn karakteristieke gevels, terrassen en belfort vormt het levendige hart van de stad.', 'From the hotel you walk straight into the historic centre of Béthune. The Grand\'Place with its characteristic façades, terraces and belfry is the lively heart of the town.'),
            image: '/images/vakanties/001/nearby-bethune.jpg' },
          { title: l('Ontdek Lille', 'Discover Lille'),
            text: l('Maak een uitstap naar Lille en ontdek Vieux-Lille, de winkels, musea, historische architectuur en vele restaurants en terrassen.', 'Make a trip to Lille and discover Vieux-Lille, the shops, museums, historic architecture and many restaurants and terraces.'),
            image: '/images/vakanties/001/nearby-lille.jpg' },
          { title: l('Ontdek de monumentale pleinen van Arras', 'Discover the monumental squares of Arras'),
            text: l('Maak op weg naar Béthune een tussenstop in Arras. Wandel over de indrukwekkende Grand\'Place en Place des Héros, bewonder de historische gevels en het markante belfort en neem plaats op een terras voor een koffie of lunch.', 'On the way to Béthune, stop off in Arras. Walk across the impressive Grand\'Place and Place des Héros, admire the historic façades and the striking belfry and take a seat on a terrace for coffee or lunch.'),
            image: '/images/vakanties/001/arras.jpg' },
          { title: l('Bewonder meesterwerken in Louvre-Lens', 'Admire masterpieces at Louvre-Lens'),
            text: l('Kunstliefhebber? Bezoek Louvre-Lens en wandel door de bijzondere Galerie du Temps. In één grote open ruimte worden honderden kunstwerken uit verschillende tijdperken chronologisch gepresenteerd. Ook het moderne museumgebouw maakt een bezoek bijzonder.', 'Art lover? Visit Louvre-Lens and walk through the remarkable Galerie du Temps. Hundreds of works of art from different periods are presented chronologically in one large open space. The modern museum building also makes a visit special.'),
            image: '/images/vakanties/001/placeholder-louvre-lens.svg' },
          { title: l('Restauranttip: Maison Renard in Béthune', 'Restaurant tip: Maison Renard in Béthune'),
            text: l('Sluit je reis culinair af bij Maison Renard in Béthune. Chef Sébastien Renard ontvangt zijn gasten in een sfeervol historisch herenhuis met een warme, eigentijdse inrichting. Een mooie keuze voor de vrije avond tijdens je verblijf in Béthune.', 'End your trip on a culinary note at Maison Renard in Béthune. Chef Sébastien Renard welcomes his guests in an atmospheric historic mansion with a warm, contemporary interior. A fine choice for the free evening during your stay in Béthune.'),
            image: '/images/vakanties/001/placeholder-maison-renard.svg' },
        ],
      },
    },
    introTitle: l('7-daagse reis met eigen vervoer in Noord-Frankrijk', '7-day trip by car in Northern France'),
    included: [
      { title: l('2 overnachtingen in Château Tilques', '2 nights at Château Tilques'),
        text: l('Twee nachten in het karaktervolle 19e-eeuwse kasteel in een groen park vlak bij Saint-Omer.', 'Two nights in the characterful 19th-century château in a green park near Saint-Omer.'),
        longText: l('Twee nachten in het 19e-eeuwse kasteel van rode baksteen in een park van vier hectare, vlak bij Saint-Omer. Je Chambre Charme ligt in het kasteel of de voormalige stallen en kijkt uit op het park; met verwarmd binnenzwembad, tennis en jeu de boules. Late check-out tot 14:00 uur en gratis parkeren.',
          'Two nights in the 19th-century red-brick château in a four-hectare park near Saint-Omer. Your Chambre Charme is in the château or the former stables and looks out over the park; with a heated indoor pool, tennis and pétanque. Late check-out until 14:00 and free parking.'),
        image: '/images/vakanties/001/tilques-1.jpg' },
      { title: l('2 overnachtingen in Château Cléry', '2 nights at Château Cléry'),
        text: l('Twee nachten op het landgoed in Hesdin-l\'Abbé, op circa 15 minuten van de Opaalkust.', 'Two nights on the estate in Hesdin-l\'Abbé, about 15 minutes from the Opal Coast.'),
        longText: l('Twee nachten in het 18e-eeuwse kasteel op een landgoed van vijf hectare in Hesdin-l\'Abbé, op circa 15 minuten van Hardelot-Plage en Boulogne-sur-Mer. Je kamer ligt in het kasteel of een van de bijgebouwen rond de tuin met hortensia\'s; ontspannen in de sauna. Late check-out tot 14:00 uur en gratis parkeren.',
          'Two nights in the 18th-century château on a five-hectare estate in Hesdin-l\'Abbé, about 15 minutes from Hardelot-Plage and Boulogne-sur-Mer. Your room is in the château or one of the outbuildings around the hydrangea garden; relax in the sauna. Late check-out until 14:00 and free parking.'),
        image: '/images/vakanties/001/clery-1.jpg' },
      { title: l('2 overnachtingen in Hotel Royal Beaulaincourt', '2 nights at Hotel Royal Beaulaincourt'),
        text: l('Twee nachten in het 18e-eeuwse herenhuis midden in het historische centrum van Béthune.', 'Two nights in the 18th-century mansion in the heart of historic Béthune.'),
        longText: l('Twee nachten in het 18e-eeuwse hôtel particulier midden in het historische centrum van Béthune, in 2023 gerestaureerd tot een viersterrenhotel met 34 kamers. Je slaapt in een ruime Privilege Room; de Grand-Place met het belfort ligt om de hoek. Late check-out tot 15:00 uur.',
          'Two nights in the 18th-century private mansion in the heart of historic Béthune, restored in 2023 into a four-star hotel with 34 rooms. You sleep in a spacious Privilege Room; the Grand-Place and belfry are around the corner. Late check-out until 15:00.'),
        image: '/images/vakanties/001/beaulaincourt-1.jpg' },
      { title: l('6 dagen ontbijt', '6 days of breakfast'),
        text: l('Elke ochtend ontbijt in het hotel waar je die nacht slaapt; bij de kastelen een uitgebreid ontbijtbuffet.', 'Breakfast every morning at the hotel where you spent the night; an extensive breakfast buffet at the châteaux.'),
        longText: l('Elke ochtend staat het ontbijt klaar in het hotel waar je die nacht sliep: een uitgebreid ontbijtbuffet in Château Tilques en Château Cléry, en in Béthune op de lichte binnenplaats van het hotel. Geen haast: bij elk hotel check je later uit dan gebruikelijk.',
          'Breakfast is ready every morning at the hotel where you slept: an extensive breakfast buffet at Château Tilques and Château Cléry, and in Béthune in the hotel\'s bright courtyard. No hurry: you check out later than usual at every hotel.'),
        image: '/images/vakanties/001/extra-tilques-ontbijt.jpg' },
      { title: l('3 x een 3-gangendiner', '3 x a 3-course dinner'),
        text: l('In elk hotel op de dag van aankomst: \'s avonds hoef je nergens meer heen.', 'At each hotel on the day of arrival: no need to go anywhere in the evening.'),
        longText: l('Op elke aankomstdag staat \'s avonds een 3-gangendiner voor je klaar: bij Le Vert Mesnil in een 17e-eeuws bijgebouw van Château Tilques, bij Le Berthier in Château Cléry met een verfijnde Franse keuken, en in het bistronomische restaurant van Hotel Royal Beaulaincourt. De overige avonden ben je vrij; in het reisschema staan onze restauranttips.',
          'On every arrival day a 3-course dinner awaits you: at Le Vert Mesnil in a 17th-century outbuilding of Château Tilques, at Le Berthier in Château Cléry with refined French cuisine, and in the bistronomic restaurant of Hotel Royal Beaulaincourt. The other evenings are free; the itinerary lists our restaurant tips.'),
        image: '/images/vakanties/001/extra-tilques-restaurant.jpg' },
      { title: l('Zwembad, sauna, tennis en jeu de boules', 'Pool, sauna, tennis and pétanque'),
        text: l('Het binnenzwembad, tennis en jeu de boules bij Château Tilques en de sauna bij Château Cléry.', 'The indoor pool, tennis and pétanque at Château Tilques and the sauna at Château Cléry.'),
        longText: l('Bij Château Tilques neem je een duik in het verwarmde binnenzwembad of speel je een potje tennis of jeu de boules in het park. Bij Château Cléry kom je na een dag aan de kust helemaal tot rust in de sauna.',
          'At Château Tilques you take a dip in the heated indoor pool or play a game of tennis or pétanque in the park. At Château Cléry you unwind completely in the sauna after a day on the coast.'),
        image: '/images/vakanties/001/tilques-3.jpg' },
      { title: l('Welkomstbubbels in Hotel Royal Beaulaincourt', 'Welcome bubbles at Hotel Royal Beaulaincourt'),
        text: l('Een glas bubbels bij aankomst in Béthune, op dag 5.', 'A glass of bubbles on arrival in Béthune, on day 5.'),
        longText: l('Na het inchecken in Hotel Royal Beaulaincourt staan de welkomstbubbels voor je klaar: op de binnenplaats als de zon schijnt, anders in de bar in de oude salons. Een feestelijk begin van het laatste deel van je reis.',
          'After checking in at Hotel Royal Beaulaincourt, the welcome bubbles are waiting for you: in the courtyard when the sun is out, otherwise in the bar in the old salons. A festive start to the last part of your trip.'),
        image: '/images/vakanties/001/extra-beaulaincourt-bubbels.jpg' },
      { title: l('Late check-out bij alle hotels', 'Late check-out at all hotels'),
        text: l('Rustig ontbijten en op je gemak vertrekken: tot 14:00 uur bij de kastelen, tot 15:00 uur in Béthune.', 'A leisurely breakfast and an unhurried departure: until 14:00 at the châteaux, until 15:00 in Béthune.'),
        longText: l('Geen wekker op de wisseldagen: bij Château Tilques en Château Cléry check je uit tot 14:00 uur, bij Hotel Royal Beaulaincourt zelfs tot 15:00 uur. Rustig ontbijten, nog een rondje door het park of de stad, en dan pas de koffers in de auto.',
          'No alarm on changeover days: at Château Tilques and Château Cléry you check out until 14:00, at Hotel Royal Beaulaincourt even until 15:00. A leisurely breakfast, one more turn through the park or the town, and only then the bags in the car.'),
        image: '/images/vakanties/001/extra-clery-late-checkout.jpg' },
      { title: l('Gratis parkeren bij de kastelen', 'Free parking at the châteaux'),
        text: l('Bij Château Tilques en Château Cléry staat je auto gratis geparkeerd.', 'Free parking at Château Tilques and Château Cléry.'),
        longText: l('Bij Château Tilques en Château Cléry parkeer je gratis op eigen terrein in het park. In Béthune ligt een parkeergarage op een paar minuten lopen van het hotel.',
          'At Château Tilques and Château Cléry you park for free on the grounds in the park. In Béthune there is a car park a few minutes\' walk from the hotel.'),
        image: '/images/vakanties/001/clery-3.jpg' },
    ],
    days: [
      // Redactie: tekst uit het reisdocument ("Reis van dag tot dag"); de regels in de
      // dagsamenvatting komen uit het "Voorbeeldprogramma".
      { day: 1,
        summary: l('Utrecht → Château Tilques · ca. 3 uur 45 min. · 3-gangendiner', 'Utrecht → Château Tilques · approx. 3 h 45 min · 3-course dinner'),
        heading: l('Utrecht → Château Tilques – ca. 3 uur 45 min.', 'Utrecht → Château Tilques – approx. 3 h 45 min'),
        arrival: { text: l(
          'Vandaag begint je reis door Noord-Frankrijk. Vanuit Utrecht rijd je in circa 3 uur en 45 minuten naar Château Tilques, een karaktervol 19e-eeuws kasteel in een groen park vlak bij Saint-Omer.',
          'Today your journey through Northern France begins. From Utrecht it is a drive of about 3 hours and 45 minutes to Château Tilques, a characterful 19th-century château in a green park near Saint-Omer.',
        ) },
        activities: [
          { title: l('Het landgoed en het binnenzwembad', 'The estate and the indoor pool'),
            text: l('Na het inchecken hoef je nergens meer naartoe. Wandel over het landgoed, speel een potje tennis of jeu de boules of neem een verfrissende duik in het binnenzwembad.',
              'After check-in there is nowhere else you need to go. Stroll around the estate, play a game of tennis or pétanque or take a refreshing dip in the indoor pool.'),
            image: '/images/vakanties/001/tilques-3.jpg' },
        ],
        dinner: { text: l(
          '\'s Avonds schuif je aan bij restaurant Le Vert Mesnil, gevestigd in een 17e-eeuws bijgebouw van het château. Hier geniet je van het inbegrepen 3-gangendiner. Op de kaart staan verse en lokale producten centraal, met onder meer gegrild vlees, vis en groenten. Een ontspannen én smaakvol begin van je reis door Noord-Frankrijk.',
          'In the evening you sit down at restaurant Le Vert Mesnil, housed in a 17th-century outbuilding of the château, for the included 3-course dinner. Fresh, local produce takes centre stage, including grilled meat, fish and vegetables. A relaxed and tasty start to your journey through Northern France.',
        ) } },
      { day: 2,
        summary: l('Ontdek de historische stad Saint-Omer & de omliggende moerassen', 'Discover historic Saint-Omer & the surrounding marshes'),
        heading: l('Saint-Omer & de omliggende moerassen', 'Saint-Omer & the surrounding marshes'),
        breakfast: { text: l(
          'Na het ontbijt heb je alle tijd om de stad Saint-Omer en omgeving te ontdekken.',
          'After breakfast you have all the time you need to discover Saint-Omer and its surroundings.',
        ) },
        activities: [
          { title: l('Ontdek historisch Saint-Omer', 'Discover historic Saint-Omer'),
            text: l('Wandel door het historische centrum en bewonder de kathedraal voordat je de bijzondere natuur rondom de stad opzoekt.',
              'Walk through the historic centre and admire the cathedral before seeking out the special nature around the town.'),
            image: '/images/vakanties/001/nearby-saint-omer.jpg' },
          { title: l('Vaar met een bacôve door het Marais Audomarois', 'Sail a bacôve through the Marais Audomarois'),
            text: l('Net buiten Saint-Omer ligt het Marais Audomarois, een waterrijk landschap van kanalen, eilandjes, rietkragen en moestuinen. Stap hier aan boord van een traditionele bacôve, een karakteristieke houten boot die van oudsher door de tuinders van het moeras wordt gebruikt. Vanaf het water ontdek je een heel andere kant van Noord-Frankrijk.',
              'Just outside Saint-Omer lies the Marais Audomarois, a watery landscape of canals, islets, reed beds and vegetable gardens. Board a traditional bacôve here, a characteristic wooden boat long used by the marsh gardeners. From the water you discover a completely different side of Northern France.'),
            image: '/images/vakanties/001/nearby-marais.jpg',
            more: { label: l('Meer over het Marais Audomarois', 'More about the Marais Audomarois'), title: l('Het Marais Audomarois', 'The Marais Audomarois'), image: img('001', 'marais'), paragraphs: [
              l('Het Marais Audomarois is een moeras van 3.700 hectare met 700 kilometer aan sloten en kanalen, al sinds de middeleeuwen drooggelegd door monniken en tuinders. Het is het laatste moeras van Frankrijk waar nog gewoond en geboerd wordt: de bloemkolen van Saint-Omer komen hiervandaan en de post wordt op sommige eilandjes nog per boot bezorgd.',
                'The Marais Audomarois is a 3,700-hectare marsh with 700 kilometres of ditches and canals, drained since the Middle Ages by monks and market gardeners. It is the last marsh in France that is still inhabited and farmed: Saint-Omer\'s cauliflowers come from here and on some islands the post still arrives by boat.'),
              l('Vaar mee met een elektrische fluisterboot (circa een uur, vanaf Clairmarais of de Maison du Marais) of huur een bacôve, de traditionele platte houten boot, en peddel zelf. In de stad zijn de kathedraal Notre-Dame en de bibliotheek met een Gutenbergbijbel de moeite waard.',
                'Join an electric whisper boat (about an hour, from Clairmarais or the Maison du Marais) or rent a bacôve, the traditional flat wooden boat, and paddle yourself. In town, the Notre-Dame cathedral and the library with a Gutenberg Bible are worth a visit.'),
            ] } },
          { title: l('Bezoek La Coupole', 'Visit La Coupole'),
            text: l('Meer zin in geschiedenis? Bezoek dan La Coupole, de indrukwekkende voormalige V2-bunker bij Saint-Omer.',
              'More in the mood for history? Then visit La Coupole, the impressive former V2 bunker near Saint-Omer.'),
            image: '/images/vakanties/001/placeholder-la-coupole.svg',
            more: { label: l('Meer over La Coupole', 'More about La Coupole'), title: l('La Coupole', 'La Coupole'), paragraphs: [
              l('La Coupole is een bunker uit 1943-1944 met een betonnen koepel van 71 meter doorsnee en vijf meter dik, gebouwd om V2-raketten op Londen af te vuren. Door geallieerde bombardementen is er nooit één gelanceerd. Vandaag is het een geschiedenismuseum over de bezetting van Noord-Frankrijk en de wedloop naar de ruimte, met een planetarium.',
                'La Coupole is a 1943-44 bunker with a concrete dome 71 metres across and five metres thick, built to fire V2 rockets at London. Thanks to Allied bombing not a single one was ever launched. Today it is a history museum on the occupation of northern France and the space race, with a planetarium.'),
              l('Reken op twee tot drie uur; het is er binnen fris. La Coupole ligt op een kwartier van het hotel, aan de zuidkant van Saint-Omer.',
                'Allow two to three hours; it is cool inside. La Coupole is fifteen minutes from the hotel, on the south side of Saint-Omer.'),
            ] } },
          { title: l('Vrije avond: restaurant Bacôve', 'Free evening: restaurant Bacôve'),
            text: l('Aan het einde van de middag keer je terug naar Château Tilques. Neem nog een duik in het zwembad of geniet van het park. Vanavond is het diner vrij. Voor wie culinair wil uitpakken is Restaurant Bacôve in Saint-Omer een bijzondere keuze.',
              'At the end of the afternoon you return to Château Tilques. Take another dip in the pool or enjoy the park. Dinner is free tonight. For a culinary treat, Restaurant Bacôve in Saint-Omer is a special choice.'),
            image: '/images/vakanties/001/placeholder-restaurant-bacove.svg' },
        ] },
      { day: 3,
        summary: l('Château Tilques → Château Cléry · ca. 45 min. · 3-gangendiner', 'Château Tilques → Château Cléry · approx. 45 min · 3-course dinner'),
        heading: l('Château Tilques → Château Cléry – ca. 45 min.', 'Château Tilques → Château Cléry – approx. 45 min'),
        breakfast: false,
        route: { title: l('Onderweg: Boulogne-sur-Mer en de crypte', 'En route: Boulogne-sur-Mer and its crypt'),
          text: l('Geniet nog één keer van het ontbijt bij Château Tilques en check daarna rustig uit. De rit naar het volgende hotel duurt slechts circa 45 minuten, dus ook vandaag is er volop tijd om iets te ondernemen. Maak bijvoorbeeld een tussenstop in Boulogne-sur-Mer. Wandel door de sfeervolle ommuurde bovenstad en bezoek de basiliek Notre-Dame. Onder de basiliek bevindt zich een verrassende ondergrondse wereld: een crypte van circa 1.400 m² met archeologische vondsten, kunstwerken en muurschilderingen die samen meer dan 2.000 jaar geschiedenis vertellen.',
            'Enjoy breakfast at Château Tilques one last time and then check out at leisure. The drive to the next hotel takes only about 45 minutes, so there is plenty of time to do something today too. Stop off in Boulogne-sur-Mer, for example. Walk through the atmospheric walled upper town and visit the Notre-Dame basilica. Beneath the basilica lies a surprising underground world: a crypt of about 1,400 m² with archaeological finds, works of art and murals that together tell more than 2,000 years of history.'),
          image: '/images/vakanties/001/nearby-boulogne.jpg',
          more: { label: l('Meer over Boulogne-sur-Mer', 'More about Boulogne-sur-Mer'), title: l('Boulogne-sur-Mer', 'Boulogne-sur-Mer'), image: img('001', 'boulogne'), paragraphs: [
            l('Boulogne is de grootste vissershaven van Frankrijk en tegelijk een van de oudste steden van de kust: de Romeinen vertrokken hiervandaan naar Britannië. De bovenstad ligt binnen een complete 13e-eeuwse stadsmuur van anderhalve kilometer; binnen de muren vind je de basiliek Notre-Dame met haar 101 meter hoge koepel, het kasteel-museum en de rustige straatjes rond het stadhuis.',
              'Boulogne is France\'s largest fishing port and one of the oldest towns on the coast: the Romans set off for Britain from here. The upper town sits inside a complete 13th-century wall of a kilometre and a half; within it are the Notre-Dame basilica with its 101-metre dome, the castle museum and the quiet streets around the town hall.'),
            l('Nausicaá aan de haven toont 58.000 dieren in een bak van 10.000 m³ met een kijkvenster van twintig meter; reken op een halve dag en reserveer online. Vis eet je in de benedenstad aan de Quai Gambetta, waar de boten \'s ochtends aanleggen.',
              'Nausicaá by the harbour shows 58,000 animals in a 10,000 m³ tank with a twenty-metre viewing window; allow half a day and book online. Eat fish in the lower town on the Quai Gambetta, where the boats come in in the morning.'),
          ] } },
        arrival: { text: l(
          'Daarna rijd je verder naar Château Cléry in Hesdin-l\'Abbé. Wandel na aankomst over het groene landgoed of kom helemaal tot rust in de sauna.',
          'Then drive on to Château Cléry in Hesdin-l\'Abbé. After arrival, stroll around the green estate or unwind completely in the sauna.',
        ) },
        dinner: { text: l(
          '\'s Avonds geniet je van het inbegrepen 3-gangendiner bij restaurant Le Berthier. Hier staat een verfijnde Franse keuken centraal, met verse ingrediënten, seizoensproducten en producten uit de streek.',
          'In the evening you enjoy the included 3-course dinner at restaurant Le Berthier, where refined French cuisine with fresh, seasonal and regional ingredients takes centre stage.',
        ) } },
      { day: 4,
        summary: l('Ontdek de Opaalkust · Hardelot-Plage ca. 15 min. / Les Deux Caps ca. 40 min.', 'Discover the Opal Coast · Hardelot-Plage approx. 15 min / Les Deux Caps approx. 40 min'),
        heading: l('Ontdek de Opaalkust', 'Discover the Opal Coast'),
        // Het document begint deze dag direct met de kust (geen apart ontbijtblok).
        breakfast: false,
        activities: [
          { title: l('Het strand van Hardelot-Plage', 'The beach at Hardelot-Plage'),
            text: l('Vandaag ontdek je de prachtige Opaalkust. Vanuit Château Cléry sta je in ongeveer 15 minuten op het strand van Hardelot-Plage. Wandel langs het brede zandstrand, geniet van de zeelucht of strijk neer op een terras.',
              'Today you discover the beautiful Opal Coast. From Château Cléry you are on the beach at Hardelot-Plage in about 15 minutes. Walk along the wide sandy beach, enjoy the sea air or settle on a terrace.'),
            image: '/images/vakanties/001/placeholder-hardelot.svg' },
          { title: l('Bewonder Les Deux Caps', 'Admire Les Deux Caps'),
            text: l('Wil je het spectaculairste gedeelte van de Opaalkust ontdekken? Rijd dan in circa 40 minuten naar Les Deux Caps: Cap Blanc-Nez en Cap Gris-Nez. Hier wandel je door een indrukwekkend kustlandschap met hoge kliffen en weidse uitzichten over Het Kanaal. Bij helder weer kun je vanaf Cap Gris-Nez zelfs de Engelse kust zien liggen.',
              'Want to discover the most spectacular part of the Opal Coast? Then drive about 40 minutes to Les Deux Caps: Cap Blanc-Nez and Cap Gris-Nez. Here you walk through an impressive coastal landscape with high cliffs and sweeping views over the Channel. On a clear day you can even see the English coast from Cap Gris-Nez.'),
            image: '/images/vakanties/001/blancnez.jpg',
            more: { label: l('Meer over de Opaalkust', 'More about the Opal Coast'), title: l('De Opaalkust', 'The Opal Coast'), image: img('001', 'wissant'), paragraphs: [
              l('De Côte d\'Opale loopt van de Belgische grens tot de baai van de Somme en dankt zijn naam aan het melkachtige licht boven zee. Het mooiste stuk ligt tussen Calais en Boulogne: de twee kapen Cap Blanc-Nez (krijt, 134 meter) en Cap Gris-Nez (zandsteen, het dichtst bij Engeland) met daartussen het brede strand van Wissant. Bij helder weer zie je de witte kliffen van Dover.',
                'The Côte d\'Opale runs from the Belgian border to the Bay of the Somme and owes its name to the milky light over the sea. The finest stretch lies between Calais and Boulogne: the two headlands of Cap Blanc-Nez (chalk, 134 metres) and Cap Gris-Nez (sandstone, the closest point to England) with the broad beach of Wissant in between. On a clear day you can see the white cliffs of Dover.'),
              l('De kapen zijn een Grand Site de France: parkeer bij de voet en loop het GR-pad langs de rand van de klif (stevige schoenen, het waait er altijd). Wissant is een zeilsurfdorp met een handvol visrestaurants aan het strand; Audresselles, iets zuidelijker, is het adres voor mosselen en krab.',
                'The headlands are a Grand Site de France: park at the foot and walk the GR path along the cliff edge (sturdy shoes, it is always windy). Wissant is a windsurfing village with a handful of fish restaurants on the beach; Audresselles, a little further south, is the place for mussels and crab.'),
            ] } },
          { title: l('Wissant, Wimereux en de ambachtslieden', 'Wissant, Wimereux and the craftspeople'),
            text: l('Maak onderweg een tussenstop in Wissant of Wimereux. In de Boulonnais kun je bovendien kennismaken met lokale ambachtslieden en streekproducten.',
              'Stop off in Wissant or Wimereux along the way. In the Boulonnais you can also meet local craftspeople and discover regional products.'),
            image: '/images/vakanties/001/wissant.jpg' },
          { title: l('Vrije avond in Château Cléry', 'Free evening at Château Cléry'),
            text: l('Aan het einde van de dag keer je terug naar Château Cléry. Warm nog even op in de sauna en geniet daarna van een vrije avond.',
              'At the end of the day you return to Château Cléry. Warm up in the sauna and then enjoy a free evening.'),
            image: '/images/vakanties/001/clery-9.jpg' },
        ] },
      { day: 5,
        summary: l('Château Cléry → Hotel Royal Beaulaincourt · ca. 1 uur 5 min. · 3-gangendiner', 'Château Cléry → Hotel Royal Beaulaincourt · approx. 1 h 5 min · 3-course dinner'),
        heading: l('Château Cléry → Hotel Royal Beaulaincourt – ca. 1 uur 5 min.', 'Château Cléry → Hotel Royal Beaulaincourt – approx. 1 h 5 min'),
        breakfast: false,
        route: { title: l('Onderweg: de monumentale pleinen van Arras', 'En route: the monumental squares of Arras'),
          text: l('Na het ontbijt verlaat je Château Cléry en rijd je richting Béthune. De rit naar je volgende hotel duurt slechts circa 1 uur en 5 minuten, waardoor je ook vandaag alle tijd hebt voor een mooie tussenstop. Rijd bijvoorbeeld via Arras en wandel over de monumentale Grand\'Place en Place des Héros. De historische gevels, gezellige terrassen en het markante belfort vormen samen een prachtig decor voor een wandeling of lunch.',
            'After breakfast you leave Château Cléry and head for Béthune. The drive to your next hotel takes only about 1 hour and 5 minutes, so today too there is plenty of time for a nice stop. Drive via Arras, for example, and walk across the monumental Grand\'Place and Place des Héros. The historic façades, cosy terraces and striking belfry make a beautiful setting for a walk or lunch.'),
          image: '/images/vakanties/001/arras.jpg' },
        arrival: { text: l(
          'Daarna reis je verder naar Hotel Royal Beaulaincourt in Béthune. Na het inchecken staan de inbegrepen welkomstbubbels voor je klaar. Vanuit het hotel wandel je gemakkelijk het historische centrum van Béthune in.',
          'Then travel on to Hotel Royal Beaulaincourt in Béthune. After check-in, the included welcome bubbles are waiting for you. From the hotel you easily walk into the historic centre of Béthune.',
        ), image: '/images/vakanties/001/extra-beaulaincourt-bubbels.jpg' },
        dinner: { text: l(
          '\'s Avonds geniet je van het derde inbegrepen 3-gangendiner in het restaurant van Hotel Royal Beaulaincourt. De keuken is bistronomisch en werkt met lokale en seizoensgebonden ingrediënten.',
          'In the evening you enjoy the third included 3-course dinner in the restaurant of Hotel Royal Beaulaincourt. The cuisine is bistronomic and works with local, seasonal ingredients.',
        ) } },
      { day: 6,
        summary: l('Ontdek Béthune, Louvre-Lens of Lille', 'Discover Béthune, Louvre-Lens or Lille'),
        heading: l('Ontdek Béthune, Louvre-Lens of Lille', 'Discover Béthune, Louvre-Lens or Lille'),
        breakfast: { text: l(
          'Na het ontbijt bepaal je helemaal zelf hoe je de laatste volledige vakantiedag invult.',
          'After breakfast it is entirely up to you how you spend your last full day of the holiday.',
        ) },
        activities: [
          { title: l('Ontdek Béthune', 'Discover Béthune'),
            text: l('Blijf dichtbij en ontdek Béthune. Wandel over de sfeervolle Grand\'Place, bewonder het historische belfort en geniet op een terras van de levendige Franse sfeer.',
              'Stay close and discover Béthune. Stroll across the atmospheric Grand\'Place, admire the historic belfry and enjoy the lively French atmosphere on a terrace.'),
            image: '/images/vakanties/001/nearby-bethune.jpg',
            more: { label: l('Meer over Béthune', 'More about Béthune'), title: l('Béthune, stad van het belfort', 'Béthune, town of the belfry'), image: img('001', 'bethune'), paragraphs: [
              l('Béthune was in de Eerste Wereldoorlog een Brits garnizoensstadje vlak achter het front en werd in 1918 grotendeels verwoest. De wederopbouw in de jaren twintig leverde de Grand-Place op zoals je hem nu ziet: een plein vol art-decogevels rond het middeleeuwse belfort, dat als een van de weinige gebouwen overeind bleef.',
                'In the First World War Béthune was a British garrison town just behind the front and was largely destroyed in 1918. The 1920s reconstruction produced today\'s Grand-Place: a square of art-deco façades around the medieval belfry, one of the few buildings left standing.'),
              l('Het belfort (1388) hoort bij de UNESCO-reeks belforten van België en Frankrijk; van april tot september kun je de 133 treden op voor het uitzicht over de mijnstreek. Op zaterdagochtend is er markt op het plein, en de brouwerijen uit de omgeving staan op elke kaart.',
                'The belfry (1388) is part of the UNESCO series of belfries of Belgium and France; from April to September you can climb its 133 steps for a view over the mining country. There is a market on the square on Saturday mornings, and the local breweries feature on every menu.'),
            ] } },
          { title: l('Bewonder meesterwerken in Louvre-Lens', 'Admire masterpieces at Louvre-Lens'),
            text: l('Kunstliefhebber? Rijd dan naar Louvre-Lens. In de indrukwekkende Galerie du Temps worden honderden kunstwerken uit verschillende tijdperken in één grote, open ruimte chronologisch gepresenteerd.',
              'Art lover? Then drive to Louvre-Lens. In the impressive Galerie du Temps, hundreds of works of art from different periods are presented chronologically in one large, open space.'),
            image: '/images/vakanties/001/placeholder-louvre-lens.svg' },
          { title: l('Een dagje Lille', 'A day in Lille'),
            text: l('Liever een dagje stad? Rijd naar Lille en dwaal door de straatjes van Vieux-Lille, ga winkelen, bezoek een museum of strijk neer op een van de vele terrassen.',
              'Rather spend a day in the city? Drive to Lille and wander through the streets of Vieux-Lille, go shopping, visit a museum or settle on one of the many terraces.'),
            image: '/images/vakanties/001/nearby-lille.jpg',
            more: { label: l('Meer over Lille', 'More about Lille'), title: l('Lille, bruisende hoofdstad van Frans-Vlaanderen', 'Lille, buzzing capital of French Flanders'), image: '/images/vakanties/001/nearby-lille.jpg', paragraphs: [
              l('Lille was ooit Vlaams, daarna Bourgondisch en Spaans, en pas sinds 1668 Frans, en dat zie je: de Grand-Place en de Vieille Bourse (1653) zijn Vlaamse barok in rode baksteen en zandsteen, de straatjes van Vieux-Lille zitten vol boetieks, kaaswinkels en estaminets. Parkeer bij het Palais des Beaux-Arts en loop de stad in.',
                'Lille was once Flemish, then Burgundian and Spanish, and only French since 1668, and it shows: the Grand-Place and the Vieille Bourse (1653) are Flemish baroque in red brick and sandstone, and the streets of Vieux-Lille are full of boutiques, cheese shops and estaminets. Park at the Palais des Beaux-Arts and walk into town.'),
              l('Proef de Noord-Franse keuken: een carbonnade flamande of welsh in een estaminet en een wafel met vanille bij Meert, de patisserie uit 1761. Op zondagochtend is er markt op Wazemmes, een van de grootste van Frankrijk.',
                'Taste the cuisine of the north: a carbonnade flamande or a welsh in an estaminet and a vanilla waffle at Meert, the patisserie from 1761. On Sunday morning there is the Wazemmes market, one of the largest in France.'),
            ] } },
          { title: l('Vrije avond: Maison Renard', 'Free evening: Maison Renard'),
            text: l('Vanavond is het diner vrij. Voor een bijzondere laatste avond kun je bijvoorbeeld reserveren bij Maison Renard in Béthune.',
              'Dinner is free tonight. For a special last evening you could book a table at Maison Renard in Béthune.'),
            image: '/images/vakanties/001/placeholder-maison-renard.svg' },
        ] },
      { day: 7,
        summary: l('Ontbijt, late check-out & terug naar Utrecht · ca. 3 uur 35 min.', 'Breakfast, late check-out & back to Utrecht · approx. 3 h 35 min'),
        heading: l('Béthune → Utrecht – ca. 3 uur 35 min.', 'Béthune → Utrecht – approx. 3 h 35 min'),
        breakfast: { text: l(
          'Begin de laatste ochtend rustig met het ontbijt. Dankzij de late check-out tot 15.00 uur bij Hotel Royal Beaulaincourt hoef je niet meteen je koffers te pakken.',
          'Start the last morning at leisure with breakfast. Thanks to the late check-out until 15:00 at Hotel Royal Beaulaincourt, there is no need to pack your bags straight away.',
        ) },
        homeward: { title: l('Terug naar Utrecht', 'Back to Utrecht'),
          text: l('Wandel nog even door Béthune, drink een laatste koffie op de Grand\'Place of geniet rustig van het hotel. Daarna stap je in de auto voor de terugreis naar Utrecht. Reistijd naar Utrecht: ca. 3 uur 35 min. (297 km).',
            'Take one more stroll through Béthune, have a last coffee on the Grand\'Place or relax at the hotel. Then get in the car for the journey back to Utrecht. Travel time to Utrecht: approx. 3 h 35 min (297 km).'),
          image: img('001', 'bethune') } },
    ],
    mapHighlights: [
      { kind: 'church', name: l('Saint-Omer', 'Saint-Omer'), lat: 50.7497, lng: 2.2522, text: l('Historisch centrum met de indrukwekkende kathedraal Notre-Dame.', 'Historic centre with the impressive Notre-Dame cathedral.'), image: '/images/vakanties/001/nearby-saint-omer.jpg' },
      { kind: 'water', name: l('Marais Audomarois', 'Marais Audomarois'), lat: 50.775, lng: 2.268, text: l('Waterrijk landschap van kanalen, eilandjes en moestuinen, per traditionele bacôve.', 'Watery landscape of canals, islets and vegetable gardens, by traditional bacôve.'), image: '/images/vakanties/001/nearby-marais.jpg' },
      { kind: 'museum', name: l('La Coupole', 'La Coupole'), lat: 50.6935, lng: 2.2422, text: l('Voormalige V2-bunker, nu een museum met planetarium.', 'Former V2 bunker, now a museum with a planetarium.') },
      { kind: 'village', name: l('Stoomtrein Vallée de l\'Aa', 'Vallée de l\'Aa steam train'), lat: 50.7374, lng: 2.3053, text: l('Historische stoomtrein door de Vallée de l\'Aa.', 'Historic steam train through the Vallée de l\'Aa.'), image: '/images/vakanties/001/nearby-stoomtrein.jpg' },
      { kind: 'beach', name: l('Hardelot-Plage', 'Hardelot-Plage'), lat: 50.6336, lng: 1.5745, text: l('Breed zandstrand op circa 15 minuten van Château Cléry.', 'Wide sandy beach about 15 minutes from Château Cléry.') },
      { kind: 'city', name: l('Boulogne-sur-Mer', 'Boulogne-sur-Mer'), lat: 50.726, lng: 1.613, text: l('Ommuurde bovenstad, basiliek met crypte en aan de haven Nausicaá.', 'Walled upper town, basilica with crypt and Nausicaá by the harbour.'), image: '/images/vakanties/001/nearby-boulogne.jpg' },
      { kind: 'village', name: l('Wimereux', 'Wimereux'), lat: 50.769, lng: 1.611, text: l('Badplaats met lokale ambachtslieden en streekproducten.', 'Seaside resort with local craftspeople and regional products.') },
      { kind: 'beach', name: l('Wissant', 'Wissant'), lat: 50.886, lng: 1.662, text: l('Breed strand tussen de twee kapen.', 'Wide beach between the two capes.'), image: img('001', 'wissant') },
      { kind: 'nature', name: l('Cap Gris-Nez', 'Cap Gris-Nez'), lat: 50.8694, lng: 1.5847, text: l('Kaap met bij helder weer zicht op de Engelse kust.', 'Headland with views of the English coast on a clear day.') },
      { kind: 'nature', name: l('Cap Blanc-Nez', 'Cap Blanc-Nez'), lat: 50.924, lng: 1.712, text: l('Krijtrotsen en weidse uitzichten over Het Kanaal.', 'Chalk cliffs and sweeping views over the Channel.'), image: img('001', 'blancnez') },
      { kind: 'city', name: l('Arras', 'Arras'), lat: 50.2918, lng: 2.7775, text: l('Monumentale Grand\'Place en Place des Héros met het belfort.', 'Monumental Grand\'Place and Place des Héros with the belfry.'), image: img('001', 'arras') },
      { kind: 'tower', name: l('Belfort van Béthune', 'Belfry of Béthune'), lat: 50.5305, lng: 2.641, text: l('Grand\'Place met karakteristieke gevels, terrassen en het belfort.', 'Grand\'Place with characteristic façades, terraces and the belfry.'), image: img('001', 'bethune') },
      { kind: 'museum', name: l('Louvre-Lens', 'Louvre-Lens'), lat: 50.4296, lng: 2.8011, text: l('Galerie du Temps: honderden kunstwerken chronologisch in één ruimte.', 'Galerie du Temps: hundreds of works of art chronologically in one space.') },
      { kind: 'city', name: l('Lille', 'Lille'), lat: 50.6372, lng: 3.0633, text: l('Vieux-Lille, winkels, musea en terrassen.', 'Vieux-Lille, shops, museums and terraces.'), image: '/images/vakanties/001/nearby-lille.jpg' },
    ],
  },

  // ── 002 Hanzesteden ───────────────────────────────────────────────────
  'trip-hanzesteden': {
    description: [
      l('Drie Hanzesteden aan de IJssel en de Vecht in zeven dagen: Zwolle met Museum de Fundatie, Deventer met het Bergkwartier en Zutphen met zijn verborgen hofjes. Je slaapt telkens twee nachten, in een hotel aan de Vecht, een familiehotel in Salland en een boetiekhotel in het centrum van Zutphen.',
        'Three Hanseatic cities on the IJssel and Vecht in seven days: Zwolle with Museum de Fundatie, Deventer with the Bergkwartier and Zutphen with its hidden courtyards. Two nights each, in a hotel on the Vecht, a family hotel in Salland and a boutique hotel in the centre of Zutphen.'),
      l('Hotel Mooirivier in Dalfsen heeft een eigen wellness aan het water, Hotel de Zwaan in Raalte is bekend om zijn keuken en wijnkelder, en Hotel \'s Gravenhof zit in een 17e-eeuws pand tegenover de Walburgiskerk. De diners op de aankomstdagen zijn inbegrepen, net als de entree tot de musea van Zutphen.',
        'Hotel Mooirivier in Dalfsen has its own wellness on the water, Hotel de Zwaan in Raalte is known for its kitchen and wine cellar, and Hotel \'s Gravenhof occupies a 17th-century building opposite the Walburgis church. Dinners on arrival days are included, as are the Zutphen museum tickets.'),
      l('De afstanden zijn klein: 25 en 40 minuten tussen de hotels, en Utrecht ligt op ruim een uur. Zo blijft er alle tijd over voor de steden, de IJsseldijken en de kastelen langs de Vecht.',
        'Distances are small: 25 and 40 minutes between the hotels, and Utrecht is just over an hour away. That leaves plenty of time for the cities, the IJssel dykes and the castles along the Vecht.'),
    ],
    highlights: [
      l('6 nachten / 3 hotels in het Hanzestedengebied', '6 nights / 3 hotels in the Hanseatic region'),
      l('3 x diner op de dag van aankomst (3- en 4-gangen)', '3 x dinner on the day of arrival (3 and 4 courses)'),
      l('Wijnarrangement bij Hotel de Zwaan', 'Wine pairing at Hotel de Zwaan'),
      l('Entree Stedelijk Museum Zutphen & Museum Henriette Polak', 'Tickets Stedelijk Museum Zutphen & Museum Henriette Polak'),
      l('Wellness aan de Vecht', 'Wellness on the Vecht'),
      l('Korte etappes van 25 tot 40 minuten', 'Short legs of 25 to 40 minutes'),
    ],
    hotels: {
      'Hotel Mooirivier': {
        description: l('Een modern viersterrenhotel direct aan de Overijsselse Vecht, tussen Dalfsen en Zwolle. De 68 kamers zijn licht en ruim, het restaurant en de wellness met sauna en buitenjacuzzi kijken uit over het water. Fietsen en kano\'s staan klaar voor een tocht over de rivier of naar Zwolle.',
          'A modern four-star hotel right on the Overijssel Vecht, between Dalfsen and Zwolle. The 68 rooms are bright and spacious; the restaurant and the wellness with sauna and outdoor jacuzzi overlook the water. Bikes and canoes are ready for a trip along the river or into Zwolle.'),
        facilities: ['Restaurant met terras aan het water', 'Wellness met sauna en buitenjacuzzi', 'Fietsverhuur', 'Kanoverhuur', 'Gratis parkeren', 'Gratis wifi', 'Lift', 'Laadpalen'],
        room: { name: l('Comfortkamer aan de Vecht', 'Comfortkamer aan de Vecht'), description: l('Lichte, moderne kamer met een groot raam op de rivier, een boxspringbed en een ruime badkamer met regendouche. Ideaal om na een fiets- of kanotocht bij te komen.', 'Bright, modern room with a large window on the river, a box-spring bed and a spacious bathroom with rain shower. Ideal for unwinding after a bike or canoe trip.') },
      },
      'Hotel de Zwaan': {
        description: l('Familiehotel in het hart van Raalte, al generaties lang een begrip in Salland. Bekend om restaurant Buitengewoon met zijn wijnkelder en om de gastvrijheid van de familie. De 28 kamers zijn klassiek en comfortabel; het dorp met zijn terrassen ligt voor de deur.',
          'Family hotel in the heart of Raalte, a household name in Salland for generations. Known for its restaurant with wine cellar and the family\'s hospitality. The 28 rooms are classic and comfortable; the village and its terraces are right outside.'),
        facilities: ['Restaurant', 'Wijnkelder en wijnbar', 'Terras', 'Gratis parkeren', 'Gratis wifi', 'Fietsverhuur', 'Lift'],
        room: { name: l('Comfortkamer', 'Comfortkamer'), description: l('Klassiek ingerichte kamer met warme kleuren, een comfortabel tweepersoonsbed en een nette badkamer. Het dorp en het restaurant van de familie liggen onder je.', "Classically furnished room in warm colours with a comfortable double bed and a neat bathroom. The village and the family's restaurant are right below you.") },
      },
      "Hotel 's Gravenhof": {
        description: l('Boetiekhotel in een 17e-eeuws stadspaleis aan het \'s Gravenhof, het plein tegenover de Walburgiskerk in het oudste deel van Zutphen. Achttien kamers met hoge plafonds en moderne badkamers, een stadstuin en een brasserie op de begane grond. De hofjes, boetiekjes en de IJsselkade liggen op loopafstand.',
          'Boutique hotel in a 17th-century town palace on the \'s Gravenhof square opposite the Walburgis church, in the oldest part of Zutphen. Eighteen rooms with high ceilings and modern bathrooms, a city garden and a ground-floor brasserie. Courtyards, boutiques and the IJssel quay are a short walk away.'),
        facilities: ['Brasserie', 'Bar', 'Stadstuin', 'Gratis wifi', 'Fietsenstalling', 'Parkeren nabij (betaald)'],
        room: { name: l('Stadspaleiskamer', 'Stadspaleiskamer'), description: l('Kamer met hoge plafonds en originele details in het 17e-eeuwse stadspaleis, gecombineerd met een moderne badkamer. Sommige kamers kijken uit op de Walburgiskerk.', 'Room with high ceilings and original details in the 17th-century town palace, combined with a modern bathroom. Some rooms overlook the Walburgis church.') },
      },
    },
    days: [
      { day: 1, activities: [
        { title: l('Kanoën of fietsen langs de Vecht', 'Canoe or cycle along the Vecht'), text: l('Het hotel ligt direct aan de rivier. Pak een fiets of kano voor de route langs kasteel Rechteren en de oude sluis van Vechterweerd, of loop het pad langs het water naar Dalfsen.', 'The hotel sits right on the river. Grab a bike or canoe for the route past Rechteren castle and the old Vechterweerd lock, or walk the riverside path into Dalfsen.'), image: img('002', 'vecht') },
      ] },
      { day: 2, activities: [
        { title: l('Zwolle: Sassenpoort en de Fundatie', 'Zwolle: Sassenpoort and the Fundatie'), text: l('Op een kwartier rijden ligt Zwolle. Begin bij de Sassenpoort en de Grote Markt en loop door naar Museum de Fundatie, herkenbaar aan de blauw-witte "wolk" op het dak, met kunst van Mondriaan tot Marlene Dumas.', 'Zwolle is a fifteen-minute drive. Start at the Sassenpoort and Grote Markt, then walk on to Museum de Fundatie, recognisable by the blue-and-white "cloud" on its roof, with art from Mondrian to Marlene Dumas.'), image: img('002', 'fundatie') },
        { title: l('Middag en avond in de binnenstad', 'Afternoon and evening in the old town'), text: l('Zwolle heeft een van de gaafste binnensteden van Nederland: de stadsgracht, de Peperbus en de vele terrassen. Blijf voor het diner of ga terug voor een avond in de wellness van het hotel.', 'Zwolle has one of the best-preserved town centres in the Netherlands: the moat, the Peperbus tower and countless terraces. Stay for dinner or head back for an evening in the hotel wellness.'), image: img('002', 'zwolle') },
      ] },
      { day: 3, route: { title: l('Via het Vechtdal en de Sallandse Heuvelrug', 'Via the Vecht valley and the Sallandse Heuvelrug'), text: l('Raalte ligt op 25 minuten, dus rij een lus: langs de Vecht naar Ommen, dan door de Sallandse Heuvelrug met een stop bij het bezoekerscentrum en de uitkijktoren op de Holterberg.', 'Raalte is 25 minutes away, so make a loop: along the Vecht to Ommen, then through the Sallandse Heuvelrug national park with a stop at the visitor centre and lookout on the Holterberg.'), image: img('002', 'vecht') } },
      { day: 4, activities: [
        { title: l('Deventer: het Bergkwartier en de Brink', 'Deventer: the Bergkwartier and the Brink'), text: l('Twintig minuten rijden en je staat op de Brink, het plein met de Waag. Verdwaal in het Bergkwartier met zijn middeleeuwse steegjes, klim de Lebuïnustoren op en eet een Deventer koek bij Bussink, de oudste koekbakker van het land.', 'Twenty minutes away is the Brink, the square with the Waag. Lose yourself in the medieval alleys of the Bergkwartier, climb the Lebuïnus tower and try a Deventer koek at Bussink, the country\'s oldest gingerbread bakery.'), image: img('002', 'deventer') },
        { title: l('Over de IJssel', 'Across the IJssel'), text: l('Steek met het voetveer over naar De Worp en kijk vanaf de overkant naar de skyline van Deventer. Terug in Raalte is het diner vrij; het hotel tipt graag een restaurant in het dorp.', 'Take the foot ferry across to De Worp for the classic view of Deventer\'s skyline. Back in Raalte dinner is free; the hotel will gladly suggest a restaurant in the village.'), image: FIETS.deventer },
      ] },
      { day: 5, route: { title: l('Bronkhorst, de kleinste stad van Nederland', 'Bronkhorst, the smallest town in the Netherlands'), text: l('Op weg naar Zutphen (40 minuten) steek je de IJssel over bij Brummen naar Bronkhorst: een handvol rieten boerderijen, een kapel en het Dickens Museum. Vervolg langs de IJsseldijk naar Zutphen.', 'On the way to Zutphen (40 minutes) cross the IJssel at Brummen to Bronkhorst: a handful of thatched farmhouses, a chapel and the Dickens Museum. Continue along the IJssel dyke to Zutphen.'), image: img('002', 'bronkhorst') } },
      { day: 6, activities: [
        { title: l('Zutphen: torens, hofjes en musea', 'Zutphen: towers, courtyards and museums'), text: l('Je logeert midden in de oude stad. Bezoek de Walburgiskerk met de Librije, een van de weinige middeleeuwse kettingbibliotheken ter wereld, en gebruik de inbegrepen entreekaarten voor het Stedelijk Museum en Museum Henriette Polak in het Hof van Heeckeren.', 'You are staying in the middle of the old town. Visit the Walburgis church with the Librije, one of the few surviving medieval chained libraries, and use the included tickets for the Stedelijk Museum and Museum Henriette Polak in the Hof van Heeckeren.'), image: img('002', 'zutphen') },
        { title: l('Boetiekjes en de IJsselkade', 'Boutiques and the IJssel quay'), text: l('Zutphen heeft een verrassend aanbod aan kleine winkels en koffiezaken in de Beukerstraat en Laarstraat. Eindig de dag op de IJsselkade bij zonsondergang.', 'Zutphen has a surprising number of small shops and coffee bars in the Beukerstraat and Laarstraat. End the day on the IJssel quay at sunset.'), image: img('002', 'zutphen') },
      ] },
      { day: 7, homeward: { title: l('Late check-out en terugreis', 'Late check-out and journey home'), text: l('Ontbijt rustig en check pas rond het middaguur uit. Utrecht ligt op een uur en een kwartier; wie wil, rijdt via de Veluwe en Kasteel Rosendael.', 'Enjoy a slow breakfast and check out around noon. Utrecht is an hour and a quarter away; if you like, drive via the Veluwe and Rosendael castle.'), image: FIETS.deventer } },
    ],
    mapHighlights: [
      { kind: 'castle', name: l('Kasteel Rechteren', 'Rechteren Castle'), lat: 52.503, lng: 6.301, text: l('Kasteel aan de Vecht, op fiets- of kanoafstand van het hotel.', 'Castle on the Vecht, within cycling or canoeing distance of the hotel.'), image: img('002', 'vecht') },
      { kind: 'tower', name: l('Sassenpoort Zwolle', 'Sassenpoort Zwolle'), lat: 52.51, lng: 6.095, text: l('Middeleeuwse stadspoort, startpunt voor de binnenstad en de Grote Markt.', 'Medieval town gate, starting point for the old town and the Grote Markt.'), image: img('002', 'zwolle') },
      { kind: 'museum', name: l('Museum de Fundatie', 'Museum de Fundatie'), lat: 52.511, lng: 6.093, text: l('Kunst van Mondriaan tot Marlene Dumas onder de blauw-witte wolk.', 'Art from Mondrian to Marlene Dumas beneath the blue-and-white cloud.'), image: img('002', 'fundatie') },
      { kind: 'nature', name: l('Holterberg', 'Holterberg'), lat: 52.305, lng: 6.425, text: l('Uitkijktoren en bezoekerscentrum van de Sallandse Heuvelrug.', 'Lookout tower and visitor centre of the Sallandse Heuvelrug.'), image: img('002', 'vecht') },
      { kind: 'city', name: l('Deventer', 'Deventer'), lat: 52.252, lng: 6.16, text: l('De Brink, het Bergkwartier en de Lebuïnustoren; voetveer over de IJssel.', 'The Brink, the Bergkwartier and the Lebuïnus tower; foot ferry across the IJssel.'), image: img('002', 'deventer') },
      { kind: 'village', name: l('Bronkhorst', 'Bronkhorst'), lat: 52.079, lng: 6.199, text: l('De kleinste stad van Nederland: rieten boerderijen en het Dickens Museum.', 'The smallest town in the Netherlands: thatched farmhouses and the Dickens Museum.'), image: img('002', 'bronkhorst') },
      { kind: 'church', name: l('Walburgiskerk Zutphen', 'Walburgis church Zutphen'), lat: 52.138, lng: 6.201, text: l('Met de Librije, een van de weinige middeleeuwse kettingbibliotheken ter wereld.', 'With the Librije, one of the few surviving medieval chained libraries.'), image: img('002', 'zutphen') },
    ],
  },

  // ── 003 Kastelen & Landgoederen ───────────────────────────────────────
  'trip-kastelen-landgoederen': {
    description: [
      l('Deze exclusieve 7-daagse Kastelen & Landgoederen-route is alleen bij ViaLuxury te boeken. Je reist langs statige kastelen, eeuwenoude buitenplaatsen en historische steden in Oost-Nederland en slaapt telkens twee nachten op een bijzondere plek: Landgoed Groot Warnsborn bij Arnhem, Kasteel Engelenburg in Brummen en Landhuishotel De Bloemenbeek in De Lutte.',
        'This exclusive 7-day Castles & Estates route is only available through ViaLuxury. You travel past stately castles, centuries-old country houses and historic towns in the east of the Netherlands, spending two nights at each special location: Landgoed Groot Warnsborn near Arnhem, Kasteel Engelenburg in Brummen and Landhuishotel De Bloemenbeek in De Lutte.'),
      l('De afstanden tussen de hotels zijn bewust kort, zodat je onderweg alle tijd hebt voor de omgeving: van Arnhem en de bossen van de Veluwe tot Hanzestad Zutphen en het Twentse coulisselandschap. Iedere etappe heeft zijn eigen karakter.',
        'Distances between the hotels are deliberately short, leaving time for the surroundings: from Arnhem and the Veluwe forests to the Hanseatic town of Zutphen and the Twente landscape of hedgerows and woods. Every leg has its own character.'),
      l('Culinair word je verwend: op iedere aankomstdag staat een diner klaar. Je begint met een 3-gangendiner op Groot Warnsborn, geniet op dag 3 van een culinair diner op Engelenburg en op dag 5 wacht bij Restaurant De Bloemenbeek een 4-gangen-Michelin-diner. De laatste dagen ontspan je onbeperkt in de spa van De Bloemenbeek, en bij alle drie de hotels parkeer je gratis.',
        'You are spoiled culinarily: a dinner awaits on every arrival day. You start with a 3-course dinner at Groot Warnsborn, enjoy a culinary dinner at Engelenburg on day 3 and on day 5 a 4-course Michelin dinner awaits at Restaurant De Bloemenbeek. The final days you relax in De Bloemenbeek\'s spa, and parking is free at all three hotels.'),
    ],
    highlights: [
      l('6 nachten in 3 bijzondere kastelen & landgoederen', '6 nights in 3 special castles & estates'),
      l('3 culinaire diners, waaronder 1 Michelin-diner', '3 culinary dinners, including 1 Michelin dinner'),
      l('Van de Veluwe naar het Twentse coulisselandschap', 'From the Veluwe to the Twente landscape'),
      l('Kamerupgrade in elk hotel', 'Room upgrade at every hotel'),
      l('Onbeperkt spa bij De Bloemenbeek', 'Unlimited spa at De Bloemenbeek'),
      l('Exclusieve ViaLuxury-route, gratis parkeren overal', 'Exclusive ViaLuxury route, free parking everywhere'),
    ],
    hotels: {
      'Landgoed Groot Warnsborn': {
        description: l('Een landhuis uit 1770 op een bosrijk landgoed van 200 hectare aan de rand van Arnhem, aan de voet van de Veluwe. De 27 kamers zijn klassiek ingericht met uitzicht op het park; het restaurant serveert seizoensgebonden gerechten. Wandelroutes beginnen bij de voordeur.',
          'A 1770 country house on a wooded 200-hectare estate on the edge of Arnhem, at the foot of the Veluwe. The 27 rooms are classically furnished with park views; the restaurant serves seasonal dishes. Walking routes start at the front door.'),
        facilities: ['Restaurant', 'Bar en lounge met open haard', 'Terras met uitzicht op het park', 'Wandelroutes vanaf het hotel', 'Gratis parkeren', 'Gratis wifi', 'Fietsverhuur', 'Badjas en slippers'],
        room: { name: l('Luxe kamer (upgrade)', 'Luxe kamer (upgrade)'), description: l('Je krijgt een upgrade naar een luxe kamer aan de parkzijde: klassiek ingericht, met zitje, badjas en slippers en uitzicht op de oude bomen van het landgoed.', "You are upgraded to a luxury room on the park side: classically furnished, with a seating area, bathrobe and slippers and views of the estate's old trees.") },
      },
      'Kasteel Engelenburg': {
        description: l('Een 17e-eeuws kasteel omringd door een slotgracht en een Engelse landschapstuin bij Brummen, tussen de IJssel en de Veluwezoom. Veertig kamers in het kasteel en het koetshuis, een restaurant in de oranjerie en een eigen 9-holes golfbaan. De wijnkelder en de sigarenlounge maken het beeld compleet.',
          'A 17th-century castle surrounded by a moat and an English landscape garden near Brummen, between the IJssel and the Veluwezoom. Forty rooms in the castle and coach house, a restaurant in the orangery and its own 9-hole golf course. The wine cellar and cigar lounge complete the picture.'),
        facilities: ['Restaurant in de oranjerie', 'Wijnkelder', 'Eigen 9-holes golfbaan', 'Landschapstuin met slotgracht', 'Gratis parkeren', 'Gratis wifi', 'Bar en lounge', 'Early check-in'],
        room: { name: l('Luxe kamer (upgrade)', 'Luxe kamer (upgrade)'), description: l('Op basis van beschikbaarheid verblijf je in een luxe kamer in het kasteel of het koetshuis, met antiek meubilair, een royaal bed en zicht op de tuin of de slotgracht.', 'Subject to availability you stay in a luxury room in the castle or coach house, with antique furniture, a generous bed and views of the garden or moat.') },
      },
      'Landhuishotel De Bloemenbeek': {
        description: l('Vijfsterrenlandhuishotel in het coulisselandschap van De Lutte, met een Michelin-restaurant en een spa van 1.500 vierkante meter met binnen- en buitenbaden, sauna\'s en behandelkamers. De kamers en suites kijken uit over de tuin en het Twentse landschap.',
          'Five-star country house hotel in the Twente landscape near De Lutte, with a Michelin restaurant and a 1,500-square-metre spa with indoor and outdoor pools, saunas and treatment rooms. Rooms and suites overlook the garden and the countryside.'),
        facilities: ['Michelin-restaurant De Bloemenbeek', 'Spa met binnen- en buitenbad', 'Sauna\'s en hamam', 'Behandelingen en massages', 'Fitness', 'Gratis parkeren', 'Gratis wifi', 'Fietsverhuur'],
        room: { name: l('Superior kamer (upgrade)', 'Superior kamer (upgrade)'), description: l('Een Superior kamer met terras of balkon op de tuin, een badkamer met bad en aparte douche en een badjas voor de spa. Rust en ruimte in het coulisselandschap.', 'A Superior room with terrace or balcony onto the garden, a bathroom with bath and separate shower and a bathrobe for the spa. Peace and space in the Twente countryside.') },
      },
    },
    days: [
      { day: 1, activities: [
        { title: l('Kennismaken met het landgoed', 'Getting to know the estate'), text: l('Check rustig in en maak een eerste wandeling over het landgoed: de bossen van Groot Warnsborn lopen door tot aan de Veluwe. Geniet daarna van een drankje op het terras met uitzicht op het park.', 'Check in at leisure and take a first walk across the estate: the Groot Warnsborn woods run all the way to the Veluwe. Then enjoy a drink on the terrace overlooking the park.'), image: img('003', 'rosendael2') },
      ] },
      { day: 2, activities: [
        { title: l('Arnhem en Kasteel Rosendael', 'Arnhem and Rosendael castle'), text: l('Na het ontbijt heb je een volle dag voor Arnhem en omgeving. Wandel door het historische centrum, bezoek de Eusebiuskerk of Museum Arnhem, en combineer de stad met Kasteel Rosendael: het historische kasteel ligt in een sfeervol landschapspark met oude bomen, vijvers en de beroemde bedriegertjes.', 'After breakfast you have a full day for Arnhem and its surroundings. Walk through the historic centre, visit the Eusebius church or Museum Arnhem, and combine the city with Rosendael castle in its atmospheric landscape park with old trees, ponds and the famous trick fountains.'), image: img('003', 'rosendael') },
        { title: l('Alternatief: Kröller-Müller op de Hoge Veluwe', 'Alternative: Kröller-Müller in the Hoge Veluwe'), text: l('Liever kunst én natuur? Het Kröller-Müller Museum in Nationaal Park De Hoge Veluwe heeft een wereldberoemde collectie Van Goghs en een grote beeldentuin midden in de natuur. Pak een van de witte fietsen om het park te verkennen.', 'Prefer art and nature? The Kröller-Müller Museum in De Hoge Veluwe National Park has a world-famous Van Gogh collection and a large sculpture garden in the middle of nature. Take one of the free white bikes to explore the park.'), image: img('003', 'kroller') },
      ] },
      { day: 3, route: { title: l('Via Landgoed Middachten naar Brummen', 'Via Landgoed Middachten to Brummen'), text: l('Je volgende hotel ligt op een half uur rijden, dus er is alle tijd voor een tussenstop. Een aanrader is Landgoed Middachten in De Steeg: het imposante kasteel en de historische tuinen vormen een van de bijzondere buitenplaatsen van de regio. Daarna volg je de Veluwezoom naar Kasteel Engelenburg.', 'Your next hotel is half an hour away, so there is time for a stop. Landgoed Middachten in De Steeg is a must: the imposing castle and historic gardens are among the region\'s finest country estates. Then follow the Veluwezoom to Kasteel Engelenburg.'), image: img('003', 'middachten') } },
      { day: 4, activities: [
        { title: l('Historisch Zutphen', 'Historic Zutphen'), text: l('Op tien minuten van Engelenburg ligt Hanzestad Zutphen. Bezoek de Walburgiskerk met de middeleeuwse Librije, wandel door de hofjes en langs de IJsselkade, en lunch op het \'s Gravenhof.', 'Ten minutes from Engelenburg is the Hanseatic town of Zutphen. Visit the Walburgis church with its medieval Librije library, wander through the courtyards and along the IJssel quay, and have lunch on the \'s Gravenhof square.'), image: img('002', 'zutphen') },
        { title: l('Golf of tuin op het kasteel', 'Golf or gardens at the castle'), text: l('Terug op Engelenburg kun je een rondje spelen op de eigen 9-holes golfbaan of een wandeling maken door de landschapstuin rond de slotgracht. Vanavond is het diner vrij; Zutphen en Brummen hebben goede restaurants.', 'Back at Engelenburg, play a round on the castle\'s own 9-hole course or stroll through the landscape garden around the moat. Dinner is free tonight; Zutphen and Brummen have good restaurants.'), image: img('003', 'rosendael2') },
      ] },
      { day: 5, route: { title: l('Via Kasteel Ruurlo naar Twente', 'Via Kasteel Ruurlo to Twente'), text: l('De etappe naar De Lutte duurt een uur. Stop halverwege in Ruurlo, waar Museum MORE in het kasteel de collectie van Carel Willink toont en de doolhof naast het kasteel de grootste van Europa is. Rij daarna door het coulisselandschap van Twente naar De Bloemenbeek.', 'The leg to De Lutte takes an hour. Stop halfway in Ruurlo, where Museum MORE in the castle shows the Carel Willink collection and the maze next door is the largest in Europe. Then drive through the Twente landscape to De Bloemenbeek.'), image: img('003', 'ruurlo') } },
      { day: 6, activities: [
        { title: l('Landgoed Singraven en kunststad Ootmarsum', 'Landgoed Singraven and the art town of Ootmarsum'), text: l('Bezoek in de ochtend Landgoed Singraven bij Denekamp met zijn havezate, watermolen en beukenlanen. Rij daarna naar Ootmarsum, het kunststadje met galeries, ateliers en een klein historisch centrum vol vakwerkhuizen.', 'In the morning visit Landgoed Singraven near Denekamp with its manor, watermill and beech avenues. Then drive to Ootmarsum, the art town with galleries, studios and a small historic centre full of timber-framed houses.'), image: img('003', 'ootmarsum') },
        { title: l('Ontspannen in de spa', 'Relaxing in the spa'), text: l('De middag is voor de spa van De Bloemenbeek: binnen- en buitenbad, sauna\'s en een hamam, allemaal onbeperkt inbegrepen tijdens je verblijf. Boek eventueel een massage.', 'The afternoon is for De Bloemenbeek\'s spa: indoor and outdoor pool, saunas and a hammam, all included without limit during your stay. Book a massage if you like.'), image: img('003', 'singraven') },
      ] },
      { day: 7, homeward: { title: l('Uitgebreid ontbijt en terugreis', 'Leisurely breakfast and journey home'), text: l('Late check-out tot 13.00 uur, dus geniet nog even van het landgoed. Utrecht ligt op een uur en veertig minuten rijden.', 'Late check-out until 1 pm, so enjoy the estate a little longer. Utrecht is an hour and forty minutes\' drive.'), image: img('003', 'singraven') } },
    ],
    mapHighlights: [
      { kind: 'castle', name: l('Kasteel Rosendael', 'Rosendael Castle'), lat: 52.011, lng: 5.97, text: l('Kasteel in een landschapspark met vijvers en de beroemde bedriegertjes.', 'Castle in a landscape park with ponds and the famous trick fountains.'), image: img('003', 'rosendael') },
      { kind: 'museum', name: l('Kröller-Müller Museum', 'Kröller-Müller Museum'), lat: 52.095, lng: 5.817, text: l('Van Goghs en een grote beeldentuin midden in De Hoge Veluwe.', 'Van Goghs and a large sculpture garden in the middle of De Hoge Veluwe.'), image: img('003', 'kroller') },
      { kind: 'castle', name: l('Landgoed Middachten', 'Middachten Estate'), lat: 52.011, lng: 6.085, text: l('Imposant kasteel met historische tuinen in De Steeg.', 'Imposing castle with historic gardens in De Steeg.'), image: img('003', 'middachten') },
      { kind: 'city', name: l('Zutphen', 'Zutphen'), lat: 52.14, lng: 6.2, text: l('Hanzestad met Walburgiskerk, hofjes en de IJsselkade.', 'Hanseatic town with the Walburgis church, courtyards and the IJssel quay.'), image: img('002', 'zutphen') },
      { kind: 'castle', name: l('Kasteel Ruurlo', 'Ruurlo Castle'), lat: 52.092, lng: 6.447, text: l('Museum MORE met de collectie van Carel Willink en de grootste doolhof van Europa.', "Museum MORE with the Carel Willink collection and Europe's largest maze."), image: img('003', 'ruurlo') },
      { kind: 'castle', name: l('Landgoed Singraven', 'Singraven Estate'), lat: 52.364, lng: 6.999, text: l('Havezate, watermolen en beukenlanen bij Denekamp.', 'Manor, watermill and beech avenues near Denekamp.'), image: img('003', 'singraven') },
      { kind: 'village', name: l('Ootmarsum', 'Ootmarsum'), lat: 52.408, lng: 6.901, text: l('Kunststadje met galeries, ateliers en vakwerkhuizen.', 'Art town with galleries, studios and timber-framed houses.'), image: img('003', 'ootmarsum') },
    ],
  },

  // ── 004 Bourgondisch Zuid-Limburg — Luxe & Wellness ───────────────────
  'trip-zuid-limburg-luxe': {
    description: [
      l('Geniet van het Limburgse goede leven: gastronomie, het Heuvelland, vijfsterrenluxe en wellness. Deze exclusieve 7-daagse route is alleen bij ViaLuxury te boeken en brengt je van historisch Sittard via het groene Zuid-Limburgse landschap naar het 5-sterren Superior Van Oys Maastricht Retreat, lid van The Leading Hotels of the World.',
        'Enjoy the good life of Limburg: gastronomy, the hill country, five-star luxury and wellness. This exclusive 7-day route is only available through ViaLuxury and takes you from historic Sittard via the green South Limburg countryside to the 5-star Superior Van Oys Maastricht Retreat, a Leading Hotel of the World.'),
      l('Je verblijft steeds twee nachten op een bijzondere locatie: Hotel Merici in een voormalig klooster midden in Sittard, Winselerhof in een 16e-eeuwse herenboerderij bij Landgraaf en Van Oys als luxe finale bij Maastricht. De afstanden zijn telkens circa 30 minuten.',
        'You stay two nights at each special location: Hotel Merici in a former convent in the centre of Sittard, Winselerhof in a 16th-century manor farm near Landgraaf and Van Oys as the luxurious finale near Maastricht. Each leg is about 30 minutes.'),
      l('Op iedere aankomstdag staat een bijzonder diner voor je klaar: een 3-gangendiner bij Restaurant George\'s, een 4-gangendiner bij Pirandello en tot slot een 4-gangendiner bij Restaurant Maes uit de Michelin-gids. Tijdens je laatste verblijf ontspan je in de Oysana-spa of ontdek je Maastricht.',
        'A special dinner awaits on every arrival day: a 3-course dinner at Restaurant George\'s, a 4-course dinner at Pirandello and finally a 4-course dinner at Michelin-listed Restaurant Maes. During your last stay you relax in the Oysana spa or discover Maastricht.'),
    ],
    highlights: [
      l('6 nachten in 3 bijzondere hotels, waaronder 5* Superior Van Oys', '6 nights in 3 special hotels, including 5* Superior Van Oys'),
      l('Een klooster en een 16e-eeuwse herenboerderij', 'A convent and a 16th-century manor farm'),
      l('3 culinaire diners uit Gault&Millau en de Michelin-gids', '3 culinary dinners from Gault&Millau and the Michelin guide'),
      l('Dagje Maastricht en een spa-dag', 'A day in Maastricht and a spa day'),
      l('Korte etappes van circa 30 minuten', 'Short legs of about 30 minutes'),
      l('Exclusieve ViaLuxury-route', 'Exclusive ViaLuxury route'),
    ],
    hotels: {
      'Hotel Merici': {
        description: l('Viersterrenhotel in een prachtig gerestaureerd Ursulinenklooster midden in het historische Kloosterkwartier van Sittard. De kloostergangen, de kapel en de binnentuin zijn bewaard; de 45 kamers zijn modern en rustig. Restaurant George\'s heeft een Gault&Millau-vermelding.',
          'Four-star hotel in a beautifully restored Ursuline convent in the historic Kloosterkwartier of Sittard. Cloisters, chapel and courtyard garden have been preserved; the 45 rooms are modern and quiet. Restaurant George\'s holds a Gault&Millau listing.'),
        facilities: ['Restaurant George\'s (Gault&Millau)', 'Bar in de kapel', 'Binnentuin en terras', 'Gratis wifi', 'Lift', 'Parkeergarage Oda nabij (betaald)', 'Fietsenstalling'],
        room: { name: l('Kloosterkamer (upgrade)', 'Kloosterkamer (upgrade)'), description: l('Op basis van beschikbaarheid krijg je een upgrade naar een luxer kamertype in het voormalige klooster: hoge ramen, rustige kleuren en een moderne badkamer, met zicht op de binnentuin of het Kloosterkwartier.', 'Subject to availability you are upgraded to a more luxurious room type in the former convent: tall windows, calm colours and a modern bathroom, overlooking the courtyard garden or the Kloosterkwartier.') },
      },
      'Hotel Winselerhof': {
        description: l('Een 16e-eeuwse herenboerderij aan de rand van Landgraaf, met een binnenplaats, een eigen wijngaard en 49 kamers rond de oude hoeve. Restaurant Pirandello serveert Italiaans-Limburgse gerechten met een Gault&Millau-vermelding; vanaf het terras kijk je over het Zuid-Limburgse land.',
          'A 16th-century manor farm on the edge of Landgraaf, with a courtyard, its own vineyard and 49 rooms around the old farmstead. Restaurant Pirandello serves Italian-Limburg cuisine with a Gault&Millau listing; the terrace looks out over the South Limburg countryside.'),
        facilities: ['Restaurant Pirandello (Gault&Millau)', 'Eigen wijngaard', 'Binnenplaats met terras', 'Gratis parkeren', 'Gratis wifi', 'Wandel- en fietsroutes', 'Bar'],
        room: { name: l('Hoevekamer', 'Hoevekamer'), description: l("Een ruime kamer in de oude hoeve, met houten balken, een comfortabel bed en zicht op de binnenplaats of de wijngaard. 's Ochtends ontbijt je in het restaurant beneden.", 'A spacious room in the old farmstead, with wooden beams, a comfortable bed and views of the courtyard or vineyard. In the morning you breakfast in the restaurant downstairs.') },
      },
      'Van Oys Maastricht Retreat': {
        description: l('Vijfsterren Superior hotel in een 17e-eeuws kasteel op een landgoed bij Eijsden, tien minuten van Maastricht. Lid van The Leading Hotels of the World en bekroond met een Michelin Key. Restaurant Maes staat in de Michelin-gids; de Oysana-spa met binnenbad, sauna\'s en behandelkamers ligt in de oude kasteelhoeve.',
          'Five-star Superior hotel in a 17th-century castle on an estate near Eijsden, ten minutes from Maastricht. A Leading Hotel of the World with a Michelin Key. Restaurant Maes is Michelin-listed; the Oysana spa with indoor pool, saunas and treatment rooms occupies the old castle farm.'),
        facilities: ['Restaurant Maes (Michelin-gids)', 'Oysana spa met binnenbad', 'Sauna\'s en behandelingen', 'Fitness', 'Kasteeltuin', 'Gratis parkeren', 'Laadpalen', 'Gratis wifi', 'Bar en lounge'],
        room: { name: l('Deluxe Room', 'Deluxe Room'), description: l('Je verblijft in een Deluxe Room met kasteel- of tuinzicht: design in warme materialen, een kingsize bed, marmeren badkamer en een badjas voor de Oysana-spa.', 'You stay in a Deluxe Room with castle or garden views: design in warm materials, a king-size bed, marble bathroom and a bathrobe for the Oysana spa.') },
      },
    },
    days: [
      { day: 1, activities: [
        { title: l('Ontdek historisch Sittard', 'Discover historic Sittard'), text: l('Wandel vanuit het hotel de stad in: het sfeervolle Kloosterkwartier, de historische straatjes en de gezellige Markt voor een drankje. Sittard is compact en sfeervol, een heerlijke plek om de reis ontspannen te beginnen.', 'Walk straight from the hotel into town: the atmospheric Kloosterkwartier, the historic streets and the lively Markt for a drink. Sittard is compact and charming, a lovely place to begin the trip at leisure.'), image: img('004', 'sittard') },
      ] },
      { day: 2, activities: [
        { title: l('Bourgondisch Sittard', 'Burgundian Sittard'), text: l('Wandel over de stadswallen, bekijk de monumentale panden en kerken en ontdek de kleine straatjes van de oude binnenstad. Neem uitgebreid de tijd voor koffie en een Limburgse lunch, en eindig de middag met een goed glas wijn of speciaalbier op de Markt.', 'Walk the town ramparts, admire the monumental houses and churches and explore the little streets of the old centre. Take your time over coffee and a Limburg lunch, and end the afternoon with a glass of wine or a local beer on the Markt.'), image: img('004', 'sittard') },
        { title: l('Shoppen met de VIP-pas in Maasmechelen Village', 'Shopping with the VIP pass at Maasmechelen Village'), text: l('Twintig minuten over de grens ligt Maasmechelen Village, het outletdorp met ruim honderd merken. Met de inbegrepen VIP-pas krijg je extra korting. Het diner is vanavond vrij in te vullen.', 'Twenty minutes across the border is Maasmechelen Village, the outlet village with over a hundred brands. The included VIP pass gives you extra discounts. Dinner is free tonight.'), image: img('004', 'heuvelland') },
      ] },
      { day: 3, route: { title: l('Via Kasteel Hoensbroek naar Landgraaf', 'Via Hoensbroek castle to Landgraaf'), text: l('Winselerhof ligt op een half uur, dus rij via Kasteel Hoensbroek, een van de grootste kastelen van Nederland met veertig ingerichte zalen en torens om te beklimmen. Na aankomst heb je alle tijd voor een wandeling rond de hoeve en de wijngaard.', 'Winselerhof is half an hour away, so go via Hoensbroek castle, one of the largest castles in the Netherlands with forty furnished rooms and towers to climb. After arrival there is time for a walk around the farm and vineyard.'), image: img('004', 'hoensbroek') } },
      { day: 4, activities: [
        { title: l('Het Heuvelland: wijngaarden en pittoreske dorpen', 'The hill country: vineyards and picturesque villages'), text: l('Vandaag staat in het teken van het Zuid-Limburgse Heuvelland. Rij door het Geuldal langs vakwerkhuizen en wijngaarden, bezoek Valkenburg met zijn kasteelruïne en mergelgrotten en stop in dorpen als Epen en Mechelen.', 'Today is all about the South Limburg hill country. Drive through the Geul valley past half-timbered houses and vineyards, visit Valkenburg with its castle ruin and marl caves, and stop in villages like Epen and Mechelen.'), image: img('004', 'heuvelland') },
        { title: l('Valkenburg en het Drielandenpunt', 'Valkenburg and the three-country point'), text: l('Eindig op het Drielandenpunt bij Vaals, het hoogste punt van Nederland, met uitzicht over drie landen. Terug op Winselerhof zijn er gratis wandel- en fietsroutes; het diner is vrij.', 'End at the three-country point near Vaals, the highest point in the Netherlands, with views over three countries. Back at Winselerhof there are free walking and cycling routes; dinner is free.'), image: img('004', 'valkenburg') },
      ] },
      { day: 5, route: { title: l('Langs de Maas naar Eijsden', 'Along the Maas to Eijsden'), text: l('De laatste etappe duurt een half uur. Rij via de Sint Servaasbrug door Maastricht of maak een omweg door de Maasvallei via Thorn, het witte stadje. Bij aankomst op Van Oys word je ontvangen met een welkomstdrankje.', 'The last leg takes half an hour. Drive through Maastricht via the Sint Servaas bridge, or detour through the Maas valley via Thorn, the white town. On arrival at Van Oys you are welcomed with a drink.'), image: img('004', 'servaasbrug') } },
      { day: 6, activities: [
        { title: l('Dagje Maastricht', 'A day in Maastricht'), text: l('Tien minuten rijden en je staat op het Vrijthof. Bezoek de Sint-Servaasbasiliek, de boekhandel in de Dominicanenkerk en het Wyck-kwartier met zijn winkels en terrassen, of vaar met een rondvaartboot over de Maas.', 'Ten minutes away is the Vrijthof. Visit the Sint Servaas basilica, the bookshop in the Dominican church and the Wyck quarter with its shops and terraces, or take a boat trip on the Maas.'), image: img('004', 'maastricht') },
        { title: l('Of: een ontspannen wellnessdag bij Van Oys', 'Or: a relaxed spa day at Van Oys'), text: l('Liever niets moeten? Gebruik van de Oysana-spa is inbegrepen: binnenbad, sauna\'s, rustruimtes en de kasteeltuin. Boek een behandeling en eet vanavond in Restaurant Maes of in de stad.', 'Prefer to do nothing? Use of the Oysana spa is included: indoor pool, saunas, relaxation rooms and the castle garden. Book a treatment and dine tonight at Restaurant Maes or in town.'), image: img('004', 'servaasbrug') },
      ] },
      { day: 7, homeward: { title: l('Uitgebreid ontbijt en ontspannen terugreis', 'Leisurely breakfast and relaxed journey home'), text: l('Ontbijt in alle rust en rij in twee uur terug naar Utrecht. Eventueel met een laatste stop in Thorn of bij de Maasplassen.', 'Breakfast at leisure and drive back to Utrecht in two hours, perhaps with a final stop in Thorn or at the Maasplassen lakes.'), image: img('004', 'thorn') } },
    ],
    mapHighlights: [
      { kind: 'city', name: l('Markt van Sittard', 'Sittard Markt'), lat: 50.998, lng: 5.869, text: l('Historisch centrum met het Kloosterkwartier, stadswallen en terrassen.', 'Historic centre with the Kloosterkwartier, ramparts and terraces.'), image: img('004', 'sittard') },
      { kind: 'shopping', name: l('Maasmechelen Village', 'Maasmechelen Village'), lat: 50.966, lng: 5.689, text: l('Outletdorp met ruim honderd merken; de VIP-pas is inbegrepen.', 'Outlet village with over a hundred brands; the VIP pass is included.'), image: img('004', 'heuvelland') },
      { kind: 'castle', name: l('Kasteel Hoensbroek', 'Hoensbroek Castle'), lat: 50.921, lng: 5.915, text: l('Een van de grootste kastelen van Nederland, veertig zalen en torens.', 'One of the largest castles in the Netherlands, forty rooms and towers.'), image: img('004', 'hoensbroek') },
      { kind: 'nature', name: l('Geuldal', 'Geul valley'), lat: 50.772, lng: 5.908, text: l('Vakwerkhuizen, wijngaarden en glooiende heuvels rond Epen en Mechelen.', 'Half-timbered houses, vineyards and rolling hills around Epen and Mechelen.'), image: img('004', 'heuvelland') },
      { kind: 'village', name: l('Valkenburg', 'Valkenburg'), lat: 50.865, lng: 5.832, text: l('Kasteelruïne en mergelgrotten in het hart van het Heuvelland.', 'Castle ruin and marl caves in the heart of the hill country.'), image: img('004', 'valkenburg') },
      { kind: 'nature', name: l('Drielandenpunt', 'Three-country point'), lat: 50.754, lng: 6.021, text: l('Het hoogste punt van Nederland, met uitzicht over drie landen.', 'The highest point in the Netherlands, with views over three countries.'), image: img('004', 'valkenburg') },
      { kind: 'city', name: l('Vrijthof Maastricht', 'Vrijthof Maastricht'), lat: 50.849, lng: 5.688, text: l('Sint-Servaasbasiliek, de boekhandel in de Dominicanenkerk en het Wyck-kwartier.', 'Sint Servaas basilica, the bookshop in the Dominican church and the Wyck quarter.'), image: img('004', 'maastricht') },
      { kind: 'village', name: l('Thorn', 'Thorn'), lat: 51.162, lng: 5.842, text: l('Het witte stadje aan de Maas, mooi voor een laatste stop op de terugweg.', 'The white town on the Maas, a nice final stop on the way home.'), image: img('004', 'thorn') },
    ],
  },

  // ── 005 Bourgondisch Zuid-Limburg — culinair ──────────────────────────
  'trip-zuid-limburg': {
    description: [
      l('Ontdek Zuid-Limburg op zijn allerlekkerst: historisch Sittard, het glooiende Heuvelland en bruisend Maastricht. Deze exclusieve 7-daagse route is alleen bij ViaLuxury te boeken en combineert twee voormalige kloosters met een 16e-eeuwse herenboerderij.',
        'Discover South Limburg at its most delicious: historic Sittard, the rolling hill country and vibrant Maastricht. This exclusive 7-day route is only available through ViaLuxury and combines two former convents with a 16th-century manor farm.'),
      l('Je verblijft steeds twee nachten op een bijzondere locatie: Hotel Merici midden in het centrum van Sittard, Winselerhof in het groene Zuid-Limburgse landschap en tot slot Hotel Monastère Maastricht, een boetiekhotel midden in de stad. De afstanden zijn telkens slechts circa 30 minuten.',
        'You stay two nights at each special location: Hotel Merici in the centre of Sittard, Winselerhof in the green South Limburg countryside and finally Hotel Monastère Maastricht, a boutique hotel in the heart of the city. Each leg is only about 30 minutes.'),
      l('Op de eerste twee aankomstdagen staat een diner voor je klaar: een 3-gangendiner bij Restaurant George\'s in Sittard en een 4-gangendiner bij Restaurant Pirandello op Winselerhof. De laatste twee avonden in Maastricht zijn bewust vrij gehouden, zodat je zelf een van de vele restaurants in de stad kunt ontdekken.',
        'Dinner is ready on the first two arrival days: a 3-course dinner at Restaurant George\'s in Sittard and a 4-course dinner at Restaurant Pirandello at Winselerhof. The last two evenings in Maastricht are deliberately left free, so you can discover one of the city\'s many restaurants yourself.'),
    ],
    highlights: [
      l('6 nachten in 3 bijzondere hotels', '6 nights in 3 special hotels'),
      l('Twee kloosters en een 16e-eeuwse herenboerderij', 'Two convents and a 16th-century manor farm'),
      l('2 culinaire diners met Gault&Millau-vermelding', '2 culinary dinners with Gault&Millau listing'),
      l('Twee nachten midden in Maastricht', 'Two nights in the heart of Maastricht'),
      l('Kamerupgrade in elk hotel', 'Room upgrade at every hotel'),
      l('Korte etappes van circa 30 minuten', 'Short legs of about 30 minutes'),
    ],
    hotels: {
      'Hotel Merici': {
        description: l('Viersterrenhotel in een prachtig gerestaureerd Ursulinenklooster midden in het historische Kloosterkwartier van Sittard. De kloostergangen, de kapel en de binnentuin zijn bewaard; de 45 kamers zijn modern en rustig. Restaurant George\'s heeft een Gault&Millau-vermelding.',
          'Four-star hotel in a beautifully restored Ursuline convent in the historic Kloosterkwartier of Sittard. Cloisters, chapel and courtyard garden have been preserved; the 45 rooms are modern and quiet. Restaurant George\'s holds a Gault&Millau listing.'),
        facilities: ['Restaurant George\'s (Gault&Millau)', 'Bar in de kapel', 'Binnentuin en terras', 'Gratis wifi', 'Lift', 'Parkeergarage Oda nabij (betaald)', 'Fietsenstalling'],
        room: { name: l('Kloosterkamer (upgrade)', 'Kloosterkamer (upgrade)'), description: l('Op basis van beschikbaarheid krijg je een upgrade naar een luxer kamertype in het voormalige klooster: hoge ramen, rustige kleuren en een moderne badkamer, met zicht op de binnentuin of het Kloosterkwartier.', 'Subject to availability you are upgraded to a more luxurious room type in the former convent: tall windows, calm colours and a modern bathroom, overlooking the courtyard garden or the Kloosterkwartier.') },
      },
      'Hotel Winselerhof': {
        description: l('Een 16e-eeuwse herenboerderij aan de rand van Landgraaf, met een binnenplaats, een eigen wijngaard en 49 kamers rond de oude hoeve. Restaurant Pirandello serveert Italiaans-Limburgse gerechten met een Gault&Millau-vermelding; vanaf het terras kijk je over het Zuid-Limburgse land.',
          'A 16th-century manor farm on the edge of Landgraaf, with a courtyard, its own vineyard and 49 rooms around the old farmstead. Restaurant Pirandello serves Italian-Limburg cuisine with a Gault&Millau listing; the terrace looks out over the South Limburg countryside.'),
        facilities: ['Restaurant Pirandello (Gault&Millau)', 'Eigen wijngaard', 'Binnenplaats met terras', 'Gratis parkeren', 'Gratis wifi', 'Wandel- en fietsroutes', 'Bar'],
        room: { name: l('Hoevekamer', 'Hoevekamer'), description: l("Een ruime kamer in de oude hoeve, met houten balken, een comfortabel bed en zicht op de binnenplaats of de wijngaard. 's Ochtends ontbijt je in het restaurant beneden.", 'A spacious room in the old farmstead, with wooden beams, a comfortable bed and views of the courtyard or vineyard. In the morning you breakfast in the restaurant downstairs.') },
      },
      'Hotel Monastère': {
        description: l('Boetiekhotel in een voormalig klooster uit 1907 in de wijk Boschstraatkwartier, op loopafstand van het Vrijthof en de Markt. De 56 kamers zijn ingericht met kunst en design; de kloostertuin is een oase in de stad. Ontbijt in de voormalige kapel, borrel in de bar of op het binnenterras.',
          'Boutique hotel in a former 1907 convent in the Boschstraat quarter, walking distance from the Vrijthof and Markt. The 56 rooms feature art and design; the cloister garden is an oasis in the city. Breakfast in the former chapel, drinks in the bar or on the inner terrace.'),
        facilities: ['Bar en lounge', 'Kloostertuin met terras', 'Ontbijt in de kapel', 'Gratis wifi', 'Lift', 'Parkeergarage nabij (betaald)', 'Fietsverhuur'],
        room: { name: l('Executive Room (upgrade)', 'Executive Room (upgrade)'), description: l('Op basis van beschikbaarheid een Executive Room met kunst aan de wand, een zitje en een luxe badkamer. Een fles wijn staat bij aankomst op de kamer.', 'Subject to availability an Executive Room with art on the walls, a seating area and a luxurious bathroom. A bottle of wine awaits in the room on arrival.') },
      },
    },
    days: [
      { day: 1, activities: [
        { title: l('Ontdek historisch Sittard', 'Discover historic Sittard'), text: l('Wandel vanuit het hotel de stad in: het sfeervolle Kloosterkwartier, de historische straatjes en de gezellige Markt voor een drankje. Sittard is compact en sfeervol, een heerlijke plek om de reis ontspannen te beginnen.', 'Walk straight from the hotel into town: the atmospheric Kloosterkwartier, the historic streets and the lively Markt for a drink. Sittard is compact and charming, a lovely place to begin the trip at leisure.'), image: img('004', 'sittard') },
      ] },
      { day: 2, activities: [
        { title: l('Bourgondisch Sittard', 'Burgundian Sittard'), text: l('Wandel over de stadswallen, bekijk de monumentale panden en kerken en ontdek de kleine straatjes van de oude binnenstad. Neem de tijd voor koffie en een Limburgse lunch, en eindig de middag met een glas wijn of speciaalbier op de Markt.', 'Walk the town ramparts, admire the monumental houses and churches and explore the little streets of the old centre. Take your time over coffee and a Limburg lunch, and end the afternoon with a glass of wine or a local beer on the Markt.'), image: img('004', 'sittard') },
        { title: l('Shoppen met de VIP-pas in Maasmechelen Village', 'Shopping with the VIP pass at Maasmechelen Village'), text: l('Twintig minuten over de grens ligt Maasmechelen Village, het outletdorp met ruim honderd merken. Met de inbegrepen VIP-pas krijg je extra korting. Het diner is vanavond vrij in te vullen.', 'Twenty minutes across the border is Maasmechelen Village, the outlet village with over a hundred brands. The included VIP pass gives you extra discounts. Dinner is free tonight.'), image: img('004', 'heuvelland') },
      ] },
      { day: 3, route: { title: l('Via Kasteel Hoensbroek naar Landgraaf', 'Via Hoensbroek castle to Landgraaf'), text: l('Winselerhof ligt op een half uur, dus rij via Kasteel Hoensbroek, een van de grootste kastelen van Nederland met veertig ingerichte zalen. Na aankomst heb je alle tijd voor een wandeling rond de hoeve en de wijngaard.', 'Winselerhof is half an hour away, so go via Hoensbroek castle, one of the largest castles in the Netherlands with forty furnished rooms. After arrival there is time for a walk around the farm and vineyard.'), image: img('004', 'hoensbroek') } },
      { day: 4, activities: [
        { title: l('Het Heuvelland: wijngaarden en pittoreske dorpen', 'The hill country: vineyards and picturesque villages'), text: l('Rij door het Geuldal langs vakwerkhuizen en wijngaarden, bezoek Valkenburg met zijn kasteelruïne en mergelgrotten en stop in dorpen als Epen en Mechelen. Proef een Limburgse vlaai onderweg.', 'Drive through the Geul valley past half-timbered houses and vineyards, visit Valkenburg with its castle ruin and marl caves, and stop in villages like Epen and Mechelen. Try a Limburg vlaai on the way.'), image: img('004', 'heuvelland') },
        { title: l('Valkenburg en het Drielandenpunt', 'Valkenburg and the three-country point'), text: l('Eindig op het Drielandenpunt bij Vaals, het hoogste punt van Nederland. Terug op Winselerhof zijn er gratis wandel- en fietsroutes; het diner is vrij.', 'End at the three-country point near Vaals, the highest point in the Netherlands. Back at Winselerhof there are free walking and cycling routes; dinner is free.'), image: img('004', 'valkenburg') },
      ] },
      { day: 5, route: { title: l('Naar Maastricht en de stad ontdekken', 'To Maastricht and into the city'), text: l('De laatste etappe duurt een half uur. Parkeer bij het hotel en ga meteen de stad in: het Vrijthof, de Sint-Servaasbasiliek en de boekhandel in de Dominicanenkerk liggen op loopafstand. Vanavond kies je zelf een restaurant; een fles wijn wacht op de kamer.', 'The last leg takes half an hour. Park at the hotel and head straight into town: the Vrijthof, the Sint Servaas basilica and the bookshop in the Dominican church are all within walking distance. Tonight you choose your own restaurant; a bottle of wine awaits in your room.'), image: img('004', 'servaasbrug') } },
      { day: 6, activities: [
        { title: l('Bourgondisch Maastricht', 'Burgundian Maastricht'), text: l('Cultuur, winkelen, terrassen en gastronomie: struin door het Stokstraatkwartier, steek de Sint Servaasbrug over naar Wyck en bezoek het Bonnefantenmuseum aan de Maas.', 'Culture, shopping, terraces and gastronomy: wander the Stokstraat quarter, cross the Sint Servaas bridge to Wyck and visit the Bonnefanten museum on the Maas.'), image: img('004', 'maastricht') },
        { title: l('De grotten en de Sint-Pietersberg', 'The caves and the Sint-Pietersberg'), text: l('Wandel of neem de bus naar de Sint-Pietersberg voor Fort Sint Pieter, de mergelgrotten en het uitzicht over de stad. Vanavond opnieuw een vrije avond in een van de vele restaurants.', 'Walk or take the bus to the Sint-Pietersberg for Fort Sint Pieter, the marl caves and the view over the city. Another free evening tonight in one of the many restaurants.'), image: img('004', 'servaasbrug') },
      ] },
      { day: 7, homeward: { title: l('Uitgebreid ontbijt en ontspannen terugreis', 'Leisurely breakfast and relaxed journey home'), text: l('Ontbijt in de kapel en rij in ruim twee uur terug naar Utrecht, eventueel met een stop in het witte stadje Thorn.', 'Breakfast in the chapel and drive back to Utrecht in just over two hours, perhaps with a stop in the white town of Thorn.'), image: img('004', 'thorn') } },
    ],
    mapHighlights: [
      { kind: 'city', name: l('Markt van Sittard', 'Sittard Markt'), lat: 50.998, lng: 5.869, text: l('Historisch centrum met het Kloosterkwartier, stadswallen en terrassen.', 'Historic centre with the Kloosterkwartier, ramparts and terraces.'), image: img('004', 'sittard') },
      { kind: 'shopping', name: l('Maasmechelen Village', 'Maasmechelen Village'), lat: 50.966, lng: 5.689, text: l('Outletdorp met ruim honderd merken; de VIP-pas is inbegrepen.', 'Outlet village with over a hundred brands; the VIP pass is included.'), image: img('004', 'heuvelland') },
      { kind: 'castle', name: l('Kasteel Hoensbroek', 'Hoensbroek Castle'), lat: 50.921, lng: 5.915, text: l('Een van de grootste kastelen van Nederland, veertig zalen en torens.', 'One of the largest castles in the Netherlands, forty rooms and towers.'), image: img('004', 'hoensbroek') },
      { kind: 'nature', name: l('Geuldal', 'Geul valley'), lat: 50.772, lng: 5.908, text: l('Vakwerkhuizen, wijngaarden en glooiende heuvels rond Epen en Mechelen.', 'Half-timbered houses, vineyards and rolling hills around Epen and Mechelen.'), image: img('004', 'heuvelland') },
      { kind: 'village', name: l('Valkenburg', 'Valkenburg'), lat: 50.865, lng: 5.832, text: l('Kasteelruïne en mergelgrotten in het hart van het Heuvelland.', 'Castle ruin and marl caves in the heart of the hill country.'), image: img('004', 'valkenburg') },
      { kind: 'city', name: l('Vrijthof Maastricht', 'Vrijthof Maastricht'), lat: 50.849, lng: 5.688, text: l('Stokstraatkwartier, Sint Servaasbrug naar Wyck en het Bonnefantenmuseum.', 'Stokstraat quarter, the Sint Servaas bridge to Wyck and the Bonnefanten museum.'), image: img('004', 'maastricht') },
      { kind: 'nature', name: l('Sint-Pietersberg', 'Sint-Pietersberg'), lat: 50.833, lng: 5.686, text: l('Fort Sint Pieter, mergelgrotten en uitzicht over de stad.', 'Fort Sint Pieter, marl caves and a view over the city.'), image: img('004', 'servaasbrug') },
      { kind: 'village', name: l('Thorn', 'Thorn'), lat: 51.162, lng: 5.842, text: l('Het witte stadje aan de Maas, mooi voor een laatste stop op de terugweg.', 'The white town on the Maas, a nice final stop on the way home.'), image: img('004', 'thorn') },
    ],
  },

  // ── 006 Nederlandse kustroute ─────────────────────────────────────────
  'trip-kustroute': {
    reviews: [
      { author: 'Ingrid en Paul', country: 'NL', month: '2026-07', score: 9.2,
        title: l('Drie keer de kust, drie keer anders', 'Three times the coast, three times different'),
        quote: l('Elke dag zee, maar geen dag hetzelfde.', 'The sea every day, but no two days the same.'),
        text: l('We dachten: drie keer strand, wordt dat niet eentonig? Integendeel. Ter Zand ligt verscholen in de duinen en is heerlijk rustig, Scheveningen is juist levendig en vanuit het zwembad op het dak kijk je zo over zee. Haarlem was een fijne afsluiter met de hofjes en goede restaurants, en het hotel in het Haarlemmermeerse Bos was een rustige uitvalsbasis. Elke dag zee, maar geen dag hetzelfde.\n\nHet diner op de aankomstdag was overal goed geregeld; in Burgh-Haamstede aten we bij Grand Hotel Ter Duin, twee minuten lopen verderop. De ritten zijn kort, dus onderweg is er alle tijd voor de Deltawerken en de boulevard van Noordwijk.',
          'We thought: three times the beach, won\'t that get monotonous? Quite the opposite. Ter Zand is tucked away in the dunes and wonderfully quiet, Scheveningen is lively and from the rooftop pool you look straight out to sea. Haarlem was a lovely finale with its courtyards and good restaurants, and the hotel in the Haarlemmermeerse Bos was a quiet base. The sea every day, but no two days the same.\n\nDinner on the day of arrival was well arranged everywhere; in Burgh-Haamstede we ate at Grand Hotel Ter Duin, a two-minute walk away. The drives are short, so there is plenty of time for the Delta Works and the Noordwijk boulevard along the way.') },
      { author: 'Familie Jansen', country: 'NL', month: '2026-06', score: 8.8,
        title: l('Ook met regen genoten', 'Enjoyed it even in the rain'),
        quote: l('Het zwembad bij Ter Duin en de spa op het dak van Inntel redden de regendag.', 'The pool at Ter Duin and the rooftop spa at Inntel saved the rainy day.'),
        text: l('Twee van de zes dagen regende het, maar dat maakte weinig uit. Het zwembad bij Ter Duin en de spa op het dak van Inntel redden de regendag, en Zierikzee is ook met een paraplu een plaatje. Toen de zon terugkwam, hebben we uren op het strand van Westerschouwen gelegen.\n\nKleine kanttekening: bij Inntel betaal je voor de parkeergarage, al krijg je wel korting via de link in de bevestiging. De kamer in Ter Zand was na de upgrade ruim en heel mooi ingericht. Een aanrader voor wie de Nederlandse kust opnieuw wil ontdekken.',
          'It rained on two of the six days, but that hardly mattered. The pool at Ter Duin and the rooftop spa at Inntel saved the rainy day, and Zierikzee is picture-perfect even under an umbrella. When the sun came back, we spent hours on the beach at Westerschouwen.\n\nSmall note: at Inntel you pay for the car park, although you do get a discount via the link in the confirmation. The room at Ter Zand was spacious and beautifully furnished after the upgrade. Recommended for anyone who wants to rediscover the Dutch coast.') },
      { author: 'Katrin', country: 'DE', month: '2026-05', score: 8.6,
        title: l('Nederland van zijn mooiste kant', 'The Netherlands at its best'),
        quote: l('De rit over de Oosterscheldekering was al een uitje op zich.', 'The drive across the Oosterschelde barrier was an outing in itself.'),
        text: l('Wij komen uit Keulen en kenden alleen Amsterdam. Deze route liet ons een heel ander Nederland zien: de rust van de Zeeuwse duinen, de brede boulevard van Scheveningen en het mooie oude centrum van Haarlem. De rit over de Oosterscheldekering was al een uitje op zich.\n\nEén nacht in Scheveningen is kort; wij hadden er graag een tweede nacht aan vastgeplakt. Verder was alles perfect geregeld, van het welkomstdrankje in Ter Zand tot het diner in de brasserie van Courtyard.',
          'We are from Cologne and only knew Amsterdam. This route showed us a completely different Netherlands: the calm of the Zeeland dunes, the wide boulevard of Scheveningen and the beautiful old centre of Haarlem. The drive across the Oosterschelde barrier was an outing in itself.\n\nOne night in Scheveningen is short; we would have happily added a second. Otherwise everything was perfectly arranged, from the welcome drink at Ter Zand to dinner in the Courtyard brasserie.') },
    ],
    description: [
      l('Zes dagen langs de Nederlandse kust, in drie heel verschillende decors: de stille duinen van Schouwen-Duiveland, het bruisende Scheveningen en de omgeving van Haarlem, met Zandvoort om de hoek. Je rijdt nooit langer dan anderhalf uur, eet op elke aankomstdag een 3-gangendiner en hebt elke dag de zee binnen handbereik. Deze route is alleen bij ViaLuxury te boeken.',
        'Six days along the Dutch coast in three very different settings: the quiet dunes of Schouwen-Duiveland, lively Scheveningen and the area around Haarlem, with Zandvoort around the corner. You never drive for more than an hour and a half, enjoy a 3-course dinner on every arrival day and have the sea within reach every day. This route is only available through ViaLuxury.'),
      l('Je begint met twee nachten in Hotel Ter Zand in Burgh-Haamstede, het boutiquezusje van Grand Hotel Ter Duin, verscholen tussen de duinen en in een luxer kamertype. Daarna volgt één nacht direct aan het strand bij Inntel Hotels Den Haag Marina Beach, met een zwembad op het dak, en als afsluiter twee nachten bij Courtyard by Marriott in Hoofddorp, aan de rand van het Haarlemmermeerse Bos en op een kwartier van Haarlem en Zandvoort.',
        'You start with two nights at Hotel Ter Zand in Burgh-Haamstede, the boutique sister of Grand Hotel Ter Duin, tucked away in the dunes and in an upgraded room. Then one night right on the beach at Inntel Hotels Den Haag Marina Beach, with a rooftop pool, and finally two nights at Courtyard by Marriott in Hoofddorp, on the edge of the Haarlemmermeerse Bos and fifteen minutes from Haarlem and Zandvoort.'),
      l('Het fijne aan deze route: je bent niet afhankelijk van het weer. Schijnt de zon, dan heb je lange stranddagen en duinwandelingen. Is het frisser, dan ontspan je in het zwembad en de wellness van Ter Duin of de spa op het dak van Inntel, of kies je voor Zierikzee, het Mauritshuis of het Frans Hals Museum.',
        'The beauty of this route: you do not depend on the weather. If the sun shines, you have long beach days and dune walks. If it is cooler, you relax in the pool and wellness at Ter Duin or the rooftop spa at Inntel, or choose Zierikzee, the Mauritshuis or the Frans Hals Museum.'),
    ],
    highlights: [
      l('5 nachten in 3 viersterrenhotels aan de kust', '5 nights in 3 four-star hotels on the coast'),
      l('3 x 3-gangendiner op de dag van aankomst', '3 x 3-course dinner on the day of arrival'),
      l('Zeeuwse duinen, Scheveningen en Haarlem in één reis', 'Zeeland dunes, Scheveningen and Haarlem in one trip'),
      l('Zwembad en wellness in Zeeland en Scheveningen', 'Pool and wellness in Zeeland and Scheveningen'),
      l('Korte etappes van circa een uur', 'Short legs of around an hour'),
      l('Kamerupgrade en welkomstdrankje in Ter Zand en Courtyard', 'Room upgrade and welcome drink at Ter Zand and Courtyard'),
    ],
    hotels: {
      'Hotel Ter Zand': {
        chapterTitle: l('Omgeving van de Zeeuwse duinen', 'Around the Zeeland dunes'),
        description: l('Een kleinschalig boutiquehotel uit de Handwritten Collection, verscholen tussen de duinen van Burgh-Haamstede en op loopafstand van strand en bos. De kamers zijn ingericht met natuurlijke materialen en zachte tinten; er is een restaurant met pure streekgerechten, een bar met open haard en een binnentuin. Voor het zwembad, de sauna\'s en de fitness loop je in twee minuten naar het naastgelegen Grand Hotel Ter Duin.',
          'A small boutique hotel from the Handwritten Collection, tucked away in the dunes of Burgh-Haamstede and within walking distance of beach and woods. The rooms are furnished with natural materials and soft tones; there is a restaurant with honest regional dishes, a bar with an open fire and an inner garden. The pool, saunas and gym are a two-minute walk away at the neighbouring Grand Hotel Ter Duin.'),
        facilities: ['Restaurant', 'Bar met open haard', 'Binnentuin', 'Binnenzwembad (Grand Hotel Ter Duin)', 'Wellness en fitness (Grand Hotel Ter Duin)', 'Fietsverhuur', 'Gratis parkeren', 'Snellaadstation naast het hotel', 'Gratis wifi'],
        room: { name: l('Luxere kamer (upgrade)', 'Upgraded room'), description: l('Bij deze vakantie word je standaard geüpgraded naar een luxer kamertype, zonder extra kosten: extra ruimte en comfort, ingericht in duinkleuren met een heerlijk bed en een ruime badkamer. Je wordt gewekt door vogels in plaats van een wekker.', 'On this holiday you are upgraded to a more luxurious room type as standard, at no extra cost: extra space and comfort, furnished in dune colours with a wonderful bed and a spacious bathroom. You wake to birdsong instead of an alarm.'), image: A + 'f021edcd-4e63-4d41-8cb2-a7bf42a74bd5?key=photo-full' },
      },
      'Inntel Hotels Den Haag Marina Beach': {
        chapterTitle: l('Omgeving van het bruisende Scheveningen', 'Around lively Scheveningen'),
        description: l('Viersterrenhotel direct aan het strand van Scheveningen, naast de haven. Op de bovenste verdieping liggen een infinity zwembad met uitzicht over strand en zee en wellness Spa Flow met panoramasauna, Turks stoombad en buitenterras; \'s zomers is ook het verwarmde buitenzwembad open. De boulevard en de Pier liggen op loopafstand.',
          'Four-star hotel right on Scheveningen beach, next to the harbour. On the top floor are an infinity pool overlooking beach and sea and the Spa Flow wellness with panoramic sauna, Turkish steam bath and outdoor terrace; in summer the heated outdoor pool is open too. The boulevard and the Pier are within walking distance.'),
        facilities: ['Bar & Brasserie Willem I', 'Infinity zwembad op het dak', 'Verwarmd buitenzwembad (zomer)', 'Spa Flow met panoramasauna', 'Fitness', 'Direct aan het strand', 'Parkeergarage (korting)', 'Gratis wifi', 'Lift', 'Mindervalide kamers'],
        room: { name: l('City Twin kamer', 'City Twin room'), description: l('Lichte, comfortabele kamer met een design dat geïnspireerd is op de naastgelegen haven. Je kijkt uit over de skyline van Den Haag en de haven, met de visafslag, de vissersboten en het reddingsstation van de KNRM.', 'Bright, comfortable room with a design inspired by the neighbouring harbour. You look out over the skyline of The Hague and the harbour, with the fish auction, the fishing boats and the KNRM lifeboat station.'), image: A + '75c82728-aac9-4fb7-ae69-ca7ca6dbf503?key=photo-full' },
      },
      'Courtyard by Marriott': {
        chapterTitle: l('Omgeving van het historische Haarlem', 'Around historic Haarlem'),
        description: l('Viersterrenhotel in de parkachtige omgeving van het Haarlemmermeerse Bos in Hoofddorp, dicht bij Haarlem, Zandvoort en Amsterdam. Na het diner in de Courtyard Brasserie kun je in het hotel bowlen op een van de twintig banen, een escape room doen of gratis naar het casino in het Claus Event Center; er zijn ook een fitnessruimte en een sauna.',
          'Four-star hotel in the park-like surroundings of the Haarlemmermeerse Bos in Hoofddorp, close to Haarlem, Zandvoort and Amsterdam. After dinner in the Courtyard Brasserie you can bowl on one of the twenty lanes, try an escape room or visit the casino in the Claus Event Center for free; there is also a gym and a sauna.'),
        facilities: ['Courtyard Brasserie', 'Bar', 'Fitness', 'Sauna', '20 bowlingbanen en 3 escape rooms', 'Gratis toegang tot het casino', 'Gratis parkeren', 'Gratis wifi', 'Cashless hotel (pinpas of creditcard)'],
        room: { name: l('Comfort King kamer (upgrade)', 'Comfort King room (upgrade)'), description: l('Je wordt geüpgraded naar een van de gloednieuwe Comfort King kamers: een kingsize bed, een inloopdouche en hoge ramen, met gratis wifi, geluidsdichte ramen en een Smart TV met Chromecast.', 'You are upgraded to one of the brand-new Comfort King rooms: a king-size bed, a walk-in shower and tall windows, with free wifi, soundproof windows and a Smart TV with Chromecast.'), image: A + '46b7b6fd-b154-44b3-854d-37b0c8690a2c?key=photo-full' },
      },
    },
    introTitle: l('6-daagse reis met eigen vervoer langs de Nederlandse kust', '6-day trip by car along the Dutch coast'),
    included: [
      { title: l('2 overnachtingen in Hotel Ter Zand', '2 nights at Hotel Ter Zand'),
        text: l('Twee nachten in het boutiquehotel tussen de duinen van Burgh-Haamstede, met een gratis upgrade naar een luxer kamertype.', 'Two nights at the boutique hotel in the dunes of Burgh-Haamstede, with a free upgrade to a more luxurious room type.'),
        longText: l('Twee nachten in Hotel Ter Zand, het kleinschalige zusje van Grand Hotel Ter Duin, verscholen tussen de duinen van Burgh-Haamstede. Je wordt standaard geüpgraded naar een luxer kamertype, met extra ruimte en comfort. Strand, bos en duinen liggen op loopafstand; \'s avonds wacht een glas wijn bij de open haard.',
          'Two nights at Hotel Ter Zand, the small sister of Grand Hotel Ter Duin, tucked away in the dunes of Burgh-Haamstede. You are upgraded to a more luxurious room type as standard, with extra space and comfort. Beach, woods and dunes are within walking distance; in the evening a glass of wine awaits by the open fire.'),
        image: A + '09b83ed2-0c2d-4521-9c2a-2b30395fe6ca?key=photo-full' },
      { title: l('1 overnachting in Inntel Hotels Den Haag Marina Beach', '1 night at Inntel Hotels Den Haag Marina Beach'),
        text: l('Eén nacht direct aan het strand van Scheveningen, met een infinity zwembad op het dak.', 'One night right on Scheveningen beach, with a rooftop infinity pool.'),
        longText: l('Eén nacht in het viersterrenhotel direct aan het strand van Scheveningen, naast de haven. Je City Twin kamer kijkt uit over de haven en de skyline van Den Haag; op de bovenste verdieping liggen het infinity zwembad en Spa Flow, met uitzicht over zee.',
          'One night at the four-star hotel right on Scheveningen beach, next to the harbour. Your City Twin room looks out over the harbour and the skyline of The Hague; on the top floor are the infinity pool and Spa Flow, overlooking the sea.'),
        image: A + '631d38dd-198f-4d0d-9c1b-665ff0a101ba?key=photo-full' },
      { title: l('2 overnachtingen in Courtyard by Marriott', '2 nights at Courtyard by Marriott'),
        text: l('Twee nachten aan de rand van het Haarlemmermeerse Bos, op een kwartier van Haarlem en Zandvoort, in een Comfort King kamer.', 'Two nights on the edge of the Haarlemmermeerse Bos, fifteen minutes from Haarlem and Zandvoort, in a Comfort King room.'),
        longText: l('Twee nachten in het viersterrenhotel in Hoofddorp, in de parkachtige omgeving van het Haarlemmermeerse Bos. Je wordt geüpgraded naar een gloednieuwe Comfort King kamer met kingsize bed en inloopdouche. Haarlem en Zandvoort liggen op een kwartier rijden; in het hotel zelf kun je bowlen, een escape room doen of gratis naar het casino.',
          'Two nights at the four-star hotel in Hoofddorp, in the park-like surroundings of the Haarlemmermeerse Bos. You are upgraded to a brand-new Comfort King room with a king-size bed and walk-in shower. Haarlem and Zandvoort are a fifteen-minute drive away; in the hotel itself you can bowl, try an escape room or visit the casino for free.'),
        image: A + '42d24dc5-9aae-4714-8476-e072499d366a?key=photo-full' },
      { title: l('5 dagen ontbijt', '5 days of breakfast'),
        text: l('Elke ochtend een uitgebreid ontbijtbuffet in het hotel waar je die nacht slaapt, in Scheveningen met bubbels.', 'An extensive breakfast buffet every morning at the hotel where you spent the night, with bubbles in Scheveningen.'),
        longText: l('Elke ochtend staat het ontbijt klaar in het hotel waar je die nacht sliep: in Ter Zand met vers brood en lokale smaken, in Scheveningen een uitgebreid buffet met een glaasje bubbels en in Hoofddorp het ontbijtbuffet van Courtyard om de dag in Haarlem of aan zee mee te beginnen. Geen haast: bij Ter Zand check je pas om 12:00 uur uit.',
          'Breakfast is ready every morning at the hotel where you slept: at Ter Zand with fresh bread and local flavours, in Scheveningen an extensive buffet with a glass of bubbles and in Hoofddorp the Courtyard breakfast buffet to start your day in Haarlem or by the sea. No hurry: at Ter Zand you only check out at 12:00.'),
        image: A + '7be54ce9-fb67-4ca4-85b4-4346f65af93c?key=photo-full' },
      { title: l('3 x een 3-gangendiner', '3 x a 3-course dinner'),
        text: l('In elk hotel op de dag van aankomst: \'s avonds hoef je nergens meer heen.', 'At each hotel on the day of arrival: no need to go anywhere in the evening.'),
        longText: l('Op elke aankomstdag staat \'s avonds een diner voor je klaar: in Burgh-Haamstede een culinair 3-gangendiner met seizoensproducten uit de streek, in Ter Zand of (op zondag en maandag) bij Grand Hotel Ter Duin om de hoek; in Scheveningen een 3-gangen verrassingsdiner bij Bar & Brasserie Willem I; en in Hoofddorp een 3-gangendiner in de Courtyard Brasserie. De overige avonden ben je vrij; in het reisschema staan onze tips.',
          'On every arrival day a dinner awaits you in the evening: in Burgh-Haamstede a culinary 3-course dinner with seasonal regional produce, at Ter Zand or (on Sundays and Mondays) at Grand Hotel Ter Duin around the corner; in Scheveningen a 3-course surprise dinner at Bar & Brasserie Willem I; and in Hoofddorp a 3-course dinner in the Courtyard Brasserie. The other evenings are free; the itinerary lists our tips.'),
        image: A + 'c432da79-a555-44df-b055-65318427fec0?key=photo-full' },
      { title: l('Welkomstdrankjes en tasting uurtje', 'Welcome drinks and tasting hour'),
        text: l('Een drankje bij aankomst in Ter Zand en Courtyard, en in Ter Zand een proeverij met hapjes.', 'A drink on arrival at Ter Zand and Courtyard, and a tasting with bites at Ter Zand.'),
        longText: l('Bij aankomst in Hotel Ter Zand word je ontvangen met een welkomstdrankje. Tussen 15:00 en 16:00 uur volgt het tasting uurtje: neem plaats in een van de comfortabele stoelen en proef de hapjes van de keuken. Ook bij Courtyard staat bij aankomst een drankje voor je klaar: bier, fris of wijn.',
          'On arrival at Hotel Ter Zand you are welcomed with a drink. Between 15:00 and 16:00 there is the tasting hour: take a seat in one of the comfortable chairs and taste the kitchen\'s bites. At Courtyard, too, a drink awaits on arrival: beer, soft drink or wine.'),
        image: A + '6c84ac37-6478-40ae-835b-855a84756894?key=photo-full' },
      { title: l('Zwembad, wellness en fitness', 'Pool, wellness and fitness'),
        text: l('In Zeeland het binnenzwembad en de sauna\'s van Grand Hotel Ter Duin, in Scheveningen het infinity zwembad en de spa op het dak.', 'In Zeeland the indoor pool and saunas of Grand Hotel Ter Duin, in Scheveningen the rooftop infinity pool and spa.'),
        longText: l('Is het frisser, dan duik je gewoon het water in. Als gast van Ter Zand gebruik je het overdekte zwembad, twee sauna\'s, het Turks stoombad en de fitness van Grand Hotel Ter Duin, op 200 meter van het hotel. In Scheveningen zwem je in het infinity zwembad op de hoogste verdieping met uitzicht op strand en zee, en ontspan je in Spa Flow met panoramasauna en buitenterras. Vergeet je badkleding niet.',
          'If it is cooler, simply dive in. As a guest of Ter Zand you use the indoor pool, two saunas, the Turkish steam bath and the gym of Grand Hotel Ter Duin, 200 metres from the hotel. In Scheveningen you swim in the infinity pool on the top floor overlooking beach and sea, and relax in Spa Flow with its panoramic sauna and outdoor terrace. Do not forget your swimwear.'),
        image: A + 'c0a1294d-23ef-44b6-8c95-4ad3a4570d01?key=photo-full' },
      { title: l('Late check-out bij Ter Zand en Courtyard', 'Late check-out at Ter Zand and Courtyard'),
        text: l('Rustig ontbijten en op je gemak vertrekken: bij Ter Zand tot 12:00 uur, bij Courtyard tot 14:00 uur.', 'A leisurely breakfast and an unhurried departure: until 12:00 at Ter Zand, until 14:00 at Courtyard.'),
        longText: l('Geen wekker op de eerste wisseldag: bij Ter Zand check je pas om 12:00 uur uit. Rustig ontbijten, nog een laatste strandwandeling, en dan pas de koffers in de auto; de rit naar Scheveningen over de Deltawerken is een uitje op zich. Op de laatste dag mag je bij Courtyard zelfs tot 14:00 uur blijven (op basis van beschikbaarheid).',
          'No alarm on the first changeover day: at Ter Zand you only check out at 12:00. A leisurely breakfast, one last beach walk, and only then the bags in the car; the drive to Scheveningen across the Delta Works is an outing in itself. On the last day Courtyard even lets you stay until 14:00 (subject to availability).'),
        image: A + '2e2a3dd2-d6f4-460d-af12-4e5401197098?key=photo-full' },
      { title: l('Parkeren', 'Parking'),
        text: l('Gratis bij Ter Zand en Courtyard, met korting in de garage van Inntel.', 'Free at Ter Zand and Courtyard, with a discount in the Inntel car park.'),
        longText: l('Bij Hotel Ter Zand parkeer je gratis op het terrein bij het hotel, met een snellaadstation ernaast. In Scheveningen krijg je tot 50% korting op de parkeergarage via de link in je boekingsbevestiging, en bij Courtyard staat de auto weer gratis op het terrein bij het hotel.',
          'At Hotel Ter Zand you park for free on the grounds by the hotel, with a fast charger next to it. In Scheveningen you get up to 50% off the car park via the link in your booking confirmation, and at Courtyard the car is parked for free on the hotel grounds again.'),
        image: A + '2d6d84e0-564c-4642-979f-f5fbff3c83b0?key=photo-full' },
    ],
    days: [
      // Redactie: elk blok 2–3 zinnen, het dagprogramma leest als één reis.
      // Hotelinfo zit achter "Meer over hotel …", achtergrond achter "Meer over …".
      { day: 1,
        arrival: { text: l(
          'Vanuit Utrecht rijd je in ruim anderhalf uur (zo\'n 150 km) naar Burgh-Haamstede, op de kop van Schouwen-Duiveland. Inchecken kan vanaf 15:00 uur; je wordt ontvangen met een welkomstdrankje en tot 16:00 uur loopt het tasting uurtje.',
          'From Utrecht it is a drive of just over an hour and a half (about 150 km) to Burgh-Haamstede, at the tip of Schouwen-Duiveland. Check-in is possible from 15:00; you are welcomed with a drink and the tasting hour runs until 16:00.',
        ) },
        activities: [
          { title: l('Eerste strandwandeling of de wellness', 'First beach walk or the wellness'),
            text: l('Trek als het weer uitnodigt meteen richting zee: het strand en de duinen van Westerschouwen liggen om de hoek. Blijf je liever binnen? Dan wachten het zwembad en de sauna\'s van Grand Hotel Ter Duin, twee minuten lopen verderop.',
              'If the weather invites you, head straight for the sea: the beach and dunes of Westerschouwen are around the corner. Rather stay in? Then the pool and saunas of Grand Hotel Ter Duin await, a two-minute walk away.'),
            image: A + '2d92ea4c-8fe1-4c69-b6fe-4fa1037931f6?key=photo-full',
            more: { label: l('Meer over Westerschouwen', 'More about Westerschouwen'), title: l('Westerschouwen, bos en duin aan zee', 'Westerschouwen, woods and dunes by the sea'), image: img('006', 'westerschouwen'), paragraphs: [
              l('Westerschouwen is het westelijke puntje van Schouwen-Duiveland en een van de grootste aaneengesloten duin- en bosgebieden van Zeeland. De naaldbossen zijn begin vorige eeuw aangeplant om het stuifzand vast te leggen; Staatsbosbeheer beheert er wandel-, fiets- en ruiterpaden die vanuit Burgh-Haamstede zo de duinen in lopen.',
                'Westerschouwen is the western tip of Schouwen-Duiveland and one of the largest continuous dune and woodland areas in Zeeland. The pine woods were planted early last century to fix the drifting sand; Staatsbosbeheer manages walking, cycling and bridle paths that lead straight into the dunes from Burgh-Haamstede.'),
              l('Het strand is breed en schoon, met een handvol strandpaviljoens. Bij helder weer kijk je vanaf de duintop tot de Oosterscheldekering. Fietsen huur je bij het hotel; de paden door de duinen en langs de polders zijn vlak en rustig.',
                'The beach is wide and clean, with a handful of beach pavilions. On a clear day you can see as far as the Oosterschelde barrier from the top of the dunes. Bikes can be hired at the hotel; the paths through the dunes and along the polders are flat and quiet.'),
            ] } },
        ] },
      { day: 2,
        breakfast: { text: l(
          'De eerste ochtend aan zee: vers brood, eitjes en lokale smaken in het restaurant van Ter Zand. Vandaag kan de auto blijven staan.',
          'Your first morning by the sea: fresh bread, eggs and local flavours in the Ter Zand restaurant. Today the car can stay where it is.',
        ) },
        activities: [
          { title: l('Strand, duinen en Westerschouwen', 'Beach, dunes and Westerschouwen'),
            text: l('Een volle dag voor de Zeeuwse kust: zoek een plekje aan zee, maak een lange strandwandeling of fiets door de duinen en bossen van Westerschouwen. Het landschap rond Burgh-Haamstede is vlak en ideaal om met de huurfiets te verkennen.',
              'A full day for the Zeeland coast: find a spot by the sea, take a long beach walk or cycle through the dunes and woods of Westerschouwen. The landscape around Burgh-Haamstede is flat and ideal for exploring by hired bike.'),
            image: img('006', 'westerschouwen') },
          { title: l('Bij minder weer: Zierikzee', 'In poorer weather: Zierikzee'),
            text: l('Is het guur, dan is dit de dag voor de wellness, of rij in twintig minuten naar het monumentale Zierikzee met zijn havenpoorten en de Dikke Toren. Het diner is vanavond vrij: probeer Zeeuwse oesters of mosselen aan de haven.',
              'If it is blustery, this is the day for the wellness, or drive twenty minutes to monumental Zierikzee with its harbour gates and the Dikke Toren. Dinner is free tonight: try Zeeland oysters or mussels by the harbour.'),
            image: A + '31e45de3-6e12-42f9-97b6-528b7b123db9?key=photo-full',
            more: { label: l('Meer over Zierikzee', 'More about Zierikzee'), title: l('Zierikzee, monumentale havenstad', 'Zierikzee, monumental harbour town'), image: img('006', 'zierikzee'), paragraphs: [
              l('Zierikzee was in de middeleeuwen een rijke handelsstad, groot geworden met meekrap, zout en haring. Uit die tijd stammen de stadspoorten aan de haven en de Sint-Lievensmonstertoren, de Dikke Toren: nooit afgebouwd en toch ruim zestig meter hoog. Met honderden rijksmonumenten is het een van de best bewaarde stadjes van Nederland.',
                'In the Middle Ages Zierikzee was a wealthy trading town, grown rich on madder, salt and herring. From that time date the town gates by the harbour and the Sint-Lievensmonstertoren, the Dikke Toren: never completed and still over sixty metres tall. With hundreds of listed monuments it is one of the best-preserved small towns in the Netherlands.'),
              l('Parkeer buiten de binnenstad en wandel over de kade van de Oude Haven naar het Havenplein en het Stadhuismuseum. De Oosterschelde ligt voor de deur, dus oesters en mosselen staan in elk restaurant op de kaart.',
                'Park outside the old town and walk along the quay of the Oude Haven to the Havenplein and the Stadhuismuseum. The Oosterschelde is on the doorstep, so oysters and mussels are on the menu in every restaurant.'),
            ] } },
        ] },
      { day: 3,
        breakfast: false,
        route: { title: l('Onderweg: over de Deltawerken naar Scheveningen', 'En route: across the Delta Works to Scheveningen'),
          text: l('Na een laatste ontbijt check je rustig uit, want tot 12:00 uur mag het. Rij over de Oosterscheldekering, stop bij Neeltje Jans of het Watersnoodmuseum en steek via de Brouwersdam en Goeree-Overflakkee over naar Zuid-Holland. Zonder stops duurt de rit ongeveer 1 uur 20.',
            'After a last breakfast you check out at leisure, as late as 12:00. Drive across the Oosterschelde barrier, stop at Neeltje Jans or the Flood Museum and cross via the Brouwersdam and Goeree-Overflakkee into South Holland. Without stops the drive takes about 1 hour 20.'),
          image: img('006', 'delta'),
          more: { label: l('Meer over de Deltawerken', 'More about the Delta Works'), title: l('De Deltawerken', 'The Delta Works'), image: img('006', 'delta'), paragraphs: [
            l('Na de watersnoodramp van 1953, waarbij in Zeeland, Zuid-Holland en West-Brabant 1.836 mensen omkwamen, besloot Nederland de zeegaten af te sluiten. De Oosterscheldekering (1986) is het pronkstuk van de Deltawerken: bijna negen kilometer lang, met 62 beweegbare schuiven die alleen bij storm dichtgaan, zodat het getij en het zoute leven van de Oosterschelde bewaard blijven.',
              'After the 1953 flood disaster, which claimed 1,836 lives in Zeeland, South Holland and West Brabant, the Netherlands decided to close off the sea inlets. The Oosterschelde barrier (1986) is the showpiece of the Delta Works: almost nine kilometres long, with 62 movable gates that only close during storms, preserving the tides and the saltwater life of the Oosterschelde.'),
            l('Op het werkeiland Neeltje Jans kijk je in een van de pijlers en loop je over de kering. Het Watersnoodmuseum in Ouwerkerk is gevestigd in vier caissons, de betonnen blokken waarmee in 1953 het laatste dijkgat werd gedicht. Reken voor elk op anderhalf tot twee uur.',
              'On the Neeltje Jans work island you can look inside one of the piers and walk along the barrier. The Flood Museum in Ouwerkerk is housed in four caissons, the concrete blocks used to close the last breach in the dyke in 1953. Allow an hour and a half to two hours for each.'),
          ] } },
        arrival: { text: l(
          'Halverwege de middag check je vanaf 15:00 uur in bij Inntel Hotels Den Haag Marina Beach, direct aan het strand en naast de haven. Neem voor het diner een duik in het infinity zwembad op het dak, met uitzicht over zee.',
          'Mid-afternoon you check in at Inntel Hotels Den Haag Marina Beach from 15:00, right on the beach and next to the harbour. Before dinner, take a dip in the rooftop infinity pool overlooking the sea.',
        ) },
        activities: [
          { title: l('De Pier en de boulevard', 'The Pier and the boulevard'),
            text: l('Wandel over de boulevard naar de Pier met het reuzenrad, of loop langs de haven naar de visafslag en de vissersboten. Voor een zonsondergang aan zee zit je hier op de eerste rij.',
              'Stroll along the boulevard to the Pier with its Ferris wheel, or walk along the harbour to the fish auction and the fishing boats. For a sunset over the sea you have a front-row seat here.'),
            image: A + 'f6d194e2-9c00-4977-9a69-8f32abee465c?key=photo-full',
            more: { label: l('Meer over Scheveningen', 'More about Scheveningen'), title: l('Scheveningen, badplaats van Den Haag', 'Scheveningen, seaside resort of The Hague'), image: img('006', 'scheveningen'), paragraphs: [
              l('Scheveningen was eeuwenlang een vissersdorp en werd in de 19e eeuw de chicste badplaats van Nederland. Uit die tijd stamt het Kurhaus (1885), het statige hotel aan de boulevard. De Pier uit 1961 is vernieuwd en heeft sinds 2016 een reuzenrad van veertig meter hoog, met uitzicht over de kust en de skyline van Den Haag.',
                'For centuries Scheveningen was a fishing village, and in the 19th century it became the most fashionable seaside resort in the Netherlands. The Kurhaus (1885), the stately hotel on the boulevard, dates from that time. The 1961 Pier has been renewed and since 2016 has a forty-metre Ferris wheel with views over the coast and the skyline of The Hague.'),
              l('Aan de haven, naast het hotel, liggen de vissersboten, de visafslag en het reddingsstation van de KNRM. Langs de havenkade eet je de vangst van de dag. Zin in cultuur? Met de tram ben je in twintig minuten in het centrum van Den Haag.',
                'At the harbour, next to the hotel, are the fishing boats, the fish auction and the KNRM lifeboat station. Along the harbour quay you can eat the catch of the day. Fancy some culture? The tram takes you to the centre of The Hague in twenty minutes.'),
            ] } },
        ] },
      { day: 4,
        breakfast: { text: l(
          'Een ontbijtbuffet met een glaasje bubbels en uitzicht op zee. Daarna uitchecken en op weg naar Hoofddorp, langs de kust of via het Mauritshuis.',
          'A breakfast buffet with a glass of bubbles and a sea view. Then check out and head for Hoofddorp, along the coast or via the Mauritshuis.',
        ) },
        route: { title: l('Onderweg: langs de kust en de Bollenstreek', 'En route: along the coast and the Bulb Region'),
          text: l('Neem de kustweg: de boulevards van Katwijk en Noordwijk en de bollenvelden in het voorjaar; rechtstreeks ben je in 50 minuten in Hoofddorp. Of maak eerst een ochtend Den Haag, met het Mauritshuis en het Binnenhof op twintig minuten met de tram.',
            'Take the coast road: the boulevards of Katwijk and Noordwijk and the bulb fields in spring; the direct drive to Hoofddorp takes 50 minutes. Or spend the morning in The Hague first, with the Mauritshuis and the Binnenhof twenty minutes away by tram.'),
          image: img('006', 'noordwijk'),
          more: { label: l('Meer over de Bollenstreek', 'More about the Bulb Region'), title: l('De Bollenstreek', 'The Bulb Region'), image: img('006', 'noordwijk'), paragraphs: [
            l('Tussen Leiden en Haarlem ligt de Bollenstreek, waar op de zandgronden achter de duinen bloembollen voor de hele wereld worden gekweekt. Van eind maart tot half mei kleuren de velden met krokussen, narcissen, hyacinten en tulpen; de mooiste route loopt via Lisse, Hillegom en Noordwijkerhout, en Keukenhof bij Lisse is dan open.',
              'Between Leiden and Haarlem lies the Bulb Region, where bulbs for the whole world are grown on the sandy soils behind the dunes. From late March to mid-May the fields colour with crocuses, daffodils, hyacinths and tulips; the finest route runs via Lisse, Hillegom and Noordwijkerhout, and Keukenhof near Lisse is open then.'),
            l('Buiten het bollenseizoen is de route net zo mooi langs de kust: de brede boulevard van Noordwijk met zijn vuurtoren, de Witte Kerk aan de boulevard van Katwijk en daarna binnendoor langs de Haarlemmermeer naar het hotel.',
              'Outside the bulb season the coastal route is just as beautiful: the wide boulevard of Noordwijk with its lighthouse, the White Church on the Katwijk boulevard and then inland along the Haarlemmermeer to the hotel.'),
          ] } },
        arrival: { text: l(
          'In de middag check je vanaf 15:00 uur in bij Courtyard by Marriott in Hoofddorp, aan de rand van het Haarlemmermeerse Bos, en word je verwelkomd met een drankje. \'s Avonds wacht het 3-gangendiner in de Courtyard Brasserie.',
          'In the afternoon you check in at Courtyard by Marriott in Hoofddorp from 15:00, on the edge of the Haarlemmermeerse Bos, and are welcomed with a drink. In the evening a 3-course dinner awaits in the Courtyard Brasserie.',
        ) } },
      { day: 5,
        breakfast: { text: l(
          'Het ontbijtbuffet van Courtyard, en dan naar Haarlem: in een kwartier sta je in de binnenstad, waar alles wat je vandaag wilt zien op loopafstand ligt.',
          'The Courtyard breakfast buffet, then off to Haarlem: in fifteen minutes you are in the old town, where everything you want to see today is within walking distance.',
        ) },
        activities: [
          { title: l('Een dag Haarlem', 'A day in Haarlem'),
            text: l('Haarlem in één dag: de Grote Markt met de Sint-Bavokerk, het Frans Hals Museum, Teylers Museum en de hofjes. Winkelen in de Gouden Straatjes en een terras aan het Spaarne.',
              'Haarlem in a day: the Grote Markt with the Sint Bavo church, the Frans Hals Museum, Teylers Museum and the courtyards. Shopping in the Gouden Straatjes and a terrace on the Spaarne.'),
            image: A + 'ff476409-6376-4bbd-a14e-e9e55639c2a1?key=photo-full',
            more: { label: l('Meer over Haarlem', 'More about Haarlem'), title: l('Haarlem, stad van hofjes en meesters', 'Haarlem, city of courtyards and masters'), image: A + '2f6e5d6a-79d7-46b9-b742-b6f243abb5a9?key=photo-full', paragraphs: [
              l('Haarlem was in de Gouden Eeuw na Amsterdam de belangrijkste kunststad van Holland; Frans Hals, Jacob van Ruisdael en Judith Leyster werkten hier. In het Frans Hals Museum, in een voormalig oudemannenhuis, hangen de grote schuttersstukken; Teylers Museum aan het Spaarne (1784) is het oudste museum van Nederland, met fossielen, instrumenten en tekeningen van Michelangelo en Rembrandt.',
                'In the Golden Age Haarlem was the most important art city in Holland after Amsterdam; Frans Hals, Jacob van Ruisdael and Judith Leyster worked here. The Frans Hals Museum, in a former almshouse for old men, displays the great civic guard portraits; Teylers Museum on the Spaarne (1784) is the oldest museum in the Netherlands, with fossils, instruments and drawings by Michelangelo and Rembrandt.'),
              l('Tussen de grachten liggen ruim twintig hofjes, verborgen binnentuinen met huisjes rond een pleintje; het Hofje van Bakenes uit 1395 is het oudste. De Gouden Straatjes rond de Grote Markt zitten vol boetieks en delicatessenwinkels, en in de Sint-Bavokerk staat het orgel waarop de jonge Mozart speelde.',
                'Among the canals lie more than twenty hofjes, hidden courtyard gardens with small houses around a square; the Hofje van Bakenes from 1395 is the oldest. The Gouden Straatjes around the Grote Markt are full of boutiques and delicatessens, and the Sint Bavo church houses the organ the young Mozart played.'),
            ] } },
          { title: l('Of nog één keer naar zee', 'Or one more time to the sea'),
            text: l('Kies je toch voor strand en duinen? Zandvoort ligt op twintig minuten, met de Kennemerduinen erachter voor een wandeling.', 'Prefer beach and dunes after all? Zandvoort is twenty minutes away, with the Kennemer dunes behind it for a walk.'),
            image: img('006', 'zandvoort') },
          { title: l('Avond in het hotel', 'Evening at the hotel'),
            text: l('Het diner is vanavond vrij. Eet in de Courtyard Brasserie of in Haarlem, en sluit af met een potje bowlen, een escape room of het casino in het hotel.', 'Dinner is free tonight. Eat in the Courtyard Brasserie or in Haarlem, and round off with a game of bowling, an escape room or the casino in the hotel.'),
            image: A + '9e71bbcb-d471-4fe3-a430-fd8f91784810?key=photo-full' },
        ] },
      { day: 6,
        breakfast: { text: l(
          'Laatste ontbijt in Courtyard. Uitchecken mag tot 14:00 uur (op basis van beschikbaarheid), dus er is nog tijd voor een wandeling door het Haarlemmermeerse Bos.',
          'Last breakfast at Courtyard. Check-out is possible until 14:00 (subject to availability), so there is still time for a walk in the Haarlemmermeerse Bos.',
        ) },
        homeward: { title: l('Ontspannen terug naar huis', 'A relaxed journey home'),
          text: l('De terugreis naar Utrecht duurt ongeveer drie kwartier. Of maak er nog een halve dag van: het Cruquius Museum over de droogmaking van de Haarlemmermeer ligt om de hoek, Zandvoort op twintig minuten.',
            'The drive back to Utrecht takes about three quarters of an hour. Or make it another half day: the Cruquius Museum on the draining of the Haarlemmermeer is around the corner, Zandvoort twenty minutes away.'),
          image: A + 'e901f0c8-a221-4a8f-bfc5-b8d73d7b1b05?key=photo-full' } },
    ],
    mapHighlights: [
      { kind: 'nature', name: l('Duinen van Westerschouwen', 'Westerschouwen dunes'), lat: 51.69, lng: 3.715, text: l('Strand, duinen en bossen op de kop van Schouwen-Duiveland, om de hoek van het hotel.', 'Beach, dunes and woods at the tip of Schouwen-Duiveland, around the corner from the hotel.'), image: img('006', 'westerschouwen') },
      { kind: 'village', name: l('Zierikzee', 'Zierikzee'), lat: 51.65, lng: 3.917, text: l('Monumentaal havenstadje met stadspoorten en de Dikke Toren.', 'Monumental harbour town with town gates and the Dikke Toren.'), image: A + '31e45de3-6e12-42f9-97b6-528b7b123db9?key=photo-full' },
      { kind: 'water', name: l('Oosterscheldekering', 'Oosterschelde barrier'), lat: 51.635, lng: 3.711, text: l('Pronkstuk van de Deltawerken, met Neeltje Jans halverwege de kering.', 'Showpiece of the Delta Works, with Neeltje Jans halfway along the barrier.'), image: img('006', 'delta') },
      { kind: 'museum', name: l('Watersnoodmuseum', 'Flood Museum'), lat: 51.623, lng: 3.983, text: l('Museum over de ramp van 1953, in de caissons die het laatste dijkgat dichtten.', 'Museum on the 1953 disaster, in the caissons that closed the last breach.'), image: img('006', 'delta') },
      { kind: 'beach', name: l('Scheveningen Pier', 'Scheveningen Pier'), lat: 52.109, lng: 4.279, text: l('De boulevard, de Pier met het reuzenrad en het strand voor het hotel.', 'The boulevard, the Pier with its Ferris wheel and the beach in front of the hotel.'), image: A + 'f6d194e2-9c00-4977-9a69-8f32abee465c?key=photo-full' },
      { kind: 'beach', name: l('Noordwijk', 'Noordwijk'), lat: 52.242, lng: 4.429, text: l('Boulevard en strand onderweg naar Hoofddorp, met de bollenvelden in het voorjaar.', 'Boulevard and beach on the way to Hoofddorp, with the bulb fields in spring.'), image: img('006', 'noordwijk') },
      { kind: 'beach', name: l('Zandvoort', 'Zandvoort'), lat: 52.374, lng: 4.53, text: l('Strand op twintig minuten van het hotel, met de Kennemerduinen ernaast.', 'Beach twenty minutes from the hotel, with the Kennemer dunes next door.'), image: img('006', 'zandvoort') },
      { kind: 'city', name: l('Grote Markt Haarlem', 'Haarlem Grote Markt'), lat: 52.381, lng: 4.636, text: l('Sint-Bavokerk, Frans Hals Museum, Teylers Museum en de Gouden Straatjes.', 'Sint Bavo church, Frans Hals Museum, Teylers Museum and the Gouden Straatjes.'), image: A + 'ff476409-6376-4bbd-a14e-e9e55639c2a1?key=photo-full' },
      { kind: 'museum', name: l('Cruquius Museum', 'Cruquius Museum'), lat: 52.338, lng: 4.635, text: l('Stoomgemaal over de droogmaking van de Haarlemmermeer, vlak bij het hotel.', 'Steam pumping station on the draining of the Haarlemmermeer, close to the hotel.') },
      { kind: 'nature', name: l('Haarlemmermeerse Bos', 'Haarlemmermeerse Bos'), lat: 52.318, lng: 4.675, text: l('Park met recreatieplas en wandelpaden, direct naast het hotel.', 'Park with a swimming lake and walking paths, right next to the hotel.'), image: A + '0bf7d61f-e7f8-497e-958e-a6258661417a?key=photo-full' },
    ],
  },

  // ── Fietsvakantie Twente & Salland ────────────────────────────────────
  'trip-fietsvakantie-twente-salland': {
    reviews: [
      { author: 'Anneke en Wim', country: 'NL', month: '2026-07', score: 9.2,
        title: l('Heerlijk ontspannen fietsen', 'Wonderfully relaxed cycling'),
        quote: l('De bagage stond elke dag netjes op de kamer, wij fietsten met alleen een dagtas.', 'Our luggage was waiting in the room every day; we cycled with just a day bag.'),
        text: l('Wat een ontspannen manier van vakantie vieren. Mooie routes over rustige paden langs landgoederen en door de bossen; de bagage stond elke dag netjes op de kamer, wij fietsten met alleen een dagtas. De routes op de telefoon waren duidelijk, verdwalen kan haast niet.\n\nHet diner bij De Zwaan in Raalte was verrassend goed en het ontbijt bij Herikerberg op het terras aan het bos was het mooiste moment van de week. De etappe naar Markelo was met tegenwind best pittig, maar met een pauze in Goor prima te doen.',
          'What a relaxed way to spend a holiday. Beautiful routes along quiet paths past country estates and through the woods; our luggage was waiting in the room every day and we cycled with just a day bag. The routes on the phone were clear; you can hardly get lost.\n\nDinner at De Zwaan in Raalte was surprisingly good and breakfast at Herikerberg on the terrace by the woods was the best moment of the week. The stage to Markelo was quite tough with a headwind, but fine with a break in Goor.') },
      { author: 'Jeroen', country: 'NL', month: '2026-06', score: 8.6,
        title: l('Goed georganiseerd', 'Well organised'),
        quote: l('Twente is echt een fietsparadijs.', 'Twente really is a cycling paradise.'),
        text: l('Goed georganiseerde fietsweek: fijne hotels, duidelijke routes op de telefoon en het bagagetransport werkte foutloos. Twente is echt een fietsparadijs, met rustige wegen en overal een terras voor koffie.\n\nIn Delden mocht de kamer wat moderner, maar de ligging naast landgoed Twickel maakte veel goed. Het welkomstfietstasje was een leuke verrassing. Voor wie een actieve maar ontspannen week zoekt is dit een heel goede keuze.',
          'Well-organised cycling week: nice hotels, clear routes on the phone and the luggage transfer worked flawlessly. Twente really is a cycling paradise, with quiet roads and a terrace for coffee everywhere.\n\nIn Delden the room could be a bit more modern, but the location next to the Twickel estate made up for a lot. The welcome bike bag was a nice surprise. For anyone looking for an active but relaxed week this is a very good choice.') },
      { author: 'Els', country: 'BE', month: '2026-05', score: 9.5,
        title: l('Twente op zijn mooist', 'Twente at its best'),
        quote: l('Landhuishotel Herikerberg was de kers op de taart, met een prachtig terras aan het bos.', 'Landhuishotel Herikerberg was the icing on the cake, with a lovely terrace by the woods.'),
        text: l('Wij komen uit Gent en kenden Twente niet, maar wat een streek om te fietsen: coulisselandschap, oude boerderijen en heel weinig verkeer. De etappes van 35 tot 45 kilometer waren precies goed; onderweg altijd tijd voor een omweg of een terras.\n\nLandhuishotel Herikerberg was de kers op de taart, met een prachtig terras aan het bos en een diner om over naar huis te schrijven. Alles klopte, van welkomstfietstasje tot ontbijt. Volgend jaar doen we de Hanzestedenroute.',
          'We are from Ghent and did not know Twente, but what a region for cycling: hedgerow landscape, old farms and very little traffic. The stages of 35 to 45 kilometres were just right; there was always time for a detour or a terrace along the way.\n\nLandhuishotel Herikerberg was the icing on the cake, with a lovely terrace by the woods and a dinner to write home about. Everything was right, from the welcome bike bag to breakfast. Next year we will do the Hanseatic cities route.') },
    ],
    introTitle: l('7-daagse fietsreis met bagagetransfer tussen hotels', '7-day cycling trip with luggage transfer between hotels'),
    // "Het volgende is inbegrepen" — teksten en foto's naar de extra's van de
    // oorspronkelijke dealpagina (deals.json-pakket 33960 "Fietsvakantie 2026",
    // includesDetailed; foto's met key=include, groter via key=photo-full).
    included: [
      { title: l('2 overnachtingen in Hotel Wapen van Delden', '2 nights at Hotel Wapen van Delden'),
        text: l('Twee nachten in het viersterrenhotel tegenover de Oude Blasiuskerk in Delden, in een Comfortkamer.', 'Two nights in the four-star hotel opposite the Oude Blasius church in Delden, in a Comfortkamer.'),
        longText: l('Twee nachten in het gastvrije Hotel Wapen van Delden, midden in het centrum tegenover de Oude Blasiuskerk en op loopafstand van Landgoed Twickel. Je slaapt in een Comfortkamer met regendouche; je fiets staat veilig in de afgesloten berging met laadpunten en je auto staat de hele vakantie gratis geparkeerd.',
          'Two nights at the welcoming Hotel Wapen van Delden, in the centre opposite the Oude Blasius church and a short walk from the Twickel estate. You sleep in a Comfortkamer with rain shower; your bike is safe in the locked storage with charging points and your car is parked for free for the whole holiday.'),
        image: A + '96bacad2-8a3a-4829-916e-bd6a6b79e065?key=photo-full' },
      { title: l('2 overnachtingen in Hotel de Zwaan', '2 nights at Hotel de Zwaan'),
        text: l('Twee nachten in het familiehotel in het hart van Raalte, in een Comfortkamer.', 'Two nights in the family hotel in the heart of Raalte, in a Comfortkamer.'),
        longText: l('Twee nachten bij Hotel de Zwaan, al generaties een begrip in Salland en bekend om restaurant Buitengewoon met zijn wijnkelder. Je Comfortkamer is klassiek ingericht in warme kleuren; het dorp en het restaurant liggen voor de deur en je fiets staat in de afgesloten berging.',
          'Two nights at Hotel de Zwaan, a household name in Salland for generations and known for its restaurant with wine cellar. Your Comfortkamer is classically furnished in warm colours; the village and the restaurant are on the doorstep and your bike is in the locked storage.'),
        image: A + 'ef123299-2053-479d-9bee-2f0f35e8fb35?key=photo-full' },
      { title: l('2 overnachtingen in Landhuishotel Herikerberg', '2 nights at Landhuishotel Herikerberg'),
        text: l('Twee nachten in het landhuishotel met rieten dak in de bossen bij Markelo, in een Landhuiskamer.', 'Two nights in the thatched country house hotel in the woods near Markelo, in a Landhuiskamer.'),
        longText: l('Twee nachten in Landhuishotel Herikerberg, met rieten dak in de bossen van de Herikerberg, midden in het Twentse coulisselandschap. Je Landhuiskamer kijkt uit op de rododendrontuin of het bos; beneden wachten het restaurant met terras en de lounge met open haard.',
          'Two nights at Landhuishotel Herikerberg, thatched and set in the woods of the Herikerberg in the heart of the Twente landscape. Your Landhuiskamer overlooks the rhododendron garden or the woods; downstairs the restaurant with terrace and the lounge with open fire await.'),
        image: A + 'df215919-df2c-49a0-95e6-1b99340a131c?key=photo-full' },
      { title: l('6 dagen ontbijt', '6 days of breakfast'),
        text: l('Elke ochtend een uitgebreid ontbijtbuffet in het hotel waar je die nacht sliep.', 'An extensive breakfast buffet every morning at the hotel where you spent the night.'),
        longText: l('Elke ochtend staat het ontbijtbuffet klaar in het hotel waar je die nacht sliep: een vers eitje, luxe broodjes, een rijke salade en vers fruit. Zo begin je goed voorbereid aan de etappe van die dag.',
          'Every morning the breakfast buffet is ready at the hotel where you slept: a fresh egg, fine breads, a rich salad and fresh fruit. The right start for the day\'s leg.'),
        image: A + 'f0ddba1a-88ae-4e1a-9a18-d5eeb16ed08d?key=photo-full' },
      { title: l('6 x een 3-gangendiner', '6 x a 3-course dinner'),
        text: l('Elke avond een 3-gangendiner in het restaurant van je hotel; na een fietsdag hoef je nergens meer heen.', 'A 3-course dinner every evening in your hotel restaurant; after a day of cycling there is no need to go anywhere.'),
        longText: l('Aan het einde van iedere fietsdag staat een 3-gangendiner voor je klaar in het restaurant van het hotel: de brasserie van het Wapen van Delden, restaurant Buitengewoon met zijn wijnkelder in Raalte en het restaurant met terras van de Herikerberg. Zes avonden lang hoef je na het fietsen nergens meer heen.',
          'At the end of every cycling day a 3-course dinner awaits in the hotel restaurant: the brasserie of the Wapen van Delden, restaurant Buitengewoon with its wine cellar in Raalte and the restaurant with terrace at the Herikerberg. Six evenings without having to go anywhere after cycling.'),
        image: A + 'd2bb46df-74ef-43f6-baeb-af7b12abc0ec?key=photo-full' },
      { title: l('Bagagetransfer tussen de hotels', 'Luggage transfer between the hotels'),
        text: l('Je bagage wordt op elke wisseldag naar het volgende hotel gebracht; jij fietst licht bepakt.', 'On every changeover day your luggage is taken to the next hotel; you cycle light.'),
        longText: l('Op de dagen dat je van hotel wisselt gaat je bagage vooruit: van Delden naar Raalte, van Raalte naar Markelo en aan het einde terug naar Delden. Jij fietst met alleen het fietstasje, en bij aankomst staan je koffers al op je kamer.',
          'On the days you change hotel your luggage goes ahead: from Delden to Raalte, from Raalte to Markelo and back to Delden at the end. You cycle with just the cycling bag, and on arrival your suitcases are already in your room.'),
        image: A + '1bb3dc7d-7649-46ee-8002-6be57c528495?key=photo-full' },
      // Oorspronkelijke tekst van de dealpagina.
      { title: l('Prachtige fietsroutes', 'Beautiful cycling routes'),
        text: l('Ontdek charmante dorpjes, uitgestrekte natuurgebieden en verborgen pareltjes langs de route – een actieve en plezierige manier om je reis te vervolgen.', 'Discover charming villages, wide open nature and hidden gems along the route – an active and enjoyable way to continue your journey.'),
        image: A + '67e7df8a-15b3-49bc-bed9-6ecb18d1c435?key=photo-full' },
      { title: l('Welkomstfietstasje', 'Welcome cycling bag'),
        text: l('Bij aankomst in Delden: een fietstasje met flesje water, regenponcho en bandenplaksetje.', 'On arrival in Delden: a cycling bag with a bottle of water, rain poncho and repair kit.'),
        longText: l('Bij aanvang van je fietsvakantie ontvang je in Hotel Wapen van Delden een welkomstfietstasje met een flesje water, een regenponcho en een bandenplaksetje: praktisch voor onderweg en goed voorbereid op een bui of een lekke band.',
          'At the start of your cycling holiday you receive a welcome cycling bag at Hotel Wapen van Delden with a bottle of water, a rain poncho and a repair kit: practical on the road and prepared for a shower or a flat tyre.'),
        image: A + '20d9f9d3-d698-4265-97ce-7f3c9ed693dc?key=photo-full' },
      { title: l('ViaLuxury welkomstcadeau', 'ViaLuxury welcome gift'),
        text: l('Een persoonlijke attentie voor onderweg, om de vakantie extra speciaal te beginnen.', 'A personal gift for the road, to start the holiday in style.'),
        longText: l('Begin je reis extra speciaal met een welkomstcadeau van ViaLuxury: een luxe, persoonlijke attentie voor onderweg die bij aankomst voor je klaarligt.',
          'Start your trip in style with a welcome gift from ViaLuxury: a luxurious, personal treat for the road, waiting for you on arrival.'),
        image: A + '4a61d99d-8132-41d0-ae71-3b876d85426d?key=photo-full' },
      { title: l('Gratis parkeren in Delden', 'Free parking in Delden'),
        text: l('Je auto staat de hele vakantie gratis bij het starthotel; de route is een rondje en eindigt weer in Delden.', 'Your car is parked for free at the starting hotel for the whole holiday; the route is a loop that ends back in Delden.'),
        longText: l('Je auto staat gedurende de hele vakantie gratis geparkeerd bij Hotel Wapen van Delden. De route is een rondje: op dag 7 fiets je de laatste 20 kilometer vanaf Markelo terug naar Delden, waar je auto klaarstaat voor de terugreis naar huis.',
          'Your car is parked for free at Hotel Wapen van Delden for the whole holiday. The route is a loop: on day 7 you cycle the last 20 kilometres from Markelo back to Delden, where your car is waiting for the drive home.'),
        image: A + '98db4cf0-f409-429c-af0e-53bbca9e36dd?key=photo-full' },
    ],
    description: [
      l('Een ontspannen 7-daagse fietsvakantie waarin comfort, natuur en gastvrijheid centraal staan. Je ontdekt het afwisselende landschap van Salland en Twente met groene landerijen, schilderachtige dorpen en rustige fietspaden, en verblijft telkens twee nachten in een ander sfeervol hotel terwijl je bagage vooruit reist.',
        'A relaxed 7-day cycling holiday centred on comfort, nature and hospitality. You discover the varied landscape of Salland and Twente with green farmland, picturesque villages and quiet cycle paths, staying two nights at each charming hotel while your luggage travels ahead.'),
      l('Je start bij Hotel Wapen van Delden tegenover de kerk van Delden, fietst via het Twentekanaal en de Sallandse Heuvelrug naar Hotel de Zwaan in Raalte en eindigt op Landhuishotel Herikerberg in de bossen bij Markelo. Om de dag fiets je een etappe van 35 tot 45 kilometer; de tussenliggende dagen zijn vrij voor een dagrondje vanaf het hotel, of om niets te doen. Op dag 7 fiets je de laatste 20 kilometer terug naar Delden, waar je auto staat.',
        'You start at Hotel Wapen van Delden opposite Delden\'s church, cycle via the Twente canal and the Sallandse Heuvelrug to Hotel de Zwaan in Raalte and finish at Landhuishotel Herikerberg in the woods near Markelo. Every other day you cycle a leg of 35 to 45 kilometres; the days in between are free for a loop from the hotel, or for doing nothing at all. On day 7 you cycle the last 20 kilometres back to Delden, where your car is waiting.'),
      l('Aan het einde van iedere fietsdag staat een 3-gangendiner voor je klaar en de volgende ochtend begin je met een uitgebreid ontbijt. De routes staan op je telefoon, het welkomstfietstasje bevat water, een regenponcho en een bandenplaksetje, en je auto parkeer je de hele vakantie gratis in Delden.',
        'At the end of every cycling day a 3-course dinner awaits, and the next morning starts with an extensive breakfast. Routes are on your phone, the welcome cycling bag holds water, a rain poncho and a repair kit, and your car parks free in Delden for the whole holiday.'),
    ],
    highlights: [
      l('6 nachten / 3 hotels in Twente en Salland', '6 nights / 3 hotels in Twente and Salland'),
      l('Dagelijks 3-gangendiner en uitgebreid ontbijt', 'Daily 3-course dinner and extensive breakfast'),
      l('Bagagetransfer tussen de hotels', 'Luggage transfer between the hotels'),
      l('3 etappedagen, 3 vrije dagen met dagrondjes', '3 stage days, 3 free days with day loops'),
      l('Welkomstfietstasje en ViaLuxury welkomstcadeau', 'Welcome cycling bag and ViaLuxury welcome gift'),
      l('Gratis parkeren gedurende de hele vakantie', 'Free parking for the whole holiday'),
    ],
    hotels: {
      'Hotel Wapen van Delden': {
        description: l('Modern viersterrenhotel in het centrum van Delden, tegenover de Oude Blasiuskerk en op loopafstand van Landgoed Twickel. Ruime kamers, een brasserie met terras op het plein en een fietsenberging met oplaadpunten. Je auto blijft hier de hele vakantie gratis staan.',
          'Modern four-star hotel in the centre of Delden, opposite the Oude Blasius church and a short walk from the Twickel estate. Spacious rooms, a brasserie with terrace on the square and a bike store with charging points. Your car stays here free for the whole holiday.'),
        facilities: ['Brasserie met terras', 'Bar', 'Afgesloten fietsenberging met laadpunten', 'Gratis parkeren', 'Gratis wifi', 'Lift', 'Fietsverhuur'],
        room: { name: l('Comfortkamer', 'Comfortkamer'), description: l('Moderne kamer met een comfortabel bed, bureau en badkamer met regendouche. Je fiets staat veilig in de afgesloten berging beneden.', 'Modern room with a comfortable bed, desk and bathroom with rain shower. Your bike is safe in the locked storage downstairs.') },
      },
      'Hotel de Zwaan': {
        description: l('Familiehotel in het hart van Raalte, al generaties lang een begrip in Salland. Bekend om restaurant Buitengewoon met zijn wijnkelder en om de gastvrijheid van de familie. De kamers zijn klassiek en comfortabel; het dorp met zijn terrassen ligt voor de deur.',
          'Family hotel in the heart of Raalte, a household name in Salland for generations. Known for its restaurant with wine cellar and the family\'s hospitality. The rooms are classic and comfortable; the village and its terraces are right outside.'),
        facilities: ['Restaurant', 'Wijnkelder en wijnbar', 'Terras', 'Afgesloten fietsenberging', 'Gratis parkeren', 'Gratis wifi', 'Lift'],
        room: { name: l('Comfortkamer', 'Comfortkamer'), description: l('Klassiek ingerichte kamer met warme kleuren, een comfortabel tweepersoonsbed en een nette badkamer. Het dorp en het restaurant van de familie liggen onder je.', "Classically furnished room in warm colours with a comfortable double bed and a neat bathroom. The village and the family's restaurant are right below you.") },
      },
      'Landhuishotel Herikerberg': {
        description: l('Landhuishotel met rieten dak in de bossen van de Herikerberg bij Markelo, midden in het Twentse coulisselandschap. Een tuin vol rododendrons, een restaurant met terras en een sfeervolle lounge met open haard. Vanaf het hotel lopen wandel- en fietsroutes de heuvel op.',
          'Thatched country house hotel in the woods of the Herikerberg near Markelo, in the heart of the Twente landscape. A garden full of rhododendrons, a restaurant with terrace and a cosy lounge with open fire. Walking and cycling routes climb the hill straight from the hotel.'),
        facilities: ['Restaurant met terras', 'Lounge met open haard', 'Tuin', 'Afgesloten fietsenberging', 'Gratis parkeren', 'Gratis wifi', 'Wandel- en fietsroutes vanaf het hotel'],
        room: { name: l('Landhuiskamer', 'Landhuiskamer'), description: l('Kamer met zicht op de rododendrontuin of het bos, ingericht in warme landhuisstijl met een comfortabel bed en een badkamer met bad of douche.', 'Room overlooking the rhododendron garden or the woods, decorated in warm country-house style with a comfortable bed and a bathroom with bath or shower.') },
      },
    },
    days: [
      { day: 1, activities: [
        { title: l('Landgoed Twickel en de eerste kilometers', 'Twickel estate and the first kilometres'), text: l('Zet de auto weg, haal je welkomstfietstasje op en maak een eerste rondje van 20 kilometer over Landgoed Twickel: langs het kasteel, de watermolen en de oude eiken van een van de mooiste landgoederen van Nederland.', 'Park the car, collect your welcome cycling bag and take a first 20-kilometre loop across the Twickel estate: past the castle, the watermill and the ancient oaks of one of the finest estates in the Netherlands.'), image: '/images/vakanties/007/twickel-kasteel.jpg' },
      ] },
      { day: 2, activities: [
        { title: l('Rondje Delden – Hengelo – Borne', 'Loop Delden – Hengelo – Borne'), text: l('Een rondje van 40 kilometer door het coulisselandschap: langs het Twentekanaal naar Hengelo, door het oude dorp van Borne en terug via de essen en houtwallen rond Azelo. Onderweg volop theetuinen.', 'A 40-kilometre loop through the hedgerow landscape: along the Twente canal to Hengelo, through the old village of Borne and back via the fields and wooded banks around Azelo. Plenty of tea gardens along the way.'), image: '/images/vakanties/cover/fietsvakantie-twente-salland-bos.jpg' },
        { title: l('Middag in Delden', 'Afternoon in Delden'), text: l('Terug in Delden is er tijd voor het Zoutmuseum, een terras op de Langestraat of een wandeling door de tuinen van Twickel.', 'Back in Delden there is time for the Salt Museum, a terrace on the Langestraat or a walk through the Twickel gardens.'), image: '/images/vakanties/007/nearby-twickel.jpg' },
      ] },
      { day: 3, route: { title: l('Etappe Delden – Raalte (45 km)', 'Leg Delden – Raalte (45 km)'), meta: l('45 km · ca. 3 uur fietsen · licht heuvelachtig (Holterberg) · lunch in Holten', '45 km · approx. 3 hours cycling · gently rolling (Holterberg) · lunch in Holten'), text: l('Je bagage gaat vooruit; jij fietst via Goor en Markelo over de Sallandse Heuvelrug. Stop bij de uitkijktoren op de Holterberg en lunch in Holten voordat je door de weilanden van Salland naar Raalte afdaalt.', 'Your luggage goes ahead; you cycle via Goor and Markelo across the Sallandse Heuvelrug. Stop at the lookout tower on the Holterberg and have lunch in Holten before descending through the Salland meadows to Raalte.'), image: '/images/vakanties/007/nearby-heuvelrug.jpg' } },
      { day: 4, activities: [
        { title: l('Rondje Salland: Deventer en de IJssel (40 km)', 'Salland loop: Deventer and the IJssel (40 km)'), text: l('Fiets door het Sallandse land naar Hanzestad Deventer, wandel over de Brink en door het Bergkwartier en neem het voetveer over de IJssel. Terug via de dijk en het landgoed De Haere.', 'Cycle through the Salland countryside to the Hanseatic town of Deventer, stroll across the Brink and through the Bergkwartier and take the foot ferry across the IJssel. Return via the dyke and the De Haere estate.'), image: '/images/vakanties/007/deventer-ijssel.jpg' },
        { title: l('Wijnproeverij bij De Zwaan', 'Wine tasting at De Zwaan'), text: l('Terug in Raalte kun je in de wijnkelder van het hotel een proeverij boeken voordat het diner begint.', 'Back in Raalte you can book a tasting in the hotel\'s wine cellar before dinner.'), image: '/images/vakanties/007/diner.jpg' },
      ] },
      { day: 5, route: { title: l('Etappe Raalte – Markelo (35 km)', 'Leg Raalte – Markelo (35 km)'), meta: l('35 km · ca. 2,5 uur fietsen · heide en beekdal, één klim naar de Herikerberg · lunch in Nijverdal', '35 km · approx. 2.5 hours cycling · heath and river valley, one climb to the Herikerberg · lunch in Nijverdal'), text: l('Door het beekdal van de Regge naar Nijverdal, over de heide van de Sallandse Heuvelrug en langs Rijssen naar de Herikerberg. De laatste kilometers klimmen zachtjes door het bos naar het hotel.', 'Through the Regge valley to Nijverdal, across the heath of the Sallandse Heuvelrug and past Rijssen to the Herikerberg. The last kilometres climb gently through the woods to the hotel.'), image: '/images/vakanties/007/nearby-raalte.jpg' } },
      { day: 6, activities: [
        { title: l('Rondje Markelo – Diepenheim – Goor (35 km)', 'Loop Markelo – Diepenheim – Goor (35 km)'), text: l('Langs vier kastelen rond Diepenheim (Nijenhuis, Weldam, Warmelo en Huis Diepenheim), door het stedeke Goor en terug over de Herikerberg. Een van de mooiste kastelenroutes van Twente.', 'Past four castles around Diepenheim (Nijenhuis, Weldam, Warmelo and Huis Diepenheim), through the little town of Goor and back over the Herikerberg. One of the finest castle routes in Twente.'), image: '/images/vakanties/007/nearby-fietsers-stad.jpg' },
        { title: l('Laatste avond op de Herikerberg', 'Last evening on the Herikerberg'), text: l('Wandel voor het diner nog even de heuvel op voor het uitzicht over het coulisselandschap en zak dan neer bij de open haard.', 'Before dinner, walk up the hill for the view over the landscape, then settle by the open fire.'), image: '/images/vakanties/007/nearby-zonsopkomst.jpg' },
      ] },
      { day: 7, homeward: { title: l('Terug naar Delden en naar huis', 'Back to Delden and home'), meta: l('20 km · ca. 1 uur 20 min fietsen · vlak · of mee met de bagagetransfer', '20 km · approx. 1 hour 20 min cycling · flat · or ride along with the luggage transfer'), text: l('Na het ontbijt fiets je de laatste 20 kilometer terug naar Delden, waar je auto staat. Of laat je met de bagage meerijden. Utrecht ligt op anderhalf uur.', 'After breakfast you cycle the last 20 kilometres back to Delden, where your car is waiting. Or ride along with the luggage. Utrecht is an hour and a half away.'), image: '/images/vakanties/007/kaart-lezen.jpg' } },
    ],
    mapHighlights: [
      { kind: 'castle', name: l('Landgoed Twickel', 'Twickel Estate'), lat: 52.276, lng: 6.718, text: l('Kasteel, watermolen en oude eiken op een van de mooiste landgoederen van Nederland.', 'Castle, watermill and ancient oaks on one of the finest estates in the Netherlands.'), image: '/images/vakanties/007/twickel-kasteel.jpg' },
      { kind: 'museum', name: l('Zoutmuseum Delden', 'Salt Museum Delden'), lat: 52.263, lng: 6.709, text: l('Klein museum over de zoutwinning in Twente, midden in Delden.', 'Small museum on salt mining in Twente, in the centre of Delden.'), image: '/images/vakanties/007/nearby-twickel.jpg' },
      { kind: 'nature', name: l('Holterberg', 'Holterberg'), lat: 52.305, lng: 6.425, text: l('Uitkijktoren op de Sallandse Heuvelrug, halverwege de etappe naar Raalte.', 'Lookout tower on the Sallandse Heuvelrug, halfway along the leg to Raalte.'), image: '/images/vakanties/007/nearby-heuvelrug.jpg' },
      { kind: 'city', name: l('Deventer', 'Deventer'), lat: 52.252, lng: 6.16, text: l('Hanzestad met de Brink, het Bergkwartier en het voetveer over de IJssel.', 'Hanseatic town with the Brink, the Bergkwartier and the foot ferry across the IJssel.'), image: '/images/vakanties/007/nearby-deventer-brug.jpg' },
      { kind: 'castle', name: l('Kastelen rond Diepenheim', 'Castles around Diepenheim'), lat: 52.199, lng: 6.534, text: l('Nijenhuis, Weldam, Warmelo en Huis Diepenheim op één fietsrondje.', 'Nijenhuis, Weldam, Warmelo and Huis Diepenheim on a single cycling loop.'), image: '/images/vakanties/007/nearby-fietsers-stad.jpg' },
      { kind: 'village', name: l('Goor', 'Goor'), lat: 52.232, lng: 6.585, text: l('Het stedeke Goor, onderweg op de kastelenroute.', 'The little town of Goor, on the castle route.'), image: '/images/vakanties/007/kaart-lezen.jpg' },
    ],
  },
}
