<template>
  <!-- Multi Hotel Trip — quick filters op de Vakanties-zoekpagina. Zelfde
       vormgeving als de "Snel zoeken"-pillen op de homepage (wit, 1px rand,
       14px tekst met 14px lijn-icoon, grijze vulling bij hover). Aan =
       donkere pil met kruisje; klikken op de hele pil zet hem weer uit, de pil
       blijft staan. Pillen die in combinatie met de huidige selectie geen
       enkele vakantie meer opleveren worden inactief (afhankelijkheid).
       `inline` maakt de root display:contents zodat de pillen directe
       flex-items van de toolbar worden en sorteren/weergave in dezelfde (of
       de volgende) rij meelopen. -->
  <div class="tqf" :class="{ 'tqf--inline': inline }" role="group" aria-label="Snelfilters">
    <button
      v-for="f in TRIP_QUICK_FILTERS"
      :key="f.id"
      type="button"
      class="tqf__pill"
      :class="{ 'tqf__pill--on': isOn(f.id), 'tqf__pill--off': isDisabled(f.id) }"
      :aria-pressed="isOn(f.id)"
      :disabled="isDisabled(f.id)"
      :title="isDisabled(f.id) ? 'Geen vakanties met deze combinatie' : undefined"
      @click="toggleTripFilter(f.id)"
    >
      <span class="tqf__icon" v-html="iconFor(f.id)" />
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
import { POPULAR_FILTER_ICONS } from '~/utils-multi-hotel-trip/popularFilterIcons'

const props = withDefaults(defineProps<{
  /** Pillen als directe flex-items van de ouder (toolbar-rij). */
  inline?: boolean
  /** Per filter-id: aantal vakanties als deze pil (extra) aan zou staan.
   *  0 = inactief, tenzij de pil zelf al aan staat. Zonder counts is alles actief. */
  counts?: Record<string, number>
}>(), { inline: false, counts: undefined })

const { selectedTripFilters, toggleTripFilter } = useMultiHotelTripSearchState()

function isOn(id: string): boolean {
  return selectedTripFilters.value.includes(id)
}

function isDisabled(id: string): boolean {
  if (isOn(id)) return false
  const c = props.counts
  if (!c) return false
  return (c[id] ?? 0) === 0
}

/** Zelfde lijn-iconenfamilie als de homepage-snelfilters (incl. `car`).
 *  Landen (kaartspeld) en Cultuur (landmark) zitten niet in de set. */
const PIN_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>'
const LANDMARK_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>'
const ICON_FOR: Record<string, string> = {
  auto: 'car',
  fiets: 'bike',
  nederland: 'pin',
  belgie: 'pin',
  frankrijk: 'pin',
  nieuw: 'sparkles',
  kasteel: 'castle',
  wellness: 'hotTub',
  'aan-zee': 'waves',
  natuur: 'treePine',
  culinair: 'utensils',
  steden: 'building',
  ontspanning: 'leaf',
  cultuur: 'landmark',
}
function iconFor(id: string): string {
  const key = ICON_FOR[id]
  if (key === 'pin') return PIN_ICON
  if (key === 'landmark') return LANDMARK_ICON
  return (key && POPULAR_FILTER_ICONS[key]) || POPULAR_FILTER_ICONS.star!
}
</script>

<style scoped>
.tqf {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
/* Inline: de pillen worden flex-items van de omliggende toolbar. */
.tqf--inline {
  display: contents;
}

/* Identiek aan .home-pill (homepage "Snel zoeken"). */
.tqf__pill {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  height: 44px;
  padding: 0 17px;
  background: #fff;
  border: 1px solid #e5e2da;
  border-radius: var(--radius-sm);
  color: #141414;
  font-family: inherit;
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: border-color var(--transition-fast), background var(--transition-fast), color var(--transition-fast);
}
.tqf__pill:hover {
  /* Zelfde neutrale hover als de homepage-pil: de vulling wordt grijs. */
  background: var(--color-border);
}

.tqf__icon {
  display: inline-flex;
  width: 14px;
  height: 14px;
  color: #141414;
  margin-right: 2px;
  flex-shrink: 0;
}
.tqf__icon :deep(svg) {
  width: 100%;
  height: 100%;
}

/* Aan: donkere pil, witte tekst en icoon, kruisje rechts. */
.tqf__pill--on {
  background: #141414;
  border-color: #141414;
  color: #fff;
  padding-right: 12px;
}
.tqf__pill--on .tqf__icon {
  color: #fff;
}
.tqf__pill--on:hover {
  background: #2a2a2a;
  border-color: #2a2a2a;
}
.tqf__close {
  flex-shrink: 0;
}

/* Inactief: levert met de huidige selectie geen vakanties op. */
.tqf__pill--off,
.tqf__pill--off:hover {
  background: #fff;
  border-color: #eeece7;
  color: #b3b0a8;
  cursor: default;
}
.tqf__pill--off .tqf__icon {
  color: #b3b0a8;
}

@media (max-width: 800px) {
  .tqf {
    gap: 8px;
  }
  .tqf__pill {
    height: 40px;
    padding: 0 14px;
    font-size: 13px;
  }
}
</style>
