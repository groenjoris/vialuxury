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
  /** Faciliteiten als labels; het icoon komt uit utils facilityIcon. */
  facilities: string[]
  /** Kamer(type) waarin je verblijft, voor het kamerblok in de hotel-pop-up. */
  room?: { name: LocalizedString; description: LocalizedString; image?: string }
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
}

export interface TripDaySpec {
  day: number
  /** Eigen tekst voor het incheckblok van deze dag (dag 1: de heenreis en de
   *  inchecktijd; wisseldag: aankomst bij het volgende hotel) i.p.v. de
   *  hotelbeschrijving — die zit achter "Meer over hotel …". */
  arrival?: { text: LocalizedString; image?: string }
  /** Eigen ontbijttekst voor deze ochtend (anders het vaste sjabloon; op een
   *  uitcheckdag het "laatste ontbijt"-sjabloon). */
  breakfast?: { text: LocalizedString }
  /** Uitcheckdag: wat je onderweg naar het volgende hotel kunt doen. */
  route?: TripDayBlockSpec
  /** Verblijfsdag (of aankomstdag): 1–2 blokken. */
  activities?: TripDayBlockSpec[]
  /** Laatste dag: terugreis. */
  homeward?: TripDayBlockSpec
}

/** Omgevingshighlight op de fullscreen kaart: icoon op de kaart, hover met foto + uitleg. */
export interface TripMapHighlight {
  name: LocalizedString
  lat: number
  lng: number
  text: LocalizedString
  image?: string
}

