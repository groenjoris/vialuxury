/**
 * Multi Hotel Trip — gedeelde Leaflet-lagen voor de vakantiekaarten: de
 * minimap op de PDP (RouteMapCard) en de fullscreen kaart (TripFullscreenMap)
 * tekenen dezelfde route, dezelfde genummerde hotelmarkers en dezelfde
 * hover-kaartjes (stijl van HotelMapHoverCard: witte kaart met oranje band
 * bovenin, foto links, tekst rechts). Leaflet wordt door de aanroeper
 * dynamisch geïmporteerd (alleen client-side); de bijbehorende CSS staat
 * in assets/css/mhtj-trip-map.css (Leaflet maakt de DOM zelf aan).
 */
import type * as Leaflet from 'leaflet'
import shapes from '~/data/mhtj-route-map-shapes.json'

type L = typeof Leaflet

interface Shape { id: string; rings: number[][][] }
interface Shapes { countries?: Shape[]; provinces?: Shape[]; lakes?: Shape[]; borders?: Shape[] }
const SHAPES = shapes as unknown as Shapes
const BORDERS = (SHAPES.borders ?? []).flatMap(s => s.rings)

/** Kleuren van de vlakke kaart. */
export const PLAIN_COLORS = {
  /** Alles buiten de provincies. Gelijk aan de kaartachtergrond uit
   *  leaflet-overrides.css, zodat er geen naad tussen de twee zit. */
  water: '#aadaff',
  /** Landkleur van het schematische kaartje op de dealcard (TripRouteMap),
   *  zodat de twee kaarten bij elkaar horen. */
  land: '#f3efe6',
  provinceLine: '#e0d9cc',
  /** Vulkleur van de provincie(s) waar de route doorheen gaat. */
  highlight: '#5fc4b5',
}

export interface TripMapStop {
  lat: number
  lng: number
  /** Plaatsnaam. */
  label: string
  /** Hotelnaam. */
  title?: string
  starRating?: number
  /** Aantal nachten in dit hotel. */
  nights?: number
  image?: string
  /** Afstand (km) vanaf het vorige hotel — label halverwege de lijn. */
  travelKm?: number
}

export interface TripMapHighlight {
  name: string
  lat: number
  lng: number
  text: string
  image?: string
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}

const STAR = '<svg viewBox="0 0 18 18" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M16.963,6.786c-.088-.271-.323-.469-.605-.51l-4.62-.671L9.672,1.418c-.252-.512-1.093-.512-1.345,0l-2.066,4.186-4.62,.671c-.282,.041-.517,.239-.605,.51-.088,.271-.015,.57,.19,.769l3.343,3.258-.79,4.601c-.048,.282,.067,.566,.298,.734,.231,.167,.538,.189,.79,.057l4.132-2.173,4.132,2.173c.11,.058,.229,.086,.349,.086,.155,0,.31-.048,.441-.143,.231-.168,.347-.452,.298-.734l-.79-4.601,3.343-3.258c.205-.199,.278-.498,.19-.769Z"/></svg>'

/** Donkere druppel-pin voor een omgevingshighlight. */
export const PIN_SVG = '<svg width="26" height="32" viewBox="0 0 32 42" fill="none" aria-hidden="true"><path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z" fill="#141414"/><circle cx="16" cy="16" r="6" fill="#fff"/></svg>'

/** Hover-kaartje in de stijl van de gewone kaart: oranje band, foto links,
 *  rechts titel, sterren en één of twee regels toelichting. */
export function hoverCardHtml(o: { image?: string; title: string; stars?: number; lines: string[] }): string {
  const stars = o.stars ? `<div class="tml-card__stars" aria-hidden="true">${STAR.repeat(o.stars)}</div>` : ''
  const img = o.image ? `<img class="tml-card__img" src="${escapeHtml(o.image)}" alt="">` : ''
  const lines = o.lines.filter(Boolean).map(l => `<p class="tml-card__line">${escapeHtml(l)}</p>`).join('')
  return `<div class="tml-card"><div class="tml-card__band"></div><div class="tml-card__inner">${img}<div class="tml-card__body"><h4 class="tml-card__title">${escapeHtml(o.title)}</h4>${stars}${lines}</div></div></div>`
}

