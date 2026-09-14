<template>
  <!-- Multi Hotel Trip — fullscreen kaart van een vakantie (klik op het
       kaartje op de PDP). Leaflet met OpenStreetMap-tegels: de route als
       lijn met per etappe de afstand, de hotels als genummerde markers met
       de naam ernaast (hover = kaartje met foto, naam, sterren, plaats en
       aantal nachten; klik = hotelinformatie in een sidepanel rechts dat,
       zoals op /kaart, de hele kaart naar links duwt) en alle
       omgevingshighlights uit het dagprogramma als pin met hover-kaartje
       (foto links, uitleg rechts). -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="tfm" role="dialog" aria-modal="true" :aria-label="t('trip.mapTitle')">
        <!-- Kaart, topbalk en zoom krimpen samen in breedte als het panel opent. -->
        <div class="tfm__stage" :class="{ 'tfm__stage--with-panel': selectedHotel != null }">
          <header class="tfm__header">
            <div class="tfm__heading">
              <h2 class="tfm__title">{{ t('trip.mapTitle') }}</h2>
              <p v-if="title" class="tfm__subtitle">{{ title }}</p>
            </div>
            <ul class="tfm__legend" aria-label="Legenda">
              <li><span class="tfm__legend-hotel">1</span>{{ t('trip.mapLegendHotels') }}</li>
              <li><span class="tfm__legend-pin" v-html="PIN_SVG"></span>{{ t('trip.mapLegendHighlights') }}</li>
            </ul>
            <!-- Prominente sluitknop, zoals "Sluit kaart" op /kaart; krimpt mee met de topbalk. -->
            <button type="button" class="tfm__close" @click="$emit('close')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
              <span>{{ t('trip.closeMap') }}</span>
            </button>
          </header>
          <div ref="mapEl" class="tfm__map"></div>
          <div class="tfm__zoom">
            <button type="button" class="tfm__zoom-btn" aria-label="Inzoomen" @click="map?.zoomIn()">+</button>
            <button type="button" class="tfm__zoom-btn" aria-label="Uitzoomen" @click="map?.zoomOut()">−</button>
          </div>
        </div>

        <!-- Hotel-sidepanel (klik op een hotelmarker) — dezelfde component als
             "Meer over dit hotel" op de dealpagina. -->
        <MultiHotelTripHotelPanel :hotel="panelHotel" @close="selectedHotel = null" />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useBodyScrollLock } from '~/composables-multi-hotel-trip/useBodyScrollLock'
import type { TripHotelModalData } from '~/components-multi-hotel-trip/deal/TripHotelDetails.vue'
import {
  PIN_SVG,
  addOsmTiles,
  addCountryBorders,
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
  /** Hotelinformatie per stop, voor het sidepanel. */
  hotels?: TripHotelModalData[]
}>()

const emit = defineEmits<{ close: [] }>()

const { t } = useMultiHotelTripI18n()
useBodyScrollLock().bindTo(computed(() => props.open))

/** Geselecteerd hotel (index) → sidepanel open; kaart schuift naar links. */
const selectedHotel = ref<number | null>(null)
const panelHotel = computed(() => (selectedHotel.value != null ? props.hotels?.[selectedHotel.value] ?? null : null))
watch(selectedHotel, () => { setTimeout(() => map?.invalidateSize({ pan: false }), 320) })
watch(() => props.open, (on) => { if (!on) selectedHotel.value = null })

const mapEl = ref<HTMLElement | null>(null)
let map: import('leaflet').Map | null = null

async function mount() {
  await nextTick()
  if (!mapEl.value || map) return
  const L = (await import('leaflet')).default
  map = L.map(mapEl.value, { zoomControl: false, attributionControl: true, scrollWheelZoom: true })
  addOsmTiles(L, map)
  addCountryBorders(L, map, 2)
  addTripRoute(L, map, props.stops, { distances: true })
  addTripHotels(L, map, props.stops, {
    size: 30,
    labelText: s => s.title ?? s.label,
    labelSize: 13,
    onClick: i => { selectedHotel.value = i },
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

function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape' || !props.open) return
  if (selectedHotel.value != null) selectedHotel.value = null
  else emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.tfm {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: #fff;
  overflow: hidden;
}
/* Kaart, topbalk en zoomknoppen samen; krimpt de panelbreedte in als het
   hotel-sidepanel opent (zelfde timing als het panel op /kaart), zodat
   topbalk en "Sluit kaart" nooit onder het panel komen. */
.tfm__stage {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  transition: right 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
.tfm__stage--with-panel { right: 440px; }
.tfm__header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-sm) var(--space-lg);
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
  flex-wrap: wrap;
  gap: var(--space-xs) var(--space-lg);
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
  background: #141414;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}
.tfm__legend-pin { display: inline-flex; transform: scale(0.75); }
/* "Sluit kaart" — donkere knop rechts in de topbalk (zoals /kaart). */
.tfm__close {
  flex-shrink: 0;
  height: 40px;
  padding: 0 var(--space-md);
  border: 0;
  border-radius: var(--radius-sm);
  background: var(--color-dark, #141414);
  color: #fff;
  box-shadow: var(--shadow-card, 0 2px 8px rgba(0, 0, 0, 0.18));
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
}
.tfm__close:hover { background: #2b2b2b; }
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
  .tfm__stage--with-panel { right: 0; }
}
</style>
