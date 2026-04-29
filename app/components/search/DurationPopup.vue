<template>
  <div class="duration-popup">
    <!-- LEFT: night-count CHECKBOXES (multi-select, vertical column) -->
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

    <!-- RIGHT: weekend / midweek pills (single-select, only weekday-compatible) -->
    <div v-if="visibleFlexTypes.length > 0" class="duration-popup__col">
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
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

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

function onToggleNight(value: string) {
  emit('toggle-night', value)
}

function onSelectFlexType(value: string) {
  // Clicking the active pill deselects it
  emit('select-flex-type', props.flexType === value ? null : value)
}
</script>

<style scoped>
.duration-popup {
  padding: var(--space-lg);
  display: flex;
  flex-direction: row;
  gap: var(--space-xl);
  min-width: 0;
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
