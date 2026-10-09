/**
 * Multi Hotel Trip — gedeelde Leaflet-lagen voor de vakantiekaarten: de
 * minimap op de PDP (RouteMapCard) en de fullscreen kaart (TripFullscreenMap)
 * tekenen dezelfde route, dezelfde genummerde hotelmarkers en dezelfde
 * hover-kaartjes (stijl van HotelMapHoverCard: witte kaart met oranje band
 * bovenin, foto links, tekst rechts). Leaflet wordt door de aanroeper
 * dynamisch geïmporteerd (alleen client-side); de bijbehorende CSS staat
 * in assets/css/mht-trip-map.css (Leaflet maakt de DOM zelf aan).
 */
import type * as Leaflet from 'leaflet'
import shapes from '~/data/mht-route-map-shapes.json'

type L = typeof Leaflet

interface Shape { id: string; rings: number[][][] }
const BORDERS = ((shapes as unknown as { borders?: Shape[] }).borders ?? []).flatMap(s => s.rings)

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
  /** Volledig label halverwege de etappe, al vertaald: "50 km (een half uur)".
   *  Heeft voorrang op `travelKm`. */
  travelLabel?: string
  /** Compact label (minimap): alleen de reistijd, "50 min". */
  travelShort?: string
}

/** Rijroute (OSRM) tussen stop `from` en stop `to` — zie scripts/build-trip-routes.py. */
export interface TripRouteLeg {
  from: number
  to: number
  km: number
  minutes: number
  /** [lat, lng] */
  coords: [number, number][]
  /** Terugetappe van een rondje (laatste → eerste hotel): gestippeld getekend. */
  return?: boolean
}

/** Punt halverwege een lijn (gemeten langs de lijn, niet het middelste
 *  coördinaat), zodat het afstandslabel ook op een kronkelende route
 *  netjes in het midden staat. */
function midpointAlong(pts: [number, number][], frac = 0.5): [number, number] {
  if (pts.length < 2) return pts[0] ?? [0, 0]
  const cos = Math.cos((pts[0]![0] * Math.PI) / 180)
  const seg: number[] = []
  let total = 0
  for (let i = 1; i < pts.length; i++) {
    const dy = pts[i]![0] - pts[i - 1]![0]
    const dx = (pts[i]![1] - pts[i - 1]![1]) * cos
    const d = Math.hypot(dx, dy)
    seg.push(d)
    total += d
  }
  let acc = 0
  const target = total * frac
  for (let i = 0; i < seg.length; i++) {
    if (acc + seg[i]! >= target) {
      const f = seg[i]! ? (target - acc) / seg[i]! : 0
      const a = pts[i]!, b = pts[i + 1]!
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]
    }
    acc += seg[i]!
  }
  return pts[pts.length - 1]!
}

export interface TripMapHighlight {
  name: string
  lat: number
  lng: number
  text: string
  image?: string
  /** Soort bezienswaardigheid (city, castle, nature, museum, …) → icoontje in de pin. */
  kind?: string
}

/* ── POI-pin: witte druppel met daarin een icoontje dat bij de soort past ──
   24×24-glyphs (lijnen), in de kop van de pin geschaald naar 16 px. */
const POI_GLYPHS: Record<string, string> = {
  city: '<path d="M3 21h18M5 21V9h5v12M10 21V5h5v16M15 21v-8h4v8"/>',
  village: '<path d="M4 11l8-7 8 7M6 10v10h12V10M10 20v-5h4v5"/>',
  castle: '<path d="M4 21V8h3V5h2v3h2V5h2v3h2V5h2v3h3v13H4zM10 21v-5h4v5"/>',
  nature: '<path d="M12 3l5 7h-3l4 5H6l4-5H7l5-7zM12 15v6M9 21h6"/>',
  museum: '<path d="M3 21h18M4 9h16l-8-5-8 5zM6 9v9M10 9v9M14 9v9M18 9v9M4 18h16"/>',
  beach: '<path d="M3 13a9 9 0 0118 0H3zM12 13v8M9 21h6M12 4v2"/>',
  water: '<path d="M3 9c2 0 2 2 4.5 2S10 9 12 9s2.5 2 4.5 2S19 9 21 9M3 15c2 0 2 2 4.5 2S10 15 12 15s2.5 2 4.5 2 2.5-2 4.5-2"/>',
  tower: '<path d="M9 21V7l3-4 3 4v14M8 21h8M9 11h6M12 21v-4"/>',
  church: '<path d="M12 2v5M10 4h4M8 21V11l4-3 4 3v10M7 21h10M11 21v-4h2v4M4 21v-6h4M20 21v-6h-4"/>',
  shopping: '<path d="M6 8h12l1 13H5L6 8zM9 8V6a3 3 0 016 0v2"/>',
  place: '<circle cx="12" cy="12" r="4"/>',
}
export const POI_PIN_SIZE: [number, number] = [33, 40]
/** Witte pin (1,25× de oude zwarte) met icoontje; onbekende soort → stip. */
export function poiPinSvg(kind?: string): string {
  const glyph = POI_GLYPHS[kind ?? ''] ?? POI_GLYPHS.place
  return `<svg width="${POI_PIN_SIZE[0]}" height="${POI_PIN_SIZE[1]}" viewBox="0 0 32 42" fill="none" aria-hidden="true">`
    + '<path d="M16 0.8C7.6 0.8 0.8 7.6 0.8 16c0 11.4 15.2 24.8 15.2 24.8S31.2 27.4 31.2 16C31.2 7.6 24.4 0.8 16 0.8z" fill="#fff" stroke="#141414" stroke-width="1.6"/>'
    + `<g transform="translate(8 8) scale(0.667)" stroke="#141414" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">${glyph}</g></svg>`
}
export const POI_PIN_SVG = poiPinSvg()

