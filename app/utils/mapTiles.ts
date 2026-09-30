import type * as Leaflet from 'leaflet'

/**
 * Basiskaart-tegels voor de Leaflet-kaarten (zoekresultaten "Toon op kaart").
 *
 * CARTO levert sinds september 2026 alleen nog echte tegels mét API-key;
 * zonder key komt er een "API KEY REQUIRED"-watermerk terug. Een gratis key
 * (5 mln. verzoeken/maand niet-commercieel) vraag je aan op
 * https://carto.com/basemaps/api-key en zet je in `.env` als
 * `NUXT_PUBLIC_CARTO_API_KEY=…` (zie .env.example; dev-server herstarten).
 *
 *  - met key   → CARTO Voyager (frisse, rustige stijl; retina via {r})
 *  - zonder key → standaard OpenStreetMap-tegels, zodat de kaart altijd werkt
 */
export const CARTO_VOYAGER_URL = 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key={key}'
export const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

export function addBasemapTiles(L: typeof Leaflet, map: Leaflet.Map, cartoApiKey?: string): Leaflet.TileLayer {
  const key = (cartoApiKey ?? '').trim()
  const layer = key
    ? L.tileLayer(CARTO_VOYAGER_URL, {
        attribution: '© OpenStreetMap contributors © CARTO',
        maxZoom: 19,
        // Leaflet vult {key} niet zelf in: extra sjabloonwaarden gaan via de opties.
        key,
      } as Leaflet.TileLayerOptions)
    : L.tileLayer(OSM_TILE_URL, {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      })
  layer.addTo(map)
  return layer
}
