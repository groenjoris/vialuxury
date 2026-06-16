<!--
  DatePicker — Sidebar calendar (the booking-sidebar variant).

  Faithfully reproduces the hotel-page sidebar calendar (CalendarMonth +
  CalendarDayCell): white day tiles with the day number on top and the
  price below, GREY unavailable / sold-out / past cells, a GREEN check-in /
  range selection, an orange "laagste prijs" star in the top-right corner
  of the cheapest available day, and a legend underneath. A single month
  grid with prev/next navigation.

  This is deliberately the SIDEBAR variant — the search-bar popup calendar
  (white tiles, orange selection, "Ik ben flexibel") lives inside
  SearchBar's "Wanneer" popup instead.

  Dependency-light: Dutch month / day names are inline; no prototype i18n
  or dayjs imports.

  Props:
    - availability: { date: string; available: boolean; soldOut?: boolean; totalPrice: number }[]
        Per-date availability for the visible month (and any month). A date
        missing from the list renders as an empty/unavailable tile.
    - selectedDate: string | null
        Selected check-in date 'YYYY-MM-DD', or null.
    - selectedCheckOut?: string | null
        Optional check-out date 'YYYY-MM-DD'. When set together with
        selectedDate, the days in between render as a light-green range.
    - month: { year: number; month: number }
        Visible month. `month` is 0-indexed (0 = January).
    - showLegend?: boolean
        Render the "laagste prijs" / "niet beschikbaar" legend. Default true.

  Events:
    - select(date: string)   — an available day was clicked.
    - update:month           — new { year, month } after prev/next.

  Fully decoupled: owns no shared state.
-->
<template>
  <div class="cal">
    <!-- Month nav -->
    <div class="cal__header">
      <button type="button" class="cal__nav" aria-label="Vorige maand" @click="prevMonth">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <h4 class="cal__title">{{ monthLabel }}</h4>
      <button type="button" class="cal__nav" aria-label="Volgende maand" @click="nextMonth">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </div>

    <!-- Day-of-week headers (Monday first) -->
    <div class="cal__days-header">
      <span v-for="(d, i) in DAY_HEADERS" :key="i" class="cal__day-header">{{ d }}</span>
    </div>

    <!-- Date grid -->
    <div class="cal__grid">
      <div v-for="n in startOffset" :key="'offset-' + n" class="cal__placeholder"></div>

      <button
        v-for="cell in cells"
        :key="cell.date"
        type="button"
        class="day-cell"
        :class="{
          'day-cell--sold-out': cell.soldOut && !cell.past,
          'day-cell--selected': cell.isCheckIn,
          'day-cell--checkout': cell.isCheckOut,
          'day-cell--in-range': cell.inRange,
          'day-cell--past': cell.past,
        }"
        :disabled="!cell.available || cell.past"
        @click="onSelect(cell)"
      >
        <span class="day-cell__number">{{ cell.day }}</span>

        <!-- In / Uit badge for selected check-in / check-out days -->
        <span v-if="cell.isCheckIn" class="day-cell__badge" aria-label="Check-in">In</span>
        <span v-else-if="cell.isCheckOut" class="day-cell__badge" aria-label="Check-out">Uit</span>

        <!-- Orange "laagste prijs" star, top-right of the cheapest day. -->
        <span
          v-if="cell.isCheapest && cell.available && !cell.selected && !cell.inRange && !cell.past"
          class="day-cell__star"
          aria-label="Laagste prijs"
        >★</span>

        <!-- Sold out: dash -->
        <span
          v-if="cell.soldOut && !cell.past"
          class="day-cell__sold"
          :class="{ 'day-cell__sold--in-range': cell.inRange }"
        >-</span>

        <!-- Check-in date: price on green -->
        <span
          v-else-if="cell.isCheckIn && cell.available && !cell.past && cell.price > 0"
          class="day-cell__price day-cell__price--selected"
        >€{{ cell.price }}</span>

        <!-- Normal available date (not selected, not check-out): price -->
        <span
          v-else-if="!cell.selected && !cell.inRange && cell.available && !cell.past && cell.price > 0"
          class="day-cell__price"
          :class="{ 'day-cell__price--cheapest': cell.isCheapest }"
        >€{{ cell.price }}</span>
      </button>
    </div>

    <!-- Legend -->
    <div v-if="showLegend" class="cal__legend">
      <span v-if="cheapestPrice != null" class="legend-cheapest">
        <span class="legend-star" aria-hidden="true">★</span>
        <span class="legend-label">Laagste prijs</span>
      </span>
      <span class="legend-unavailable">
        <span class="legend-swatch legend-swatch--unavailable" aria-hidden="true"></span>
        <span class="legend-label">Niet beschikbaar</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DateAvailability {
  date: string
  available: boolean
  soldOut?: boolean
  totalPrice: number
}

