/**
 * Multi Hotel Trip - Jesse — ViaLuxury Originals.
 *
 * De zes collecties uit VIALUXURY-ORIGINALS-COLLECTIEKLEUREN_1.md, en de
 * indeling van de arrangementen daarover. Elk Original krijgt één collectie;
 * die bepaalt de kleur en het icoon van de band op de kaart.
 */
import type { SearchHotel, SearchHotelDeal } from '~/types/searchHotel'

export type CollectionId = 'culinary' | 'retreat' | 'heritage' | 'seasonal' | 'routes' | 'events'

export interface Collection {
  id: CollectionId
  label: string
  /** Het gevoel uit de kleurnota, als bijschrift op de pagina. */
  gevoel: string
}

/** De zes collecties. */
export const COLLECTIONS: readonly Collection[] = [
  { id: 'culinary', label: 'Culinary', gevoel: 'Genieten, wijn, Michelin' },
  { id: 'retreat',  label: 'Retreat',  gevoel: 'Rust, herstel, natuur' },
  { id: 'heritage', label: 'Heritage', gevoel: 'Geschiedenis, waarde, goud' },
  { id: 'seasonal', label: 'Seasonal', gevoel: 'Seizoen, bos, wild, haardvuur' },
  { id: 'routes',   label: 'Routes',   gevoel: 'Vrijheid, weg, kust' },
  { id: 'events',   label: 'Events',   gevoel: 'Avond, theater, spektakel' },
] as const

/** Vaste volgorde voor de filterrij op de pagina. */
export const COLLECTIONS_IN_ORDER: readonly Collection[] = COLLECTIONS

/**
 * De aanwijzingen per collectie, met hun gewicht.
 *
 * Waarom niet de bestaande filterthema's? Die zijn gemaakt om te filteren,
 * niet om in te delen: "Overnachting met diner" zit op 30 van de 37
 * arrangementen en "Overnachten in de natuur" op de helft. Welke je ook
 * voorrang geeft, één collectie slokt alles op — en een kasteelhotel belandde
 * zo bij Routes omdat het toevallig ook een fietsarrangement heeft.
 *
 * Daarom kijken we naar wat het arrangement zélf zegt. Elke collectie heeft
 * aanwijzingen in twee teksten:
 *   - `theme`  → de themalijst van de deal
 *   - `naam`   → de titel van het arrangement plus de hotelnaam
 * Per arrangement tellen we de gewichten op en de hoogste score wint. Een
 * sterke, specifieke aanwijzing ("16e-eeuwse herenboerderij", "MICHELIN")
 * weegt zwaarder dan een vage ("Hotels met zwembad"), zodat de duidelijkste
 * eigenschap van het arrangement de collectie bepaalt.
 */
interface Signal {
  /** Waar we kijken: in de thema's (elk apart) of in titel + hotelnaam. */
  in: 'theme' | 'naam'
  re: RegExp
  weight: number
}

