/**
 * Multi Hotel Trip — contactgegevens van de hotels van een vakantie (prototype-placeholders:
 * niet in de reisdata). Gebruikt op de tipspagina en in Mijn ViaLuxury.
 */
const ADDRESSES: Record<string, string> = {
  'Château Tilques': 'Rue du Château, 62500 Tilques',
  'Château Cléry': "Rue du Château, 62360 Hesdin-l'Abbé",
  'Hotel Royal Beaulaincourt': 'Rue de Beaulaincourt, 62400 Béthune',
}

export function hotelAddress(name: string, city: string, region?: string): string {
  return ADDRESSES[name] ?? (region ? `${city}, ${region}` : city)
}

/** Placeholder-telefoonnummer per hotel (index in de reis). */
export function hotelPhone(index: number): string {
  return `+33 3 21 12 34 5${index + 1}`
}

export function hotelMapsHref(name: string, city: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${city}`)}`
}
