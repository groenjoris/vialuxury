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
              <li><span class="tfm__legend-pin" v-html="POI_PIN_SVG"></span>{{ t('trip.mapLegendHighlights') }}</li>
            </ul>
            <!-- Prominente sluitknop, zoals "Sluit kaart" op /kaart; krimpt mee met de topbalk. -->
            <button type="button" class="tfm__close" @click="$emit('close')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
              <span>{{ t('trip.closeMap') }}</span>
            </button>
          </header>
          <!-- Zonder CARTO-key: OSM-tegels, verzacht (minder detail in beeld). -->
          <div ref="mapEl" class="tfm__map" :class="{ 'tfm__map--soft': !cartoApiKey }"></div>
          <div class="tfm__zoom">
            <button type="button" class="tfm__zoom-btn" aria-label="Inzoomen" @click="map?.zoomIn()">+</button>
            <button type="button" class="tfm__zoom-btn" aria-label="Uitzoomen" @click="map?.zoomOut()">−</button>
          </div>
          <!-- Mobiel: geen topbalk, wel een sluitknop rechtsboven op de kaart zelf. -->
          <button type="button" class="tfm__close tfm__close--map" @click="$emit('close')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
            <span>{{ t('trip.closeMap') }}</span>
          </button>
          <!-- Mobiel: tik op een hotel of bezienswaardigheid → paneel onderaan de kaart (zoals de zoekkaart),
               met foto, naam en sluitknop rechtsboven; bij een hotel een knop naar het hotelpanel. -->
          <Transition name="tfm-sheet">
            <div v-if="sheet" class="tfm__sheet" role="dialog" :aria-label="sheetTitle">
              <!-- Foto over de hele hoogte links; rechts naam (max. 2 regels), sterren + nachten (hotel)
                   of afstand tot het dichtstbijzijnde hotel (bezienswaardigheid), en de beschrijving. -->
              <img v-if="sheetImage" class="tfm__sheet-img" :src="sheetImage" alt="" />
              <span v-else class="tfm__sheet-imgph" aria-hidden="true" v-html="poiPinSvg(sheetKind)"></span>
              <div class="tfm__sheet-main">
                <div class="tfm__sheet-head">
                  <h3 class="tfm__sheet-title">{{ sheetTitle }}</h3>
                  <button type="button" class="tfm__sheet-close" :aria-label="t('common.close')" @click="sheet = null">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </div>
                <div v-if="sheetStars" class="tfm__sheet-stars" aria-hidden="true"><span v-for="n in sheetStars" :key="n">★</span></div>
                <p v-if="sheetSub" class="tfm__sheet-sub">{{ sheetSub }}</p>
                <p v-if="sheetText" class="tfm__sheet-body">{{ sheetText }}</p>
              </div>
            </div>
          </Transition>
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
  POI_PIN_SVG,
  POI_PIN_SIZE,
  poiPinSvg,
  addCountryBorders,
  addTripRoute,
  addTripHotels,
  addTripHighlights,
  hoverCardHtml,
  keepLabelsInView,
  spreadMarkers,
  type TripMapStop,
  type TripMapHighlight,
  type TripRouteLeg,
} from '~/utils-multi-hotel-trip/tripMapLayers'
import { addBasemapTiles } from '~/utils/mapTiles'

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
  /** Rijroutes tussen de hotels (OSRM); zonder legs een rechte lijn. */
  legs?: TripRouteLeg[]
  /** Label van de gestippelde terugetappe (rondje). */
  returnLabel?: string
}>()

const emit = defineEmits<{ close: [] }>()

const { t } = useMultiHotelTripI18n()
useBodyScrollLock().bindTo(computed(() => props.open))
// CARTO Voyager mét key (rustiger, minder detail); anders verzachte OSM-tegels.
const cartoApiKey = useRuntimeConfig().public.cartoApiKey as string

/** Geselecteerd hotel (index) → sidepanel open. Het panel duwt de kaart opzij:
 *  zelfde zoomniveau, de kaart schuift naar links — zo mogelijk de volle
 *  panelbreedte, maar niet verder dan de route toelaat (de linkerrand van de
 *  route blijft in beeld); past de route niet meer in het overgebleven vlak,
 *  dan wordt hij daarin gecentreerd. Bij sluiten schuift hij terug. */
