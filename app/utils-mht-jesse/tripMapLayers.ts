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

/**
 * Kleuren van de vlakke kaart. Eén tint voor al het land, één voor het
 * water: zonder wegen, plaatsnamen en terrein is de contour het enige wat
 * de kaart nog vertelt, en die moet dus scherp zijn.
 */
export const PLAIN_COLORS = {
  /** Alles buiten het land. */
  water: '#ffffff',
  /** Al het land, waar ook ter wereld — één kleur. */
  land: '#e9e9e9',
  /** Grens tussen twee landgebieden: een witte snee, geen lijn erbovenop. */
  line: '#ffffff',
  /** Vulkleur van de provincie(s) waar de route doorheen gaat. */
  highlight: '#5fc4b5',
  /** Contour om die provincie. */
  highlightLine: '#1f6f66',
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
  const fillAll = (rings: number[][][], color: string) =>
    L.polygon(rings.map(r => [ringToLatLngs(r)]), {
      fillColor: color, fillOpacity: 1, stroke: false, interactive: false,
    }).addTo(map)

  // 1. Al het land van Europa.
  fillAll(MAP.units.flatMap(u => u.rings), PLAIN_COLORS.land)

  // 2. De uitgelichte provincies, nog onder de lijnen.
  const ids = opts.highlightStops ? provincesOnRoute(opts.highlightStops) : []
  const lit = MAP.units.filter(u => ids.includes(u.id)).flatMap(u => u.rings)
  if (lit.length) fillAll(lit, opts.highlightColor ?? PLAIN_COLORS.highlight)

  // 3. Provincie- en landsgrenzen als een witte snee door het grijs.
  L.polyline([...MAP.provinceLines, ...MAP.countryLines].map(ringToLatLngs), {
    color: PLAIN_COLORS.line, weight: 1.5, interactive: false,
  }).addTo(map)

  // 4. De contour om de provincie van de reis, uit dezelfde ringen als de
  //    vulling en dus precies op de grens.
  if (lit.length) {
    L.polyline(lit.map(ringToLatLngs), {
      color: PLAIN_COLORS.highlightLine, weight: 2, interactive: false,
    }).addTo(map)
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

/**
 * De provincie(s) van de reis als gekleurd vlak óver een echte kaart.
 *
 * Anders dan `addPlainBase` vervangt dit de kaart niet maar legt het er een
 * laag overheen: half doorzichtige vulling, zodat plaatsnamen en wegen
 * eronder leesbaar blijven, en een stevige contour op de grens. De vormen
 * komen uit `mhtj-map-shapes.json`, dezelfde bron als de rest.
 *
 * Geeft de namen van de gekleurde provincies terug.
 */
export function addProvinceOverlay(
  L: L,
  map: Leaflet.Map,
  stops: TripMapStop[],
  opts: { color?: string; fillOpacity?: number } = {},
): string[] {
  const ids = provincesOnRoute(stops)
  const rings = MAP.units.filter(u => ids.includes(u.id)).flatMap(u => u.rings)
  if (!rings.length) return ids
  const color = opts.color ?? PLAIN_COLORS.highlight
  L.polygon(rings.map(r => [ringToLatLngs(r)]), {
    fillColor: color,
    fillOpacity: opts.fillOpacity ?? 0.3,
    color: PLAIN_COLORS.highlightLine,
    weight: 2.5,
    interactive: false,
  }).addTo(map)
  return ids
}

// ── Illustraties langs de route ─────────────────────────────────────────────

const KAART_ICOON = (naam: string) => `/icons/mhtj-kaart/${naam}.svg`

/** Welk icoon past bij een plek langs de route? Op trefwoord in naam en
 *  tekst, eerste treffer wint; wat nergens op past wordt een gebouw. */
const PLEK_ICONEN: [RegExp, string][] = [
  [/kaste+l|château|chateau|burcht|slot/i, 'kasteel'],
  [/landgoed|estate|havezate|buitenplaats/i, 'landhuis'],
  [/molen|mill/i, 'molen'],
  [/kerk|kathedraal|abdij|klooster|belfort|church/i, 'kerk'],
  [/museum/i, 'museum'],
  [/veer|pont|haven|boot|rivier|ferry|ijssel|meer\b/i, 'boot'],
  [/uitkijktoren|toren|heuvelrug|berg|duin|tower|hill/i, 'toren'],
  [/brug|bridge/i, 'brug'],
  [/fiets|cycl/i, 'fiets'],
  [/boerderij|hoeve|farm/i, 'boerderij'],
  [/wild|hert|safari|dieren/i, 'hert'],
  [/bos|natuur|park|heide|nature/i, 'boom'],
]

/** Sfeericonen: wat je onderweg in het landschap tegenkomt. Bomen en
 *  struiken staan er vaker in; de rest is accent. */
const SFEER_ICONEN = [
  'boom', 'boom', 'boom', 'struik', 'struik', 'cipres', 'gras', 'gras',
  'koe', 'konijn', 'hert', 'akker', 'bank', 'picknick', 'wegwijzer', 'boerderij',
]

/** Herhaalbare pseudo-toevalswaarde: dezelfde route geeft dezelfde tekening. */
function ruis(x: number, y: number, zout = 0): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + zout * 74.7) * 43758.5453
  return n - Math.floor(n)
}

