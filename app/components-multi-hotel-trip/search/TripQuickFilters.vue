<template>
  <!-- Multi Hotel Trip — quick filters op de Vakanties-zoekpagina. Zelfde
       vormgeving als de "Snel zoeken"-pillen op de homepage (wit, 1px rand,
       14px tekst met 14px lijn-icoon, grijze vulling bij hover). Aan =
       donkere pil met kruisje; klikken op de hele pil zet hem weer uit, de pil
       blijft staan. Pillen die in combinatie met de huidige selectie geen
       enkele vakantie meer opleveren worden inactief (afhankelijkheid).
       De basisrij past op desktop op één regel; na een geforceerde regel-
       overgang (`.tqf__break`) volgen op de tweede regel de fietsopties zodra
       "Met de fiets" aan staat (en, in de toolbar, rechts Sorteren/weergave).
       `inline` maakt de root display:contents zodat de pillen directe
       flex-items van de toolbar worden. -->
  <div class="tqf" :class="{ 'tqf--inline': inline }" role="group" aria-label="Snelfilters">
    <button
      v-for="f in TRIP_PRIMARY_FILTERS"
      :key="f.id"
      type="button"
      class="tqf__pill"
      :class="{ 'tqf__pill--on': isOn(f.id), 'tqf__pill--off': isDisabled(f.id) }"
      :aria-pressed="isOn(f.id)"
      :disabled="isDisabled(f.id)"
      :title="isDisabled(f.id) ? 'Geen vakanties met deze combinatie' : undefined"
      @click="onToggle(f.id)"
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

    <!-- Geforceerde regelovergang: alles hierna staat op de tweede regel. -->
    <span class="tqf__break" aria-hidden="true"></span>

    <!-- Fietsopties — alleen zichtbaar met "Met de fiets" aan. -->
    <TransitionGroup name="tqf-sub">
      <button
        v-for="f in visibleBikeOptions"
        :key="f.id"
        type="button"
        class="tqf__pill tqf__pill--sub"
        :class="{ 'tqf__pill--on': isOn(f.id), 'tqf__pill--off': isDisabled(f.id) }"
        :aria-pressed="isOn(f.id)"
        :disabled="isDisabled(f.id)"
        :title="isDisabled(f.id) ? 'Geen vakanties met deze combinatie' : undefined"
        @click="onToggle(f.id)"
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
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
// NB: Nuxt dedupliceert het overlappende "Trip"-segment tussen de prefix
// (MultiHotelTrip) en deze bestandsnaam — de component heet daardoor
// <MultiHotelTripQuickFilters> (niet MultiHotelTripTripQuickFilters).
import { TRIP_PRIMARY_FILTERS, tripSubFilters } from '~/utils-multi-hotel-trip/tripFilters'
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

/* Fietsopties: tweede regel, alleen met "Met de fiets" aan. Gaat de fietspil
   uit, dan gaan actieve fietsopties mee uit (anders zouden ze onzichtbaar
   blijven filteren). */
const bikeOptions = tripSubFilters('fiets')
const bikeOn = computed(() => isOn('fiets'))
const visibleBikeOptions = computed(() => (bikeOn.value ? bikeOptions : []))

function onToggle(id: string) {
  if (id === 'fiets' && isOn('fiets')) {
    for (const sub of bikeOptions) if (isOn(sub.id)) toggleTripFilter(sub.id)
  }
  toggleTripFilter(id)
}

function isDisabled(id: string): boolean {
  if (isOn(id)) return false
  const c = props.counts
  if (!c) return false
  return (c[id] ?? 0) === 0
}

/** Zelfde lijn-iconenfamilie als de homepage-snelfilters (incl. `car`).
 *  Landen (kaartspeld) en de fietsopties (koffer, route, prijskaartje,
 *  kaart) zitten niet in de set en staan hier inline (lucide-stijl). */
const INLINE_ICONS: Record<string, string> = {
  pin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  luggage: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 20a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2"/><path d="M8 18V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14"/><path d="M10 20h4"/><circle cx="16" cy="20" r="2"/><circle cx="8" cy="20" r="2"/></svg>',
  route: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>',
  tag: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>',
  map: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/></svg>',
}
const ICON_FOR: Record<string, string> = {
  auto: 'car',
  fiets: 'bike',
  nederland: 'pin',
  belgie: 'pin',
  frankrijk: 'pin',
  wellness: 'hotTub',
  'aan-zee': 'waves',
  natuur: 'treePine',
  culinair: 'utensils',
  bagagetransfer: 'luggage',
  'hotel-naar-hotel': 'route',
  'fiets-huren': 'tag',
  fietsroutes: 'map',
}
function iconFor(id: string): string {
  const key = ICON_FOR[id]
  if (key && INLINE_ICONS[key]) return INLINE_ICONS[key]
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
/* Regelovergang: neemt de hele breedte, zodat wat volgt op de volgende
   regel begint. Hoogte 0; de gap valt daardoor twee keer (16 px), wat de
   basisrij bewust iets losmaakt van de tweede regel (fietsopties/sorteren). */
.tqf__break {
  flex-basis: 100%;
  width: 100%;
  height: 0;
}
/* Fietsopties verschijnen met een korte fade/slide. */
.tqf-sub-enter-active {
  transition: opacity 180ms ease, transform 180ms ease;
}
.tqf-sub-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

/* Als .home-pill (homepage "Snel zoeken"), maar met 14 px i.p.v. 17 px
   zijpadding: zo houdt de basisrij van negen pillen op desktop (toolbar
   1152 px) ~80 px speling, genoeg om ook met een paar pillen áán (elk +16 px
   door het kruisje) op één regel te blijven. */
.tqf__pill {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  height: 44px;
  padding: 0 14px;
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
  padding-right: 10px;
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
    padding: 0 12px;
    font-size: 13px;
  }
}
</style>