const TOOLTIP: Leaflet.TooltipOptions = { direction: 'top', offset: [0, -22], className: 'tml-hover', opacity: 1, interactive: false }

/** Route als lijn (witte halo + donkere lijn); optioneel per etappe de
 *  afstand halverwege de lijn. */
export function addTripRoute(L: L, map: Leaflet.Map, stops: TripMapStop[], opts: { distances?: boolean; weight?: number } = {}): void {
  const pts = stops.map(s => [s.lat, s.lng] as [number, number])
  if (pts.length < 2) return
  const w = opts.weight ?? 3
  L.polyline(pts, { color: '#fff', weight: w + 4, opacity: 0.9, lineJoin: 'round', interactive: false }).addTo(map)
  L.polyline(pts, { color: '#141414', weight: w, lineJoin: 'round', interactive: false }).addTo(map)
  if (!opts.distances) return
  for (let i = 1; i < stops.length; i++) {
    const km = stops[i]!.travelKm
    if (!km) continue
    const a = stops[i - 1]!, b = stops[i]!
    const icon = L.divIcon({ className: 'tml-km-wrap', html: `<span class="tml-km">${km} km</span>`, iconSize: [0, 0], iconAnchor: [0, 0] })
    L.marker([(a.lat + b.lat) / 2, (a.lng + b.lng) / 2], { icon, interactive: false, keyboard: false, zIndexOffset: 500 }).addTo(map)
  }
}

export interface TripHotelLayerOptions {
  /** Diameter van de genummerde bol (px). */
  size?: number
  /** Tekst naast de bol: plaatsnaam (minimap) of hotelnaam (grote kaart). */
  labelText?: (s: TripMapStop, i: number) => string
  /** Lettergrootte van dat label (px). */
  labelSize?: number
  /** Klik op marker/label. */
  onClick?: (i: number) => void
  /** Hover-kaartje (HTML) — alleen wanneer gezet. */
  hoverHtml?: (s: TripMapStop, i: number) => string
}

