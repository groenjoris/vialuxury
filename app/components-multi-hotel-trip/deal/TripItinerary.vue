<template>
  <!-- Multi Hotel Trip — dagprogramma op de vakantie-PDP. Per dag een sectie
       ("Dag 1", met datum zodra er een aankomstdatum is) met 2–3 blokken
       onder elkaar: altijd foto links, tekst rechts. Elke dag na de eerste
       begint met wakker worden en ontbijten (inbegrepen); inchecken toont het
       hotel met een link naar de hotel-pop-up; uitcheckdagen beginnen met wat
       je onderweg kunt doen. `stacked` (mobiel) zet foto boven tekst.
       Begint met een klikbare samenvatting (één regel per dag → springt naar
       die dag, klapt zo nodig eerst uit); daarna staat alleen dag 1 plus het
       eerste blok van dag 2 open, met "Toon volledig voorbeeld reisschema" om
       de rest uit te klappen en "Toon minder" om weer in te klappen
       (`collapsible`). -->
  <div ref="rootRef" class="itin" :class="{ 'itin--stacked': stacked }">
    <ul v-if="collapsible && days.length" class="itin-summary">
      <li v-for="day in days" :key="`sum-${day.day}`" class="itin-summary__item">
        <button type="button" class="itin-summary__link" @click="goToDay(day.day)">
          <span class="itin-summary__day">{{ day.label }}</span> · <span class="itin-summary__text">{{ summaryOf(day) }}</span>
        </button>
      </li>
    </ul>

    <section v-for="day in visibleDays" :key="day.day" :id="`itin-dag-${day.day}`" class="itin-day">
      <header class="itin-day__head">
        <h3 class="itin-day__title">
          {{ day.label }}
          <span v-if="day.date" class="itin-day__date">{{ day.date }}</span>
        </h3>
        <p v-if="day.subtitle" class="itin-day__subtitle">
          <MultiHotelTripHotelText :text="day.subtitle" :hotels="hotels" @open-hotel="$emit('open-hotel', $event)" />
        </p>
      </header>

      <div class="itin-day__blocks">
        <article
          v-for="(block, i) in day.blocks"
          :key="`${day.day}-${i}`"
          class="itin-block"
          :class="`itin-block--${block.kind}`"
        >
          <!-- Foto is klikbaar: grotere versie in een gecentreerde pop-up. -->
          <button
            type="button"
            class="itin-block__media"
            :aria-label="`${block.title} — ${t('common.allPhotos')}`"
            @click="openImage(block)"
          >
            <img v-if="block.image" :src="block.image" :alt="block.title" loading="lazy" />
            <span class="itin-block__tag">{{ block.tag }}</span>
          </button>
          <div class="itin-block__body">
            <h4 class="itin-block__title">
              <MultiHotelTripHotelText :text="block.title" :hotels="hotels" @open-hotel="$emit('open-hotel', $event)" />
            </h4>
            <p v-if="block.meta" class="itin-block__meta">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4.5 9.75768C4.5 15.5 12 22 12 22C12 22 19.5 15.5 19.5 9.75768C19.5 4.81181 15.6559 2 12 2C8.34409 2 4.5 4.81181 4.5 9.75768Z" /><path d="M12 12C13.3807 12 14.5 10.8807 14.5 9.5C14.5 8.11929 13.3807 7 12 7C10.6193 7 9.5 8.11929 9.5 9.5C9.5 10.8807 10.6193 12 12 12Z" />
              </svg>
              {{ block.meta }}
            </p>
            <p class="itin-block__text">{{ block.text }}</p>
            <!-- "Meer over …" (→ info-pop-up met de achtergrond die niet in het korte
                 blok past). Hotelinfo zit achter de hotelnaam in de kop (sidepanel) en
                 achter "Lees meer" in het inclusieblok, niet meer als aparte link hier. -->
            <div v-if="block.more" class="itin-block__links">
              <button
                type="button"
                class="itin-block__link"
                @click="info = block.more"
              >{{ block.more.label }}</button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- Ingeklapt: het hele schema uitklappen; uitgeklapt: weer inklappen (en terug naar boven). -->
    <button v-if="collapsible && days.length > 1" type="button" class="itin__toggle" :aria-expanded="expanded" @click="expanded ? collapse() : (expanded = true)">
      {{ expanded ? t('trip.showLess') : t('trip.showMore') }}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" :class="{ 'itin__toggle-icon--up': expanded }"><polyline points="6 9 12 15 18 9" /></svg>
    </button>

    <!-- Gecentreerde info-pop-up ("Meer over de Opaalkust") -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="info" class="itin-info" @click.self="info = null">
          <article class="itin-info__card" data-scroll-lock-allow="true">
            <button type="button" class="itin-info__close" :aria-label="t('common.close')" @click="info = null">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
            <img v-if="info.image" :src="info.image" :alt="info.title" class="itin-info__img" />
            <div class="itin-info__body">
              <h3 class="itin-info__title">{{ info.title }}</h3>
              <p v-for="(p, i) in info.paragraphs" :key="i" class="itin-info__text">{{ p }}</p>
            </div>
          </article>
        </div>
      </Transition>
    </Teleport>

    <!-- Gecentreerde foto-pop-up (gedeeld met het inclusieblok op de PDP) -->
    <MultiHotelTripImageLightbox v-if="lightbox && lightbox.image" :image="lightbox.image" :title="lightbox.title" :tag="lightbox.tag" @close="lightbox = null" />
  </div>
