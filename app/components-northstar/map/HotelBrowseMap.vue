<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Supercluster from 'supercluster'
import type { SearchHotel } from '~/types/searchHotel'
import { useNorthstarHotelMap } from '~/composables-northstar/useNorthstarHotelMap'
import { clusterHtml, pinHtml, pinSize, pinAnchor, type PinState } from './pinTemplates'

/**
 * HotelBrowseMap — Leaflet wrapper with Supercluster-driven clustering.
 *
 * Why Supercluster (instead of leaflet.markercluster): the spec requires a
 * minimum cluster size of 4 — clusters of 2 or 3 should never form. Plain
 * markercluster has no `minPoints` option, but Supercluster does.
 *
 * On every map move/zoom we ask Supercluster for the visible cluster +
 * individual marker set, then materialise them as Leaflet markers.
 */

const props = defineProps<{
  hotels: SearchHotel[]
  /** When set, override the NL fit-bounds default and zoom to this point. */
  initialFocus?: { lat: number; lng: number; zoom?: number } | null
}>()

const { selectedHotelId, selectHotel, clearSelection, setHover, scheduleHover } = useNorthstarHotelMap()

// Safari quirk: a click on a Leaflet marker can also fire `map.click` even
// after `L.DomEvent.stopPropagation`, which immediately clears the selection
// the marker just set. Track when a marker click happened and ignore the
// map-background click that arrives in the same tick.
let lastMarkerClickAt = 0

const mapEl = ref<HTMLDivElement | null>(null)
let map: import('leaflet').Map | null = null
let leaflet: typeof import('leaflet') | null = null

// Layer that holds the rendered hotel + cluster markers (rebuilt on each move).
let markersLayer: import('leaflet').LayerGroup | null = null

// Supercluster index built once from the hotels prop.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cluster: Supercluster<any, any> | null = null

// Track current per-hotel hover state so we can refresh icons on selection.
const hoveredId = ref<string | null>(null)

function pinStateFor(hotelId: string): PinState {
  const hotel = props.hotels.find((h) => h.id === hotelId)
  const isSelected = hotelId === selectedHotelId.value
  const isHovered = hotelId === hoveredId.value
  // Both `soldOut` (no availability for arrival date) and `unmatched`
  // (deals don't match the active filters) render with the same disabled
  // visual; the hover-card distinguishes them via different copy.
  const isDisabled = !!hotel?.soldOut || !!hotel?.unmatched
  if (isDisabled) {
    if (isHovered) return 'soldOutHover'
    if (isSelected) return 'soldOutSelected'
    return 'soldOut'
  }
  if (isHovered) return 'hover'
  if (isSelected) return 'selected'
  return 'default'
}

function makeHotelIcon(L: typeof import('leaflet'), hotelId: string) {
  const state = pinStateFor(hotelId)
  return L.divIcon({
    html: pinHtml(state),
    className: 'hotel-pin-icon',
    iconSize: pinSize(state),
    iconAnchor: pinAnchor(state),
  })
}

function makeClusterIcon(L: typeof import('leaflet'), count: number, disabled = false) {
  return L.divIcon({
    html: clusterHtml(count, disabled),
    className: 'hotel-cluster-icon',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  })
}

