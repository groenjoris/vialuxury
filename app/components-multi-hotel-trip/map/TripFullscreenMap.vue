<template>
  <!-- Multi Hotel Trip — fullscreen kaart van een vakantie (klik op het
       kaartje op de PDP). Leaflet met OpenStreetMap-tegels: de route als
       lijn met per etappe de afstand, de hotels als genummerde markers met
       de naam ernaast (hover = kaartje met foto, naam, sterren, plaats en
       aantal nachten; klik = hotelinformatie in een sidepanel) en alle
       omgevingshighlights uit het dagprogramma als pin met hover-kaartje
       (foto links, uitleg rechts). -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="tfm" role="dialog" aria-modal="true" :aria-label="t('trip.mapTitle')">
        <header class="tfm__header">
          <div class="tfm__heading">
            <h2 class="tfm__title">{{ t('trip.mapTitle') }}</h2>
            <p v-if="title" class="tfm__subtitle">{{ title }}</p>
          </div>
          <ul class="tfm__legend" aria-label="Legenda">
            <li><span class="tfm__legend-hotel">1</span>{{ t('trip.mapLegendHotels') }}</li>
            <li><span class="tfm__legend-pin" v-html="PIN_SVG"></span>{{ t('trip.mapLegendHighlights') }}</li>
          </ul>
          <button type="button" class="tfm__close" :aria-label="t('common.close')" @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </header>
        <div ref="mapEl" class="tfm__map"></div>
        <div class="tfm__zoom">
          <button type="button" class="tfm__zoom-btn" aria-label="Inzoomen" @click="map?.zoomIn()">+</button>
          <button type="button" class="tfm__zoom-btn" aria-label="Uitzoomen" @click="map?.zoomOut()">−</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useBodyScrollLock } from '~/composables-multi-hotel-trip/useBodyScrollLock'
import {
  PIN_SVG,
  addOsmTiles,
  addTripRoute,
  addTripHotels,
  addTripHighlights,
  hoverCardHtml,
  type TripMapStop,
  type TripMapHighlight,
} from '~/utils-multi-hotel-trip/tripMapLayers'

const props = defineProps<{
  open: boolean
  /** Titel van de vakantie (ondertitel in de kop). */
  title?: string
  /** Hotels in reisvolgorde. */
  stops: TripMapStop[]
  /** Omgevingshighlights (pins met hover-kaartje). */
  highlights: TripMapHighlight[]
  /** "2 nachten" per hotel, al vertaald (voor het hover-kaartje). */
  nightsLabels?: string[]
}>()

const emit = defineEmits<{ close: []; 'hotel-click': [index: number] }>()

const { t } = useMultiHotelTripI18n()
useBodyScrollLock().bindTo(computed(() => props.open))

const mapEl = ref<HTMLElement | null>(null)
let map: import('leaflet').Map | null = null

async function mount() {
  await nextTick()
  if (!mapEl.value || map) return
  const L = (await import('leaflet')).default
  map = L.map(mapEl.value, { zoomControl: false, attributionControl: true, scrollWheelZoom: true })
  addOsmTiles(L, map)
  addTripRoute(L, map, props.stops, { distances: true })
  addTripHotels(L, map, props.stops, {
    size: 30,
    labelText: s => s.title ?? s.label,
    labelSize: 13,
    onClick: i => emit('hotel-click', i),
    hoverHtml: (s, i) => hoverCardHtml({
      image: s.image,
      title: s.title ?? s.label,
      stars: s.starRating,
      lines: [s.label, props.nightsLabels?.[i] ?? ''],
    }),
  })
  addTripHighlights(L, map, props.highlights)

  const all = [
    ...props.stops.map(s => [s.lat, s.lng] as [number, number]),
    ...props.highlights.map(h => [h.lat, h.lng] as [number, number]),
  ]
  if (all.length) map.fitBounds(L.latLngBounds(all), { padding: [72, 72], maxZoom: 13 })
  setTimeout(() => map?.invalidateSize(), 50)
}

function unmount() {
  map?.remove()
  map = null
}

watch(() => props.open, (on) => { if (on) mount(); else unmount() })
onMounted(() => { if (props.open) mount() })
onBeforeUnmount(unmount)

function onKey(e: KeyboardEvent) { if (e.key === 'Escape' && props.open) emit('close') }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.tfm {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  flex-direction: column;
  background: #fff;
}
.tfm__header {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border-light);
  background: #fff;
}
.tfm__heading { min-width: 0; }
.tfm__title { margin: 0; font-size: 20px; font-weight: 700; line-height: 1.2; }
.tfm__subtitle {
  margin: 2px 0 0;
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tfm__legend {
  display: flex;
  gap: var(--space-lg);
  margin: 0 0 0 auto;
  padding: 0;
  list-style: none;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-secondary);
}
.tfm__legend li { display: inline-flex; align-items: center; gap: 8px; }
.tfm__legend-hotel {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-primary, #ff7e00);
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}
.tfm__legend-pin { display: inline-flex; transform: scale(0.75); }
.tfm__close {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 50%;
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.tfm__close:hover { background: var(--color-border-light); }
.tfm__map { flex: 1; min-height: 0; }
.tfm__zoom {
  position: absolute;
  right: var(--space-lg);
  bottom: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 1000;
}
.tfm__zoom-btn {
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: #fff;
  color: var(--color-text-primary);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}
.tfm__zoom-btn:hover { background: var(--color-background-secondary); }
.fade-enter-active, .fade-leave-active { transition: opacity 180ms ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 767px) {
  .tfm__legend { display: none; }
  .tfm__header { gap: var(--space-md); }
}
</style>