/** Markers die elkaar overlappen uit elkaar duwen (pixels, na elke zoom
 *  opnieuw vanaf de echte coördinaten). Geografisch iets minder precies, maar
 *  elke marker blijft zichtbaar en klikbaar. `anchor`: 'center' (hotelbol) of
 *  'bottom' (pin met de punt op de plek). */
export interface SpreadItem { marker: Leaflet.Marker; w: number; h: number; anchor: 'center' | 'bottom' }
export function spreadMarkers(L: L, map: Leaflet.Map, items: SpreadItem[], margin = 4): void {
  type Box = { x: number; y: number; it: SpreadItem }
  const boxes: Box[] = items.map((it) => {
    const m = it.marker as Leaflet.Marker & { __orig?: Leaflet.LatLng }
    if (!m.__orig) m.__orig = m.getLatLng()
    const p = map.latLngToLayerPoint(m.__orig)
    return { x: p.x, y: p.y, it }
  })
  const rect = (b: Box) => (b.it.anchor === 'bottom'
    ? { l: b.x - b.it.w / 2, r: b.x + b.it.w / 2, t: b.y - b.it.h, b: b.y }
    : { l: b.x - b.it.w / 2, r: b.x + b.it.w / 2, t: b.y - b.it.h / 2, b: b.y + b.it.h / 2 })
  for (let iter = 0; iter < 80; iter++) {
    let moved = false
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const A = boxes[i]!, B = boxes[j]!
        const a = rect(A), b = rect(B)
        const ox = Math.min(a.r, b.r) - Math.max(a.l, b.l) + margin
        const oy = Math.min(a.b, b.b) - Math.max(a.t, b.t) + margin
        if (ox <= 0 || oy <= 0) continue
        // Kleinste verschuiving: horizontaal of verticaal uit elkaar.
        if (ox < oy) { const s = A.x <= B.x ? 1 : -1; A.x -= s * ox / 2; B.x += s * ox / 2 }
        else { const s = A.y <= B.y ? 1 : -1; A.y -= s * oy / 2; B.y += s * oy / 2 }
        moved = true
      }
    }
    if (!moved) break
  }
  boxes.forEach(b => b.it.marker.setLatLng(map.layerPointToLatLng(L.point(b.x, b.y))))
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

/** Route als lijn (witte halo + donkere lijn): de echte rijroute per etappe
 *  als `legs` (OSRM-geometrie) meekomt, anders hemelsbreed. Optioneel per
 *  etappe een label halverwege de lijn (afstand + reistijd). Geeft de
 *  bounds van de getekende route terug, zodat de kaart erop kan inzoomen. */
