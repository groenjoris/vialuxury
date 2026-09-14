<template>
  <!-- Multi Hotel Trip — fullscreen kaart van een vakantie (klik op het
       kaartje op de PDP). Leaflet met dezelfde CARTO-tegels als /kaart:
       de route als lijn tussen de hotels, de hotels als genummerde markers
       met de naam zichtbaar (niet klikbaar) en alle omgevingshighlights uit
       het dagprogramma als pin; hover op een pin toont een kaartje met foto
       links en uitleg rechts. -->
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

interface MapStop { lat: number; lng: number; label: string; title?: string }
interface MapHighlight { name: string; lat: number; lng: number; text: string; image?: string }

const props = defineProps<{
  open: boolean
  /** Titel van de vakantie (ondertitel in de kop). */
  title?: string
  /** Hotels in reisvolgorde. */
  stops: MapStop[]
  /** Omgevingshighlights (pins met hover-kaartje). */
  highlights: MapHighlight[]
}>()

const emit = defineEmits<{ close: [] }>()

const { t } = useMultiHotelTripI18n()
useBodyScrollLock().bindTo(computed(() => props.open))

/** Donkere druppel-pin voor een highlight (ook in de legenda). */
const PIN_SVG = '<svg width="26" height="32" viewBox="0 0 32 42" fill="none" aria-hidden="true"><path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z" fill="#141414"/><circle cx="16" cy="16" r="6" fill="#fff"/></svg>'

const mapEl = ref<HTMLElement | null>(null)
let map: import('leaflet').Map | null = null

const escape = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))

async function mount() {
  await nextTick()
  if (!mapEl.value || map) return
  const L = (await import('leaflet')).default
  map = L.map(mapEl.value, { zoomControl: false, attributionControl: true, scrollWheelZoom: true })
  // Standaard OSM-tegels (zelfde als de minimap van gewone deals); de
  // CARTO-basemaps van /kaart vragen inmiddels een API-key.
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map)

  const route = props.stops.map(s => [s.lat, s.lng] as [number, number])
  if (route.length > 1) {
    L.polyline(route, { color: '#fff', weight: 7, opacity: 0.9, lineJoin: 'round' }).addTo(map)
    L.polyline(route, { color: '#141414', weight: 3, lineJoin: 'round' }).addTo(map)
  }

  // Hotels: genummerde marker met de naam ernaast — niet klikbaar.
  props.stops.forEach((s, i) => {
    const icon = L.divIcon({
      className: 'tfm-hotel',
      html: `<span class="tfm-hotel__num">${i + 1}</span><span class="tfm-hotel__name">${escape(s.title ?? s.label)}</span>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    })
    L.marker([s.lat, s.lng], { icon, interactive: false, keyboard: false, zIndexOffset: 1000 }).addTo(map!)
  })

  // Highlights: pin met hover-kaartje (foto links, uitleg rechts).
  for (const h of props.highlights) {
    const icon = L.divIcon({ className: 'tfm-hl', html: PIN_SVG, iconSize: [26, 32], iconAnchor: [13, 31] })
    const m = L.marker([h.lat, h.lng], { icon, keyboard: false }).addTo(map)
    const img = h.image ? `<img class="tfm-tip__img" src="${escape(h.image)}" alt="">` : ''
    m.bindTooltip(
      `<div class="tfm-tip__card">${img}<div class="tfm-tip__body"><strong class="tfm-tip__name">${escape(h.name)}</strong><p class="tfm-tip__text">${escape(h.text)}</p></div></div>`,
      { direction: 'top', offset: [0, -28], className: 'tfm-tip', opacity: 1 },
    )
  }

  const all = [...route, ...props.highlights.map(h => [h.lat, h.lng] as [number, number])]
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

<!-- Leaflet maakt de marker- en tooltip-DOM zelf aan: niet-scoped stijlen. -->
<style>
.tfm-hotel { pointer-events: none; }
.tfm-hotel__num {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--color-primary, #ff7e00);
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  color: #fff;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
}
.tfm-hotel__name {
  position: absolute;
  left: 36px;
  top: 50%;
  transform: translateY(-50%);
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  color: #141414;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}
.tfm-hl { cursor: pointer; filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3)); }
.tfm-hl:hover { transform: translateY(-2px); }
/* Hover-kaartje: foto links, naam + uitleg rechts. */
.leaflet-tooltip.tfm-tip {
  padding: 0;
  border: 0;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.22);
  overflow: hidden;
  white-space: normal;
}
.leaflet-tooltip.tfm-tip::before { border-top-color: #fff; }
.tfm-tip__card { display: flex; width: 340px; }
.tfm-tip__img { width: 130px; height: 120px; object-fit: cover; flex-shrink: 0; display: block; }
.tfm-tip__body { padding: 12px 14px; min-width: 0; }
.tfm-tip__name { display: block; font-family: var(--font-body); font-size: 14px; font-weight: 700; color: #141414; margin-bottom: 4px; }
.tfm-tip__text { margin: 0; font-family: var(--font-body); font-size: 12px; line-height: 1.5; color: #555; }
</style>
