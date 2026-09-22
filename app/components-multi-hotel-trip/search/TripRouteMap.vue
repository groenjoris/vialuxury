<template>
  <!-- Multi Hotel Trip — schematisch routekaartje voor de vakantie-dealcard
       (170 × 224, rechterhelft van het fotogebied) én de minimap op de PDP
       (400 × 300 met grotere markers/labels, echte rijroutes via `legs` en
       de reistijd per etappe). De SVG schaalt mee en snijdt bij een iets
       andere verhouding wat af aan de randen (slice). Kaartlaag: water, land,
       IJsselmeer, provinciegrenzen, landsgrenzen — daarop de route met
       genummerde stops. -->
  <svg
    class="trm"
    :class="{ 'trm--overlay': overlay, 'trm--inverse': inverse }"
    :viewBox="`0 0 ${W} ${H}`"
    preserveAspectRatio="xMidYMid slice"
    role="img"
    :aria-label="ariaLabel"
    @click="$emit('map-click')"
  >
    <rect class="trm__water" x="0" y="0" :width="W" :height="H" />
    <path v-for="(d, i) in landPaths" :key="`land-${i}`" class="trm__land" :d="d" />
    <path v-for="(d, i) in lakePaths" :key="`lake-${i}`" class="trm__lake" :d="d" />
    <path v-for="(d, i) in provincePaths" :key="`prov-${i}`" class="trm__province" :d="d" />
    <!-- Regio's/provincies buiten NL (alleen met geo-namen, PDP-minimap). -->
    <path v-for="(d, i) in regionPaths" :key="`reg-${i}`" class="trm__province" :d="d" />
    <path v-for="(d, i) in borderPaths" :key="`border-${i}`" class="trm__border" :d="d" />
    <text
      v-for="lbl in countryLabels"
      :key="`lbl-${lbl.id}`"
      class="trm__label"
      :class="{ 'trm__label--name': geoNames }"
      :x="lbl.x"
      :y="lbl.y"
    >{{ geoNames ? (COUNTRY_NAMES[lbl.id] ?? lbl.id) : lbl.id }}</text>
    <!-- Regionamen (PDP-minimap): West-Vlaanderen, Pas-de-Calais, Gelderland … -->
    <text
      v-for="lbl in regionLabels"
      :key="`reg-lbl-${lbl.id}`"
      class="trm__region"
      :x="lbl.x"
      :y="lbl.y"
    >{{ lbl.name }}</text>
    <!-- Route: de echte rijroute per etappe (legs, met witte halo) of hemelsbreed. -->
    <template v-if="legPaths.length">
      <path v-for="(p, i) in legPaths" :key="`halo-${i}`" class="trm__route-halo" :d="p.d" />
      <path v-for="(p, i) in legPaths" :key="`leg-${i}`" class="trm__route" :class="{ 'trm__route--dashed': p.dashed }" :d="p.d" />
    </template>
    <polyline v-else class="trm__route" :points="routePoints" />
    <!-- Plaatsnamen naast de markers (PDP-minimap; op de card uit). -->
    <text
      v-for="(m, i) in markers"
      v-show="showLabels"
      :key="`city-${i}`"
      class="trm__city"
      :x="m.labelX"
      :y="m.y + 0.5"
      :text-anchor="m.labelAnchor"
      :style="{ fontSize: `${labelSize}px` }"
    >{{ stops[i]?.label }}</text>
    <!-- Afstand/reistijd halverwege elke etappe (PDP-minimap): zwarte pil, of
         `plain` = alleen zwarte tekst met witte rand, iets boven de lijn. -->
    <g v-for="lbl in legLabelPos" :key="`legl-${lbl.i}`" class="trm__leg" :class="{ 'trm__leg--plain': legLabelStyle === 'plain' }" :transform="`translate(${lbl.x} ${lbl.y})`">
      <rect v-if="legLabelStyle !== 'plain'" :x="-lbl.w / 2" :y="-lbl.h / 2" :width="lbl.w" :height="lbl.h" :rx="lbl.h / 2" />
      <text :y="legLabelStyle === 'plain' ? -legLabelSize * 0.9 : 0" :style="{ fontSize: `${legLabelSize}px` }">{{ lbl.text }}</text>
    </g>
    <g
      v-for="(m, i) in markers"
      :key="`stop-${i}`"
      class="trm__marker"
      :class="{ 'trm__marker--interactive': interactive || hoverable, 'trm__marker--hover': hover === i }"
      :transform="`translate(${m.x} ${m.y})`"
      :tabindex="interactive ? 0 : undefined"
      :role="interactive ? 'button' : undefined"
      :aria-label="interactive ? (stops[i]?.title ?? stops[i]?.label) : undefined"
      @click="onMarkerClick($event, i)"
      @keydown.enter.prevent="interactive && $emit('stop-click', i)"
      @mouseenter="setHover(i)"
      @mouseleave="setHover(null)"
      @focus="setHover(i)"
      @blur="setHover(null)"
    >
      <circle :r="markerRadius" />
      <!-- Hotel-icoon (aangeleverde set, assets/icons/iconen/hotel), het volgnummer, of niets (stipjes). -->
      <g v-if="markerIcon" class="trm__marker-icon" :transform="`translate(${-12 * iconScale} ${-12 * iconScale}) scale(${iconScale})`" v-html="HOTEL_GLYPH" />
      <text v-else-if="!dots" y="0.5" :style="{ fontSize: `${numberSize}px` }">{{ i + 1 }}</text>
    </g>
    <!-- Hover/focus: hotelnaam boven de marker. -->
    <g v-if="interactive && hover !== null && tip" class="trm__tip" :transform="`translate(${tip.x} ${tip.y})`">
      <rect :x="-tip.w / 2" :y="-tip.h" :width="tip.w" :height="tip.h" rx="4" />
      <text :y="-tip.h / 2" :style="{ fontSize: `${labelSize}px` }">{{ tip.text }}</text>
    </g>
  </svg>
