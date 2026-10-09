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

/** Woorden waarmee een bloktitel mag beginnen met een kleine letter midden in
 *  de zin ("Ontdek Béthune" → "ontdek Béthune"); eigennamen blijven staan. */
const LOWERCASE_STARTS = new Set(['aankomst', 'arrival', 'ankunft', 'ontdek', 'een', 'onderweg', 'wandelen', 'terug', 'avond', 'rondje', 'middag', 'ochtend', 'fietsen', 'dagje', 'bezoek', 'lunch', 'wandeling', 'kanoën', 'zwemmen', 'wijnproeverij', 'etappe', 'proef', 'langs', 'over', 'door', 'naar', 'de', 'het', 'discover', 'a', 'on', 'walk', 'back', 'evening', 'afternoon', 'morning', 'cycle', 'visit', 'along', 'through', 'the'])
function lowerFirst(s: string): string {
  const first = s.split(/[\s:]/)[0]?.toLowerCase() ?? ''
  return LOWERCASE_STARTS.has(first) ? s.charAt(0).toLowerCase() + s.slice(1) : s
}

/** Rijkere regel per dag, als lopende zin: "Aankomst in Hotel Royal Beaulaincourt,
 *  ontdek Béthune en 3-gangendiner" — inchecken, onderweg/activiteiten, diner,
 *  terugreis (geen ontbijt). `t` = vertaalfunctie van de pagina. */
export function summaryLineOfDay(day: TripDayView, t: (key: string) => string): string {
  if (day.summary) return day.summary
  const parts: string[] = []
  for (const b of day.blocks) {
    if (b.kind === 'checkin') parts.push(t('trip.itin.sum.arrival').replace('{hotel}', b.hotelName ?? b.title))
    else if (b.kind === 'dinner') parts.push(b.title.split(/\s+(bij|at|im|à)\s+/)[0] ?? b.title)
    else if (b.kind === 'checkout' || b.kind === 'activity' || b.kind === 'homeward') parts.push(b.title)
  }
  if (!parts.length) return summaryOfDay(day)
  const items = parts.map((p, i) => (i === 0 ? p : lowerFirst(p)))
  return items.length > 1 ? `${items.slice(0, -1).join(', ')}${t('trip.itin.sum.and')}${items[items.length - 1]}` : items[0]!
}

/** Lopende tekst van een dag voor het uitgebreide reisschema (sidepanel):
 *  de ondertitel gevolgd door de tekst van elk blok. */
export function textOfDay(day: TripDayView): string {
  // Met een eigen dagkop (content) staat de ondertitel al in de kop: alleen de bloktekst.
  return [day.heading ? undefined : day.subtitle, ...day.blocks.map(b => b.text)]
    .map(s => (s ?? '').trim())
    .filter(Boolean)
    .map(s => (/[.!?…]$/.test(s) ? s : `${s}.`))
    .join(' ')
}
