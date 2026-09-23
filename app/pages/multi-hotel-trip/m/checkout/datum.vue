<script setup lang="ts">
// Multi Hotel Trip checkout — MOBIELE site, stap 1: datum kiezen. Aparte
// site (niet responsive), overgenomen uit het flexibel-annuleren prototype:
// alleen de kalender, geen samenvatting. Een datumkeuze scrollt naar de CTA.
// Op een telefoon stuurt de mht-mobile middleware hier automatisch naartoe.
import { CHECKOUT_NIGHTS } from '~/data/mht-checkout/pricing'

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December',
]
const WEEKDAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

// Zelfde datamodel als de desktopkalender.
const view = reactive({ year: 2026, month: 7 }) // augustus 2026
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

const PRICE_BY_WEEKDAY = [459, 469, 469, 469, 489, 509, 479] // zo..za

function priceFor(day: number) {
  return PRICE_BY_WEEKDAY[new Date(view.year, view.month, day).getDay()]
}

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
  const firstWeekday = (new Date(view.year, view.month, 1).getDay() + 6) % 7
  const list: CalendarCell[] = []
  for (let i = 0; i < firstWeekday; i++) list.push({ day: null })
  for (let d = 1; d <= daysInMonth; d++) {
    const unavailable = isUnavailable(d)
    list.push({ day: d, unavailable, price: unavailable ? undefined : priceFor(d) })
  }
  return list
})

const lowestPrice = computed(() =>
  Math.min(...cells.value.filter((c) => c.day && !c.unavailable).map((c) => c.price ?? Infinity)),
)

const NIGHTS = CHECKOUT_NIGHTS

function cellRole(day: number): 'in' | 'mid' | 'uit' | null {
  const s = selected.value
  if (!s || s.year !== view.year || s.month !== view.month) return null
  if (day === s.day) return 'in'
  if (day > s.day && day < s.day + NIGHTS) return 'mid'
  if (day === s.day + NIGHTS) return 'uit'
  return null
}

const ctaEl = ref<HTMLElement | null>(null)

function pick(cell: CalendarCell) {
  if (!cell.day || cell.unavailable) return
  selected.value = { year: view.year, month: view.month, day: cell.day }
  // Mobiel: na een datumkeuze naar de CTA scrollen.
  nextTick(() => ctaEl.value?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
}

const dayPrice = computed(() => {
  const s = selected.value
  return s ? PRICE_BY_WEEKDAY[new Date(s.year, s.month, s.day).getDay()] : 0
})

// Datumlabels voor de samenvatting op de volgende stap.
const WEEKDAY_LABELS = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']
const MONTH_SHORT = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
function formatDay(offset: number) {
  const s = selected.value
  if (!s) return ''
  const d = new Date(s.year, s.month, s.day + offset)
  return `${WEEKDAY_LABELS[d.getDay()]} ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`
}

// Kalenderprijs + datums delen met de kamerkeuze (zelfde state als desktop).
// Vakantie (vlag van de dealpagina): geen kamerkeuze, direct naar gegevens.
const checkoutIsTrip = useState<boolean>('mht-checkout-trip', () => false)
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

useHead({ title: 'Selecteer aankomstdatum — ViaLuxury' })
</script>

<template>
  <div class="mht-checkout mht-checkout--m">
    <div class="mpage">
      <MultiHotelTripCheckoutMobileHeader :step="1" />

      <main class="mpage__main">
        <h1 class="mtitle">Selecteer aankomstdatum</h1>

        <section class="mcal">
          <p class="mcal__intro">
            Getoonde prijs is voor het complete arrangement voor 2 personen voor 2 nachten.
          </p>

          <!-- Zelfde kalenderlayout als op de dealpagina (CalendarMonth/DayCell) -->
          <div class="mcal__nav">
            <button class="mcal__navbtn" type="button" aria-label="Vorige maand" @click="prevMonth">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span class="mcal__month">{{ MONTH_NAMES[view.month] }} {{ view.year }}</span>
            <button class="mcal__navbtn" type="button" aria-label="Volgende maand" @click="nextMonth">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>

          <div class="mcal__weekdays">
            <span v-for="w in WEEKDAYS" :key="w">{{ w }}</span>
          </div>

          <div class="mcal__grid">
            <template v-for="(cell, i) in cells" :key="i">
              <span v-if="cell.day === null" class="mcal__cell mcal__cell--empty" />
              <button
                v-else
                type="button"
                class="mcal__cell"
                :class="{
                  'mcal__cell--unavailable': cell.unavailable,
                  'mcal__cell--in': cellRole(cell.day) === 'in' || cellRole(cell.day) === 'uit',
                  'mcal__cell--range': cellRole(cell.day) === 'mid',
                }"
                :disabled="cell.unavailable"
                @click="pick(cell)"
              >
                <span v-if="cellRole(cell.day) === 'in'" class="mcal__badge">in</span>
                <span v-else-if="cellRole(cell.day) === 'uit'" class="mcal__badge">uit</span>
                <span
                  v-if="cell.price === lowestPrice && !cell.unavailable && cellRole(cell.day) === null"
                  class="mcal__star"
                >★</span>
                <span class="mcal__day">{{ cell.day }}</span>
                <span v-if="cell.unavailable" class="mcal__sold">-</span>
                <span v-else-if="cellRole(cell.day) === 'in'" class="mcal__price mcal__price--selected">€{{ cell.price }}</span>
                <span v-else-if="cellRole(cell.day) === 'uit'" class="mcal__sold mcal__sold--selected">-</span>
                <span
                  v-else-if="cellRole(cell.day) === null"
                  class="mcal__price"
                  :class="{ 'mcal__price--cheapest': cell.price === lowestPrice }"
                >€{{ cell.price }}</span>
              </button>
            </template>
          </div>

          <div class="mcal__legend">
            <span class="mcal__legenditem"><span class="mcal__legendstar">★</span> Laagste prijs</span>
            <span class="mcal__legenditem"><span class="mcal__swatch" /> Niet beschikbaar</span>
          </div>
        </section>

        <div ref="ctaEl" class="mcta">
          <button
            class="btn-primary mcta__btn"
            type="button"
            :disabled="selected === null"
            @click="navigateTo(checkoutIsTrip ? '/multi-hotel-trip/checkout/gegevens' : '/multi-hotel-trip/m/checkout/kamers')"
          >
            {{ selected === null ? 'Selecteer eerst een datum' : 'Opslaan en doorgaan' }}
          </button>
        </div>

        <div class="mtrust">
          <img src="/images/trustpilot.svg" alt="Trustpilot" />
        </div>
      </main>

      <MultiHotelTripCheckoutFooter />
    </div>
  </div>