</template>

<script setup lang="ts">
import shapes from '~/data/mht-route-map-shapes.json'
import type { TripRouteLeg } from '~/utils-multi-hotel-trip/tripMapLayers'

interface Shape { id: string; rings: number[][][] }
interface StopPoint { lat: number; lng: number; label?: string; title?: string }

const props = withDefaults(defineProps<{
  /** Stops in reisvolgorde (lat/lng in graden). */
  stops: StopPoint[]
  /** Maximale zoom in px per graad breedte — begrenst het inzoomen op korte
   *  routes zodat er genoeg kust/grenzen in beeld blijven om de plek te
   *  herkennen. */
  maxScale?: number
  /** Plaatsnamen naast de markers tonen (PDP-minimap). */
  showLabels?: boolean
  /** Markers klikbaar (stop-click) met hotelnaam-tooltip bij hover. */
  interactive?: boolean
  /** Alleen hover (stop-hover), geen klik/tooltip — dealcard: de card toont
   *  zelf de foto en naam van het gehoverde hotel. */
  hoverable?: boolean
  /** Tekenruimte (viewBox) in px; de SVG schaalt mee met zijn container. */
  width?: number
  height?: number
  /** Echte rijroutes per etappe (OSRM); zonder legs hemelsbreed. */
  legs?: TripRouteLeg[]
  /** Label per stop (index ≥ 1) halverwege de etappe ernaartoe: "50 min". */
  legLabels?: (string | undefined)[]
  /** Maten in viewBox-px: bolstraal, cijfer, plaatsnaam, reistijdlabel. */
  markerRadius?: number
  numberSize?: number
  labelSize?: number
  legLabelSize?: number
  /** Volledige landnamen + regionamen i.p.v. landcodes (PDP-minimap). */
  geoNames?: boolean
  /** Hotel-icoon in de bol i.p.v. het volgnummer. */
  markerIcon?: boolean
  /** Etappelabel: zwarte pil of alleen tekst ("45 km") boven de lijn. */
  legLabelStyle?: 'pill' | 'plain'
  /** Label halverwege de gestippelde terugetappe (`legs[].return`), bv. "20 km". */
  returnLegLabel?: string
  /** Dealcard-variant "overlay": kaartlaag semi-transparant over de foto;
   *  route, markers en namen blijven dekkend. */
  overlay?: boolean
  /** Dealcard-variant "inverse": overlay met donkere landmassa, witte route,
   *  plaatsnamen en markers (gebruik samen met `overlay`). */
  inverse?: boolean
  /** Alleen stipjes als marker (geen nummer) — mini-kaartje in de collage-variant. */
  dots?: boolean
}>(), {
  maxScale: 200,
  showLabels: false,
  interactive: false,
  hoverable: false,
  width: 170,
  height: 224,
  legs: () => [],
  legLabels: () => [],
  markerRadius: 10,
  numberSize: 11,
  labelSize: 9,
  legLabelSize: 11,
  geoNames: false,
  markerIcon: false,
  legLabelStyle: 'pill',
  overlay: false,
  inverse: false,
  dots: false,
})

