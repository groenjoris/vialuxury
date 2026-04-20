<template>
  <aside class="filter-panel">
    <h2 class="filter-panel__title">{{ t('search.filters') }}</h2>

    <!-- Budget slider -->
    <div class="filter-budget">
      <div class="filter-budget__header">
        <span class="filter-budget__label">Totaalprijs <span class="filter-budget__persons">{{ persons }} personen</span></span>
        <div class="filter-budget__range">{{ formatPrice(budgetMin) }} – {{ formatPrice(budgetMax) }}</div>
      </div>
      <div class="filter-budget__slider">
        <div class="filter-budget__track">
          <div
            class="filter-budget__fill"
            :style="{ '--fill-left': ((budgetMin - 100) / 1900 * 100) + '%', '--fill-right': (100 - (budgetMax - 100) / 1900 * 100) + '%' }"
          ></div>
        </div>
        <input
          type="range"
          class="filter-budget__input filter-budget__input--min"
          :min="100" :max="2000" :step="25"
          :value="budgetMin"
          @input="onMinChange"
        />
        <input
          type="range"
          class="filter-budget__input filter-budget__input--max"
          :min="100" :max="2000" :step="25"
          :value="budgetMax"
          @input="onMaxChange"
        />
      </div>
      <div class="filter-budget__labels">
        <span>€100</span>
        <span>€2000</span>
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
            :key="item"
            class="filter-item"
          >
            <input type="checkbox" class="filter-item__checkbox" />
            <span class="filter-item__label">{{ item }}</span>
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
}>(), {
  persons: 2,
})

const emit = defineEmits<{
  'update:budgetMin': [value: number]
  'update:budgetMax': [value: number]
}>()

function onMinChange(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  emit('update:budgetMin', Math.min(val, props.budgetMax - 25))
}

function onMaxChange(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  emit('update:budgetMax', Math.max(val, props.budgetMin + 25))
}

interface FilterGroup {
  title: string
  open: boolean
  items: string[]
}

const openState = reactive<Record<string, boolean>>({
  travelDuration: true,
  location: true,
  arrangement: true,
  activities: true,
  hotelFacilities: true,
  room: true,
  special: true,
})

const filterGroups = computed<FilterGroup[]>(() => [
  {
    title: t('filter.travelDuration'),
    open: openState.travelDuration,
    items: [t('filter.1day'), t('filter.2days'), t('filter.3days'), t('filter.4days'), t('filter.5plusDays')],
  },
  {
    title: t('filter.location'),
    open: openState.location,
    items: [t('filter.waterside'), t('filter.nearSea'), t('filter.inForest'), t('filter.inNature'), t('filter.cityBreaks')],
  },
  {
    title: t('filter.arrangement'),
    open: openState.arrangement,
    items: [t('filter.culinaryHighlights'), t('filter.withDinner'), t('filter.lateCheckout')],
  },
  {
    title: t('filter.activities'),
    open: openState.activities,
    items: [t('filter.cycling'), t('filter.hiking')],
  },
  {
    title: t('filter.hotelFacilities'),
    open: openState.hotelFacilities,
    items: [t('filter.wellness'), t('filter.pool'), t('filter.dogFriendly'), t('filter.fiveStarLuxury')],
  },
  {
    title: t('filter.room'),
    open: openState.room,
    items: [t('filter.jacuzzi'), t('filter.luxeSuite')],
  },
  {
    title: t('filter.special'),
    open: openState.special,
    items: [t('filter.bestPrice'), t('filter.newHotels'), t('filter.exclusive')],
  },
])

const groupKeys = ['travelDuration', 'location', 'arrangement', 'activities', 'hotelFacilities', 'room', 'special'] as const

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

.filter-panel__title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  margin-bottom: var(--space-lg);
  color: var(--color-text-primary);
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
