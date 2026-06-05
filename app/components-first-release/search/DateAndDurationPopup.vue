<template>
  <div class="when-pop" :class="{ 'when-pop--single': mode !== 'both' }">
    <!-- ────────── Content row: calendar (left) + nights (right) ────────── -->
    <div class="when-pop__content">
      <!-- LEFT — calendar -->
      <section v-if="mode !== 'duration'" class="when-pop__cal-section">
        <header class="when-pop__cal-header">
          <h4 class="when-pop__title">{{ t('header.tab.arrivalDate') }}</h4>
        </header>

        <!-- Calendar body — grey-out + lock interactions when "Ik ben flexibel"
             is checked. The wrapper handles both visual fade and pointer
             blocking; the data still lives in the parent so flipping the
             checkbox back restores the previous selection. -->
        <div
          class="when-pop__cal-body"
          :class="{ 'when-pop__cal-body--disabled': flexible }"
          :aria-disabled="flexible || undefined"
          @click="onCalBodyClick"
        >
        <!-- Month nav -->
        <div class="mini-cal__header">
          <button
            type="button"
            class="mini-cal__nav"
            @click="handleCalPrev"
            aria-label="Previous month"
          >‹</button>
          <span class="mini-cal__month">{{ calMonthLabel }}</span>
          <button
            type="button"
            class="mini-cal__nav"
            @click="handleCalNext"
            aria-label="Next month"
          >›</button>
        </div>

        <!-- Day-of-week headers -->
        <div class="mini-cal__days-header">
          <span v-for="(d, i) in dayHeaders" :key="i">{{ d }}</span>
        </div>

        <!-- Date grid -->
        <div class="mini-cal__grid">
          <button
            v-for="(cell, i) in calCells"
            :key="i"
            type="button"
            class="mini-cal__cell"
            :class="{
              'mini-cal__cell--empty': !cell.day,
              'mini-cal__cell--selected': !!selectedDate && cell.date === selectedDate,
              'mini-cal__cell--past': cell.past,
            }"
            :disabled="!cell.day || cell.past"
            @click="cell.day && !cell.past ? handleSelectDate(cell.date!) : undefined"
          >
            <span v-if="cell.day">{{ cell.day }}</span>
          </button>
        </div>
        </div>

        <!-- "Ik ben flexibel" checkbox now sits BELOW the calendar so the
             header reads with just the section title; users find it next to
             where their eyes land after scanning dates. -->
        <label class="when-pop__flex when-pop__flex--below">
          <input
            type="checkbox"
            class="when-pop__flex-input"
            :checked="flexible"
            @change="toggleFlexible(($event.target as HTMLInputElement).checked)"
          />
          <span class="when-pop__flex-box" aria-hidden="true">
            <svg
              v-if="flexible"
              width="12" height="12" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="3"
              stroke-linecap="round" stroke-linejoin="round"
            >
              <polyline points="5 12 10 17 19 7" />
            </svg>
          </span>
          <span class="when-pop__flex-label">{{ t('header.flexible') }}</span>
        </label>
      </section>

      <!-- Vertical divider — only when both columns are visible -->
      <div v-if="mode === 'both'" class="when-pop__divider" aria-hidden="true"></div>

      <!-- RIGHT — nights -->
      <section v-if="mode !== 'date'" class="when-pop__nights-section">
        <h4 class="when-pop__title">Kies reisduur</h4>
        <p class="when-pop__hint">{{ t('header.tab.nightsHint') }}</p>

        <div class="when-pop__nights-list">
          <!-- "Maakt niet uit" — single click clears every specific night.
               Visually checked when the user has explicitly opted for
               "any duration" via the parent's `anyDuration` flag. -->
          <label
            class="dur-check"
            :class="{ 'dur-check--selected': anyDuration }"
          >
            <input
              type="checkbox"
              class="dur-check__input"
              :checked="anyDuration"
              @change="onAnyDurationChange(($event.target as HTMLInputElement).checked)"
            />
            <span class="dur-check__box" aria-hidden="true">
              <svg
                v-if="anyDuration"
                width="12" height="12" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="3"
                stroke-linecap="round" stroke-linejoin="round"
              >
                <polyline points="5 12 10 17 19 7" />
              </svg>
            </span>
            <span class="dur-check__label">Maakt niet uit</span>
          </label>
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
      </section>
    </div>

    <!-- Footer: single "Klaar" CTA, right-aligned. Confirms the
         selection and closes the popup. Hidden when `hideFooter` is
         passed (date-only inside the mobile modal — picking a date is
         self-confirming so no extra button is needed). -->
    <footer v-if="!hideFooter" class="when-pop__footer">
      <button
        type="button"
        class="when-pop__done"
        @click="$emit('save')"
      >{{ t('header.ready') }}</button>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { t } = useFirstReleaseI18n()