/** Hotel-glyph uit de aangeleverde iconenset (24 × 24, lijnen), wit op de zwarte bol. */
const HOTEL_GLYPH = '<path d="M10 22.0026V18H14V22.0026" stroke="#fff" stroke-width="2"/><path d="M5 4C5 2.89543 5.89543 2 7 2H17C18.1046 2 19 2.89543 19 4V15.5L21 16V22H3V16L5 15.5V4Z" stroke="#fff" stroke-width="2" fill="none"/><path d="M15 6H14M15 10H14M15 14H14M10 6H9M10 10H9M10 14H9" stroke="#fff" stroke-width="2" stroke-linecap="square"/>'
const iconScale = computed(() => (props.markerRadius * 1.15) / 24)

/** Nederlandse land- en regionamen voor de kaart (data: Natural Earth, Engels). */
const COUNTRY_NAMES: Record<string, string> = { NL: 'Nederland', BE: 'België', FR: 'Frankrijk', DE: 'Duitsland', GB: 'Verenigd Koninkrijk', LU: 'Luxemburg' }
const REGION_NAMES: Record<string, string> = {
  'West Flanders': 'West-Vlaanderen', 'East Flanders': 'Oost-Vlaanderen', 'Antwerp': 'Antwerpen', 'Liege': 'Luik',
  'Flemish Brabant': 'Vlaams-Brabant', 'Walloon Brabant': 'Waals-Brabant', 'Brussels': 'Brussel', 'Hainaut': 'Henegouwen',
  'Namur': 'Namen', 'Luxembourg': 'Luxemburg', 'Nordrhein-Westfalen': 'Noordrijn-Westfalen', 'Niedersachsen': 'Nedersaksen',
}

const emit = defineEmits<{ 'stop-click': [index: number]; 'stop-hover': [index: number | null]; 'map-click': [] }>()

const hover = ref<number | null>(null)
/** Alleen bij `interactive` vangt de marker de klik zelf af (hotel-pop-up);
 *  op de dealcard (hoverable) bubbelt de klik door naar de kaart → dealpagina. */
function onMarkerClick(e: MouseEvent, i: number) {
  if (!props.interactive) return
  e.stopPropagation()
  e.preventDefault()
  emit('stop-click', i)
}
function setHover(i: number | null) {
  hover.value = i
  if (props.hoverable || props.interactive) emit('stop-hover', i)
}

/** Tekenruimte (px) — vast per gebruik (card 170 × 224, PDP 400 × 300). */
const W = props.width
const H = props.height
/** Deel van de breedte/hoogte dat rondom de stops vrij blijft. */
const PAD = 0.24

const data = shapes as unknown as { countries: Shape[]; provinces: Shape[]; lakes: Shape[]; borders?: Shape[]; regions?: (Shape & { country?: string })[] }

/** Equirectangular projectie rond de route: u = lng · cos(lat0), v = lat. */
const frame = computed(() => {
  // Kader om de stops én de gereden route (die kan buiten de stops uitbuigen).
  const legPts = props.legs.flatMap(l => l.coords.map(([lat, lng]) => ({ lat, lng })))
  const pts = props.stops.length ? [...props.stops, ...legPts] : [{ lat: 52.2, lng: 5.3 }]
  const lat0 = props.stops.length ? props.stops.reduce((s, p) => s + p.lat, 0) / props.stops.length : 52.2
  const cos = Math.cos((lat0 * Math.PI) / 180)
  const us = pts.map(p => p.lng * cos)
  const vs = pts.map(p => p.lat)
  const uMin = Math.min(...us), uMax = Math.max(...us)
  const vMin = Math.min(...vs), vMax = Math.max(...vs)
  const spanU = Math.max(uMax - uMin, 0.01)
  const spanV = Math.max(vMax - vMin, 0.01)
  const kx = (W * (1 - 2 * PAD)) / spanU
  const ky = (H * (1 - 2 * PAD)) / spanV
  const k = Math.min(kx, ky, props.maxScale)
  return { cos, k, uc: (uMin + uMax) / 2, vc: (vMin + vMax) / 2 }
})