function maakIcoon(
  L: L, lng: number, lat: number, naam: string, size: number, label?: string,
): Leaflet.Marker {
  const tekst = label ? `<span class="tml-ill__naam">${escapeHtml(label)}</span>` : ''
  return L.marker([lat, lng], {
    icon: L.divIcon({
      className: 'tml-ill',
      html: `<img src="${KAART_ICOON(naam)}" width="${size}" height="${size}" alt="">${tekst}`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
    }),
    interactive: false, keyboard: false, zIndexOffset: -300,
  })
}

/** Een kandidaat-illustratie; of hij echt getekend wordt hangt van het
 *  zoomniveau af. */
interface Illustratie {
  marker: Leaflet.Marker
  lng: number
  lat: number
  /** Lager = belangrijker. Plekken met een naam gaan vóór sfeericonen. */
  prio: number
  /** Hoeveel pixels deze illustratie om zich heen nodig heeft. */
  ruimte: number
}

/**
 * Illustraties langs de route: de plekken uit het dagprogramma die in de
 * buurt van de route liggen, met hun naam eronder, en daartussen een handvol
 * sfeericonen.
 *
 * Bewust zuinig. De kaart moet over de route gaan, dus alles blijft binnen
 * een strook langs de route, houdt afstand tot de lijn zelf en tot de
 * hotels, en het aantal sfeericonen is gemaximeerd — anders wordt het een
 * kluwen waarin je de route kwijtraakt.
 *
 * Raakt de route en de hotelmarkers niet aan: die worden elders getekend.
 */