</template>

<style scoped>
.mpage {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--c-white);
  /* Aparte mobiele site: smal ontwerp, ook op een breed scherm */
  max-width: 520px;
  margin: 0 auto;
  width: 100%;
}
.mpage__main {
  flex: 1;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.mtitle {
  font-size: 34px;
  line-height: 42px;
  font-weight: var(--w-black);
}

/* Kalenderkaart */
.mcal {
  border: 1px solid var(--c-light-grey);
  border-radius: var(--radius);
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.mcal__intro {
  text-align: center;
  font-weight: var(--w-black);
  font-size: 17px;
  line-height: 26px;
  color: var(--c-grey);
  padding: 0 8px;
}
/* Kalender exact als op de dealpagina: de variant-6 overrides uit
   mht-variant-6.css (mobiele waarden), R1-tokens hardcoded —
   groen #00B67A, oranje #ff7e00, tekst #1A1A1A, rand #E5E5E5. */
.mcal__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
}
.mcal__month {
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  flex: 1;
}
.mcal__navbtn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fbfaf8;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.mcal__navbtn:hover {
  background: #f0f0f0;
}
.mcal__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  text-align: center;
  color: #999999;
  font-size: 12px;
  font-weight: 700;
}
.mcal__weekdays span {
  padding: 8px 0;
}
.mcal__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: 60px;
  gap: 4px;
}
/* Beschikbare dag: witte tegel met hairline rand + subtiele schaduw */
.mcal__cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 5px 2px;
  height: 60px;
  overflow: hidden;
  border-radius: 0;
  background: #fff;
  border: 1px solid #e5e5e5;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  color: #1a1a1a;
}
.mcal__cell--empty {
  background: transparent;
  border: none;
  box-shadow: none;
}
/* Niet beschikbaar: vlakke grijze tegel zonder rand/schaduw */
.mcal__cell--unavailable {
  background: #dbdbdb;
  border-color: transparent;
  box-shadow: none;
  opacity: 0.4;
  cursor: not-allowed;
}
/* Geselecteerde in/uit-dag: groene tegel met zwarte rand, witte tekst */
.mcal__cell--in {
  background: var(--color-discount);
  border: 1px solid var(--color-text-primary);
  box-shadow: none;
}
.mcal__cell--in .mcal__day,
.mcal__cell--in .mcal__price {
  color: #fff;
}
.mcal__cell--in .mcal__day {
  font-weight: 700;
}
/* Tussennachten: lichtgroene tegel zonder rand */
.mcal__cell--range {
  background: color-mix(in srgb, var(--color-discount) 45%, #fff);
  border-color: transparent;
  box-shadow: none;
}
.mcal__cell--range .mcal__day {
  color: #fff;
}
.mcal__day {
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
}
.mcal__sold {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  line-height: 1.4;
}
.mcal__sold--selected {
  color: #fff;
  font-weight: 700;
}
/* Prijs: 12px semibold, huisstijl-donkergroen, tabulaire cijfers (als PDP). */
.mcal__price {
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-green-dark, #00675f);
  line-height: 1.4;
}
.mcal__price--cheapest {
  color: var(--color-primary);
}
.mcal__price--selected {
  color: #fff;
}
/* Oranje sterretje linksboven bij de laagste-prijs-dag (als PDP-kalender) */
.mcal__star {
  position: absolute;
  top: 1px;
  left: 1px;
  font-size: 14px;
  line-height: 1;
  color: var(--color-primary);
  pointer-events: none;
}
/* In/uit-pil: doorschijnend wit, alleen linksonder afgerond */
.mcal__badge {
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
.mcal__legend {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 4px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  font-size: 13px;
  color: #555555;
}
.mcal__legenditem {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}
.mcal__legendstar {
  font-size: 14px;
  line-height: 1;
  color: #ff7e00;
}
.mcal__swatch {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background: #dbdbdb;
  opacity: 0.4;
}

/* CTA + Trustpilot */
.mcta {
  display: flex;
  justify-content: center;
  padding-top: 16px;
}
.mcta__btn {
  width: auto;
  min-width: 300px;
  font-size: 20px;
  padding: 18px 32px;
}
.mtrust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding-bottom: 8px;
}
.mtrust img {
  height: 88px;
}
</style>
