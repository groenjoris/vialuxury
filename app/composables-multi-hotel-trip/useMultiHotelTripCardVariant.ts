/**
 * Multi Hotel Trip — dealcard-variant voor de vakanties, om aan de opdrachtgever
 * te tonen (schakelaar onder het logo op de Vakanties-zoekpagina):
 *  - '50-50'   : foto links, schematisch routekaartje rechts (huidige variant)
 *  - 'overlay' : foto over de volle breedte, het kaartje semi-transparant
 *                als overlay erover (route en iconen blijven dekkend)
 *  - 'inverse' : als overlay, maar met een inverse kaart: donkere landmassa,
 *                witte route en plaatsnamen, witte markers
 *  - 'timeline': foto over de volle breedte, onderaan een schematische
 *                tijdlijn: plaatsnaam · bolletje · "2 nachten", met tussen de
 *                stops een gestreepte lijn en een rijdende auto (fiets bij de
 *                fietsvakantie)
 *  - 'collage' : hoofdfoto over 3/4 van de breedte; rechts 1/4 met drie
 *                tegels onder elkaar: mini-routekaartje (stipjes, landcodes)
 *                en de twee omgevingsfoto's die de PDP-gallery als eerste toont
 * Keuze wordt in localStorage bewaard zodat hij tussen pagina's blijft staan.
 *
 * BESLUIT 2026-09-24: 'collage' is de definitieve variant. De schakelaar staat
 * niet meer op de zoekpagina (zie search.vue) en de variant staat vast; zet
 * VARIANT_SWITCHER_ENABLED op true om de schakelaar + bewaarde keuze terug te
 * krijgen.
 */
export const VARIANT_SWITCHER_ENABLED = false
export const DEFAULT_TRIP_CARD_VARIANT: TripCardVariant = 'collage'
export type TripCardVariant = '50-50' | 'overlay' | 'inverse' | 'timeline' | 'collage'

export const TRIP_CARD_VARIANTS: { id: TripCardVariant; label: string }[] = [
  { id: '50-50', label: '50-50' },
  { id: 'overlay', label: 'Overlay' },
  { id: 'inverse', label: 'Inverse' },
  { id: 'timeline', label: 'Tijdlijn' },
  { id: 'collage', label: 'Collage' },
]

const STORAGE_KEY = 'vl_mht_trip_card_variant'

export function useMultiHotelTripCardVariant() {
  const variant = useState<TripCardVariant>('mht-trip-card-variant', () => DEFAULT_TRIP_CARD_VARIANT)

  // Na hydratie de bewaarde keuze terugzetten (alleen in een component-setup);
  // uitgeschakeld zolang de variant vaststaat.
  if (VARIANT_SWITCHER_ENABLED && import.meta.client && getCurrentInstance()) {
    onMounted(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved === '50-50' || saved === 'overlay' || saved === 'inverse' || saved === 'timeline' || saved === 'collage') variant.value = saved
      } catch { /* localStorage niet beschikbaar */ }
    })
  }

  function setVariant(v: TripCardVariant) {
    variant.value = v
    if (import.meta.client) {
      try { localStorage.setItem(STORAGE_KEY, v) } catch { /* noop */ }
    }
  }

  return { variant, setVariant }
}
