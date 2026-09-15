<template>
  <!-- Multi Hotel Trip — minimap naast de beschrijving op de vakantie-PDP.
       Echte kaart (Leaflet, OpenStreetMap-tegels, niet te slepen of te
       zoomen) met de route, per etappe de afstand op de lijn en genummerde
       hotelmarkers met de plaatsnaam ernaast (zelfde markers als de
       fullscreen kaart). Klik op een marker of plaatsnaam → hotel-sidepanel;
       klik elders op de kaart of op "Bekijk kaart" → fullscreen kaart. -->
  <div class="route-map">
    <div ref="mapEl" class="route-map__box" role="button" tabindex="0" :aria-label="t('common.viewMap')" @keydown.enter.prevent="$emit('open')"></div>
    <div class="route-map__footer">
      <span class="route-map__route">
        <template v-for="(s, i) in stops" :key="`r-${i}`">
          <span class="route-map__route-stop">{{ s.label }}</span>
          <span v-if="i < stops.length - 1" class="route-map__route-arrow" aria-hidden="true">→</span>
        </template>
      </span>
      <button type="button" class="route-map__view-link" @click="$emit('open')">{{ t('common.viewMap') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { addOsmTiles, addCountryBorders, addTripRoute, addTripHotels, type TripMapStop, type TripRouteLeg } from '~/utils-multi-hotel-trip/tripMapLayers'

const props = defineProps<{
  /** Hotels in reisvolgorde (met plaatsnaam, hotelnaam en afstand vanaf het vorige hotel). */
  stops: TripMapStop[]
  /** Rijroutes tussen de hotels (OSRM); zonder legs een rechte lijn. */
  legs?: TripRouteLeg[]
}>()

const emit = defineEmits<{ open: []; 'stop-click': [index: number] }>()

const { t } = useMultiHotelTripI18n()

const mapEl = ref<HTMLElement | null>(null)
let map: import('leaflet').Map | null = null
let ro: ResizeObserver | null = null
let routeBounds: import('leaflet').LatLngBounds | null = null

function fit(L: typeof import('leaflet')) {
  if (!map || !props.stops.length) return
  // Hotels én de getekende rijroute in beeld (een route kan buiten de hotels uitbuigen).
  const b = L.latLngBounds(props.stops.map(s => [s.lat, s.lng] as [number, number]))
  if (routeBounds?.isValid()) b.extend(routeBounds)
  map.fitBounds(b, { padding: [36, 36], maxZoom: 11 })
}

onMounted(async () => {
  if (!mapEl.value) return
  const L = (await import('leaflet')).default
  map = L.map(mapEl.value, {
    zoomControl: false,
    attributionControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    touchZoom: false,
    boxZoom: false,
    keyboard: false,
    zoomSnap: 0.25,
  })
  addOsmTiles(L, map, false)
  addCountryBorders(L, map, 1.5)
  routeBounds = addTripRoute(L, map, props.stops, { distances: true, weight: 2.5, legs: props.legs })
  addTripHotels(L, map, props.stops, {
    size: 30,
    labelText: s => s.label,
    labelSize: 14,
    onClick: i => emit('stop-click', i),
  })
  map.on('click', () => emit('open'))
  fit(L)
  ro = new ResizeObserver(() => { map?.invalidateSize(); fit(L) })
  ro.observe(mapEl.value)
})

onBeforeUnmount(() => {
  ro?.disconnect()
  map?.remove()
  map = null
})
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
  display: block;
  width: 100%;
  aspect-ratio: var(--vl-minimap-aspect, 1 / 1);
  max-height: var(--vl-minimap-max-h, none);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border-light);
  background: #e9e5dc;
  cursor: pointer;
}
.route-map__box:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
/* Leaflet zelf krijgt de klikcursor van de kaart als geheel. */
.route-map__box :deep(.leaflet-container) { cursor: pointer; background: #e9e5dc; font-family: var(--font-body); }
/* Kaartje is smal: route en link onder elkaar, links uitgelijnd. */
.route-map__footer {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}
.route-map__route {
  display: inline;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.4;
  min-width: 0;
}
.route-map__route-stop { white-space: nowrap; }
.route-map__route-arrow { margin: 0 4px; color: var(--color-text-muted, #9a958c); }
.route-map__view-link {
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
  flex-shrink: 0;
}
.route-map__view-link:hover { color: var(--color-primary-hover); }
</style>