const props = withDefaults(defineProps<{
  calMonth: { year: number; month: number }
  selectedDate: string | null
  nights: readonly string[]
  /** Optional: when omitted, the popup keeps a local `flexible` flag so the
   *  checkbox stays interactive without parent wiring. */
  flexible?: boolean
  /** When true, "Maakt niet uit" is checked; the specific-night list
   *  reflects an empty selection. Toggled by the parent in response to
   *  the `set-any-duration` event. */
  anyDuration?: boolean
  /** Which sections to render. 'both' = calendar + nights (default,
   *  used by the SiteHeader combined popup). 'date' = calendar only.
   *  'duration' = nights list only. Used by the hotel-page mid-page
   *  searchbar where the two are split into separate triggers. */
  mode?: 'both' | 'date' | 'duration'
  /** Hide the "Klaar" footer — useful when the parent handles its
   *  own confirm flow (e.g. the mobile modal's Wanneer field, where
   *  picking a date is self-confirming). */
  hideFooter?: boolean
}>(), {
  mode: 'both',
})

const emit = defineEmits<{
  'update:calMonth': [val: { year: number; month: number }]
  'update:selectedDate': [val: string | null]
  'update:flexible': [val: boolean]
  'toggle-night': [value: string]
  'set-any-duration': [val: boolean]
  clear: []
  save: []
}>()

function onAnyDurationChange(next: boolean) {
  emit('set-any-duration', next)
}

/** When the calendar is greyed out (flexible = true) the inner buttons
 *  have `pointer-events: none`, but the wrapper itself still receives
 *  the click — interpret it as "I'd like a specific date after all"
 *  and flip flexible off. The user can then click a date normally on
 *  their next click. */
function onCalBodyClick() {
  if (flexible.value) toggleFlexible(false)
}

// "I'm flexible" — bridges optional v-model with a local fallback.
const localFlex = ref(false)
const flexible = computed(() => props.flexible ?? localFlex.value)
function toggleFlexible(next: boolean) {
  localFlex.value = next
  emit('update:flexible', next)
}

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
  { label: '5 nachten of meer', value: '5+' },
]

const hasSelection = computed(() => !!props.selectedDate || props.nights.length > 0 || flexible.value)
</script>

<style scoped>
/* ────────── Outer container ────────── */
.when-pop {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  /* The parent `.popup` already supplies bg + radius + drop-shadow; we
     just need the column layout + the inner divider. */
}

/* Content row split: 356 calendar (= 24 + 7·44 + 24) | 1 divider | 224 nights.
   Calendar width is locked so each date cell renders as a 44×44 square. */
.when-pop__content {
  display: grid;
  grid-template-columns: 356px 1px 224px;
  align-items: stretch;
}

/* When the popup renders only one section (mode = 'date' | 'duration')
   collapse the grid to that single column and let it size to its
   natural width. Used by the hotel mid-page searchbar. */
.when-pop--single .when-pop__content {
  grid-template-columns: auto;
}

/* ────────── Left: calendar column ────────── */
.when-pop__cal-section {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.when-pop__cal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: opacity 150ms ease, filter 150ms ease;
}

.when-pop__cal-body--disabled {
  opacity: 0.4;
  filter: grayscale(1);
  cursor: pointer;
  user-select: none;
}

/* Children are non-interactive so a click in the disabled state can
   only mean "re-enable the calendar" — handled by the wrapper. */
