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
 * Vlakke ondergrond zonder kaartdetails: water, land, meren en dunne
 * provinciegrenzen, getekend uit `mhtj-route-map-shapes.json`. Geen tegels,
 * dus geen wegen, plaatsnamen of terrein — alleen het silhouet, zodat de
 * route zelf het beeld bepaalt.
 *
 * Zet de achtergrond van de kaart-container op `PLAIN_COLORS.water`; dat is
 * het water buiten de landvlakken.
 *
 * Met `highlightStops` kleuren de provincies waar die route doorheen gaat.
 * Die vulling hoort hier thuis en niet in een losse aanroep erna, want de
 * volgorde luistert nauw: de vulling gaat eronder en de provincielijnen
 * gaan er bovenop, uit exact dezelfde vormen. Andersom dekt de vulling de
 * lijn af en lijkt de gekleurde rand naast de provinciegrens te liggen.
 *
 * Geeft de namen van de gekleurde provincies terug.
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

  // 1. Al het land in één kleur: eerst de landenlaag, dan de provincies
  //    eroverheen. De drie lagen zijn los van elkaar vereenvoudigd en delen
  //    geen enkel punt, dus tussen het Nederlandse provinciesilhouet en het
  //    Duitse landvlak vallen smalle kieren. Omdat alles dezelfde landkleur
  //    heeft zie je die niet; de landenlaag eronder vult ze op. Alleen de
  //    randen die we daarna tekenen zijn zichtbaar, en die komen allemaal
  //    uit de provincievormen.
  for (const c of SHAPES.countries ?? []) for (const ring of c.rings) fill(ring, PLAIN_COLORS.land)
  for (const prov of SHAPES.provinces ?? []) for (const ring of prov.rings) fill(ring, PLAIN_COLORS.land)

  // 2. De uitgelichte provincies, nog onder de lijnen.
  const ids = opts.highlightStops ? provincesOnRoute(opts.highlightStops) : []
  const color = opts.highlightColor ?? PLAIN_COLORS.highlight
  for (const prov of SHAPES.provinces ?? []) {
    if (ids.includes(prov.id)) for (const ring of prov.rings) fill(ring, color)
  }

  // 3. Meren bovenop de vulling: water blijft water, ook binnen een
  //    uitgelichte provincie.
  for (const lake of SHAPES.lakes ?? []) for (const ring of lake.rings) fill(ring, PLAIN_COLORS.water)

  // 4. Provinciegrenzen, uit dezelfde ringen als de vulling, dus precies op
  //    de rand ervan.
  for (const prov of SHAPES.provinces ?? []) {
    for (const ring of prov.rings) {
      L.polyline(ringToLatLngs(ring), {
        color: PLAIN_COLORS.provinceLine, weight: 1, interactive: false,
      }).addTo(map)
    }
  }

  // 5. De landsgrens, afgeleid uit diezelfde provincieranden.
  for (const chain of nlLandBorderChains()) {
    L.polyline(ringToLatLngs(chain), {
      color: PLAIN_COLORS.border, weight: 1.6, dashArray: '5 3',
      lineCap: 'round', interactive: false,
    }).addTo(map)
  }
  return ids
}

/**
 * De landsgrens van Nederland, afgeleid uit de provincievormen zelf.
 *
 * De losse grenzenlaag in `mhtj-route-map-shapes.json` is apart
 * vereenvoudigd — geen enkel punt valt samen met een provinciepunt — dus die
 * lijn loopt zichtbaar naast de rand van een gekleurde provincie. Daarom
 * bouwen we de grens hier op uit de provincieranden:
 *
 *   1. elk randsegment dat twee provincies delen is binnenland en valt af;
 *   2. van wat overblijft (de buitenrand van Nederland) houden we de stukken
 *      waar aan de andere kant een buurland ligt — de rest is kust;
 *   3. die stukken worden aan elkaar geregen tot doorlopende lijnen, anders
 *      begint het streepjespatroon bij elk segment opnieuw.
 */
let LAND_BORDER_CHAINS: number[][][] | null = null
function nlLandBorderChains(): number[][][] {
  if (LAND_BORDER_CHAINS) return LAND_BORDER_CHAINS
  const key = (p: number[]) => `${p[0]!.toFixed(5)},${p[1]!.toFixed(5)}`
  const seen = new Map<string, { a: number[]; b: number[]; n: number }>()
  for (const prov of SHAPES.provinces ?? []) {
    for (const ring of prov.rings) {
      for (let i = 0; i < ring.length; i++) {
        const a = ring[i]!, b = ring[(i + 1) % ring.length]!
        const k = [key(a), key(b)].sort().join('|')
        const hit = seen.get(k)
        if (hit) hit.n++
        else seen.set(k, { a, b, n: 1 })
      }
    }
  }

  const abroad = (SHAPES.countries ?? []).filter(c => c.id !== 'NL')
  const outside = (lng: number, lat: number) =>
    abroad.some(c => c.rings.some(r => pointInRing(lng, lat, r)))

  // Een segment is landsgrens als vlak naast het midden ervan een buurland
  // ligt; bij de kust is daar water en valt het af.
  const edges: [number[], number[]][] = []
  for (const { a, b, n } of seen.values()) {
    if (n > 1) continue
    const mx = (a[0]! + b[0]!) / 2, my = (a[1]! + b[1]!) / 2
    const dx = b[0]! - a[0]!, dy = b[1]! - a[1]!
    const len = Math.hypot(dx, dy) || 1
    const e = 0.02
    if (outside(mx + (dy / len) * e, my - (dx / len) * e) || outside(mx - (dy / len) * e, my + (dx / len) * e)) {
      edges.push([a, b])
    }
  }

  // Aaneenrijgen op gedeelde eindpunten, zodat de streepjes doorlopen.
  const byPoint = new Map<string, [number[], number[]][]>()
  for (const e of edges) {
    for (const p of e) {
      const k = key(p)
      const list = byPoint.get(k)
      if (list) list.push(e)
      else byPoint.set(k, [e])
    }
  }
  const used = new Set<[number[], number[]]>()
  const chains: number[][][] = []
  for (const start of edges) {
    if (used.has(start)) continue
    used.add(start)
    const chain = [start[0]!, start[1]!]
    // Beide kanten op doorlopen tot er geen aansluitend segment meer is.
    for (const end of [0, 1]) {
      for (;;) {
        const tip = end === 0 ? chain[0]! : chain[chain.length - 1]!
        const next = (byPoint.get(key(tip)) ?? []).find(e => !used.has(e))
        if (!next) break
        used.add(next)
        const other = key(next[0]!) === key(tip) ? next[1]! : next[0]!
        if (end === 0) chain.unshift(other)
        else chain.push(other)
      }
    }
    chains.push(chain)
  }
  LAND_BORDER_CHAINS = chains
  return chains
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
