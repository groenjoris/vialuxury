/**
 * Multi Hotel Trip — sub-varianten binnen reisschema-variant "1 · Final" op de
 * vakantie-PDP (tweede en derde rij in de zwevende schakelaar linksboven):
 *  - Reviews : 'background' (grijs vlak, huidig) of 'plain' (zonder vlak)
 *  - Includes: 'compact' (rijen met thumb op een grijs vlak, huidig) of 'classic'
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

const REVIEWS_KEY = 'vl_mht_final_reviews'
const INCLUDES_KEY = 'vl_mht_final_includes'

export function useMultiHotelTripFinalOptions() {
  const reviews = useState<FinalReviewsStyle>('mht-final-reviews', () => 'background')
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
