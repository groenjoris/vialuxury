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
import mapShapes from '~/data/mhtj-map-shapes.json'

type L = typeof Leaflet

interface Shape { id: string; rings: number[][][] }
interface Shapes { countries?: Shape[]; provinces?: Shape[]; lakes?: Shape[]; borders?: Shape[] }
const SHAPES = shapes as unknown as Shapes
const BORDERS = (SHAPES.borders ?? []).flatMap(s => s.rings)

/**
 * De kaartvormen voor de vlakke kaart: Natural Earth 1:10m admin-1, één laag
 * voor heel Europa. Zie `scripts/build-mhtj-map-shapes.py` — daar staat ook
 * waarom het één bron moet zijn.
 */
interface MapUnit { id: string; country: string; rings: number[][][] }
interface MapShapes { units: MapUnit[]; provinceLines: number[][][]; countryLines: number[][][] }
const MAP = mapShapes as unknown as MapShapes

/** Kleuren van de getekende kaart. */
export const PLAIN_COLORS = {
  /** Alles buiten het land. */
  water: '#ffffff',
  /** Land buiten de reis: rustig grijs, zodat de provincie eruit springt. */
  land: '#e9e9e9',
  /** Scheiding tussen twee grijze gebieden — wit, als een snee. */
  landLine: '#ffffff',
  /** Vulkleur van de provincie(s) waar de route doorheen gaat. */
  highlight: '#5fc4b5',
  /** Contour om die provincie. */
  highlightLine: '#1f6f66',
  /** Naam van een provincie of land. */
  label: '#2b7a70',
  /** Route, markers en illustraties. */
  ink: '#111111',
}

/** Landnamen in het Nederlands; wat er niet in staat krijgt geen label. */
const LANDNAMEN: Record<string, string> = {
  DEU: 'Duitsland', BEL: 'België', FRA: 'Frankrijk', LUX: 'Luxemburg',
  GBR: 'Verenigd Koninkrijk', IRL: 'Ierland', DNK: 'Denemarken', CHE: 'Zwitserland',
  AUT: 'Oostenrijk', ITA: 'Italië', ESP: 'Spanje', PRT: 'Portugal', POL: 'Polen',
  CZE: 'Tsjechië', NOR: 'Noorwegen', SWE: 'Zweden',
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
 * Alles komt uit één bron: `mhtj-map-shapes.json`, de admin-1-laag van
 * Natural Earth voor heel Europa. Land, provinciegrenzen en landsgrenzen
 * delen daar hun punten, dus ze kunnen niet uit elkaar lopen — de reden dat
 * dit bestand bestaat staat in `scripts/build-mhtj-map-shapes.py`.
 *
 * Alles buiten het land is water: zet de achtergrond van de kaart-container
 * op `PLAIN_COLORS.water`.
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
  // Elke laag in één vorm. Europa telt ruim 1600 eenheden; die los
  // toevoegen levert duizenden SVG-paden op en dat maakt slepen stroperig.
  // Leaflet tekent een lijst ringen als één multipolygoon in één pad.
  const multi = (rings: number[][][]) => rings.map(r => [ringToLatLngs(r)])

  const ids = opts.highlightStops ? provincesOnRoute(opts.highlightStops) : []

  // 1. Al het land van Europa, rustig grijs.
  L.polygon(multi(MAP.units.flatMap(u => u.rings)), {
    fillColor: PLAIN_COLORS.land, fillOpacity: 1, stroke: false, interactive: false,
  }).addTo(map)

  // 2. Provincie- en landsgrenzen als een witte snee door het grijs. Geen
  //    streepjes en geen donkere lijn: de kaart moet een tekening zijn, geen
  //    atlas.
  L.polyline([...MAP.provinceLines, ...MAP.countryLines].map(ringToLatLngs), {
    color: PLAIN_COLORS.landLine, weight: 1.5, interactive: false,
  }).addTo(map)

  // 3. De provincie(s) van de reis, met contour. Vulling en contour komen uit
  //    dezelfde ring, dus de rand ligt precies op de grens.
  const lit = MAP.units.filter(u => ids.includes(u.id)).flatMap(u => u.rings)
  if (lit.length) {
    L.polygon(multi(lit), {
      fillColor: opts.highlightColor ?? PLAIN_COLORS.highlight, fillOpacity: 1,
      color: PLAIN_COLORS.highlightLine, weight: 2, interactive: false,
    }).addTo(map)
  }
  return ids
}

