/**
 * Multi Hotel Trip — weergavevarianten van de vakantie-PDP, om aan de
 * opdrachtgever te tonen (schakelaar in de breadcrumb-rij):
 *  - highlights: de horizontale USP-balk onder de gallery + de kop boven de
 *    beschrijving tonen (aan) of weglaten (uit; extra witruimte onder de gallery)
 *  - includes: 'small' = compacte rijen (thumb 120 px), 'large' = zoals het
 *    reisschema (grote thumb, langere tekst)
 *  - tabs: inclusies en reisschema als twee tabs onder de beschrijving (één
 *    tegelijk zichtbaar) — combineerbaar met klein/groot
 * Keuzes worden in localStorage bewaard.
 */
export type TripIncludesVariant = 'small' | 'large'

export const TRIP_INCLUDES_VARIANTS: { id: TripIncludesVariant; label: string }[] = [
  { id: 'small', label: 'Klein' },
  { id: 'large', label: 'Groot' },
]

const KEY_HIGHLIGHTS = 'vl_mht_pdp_highlights'
const KEY_INCLUDES = 'vl_mht_pdp_includes'
const KEY_TABS = 'vl_mht_pdp_tabs'

export function useMultiHotelTripPdpVariant() {
  const highlights = useState<boolean>('mht-pdp-highlights', () => true)
  const includes = useState<TripIncludesVariant>('mht-pdp-includes', () => 'small')
  const tabs = useState<boolean>('mht-pdp-tabs', () => false)

  if (import.meta.client && getCurrentInstance()) {
    onMounted(() => {
      try {
        const h = localStorage.getItem(KEY_HIGHLIGHTS)
        if (h === '0' || h === '1') highlights.value = h === '1'
        const i = localStorage.getItem(KEY_INCLUDES)
        if (i === 'small' || i === 'large') includes.value = i
        // Oude waarde 'tabs' (vóór de splitsing) → tabs aan, klein.
        if (i === 'tabs') { includes.value = 'small'; tabs.value = true }
        const t = localStorage.getItem(KEY_TABS)
        if (t === '0' || t === '1') tabs.value = t === '1'
      } catch { /* localStorage niet beschikbaar */ }
    })
  }

  const save = (key: string, value: string) => { if (import.meta.client) { try { localStorage.setItem(key, value) } catch { /* noop */ } } }
  function setHighlights(on: boolean) { highlights.value = on; save(KEY_HIGHLIGHTS, on ? '1' : '0') }
  function setIncludes(v: TripIncludesVariant) { includes.value = v; save(KEY_INCLUDES, v) }
  function setTabs(on: boolean) { tabs.value = on; save(KEY_TABS, on ? '1' : '0') }

  return { highlights, includes, tabs, setHighlights, setIncludes, setTabs }
}
