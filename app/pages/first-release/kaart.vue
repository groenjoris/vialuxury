<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchHotels } from '~/data/mock/search-hotels'
import { useFirstReleaseHotelMap } from '~/composables-first-release/useFirstReleaseHotelMap'
import { useFirstReleaseHomeVariant } from '~/composables-first-release/useFirstReleaseHomeVariant'
import { dealMatchesAllTags, getFilterTag } from '~/utils-first-release/filterTags'
import { computeFilterCounts } from '~/utils-first-release/filterCounts'
import FilterPills from '~/components-first-release/search/FilterPills.vue'
import { isDealAvailable, isDealAvailableInWindow } from '~/utils-first-release/availability'
import { adjustPrice } from '~/utils-first-release/priceFormula'
import { CITY_COORDS, PROVINCE_COORDS } from '~/data/city-coordinates'
import type { SearchHotel } from '~/types/searchHotel'
import HotelBrowseMap from '~/components-first-release/map/HotelBrowseMap.vue'
import HotelMapHoverCard from '~/components-first-release/map/HotelMapHoverCard.vue'
import HotelDealsSidePanel from '~/components-first-release/search/HotelDealsSidePanel.vue'
import HotelMapZoomControls from '~/components-first-release/map/HotelMapZoomControls.vue'
import SearchFilterPanel from '~/components-first-release/search/SearchFilterPanel.vue'
import HotelMapMobileCard from '~/components-first-release/map/HotelMapMobileCard.vue'
import FilterSubpage from '~/components-first-release/search/FilterSubpage.vue'
import { useFirstReleaseIsMobile } from '~/composables-first-release/useFirstReleaseIsMobile'

const { t } = useFirstReleaseI18n()
const isMobile = useFirstReleaseIsMobile()

useHead({ title: 'Kaart — Via Luxury' })

const router = useRouter()
const route = useRoute()
const { homeHref } = useFirstReleaseHomeVariant()

/** When the user arrives from a deal page via "Bekijk kaart", the
 *  query string carries the hotel's slug in `?focus=<slug>`. We
 *  resolve it to the actual SearchHotel so we can:
 *   - centre the map on it at zoom 14 (overrides destination zoom)
 *   - keep it visible even when the active filters would otherwise
 *     hide it (this hotel is the user's anchor)
 *   - auto-open the sidepanel for it when `?open=1` is also present
 *  Lives as a computed (not a ref) so navigating away wipes it. */
const focusedHotel = computed<SearchHotel | null>(() => {
  const slug = (route.query.focus as string | undefined) || ''
  if (!slug) return null
  return searchHotels.find(h => h.slug === slug) ?? null
})

const {
  arrivalDate,
  committedArrivalDate,
  selectedNights,
  selectedFilterTags,
  committedFlexibility,
  selectedDestinations,
  selectedCities,
  selectedHotels: pickedHotels,
  selectionOrder,
  persons,
  budgetMin: sharedBudgetMin,
  budgetMax: sharedBudgetMax,
  setBudgetMin,
  setBudgetMax,
  resetBudget,
  clearArrivalDate,
  clearDuration,
  clearFilterTags,
  clearDestinations,
} = useFirstReleaseSearchState()

