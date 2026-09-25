<template>
  <!-- Multi Hotel Trip — variant "Per stad" van het voorbeeld-reisschema:
       dezelfde verticale tijdlijn als "Collapsed" (TripItineraryAccordion), maar
       met per stad/hotel één hoofdstuk i.p.v. per dag. Kop: plaatsnaam, aantal
       nachten en — als de datums bekend zijn — de check-in en check-out.
       Uitgeklapt drie sub-blokken: het hotel (met ontbijt), de extra's (het
       3-gangendiner op de dag van aankomst) en "Leuke uitjes in de buurt": een
       grijs vlak met een horizontale carrousel van drie uitjes; klikken opent
       een pop-up met foto en de volledige tekst. Hoofdstuk 1 staat standaard open. -->
  <div class="tpc" :class="{ 'tpc--stacked': stacked }">
    <div class="tpc__bar">
      <TripItineraryStats :days="days.length" :hotels="chapters.length" :sights="sightsCount" />
      <button type="button" class="tpc__all" @click="allOpen ? collapseAll() : expandAll()">
        {{ allOpen ? t('trip.itin.collapseAll') : t('trip.itin.expandAll') }}
      </button>
    </div>

    <ol class="tpc__list">
      <li
        v-for="(ch, ci) in chapters"
        :key="ch.stopIndex"
        :id="`itin-stad-${ch.stopIndex + 1}`"
        class="tpc-ch"
        :class="{ 'tpc-ch--open': isOpen(ch.stopIndex) }"
      >
        <span class="tpc-ch__node" aria-hidden="true">{{ ci + 1 }}</span>
        <h3 class="tpc-ch__h">
          <button
            type="button"
            class="tpc-ch__head"
            :aria-expanded="isOpen(ch.stopIndex)"
            :aria-controls="`tpc-panel-${ch.stopIndex}`"
            @click="toggle(ch.stopIndex)"
          >
            <span class="tpc-ch__main">
              <span class="tpc-ch__eyebrow">
                <span class="tpc-ch__label">{{ t('trip.itin.stop').replace('{n}', String(ci + 1)).replace('{total}', String(chapters.length)) }}</span>
                <span class="tpc-ch__nights">{{ ch.nightsLabel }}</span>
                <span class="tpc-ch__dates">{{ ch.checkIn && ch.checkOut ? `${ch.checkIn} – ${ch.checkOut}` : ch.dayLabel }}</span>
              </span>
              <span class="tpc-ch__title">{{ ch.city }}</span>
              <span class="tpc-ch__summary">{{ summaryOf(ch) }}</span>
            </span>
            <span v-if="!isOpen(ch.stopIndex)" class="tpc-ch__thumbs" aria-hidden="true">
              <img v-for="(src, i) in thumbsOf(ch)" :key="i" :src="src" alt="" loading="lazy" />
            </span>
            <svg class="tpc-ch__chev" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
        </h3>

        <div v-show="isOpen(ch.stopIndex)" :id="`tpc-panel-${ch.stopIndex}`" class="tpc-ch__panel" role="region" :aria-label="ch.city">
          <!-- 1. Hotel: foto, naam (klikbaar → sidepanel), sterren, plaats, beschrijving + ontbijt -->
          <article class="tpc-blk tpc-blk--hotel">
            <button type="button" class="tpc-blk__media" :aria-label="`${ch.hotelName} — ${t('trip.itin.viewHotel')}`" @click="$emit('open-hotel', ch.stopIndex)">
              <img v-if="ch.image" :src="ch.image" :alt="ch.hotelName" loading="lazy" />
              <span class="tpc-blk__tag">{{ t('trip.itin.city.hotelTag') }}</span>
            </button>
            <div class="tpc-blk__body">
              <h4 class="tpc-blk__title">
                <MultiHotelTripHotelText :text="ch.hotelName" :hotels="hotels" @open-hotel="$emit('open-hotel', $event)" />
                <span v-if="ch.starRating" class="tpc-blk__stars" :aria-label="`${ch.starRating} sterren`">{{ '★'.repeat(ch.starRating) }}</span>
              </h4>
              <p class="tpc-blk__meta">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 9.75768C4.5 15.5 12 22 12 22C12 22 19.5 15.5 19.5 9.75768C19.5 4.81181 15.6559 2 12 2C8.34409 2 4.5 4.81181 4.5 9.75768Z" /><path d="M12 12C13.3807 12 14.5 10.8807 14.5 9.5C14.5 8.11929 13.3807 7 12 7C10.6193 7 9.5 8.11929 9.5 9.5C9.5 10.8807 10.6193 12 12 12Z" /></svg>
                {{ ch.city }}, {{ ch.region }}
              </p>
              <p class="tpc-blk__text">{{ ch.hotelText }}</p>
              <ul class="tpc-incl" :aria-label="t('trip.itin.city.included')">
                <li v-for="item in ch.hotelIncludes" :key="item" class="tpc-incl__item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                  {{ item }}
                </li>
              </ul>
              <button type="button" class="tpc-blk__link" @click="$emit('open-hotel', ch.stopIndex)">{{ t('trip.itin.viewHotel') }}</button>
            </div>
          </article>

          <!-- 2. Extra's: het 3-gangendiner op de dag van aankomst (+ overige inbegrepen extra's) -->
          <article v-if="ch.extras" class="tpc-blk tpc-blk--extras">
            <button type="button" class="tpc-blk__media" :aria-label="`${ch.extras.title} — ${t('common.allPhotos')}`" @click="ch.extras && ch.extras.image && (lightbox = ch.extras)">
              <img v-if="ch.extras.image" :src="ch.extras.image" :alt="ch.extras.title" loading="lazy" />
              <span class="tpc-blk__tag">{{ t('trip.itin.city.extrasTag') }}</span>
            </button>
            <div class="tpc-blk__body">
              <h4 class="tpc-blk__title">
                <MultiHotelTripHotelText :text="ch.extras.title" :hotels="hotels" @open-hotel="$emit('open-hotel', $event)" />
              </h4>
              <p class="tpc-blk__text">{{ ch.extras.text }}</p>
              <ul v-if="ch.extraIncludes.length" class="tpc-incl" :aria-label="t('trip.itin.city.included')">
                <li v-for="item in ch.extraIncludes" :key="item" class="tpc-incl__item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                  {{ item }}
                </li>
              </ul>
            </div>
          </article>

          <!-- 3. Leuke uitjes in de buurt: grijs vlak met horizontale carrousel (3 uitjes) -->
          <section v-if="ch.attractions.length" class="tpc-out" :aria-label="t('trip.itin.city.outings')">
            <div class="tpc-out__head">
              <div>
                <h4 class="tpc-out__title">{{ t('trip.itin.city.outings') }}</h4>
                <p class="tpc-out__intro">{{ t('trip.itin.city.outingsIntro') }}</p>
              </div>
              <div class="tpc-out__nav">
                <button type="button" class="tpc-out__arrow" :aria-label="t('trip.itin.city.prev')" :disabled="(active[ch.stopIndex] ?? 0) === 0" @click="scrollTo(ch, (active[ch.stopIndex] ?? 0) - 1)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <button type="button" class="tpc-out__arrow" :aria-label="t('trip.itin.city.next')" :disabled="(active[ch.stopIndex] ?? 0) >= ch.attractions.length - 1" @click="scrollTo(ch, (active[ch.stopIndex] ?? 0) + 1)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18" /></svg>
                </button>
              </div>
            </div>
            <div :ref="(el) => setTrack(ch.stopIndex, el as HTMLElement | null)" class="tpc-out__track" @scroll.passive="onScroll(ch)">
              <button
                v-for="(a, ai) in ch.attractions"
                :key="ai"
                type="button"
                class="tpc-card"
                :aria-label="`${a.title} — ${t('common.readMore')}`"
                @click="info = a"
              >
                <span class="tpc-card__media">
                  <img v-if="a.image" :src="a.image" :alt="a.title" loading="lazy" />
                  <span class="tpc-card__tag">{{ a.dayLabel }}</span>
                </span>
                <span class="tpc-card__title">{{ a.title }}</span>
                <span class="tpc-card__text">{{ a.text }}</span>
                <span class="tpc-card__more">{{ t('common.readMore') }}</span>
              </button>
            </div>
            <div class="tpc-out__dots" role="tablist">
              <button
                v-for="(a, ai) in ch.attractions"
                :key="ai"
                type="button"
                class="tpc-out__dot"
                :class="{ 'tpc-out__dot--on': (active[ch.stopIndex] ?? 0) === ai }"
                :aria-label="a.title"
                :aria-selected="(active[ch.stopIndex] ?? 0) === ai"
                role="tab"
                @click="scrollTo(ch, ai)"
              />
            </div>
          </section>
        </div>
      </li>
    </ol>

    <!-- Pop-up van een uitje: foto + volledige tekst -->
    <Teleport to="body">
      <Transition name="tpc-fade">
        <div v-if="info" class="tpc-info" @click.self="info = null">
          <article class="tpc-info__card" role="dialog" aria-modal="true" :aria-label="info.more?.title ?? info.title" data-scroll-lock-allow="true">
            <button type="button" class="tpc-info__close" :aria-label="t('common.close')" @click="info = null">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
            <img v-if="info.more?.image ?? info.image" :src="info.more?.image ?? info.image" :alt="info.more?.title ?? info.title" class="tpc-info__img" />
            <div class="tpc-info__body">
              <p class="tpc-info__eyebrow">{{ info.dayLabel }} · {{ info.tag }}</p>
              <h3 class="tpc-info__title">{{ info.more?.title ?? info.title }}</h3>
              <p v-for="(p, i) in (info.more?.paragraphs?.length ? info.more.paragraphs : [info.text])" :key="i" class="tpc-info__text">{{ p }}</p>
            </div>
          </article>
        </div>
      </Transition>
    </Teleport>
    <MultiHotelTripImageLightbox v-if="lightbox && lightbox.image" :image="lightbox.image" :title="lightbox.title" :tag="t('trip.itin.city.extrasTag')" @close="lightbox = null" />
  </div>