const selectedHotel = ref<number | null>(null)
const panelHotel = computed(() => (selectedHotel.value != null ? props.hotels?.[selectedHotel.value] ?? null : null))
const PANEL_W = 440
let panelShift = 0
function computePanelShift(): number {
  if (!map) return 0
  if (window.innerWidth <= 767) return 0 // mobiel: panel over de hele breedte
  const W = map.getSize().x
  const Wn = W - PANEL_W
  if (!fitBounds) return PANEL_W / 2
  const pad = 24, markerPad = 70 // ruimte voor markers en hotelnamen
  const bl = map.latLngToContainerPoint(fitBounds.getNorthWest()).x - markerPad
  const br = map.latLngToContainerPoint(fitBounds.getSouthEast()).x + markerPad
  const minShift = br - (Wn - pad) // nodig om onder het panel vandaan te komen
  const maxShift = bl - pad        // niet verder: linkerrand blijft zichtbaar
  if (maxShift < minShift) return Math.round((bl + br) / 2 - Wn / 2) // past niet: centreren
  return Math.round(Math.max(0, Math.min(PANEL_W, maxShift, Math.max(minShift, PANEL_W))))
}
watch(selectedHotel, (sel, prev) => {
  if (!map) return
  const opening = sel != null && prev == null
  const closing = sel == null && prev != null
  if (opening) {
    panelShift = computePanelShift()
    if (panelShift) map.panBy([panelShift, 0], { animate: true, duration: 0.3 })
  } else if (closing) {
    if (panelShift) map.panBy([-panelShift, 0], { animate: true, duration: 0.3 })
    panelShift = 0
  }
  // Na de breedte-transitie van het stage: Leaflet de nieuwe maat laten meten,
  // zonder te pannen (het verschuiven is al gedaan).
  setTimeout(() => map?.invalidateSize({ pan: false }), 320)
})
watch(() => props.open, (on) => { if (!on) { selectedHotel.value = null; sheet.value = null } })

/** Mobiel: hotel of bezienswaardigheid in het paneel onderaan de kaart (i.p.v. sidepanel/hover-kaartje). */
const sheet = ref<{ kind: 'hotel' | 'poi'; index: number } | null>(null)
const isMobileViewport = () => typeof window !== 'undefined' && window.innerWidth <= 767
const sheetHotel = computed(() => (sheet.value?.kind === 'hotel' ? props.hotels?.[sheet.value.index] ?? null : null))
const sheetPoi = computed(() => (sheet.value?.kind === 'poi' ? props.highlights[sheet.value.index] ?? null : null))
const sheetTitle = computed(() => sheetHotel.value?.name ?? sheetPoi.value?.name ?? '')
const sheetStars = computed(() => sheetHotel.value?.starRating ?? 0)
/** Afstand (km, hemelsbreed) tussen twee punten. */
function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371, dLat = ((b.lat - a.lat) * Math.PI) / 180, dLng = ((b.lng - a.lng) * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
/** Onder de naam: hotel → aantal nachten; bezienswaardigheid → "12 km van {dichtstbijzijnde hotel}". */
const sheetSub = computed(() => {
  if (sheetHotel.value && sheet.value) return props.nightsLabels?.[sheet.value.index] ?? ''
  const poi = sheetPoi.value
  if (!poi || !props.stops.length) return ''
  let best = props.stops[0]!, bestKm = Infinity
  for (const st of props.stops) { const d = distanceKm(poi, st); if (d < bestKm) { bestKm = d; best = st } }
  const km = bestKm < 1 ? '< 1' : String(Math.round(bestKm))
  return t('trip.map.kmFrom').replace('{km}', km).replace('{hotel}', best.title ?? best.label)
})
const sheetImage = computed(() => sheetHotel.value?.images?.[0] ?? sheetPoi.value?.image ?? '')
const sheetKind = computed(() => sheetPoi.value?.kind)
const sheetText = computed(() => sheetHotel.value?.description ?? sheetPoi.value?.text ?? '')

const mapEl = ref<HTMLElement | null>(null)
let map: import('leaflet').Map | null = null
let fitBounds: import('leaflet').LatLngBounds | null = null
/** Alle hotels + highlights in beeld passen (bij openen van de kaart). */
function refit(animate = false) {
  if (!map || !fitBounds) return
  // Mobiel: krappere marge en verder inzoomen — de route zo groot mogelijk in beeld.
  const mobile = isMobileViewport()
  map.fitBounds(fitBounds, { padding: mobile ? [28, 28] : [72, 72], maxZoom: mobile ? 14 : 13, animate })
}

const HOTEL_SIZE = 45 // 1,5× de vorige 30 px

async function mount() {
  await nextTick()
  if (!mapEl.value || map) return
  const L = (await import('leaflet')).default
  // Mobiel: fractioneel zoomniveau (zoomSnap 0.1), zodat fitBounds de route écht zo groot mogelijk
  // toont — met hele zoomstappen viel het kader net buiten niveau 9 en zakte de kaart naar 8.
  map = L.map(mapEl.value, { zoomControl: false, attributionControl: true, scrollWheelZoom: true, zoomSnap: isMobileViewport() ? 0.1 : 1 })
  addBasemapTiles(L, map, cartoApiKey)
  addCountryBorders(L, map, 2)
  const routeBounds = addTripRoute(L, map, props.stops, { distances: true, legs: props.legs, returnLabel: props.returnLabel })
  const hotelMarkers = addTripHotels(L, map, props.stops, {
    size: HOTEL_SIZE,
    labelText: s => s.title ?? s.label,
    labelSize: 14,
    onClick: i => { if (isMobileViewport()) sheet.value = { kind: 'hotel', index: i }; else selectedHotel.value = i },
    // Mobiel: geen hover-kaartjes (pop-ups) — alleen het onderpaneel bij een tik.
    hoverHtml: isMobileViewport() ? undefined : (s, i) => hoverCardHtml({
      image: s.image,
      title: s.title ?? s.label,
      stars: s.starRating,
      lines: [s.label, props.nightsLabels?.[i] ?? ''],
    }),
  })
  const poiMarkers = addTripHighlights(L, map, props.highlights, {
    tooltips: !isMobileViewport(),
    onClick: i => { if (isMobileViewport()) sheet.value = { kind: 'poi', index: i } },
  })
  map.on('click', () => { sheet.value = null })

  // Overlappende markers uit elkaar duwen (hotels én highlights), opnieuw na elke zoom.
  const spreadItems = [
    ...hotelMarkers.map(m => ({ marker: m, w: HOTEL_SIZE, h: HOTEL_SIZE, anchor: 'center' as const })),
    ...poiMarkers.map(m => ({ marker: m, w: POI_PIN_SIZE[0], h: POI_PIN_SIZE[1], anchor: 'bottom' as const })),
  ]
  const relayout = () => { if (!map) return; spreadMarkers(L, map, spreadItems); keepLabelsInView(map, hotelMarkers) }

  // Mobiel: alleen de hotels + route bepalen het kader (bezienswaardigheden hoeven niet allemaal
  // direct in beeld), zodat de route zo groot mogelijk wordt getoond.
  const all = [
    ...props.stops.map(s => [s.lat, s.lng] as [number, number]),
    ...(isMobileViewport() ? [] : props.highlights.map(h => [h.lat, h.lng] as [number, number])),
  ]
  if (all.length) {
    const b = L.latLngBounds(all)
    if (routeBounds?.isValid()) b.extend(routeBounds)
    fitBounds = b
    refit(false)
  }
  // Na de eerste layout (de container heeft dan zijn definitieve maat): maat opnieuw meten én het
  // kader opnieuw passen — anders is het zoomniveau gebaseerd op een nog niet uitgemeten container.
  setTimeout(() => { if (!map) return; map.invalidateSize(); refit(false) }, 50)
  map.on('zoomend', relayout)
  map.on('moveend', () => { if (map) keepLabelsInView(map, hotelMarkers) })
  setTimeout(relayout, 120)
}

function unmount() {
  map?.remove()
  map = null
  fitBounds = null
}

watch(() => props.open, (on) => { if (on) mount(); else unmount() })
onMounted(() => { if (props.open) mount() })
onBeforeUnmount(unmount)

function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape' || !props.open) return
  if (sheet.value) sheet.value = null
  else if (selectedHotel.value != null) selectedHotel.value = null
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
/* OSM-tegels (zonder CARTO-key) verzacht: minder kleur en contrast, zodat
   straatnamen en kleine wegen minder opdringerig zijn. */
.tfm__map--soft :deep(.leaflet-tile-pane) { filter: saturate(0.5) brightness(1.05) contrast(0.92); }

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

/* Mobiel: sluitknop op de kaart (alleen < 768px zichtbaar). */
.tfm__close--map { display: none; position: absolute; top: 12px; right: 12px; z-index: 1000; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2); }
/* Mobiel: paneel onderaan de kaart voor hotel/bezienswaardigheid — oranje bovenrand (als de
   zoekkaart), foto over de hele hoogte links, inhoud rechts. */