// Mobile filter modal (full-screen subpage, same as /search).
const mobileFilterOpen = ref(false)
function resetFilters() {
  resetBudget()
  clearArrivalDate()
  clearDuration()
  clearFilterTags()
  clearDestinations()
}

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
  const flex = committedFlexibility.value
  const p = persons.value

  // Themes are OR'd within their group, the rest (arrangement/specials) is
  // still AND-gated. Destinations don't filter the map — they only drive
  // initial zoom further down in this file.
  const pickedThemes: string[] = []
  const pickedOther: string[] = []
  for (const id of selectedFilterTags.value) {
    const tag = getFilterTag(id)
    if (tag?.category === 'thema') pickedThemes.push(id)
    else pickedOther.push(id)
  }
  const themesActive = pickedThemes.length > 0

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
    // Destination is NOT a filter on the map — it only drives initial zoom.
    // Every hotel stays on the map; we just tag it as `unmatched` when none
    // of its deals satisfy the active filters so the pin renders disabled
    // and the hover-card text changes. Clicking still opens the side panel
    // with the full deal set so the tester can browse them anyway.
    const matchingDeals = h.deals.filter((d) => {
      if (!matchesDuration(d.nights)) return false
      if (!inBudget(d.basePrice)) return false
      if (!dealMatchesAllTags(d, h, pickedOther)) return false
      if (committedArrivalDate.value && !isDealAvailableInWindow(d.id, committedArrivalDate.value, flex)) return false
      if (themesActive) {
        let themeOk = false
        for (const id of pickedThemes) {
          const tag = getFilterTag(id)
          if (tag?.matches(d, h)) { themeOk = true; break }
        }
        if (!themeOk) return false
      }
      return true
    })
    // Hide hotels that have zero deals matching the active filters — the
    // greyed-out "unmatched" pins are no longer rendered. Drop the hotel
    // from the map entirely. EXCEPTION: when arrived via `?focus=<slug>`
    // from a deal page, the focused hotel is the user's anchor and must
    // always render (even if the current filters would otherwise hide
    // it). Other hotels still respect the filter.
    if (matchingDeals.length === 0 && h.id !== focusedHotel.value?.id) continue
    result.push({
      ...h,
      // Keep ALL deals on the hotel object so the side panel still shows
      // every arrangement when the user clicks the pin.
      deals: h.deals,
      soldOut: false,
      unmatched: false,
    })
  }
  return result
})

/** Per-filter-item deal counts shown as `(N)` in the panel. Destinations
 *  intentionally don't filter the map data, so they're not part of the
 *  count predicate either — the count reflects everything else (budget,
 *  arrival date, nights, tags). */
const filterCounts = computed(() => {
  const p = persons.value
  const flex = committedFlexibility.value
  const arrival = committedArrivalDate.value
  return computeFilterCounts({
    hotels: searchHotels,
    inBudget: (d) => {
      const price = adjustPrice(d.basePrice, p)
      return price >= sharedBudgetMin.value && price <= sharedBudgetMax.value
    },
    isAvailableOnDate: arrival ? (d) => isDealAvailableInWindow(d.id, arrival, flex) : undefined,
    selectedNights: selectedNights.value,
    selectedTagIds: selectedFilterTags.value,
  })
})

/** Initial focus driven by the destination input. Walks the selectionOrder
 *  so the FIRST pick wins (matching the order the user added them). Picks
 *  resolve to: pinned hotel (zoom 13) → city (zoom 12) → province / region
 *  (zoom from PROVINCE_COORDS, usually 8-9). Falls back to NL fit-bounds.
 *
 *  `?focus=<slug>` (from a deal page) takes priority over destinations —
 *  centre on the focused hotel at zoom 14. */
const initialFocus = computed<{ lat: number; lng: number; zoom?: number } | null>(() => {
  if (focusedHotel.value?.coordinates) {
    return { ...focusedHotel.value.coordinates, zoom: 14 }
  }
  for (const entry of selectionOrder.value) {
    if (entry.type === 'hotel') {
      const hotel = searchHotels.find(h => h.slug === entry.key)
      if (hotel?.coordinates) return { ...hotel.coordinates, zoom: 13 }
    } else if (entry.type === 'city') {
      const c = CITY_COORDS[entry.key]
      if (c) return { ...c, zoom: 12 }
    } else if (entry.type === 'destination') {
      const p = PROVINCE_COORDS[entry.key]
      if (p) return { lat: p.lat, lng: p.lng, zoom: p.zoom }
    }
  }
  // No selectionOrder entries (older sessions / direct page hit) — fall back
  // to a flat scan with the same priority.
  if (pickedHotels.value.length > 0) {
    const slug = pickedHotels.value[0].slug
    const hotel = searchHotels.find(h => h.slug === slug)
    if (hotel?.coordinates) return { ...hotel.coordinates, zoom: 13 }
  }
  if (selectedCities.value.length > 0) {
    const c = CITY_COORDS[selectedCities.value[0].name]
    if (c) return { ...c, zoom: 12 }
  }
  if (selectedDestinations.value.length > 0) {
    const p = PROVINCE_COORDS[selectedDestinations.value[0]]
    if (p) return { lat: p.lat, lng: p.lng, zoom: p.zoom }
  }
  return null
})

