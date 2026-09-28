import type { TripDayView } from '~/components-multi-hotel-trip/deal/TripItinerary.vue'

/**
 * Multi Hotel Trip — één regel per dag voor de dagsamenvatting van het
 * voorbeeld-reisschema: het belangrijkste onderdeel van de dag (onderweg/
 * etappe, terugreis of de eerste activiteit; anders het hotel).
 * Gedeeld door TripItinerary (Summary), TripItinerarySummary en het sidepanel.
 */
export function summaryOfDay(day: TripDayView): string {
  const main = day.blocks.find(b => b.kind === 'checkout' || b.kind === 'homeward')
    ?? day.blocks.find(b => b.kind === 'activity')
    ?? day.blocks.find(b => b.kind === 'checkin')
  return main?.title ?? day.subtitle ?? ''
}

/** Lopende tekst van een dag voor het uitgebreide reisschema (sidepanel):
 *  de ondertitel gevolgd door de tekst van elk blok. */
export function textOfDay(day: TripDayView): string {
  return [day.subtitle, ...day.blocks.map(b => b.text)]
    .map(s => (s ?? '').trim())
    .filter(Boolean)
    .map(s => (/[.!?…]$/.test(s) ? s : `${s}.`))
    .join(' ')
}
