<template>
  <!-- Multi Hotel Trip — routekaartje naast de beschrijving op de vakantie-
       PDP. Zelfde plek en breedte als de minimap van een gewone deal
       (rechterkolom van .deal-page__intro) en dezelfde vormgeving als het
       kaartje op de vakantie-dealcard: het schematische SVG-kaartje met
       water/land/provinciegrenzen, plaatsnamen en genummerde stops. Hover op
       een nummer toont de hotelnaam, klikken opent de hotel-pop-up. Klikken
       op de kaart zelf wordt later gebrieft (link is nu een placeholder). -->
  <div class="route-map">
    <a href="#" class="route-map__box" :aria-label="t('common.viewMap')" @click.prevent>
      <MultiHotelTripRouteMap
        class="route-map__svg"
        :stops="stops"
        :max-scale="maxScale"
        show-labels
        interactive
        @stop-click="$emit('stop-click', $event)"
      />
    </a>
    <div class="route-map__footer">
      <span class="route-map__route">
        <template v-for="(s, i) in stops" :key="`r-${i}`">
          <span class="route-map__route-stop">{{ s.label }}</span>
          <span v-if="i < stops.length - 1" class="route-map__route-arrow" aria-hidden="true">→</span>
        </template>
      </span>
      <a href="#" class="route-map__view-link" @click.prevent>{{ t('common.viewMap') }}</a>
    </div>
  </div>
</template>

<script setup lang="ts">
interface RouteStop { lat: number; lng: number; label: string; title?: string }

const { t } = useMultiHotelTripI18n()

defineEmits<{ 'stop-click': [index: number] }>()

withDefaults(defineProps<{
  /** Hotels in reisvolgorde. */
  stops: RouteStop[]
  /** Begrenst het inzoomen op korte routes (px per graad), zie TripRouteMap. */
  maxScale?: number
}>(), {
  maxScale: 200,
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
  cursor: pointer;
}
.route-map__svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
/* Kaartje is maar 220 px breed: route en link onder elkaar, links uitgelijnd. */
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
