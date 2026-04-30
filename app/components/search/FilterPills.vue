<template>
  <div v-if="pills.length > 0" class="filter-pills">
    <button
      v-for="pill in pills"
      :key="pill.key"
      type="button"
      class="filter-pills__pill"
      @click="pill.onRemove"
    >
      <span class="filter-pills__label">{{ pill.label }}</span>
      <svg class="filter-pills__close" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
    <button
      v-if="pills.length > 0"
      type="button"
      class="filter-pills__reset"
      @click="resetAll"
    >
      {{ t('filter.clearAll') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getFilterTag } from '~/utils/filterTags'

/**
 * FilterPills — single row of removable filter chips for the "soft" filters
 * (nights, filter-tags, budget). Skips destination, arrival date, travel-
 * group; those have their own UI in the search bar.
 *
 * The last pill is a subtle "Verwijder filter" text link that wipes the
 * shared filter state — except for destination / date / persons-rooms.
 */

const { t } = useI18n()

const {
  selectedNights, toggleNight, clearNights,
  selectedFilterTags, toggleFilterTag, clearFilterTags,
  budgetMin, budgetMax, resetBudget,
  arrivalDate, selectedFlexibility, clearArrivalDate,
} = useSearchState()

/** Format the arrival pill label as "do 3 jul" or "do 3 jul ±3" with flex. */
function formatArrival(iso: string, flex: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  const dayShort = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'][dt.getDay()]
  const monthShort = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'][dt.getMonth()]
  const base = `${dayShort} ${dt.getDate()} ${monthShort}`
  return flex > 0 ? `${base} ±${flex}` : base
}

interface Pill { key: string; label: string; onRemove: () => void }

const pills = computed<Pill[]>(() => {
  const out: Pill[] = []
  // Arrival date (and flex window) pill — clears every calendar on the site
  if (arrivalDate.value) {
    out.push({
      key: 'arrival',
      label: formatArrival(arrivalDate.value, selectedFlexibility.value),
      onRemove: () => clearArrivalDate(),
    })
  }
  // Filter tags (Arrangement + Thema + Specials)
  for (const id of selectedFilterTags.value) {
    const tag = getFilterTag(id)
    if (!tag) continue
    out.push({
      key: `tag-${id}`,
      label: tag.label,
      onRemove: () => toggleFilterTag(id),
    })
  }
  // Nights
  for (const n of selectedNights.value) {
    out.push({
      key: `night-${n}`,
      label: n === '5+' ? '5+ nachten' : `${n} ${n === '1' ? 'nacht' : 'nachten'}`,
      onRemove: () => toggleNight(n),
    })
  }
  // Budget — only when narrowed from default
  if (budgetMin.value > 100 || budgetMax.value < 2000) {
    out.push({
      key: 'budget',
      label: `€${budgetMin.value}–€${budgetMax.value}`,
      onRemove: () => resetBudget(),
    })
  }
  return out
})

/** Reset all "soft" filters. Destination, arrival-date and persons/rooms
 *  are NOT cleared. */
function resetAll() {
  clearNights()
  clearFilterTags()
  resetBudget()
}
</script>

<style scoped>
.filter-pills {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.filter-pills__pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px 0 12px;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.filter-pills__pill:hover {
  background: var(--color-border-light);
  border-color: var(--color-border);
}

.filter-pills__close {
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.filter-pills__reset {
  background: none;
  border: 0;
  padding: 0 8px;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
}

.filter-pills__reset:hover {
  color: var(--color-primary-hover);
}
</style>
