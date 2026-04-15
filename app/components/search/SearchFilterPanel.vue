<template>
  <aside class="filter-panel">
    <h2 class="filter-panel__title">{{ t('search.filters') }}</h2>

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
const { t } = useI18n()

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
  width: 16px;
  height: 16px;
  border-radius: var(--radius-xs);
  accent-color: var(--color-primary);
  cursor: pointer;
  flex-shrink: 0;
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