export function addRouteScenery(
  L: L,
  map: Leaflet.Map,
  opts: {
    stops: TripMapStop[]
    highlights?: TripMapHighlight[]
    /** Alleen binnen deze provincies tekenen; leeg = overal. */
    provinces?: string[]
    /** Breedte van de strook naast de route, in km. */
    corridorKm?: number
    /** Hoeveel sfeericonen maximaal. */
    maxSfeer?: number
  },
): void {
  const { stops } = opts
  if (stops.length < 1) return
  const corridor = opts.corridorKm ?? 18
  const maxSfeer = opts.maxSfeer ?? 10

  const rings = opts.provinces?.length
    ? MAP.units.filter(u => opts.provinces!.includes(u.id)).flatMap(u => u.rings)
    : []
  const inProvincie = (x: number, y: number) => !rings.length || rings.some(r => pointInRing(x, y, r))

  const km = (ax: number, ay: number, bx: number, by: number) =>
    Math.hypot((bx - ax) * 0.61, by - ay) * 111

  const legs: [number, number, number, number][] = []
  stops.forEach((s, i) => {
    const n = stops[i + 1]
    if (n) legs.push([s.lng, s.lat, n.lng, n.lat])
  })
  /** Afstand tot de routelijn; zonder etappes tot het enige hotel. */
  const totRoute = (x: number, y: number) => {
    if (!legs.length) return km(x, y, stops[0]!.lng, stops[0]!.lat)
    return Math.min(...legs.map(([ax, ay, bx, by]) => {
      const dx = bx - ax, dy = by - ay
      const len = dx * dx + dy * dy
      let t = len ? ((x - ax) * dx + (y - ay) * dy) / len : 0
      t = Math.max(0, Math.min(1, t))
      return km(x, y, ax + t * dx, ay + t * dy)
    }))
  }

  const bezet: [number, number][] = stops.map(s => [s.lng, s.lat])
  const kandidaten: Illustratie[] = []

  // 1. De plekken uit het dagprogramma die langs de route liggen.
  // Plekken die vlak bij elkaar liggen zouden elkaars naam onleesbaar maken;
  // dan houden we er één. Een hotelmarker is kleiner dan zo'n illustratie,
  // dus daar hoeft minder ruimte tussen te zitten.
  const plekken: [number, number][] = []
  for (const h of opts.highlights ?? []) {
    if (!inProvincie(h.lng, h.lat)) continue
    if (totRoute(h.lng, h.lat) > corridor) continue
    if (plekken.some(([bx, by]) => km(h.lng, h.lat, bx, by) < 9)) continue
    if (stops.some(st => km(h.lng, h.lat, st.lng, st.lat) < 6)) continue
    kandidaten.push({
      marker: maakIcoon(L, h.lng, h.lat, icoonVoor(`${h.name} ${h.text}`), 48, h.name),
      lng: h.lng, lat: h.lat, prio: 0, ruimte: 58 + h.name.length * 3.2,
    })
    plekken.push([h.lng, h.lat])
    bezet.push([h.lng, h.lat])
  }

  // 2. Sfeericonen in de ruimte die overblijft, op een raster met speling.
  const xs = stops.map(s => s.lng), ys = stops.map(s => s.lat)
  const marge = corridor / 90
  const x0 = Math.min(...xs) - marge, x1 = Math.max(...xs) + marge
  const y0 = Math.min(...ys) - marge, y1 = Math.max(...ys) + marge
  const stap = Math.max((x1 - x0) / 9, 0.05)
  let geplaatst = 0
  for (let x = x0; x <= x1 && geplaatst < maxSfeer; x += stap) {
    for (let y = y0; y <= y1 && geplaatst < maxSfeer; y += stap * 0.62) {
      const jx = x + (ruis(x, y, 1) - 0.5) * stap * 0.8
      const jy = y + (ruis(x, y, 2) - 0.5) * stap * 0.5
      if (!inProvincie(jx, jy)) continue
      const d = totRoute(jx, jy)
      // Niet op de lijn en niet buiten de strook.
      if (d < 5 || d > corridor) continue
      if (bezet.some(([bx, by]) => km(jx, jy, bx, by) < 9)) continue
      const naam = SFEER_ICONEN[Math.floor(ruis(x, y, 3) * SFEER_ICONEN.length)]!
      const size = 28 + Math.round(ruis(x, y, 4) * 10)
      kandidaten.push({ marker: maakIcoon(L, jx, jy, naam, size), lng: jx, lat: jy, prio: 1, ruimte: size + 26 })
      bezet.push([jx, jy])
      geplaatst++
    }
  }

  // 3. Wie er te zien is, hangt van het zoomniveau af.
  //
  // Uitgezoomd kruipen de illustraties op het scherm naar elkaar toe en
  // gaan ze over de route heen liggen, ook al staan ze in kilometers ruim
  // uit elkaar. Daarom toetsen we in pixels en niet in kilometers: bij elke
  // zoomstap houden we de belangrijkste over en laten we de rest weg.
  // Ingezoomd komt er vanzelf weer ruimte en verschijnen ze terug.
  const laag = L.layerGroup().addTo(map)
  const volgorde = [...kandidaten].sort((a, b) => a.prio - b.prio)

  const kies = () => {
    // De aanroeper zet het beeld (fitBounds) pas ná deze functie; zolang de
    // kaart nog geen middelpunt heeft kan Leaflet niet naar pixels rekenen.
    // getZoom() klaagt daar niet over, getCenter() wel — en dat is precies
    // de controle die Leaflet zelf ook doet. De 'zoom'-gebeurtenis vangt die
    // eerste keer op.
    try {
      map.getCenter()
    } catch {
      return
    }
    laag.clearLayers()
    const punt = (lng: number, lat: number) => map.latLngToLayerPoint([lat, lng])
    const routePunten = stops.map(s => punt(s.lng, s.lat))
    /** Afstand in pixels tot de getekende route. */
    const totRoutePx = (p: Leaflet.Point) => {
      if (routePunten.length < 2) return routePunten[0] ? p.distanceTo(routePunten[0]) : Infinity
      let min = Infinity
      for (let i = 1; i < routePunten.length; i++) {
        const a = routePunten[i - 1]!, b = routePunten[i]!
        const dx = b.x - a.x, dy = b.y - a.y
        const len = dx * dx + dy * dy
        let t = len ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / len : 0
        t = Math.max(0, Math.min(1, t))
        min = Math.min(min, Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy)))
      }
      return min
    }

    const gekozen: { p: Leaflet.Point; ruimte: number }[] = []
    for (const k of volgorde) {
      const p = punt(k.lng, k.lat)
      // Niet over de route heen.
      if (totRoutePx(p) < 46) continue
      // Niet over een andere illustratie heen.
      if (gekozen.some(g => p.distanceTo(g.p) < Math.max(k.ruimte, g.ruimte))) continue
      gekozen.push({ p, ruimte: k.ruimte })
      laag.addLayer(k.marker)
    }
  }

  kies()
  map.on('zoom zoomend load', kies)
}

function icoonVoor(tekst: string): string {
  for (const [re, naam] of PLEK_ICONEN) if (re.test(tekst)) return naam
  return 'museum'
}

/** Standaard OpenStreetMap-tegels (de CARTO-basemaps vragen een API-key). */
export function addOsmTiles(L: L, map: Leaflet.Map, attribution = true): void {
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: attribution ? '© OpenStreetMap contributors' : '',
    maxZoom: 19,
  }).addTo(map)
}