function project(lng: number, lat: number): [number, number] {
  const { cos, k, uc, vc } = frame.value
  return [W / 2 + (lng * cos - uc) * k, H / 2 - (lat - vc) * k]
}

/** Zichtbaar venster in graden, met marge, om alleen relevante vormen te tekenen. */
const window_ = computed(() => {
  const { cos, k, uc, vc } = frame.value
  const halfU = (W / 2) / k
  const halfV = (H / 2) / k
  return {
    lngMin: (uc - halfU * 1.3) / cos, lngMax: (uc + halfU * 1.3) / cos,
    latMin: vc - halfV * 1.3, latMax: vc + halfV * 1.3,
  }
})

function ringInView(ring: number[][]): boolean {
  const w = window_.value
  let lngMin = Infinity, lngMax = -Infinity, latMin = Infinity, latMax = -Infinity
  for (const [lng, lat] of ring) {
    if (lng! < lngMin) lngMin = lng!
    if (lng! > lngMax) lngMax = lng!
    if (lat! < latMin) latMin = lat!
    if (lat! > latMax) latMax = lat!
  }
  return !(lngMax < w.lngMin || lngMin > w.lngMax || latMax < w.latMin || latMin > w.latMax)
}

function ringPath(ring: number[][]): string {
  let d = ''
  ring.forEach(([lng, lat], i) => {
    const [x, y] = project(lng!, lat!)
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
  })
  return `${d}Z`
}

function pathsOf(list: Shape[]): string[] {
  const out: string[] = []
  for (const s of list) for (const ring of s.rings) if (ringInView(ring)) out.push(ringPath(ring))
  return out
}

const landPaths = computed(() => pathsOf(data.countries))
/** Regiogrenzen buiten Nederland (NL tekent de nauwkeurigere cartomap-provincies). */
const regionPaths = computed(() => props.geoNames ? pathsOf((data.regions ?? []).filter(r => r.country !== 'NLD')) : [])
const lakePaths = computed(() => pathsOf(data.lakes))
const provincePaths = computed(() => pathsOf(data.provinces))
/** Landsgrenzen nog een keer als lijn bovenop de provincies, zodat de
 *  buitengrens van Nederland (en de kustlijn) duidelijk blijft. */
/** Landsgrenzen over land (Natural Earth boundary lines): open paden, geen kust. */
const borderPaths = computed(() => {
  const out: string[] = []
  for (const shape of data.borders ?? []) {
    for (const ring of shape.rings) {
      if (!ringInView(ring)) continue
      let d = ''
      ring.forEach(([lng, lat], i) => {
        const [x, y] = project(lng!, lat!)
        d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
      })
      out.push(d)
    }
  }
  return out
})

/** Punt-in-polygoon (even-odd) in graden. */
function inRing(lng: number, lat: number, ring: number[][]): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]!
    const [xj, yj] = ring[j]!
    if ((yi! > lat) !== (yj! > lat) && lng < ((xj! - xi!) * (lat - yi!)) / (yj! - yi!) + xi!) inside = !inside
  }
  return inside
}

/** Kleine landcodes (NL / BE / DE / FR / GB) op het zichtbare landoppervlak —
 *  helpt herkennen waar de route ongeveer ligt. Plaatsing: zwaartepunt van
 *  de rasterpunten in beeld die in het land liggen (dus midden in het
 *  zichtbare stuk land, nooit op een grenslijn). Alleen wanneer genoeg van
 *  het land in beeld is en niet te dicht bij een stop of de rand. */
const countryLabels = computed(() => {
  const out: { id: string; x: number; y: number }[] = []
  const stopPx = props.stops.map(s => project(s.lng, s.lat))
  const { cos, k, uc, vc } = frame.value
  const COLS = 12, ROWS = 16
  const total = COLS * ROWS
  for (const c of data.countries) {
    const rings = c.rings.filter(ringInView)
    if (!rings.length) continue
    let sx = 0, sy = 0, n = 0
    for (let i = 0; i < COLS; i++) {
      for (let j = 0; j < ROWS; j++) {
        const x = ((i + 0.5) / COLS) * W
        const y = ((j + 0.5) / ROWS) * H
        const lng = (uc + (x - W / 2) / k) / cos
        const lat = vc - (y - H / 2) / k
        if (rings.some(r => inRing(lng, lat, r))) { sx += x; sy += y; n++ }
      }
    }
    // Met volledige namen (PDP) volstaat een kleiner zichtbaar deel, zodat ook
    // een buurland aan de rand (België) zijn naam krijgt.
    if (n / total < (props.geoNames ? 0.04 : 0.1)) continue
    let x = sx / n, y = sy / n
    // Binnen de kaart houden en niet over een stop heen.
    x = Math.min(Math.max(x, 14), W - 14)
    y = Math.min(Math.max(y, 10), H - 10)
    if (stopPx.some(([px, py]) => Math.hypot(px - x, py - y) < 24)) y = y < H / 2 ? y - 18 : y + 18
    out.push({ id: c.id, x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) })
  }
  return out
})

