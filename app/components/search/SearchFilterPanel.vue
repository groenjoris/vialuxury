<template>
  <aside class="filter-panel">
    <div class="filter-panel__header">
      <h2 class="filter-panel__title">{{ t('search.filters') }}</h2>
      <button
        v-if="hideable"
        type="button"
        class="filter-panel__hide"
        @click="$emit('hide')"
      >
        {{ t('filter.hideFilter') }}
      </button>
    </div>

    <!-- Budget slider — bounds rescale with the global person count. -->
    <div class="filter-budget">
      <div class="filter-budget__header">
        <span class="filter-budget__label">Totaalprijs <span class="filter-budget__persons">{{ persons }} {{ persons === 1 ? 'persoon' : 'personen' }}</span></span>
        <div class="filter-budget__range">{{ formatPrice(budgetMin) }} – {{ formatPrice(budgetMax) }}</div>
      </div>
      <div class="filter-budget__slider">
        <div class="filter-budget__track">
          <div
            class="filter-budget__fill"
            :style="{ '--fill-left': fillLeftPct + '%', '--fill-right': fillRightPct + '%' }"
          ></div>
        </div>
        <input
          type="range"
          class="filter-budget__input filter-budget__input--min"
          :min="sliderMin" :max="sliderMax" :step="25"
          :value="budgetMin"
          @input="onMinChange"
        />
        <input
          type="range"
          class="filter-budget__input filter-budget__input--max"
          :min="sliderMin" :max="sliderMax" :step="25"
          :value="budgetMax"
          @input="onMaxChange"
        />
      </div>
      <div class="filter-budget__labels">
        <span>{{ formatPrice(sliderMin) }}</span>
        <span>{{ formatPrice(sliderMax) }}</span>
      </div>
    </div>

    <div v-for="(group, index) in filterGroups" :key="group.title" class="filter-group">
      <button
        class="filter-group__toggle"
        @click="toggleGroup(index)"
        :aria-expanded="group.open"
      >
        <span class="filter-group__label">{{ group.title }}</span>
        <svg
          class="filter-group__chevron"
          :class="{ 'filter-group__chevron--open': group.open }"
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <Transition name="filter-expand">
        <div v-if="group.open" class="filter-group__body">
          <label
            v-for="item in group.items"
            :key="item.value || item.label"
            class="filter-item"
          >
            <input
              type="checkbox"
              class="filter-item__checkbox"
              :checked="isItemChecked(group.id, item.value)"
              :disabled="!isItemWired(group.id)"
              @change="onItemToggle(group.id, item.value)"
            />
            <span class="filter-item__label">{{ item.label }}</span>
          </label>
        </div>
      </Transition>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { formatPrice } from '~/utils/formatPrice'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  budgetMin: number
  budgetMax: number
  persons?: number
  /** Show a "Verberg filter" link in the panel header (search page only). */
  hideable?: boolean
}>(), {
  persons: 2,
  hideable: false,
})

const emit = defineEmits<{
  'update:budgetMin': [value: number]
  'update:budgetMax': [value: number]
  'hide': []
}>()

import { adjustPrice } from '~/utils/priceFormula'

/** Slider bounds scale with the global person count. The 2-person spec
 *  range is €100 – €2000; for other person counts we apply the same
 *  per-person formula used elsewhere. */
const sliderMin = computed(() => adjustPrice(100, props.persons))
const sliderMax = computed(() => adjustPrice(2000, props.persons))

const fillLeftPct = computed(() => {
  const range = sliderMax.value - sliderMin.value
  if (range <= 0) return 0
  return Math.max(0, Math.min(100, ((props.budgetMin - sliderMin.value) / range) * 100))
})
const fillRightPct = computed(() => {
  const range = sliderMax.value - sliderMin.value
  if (range <= 0) return 0
  return Math.max(0, Math.min(100, 100 - ((props.budgetMax - sliderMin.value) / range) * 100))
})

function onMinChange(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  emit('update:budgetMin', Math.min(val, props.budgetMax - 25))
}

function onMaxChange(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  emit('update:budgetMax', Math.max(val, props.budgetMin + 25))
}

/** When the person count changes, clamp the budget into the new bounds and
 *  pre-stretch the active range to match the new full window so the slider
 *  feels consistent. */
watch(() => props.persons, (next, prev) => {
  if (next === prev) return
  const newMin = adjustPrice(100, next)
  const newMax = adjustPrice(2000, next)
  // Rescale current selection proportionally to the new range.
  const oldMin = adjustPrice(100, prev || 2)
  const oldMax = adjustPrice(2000, prev || 2)
  const oldRange = oldMax - oldMin
  if (oldRange > 0) {
    const ratioLo = (props.budgetMin - oldMin) / oldRange
    const ratioHi = (props.budgetMax - oldMin) / oldRange
    const wantedMin = Math.round(newMin + ratioLo * (newMax - newMin))
    const wantedMax = Math.round(newMin + ratioHi * (newMax - newMin))
    emit('update:budgetMin', Math.max(newMin, Math.min(newMax - 25, wantedMin)))
    emit('update:budgetMax', Math.min(newMax, Math.max(newMin + 25, wantedMax)))
  }
})