const props = withDefaults(defineProps<{
  availability: DateAvailability[]
  selectedDate: string | null
  selectedCheckOut?: string | null
  month: { year: number; month: number }
  showLegend?: boolean
}>(), {
  selectedCheckOut: null,
  showLegend: true,
})

const emit = defineEmits<{
  select: [date: string]
  'update:month': [val: { year: number; month: number }]
}>()

const MONTH_NAMES = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
]
const DAY_HEADERS = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']

const monthLabel = computed(() => `${MONTH_NAMES[props.month.month]} ${props.month.year}`)

// Monday-based offset for the first day of the month.
const startOffset = computed(() => {
  const firstDay = new Date(props.month.year, props.month.month, 1).getDay()
  return firstDay === 0 ? 6 : firstDay - 1
})

const availMap = computed(() => {
  const m = new Map<string, DateAvailability>()
  for (const a of props.availability) m.set(a.date, a)
  return m
})

// Cheapest available price across the supplied availability — drives the
// orange star + green price colour, exactly like the prototype.
const cheapestPrice = computed<number | null>(() => {
  let min: number | null = null
  for (const a of props.availability) {
    if (a.available && a.soldOut !== true && a.totalPrice > 0) {
      if (min == null || a.totalPrice < min) min = a.totalPrice
    }
  }
  return min
})

interface Cell {
  day: number
  date: string
  past: boolean
  available: boolean
  soldOut: boolean
  price: number
  isCheckIn: boolean
  isCheckOut: boolean
  selected: boolean
  inRange: boolean
  isCheapest: boolean
}

const cells = computed<Cell[]>(() => {
  const { year, month } = props.month
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const out: Cell[] = []
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const past = new Date(year, month, d) < today
    const entry = availMap.value.get(date)
    const available = entry?.available === true
    const soldOut = entry?.soldOut === true
    const price = entry?.totalPrice ?? 0

    const isCheckIn = date === props.selectedDate
    const isCheckOut = !!props.selectedCheckOut && date === props.selectedCheckOut
    const inRange = !!props.selectedDate && !!props.selectedCheckOut
      && date > props.selectedDate && date < props.selectedCheckOut

    out.push({
      day: d,
      date,
      past,
      available,
      soldOut,
      price,
      isCheckIn,
      isCheckOut,
      selected: isCheckIn || isCheckOut,
      inRange,
      isCheapest: cheapestPrice.value != null && available && !soldOut && price === cheapestPrice.value,
    })
  }
  return out
})

function onSelect(cell: Cell) {
  if (!cell.available || cell.past) return
  emit('select', cell.date)
}

function prevMonth() {
  if (props.month.month === 0) emit('update:month', { year: props.month.year - 1, month: 11 })
  else emit('update:month', { ...props.month, month: props.month.month - 1 })
}
function nextMonth() {
  if (props.month.month === 11) emit('update:month', { year: props.month.year + 1, month: 0 })
  else emit('update:month', { ...props.month, month: props.month.month + 1 })
}
</script>

<style scoped>
.cal {
  min-width: 300px;
  font-family: var(--font-body);
}

