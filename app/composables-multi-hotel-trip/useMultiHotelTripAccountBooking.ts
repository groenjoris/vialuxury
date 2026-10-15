/**
 * Multi Hotel Trip — de boeking in "Mijn ViaLuxury" (prototype). Eén actieve vakantieboeking:
 * de reis uit de gedeelde checkout-state (gezet door "Boek nu", de flow of het startscherm),
 * anders de Opaalkust-demo. Datums per reis vast (demo), prijs als op de bevestigingspagina.
 */
import { tripCheckoutBySlug } from '~/data/mht-checkout/trip'
import { tripPdpBySlug } from '~/data/mht-trip-pdp'
import { pricing } from '~/data/mht-checkout/deal'
import { CHECKOUT_BOOKING_FEE } from '~/data/mht-checkout/pricing'
import { useMultiHotelTripCheckoutTrip } from '~/composables-multi-hotel-trip/useMultiHotelTripCheckoutTrip'
import { hotelAddress, hotelPhone, hotelMapsHref } from '~/utils-multi-hotel-trip/hotelContact'
import { bookingRefFor } from '~/utils-multi-hotel-trip/bookingRef'
export { bookingRefFor }

export const ACCOUNT_DEMO_SLUG = 'ontdek-noord-frankrijk-en-de-opaalkust-in-7-dagen'
/** Demo-aankomstdatum per reis (maand 0-based). */
const DEMO_DATES: Record<string, { year: number; month: number; day: number }> = {
  'ontdek-noord-frankrijk-en-de-opaalkust-in-7-dagen': { year: 2027, month: 4, day: 18 },
  'fietsvakantie-twente-en-salland-delden-raalte-markelo': { year: 2027, month: 5, day: 7 },
}
const WEEKDAYS = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']
const WEEKDAYS_LONG = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag']
const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
const MONTHS_LONG = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']
export const fmtShort = (d: Date) => `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
export const fmtLong = (d: Date) => `${WEEKDAYS_LONG[d.getDay()]} ${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`
export const fmtLongNoYear = (d: Date) => `${WEEKDAYS_LONG[d.getDay()]} ${d.getDate()} ${MONTHS_LONG[d.getMonth()]}`

export function money(v: number) {
  return `€${v.toLocaleString('nl-NL', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 })}`
}

export function useMultiHotelTripAccountBooking(slugOverride?: string) {
  const { trip: checkoutTrip, day: checkoutDay } = useMultiHotelTripCheckoutTrip()
  const slug = computed(() => slugOverride ?? checkoutTrip.value?.slug ?? ACCOUNT_DEMO_SLUG)
  const checkout = computed(() => tripCheckoutBySlug(slug.value) ?? tripCheckoutBySlug(ACCOUNT_DEMO_SLUG)!)
  const tripPdp = computed(() => tripPdpBySlug(checkout.value.slug))
  const trip = computed(() => tripPdp.value?.trip ?? null)
  const isBike = computed(() => trip.value?.type === 'fiets')

  /* Datums: uit de checkout-state als die bij deze reis hoort, anders de demo-datum van de reis. */
  const checkInYmd = computed(() => (checkoutTrip.value?.slug === checkout.value.slug && checkoutDay.value?.checkInYmd) || DEMO_DATES[checkout.value.slug] || DEMO_DATES[ACCOUNT_DEMO_SLUG]!)
  const dateAt = (offset: number) => { const y = checkInYmd.value; return new Date(y.year, y.month, y.day + offset) }
  const nights = computed(() => checkout.value.nights)
  const checkIn = computed(() => fmtShort(dateAt(0)))
  const checkOut = computed(() => fmtShort(dateAt(nights.value)))
  const dateRange = computed(() => `${checkIn.value} t/m ${checkOut.value} ${checkInYmd.value.year}`)
  const dateRangeLong = computed(() => `${fmtLong(dateAt(0))} t/m ${fmtLong(dateAt(nights.value))}`)
  const cancelDate = computed(() => fmtShort(dateAt(-30)))

  /* Prijs als op de bevestigingspagina: flexibel annuleren zit in het pakket. */
  interface SelRow { baseId: string; rateKey: 'nonrefundable' | 'flexible'; price: number; priceWas: number; quantity: number }
  const selection = useState<SelRow[]>('mht-checkout-selection', () => [])
  const row = computed<SelRow>(() => {
    const r = checkoutTrip.value?.slug === checkout.value.slug ? selection.value[0] : undefined
    const flex = pricing.flexibilityPerRoom * checkout.value.hotels.length
    if (r) return r.rateKey === 'flexible' ? r : { ...r, rateKey: 'flexible', price: r.price + flex, priceWas: r.priceWas + flex }
    return { baseId: 'trip', rateKey: 'flexible', price: checkout.value.price + flex, priceWas: checkout.value.priceWas + flex, quantity: 1 }
  })
  const persons = computed(() => row.value.quantity * 2)
  const roomsPerHotel = computed(() => row.value.quantity)
  const tripTotal = computed(() => row.value.price * row.value.quantity)
  const total = computed(() => tripTotal.value + CHECKOUT_BOOKING_FEE)

  /* Gast */
  const guest = useState<{ firstName: string; email: string } | null>('mht-checkout-guest', () => null)
  const firstName = computed(() => guest.value?.firstName || 'Rijo')
  const email = computed(() => guest.value?.email || 'rijo.verburg@gmail.com')

  /** Per hotel: datums, in-/uitchecktijd, alle inclusies en adres/telefoon (voor de detailpagina). */
  const stays = computed(() => {
    let offset = 0
    return checkout.value.hotels.map((h, i) => {
      const stop = trip.value?.stops[i]
      const from = dateAt(offset)
      const to = dateAt(offset + h.nights)
      offset += h.nights
      const includes = (stop?.includes ?? []).map(x => x.nl)
      const lateOut = includes.map(t => t.match(/check-?out[^0-9]*(\d{1,2})[:.](\d{2})/i)).find(Boolean)
      return {
        ...h,
        from: fmtShort(from),
        to: fmtShort(to),
        /** "dinsdag 18 mei t/m donderdag 20 mei" */
        dateLine: `${fmtLongNoYear(from)} t/m ${fmtLongNoYear(to)}`,
        region: stop?.region ?? '',
        checkInTime: stop?.checkIn ?? '15:00',
        checkOutTime: lateOut ? `${lateOut[1]}:${lateOut[2]}` : '11:00',
        includes,
        address: hotelAddress(h.name, h.city, stop?.region),
        phone: hotelPhone(i),
        mapsHref: hotelMapsHref(h.name, h.city),
      }
    })
  })

  const bookingRef = computed(() => bookingRefFor(checkout.value.slug))

  return { slug, checkout, trip, isBike, checkInYmd, nights, checkIn, checkOut, dateRange, dateRangeLong, cancelDate, persons, roomsPerHotel, tripTotal, total, bookingFee: CHECKOUT_BOOKING_FEE, firstName, email, stays, bookingRef }
}