/** Regionamen (alleen met geo-namen): zwaartepunt van de zichtbare rasterpunten
 *  in de regio, alleen als genoeg van de regio in beeld is en niet op een stop
 *  of een ander label. */
const regionLabels = computed(() => {
  if (!props.geoNames) return [] as { id: string; name: string; x: number; y: number }[]
  const out: { id: string; name: string; x: number; y: number }[] = []
  const stopPx = props.stops.map(s => project(s.lng, s.lat))
  const taken: [number, number][] = [...stopPx, ...countryLabels.value.map(l => [l.x, l.y] as [number, number])]
  const { cos, k, uc, vc } = frame.value
  const COLS = 20, ROWS = 15
  for (const r of data.regions ?? []) {
    const rings = r.rings.filter(ringInView)
    if (!rings.length) continue
    let sx = 0, sy = 0, n = 0
    for (let i = 0; i < COLS; i++) {
      for (let j = 0; j < ROWS; j++) {
        const x = ((i + 0.5) / COLS) * W
        const y = ((j + 0.5) / ROWS) * H
        const lng = (uc + (x - W / 2) / k) / cos
        const lat = vc - (y - H / 2) / k
        if (rings.some(ring => inRing(lng, lat, ring))) { sx += x; sy += y; n++ }
      }
    }
    if (n / (COLS * ROWS) < 0.05) continue
    const x = Math.min(Math.max(sx / n, 30), W - 30), y = Math.min(Math.max(sy / n, 12), H - 12)
    if (taken.some(([px, py]) => Math.hypot(px - x, py - y) < 34)) continue
    taken.push([x, y])
    out.push({ id: r.id, name: REGION_NAMES[r.id] ?? r.id, x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) })
  }
  return out
})

const markers = computed(() => props.stops.map((s) => {
  const [x, y] = project(s.lng, s.lat)
  // Plaatsnaam rechts van de marker; dicht bij de rechterrand links ervan.
  const gap = props.markerRadius + 4
  const right = x + gap + (s.label?.length ?? 0) * props.labelSize * 0.58 <= W - 4
  return {
    x: Number(x.toFixed(1)),
    y: Number(y.toFixed(1)),
    labelX: Number((right ? x + gap : x - gap).toFixed(1)),
    labelAnchor: right ? 'start' : 'end',
  }
}))

