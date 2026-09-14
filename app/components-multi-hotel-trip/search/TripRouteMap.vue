<template>
  <!-- Multi Hotel Trip — schematisch routekaartje voor de vakantie-dealcard.
       Vaste tekenruimte van 170 × 224 px (rechterhelft van het fotogebied);
       de SVG schaalt mee en snijdt bij een iets andere verhouding wat af aan
       de randen (slice). Kaartlaag: water, land (landsgrenzen NL/BE/FR/DE/GB),
       IJsselmeer, provinciegrenzen — daarop de route met genummerde stops. -->
  <svg
    class="trm"
    :viewBox="`0 0 ${W} ${H}`"
    preserveAspectRatio="xMidYMid slice"
    role="img"
    :aria-label="ariaLabel"
  >
    <rect class="trm__water" x="0" y="0" :width="W" :height="H" />
    <path v-for="(d, i) in landPaths" :key="`land-${i}`" class="trm__land" :d="d" />
    <path v-for="(d, i) in lakePaths" :key="`lake-${i}`" class="trm__lake" :d="d" />
    <path v-for="(d, i) in provincePaths" :key="`prov-${i}`" class="trm__province" :d="d" />
    <path v-for="(d, i) in borderPaths" :key="`border-${i}`" class="trm__border" :d="d" />
    <text
      v-for="lbl in countryLabels"
      :key="`lbl-${lbl.id}`"
      class="trm__label"
      :x="lbl.x"
      :y="lbl.y"
    >{{ lbl.id }}</text>
    <polyline class="trm__route" :points="routePoints" />
    <!-- Plaatsnamen naast de markers (PDP-minimap; op de card uit). -->
    <text
      v-for="(m, i) in markers"
      v-show="showLabels"
      :key="`city-${i}`"
      class="trm__city"
      :x="m.labelX"
      :y="m.y + 0.5"
      :text-anchor="m.labelAnchor"
    >{{ stops[i]?.label }}</text>
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
      <circle r="10" />
      <text y="0.5">{{ i + 1 }}</text>
    </g>
    <!-- Hover/focus: hotelnaam boven de marker. -->
    <g v-if="interactive && hover !== null && tip" class="trm__tip" :transform="`translate(${tip.x} ${tip.y})`">
      <rect :x="-tip.w / 2" y="-16" :width="tip.w" height="16" rx="4" />
      <text y="-7.5">{{ tip.text }}</text>
    </g>
  </svg>
</template>

<script setup lang="ts">
import shapes from '~/data/mht-route-map-shapes.json'

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
}>(), {
  maxScale: 200,
  showLabels: false,
  interactive: false,
  hoverable: false,
})

const emit = defineEmits<{ 'stop-click': [index: number]; 'stop-hover': [index: number | null] }>()

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

/** Tekenruimte (px). Verhouding ≈ de rechterhelft van het 224 px hoge fotogebied. */
const W = 170
const H = 224
/** Deel van de breedte/hoogte dat rondom de stops vrij blijft. */
const PAD = 0.24

const data = shapes as unknown as { countries: Shape[]; provinces: Shape[]; lakes: Shape[]; borders?: Shape[] }

/** Equirectangular projectie rond de route: u = lng · cos(lat0), v = lat. */
const frame = computed(() => {
  const pts = props.stops.length ? props.stops : [{ lat: 52.2, lng: 5.3 }]
  const lat0 = pts.reduce((s, p) => s + p.lat, 0) / pts.length
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
    if (n / total < 0.1) continue
    let x = sx / n, y = sy / n
    // Binnen de kaart houden en niet over een stop heen.
    x = Math.min(Math.max(x, 14), W - 14)
    y = Math.min(Math.max(y, 10), H - 10)
    if (stopPx.some(([px, py]) => Math.hypot(px - x, py - y) < 24)) y = y < H / 2 ? y - 18 : y + 18
    out.push({ id: c.id, x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) })
  }
  return out
})

const markers = computed(() => props.stops.map((s) => {
  const [x, y] = project(s.lng, s.lat)
  // Plaatsnaam rechts van de marker; dicht bij de rechterrand links ervan.
  const right = x + 14 + (s.label?.length ?? 0) * 5.2 <= W - 4
  return {
    x: Number(x.toFixed(1)),
    y: Number(y.toFixed(1)),
    labelX: Number((right ? x + 14 : x - 14).toFixed(1)),
    labelAnchor: right ? 'start' : 'end',
  }
}))

/** Tooltip met de hotelnaam boven de gehoverde marker, binnen het kader. */
const tip = computed(() => {
  if (hover.value === null) return null
  const m = markers.value[hover.value]
  const s = props.stops[hover.value]
  if (!m || !s) return null
  const text = s.title ?? s.label ?? ''
  const w = Math.min(W - 8, text.length * 5.1 + 10)
  const x = Math.min(Math.max(m.x, w / 2 + 4), W - w / 2 - 4)
  const y = m.y - 13 < 18 ? m.y + 30 : m.y - 13
  return { x, y, w, text }
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
.trm__route {
  fill: none;
  stroke: #141414;
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
}
/* Standaardstijl hotelmarkers: zwarte bol, oranje bij hover. */
.trm__marker circle {
  fill: #141414;
  stroke: #fff;
  stroke-width: 2;
  transition: fill 150ms ease;
}
.trm__marker text {
  font-family: var(--font-body);
  font-size: 11px;
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
  font-size: 9px;
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
