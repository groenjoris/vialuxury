<template>
  <!-- Multi Hotel Trip — "Wat te doen tijdens je vakantie" (variant "Per stad"):
       verticale tijdlijn met per hotel één hoofdstuk "Tips in de buurt (MVP; MHT: Leuke uitjes)
       van {hotel}". Kop: die titel, daaronder plaatsnaam, aantal nachten en —
       als de datums bekend zijn — check-in en check-out. Uitgeklapt: de drie
       uitjes in hetzelfde ontwerp als "Tips in de buurt" op de gewone
       arrangementenpagina (HotelNearbyTips, ingebed). Op de lijn tussen twee
       bollen staat halverwege de afstand in kilometers. Geen in- en uitklappen:
       alle hoofdstukken staan altijd open. -->
  <div class="tpc" :class="{ 'tpc--stacked': stacked }">
    <div v-if="showStats" class="tpc__bar">
      <TripItineraryStats :days="days.length" :hotels="chapters.length" :sights="sightsCount" />
    </div>

    <ol ref="listEl" class="tpc__list">
      <template v-for="(ch, ci) in chapters" :key="ch.stopIndex">
        <!-- Afstand vanaf het vorige hotel, halverwege de lijn tussen de bollen. -->
        <li v-if="ci > 0 && ch.travelKm && kmTops[ci] != null" class="tpc__km" role="presentation" aria-hidden="true" :style="{ top: `${kmTops[ci]}px` }">
          {{ ch.travelKm }} km
        </li>
        <li :id="`itin-stad-${ch.stopIndex + 1}`" class="tpc-ch">
          <span class="tpc-ch__node" aria-hidden="true">{{ ci + 1 }}</span>
          <!-- Kop: titel, daaronder plaats, nachten en datums. -->
          <div class="tpc-ch__head">
            <span class="tpc-ch__main">
              <h3 class="tpc-ch__title">{{ t('trip.itin.city.tipsAt').replace('{hotel}', ch.hotelName) }}</h3>
              <span class="tpc-ch__eyebrow">
                <span class="tpc-ch__place">{{ ch.city }}</span>
                <span class="tpc-ch__nights">{{ ch.nightsLabel }}</span>
                <span class="tpc-ch__dates">{{ ch.checkIn && ch.checkOut ? `${ch.checkIn} – ${ch.checkOut}` : ch.dayLabel }}</span>
              </span>
            </span>
          </div>

          <div class="tpc-ch__panel">
            <MvpTripHotelNearbyTips :tips="tipsOf(ch)" :hotel-name="ch.hotelName" embedded mobile-single-row :max="8" />
          </div>
        </li>
      </template>
    </ol>
  </div>
</template>

<script setup lang="ts">
import TripItineraryStats from './TripItineraryStats.vue'
import { countTripSights } from '~/utils-mvp-trip/tripSights'
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
}>(), { hotels: () => [], stacked: false, showStats: true })

defineEmits<{ 'open-hotel': [stopIndex: number] }>()

const { t } = useMvpTripI18n()

const sightsCount = computed(() => countTripSights(props.days))

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
   hoofdstuk hangt af van de inhoud en de breedte, dus de positie wordt gemeten. */
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
</script>

<style scoped>
.tpc { display: flex; flex-direction: column; gap: var(--space-md); }
.tpc__bar { display: flex; align-items: center; gap: var(--space-md); }

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
  border: 2px solid var(--color-dark, #141414);
  background: var(--color-dark, #141414);
  color: #fff;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 700;
}
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
  padding: 12px 0 8px;
}
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

.tpc-ch__panel {
  padding: 0 0 var(--space-xl);
  border-bottom: 1px solid var(--color-border-light);
}
/* Laatste hoofdstuk: geen sluitlijn onder "Wat te doen tijdens je vakantie" — de sectie
   erna heeft zijn eigen scheidingslijn, anders staan er twee lijnen onder elkaar. */
.tpc-ch:last-child .tpc-ch__panel { border-bottom: 0; }

/* Mobiel / gestapeld: smallere tijdlijn. */
.tpc--stacked .tpc-ch { padding-left: 40px; }
.tpc--stacked .tpc-ch::before { left: 13px; }
.tpc--stacked .tpc-ch__node { width: 28px; height: 28px; font-size: 12px; top: 14px; }
.tpc--stacked .tpc__km { left: 14px; }
.tpc--stacked .tpc-ch__title { font-size: 19px; }
</style>
