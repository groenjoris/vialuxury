/**
 * Approximate centroid coordinates for the cities referenced by hotels in
 * `deals.json`. Used to place hotel pins on `/kaart` when the package data
 * doesn't ship with explicit lat/lng. A small deterministic jitter is added
 * per-hotel so multiple hotels in the same city don't sit on top of each other.
 */
export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'Amsterdam':       { lat: 52.3676, lng: 4.9041 },
  'Beetsterzwaag':   { lat: 53.0586, lng: 6.0856 },
  'Burgh-Haamstede': { lat: 51.7058, lng: 3.7494 },
  'Delden':          { lat: 52.2625, lng: 6.7100 },
  'Den Haag':        { lat: 52.0705, lng: 4.3007 },
  'Doetinchem':      { lat: 51.9651, lng: 6.2880 },
  'Eijsden':         { lat: 50.7783, lng: 5.7128 },
  'Eindhoven':       { lat: 51.4416, lng: 5.4697 },
  'Enschede':        { lat: 52.2215, lng: 6.8937 },
  'Hilvarenbeek':    { lat: 51.4878, lng: 5.1431 },
  'Hoofddorp':       { lat: 52.3025, lng: 4.6889 },
  'Hulshorst':       { lat: 52.3500, lng: 5.7333 },
  'Landgraaf':       { lat: 50.9133, lng: 6.0294 },
  'Leersum':         { lat: 52.0094, lng: 5.4256 },
  'Nieuwkuijk':      { lat: 51.6936, lng: 5.1825 },
  'Niftrik':         { lat: 51.8278, lng: 5.6797 },
  'Nijmegen':        { lat: 51.8126, lng: 5.8372 },
  'Odoorn':          { lat: 52.8506, lng: 6.8506 },
  'Ommen':           { lat: 52.5167, lng: 6.4167 },
  'Ootmarsum':       { lat: 52.4111, lng: 6.8989 },
  'Parijs':          { lat: 48.8566, lng: 2.3522 },
  'Raalte':          { lat: 52.3833, lng: 6.2667 },
  'Scheveningen':    { lat: 52.1078, lng: 4.2731 },
  'Sittard':         { lat: 50.9994, lng: 5.8689 },
  'Utrecht':         { lat: 52.0907, lng: 5.1214 },
}

/**
 * Approximate geographic centroids for the destination-popup IDs. Used by
 * `/kaart` to auto-zoom when a province / region is picked.
 *  - NL provinces use zoom 9 (a province roughly fills the viewport).
 *  - BE regions are broader, zoom 8.
 */
export const PROVINCE_COORDS: Record<string, { lat: number; lng: number; zoom: number }> = {
  'noord-holland':  { lat: 52.55, lng: 4.85, zoom: 9 },
  'zuid-holland':   { lat: 52.00, lng: 4.50, zoom: 9 },
  'zeeland':        { lat: 51.50, lng: 3.80, zoom: 9 },
  'brabant':        { lat: 51.55, lng: 5.20, zoom: 9 },
  'limburg':        { lat: 51.20, lng: 5.95, zoom: 9 },
  'gelderland':     { lat: 52.05, lng: 5.95, zoom: 9 },
  'drenthe':        { lat: 52.85, lng: 6.65, zoom: 9 },
  'friesland':      { lat: 53.10, lng: 5.80, zoom: 9 },
  'overijssel':     { lat: 52.45, lng: 6.45, zoom: 9 },
  'flevoland':      { lat: 52.55, lng: 5.50, zoom: 9 },
  'utrecht':        { lat: 52.10, lng: 5.20, zoom: 9 },
  'groningen':      { lat: 53.20, lng: 6.65, zoom: 9 },
  'ardennen':       { lat: 50.20, lng: 5.40, zoom: 8 },
  'vlaanderen':     { lat: 51.05, lng: 4.40, zoom: 8 },
  'belgische-kust': { lat: 51.20, lng: 3.00, zoom: 9 },
  'wallonie':       { lat: 50.40, lng: 4.80, zoom: 8 },
}

/** Deterministic small offset (≈ ±400 m) so hotels in the same city don't
 *  stack exactly on each other. Hash from a string seed (typically slug). */
export function jitterCoordinates(
  base: { lat: number; lng: number },
  seed: string,
): { lat: number; lng: number } {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  // Two independent pseudo-random values in (-1, 1).
  const r1 = ((h >>> 0) / 4294967296) * 2 - 1
  const r2 = (((h >>> 13) ^ (h << 19)) >>> 0) / 4294967296 * 2 - 1
  // ~0.004° ≈ 400 m at NL latitudes; tweak per visual preference.
  return {
    lat: base.lat + r1 * 0.004,
    lng: base.lng + r2 * 0.006,
  }
}
