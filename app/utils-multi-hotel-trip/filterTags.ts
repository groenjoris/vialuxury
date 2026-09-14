import type { SearchHotel, SearchHotelDeal } from '~/types/searchHotel'
import type { LocalizedString } from '~/i18n/types'

export type FilterCategory = 'arrangement' | 'thema' | 'specials'

export interface FilterTag {
  id: string
  label: string
  emoji: string
  category: FilterCategory
  /** Returns true if a single deal of a hotel satisfies this tag.
   *  Some tags are inherently hotel-level (e.g. 5-sterren, Honden welkom);
   *  for those the deal arg is unused and `hotel` carries the truth. */
  matches: (deal: SearchHotelDeal, hotel: SearchHotel) => boolean
}

// ----- helpers -----
const themeMatch = (re: RegExp) => (deal: SearchHotelDeal) =>
  (deal.themes || []).some(t => re.test(t))

const inclMatch = (re: RegExp) => (deal: SearchHotelDeal) => {
  const text = (deal.inclusions as LocalizedString[])
    .map(i => `${i?.nl ?? ''} ${i?.en ?? ''}`)
    .join(' ')
    .toLowerCase()
  return re.test(text)
}

// ----- the 18 tags -----
export const FILTER_TAGS: FilterTag[] = [
  // ---------- ARRANGEMENT ----------
  {
    id: 'wellness',
    label: 'Wellness',
    emoji: '🧖',
    category: 'arrangement',
    matches: themeMatch(/wellness|spa/i),
  },
  {
    id: 'jacuzzi-room',
    label: 'Kamer met bubbelbad',
    emoji: '🛁',
    category: 'arrangement',
    matches: (d) => inclMatch(/jacuzzi|bubbelbad/)(d) || themeMatch(/jacuzzi|bubbelbad/i)(d),
  },
  {
    id: 'pool',
    label: 'Zwembad',
    emoji: '🏊',
    category: 'arrangement',
    matches: themeMatch(/zwembad|pool/i),
  },
  {
    id: 'with-dinner',
    label: 'Met diner',
    emoji: '🍽️',
    category: 'arrangement',
    matches: (d) => !!d.hasDinner || themeMatch(/inclusief diner|met diner/i)(d),
  },
  {
    id: 'dog-friendly',
    label: 'Honden welkom',
    emoji: '🐕',
    category: 'arrangement',
    matches: (d, h) => (h.labels || []).includes('dog-friendly') || themeMatch(/hond/i)(d),
  },
  {
    id: 'mini-trip',
    label: 'Mini-vakanties',
    emoji: '⏱️',
    category: 'arrangement',
    matches: (d) => d.nights <= 3 || themeMatch(/mini.?vakantie|weekendje/i)(d),
  },

  // ---------- THEMA ----------
  {
    id: 'aan-zee',
    label: 'Aan zee',
    emoji: '🌊',
    category: 'thema',
    matches: themeMatch(/aan zee|kust|strand|nazomer/i),
  },
  {
    id: 'natuur',
    label: 'In de natuur',
    emoji: '🌿',
    category: 'thema',
    matches: themeMatch(/natuur|bos|park/i),
  },
  {
    id: 'romantisch',
    label: 'Romantisch',
    emoji: '❤️',
    category: 'thema',
    matches: themeMatch(/romantisch/i),
  },
  {
    id: 'culinair',
    label: 'Culinair genieten',
    emoji: '🍽️',
    category: 'thema',
    matches: themeMatch(/culinair|michelin|genieten/i),
  },
  {
    id: 'fiets',
    label: 'Met fiets',
    emoji: '🚴',
    category: 'thema',
    matches: themeMatch(/fiets/i),
  },
  {
    id: 'steden',
    label: 'Stedentrip',
    emoji: '🏛️',
    category: 'thema',
    matches: themeMatch(/stedentrip|stedelijk|ontdek de stad|city/i),
  },
  {
    id: 'kasteel',
    label: 'Kasteelhotels',
    emoji: '🏰',
    category: 'thema',
    matches: themeMatch(/kasteel|landgoed/i),
  },

  // ---------- SPECIALS ----------
  {
    id: 'unique-stay',
    label: 'Bijzondere overnachtingen',
    emoji: '✨',
    category: 'specials',
    matches: themeMatch(/bijzondere overnachtingen/i),
  },
  {
    id: 'five-star',
    label: '5-sterren luxe',
    emoji: '👑',
    category: 'specials',
    matches: (d, h) => h.starRating >= 5 || themeMatch(/5.?sterren/i)(d),
  },
  {
    id: 'exclusive',
    label: 'Exclusief bij ViaLuxury',
    emoji: '👑',
    category: 'specials',
    matches: (d, h) => (h.labels || []).includes('exclusief') || themeMatch(/^exclusief$|vip mail/i)(d),
  },
  {
    id: 'best-price',
    label: 'Beste prijs',
    emoji: '💸',
    category: 'specials',
    matches: (d) =>
      themeMatch(/goedkop|kortingsbon|kortingscode|promocode|korting$|super deal/i)(d) ||
      d.discountPercentage >= 50,
  },
  {
    id: 'new-hotels',
    label: 'Nieuwe hotels',
    emoji: '🆕',
    category: 'specials',
    matches: (d, h) => (h.labels || []).includes('nieuw') || themeMatch(/^nieuwe hotels$/i)(d),
  },
]

const TAG_BY_ID: Record<string, FilterTag> = Object.fromEntries(
  FILTER_TAGS.map(t => [t.id, t]),
)

export function getFilterTag(id: string): FilterTag | undefined {
  return TAG_BY_ID[id]
}

export function tagsByCategory(category: FilterCategory): FilterTag[] {
  return FILTER_TAGS.filter(t => t.category === category)
}

/**
 * Per-category combination rules:
 *   - Arrangement → AND  (every selected arrangement must match a single deal)
 *   - Thema       → OR   (at least one selected theme must match)
 *   - Specials    → OR   (at least one selected special must match)
 * The three category results are then combined with AND.
 */
export function dealMatchesAllTags(
  deal: SearchHotelDeal,
  hotel: SearchHotel,
  tagIds: string[],
): boolean {
  if (tagIds.length === 0) return true

  const groups: Record<FilterCategory, FilterTag[]> = {
    arrangement: [],
    thema: [],
    specials: [],
  }
  for (const id of tagIds) {
    const tag = TAG_BY_ID[id]
    if (tag) groups[tag.category].push(tag)
  }

  // Arrangement: every selected arrangement must match.
  if (!groups.arrangement.every(t => t.matches(deal, hotel))) return false
  // Thema: at least one selected theme must match (when any are selected).
  if (groups.thema.length > 0 && !groups.thema.some(t => t.matches(deal, hotel))) return false
  // Specials: at least one selected special must match (when any selected).
  if (groups.specials.length > 0 && !groups.specials.some(t => t.matches(deal, hotel))) return false
  return true
}