export function addTripRoute(
  L: L,
  map: Leaflet.Map,
  stops: TripMapStop[],
  opts: { distances?: boolean; weight?: number; legs?: TripRouteLeg[]; labelMode?: 'full' | 'short'; returnLabel?: string } = {},
): Leaflet.LatLngBounds | null {
  if (stops.length < 2) return null
  const w = opts.weight ?? 3
  const segments = stops.slice(1).map((s, k) => {
    const i = k + 1
    const leg = opts.legs?.find(l => l.from === i - 1 && l.to === i)
    const pts: [number, number][] = leg && leg.coords.length > 1
      ? leg.coords
      : [[stops[i - 1]!.lat, stops[i - 1]!.lng], [s.lat, s.lng]]
    return { i, leg, pts }
  })
  const bounds = L.latLngBounds([])
  for (const seg of segments) {
    L.polyline(seg.pts, { color: '#fff', weight: w + 4, opacity: 0.9, lineJoin: 'round', lineCap: 'round', interactive: false }).addTo(map)
  }
  for (const seg of segments) {
    const line = L.polyline(seg.pts, { color: '#141414', weight: w, lineJoin: 'round', lineCap: 'round', interactive: false }).addTo(map)
    bounds.extend(line.getBounds())
  }
  if (opts.distances) {
    for (const seg of segments) {
      const stop = stops[seg.i]!
      const text = opts.labelMode === 'short'
        ? (stop.travelShort ?? (seg.leg ? `${seg.leg.minutes} min` : ''))
        : (stop.travelLabel ?? (stop.travelKm ? `${stop.travelKm} km` : seg.leg ? `${seg.leg.km} km` : ''))
      if (!text) continue
      const icon = L.divIcon({ className: 'tml-km-wrap', html: `<span class="tml-km">${escapeHtml(text)}</span>`, iconSize: [0, 0], iconAnchor: [0, 0] })
      L.marker(midpointAlong(seg.pts), { icon, interactive: false, keyboard: false, zIndexOffset: 500 }).addTo(map)
    }
  }
  // Terugetappe van een rondje: gestippeld, met eigen label.
  const ret = opts.legs?.find(l => l.return && l.coords.length > 1)
  if (ret) {
    L.polyline(ret.coords, { color: '#fff', weight: w + 4, opacity: 0.9, lineJoin: 'round', lineCap: 'round', interactive: false }).addTo(map)
    const line = L.polyline(ret.coords, { color: '#141414', weight: w, dashArray: '8 8', lineJoin: 'round', lineCap: 'round', interactive: false }).addTo(map)
    bounds.extend(line.getBounds())
    if (opts.distances) {
      const text = opts.returnLabel ?? `${ret.km} km`
      const icon = L.divIcon({ className: 'tml-km-wrap', html: `<span class="tml-km">${escapeHtml(text)}</span>`, iconSize: [0, 0], iconAnchor: [0, 0] })
      // Iets voorbij het midden (richting het eerste hotel), zodat het label niet
      // onder de naam van het laatste hotel valt bij een korte terugetappe.
      L.marker(midpointAlong(ret.coords, 0.62), { icon, interactive: false, keyboard: false, zIndexOffset: 500 }).addTo(map)
    }
  }
  return bounds
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
      html: `<span class="tml-hotel__num">${i + 1}</span><span class="tml-hotel__name" style="font-size:${labelSize}px;--tml-gap:${size + 6}px">${escapeHtml(label)}</span>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    })
    const m = L.marker([s.lat, s.lng], { icon, interactive: clickable || !!opts.hoverHtml, keyboard: false, zIndexOffset: 1000 }).addTo(map)
    if (opts.hoverHtml) m.bindTooltip(opts.hoverHtml(s, i), { ...TOOLTIP, offset: [0, -size / 2 - 6] })
    if (opts.onClick) m.on('click', (e) => { L.DomEvent.stopPropagation(e); opts.onClick!(i) })
    return m
  })
}

/** Houd de naam/plaatsnaam naast een hotelmarker binnen de kaart: valt het
 *  label rechts buiten beeld, dan komt het links van de bol te staan
 *  (`tml-hotel--flip`). Aanroepen na fitBounds en bij moveend/resize. */
export function keepLabelsInView(map: Leaflet.Map, markers: Leaflet.Marker[]): void {
  const box = map.getContainer().getBoundingClientRect()
  for (const m of markers) {
    const el = m.getElement()
    const name = el?.querySelector<HTMLElement>('.tml-hotel__name')
    if (!el || !name) continue
    el.classList.remove('tml-hotel--flip')
    const r = name.getBoundingClientRect()
    if (r.right > box.right - 4) {
      el.classList.add('tml-hotel--flip')
      // Past het links ook niet, dan toch rechts (minste schade).
      if (name.getBoundingClientRect().left < box.left + 4) el.classList.remove('tml-hotel--flip')
    }
  }
}

/** Omgevingshighlights als pin met hover-kaartje. */
export function addTripHighlights(L: L, map: Leaflet.Map, highlights: TripMapHighlight[], opts: { onClick?: (index: number) => void; /** Hover-kaartjes (standaard aan; mobiel uit). */ tooltips?: boolean } = {}): Leaflet.Marker[] {
  const [w, h] = POI_PIN_SIZE
  return highlights.map((hl, i) => {
    const icon = L.divIcon({ className: 'tml-pin', html: poiPinSvg(hl.kind), iconSize: [w, h], iconAnchor: [w / 2, h - 1] })
    const m = L.marker([hl.lat, hl.lng], { icon, keyboard: false, zIndexOffset: 800 }).addTo(map)
    if (opts.tooltips !== false) m.bindTooltip(hoverCardHtml({ image: hl.image, title: hl.name, lines: [hl.text] }), { ...TOOLTIP, offset: [0, -(h - 2)] })
    if (opts.onClick) m.on('click', () => opts.onClick!(i))
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

/** Standaard OpenStreetMap-tegels (de CARTO-basemaps vragen een API-key). */
export function addOsmTiles(L: L, map: Leaflet.Map, attribution = true): void {
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: attribution ? '© OpenStreetMap contributors' : '',
    maxZoom: 19,
  }).addTo(map)
}
