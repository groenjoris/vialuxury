<template>
  <!-- Multi Hotel Trip — klikbare dagsamenvatting van het voorbeeld-reisschema
       (één regel per dag), bovenaan de linkerkolom onder de beschrijving
       (varianten Per stad, Hybrid en Reviews). Klik → `select(dag)`; de pagina
       opent die dag (of dat stadshoofdstuk) in het reisschema en scrolt
       ernaartoe. Met de kerngetallen erboven en, optioneel, de link "Bekijk
       uitgebreid voorbeeld reisschema" (→ sidepanel, `open-full`). -->
  <div class="tisum" :class="{ 'tisum--lines': lines }">
    <TripItineraryStats v-if="showStats && days.length" class="tisum__stats" :days="days.length" :hotels="hotels.length" :sights="sightsCount" />
    <ul v-if="days.length" class="tisum__list">
      <li v-for="day in days" :key="`sum-${day.day}`" class="tisum__item">
        <button type="button" class="tisum__link" @click="$emit('select', day.day)">
          <span class="tisum__day">{{ day.label }}</span><span class="tisum__text">{{ summaryLineOfDay(day, t) }}</span>
        </button>
      </li>
    </ul>
    <button v-if="fullLink" type="button" class="tisum__full" @click="$emit('open-full')">{{ t('trip.itin.fullLink') }}</button>
  </div>
</template>

<script setup lang="ts">
import TripItineraryStats from './TripItineraryStats.vue'
import { countTripSights } from '~/utils-multi-hotel-trip/tripSights'
import { summaryLineOfDay } from '~/utils-multi-hotel-trip/tripDaySummary'
import type { TripHotelLink } from './TripHotelText.vue'
import type { TripDayView } from './TripItinerary.vue'

const props = withDefaults(defineProps<{
  days: TripDayView[]
  /** Eén per hotel — voor het aantal hotels in de kerngetallen. */
  hotels?: TripHotelLink[]
  showStats?: boolean
  /** Link "Bekijk uitgebreid voorbeeld reisschema" onder de lijst. */
  fullLink?: boolean
  /** Subtiele stippellijntjes tussen de dagen (alleen onder de beschrijvingen, niet onder "Dag x"). */
  lines?: boolean
}>(), { hotels: () => [], showStats: true, fullLink: false, lines: false })

defineEmits<{ select: [day: number]; 'open-full': [] }>()

const { t } = useMultiHotelTripI18n()
const sightsCount = computed(() => countTripSights(props.days))
</script>

<style scoped>
.tisum { display: flex; flex-direction: column; gap: var(--space-md); }
/* Links uitgelijnd (geen inspringing), ruime regelafstand; regels mogen doorlopen op een tweede regel. */
.tisum__list {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 15px;
  line-height: 1.8;
  color: var(--color-text-primary);
}
.tisum__item + .tisum__item { margin-top: 8px; }
/* Lijntjes-variant: stippellijn tussen twee dagen, alleen over de tekstkolom (vanaf 3.6em). */
.tisum--lines .tisum__item + .tisum__item { position: relative; margin-top: 10px; padding-top: 10px; }
.tisum--lines .tisum__item + .tisum__item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 3.6em;
  right: 0;
  border-top: 1px dotted #c4bfb6;
}
.tisum__link {
  /* "Dag x" als bullet in een vaste kolom (zonder scheidingsteken); doorlopende tekst springt in (hangende inspringing). */
  display: grid;
  grid-template-columns: 3.6em minmax(0, 1fr);
  align-items: start;
  width: 100%;
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
.tisum__day { font-weight: 700; white-space: nowrap; }
.tisum__text { color: var(--color-text-secondary); transition: color var(--transition-fast); }
.tisum__full {
  align-self: flex-start;
  padding: 0;
  border: 0;
  background: none;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}
.tisum__full:hover { color: var(--color-primary-hover); }
</style>
