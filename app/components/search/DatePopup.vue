<template>
  <div class="date-popup">
    <!-- Centered tab bar with top-right Wissen link -->
    <div class="date-popup__tabs">
      <div class="date-popup__tabs-inner">
        <button
          class="date-popup__tab"
          :class="{ 'date-popup__tab--active': activeTab === 'calendar' }"
          @click="activeTab = 'calendar'"
        >
          {{ t('header.tab.calendar') }}
        </button>
        <button
          class="date-popup__tab"
          :class="{ 'date-popup__tab--active': activeTab === 'flexible' }"
          @click="activeTab = 'flexible'"
        >
          {{ t('header.tab.flexible') }}
        </button>
      </div>
    </div>

    <!-- CALENDAR TAB: only calendar + flexibility chips -->
    <div v-if="activeTab === 'calendar'" class="date-popup__body">
      <div class="date-popup__cal-section date-popup__cal-section--full">
        <div class="date-popup__label-row">
          <h4 class="date-popup__label">{{ t('header.arrivalDate') }}</h4>
          <a
            v-if="selectedDate"
            href="#"
            class="date-popup__clear-link date-popup__clear-link--inline"
            @click.prevent="$emit('clear')"
          >{{ t('header.clear') }}</a>
        </div>
        <div class="mini-cal">
          <div class="mini-cal__header">
            <button class="mini-cal__nav" @click="handleCalPrev" aria-label="Previous month">&#8249;</button>
            <span class="mini-cal__month">{{ calMonthLabel }}</span>
            <button class="mini-cal__nav" @click="handleCalNext" aria-label="Next month">&#8250;</button>
          </div>
          <div class="mini-cal__days-header">
            <span v-for="(d, i) in dayHeaders" :key="i">{{ d }}</span>
          </div>
          <div class="mini-cal__grid">
            <span
              v-for="(cell, i) in calCells"
              :key="i"
              class="mini-cal__cell"
              :class="{
                'mini-cal__cell--empty': !cell.day,
                'mini-cal__cell--selected': !!selectedDate && cell.date === selectedDate,
                'mini-cal__cell--flex': cell.inFlexRange,
                'mini-cal__cell--past': cell.past,
              }"
              @click="cell.day && !cell.past ? handleSelectDate(cell.date!) : undefined"
            >
              {{ cell.day || '' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Flex chips: only after a date has been picked. Without a date the
           flexibility question is meaningless, so the chips stay hidden. -->
      <template v-if="selectedDate">
        <div class="date-popup__divider"></div>

        <div class="date-popup__flex-col">
          <h4 class="date-popup__label">{{ t('header.flexArrival') }}</h4>
          <div class="date-popup__flex-chips">
            <button
              v-for="f in flexOptions"
              :key="f.value"
              class="flex-chip"
              :class="{ 'flex-chip--selected': flexibility === f.value }"
              @click="$emit('update:flexibility', f.value)"
            >
              {{ f.label }}
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- FLEXIBLE TAB: only month picker -->
    <div v-if="activeTab === 'flexible'" class="date-popup__body">
      <div class="date-popup__flex-block">
        <h4 class="date-popup__label">{{ t('header.flex.whenApprox') }}</h4>
        <div class="date-popup__month-grid">
          <button
            v-for="m in availableMonths"
            :key="m.key"
            class="month-pill"
            :class="{ 'month-pill--selected': selectedMonths.includes(m.key) }"
            @click="toggleMonth(m.key)"
          >
            {{ m.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  calMonth: { year: number; month: number }
  selectedDate: string | null
  flexibility: number
  selectedDurations: string[]
}>()

const emit = defineEmits<{
  'update:calMonth': [val: { year: number; month: number }]
  'update:selectedDate': [val: string | null]
  'update:flexibility': [val: number]
  'update:selectedDurations': [val: string[]]
  'update:flexState': [val: { durations: string[]; months: string[] }]
  'save': []
  'clear': []
}>()

function toggleDuration(id: string) {
  const next = [...props.selectedDurations]
  const idx = next.indexOf(id)
  if (idx === -1) next.push(id)
  else next.splice(idx, 1)
  emit('update:selectedDurations', next)
}

// --- Tab state ---
const activeTab = ref<'calendar' | 'flexible'>('calendar')

// --- Calendar tab logic ---
const monthNames = computed(() => Array.from({ length: 12 }, (_, i) => t(`header.months.${i}`)))
const dayHeaders = computed(() => Array.from({ length: 7 }, (_, i) => t(`header.days.${i}`)))
const calMonthLabel = computed(() => `${monthNames.value[props.calMonth.month]} ${props.calMonth.year}`)

function handleCalPrev() {
  if (props.calMonth.month === 0) {
    emit('update:calMonth', { year: props.calMonth.year - 1, month: 11 })
  } else {
    emit('update:calMonth', { ...props.calMonth, month: props.calMonth.month - 1 })
  }
}

function handleCalNext() {
  if (props.calMonth.month === 11) {
    emit('update:calMonth', { year: props.calMonth.year + 1, month: 0 })
  } else {
    emit('update:calMonth', { ...props.calMonth, month: props.calMonth.month + 1 })
  }
}

const calCells = computed(() => {
  const { year, month } = props.calMonth
  const firstDay = new Date(year, month, 1).getDay()
  const offset = firstDay === 0 ? 6 : firstDay - 1 // Monday start
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Compute flex range around selectedDate (inclusive of selected day itself)
  let rangeStart: Date | null = null
  let rangeEnd: Date | null = null
  if (props.selectedDate && props.flexibility > 0) {
    const [y, m, d] = props.selectedDate.split('-').map(Number)
    const sel = new Date(y, m - 1, d)
    rangeStart = new Date(sel); rangeStart.setDate(sel.getDate() - props.flexibility)
    rangeEnd = new Date(sel); rangeEnd.setDate(sel.getDate() + props.flexibility)
  }

  const cells: { day: number | null; date: string | null; past: boolean; inFlexRange: boolean }[] = []
  for (let i = 0; i < offset; i++) cells.push({ day: null, date: null, past: false, inFlexRange: false })
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const past = date < today
    const inFlexRange = !!(rangeStart && rangeEnd && date >= rangeStart && date <= rangeEnd && dateStr !== props.selectedDate && !past)
    cells.push({ day: d, date: dateStr, past, inFlexRange })
  }
  return cells
})

function handleSelectDate(date: string) {
  emit('update:selectedDate', props.selectedDate === date ? null : date)
}

const flexOptions = computed(() => [
  { label: t('header.flex.exact'), value: 0 },
  { label: t('header.flex.1day'), value: 1 },
  { label: t('header.flex.2days'), value: 2 },
  { label: t('header.flex.3days'), value: 3 },
  { label: t('header.flex.7days'), value: 7 },
])

const durationOptions = computed(() => [
  { id: '1', label: t('header.duration.1night') },
  { id: '2', label: t('header.duration.2nights') },
  { id: '3', label: t('header.duration.3nights') },
  { id: '4', label: t('header.duration.4nights') },
  { id: '5+', label: t('header.duration.5nights') },
])

// --- Flexible tab logic ---
const flexType = ref<string | null>(null)
const flexNights = ref<string[]>([])
const selectedMonths = ref<string[]>([])

const flexTypeOptions = computed(() => [
  { label: t('header.flex.weekendFriSun'), value: 'weekend-fri-sun', sub: t('header.flex.weekendFriSunSub') },
  { label: t('header.flex.weekendSatSun'), value: 'weekend-sat-sun', sub: t('header.flex.weekendSatSunSub') },
  { label: t('header.flex.longWeekend'), value: 'long-weekend', sub: t('header.flex.longWeekendSub') },
  { label: t('header.flex.midweek'), value: 'midweek', sub: t('header.flex.midweekSub') },
])

const flexNightsOptions = computed(() => [
  { label: t('header.duration.1night'), value: '1' },
  { label: t('header.duration.2nights'), value: '2' },
  { label: t('header.duration.3nights'), value: '3' },
  { label: t('header.duration.4nights'), value: '4' },
  { label: t('header.duration.5nights'), value: '5+' },
])

function selectFlexType(val: string) {
  flexType.value = flexType.value === val ? null : val
  if (flexType.value) flexNights.value = []
  emitFlexState()
}

function toggleFlexNights(val: string) {
  const idx = flexNights.value.indexOf(val)
  if (idx !== -1) flexNights.value.splice(idx, 1)
  else flexNights.value.push(val)
  if (flexNights.value.length > 0) flexType.value = null
  emitFlexState()
}

const availableMonths = computed(() => {
  const now = new Date()
  const months: { key: string; label: string }[] = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = `${monthNames.value[d.getMonth()]} ${d.getFullYear()}`
    months.push({ key, label })
  }
  return months
})

function toggleMonth(key: string) {
  const idx = selectedMonths.value.indexOf(key)
  if (idx !== -1) {
    selectedMonths.value.splice(idx, 1)
  } else if (selectedMonths.value.length < 3) {
    selectedMonths.value.push(key)
  }
  emitFlexState()
}

const flexDurationLabel = computed(() => {
  if (flexType.value) {
    const opt = flexTypeOptions.value.find(o => o.value === flexType.value)
    return opt ? opt.label : ''
  }
  if (flexNights.value.length > 0) {
    const labels = flexNights.value.map(v => {
      const opt = flexNightsOptions.value.find(o => o.value === v)
      return opt ? opt.label : ''
    }).filter(Boolean)
    return labels.join(' of ')
  }
  return ''
})

const flexSummary = computed(() => {
  const parts: string[] = []
  if (flexDurationLabel.value) parts.push(flexDurationLabel.value)

  if (selectedMonths.value.length > 0) {
    const monthLabels = selectedMonths.value.map((key) => {
      const monthIndex = parseInt(key.split('-')[1], 10) - 1
      return monthNames.value[monthIndex].toLowerCase()
    })
    parts.push(`in ${monthLabels.join(', ')}`)
  }

  return parts.join(' ')
})

function emitFlexState() {
  const durations = flexType.value ? [flexType.value] : [...flexNights.value]
  emit('update:flexState', {
    durations,
    months: [...selectedMonths.value],
  })
}
</script>

<style scoped>
.date-popup {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* ==================== */
/* CENTERED TAB BAR     */
/* ==================== */
.date-popup__tabs {
  position: relative;
  display: flex;
  justify-content: center;
  padding: var(--space-md) var(--space-lg) 0;
}

.date-popup__clear-link {
  position: absolute;
  top: var(--space-md);
  right: var(--space-lg);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: underline;
  cursor: pointer;
}
.date-popup__clear-link:hover { color: var(--color-primary); }

.date-popup__tabs-inner {
  display: flex;
  gap: 0;
  background: var(--color-background-secondary);
  border-radius: 999px;
  padding: 3px;
  width: 100%;
  max-width: 460px;
}

.date-popup__tab {
  flex: 1;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  /* Both tabs are equally readable — only the active one is highlighted. */
  color: var(--color-text-primary);
  background: none;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: color 150ms ease, background 150ms ease;
  white-space: nowrap;
}

.date-popup__tab:hover {
  color: var(--color-primary);
}

.date-popup__tab--active {
  color: var(--color-text-primary);
  background: var(--color-surface);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* ==================== */
/* BODY (PADDED)        */
/* ==================== */
.date-popup__body {
  padding: var(--space-lg) var(--space-xl) var(--space-xl);
}

/* ==================== */
/* SECTION LABEL        */
/* ==================== */
.date-popup__label {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 700;
  text-transform: none;
  letter-spacing: 0;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-md) 0;
}

/* Header row above the calendar — title on the left, optional "Wis" link
   on the right when a date is selected. */
.date-popup__label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  margin: 0 0 var(--space-md) 0;
}

.date-popup__label-row .date-popup__label {
  margin: 0;
}

.date-popup__clear-link--inline {
  position: static;
  font-size: 14px;
}

/* ==================== */
/* CALENDAR TAB LAYOUT  */
/* ==================== */
.date-popup__row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-2xl);
  align-items: start;
}