const SIGNALS: Record<CollectionId, Signal[]> = {
  // Meerdaagse routes, fiets- en autovakanties, en de kust.
  routes: [
    { in: 'theme', re: /^autovakantie$|^fietsvakantie$/i, weight: 10 },
    { in: 'naam',  re: /roadtrip|autoroute|kustroute|fietsroute|fietsvakantie|autovakantie/i, weight: 7 },
    { in: 'theme', re: /fietsarrangement/i, weight: 6 },
    { in: 'naam',  re: /aan zee|aan het strand|kust|opaalkust/i, weight: 4 },
    { in: 'theme', re: /aan zee|experience aan zee/i, weight: 3 },
    { in: 'theme', re: /wandelarrangement/i, weight: 2 },
  ],
  // Tafel voorop: Michelin, wijn, bourgondisch.
  culinary: [
    { in: 'naam',  re: /michelin|gastronom/i, weight: 9 },
    { in: 'theme', re: /michelin/i, weight: 8 },
    { in: 'naam',  re: /culinair|dine ?& ?wine|bourgondisch|proeverij|wijn/i, weight: 7 },
    { in: 'theme', re: /culinair genieten/i, weight: 5 },
    { in: 'naam',  re: /restaurant|chef|smaak/i, weight: 3 },
  ],
  // Gebouwen met een verleden: kastelen, kloosters, monumenten.
  heritage: [
    { in: 'naam',  re: /kastel|kasteel|landgoed|klooster|abdij|monument|historisch|eeuws|herenboerderij|herenhuis|villa|voormalig|fabriek/i, weight: 8 },
    { in: 'theme', re: /kasteel|landgoed/i, weight: 7 },
    { in: 'theme', re: /bijzondere overnachtingen/i, weight: 3 },
    { in: 'theme', re: /5.?sterren/i, weight: 1 },
  ],
  // Tot rust komen: wellness, spa, zwemmen, niets moeten.
  retreat: [
    { in: 'theme', re: /wellness|spa\b|therme/i, weight: 7 },
    { in: 'naam',  re: /wellness|spa\b|therme|sanadome|retreat|oase van rust|ontspanning|onthaasten/i, weight: 6 },
    { in: 'naam',  re: /\bresort\b/i, weight: 3 },
    { in: 'theme', re: /jacuzzi|bubbelbad/i, weight: 3 },
    { in: 'theme', re: /hotels met zwembad/i, weight: 2 },
  ],
  // Het seizoen en het buitenleven: bos, natuur, kerst, meivakantie.
  seasonal: [
    { in: 'naam',  re: /kerst|winter|herfst|voorjaar|nazomer|meivakantie|lente|zomer/i, weight: 6 },
    { in: 'theme', re: /voorjaar|kerst|winter|herfst|nazomer|meivakantie/i, weight: 5 },
    { in: 'theme', re: /overnachten in het bos/i, weight: 4 },
    { in: 'theme', re: /hotel met hond/i, weight: 3 },
    { in: 'theme', re: /overnachten in de natuur|in de natuur/i, weight: 3 },
    { in: 'naam',  re: /natuur|bos\b|veluwe|heide|duinen/i, weight: 3 },
  ],
  // Erop uit: de stad in, een voorstelling, een park, een vaartocht.
  events: [
    { in: 'naam',  re: /cruise|concert|theater|musical|festival|citytrip|safari|park\b/i, weight: 8 },
    { in: 'theme', re: /safaripark|attractie|toegang|evenement/i, weight: 7 },
    { in: 'theme', re: /stedentrip|ontdek de stad/i, weight: 5 },
    { in: 'naam',  re: /stedentrip|de stad/i, weight: 3 },
  ],
}

/** Bij een gelijke stand wint de collectie die hier het eerst staat; Events
 *  sluit de rij, zodat "stedentrip" alleen wint als er niets anders is. */
const TIE_BREAK: readonly CollectionId[] = ['culinary', 'heritage', 'retreat', 'routes', 'seasonal', 'events']

/**
 * Deelt alle Originals in over de collecties: per arrangement de collectie
 * met de hoogste score uit SIGNALS.
 *
 * Levert een arrangement helemaal geen aanwijzing op (dat komt voor bij
 * deals met alleen generieke thema's), dan volgt een vaste verdeling op het
 * deal-id, zodat de kaart een kleur heeft die niet verspringt bij herladen.
 */
export function assignCollections(
  rows: ReadonlyArray<{ deal: SearchHotelDeal; hotel: SearchHotel }>,
): Map<string, CollectionId> {
  const out = new Map<string, CollectionId>()

  for (const { deal, hotel } of rows) {
    // Per thema afzonderlijk toetsen, zodat een aanwijzing een heel thema
    // mag afbakenen (`/^autovakantie$/`) en niet per ongeluk midden in de
    // samengevoegde lijst aanslaat.
    const themes = deal.themes || []
    const naamText = `${deal.title?.nl ?? ''} ${deal.title?.en ?? ''} ${hotel.name ?? ''}`

    let best: CollectionId | null = null
    let bestScore = 0
    for (const id of TIE_BREAK) {
      let score = 0
      for (const s of SIGNALS[id]) {
        const hit = s.in === 'theme' ? themes.some(t => s.re.test(t)) : s.re.test(naamText)
        if (hit) score += s.weight
      }
      if (score > bestScore) {
        bestScore = score
        best = id
      }
    }

    if (best) {
      out.set(deal.id, best)
      continue
    }
    let hash = 0
    for (let i = 0; i < deal.id.length; i++) hash = (hash * 31 + deal.id.charCodeAt(i)) >>> 0
    out.set(deal.id, COLLECTIONS[hash % COLLECTIONS.length]!.id)
  }
  return out
}

/** "001", "014" — het volgnummer in de band op de kaart. */
export function originalNumber(index: number): string {
  return String(index + 1).padStart(3, '0')
}
