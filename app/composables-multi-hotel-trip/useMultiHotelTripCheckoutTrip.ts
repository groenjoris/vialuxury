import { tripCheckoutBySlug, type TripCheckout } from '~/data/mht-checkout/trip'

/** Gekozen aankomstdatum (kalenderstap of PDP): dagprijs, labels en de datum zelf. */
export interface CheckoutDay {
  price: number
  checkIn?: string
  checkOut?: string
  checkInYmd?: { year: number; month: number; day: number }
}

interface CheckoutCookie {
  isTrip: boolean
  slug: string | null
  day: CheckoutDay | null
}

/**
 * Multi Hotel Trip checkout — welke vakantie wordt geboekt (+ de gekozen datum).
 * De dealpagina zet bij "Ik ga boeken" de vlag, de slug en de datum; de
 * checkout-stappen (datum, kamers, gegevens — ook de mobiele site) lezen hier
 * het boekingsmodel (naam, hotels, kamers, prijs, includes). `null` = gewone
 * hotel-deal (TerWorm-demo).
 *
 * De state wordt gespiegeld in een cookie (`mht_checkout`, 24 uur), zodat de
 * checkout aan de vakantie gekoppeld blijft bij herladen, de terugknop of een
 * server-side omleiding naar de mobiele site — anders viel hij terug op het
 * standaardarrangement. useState initialiseert uit de cookie (ook server-side),
 * dus SSR en hydratie zien dezelfde vakantie.
 */
export function useMultiHotelTripCheckoutTrip() {
  const cookie = useCookie<CheckoutCookie | null>('mht_checkout', { sameSite: 'lax', maxAge: 60 * 60 * 24, default: () => null })
  const isTrip = useState<boolean>('mht-checkout-trip', () => cookie.value?.isTrip ?? false)
  const slug = useState<string | null>('mht-checkout-trip-slug', () => cookie.value?.slug ?? null)
  const day = useState<CheckoutDay | null>('mht-checkout-day', () => cookie.value?.day ?? null)
  // Elke wijziging (en de huidige stand) naar de cookie.
  watch([isTrip, slug, day], ([t, s, d]) => {
    const next: CheckoutCookie = { isTrip: t, slug: s, day: d }
    if (JSON.stringify(cookie.value) !== JSON.stringify(next)) cookie.value = next
  }, { immediate: true, deep: true })
  const trip = computed<TripCheckout | null>(() => (isTrip.value && slug.value ? tripCheckoutBySlug(slug.value) : null))
  return { isTrip, slug, day, trip }
}
