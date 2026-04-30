import type { SearchHotelDeal } from '~/types/searchHotel'
import type { LocalizedString } from '~/i18n/types'

/** Concatenate NL+EN text from an inclusion list so regex matching is locale-agnostic. */
function includesText(incs: LocalizedString[]): string {
  return incs.map(i => `${i.nl ?? ''} ${i.en ?? ''}`).join(' ').toLowerCase()
}

/** Does a deal satisfy a single arrangement filter key? */
export function dealHasArrangement(deal: SearchHotelDeal, key: string): boolean {
  if (key === 'with-dinner') return !!deal.hasDinner
  const text = includesText(deal.inclusions)
  if (key === 'jacuzzi') return /jacuzzi|bubbelbad/.test(text)
  if (key === 'late-checkout') return /late.?check|laat.?check|laat uit/.test(text)
  return true
}

/** All selected arrangement keys must be satisfied by a single deal (AND). */
export function dealMatchesAllArrangements(deal: SearchHotelDeal, keys: string[]): boolean {
  if (keys.length === 0) return true
  return keys.every(k => dealHasArrangement(deal, k))
}

/** Map home-theme IDs to substrings searched within `pkg.themes[]`.
 *  Hotels match the theme if ANY of their deals' theme strings match ANY
 *  of the listed substrings (case-insensitive). */
const THEME_KEYWORDS: Record<string, string[]> = {
  'wellness':    ['wellness', 'spa'],
  'romantisch':  ['romant'],
  'culinair':    ['culinair', 'michelin', 'genieten'],
  'actief':      ['fiets', 'actief', 'sportief', 'wandel'],
  'steden':      ['stedelijk', 'stede', 'city', 'centrum'],
  'kasteel':     ['kasteel', 'landgoed', 'château', 'chateau'],
  'aan-zee':     ['zee', 'strand', 'kust'],
  'natuur':      ['natuur', 'bos', 'park'],
}

export function dealMatchesTheme(deal: SearchHotelDeal, themeId: string): boolean {
  const keywords = THEME_KEYWORDS[themeId]
  if (!keywords) return true // unknown theme → don't filter out
  const themes = (deal.themes || []).map(t => t.toLowerCase())
  return keywords.some(kw => themes.some(t => t.includes(kw)))
}

/** Hotel matches if at least one of its deals matches at least one selected theme.
 *  (OR across themes, OR across deals.) Returns true when no theme is selected. */
export function hotelMatchesAnyTheme(
  deals: SearchHotelDeal[],
  selectedThemeIds: string[],
): boolean {
  if (selectedThemeIds.length === 0) return true
  return deals.some(d => selectedThemeIds.some(id => dealMatchesTheme(d, id)))
}
