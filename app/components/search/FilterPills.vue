<template>
  <!-- Wrapper always renders so the result list below doesn't jump when
       pills appear / disappear; reserved height fits 2 rows of pills. -->
  <div class="filter-pills" :class="{ 'filter-pills--empty': pills.length === 0 }">
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
      class="filter-pills__pill filter-pills__pill--reset"
      @click="resetAll"
    >
      <span class="filter-pills__label">{{ t('filter.clearAll') }}</span>
      <svg class="filter-pills__close" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getFilterTag } from '~/utils/filterTags'
import { DESTINATION_LABEL_BY_ID } from '~/utils/destinationMatch'

/**
 * FilterPills — single row of removable filter chips for the "soft" filters
 * (nights, filter-tags, budget). Skips destination, arrival date, travel-
 * group; those have their own UI in the search bar.
 *
 * The last pill is a subtle "Verwijder filter" text link that wipes the
 * shared filter state — except for destination / date / persons-rooms.
 */

const { t } = useI18n()

/**
 * `mode = 'search'` (default): full pill row including destination chips and
 * the reset chip clears destinations + arrival.
 * `mode = 'map'`: destinations are hidden (kaart shows all hotels regardless)
 * and the reset chip leaves the destination state alone — picking provinces
 * still drives the map's initial zoom on the next visit.
 */
const props = withDefaults(defineProps<{ mode?: 'search' | 'map' }>(), { mode: 'search' })

const {
  selectedNights, toggleNight, clearNights,
  selectedFilterTags, toggleFilterTag, clearFilterTags,
  budgetMin, budgetMax, resetBudget,
  arrivalDate, selectedFlexibility, clearArrivalDate,
  selectedDestinations, toggleDestination,
  selectedCities, removeCity,
  selectedHotels, removeHotel,
  clearDestinations,
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
  // Destination chips — only rendered on /search. /kaart shows all hotels
  // regardless of destination, so chips would be misleading there.
  if (props.mode !== 'map') {
    for (const id of selectedDestinations.value) {
      out.push({
        key: `dest-${id}`,
        label: DESTINATION_LABEL_BY_ID[id] || id,
        onRemove: () => toggleDestination(id),
      })
    }
    for (const c of selectedCities.value) {
      out.push({
        key: `city-${c.name}`,
        label: c.name,
        onRemove: () => removeCity(c.name),
      })
    }
    for (const h of selectedHotels.value) {
      out.push({
        key: `hotel-${h.slug}`,
        label: h.name,
        onRemove: () => removeHotel(h.slug),
      })
    }
  }
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

/** Reset every visible chip in this row.
 *  - On /search: clears destination + arrival + nights + tags + budget.
 *  - On /kaart: leaves destination state alone (those drive map zoom and
 *    aren't represented as chips on the map), but still clears arrival /
 *    nights / tags / budget.
 *  Persons/rooms always stay — they're a global price-formula variable,
 *  not a filter. */
function resetAll() {
  if (props.mode !== 'map') clearDestinations()
  clearArrivalDate()
  clearNights()
  clearFilterTags()
  resetBudget()
}
</script>

<style scoped>
.filter-pills {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  align-items: flex-start;
  gap: 8px;
  /* No min-height — the row collapses to 0 when no pills are active so the
   *  filter sidebar and the first deal card sit close to the map preview.
   *  Adding pills will push the cards down by ~32–72 px; that's the
   *  intentional trade-off versus reserving empty space. */
}
.filter-pills--empty { display: none; }

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

/* Reset chip uses exactly the same neutral pill shape as the other chips —
   no orange accent. The × icon and "Verwijder filters" label sit side-by-side
   just like every other chip in the row. */
.filter-pills__pill--reset .filter-pills__close {
  color: inherit;
}
</style>