/** Genummerde hotelmarkers met naam/plaats ernaast. */
export function addTripHotels(L: L, map: Leaflet.Map, stops: TripMapStop[], opts: TripHotelLayerOptions = {}): Leaflet.Marker[] {
  const size = opts.size ?? 30
  const labelSize = opts.labelSize ?? 13
  const clickable = !!opts.onClick
  return stops.map((s, i) => {
    const label = opts.labelText ? opts.labelText(s, i) : (s.title ?? s.label)
    const icon = L.divIcon({
      className: `tml-hotel${clickable ? ' tml-hotel--clickable' : ''}`,
      html: `<span class="tml-hotel__num">${i + 1}</span><span class="tml-hotel__name" style="font-size:${labelSize}px;left:${size + 6}px">${escapeHtml(label)}</span>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    })
    const m = L.marker([s.lat, s.lng], { icon, interactive: clickable || !!opts.hoverHtml, keyboard: false, zIndexOffset: 1000 }).addTo(map)
    if (opts.hoverHtml) m.bindTooltip(opts.hoverHtml(s, i), { ...TOOLTIP, offset: [0, -size / 2 - 6] })
    if (opts.onClick) m.on('click', (e) => { L.DomEvent.stopPropagation(e); opts.onClick!(i) })
    return m
  })
}

/** Omgevingshighlights als pin met hover-kaartje. */
export function addTripHighlights(L: L, map: Leaflet.Map, highlights: TripMapHighlight[]): Leaflet.Marker[] {
  return highlights.map((h) => {
    const icon = L.divIcon({ className: 'tml-pin', html: PIN_SVG, iconSize: [26, 32], iconAnchor: [13, 31] })
    const m = L.marker([h.lat, h.lng], { icon, keyboard: false }).addTo(map)
    m.bindTooltip(hoverCardHtml({ image: h.image, title: h.name, lines: [h.text] }), { ...TOOLTIP, offset: [0, -30] })
    return m
  })
}

/** Landsgrenzen (Natural Earth, alleen grenzen over land) als duidelijke
 *  gestreepte lijn bovenop de tegels — de OSM-grenzen zelf zijn erg subtiel. */
export function addCountryBorders(L: L, map: Leaflet.Map, weight = 2): void {
  for (const ring of BORDERS) {
    const pts = ring.map(([lng, lat]) => [lat!, lng!] as [number, number])
    L.polyline(pts, { color: '#fff', weight: weight + 2, opacity: 0.6, interactive: false }).addTo(map)
    L.polyline(pts, { color: '#5b5347', weight, dashArray: '7 5', opacity: 0.9, interactive: false }).addTo(map)
  }
}

/** Een ring (lijst [lng, lat]) als Leaflet-punten. */
function ringToLatLngs(ring: number[][]): [number, number][] {
  return ring.map(([lng, lat]) => [lat!, lng!] as [number, number])
}

/**
 * Vlakke ondergrond zonder kaartdetails: geen tegels, dus geen wegen,
 * plaatsnamen of terrein — alleen het silhouet, zodat de route het beeld
 * bepaalt.
 *
 * Alles komt uit één laag: de twaalf provincies uit
 * `mhtj-route-map-shapes.json`. Vulling, randen, kustlijn en landsgrens zijn
 * daarmee dezelfde punten en kunnen niet uit elkaar lopen. De landenlaag en
 * de merenlaag uit datzelfde bestand gebruiken we niet: die zijn apart
 * vereenvoudigd — tot 2,4 km verschil met de provincies, wat zich liet zien
 * als blauwe kieren langs de landsgrens — en het IJsselmeer is er één grove
 * vlek van dertig punten die Flevoland opslokt.
 *
 * Alles buiten de provincies is water: zet de achtergrond van de
 * kaart-container op `PLAIN_COLORS.water`.
 *
 * Met `highlightStops` kleuren de provincies waar de route doorheen gaat;
 * die vulling gaat onder de randen door, anders dekt ze de lijn af en lijkt
 * de gekleurde rand ernaast te liggen. Geeft hun namen terug.
 */
export function addPlainBase(
  L: L,
  map: Leaflet.Map,
  opts: { highlightStops?: TripMapStop[]; highlightColor?: string } = {},
): string[] {
  const fill = (ring: number[][], color: string) =>
    L.polygon(ringToLatLngs(ring), {
      fillColor: color, fillOpacity: 1, stroke: false, interactive: false,
    }).addTo(map)

  // 1. Al het land: de twaalf provincies, en verder niets.
  for (const prov of SHAPES.provinces ?? []) for (const ring of prov.rings) fill(ring, PLAIN_COLORS.land)

  // 2. De uitgelichte provincies, nog onder de lijnen.
  const ids = opts.highlightStops ? provincesOnRoute(opts.highlightStops) : []
  const color = opts.highlightColor ?? PLAIN_COLORS.highlight
  for (const prov of SHAPES.provinces ?? []) {
    if (ids.includes(prov.id)) for (const ring of prov.rings) fill(ring, color)
  }

  // 3. De randen, uit dezelfde ringen als de vulling en dus precies erop.
  for (const prov of SHAPES.provinces ?? []) {
    for (const ring of prov.rings) {
      L.polyline(ringToLatLngs(ring), {
        color: PLAIN_COLORS.provinceLine, weight: 1, interactive: false,
      }).addTo(map)
    }
  }
  return ids
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
 * `mhtj-route-map-shapes.json` zijn alleen de twaalf Nederlandse provincies.
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

/** Standaard OpenStreetMap-tegels (de CARTO-basemaps vragen een API-key). */
export function addOsmTiles(L: L, map: Leaflet.Map, attribution = true): void {
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: attribution ? '© OpenStreetMap contributors' : '',
    maxZoom: 19,
  }).addTo(map)
}
