<template>
  <!-- Multi Hotel Trip — variant "Per plaats" van het voorbeeld-reisschema:
       50/50-split.
       LINKS (sticky): de routekaart van de hele reis. De plaats die rechts in
       beeld is, licht op (oranje marker); klik op een marker → rechts naar
       die plaats scrollen. Eronder: "Stop 2 van 3 · Tilques" + "Bekijk grote kaart".
       RECHTS (scrollt met de pagina): bovenaan sticky een voortgangsbalk — een
       horizontale lijn met ronde, genummerde nodes per plaats (klikbaar) die
       zich vult naarmate je verder scrollt. Daaronder per plaats:
         · kop: "Stop 1 · Dag 1 t/m 2", plaatsnaam, regio, reisafstand vanaf
           de vorige plaats;
         · hotelkaart: foto, hotelnaam + sterren, nachten, "Bekijk hotel";
         · per dag: "Dag 1 · datum — Aankomst in Béthune" en de blokken
           (foto links, tekst rechts, "Meer over …").
       De terugreisdag hoort bij de laatste plaats. -->
  <div ref="rootRef" class="tic" :class="{ 'tic--stacked': stacked }">
    <!-- Links: kaart -->
    <aside class="tic__map-col">
      <div class="tic__map">
        <MultiHotelTripRouteMap
          :stops="mapStops"
          :legs="legs"
          :leg-labels="legLabels"
          :return-leg-label="returnLabel"
          :width="400"
          :height="stacked ? 300 : 500"
          :max-scale="700"
          :marker-radius="17"
          :label-size="13"
          :leg-label-size="13"
          :active-index="active"
          show-labels
          geo-names
          marker-icon
          leg-label-style="plain"
          interactive
          @stop-click="goTo"
        />
      </div>
      <div class="tic__map-caption">
        <span class="tic__map-stop">
          <span class="tic__map-stop-n">{{ t('trip.itin.stop').replace('{n}', String(active + 1)).replace('{total}', String(groups.length)) }}</span>
          <span class="tic__map-stop-city">{{ groups[active]?.stop.city }}</span>
        </span>
        <button type="button" class="tic__link" @click="$emit('open-map')">{{ t('trip.itin.viewMap') }}</button>
      </div>
    </aside>

    <!-- Rechts: redactionele inhoud per plaats -->
    <div class="tic__content">
      <nav class="tic-progress" :style="{ '--n': groups.length }" :aria-label="t('trip.itineraryHeading')">
        <div class="tic-progress__track" aria-hidden="true">
          <span class="tic-progress__fill" :style="{ transform: `scaleX(${fill})` }" />
        </div>
        <ol class="tic-progress__nodes">
          <li v-for="(g, i) in groups" :key="g.stopIndex" class="tic-progress__item">
            <button
              type="button"
              class="tic-progress__node"
              :class="{ 'is-done': i < active, 'is-active': i === active }"
              :aria-current="i === active ? 'step' : undefined"
              @click="goTo(i)"
            >
              <span class="tic-progress__dot">{{ i + 1 }}</span>
              <span class="tic-progress__city">{{ g.stop.city }}</span>
              <span class="tic-progress__days">{{ g.dayRange }}</span>
            </button>
          </li>
        </ol>
      </nav>

      <section
        v-for="(g, i) in groups"
        :key="g.stopIndex"
        :ref="(el) => setSectionRef(el as HTMLElement | null, i)"
        :id="`itin-plaats-${i + 1}`"
        class="tic-city"
      >
        <header class="tic-city__head">
          <p class="tic-city__eyebrow">{{ t('trip.itin.stop').replace('{n}', String(i + 1)).replace('{total}', String(groups.length)) }} · {{ g.dayRange }}</p>
          <h3 class="tic-city__name">{{ g.stop.city }}</h3>
          <p class="tic-city__region">{{ g.stop.region }}</p>
          <p v-if="i > 0 && g.stop.travelLabel" class="tic-city__travel">
            <img src="/icons/mht/car.svg" alt="" width="18" height="18" />
            {{ t('trip.itin.fromPrev').replace('{distance}', g.stop.travelLabel).replace('{city}', groups[i - 1]!.stop.city) }}
          </p>
        </header>

        <div class="tic-hotel">
          <img v-if="g.stop.image" :src="g.stop.image" :alt="g.stop.hotelName" class="tic-hotel__img" loading="lazy" />
          <div class="tic-hotel__body">
            <p class="tic-hotel__name">
              {{ g.stop.hotelName }}
              <span v-if="g.stop.starRating" class="tic-hotel__stars" :aria-label="`${g.stop.starRating} sterren`">{{ '★'.repeat(g.stop.starRating) }}</span>
            </p>
            <p class="tic-hotel__nights">{{ g.stop.nightsLabel }}</p>
          </div>
          <button type="button" class="tic-hotel__btn" @click="$emit('open-hotel', g.stopIndex)">{{ t('trip.itin.viewHotel') }}</button>
        </div>

        <div v-for="day in g.days" :key="day.day" class="tic-day">
          <h4 class="tic-day__label">
            <span class="tic-day__n">{{ day.label }}</span>
            <span v-if="day.date" class="tic-day__date">{{ day.date }}</span>
            <span class="tic-day__head">{{ headlineOf(day) }}</span>
          </h4>
          <div class="tic-day__blocks">
            <TripItineraryBlock
              v-for="(block, bi) in day.blocks"
              :key="`${day.day}-${bi}`"
              :block="block"
              :hotels="hotels"
              :layout="stacked ? 'stacked' : 'row'"
              @open-hotel="$emit('open-hotel', $event)"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import TripItineraryBlock from './TripItineraryBlock.vue'
