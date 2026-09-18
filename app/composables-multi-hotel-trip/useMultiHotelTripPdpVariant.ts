/**
 * Multi Hotel Trip — weergavevarianten van de vakantie-PDP, om aan de
 * opdrachtgever te tonen (schakelaar in de breadcrumb-rij):
 *  - highlights: de horizontale USP-balk onder de gallery + de kop boven de
 *    beschrijving tonen (aan) of weglaten (uit; de content sluit naar boven aan)
 *  - includes: 'small'  = compacte rijen (thumb 120 px)
 *              'large'  = zoals het reisschema (grote thumb, langere tekst)
 *              'tabs'   = twee tabs onder de beschrijving: inclusies | reisschema
 * Keuzes worden in localStorage bewaard.
 */
export type TripIncludesVariant = 'small' | 'large' | 'tabs'

export const TRIP_INCLUDES_VARIANTS: { id: TripIncludesVariant; label: string }[] = [
  { id: 'small', label: 'Klein' },
  { id: 'large', label: 'Groot' },
  { id: 'tabs', label: 'Tabs' },
]

const KEY_HIGHLIGHTS = 'vl_mht_pdp_highlights'
const KEY_INCLUDES = 'vl_mht_pdp_includes'

export function useMultiHotelTripPdpVariant() {
  const highlights = useState<boolean>('mht-pdp-highlights', () => true)
  const includes = useState<TripIncludesVariant>('mht-pdp-includes', () => 'small')

  if (import.meta.client && getCurrentInstance()) {
    onMounted(() => {
      try {
        const h = localStorage.getItem(KEY_HIGHLIGHTS)
        if (h === '0' || h === '1') highlights.value = h === '1'
        const i = localStorage.getItem(KEY_INCLUDES)
        if (i === 'small' || i === 'large' || i === 'tabs') includes.value = i
      } catch { /* localStorage niet beschikbaar */ }
    })
  }

  function setHighlights(on: boolean) {
    highlights.value = on
    if (import.meta.client) { try { localStorage.setItem(KEY_HIGHLIGHTS, on ? '1' : '0') } catch { /* noop */ } }
  }
  function setIncludes(v: TripIncludesVariant) {
    includes.value = v
    if (import.meta.client) { try { localStorage.setItem(KEY_INCLUDES, v) } catch { /* noop */ } }
  }

  return { highlights, includes, setHighlights, setIncludes }
}