export interface TripItinerarySpec {
  /** "Het volgende is inbegrepen" — rijen over de volle breedte boven het
   *  reisschema: de hotels met een foto (`image`), de overige punten met een
   *  icoon (`icon`, /icons/facilities/…). */
  included?: { title: LocalizedString; text: LocalizedString; image?: string; icon?: string }[]
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
    description: [
      l('Zeven dagen Noord-Frankrijk in drie totaal verschillende decors: het levendige Béthune met zijn UNESCO-belfort, de stille moerassen rond Saint-Omer en de krijtkust van de Opaalkust. Je slaapt twee nachten in elk hotel, rijdt tussendoor nooit langer dan een uur en eet op elke aankomstdag een 3-gangendiner in het hotel.',
        'Seven days of Northern France in three very different settings: lively Béthune with its UNESCO belfry, the quiet marshes around Saint-Omer and the chalk cliffs of the Opal Coast. Two nights in each hotel, never more than an hour on the road in between, and a 3-course dinner on every arrival day.'),
      l('Je begint in Hotel Royal Beaulaincourt, een 18e-eeuws herenhuis pal in het centrum van Béthune. Daarna volgt Château Tilques, een kasteel in een park aan de rand van Saint-Omer, en als afsluiter Château Cléry bij Hesdin-l\'Abbé, op een steenworp van Boulogne-sur-Mer en de stranden.',
        'You start at Hotel Royal Beaulaincourt, an 18th-century mansion in the heart of Béthune. Then Château Tilques, a castle in a park on the edge of Saint-Omer, and finally Château Cléry near Hesdin-l\'Abbé, a stone\'s throw from Boulogne-sur-Mer and the beaches.'),
      l('De etappes zijn bewust kort (circa 50 minuten), zodat je onderweg tijd hebt voor Arras, de Audomarois-moerassen of Cap Blanc-Nez. Vanuit Utrecht ben je in drie uur in Béthune; de terugreis vanaf de kust duurt ongeveer drieënhalf uur.',
        'The legs are deliberately short (around 50 minutes), leaving time for Arras, the Audomarois marshes or Cap Blanc-Nez. Béthune is three hours from Utrecht; the drive home from the coast takes about three and a half hours.'),
    ],
    highlights: [
      l('6 nachten in 3 bijzondere hotels, waaronder twee kastelen', '6 nights in 3 special hotels, including two châteaux'),
      l('3 x 3-gangendiner op de dag van aankomst', '3 x 3-course dinner on the day of arrival'),
      l('Stad, natuur en kust in één reis', 'City, nature and coast in one trip'),
      l('Korte etappes van circa 50 minuten', 'Short legs of around 50 minutes'),
      l('Welkomstbubbels en late check-out', 'Welcome bubbles and late check-out'),
      l('Gratis parkeren bij de kastelen', 'Free parking at the châteaux'),
    ],
    hotels: {
      'Hotel Royal Beaulaincourt': {
        description: l('Een 18e-eeuws hôtel particulier in het hart van Béthune, in 2023 volledig gerestaureerd tot een viersterrenhotel met 34 kamers. Achter de klassieke gevel vind je een lichte binnenplaats, een restaurant met terras en een bar in de oude salons. De Grand-Place met het belfort ligt om de hoek.',
          'An 18th-century private mansion in the heart of Béthune, fully restored in 2023 into a four-star hotel with 34 rooms. Behind the classical façade: a bright courtyard, a restaurant with terrace and a bar in the old salons. The Grand-Place and belfry are around the corner.'),
        facilities: ['Restaurant', 'Bar', 'Terras op de binnenplaats', 'Gratis wifi', 'Airconditioning', 'Lift', 'Fietsenstalling', 'Parkeergarage nabij (betaald)'],
        room: { name: l('Privilege Room', 'Privilege Room'), description: l('Verblijf in het stijlvolle Privilege Room, waar comfort en elegantie samenkomen. De kamer is ruim en smaakvol ingericht en biedt alle gemakken voor een ontspannen verblijf in het hart van Béthune.', 'Stay in the stylish Privilege Room, where comfort and elegance meet. The room is spacious and tastefully furnished and offers every convenience for a relaxed stay in the heart of Béthune.'), image: '/images/vakanties/001/beaulaincourt-3.jpg' },
      },
      'Hôtel Château Tilques': {
        description: l('Een 19e-eeuws kasteel van rode baksteen in een park van vier hectare, net buiten Saint-Omer. De 53 kamers liggen verdeeld over het kasteel en de voormalige stallen; het restaurant kijkt door een grote glaswand uit op het gazon. Met verwarmd binnenzwembad, tennisbaan en een golfbaan op loopafstand.',
          'A 19th-century red-brick château in a four-hectare park just outside Saint-Omer. The 53 rooms are spread over the château and the former stables; the restaurant looks out over the lawn through a large glass wall. Heated indoor pool, tennis court and a golf course within walking distance.'),
        facilities: ['Restaurant', 'Bar', 'Verwarmd binnenzwembad', 'Tennisbaan', 'Park van 4 hectare', 'Gratis parkeren', 'Gratis wifi', 'Golfbaan nabij'],
        room: { name: l('Chambre Charme', 'Chambre Charme'), description: l('De Chambre Charme ligt in het kasteel of de voormalige stallen en is ingericht in warme tinten met klassieke stoffen. Vanuit het raam kijk je uit over het park; de badkamer heeft een bad of ruime douche.', 'The Chambre Charme is located in the château or the former stables and is decorated in warm tones with classic fabrics. The window looks out over the park; the bathroom has a bath or a spacious shower.'), image: '/images/vakanties/001/tilques-4.jpg' },
      },
      'Hôtel Château Cléry': {
        description: l('Een 18e-eeuws kasteel op een landgoed van vijf hectare in Hesdin-l\'Abbé, tien minuten van Boulogne-sur-Mer en de Opaalkust. De 28 kamers liggen in het kasteel en de bijgebouwen rond de tuin met hortensia\'s. Diner in de serre van het restaurant, ontspannen in de kleine spa met sauna.',
          'An 18th-century château on a five-hectare estate in Hesdin-l\'Abbé, ten minutes from Boulogne-sur-Mer and the Opal Coast. The 28 rooms are in the château and outbuildings around the hydrangea garden. Dinner in the restaurant\'s conservatory, relaxation in the small spa with sauna.'),
        facilities: ['Restaurant in de serre', 'Bar', 'Spa met sauna', 'Fitnessruimte', 'Landgoed van 5 hectare', 'Gratis parkeren', 'Gratis wifi', 'Fietsverhuur'],
        room: { name: l('Chambre Charme', 'Chambre Charme'), description: l('Een sfeervolle kamer in het kasteel of een van de bijgebouwen rond de tuin, met klassiek meubilair, een comfortabel bed en zicht op het landgoed. Rustig gelegen, op een steenworp van de serre en de spa.', "A charming room in the château or one of the outbuildings around the garden, with classic furniture, a comfortable bed and views of the estate. Quietly located, a stone's throw from the conservatory and the spa."), image: '/images/vakanties/001/clery-6.jpg' },
      },
    },
    included: [
      { title: l('2 overnachtingen in Hotel Royal Beaulaincourt', '2 nights at Hotel Royal Beaulaincourt'),
        text: l('Twee nachten in het 18e-eeuwse herenhuis in het hart van Béthune, in een Privilege Room.', 'Two nights in the 18th-century mansion in the heart of Béthune, in a Privilege Room.'),
        image: '/images/vakanties/001/beaulaincourt-1.jpg' },
      { title: l('2 overnachtingen in Hôtel Château Tilques', '2 nights at Hôtel Château Tilques'),
        text: l('Twee nachten in het kasteel in een park van vier hectare bij Saint-Omer, in een Chambre Charme.', 'Two nights in the château in a four-hectare park near Saint-Omer, in a Chambre Charme.'),
        image: '/images/vakanties/001/tilques-1.jpg' },
      { title: l('2 overnachtingen in Hôtel Château Cléry', '2 nights at Hôtel Château Cléry'),
        text: l('Twee nachten op het landgoed bij Hesdin-l\'Abbé, op tien minuten van de Opaalkust.', 'Two nights on the estate near Hesdin-l\'Abbé, ten minutes from the Opal Coast.'),
        image: '/images/vakanties/001/clery-1.jpg' },
      { title: l('6 dagen ontbijt', '6 days of breakfast'),
        text: l('Elke ochtend een uitgebreid ontbijtbuffet in het hotel waar je die nacht slaapt.', 'An extensive breakfast buffet every morning at the hotel where you spent the night.'),
        icon: '/icons/facilities/restaurant.svg' },
      { title: l('3 x een 3-gangendiner', '3 x a 3-course dinner'),
        text: l('In elk hotel op de dag van aankomst: \'s avonds hoef je nergens meer heen.', 'At each hotel on the day of arrival: no need to go anywhere in the evening.'),
        icon: '/icons/facilities/restaurant.svg' },
      { title: l('Welkomstbubbels in Hotel Royal Beaulaincourt', 'Welcome bubbles at Hotel Royal Beaulaincourt'),
        text: l('Een glas bubbels bij aankomst op dag 1, om de vakantie mee te openen.', 'A glass of bubbles on arrival on day 1 to open the holiday.'),
        icon: '/icons/facilities/bar.svg' },
      { title: l('Late check-out bij alle hotels', 'Late check-out at all hotels'),
        text: l('Rustig ontbijten en op je gemak vertrekken; in Béthune zelfs tot 15:00 uur.', 'A leisurely breakfast and an unhurried departure; in Béthune even until 15:00.'),
        icon: '/icons/facilities/service.svg' },
      { title: l('Gratis parkeren bij alle hotels', 'Free parking at all hotels'),
        text: l('Bij alle drie de hotels staat je auto gratis geparkeerd, klaar voor de volgende etappe.', 'Free parking at all three hotels, ready for the next leg.'),
        icon: '/icons/facilities/parking.svg' },
    ],
    days: [
      // Redactie: elk blok 2–3 zinnen, het dagprogramma leest als één reis.
      // Hotelinfo zit achter "Meer over hotel …", achtergrond achter "Meer over …".
      { day: 1,
        arrival: { text: l(
          'Vanuit Utrecht rijd je in ruim drie uur (zo\'n 300 km) naar Béthune in Noord-Frankrijk. Inchecken kan vanaf 14:00 uur; het hotel ligt midden in de stad, dus zet de koffers neer en loop de Grand-Place op.',
          'From Utrecht it is a drive of just over three hours (about 300 km) to Béthune in northern France. Check-in is possible from 14:00; the hotel is right in the centre, so drop your bags and walk onto the Grand-Place.',
        ) },
        activities: [
          { title: l('Ontdek Béthune', 'Discover Béthune'),
            text: l('Het belfort uit 1388 staat op de UNESCO-lijst; de art-decogevels eromheen zijn van de wederopbouw na 1918. Neem een terras onder de arcades en proef een streekbier.',
              'The belfry from 1388 is on the UNESCO list; the art-deco façades around it date from the post-1918 reconstruction. Take a terrace under the arcades and try a local beer.'),
            image: img('001', 'bethune'),
            more: { label: l('Meer over Béthune', 'More about Béthune'), title: l('Béthune, stad van het belfort', 'Béthune, town of the belfry'), image: img('001', 'bethune'), paragraphs: [
              l('Béthune was in de Eerste Wereldoorlog een Brits garnizoensstadje vlak achter het front en werd in 1918 grotendeels verwoest. De wederopbouw in de jaren twintig leverde de Grand-Place op zoals je hem nu ziet: een plein vol art-decogevels rond het middeleeuwse belfort, dat als een van de weinige gebouwen overeind bleef.',
                'In the First World War Béthune was a British garrison town just behind the front and was largely destroyed in 1918. The 1920s reconstruction produced today\'s Grand-Place: a square of art-deco façades around the medieval belfry, one of the few buildings left standing.'),
              l('Het belfort (1388) hoort bij de UNESCO-reeks belforten van België en Frankrijk; van april tot september kun je de 133 treden op voor het uitzicht over de mijnstreek. Op zaterdagochtend is er markt op het plein, en de brouwerijen uit de omgeving (Brasserie Saint-Germain, Page 24) staan op elke kaart.',
                'The belfry (1388) is part of the UNESCO series of belfries of Belgium and France; from April to September you can climb its 133 steps for a view over the mining country. There is a market on the square on Saturday mornings, and the local breweries (Brasserie Saint-Germain, Page 24) feature on every menu.'),
            ] } },
        ] },
      { day: 2,
        breakfast: { text: l(
          'De eerste ochtend in Frankrijk: croissants, kaas en verse jus op de lichte binnenplaats van het hotel. Geen haast, Arras ligt op een half uur.',
          'Your first morning in France: croissants, cheese and fresh juice in the hotel\'s bright courtyard. No hurry, Arras is half an hour away.',
        ) },
        activities: [
          { title: l('Een dag naar Arras', 'A day out in Arras'),
            text: l('Op een half uur rijden liggen de twee barokke pleinen van Arras, omzoomd door 155 Vlaamse gevels. Onder de stad wachten de Wellington-tunnels uit 1917.',
              'Half an hour away are the two baroque squares of Arras, lined with 155 Flemish façades. Beneath the town wait the Wellington tunnels of 1917.'),
            image: img('001', 'arras'),
            more: { label: l('Meer over Arras', 'More about Arras'), title: l('Arras: twee pleinen en een stad onder de stad', 'Arras: two squares and a town beneath the town'), image: img('001', 'arras'), paragraphs: [
              l('De Grand\'Place en de Place des Héros vormen samen het grootste barokke ensemble van Frankrijk: 155 huizen in Vlaamse stijl op arcades, na 1918 steen voor steen herbouwd. Vanaf het belfort van het stadhuis (lift tot halverwege, dan trappen) overzie je beide pleinen.',
                'Together the Grand\'Place and Place des Héros form the largest baroque ensemble in France: 155 Flemish-style houses on arcades, rebuilt stone by stone after 1918. From the town-hall belfry (lift halfway, then stairs) you overlook both squares.'),
              l('De Carrière Wellington is een netwerk van krijtgroeven waarin Nieuw-Zeelandse tunnelgravers in 1917 plaats maakten voor 24.000 soldaten, die vandaaruit de Slag om Arras begonnen. De rondleiding duurt een uur en gaat twintig meter diep; trek een trui aan. Lunchen doe je het best onder de arcades van de Place des Héros.',
                'The Carrière Wellington is a network of chalk quarries where New Zealand tunnellers made room for 24,000 soldiers in 1917, who launched the Battle of Arras from there. The tour takes an hour and goes twenty metres down; bring a jumper. Lunch is best under the arcades of the Place des Héros.'),
            ] } },
          { title: l('Avond in Béthune', 'Evening in Béthune'),
            text: l('Het diner is vanavond vrij: kies een bistro aan de Grand-Place of laat het hotel een tafel reserveren in een van de zijstraten.',
              'Dinner is free tonight: pick a bistro on the Grand-Place or let the hotel book a table in one of the side streets.'),
            image: img('001', 'bethune') },
        ] },
      { day: 3,
        breakfast: { text: l(
          'Nog één keer genieten van het ontbijtbuffet; vroege vogels lopen eerst nog een rondje om het belfort. Daarna uitchecken en op weg naar Tilques.',
          'One more breakfast buffet; early birds first take a turn around the belfry. Then check out and head for Tilques.',
        ) },
        route: { title: l('Onderweg: per fluisterboot door het Marais audomarois', 'En route: by whisper boat through the Marais audomarois'),
          text: l('De rit naar Tilques duurt maar 50 minuten, dus maak een omweg via Saint-Omer en stap in een fluisterboot door het laatste bewoonde moeras van Frankrijk. Lunch daarna in de stad.',
            'The drive to Tilques takes only 50 minutes, so detour via Saint-Omer and board a whisper boat through France\'s last inhabited marsh. Lunch in town afterwards.'),
          image: img('001', 'marais'),
          more: { label: l('Meer over het Marais audomarois', 'More about the Marais audomarois'), title: l('Het Marais audomarois', 'The Marais audomarois'), image: img('001', 'marais'), paragraphs: [
            l('Het Marais audomarois is een moeras van 3.700 hectare met 700 kilometer aan sloten en kanalen, al sinds de middeleeuwen drooggelegd door monniken en tuinders. Het is het laatste moeras van Frankrijk waar nog gewoond en geboerd wordt: de bloemkolen van Saint-Omer komen hiervandaan en de post wordt op sommige eilandjes nog per boot bezorgd.',
              'The Marais audomarois is a 3,700-hectare marsh with 700 kilometres of ditches and canals, drained since the Middle Ages by monks and market gardeners. It is the last marsh in France that is still inhabited and farmed: Saint-Omer\'s cauliflowers come from here and on some islands the post still arrives by boat.'),
            l('Vaar mee met een elektrische fluisterboot (circa een uur, vanaf Clairmarais of de Maison du Marais) of huur een bacôve, de traditionele platte houten boot, en peddel zelf. In de stad zijn de kathedraal Notre-Dame en de bibliotheek met een Gutenbergbijbel de moeite waard.',
              'Join an electric whisper boat (about an hour, from Clairmarais or the Maison du Marais) or rent a bacôve, the traditional flat wooden boat, and paddle yourself. In town, the Notre-Dame cathedral and the library with a Gutenberg Bible are worth a visit.'),
          ] } },
        arrival: { text: l(
          'Halverwege de middag rij je de oprijlaan van Château Tilques op; inchecken kan vanaf 15:00 uur. Voor het diner is er tijd voor een duik in het verwarmde binnenbad of een rondje door het park.',
          'Mid-afternoon you drive up the avenue of Château Tilques; check-in is possible from 15:00. Before dinner there is time for a dip in the heated indoor pool or a stroll through the park.',
        ) } },
      { day: 4,
        breakfast: { text: l(
          'Ontbijt achter de grote glaswand van het restaurant, met uitzicht op het gazon. Vandaag hoef je de auto niet in.',
          'Breakfast behind the restaurant\'s big glass wall, looking out over the lawn. Today the car can stay where it is.',
        ) },
        activities: [
          { title: l('Wandelen, fietsen of golfen rond het kasteel', 'Walk, cycle or golf around the château'),
            text: l('Vanaf het kasteel lopen wandel- en fietsroutes door het bocage-landschap van de Audomarois; golfers spelen op Aa Saint-Omer, vijf minuten verderop. Niets doen mag ook: het zwembad is de hele dag open.',
              'Walking and cycling routes run from the château through the bocage of the Audomarois; golfers play Aa Saint-Omer, five minutes away. Doing nothing is allowed too: the pool is open all day.'),
            image: img('001', 'marais') },
          { title: l('Saint-Omer en La Coupole', 'Saint-Omer and La Coupole'),
            text: l('In de middag naar Saint-Omer voor de kathedraal en de stadstuin, of naar La Coupole: de betonnen koepel van waaruit de Duitsers V2-raketten wilden lanceren.',
              'In the afternoon head to Saint-Omer for the cathedral and the public garden, or to La Coupole: the concrete dome from which the Germans planned to launch V2 rockets.'),
            image: img('001', 'boulogne'),
            more: { label: l('Meer over La Coupole', 'More about La Coupole'), title: l('La Coupole', 'La Coupole'), paragraphs: [
              l('La Coupole is een bunker uit 1943-1944 met een betonnen koepel van 71 meter doorsnee en vijf meter dik, gebouwd om V2-raketten op Londen af te vuren. Door geallieerde bombardementen is er nooit één gelanceerd. Vandaag is het een geschiedenismuseum over de bezetting van Noord-Frankrijk en de wedloop naar de ruimte, met een planetarium.',
                'La Coupole is a 1943-44 bunker with a concrete dome 71 metres across and five metres thick, built to fire V2 rockets at London. Thanks to Allied bombing not a single one was ever launched. Today it is a history museum on the occupation of northern France and the space race, with a planetarium.'),
              l('Reken op twee tot drie uur; het is er binnen fris. La Coupole ligt op tien minuten van het hotel, aan de zuidkant van Saint-Omer.',
                'Allow two to three hours; it is cool inside. La Coupole is ten minutes from the hotel, on the south side of Saint-Omer.'),
            ] } },
        ] },
      { day: 5,
        breakfast: { text: l(
          'Laatste ontbijt in het kasteel; wie vroeg op is, loopt nog een rondje door het park. Dan uitchecken en op weg naar de kust.',
          'Last breakfast in the château; early risers take one more turn around the park. Then check out and head for the coast.',
        ) },
        route: { title: l('Onderweg: langs de Opaalkust', 'En route: along the Opal Coast'),
          text: l('Rij niet rechtstreeks maar via de kust: klim bij Cap Blanc-Nez over de krijtrotsen en lunch met zeezicht in Wissant. Daarna via Boulogne naar Cléry.',
            'Don\'t drive straight there: go via the coast, climb the chalk cliffs at Cap Blanc-Nez and lunch with a sea view in Wissant. Then on via Boulogne to Cléry.'),
          image: img('001', 'blancnez'),
          more: { label: l('Meer over de Opaalkust', 'More about the Opal Coast'), title: l('De Opaalkust', 'The Opal Coast'), image: img('001', 'wissant'), paragraphs: [
            l('De Côte d\'Opale loopt van de Belgische grens tot de baai van de Somme en dankt zijn naam aan het melkachtige licht boven zee. Het mooiste stuk ligt tussen Calais en Boulogne: de twee kapen Cap Blanc-Nez (krijt, 134 meter) en Cap Gris-Nez (zandsteen, het dichtst bij Engeland) met daartussen het brede strand van Wissant. Bij helder weer zie je de witte kliffen van Dover.',
              'The Côte d\'Opale runs from the Belgian border to the Bay of the Somme and owes its name to the milky light over the sea. The finest stretch lies between Calais and Boulogne: the two headlands of Cap Blanc-Nez (chalk, 134 metres) and Cap Gris-Nez (sandstone, the closest point to England) with the broad beach of Wissant in between. On a clear day you can see the white cliffs of Dover.'),
            l('De kapen zijn een Grand Site de France: parkeer bij de voet en loop het GR-pad langs de rand van de klif (stevige schoenen, het waait er altijd). Wissant is een zeilsurfdorp met een handvol visrestaurants aan het strand; Audresselles, iets zuidelijker, is het adres voor mosselen en krab.',
              'The headlands are a Grand Site de France: park at the foot and walk the GR path along the cliff edge (sturdy shoes, it is always windy). Wissant is a windsurfing village with a handful of fish restaurants on the beach; Audresselles, a little further south, is the place for mussels and crab.'),
          ] } },
        arrival: { text: l(
          'Vanaf de kust is het nog twintig minuten naar Hesdin-l\'Abbé, waar je vanaf 15:00 uur incheckt bij Château Cléry. De sauna is open tot het diner; het terras aan de hortensiatuin vraagt om een glas.',
          'From the coast it is another twenty minutes to Hesdin-l\'Abbé, where you check in at Château Cléry from 15:00. The sauna is open until dinner; the terrace by the hydrangea garden calls for a glass.',
        ) } },
      { day: 6,
        breakfast: { text: l(
          'Ontbijt in de serre met zicht op de tuin. Op het programma: een haven, een vestingstadje en het grootste aquarium van Europa.',
          'Breakfast in the conservatory overlooking the garden. On today\'s programme: a harbour, a fortified town and the largest aquarium in Europe.',
        ) },
        activities: [
          { title: l('Boulogne-sur-Mer: bovenstad en Nausicaá', 'Boulogne-sur-Mer: upper town and Nausicaá'),
            text: l('De ommuurde bovenstad van Boulogne heeft een basiliek met een enorme koepel en een wandeling over de complete stadsmuur. Aan de haven ligt Nausicaá, het grootste aquarium van Europa.',
              'The walled upper town of Boulogne has a basilica with a huge dome and a walk along the entire town wall. By the harbour lies Nausicaá, the largest aquarium in Europe.'),
            image: img('001', 'boulogne'),
            more: { label: l('Meer over Boulogne-sur-Mer', 'More about Boulogne-sur-Mer'), title: l('Boulogne-sur-Mer', 'Boulogne-sur-Mer'), image: img('001', 'boulogne'), paragraphs: [
              l('Boulogne is de grootste vissershaven van Frankrijk en tegelijk een van de oudste steden van de kust: de Romeinen vertrokken hiervandaan naar Britannië. De bovenstad ligt binnen een complete 13e-eeuwse stadsmuur van anderhalve kilometer; binnen de muren vind je de basiliek Notre-Dame met haar 101 meter hoge koepel, het kasteel-museum en de rustige straatjes rond het stadhuis.',
                'Boulogne is France\'s largest fishing port and one of the oldest towns on the coast: the Romans set off for Britain from here. The upper town sits inside a complete 13th-century wall of a kilometre and a half; within it are the Notre-Dame basilica with its 101-metre dome, the castle museum and the quiet streets around the town hall.'),
              l('Nausicaá aan de haven toont 58.000 dieren in een bak van 10.000 m³ met een kijkvenster van twintig meter; reken op een halve dag en reserveer online. Vis eet je in de benedenstad aan de Quai Gambetta, waar de boten \'s ochtends aanleggen.',
                'Nausicaá by the harbour shows 58,000 animals in a 10,000 m³ tank with a twenty-metre viewing window; allow half a day and book online. Eat fish in the lower town on the Quai Gambetta, where the boats come in in the morning.'),
            ] } },
          { title: l('Montreuil-sur-Mer, het stadje van Victor Hugo', 'Montreuil-sur-Mer, Victor Hugo\'s little town'),
            text: l('Een half uur zuidwaarts ligt Montreuil-sur-Mer, waar Victor Hugo Les Misérables liet beginnen. Wandel de drie kilometer vestingwallen en eindig in een van de restaurants; het stadje staat bekend om zijn keuken.',
              'Half an hour south lies Montreuil-sur-Mer, where Victor Hugo set the opening of Les Misérables. Walk the three kilometres of ramparts and finish in one of the restaurants; the town is known for its food.'),
            image: img('001', 'montreuil') },
        ] },
      { day: 7,
        breakfast: { text: l(
          'Late check-out, dus rustig ontbijten in de serre en nog een laatste wandeling over het landgoed voordat de koffers in de auto gaan.',
          'Late check-out, so a leisurely breakfast in the conservatory and one last walk around the estate before the bags go in the car.',
        ) },
        homeward: { title: l('Terug naar huis via de kust', 'Home via the coast'),
          text: l('De terugreis naar Utrecht duurt circa drieënhalf uur. Wie nog niet genoeg zee heeft gezien, rijdt via Calais en de Belgische kust.',
            'The drive back to Utrecht takes about three and a half hours. If you have not had enough sea yet, go via Calais and the Belgian coast.'),
          image: img('001', 'wissant') } },
    ],
    mapHighlights: [
      { name: l('Belfort van Béthune', 'Belfry of Béthune'), lat: 50.5305, lng: 2.641, text: l('UNESCO-belfort uit 1388 op de Grand-Place, omringd door art-decogevels uit de wederopbouw.', 'UNESCO belfry from 1388 on the Grand-Place, surrounded by art-deco façades from the reconstruction.'), image: img('001', 'bethune') },
      { name: l('Arras', 'Arras'), lat: 50.291, lng: 2.7775, text: l('Twee barokke Vlaamse pleinen en de Wellington-tunnels onder de stad.', 'Two baroque Flemish squares and the Wellington tunnels beneath the city.'), image: img('001', 'arras') },
      { name: l('Marais audomarois', 'Marais audomarois'), lat: 50.75, lng: 2.252, text: l('Het laatste bewoonde moeras van Frankrijk, per fluisterboot langs groentetuinen en bruggetjes.', "France's last inhabited marsh, by whisper boat past vegetable gardens and little bridges."), image: img('001', 'marais') },
      { name: l('La Coupole', 'La Coupole'), lat: 50.705, lng: 2.242, text: l('Betonnen koepel voor V2-raketten, nu een indrukwekkend geschiedenismuseum.', 'Concrete dome built for V2 rockets, now an impressive history museum.'), image: img('001', 'boulogne') },
      { name: l('Cap Blanc-Nez', 'Cap Blanc-Nez'), lat: 50.924, lng: 1.712, text: l('Krijtrotsen met bij helder weer zicht op Engeland.', 'Chalk cliffs with views of England on a clear day.'), image: img('001', 'blancnez') },
      { name: l('Wissant', 'Wissant'), lat: 50.886, lng: 1.662, text: l('Breed strand tussen de twee kapen, ideaal voor lunch met zeezicht.', 'Wide beach between the two capes, ideal for lunch by the sea.'), image: img('001', 'wissant') },
      { name: l('Boulogne-sur-Mer', 'Boulogne-sur-Mer'), lat: 50.726, lng: 1.613, text: l('Ommuurde bovenstad met basiliek en kasteel; aan de haven Nausicaá, het grootste aquarium van Europa.', "Walled upper town with basilica and castle; Nausicaá, Europe's largest aquarium, by the harbour."), image: img('001', 'boulogne') },
      { name: l('Montreuil-sur-Mer', 'Montreuil-sur-Mer'), lat: 50.464, lng: 1.763, text: l('Vestingstadje van Victor Hugo, drie kilometer wallen en goede restaurants.', "Victor Hugo's fortified town, three kilometres of ramparts and good restaurants."), image: img('001', 'montreuil') },
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
      { name: l('Kasteel Rechteren', 'Rechteren Castle'), lat: 52.503, lng: 6.301, text: l('Kasteel aan de Vecht, op fiets- of kanoafstand van het hotel.', 'Castle on the Vecht, within cycling or canoeing distance of the hotel.'), image: img('002', 'vecht') },
      { name: l('Sassenpoort Zwolle', 'Sassenpoort Zwolle'), lat: 52.51, lng: 6.095, text: l('Middeleeuwse stadspoort, startpunt voor de binnenstad en de Grote Markt.', 'Medieval town gate, starting point for the old town and the Grote Markt.'), image: img('002', 'zwolle') },
      { name: l('Museum de Fundatie', 'Museum de Fundatie'), lat: 52.511, lng: 6.093, text: l('Kunst van Mondriaan tot Marlene Dumas onder de blauw-witte wolk.', 'Art from Mondrian to Marlene Dumas beneath the blue-and-white cloud.'), image: img('002', 'fundatie') },
      { name: l('Holterberg', 'Holterberg'), lat: 52.305, lng: 6.425, text: l('Uitkijktoren en bezoekerscentrum van de Sallandse Heuvelrug.', 'Lookout tower and visitor centre of the Sallandse Heuvelrug.'), image: img('002', 'vecht') },
      { name: l('Deventer', 'Deventer'), lat: 52.252, lng: 6.16, text: l('De Brink, het Bergkwartier en de Lebuïnustoren; voetveer over de IJssel.', 'The Brink, the Bergkwartier and the Lebuïnus tower; foot ferry across the IJssel.'), image: img('002', 'deventer') },
      { name: l('Bronkhorst', 'Bronkhorst'), lat: 52.079, lng: 6.199, text: l('De kleinste stad van Nederland: rieten boerderijen en het Dickens Museum.', 'The smallest town in the Netherlands: thatched farmhouses and the Dickens Museum.'), image: img('002', 'bronkhorst') },
      { name: l('Walburgiskerk Zutphen', 'Walburgis church Zutphen'), lat: 52.138, lng: 6.201, text: l('Met de Librije, een van de weinige middeleeuwse kettingbibliotheken ter wereld.', 'With the Librije, one of the few surviving medieval chained libraries.'), image: img('002', 'zutphen') },
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
      { name: l('Kasteel Rosendael', 'Rosendael Castle'), lat: 52.011, lng: 5.97, text: l('Kasteel in een landschapspark met vijvers en de beroemde bedriegertjes.', 'Castle in a landscape park with ponds and the famous trick fountains.'), image: img('003', 'rosendael') },
      { name: l('Kröller-Müller Museum', 'Kröller-Müller Museum'), lat: 52.095, lng: 5.817, text: l('Van Goghs en een grote beeldentuin midden in De Hoge Veluwe.', 'Van Goghs and a large sculpture garden in the middle of De Hoge Veluwe.'), image: img('003', 'kroller') },
      { name: l('Landgoed Middachten', 'Middachten Estate'), lat: 52.011, lng: 6.085, text: l('Imposant kasteel met historische tuinen in De Steeg.', 'Imposing castle with historic gardens in De Steeg.'), image: img('003', 'middachten') },
      { name: l('Zutphen', 'Zutphen'), lat: 52.14, lng: 6.2, text: l('Hanzestad met Walburgiskerk, hofjes en de IJsselkade.', 'Hanseatic town with the Walburgis church, courtyards and the IJssel quay.'), image: img('002', 'zutphen') },
      { name: l('Kasteel Ruurlo', 'Ruurlo Castle'), lat: 52.092, lng: 6.447, text: l('Museum MORE met de collectie van Carel Willink en de grootste doolhof van Europa.', "Museum MORE with the Carel Willink collection and Europe's largest maze."), image: img('003', 'ruurlo') },
      { name: l('Landgoed Singraven', 'Singraven Estate'), lat: 52.364, lng: 6.999, text: l('Havezate, watermolen en beukenlanen bij Denekamp.', 'Manor, watermill and beech avenues near Denekamp.'), image: img('003', 'singraven') },
      { name: l('Ootmarsum', 'Ootmarsum'), lat: 52.408, lng: 6.901, text: l('Kunststadje met galeries, ateliers en vakwerkhuizen.', 'Art town with galleries, studios and timber-framed houses.'), image: img('003', 'ootmarsum') },
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
        facilities: ['Restaurant Maes (Michelin-gids)', 'Oysana spa met binnenbad', 'Sauna\'s en behandelingen', 'Fitness', 'Kasteeltuin', 'Gratis parkeren', 'Gratis wifi', 'Bar en lounge'],
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
      { name: l('Markt van Sittard', 'Sittard Markt'), lat: 50.998, lng: 5.869, text: l('Historisch centrum met het Kloosterkwartier, stadswallen en terrassen.', 'Historic centre with the Kloosterkwartier, ramparts and terraces.'), image: img('004', 'sittard') },
      { name: l('Maasmechelen Village', 'Maasmechelen Village'), lat: 50.966, lng: 5.689, text: l('Outletdorp met ruim honderd merken; de VIP-pas is inbegrepen.', 'Outlet village with over a hundred brands; the VIP pass is included.'), image: img('004', 'heuvelland') },
      { name: l('Kasteel Hoensbroek', 'Hoensbroek Castle'), lat: 50.921, lng: 5.915, text: l('Een van de grootste kastelen van Nederland, veertig zalen en torens.', 'One of the largest castles in the Netherlands, forty rooms and towers.'), image: img('004', 'hoensbroek') },
      { name: l('Geuldal', 'Geul valley'), lat: 50.772, lng: 5.908, text: l('Vakwerkhuizen, wijngaarden en glooiende heuvels rond Epen en Mechelen.', 'Half-timbered houses, vineyards and rolling hills around Epen and Mechelen.'), image: img('004', 'heuvelland') },
      { name: l('Valkenburg', 'Valkenburg'), lat: 50.865, lng: 5.832, text: l('Kasteelruïne en mergelgrotten in het hart van het Heuvelland.', 'Castle ruin and marl caves in the heart of the hill country.'), image: img('004', 'valkenburg') },
      { name: l('Drielandenpunt', 'Three-country point'), lat: 50.754, lng: 6.021, text: l('Het hoogste punt van Nederland, met uitzicht over drie landen.', 'The highest point in the Netherlands, with views over three countries.'), image: img('004', 'valkenburg') },
      { name: l('Vrijthof Maastricht', 'Vrijthof Maastricht'), lat: 50.849, lng: 5.688, text: l('Sint-Servaasbasiliek, de boekhandel in de Dominicanenkerk en het Wyck-kwartier.', 'Sint Servaas basilica, the bookshop in the Dominican church and the Wyck quarter.'), image: img('004', 'maastricht') },
      { name: l('Thorn', 'Thorn'), lat: 51.162, lng: 5.842, text: l('Het witte stadje aan de Maas, mooi voor een laatste stop op de terugweg.', 'The white town on the Maas, a nice final stop on the way home.'), image: img('004', 'thorn') },
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
      { name: l('Markt van Sittard', 'Sittard Markt'), lat: 50.998, lng: 5.869, text: l('Historisch centrum met het Kloosterkwartier, stadswallen en terrassen.', 'Historic centre with the Kloosterkwartier, ramparts and terraces.'), image: img('004', 'sittard') },
      { name: l('Maasmechelen Village', 'Maasmechelen Village'), lat: 50.966, lng: 5.689, text: l('Outletdorp met ruim honderd merken; de VIP-pas is inbegrepen.', 'Outlet village with over a hundred brands; the VIP pass is included.'), image: img('004', 'heuvelland') },
      { name: l('Kasteel Hoensbroek', 'Hoensbroek Castle'), lat: 50.921, lng: 5.915, text: l('Een van de grootste kastelen van Nederland, veertig zalen en torens.', 'One of the largest castles in the Netherlands, forty rooms and towers.'), image: img('004', 'hoensbroek') },
      { name: l('Geuldal', 'Geul valley'), lat: 50.772, lng: 5.908, text: l('Vakwerkhuizen, wijngaarden en glooiende heuvels rond Epen en Mechelen.', 'Half-timbered houses, vineyards and rolling hills around Epen and Mechelen.'), image: img('004', 'heuvelland') },
      { name: l('Valkenburg', 'Valkenburg'), lat: 50.865, lng: 5.832, text: l('Kasteelruïne en mergelgrotten in het hart van het Heuvelland.', 'Castle ruin and marl caves in the heart of the hill country.'), image: img('004', 'valkenburg') },
      { name: l('Vrijthof Maastricht', 'Vrijthof Maastricht'), lat: 50.849, lng: 5.688, text: l('Stokstraatkwartier, Sint Servaasbrug naar Wyck en het Bonnefantenmuseum.', 'Stokstraat quarter, the Sint Servaas bridge to Wyck and the Bonnefanten museum.'), image: img('004', 'maastricht') },
      { name: l('Sint-Pietersberg', 'Sint-Pietersberg'), lat: 50.833, lng: 5.686, text: l('Fort Sint Pieter, mergelgrotten en uitzicht over de stad.', 'Fort Sint Pieter, marl caves and a view over the city.'), image: img('004', 'servaasbrug') },
      { name: l('Thorn', 'Thorn'), lat: 51.162, lng: 5.842, text: l('Het witte stadje aan de Maas, mooi voor een laatste stop op de terugweg.', 'The white town on the Maas, a nice final stop on the way home.'), image: img('004', 'thorn') },
    ],
  },

  // ── 006 Nederlandse kustroute ─────────────────────────────────────────
  'trip-kustroute': {
    description: [
      l('Ontdek in zes dagen drie heel verschillende kanten van de Nederlandse kust: de brede stranden en duinen van Zeeland, het levendige Scheveningen en Haarlem met de stranden van Zandvoort en Bloemendaal binnen handbereik. Deze exclusieve route is alleen bij ViaLuxury te boeken.',
        'Discover three very different sides of the Dutch coast in six days: the wide beaches and dunes of Zeeland, lively Scheveningen and Haarlem with the beaches of Zandvoort and Bloemendaal within reach. This exclusive route is only available through ViaLuxury.'),
      l('Je begint met twee nachten bij Grand Hotel Ter Duin in Burgh-Haamstede, verblijft één nacht direct aan zee bij Inntel Hotels Den Haag Marina Beach en slaapt de laatste twee nachten bij Carlton Square in Haarlem. Bij alle drie de hotels staat een 3-gangendiner voor je klaar.',
        'You start with two nights at Grand Hotel Ter Duin in Burgh-Haamstede, spend one night right by the sea at Inntel Hotels Den Haag Marina Beach and the last two nights at Carlton Square in Haarlem. A 3-course dinner awaits at all three hotels.'),
      l('Het fijne aan deze route: je bent niet afhankelijk van het weer. Schijnt de zon, dan heb je lange stranddagen en duinwandelingen. Is het frisser, dan ontspan je in de wellness of kies je voor kunst, cultuur en de vele musea onderweg.',
        'The beauty of this route: you do not depend on the weather. If the sun shines, you have long beach days and dune walks. If it is cooler, you relax in the wellness or choose art, culture and the many museums along the way.'),
    ],
    highlights: [
      l('5 nachten in 3 luxe 4-sterrenhotels aan de kust', '5 nights in 3 luxury 4-star hotels on the coast'),
      l('3 x 3-gangendiner inbegrepen', '3 x 3-course dinner included'),
      l('Zeeland, Scheveningen, Den Haag, Zandvoort, Bloemendaal en Haarlem', 'Zeeland, Scheveningen, The Hague, Zandvoort, Bloemendaal and Haarlem'),
      l('Zwembad, wellness en fitness bij twee hotels', 'Pool, wellness and fitness at two hotels'),
      l('Korte, ontspannen etappes', 'Short, relaxed legs'),
      l('Exclusieve ViaLuxury-route', 'Exclusive ViaLuxury route'),
    ],
    hotels: {
      'Grand Hotel Ter Duin': {
        description: l('Viersterrenhotel in de duinen van Burgh-Haamstede, op de kop van Schouwen-Duiveland. De 95 kamers en suites liggen rond een binnentuin; er is een binnenzwembad met sauna en fitness, een restaurant met terras en dagelijks een tasting-uurtje in de bar. Het strand en de bossen van Westerschouwen liggen op fietsafstand.',
          'Four-star hotel in the dunes of Burgh-Haamstede, at the tip of Schouwen-Duiveland. The 95 rooms and suites surround an inner garden; there is an indoor pool with sauna and gym, a restaurant with terrace and a daily tasting hour in the bar. The beach and the Westerschouwen woods are a short cycle away.'),
        facilities: ['Restaurant met terras', 'Bar met dagelijks tasting-uurtje', 'Binnenzwembad', 'Wellness en fitness', 'Fietsverhuur', 'Parkeren (betaald)', 'Gratis wifi', 'Lift'],
        room: { name: l('Comfortkamer', 'Comfortkamer'), description: l('Frisse kamer in duinkleuren met een comfortabel bed, zitje en badkamer met douche. Een badjas ligt klaar voor het zwembad en de wellness.', 'Fresh room in dune colours with a comfortable bed, seating area and bathroom with shower. A bathrobe is ready for the pool and wellness.') },
      },
      'Inntel Hotels Den Haag Marina Beach': {
        description: l('Splinternieuw viersterrenhotel direct aan het strand van Scheveningen, aan de jachthaven. De kamers hebben zeezicht of een whirlpool; op het dak liggen een binnen- en buitenzwembad, spa en fitness met uitzicht over de Noordzee. De Pier en de boulevard liggen op loopafstand.',
          'Brand-new four-star hotel right on Scheveningen beach, by the marina. Rooms have sea views or a whirlpool; on the roof are an indoor and outdoor pool, spa and gym overlooking the North Sea. The Pier and boulevard are a short walk away.'),
        facilities: ['Restaurant met zeezicht', 'Binnen- en buitenzwembad', 'Spa en sauna', 'Fitness', 'Direct aan het strand', 'Parkeergarage (gereduceerd tarief)', 'Gratis wifi', 'Lift'],
        room: { name: l('Kamer met whirlpool of zeezicht', 'Kamer met whirlpool of zeezicht'), description: l('Splinternieuwe kamer met een whirlpool voor twee of een balkon met uitzicht over de Noordzee en de jachthaven. Strak design, kingsize bed en een regendouche.', 'Brand-new room with a whirlpool for two or a balcony overlooking the North Sea and the marina. Sleek design, king-size bed and a rain shower.') },
      },
      'Carlton Square': {
        description: l('Viersterrenhotel aan het Baan-plein in het centrum van Haarlem, op vijf minuten lopen van de Grote Markt. De 106 kamers zijn ruim en modern; restaurant Baan 7 serveert een verrassingsmenu van de chef. Zandvoort en Bloemendaal aan Zee liggen op een kwartier.',
          'Four-star hotel on the Baan square in the centre of Haarlem, five minutes\' walk from the Grote Markt. The 106 rooms are spacious and modern; restaurant Baan 7 serves the chef\'s surprise menu. Zandvoort and Bloemendaal aan Zee are fifteen minutes away.'),
        facilities: ['Restaurant Baan 7', 'Bar', 'Fitness', 'Gratis wifi', 'Lift', 'Parkeergarage nabij (betaald)', 'Fietsverhuur'],
        room: { name: l('Comfortkamer', 'Comfortkamer'), description: l('Ruime, moderne kamer met een kingsize bed, bureau en een badkamer met douche. Rustig gelegen aan het plein, op loopafstand van de Grote Markt.', 'Spacious, modern room with a king-size bed, desk and a bathroom with shower. Quietly located on the square, within walking distance of the Grote Markt.') },
      },
    },
    days: [
      { day: 1, activities: [
        { title: l('Eerste strandwandeling of de wellness', 'First beach walk or the wellness'), text: l('Trek als het weer uitnodigt meteen richting zee: het strand en de duinen van Westerschouwen liggen om de hoek. Blijf je liever binnen? Dan wachten het zwembad en de sauna, en om vijf uur het tasting-uurtje in de bar.', 'If the weather invites you, head straight for the sea: the beach and dunes of Westerschouwen are around the corner. Rather stay in? Then the pool and sauna await, and at five the tasting hour in the bar.'), image: img('006', 'westerschouwen') },
      ] },
      { day: 2, activities: [
        { title: l('Strand, duinen en Westerschouwen', 'Beach, dunes and Westerschouwen'), text: l('Een volle dag voor de Zeeuwse kust: zoek een plekje aan zee, maak een lange strandwandeling of trek de duinen en bossen van Westerschouwen in. Het natuurgebied rondom Burgh-Haamstede leent zich perfect voor wandelen en fietsen.', 'A full day for the Zeeland coast: find a spot by the sea, take a long beach walk or head into the dunes and woods of Westerschouwen. The nature area around Burgh-Haamstede is perfect for walking and cycling.'), image: img('006', 'westerschouwen') },
        { title: l('Bij minder weer: Zierikzee of een wellnessdag', 'In poorer weather: Zierikzee or a spa day'), text: l('Is het guur, dan is dit de dag voor de wellness van Ter Duin, of stap in de auto naar het monumentale Zierikzee met zijn havenpoorten en de Dikke Toren. Het diner is vanavond vrij.', 'If it is blustery, this is the day for Ter Duin\'s wellness, or drive to monumental Zierikzee with its harbour gates and the Dikke Toren. Dinner is free tonight.'), image: img('006', 'zierikzee') },
      ] },
      { day: 3, route: { title: l('Via de Deltawerken naar Scheveningen', 'Via the Delta Works to Scheveningen'), text: l('Een prachtige etappe langs de kust (circa 1 uur 20). Rij over de Oosterscheldekering en stop bij het Watersnoodmuseum of Neeltje Jans, en steek via de Brouwersdam en Goeree-Overflakkee over naar Zuid-Holland.', 'A beautiful leg along the coast (about 1 hour 20). Drive across the Oosterschelde storm surge barrier, stop at the Flood Museum or Neeltje Jans, and cross via the Brouwersdam and Goeree-Overflakkee into South Holland.'), image: img('006', 'delta') }, activities: [
        { title: l('De Pier en de boulevard', 'The Pier and the boulevard'), text: l('Na het inchecken wandel je over de boulevard naar de Pier met het reuzenrad, of neem je een duik in het dakzwembad met uitzicht op zee.', 'After check-in, stroll along the boulevard to the Pier with its Ferris wheel, or take a dip in the rooftop pool overlooking the sea.'), image: img('006', 'scheveningen') },
      ] },
      { day: 4, route: { title: l('Langs Katwijk, Noordwijk en Zandvoort naar Haarlem', 'Via Katwijk, Noordwijk and Zandvoort to Haarlem'), text: l('Neem de kustweg (circa 1 uur): de boulevards van Katwijk en Noordwijk, de bollenvelden in het voorjaar en het strand van Zandvoort. Of maak eerst een ochtend Den Haag met het Mauritshuis en het Binnenhof.', 'Take the coast road (about 1 hour): the boulevards of Katwijk and Noordwijk, the bulb fields in spring and Zandvoort beach. Or spend the morning in The Hague with the Mauritshuis and the Binnenhof.'), image: img('006', 'noordwijk') } },
      { day: 5, activities: [
        { title: l('Een dag Haarlem', 'A day in Haarlem'), text: l('Haarlem in één dag: de Grote Markt met de Sint-Bavokerk, het Frans Hals Museum, Teylers Museum en de hofjes. Winkelen in de Gouden Straatjes en een terras aan het Spaarne.', 'Haarlem in a day: the Grote Markt with the Sint Bavo church, the Frans Hals Museum, Teylers Museum and the courtyards. Shopping in the Gouden Straatjes and a terrace on the Spaarne.'), image: img('006', 'haarlem') },
        { title: l('Of nog één keer naar zee', 'Or one more time to the sea'), text: l('Kies je toch voor strand en duinen? Bloemendaal aan Zee en Zandvoort liggen op een kwartier, met de Kennemerduinen ertussen voor een wandeling. Het diner is vanavond vrij.', 'Prefer beach and dunes after all? Bloemendaal aan Zee and Zandvoort are fifteen minutes away, with the Kennemer dunes in between for a walk. Dinner is free tonight.'), image: img('006', 'zandvoort') },
      ] },
      { day: 6, homeward: { title: l('Uitgebreid ontbijt en ontspannen terugreis', 'Leisurely breakfast and relaxed journey home'), text: l('Ontbijt rustig en rij in een uur terug naar Utrecht. Of maak er nog een halve dag Haarlem van.', 'Breakfast at leisure and drive back to Utrecht in an hour. Or make it another half day in Haarlem.'), image: img('006', 'haarlem') } },
    ],
    mapHighlights: [
      { name: l('Duinen van Westerschouwen', 'Westerschouwen dunes'), lat: 51.69, lng: 3.715, text: l('Strand, duinen en bossen op de kop van Schouwen-Duiveland.', 'Beach, dunes and woods at the tip of Schouwen-Duiveland.'), image: img('006', 'westerschouwen') },
      { name: l('Zierikzee', 'Zierikzee'), lat: 51.65, lng: 3.917, text: l('Monumentaal havenstadje met stadspoorten en de Dikke Toren.', 'Monumental harbour town with town gates and the Dikke Toren.'), image: img('006', 'zierikzee') },
      { name: l('Oosterscheldekering', 'Oosterschelde barrier'), lat: 51.635, lng: 3.711, text: l('Deltawerken met Neeltje Jans en het Watersnoodmuseum vlakbij.', 'Delta Works with Neeltje Jans and the Flood Museum nearby.'), image: img('006', 'delta') },
      { name: l('Scheveningen Pier', 'Scheveningen Pier'), lat: 52.109, lng: 4.279, text: l('De boulevard, de Pier met het reuzenrad en het strand voor het hotel.', 'The boulevard, the Pier with its Ferris wheel and the beach in front of the hotel.'), image: img('006', 'scheveningen') },
      { name: l('Noordwijk', 'Noordwijk'), lat: 52.242, lng: 4.429, text: l('Boulevard en strand onderweg naar Haarlem, met de bollenvelden in het voorjaar.', 'Boulevard and beach on the way to Haarlem, with the bulb fields in spring.'), image: img('006', 'noordwijk') },
      { name: l('Zandvoort', 'Zandvoort'), lat: 52.374, lng: 4.53, text: l('Strand op een kwartier van Haarlem, met de Kennemerduinen ernaast.', 'Beach fifteen minutes from Haarlem, with the Kennemer dunes next door.'), image: img('006', 'zandvoort') },
      { name: l('Grote Markt Haarlem', 'Haarlem Grote Markt'), lat: 52.381, lng: 4.636, text: l('Sint-Bavokerk, Frans Hals Museum, Teylers Museum en de Gouden Straatjes.', 'Sint Bavo church, Frans Hals Museum, Teylers Museum and the Gouden Straatjes.'), image: img('006', 'haarlem') },
    ],
  },

  // ── Fietsvakantie Twente & Salland ────────────────────────────────────
  'trip-fietsvakantie-twente-salland': {
    description: [
      l('Een ontspannen 7-daagse fietsvakantie waarin comfort, natuur en gastvrijheid centraal staan. Je ontdekt het afwisselende landschap van Salland en Twente met groene landerijen, schilderachtige dorpen en rustige fietspaden, en verblijft telkens twee nachten in een ander sfeervol hotel terwijl je bagage vooruit reist.',
        'A relaxed 7-day cycling holiday centred on comfort, nature and hospitality. You discover the varied landscape of Salland and Twente with green farmland, picturesque villages and quiet cycle paths, staying two nights at each charming hotel while your luggage travels ahead.'),
      l('Je start bij Hotel Wapen van Delden tegenover de kerk van Delden, fietst via het Twentekanaal en de Sallandse Heuvelrug naar Hotel de Zwaan in Raalte en eindigt op Landhuishotel Herikerberg in de bossen bij Markelo. De etappes zijn 35 tot 45 kilometer; op de tussendagen fiets je rondjes vanuit het hotel.',
        'You start at Hotel Wapen van Delden opposite Delden\'s church, cycle via the Twente canal and the Sallandse Heuvelrug to Hotel de Zwaan in Raalte and finish at Landhuishotel Herikerberg in the woods near Markelo. The legs are 35 to 45 kilometres; on the days in between you ride loops from the hotel.'),
      l('Aan het einde van iedere fietsdag staat een 3-gangendiner voor je klaar en de volgende ochtend begin je met een uitgebreid ontbijt. De routes staan op je telefoon, het welkomstfietstasje bevat water, een regenponcho en een bandenplaksetje, en je auto parkeer je de hele vakantie gratis in Delden.',
        'At the end of every cycling day a 3-course dinner awaits, and the next morning starts with an extensive breakfast. Routes are on your phone, the welcome cycling bag holds water, a rain poncho and a repair kit, and your car parks free in Delden for the whole holiday.'),
    ],
    highlights: [
      l('6 nachten / 3 hotels in Twente en Salland', '6 nights / 3 hotels in Twente and Salland'),
      l('Dagelijks 3-gangendiner en uitgebreid ontbijt', 'Daily 3-course dinner and extensive breakfast'),
      l('Dagelijkse bagagetransfer tussen de hotels', 'Daily luggage transfer between the hotels'),
      l('Fietsroutes op je telefoon (35–45 km per etappe)', 'Cycling routes on your phone (35–45 km per leg)'),
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
        { title: l('Landgoed Twickel en de eerste kilometers', 'Twickel estate and the first kilometres'), text: l('Zet de auto weg, haal je welkomstfietstasje op en maak een eerste rondje van 20 kilometer over Landgoed Twickel: langs het kasteel, de watermolen en de oude eiken van een van de mooiste landgoederen van Nederland.', 'Park the car, collect your welcome cycling bag and take a first 20-kilometre loop across the Twickel estate: past the castle, the watermill and the ancient oaks of one of the finest estates in the Netherlands.'), image: FIETS.bike },
      ] },
      { day: 2, activities: [
        { title: l('Rondje Delden – Hengelo – Borne', 'Loop Delden – Hengelo – Borne'), text: l('Een rondje van 40 kilometer door het coulisselandschap: langs het Twentekanaal naar Hengelo, door het oude dorp van Borne en terug via de essen en houtwallen rond Azelo. Onderweg volop theetuinen.', 'A 40-kilometre loop through the hedgerow landscape: along the Twente canal to Hengelo, through the old village of Borne and back via the fields and wooded banks around Azelo. Plenty of tea gardens along the way.'), image: FIETS.cows },
        { title: l('Middag in Delden', 'Afternoon in Delden'), text: l('Terug in Delden is er tijd voor het Zoutmuseum, een terras op de Langestraat of een wandeling door de tuinen van Twickel.', 'Back in Delden there is time for the Salt Museum, a terrace on the Langestraat or a walk through the Twickel gardens.'), image: FIETS.sunrise },
      ] },
      { day: 3, route: { title: l('Etappe Delden – Raalte (45 km)', 'Leg Delden – Raalte (45 km)'), text: l('Je bagage gaat vooruit; jij fietst via Goor en Markelo over de Sallandse Heuvelrug. Stop bij de uitkijktoren op de Holterberg en lunch in Holten voordat je door de weilanden van Salland naar Raalte afdaalt.', 'Your luggage goes ahead; you cycle via Goor and Markelo across the Sallandse Heuvelrug. Stop at the lookout tower on the Holterberg and have lunch in Holten before descending through the Salland meadows to Raalte.'), image: FIETS.cyclists } },
      { day: 4, activities: [
        { title: l('Rondje Salland: Deventer en de IJssel (40 km)', 'Salland loop: Deventer and the IJssel (40 km)'), text: l('Fiets door het Sallandse land naar Hanzestad Deventer, wandel over de Brink en door het Bergkwartier en neem het voetveer over de IJssel. Terug via de dijk en het landgoed De Haere.', 'Cycle through the Salland countryside to the Hanseatic town of Deventer, stroll across the Brink and through the Bergkwartier and take the foot ferry across the IJssel. Return via the dyke and the De Haere estate.'), image: FIETS.deventer },
        { title: l('Wijnproeverij bij De Zwaan', 'Wine tasting at De Zwaan'), text: l('Terug in Raalte kun je in de wijnkelder van het hotel een proeverij boeken voordat het diner begint.', 'Back in Raalte you can book a tasting in the hotel\'s wine cellar before dinner.'), image: FIETS.map },
      ] },
      { day: 5, route: { title: l('Etappe Raalte – Markelo (35 km)', 'Leg Raalte – Markelo (35 km)'), text: l('Door het beekdal van de Regge naar Nijverdal, over de heide van de Sallandse Heuvelrug en langs Rijssen naar de Herikerberg. De laatste kilometers klimmen zachtjes door het bos naar het hotel.', 'Through the Regge valley to Nijverdal, across the heath of the Sallandse Heuvelrug and past Rijssen to the Herikerberg. The last kilometres climb gently through the woods to the hotel.'), image: FIETS.sunrise } },
      { day: 6, activities: [
        { title: l('Rondje Markelo – Diepenheim – Goor (35 km)', 'Loop Markelo – Diepenheim – Goor (35 km)'), text: l('Langs vier kastelen rond Diepenheim (Nijenhuis, Weldam, Warmelo en Huis Diepenheim), door het stedeke Goor en terug over de Herikerberg. Een van de mooiste kastelenroutes van Twente.', 'Past four castles around Diepenheim (Nijenhuis, Weldam, Warmelo and Huis Diepenheim), through the little town of Goor and back over the Herikerberg. One of the finest castle routes in Twente.'), image: FIETS.cyclists },
        { title: l('Laatste avond op de Herikerberg', 'Last evening on the Herikerberg'), text: l('Wandel voor het diner nog even de heuvel op voor het uitzicht over het coulisselandschap en zak dan neer bij de open haard.', 'Before dinner, walk up the hill for the view over the landscape, then settle by the open fire.'), image: FIETS.cows },
      ] },
      { day: 7, homeward: { title: l('Terug naar Delden en naar huis', 'Back to Delden and home'), text: l('Na het ontbijt fiets je de laatste 20 kilometer terug naar Delden, waar je auto staat. Of laat je met de bagage meerijden. Utrecht ligt op anderhalf uur.', 'After breakfast you cycle the last 20 kilometres back to Delden, where your car is waiting. Or ride along with the luggage. Utrecht is an hour and a half away.'), image: FIETS.bike } },
    ],
    mapHighlights: [
      { name: l('Landgoed Twickel', 'Twickel Estate'), lat: 52.276, lng: 6.718, text: l('Kasteel, watermolen en oude eiken op een van de mooiste landgoederen van Nederland.', 'Castle, watermill and ancient oaks on one of the finest estates in the Netherlands.'), image: FIETS.bike },
      { name: l('Zoutmuseum Delden', 'Salt Museum Delden'), lat: 52.263, lng: 6.709, text: l('Klein museum over de zoutwinning in Twente, midden in Delden.', 'Small museum on salt mining in Twente, in the centre of Delden.'), image: FIETS.sunrise },
      { name: l('Holterberg', 'Holterberg'), lat: 52.305, lng: 6.425, text: l('Uitkijktoren op de Sallandse Heuvelrug, halverwege de etappe naar Raalte.', 'Lookout tower on the Sallandse Heuvelrug, halfway along the leg to Raalte.'), image: FIETS.cyclists },
      { name: l('Deventer', 'Deventer'), lat: 52.252, lng: 6.16, text: l('Hanzestad met de Brink, het Bergkwartier en het voetveer over de IJssel.', 'Hanseatic town with the Brink, the Bergkwartier and the foot ferry across the IJssel.'), image: FIETS.deventer },
      { name: l('Kastelen rond Diepenheim', 'Castles around Diepenheim'), lat: 52.199, lng: 6.534, text: l('Nijenhuis, Weldam, Warmelo en Huis Diepenheim op één fietsrondje.', 'Nijenhuis, Weldam, Warmelo and Huis Diepenheim on a single cycling loop.'), image: FIETS.cows },
      { name: l('Goor', 'Goor'), lat: 52.232, lng: 6.585, text: l('Het stedeke Goor, onderweg op de kastelenroute.', 'The little town of Goor, on the castle route.'), image: FIETS.map },
    ],
  },
}
