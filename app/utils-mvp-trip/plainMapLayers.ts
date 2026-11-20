/**
 * Multi Hotel Trip — de vlakke kaartondergrond voor de routekaart-pagina:
 * land, water, meren en provinciegrenzen uit `mvp-route-map-shapes.json`,
 * plus de provincies waar de route doorheen gaat.
 *
 * Staat los van `tripMapLayers.ts` (de route, de hotels en de highlights):
 * die versie komt van main, deze laag is hier aan toegevoegd.
 */
import type * as Leaflet from 'leaflet'
import shapes from '~/data/mvp-route-map-shapes.json'
import type { TripMapStop } from './tripMapLayers'

type L = typeof Leaflet

interface Shape { id: string; rings: number[][][] }
interface Shapes { countries?: Shape[]; provinces?: Shape[]; lakes?: Shape[]; borders?: Shape[] }
const SHAPES = shapes as unknown as Shapes

/** Een ring (lijst [lng, lat]) als Leaflet-punten. */
function ringToLatLngs(ring: number[][]): [number, number][] {
  return ring.map(([lng, lat]) => [lat!, lng!] as [number, number])
}

/** Kleuren van de vlakke kaart. Water en land zijn dezelfde tinten als het
 *  schematische kaartje op de dealcard (TripRouteMap), zodat de kaarten bij
 *  elkaar horen. */
export const PLAIN_COLORS = {
  water: '#d7e6f0',
  land: '#f3efe6',
  provinceLine: '#e0d9cc',
  border: '#6f665a',
  /** Vulkleur van de provincie(s) waar de route doorheen gaat. */
  highlight: '#5fc4b5',
}

/**
 * Vlakke ondergrond zonder kaartdetails: water, land, meren en dunne
 * provinciegrenzen, getekend uit `mvp-route-map-shapes.json`. Geen tegels,
 * dus geen wegen, plaatsnamen of terrein — alleen het silhouet, zodat de
 * route zelf het beeld bepaalt.
 *
 * Zet de achtergrond van de kaart-container op `PLAIN_COLORS.water`; dat is
 * het water buiten de landvlakken.
 */
export function addPlainBase(L: L, map: Leaflet.Map): void {
  for (const c of SHAPES.countries ?? []) {
    for (const ring of c.rings) {
      L.polygon(ringToLatLngs(ring), {
        fillColor: PLAIN_COLORS.land, fillOpacity: 1,
        color: PLAIN_COLORS.land, weight: 1, interactive: false,
      }).addTo(map)
    }
  }
  for (const lake of SHAPES.lakes ?? []) {
    for (const ring of lake.rings) {
      L.polygon(ringToLatLngs(ring), {
        fillColor: PLAIN_COLORS.water, fillOpacity: 1,
        color: PLAIN_COLORS.water, weight: 1, interactive: false,
      }).addTo(map)
    }
  }
  for (const prov of SHAPES.provinces ?? []) {
    for (const ring of prov.rings) {
      L.polyline(ringToLatLngs(ring), {
        color: PLAIN_COLORS.provinceLine, weight: 1, interactive: false,
      }).addTo(map)
    }
  }
}

/** Ray casting: ligt [lng, lat] binnen deze ring? */
function pointInRing(lng: number, lat: number, ring: number[][]): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i] as [number, number]
    const [xj, yj] = ring[j] as [number, number]
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

/**
 * De provincies waar de route doorheen gaat. We toetsen niet alleen de
 * hotels maar ook punten ónderweg: een etappe kan een provincie doorkruisen
 * zonder er te overnachten, en die hoort er net zo goed bij.
 *
 * Buiten Nederland levert dit niets op — de vormen in
 * `mvp-route-map-shapes.json` zijn alleen de twaalf Nederlandse provincies.
 */
export function provincesOnRoute(stops: TripMapStop[], samplesPerLeg = 24): string[] {
  const pts: [number, number][] = []
  stops.forEach((s, i) => {
    pts.push([s.lng, s.lat])
    const next = stops[i + 1]
    if (!next) return
    for (let k = 1; k < samplesPerLeg; k++) {
      const f = k / samplesPerLeg
      pts.push([s.lng + (next.lng - s.lng) * f, s.lat + (next.lat - s.lat) * f])
    }
  })
  const hit = new Set<string>()
  for (const prov of SHAPES.provinces ?? []) {
    if (pts.some(([lng, lat]) => prov.rings.some(r => pointInRing(lng, lat, r)))) hit.add(prov.id)
  }
  return [...hit]
}

/** Vult de provincies waar de route doorheen gaat. Roep dit aan ná
 *  `addPlainBase` en vóór de route, zodat de lijn er bovenop ligt. */
export function addProvinceHighlight(
  L: L, map: Leaflet.Map, stops: TripMapStop[], color = PLAIN_COLORS.highlight,
): string[] {
  const ids = provincesOnRoute(stops)
  for (const prov of SHAPES.provinces ?? []) {
    if (!ids.includes(prov.id)) continue
    for (const ring of prov.rings) {
      L.polygon(ringToLatLngs(ring), {
        fillColor: color, fillOpacity: 1, color, weight: 1, interactive: false,
      }).addTo(map)
    }
  }
  return ids
}
