/**
 * Multi Hotel Trip — demo-boeking voor de post-bookingflow (prototype). De flowpagina linkt met
 * gewone links naar de pagina's met `?demo=auto|fiets` (en `&load=1` voor de preloader van de
 * bevestigingspagina); de pagina zet bij het laden zelf de boeking klaar in de gedeelde
 * checkout-state. Zo zijn de klikken licht (geen zware client-side routewissel), blijft de
 * variant bij een refresh staan en is elke variant een deelbare URL.
 */
import { tripCheckoutBySlug } from '~/data/mvp-checkout/trip'
import { pricing } from '~/data/mvp-checkout/deal'
import { useMvpTripCheckoutTrip } from '~/composables-mvp-trip/useMvpTripCheckoutTrip'

export type DemoVariant = 'auto' | 'fiets'

export const DEMO_BOOKINGS: Record<DemoVariant, { slug: string; checkIn: string; checkOut: string; checkInYmd: { year: number; month: number; day: number } }> = {
  auto: { slug: 'ontdek-noord-frankrijk-en-de-opaalkust-in-7-dagen', checkIn: 'di 18 mei', checkOut: 'ma 24 mei', checkInYmd: { year: 2027, month: 4, day: 18 } },
  fiets: { slug: 'fietsvakantie-twente-en-salland-delden-raalte-markelo', checkIn: 'ma 7 jun', checkOut: 'zo 13 jun', checkInYmd: { year: 2027, month: 5, day: 7 } },
}

export const isDemoVariant = (v: unknown): v is DemoVariant => v === 'auto' || v === 'fiets'

/** Link naar een pagina van de flow met de demo-variant in de URL. */
export function demoHref(path: string, variant: DemoVariant, preload = false) {
  return `${path}?demo=${variant}${preload ? '&load=1' : ''}`
}

/** Boeking klaarzetten: reis, datums, kamerkeuze met flexibel annuleren, gast en (optioneel) de preloader-vlag. */
export function seedDemoBooking(variant: DemoVariant, opts: { preload?: boolean } = {}) {
  const demo = DEMO_BOOKINGS[variant]
  const checkout = tripCheckoutBySlug(demo.slug)
  const { isTrip, slug, day } = useMvpTripCheckoutTrip()
  isTrip.value = true
  slug.value = demo.slug
  day.value = { price: checkout?.price ?? 0, checkIn: demo.checkIn, checkOut: demo.checkOut, checkInYmd: demo.checkInYmd }
  const flex = pricing.flexibilityPerRoom * (checkout?.hotels.length ?? 3)
  useState<{ baseId: string; rateKey: 'nonrefundable' | 'flexible'; price: number; priceWas: number; quantity: number }[]>('mvp-checkout-selection', () => []).value =
    [{ baseId: 'trip', rateKey: 'flexible', price: (checkout?.price ?? 0) + flex, priceWas: (checkout?.priceWas ?? 0) + flex, quantity: 1 }]
  useState<{ firstName: string; email: string } | null>('mvp-checkout-guest', () => null).value = { firstName: 'Rijo', email: 'rijo.verburg@gmail.com' }
  if (opts.preload) useState<boolean>('mvp-checkout-confirm-load', () => false).value = true
}

/** Aanroepen bovenaan de setup van een flow-pagina: leest `?demo=` (en `&load=1`) en zet de boeking klaar. */
export function useDemoBookingFromQuery() {
  const route = useRoute()
  const v = route.query.demo
  if (isDemoVariant(v)) seedDemoBooking(v, { preload: route.query.load === '1' })
}