</template>

<script setup lang="ts">
import { useBodyScrollLock } from '~/composables-multi-hotel-trip/useBodyScrollLock'
import TripItineraryStats from './TripItineraryStats.vue'
import { countTripSights } from '~/utils-multi-hotel-trip/tripSights'
import type { TripHotelLink } from './TripHotelText.vue'
import type { TripBlockView, TripDayView } from './TripItinerary.vue'

/** Eén uitje in de carrousel: een activiteitenblok uit het dagprogramma + de dag. */
export interface TripCityAttraction extends TripBlockView {
  /** "Dag 2" — label op de foto en in de pop-up. */
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
  /** "Dag 1 t/m 2" — als de datums niet bekend zijn. */
  dayLabel: string
  /** "Do 20 aug" — alleen als er een aankomstdatum gekozen is. */
  checkIn?: string
  checkOut?: string
  /** Beschrijving van het hotel. */
  hotelText: string
  /** Inbegrepen bij het hotel: het ontbijt (en de overnachtingen). */
  hotelIncludes: string[]
  /** Extra's-blok: het diner op de dag van aankomst (titel, tekst, foto). */
  extras?: { title: string; text: string; image?: string }
  /** Overige inbegrepen extra's (welkomstbubbels, late check-out, parkeren …). */
  extraIncludes: string[]
  /** Drie uitjes in de buurt. */
  attractions: TripCityAttraction[]
}

