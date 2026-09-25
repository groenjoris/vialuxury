<template>
  <!-- Multi Hotel Trip — variant "Per dag" van het voorbeeld-reisschema:
       een verticale tijdlijn met per dag een uitklapbaar paneel.
       Kop (altijd zichtbaar): genummerde bol op de tijdlijn, "Dag 1 · datum",
       soort dag (Aankomst / Reisdag / Verblijf / Terugreis), kopregel
       ("Aankomst in Béthune", "Béthune → Tilques"), de onderdelen van die dag
       op één regel en — ingeklapt — een strip met de foto's van die dag.
       Uitgeklapt: de ondertitel (met klikbare hotelnaam) en alle blokken met
       foto, tekst en "Meer over …". Dag 1 staat standaard open. -->
  <div class="tia" :class="{ 'tia--stacked': stacked, 'tia--wide': wide }">
    <div class="tia__bar">
      <TripItineraryStats :days="days.length" :hotels="stops.length" :sights="sightsCount" />
      <button type="button" class="tia__all" @click="allOpen ? collapseAll() : expandAll()">
        {{ allOpen ? t('trip.itin.collapseAll') : t('trip.itin.expandAll') }}
      </button>
    </div>

    <ol class="tia__list">
      <li
        v-for="day in days"
        :key="day.day"
        :id="`itin-dag-${day.day}`"
        class="tia-day"
        :class="[{ 'tia-day--open': isOpen(day.day) }, day.type ? `tia-day--${day.type}` : '']"
      >
        <span class="tia-day__node" aria-hidden="true">{{ day.day }}</span>
        <h3 class="tia-day__h">
          <button
            type="button"
            class="tia-day__head"
            :aria-expanded="isOpen(day.day)"
            :aria-controls="`tia-panel-${day.day}`"
            @click="toggle(day.day)"
          >
            <span class="tia-day__main">
              <span class="tia-day__eyebrow">
                <span class="tia-day__label">{{ day.label }}</span>
                <span v-if="day.date" class="tia-day__date">{{ day.date }}</span>
                <span v-if="day.type" class="tia-day__type">{{ t(`trip.itin.type.${day.type}`) }}</span>
              </span>
              <span class="tia-day__title">{{ headlineOf(day) }}</span>
              <span class="tia-day__summary">{{ summaryOf(day) }}</span>
            </span>
            <span v-if="!isOpen(day.day)" class="tia-day__thumbs" aria-hidden="true">
              <img v-for="(src, i) in thumbsOf(day)" :key="i" :src="src" alt="" loading="lazy" />
            </span>
            <svg class="tia-day__chev" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
        </h3>
        <div v-show="isOpen(day.day)" :id="`tia-panel-${day.day}`" class="tia-day__panel" role="region" :aria-label="`${day.label} — ${headlineOf(day)}`">
          <p v-if="day.subtitle" class="tia-day__subtitle">
            <MultiHotelTripHotelText :text="day.subtitle" :hotels="hotels" @open-hotel="$emit('open-hotel', $event)" />
          </p>
          <div class="tia-day__blocks">
            <TripItineraryBlock
              v-for="(block, i) in day.blocks"
              :key="`${day.day}-${i}`"
              :block="block"
              :hotels="hotels"
              :layout="stacked ? 'stacked' : wide ? 'compact' : 'row'"
              @open-hotel="$emit('open-hotel', $event)"
            />
          </div>
        </div>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import TripItineraryBlock from './TripItineraryBlock.vue'
import TripItineraryStats from './TripItineraryStats.vue'
import { countTripSights } from '~/utils-multi-hotel-trip/tripSights'
import type { TripHotelLink } from './TripHotelText.vue'
import type { TripDayView } from './TripItinerary.vue'
import type { TripItineraryStop } from './TripItineraryCities.vue'

const props = withDefaults(defineProps<{
  days: TripDayView[]
  stops: TripItineraryStop[]
  hotels?: TripHotelLink[]
  stacked?: boolean
  /** Volle paginabreedte: blokken als kaarten naast elkaar (foto boven). */
  wide?: boolean
}>(), { hotels: () => [], stacked: false, wide: false })

defineEmits<{ 'open-hotel': [stopIndex: number] }>()

const { t } = useMultiHotelTripI18n()

/* Open dagen — standaard alleen dag 1. */
// Variant "Collapsed": alle dagen standaard ingeklapt (was: dag 1 open).
const open = ref<Set<number>>(new Set())
const isOpen = (d: number) => open.value.has(d)
function toggle(d: number) {
  const next = new Set(open.value)
  if (next.has(d)) next.delete(d)
  else next.add(d)
  open.value = next
}
const allOpen = computed(() => props.days.length > 0 && props.days.every(d => open.value.has(d.day)))
function expandAll() { open.value = new Set(props.days.map(d => d.day)) }
function collapseAll() { open.value = new Set() }

/** Aantal bezienswaardigheden (zie utils tripSights). */
const sightsCount = computed(() => countTripSights(props.days))

