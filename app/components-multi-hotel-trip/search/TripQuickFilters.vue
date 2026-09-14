<template>
  <!-- Multi Hotel Trip — quick filters op de Vakanties-zoekpagina. Eén
       horizontale rij (max. twee regels) grote filterpillen die je aan en
       uit zet. Aan = donkere pil met kruisje; klikken op de hele pil zet
       hem weer uit, de pil blijft staan (anders dan de reguliere
       verwijder-pills). -->
  <div class="tqf" role="group" aria-label="Snelfilters">
    <button
      v-for="f in TRIP_QUICK_FILTERS"
      :key="f.id"
      type="button"
      class="tqf__pill"
      :class="{ 'tqf__pill--on': isOn(f.id) }"
      :aria-pressed="isOn(f.id)"
      @click="toggleTripFilter(f.id)"
    >
      <span class="tqf__label">{{ f.label }}</span>
      <svg
        v-if="isOn(f.id)"
        class="tqf__close"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
// NB: Nuxt dedupliceert het overlappende "Trip"-segment tussen de prefix
// (MultiHotelTrip) en deze bestandsnaam — de component heet daardoor
// <MultiHotelTripQuickFilters> (niet MultiHotelTripTripQuickFilters).
import { TRIP_QUICK_FILTERS } from '~/utils-multi-hotel-trip/tripFilters'

const { selectedTripFilters, toggleTripFilter } = useMultiHotelTripSearchState()

function isOn(id: string): boolean {
  return selectedTripFilters.value.includes(id)
}
</script>

<style scoped>
.tqf {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* Groter dan de reguliere filterpills (32px): 40px hoog, 14px tekst. */
.tqf__pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}

.tqf__pill:hover {
  border-color: var(--color-text-primary);
}

/* Aan: donkere pil, witte tekst, kruisje rechts. */
.tqf__pill--on {
  background: var(--color-dark);
  border-color: var(--color-dark);
  color: #fff;
  padding-right: 12px;
}

.tqf__pill--on:hover {
  background: var(--color-text-primary);
  border-color: var(--color-text-primary);
}

.tqf__close {
  flex-shrink: 0;
}

@media (max-width: 800px) {
  .tqf {
    gap: 8px;
  }
  .tqf__pill {
    height: 36px;
    padding: 0 14px;
    font-size: 13px;
  }
}
</style>
