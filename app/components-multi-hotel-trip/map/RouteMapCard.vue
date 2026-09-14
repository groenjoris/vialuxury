<template>
  <!-- Multi Hotel Trip — brede routekaart onder de gallery van de
       vakantie-PDP. OpenStreetMap-tegels (zelfde kaartstijl als de gewone
       minimap), automatisch uitgezoomd tot alle hotels in beeld passen, met
       de route als lijn en genummerde markers 1-2-3 (zelfde stijl als het
       schematische kaartje op de dealcard). Tegels en markers worden pas na
       mount berekend (containermaat nodig), dus SSR levert alleen het kader. -->
  <div class="route-map">
    <div ref="boxRef" class="route-map__box" role="img" :aria-label="ariaLabel">
      <template v-if="ready">
        <div class="route-map__tiles">
          <img
            v-for="tile in tiles"
            :key="tile.key"
            :src="tile.url"
            class="route-map__tile"
            :style="tile.style"
            alt=""
          />
        </div>
        <svg class="route-map__overlay" :viewBox="`0 0 ${size.w} ${size.h}`" aria-hidden="true">
          <polyline class="route-map__line-halo" :points="linePoints" />
          <polyline class="route-map__line" :points="linePoints" />
          <g v-for="(m, i) in markers" :key="`m-${i}`" class="route-map__marker" :transform="`translate(${m.x} ${m.y})`">
            <circle r="13" />
            <text y="0.5">{{ i + 1 }}</text>
          </g>
        </svg>
        <span
          v-for="(m, i) in markers"
          :key="`l-${i}`"
          class="route-map__label"
          :style="{ left: `${m.x}px`, top: `${m.y}px` }"
        >{{ m.label }}</span>
      </template>
    </div>
    <div class="route-map__footer">
      <span class="route-map__route">
        <template v-for="(s, i) in stops" :key="`r-${i}`">
          <span class="route-map__route-stop"><span class="route-map__route-num">{{ i + 1 }}</span>{{ s.label }}</span>
          <span v-if="i < stops.length - 1" class="route-map__route-arrow" aria-hidden="true">→</span>
        </template>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { lngToTileX, latToTileY } from '~/utils-multi-hotel-trip/osmTiles'

interface RouteStop { lat: number; lng: number; label: string }

const props = withDefaults(defineProps<{
  /** Hotels in reisvolgorde. */
  stops: RouteStop[]
  /** Hoogste zoom; voorkomt dat een compacte route (30 km) te veel inzoomt. */
  maxZoom?: number
  minZoom?: number
}>(), {
  maxZoom: 11,
  minZoom: 5,
})

const TILE = 256
/** Vrije rand (px) rondom de uiterste markers, zodat labels binnen blijven. */
const PAD_X = 96
const PAD_Y = 56

const boxRef = ref<HTMLElement | null>(null)
const size = ref({ w: 0, h: 0 })
let ro: ResizeObserver | null = null

onMounted(() => {
  const el = boxRef.value
  if (!el) return
  const measure = () => { size.value = { w: el.clientWidth, h: el.clientHeight } }
  measure()
  ro = new ResizeObserver(measure)
  ro.observe(el)
})
onBeforeUnmount(() => { ro?.disconnect() })

const ready = computed(() => size.value.w > 0 && size.value.h > 0 && props.stops.length > 0)

const ariaLabel = computed(() => `Routekaart: ${props.stops.map(s => s.label).join(' → ')}`)

/** Zoom + kaartcentrum (in tegelcoördinaten) waarbij alle stops passen. */
const geom = computed(() => {
  const { w, h } = size.value
  const lats = props.stops.map(s => s.lat)
  const lngs = props.stops.map(s => s.lng)
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
  let z = props.maxZoom
  for (; z > props.minZoom; z--) {
    const dx = (lngToTileX(maxLng, z) - lngToTileX(minLng, z)) * TILE
    const dy = (latToTileY(minLat, z) - latToTileY(maxLat, z)) * TILE
    if (dx <= Math.max(0, w - 2 * PAD_X) && dy <= Math.max(0, h - 2 * PAD_Y)) break
  }
  const cx = (lngToTileX(minLng, z) + lngToTileX(maxLng, z)) / 2
  const cy = (latToTileY(minLat, z) + latToTileY(maxLat, z)) / 2
  return { z, cx, cy }
})