interface FilterItem {
  label: string
  value: string
}

interface FilterGroup {
  id: string
  title: string
  open: boolean
  items: FilterItem[]
}

// Wire travel-duration + filter-tag checkboxes to shared search state
const {
  selectedNights, toggleNight,
  selectedFilterTags, toggleFilterTag,
} = useSearchState()

function isItemWired(groupId: string): boolean {
  return groupId === 'travelDuration'
    || groupId === 'arrangement'
    || groupId === 'thema'
    || groupId === 'specials'
}

function isItemChecked(groupId: string, value: string): boolean {
  if (groupId === 'travelDuration') return selectedNights.value.includes(value)
  if (groupId === 'arrangement' || groupId === 'thema' || groupId === 'specials') {
    return selectedFilterTags.value.includes(value)
  }
  return false
}

function onItemToggle(groupId: string, value: string) {
  if (groupId === 'travelDuration') toggleNight(value)
  else if (groupId === 'arrangement' || groupId === 'thema' || groupId === 'specials') {
    toggleFilterTag(value)
  }
}

const openState = reactive<Record<string, boolean>>({
  travelDuration: true,
  arrangement: true,
  thema: true,
  specials: true,
})

import { tagsByCategory } from '~/utils/filterTags'

const tagItems = (cat: 'arrangement' | 'thema' | 'specials') =>
  tagsByCategory(cat).map(t => ({ label: `${t.emoji} ${t.label}`, value: t.id }))

const filterGroups = computed<FilterGroup[]>(() => [
  {
    id: 'travelDuration',
    title: t('filter.travelDuration'),
    open: openState.travelDuration,
    items: [
      { label: t('filter.1day'), value: '1' },
      { label: t('filter.2days'), value: '2' },
      { label: t('filter.3days'), value: '3' },
      { label: t('filter.4days'), value: '4' },
      { label: t('filter.5plusDays'), value: '5+' },
    ],
  },
  { id: 'arrangement', title: 'Arrangement', open: openState.arrangement, items: tagItems('arrangement') },
  { id: 'thema',       title: 'Thema',       open: openState.thema,       items: tagItems('thema') },
  { id: 'specials',    title: 'Specials',    open: openState.specials,    items: tagItems('specials') },
])

const groupKeys = ['travelDuration', 'arrangement', 'thema', 'specials'] as const

function toggleGroup(index: number) {
  const key = groupKeys[index]
  openState[key] = !openState[key]
}
</script>

<style scoped>
.filter-panel {
  background: var(--color-background-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
}

.filter-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-lg);
}

.filter-panel__title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.filter-panel__hide {
  background: none;
  border: 0;
  padding: 0;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
}

.filter-panel__hide:hover {
  color: var(--color-primary-hover);
}

/* Budget slider */
.filter-budget {
  padding-bottom: var(--space-md);
  margin-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border-light);
}

.filter-budget__header {
  margin-bottom: var(--space-md);
}

.filter-budget__label {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.filter-budget__persons {
  font-weight: 400;
  color: var(--color-text-secondary);
}

.filter-budget__range {
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.filter-budget__slider {
  position: relative;
  height: 28px;
}

.filter-budget__track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  transform: translateY(-50%);
}

.filter-budget__fill {
  position: absolute;
  top: 0;
  left: var(--fill-left, 0%);
  right: var(--fill-right, 0%);
  height: 100%;
  background: #1A1A1A;
  border-radius: 2px;
}

.filter-budget__input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  pointer-events: none;
  outline: none;
}

.filter-budget__input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #1A1A1A;
  border: 3px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  pointer-events: all;
}

.filter-budget__input::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #1A1A1A;
  border: 3px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  pointer-events: all;
}

.filter-budget__labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.filter-group {
  border-top: 1px solid var(--color-border-light);
  padding-top: var(--space-md);
  margin-top: var(--space-md);
}

.filter-group:first-of-type {
  border-top: none;
  padding-top: 0;
  margin-top: 0;
}

.filter-group__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
}

.filter-group__label {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.filter-group__chevron {
  color: var(--color-text-muted);
  transition: transform var(--transition-fast);
  flex-shrink: 0;
}

.filter-group__chevron--open {
  transform: rotate(180deg);
}

.filter-group__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: var(--space-sm);
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.filter-item__checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid var(--color-border);
  border-radius: 3px;
  cursor: pointer;
  flex-shrink: 0;
  position: relative;
  background: white;
  transition: background-color 150ms ease, border-color 150ms ease;
}

.filter-item__checkbox:checked {
  background-color: var(--color-discount);
  border-color: var(--color-discount);
}

.filter-item__checkbox:checked::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 5px;
  height: 9px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.filter-item__label {
  flex: 1;
}

/* Expand transition */
.filter-expand-enter-active,
.filter-expand-leave-active {
  transition: all 200ms ease;
  overflow: hidden;
}

.filter-expand-enter-from,
.filter-expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.filter-expand-enter-to,
.filter-expand-leave-from {
  opacity: 1;
  max-height: 400px;
}
</style>
