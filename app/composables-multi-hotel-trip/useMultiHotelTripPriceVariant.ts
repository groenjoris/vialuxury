/**
 * Multi Hotel Trip — prijsweergave van de vakanties (multi-hotel deals), om aan
 * de opdrachtgever te tonen. Schakelaar "PRIJS: TOTAAL | PP" (DemoSwitches `price`)
 * linksboven onder het logo op elke pagina met vakantieprijzen: homepage, zoekpagina's,
 * kaart (in de filterkolom), vakantie-PDP en de checkout t/m de gegevensstap.
 *  - 'total' : totaalprijs voor 2 personen
 *  - 'pp'    : prijs per persoon (standaard) — ALLEEN bij vakanties: de prijs (en de
 *              van-prijs) gehalveerd, erboven "per persoon voor x nachten
 *              (min. 2 pers.)"; ook in de kalenders (PDP + checkout-datumstap),
 *              in de plakkende prijsbalk van de PDP, op de kaartkaartjes (hover en
 *              mobiel) en in de room table. Gewone hotelarrangementen veranderen
 *              niet. In de checkout blijft de kassabon na de kamerkeuze de
 *              totaalprijs tonen; de post-bookingschermen en mails ook.
 * Keuze wordt in localStorage bewaard zodat hij tussen pagina's blijft staan.
 */
export type PriceVariant = 'total' | 'pp'

// v2: nieuwe standaard (prijs p.p.) — oude bewaarde keuzes tellen niet meer mee.
const STORAGE_KEY = 'vl_mht_price_variant_v2'
/** De prijs per persoon gaat uit van 2 personen (minimum). */
export const PRICE_PP_PERSONS = 2

export function useMultiHotelTripPriceVariant() {
  const variant = useState<PriceVariant>('mht-price-variant', () => 'pp')

  // Na hydratie de bewaarde keuze terugzetten (alleen in een component-setup).
  if (import.meta.client && getCurrentInstance()) {
    onMounted(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved === 'total' || saved === 'pp') variant.value = saved
      } catch { /* localStorage niet beschikbaar */ }
    })
  }

  function setVariant(v: PriceVariant) {
    variant.value = v
    if (import.meta.client) {
      try { localStorage.setItem(STORAGE_KEY, v) } catch { /* noop */ }
    }
  }

  /** Per-persoon-weergave actief. */
  const perPerson = computed(() => variant.value === 'pp')

  /** Toonprijs: bij een vakantie in de per-persoon-variant de helft van de totaalprijs (voor 2). */
  function displayPrice(total: number, isTrip: boolean): number {
    return isTrip && perPerson.value ? Math.round(total / PRICE_PP_PERSONS) : total
  }

  return { variant, perPerson, setVariant, displayPrice }
}