function project(lat: number, lng: number) {
  const { z, cx, cy } = geom.value
  const { w, h } = size.value
  return {
    x: (lngToTileX(lng, z) - cx) * TILE + w / 2,
    y: (latToTileY(lat, z) - cy) * TILE + h / 2,
  }
}

const tiles = computed(() => {
  if (!ready.value) return []
  const { z, cx, cy } = geom.value
  const { w, h } = size.value
  const n = 2 ** z
  const x0 = Math.floor(cx - w / 2 / TILE), x1 = Math.floor(cx + w / 2 / TILE)
  const y0 = Math.floor(cy - h / 2 / TILE), y1 = Math.floor(cy + h / 2 / TILE)
  const out: { key: string; url: string; style: Record<string, string> }[] = []
  for (let ty = y0; ty <= y1; ty++) {
    if (ty < 0 || ty >= n) continue
    for (let tx = x0; tx <= x1; tx++) {
      const txw = ((tx % n) + n) % n
      out.push({
        key: `${z}-${tx}-${ty}`,
        url: `https://tile.openstreetmap.org/${z}/${txw}/${ty}.png`,
        style: {
          left: `${(tx - cx) * TILE + w / 2}px`,
          top: `${(ty - cy) * TILE + h / 2}px`,
        },
      })
    }
  }
  return out
})

const markers = computed(() => {
  if (!ready.value) return []
  return props.stops.map(s => ({ ...project(s.lat, s.lng), label: s.label }))
})

const linePoints = computed(() => markers.value.map(m => `${m.x},${m.y}`).join(' '))
</script>

<style scoped>
.route-map {
  display: flex;
  flex-direction: column;
  gap: 8px;
  scroll-margin-top: 88px;
}
.route-map__box {
  position: relative;
  width: 100%;
  aspect-ratio: var(--vl-routemap-aspect, 8 / 3);
  max-height: var(--vl-routemap-max-h, none);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #e9e5dc;
  border: 1px solid var(--color-border-light);
}
.route-map__tiles {
  position: absolute;
  inset: 0;
}
.route-map__tile {
  position: absolute;
  width: 256px;
  height: 256px;
  display: block;
  user-select: none;
  pointer-events: none;
}
.route-map__overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
/* Route: dunne witte halo onder een donkere lijn, zodat de lijn op zowel
   groene als witte kaartdelen leesbaar blijft. */
.route-map__line-halo {
  fill: none;
  stroke: rgba(255, 255, 255, 0.85);
  stroke-width: 6;
  stroke-linejoin: round;
  stroke-linecap: round;
}
.route-map__line {
  fill: none;
  stroke: #141414;
  stroke-width: 2.5;
  stroke-linejoin: round;
  stroke-linecap: round;
}
/* Markers: zelfde oranje bol met wit nummer als op het dealcard-kaartje. */
.route-map__marker circle {
  fill: var(--color-primary, #ff7e00);
  stroke: #fff;
  stroke-width: 2.5;
}
.route-map__marker text {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
  fill: #fff;
  text-anchor: middle;
  dominant-baseline: central;
}
/* Plaatsnaam rechts naast de marker, wit label met lichte schaduw. */
.route-map__label {
  position: absolute;
  transform: translate(18px, -50%);
  background: rgba(255, 255, 255, 0.94);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  padding: 3px 7px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
  white-space: nowrap;
  pointer-events: none;
}
.route-map__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  flex-wrap: wrap;
}
.route-map__route {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}
/* Nummer + plaatsnaam blijven bij elkaar op één regel; alleen tussen stops
   mag de regel breken. */
.route-map__route-stop {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}
.route-map__route-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-right: 2px;
  border-radius: 50%;
  background: var(--color-primary, #ff7e00);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}
.route-map__route-arrow {
  margin: 0 4px;
  color: var(--color-text-muted, #9a958c);
}
</style>