const props = withDefaults(defineProps<{
  chapters: TripCityChapter[]
  /** Het volledige dagprogramma — voor de kerngetallen (dagen, bezienswaardigheden). */
  days: TripDayView[]
  hotels?: TripHotelLink[]
  /** Mobiel: smallere tijdlijn, foto's boven de tekst. */
  stacked?: boolean
}>(), { hotels: () => [], stacked: false })

defineEmits<{ 'open-hotel': [stopIndex: number] }>()

const { t } = useMultiHotelTripI18n()

/* Open hoofdstukken — standaard alleen het eerste. */
const open = ref<Set<number>>(new Set(props.chapters[0] ? [props.chapters[0].stopIndex] : []))
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

/** Aantal bezienswaardigheden (zie utils tripSights). */
const sightsCount = computed(() => countTripSights(props.days))

/** Ingeklapt: "Hotel Royal Beaulaincourt · 3-gangendiner · Ontdek Béthune · Een dag naar Lille …" */
function summaryOf(ch: TripCityChapter): string {
  return [ch.hotelName, ch.extras?.title, ...ch.attractions.map(a => a.title)].filter(Boolean).join(' · ')
}
/** Maximaal drie foto's voor de ingeklapte kop: hotel, diner, eerste uitje. */
function thumbsOf(ch: TripCityChapter): string[] {
  return [ch.image, ch.extras?.image, ...ch.attractions.map(a => a.image)].filter((s): s is string => !!s).slice(0, 3)
}