const {
  selectedHotelId,
  hoveredHotelId,
  hoverPosition,
  clearSelection,
} = useFirstReleaseHotelMap()

const selectedHotel = computed(() =>
  mapHotels.value.find((h) => h.id === selectedHotelId.value) ?? null,
)

// Live height (px) of the open mobile bottom-sheet, reported by
// HotelMapMobileCard. Drives the map's upward slide so the panel
// "pushes" the map by exactly its own height (no grey gap).
const cardHeight = ref(0)

const hoveredHotel = computed(() =>
  mapHotels.value.find((h) => h.id === hoveredHotelId.value) ?? null,
)

const mapRef = ref<InstanceType<typeof HotelBrowseMap> | null>(null)

function closeMap() {
  // Close the side panel first so the user-test flow doesn't leave a
  // panel hanging open after navigating away.
  clearSelection()
  if (window.history.length > 1) router.back()
  else router.push(homeHref.value)
}

// Filter sidebar visibility — collapsed by default when the user
// arrived from a deal page (?focus=<slug>) so the map gets the
// full width. The user can re-open it via the floating chip.
const showFilter = ref(!route.query.focus)

// Sync FR nav-bar variant with the user's last homepage pick so the
// SiteHeader on this internal page matches the chosen variant. Reads
// localStorage (or the URL if it matches a known variant path).
onMounted(() => {
  const { restoreFrNavVariant } = useFirstReleaseHomeVariant()
  restoreFrNavVariant(window.location.pathname)

  // Opening the map FROM a hotel/deal page (?focus=<slug>) clears all
  // active filters so the map shows every hotel with no filter pills —
  // the user is exploring around the focused hotel, not continuing a
  // filtered search. (Persisted query stays intact for /search.)
  if (route.query.focus) {
    resetFilters()
  }

  // Deal-page → kaart hand-off: auto-open the sidepanel for the
  // focused hotel so the user lands with both the marker centred AND
  // the arrangements panel slid in.
  if (focusedHotel.value && route.query.open === '1') {
    selectedHotelId.value = focusedHotel.value.id
  }
})
</script>

