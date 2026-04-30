<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { searchHotels } from '~/data/mock/search-hotels'
import { useHotelMap } from '~/composables/useHotelMap'
import { dealMatchesAllTags } from '~/utils/filterTags'
import FilterPills from '~/components/search/FilterPills.vue'
import { isDealAvailable, isDealAvailableInWindow } from '~/utils/availability'
import { adjustPrice } from '~/utils/priceFormula'
import { CITY_COORDS } from '~/data/city-coordinates'
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
  committedArrivalDate,
  selectedNights,
  selectedFilterTags,
  committedFlexibility,
  selectedCities,
  selectedHotels: pickedHotels,
  persons,
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
  const tags = selectedFilterTags.value
  const flex = committedFlexibility.value
  const p = persons.value
  const matchesDuration = (n: number) => {
    if (ns.length === 0) return true
    if (ns.includes('5+') && n >= 5) return true
    return ns.includes(String(n))
  }
  const inBudget = (basePrice: number) => {
    const price = adjustPrice(basePrice, p)
    return price >= sharedBudgetMin.value && price <= sharedBudgetMax.value
  }
  const result: SearchHotel[] = []
  for (const h of searchHotels) {
    // Destination is NOT a filter on the map — it only drives initial zoom
    // (handled separately below). Hotels stay visible regardless.
    const matchingDeals = h.deals.filter(
      (d) =>
        matchesDuration(d.nights) &&
        inBudget(d.basePrice) &&
        dealMatchesAllTags(d, h, tags) &&
        // Arrival-date filter — drop deals with no availability in the
        // flex window. Hotels with no matching deals fall out below.
        (!committedArrivalDate.value || isDealAvailableInWindow(d.id, committedArrivalDate.value, flex)),
    )
    if (matchingDeals.length === 0) continue
    // For sold-out badge: with the hard filter above, any surviving deal
    // already has at least one available date in the flex window — so no
    // hotel is rendered as sold-out anymore. The flag stays in the data
    // model in case Phase-X wants to relax the filter later.
    result.push({ ...h, deals: matchingDeals, soldOut: false })
  }
  return result
})

/** Initial focus driven by the destination input. If a single hotel or city
 *  is picked, zoom in to it; otherwise leave the map's NL fit-bounds default. */
const initialFocus = computed<{ lat: number; lng: number; zoom?: number } | null>(() => {
  if (pickedHotels.value.length > 0) {
    const slug = pickedHotels.value[0].slug
    const hotel = searchHotels.find(h => h.slug === slug)
    if (hotel?.coordinates) return { ...hotel.coordinates, zoom: 13 }
  }
  if (selectedCities.value.length > 0) {
    const cityName = selectedCities.value[0].name
    const c = CITY_COORDS[cityName]
    if (c) return { ...c, zoom: 12 }
  }
  return null
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
        :persons="persons"
        @update:budget-min="budgetMin = $event"
        @update:budget-max="budgetMax = $event"
      />
    </aside>

    <!-- Pills float at the top, OUTSIDE the sliding stage so they stay
         visible (sticky) when the panel slides in. -->
    <FilterPills class="kaart-pills" />

    <main class="kaart-stage" :class="{ 'kaart-stage--with-panel': !!selectedHotel }">
      <ClientOnly>
        <HotelBrowseMap ref="mapRef" :hotels="mapHotels" :initial-focus="initialFocus" />
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
      <NuxtLink to="/home">Terug naar home</NuxtLink>
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

/* Filter pills sit absolutely on the kaart-page so they stay put when the
   stage (map) slides left on panel open. Anchored just right of the filter
   sidebar; right-padded to clear the "Sluit kaart" button. */
.kaart-pills {
  position: absolute;
  top: var(--space-md);
  left: calc(280px + var(--space-md));
  right: 180px;
  z-index: 700;
  pointer-events: auto;
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
  border-radius: var(--radius-sm);
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
