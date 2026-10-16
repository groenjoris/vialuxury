/**
 * Multi Hotel Trip — slogan (herotitel) van de Vakanties-zoekpagina (/multi-hotel-trip/vakanties),
 * om aan de opdrachtgever te tonen (dropdown in het schakelaarpaneel linksboven). Elke slogan heeft een
 * vetgedrukt slotdeel, zoals "Experience more" op de homepage. Keuze wordt in localStorage
 * bewaard zodat hij tussen pagina's blijft staan.
 */
export type TripSloganId = 'adventure' | 'moois' | 'hoek' | 'experience' | 'vliegtuig' | 'geluk' | 'eigenland' | 'nederland' | 'wow' | 'streken' | 'provincie'

/** `short`: de kern van de slogan (max. drie woorden) voor de dropdown in het schakelaarpaneel. */
export const TRIP_SLOGANS: { id: TripSloganId; title: string; em: string; short: string }[] = [
  { id: 'moois', title: 'Nog zoveel moois te', em: 'ontdekken', short: 'Zoveel moois' },
  { id: 'adventure', title: 'Adventure', em: 'more', short: 'Adventure more' },
  { id: 'hoek', title: 'Het avontuur is om de', em: 'hoek', short: 'Om de hoek' },
  { id: 'experience', title: 'Experience', em: 'more adventures', short: 'More adventures' },
  { id: 'vliegtuig', title: 'Laat het vliegtuig', em: 'staan', short: 'Laat het vliegtuig' },
  { id: 'geluk', title: 'Het geluk is om de', em: 'hoek', short: 'Het geluk' },
  { id: 'eigenland', title: 'Op avontuur in', em: 'eigen land', short: 'Eigen land' },
  { id: 'nederland', title: 'Nederland oh', em: 'Nederland', short: 'Nederland oh' },
  { id: 'wow', title: 'Van wow naar', em: 'wow', short: 'Wow naar wow' },
  { id: 'streken', title: 'De mooiste streken, de', em: 'mooiste hotels', short: 'Mooiste streken' },
  { id: 'provincie', title: 'De provincie die je nog moet', em: 'ontdekken', short: 'De provincie' },
]

// v2: sinds "Nog zoveel moois te ontdekken" de standaard is (oude keuzes vervallen).
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
