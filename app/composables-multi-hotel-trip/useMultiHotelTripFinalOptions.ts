/**
 * Multi Hotel Trip — sub-varianten binnen reisschema-variant "1 · Final" op de
 * vakantie-PDP (tweede en derde rij in de zwevende schakelaar linksboven):
 *  - Reviews : 'plain' (zonder vlak, standaard) of 'background' (grijs vlak)
 *  - Includes: 'compact' (rijen met thumb op een grijs vlak, standaard) of 'classic'
 *              (als de gewone arrangementenpagina: twee naast elkaar, foto boven
 *              de tekst, geen achtergrond)
 * Keuzes worden in localStorage bewaard.
 */
export type FinalReviewsStyle = 'background' | 'plain'
export type FinalIncludesStyle = 'classic' | 'compact'

export const FINAL_REVIEWS_OPTIONS: { id: FinalReviewsStyle; label: string }[] = [
  { id: 'background', label: 'Background' },
  { id: 'plain', label: 'No background' },
]
export const FINAL_INCLUDES_OPTIONS: { id: FinalIncludesStyle; label: string }[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'compact', label: 'Compact' },
]

// v2: nieuwe standaarden (reviews zonder vlak, includes compact) — oude bewaarde keuzes tellen niet meer mee.
const REVIEWS_KEY = 'vl_mht_final_reviews_v2'
const INCLUDES_KEY = 'vl_mht_final_includes_v2'

export function useMultiHotelTripFinalOptions() {
  const reviews = useState<FinalReviewsStyle>('mht-final-reviews', () => 'plain')
  const includes = useState<FinalIncludesStyle>('mht-final-includes', () => 'compact')

  /** Na mount aanroepen (niet tijdens SSR/hydration → geen mismatch). */
  function restore() {
    try {
      const r = localStorage.getItem(REVIEWS_KEY)
      if (r === 'background' || r === 'plain') reviews.value = r
      const i = localStorage.getItem(INCLUDES_KEY)
      if (i === 'classic' || i === 'compact') includes.value = i
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
  return { reviews, includes, restore, setReviews, setIncludes }
}
