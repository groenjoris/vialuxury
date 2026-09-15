<script setup lang="ts">
// Multi Hotel Trip checkout — stap 1: datum kiezen. Overgenomen uit het
// flexibel-annuleren prototype (kalenderstap van variant "Flexibel annuleren
// A — Room table": geen prijsblok in de kassabon, de prijs volgt pas bij de
// kamerkeuze). Vanaf de dealpagina kom je hier als er nog geen datum gekozen
// is; "Opslaan en doorgaan" leidt naar de kamerkeuze (room table).
import { hotel, dealName } from '~/data/mht-checkout/deal'
import { CHECKOUT_NIGHTS } from '~/data/mht-checkout/pricing'
import { useStickyFit } from '~/composables-multi-hotel-trip/useStickyFit'

const MONTH_NAMES = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
]
const WEEKDAYS = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']

// Startmaand zoals in het screenshot van de live site.
const view = reactive({ year: 2026, month: 7 }) // 7 = augustus (0-based)
const selected = ref<{ year: number; month: number; day: number } | null>(null)

function prevMonth() {
  view.month -= 1
  if (view.month < 0) {
    view.month = 11
    view.year -= 1
  }
}
function nextMonth() {
  view.month += 1
  if (view.month > 11) {
    view.month = 0
    view.year += 1
  }
}

// Prijs per weekdag (patroon uit het screenshot: zo het laagst, vr het hoogst).
const PRICE_BY_WEEKDAY = [459, 469, 469, 469, 489, 509, 479] // zo, ma, di, wo, do, vr, za

function priceFor(day: number) {
  return PRICE_BY_WEEKDAY[new Date(view.year, view.month, day).getDay()]
}

// Niet-beschikbare dagen: augustus 2026 exact als het screenshot; overige
// maanden een klein deterministisch blok zodat de kalender levendig blijft.
function isUnavailable(day: number) {
  if (view.year === 2026 && view.month === 7) {
    return (day >= 2 && day <= 8) || (day >= 13 && day <= 15)
  }
  const start = ((view.month * 7) % 25) + 2
  return day >= start && day <= start + 3
}

interface CalendarCell {
  day: number | null
  price?: number
  unavailable?: boolean
}

const cells = computed<CalendarCell[]>(() => {
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
  const firstWeekday = (new Date(view.year, view.month, 1).getDay() + 6) % 7 // ma = 0
  const list: CalendarCell[] = []
  for (let i = 0; i < firstWeekday; i++) list.push({ day: null })
  for (let d = 1; d <= daysInMonth; d++) {
    const unavailable = isUnavailable(d)
    list.push({ day: d, unavailable, price: unavailable ? undefined : priceFor(d) })
  }
  return list
})

// Laagste beschikbare prijs van de zichtbare maand (voor het sterretje).
const lowestPrice = computed(() =>
  Math.min(...cells.value.filter((c) => c.day && !c.unavailable).map((c) => c.price ?? Infinity)),
)

// Verblijf is 2 nachten: aankomstdag "in", tussendag, vertrekdag "uit".
const NIGHTS = CHECKOUT_NIGHTS

function cellRole(day: number): 'in' | 'mid' | 'uit' | null {
  const s = selected.value
  if (!s || s.year !== view.year || s.month !== view.month) return null
  if (day === s.day) return 'in'
  if (day > s.day && day < s.day + NIGHTS) return 'mid'
  if (day === s.day + NIGHTS) return 'uit'
  return null
}

function pick(cell: CalendarCell) {
  if (!cell.day || cell.unavailable) return
  selected.value = { year: view.year, month: view.month, day: cell.day }
}

const dayPrice = computed(() => {
  const s = selected.value
  return s ? PRICE_BY_WEEKDAY[new Date(s.year, s.month, s.day).getDay()] : 0
})

const WEEKDAY_LABELS = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']
const MONTH_SHORT = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
function formatDay(offset: number) {
  const s = selected.value
  if (!s) return ''
  const d = new Date(s.year, s.month, s.day + offset)
  return `${WEEKDAY_LABELS[d.getDay()]} ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`
}
const checkInLabel = computed(() => formatDay(0))
const checkOutLabel = computed(() => formatDay(NIGHTS))

// Kalenderprijs + datums delen met de room table en de gegevenspagina:
// het goedkoopste kamertype volgt de gekozen dag.
const checkoutDay = useState<{
  price: number
  checkIn?: string
  checkOut?: string
  checkInYmd?: { year: number; month: number; day: number }
} | null>('mht-checkout-day', () => null)
watch(
  [selected, dayPrice],
  () => {
    checkoutDay.value = selected.value
      ? {
          price: dayPrice.value,
          checkIn: formatDay(0),
          checkOut: formatDay(NIGHTS),
          checkInYmd: { ...selected.value },
        }
      : null
  },
  { immediate: true },
)