/** "Aankomst in Béthune" · "Béthune → Tilques" · "Een dag in en rond Tilques" · "Terug naar huis". */
function headlineOf(day: TripDayView): string {
  const city = day.stopIndex != null ? props.stops[day.stopIndex]?.city ?? '' : ''
  const from = day.fromStopIndex != null ? props.stops[day.fromStopIndex]?.city ?? '' : ''
  switch (day.type) {
    case 'arrival': return t('trip.itin.head.arrival').replace('{city}', city)
    case 'transfer': return t('trip.itin.head.transfer').replace('{from}', from).replace('{to}', city)
    case 'stay': return t('trip.itin.head.stay').replace('{city}', city)
    case 'home': return t('trip.itin.head.home')
    default: return day.subtitle ?? day.label
  }
}
/** Onderdelen van de dag op één regel (zonder ontbijt): "Onderweg: … · Inchecken … · Diner …". */
function summaryOf(day: TripDayView): string {
  return day.blocks.filter(b => b.kind !== 'breakfast').map(b => b.title).join(' · ')
}
/** Maximaal drie foto's voor de ingeklapte kop. */
function thumbsOf(day: TripDayView): string[] {
  return day.blocks.map(b => b.image).filter((s): s is string => !!s).slice(0, 3)
}
</script>

<style scoped>
.tia { display: flex; flex-direction: column; gap: var(--space-md); }
.tia__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}
.tia__all {
  padding: 0;
  border: 0;
  background: none;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}
.tia__all:hover { color: var(--color-primary-hover); }

/* Tijdlijn: verticale lijn door de genummerde bollen. */
.tia__list { list-style: none; margin: 0; padding: 0; position: relative; }
.tia-day {
  position: relative;
  padding-left: 52px;
  scroll-margin-top: 96px;
}
.tia-day::before {
  content: '';
  position: absolute;
  left: 17px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-border-light);
}
.tia-day:first-child::before { top: 28px; }
.tia-day:last-child::before { bottom: auto; height: 28px; }
.tia-day__node {
  position: absolute;
  left: 0;
  top: 12px;
  z-index: 1;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 2px solid var(--color-dark, #141414);
  color: var(--color-dark, #141414);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 700;
  transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.tia-day--open .tia-day__node { background: var(--color-dark, #141414); color: #fff; }

.tia-day__h { margin: 0; font: inherit; }
.tia-day__head {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  width: 100%;
  padding: 12px 0 18px;
  border: 0;
  border-bottom: 1px solid var(--color-border-light);
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
}
.tia-day--open .tia-day__head { border-bottom-color: transparent; padding-bottom: 8px; }
.tia-day__head:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 4px; border-radius: 4px; }
.tia-day__main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.tia-day__eyebrow {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.tia-day__label { font-weight: 700; color: var(--color-text-primary); text-transform: uppercase; letter-spacing: 0.06em; font-size: 12px; }
.tia-day__type {
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--color-background-secondary, #f4f1ec);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-primary);
}
.tia-day--transfer .tia-day__type,
.tia-day--home .tia-day__type { background: #141414; color: #fff; }
.tia-day__title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.25;
  color: var(--color-text-primary);
}
.tia-day__head:hover .tia-day__title { color: var(--color-primary); }
.tia-day__summary {
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.tia-day--open .tia-day__summary { display: none; }
.tia-day__thumbs { display: flex; flex-shrink: 0; }
.tia-day__thumbs img {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}
.tia-day__thumbs img + img { margin-left: -14px; }
.tia-day__chev { flex-shrink: 0; color: var(--color-text-primary); transition: transform 200ms ease; }
.tia-day--open .tia-day__chev { transform: rotate(180deg); }

.tia-day__panel {
  padding: 0 0 var(--space-xl);
  border-bottom: 1px solid var(--color-border-light);
}
.tia-day__subtitle { margin: 0 0 var(--space-md); font-size: 14px; color: var(--color-text-secondary); }
.tia-day__blocks { display: flex; flex-direction: column; gap: var(--space-lg); }

/* Volle breedte: blokken als kaarten in een raster; tekstregels blijven kort. */
.tia--wide .tia-day__blocks { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-lg); }
.tia--wide .tia-day__subtitle { max-width: 720px; }
.tia--wide .tia-day__summary { max-width: 760px; }
.tia--wide .tia-day__thumbs img { width: 64px; height: 64px; }

/* Mobiel: smallere tijdlijn, geen fotostrip in de kop. */
.tia--stacked .tia-day { padding-left: 40px; }
.tia--stacked .tia-day::before { left: 13px; }
.tia--stacked .tia-day__node { width: 28px; height: 28px; font-size: 12px; top: 14px; }
.tia--stacked .tia-day__thumbs { display: none; }
.tia--stacked .tia-day__title { font-size: 18px; }
@media (max-width: 767px) {
  .tia-day__thumbs { display: none; }
}
</style>
