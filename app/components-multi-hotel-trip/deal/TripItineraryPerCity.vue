<template>
  <!-- Multi Hotel Trip — "Wat te doen tijdens je vakantie" (variant "Per stad"):
       verticale tijdlijn met per hotel één hoofdstuk "Leuke uitjes in de buurt
       van {hotel}". Kop: die titel, daaronder plaatsnaam, aantal nachten en —
       als de datums bekend zijn — check-in en check-out. Uitgeklapt: de drie
       uitjes in hetzelfde ontwerp als "Tips in de buurt" op de gewone
       arrangementenpagina (HotelNearbyTips, ingebed). Op de lijn tussen twee
       bollen staat halverwege de afstand in kilometers. Alle hoofdstukken
       staan standaard open. -->
  <div class="tpc" :class="{ 'tpc--stacked': stacked }">
    <div v-if="showStats || showToggle" class="tpc__bar" :class="{ 'tpc__bar--end': !showStats }">
      <TripItineraryStats v-if="showStats" :days="days.length" :hotels="chapters.length" :sights="sightsCount" />
      <button v-if="showToggle" type="button" class="tpc__all" @click="allOpen ? collapseAll() : expandAll()">
        {{ allOpen ? t('trip.itin.collapseAll') : t('trip.itin.expandAll') }}
      </button>
    </div>

    <ol ref="listEl" class="tpc__list">
      <template v-for="(ch, ci) in chapters" :key="ch.stopIndex">
        <!-- Afstand vanaf het vorige hotel, halverwege de lijn tussen de bollen. -->
        <li v-if="ci > 0 && ch.travelKm && kmTops[ci] != null" class="tpc__km" role="presentation" aria-hidden="true" :style="{ top: `${kmTops[ci]}px` }">
          {{ ch.travelKm }} km
        </li>
        <li
          :id="`itin-stad-${ch.stopIndex + 1}`"
          class="tpc-ch"
          :class="{ 'tpc-ch--open': isOpen(ch.stopIndex) }"
        >
          <span class="tpc-ch__node" aria-hidden="true">{{ ci + 1 }}</span>
          <!-- Kop: de titel is gewone tekst; in- en uitklappen gaat alleen via het
               pijltje rechts (en, ingeklapt, via de foto's ernaast). -->
          <div class="tpc-ch__head">
            <span class="tpc-ch__main">
              <h3 class="tpc-ch__title">{{ t('trip.itin.city.outingsAt').replace('{hotel}', ch.hotelName) }}</h3>
              <span class="tpc-ch__eyebrow">
                <span class="tpc-ch__place">{{ ch.city }}</span>
                <span class="tpc-ch__nights">{{ ch.nightsLabel }}</span>
                <span class="tpc-ch__dates">{{ ch.checkIn && ch.checkOut ? `${ch.checkIn} – ${ch.checkOut}` : ch.dayLabel }}</span>
              </span>
              <span class="tpc-ch__summary">{{ summaryOf(ch) }}</span>
            </span>
            <button
              v-if="!isOpen(ch.stopIndex)"
              type="button"
              class="tpc-ch__thumbs"
              tabindex="-1"
              aria-hidden="true"
              @click="toggle(ch.stopIndex)"
            >
              <img v-for="(src, i) in thumbsOf(ch)" :key="i" :src="src" alt="" loading="lazy" />
            </button>
            <button
              type="button"
              class="tpc-ch__toggle"
              :aria-expanded="isOpen(ch.stopIndex)"
              :aria-controls="`tpc-panel-${ch.stopIndex}`"
              :aria-label="t('trip.itin.city.outingsAt').replace('{hotel}', ch.hotelName)"
              @click="toggle(ch.stopIndex)"
            >
              <svg class="tpc-ch__chev" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
          </div>

          <div v-show="isOpen(ch.stopIndex)" :id="`tpc-panel-${ch.stopIndex}`" class="tpc-ch__panel" role="region" :aria-label="t('trip.itin.city.outingsAt').replace('{hotel}', ch.hotelName)">
            <MultiHotelTripHotelNearbyTips :tips="tipsOf(ch)" :hotel-name="ch.hotelName" embedded mobile-single-row :max="8" />
          </div>
        </li>
      </template>
    </ol>
  </div>
</template>

<script setup lang="ts">
import TripItineraryStats from './TripItineraryStats.vue'
import { countTripSights } from '~/utils-multi-hotel-trip/tripSights'
import type { TripHotelLink } from './TripHotelText.vue'
import type { TripBlockView, TripDayView } from './TripItinerary.vue'
import type { NearbyTip } from '~/types/hotel'

/** Eén uitje: een activiteitenblok uit het dagprogramma + de dag. */
export interface TripCityAttraction extends TripBlockView {
  /** "Dag 2" */
  dayLabel: string
}

/** Eén hoofdstuk (stad/hotel), al vertaald door de dealpagina. */
export interface TripCityChapter {
  stopIndex: number
  city: string
  region: string
  hotelName: string
  starRating?: number
  /** Hotelfoto. */
  image?: string
  /** "2 nachten" */
  nightsLabel: string
  /** "Dag 1 en 2" — als de datums niet bekend zijn. */
  dayLabel: string
  /** "vr 25 sep" — alleen als er een aankomstdatum gekozen is. */
  checkIn?: string
  checkOut?: string
  /** Afstand vanaf het vorige hotel (leeg bij het eerste). */
  travelKm?: number
  /** Drie uitjes in de buurt. */
  attractions: TripCityAttraction[]
}

const props = withDefaults(defineProps<{
  chapters: TripCityChapter[]
  /** Het volledige dagprogramma — voor de kerngetallen (dagen, bezienswaardigheden). */
  days: TripDayView[]
  hotels?: TripHotelLink[]
  /** Mobiel: smallere tijdlijn. */
  stacked?: boolean
  /** Kerngetallen-regel in de balk (uit als de pagina die al bij de samenvatting toont). */
  showStats?: boolean
  /** Knop "Alles inklappen/uitklappen" in de balk boven de lijst; uit als de pagina hem zelf
   *  toont (naast de intro van "Wat te doen tijdens je vakantie") — gebruik dan `allOpen`/`expandAll`/`collapseAll`. */
  showToggle?: boolean
}>(), { hotels: () => [], stacked: false, showStats: true, showToggle: true })

defineEmits<{ 'open-hotel': [stopIndex: number] }>()

const { t } = useMultiHotelTripI18n()

/* Open hoofdstukken — standaard allemaal uitgeklapt. */
const open = ref<Set<number>>(new Set(props.chapters.map(c => c.stopIndex)))
const isOpen = (i: number) => open.value.has(i)
function toggle(i: number) {
  const next = new Set(open.value)
  if (next.has(i)) next.delete(i)
  else next.add(i)
  open.value = next
}
const allOpen = computed(() => props.chapters.length > 0 && props.chapters.every(c => open.value.has(c.stopIndex)))
function expandAll() { open.value = new Set(props.chapters.map(c => c.stopIndex)) }
function collapseAll() { open.value = new Set() }
/** Van buitenaf (dagsamenvatting): het hoofdstuk van die dag openen en in beeld
 *  scrollen. De terugreisdag (geen hotel) hoort bij het laatste hoofdstuk. */
async function openDay(day: number) {
  const d = props.days.find(x => x.day === day)
  const last = props.chapters[props.chapters.length - 1]
  const stopIndex = d?.stopIndex ?? d?.fromStopIndex ?? last?.stopIndex
  const ch = props.chapters.find(c => c.stopIndex === stopIndex) ?? last
  if (!ch) return
  if (!open.value.has(ch.stopIndex)) open.value = new Set([...open.value, ch.stopIndex])
  await nextTick()
  if (import.meta.client) document.getElementById(`itin-stad-${ch.stopIndex + 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
defineExpose({ openDay, allOpen, expandAll, collapseAll })

const sightsCount = computed(() => countTripSights(props.days))

/** Ingeklapt: de titels van de uitjes. */
function summaryOf(ch: TripCityChapter): string {
  return ch.attractions.map(a => a.title).join(' · ')
}
/** Maximaal drie foto's voor de ingeklapte kop (zonder placeholders). */
function thumbsOf(ch: TripCityChapter): string[] {
  return ch.attractions.map(a => a.image).filter((s): s is string => !!s && !s.includes('/placeholder-')).slice(0, 3)
}
/** De uitjes in het formaat van "Tips in de buurt" (teksten zijn al vertaald). */
function tipsOf(ch: TripCityChapter): NearbyTip[] {
  return ch.attractions.map((a, i) => ({
    id: `stad-${ch.stopIndex}-${i}`,
    title: { nl: a.title, en: a.title, de: a.title },
    description: { nl: a.text, en: a.text, de: a.text },
    image: a.image ?? ch.image ?? '',
  }))
}

/* Kilometerlabels: halverwege de lijn tussen twee bollen. De hoogte van een
   hoofdstuk verandert bij in-/uitklappen, dus de positie wordt gemeten. */
const listEl = ref<HTMLElement | null>(null)
const kmTops = ref<Record<number, number>>({})
let ro: ResizeObserver | null = null
function layoutKm() {
  const list = listEl.value
  if (!list) return
  const items = [...list.querySelectorAll<HTMLElement>('.tpc-ch')]
  const listTop = list.getBoundingClientRect().top
  const tops: Record<number, number> = {}
  items.forEach((li, i) => {
    if (i === 0) return
    const a = items[i - 1]!.querySelector<HTMLElement>('.tpc-ch__node')?.getBoundingClientRect()
    const b = li.querySelector<HTMLElement>('.tpc-ch__node')?.getBoundingClientRect()
    if (!a || !b) return
    tops[i] = Math.round(((a.top + a.height / 2 + b.top + b.height / 2) / 2 - listTop) * 10) / 10
  })
  kmTops.value = tops
}
onMounted(() => {
  layoutKm()
  if (listEl.value && 'ResizeObserver' in window) {
    ro = new ResizeObserver(() => layoutKm())
    ro.observe(listEl.value)
  }
})
onBeforeUnmount(() => ro?.disconnect())
watch(open, () => nextTick(layoutKm))
</script>

<style scoped>
.tpc { display: flex; flex-direction: column; gap: var(--space-md); }
.tpc__bar { display: flex; align-items: center; justify-content: space-between; gap: var(--space-md); }
.tpc__bar--end { justify-content: flex-end; }
.tpc__all {
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
.tpc__all:hover { color: var(--color-primary-hover); }

/* Tijdlijn: verticale lijn door de genummerde bollen (als "Collapsed"). */
.tpc__list { list-style: none; margin: 0; padding: 0; position: relative; }
.tpc-ch { position: relative; padding-left: 52px; scroll-margin-top: 96px; }
.tpc-ch::before {
  content: '';
  position: absolute;
  left: 17px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-border-light);
}
.tpc-ch:first-child::before { top: 28px; }
.tpc-ch:last-child::before { bottom: auto; height: 28px; }
.tpc-ch__node {
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
  transition: background var(--transition-fast), color var(--transition-fast);
}
.tpc-ch--open .tpc-ch__node { background: var(--color-dark, #141414); color: #fff; }
/* Kilometerlabel, gecentreerd op de lijn (x = 18px). */
.tpc__km {
  position: absolute;
  left: 18px;
  z-index: 2;
  transform: translate(-50%, -50%);
  padding: 3px 9px;
  border: 1px solid var(--color-border-light);
  border-radius: 999px;
  background: #fff;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  color: var(--color-text-secondary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.tpc-ch__head {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  width: 100%;
  padding: 12px 0 18px;
  border-bottom: 1px solid var(--color-border-light);
}
.tpc-ch--open .tpc-ch__head { border-bottom-color: transparent; padding-bottom: 8px; }
/* Het enige bedieningselement: het pijltje rechts. */
.tpc-ch__toggle {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  margin-right: -8px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background var(--transition-fast);
}
.tpc-ch__toggle:hover { background: var(--color-background-secondary, #f4f1ec); }
.tpc-ch__toggle:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
.tpc-ch__main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.tpc-ch__eyebrow { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 13px; color: var(--color-text-secondary); }
.tpc-ch__place { font-size: 14px; font-weight: 600; color: var(--color-text-primary); }
.tpc-ch__nights {
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--color-background-secondary, #f4f1ec);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-primary);
}
.tpc-ch__title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 700;
  line-height: 1.25;
  color: var(--color-text-primary);
}
.tpc-ch__summary {
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.tpc-ch--open .tpc-ch__summary { display: none; }
.tpc-ch__thumbs { display: flex; flex-shrink: 0; padding: 0; border: 0; background: none; cursor: pointer; }
.tpc-ch__thumbs img {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}
.tpc-ch__thumbs img + img { margin-left: -14px; }
.tpc-ch__chev { flex-shrink: 0; transition: transform 200ms ease; }
.tpc-ch--open .tpc-ch__chev { transform: rotate(180deg); }

.tpc-ch__panel {
  padding: 0 0 var(--space-xl);
  border-bottom: 1px solid var(--color-border-light);
}

/* Mobiel / gestapeld: smallere tijdlijn. */
.tpc--stacked .tpc-ch { padding-left: 40px; }
.tpc--stacked .tpc-ch::before { left: 13px; }
.tpc--stacked .tpc-ch__node { width: 28px; height: 28px; font-size: 12px; top: 14px; }
.tpc--stacked .tpc__km { left: 14px; }
.tpc--stacked .tpc-ch__thumbs { display: none; }
.tpc--stacked .tpc-ch__title { font-size: 19px; }
@media (max-width: 767px) {
  .tpc-ch__thumbs { display: none; }
}
</style>
