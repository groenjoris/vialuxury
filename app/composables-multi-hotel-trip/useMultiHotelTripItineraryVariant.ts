/**
 * Multi Hotel Trip — variant van het "Voorbeeld reisschema" op de vakantie-PDP
 * (alleen "Ontdek Noord-Frankrijk en de Opaalkust in 7 dagen", zie
 * ITINERARY_VARIANT_SLUGS). Schakelen gaat via de zwevende knop linksboven
 * (<TripItineraryVariantSwitch>); de keuze blijft bewaard in localStorage.
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

export const ITINERARY_VARIANTS: { id: ItineraryVariant; label: string }[] = [
  { id: 'current', label: '1 · Summary' },
  { id: 'days', label: '2 · Collapsed' },
  { id: 'city', label: '3 · Per stad' },
  { id: 'cities', label: '4 · Map' },
  { id: 'hybrid', label: '5 · Hybrid' },
  { id: 'reviews', label: '6 · Reviews' },
]

/** Vakanties waarop de nieuwe varianten (en de schakelaar) actief zijn. */
export const ITINERARY_VARIANT_SLUGS = ['ontdek-noord-frankrijk-en-de-opaalkust-in-7-dagen']

const STORAGE_KEY = 'vl_mht_itinerary_variant'
const variant = ref<ItineraryVariant>('current')

export function useMultiHotelTripItineraryVariant() {
  /** Na mount aanroepen (niet tijdens SSR/hydration → geen mismatch). */
  function restore() {
    try {
      const v = localStorage.getItem(STORAGE_KEY)
      if (v === 'current' || v === 'days' || v === 'city' || v === 'cities' || v === 'hybrid' || v === 'reviews') variant.value = v
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