/** Echte rijroute per etappe als SVG-pad (geprojecteerd); de terugetappe van een rondje gestippeld. */
const legPaths = computed(() => props.legs
  .filter(l => l.coords.length > 1)
  .map(l => ({
    d: l.coords.map(([lat, lng], i) => { const [x, y] = project(lng, lat); return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}` }).join(''),
    dashed: !!l.return,
  })))

/** Punt halverwege een (geprojecteerde) lijn, gemeten langs de lijn. */
function midpointAlong(pts: [number, number][]): [number, number] {
  let total = 0
  const seg = pts.slice(1).map((p, i) => { const d = Math.hypot(p[0] - pts[i]![0], p[1] - pts[i]![1]); total += d; return d })
  let acc = 0
  for (let i = 0; i < seg.length; i++) {
    if (acc + seg[i]! >= total / 2) {
      const f = seg[i]! ? (total / 2 - acc) / seg[i]! : 0
      const a = pts[i]!, b = pts[i + 1]!
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]
    }
    acc += seg[i]!
  }
  return pts[pts.length - 1] ?? [0, 0]
}

/** Reistijdlabels halverwege elke etappe (langs de echte route of de rechte lijn). */
const legLabelPos = computed(() => {
  const out: { i: number; x: number; y: number; w: number; h: number; text: string }[] = []
  for (let i = 1; i < props.stops.length; i++) {
    const text = props.legLabels[i]
    if (!text) continue
    const leg = props.legs.find(l => l.from === i - 1 && l.to === i)
    const pts: [number, number][] = leg && leg.coords.length > 1
      ? leg.coords.map(([lat, lng]) => project(lng, lat))
      : [project(props.stops[i - 1]!.lng, props.stops[i - 1]!.lat), project(props.stops[i]!.lng, props.stops[i]!.lat)]
    const [x, y] = midpointAlong(pts)
    const h = props.legLabelSize * 1.7
    out.push({ i, x: Number(x.toFixed(1)), y: Number(y.toFixed(1)), w: text.length * props.legLabelSize * 0.6 + props.legLabelSize, h, text })
  }
  // Terugetappe van een rondje: label halverwege de gestippelde lijn.
  const ret = props.legs.find(l => l.return && l.coords.length > 1)
  if (ret && props.returnLegLabel) {
    const [x, y] = midpointAlong(ret.coords.map(([lat, lng]) => project(lng, lat)))
    const h = props.legLabelSize * 1.7
    out.push({ i: props.stops.length, x: Number(x.toFixed(1)), y: Number(y.toFixed(1)), w: props.returnLegLabel.length * props.legLabelSize * 0.6 + props.legLabelSize, h, text: props.returnLegLabel })
  }
  return out
})

/** Tooltip met de hotelnaam boven de gehoverde marker, binnen het kader. */
const tip = computed(() => {
  if (hover.value === null) return null
  const m = markers.value[hover.value]
  const s = props.stops[hover.value]
  if (!m || !s) return null
  const text = s.title ?? s.label ?? ''
  const h = props.labelSize * 1.8
  const w = Math.min(W - 8, text.length * props.labelSize * 0.57 + props.labelSize)
  const x = Math.min(Math.max(m.x, w / 2 + 4), W - w / 2 - 4)
  const above = m.y - props.markerRadius - 3
  const y = above - h < 2 ? m.y + props.markerRadius + 3 + h : above
  return { x, y, w, h, text }
})

const routePoints = computed(() => markers.value.map(m => `${m.x},${m.y}`).join(' '))

const ariaLabel = computed(() => `Route: ${props.stops.map((s, i) => `${i + 1}. ${s.label ?? ''}`.trim()).join(' – ')}`)
</script>

<style scoped>
.trm {
  display: block;
  width: 100%;
  height: 100%;
}
.trm__water {
  fill: #d7e6f0;
}
/* Overlay-variant (dealcard): de kaartlaag laat de foto doorschemeren; route,
   markers en plaatsnamen blijven volledig dekkend. */
.trm--overlay .trm__water { fill: rgba(215, 230, 240, 0.55); }
.trm--overlay .trm__land { fill: rgba(243, 239, 230, 0.66); }
.trm--overlay .trm__lake { fill: rgba(215, 230, 240, 0.6); }
.trm--overlay .trm__province { stroke: rgba(224, 217, 204, 0.75); }
.trm--overlay .trm__border { stroke: rgba(111, 102, 90, 0.8); }
.trm--overlay .trm__label { fill: rgba(80, 74, 64, 0.8); }
/* Inverse overlay (dealcard-variant "inverse"): donkergroene (huisstijl, #00675f)
   kaartlaag over de foto, water iets lichter zodat de kustlijn leesbaar blijft;
   route, grenzen, plaatsnamen en markers in wit. */
.trm--inverse .trm__water { fill: rgba(0, 70, 78, 0.42); }
.trm--inverse .trm__lake { fill: rgba(0, 70, 78, 0.42); }
.trm--inverse .trm__land { fill: rgba(0, 103, 95, 0.64); }
.trm--inverse .trm__province { stroke: rgba(255, 255, 255, 0.25); }
.trm--inverse .trm__border { stroke: rgba(255, 255, 255, 0.7); }
.trm--inverse .trm__label { fill: rgba(255, 255, 255, 0.8); }
.trm--inverse .trm__region { fill: rgba(255, 255, 255, 0.65); }
.trm--inverse .trm__route { stroke: #fff; }
.trm--inverse .trm__route-halo { stroke: rgba(0, 60, 56, 0.55); }
.trm--inverse .trm__leg rect { fill: #fff; }
.trm--inverse .trm__leg text { fill: #00675f; }
.trm--inverse .trm__leg--plain text { fill: #fff; stroke: rgba(0, 60, 56, 0.85); }
.trm--inverse .trm__marker circle { fill: #fff; stroke: #00675f; }
.trm--inverse .trm__marker text { fill: #00675f; }
.trm--inverse .trm__marker-icon path { stroke: #00675f; }
.trm--inverse .trm__marker--interactive.trm__marker--hover circle { fill: var(--color-primary, #ff7e00); stroke: #fff; }
.trm--inverse .trm__marker--interactive.trm__marker--hover text { fill: #fff; }
.trm--inverse .trm__city { fill: #fff; stroke: rgba(0, 60, 56, 0.9); }
.trm__land {
  fill: #f3efe6;
  stroke: none;
}
.trm__lake {
  fill: #d7e6f0;
}
.trm__province {
  fill: none;
  stroke: #e0d9cc;
  stroke-width: 0.8;
  vector-effect: non-scaling-stroke;
}
/* Landsgrenzen: donkerder en gestreept, duidelijk te onderscheiden van
   provinciegrenzen en kustlijn. */
.trm__border {
  fill: none;
  stroke: #6f665a;
  stroke-width: 1.6;
  stroke-dasharray: 4 2.5;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
}
.trm__label {
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  fill: #a89f8f;
  text-anchor: middle;
  dominant-baseline: central;
  pointer-events: none;
}
/* Volledige landnamen (PDP-minimap). */
.trm__label--name { font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; }
/* Regionamen: klein, cursief, gedempt. */
.trm__region {
  font-family: var(--font-body);
  font-size: 11px;
  font-style: italic;
  fill: #8f8778;
  text-anchor: middle;
  dominant-baseline: central;
  pointer-events: none;
}
.trm__route {
  fill: none;
  stroke: #141414;
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
}
/* Terugetappe van een rondje (laatste hotel → eerste hotel): gestippeld. */
.trm__route--dashed { stroke-dasharray: 5 4; }
/* Witte halo onder de echte rijroute, zodat hij leesbaar blijft over grenzen en namen. */
.trm__route-halo {
  fill: none;
  stroke: #fff;
  stroke-width: 5;
  stroke-linejoin: round;
  stroke-linecap: round;
  opacity: 0.9;
  vector-effect: non-scaling-stroke;
}
/* Reistijd halverwege een etappe: zwarte pil (zelfde stijl als op de grote kaart). */
.trm__leg { pointer-events: none; }
.trm__leg rect { fill: #141414; }
.trm__leg text {
  font-family: var(--font-body);
  font-weight: 700;
  fill: #fff;
  text-anchor: middle;
  dominant-baseline: central;
}
/* Zonder pil: zwarte tekst met witte rand, boven de lijn. */
.trm__leg--plain text {
  fill: #141414;
  stroke: #fff;
  stroke-width: 3;
  paint-order: stroke;
  stroke-linejoin: round;
}
.trm__marker-icon { pointer-events: none; }
/* Standaardstijl hotelmarkers: zwarte bol, oranje bij hover. */
.trm__marker circle {
  fill: #141414;
  stroke: #fff;
  stroke-width: 2;
  transition: fill 150ms ease;
}
.trm__marker text {
  font-family: var(--font-body);
  font-weight: 700;
  fill: #fff;
  text-anchor: middle;
  dominant-baseline: central;
  pointer-events: none;
}
/* Markers vangen muis-events ook wanneer de SVG zelf `pointer-events: none`
   heeft (dealcard: de kaart ligt boven de klik-overlay van de foto). */
.trm__marker--interactive { cursor: pointer; outline: none; pointer-events: auto; }
.trm__marker--interactive.trm__marker--hover circle { fill: var(--color-primary, #ff7e00); }
/* Plaatsnaam naast de marker, met witte rand voor leesbaarheid op de kaart. */
.trm__city {
  font-family: var(--font-body);
  font-weight: 600;
  fill: #141414;
  stroke: #fff;
  stroke-width: 2.5;
  paint-order: stroke;
  stroke-linejoin: round;
  dominant-baseline: central;
  pointer-events: none;
}
/* Hotelnaam-tooltip bij hover op een marker. */
.trm__tip { pointer-events: none; }
.trm__tip rect { fill: #141414; }
.trm__tip text {
  font-family: var(--font-body);
  font-size: 8px;
  font-weight: 600;
  fill: #fff;
  text-anchor: middle;
  dominant-baseline: central;
}
</style>