/** Re-query Supercluster for the current viewport + zoom and re-draw markers. */
function renderMarkers() {
  if (!map || !leaflet || !cluster || !markersLayer) return
  const L = leaflet
  markersLayer.clearLayers()

  const b = map.getBounds()
  const bbox: [number, number, number, number] = [
    b.getWest(),
    b.getSouth(),
    b.getEast(),
    b.getNorth(),
  ]
  const zoom = Math.round(map.getZoom())
  const items = cluster.getClusters(bbox, zoom)

  for (const f of items) {
    const [lng, lat] = f.geometry.coordinates
    // Don't name this `props` — it would shadow the component's `props`
    // and break the hotel lookup below (we use `props.hotels` for that).
    const featureProps = f.properties
    if (featureProps.cluster) {
      // Cluster pin (count ≥ 4). If every hotel inside the cluster is
      // disabled (unmatched / sold-out) render the cluster in the grey
      // disabled palette so the user sees there's nothing bookable here.
      const leaves = cluster!.getLeaves(featureProps.cluster_id as number, Infinity)
      const allDisabled = leaves.length > 0 && leaves.every((leaf) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lp = leaf.properties as any
        const h = props.hotels.find((hh) => hh.id === lp.hotelId)
        return !!h?.soldOut || !!h?.unmatched
      })
      const m = L.marker([lat, lng], {
        icon: makeClusterIcon(L, featureProps.point_count, allDisabled),
      })
      m.on('click', () => {
        const expansionZoom = Math.min(
          cluster!.getClusterExpansionZoom(featureProps.cluster_id as number),
          18,
        )
        map!.setView([lat, lng], expansionZoom, { animate: true })
      })
      m.addTo(markersLayer)
    } else {
      // Individual hotel pin
      const hotelId = featureProps.hotelId as string
      const hotel = props.hotels.find(h => h.id === hotelId)
      // Disabled pins (sold-out OR unmatched) render with the grey icon set
      // but skip every event listener and disable Leaflet pointer-events so
      // the marker is fully inert: no hover card, no cursor change, no
      // click → side-panel.
      const isDisabled = !!hotel?.soldOut || !!hotel?.unmatched
      const m = L.marker([lat, lng], {
        icon: makeHotelIcon(L, hotelId),
        riseOnHover: !isDisabled,
        interactive: !isDisabled,
      })
      if (!isDisabled) {
        m.on('mouseover', (e: import('leaflet').LeafletMouseEvent) => {
          hoveredId.value = hotelId
          m.setIcon(makeHotelIcon(L, hotelId))
          const rect = mapEl.value!.getBoundingClientRect()
          setHover(hotelId, {
            x: e.containerPoint.x + rect.left,
            y: e.containerPoint.y + rect.top,
          })
        })
        m.on('mouseout', () => {
          hoveredId.value = null
          m.setIcon(makeHotelIcon(L, hotelId))
          // Defer the hide so the user can move the cursor into the
          // preview card without it vanishing.
          scheduleHover(null, 150)
        })
        m.on('click', (e: import('leaflet').LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e)
          lastMarkerClickAt = Date.now()
          // Hover preview should disappear on click. Re-appears on a fresh
          // hover (over any pin, including the just-selected one).
          hoveredId.value = null
          setHover(null)
          selectHotel(hotelId)
        })
      }
      m.addTo(markersLayer)
    }
  }
}

function buildClusterIndex() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const features: any[] = []
  for (const h of props.hotels) {
    if (!h.coordinates) continue
    features.push({
      type: 'Feature',
      properties: { hotelId: h.id },
      geometry: { type: 'Point', coordinates: [h.coordinates.lng, h.coordinates.lat] },
    })
  }
  cluster = new Supercluster({
    radius: 60,    // px — clustering distance; tuned to current pin size
    minPoints: 4,  // never form clusters of 2 or 3 (per spec)
    maxZoom: 16,   // above this everything de-clusters
  })
  cluster.load(features)
}