</template>

<script setup lang="ts">
import { useBodyScrollLock } from '~/composables-multi-hotel-trip/useBodyScrollLock'
import type { TripHotelLink } from './TripHotelText.vue'

export type TripBlockKind = 'checkin' | 'checkout' | 'activity' | 'dinner' | 'homeward' | 'breakfast'

/** Eén blok in het dagprogramma, al vertaald door de dealpagina. */
export interface TripBlockView {
  kind: TripBlockKind
  /** Korte label linksboven op de foto: "Inchecken", "Onderweg", "Diner", … */
  tag: string
  title: string
  text: string
  image?: string
  /** Hotelblok: sterren en plaats/streek. */
  starRating?: number
  meta?: string
  /** Index en naam van het hotel (voor het hotel-sidepanel en de "Meer over"-link). */
  stopIndex?: number
  hotelName?: string
  /** "Meer over …"-pop-up (label, titel, alinea's, foto). */
  more?: TripMoreInfoView
}

export interface TripMoreInfoView {
  label: string
  title: string
  paragraphs: string[]
  image?: string
}

export interface TripDayView {
  day: number
  /** "Dag 1" */
  label: string
  /** "do 18 sep" — alleen met gekozen aankomstdatum. */
  date?: string
  /** "Béthune" of "Béthune → Tilques" */
  subtitle?: string
  blocks: TripBlockView[]
  /** Hotel waar je die nacht slaapt (null op de terugreisdag). */
  stopIndex?: number | null
  /** Hotel waar je die ochtend vertrekt (wisseldag / terugreis). */
  fromStopIndex?: number
  /** Soort dag: aankomst, wisseldag, verblijf of terugreis. */
  type?: 'arrival' | 'transfer' | 'stay' | 'home'
}

const props = withDefaults(defineProps<{
  days: TripDayView[]
  /** Hotelnamen van de vakantie → klikbaar in koppen en ondertitels. */
  hotels?: TripHotelLink[]
  /** Mobiel: foto boven de tekst. */
  stacked?: boolean
  /** Samenvatting bovenaan en ingeklapt beginnen (dag 1 + eerste blok van dag 2, "Toon meer"). */
  collapsible?: boolean
}>(), { stacked: false, hotels: () => [], collapsible: true })

defineEmits<{ 'open-hotel': [stopIndex: number] }>()

/* Ingeklapt/uitgeklapt. Ingeklapt: dag 1 volledig en van dag 2 alleen het eerste blok. */
const expanded = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const visibleDays = computed<TripDayView[]>(() => {
  if (!props.collapsible || expanded.value || props.days.length < 2) return props.days
  const [first, second] = props.days
  return [first!, { ...second!, blocks: second!.blocks.slice(0, 1) }]
})
/** Samenvatting: naar een dag springen; ligt die buiten het ingeklapte deel
 *  (of is dag 2 maar half zichtbaar), dan eerst uitklappen. */
