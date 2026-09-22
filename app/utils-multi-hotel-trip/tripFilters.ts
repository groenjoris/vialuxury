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
 * fietsopties (`parent: 'fiets'`): bagagetransfer, fiets van hotel naar
 * hotel, fiets huren, fietsroutes rond hotel. Die zijn EN, net als thema's,
 * en gaan mee uit als de fietspil wordt uitgezet.
 */
export type TripQuickFilterGroup = 'transport' | 'land' | 'thema' | 'fietsoptie'

export interface TripQuickFilter {
  id: string
  label: string
  group: TripQuickFilterGroup
  /** Subfilter: alleen zichtbaar als deze ouderpil aan staat. */
  parent?: string
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
  // Fietsopties — tweede regel, alleen bij "Met de fiets".
  { id: 'bagagetransfer', label: 'Bagagetransfer', group: 'fietsoptie', parent: 'fiets' },
  { id: 'hotel-naar-hotel', label: 'Fiets van hotel naar hotel', group: 'fietsoptie', parent: 'fiets' },
  { id: 'fiets-huren', label: 'Fiets huren', group: 'fietsoptie', parent: 'fiets' },
  { id: 'fietsroutes', label: 'Fietsroutes rond hotel', group: 'fietsoptie', parent: 'fiets' },
]

/** Basisrij (zonder subfilters). */
export const TRIP_PRIMARY_FILTERS: TripQuickFilter[] = TRIP_QUICK_FILTERS.filter(f => !f.parent)

/** Subfilters die onder een ouderpil hangen (bijv. fietsopties onder 'fiets'). */
export function tripSubFilters(parentId: string): TripQuickFilter[] {
  return TRIP_QUICK_FILTERS.filter(f => f.parent === parentId)
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
  const opties = selected.filter(id => FILTER_BY_ID[id]?.group === 'fietsoptie')
  if (transport.length > 0 && !transport.some(id => tags.includes(id))) return false
  if (land.length > 0 && !land.some(id => tags.includes(id))) return false
  if (thema.length > 0 && !thema.every(id => tags.includes(id))) return false
  if (opties.length > 0 && !opties.every(id => tags.includes(id))) return false
  return true
}
