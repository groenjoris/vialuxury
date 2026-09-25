/**
 * Multi Hotel Trip — variant van het "Voorbeeld reisschema" op de vakantie-PDP
 * (alleen "Ontdek Noord-Frankrijk en de Opaalkust in 7 dagen", zie
 * ITINERARY_VARIANT_SLUGS). Schakelen gaat via de zwevende knop linksboven
 * (<TripItineraryVariantSwitch>); de keuze blijft bewaard in localStorage.
 *
 *  - 'current' → variant 1: het bestaande reisschema (MultiHotelTripItinerary,
 *                in de linkerkolom, samenvatting + "Toon volledig …")
 *  - 'days'    → variant 2: accordeon-tijdlijn per dag (TripItineraryAccordion)
 *  - 'cities'  → variant 3: 50/50: sticky kaart links, per plaats rechts
 *                (TripItineraryCities)
 * Variant 2 en 3 staan over de volle breedte onder de twee kolommen; variant 1
 * houdt de bestaande lay-out.
 */
export type ItineraryVariant = 'current' | 'days' | 'cities'

export const ITINERARY_VARIANTS: { id: ItineraryVariant; label: string }[] = [
  { id: 'current', label: '1 · Huidig' },
  { id: 'days', label: '2 · Per dag' },
  { id: 'cities', label: '3 · Per plaats' },
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
      if (v === 'current' || v === 'days' || v === 'cities') variant.value = v
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
