<template>
  <aside class="filter-panel">
    <h2 class="filter-panel__title">Filters</h2>

    <div v-for="group in filterGroups" :key="group.title" class="filter-group">
      <button
        class="filter-group__toggle"
        @click="group.open = !group.open"
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
            :key="item.label"
            class="filter-item"
          >
            <input type="checkbox" class="filter-item__checkbox" />
            <span class="filter-item__label">{{ item.label }}</span>
            <span class="filter-item__count">({{ item.count }})</span>
          </label>
        </div>
      </Transition>
    </div>
  </aside>
</template>

<script setup lang="ts">
interface FilterItem {
  label: string
  count: number
}

interface FilterGroup {
  title: string
  open: boolean
  items: FilterItem[]
}

const filterGroups = reactive<FilterGroup[]>([
  {
    title: 'Duur',
    open: true,
    items: [
      { label: '2 nachten', count: 8 },
      { label: '3 nachten', count: 7 },
      { label: '4 nachten', count: 5 },
      { label: '5+ nachten', count: 1 },
    ],
  },
  {
    title: 'Locatie',
    open: true,
    items: [
      { label: 'Noord-Holland', count: 2 },
      { label: 'Zuid-Holland', count: 1 },
      { label: 'Gelderland', count: 2 },
      { label: 'Limburg (NL)', count: 1 },
      { label: 'Limburg (BE)', count: 1 },
      { label: 'Antwerpen', count: 1 },
    ],
  },
  {
    title: 'Arrangement',
    open: true,
    items: [
      { label: 'Diner inbegrepen', count: 6 },
      { label: 'Ontbijt inbegrepen', count: 8 },
      { label: 'Wellness & spa', count: 4 },
      { label: 'Museumkaartjes', count: 3 },
      { label: 'Rondvaart / rondleiding', count: 3 },
    ],
  },
  {
    title: 'Hotelfaciliteiten',
    open: false,
    items: [
      { label: 'Zwembad', count: 2 },
      { label: 'Wellness / sauna', count: 3 },
      { label: 'Restaurant', count: 6 },
      { label: 'Gratis parkeren', count: 4 },
      { label: 'Fitnessruimte', count: 3 },
      { label: 'Roomservice', count: 5 },
    ],
  },
  {
    title: 'Thema',
    open: false,
    items: [
      { label: 'Romantisch', count: 3 },
      { label: 'Wellness & ontspanning', count: 4 },
      { label: 'Culinair', count: 5 },
      { label: 'Cultuur & historie', count: 4 },
      { label: 'Stadsontdekking', count: 3 },
      { label: 'Natuur & wandelen', count: 2 },
    ],
  },
  {
    title: 'Kamer',
    open: false,
    items: [
      { label: 'Suite', count: 3 },
      { label: 'Deluxe kamer', count: 4 },
      { label: 'Standaard kamer', count: 6 },
      { label: 'Kamerupgrade mogelijk', count: 4 },
    ],
  },
  {
    title: 'Speciaal',
    open: false,
    items: [
      { label: 'Nieuw op ViaLuxury', count: 2 },
      { label: 'Populair', count: 3 },
      { label: 'Beste prijs-kwaliteit', count: 4 },
      { label: 'Last minute', count: 1 },
    ],
  },
])
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

.filter-item__count {
  color: var(--color-text-muted);
  font-size: 12px;
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