@media (max-width: 800px) {
  .cal { min-width: 0; }
}

.cal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  min-height: 40px;
}

.cal__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  flex: 1;
  text-transform: capitalize;
  color: #1a1a1a;
}

/* Month-switch arrows: 36px circle, light-grey fill, greyer on hover. */
.cal__nav {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: background var(--transition-fast);
}
.cal__nav:hover { background: var(--color-border); }

.cal__days-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 8px;
}

.cal__day-header {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  padding: 8px 0;
}

.cal__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  /* Fixed row tracks so a selected cell can't grow its row ("wobble"). */
  grid-auto-rows: 52px;
}

.cal__placeholder { height: 52px; }

/* ── Day cell — mirrors CalendarDayCell ── */
.day-cell {
  /* Two reserved rows: number on top, price below. */
  display: grid;
  grid-template-rows: 22px 16px;
  align-items: center;
  justify-items: center;
  padding: 6px 4px;
  height: 52px;
  min-height: 0;
  overflow: hidden;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  background: none;
  border: 0;
  cursor: pointer;
  position: relative;
}

/* Hover: light-green wash (sidebar variant). */
.day-cell:hover:not(:disabled) {
  background: #d4f5e6;
}

/* Selected check-in / check-out: green; inner text white. */
.day-cell--selected {
  background: var(--color-discount);
  color: #fff;
}
.day-cell--selected .day-cell__number,
.day-cell--selected .day-cell__price,
.day-cell--selected .day-cell__sold {
  color: #fff;
}

/* In-range + check-out: light green; inner text white. */
.day-cell--in-range,
.day-cell--checkout {
  background: color-mix(in srgb, var(--color-discount) 45%, #fff);
  color: #fff;
}
.day-cell--in-range .day-cell__number,
.day-cell--in-range .day-cell__price,
.day-cell--in-range .day-cell__sold,
.day-cell--checkout .day-cell__number,
.day-cell--checkout .day-cell__price,
.day-cell--checkout .day-cell__sold {
  color: #fff;
}

/* Sold-out / unavailable: greyed. */
.day-cell--sold-out {
  opacity: 0.6;
  cursor: not-allowed;
}
.day-cell--sold-out.day-cell--in-range { opacity: 1; }

.day-cell--past:not(.day-cell--sold-out) {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Disabled (no availability) tiles read grey + non-interactive. */
.day-cell:disabled {
  cursor: not-allowed;
  color: #b5b5b5;
}

.day-cell__number {
  grid-row: 1;
  font-size: 15px;
  font-weight: 500;
  line-height: 1;
  color: #1a1a1a;
}

/* "In" / "Uit" badge, top-right, white-on-black square. */
.day-cell__badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 14px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-text-primary);
  color: #fff;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;
  pointer-events: none;
}

.day-cell__sold {
  grid-row: 2;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-muted);
  line-height: 1;
}
.day-cell__sold--in-range { color: #fff; }

.day-cell__price {
  grid-row: 2;
  font-size: 12px;
  color: var(--color-text-primary);
  font-weight: 600;
  line-height: 1;
}
.day-cell__price--cheapest { color: var(--color-discount); }
.day-cell__price--selected { color: rgba(255, 255, 255, 0.9); }

/* Orange "laagste prijs" star, top-right corner of the cheapest day. */
.day-cell__star {
  position: absolute;
  top: 2px;
  right: 4px;
  font-size: 10px;
  line-height: 1;
  color: var(--color-primary);
  pointer-events: none;
}

/* ── Legend ── */
.cal__legend {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border-light);
  font-size: 13px;
  color: var(--color-text-secondary);
}

.legend-cheapest,
.legend-unavailable {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.legend-star {
  font-size: 14px;
  line-height: 1;
  color: var(--color-primary);
}

.legend-swatch {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: var(--radius-sm);
}
.legend-swatch--unavailable {
  background: #dbdbdb;
  opacity: 0.7;
}

.legend-label { line-height: 1; }
</style>