import type { TripHotelLink } from './TripHotelText.vue'
import type { TripDayView } from './TripItinerary.vue'
import type { TripRouteLeg } from '~/utils-multi-hotel-trip/tripMapLayers'

/** Hotel/plaats in reisvolgorde, al vertaald door de dealpagina. */
export interface TripItineraryStop {
  city: string
  region: string
  hotelName: string
  starRating?: number
  image?: string
  lat?: number
  lng?: number
  /** "2 nachten" */
  nightsLabel: string
  /** "50 km (50 minuten)" — reis vanaf de vorige plaats. */
  travelLabel?: string
  travelKm?: number
}

const props = withDefaults(defineProps<{
  days: TripDayView[]
  stops: TripItineraryStop[]
  legs?: TripRouteLeg[]
  returnLabel?: string
  hotels?: TripHotelLink[]
  stacked?: boolean
}>(), { legs: () => [], hotels: () => [], stacked: false })

defineEmits<{ 'open-hotel': [stopIndex: number]; 'open-map': [] }>()

const { t } = useMultiHotelTripI18n()

/** Dagen gegroepeerd per plaats (hotel waar je die nacht slaapt; de terugreisdag bij het laatste hotel). */
const groups = computed(() => {
  const out: { stopIndex: number; stop: TripItineraryStop; days: TripDayView[]; dayRange: string }[] = []
  for (const d of props.days) {
    const idx = d.stopIndex ?? d.fromStopIndex ?? 0
    let g = out.find(x => x.stopIndex === idx)
    if (!g) { g = { stopIndex: idx, stop: props.stops[idx]!, days: [], dayRange: '' }; out.push(g) }
    g.days.push(d)
  }
  for (const g of out) {
    const a = g.days[0]!.day, b = g.days[g.days.length - 1]!.day
    g.dayRange = a === b ? t('trip.daySingle').replace('{a}', String(a)) : t('trip.dayRange').replace('{a}', String(a)).replace('{b}', String(b))
  }
  return out.sort((x, y) => x.stopIndex - y.stopIndex)
})

const mapStops = computed(() => props.stops
  .filter(s => typeof s.lat === 'number' && typeof s.lng === 'number')
  .map(s => ({ lat: s.lat as number, lng: s.lng as number, label: s.city, title: s.hotelName })))
const legLabels = computed(() => props.stops.map(s => (s.travelKm ? `${s.travelKm} km` : undefined)))

