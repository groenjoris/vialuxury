/**
 * Multi Hotel Trip — slogan (herotitel) van de Vakanties-zoekpagina (/multi-hotel-trip/vakanties),
 * om aan de opdrachtgever te tonen (dropdown in het schakelaarpaneel linksboven). Elke slogan heeft een
 * vetgedrukt slotdeel, zoals "Experience more" op de homepage. Keuze wordt in localStorage
 * bewaard zodat hij tussen pagina's blijft staan.
 */
export type TripSloganId = 'adventure' | 'moois' | 'hoek' | 'experience' | 'auto'

/** `short`: de kern van de slogan (max. drie woorden) voor de dropdown in het schakelaarpaneel. */
export const TRIP_SLOGANS: { id: TripSloganId; title: string; em: string; short: string }[] = [
  { id: 'moois', title: 'Er is nog zoveel moois te', em: 'ontdekken', short: 'Zoveel moois' },
  { id: 'adventure', title: 'Adventure', em: 'more', short: 'Adventure more' },
  { id: 'hoek', title: 'Het avontuur is om de', em: 'hoek', short: 'Om de hoek' },
  { id: 'experience', title: 'Experience', em: 'more adventures', short: 'More adventures' },
  { id: 'auto', title: 'Haal meer uit je', em: 'auto', short: 'Meer uit auto' },
]

// v2: sinds "Er is nog zoveel moois te ontdekken" de standaard is (oude keuzes vervallen).
const STORAGE_KEY = 'vl_mht_trip_slogan_v2'
const isId = (v: unknown): v is TripSloganId => TRIP_SLOGANS.some(s => s.id === v)

export function useMultiHotelTripTripSlogan() {
  const sloganId = useState<TripSloganId>('mht-trip-slogan', () => 'moois')

  // Na hydratie de bewaarde keuze terugzetten (alleen in een component-setup).
  if (import.meta.client && getCurrentInstance()) {
    onMounted(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (isId(saved)) sloganId.value = saved
      } catch { /* localStorage niet beschikbaar */ }
    })
  }

  function setSlogan(id: TripSloganId) {
    sloganId.value = id
    if (import.meta.client) {
      try { localStorage.setItem(STORAGE_KEY, id) } catch { /* noop */ }
    }
  }

  const slogan = computed(() => TRIP_SLOGANS.find(s => s.id === sloganId.value) ?? TRIP_SLOGANS[0]!)

  return { sloganId, slogan, setSlogan }
}
