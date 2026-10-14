/**
 * Multi Hotel Trip — slogan (herotitel) van de Vakanties-zoekpagina (/multi-hotel-trip/vakanties),
 * om aan de opdrachtgever te tonen (schakelaarpaneel linksboven). Elke slogan heeft een
 * vetgedrukt slotdeel, zoals "Experience more" op de homepage. Keuze wordt in localStorage
 * bewaard zodat hij tussen pagina's blijft staan.
 */
export type TripSloganId = 'adventure' | 'moois' | 'hoek' | 'experience' | 'auto'

export const TRIP_SLOGANS: { id: TripSloganId; title: string; em: string }[] = [
  { id: 'adventure', title: 'Adventure', em: 'more' },
  { id: 'moois', title: 'Nog zoveel moois te', em: 'ontdekken' },
  { id: 'hoek', title: 'Het avontuur is om de', em: 'hoek' },
  { id: 'experience', title: 'Experience', em: 'more adventures' },
  { id: 'auto', title: 'Haal meer uit je', em: 'auto' },
]

const STORAGE_KEY = 'vl_mht_trip_slogan'
const isId = (v: unknown): v is TripSloganId => TRIP_SLOGANS.some(s => s.id === v)

export function useMultiHotelTripTripSlogan() {
  const sloganId = useState<TripSloganId>('mht-trip-slogan', () => 'adventure')

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