function headlineOf(day: TripDayView): string {
  const city = day.stopIndex != null ? props.stops[day.stopIndex]?.city ?? '' : ''
  const from = day.fromStopIndex != null ? props.stops[day.fromStopIndex]?.city ?? '' : ''
  switch (day.type) {
    case 'arrival': return t('trip.itin.head.arrival').replace('{city}', city)
    case 'transfer': return t('trip.itin.head.transfer').replace('{from}', from).replace('{to}', city)
    case 'stay': return t('trip.itin.head.stay').replace('{city}', city)
    case 'home': return t('trip.itin.head.home')
    default: return ''
  }
}

/* ── Scroll-spy: welke plaats is in beeld + voortgang binnen die plaats ── */
const rootRef = ref<HTMLElement | null>(null)
const sections: (HTMLElement | null)[] = []
function setSectionRef(el: HTMLElement | null, i: number) { sections[i] = el }
const active = ref(0)
const fill = ref(0)
/** Lijn in de viewport (px van boven) waarop een plaats "actief" wordt: onder de vaste balk + voortgangsbalk. */
const probe = () => (props.stacked ? 140 : 220)

let raf = 0
function measure() {
  raf = 0
  const y = probe()
  let idx = 0
  for (let i = 0; i < sections.length; i++) {
    const el = sections[i]
    if (el && el.getBoundingClientRect().top <= y) idx = i
  }
  active.value = idx
  const n = sections.length
  if (n < 2) { fill.value = 1; return }
  const el = sections[idx]
  let frac = 0
  if (el && idx < n - 1) {
    const r = el.getBoundingClientRect()
    frac = Math.min(1, Math.max(0, (y - r.top) / Math.max(1, r.height)))
  }
  fill.value = Math.min(1, (idx + frac) / (n - 1))
}
function onScroll() { if (!raf) raf = requestAnimationFrame(measure) }
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  measure()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  if (raf) cancelAnimationFrame(raf)
})

/** Node of marker → naar die plaats scrollen. */
function goTo(i: number) {
  const el = sections[i]
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - (probe() - 20)
  window.scrollTo({ top, behavior: 'smooth' })
}
</script>

<style scoped>
.tic {
  --tic-top: 88px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--space-xl);
  align-items: start;
}

