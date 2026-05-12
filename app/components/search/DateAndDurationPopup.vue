<template>
  <div class="when-pop">
    <!-- Two-column title row so "Kies aankomstdatum" and "Kies aantal
         nachten" align horizontally with their respective columns below. -->
    <div class="when-pop__head">
      <h4 class="when-pop__title">Kies aankomstdatum</h4>
      <h4 class="when-pop__title">{{ t('header.tab.nights') }}</h4>
    </div>

    <div class="when-pop__body">
      <!-- Calendar -->
      <div class="when-pop__cal">
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
                'mini-cal__cell--past': cell.past,
              }"
              @click="cell.day && !cell.past ? handleSelectDate(cell.date!) : undefined"
            >
              {{ cell.day || '' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Nights selector — title is rendered in the shared head row above
           so it aligns with "Kies aankomstdatum". -->
      <div class="when-pop__nights">
        <p class="when-pop__hint">{{ t('header.tab.nightsHint') }}</p>
        <div class="when-pop__nights-list">
          <label
            v-for="opt in nightOptions"
            :key="opt.value"
            class="dur-check"
            :class="{ 'dur-check--selected': nights.includes(opt.value) }"
          >
            <input
              type="checkbox"
              class="dur-check__input"
              :checked="nights.includes(opt.value)"
              @change="$emit('toggle-night', opt.value)"
            />
            <span class="dur-check__box" aria-hidden="true">
              <svg
                v-if="nights.includes(opt.value)"
                width="12" height="12" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="3"
                stroke-linecap="round" stroke-linejoin="round"
              >
                <polyline points="5 12 10 17 19 7" />
              </svg>
            </span>
            <span class="dur-check__label">{{ opt.label }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Footer: Wis-link left, orange "Verder" button right. Verder simply
         closes the popup — same behaviour as clicking outside the popup. -->
    <div class="when-pop__footer">
      <a
        href="#"
        class="when-pop__clear"
        :class="{ 'when-pop__clear--disabled': !hasSelection }"
        @click.prevent="hasSelection && $emit('clear')"
      >{{ t('header.clear') }}</a>
      <button
        type="button"
        class="when-pop__done"
        @click="$emit('save')"
      >Verder</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  calMonth: { year: number; month: number }
  selectedDate: string | null
  nights: readonly string[]
}>()

const emit = defineEmits<{
  'update:calMonth': [val: { year: number; month: number }]
  'update:selectedDate': [val: string | null]
  'toggle-night': [value: string]
  clear: []
  save: []
}>()

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
  const cells: { day: number | null; date: string | null; past: boolean }[] = []
  for (let i = 0; i < offset; i++) cells.push({ day: null, date: null, past: false })
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, date: dateStr, past: date < today })
  }
  return cells
})

function handleSelectDate(date: string) {
  emit('update:selectedDate', props.selectedDate === date ? null : date)
}

const nightOptions = [
  { label: '1 nacht', value: '1' },
  { label: '2 nachten', value: '2' },
  { label: '3 nachten', value: '3' },
  { label: '4 nachten', value: '4' },
  { label: '5+ nachten', value: '5+' },
]

const hasSelection = computed(() => !!props.selectedDate || props.nights.length > 0)
</script>

<style scoped>
.when-pop {
  display: flex;
  flex-direction: column;
  /* Parent .popup--when caps the popup at 528 px and adds its own border.
     We just fill that width and add comfortable inner padding so the
     "Verder" button never overflows the popup edge. */
  padding: var(--space-md) var(--space-lg) var(--space-lg);
  width: 100%;
  box-sizing: border-box;
}

.when-pop__head {
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 64px;
  align-items: end;
  margin-bottom: var(--space-md);
  padding-right: var(--space-md);
}

.when-pop__title {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.when-pop__hint {
  margin: 4px 0 var(--space-sm);
  font-size: 13px;
  color: var(--color-text-secondary);
}

.when-pop__clear {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: underline;
  cursor: pointer;
}

.when-pop__clear:hover {
  color: var(--color-primary);
}

.when-pop__clear--disabled {
  opacity: 0.4;
  cursor: default;
  pointer-events: none;
}

/* Footer: separator + actions row aligned right + Wis link aligned left. */
.when-pop__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  margin-top: var(--space-lg);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border-light);
}

.when-pop__done {
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  padding: 10px 22px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: filter 150ms ease;
}

.when-pop__done:hover { filter: brightness(0.95); }

.when-pop__body {
  display: grid;
  grid-template-columns: 1fr 240px;
  /* Extra gap pushes the nights column further to the right while still
     respecting a right margin via the wrap's right padding. */
  gap: 64px;
  align-items: start;
  padding-right: var(--space-md);
}

.when-pop__nights {
  display: flex;
  flex-direction: column;
}

.when-pop__nights-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ----- mini calendar (mirrors DatePopup) ----- */
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
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease;
  color: var(--color-text-primary);
}

.mini-cal__days-header {
  font-size: 12px;
}

.mini-cal__month {
  font-size: 16px;
}

.mini-cal__nav {
  width: 36px;
  height: 36px;
}

.mini-cal__cell:hover:not(.mini-cal__cell--empty):not(.mini-cal__cell--past) {
  background: rgba(251, 134, 45, 0.1);
  color: var(--color-primary);
}

.mini-cal__cell--empty { cursor: default; }
.mini-cal__cell--past {
  color: var(--color-text-muted);
  opacity: 0.35;
  cursor: default;
}

.mini-cal__cell--selected {
  background: var(--color-primary) !important;
  color: #fff !important;
  font-weight: 600;
}

/* ----- night-count checkboxes ----- */
.dur-check {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 4px;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  color: var(--color-text-primary);
  transition: color 150ms ease;
}

.dur-check__input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.dur-check__box {
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--color-border);
  border-radius: 4px;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
  transition: background 150ms ease, border-color 150ms ease;
}

.dur-check:hover .dur-check__box { border-color: var(--color-primary); }

.dur-check--selected .dur-check__box {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.dur-check--selected .dur-check__label { color: var(--color-primary); }
</style>
