<!--
  VlDatePicker — Calendar date picker with optional pricing/availability.

  A single month grid with prev/next navigation. Day cells render a price
  when an availability map is supplied; past days and unavailable days are
  disabled. An "Ik ben flexibel" checkbox sits below the grid — when checked
  the calendar greys out and clicking it (or toggling the box) re-enables it.

  Dependency-light: Dutch month / day names are inline; no prototype i18n
  or dayjs imports.

  Props:
    - modelValue: string | null
        Selected date as 'YYYY-MM-DD', or null.
    - month: { year: number; month: number }
        Visible month. `month` is 0-indexed (0 = January).
    - availability?: Record<string, { available: boolean; price?: number; premium?: boolean }>
        Optional per-date map keyed by 'YYYY-MM-DD'. When present, available
        days show their price and a `premium` day gets a star + outline.
        Days missing from the map (when the map is non-empty) are unavailable.
        When the prop is omitted entirely, every non-past day is selectable
        and no prices show.
    - flexible?: boolean
        "Ik ben flexibel" checkbox state.

  Events:
    - update:modelValue   — new selected date (null when the same day is
                            tapped again to deselect).
    - update:month        — new { year, month } after prev/next.
    - update:flexible     — new checkbox state.

  Fully decoupled: owns no shared state.
-->
<template>
  <div class="vl-cal">
    <div
      class="vl-cal__body"
      :class="{ 'vl-cal__body--disabled': flexible }"
      :aria-disabled="flexible || undefined"
      @click="onBodyClick"
    >
      <!-- Month nav -->
      <div class="vl-cal__header">
        <button type="button" class="vl-cal__nav" aria-label="Vorige maand" @click="prevMonth">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <span class="vl-cal__month">{{ monthLabel }}</span>
        <button type="button" class="vl-cal__nav" aria-label="Volgende maand" @click="nextMonth">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      <!-- Day-of-week headers (Monday first) -->
      <div class="vl-cal__days-header">
        <span v-for="(d, i) in DAY_HEADERS" :key="i">{{ d }}</span>
      </div>

      <!-- Date grid -->
      <div class="vl-cal__grid">
        <div v-for="n in startOffset" :key="'offset-' + n" class="vl-cal__placeholder"></div>

        <button
          v-for="cell in cells"
          :key="cell.date"
          type="button"
          class="vl-cal__cell"
          :class="{
            'vl-cal__cell--selected': modelValue === cell.date,
            'vl-cal__cell--past': cell.past,
            'vl-cal__cell--unavailable': cell.unavailable && !cell.past,
            'vl-cal__cell--premium': cell.premium && cell.available && !cell.past,
          }"
          :disabled="cell.past || cell.unavailable"
          @click="selectDate(cell)"
        >
          <span class="vl-cal__number">{{ cell.day }}</span>

          <span
            v-if="cell.premium && cell.available && !cell.past && modelValue !== cell.date"
            class="vl-cal__star"
            aria-hidden="true"
          >★</span>

          <span
            v-if="cell.unavailable && !cell.past"
            class="vl-cal__sold"
          >-</span>
          <span
            v-else-if="cell.price != null && cell.available && !cell.past"
            class="vl-cal__price"
            :class="{ 'vl-cal__price--premium': cell.premium }"
          >€{{ cell.price }}</span>
        </button>
      </div>
    </div>

    <!-- "Ik ben flexibel" -->
    <label class="vl-cal__flex">
      <input
        type="checkbox"
        class="vl-cal__flex-input"
        :checked="flexible"
        @change="toggleFlexible(($event.target as HTMLInputElement).checked)"
      />
      <span class="vl-cal__flex-box" aria-hidden="true">
        <svg
          v-if="flexible"
          width="12" height="12" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="3"
          stroke-linecap="round" stroke-linejoin="round"
        >
          <polyline points="5 12 10 17 19 7" />
        </svg>
      </span>
      <span class="vl-cal__flex-label">Ik ben flexibel</span>
    </label>
  </div>
</template>

<script setup lang="ts">
interface DayAvailability { available: boolean; price?: number; premium?: boolean }

const props = withDefaults(defineProps<{
  modelValue: string | null
  month: { year: number; month: number }
  availability?: Record<string, DayAvailability>
  flexible?: boolean
}>(), {
  flexible: false,
})

const emit = defineEmits<{
  'update:modelValue': [val: string | null]
  'update:month': [val: { year: number; month: number }]
  'update:flexible': [val: boolean]
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

const hasAvailabilityMap = computed(
  () => props.availability != null && Object.keys(props.availability).length > 0,
)

interface Cell {
  day: number
  date: string
  past: boolean
  available: boolean
  unavailable: boolean
  price: number | null
  premium: boolean
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
    const entry = props.availability?.[date]
    // When a map is supplied, a day is available only if its entry says so.
    // Without a map, every non-past day is selectable.
    const available = hasAvailabilityMap.value ? entry?.available === true : true
    out.push({
      day: d,
      date,
      past,
      available,
      unavailable: hasAvailabilityMap.value && !available,
      price: entry?.price ?? null,
      premium: entry?.premium === true,
    })
  }
  return out
})