/**
 * Namen van de omliggende provincies en landen, zoals op een getekende kaart:
 * in het gebied zelf, niet als marker met een punt.
 *
 * De provincie waar de reis doorheen gaat krijgt géén naam — die spreekt voor
 * zich en de illustraties hebben de ruimte nodig.
 */
export function addRegionLabels(L: L, map: Leaflet.Map, skip: string[] = []): void {
  const seen = new Set<string>()
  for (const unit of MAP.units) {
    const dutch = unit.country === 'NLD'
    const naam = dutch ? unit.id : LANDNAMEN[unit.country]
    if (!naam || skip.includes(unit.id)) continue
    // Eén naam per land; provincies krijgen er elk één.
    const key = dutch ? unit.id : unit.country
    if (seen.has(key)) continue
    const spot = labelSpot(dutch ? unit.rings : MAP.units.filter(u => u.country === unit.country).flatMap(u => u.rings))
    if (!spot) continue
    seen.add(key)
    L.marker([spot[1], spot[0]], {
      icon: L.divIcon({ className: 'tml-region', html: escapeHtml(naam), iconSize: [0, 0] }),
      interactive: false, keyboard: false,
    }).addTo(map)
  }
}

/**
 * Een punt diep in het gebied om de naam op te zetten. Het zwaartepunt werkt
 * niet bij een vorm als Zeeland of Noord-Holland — dat valt in het water.
 * Daarom zoeken we op een raster het punt dat het verst van elke rand ligt.
 */
function labelSpot(rings: number[][][]): [number, number] | null {
  const big = rings.reduce((a, b) => (ringArea(b) > ringArea(a) ? b : a), rings[0] ?? [])
  if (!big || big.length < 3) return null
  const xs = big.map(p => p[0]!), ys = big.map(p => p[1]!)
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys)
  const N = 24
  let best: [number, number] | null = null
  let bestD = -1
  for (let i = 1; i < N; i++) {
    for (let j = 1; j < N; j++) {
      const x = x0 + ((x1 - x0) * i) / N
      const y = y0 + ((y1 - y0) * j) / N
      if (!pointInRing(x, y, big)) continue
      const d = distToRing(x, y, big)
      if (d > bestD) { bestD = d; best = [x, y] }
    }
  }
  return best
}

function ringArea(ring: number[][]): number {
  let a = 0
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    a += ring[j]![0]! * ring[i]![1]! - ring[i]![0]! * ring[j]![1]!
  }
  return Math.abs(a / 2)
}

/** Afstand tot de dichtstbijzijnde rand, met lengtegraden ingekort zodat
 *  'ver van de rand' ook op het scherm ver is. */
function distToRing(px: number, py: number, ring: number[][]): number {
  let min = Infinity
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [ax, ay] = ring[j] as [number, number]
    const [bx, by] = ring[i] as [number, number]
    const dx = bx - ax, dy = by - ay
    const len = dx * dx + dy * dy
    let t = len ? ((px - ax) * dx + (py - ay) * dy) / len : 0
    t = Math.max(0, Math.min(1, t))
    const ex = (ax + t * dx - px) * 0.61, ey = ay + t * dy - py
    min = Math.min(min, Math.hypot(ex, ey))
  }
  return min
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
 * De Nederlandse provincies waar de route doorheen gaat. We toetsen niet
 * alleen de hotels maar ook punten ónderweg: een etappe kan een provincie
 * doorkruisen zonder er te overnachten, en die hoort er net zo goed bij.
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
  for (const unit of MAP.units) {
    if (unit.country !== 'NLD') continue
    if (pts.some(([lng, lat]) => unit.rings.some(r => pointInRing(lng, lat, r)))) hit.add(unit.id)
  }
  return [...hit]
}

// ── Illustraties ────────────────────────────────────────────────────────────

const ICON = (naam: string) => `/icons/mhtj-kaart/${naam}.svg`

/** Welk icoon hoort bij een highlight? Op trefwoord in naam en tekst; wat
 *  nergens op past wordt een bezienswaardigheid (museumgevel). */