/* Carrousel: actieve kaart per hoofdstuk (voor de stippen/pijlen), scroll-snap doet de rest. */
const tracks = new Map<number, HTMLElement>()
function setTrack(i: number, el: HTMLElement | null) {
  if (el) tracks.set(i, el)
  else tracks.delete(i)
}
const active = reactive<Record<number, number>>({})
function cardStep(track: HTMLElement): number {
  const first = track.querySelector<HTMLElement>('.tpc-card')
  const gap = parseFloat(getComputedStyle(track).columnGap || '16') || 16
  return first ? first.offsetWidth + gap : track.clientWidth
}
function onScroll(ch: TripCityChapter) {
  const track = tracks.get(ch.stopIndex)
  if (!track) return
  const idx = Math.round(track.scrollLeft / cardStep(track))
  active[ch.stopIndex] = Math.max(0, Math.min(ch.attractions.length - 1, idx))
}
function scrollTo(ch: TripCityChapter, idx: number) {
  const track = tracks.get(ch.stopIndex)
  if (!track) return
  const i = Math.max(0, Math.min(ch.attractions.length - 1, idx))
  track.scrollTo({ left: i * cardStep(track), behavior: 'smooth' })
  active[ch.stopIndex] = i
}

/* Pop-ups: uitje (foto + volledige tekst) en foto-lightbox van het extra's-blok. */
const info = ref<TripCityAttraction | null>(null)
const lightbox = ref<{ title: string; image?: string } | null>(null)
useBodyScrollLock().bindTo(computed(() => !!info.value || !!lightbox.value))
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') { info.value = null; lightbox.value = null } }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.tpc { display: flex; flex-direction: column; gap: var(--space-md); }
.tpc__bar { display: flex; align-items: center; justify-content: space-between; gap: var(--space-md); }
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

.tpc-ch__h { margin: 0; font: inherit; }
.tpc-ch__head {
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
.tpc-ch--open .tpc-ch__head { border-bottom-color: transparent; padding-bottom: 8px; }
.tpc-ch__head:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 4px; border-radius: 4px; }
.tpc-ch__main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.tpc-ch__eyebrow { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 13px; color: var(--color-text-secondary); }
.tpc-ch__label { font-weight: 700; color: var(--color-text-primary); text-transform: uppercase; letter-spacing: 0.06em; font-size: 12px; }
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
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 700;
  line-height: 1.25;
  color: var(--color-text-primary);
}
.tpc-ch__head:hover .tpc-ch__title { color: var(--color-primary); }
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
.tpc-ch__thumbs { display: flex; flex-shrink: 0; }
.tpc-ch__thumbs img {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}
.tpc-ch__thumbs img + img { margin-left: -14px; }
.tpc-ch__chev { flex-shrink: 0; color: var(--color-text-primary); transition: transform 200ms ease; }
.tpc-ch--open .tpc-ch__chev { transform: rotate(180deg); }

.tpc-ch__panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: 0 0 var(--space-xl);
  border-bottom: 1px solid var(--color-border-light);
}

