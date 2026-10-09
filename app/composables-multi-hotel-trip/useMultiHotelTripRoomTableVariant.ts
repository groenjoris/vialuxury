/**
 * Multi Hotel Trip — variant van de room table bij een vakantie (checkout,
 * stap "Kies je opties"), om aan de opdrachtgever te tonen (zwevende
 * schakelaar linksboven op die stap):
 *  - 'tight'    : "Strak" — hotelnavigator + carrousel, één hotel per keer (huidig)
 *  - 'column'   : "Lange kolom" — geen navigator; de drie hotels onder elkaar,
 *                 gescheiden door een divider met zijmarges (blijft één kolom).
 *                 Het tweede hotel breekt halverwege de beschrijving af (fade)
 *                 met "Toon meer"; het derde hotel volgt na "Toon meer".
 *  - 'carousel' : "Carousel" — als Strak, maar 10% van het volgende hotel is al
 *                 zichtbaar in de kolom (horizontaal swipegevoel).
 * Keuze wordt in localStorage bewaard.
 */
export type RoomTableVariant = 'tight' | 'column' | 'carousel'

export const ROOM_TABLE_VARIANTS: { id: RoomTableVariant; label: string }[] = [
  { id: 'tight', label: 'Strak' },
  { id: 'column', label: 'Lange kolom' },
  { id: 'carousel', label: 'Carousel' },
]

const STORAGE_KEY = 'vl_mht_roomtable_variant'

export function useMultiHotelTripRoomTableVariant() {
  const variant = useState<RoomTableVariant>('mht-roomtable-variant', () => 'tight')

  // Na hydratie de bewaarde keuze terugzetten (alleen in een component-setup).
  if (import.meta.client && getCurrentInstance()) {
    onMounted(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved === 'tight' || saved === 'column' || saved === 'carousel') variant.value = saved
      } catch { /* localStorage niet beschikbaar */ }
    })
  }

  function setVariant(v: RoomTableVariant) {
    variant.value = v
    if (import.meta.client) {
      try { localStorage.setItem(STORAGE_KEY, v) } catch { /* noop */ }
    }
  }

  return { variant, setVariant }
}
