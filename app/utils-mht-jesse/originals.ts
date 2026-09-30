/**
 * Multi Hotel Trip - Jesse — ViaLuxury Originals.
 *
 * De zes collecties uit VIALUXURY-ORIGINALS-COLLECTIEKLEUREN_1.md, en de
 * koppeling van de bestaande filterthema's daaraan. Elk Original krijgt één
 * collectie; die bepaalt de kleur van de band op de kaart.
 *
 * De indeling van thema's over collecties is een eerste invulling, geen
 * vastgesteld beleid: de kleurnota beschrijft de zes collecties, maar zegt
 * niet welk van de negentien bestaande thema's waar hoort.
 *
 * Belangrijk: koppelen gebeurt via de `matches()` van FILTER_TAGS, niet op de
 * themastrings in de dealdata. Die strings zijn losse marketingtermen
 * ("Overnachten in de natuur", "Beste wellness hotels ") die niet gelijk zijn
 * aan de filterlabels; FILTER_TAGS weet hoe je ze moet lezen.
 */
import type { SearchHotel, SearchHotelDeal } from '~/types/searchHotel'
import { FILTER_TAGS } from '~/utils-mht-jesse/filterTags'

export type CollectionId = 'culinary' | 'retreat' | 'heritage' | 'seasonal' | 'routes' | 'events'

export interface Collection {
  id: CollectionId
  label: string
  /** Het gevoel uit de kleurnota, als bijschrift op de pagina. */
  gevoel: string
  /** Filter-tag-ids die bij deze collectie horen (zie filterTags.ts). */
  tags: string[]
}

/** De zes collecties met de filterthema's die eronder vallen. */
export const COLLECTIONS: readonly Collection[] = [
  { id: 'routes',   label: 'Routes',   gevoel: 'Vrijheid, weg, kust',           tags: ['autovakantie', 'fiets', 'aan-zee'] },
  { id: 'retreat',  label: 'Retreat',  gevoel: 'Rust, herstel, natuur',         tags: ['wellness', 'jacuzzi-room', 'pool'] },
  { id: 'heritage', label: 'Heritage', gevoel: 'Geschiedenis, waarde, goud',    tags: ['kasteel', 'unique-stay', 'five-star'] },
  { id: 'events',   label: 'Events',   gevoel: 'Avond, theater, spektakel',     tags: ['steden', 'romantisch', 'exclusive'] },
  { id: 'seasonal', label: 'Seasonal', gevoel: 'Seizoen, bos, wild, haardvuur', tags: ['natuur', 'dog-friendly'] },
  { id: 'culinary', label: 'Culinary', gevoel: 'Genieten, wijn, Michelin',      tags: ['culinair', 'with-dinner'] },
] as const

/** Vaste volgorde voor de filterrij op de pagina, los van de voorrang. */
export const COLLECTIONS_IN_ORDER: readonly Collection[] = [
  COLLECTIONS.find(c => c.id === 'culinary')!,
  COLLECTIONS.find(c => c.id === 'retreat')!,
  COLLECTIONS.find(c => c.id === 'heritage')!,
  COLLECTIONS.find(c => c.id === 'seasonal')!,
  COLLECTIONS.find(c => c.id === 'routes')!,
  COLLECTIONS.find(c => c.id === 'events')!,
] as const

/**
 * Deelt alle Originals in over de collecties.
 *
 * Een vaste voorrangsvolgorde werkt hier niet: sommige thema's raken bijna
 * elke deal ("met diner" 59, "in de natuur" 51) en andere maar een handvol.
 * Wat er ook vooraan staat, dat slokt alles op. Daarom wint per deal het
 * MEEST ONDERSCHEIDENDE thema: van de thema's die op deze deal passen telt
 * degene die over de hele set het minst voorkomt. Zo krijgt een kasteel met
 * diner "Heritage" en niet "Culinary", en blijft Culinary over voor de deals
 * die verder niets bijzonders hebben.
 *
 * Zonder enig passend thema volgt een vaste verdeling op de deal-id, zodat
 * elke kaart een kleur heeft die niet verspringt bij herladen.
 */
export function assignCollections(
  rows: ReadonlyArray<{ deal: SearchHotelDeal; hotel: SearchHotel }>,
): Map<string, CollectionId> {
  const tagIds = COLLECTIONS.flatMap(c => c.tags)
  const collectionOf = new Map<string, CollectionId>()
  for (const c of COLLECTIONS) for (const t of c.tags) collectionOf.set(t, c.id)

  // Welke thema's passen op welke deal, en hoe vaak komt elk thema voor?
  const matchesPerDeal = new Map<string, string[]>()
  const frequency = new Map<string, number>()
  for (const { deal, hotel } of rows) {
    const hits: string[] = []
    for (const id of tagIds) {
      const tag = FILTER_TAGS.find(t => t.id === id)
      if (tag && tag.matches(deal, hotel)) {
        hits.push(id)
        frequency.set(id, (frequency.get(id) ?? 0) + 1)
      }
    }
    matchesPerDeal.set(deal.id, hits)
  }

  const out = new Map<string, CollectionId>()
  for (const { deal } of rows) {
    const hits = matchesPerDeal.get(deal.id) ?? []
    if (hits.length > 0) {
      const rarest = hits.reduce((a, b) => ((frequency.get(b) ?? 0) < (frequency.get(a) ?? 0) ? b : a))
      out.set(deal.id, collectionOf.get(rarest)!)
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
