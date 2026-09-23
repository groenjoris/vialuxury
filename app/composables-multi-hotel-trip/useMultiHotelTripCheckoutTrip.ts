import { tripCheckoutBySlug, type TripCheckout } from '~/data/mht-checkout/trip'

/**
 * Multi Hotel Trip checkout — welke vakantie wordt geboekt. De dealpagina zet
 * bij "Ik ga boeken" de vlag `mht-checkout-trip` en de slug; de checkout-
 * stappen (datum, kamers, gegevens) lezen hier het boekingsmodel (naam,
 * hotels, kamers, prijs, includes). `null` = gewone hotel-deal (TerWorm-demo).
 */
export function useMultiHotelTripCheckoutTrip() {
  const isTrip = useState<boolean>('mht-checkout-trip', () => false)
  const slug = useState<string | null>('mht-checkout-trip-slug', () => null)
  const trip = computed<TripCheckout | null>(() => (isTrip.value && slug.value ? tripCheckoutBySlug(slug.value) : null))
  return { isTrip, slug, trip }
}