.tfm__sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1001;
  display: flex;
  align-items: stretch;
  min-height: 150px;
  background: #fff;
  border-top: 3px solid var(--color-primary);
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.18);
}
.tfm__sheet-img { flex: 0 0 36%; width: 36%; align-self: stretch; object-fit: cover; }
.tfm__sheet-imgph { flex: 0 0 36%; width: 36%; display: flex; align-items: center; justify-content: center; background: var(--color-background-secondary); }
.tfm__sheet-imgph :deep(svg) { width: 44px; height: 52px; }
.tfm__sheet-main { flex: 1; min-width: 0; padding: 12px 12px 14px 14px; display: flex; flex-direction: column; gap: 4px; }
.tfm__sheet-head { display: flex; align-items: flex-start; gap: 8px; }
.tfm__sheet-title {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.tfm__sheet-stars { display: flex; gap: 1px; font-size: 14px; line-height: 1; color: var(--color-text-primary); }
.tfm__sheet-sub { margin: 0; font-size: 13px; color: var(--color-text-secondary); }
.tfm__sheet-close {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  margin: -4px -4px 0 0;
  border: 0;
  border-radius: 50%;
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.tfm__sheet-body {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.tfm-sheet-enter-active, .tfm-sheet-leave-active { transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1); }
.tfm-sheet-enter-from, .tfm-sheet-leave-to { transform: translateY(100%); }
@media (max-width: 767px) {
  /* Mobiel: geen topbalk en geen zoomknoppen (knijpen); sluitknop op de kaart. */
  .tfm__legend { display: none; }
  .tfm__header { display: none; }
  .tfm__zoom { display: none; }
  .tfm__stage--with-panel { right: 0; }
  .tfm__close--map { display: inline-flex; }
}
</style>