/* Sub-blok: foto links (240 px), tekst rechts — zelfde maat als de dagblokken. */
.tpc-blk { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: var(--space-lg); align-items: start; }
.tpc-blk__media {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-background-secondary);
  cursor: pointer;
}
.tpc-blk__media img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s ease; }
.tpc-blk__media:hover img { transform: scale(1.03); }
.tpc-blk__media:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
.tpc-blk__tag,
.tpc-card__tag {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.94);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
.tpc-blk--hotel .tpc-blk__tag { background: #141414; color: #fff; }
.tpc-blk__body { min-width: 0; padding-top: 2px; }
.tpc-blk__title { margin: 0 0 4px; font-size: 17px; font-weight: 600; line-height: 1.3; color: var(--color-text-primary); }
.tpc-blk__stars { margin-left: 6px; font-size: 13px; color: var(--color-text-primary); letter-spacing: 0.04em; }
.tpc-blk__meta { display: flex; align-items: center; gap: 5px; margin: 0 0 6px; font-size: 13px; color: var(--color-text-secondary); }
.tpc-blk__text { margin: 0; font-size: 14px; line-height: 1.65; color: var(--color-text-secondary); }
.tpc-blk__link {
  display: inline-block;
  margin-top: 10px;
  padding: 0;
  background: none;
  border: none;
  color: var(--color-primary);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}
.tpc-blk__link:hover { color: var(--color-primary-hover); }
/* Inbegrepen-regels (vinkjes) onder de tekst. */
.tpc-incl { list-style: none; margin: 10px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px 16px; }
.tpc-incl__item { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--color-text-primary); }
.tpc-incl__item svg { color: var(--color-discount, #00b67a); flex-shrink: 0; }

/* Leuke uitjes in de buurt: grijs vlak met horizontale carrousel. */
.tpc-out {
  --tpc-card-w: 280px;
  padding: var(--space-lg) 0 var(--space-md);
  border-radius: var(--radius-lg);
  background: var(--color-background-secondary, #fbfaf8);
}
.tpc-out__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-md); padding: 0 var(--space-lg); margin-bottom: var(--space-md); }
.tpc-out__title { margin: 0 0 2px; font-family: var(--font-heading); font-size: 20px; font-weight: 700; line-height: 1.25; color: var(--color-text-primary); }
.tpc-out__intro { margin: 0; font-size: 13px; color: var(--color-text-secondary); }
.tpc-out__nav { display: flex; gap: 6px; flex-shrink: 0; }
.tpc-out__arrow {
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border, #ddd);
  border-radius: 50%;
  background: #fff;
  color: var(--color-text-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}
.tpc-out__arrow:hover:not(:disabled) { border-color: var(--color-text-primary); }
.tpc-out__arrow:disabled { opacity: 0.35; cursor: default; }
.tpc-out__track {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-left: var(--space-lg);
  padding: 0 var(--space-lg) 6px;
  scrollbar-width: none;
}
.tpc-out__track::-webkit-scrollbar { display: none; }
.tpc-card {
  flex: 0 0 var(--tpc-card-w);
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  border-radius: var(--radius-lg);
}
.tpc-card:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 4px; }
.tpc-card__media {
  position: relative;
  display: block;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #fff;
}
.tpc-card__media img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s ease; }
.tpc-card:hover .tpc-card__media img { transform: scale(1.03); }
.tpc-card__title { font-family: var(--font-heading); font-size: 17px; font-weight: 700; line-height: 1.3; color: var(--color-text-primary); margin-top: 4px; }
.tpc-card:hover .tpc-card__title { color: var(--color-primary); }
.tpc-card__text {
  font-size: 14px;
  line-height: 1.55;
  color: var(--color-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.tpc-card__more { font-size: 13px; font-weight: 600; color: var(--color-primary); text-decoration: underline; text-underline-offset: 3px; }
.tpc-out__dots { display: flex; gap: 8px; padding: 10px var(--space-lg) 0; }
.tpc-out__dot { width: 8px; height: 8px; padding: 0; border: 0; border-radius: 50%; background: var(--color-border, #d9d9d9); cursor: pointer; }
.tpc-out__dot--on { background: var(--color-text-primary); }

/* Pop-up van een uitje. */
.tpc-info {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  background: rgba(0, 0, 0, 0.55);
}
.tpc-info__card {
  position: relative;
  width: min(560px, 100%);
  max-height: 88vh;
  overflow: auto;
  border-radius: var(--radius-lg);
  background: var(--color-surface, #fff);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}
.tpc-info__img { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; }
.tpc-info__body { padding: var(--space-lg); }
.tpc-info__eyebrow { margin: 0 0 6px; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-text-secondary); }
.tpc-info__title { margin: 0 0 var(--space-sm); font-family: var(--font-heading); font-size: 22px; font-weight: 700; line-height: 1.2; }
.tpc-info__text { margin: 0 0 var(--space-sm); font-size: 15px; line-height: 1.7; color: var(--color-text-secondary); }
.tpc-info__text:last-child { margin-bottom: 0; }
.tpc-info__close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: #141414;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}
.tpc-fade-enter-active, .tpc-fade-leave-active { transition: opacity 180ms ease; }
.tpc-fade-enter-from, .tpc-fade-leave-to { opacity: 0; }

/* Mobiel / gestapeld: smallere tijdlijn, foto boven de tekst, bredere kaarten. */
.tpc--stacked .tpc-ch { padding-left: 40px; }
.tpc--stacked .tpc-ch::before { left: 13px; }
.tpc--stacked .tpc-ch__node { width: 28px; height: 28px; font-size: 12px; top: 14px; }
.tpc--stacked .tpc-ch__thumbs { display: none; }
.tpc--stacked .tpc-ch__title { font-size: 19px; }
.tpc--stacked .tpc-blk { grid-template-columns: 1fr; gap: var(--space-sm); }
.tpc--stacked .tpc-out { --tpc-card-w: 76%; }
@media (max-width: 767px) {
  .tpc-ch__thumbs { display: none; }
  .tpc-blk { grid-template-columns: 1fr; gap: var(--space-sm); }
  .tpc-out { --tpc-card-w: 76%; }
}
</style>
