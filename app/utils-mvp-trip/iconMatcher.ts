/**
 * Map a free-text highlight label (NL/EN) to a concept icon URL from the
 * ViaLuxury amenity set. Returns `iconUrl: null` for anything we can't
 * confidently classify — the template then renders a CSS checkmark for
 * visual consistency (better than mixing in random third-party icons).
 *
 * The concept palette is defined below, local to this prototype.
 */
/**
 * Concept → local icon. `app/data/highlight-icons.ts` is shared with
 * Huisstijl / Northstar and still points at the filled asset.vialuxury.com
 * glyphs, so this prototype keeps its own map here rather than editing the
 * shared one — same line-icon family as the rest of the redesign.
 */
const HIGHLIGHT_ICONS = {
  dining:   '/icons/facilities/restaurant.svg',
  wellness: '/icons/facilities/wellness.svg',
  pool:     '/icons/facilities/pool.svg',
  fitness:  '/icons/facilities/fitness.svg',
  bike:     '/icons/facilities/bike.svg',
  wifi:     '/icons/facilities/wifi.svg',
  parking:  '/icons/facilities/parking.svg',
  kids:     '/icons/facilities/kids.svg',
  pets:     '/icons/facilities/pets.svg',
  service:  '/icons/facilities/service.svg',
  beach:    '/icons/facilities/beach.svg',
} as const

type HighlightConcept = keyof typeof HIGHLIGHT_ICONS

interface IconMatch {
  /** Concept icon URL, or null when we want the template's CSS checkmark fallback. */
  iconUrl: string | null
  /** Emoji fallback (kept for legacy callers; template prefers CSS check when iconUrl is null). */
  emoji: string
}

// Ordered list — first match wins. Lowercased substring matching.
const RULES: Array<{ keywords: string[]; concept: HighlightConcept; emoji: string }> = [
  // Food & drink — most varied vocabulary, so check first
  { keywords: ['ontbijt', 'breakfast', 'diner', 'dinner', 'lunch', 'restaurant', 'à la carte', 'a la carte', 'à-la-carte', 'a-la-carte', 'gastronom', 'culinair', 'menu', 'gangen', 'maaltijd', 'brasserie', 'bistro', 'drank', 'borrel', 'champagne', 'bubbel', 'welkomst', 'welcome drink', 'glas wijn', 'cocktail', 'aperitief', 'bar'], concept: 'dining', emoji: '🍽️' },
  { keywords: ['wellness', 'spa', 'sauna', 'thermen', 'massage', 'beauty'], concept: 'wellness', emoji: '💆' },
  { keywords: ['zwembad', 'pool', 'swimming'], concept: 'pool', emoji: '🏊' },
  { keywords: ['fitness', 'gym', 'sportschool'], concept: 'fitness', emoji: '💪' },
  { keywords: ['fiets', 'bike', 'bicycle', 'e-bike'], concept: 'bike', emoji: '🚲' },
  { keywords: ['wifi', 'internet'], concept: 'wifi', emoji: '📶' },
  { keywords: ['parkeren', 'parking', 'parkeer', 'garage'], concept: 'parking', emoji: '🅿️' },
  { keywords: ['kind', 'child', 'baby', 'familie', 'family', 'kinder'], concept: 'kids', emoji: '👨‍👩‍👧' },
  { keywords: ['huisdier', 'hond', 'pet'], concept: 'pets', emoji: '🐾' },
  { keywords: ['late check', 'late uitcheck', 'late checkout', 'check-out', 'check-in', 'concierge', 'receptie', 'roomservice', 'kamerservice', 'shuttle', 'bagage'], concept: 'service', emoji: '🛎️' },
  { keywords: ['strand', 'beach', 'aan zee', 'aan de zee', 'kustlijn', 'kust', 'seaside'], concept: 'beach', emoji: '🏖️' },
]

const DEFAULT_EMOJI = '✓'

export function matchIcon(label: string): IconMatch {
  if (!label) return { iconUrl: null, emoji: DEFAULT_EMOJI }
  const lower = label.toLowerCase()
  for (const rule of RULES) {
    if (rule.keywords.some((k) => lower.includes(k))) {
      return {
        iconUrl: HIGHLIGHT_ICONS[rule.concept],
        emoji: rule.emoji,
      }
    }
  }
  // Unmatchable highlight (e.g. "Direct aan zee", "Cadeaubon") → CSS checkmark in template.
  return { iconUrl: null, emoji: DEFAULT_EMOJI }
}