function selectDate(cell: Cell) {
  if (cell.past || cell.unavailable) return
  emit('update:modelValue', props.modelValue === cell.date ? null : cell.date)
}

function prevMonth() {
  if (props.month.month === 0) emit('update:month', { year: props.month.year - 1, month: 11 })
  else emit('update:month', { ...props.month, month: props.month.month - 1 })
}
function nextMonth() {
  if (props.month.month === 11) emit('update:month', { year: props.month.year + 1, month: 0 })
  else emit('update:month', { ...props.month, month: props.month.month + 1 })
}

function toggleFlexible(next: boolean) {
  emit('update:flexible', next)
}

// Clicking the greyed-out calendar re-enables it (inner cells are
// pointer-events: none while flexible).
function onBodyClick() {
  if (props.flexible) toggleFlexible(false)
}
</script>

<style scoped>
.vl-cal {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  min-width: 0;
}

.vl-cal__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: opacity 150ms ease, filter 150ms ease;
}

.vl-cal__body--disabled {
  opacity: 0.4;
  filter: grayscale(1);
  cursor: pointer;
  user-select: none;
}
.vl-cal__body--disabled .vl-cal__nav,
.vl-cal__body--disabled .vl-cal__cell {
  pointer-events: none;
}

/* 7-column header so the prev/next arrows sit under Monday / Sunday. */
.vl-cal__header {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  align-items: center;
  min-height: 36px;
}

.vl-cal__nav {
  justify-self: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 0;
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background 150ms ease;
}
.vl-cal__nav:hover { background: var(--color-border); }

.vl-cal__month {
  grid-column: 2 / span 5;
  justify-self: center;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1;
  text-transform: capitalize;
}

.vl-cal__days-header {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  text-align: center;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 500;
  color: #999;
  text-transform: uppercase;
  line-height: 1;
}
.vl-cal__days-header > span {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vl-cal__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  /* Fixed row tracks so a selected/bold cell never grows its row. */
  grid-auto-rows: 52px;
}

.vl-cal__placeholder { height: 52px; }

.vl-cal__cell {
  /* Two reserved rows: number on top, price/sold below. */
  display: grid;
  grid-template-rows: 22px 16px;
  align-items: center;
  justify-items: center;
  height: 52px;
  min-height: 0;
  overflow: hidden;
  padding: 6px 4px;
  font-family: var(--font-body);
  background: none;
  border: 0;
  cursor: pointer;
  line-height: 1;
  border-radius: var(--radius-sm);
  position: relative;
  transition: background 150ms ease, color 150ms ease;
}

.vl-cal__cell:hover:not(:disabled) {
  background: rgba(233, 113, 50, 0.1);
  color: var(--color-primary);
}

.vl-cal__cell--past {
  opacity: 0.3;
  cursor: not-allowed;
}

.vl-cal__cell--unavailable {
  opacity: 0.6;
  cursor: not-allowed;
}

.vl-cal__cell--premium {
  box-shadow: inset 0 0 0 2px var(--color-primary);
}

.vl-cal__cell--selected {
  background: var(--color-primary) !important;
  color: #fff !important;
  font-weight: 600;
}
.vl-cal__cell--selected .vl-cal__number,
.vl-cal__cell--selected .vl-cal__price { color: #fff; }

.vl-cal__number {
  grid-row: 1;
  font-size: 15px;
  font-weight: 500;
  line-height: 1;
  color: #1a1a1a;
}

.vl-cal__price {
  grid-row: 2;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1;
}
.vl-cal__price--premium { color: var(--color-primary); }

.vl-cal__sold {
  grid-row: 2;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-muted);
  line-height: 1;
}

.vl-cal__star {
  position: absolute;
  top: 2px;
  left: 4px;
  font-size: 10px;
  line-height: 1;
  color: var(--color-primary);
  pointer-events: none;
}

/* "Ik ben flexibel" checkbox row. */
.vl-cal__flex {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  align-self: flex-start;
  padding: 4px 0;
}

.vl-cal__flex-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.vl-cal__flex-box {
  width: 18px;
  height: 18px;
  border: 1.5px solid #c7c7c7;
  border-radius: 4px;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
  transition: background 150ms ease, border-color 150ms ease;
}
.vl-cal__flex:hover .vl-cal__flex-box { border-color: var(--color-primary); }
.vl-cal__flex-input:checked + .vl-cal__flex-box {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.vl-cal__flex-label {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 400;
  color: #1a1a1a;
  line-height: 1.2;
}
</style>
