<template>
  <!-- Multi Hotel Trip — klikbare dagsamenvatting van het voorbeeld-reisschema
       (één regel per dag), losgemaakt uit de variant "Summary" (TripItinerary)
       voor de variant "Hybrid": staat daar bovenaan de linkerkolom onder de
       beschrijving, terwijl het reisschema zelf (ingeklapte accordeon) verderop
       over de volle breedte staat. Klik → `select(dag)`; de pagina opent die dag
       in de accordeon en scrolt ernaartoe. Met de kerngetallen erboven. -->
  <div class="tisum">
    <TripItineraryStats v-if="showStats && days.length" class="tisum__stats" :days="days.length" :hotels="hotels.length" :sights="sightsCount" />
    <ul v-if="days.length" class="tisum__list">
      <li v-for="day in days" :key="`sum-${day.day}`" class="tisum__item">
        <button type="button" class="tisum__link" @click="$emit('select', day.day)">
          <span class="tisum__day">{{ day.label }}</span> · <span class="tisum__text">{{ summaryOf(day) }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import TripItineraryStats from './TripItineraryStats.vue'
import { countTripSights } from '~/utils-multi-hotel-trip/tripSights'
import type { TripHotelLink } from './TripHotelText.vue'
import type { TripDayView } from './TripItinerary.vue'

const props = withDefaults(defineProps<{
  days: TripDayView[]
  /** Eén per hotel — voor het aantal hotels in de kerngetallen. */
  hotels?: TripHotelLink[]
  showStats?: boolean
}>(), { hotels: () => [], showStats: true })

defineEmits<{ select: [day: number] }>()

const sightsCount = computed(() => countTripSights(props.days))

/** Eén regel per dag: het belangrijkste onderdeel (onderweg/etappe, terugreis of
 *  de eerste activiteit; anders het hotel) — zelfde regel als in TripItinerary. */
function summaryOf(day: TripDayView): string {
  const main = day.blocks.find(b => b.kind === 'checkout' || b.kind === 'homeward')
    ?? day.blocks.find(b => b.kind === 'activity')
    ?? day.blocks.find(b => b.kind === 'checkin')
  return main?.title ?? day.subtitle ?? ''
}
</script>

<style scoped>
.tisum { display: flex; flex-direction: column; gap: var(--space-md); }
.tisum__list {
  margin: 0;
  padding: 0 0 0 20px;
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-text-primary);
}
.tisum__item + .tisum__item { margin-top: 4px; }
.tisum__link {
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
}
.tisum__link:hover .tisum__text,
.tisum__link:focus-visible .tisum__text { color: var(--color-primary); text-decoration: underline; text-underline-offset: 3px; }
.tisum__day { font-weight: 700; }
.tisum__text { color: var(--color-text-secondary); transition: color var(--transition-fast); }
</style>
