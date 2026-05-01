<template>
  <div class="duration-popup">
    <!-- 2-tab header — only rendered when both options are available. If
         the arrival date locks the day-of-week away from every weekend
         pill, we drop the tab switch entirely and show the nights view. -->
    <div v-if="hasWeekendOptions" class="duration-popup__tabs">
      <div class="duration-popup__tabs-inner">
        <button
          class="duration-popup__tab"
          :class="{ 'duration-popup__tab--active': activeTab === 'nights' }"
          @click="activeTab = 'nights'"
        >
          {{ t('header.tab.nights') }}
        </button>
        <button
          class="duration-popup__tab"
          :class="{ 'duration-popup__tab--active': activeTab === 'weekend' }"
          @click="activeTab = 'weekend'"
        >
          {{ t('header.tab.weekend') }}
        </button>
      </div>
    </div>

    <div class="duration-popup__body">
      <!-- TAB 1: night-count multi-select -->
      <template v-if="activeTab === 'nights'">
        <p class="duration-popup__hint">{{ t('header.tab.nightsHint') }}</p>
        <div class="duration-popup__col">
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
              @change="onToggleNight(opt.value)"
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
      </template>

      <!-- TAB 2: weekend / midweek pills -->
      <template v-else>
        <div class="duration-popup__col">
          <button
            v-for="opt in visibleFlexTypes"
            :key="opt.value"
            type="button"
            class="flex-chip flex-chip--two-line"
            :class="{ 'flex-chip--selected': flexType === opt.value }"
            @click="onSelectFlexType(opt.value)"
          >
            <span class="flex-chip__main">{{ opt.label }}</span>
            <span class="flex-chip__sub">{{ opt.sub }} ({{ opt.nightsText }})</span>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

const { t } = useI18n()

const props = defineProps<{
  /** Currently selected nights ('1' / '2' / '3' / '4' / '5+'). */
  nights: readonly string[]
  /** Currently selected flex-type ('weekend-fri-sun' | … | null). */
  flexType: string | null
  /** Currently selected exact arrival date (YYYY-MM-DD), null if none. */
  arrivalDate: string | null
  /** Months selected via flex-tab — for arrival-day compatibility. */
  flexMonths?: string[]
}>()

const emit = defineEmits<{
  'toggle-night': [value: string]
  'select-flex-type': [value: string | null]
}>()

const nightOptions = [
  { label: '1 nacht', value: '1' },
  { label: '2 nachten', value: '2' },
  { label: '3 nachten', value: '3' },
  { label: '4 nachten', value: '4' },
  { label: '5+ nachten', value: '5+' },
]

/** Each flex-type option declares which start-day-of-week it requires.
 *  Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6. */
const flexTypeOptions = [
  { label: 'Weekend', sub: 'vr – zo', nightsText: '2 nachten', value: 'weekend-fri-sun', startDow: 5 },
  { label: 'Weekend', sub: 'za – zo', nightsText: '1 nacht', value: 'weekend-sat-sun', startDow: 6 },
  { label: 'Lang weekend', sub: 'vr – ma', nightsText: '3 nachten', value: 'long-weekend', startDow: 5 },
  { label: 'Midweek', sub: 'ma – vr', nightsText: '4 nachten', value: 'midweek', startDow: 1 },
]

/** Set of weekday-numbers that are compatible with the user's current arrival
 *  intent. Used to filter weekend/midweek pills.
 *  - No arrival date and no flex months → all weekdays valid (show all pills)
 *  - Exact arrival date → that date's weekday only
 *  - Flex months → any weekday that occurs in those months (=> always all 7)
 */
const validStartDows = computed<Set<number>>(() => {
  // Exact date wins
  if (props.arrivalDate) {
    return new Set([dayjs(props.arrivalDate).day()])
  }
  // Flex months: any future Friday/Saturday/Monday will fall in any month →
  // all weekdays are reachable. Show all pills.
  if (props.flexMonths && props.flexMonths.length > 0) {
    return new Set([0, 1, 2, 3, 4, 5, 6])
  }
  // No date constraint at all → show everything.
  return new Set([0, 1, 2, 3, 4, 5, 6])
})

const visibleFlexTypes = computed(() =>
  flexTypeOptions.filter(opt => validStartDows.value.has(opt.startDow)),
)

/** Whether to show the tab switch at all. If the arrival date constraints
 *  drop every weekend pill, there's nothing to switch between — collapse
 *  the popup to just the nights view. */
const hasWeekendOptions = computed(() => visibleFlexTypes.value.length > 0)

// Active tab — auto-flips to match what the user is interacting with so
// the visible state always reflects the current selection.
const activeTab = ref<'nights' | 'weekend'>(
  props.flexType && hasWeekendOptions.value ? 'weekend' : 'nights',
)
// If the weekend tab disappears (date filter changes the day-of-week),
// snap back to the nights tab so the body has something to render.
watch(hasWeekendOptions, (has) => {
  if (!has && activeTab.value === 'weekend') activeTab.value = 'nights'
})

function onToggleNight(value: string) {
  activeTab.value = 'nights'
  emit('toggle-night', value)
}

function onSelectFlexType(value: string) {
  activeTab.value = 'weekend'
  // Clicking the active pill deselects it
  emit('select-flex-type', props.flexType === value ? null : value)
}
</script>

<style scoped>
.duration-popup {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* ===== TAB BAR (matches DatePopup) ===== */
.duration-popup__tabs {
  display: flex;
  justify-content: center;
  padding: var(--space-md) var(--space-lg) 0;
}

.duration-popup__tabs-inner {
  display: flex;
  gap: 0;
  background: var(--color-background-secondary);
  border-radius: 999px;
  padding: 3px;
  width: 100%;
  max-width: 460px;
}

.duration-popup__tab {
  flex: 1;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  background: none;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: color 150ms ease, background 150ms ease;
  white-space: nowrap;
}

.duration-popup__tab:hover {
  color: var(--color-primary);
}

.duration-popup__tab--active {
  color: var(--color-text-primary);
  background: var(--color-surface);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.duration-popup__body {
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.duration-popup__hint {
  margin: 0 0 4px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.duration-popup__col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ===== NIGHT-COUNT CHECKBOXES (left column) ===== */
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

.dur-check--selected .dur-check__label {
  /* Color only — keep font-weight stable so toggling doesn't reflow the
     popup (bold text would widen the column and push the right pills). */
  color: var(--color-primary);
}

/* Lock column min-width so any subtle metric difference (italic ligatures,
   etc.) can never push the sibling column. */
.duration-popup__col {
  min-width: 130px;
}

/* ===== WEEKEND / MIDWEEK PILLS (right column) — wanneer-style ===== */
.flex-chip {
  padding: 8px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 150ms ease;
  white-space: nowrap;
  text-align: left;
}

.flex-chip:hover { border-color: var(--color-primary); }

.flex-chip--selected {
  border-color: var(--color-primary);
  background: rgba(251, 134, 45, 0.1);
  font-weight: 600;
  color: var(--color-primary);
}

.flex-chip--two-line {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 8px 14px;
}

.flex-chip__main { font-size: 14px; }
.flex-chip__sub { font-size: 12px; opacity: 0.75; font-weight: 500; }
</style>