async function initMap() {
  if (!mapEl.value) return
  const L = (await import('leaflet')).default
  leaflet = L

  // Initial view: fit the bounds of the northernmost + southernmost hotels
  // so the whole offer is visible "just within range". Restrict the bounds
  // calculation to hotels inside the NL bbox so a single foreign outlier
  // (e.g. Paris) doesn't pull the view far south. Foreign hotels still get
  // a pin — they're just not allowed to drive zoom.
  const NL_BBOX = { minLat: 50.7, maxLat: 53.6, minLng: 3.3, maxLng: 7.3 }
  const inNL = (c: { lat: number; lng: number }) =>
    c.lat >= NL_BBOX.minLat && c.lat <= NL_BBOX.maxLat &&
    c.lng >= NL_BBOX.minLng && c.lng <= NL_BBOX.maxLng

  const coords = props.hotels.filter((h) => h.coordinates).map((h) => h.coordinates!)
  const nlCoords = coords.filter(inNL)
  let initialCenter: [number, number] = [52.1, 5.3]
  let initialZoom = 7
  let initialBounds: import('leaflet').LatLngBoundsExpression | null = null
  if (nlCoords.length > 1) {
    const minLat = Math.min(...nlCoords.map((c) => c.lat))
    const maxLat = Math.max(...nlCoords.map((c) => c.lat))
    const minLng = Math.min(...nlCoords.map((c) => c.lng))
    const maxLng = Math.max(...nlCoords.map((c) => c.lng))
    initialBounds = [[minLat, minLng], [maxLat, maxLng]]
    initialCenter = [(minLat + maxLat) / 2, (minLng + maxLng) / 2]
  } else if (coords.length === 1) {
    initialCenter = [coords[0].lat, coords[0].lng]
    initialZoom = 11
  }

  map = L.map(mapEl.value, {
    center: initialCenter,
    zoom: initialZoom,
    zoomControl: false,
    attributionControl: true,
    preferCanvas: false,
  })

  // CartoDB Voyager — fresh palette, no wave texture on water bodies.
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(map)

  markersLayer = L.layerGroup().addTo(map)

  // Snap the view exactly to the hotel bounds so the north/south extremes
  // sit just inside the viewport. Use 0 padding so the bounds are tight,
  // ensure the map has measured itself, and pick the smallest zoom that
  // contains the bbox (fitBounds picks largest zoom with both axes inside,
  // which can leave a lot of empty space east-west).
  if (props.initialFocus) {
    // Destination input → zoom to that hotel/city.
    const f = props.initialFocus
    map.invalidateSize()
    map.setView([f.lat, f.lng], f.zoom ?? 12, { animate: false })
  } else if (initialBounds) {
    map.invalidateSize()
    // Step in one zoom level past "fits both axes" so NL fills the viewport
    // tightly instead of leaving big slack on the wider axis (the bbox is
    // 4° lng × 2.9° lat — without the extra step you see lots of Belgium /
    // Germany on the wide axis).
    const z = map.getBoundsZoom(L.latLngBounds(initialBounds), false) + 1
    map.setView(initialCenter, z, { animate: false })
  }

  buildClusterIndex()
  renderMarkers()

  map.on('moveend', renderMarkers)
  map.on('zoomend', renderMarkers)

  // Click on the map background clears hover AND closes the side panel.
  // Safari sometimes still fires this even when the click started on a
  // marker (despite `L.DomEvent.stopPropagation` on the marker handler);
  // ignore the map click if a marker was just clicked in the same tick.
  map.on('click', () => {
    if (Date.now() - lastMarkerClickAt < 250) return
    setHover(null)
    clearSelection()
  })
}

watch(selectedHotelId, () => {
  // Re-render so the previously selected and newly selected pins update icons.
  renderMarkers()
})

watch(
  () => props.hotels,
  () => {
    if (!cluster) return
    buildClusterIndex()
    renderMarkers()
  },
  { deep: false },
)

onMounted(initMap)
onBeforeUnmount(() => {
  map?.remove()
  map = null
  markersLayer = null
  cluster = null
})

defineExpose({
  zoomIn: () => map?.zoomIn(),
  zoomOut: () => map?.zoomOut(),
  invalidateSize: () => map?.invalidateSize(),
})
</script>

<template>
  <div ref="mapEl" class="hotel-browse-map" />
</template>

<style scoped>
.hotel-browse-map {
  position: absolute;
  inset: 0;
  z-index: 1;
}
</style>