.date-popup__cal-section {
  display: flex;
  flex-direction: column;
}

/* ==================== */
/* MINI CALENDAR        */
/* ==================== */
.mini-cal {
  /* no extra margin — label above provides spacing */
}

.mini-cal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.mini-cal__month {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.mini-cal__nav {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: none;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 150ms ease, color 150ms ease;
  color: var(--color-text-primary);
  line-height: 1;
}

.mini-cal__nav:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.mini-cal__days-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: var(--space-xs);
}

.mini-cal__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
}

.mini-cal__cell {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease;
  color: var(--color-text-primary);
}

.mini-cal__cell:hover:not(.mini-cal__cell--empty):not(.mini-cal__cell--past) {
  background: rgba(251, 134, 45, 0.1);
  color: var(--color-primary);
}

.mini-cal__cell--empty {
  cursor: default;
}

.mini-cal__cell--past {
  color: var(--color-text-muted);
  opacity: 0.35;
  cursor: default;
}

.mini-cal__cell--selected {
  background: var(--color-primary) !important;
  color: #ffffff !important;
  font-weight: 600;
}

.mini-cal__cell--flex {
  background: rgba(251, 134, 45, 0.18);
  color: var(--color-primary);
  font-weight: 500;
}

.mini-cal__cell--flex:hover {
  background: rgba(251, 134, 45, 0.3) !important;
}

