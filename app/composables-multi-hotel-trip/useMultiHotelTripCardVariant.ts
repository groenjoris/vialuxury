/**
 * Multi Hotel Trip — dealcard-variant voor de vakanties, om aan de opdrachtgever
 * te tonen (schakelaar onder het logo op de Vakanties-zoekpagina):
 *  - '50-50'   : foto links, schematisch routekaartje rechts (huidige variant)
 *  - 'overlay' : foto over de volle breedte, het kaartje semi-transparant
 *                als overlay erover (route en iconen blijven dekkend)
 * Keuze wordt in localStorage bewaard zodat hij tussen pagina's blijft staan.
 */
export type TripCardVariant = '50-50' | 'overlay'

export const TRIP_CARD_VARIANTS: { id: TripCardVariant; label: string }[] = [
  { id: '50-50', label: '50-50' },
  { id: 'overlay', label: 'Overlay' },
]

const STORAGE_KEY = 'vl_mht_trip_card_variant'

export function useMultiHotelTripCardVariant() {
  const variant = useState<TripCardVariant>('mht-trip-card-variant', () => '50-50')

  // Na hydratie de bewaarde keuze terugzetten (alleen in een component-setup).
  if (import.meta.client && getCurrentInstance()) {
    onMounted(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved === '50-50' || saved === 'overlay') variant.value = saved
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
