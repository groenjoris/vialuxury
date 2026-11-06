/**
 * Multi Hotel Trip — demo-boeking voor de post-bookingflow (prototype). De flowpagina linkt met
 * gewone links naar de pagina's met `?demo=auto|fiets` (en `&load=1` voor de preloader van de
 * bevestigingspagina); de pagina zet bij het laden zelf de boeking klaar in de gedeelde
 * checkout-state. Zo zijn de klikken licht (geen zware client-side routewissel), blijft de
 * variant bij een refresh staan en is elke variant een deelbare URL.
 */
import { tripCheckoutBySlug } from '~/data/mht-checkout/trip'
import { pricing } from '~/data/mht-checkout/deal'
import { useMultiHotelTripCheckoutTrip } from '~/composables-multi-hotel-trip/useMultiHotelTripCheckoutTrip'

export type DemoVariant = 'auto' | 'fiets'
/** Annuleringskeuze van de demo-boeking: flexibel annuleren (standaard) of niet terugbetaalbaar. */
export type DemoRate = 'flex' | 'nonflex'

export const DEMO_BOOKINGS: Record<DemoVariant, { slug: string; checkIn: string; checkOut: string; checkInYmd: { year: number; month: number; day: number } }> = {
  auto: { slug: 'ontdek-noord-frankrijk-en-de-opaalkust-in-7-dagen', checkIn: 'di 18 mei', checkOut: 'ma 24 mei', checkInYmd: { year: 2027, month: 4, day: 18 } },
  fiets: { slug: 'fietsvakantie-twente-en-salland-delden-raalte-markelo', checkIn: 'ma 7 jun', checkOut: 'zo 13 jun', checkInYmd: { year: 2027, month: 5, day: 7 } },
}

export const isDemoVariant = (v: unknown): v is DemoVariant => v === 'auto' || v === 'fiets'
export const isDemoRate = (v: unknown): v is DemoRate => v === 'flex' || v === 'nonflex'

/** Query van de prototype-schakelaars: `demo` (auto|fiets) en `rate` (alleen bij non-flex). */
export function demoQuery(variant: DemoVariant, rate: DemoRate = 'flex'): Record<string, string> {
  const q: Record<string, string> = { demo: variant }
  if (rate === 'nonflex') q.rate = 'nonflex'
  return q
}

/** Link naar een pagina van de flow met de demo-variant (en annuleringskeuze) in de URL. */
export function demoHref(path: string, variant: DemoVariant, opts: { preload?: boolean; rate?: DemoRate } = {}) {
  const q = new URLSearchParams(demoQuery(variant, opts.rate))
  if (opts.preload) q.set('load', '1')
  return `${path}?${q.toString()}`
}

/** Volledige navigatie ná de eerstvolgende paint. Een gewone link laat de oude pagina staan tot de
 *  server de nieuwe heeft gestuurd (op Vercel ~0,5 s) en Chrome rekent die wachttijd aan de klik toe
 *  (INP "600 ms" op de prototype-linkjes). Eerst een frame tekenen en dan pas navigeren maakt de
 *  klik direct klaar. Alleen bij een gewone linkerklik; met ctrl/cmd/shift (nieuw tabblad) doet de
 *  browser zijn eigen ding. */
export function navigateAfterPaint(href: string, e?: MouseEvent) {
  if (!import.meta.client) return
  if (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
  }
  requestAnimationFrame(() => requestAnimationFrame(() => window.location.assign(href)))
}

/** Boeking klaarzetten: reis, datums, kamerkeuze (flexibel annuleren of niet terugbetaalbaar), gast en (optioneel) de preloader-vlag. */
export function seedDemoBooking(variant: DemoVariant, opts: { preload?: boolean; rate?: DemoRate } = {}) {
  const demo = DEMO_BOOKINGS[variant]
  const checkout = tripCheckoutBySlug(demo.slug)
  const { isTrip, slug, day } = useMultiHotelTripCheckoutTrip()
  isTrip.value = true
  slug.value = demo.slug
  day.value = { price: checkout?.price ?? 0, checkIn: demo.checkIn, checkOut: demo.checkOut, checkInYmd: demo.checkInYmd }
  const flex = opts.rate === 'nonflex' ? 0 : pricing.flexibilityPerRoom * (checkout?.hotels.length ?? 3)
  useState<{ baseId: string; rateKey: 'nonrefundable' | 'flexible'; price: number; priceWas: number; quantity: number }[]>('mht-checkout-selection', () => []).value =
    [{ baseId: 'trip', rateKey: opts.rate === 'nonflex' ? 'nonrefundable' : 'flexible', price: (checkout?.price ?? 0) + flex, priceWas: (checkout?.priceWas ?? 0) + flex, quantity: 1 }]
  useState<{ firstName: string; email: string } | null>('mht-checkout-guest', () => null).value = { firstName: 'Rijo', email: 'rijo.verburg@gmail.com' }
  if (opts.preload) useState<boolean>('mht-checkout-confirm-load', () => false).value = true
}

/** Aanroepen bovenaan de setup van een flow-pagina: leest `?demo=` (met `&rate=` en `&load=1`) en zet de boeking klaar. */
export function useDemoBookingFromQuery() {
  const route = useRoute()
  const v = route.query.demo
  if (isDemoVariant(v)) seedDemoBooking(v, { preload: route.query.load === '1', rate: isDemoRate(route.query.rate) ? route.query.rate : 'flex' })
}

/** Stand van de prototype-schakelaars (DemoSwitches) op een pagina: uit de URL; zonder `?demo=` de
 *  reis van de pagina zelf, zonder `?rate=` flexibel annuleren. */
export function useDemoSwitches(fallbackVariant: () => DemoVariant = () => 'auto') {
  const route = useRoute()
  const variant = computed<DemoVariant>(() => isDemoVariant(route.query.demo) ? route.query.demo : fallbackVariant())
  const rate = computed<DemoRate>(() => isDemoRate(route.query.rate) ? route.query.rate : 'flex')
  return { variant, rate }
}