/* ── Links: sticky kaart ── */
.tic__map-col {
  position: sticky;
  top: calc(var(--tic-top) + 8px);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.tic__map {
  width: 100%;
  aspect-ratio: 4 / 5;
  max-height: calc(100vh - var(--tic-top) - 80px);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border-light);
  background: #d7e6f0;
}
.tic__map :deep(.trm) { width: 100%; height: 100%; display: block; }
.tic__map-caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}
.tic__map-stop { display: flex; flex-direction: column; line-height: 1.3; }
.tic__map-stop-n { font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-text-secondary); }
.tic__map-stop-city { font-family: var(--font-heading); font-size: 18px; font-weight: 700; color: var(--color-text-primary); }
.tic__link {
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
.tic__link:hover { color: var(--color-primary-hover); }

/* ── Rechts: voortgangsbalk (sticky bovenaan de kolom) ── */
.tic__content { min-width: 0; }
.tic-progress {
  position: sticky;
  top: var(--tic-top);
  z-index: 5;
  margin: 0 0 var(--space-lg);
  padding: 14px 0 12px;
  background: var(--color-surface, #fff);
  border-bottom: 1px solid var(--color-border-light);
  /* Dekt het strookje tussen de vaste boekingsbalk en de voortgangsbalk af. */
  box-shadow: 0 -24px 0 var(--color-surface, #fff);
}
.tic-progress__track {
  position: absolute;
  /* Van het midden van de eerste tot het midden van de laatste node. */
  left: calc(100% / var(--n, 3) / 2);
  right: calc(100% / var(--n, 3) / 2);
  top: 29px;
  height: 3px;
  border-radius: 3px;
  background: var(--color-border-light);
  overflow: hidden;
}
.tic-progress__fill {
  position: absolute;
  inset: 0;
  background: var(--color-primary);
  transform-origin: left center;
  transition: transform 120ms linear;
}
.tic-progress__nodes {
  position: relative;
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
}
.tic-progress__node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 0 4px;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
}
.tic-progress__node:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; border-radius: 6px; }
.tic-progress__dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 2px solid var(--color-border, #d9d4cc);
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 700;
  transition: all 200ms ease;
}
.tic-progress__node.is-done .tic-progress__dot { background: var(--color-primary); border-color: var(--color-primary); color: #fff; }
.tic-progress__node.is-active .tic-progress__dot {
  background: var(--color-dark, #141414);
  border-color: var(--color-dark, #141414);
  color: #fff;
  box-shadow: 0 0 0 4px rgba(233, 113, 50, 0.25);
}
.tic-progress__city {
  max-width: 100%;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-text-primary);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tic-progress__node:not(.is-active) .tic-progress__city { color: var(--color-text-secondary); font-weight: 600; }
.tic-progress__days { font-size: 11px; color: var(--color-text-secondary); }

/* ── Per plaats ── */
.tic-city { padding-bottom: var(--space-2xl); }
.tic-city + .tic-city { padding-top: var(--space-lg); border-top: 1px solid var(--color-border-light); }
.tic-city__eyebrow {
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-primary);
}
.tic-city__name {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 30px;
  font-weight: 700;
  line-height: 1.15;
  color: var(--color-text-primary);
}
.tic-city__region { margin: 2px 0 0; font-size: 14px; color: var(--color-text-secondary); }
.tic-city__travel {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0 0;
  padding: 5px 12px 5px 8px;
  border-radius: 999px;
  background: var(--color-background-secondary, #f4f1ec);
  font-size: 13px;
  color: var(--color-text-primary);
}

/* Hotelkaart */
.tic-hotel {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-md);
  margin: var(--space-md) 0 var(--space-lg);
  padding: 10px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface, #fff);
}
.tic-hotel__img { width: 72px; height: 72px; object-fit: cover; border-radius: var(--radius-md); display: block; }
.tic-hotel__body { min-width: 0; }
.tic-hotel__name { margin: 0; font-size: 15px; font-weight: 700; line-height: 1.3; color: var(--color-text-primary); }
.tic-hotel__stars { margin-left: 4px; color: var(--color-primary); font-size: 12px; letter-spacing: 1px; white-space: nowrap; }
.tic-hotel__nights { margin: 2px 0 0; font-size: 13px; color: var(--color-text-secondary); }
.tic-hotel__btn {
  padding: 9px 14px;
  border: 1.5px solid var(--color-dark, #141414);
  border-radius: 999px;
  background: #fff;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.tic-hotel__btn:hover { background: var(--color-dark, #141414); color: #fff; }

/* Dagen binnen een plaats */
.tic-day + .tic-day { margin-top: var(--space-xl); }
.tic-day__label {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin: 0 0 var(--space-md);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--color-text-primary);
}
.tic-day__n {
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 999px;
  background: #141414;
  color: #fff;
}
.tic-day__date { font-size: 13px; font-weight: 500; color: var(--color-text-secondary); }
.tic-day__head { flex-basis: 100%; }
.tic-day__blocks { display: flex; flex-direction: column; gap: var(--space-lg); }
/* Foto links, iets smaller dan in het gewone schema (halve paginabreedte). */
.tic-day__blocks :deep(.tib--row) { grid-template-columns: 200px minmax(0, 1fr); gap: var(--space-md); }

/* ── Mobiel: kaart boven (niet sticky), voortgangsbalk sticky bovenaan ── */
.tic--stacked { --tic-top: 0px; grid-template-columns: 1fr; gap: var(--space-md); }
.tic--stacked .tic__map-col { position: static; }
.tic--stacked .tic__map { aspect-ratio: 4 / 3; max-height: none; }
.tic--stacked .tic-city__name { font-size: 26px; }
.tic--stacked .tic-hotel { grid-template-columns: 64px minmax(0, 1fr); }
.tic--stacked .tic-hotel__img { width: 64px; height: 64px; }
.tic--stacked .tic-hotel__btn { grid-column: 1 / -1; }
</style>
