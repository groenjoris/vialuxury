<template>
  <!-- Multi Hotel Trip bevestiging — de route "op de foto": alleen de gereden route
       (OSRM-etappes) als witte lijn, witte genummerde bolletjes en de plaatsnamen
       ernaast, zonder kaartlaag. Zelfde equirectangular projectie als het routekaartje;
       de SVG mag buiten zijn viewBox tekenen (lange plaatsnamen). -->
  <svg class="crs" :viewBox="`0 0 ${W} ${H}`" overflow="visible" role="img" :aria-label="ariaLabel">
    <template v-if="legPaths.length">
      <path v-for="(p, i) in legPaths" :key="`leg-${i}`" class="crs__route" :class="{ 'crs__route--dashed': p.dashed }" :d="p.d" />
    </template>
    <polyline v-else class="crs__route" :points="markers.map(m => `${m.x},${m.y}`).join(' ')" />
    <g v-for="(m, i) in markers" :key="`stop-${i}`" :transform="`translate(${m.x} ${m.y})`">
      <circle class="crs__dot" :r="R" />
      <text class="crs__num" y="0.36em" text-anchor="middle">{{ i + 1 }}</text>
      <text class="crs__label" :x="m.labelX" y="0.36em" :text-anchor="m.anchor">{{ stops[i]?.label }}</text>
    </g>
  </svg>
</template>

<script setup lang="ts">
import type { TripRouteLeg } from '~/utils-multi-hotel-trip/tripMapLayers'

const props = withDefaults(defineProps<{
  /** Stops in reisvolgorde (lat/lng in graden) met de plaatsnaam. */
  stops: { lat: number; lng: number; label: string }[]
  /** Echte rijroutes per etappe; zonder legs hemelsbreed. */
  legs?: TripRouteLeg[]
  /** Tekenruimte (viewBox) in px; de SVG schaalt mee met zijn container. */
  width?: number
  height?: number
}>(), { legs: () => [], width: 380, height: 320 })

const W = computed(() => props.width)
const H = computed(() => props.height)
const R = 16
const LABEL_SIZE = 17
const PAD = 0.16

/** Equirectangular projectie rond stops én route: u = lng · cos(lat0), v = lat. */
const frame = computed(() => {
  const legPts = props.legs.flatMap(l => l.coords.map(([lat, lng]) => ({ lat, lng })))
  const pts = props.stops.length ? [...props.stops, ...legPts] : [{ lat: 52.2, lng: 5.3 }]
  const lat0 = props.stops.length ? props.stops.reduce((s, p) => s + p.lat, 0) / props.stops.length : 52.2
  const cos = Math.cos((lat0 * Math.PI) / 180)
  const us = pts.map(p => p.lng * cos)
  const vs = pts.map(p => p.lat)
  const uMin = Math.min(...us), uMax = Math.max(...us)
  const vMin = Math.min(...vs), vMax = Math.max(...vs)
  const k = Math.min((W.value * (1 - 2 * PAD)) / Math.max(uMax - uMin, 0.01), (H.value * (1 - 2 * PAD)) / Math.max(vMax - vMin, 0.01))
  return { cos, k, uc: (uMin + uMax) / 2, vc: (vMin + vMax) / 2 }
})
function project(lng: number, lat: number): [number, number] {
  const { cos, k, uc, vc } = frame.value
  return [W.value / 2 + (lng * cos - uc) * k, H.value / 2 - (lat - vc) * k]
}

const legPaths = computed(() => props.legs
  .filter(l => l.coords.length > 1)
  .map(l => ({
    d: l.coords.map(([lat, lng], i) => { const [x, y] = project(lng, lat); return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}` }).join(''),
    dashed: !!l.return,
  })))

/** Plaatsnaam aan de kant waar de route níet heen loopt (en binnen het kader). */
const markers = computed(() => props.stops.map((s, i) => {
  const [x, y] = project(s.lng, s.lat)
  const textW = (s.label?.length ?? 0) * LABEL_SIZE * 0.6
  const gap = R + 10
  // Richting van de route rond deze stop: gemiddelde horizontale afwijking van de dichtstbijzijnde routepunten.
  let dx = 0, n = 0
  for (const l of props.legs) {
    if (l.from !== i && l.to !== i) continue
    const pts = l.from === i ? l.coords.slice(0, 12) : l.coords.slice(-12)
    for (const [lat, lng] of pts) { dx += project(lng, lat)[0] - x; n++ }
  }
  if (!n && props.stops.length > 1) {
    const other = props.stops[i === props.stops.length - 1 ? i - 1 : i + 1]!
    dx = project(other.lng, other.lat)[0] - x; n = 1
  }
  let right = n ? dx / n < 0 : true
  if (right && x + gap + textW > W.value + 24) right = false
  if (!right && x - gap - textW < -24) right = true
  return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)), labelX: right ? gap : -gap, anchor: right ? 'start' : 'end' }
}))

const ariaLabel = computed(() => `Route: ${props.stops.map((s, i) => `${i + 1}. ${s.label}`).join(' – ')}`)
</script>

<style scoped>
.crs { display: block; width: 100%; height: auto; overflow: visible; filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.35)); }
.crs__route { fill: none; stroke: #fff; stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; }
.crs__route--dashed { stroke-dasharray: 2 10; }
.crs__dot { fill: #fff; }
.crs__num { fill: var(--c-via-black, #1a1e1e); font-family: var(--font-body, inherit); font-size: 15px; font-weight: 700; }
.crs__label { fill: #fff; font-family: var(--font-body, inherit); font-size: 17px; font-weight: 700; letter-spacing: 0.01em; }
</style>
