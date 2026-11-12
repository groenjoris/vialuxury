/** ViaLuxury Ordernummer van een vakantieboeking: vast per reis (demo; TODO echt nummer uit het boekingssysteem). */
export function bookingRefFor(slug: string): string {
  let h = 0
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) % 100000
  return `VL-${String(27000 + h).slice(0, 2)} ${String(h).padStart(5, '0').slice(0, 3)} ${String(h * 7 % 1000).padStart(3, '0')}`
}

/** Hotelboekingsnummer (10 cijfers) per voorbeeldhotel: elk hotel heeft zijn eigen nummer (demo; zelfde
 *  nummers als in email-designs/lib/hotelBookingRefs.ts). */
export const HOTEL_BOOKING_REFS: Record<string, string> = {
  'Château Tilques': '4837201956',
  'Château Cléry': '7291048365',
  'Hotel Royal Beaulaincourt': '1568039274',
  'Hotel Wapen van Delden': '9024617385',
  'Hotel de Zwaan': '3376185920',
  'Landhuishotel Herikerberg': '6150932847',
}
export function hotelBookingRefFor(hotelName: string): string {
  return HOTEL_BOOKING_REFS[hotelName] ?? '0000000000'
}