/* ==================== */
/* DIVIDER              */
/* ==================== */
.date-popup__divider {
  height: 1px;
  background: var(--color-border-light);
  margin: var(--space-lg) 0;
}

/* ==================== */
/* FLEXIBILITY ROW      */
/* ==================== */
.date-popup__flex-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-2xl);
  align-items: start;
}

.date-popup__flex-col {
  display: flex;
  flex-direction: column;
}

.date-popup__flex-chips {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
}

/* Actions column (Klaar + Wis stacked) — shared between calendar + flex tab */
.date-popup__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.date-popup__done {
  padding: 8px 20px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background var(--transition-fast);
  font-family: inherit;
  white-space: nowrap;
}

.date-popup__done:hover {
  background: var(--color-primary-hover);
}

.date-popup__clear-link {
  font-size: 12px;
  color: var(--color-text-muted);
  text-decoration: underline;
  cursor: pointer;
  font-family: inherit;
}

.date-popup__clear-link:hover {
  color: var(--color-text-primary);
}

/* Flexible tab: right-aligned actions row at bottom */
.date-popup__flex-actions-row {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-lg);
}

.flex-chip {
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: none;
  font-size: 13px;
  cursor: pointer;
  transition: all 150ms ease;
  color: var(--color-text-primary);
  white-space: nowrap;
  font-weight: 500;
}

