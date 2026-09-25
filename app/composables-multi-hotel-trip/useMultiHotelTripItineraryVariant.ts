/**
 * Multi Hotel Trip — variant van het "Voorbeeld reisschema" op de vakantie-PDP
 * (alleen "Ontdek Noord-Frankrijk en de Opaalkust in 7 dagen", zie
 * ITINERARY_VARIANT_SLUGS). Schakelen gaat via de zwevende knop linksboven
 * (<TripItineraryVariantSwitch>); de keuze blijft bewaard in localStorage.
 *
 *  - 'days'   → accordeon-tijdlijn per dag (TripItineraryAccordion)
 *  - 'cities' → 50/50: sticky kaart links, per plaats rechts (TripItineraryCities)
 */
export type ItineraryVariant = 'days' | 'cities'

export const ITINERARY_VARIANTS: { id: ItineraryVariant; label: string }[] = [
  { id: 'days', label: 'Per dag' },
  { id: 'cities', label: 'Per plaats' },
]

/** Vakanties waarop de nieuwe varianten (en de schakelaar) actief zijn. */
export const ITINERARY_VARIANT_SLUGS = ['ontdek-noord-frankrijk-en-de-opaalkust-in-7-dagen']

const STORAGE_KEY = 'vl_mht_itinerary_variant'
const variant = ref<ItineraryVariant>('days')

export function useMultiHotelTripItineraryVariant() {
  /** Na mount aanroepen (niet tijdens SSR/hydration → geen mismatch). */
  function restore() {
    try {
      const v = localStorage.getItem(STORAGE_KEY)
      if (v === 'days' || v === 'cities') variant.value = v
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