async function goToDay(dayNr: number) {
  const idx = props.days.findIndex(d => d.day === dayNr)
  if (props.collapsible && !expanded.value && idx > 0) {
    expanded.value = true
    await nextTick()
  }
  document.getElementById(`itin-dag-${dayNr}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
/** "Toon minder": inklappen en terug naar de kop van het schema. */
function collapse() {
  expanded.value = false
  rootRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
/** Eén regel per dag voor de samenvatting: het belangrijkste onderdeel van de
 *  dag (onderweg/etappe, terugreis of de eerste activiteit; anders het hotel). */
function summaryOf(day: TripDayView): string {
  const main = day.blocks.find(b => b.kind === 'checkout' || b.kind === 'homeward')
    ?? day.blocks.find(b => b.kind === 'activity')
    ?? day.blocks.find(b => b.kind === 'checkin')
  return main?.title ?? day.subtitle ?? ''
}


const { t } = useMultiHotelTripI18n()

/** Grotere versie van een blokfoto in een gecentreerde pop-up. */
const lightbox = ref<TripBlockView | null>(null)
function openImage(block: TripBlockView) {
  if (block.image) lightbox.value = block
}
/** "Meer over …"-pop-up. */
const info = ref<TripMoreInfoView | null>(null)
useBodyScrollLock().bindTo(computed(() => !!lightbox.value || !!info.value))
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') { lightbox.value = null; info.value = null } }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.itin {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}
/* Samenvatting: één klikbare bullet per dag (springt naar die dag). */
.itin-summary {
  margin: 0;
  padding: 0 0 0 20px;
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-text-primary);
}
.itin-summary__item + .itin-summary__item { margin-top: 4px; }
.itin-summary__link {
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
}
.itin-summary__link:hover .itin-summary__text,
.itin-summary__link:focus-visible .itin-summary__text { color: var(--color-primary); text-decoration: underline; text-underline-offset: 3px; }
.itin-summary__day { font-weight: 700; }
.itin-summary__text { color: var(--color-text-secondary); transition: color var(--transition-fast); }
/* Dagsecties: ruimte voor de vaste balk bij het springen vanuit de samenvatting. */
.itin-day { scroll-margin-top: 96px; }
.itin { scroll-margin-top: 96px; }
/* "Toon volledig voorbeeld reisschema" / "Toon minder": opvallende, gecentreerde knop. */
.itin__toggle {
  align-self: center;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 24px;
  border: 1.5px solid var(--color-dark, #141414);
  border-radius: 999px;
  background: #fff;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.itin__toggle:hover { background: var(--color-dark, #141414); color: #fff; }
.itin__toggle svg { transition: transform 200ms ease; }
.itin__toggle-icon--up { transform: rotate(180deg); }
.itin-day + .itin-day {
  padding-top: var(--space-xl);
  border-top: 1px solid var(--color-border-light);
}
.itin-day__head { margin-bottom: var(--space-md); }
.itin-day__title {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--color-text-primary);
}
.itin-day__date {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
}
.itin-day__subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}
.itin-day__blocks {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

/* Blok: foto links (vaste breedte), tekst rechts. */
.itin-block {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: var(--space-lg);
  align-items: start;
}
.itin-block__media {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-background-secondary);
  cursor: zoom-in;
}
.itin-block__media img { transition: transform 0.3s ease; }
.itin-block__media:hover img { transform: scale(1.03); }
.itin-block__media:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
.itin-block__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
/* Soortlabel linksboven op de foto ("Inchecken", "Onderweg", "Diner"). */
.itin-block__tag {
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
/* Inchecken / onderweg / terugreis: zwart label met witte tekst. */
.itin-block--checkin .itin-block__tag,
.itin-block--checkout .itin-block__tag,
.itin-block--homeward .itin-block__tag {
  background: #141414;
  color: #fff;
}
.itin-block__body { min-width: 0; padding-top: 2px; }
.itin-block__title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 4px;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-text-primary);
}
.itin-block__meta {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0 0 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.itin-block__text {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: var(--color-text-secondary);
}
/* Dezelfde oranje onderstreepte link als "Lees meer" op de dealpagina. */
.itin-block__link {
  display: inline-block;
  margin-top: 8px;
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
.itin-block__link:hover { color: var(--color-primary-hover); }
.itin-block__links { display: flex; flex-wrap: wrap; gap: 0 20px; }

/* Info-pop-up: gecentreerde kaart met optionele foto, titel en alinea's. */
.itin-info {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  background: rgba(0, 0, 0, 0.55);
}
.itin-info__card {
  position: relative;
  width: min(560px, 100%);
  max-height: 88vh;
  overflow: auto;
  border-radius: var(--radius-lg);
  background: var(--color-surface, #fff);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}
.itin-info__img { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; }
.itin-info__body { padding: var(--space-lg); }
.itin-info__title { margin: 0 0 var(--space-sm); font-size: 22px; font-weight: 700; line-height: 1.2; }
.itin-info__text { margin: 0 0 var(--space-sm); font-size: 15px; line-height: 1.7; color: var(--color-text-secondary); }
.itin-info__text:last-child { margin-bottom: 0; }
.itin-info__close {
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
.itin-info__close:hover { background: #fff; }

/* ── Foto-pop-up ── */
.fade-enter-active, .fade-leave-active { transition: opacity 180ms ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.itin--stacked .itin-block { grid-template-columns: 1fr; gap: var(--space-sm); }
@media (max-width: 767px) {
  .itin-block { grid-template-columns: 1fr; gap: var(--space-sm); }
  .itin-day__title { font-size: 18px; }
}
</style>
