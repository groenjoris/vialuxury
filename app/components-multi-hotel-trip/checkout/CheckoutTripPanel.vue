<template>
  <!-- Multi Hotel Trip checkout — "Bekijk je volledige reis": op desktop een sidepanel
       (440 px, rechts), op mobiel een pop-up over het hele scherm (zoals "Bekijk je
       volledige arrangement" bij een gewoon arrangement). Toont de reis én alle keuzes:
       reisnaam, aankomst/vertrek, de route (per hotel plaats, nachten en de datums),
       wat er inbegrepen is, per hotel een kamerkaart (kamertype, kamerfoto,
       faciliteiten — geen aantal kamers: een vakantie telt in personen) en de
       gekozen annuleringsoptie. Klik op de achtergrond, "Sluit",
       Escape of "Doorgaan met boeken" sluit. Krijgt de .mht-checkout-klasse mee zodat
       de checkout-tokens ook na de Teleport gelden. -->
  <Teleport to="body">
    <div class="mht-checkout ctp">
      <div class="ctp__backdrop" @click="$emit('close')"></div>
      <aside class="ctp__panel" role="dialog" aria-modal="true" :aria-label="`Bekijk je volledige ${trip.typeWord}`" data-scroll-lock-allow="true">
          <header class="ctp__header">
            <button ref="closeEl" type="button" class="ctp__close" @click="$emit('close')">
              <span class="ctp__closelabel">Sluit</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </header>

          <div class="ctp__body">
            <p class="ctp__eyebrow">Geweldige keuze!</p>
            <h3 class="ctp__title">Bekijk je volledige {{ trip.typeWord }}</h3>

            <!-- De reis -->
            <p class="ctp__tripname">{{ trip.name }}</p>
            <p class="t-caption c-mgrey ctp__tripmeta">{{ trip.typeLabel }} · {{ trip.hotels.length }} hotels · {{ trip.nights }} nachten · {{ roomsPerHotel * 2 }} personen</p>
            <div v-if="checkIn || checkOut" class="ctp__dates">
              <div class="ctp__datecell">
                <span class="t-caption c-mgrey">Aankomst</span>
                <span class="t-body t-bold">{{ checkIn }}</span>
              </div>
              <div class="ctp__datecell">
                <span class="t-caption c-mgrey">Vertrek</span>
                <span class="t-body t-bold">{{ checkOut }}</span>
              </div>
            </div>
            <img v-if="trip.thumb" :src="trip.thumb" :alt="trip.name" class="ctp__img" />

            <!-- Route: per hotel plaats, nachten en (met datum) van–tot -->
            <p class="t-body t-bold ctp__sechead">Je route</p>
            <ol class="ctp__hotels">
              <li v-for="(h, i) in trip.hotels" :key="h.name" class="ctp__hotel">
                <span class="ctp__num">{{ i + 1 }}</span>
                <div class="ctp__hotelbody">
                  <p class="t-body t-bold ctp__hotelname">
                    {{ h.name }}
                    <span v-if="h.starRating" class="ctp__stars" aria-hidden="true">{{ '★'.repeat(h.starRating) }}</span>
                  </p>
                  <p class="t-caption c-mgrey">{{ h.city }} · {{ h.nights }} {{ h.nights === 1 ? 'nacht' : 'nachten' }}<template v-if="stayLabels[i]"> · {{ stayLabels[i] }}</template></p>
                </div>
              </li>
            </ol>

            <!-- Inbegrepen -->
            <p class="t-body t-bold ctp__sechead">Jouw {{ trip.typeWord }} bevat:</p>
            <ul class="ctp__includes">
              <li v-for="item in trip.includes" :key="item" class="ctp__inc t-body">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                {{ item }}
              </li>
            </ul>

            <!-- Per hotel het kamertype, foto, faciliteiten -->
            <p class="t-body t-bold ctp__sechead">Jouw kamers</p>
            <div class="ctp__rooms">
              <article v-for="(h, i) in trip.hotels" :key="`room-${h.name}`" class="ctp__room">
                <div class="ctp__roomhead">
                  <div class="ctp__roomtext">
                    <p class="ctp__roomname">{{ h.roomName }}</p>
                    <p class="t-caption c-mgrey">Hotel {{ i + 1 }} · {{ h.name }}<template v-if="stayLabels[i]"> · {{ stayLabels[i] }}</template></p>
                  </div>
                </div>
                <img v-if="h.image || trip.thumb" :src="h.image || trip.thumb" :alt="`${h.roomName} — ${h.name}`" class="ctp__roomimg" />
                <template v-if="h.facilities.length">
                  <p class="t-body t-bold ctp__roomsub">Kamerfaciliteiten:</p>
                  <div class="ctp__pills">
                    <span v-for="f in h.facilities" :key="f.label" class="ctp__pill">{{ f.label }}</span>
                  </div>
                </template>
              </article>
            </div>

            <!-- Gekozen annuleringsoptie -->
            <div v-if="rateKey" class="ctp__option">
              <svg v-if="rateKey === 'flexible'" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" /><path d="M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
              <span class="t-body"><b>{{ rateKey === 'flexible' ? 'Flexibel annuleren' : 'Niet-terugbetaalbaar' }}</b> — geldt voor alle {{ trip.hotels.length }} hotels</span>
            </div>

            <button type="button" class="btn-primary ctp__cta" @click="$emit('close')">Doorgaan met boeken</button>
            <div class="ctp__trust"><img src="/images/trustpilot.svg" alt="Trustpilot" /></div>
          </div>
        </aside>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { TripCheckout } from '~/data/mht-checkout/trip'
import { useBodyScrollLock } from '~/composables-multi-hotel-trip/useBodyScrollLock'

const props = withDefaults(defineProps<{
  trip: TripCheckout
  /** Aankomst/vertrek zoals in de kassabon ("ma 5 okt"). */
  checkIn?: string
  checkOut?: string
  /** Aankomstdatum als jaar/maand(0-based)/dag — voor de datums per hotel. */
  checkInYmd?: { year: number; month: number; day: number } | null
  /** Keuze uit de room table: kamers per hotel (= personen / 2) en de annuleringsoptie. */
  roomsPerHotel?: number
  rateKey?: 'flexible' | 'nonrefundable' | null
}>(), { checkIn: '', checkOut: '', checkInYmd: null, roomsPerHotel: 1, rateKey: null })
const emit = defineEmits<{ close: [] }>()

/* Datums per hotel ("ma 5 – wo 7 okt") uit de aankomstdatum en de nachten per hotel. */
const WEEKDAYS = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']
const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
const fmt = (d: Date) => `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
const stayLabels = computed<string[]>(() => {
  const ymd = props.checkInYmd
  if (!ymd) return props.trip.hotels.map(() => '')
  let offset = 0
  return props.trip.hotels.map((h) => {
    const from = new Date(ymd.year, ymd.month, ymd.day + offset)
    const to = new Date(ymd.year, ymd.month, ymd.day + offset + h.nights)
    offset += h.nights
    return `${fmt(from)} – ${fmt(to)}`
  })
})

// Scroll-lock voor de levensduur van het panel (v-if in de ouder): expliciet
// acquire/release, want een gestopte watcher geeft de lock niet terug.
const scrollLock = useBodyScrollLock()
const closeEl = ref<HTMLButtonElement | null>(null)
let returnFocus: HTMLElement | null = null
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') emit('close') }
onMounted(() => {
  returnFocus = document.activeElement as HTMLElement | null
  scrollLock.acquire()
  window.addEventListener('keydown', onKey)
  nextTick(() => closeEl.value?.focus())
})
onBeforeUnmount(() => {
  scrollLock.release()
  window.removeEventListener('keydown', onKey)
  returnFocus?.focus?.()
})
</script>

<style scoped>
.ctp { position: fixed; inset: 0; z-index: 1300; }
.ctp__backdrop { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.4); }
.ctp__panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 440px;
  max-width: 95vw;
  display: flex;
  flex-direction: column;
  background: #fff;
  box-shadow: -8px 0 30px rgba(0, 0, 0, 0.15);
}
.ctp__header { flex-shrink: 0; display: flex; align-items: center; padding: 16px 24px 0; }
/* "Sluit ×" als tekstlink met kruisje (zoals de pop-up bij een gewoon arrangement). */
.ctp__close {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
  border: 0;
  background: none;
  color: var(--c-via-black, #1a1e1e);
  font-family: inherit;
  cursor: pointer;
}
.ctp__closelabel { font-size: var(--t-body, 14px); font-weight: 500; text-decoration: underline; text-underline-offset: 3px; }
.ctp__close:focus-visible { outline: 2px solid var(--c-via-green, #36c890); outline-offset: 2px; }
.ctp__body { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 20px 24px 32px; }
.ctp__eyebrow { margin: 0 0 4px; font-size: 15px; color: var(--c-via-black, #1a1e1e); }
.ctp__title { margin: 0 0 20px; font-size: 24px; line-height: 1.2; font-weight: var(--w-black, 900); color: var(--c-via-black, #1a1e1e); }
.ctp__tripname { margin: 0 0 2px; font-size: 16px; font-weight: 700; color: var(--c-via-black, #1a1e1e); }
.ctp__tripmeta { margin: 0 0 12px; }
.ctp__dates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin: 0 0 16px;
  border: 1px solid var(--c-light-grey, #e6e6e6);
  border-radius: var(--radius-sm, 6px);
}
.ctp__datecell { display: flex; flex-direction: column; gap: 2px; padding: 8px 12px; }
.ctp__datecell + .ctp__datecell { border-left: 1px solid var(--c-light-grey, #e6e6e6); text-align: right; }
.ctp__img { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 8px; margin-bottom: 20px; }
.ctp__sechead { margin: 0 0 10px; }
.ctp__hotels { list-style: none; margin: 0 0 24px; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.ctp__hotel { display: flex; align-items: flex-start; gap: 12px; }
.ctp__num {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--c-via-black, #1a1e1e);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.ctp__hotelbody { min-width: 0; }
.ctp__hotelname { margin: 0 0 2px; }
.ctp__stars { font-size: 12px; margin-left: 4px; color: var(--c-via-black, #1a1e1e); }
.ctp__includes { list-style: none; margin: 0 0 24px; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.ctp__inc { display: flex; align-items: flex-start; gap: 8px; }
.ctp__inc svg { flex-shrink: 0; margin-top: 4px; color: var(--c-via-green, #36c890); }
/* Kamerkaarten per hotel (als de kamerkaart in de pop-up van een gewoon arrangement). */
.ctp__rooms { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.ctp__room { border: 1px solid var(--c-light-grey, #e6e6e6); border-radius: var(--radius, 8px); padding: 14px; display: flex; flex-direction: column; gap: 10px; }
.ctp__roomhead { display: flex; align-items: flex-start; gap: 12px; }
.ctp__roomtext { min-width: 0; }
.ctp__roomname { margin: 0 0 2px; font-size: 16px; font-weight: 700; line-height: 1.3; color: var(--c-via-black, #1a1e1e); }
.ctp__roomimg { display: block; width: 100%; aspect-ratio: 3 / 2; object-fit: cover; border-radius: var(--radius-sm, 6px); }
.ctp__roomsub { margin: 2px 0 0; }
.ctp__pills { display: flex; flex-wrap: wrap; gap: 6px; }
.ctp__pill { padding: 4px 8px; border: 1px solid var(--c-dark-grey, #888); border-radius: 6px; font-size: 13px; color: var(--c-grey, #555); }
.ctp__option { display: flex; align-items: flex-start; gap: 8px; margin: 0 0 20px; }
.ctp__option svg { flex-shrink: 0; margin-top: 3px; color: var(--c-via-green, #36c890); }
.ctp__cta { width: 100%; }
.ctp__trust { display: flex; justify-content: center; margin-top: 20px; }
.ctp__trust img { height: 44px; width: auto; }

/* Inschuiven van rechts (CSS-animatie: loopt ook zonder Vue-transitieframes). */
.ctp__backdrop { animation: ctp-fade 200ms ease; }
.ctp__panel { animation: ctp-slide 260ms cubic-bezier(0.2, 0.8, 0.2, 1); }
@keyframes ctp-fade { from { opacity: 0; } }
@keyframes ctp-slide { from { transform: translateX(100%); } }
@media (prefers-reduced-motion: reduce) {
  .ctp__backdrop, .ctp__panel { animation: none; }
}
/* Mobiel: pop-up over het hele scherm (geen strook links), 20px zijmarge zoals de mobiele checkout. */
@media (max-width: 767px) {
  .ctp__panel { width: 100%; max-width: none; box-shadow: none; }
  .ctp__header { padding: 16px 20px 0; }
  .ctp__body { padding: 20px 20px 32px; }
  .ctp__panel { animation: ctp-up 300ms cubic-bezier(0.2, 0.8, 0.2, 1); }
  @keyframes ctp-up { from { transform: translateY(100%); } }
}
</style>