// Sidebar groeit na een datumkeuze: sticky-offset schuift mee zodat de CTA
// onderin zichtbaar blijft op lagere schermen.
const sideEl = ref<HTMLElement | null>(null)
const sideTop = useStickyFit(sideEl, 16)

const ctaDisabled = computed(() => selected.value === null)
const ctaText = computed(() =>
  selected.value === null ? 'Selecteer eerst een datum' : 'Opslaan en doorgaan',
)
// Vakantie (vlag van de dealpagina): geen kamerkeuze, direct naar gegevens.
const checkoutIsTrip = useState<boolean>('mht-checkout-trip', () => false)
function onCta() {
  if (selected.value) navigateTo(checkoutIsTrip.value ? '/multi-hotel-trip/checkout/gegevens' : '/multi-hotel-trip/checkout/kamers')
}

const arrangementIncludes = [
  '2 x Overnachting',
  'Dagelijks ontbijtbuffet',
  '3-Gangendiner (dag van aankomst)',
  'Tasting uurtje 17:00 - 18:00',
]

useHead({ title: 'Kies datum — ViaLuxury' })
</script>

<template>
  <div class="mht-checkout page page--white">
    <MultiHotelTripCheckoutTopNav />

    <div class="page__stepper">
      <MultiHotelTripCheckoutStepper :active="1" />
    </div>

    <main class="page__main container">
      <div class="page__grid">
        <!-- Kalender -->
        <div class="col-form">
          <h1 class="t-display">Selecteer datum</h1>

          <section class="card cal">
            <header class="cal__head">
              <h2 class="t-h1">Selecteer aankomstdatum</h2>
              <p class="t-body t-bold">
                Getoonde prijs is voor het complete arrangement voor 2 personen voor 2 nachten.
              </p>
            </header>

            <div class="cal__nav">
              <button class="cal__navbtn" type="button" aria-label="Vorige maand" @click="prevMonth">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </button>
              <span class="t-body-lg">{{ MONTH_NAMES[view.month] }} {{ view.year }}</span>
              <button class="cal__navbtn" type="button" aria-label="Volgende maand" @click="nextMonth">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </button>
            </div>

            <div class="cal__weekdays">
              <span v-for="w in WEEKDAYS" :key="w" class="t-body c-mgrey">{{ w }}</span>
            </div>

            <div class="cal__grid">
              <template v-for="(cell, i) in cells" :key="i">
                <span v-if="cell.day === null" class="cal__cell cal__cell--empty" />
                <button
                  v-else
                  type="button"
                  class="cal__cell"
                  :class="{
                    'cal__cell--unavailable': cell.unavailable,
                    'cal__cell--selected': cellRole(cell.day) !== null,
                  }"
                  :disabled="cell.unavailable"
                  @click="pick(cell)"
                >
                  <span v-if="cellRole(cell.day) === 'in'" class="cal__badge">in</span>
                  <span v-else-if="cellRole(cell.day) === 'uit'" class="cal__badge">uit</span>
                  <span class="cal__day">{{ cell.day }}</span>
                  <span v-if="cell.unavailable" class="cal__price c-mgrey">–</span>
                  <span v-else-if="cellRole(cell.day) === 'mid' || cellRole(cell.day) === 'uit'" class="cal__price">–</span>
                  <span v-else class="cal__price">
                    €{{ cell.price }}<span v-if="cell.price === lowestPrice" class="cal__star">★</span>
                  </span>
                </button>
              </template>
            </div>

            <div class="cal__legend">
              <span class="cal__legenditem"><span class="cal__star cal__star--legend">★</span> Laagste prijs</span>
              <span class="cal__legenditem"><span class="cal__swatch cal__swatch--selected" /> Geselecteerde datum</span>
              <span class="cal__legenditem"><span class="cal__swatch" /> Niet beschikbaar</span>
            </div>
          </section>

          <div v-if="selected" class="cal__cta">
            <button class="btn-primary btn-primary--auto" type="button" @click="onCta">
              Opslaan en doorgaan
            </button>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="col-summary">
          <aside ref="sideEl" class="card side" :style="{ top: `${sideTop}px` }">
            <div class="side__hotel">
              <img class="side__thumb" :src="hotel.thumb" :alt="hotel.name" />
              <div>
                <p class="t-body t-bold">{{ dealName }}</p>
                <p class="t-body c-mgrey">{{ hotel.name }}</p>
              </div>
            </div>

            <!-- Na selectie: gekozen data -->
            <template v-if="selected">
              <div class="side__dates">
                <div class="side__datecell">
                  <p class="t-caption c-mgrey">Check in</p>
                  <p class="t-body t-bold">{{ checkInLabel }}</p>
                </div>
                <div class="side__datecell">
                  <p class="t-caption c-mgrey">Check out</p>
                  <p class="t-body t-bold">{{ checkOutLabel }}</p>
                </div>
              </div>
              <button class="side__link side__link--center t-body" type="button" @click="selected = null">
                Verander data
              </button>
            </template>

            <div class="side__includes">
              <p class="t-body t-bold">Jouw arrangement bevat</p>
              <p v-for="item in arrangementIncludes" :key="item" class="side__inc t-body">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                {{ item }}
              </p>
              <a v-if="selected" class="side__link side__link--left t-body" href="#">Bekijk je volledige arrangement</a>
            </div>

            <!-- Geen prijsblok in deze stap (room-table variant): de prijs
                 volgt bij de kamerkeuze. -->

            <button
              class="btn-primary"
              type="button"
              :disabled="ctaDisabled"
              @click="onCta"
            >
              {{ ctaText }}
            </button>

            <div class="side__trust">
              <img src="/images/trustpilot.svg" alt="Trustpilot" />
            </div>
          </aside>
        </div>
      </div>
    </main>

    <MultiHotelTripCheckoutFooter />
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.page--white {
  background: var(--c-white);
}
.page__stepper {
  padding: 32px 24px;
}
.page__main {
  flex: 1;
}
.page__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 350px;
  gap: 48px;
  align-items: start;
}
.col-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.col-summary {
  padding-top: 72px;
  /* Kolom net zo hoog als de rij, anders heeft de sticky sidebar geen
     ruimte om mee te bewegen naast de lange kalender. */
  align-self: stretch;
}

