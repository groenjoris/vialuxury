/**
 * Multi Hotel Trip — quick filters voor de Vakanties-zoekpagina.
 *
 * In plaats van het filterpaneel links filtert de vakantiepagina met een
 * horizontale rij grote filterpillen bovenin. Elke pil kan aan en uit;
 * aan = donkere kleur + kruisje. Vervoer (auto/fiets) en land (Nederland/
 * België/Frankrijk) zijn OF binnen hun groep, de themapillen zijn EN (een
 * autovakantie in Nederland óf Frankrijk, mét wellness).
 *
 * De basisrij moet op desktop op één regel passen (toolbar ≈ 1152 px);
 * daarom zijn Nieuw, Ontspanning, Cultuur, Steden en Kastelen weggelaten.
 * Zodra "Met de fiets" aan staat verschijnen op een tweede regel de
 * fietsopties (`parents: ['fiets']`): bagagetransfer, fiets van hotel naar
 * hotel, fiets huren, fietsroutes rond hotel; bij "Met de auto" de auto-opties
 * gratis parkeren, laadpaal en fiets huren. Opties zijn EN, net als thema's,
 * en gaan mee uit als hun ouderpil wordt uitgezet (fiets huren hangt onder
 * beide en blijft staan zolang een van de twee aan is).
 */
export type TripQuickFilterGroup = 'transport' | 'land' | 'thema' | 'fietsoptie' | 'autooptie'

export interface TripQuickFilter {
  id: string
  label: string
  group: TripQuickFilterGroup
  /** Subfilter: alleen zichtbaar als (een van) deze ouderpil(len) aan staat. */
  parents?: string[]
}

export const TRIP_QUICK_FILTERS: TripQuickFilter[] = [
  { id: 'auto', label: 'Met de auto', group: 'transport' },
  { id: 'fiets', label: 'Met de fiets', group: 'transport' },
  { id: 'nederland', label: 'Nederland', group: 'land' },
  { id: 'belgie', label: 'België', group: 'land' },
  { id: 'frankrijk', label: 'Frankrijk', group: 'land' },
  { id: 'wellness', label: 'Wellness', group: 'thema' },
  { id: 'aan-zee', label: 'Aan zee', group: 'thema' },
  { id: 'natuur', label: 'In de natuur', group: 'thema' },
  { id: 'culinair', label: 'Culinair', group: 'thema' },
  // Auto-opties — tweede regel, alleen bij "Met de auto".
  { id: 'gratis-parkeren', label: 'Gratis parkeren', group: 'autooptie', parents: ['auto'] },
  { id: 'laadpaal', label: 'Laadpaal', group: 'autooptie', parents: ['auto'] },
  // Fiets huren hangt onder auto én fiets.
  { id: 'fiets-huren', label: 'Fiets huren', group: 'autooptie', parents: ['auto', 'fiets'] },
  // Fietsopties — tweede regel, alleen bij "Met de fiets".
  { id: 'bagagetransfer', label: 'Bagagetransfer', group: 'fietsoptie', parents: ['fiets'] },
  { id: 'hotel-naar-hotel', label: 'Fiets van hotel naar hotel', group: 'fietsoptie', parents: ['fiets'] },
  { id: 'fietsroutes', label: 'Fietsroutes rond hotel', group: 'fietsoptie', parents: ['fiets'] },
]

/** Basisrij (zonder subfilters). */
export const TRIP_PRIMARY_FILTERS: TripQuickFilter[] = TRIP_QUICK_FILTERS.filter(f => !f.parents)

/** Ouderpillen die subfilters hebben, in weergavevolgorde van de tweede regel. */
export const TRIP_SUB_PARENTS: string[] = ['auto', 'fiets']

/** Subfilters die onder een ouderpil hangen (bijv. fietsopties onder 'fiets'). */
export function tripSubFilters(parentId: string): TripQuickFilter[] {
  return TRIP_QUICK_FILTERS.filter(f => f.parents?.includes(parentId))
}

const FILTER_BY_ID: Record<string, TripQuickFilter> = Object.fromEntries(
  TRIP_QUICK_FILTERS.map(f => [f.id, f]),
)

export function getTripQuickFilter(id: string): TripQuickFilter | undefined {
  return FILTER_BY_ID[id]
}

/** Voldoen de tags van een vakantie aan de actieve quick filters? */
export function tripMatchesQuickFilters(tags: readonly string[], selected: readonly string[]): boolean {
  if (selected.length === 0) return true
  const transport = selected.filter(id => FILTER_BY_ID[id]?.group === 'transport')
  const land = selected.filter(id => FILTER_BY_ID[id]?.group === 'land')
  const thema = selected.filter(id => FILTER_BY_ID[id]?.group === 'thema')
  const opties = selected.filter(id => /optie$/.test(FILTER_BY_ID[id]?.group ?? ''))
  if (transport.length > 0 && !transport.some(id => tags.includes(id))) return false
  if (land.length > 0 && !land.some(id => tags.includes(id))) return false
  if (thema.length > 0 && !thema.every(id => tags.includes(id))) return false
  if (opties.length > 0 && !opties.every(id => tags.includes(id))) return false
  return true
}
