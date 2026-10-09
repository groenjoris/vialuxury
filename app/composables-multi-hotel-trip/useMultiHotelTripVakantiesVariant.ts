/**
 * Multi Hotel Trip — variant van de Vakanties-zoekpagina (/multi-hotel-trip/vakanties),
 * om aan de opdrachtgever te tonen (schakelaarpaneel linksboven):
 *  - 'standaard' : de toolbar zoals hij was — de quick-filterpillen op één regel,
 *                  Sorteren/weergave rechts op de tweede regel
 *  - 'map'       : linksboven in de toolbar hetzelfde kaartje als op de gewone
 *                  zoekpagina (knop "Tonen op kaart"), 75% zo hoog; de pillen
 *                  staan ernaast en lopen over twee regels, Sorteren/weergave
 *                  sluiten rechts op de laatste pillenregel aan
 * Alleen desktop (de mobiele Vakanties-pagina verandert niet).
 * Keuze wordt in localStorage bewaard zodat hij tussen pagina's blijft staan.
 */
export type VakantiesVariant = 'standaard' | 'map'

export const VAKANTIES_VARIANTS: { id: VakantiesVariant; label: string }[] = [
  { id: 'standaard', label: 'Standaard' },
  { id: 'map', label: 'Map' },
]

const STORAGE_KEY = 'vl_mht_vakanties_variant'

export function useMultiHotelTripVakantiesVariant() {
  const variant = useState<VakantiesVariant>('mht-vakanties-variant', () => 'standaard')

  // Na hydratie de bewaarde keuze terugzetten (alleen in een component-setup).
  if (import.meta.client && getCurrentInstance()) {
    onMounted(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved === 'standaard' || saved === 'map') variant.value = saved
      } catch { /* localStorage niet beschikbaar */ }
    })
  }

  function setVariant(v: VakantiesVariant) {
    variant.value = v
    if (import.meta.client) {
      try { localStorage.setItem(STORAGE_KEY, v) } catch { /* noop */ }
    }
  }

  /** Kaartje linksboven in de toolbar van de Vakanties-pagina. */
  const showMap = computed(() => variant.value === 'map')

  return { variant, showMap, setVariant }
}