.when-pop__cal-body--disabled .mini-cal__nav,
.when-pop__cal-body--disabled .mini-cal__cell {
  pointer-events: none;
}

.when-pop__cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.when-pop__title {
  margin: 0;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
  color: #1A1A1A;
}

/* "I'm flexible" checkbox row */
.when-pop__flex {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.when-pop__flex-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.when-pop__flex-box {
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

.when-pop__flex:hover .when-pop__flex-box { border-color: var(--color-primary); }

.when-pop__flex-input:checked + .when-pop__flex-box {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.when-pop__flex-label {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 400;
  color: #1A1A1A;
  line-height: 1.2;
}

/* "Ik ben flexibel" placement below the calendar — sits with the same
   left-padding as the calendar grid so the checkbox aligns with the
   first date column. */
.when-pop__flex--below {
  margin-top: 4px;
  padding: 4px 0;
  align-self: flex-start;
}

/* ────────── Vertical divider ────────── */
.when-pop__divider {
  background: #f0f0f0;
  width: 1px;
  align-self: stretch;
}

/* ────────── Right: nights column ────────── */
.when-pop__nights-section {
  padding: 24px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.when-pop__hint {
  margin: 4px 0 16px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 400;
  color: #999999;
  line-height: 1;
}

.when-pop__nights-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Night-count checkboxes — same visual spec as the flex checkbox. */
.dur-check {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 400;
  color: #1A1A1A;
  line-height: 1.2;
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

.dur-check:hover .dur-check__box { border-color: var(--color-primary); }

.dur-check--selected .dur-check__box {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.dur-check--selected .dur-check__label { color: var(--color-primary); }

/* ────────── Mini calendar ────────── */
/* 7-column grid so the prev/next arrows land in the same columns as the
   first and last date cells of the week — they're visually centred under
   Monday and Sunday rather than the section edges. */
.mini-cal__header {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  align-items: center;
}

.mini-cal__nav {
  justify-self: center;
}

.mini-cal__month {
  grid-column: 2 / span 5;
  justify-self: center;
}

.mini-cal__month {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  color: #1A1A1A;
  line-height: 1;
}

.mini-cal__nav {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  border: 0;
  background: #f3f3f3;
  font-size: 15px;
  color: #6a6a6a;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  padding: 0;
  transition: background 150ms ease, color 150ms ease;
}

.mini-cal__nav:hover {
  background: #e6e6e6;
  color: #1A1A1A;
}

.mini-cal__days-header {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  text-align: center;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 500;
  color: #999999;
  text-transform: uppercase;
  letter-spacing: 0;
  line-height: 1;
}

.mini-cal__days-header > span {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-cal__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  /* Fixed row tracks: a selected/bold cell can never grow its row height, so
     the rows below never shift ("wobble"). Pairs with the cell height below. */
  grid-auto-rows: 44px;
}

.mini-cal__cell {
  height: 44px;
  /* Defeat the grid item's auto min-content floor (bold text could otherwise
     push the cell — and its row — taller on iOS WebKit). */
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 400;
  color: #1A1A1A;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  line-height: 1;
  border-radius: 8px;
  transition: background 150ms ease, color 150ms ease;
}

.mini-cal__cell:hover:not(.mini-cal__cell--empty):not(.mini-cal__cell--past):not(:disabled) {
  background: rgba(233, 113, 50, 0.1);
  color: var(--color-primary);
}

.mini-cal__cell--empty { cursor: default; }
.mini-cal__cell--past {
  color: #c7c7c7;
  cursor: default;
}

.mini-cal__cell--selected {
  background: var(--color-primary) !important;
  color: #fff !important;
  font-weight: 600;
}

/* ────────── Footer ────────── */
.when-pop__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
}

.when-pop__clear {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 400;
  color: #6a6a6a;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  line-height: 1;
}

.when-pop__clear:hover { color: var(--color-primary); }

.when-pop__clear--disabled {
  opacity: 0.4;
  cursor: default;
  pointer-events: none;
}

.when-pop__done {
  height: 40px;
  padding: 0 24px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: filter 150ms ease;
  line-height: 1;
}

.when-pop__done:hover { filter: brightness(0.95); }
</style>