.flex-chip:hover {
  border-color: var(--color-primary);
}

.flex-chip--selected {
  border-color: var(--color-primary);
  background: rgba(251, 134, 45, 0.1);
  font-weight: 600;
  color: var(--color-primary);
}

/* ==================== */
/* DURATION OPTIONS     */
/* ==================== */
.date-popup__dur-section {
  display: flex;
  flex-direction: column;
  min-width: 170px;
}

.date-popup__dur-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dur-option {
  display: flex;
  align-items: center;
  padding: 11px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: none;
  cursor: pointer;
  transition: all 150ms ease;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  text-align: left;
  white-space: nowrap;
}

.dur-option:hover {
  border-color: var(--color-primary);
}

.dur-option--selected {
  border-color: var(--color-primary);
  background: rgba(251, 134, 45, 0.08);
  font-weight: 600;
  color: var(--color-primary);
}

/* ==================== */
/* FLEXIBLE TAB         */
/* ==================== */
.date-popup__flex-block {
  display: flex;
  flex-direction: column;
  margin-bottom: var(--space-lg);
}

.date-popup__flex-block:last-of-type {
  margin-bottom: 0;
}

/* Duration pills (large) */
.date-popup__dur-pills {
  display: flex;
  gap: var(--space-sm);
}

.dur-pill {
  padding: 10px 22px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
  color: var(--color-text-primary);
  white-space: nowrap;
}

.dur-pill:hover {
  border-color: var(--color-primary);
}

.dur-pill--selected {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: #ffffff;
  font-weight: 600;
}

.dur-pill--two-line {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 8px 18px;
  line-height: 1.2;
}

.dur-pill__main {
  font-size: 13px;
  font-weight: 600;
}

.dur-pill__sub {
  font-size: 11px;
  opacity: 0.7;
}

.dur-pill--selected .dur-pill__sub {
  opacity: 0.9;
}

/* Month grid */
.date-popup__month-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
}

.month-pill {
  padding: 10px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
  color: var(--color-text-primary);
  text-align: center;
  white-space: nowrap;
}

.month-pill:hover {
  border-color: var(--color-primary);
}

.month-pill--selected {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: #ffffff;
  font-weight: 600;
}

/* Summary */
.date-popup__flex-summary {
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border-light);
  margin-top: var(--space-lg);
  font-size: 14px;
  font-style: italic;
  color: var(--color-text-muted);
}

/* ==================== */
/* MOBILE (<768px)      */
/* ==================== */
@media (max-width: 768px) {
  .date-popup {
    width: 100%;
  }
  .date-popup__body {
    padding: var(--space-md);
  }
  /* Stack calendar + duration vertically */
  .date-popup__row {
    grid-template-columns: 1fr;
    gap: var(--space-xl);
  }
  /* Flex row: stack label+chips on top, actions below */
  .date-popup__flex-row {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
  /* Flex chips should wrap on mobile — tight space */
  .date-popup__flex-chips {
    flex-wrap: wrap;
  }
  /* Actions: align to the right */
  .date-popup__actions {
    align-items: flex-end;
  }
  /* Mini-calendar: smaller cells */
  .mini-cal__cell {
    width: 34px;
    height: 34px;
    font-size: 13px;
  }
  /* Month grid in flexible tab: 3 cols instead of 4 */
  .date-popup__month-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  /* Duration pills: wrap to multiple rows */
  .date-popup__dur-pills {
    flex-wrap: wrap;
  }
}
</style>