const HIGHLIGHT_ICONS: [RegExp, string][] = [
  [/kastel|château|chateau|burcht|slot/i, 'kasteel'],
  [/landgoed|estate|havezate|buitenplaats/i, 'landhuis'],
  [/molen|mill/i, 'molen'],
  [/kerk|kathedraal|abdij|klooster|belfort|church/i, 'kerk'],
  [/museum|zoutmuseum/i, 'museum'],
  [/uitkijktoren|toren|heuvelrug|berg|duin|tower|hill/i, 'toren'],
  [/veer|pont|haven|boot|rivier|ferry|meer\b/i, 'boot'],
  [/brug|bridge/i, 'brug'],
  [/fiets|cycl|route/i, 'fiets'],
  [/boerderij|hoeve|farm/i, 'boerderij'],
  [/bos|natuur|park|heide|nature/i, 'boom'],
  [/markt|stad|dorp|hanzestad|centrum|town/i, 'museum'],
]

function highlightIcon(text: string): string {
  for (const [re, naam] of HIGHLIGHT_ICONS) if (re.test(text)) return naam
  return 'museum'
}

/** Sfeericonen. Bomen en struiken staan er vaker in: die mogen de vulling
 *  zijn, de rest is accent. Eén lijst met herhalingen is genoeg — een echte
 *  kansverdeling is hier overdreven. */
const SFEER = [
  'boom', 'boom', 'boom', 'boom', 'struik', 'struik', 'struik', 'cipres', 'cipres',
  'koe', 'koe', 'akker', 'bank', 'boerderij', 'kerk', 'brug', 'wegwijzer', 'molen',
]

/** Herhaalbare pseudo-toevalswaarde: dezelfde kaart geeft dezelfde tekening. */
function hash(x: number, y: number, salt = 0): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + salt * 74.7) * 43758.5453
  return n - Math.floor(n)
}

function addIcon(L: L, map: Leaflet.Map, lng: number, lat: number, naam: string, size: number): void {
  L.marker([lat, lng], {
    icon: L.divIcon({
      className: 'tml-scenery',
      html: `<img src="${ICON(naam)}" width="${size}" height="${size}" alt="">`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
    }),
    interactive: false, keyboard: false, zIndexOffset: -200,
  }).addTo(map)
}

/**
 * De tekening in de provincie: eerst de echte highlights van de reis op hun
 * eigen plek, daarna sfeericonen in de ruimte die overblijft.
 *
 * Alles blijft binnen de provincie(s) van de reis — buiten de reis is de
 * kaart leeg grijs, dat is juist wat de provincie laat opvallen. En niets
 * komt te dicht bij de route, de hotels of een ander icoon te staan, anders
 * wordt het een kluwen.
 */
export function addSceneryIcons(
  L: L,
  map: Leaflet.Map,
  opts: { provinces: string[]; stops: TripMapStop[]; highlights?: TripMapHighlight[] },
): void {
  const rings = MAP.units.filter(u => opts.provinces.includes(u.id)).flatMap(u => u.rings)
  if (!rings.length) return
  const inside = (x: number, y: number) => rings.some(r => pointInRing(x, y, r))
  // Iconen staan op hun voet, dus ze steken naar boven uit hun punt. Te dicht
  // op de grens zou een boom buiten de provincie laten groeien.
  const deepInside = (x: number, y: number, kmFromEdge: number) =>
    inside(x, y) && Math.min(...rings.map(r => distToRing(x, y, r))) * 111 > kmFromEdge

  // Bezet: alles wat we al hebben neergezet. De hotels krijgen een ruimere
  // kring, want daar staat straks ook het gebouw en de plaatsnaam.
  const stopZone: [number, number][] = opts.stops.map(s => [s.lng, s.lat])
  const taken: [number, number][] = []
  const legs: [number, number, number, number][] = []
  opts.stops.forEach((s, i) => {
    const n = opts.stops[i + 1]
    if (n) legs.push([s.lng, s.lat, n.lng, n.lat])
  })
  const km = (ax: number, ay: number, bx: number, by: number) =>
    Math.hypot((bx - ax) * 0.61, by - ay) * 111
  const freeOf = (x: number, y: number, minKm: number) => {
    if (stopZone.some(([tx, ty]) => km(x, y, tx, ty) < 17)) return false
    if (taken.some(([tx, ty]) => km(x, y, tx, ty) < minKm)) return false
    return !legs.some(([ax, ay, bx, by]) => {
      const dx = bx - ax, dy = by - ay
      const len = dx * dx + dy * dy
      let t = len ? ((x - ax) * dx + (y - ay) * dy) / len : 0
      t = Math.max(0, Math.min(1, t))
      return km(x, y, ax + t * dx, ay + t * dy) < minKm * 0.6
    })
  }

  // 1. De highlights van de reis, alleen die in de provincie liggen.
  for (const h of opts.highlights ?? []) {
    if (!inside(h.lng, h.lat)) continue
    addIcon(L, map, h.lng, h.lat, highlightIcon(`${h.name} ${h.text}`), 52)
    taken.push([h.lng, h.lat])
  }

  // 2. Sfeericonen op een raster met een beetje speling, zodat ze verspreid
  //    staan maar niet in het gelid.
  const xs = rings.flat().map(p => p[0]!), ys = rings.flat().map(p => p[1]!)
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys)
  const step = Math.max((x1 - x0) / 15, 0.05)
  for (let x = x0; x <= x1; x += step) {
    for (let y = y0; y <= y1; y += step * 0.62) {
      const jx = x + (hash(x, y, 1) - 0.5) * step * 0.8
      const jy = y + (hash(x, y, 2) - 0.5) * step * 0.5
      if (!deepInside(jx, jy, 3)) continue
      if (!freeOf(jx, jy, 6.5)) continue
      const naam = SFEER[Math.floor(hash(x, y, 3) * SFEER.length)]!
      addIcon(L, map, jx, jy, naam, 30 + Math.round(hash(x, y, 4) * 14))
      taken.push([jx, jy])
    }
  }
}