<template>
  <div class="kaart-page" :class="{ 'kaart-page--no-filter': !showFilter, 'kaart-page--mobile': isMobile }">
    <!-- Floating "show filters" chip — only when the sidebar is
         collapsed (deal-page hand-off via ?focus=<slug>). Desktop only. -->
    <button
      v-if="!showFilter && !isMobile"
      type="button"
      class="kaart-show-filter"
      @click="showFilter = true"
      :aria-label="t('search.filters') || 'Filters'"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="8" y1="12" x2="20" y2="12" />
        <line x1="12" y1="18" x2="20" y2="18" />
      </svg>
      <span>{{ t('search.filters') || 'Filters' }}</span>
    </button>

    <!-- Sticky filter sidebar (left). Stays in place when the side panel
         opens; the map slides under it. Filter content scrolls internally
         when it overflows the viewport height. -->
    <aside v-if="showFilter && !isMobile" class="kaart-filter">
      <!-- Black ViaLuxury wordmark on top of the filter bar — same on
           every nav variant. -->
      <NuxtLink :to="homeHref" class="kaart-filter__logo">
        <img
          src="/images/logos/logo-vialuxury-horizontal-black.svg"
          alt="ViaLuxury"
        />
      </NuxtLink>
      <FirstReleaseSearchFilterPanel
        :budget-min="budgetMin"
        :budget-max="budgetMax"
        :persons="persons"
        :counts="filterCounts"
        @update:budget-min="budgetMin = $event"
        @update:budget-max="budgetMax = $event"
      />
    </aside>

    <!-- Pills float at the top, OUTSIDE the sliding stage so they stay
         visible (sticky) when the panel slides in. Desktop only. -->
    <FirstReleaseFilterPills v-if="!isMobile" class="kaart-pills" mode="map" />

    <main
      class="kaart-stage"
      :class="{
        'kaart-stage--with-panel': !isMobile && !!selectedHotel,
        'kaart-stage--with-card': isMobile && !!selectedHotel,
      }"
      :style="isMobile ? { '--card-h': cardHeight + 'px' } : undefined"
    >
      <ClientOnly>
        <FirstReleaseHotelBrowseMap
          ref="mapRef"
          :hotels="mapHotels"
          :initial-focus="initialFocus"
          :focused-hotel-id="focusedHotel?.id ?? null"
          :disable-hover="isMobile"
        />
      </ClientOnly>

      <!-- Desktop: right-sliding deal panel. Mobile: bottom-sheet card. -->
      <FirstReleaseHotelDealsSidePanel
        v-if="!isMobile"
        :is-open="!!selectedHotel"
        :hotel="selectedHotel"
        :map-mode="true"
        @close="clearSelection"
      />

      <!-- Hover preview — desktop only (no hover on touch). -->
      <FirstReleaseHotelMapHoverCard
        v-if="!isMobile && hoveredHotel"
        :hotel="hoveredHotel"
        :position="hoverPosition"
        :arrival-date="arrivalDate"
        :sold-out="hoveredHotel.soldOut"
        :unmatched="hoveredHotel.unmatched"
      />

      <!-- Desktop close-map button (text). -->
      <button
        v-if="!isMobile"
        type="button"
        class="kaart-close"
        @click="closeMap"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
        <span>Sluit kaart</span>
      </button>

      <FirstReleaseHotelMapZoomControls
        v-if="!isMobile"
        @zoom-in="mapRef?.zoomIn()"
        @zoom-out="mapRef?.zoomOut()"
      />
    </main>

    <!-- ═══════════ MOBILE map chrome ═══════════ -->
    <template v-if="isMobile">
      <!-- Top-left: close-map (icon). -->
      <button type="button" class="kaart-m-close" :aria-label="t('common.close')" @click="closeMap">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <!-- Top-right: Filters (opens the full-screen filter modal). -->
      <button type="button" class="kaart-m-filter" @click="mobileFilterOpen = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="12" y1="18" x2="20" y2="18" />
        </svg>
        <span>{{ t('search.filters') || 'Filters' }}</span>
      </button>

      <!-- Bottom sheet: hotel info + horizontal deal carousel. Emits
           its live height so the map slides up by exactly that much. -->
      <HotelMapMobileCard
        :is-open="!!selectedHotel"
        :hotel="selectedHotel"
        @close="clearSelection"
        @height="cardHeight = $event"
      />

      <!-- Full-screen filters modal (same component as /search). -->
      <FilterSubpage
        :open="mobileFilterOpen"
        :budget-min="budgetMin"
        :budget-max="budgetMax"
        :persons="persons"
        :result-count="mapHotels.length"
        :counts="filterCounts"
        @close="mobileFilterOpen = false"
        @apply="mobileFilterOpen = false"
        @clear="resetFilters"
        @update:budget-min="budgetMin = $event"
        @update:budget-max="budgetMax = $event"
      />
    </template>
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

