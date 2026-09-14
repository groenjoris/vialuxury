/**
 * Multi Hotel Trip — quick filters voor de Vakanties-zoekpagina.
 *
 * In plaats van het filterpaneel links filtert de vakantiepagina met een
 * horizontale rij grote filterpillen bovenin. Elke pil kan aan en uit;
 * aan = donkere kleur + kruisje. Vervoer (auto/fiets) is OF binnen de
 * groep, de overige pillen zijn EN (een autovakantie mét wellness).
 */
export type TripQuickFilterGroup = 'transport' | 'thema'

export interface TripQuickFilter {
  id: string
  label: string
  group: TripQuickFilterGroup
}

export const TRIP_QUICK_FILTERS: TripQuickFilter[] = [
  { id: 'auto', label: 'Met de auto', group: 'transport' },
  { id: 'fiets', label: 'Met de fiets', group: 'transport' },
  { id: 'kasteel', label: 'Kastelen', group: 'thema' },
  { id: 'superluxe', label: 'Superluxe', group: 'thema' },
  { id: 'budget', label: 'Budget', group: 'thema' },
  { id: 'wellness', label: 'Wellness', group: 'thema' },
  { id: 'aan-zee', label: 'Aan zee', group: 'thema' },
  { id: 'natuur', label: 'In de natuur', group: 'thema' },
  { id: 'culinair', label: 'Culinair', group: 'thema' },
  { id: 'steden', label: 'Steden', group: 'thema' },
]

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
  const thema = selected.filter(id => FILTER_BY_ID[id]?.group === 'thema')
  if (transport.length > 0 && !transport.some(id => tags.includes(id))) return false
  if (thema.length > 0 && !thema.every(id => tags.includes(id))) return false
  return true
}
