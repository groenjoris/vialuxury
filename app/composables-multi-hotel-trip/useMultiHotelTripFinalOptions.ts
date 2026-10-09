/**
 * Multi Hotel Trip — sub-varianten binnen reisschema-variant "1 · Final" op de
 * vakantie-PDP (tweede en derde rij in de zwevende schakelaar linksboven):
 *  - Reviews : 'plain' (zonder vlak, standaard) of 'background' (grijs vlak)
 *  - Includes: 'compact' (rijen met thumb op een grijs vlak, standaard) of 'classic'
 *              (als de gewone arrangementenpagina: twee naast elkaar, foto boven
 *              de tekst, geen achtergrond)
 * Daarnaast, bij alle varianten met een dagsamenvatting:
 *  - Voorbeeld reisschema: 'plain' (kaal, standaard) of 'lines' (subtiele stippellijntjes
 *              tussen de dagen, alleen tussen de beschrijvingen)
 *  - Stats: kerngetallen (dagen · hotels · bezienswaardigheden) boven de dagsamenvatting
 *              'off' (standaard) of 'on'
 * Keuzes worden in localStorage bewaard.
 */
export type FinalReviewsStyle = 'background' | 'plain'
export type FinalIncludesStyle = 'classic' | 'compact'
export type SummaryStyle = 'plain' | 'lines'
export type StatsSetting = 'on' | 'off'

export const FINAL_REVIEWS_OPTIONS: { id: FinalReviewsStyle; label: string }[] = [
  { id: 'background', label: 'Background' },
  { id: 'plain', label: 'No background' },
]
export const SUMMARY_STYLE_OPTIONS: { id: SummaryStyle; label: string }[] = [
  { id: 'plain', label: 'Kaal' },
  { id: 'lines', label: 'Lijntjes' },
]
export const STATS_OPTIONS: { id: StatsSetting; label: string }[] = [
  { id: 'on', label: 'Aan' },
  { id: 'off', label: 'Uit' },
]
export const FINAL_INCLUDES_OPTIONS: { id: FinalIncludesStyle; label: string }[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'compact', label: 'Compact' },
]

// v2: nieuwe standaarden (reviews zonder vlak, includes compact) — oude bewaarde keuzes tellen niet meer mee.
const REVIEWS_KEY = 'vl_mht_final_reviews_v2'
const INCLUDES_KEY = 'vl_mht_final_includes_v2'
const SUMMARY_KEY = 'vl_mht_summary_style'
const STATS_KEY = 'vl_mht_summary_stats'

export function useMultiHotelTripFinalOptions() {
  const reviews = useState<FinalReviewsStyle>('mht-final-reviews', () => 'plain')
  const includes = useState<FinalIncludesStyle>('mht-final-includes', () => 'compact')
  const summaryStyle = useState<SummaryStyle>('mht-summary-style', () => 'plain')
  const stats = useState<StatsSetting>('mht-summary-stats', () => 'off')

  /** Na mount aanroepen (niet tijdens SSR/hydration → geen mismatch). */
  function restore() {
    try {
      const r = localStorage.getItem(REVIEWS_KEY)
      if (r === 'background' || r === 'plain') reviews.value = r
      const i = localStorage.getItem(INCLUDES_KEY)
      if (i === 'classic' || i === 'compact') includes.value = i
      const ss = localStorage.getItem(SUMMARY_KEY)
      if (ss === 'plain' || ss === 'lines') summaryStyle.value = ss
      const st = localStorage.getItem(STATS_KEY)
      if (st === 'on' || st === 'off') stats.value = st
    } catch { /* localStorage niet beschikbaar */ }
  }
  function setReviews(v: FinalReviewsStyle) {
    reviews.value = v
    try { localStorage.setItem(REVIEWS_KEY, v) } catch { /* noop */ }
  }
  function setIncludes(v: FinalIncludesStyle) {
    includes.value = v
    try { localStorage.setItem(INCLUDES_KEY, v) } catch { /* noop */ }
  }
  function setSummaryStyle(v: SummaryStyle) {
    summaryStyle.value = v
    try { localStorage.setItem(SUMMARY_KEY, v) } catch { /* noop */ }
  }
  function setStats(v: StatsSetting) {
    stats.value = v
    try { localStorage.setItem(STATS_KEY, v) } catch { /* noop */ }
  }
  return { reviews, includes, summaryStyle, stats, restore, setReviews, setIncludes, setSummaryStyle, setStats }
}