/* Black ViaLuxury wordmark mounted at the top of the filter sidebar. */
.kaart-filter__logo {
  display: block;
  padding: var(--space-lg) var(--space-lg) 0;
}
.kaart-filter__logo img {
  width: 200px;
  height: auto;
  display: block;
}

/* Drop the FilterPanel's outer card border on the kaart sidebar so the
   horizontal line that read as a stroke "under the logo" disappears.
   `:deep()` is needed because `.filter-panel` lives inside the child
   component's scoped CSS. */
.kaart-filter :deep(.filter-panel) {
  border: none;
  border-radius: 0;
}

/* "Show filters" chip — only rendered when the sidebar is
   collapsed (deal-page hand-off). Floats top-left over the map. */
.kaart-show-filter {
  position: absolute;
  top: var(--space-md);
  left: var(--space-md);
  z-index: 701;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.kaart-show-filter:hover {
  background: var(--color-background-secondary);
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

/* Collapsed-filter layout: stage spans the full width, pills shift
   left to clear only the show-filters chip. */
.kaart-page--no-filter .kaart-stage {
  left: 0;
}
.kaart-page--no-filter .kaart-pills {
  /* 16 px page padding + ~120 px chip + 16 px gap. */
  left: calc(var(--space-md) + 120px + var(--space-md));
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
/* "Verwijder filters" chip on the map uses the same pill style as on
   /search; no kaart-specific override needed. */

.kaart-close {
  position: fixed;
  top: var(--space-lg);
  right: var(--space-lg);
  /* Above the side panel (z-index: 1000) so it stays clickable when the
     panel is open — clicking it closes the panel and the map together. */
  z-index: 1100;
  height: 40px;
  padding: 0 var(--space-md);
  background: #000;
  border: 0;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-card);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #fff;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
}

.kaart-close:hover {
  background: #1a1a1a;
}

/* ═══════════ MOBILE map ═══════════ */
/* Full-screen map — no filter sidebar; the stage spans the whole
   viewport. */
.kaart-page--mobile .kaart-stage {
  left: 0;
}
/* When the bottom-sheet opens, slide the map UP by EXACTLY the
   sheet's height (`--card-h`, measured + reported by the card). The
   sheet covers the equal-height area it vacates at the bottom, so
   the map and panel move as one — no grey gap (mirrors the desktop
   slide-left). `--card-h` is 0 when closed → no translate. */
.kaart-page--mobile .kaart-stage--with-card {
  transform: translateY(calc(-1 * var(--card-h, 0px)));
}

/* Kill the desktop-chrome flash on mobile: `isMobile` is false
   during SSR/first paint, so the desktop filter sidebar (and pills /
   close button) would render for a frame before hydration flips
   `isMobile` true. Hide them on small viewports via a media query
   (independent of the JS flag) and force the map full-width, so the
   first paint is already the clean full-screen map. */
@media (max-width: 800px) {
  .kaart-filter,
  .kaart-pills,
  .kaart-close,
  .kaart-show-filter {
    display: none !important;
  }
  .kaart-stage {
    left: 0;
  }
}

/* Top-LEFT Filters button — black pill, same style as the mobile
   /search toolbar buttons. */
.kaart-m-filter {
  position: fixed;
  top: calc(var(--space-md) + env(safe-area-inset-top, 0));
  left: var(--space-md);
  z-index: 1100;
  height: 48px;
  padding: 8px 16px;
  border-radius: 10px;
  border: 0;
  background: #000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 400;
  color: #fff;
  cursor: pointer;
}
.kaart-m-filter svg { stroke: #fff; }
.kaart-m-filter:hover { background: #1f1f1f; }

/* Top-RIGHT close-map icon button (white circle). */
.kaart-m-close {
  position: fixed;
  top: calc(var(--space-md) + env(safe-area-inset-top, 0));
  right: var(--space-md);
  z-index: 1100;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 0;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-primary);
  cursor: pointer;
}
</style>
