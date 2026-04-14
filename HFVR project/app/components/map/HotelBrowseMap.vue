<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { MapHotel } from '~/types/mapHotel'
import { useHotelMap } from '~/composables/useHotelMap'
import { clusterHtml, pinHtml, pinSize, type PinState } from './pinTemplates'

/**
 * HotelBrowseMap — Leaflet wrapper that renders ~50 hotel pins with
 * clustering and forwards hover/click events to the parent through the
 * shared `useHotelMap` composable.
 */

const props = defineProps<{
  hotels: MapHotel[]
}>()

const { selectedHotelId, selectHotel, setHover } = useHotelMap()

const mapEl = ref<HTMLDivElement | null>(null)
let map: import('leaflet').Map | null = null
let leaflet: typeof import('leaflet') | null = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cluster: any = null
const markerById = new Map<string, import('leaflet').Marker>()

function pinStateFor(hotel: MapHotel): PinState {
  if (hotel.id === selectedHotelId.value) return 'selected'
  if (hotel.soldOut) return 'soldOut'
  return 'default'
}

async function initMap() {
  if (!mapEl.value) return
  // Leaflet is client-only — load dynamically so SSR doesn't choke.
  const L = (await import('leaflet')).default
  await import('leaflet.markercluster')
  leaflet = L

  map = L.map(mapEl.value, {
    center: [52.1, 5.3],
    zoom: 7,
    zoomControl: false,
    attributionControl: true,
    preferCanvas: false,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(map)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cluster = (L as any).markerClusterGroup({
    showCoverageOnHover: false,
    spiderfyOnMaxZoom: false,
    maxClusterRadius: 45,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    iconCreateFunction: (c: any) => {
      const count = c.getChildCount()
      return L.divIcon({
        html: clusterHtml(count),
        className: 'hotel-cluster-icon',
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      })
    },
  })

  for (const hotel of props.hotels) {
    const state = pinStateFor(hotel)
    const marker = L.marker([hotel.coordinates.lat, hotel.coordinates.lng], {
      icon: L.divIcon({
        html: pinHtml(state),
        className: 'hotel-pin-icon',
        iconSize: pinSize(state),
        iconAnchor: state === 'selected' ? [25, 25] : [16, 16],
      }),
      riseOnHover: true,
    })

    marker.on('mouseover', (e: import('leaflet').LeafletMouseEvent) => {
      const rect = mapEl.value!.getBoundingClientRect()
      // Anchor hover card above the marker, in viewport coordinates.
      setHover(hotel.id, {
        x: e.containerPoint.x + rect.left,
        y: e.containerPoint.y + rect.top,
      })
    })
    marker.on('mouseout', () => setHover(null))
    marker.on('click', (e: import('leaflet').LeafletMouseEvent) => {
      L.DomEvent.stopPropagation(e)
      selectHotel(hotel.id)
    })

    markerById.set(hotel.id, marker)
    cluster.addLayer(marker)
  }
  map.addLayer(cluster)

  // Click on the map background clears any selection.
  map.on('click', () => {
    setHover(null)
  })
}

function refreshMarkerIcon(hotelId: string) {
  if (!map || !leaflet) return
  const hotel = props.hotels.find((h) => h.id === hotelId)
  const marker = markerById.get(hotelId)
  if (!hotel || !marker) return
  const state = pinStateFor(hotel)
  marker.setIcon(
    leaflet.divIcon({
      html: pinHtml(state),
      className: 'hotel-pin-icon',
      iconSize: pinSize(state),
      iconAnchor: state === 'selected' ? [25, 25] : [16, 16],
    }),
  )
}

watch(selectedHotelId, (newId, oldId) => {
  if (oldId) refreshMarkerIcon(oldId)
  if (newId) refreshMarkerIcon(newId)
})

onMounted(initMap)
onBeforeUnmount(() => {
  map?.remove()
  map = null
  markerById.clear()
})

defineExpose({
  zoomIn: () => map?.zoomIn(),
  zoomOut: () => map?.zoomOut(),
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
