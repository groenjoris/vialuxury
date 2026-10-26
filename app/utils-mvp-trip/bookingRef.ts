/** Boekingsnummer van een vakantieboeking: vast per reis (demo; TODO echt nummer uit het boekingssysteem). */
export function bookingRefFor(slug: string): string {
  let h = 0
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) % 100000
  return `VL-${String(27000 + h).slice(0, 2)} ${String(h).padStart(5, '0').slice(0, 3)} ${String(h * 7 % 1000).padStart(3, '0')}`
}
