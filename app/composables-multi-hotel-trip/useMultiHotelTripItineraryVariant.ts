/**
 * Multi Hotel Trip — variant van het "Voorbeeld reisschema" op de vakantie-PDP
 * (alleen "Ontdek Noord-Frankrijk en de Opaalkust in 7 dagen", zie
 * ITINERARY_VARIANT_SLUGS). Schakelen gaat via de zwevende knop linksboven
 * (<TripItineraryVariantSwitch>); de keuze blijft bewaard in localStorage.
 * In de schakelaar staan nog drie: 1 · Final ('city'), 2 · Map ('cities') en
 * 3 · Per dag ('hybrid'). Hieronder alle varianten (ook de niet meer getoonde):
 *
 *  - 'current' → variant 1 "Summary": het bestaande reisschema
 *                (MultiHotelTripItinerary, linkerkolom, samenvatting + "Toon volledig …")
 *  - 'days'    → variant 2 "Collapsed": accordeon-tijdlijn per dag
 *                (TripItineraryAccordion), ook in de linkerkolom, alle dagen
 *                standaard ingeklapt
 *  - 'city'    → variant 3 "Per stad": verticale tijdlijn met per stad/hotel één
 *                hoofdstuk (hotel + ontbijt, extra's/diner, carrousel "Leuke
 *                uitjes in de buurt"), in de linkerkolom (TripItineraryPerCity)
 *  - 'cities'  → variant 4 "Map": 50/50: sticky kaart links, per plaats rechts
 *                (TripItineraryCities), over de volle breedte onder de twee kolommen
 *  - 'hybrid'  → variant 5 "Hybrid": de klikbare dagsamenvatting (uit Summary)
 *                bovenaan de linkerkolom onder de beschrijving, dan de includes,
 *                en het ingeklapte reisschema (accordeon uit Collapsed) over de
 *                volle breedte onder de twee kolommen
 *  - 'reviews' → variant 6 "Reviews": als Hybrid, plus drie reizigersbeoordelingen
 *                (naast elkaar) onder "Je reis in het kort" en de totaalscore
 *                bovenin bij de subtitel
 */
export type ItineraryVariant = 'current' | 'days' | 'city' | 'cities' | 'hybrid' | 'reviews'

/* Volgorde in de schakelaar: het gekozen ontwerp ("Final" = Per stad met reviews) eerst.
   Sinds 2026-09-28 nog drie ter vergelijking; 'current' (Summary), 'days' (Collapsed) en
   'reviews' staan niet meer in de schakelaar (de code erachter bestaat nog). */
export const ITINERARY_VARIANTS: { id: ItineraryVariant; label: string }[] = [
  { id: 'city', label: '1 · Final' },
  { id: 'cities', label: '2 · Map' },
  { id: 'hybrid', label: '3 · Per dag' },
]

/** Vakanties waarop de nieuwe varianten (en de schakelaar) actief zijn. */
export const ITINERARY_VARIANT_SLUGS = ['ontdek-noord-frankrijk-en-de-opaalkust-in-7-dagen']
/** "Per stad" (Final) is het ontwerp; het zwevende schakelknopje linksboven op de PDP blijft ter
 *  vergelijking. Zet op false om de schakelaar te verbergen (vaste variant uit FIXED_ITIN_VARIANT). */
export const ITINERARY_SWITCHER_ENABLED = true

const STORAGE_KEY = 'vl_mht_itinerary_variant'
// Keuze (2026-09-28): "Per stad" (met reviews) is het ontwerp; de andere varianten blijven ter vergelijking.
const variant = ref<ItineraryVariant>('city')

export function useMultiHotelTripItineraryVariant() {
  /** Na mount aanroepen (niet tijdens SSR/hydration → geen mismatch). */
  function restore() {
    try {
      const v = localStorage.getItem(STORAGE_KEY)
      // Alleen varianten die nog in de schakelaar staan; een oude keuze (Summary/Collapsed/Reviews) valt terug op Final.
      if (ITINERARY_VARIANTS.some(x => x.id === v)) variant.value = v as ItineraryVariant
    } catch { /* ignore */ }
  }
  function setVariant(v: ItineraryVariant) {
    variant.value = v
    if (import.meta.client) {
      try { localStorage.setItem(STORAGE_KEY, v) } catch { /* ignore */ }
    }
  }
  return { variant, setVariant, restore }
}
