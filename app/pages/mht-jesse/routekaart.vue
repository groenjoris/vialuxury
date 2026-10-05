<template>
  <!-- Multi Hotel Trip - Jesse — werkbank voor de routekaart.
       Alleen de kaart van de vakantie-PDP, schermvullend en zonder verdere
       pagina: geen header, footer, kop, legenda of panelen. Bedoeld om de
       stijl van de route in te stellen; de lagen komen uit
       `utils-mht-jesse/tripMapLayers.ts`, dus wat je daar verandert zie je
       hier én op de echte pagina's. Andere vakantie bekijken: ?trip=<slug>. -->
  <div ref="mapEl" class="routekaart"></div>
</template>

<script setup lang="ts">
import { tripPdpBySlug } from '~/data/mhtj-trip-pdp'
import { tripDetailBySlug } from '~/data/mhtj-trips'
import { addBasemapTiles } from '~/utils/mapTiles'
import {
  addProvinceOverlay,
  addTripRoute,
  addTripHotels,
  addTripHighlights,
  hoverCardHtml,
} from '~/utils-mht-jesse/tripMapLayers'

const route = useRoute()
const { localized } = useMhtJesseI18n()

/** De vakantie uit ?trip=, anders de eerste. */
const slug = computed(() => {
  const q = route.query.trip
  const wanted = Array.isArray(q) ? q[0] : q
  return (wanted && tripDetailBySlug[wanted] ? wanted : Object.keys(tripDetailBySlug)[0]) as string
})
const pdp = computed(() => tripPdpBySlug(slug.value))

useHead(() => ({ title: `Routekaart — ${pdp.value ? localized(pdp.value.trip.title) : 'onbekend'}` }))

const stops = computed(() =>
  (pdp.value?.trip.stops ?? [])
    .filter(s => typeof s.lat === 'number' && typeof s.lng === 'number')
    .map(s => ({
      lat: s.lat as number,
      lng: s.lng as number,
      label: s.city,
      title: s.hotelName,
      starRating: s.starRating,
      nights: s.nights,
      image: s.image,
      travelKm: s.travel?.km,
    })),
)

const highlights = computed(() =>
  (pdp.value?.content?.mapHighlights ?? []).map(h => ({
    name: localized(h.name),
    lat: h.lat,
    lng: h.lng,
    text: localized(h.text),
    image: h.image,
  })),
)

const mapEl = ref<HTMLElement | null>(null)
let map: import('leaflet').Map | null = null
let ro: ResizeObserver | null = null

/** Alles opnieuw tekenen. Bij het wisselen van vakantie bouwen we de kaart
 *  helemaal opnieuw op; dat is simpeler dan losse lagen bijhouden en het
 *  gebeurt alleen bij een andere ?trip=. */
async function build() {
  const el = mapEl.value
  if (!el) return
  const L = (await import('leaflet')).default
  map?.remove()
  map = L.map(el, { zoomControl: true, attributionControl: true, scrollWheelZoom: true })
  // Dezelfde basiskaart als /kaart: CARTO Voyager met een API-key, anders
  // OpenStreetMap. Daarover het gekleurde vlak van de provincie, half
  // doorzichtig zodat plaatsnamen en wegen eronder leesbaar blijven.
  addBasemapTiles(L, map, useRuntimeConfig().public.cartoApiKey as string)
  addProvinceOverlay(L, map, stops.value)
  addTripRoute(L, map, stops.value, { distances: true })
  addTripHotels(L, map, stops.value, {
    size: 30,
    labelText: s => s.title ?? s.label,
    labelSize: 13,
    hoverHtml: (s, i) => hoverCardHtml({
      image: s.image,
      title: s.title ?? s.label,
      stars: s.starRating,
      lines: [s.label, `${s.nights ?? 0} nachten`],
    }),
  })
  addTripHighlights(L, map, highlights.value)

  const all = [
    ...stops.value.map(s => [s.lat, s.lng] as [number, number]),
    ...highlights.value.map(h => [h.lat, h.lng] as [number, number]),
  ]
  if (all.length) map.fitBounds(L.latLngBounds(all), { padding: [72, 72], maxZoom: 13 })
  map.invalidateSize()
}

onMounted(async () => {
  await build()
  if (mapEl.value) {
    ro = new ResizeObserver(() => map?.invalidateSize())
    ro.observe(mapEl.value)
  }
})
watch(slug, build)
onBeforeUnmount(() => {
  ro?.disconnect()
  map?.remove()
  map = null
})
</script>

<style scoped>
/* Schermvullend: geen marges, geen omliggende pagina. */
.routekaart {
  position: fixed;
  inset: 0;
}
.routekaart :deep(.leaflet-container) {
  width: 100%;
  height: 100%;
  font-family: var(--font-body);
}
</style>