/* Kalenderkaart */
.cal {
  padding: var(--card-pad);
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-shadow: none;
}
.cal__head {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cal__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cal__navbtn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--c-via-black);
  transition: background 0.15s ease;
}
.cal__navbtn:hover {
  background: var(--c-surface);
}
.cal__weekdays,
.cal__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}
.cal__weekdays span {
  text-align: center;
}
.cal__cell {
  border: 1px solid var(--c-light-grey);
  border-radius: var(--radius-sm);
  min-height: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: var(--c-white);
  transition: border-color 0.15s ease;
}
.cal__cell:hover:not(:disabled):not(.cal__cell--empty) {
  border-color: var(--c-via-black);
}
.cal__cell--empty {
  border: none;
  background: transparent;
}
.cal__cell--unavailable {
  background: var(--c-surface);
  cursor: not-allowed;
}
.cal__cell--unavailable .cal__day {
  color: var(--c-medium-grey);
}
.cal__cell--selected {
  background: var(--c-via-green);
  border-color: var(--c-via-green);
  position: relative;
}
.cal__badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #00675f;
  color: var(--c-white);
  font-size: 10px;
  line-height: 1;
  padding: 3px 6px;
  border-radius: 0 3px 0 4px;
}
.cal__cta {
  display: flex;
  justify-content: center;
}
.btn-primary--auto {
  width: auto;
  min-width: 254px;
}
.cal__cell--selected .cal__day,
.cal__cell--selected .cal__price {
  color: var(--c-white);
}
.cal__day {
  font-size: var(--t-body-lg);
  color: var(--c-via-black);
}
.cal__price {
  font-size: var(--t-body);
  color: var(--c-via-green);
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.cal__star {
  color: var(--c-via-orange);
  font-size: 11px;
}
.cal__star--legend {
  font-size: 14px;
}
.cal__legend {
  display: flex;
  align-items: center;
  gap: 28px;
  padding-top: 4px;
}
.cal__legenditem {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: var(--t-body);
  color: var(--c-via-black);
}
.cal__swatch {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  background: var(--c-surface);
  border: 1px solid var(--c-light-grey);
}
.cal__swatch--selected {
  background: var(--c-via-green);
  border-color: var(--c-via-green);
}

/* Sidebar */
.side {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: sticky;
  top: 16px;
  box-shadow: none;
}
.side__hotel {
  display: flex;
  gap: 12px;
  align-items: center;
}
.side__thumb {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}
.side__dates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid var(--c-light-grey);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.side__datecell {
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.side__datecell + .side__datecell {
  border-left: 1px solid var(--c-light-grey);
}
.side__link {
  color: var(--c-via-black);
  text-decoration: underline;
  text-align: center;
}
.side__link--center {
  align-self: center;
}
/* Arrangement- en voorwaardenlinks: links uitgelijnd in de kassabon */
.side__link--left {
  text-align: left;
  align-self: flex-start;
}
.side__includes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.side__inc {
  display: flex;
  align-items: center;
  gap: 8px;
}
.side__inc svg {
  color: var(--c-via-green);
  flex-shrink: 0;
}
.side__trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.side__trust img {
  height: 64px;
}
</style>
