<template>
  <!-- Multi Hotel Trip — minimap naast de beschrijving op de vakantie-PDP.
       Schematisch kaartje (zelfde vormgeving als op de dealcard: water, land,
       grenzen, zwarte genummerde markers) met de echte rijroutes per etappe,
       de reistijd op de lijn en de plaatsnamen naast de markers. Klik op een
       marker → hotel-sidepanel; klik elders of op "Bekijk kaart" → fullscreen kaart. -->
  <div class="route-map">
    <div class="route-map__box" role="button" tabindex="0" :aria-label="t('common.viewMap')" @click="$emit('open')" @keydown.enter.prevent="$emit('open')">
      <MultiHotelTripRouteMap
        :stops="svgStops"
        :legs="legs"
        :leg-labels="legLabels"
        :width="400"
        :height="300"
        :max-scale="700"
        :marker-radius="17"
        :number-size="15"
        :label-size="16"
        :leg-label-size="13"
        show-labels
        interactive
        @stop-click="$emit('stop-click', $event)"
      />
    </div>
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
import type { TripMapStop, TripRouteLeg } from '~/utils-multi-hotel-trip/tripMapLayers'

const props = defineProps<{
  /** Hotels in reisvolgorde (met plaatsnaam, hotelnaam en reistijd vanaf het vorige hotel). */
  stops: TripMapStop[]
  /** Rijroutes tussen de hotels (OSRM); zonder legs een rechte lijn. */
  legs?: TripRouteLeg[]
}>()

defineEmits<{ open: []; 'stop-click': [index: number] }>()

const { t } = useMultiHotelTripI18n()

const svgStops = computed(() => props.stops.map(s => ({ lat: s.lat, lng: s.lng, label: s.label, title: s.title })))
/** Alleen de reistijd op de etappe ("50 min"); de volledige tekst staat op de grote kaart. */
const legLabels = computed(() => props.stops.map(s => s.travelShort))
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
  background: #d7e6f0;
  cursor: pointer;
}
.route-map__box:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
.route-map__box :deep(.trm) { width: 100%; height: 100%; display: block; }
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