/** De omhullende van een aantal provincies, om de kaart op te kadreren:
 *  de provincie vult het beeld, zoals op een getekende kaart. */
export function provinceBounds(ids: string[]): [[number, number], [number, number]] | null {
  const pts = MAP.units.filter(u => ids.includes(u.id)).flatMap(u => u.rings).flat()
  if (!pts.length) return null
  const xs = pts.map(p => p[0]!), ys = pts.map(p => p[1]!)
  return [[Math.min(...ys), Math.min(...xs)], [Math.max(...ys), Math.max(...xs)]]
}

/** De route als stippellijn, zoals met de hand getekend. */
export function addDottedRoute(L: L, map: Leaflet.Map, stops: TripMapStop[]): void {
  const pts = stops.map(s => [s.lat, s.lng] as [number, number])
  if (pts.length < 2) return
  L.polyline(pts, {
    color: PLAIN_COLORS.ink, weight: 5, dashArray: '1 13',
    lineCap: 'round', lineJoin: 'round', interactive: false,
  }).addTo(map)
}

/** Per hotel: het gebouw als illustratie, een stip op de plek en de
 *  plaatsnaam ernaast. */
export function addIllustratedStops(L: L, map: Leaflet.Map, stops: TripMapStop[]): void {
  stops.forEach((s, i) => {
    const naam = `${s.title ?? ''}`
    const gebouw = /kasteel|château|chateau|burcht/i.test(naam) ? 'kasteel'
      : /landgoed|landhuis|havezate/i.test(naam) ? 'landhuis'
        : /hoeve|boerderij/i.test(naam) ? 'boerderij' : 'landhuis'
    // Het gebouw iets boven de stip, om en om links en rechts zodat twee
    // dicht op elkaar liggende hotels elkaar niet overlappen.
    // Om en om links/rechts en hoog/laag, zodat hotels die dicht bij elkaar
    // liggen niet op één hoop belanden.
    const zij = i % 2 === 0 ? 1 : -1
    const hoog = i % 4 < 2 ? 1 : -1
    addIcon(L, map, s.lng + zij * 0.14, s.lat + hoog * 0.075, gebouw, 68)
    L.marker([s.lat, s.lng], {
      icon: L.divIcon({
        className: `tml-stop tml-stop--${i % 2 === 0 ? 'right' : 'left'}`,
        html: `<span class="tml-stop__dot"></span><span class="tml-stop__name">${escapeHtml(s.label)}</span>`,
        iconSize: [0, 0],
      }),
      interactive: false, keyboard: false, zIndexOffset: 800,
    }).addTo(map)
  })
}

/** Standaard OpenStreetMap-tegels (de CARTO-basemaps vragen een API-key). */
export function addOsmTiles(L: L, map: Leaflet.Map, attribution = true): void {
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: attribution ? '© OpenStreetMap contributors' : '',
    maxZoom: 19,
  }).addTo(map)
}
