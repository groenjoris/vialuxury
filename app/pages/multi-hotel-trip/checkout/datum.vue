<script setup lang="ts">
// Multi Hotel Trip checkout — stap 1: datum kiezen. Overgenomen uit het
// flexibel-annuleren prototype (kalenderstap van variant "Flexibel annuleren
// A — Room table": geen prijsblok in de kassabon, de prijs volgt pas bij de
// kamerkeuze). Vanaf de dealpagina kom je hier als er nog geen datum gekozen
// is; "Opslaan en doorgaan" leidt naar de kamerkeuze (room table).
import { hotel, dealName } from '~/data/mht-checkout/deal'
import { CHECKOUT_NIGHTS } from '~/data/mht-checkout/pricing'
import { useStickyFit } from '~/composables-multi-hotel-trip/useStickyFit'
import { useMultiHotelTripCheckoutTrip } from '~/composables-multi-hotel-trip/useMultiHotelTripCheckoutTrip'

// Vakantie (meerdere hotels): kalender toont de reisprijs en het aantal
// nachten van de reis; de kassabon de reisnaam met Aankomst/Vertrek.
const { trip: checkoutTrip } = useMultiHotelTripCheckoutTrip()
const tripPopupOpen = ref(false)

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

// Vakantie: reisprijs met dezelfde weekdag-variatie (t.o.v. de zondagprijs).
function priceForWeekday(weekday: number) {
  const base = PRICE_BY_WEEKDAY[weekday]!
  return checkoutTrip.value ? checkoutTrip.value.price + (base - PRICE_BY_WEEKDAY[0]!) : base
}
function priceFor(day: number) {
  return priceForWeekday(new Date(view.year, view.month, day).getDay())
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

// Verblijf is 2 nachten (vakantie: aantal nachten van de reis): aankomstdag
// "in", tussendagen, vertrekdag "uit".
const nights = computed(() => checkoutTrip.value?.nights ?? CHECKOUT_NIGHTS)

function cellRole(day: number): 'in' | 'mid' | 'uit' | null {
  const s = selected.value
  if (!s || s.year !== view.year || s.month !== view.month) return null
  if (day === s.day) return 'in'
  if (day > s.day && day < s.day + nights.value) return 'mid'
  if (day === s.day + nights.value) return 'uit'
  return null
}

function pick(cell: CalendarCell) {
  if (!cell.day || cell.unavailable) return
  selected.value = { year: view.year, month: view.month, day: cell.day }
}

const dayPrice = computed(() => {
  const s = selected.value
  return s ? priceForWeekday(new Date(s.year, s.month, s.day).getDay()) : 0
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
const checkOutLabel = computed(() => formatDay(nights.value))

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
          checkOut: formatDay(nights.value),
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
// Ook bij een vakantie door naar de kamertabel (één cluster van kamers).
function onCta() {
  if (selected.value) navigateTo('/multi-hotel-trip/checkout/kamers')
}

const arrangementIncludes = computed(() => checkoutTrip.value?.includes ?? [
  '2 x Overnachting',
  'Dagelijks ontbijtbuffet',
  '3-Gangendiner (dag van aankomst)',
  'Tasting uurtje 17:00 - 18:00',
])

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
                Getoonde prijs is voor {{ checkoutTrip ? `de complete ${checkoutTrip.typeWord} (${checkoutTrip.hotels.length} hotels)` : 'het complete arrangement' }} voor 2 personen voor {{ nights }} nachten.
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
                  <!-- Laagste prijs: oranje sterretje linksboven, zoals op de PDP-kalender. -->
                  <span v-if="cell.price === lowestPrice && !cell.unavailable && cellRole(cell.day) === null" class="cal__star">★</span>
                  <span class="cal__day">{{ cell.day }}</span>
                  <span v-if="cell.unavailable" class="cal__price cal__price--sold">–</span>
                  <span v-else-if="cellRole(cell.day) === 'mid' || cellRole(cell.day) === 'uit'" class="cal__price">–</span>
                  <span v-else class="cal__price" :class="{ 'cal__price--cheapest': cell.price === lowestPrice }">€{{ cell.price }}</span>
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
            <!-- Vakantie: reisnaam (geen hotel-/plaatsnamen — die staan in de
                 pop-up "Bekijk je volledige reis") -->
            <div class="side__hotel">
              <img class="side__thumb" :src="checkoutTrip ? checkoutTrip.thumb : hotel.thumb" :alt="checkoutTrip ? checkoutTrip.name : hotel.name" />
              <div>
                <p class="t-body t-bold">{{ checkoutTrip ? checkoutTrip.name : dealName }}</p>
                <p v-if="checkoutTrip" class="t-body c-mgrey">{{ checkoutTrip.typeLabel }} · {{ checkoutTrip.hotels.length }} hotels</p>
                <p v-else class="t-body c-mgrey">{{ hotel.name }}</p>
              </div>
            </div>

            <!-- Na selectie: gekozen data -->
            <template v-if="selected">
              <div class="side__dates">
                <div class="side__datecell">
                  <p class="t-caption c-mgrey">{{ checkoutTrip ? 'Aankomst' : 'Check in' }}</p>
                  <p class="t-body t-bold">{{ checkInLabel }}</p>
                </div>
                <div class="side__datecell">
                  <p class="t-caption c-mgrey">{{ checkoutTrip ? 'Vertrek' : 'Check out' }}</p>
                  <p class="t-body t-bold">{{ checkOutLabel }}</p>
                </div>
              </div>
              <button class="side__link side__link--center t-body" type="button" @click="selected = null">
                Verander data
              </button>
            </template>

            <div class="side__includes">
              <p class="t-body t-bold">{{ checkoutTrip ? `Jouw ${checkoutTrip.typeWord} bevat` : 'Jouw arrangement bevat' }}</p>
              <p v-for="item in arrangementIncludes" :key="item" class="side__inc t-body">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                {{ item }}
              </p>
              <button v-if="checkoutTrip" class="side__link side__link--left t-body" type="button" @click="tripPopupOpen = true">Bekijk je volledige reis</button>
              <a v-else-if="selected" class="side__link side__link--left t-body" href="#">Bekijk je volledige arrangement</a>
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

    <MultiHotelTripCheckoutTripPopup v-if="tripPopupOpen && checkoutTrip" :trip="checkoutTrip" @close="tripPopupOpen = false" />
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
/* Dagcel — identiek aan de PDP-kalender (variant 6): witte tegel met hairline
   rand en 1px schaduw, 60px hoog, dagnummer + prijs gecentreerd. */
.cal__cell {
  position: relative;
  border: 1px solid var(--color-border);
  border-radius: 0;
  height: 60px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 5px;
  background: #fff;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  transition: background 0.15s ease;
}
.cal__cell:hover:not(:disabled):not(.cal__cell--empty) {
  background: #f3fbf7;
}
.cal__cell--empty {
  border: none;
  background: transparent;
  box-shadow: none;
}
/* Niet beschikbaar: vlakke grijze tegel zonder rand/schaduw. */
.cal__cell--unavailable {
  background: #dbdbdb;
  border-color: transparent;
  box-shadow: none;
  opacity: 0.4;
  cursor: not-allowed;
}
/* Geselecteerde in-/uitcheckdag: groene tegel met zwarte rand, witte tekst, vet dagnummer. */
.cal__cell--selected {
  background: var(--color-discount);
  border-color: var(--color-text-primary);
  box-shadow: none;
}
.cal__cell--selected .cal__day { font-weight: 700; }
/* In/uit-pil: doorschijnend wit, alleen linksonder afgerond, tegen de rand. */
.cal__badge {
  position: absolute;
  top: -1px;
  right: -1px;
  min-width: 18px;
  padding: 2px 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 0 0 0 8px;
  font-size: 9px;
  font-weight: 400;
  line-height: 1;
  pointer-events: none;
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
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--color-text-primary);
}
/* Prijs: 12px semibold, huisstijl-donkergroen, tabulaire cijfers (als PDP). */
.cal__price {
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 1.4;
  color: var(--color-green-dark, #00675f);
}
.cal__price--cheapest { color: var(--color-primary); }
.cal__price--sold { color: var(--color-text-muted); }
/* Oranje sterretje linksboven bij de laagste prijs. */
.cal__star {
  position: absolute;
  top: 1px;
  left: 1px;
  font-size: 14px;
  line-height: 1;
  color: var(--color-primary);
  pointer-events: none;
}
.cal__star--legend {
  position: static;
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
  background: #dbdbdb;
  border: 1px solid transparent;
  opacity: 0.4;
}
.cal__swatch--selected {
  background: var(--color-discount);
  border-color: var(--color-text-primary);
  opacity: 1;
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
