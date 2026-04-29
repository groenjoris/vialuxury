<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { searchHotels } from '~/data/mock/search-hotels'
import { useHotelMap } from '~/composables/useHotelMap'
import { isDealAvailable } from '~/utils/availability'
import type { SearchHotel } from '~/types/searchHotel'
import HotelBrowseMap from '~/components/map/HotelBrowseMap.vue'
import HotelMapHoverCard from '~/components/map/HotelMapHoverCard.vue'
import HotelDealsSidePanel from '~/components/search/HotelDealsSidePanel.vue'
import HotelMapZoomControls from '~/components/map/HotelMapZoomControls.vue'
import SearchFilterPanel from '~/components/search/SearchFilterPanel.vue'

const { t } = useI18n()

useHead({ title: 'Kaart — Via Luxury' })

const router = useRouter()

const {
  arrivalDate,
  selectedNights,
  budgetMin: sharedBudgetMin,
  budgetMax: sharedBudgetMax,
  setBudgetMin,
  setBudgetMax,
} = useSearchState()

// Writable computed aliases so SearchFilterPanel's v-model still works.
const budgetMin = computed({
  get: () => sharedBudgetMin.value,
  set: (v: number) => setBudgetMin(v),
})
const budgetMax = computed({
  get: () => sharedBudgetMax.value,
  set: (v: number) => setBudgetMax(v),
})

/** Per spec:
 *  - Duration filter (hard): drop deals whose nights don't match. If a hotel
 *    has zero matching deals → remove the hotel from the map entirely.
 *  - Arrival-date filter: when set, deals that are sold out on that date
 *    are *not* removed — but if every matching deal of a hotel is sold out,
 *    the hotel renders with the grey "Disabled" pin (still clickable).
 *  - When no arrival date is set, hotels are never sold out.
 *  Destination input doesn't filter the map (handled by initial-zoom logic
 *  in a follow-up — for now we just show everything centred on NL). */
const mapHotels = computed<SearchHotel[]>(() => {
  const ns = selectedNights.value
  const matchesDuration = (n: number) => {
    if (ns.length === 0) return true
    if (ns.includes('5+') && n >= 5) return true
    return ns.includes(String(n))
  }
  const inBudget = (price: number) =>
    price >= sharedBudgetMin.value && price <= sharedBudgetMax.value
  const result: SearchHotel[] = []
  for (const h of searchHotels) {
    const matchingDeals = h.deals.filter(
      (d) => matchesDuration(d.nights) && inBudget(d.basePrice),
    )
    if (matchingDeals.length === 0) continue
    let soldOut = false
    if (arrivalDate.value) {
      const anyAvailable = matchingDeals.some((d) =>
        isDealAvailable(d.id, arrivalDate.value!),
      )
      soldOut = !anyAvailable
    }
    result.push({ ...h, deals: matchingDeals, soldOut })
  }
  return result
})

const {
  selectedHotelId,
  hoveredHotelId,
  hoverPosition,
  clearSelection,
} = useHotelMap()

const selectedHotel = computed(() =>
  mapHotels.value.find((h) => h.id === selectedHotelId.value) ?? null,
)

const hoveredHotel = computed(() =>
  mapHotels.value.find((h) => h.id === hoveredHotelId.value) ?? null,
)

const mapRef = ref<InstanceType<typeof HotelBrowseMap> | null>(null)

function closeMap() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}
</script>

<template>
  <div class="kaart-page">
    <!-- Sticky filter sidebar (left). Stays in place when the side panel
         opens; the map slides under it. Filter content scrolls internally
         when it overflows the viewport height. -->
    <aside class="kaart-filter">
      <SearchFilterPanel
        :budget-min="budgetMin"
        :budget-max="budgetMax"
        @update:budget-min="budgetMin = $event"
        @update:budget-max="budgetMax = $event"
      />
    </aside>

    <main class="kaart-stage" :class="{ 'kaart-stage--with-panel': !!selectedHotel }">
      <ClientOnly>
        <HotelBrowseMap ref="mapRef" :hotels="mapHotels" />
      </ClientOnly>

      <HotelDealsSidePanel
        :is-open="!!selectedHotel"
        :hotel="selectedHotel"
        :map-mode="true"
        @close="clearSelection"
      />

      <HotelMapHoverCard
        v-if="hoveredHotel"
        :hotel="hoveredHotel"
        :position="hoverPosition"
        :arrival-date="arrivalDate"
        :sold-out="hoveredHotel.soldOut"
      />

      <button
        type="button"
        class="kaart-close"
        @click="closeMap"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
        <span>Sluit kaart</span>
      </button>

      <HotelMapZoomControls
        @zoom-in="mapRef?.zoomIn()"
        @zoom-out="mapRef?.zoomOut()"
      />
    </main>

    <!-- Mobile fallback (locked-in scope: desktop-only) -->
    <div class="kaart-mobile-fallback">
      <p>Open de kaart op een desktop voor de beste ervaring.</p>
      <NuxtLink to="/">Terug naar home</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.kaart-page {
  position: fixed;
  inset: 0;
  background: var(--color-surface);
  overflow: hidden;
}

/* ---------- Filter sidebar (left) ---------- */
.kaart-filter {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border-light);
  z-index: 700; /* above the stage so the map slides UNDER it */
  overflow-y: auto;
  overscroll-behavior: contain;
  /* No outer padding — the SearchFilterPanel manages its own. */
}

/* ---------- Stage (map area) ---------- */
.kaart-stage {
  /* Sits to the right of the sticky filter; the filter overlays the stage's
     left edge so when the stage translates left on panel open, the map
     slides UNDER the filter. */
  position: absolute;
  top: 0;
  left: 280px;
  right: 0;
  bottom: 0;
  /* When the side panel slides in, the WHOLE stage (map + close button +
     zoom controls + pins) slides left by the panel width — same timing
     and easing as the panel itself, so the two move as if attached. */
  will-change: transform;
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.kaart-stage--with-panel {
  transform: translateX(-380px);
}

.kaart-close {
  position: absolute;
  top: var(--space-lg);
  right: var(--space-lg);
  z-index: 600;
  height: 40px;
  padding: 0 var(--space-md);
  background: var(--color-surface);
  border: 0;
  border-radius: 999px;
  box-shadow: var(--shadow-card);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
}

.kaart-close:hover {
  background: var(--color-background-secondary);
}

/* ---------- Mobile fallback ---------- */
.kaart-mobile-fallback {
  display: none;
}

@media (max-width: 1023px) {
  .kaart-stage {
    display: none;
  }
  .kaart-mobile-fallback {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    padding: var(--space-2xl);
    gap: var(--space-md);
    color: var(--color-text-primary);
  }
}
</style>
