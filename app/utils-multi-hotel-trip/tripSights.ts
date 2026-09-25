import type { TripBlockView, TripDayView } from '~/components-multi-hotel-trip/deal/TripItinerary.vue'

/**
 * Multi Hotel Trip — wat telt als "bezienswaardigheid" in het voorbeeld-
 * reisschema: de activiteitenblokken ("Ontdekken") én de onderweg-blokken van
 * een wisseldag die een eigen verhaal hebben ("Onderweg: per fluisterboot door
 * het Marais audomarois" met "Meer over …"). Gedeeld door de kerngetallen
 * (TripItineraryStats) en de uitjes-carrousel van de variant "Per stad".
 */
export function isTripSight(b: TripBlockView): boolean {
  return b.kind === 'activity' || (b.kind === 'checkout' && !!b.more)
}

export function countTripSights(days: TripDayView[]): number {
  return days.flatMap(d => d.blocks).filter(isTripSight).length
}
