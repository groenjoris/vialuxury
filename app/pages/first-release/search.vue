<template>
  <div class="search-page">
    <FirstReleaseSiteHeader />

    <main class="search-page__main">
      <!-- Breadcrumbs -->
      <section class="search-page__breadcrumbs container">
        <FirstReleaseBreadcrumbNav :items="breadcrumbs" />
      </section>

      <!-- Grid: Filter Sidebar + Results -->
      <div class="search-page__grid container" :class="{ 'search-page__grid--no-sidebar': !showFilters }">
        <Transition name="sidebar-slide">
          <div v-if="showFilters" class="search-page__sidebar" ref="sidebarRef">
            <!-- Map preview (fake door) at the top of sidebar -->
            <FirstReleaseMapPreviewCard class="search-page__map-preview" @click="handleMapClick" />
            <FirstReleaseSearchFilterPanel
              :budget-min="budgetMin"
              :budget-max="budgetMax"
              :persons="persons"
              :counts="filterCounts"
              hideable
              @update:budget-min="budgetMin = $event"
              @update:budget-max="budgetMax = $event"
              @hide="showFilters = false"
            />
            <!-- Sentinel: when this scrolls past the top of the
                 viewport, swap the regular sidebar for the compact
                 sticky version above. -->
            <div ref="filterSentinelRef" class="search-page__filter-sentinel" aria-hidden="true" />
          </div>
        </Transition>

        <!-- Compact sticky filter (only on /search). Shown when the
             main sidebar's bottom sentinel has scrolled past the top
             of the viewport. Limited to Arrangement / Thema / Reisduur
             — no Totaalprijs, no Specials, no "Verberg filter" button. -->
        <Transition name="sticky-filter-fade">
          <FirstReleaseSearchFilterPanel
            v-if="showFilters && stickyFilterVisible"
            class="search-page__sticky-filter"
            :budget-min="budgetMin"
            :budget-max="budgetMax"
            :persons="persons"
            :counts="filterCounts"
            compact
            @update:budget-min="budgetMin = $event"
            @update:budget-max="budgetMax = $event"
          />
        </Transition>

        <div class="search-page__results">
          <!-- Reserved zone above the result cards. Its min-height equals
               the map preview's height + bottom margin, so the toolbar's
               bottom border (= grey divider) lands at the same Y as the
               filter panel's top on the left. Filter pills wrap inside
               the toolbar; they fill the empty space without pushing the
               cards down. Only when pills overflow the zone does it grow
               and push the cards down. -->
          <div class="search-page__above-cards">
          <!-- Header inside results column for alignment -->
          <div class="search-page__header">
            <div class="search-page__header-row">
              <div class="search-page__header-text">
                <h1 v-if="hasNoResults" class="search-page__title search-page__title--no-results">
                  {{
                    noResultsReason === 'date-only'
                      ? 'Geen deals gevonden bij jouw aankomstdatum'
                      : 'Geen deals gevonden die voldoen aan je wensen'
                  }}
                </h1>
                <h1 v-else-if="singleThemeTagId" :key="`themed-${singleThemeTagId}`" class="search-page__title">
                  {{ themedTitleText }}
                </h1>
                <h1 v-else class="search-page__title">{{ totalDeals }} {{ t('search.deals') }}</h1>
                <!-- "Laat alle deals zien" secondary button — only when no
                     results so the user can wipe filters in one click. -->
                <button
                  v-if="hasNoResults"
                  type="button"
                  class="search-page__reset-link"
                  @click="resetFilters"
                >
                  Laat alle deals zien
                </button>
                <!-- USP + team-avatars hidden in the no-results state — they
                     read as celebratory content that doesn't fit the empty
                     state. -->
                <template v-if="!hasNoResults">
                <!-- :key forces the clip-path animation to replay when the
                     themed subtitle text swaps (e.g. user picks another
                     theme without leaving the page). -->
                <p
                  class="search-page__usp"
                  :key="singleThemeTagId ? `themed-sub-${singleThemeTagId}` : 'default-sub'"
                >{{ singleThemeTagId ? themedSubtitle : t('search.usp') }}</p>
                <!-- Avatars moved beneath the subtitle. -->
                <div class="team-avatars">
                  <div
                    v-for="member in teamMembers"
                    :key="member.name"
                    class="team-avatars__item"
                    @mouseenter="hoveredMember = member.name"
                    @mouseleave="hoveredMember = null"
                  >
                    <div class="team-avatars__circle" :class="{ 'team-avatars__circle--photo': member.photo }">
                      <img v-if="member.photo" :src="member.photo" :alt="member.name" />
                      <span v-else class="team-avatars__initials">{{ member.initials }}</span>
                    </div>
                    <Transition name="tooltip-fade">
                      <div v-if="hoveredMember === member.name" class="team-avatars__tooltip">
                        <strong class="team-avatars__tooltip-name">{{ member.name }}</strong>
                        <span class="team-avatars__tooltip-role">{{ member.role }}</span>
                        <span class="team-avatars__tooltip-score">{{ member.score }}</span>
                      </div>
                    </Transition>
                  </div>
                </div>
                </template>
              </div>

              <!-- Right column: Trustpilot logo + count of reviews,
                   replacing the team-avatars that lived here before. -->
              <div class="search-trust">
                <img src="/images/trustpilot.svg" alt="Trustpilot" class="search-trust__logo" />
                <span class="search-trust__text">15.294 beoordelingen</span>
              </div>
            </div>
          </div>

          <!-- Toolbar: filter toggle, sort, view switch -->
          <div class="search-toolbar">
            <div class="search-toolbar__left">
              <!-- Map button: only when filter hidden on desktop (sidebar map is otherwise visible) -->
              <button
                v-if="!showFilters && !isMobile"
                type="button"
                class="search-toolbar__map-btn"
                @click="handleMapClick"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {{ t('search.viewOnMap') }}
              </button>
              <button
                v-if="isMobile || !showFilters"
                class="search-toolbar__filter-toggle"
                @click="handleFilterButtonClick"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="8" y1="12" x2="20" y2="12" />
                  <line x1="12" y1="18" x2="20" y2="18" />
                </svg>
                <span v-if="isMobile">{{ t('search.filters') }}</span>
                <span v-else>{{ t('search.showFilters') }}</span>
              </button>
            </div>

            <!-- Filter pills — sit in the toolbar between the left
                 buttons and the sort/view group, bottom-aligned with
                 the Sort button (toolbar uses align-items: flex-end).
                 When no filter is picked, FilterPills' own
                 `.filter-pills--empty { display: none }` collapses the
                 wrapper to zero so the toolbar stays its natural
                 small height. -->
            <FirstReleaseFilterPills class="search-toolbar__pills" />

            <div class="search-toolbar__right">
              <!-- Sort dropdown -->
              <div class="search-toolbar__sort" ref="sortRef">
                <button class="search-toolbar__sort-btn" @click="sortOpen = !sortOpen">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 5h10M11 9h7M11 13h4M3 17l4 4 4-4M7 3v18" />
                  </svg>
                  {{ t('search.sort') }}
                  <svg class="search-toolbar__sort-chevron" :class="{ 'search-toolbar__sort-chevron--open': sortOpen }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <Transition name="dropdown-fade">
                  <div v-if="sortOpen" class="search-toolbar__sort-dropdown">
                    <button
                      v-for="option in sortOptions"
                      :key="option.value"
                      class="search-toolbar__sort-option"
                      :class="{ 'search-toolbar__sort-option--active': sortBy === option.value }"
                      @click="sortBy = option.value; sortOpen = false"
                    >
                      {{ option.label }}
                    </button>
                  </div>
                </Transition>
              </div>

              <!-- View toggle -->
              <div class="search-toolbar__view-toggle">
                <button
                  class="search-toolbar__view-btn"
                  :class="{ 'search-toolbar__view-btn--active': viewMode === 'list' }"
                  :aria-label="t('search.listView')"
                  @click="viewMode = 'list'"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </button>
                <button
                  class="search-toolbar__view-btn"
                  :class="{ 'search-toolbar__view-btn--active': viewMode === 'grid' }"
                  :aria-label="t('search.gridView')"
                  @click="viewMode = 'grid'"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          </div><!-- /.search-page__above-cards -->

          <!-- Loading overlay -->
          <Transition name="fade">
            <div v-if="searchLoading" class="search-page__loading">
              <div class="search-page__spinner"></div>
            </div>
          </Transition>

          <!-- Results: list or grid -->
          <div
            v-if="!searchLoading && displayedDeals.length > 0"
            class="search-page__result-list"
            :class="{
              'search-page__result-list--grid': effectiveViewMode === 'grid',
              'search-page__result-list--grid-3': effectiveViewMode === 'grid' && !showFilters,
              'search-page__result-list--list-wide': effectiveViewMode === 'list' && !showFilters,
            }"
          >
            <FirstReleaseDealCard
              v-for="row in displayedDeals"
              :key="row.deal.id"
              :hotel="row.hotel"
              :deal="row.deal"
              :sibling-count="row.siblings.length"
              :grid-mode="effectiveViewMode === 'grid'"
              :wide="!showFilters"
              :unavailable="row._unavailable"
              @view-siblings="openDealPanel(row.hotel)"
            />
          </div>

          <!-- Empty state: nothing matches the active filters. Friendly
               illustration + "Bekijk alle deals" link that wipes every
               active filter and brings the full result set back. -->
          <!-- No-results state: title + reset moved into the page header
               above; here we just surface the suggestion title + grid
               directly below the toolbar's grey divider (no extra divider
               of our own). -->
          <div v-else-if="!searchLoading && suggestionDeals.length > 0" class="search-page__no-results-suggestions">
            <h3 class="search-page__no-results-suggest-title">
              {{
                noResultsReason === 'date-only'
                  ? 'Deze deals zijn beschikbaar op andere datums'
                  : 'Deze deals zijn ook heel bijzonder'
              }}
            </h3>
            <div class="search-page__no-results-suggest-grid">
              <FirstReleaseDealCard
                v-for="entry in suggestionDeals"
                :key="entry.deal.id"
                :deal="entry.deal"
                :hotel="entry.hotel"
                grid-mode
              />
            </div>
          </div>
        </div>
      </div>
    </main>

    <FirstReleaseSiteFooter />

    <!-- Deals side panel -->
    <!-- Mobile filter subpage -->
    <FirstReleaseFilterSubpage
      :open="mobileFilterOpen"
      :budget-min="budgetMin"
      :budget-max="budgetMax"
      :persons="persons"
      :result-count="sortedHotels.length"
      @close="mobileFilterOpen = false"
      @apply="mobileFilterOpen = false"
      @clear="resetFilters"
      @update:budget-min="budgetMin = $event"
      @update:budget-max="budgetMax = $event"
    />

    <FirstReleaseHotelDealsSidePanel
      :is-open="panelOpen"
      :hotel="activePanelHotel"
      @close="panelOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { SearchHotel } from '~/types/searchHotel'
import { searchHotels } from '~/data/mock/search-hotels'
import { dealMatchesAllTags, getFilterTag } from '~/utils-first-release/filterTags'
import FilterPills from '~/components-first-release/search/FilterPills.vue'
import { isDealAvailableInWindow } from '~/utils-first-release/availability'
import { adjustPrice } from '~/utils-first-release/priceFormula'
import { hotelMatchesDestination, hasActiveDestinationFilter } from '~/utils-first-release/destinationMatch'
import { computeFilterCounts } from '~/utils-first-release/filterCounts'

const { t } = useFirstReleaseI18n()
const {
  loading, setLoading, persons, rooms, selectedNights,
  selectedFilterTags,
  selectedDestinations, selectedCities, selectedHotels,
  committedArrivalDate, committedFlexibility,
} = useFirstReleaseSearchState()

// Team members for avatar row
const hoveredMember = ref<string | null>(null)
import { teamMembers } from '~/data/team-members'

// Loading state — local override so we can briefly show a spinner on filter changes
const localLoading = ref(false)
const searchLoading = computed(() => loading.value || localLoading.value)

// Clear loading on mount (handles navigation arriving with loading=true)
onMounted(() => {
  if (loading.value) setLoading(false)
})

// Auto-clear after a tick when loading flips to true, so the spinner doesn't get stuck
watch(loading, (val) => {
  if (val) Promise.resolve().then(() => setLoading(false))
})

// Show a brief spinner + scroll the deal list back to the top whenever ANY
// filter option changes (mimics network latency and brings new results into
// view if the user had scrolled down).
let loaderTimer: ReturnType<typeof setTimeout> | null = null
function onFilterChange() {
  localLoading.value = true
  if (loaderTimer) clearTimeout(loaderTimer)
  loaderTimer = setTimeout(() => { localLoading.value = false }, 350)
  // Scroll the toolbar into view (cards sit just below it). Only if the
  // user has scrolled past the toolbar — no animation when already at top.
  if (import.meta.client) {
    nextTick(() => {
      const el = document.querySelector('.search-page__above-cards') as HTMLElement | null
      if (!el) return
      const elTop = el.getBoundingClientRect().top + window.scrollY
      if (window.scrollY > elTop + 4) {
        window.scrollTo({ top: elTop, behavior: 'smooth' })
      }
    })
  }
}
// Budget refs (sharedBudgetMin/Max) are declared further down, so they're
// added to the watch source via a separate watcher block below.
watch(() => [
  [...selectedNights.value],
  [...selectedFilterTags.value],
  [...selectedDestinations.value],
  [...selectedCities.value],
  [...selectedHotels.value],
  committedArrivalDate.value,
  committedFlexibility.value,
  persons.value,
  rooms.value,
], onFilterChange, { deep: true })

const breadcrumbs = computed(() => [
  { label: t('search.home'), href: '/' },
  { label: t('search.arrangements'), href: '/first-release/search' },
])

const totalDeals = computed(() => {
  return sortedHotels.value.reduce((sum, hotel) => sum + hotel.deals.length, 0)
})

// View mode & filter state
const viewMode = ref<'list' | 'grid'>('grid')

// Force grid mode on mobile (list view would be too cramped)
const isMobile = useFirstReleaseIsMobile()
const effectiveViewMode = computed<'list' | 'grid'>(() => (isMobile.value ? 'grid' : viewMode.value))
const showFilters = ref(true)   /* Default: filter sidebar visible on /search */

/* Sticky compact filter — appears once the regular sidebar has
   scrolled past the top of the viewport. */
const sidebarRef = ref<HTMLElement | null>(null)
const filterSentinelRef = ref<HTMLElement | null>(null)
const stickyFilterVisible = ref(false)
let filterObserver: IntersectionObserver | null = null

onMounted(() => {
  if (!import.meta.client) return
  if (!filterSentinelRef.value) return
  filterObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (!entry) return
      // Sentinel goes ABOVE the viewport when user has scrolled past
      // the main filter. `boundingClientRect.top < 0` confirms it's
      // out-of-view (not just initially hidden below the fold).
      const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0
      stickyFilterVisible.value = scrolledPast
    },
    { threshold: 0 }
  )
  filterObserver.observe(filterSentinelRef.value)
})

onUnmounted(() => {
  filterObserver?.disconnect()
  filterObserver = null
})

// Budget range — shared with /kaart via useFirstReleaseSearchState so toggling between
// list and map view preserves the user's filter selection.
const {
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
// Writable computed acts as a ref alias so existing v-model / `.value =`
// usage in this file still works.
const budgetMin = computed({
  get: () => sharedBudgetMin.value,
  set: (v: number) => setBudgetMin(v),
})
const budgetMax = computed({
  get: () => sharedBudgetMax.value,
  set: (v: number) => setBudgetMax(v),
})

// Budget slider also triggers the loader + scroll. Debounced via the same
// 350 ms timer that lives inside onFilterChange so rapid dragging doesn't
// thrash the spinner.
watch(() => [sharedBudgetMin.value, sharedBudgetMax.value], onFilterChange)

// Mobile filter modal
const mobileFilterOpen = ref(false)

function handleMapClick() {
  navigateTo('/first-release/kaart')
}

function handleFilterButtonClick() {
  if (isMobile.value) {
    mobileFilterOpen.value = true
  } else {
    showFilters.value = !showFilters.value
  }
}

function resetFilters() {
  // Used by the mobile filter subpage AND the no-results "Laat alle deals
  // zien" link — wipes every active selection so the result list goes back
  // to the full set. Persons/rooms stay (they're a price-formula global,
  // not a filter).
  resetBudget()
  clearArrivalDate()
  clearDuration()
  clearFilterTags()
  clearDestinations()
}

/* ─── No-results state (suggestions + reasoned copy) ─────────────
 *  When the active filter set returns 0 hotels we show one of two
 *  empty banners:
 *    - "Geen deals gevonden bij jouw aankomstdatum"  ← arrival date
 *      is the ONLY blocker (everything else still matches deals).
 *    - "Geen deals gevonden die voldoen aan je wensen" ← filters
 *      (alone or combined with the date) are blocking.
 *  Below the banner we surface 3 suggestion cards.
 */

/** Same filtering as `filteredHotels`, but the arrival-date constraint
 *  is skipped. Lets us detect "only the date was the blocker" cases
 *  AND surface relevant suggestions ("Deze deals zijn beschikbaar op
 *  andere datums"). */
const filteredHotelsIgnoringDate = computed(() => {
  const nightsActive = selectedNights.value.length > 0
  const p = persons.value
  const destFilter = {
    destinations: [...selectedDestinations.value],
    cities: [...selectedCities.value],
    hotels: [...selectedHotels.value],
  }
  const pickedThemes: string[] = []
  const pickedOther: string[] = []
  for (const id of selectedFilterTags.value) {
    const tag = getFilterTag(id)
    if (tag?.category === 'thema') pickedThemes.push(id)
    else pickedOther.push(id)
  }
  const destActive = hasActiveDestinationFilter(destFilter)
  const themesActive = pickedThemes.length > 0

  const out = []
  for (const hotel of searchHotels) {
    const matchingDeals = hotel.deals.filter((d) => {
      const priceForPersons = adjustPrice(d.basePrice, p)
      if (priceForPersons < budgetMin.value || priceForPersons > budgetMax.value) return false
      if (nightsActive) {
        const nightKey = d.nights >= 5 ? '5+' : String(d.nights)
        if (!selectedNights.value.includes(nightKey)) return false
      }
      if (!dealMatchesAllTags(d, hotel, pickedOther)) return false
      if (destActive && !hotelMatchesDestination(hotel, destFilter)) return false
      if (themesActive) {
        let themeOk = false
        for (const id of pickedThemes) {
          const tag = getFilterTag(id)
          if (tag?.matches(d, hotel)) { themeOk = true; break }
        }
        if (!themeOk) return false
      }
      return true
    })
    if (matchingDeals.length > 0) {
      out.push({ ...hotel, deals: matchingDeals })
    }
  }
  return out
})

/** True when the current filter combination yields zero deal cards. */
const hasNoResults = computed(() => displayedDeals.value.length === 0)

/* ─── Themed title (single-tag mode) ─────────────────────────────
 *  When the user arrives via a single filter-tag click (homepage
 *  theme chip / destination-popup theme chip) and NO other filter
 *  is active, the page header swaps to a tag-specific title +
 *  handwritten subtitle. Any other filter (date, nights, budget,
 *  destination, extra tag) returns the default "x arrangementen"
 *  / "Samengesteld door …" header.
 */
const THEME_TITLES: Record<string, { title: string; subtitle: string }> = {
  wellness:        { title: 'Beste wellness hotels',     subtitle: 'Onze selectie van de beste hotels met wellness' },
  'jacuzzi-room':  { title: 'Bubbelbad op de kamer',     subtitle: 'Onze selectie van de beste deals van luxe hotels met een bubbelbad op de kamer' },
  pool:            { title: 'Met zwembad',                subtitle: 'Onze selectie van de beste deals voor een hotel met zwembad' },
  'with-dinner':   { title: 'Met diner',                  subtitle: 'Onze selectie van de beste deals van luxe hotels inclusief diner' },
  'dog-friendly':  { title: 'Hond mee',                   subtitle: 'Onze selectie van de beste deals waar je hond mee kan' },
  'aan-zee':       { title: 'Luxe hotels aan zee',        subtitle: 'Boek snel voor de mooiste kamers en de beste beschikbaarheid' },
  natuur:          { title: 'Hotels in de natuur',        subtitle: 'Onze selectie van de mooiste hotels in de natuur.' },
  culinair:        { title: 'Culinair genieten',          subtitle: 'Onze selectie van de beste deals van luxe hotels met top restaurants' },
  fiets:           { title: 'Fietsarrangement',           subtitle: 'Onze selectie van luxe hotels met fietsarrangement' },
  steden:          { title: 'Luxe stedentrips',           subtitle: 'Onze selectie van de beste deals van luxe stedentrips' },
  kasteel:         { title: 'Kastelen en landgoederen',   subtitle: 'Onze selectie van de beste deals van kasteel en landgoed overnachtingen' },
  'unique-stay':   { title: 'Bijzondere overnachtingen',  subtitle: 'Exclusief bij ViaLuxury' },
  'five-star':     { title: '5-sterren luxe',             subtitle: 'Onze selectie van de beste deals van luxe hotels met 5 sterren' },
  'new-hotels':    { title: 'Nieuwe hotels',              subtitle: 'Onze selectie van de nieuwste luxe hoteldeals' },
  'best-price':    { title: 'Super Deals',                subtitle: 'De leukste hotelarrangementen voor een spotprijsje!' },
}

/** The single active tag id when no other filter is set; null
 *  otherwise. Drives whether the themed title takes over. */
const singleThemeTagId = computed<string | null>(() => {
  if (selectedFilterTags.value.length !== 1) return null
  if (selectedNights.value.length > 0) return null
  if (committedArrivalDate.value) return null
  if (selectedDestinations.value.length > 0) return null
  if (selectedCities.value.length > 0) return null
  if (selectedHotels.value.length > 0) return null
  // Budget at its untouched default range (100..2000 from
  // useFirstReleaseSearchState.resetBudget()).
  if (budgetMin.value !== 100 || budgetMax.value !== 2000) return null
  const id = selectedFilterTags.value[0]
  return THEME_TITLES[id] ? id : null
})

/** Title string rendered when a themed view is active. Most themes
 *  read "[Name] (X deals)"; `best-price` flips that to "X Super
 *  Deals" per the copy deck. */
const themedTitleText = computed(() => {
  const id = singleThemeTagId.value
  if (!id) return ''
  const entry = THEME_TITLES[id]
  if (id === 'best-price') return `${totalDeals.value} ${entry.title}`
  return `${entry.title} (${totalDeals.value} deals)`
})

/** Subtitle for the themed view — rendered in the handwritten font. */
const themedSubtitle = computed(() => {
  const id = singleThemeTagId.value
  return id ? THEME_TITLES[id].subtitle : ''
})

/** 'date-only'  → only the arrival date was the blocker.
 *  'filters'    → other filters (alone or combined with date). */
const noResultsReason = computed<'date-only' | 'filters'>(() => {
  if (committedArrivalDate.value && filteredHotelsIgnoringDate.value.length > 0) {
    return 'date-only'
  }
  return 'filters'
})

/** Up to 3 suggestion deals.
 *  - In `date-only` mode: from filteredHotelsIgnoringDate (deals that
 *    only fail the date filter — bookable on OTHER dates).
 *  - In `filters` mode: cheapest deals across all hotels, as a "ook
 *    heel bijzonder" curated set.
 */
const suggestionDeals = computed(() => {
  const out: Array<{ hotel: typeof searchHotels[0]; deal: typeof searchHotels[0]['deals'][0] }> = []
  if (noResultsReason.value === 'date-only') {
    for (const h of filteredHotelsIgnoringDate.value) {
      const cheapest = [...h.deals].sort((a, b) => a.basePrice - b.basePrice)[0]
      if (cheapest) out.push({ hotel: h, deal: cheapest })
      if (out.length >= 3) break
    }
  } else {
    // Across all hotels — pick the cheapest deal per hotel, then take top 3.
    const ranked = searchHotels
      .map((h) => {
        const cheapest = [...h.deals].sort((a, b) => a.basePrice - b.basePrice)[0]
        return cheapest ? { hotel: h, deal: cheapest } : null
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => a.deal.basePrice - b.deal.basePrice)
    for (const entry of ranked.slice(0, 3)) out.push(entry)
  }
  return out
})

// Sort
const sortOpen = ref(false)
const sortBy = ref<'recommended' | 'priceLow' | 'priceHigh' | 'ratingHigh' | 'ratingLow'>('recommended')
const sortRef = ref<HTMLElement | null>(null)

const sortOptions = computed(() => [
  { value: 'recommended' as const, label: t('search.sort.recommended') },
  { value: 'priceLow' as const, label: t('search.sort.priceLow') },
  { value: 'priceHigh' as const, label: t('search.sort.priceHigh') },
  { value: 'ratingHigh' as const, label: t('search.sort.ratingHigh') },
  { value: 'ratingLow' as const, label: t('search.sort.ratingLow') },
])

/** Per-filter-item deal counts shown as `(N)` in the panel. Recomputes
 *  whenever budget / persons / arrival / destinations / tag picks
 *  change. Budget + arrival + destination always apply; the tag/night
 *  override logic lives inside the util. */
const filterCounts = computed(() => {
  const p = persons.value
  const flex = committedFlexibility.value
  const arrival = committedArrivalDate.value
  const destFilter = {
    destinations: [...selectedDestinations.value],
    cities: [...selectedCities.value],
    hotels: [...selectedHotels.value],
  }
  const destActive = hasActiveDestinationFilter(destFilter)
  return computeFilterCounts({
    hotels: searchHotels,
    inBudget: (d) => {
      const price = adjustPrice(d.basePrice, p)
      return price >= budgetMin.value && price <= budgetMax.value
    },
    isAvailableOnDate: arrival ? (d) => isDealAvailableInWindow(d.id, arrival, flex) : undefined,
    matchesDestination: destActive ? (h) => hotelMatchesDestination(h, destFilter) : undefined,
    selectedNights: selectedNights.value,
    selectedTagIds: selectedFilterTags.value,
  })
})

// Filtered hotels — applies budget, nights, arrangement, and destination filters.
// A hotel only matches if it has at least one deal that satisfies budget +
// nights + arrangement (deal-level filters), AND the hotel itself satisfies
// the destination filter (hotel-level). The hotel's deals[] is pruned to
// the matching set so the side panel only shows relevant packages.
const filteredHotels = computed(() => {
  const nightsActive = selectedNights.value.length > 0
  const arrivalActive = !!committedArrivalDate.value
  const flex = committedFlexibility.value
  const p = persons.value
  const destFilter = {
    destinations: [...selectedDestinations.value],
    cities: [...selectedCities.value],
    hotels: [...selectedHotels.value],
  }

  // Split picked tags by category. Themes are OR'd among themselves but
  // AND'd with the destination filter (e.g. "stedentrip + Drenthe" = only
  // city-trips in Drenthe; "stedentrip + romantisch + Drenthe" = either
  // stedentrip OR romantisch, in Drenthe). Arrangement + specials stay
  // AND-gated as before.
  const pickedThemes: string[] = []
  const pickedOther: string[] = []
  for (const id of selectedFilterTags.value) {
    const tag = getFilterTag(id)
    if (tag?.category === 'thema') pickedThemes.push(id)
    else pickedOther.push(id)
  }

  const destActive = hasActiveDestinationFilter(destFilter)
  const themesActive = pickedThemes.length > 0

  const out = []
  for (const hotel of searchHotels) {
    const matchingDeals = hotel.deals.filter((d) => {
      // Budget compares against the price for the CURRENT person count.
      const priceForPersons = adjustPrice(d.basePrice, p)
      if (priceForPersons < budgetMin.value || priceForPersons > budgetMax.value) return false
      if (nightsActive) {
        const nightKey = d.nights >= 5 ? '5+' : String(d.nights)
        if (!selectedNights.value.includes(nightKey)) return false
      }
      // Non-thema tag filters (arrangement + specials) — still AND-gated.
      if (!dealMatchesAllTags(d, hotel, pickedOther)) return false
      // Arrival-date filter — deal must have at least one available date in
      // the flex window around the chosen date.
      if (arrivalActive && !isDealAvailableInWindow(d.id, committedArrivalDate.value!, flex)) return false
      // Destination is AND-gated when active.
      if (destActive && !hotelMatchesDestination(hotel, destFilter)) return false
      // Themes are OR'd among themselves and AND'd with the destination.
      if (themesActive) {
        let themeOk = false
        for (const id of pickedThemes) {
          const tag = getFilterTag(id)
          if (tag?.matches(d, hotel)) { themeOk = true; break }
        }
        if (!themeOk) return false
      }
      return true
    })
    if (matchingDeals.length > 0) {
      out.push({ ...hotel, deals: matchingDeals })
    }
  }
  return out
})

const sortedHotels = computed(() => {
  const hotels = [...filteredHotels.value]
  switch (sortBy.value) {
    case 'priceLow':
      return hotels.sort((a, b) => Math.min(...a.deals.map(d => d.basePrice)) - Math.min(...b.deals.map(d => d.basePrice)))
    case 'priceHigh':
      return hotels.sort((a, b) => Math.min(...b.deals.map(d => d.basePrice)) - Math.min(...a.deals.map(d => d.basePrice)))
    case 'ratingHigh':
      return hotels.sort((a, b) => b.starRating - a.starRating)
    case 'ratingLow':
      return hotels.sort((a, b) => a.starRating - b.starRating)
    default:
      return hotels
  }
})

// Pin the originating deal at the top when arriving from /deal/<slug> via the
// search-bar's "Vind deals" button. The query is `?from=<deal-permalink>`.
const route = useRoute()
const pinnedFromSlug = computed(() => {
  const q = route.query.from
  return typeof q === 'string' ? q : null
})

/** Hotel that owns the from-deal (regardless of current filters). */
const pinnedHotel = computed(() => {
  const slug = pinnedFromSlug.value
  if (!slug) return null
  for (const h of searchHotels) {
    if (h.deals.some(d => d.slug === slug)) return h
  }
  return null
})

/** True when the from-deal still matches the current filters. */
const pinnedAvailable = computed(() => {
  const slug = pinnedFromSlug.value
  const hotel = pinnedHotel.value
  if (!slug || !hotel) return true
  const filtered = filteredHotels.value.find(h => h.id === hotel.id)
  if (!filtered) return false
  return filtered.deals.some(d => d.slug === slug)
})

/** Final list shown in the grid: pinned hotel first (always), then the rest. */
const displayedHotels = computed(() => {
  const pinned = pinnedHotel.value
  if (!pinned) return sortedHotels.value
  // Use the unfiltered hotel record so its image / pitch render even when
  // unavailable; mark it via a sentinel so the card knows.
  const rest = sortedHotels.value.filter(h => h.id !== pinned.id)
  const unavailable = !pinnedAvailable.value
  return [{ ...pinned, _pinned: true, _unavailable: unavailable } as SearchHotel & { _pinned: true; _unavailable: boolean }, ...rest]
})

/** Stable per-session seed so the "Aanbevolen" shuffle stays consistent
 *  while the user navigates around. Re-rolled on full page reload. */
const recommendedSeed = Math.floor(Math.random() * 2 ** 31)

/** Tiny seeded PRNG (mulberry32) — deterministic given the seed above. */
function seededRng(seed: number) {
  let t = seed >>> 0
  return () => {
    t = (t + 0x6D2B79F5) >>> 0
    let r = t
    r = Math.imul(r ^ (r >>> 15), r | 1)
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

/** One row PER DEAL — bundling disabled: every deal renders as its own
 *  card. The "Bekijk alle X arrangementen" sibling bar is suppressed by
 *  passing `sibling-count: 0`. The hotel-detail side panel code is kept
 *  intact in case we re-enable bundling later (still wired on kaart).
 *
 *  When sortBy === 'recommended': deals are interleaved via round-robin
 *  across hotels (hotel order itself shuffled) so the same hotel does
 *  NOT appear in adjacent cards (as long as #hotels > 1). The pinned
 *  hotel's pinned-from deal is always kept at index 0. */
const displayedDeals = computed(() => {
  type Row = { hotel: SearchHotel; deal: SearchHotelDeal; siblings: SearchHotelDeal[]; _unavailable: boolean }

  // First: build per-hotel deal lists, honouring pinned-from ordering.
  const perHotel: Array<{ hotel: SearchHotel; deals: SearchHotelDeal[]; unavailable: boolean; pinnedFirst: boolean }> = []
  for (const hotel of displayedHotels.value) {
    const fromSlug = pinnedHotel.value && hotel.id === pinnedHotel.value.id ? pinnedFromSlug.value : null
    const unavailable = (hotel as { _unavailable?: boolean })._unavailable === true
    const deals = hotel.deals.slice()
    if (fromSlug) {
      const idx = deals.findIndex(d => d.slug === fromSlug)
      if (idx > 0) {
        const [pinnedDeal] = deals.splice(idx, 1)
        if (pinnedDeal) deals.unshift(pinnedDeal)
      }
    }
    perHotel.push({ hotel, deals, unavailable, pinnedFirst: !!fromSlug })
  }

  const rows: Row[] = []

  if (sortBy.value === 'recommended') {
    // Pop the pinned hotel (if any) so we can keep its first deal at idx 0.
    const pinnedIdx = perHotel.findIndex(h => h.pinnedFirst)
    let pinnedFirstRow: Row | null = null
    let pinnedRest: Row[] = []
    if (pinnedIdx >= 0) {
      const [p] = perHotel.splice(pinnedIdx, 1)
      if (p && p.deals.length) {
        const [first, ...rest] = p.deals
        if (first) {
          pinnedFirstRow = {
            hotel: p.hotel,
            deal: first,
            siblings: [],
            _unavailable: p.unavailable,
          }
        }
        pinnedRest = rest.map(d => ({ hotel: p.hotel, deal: d, siblings: [], _unavailable: false }))
      }
    }

    // Seeded shuffle of remaining hotels for varied ordering.
    const rng = seededRng(recommendedSeed)
    const buckets = perHotel.map(h => h.deals.map(d => ({
      hotel: h.hotel,
      deal: d,
      siblings: [] as SearchHotelDeal[],
      _unavailable: false,
    } as Row)))
    // Fisher-Yates on bucket order
    for (let i = buckets.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      const tmp = buckets[i]!; buckets[i] = buckets[j]!; buckets[j] = tmp
    }
    // Re-insert the pinned hotel's leftover deals as one more bucket so
    // they get interleaved alongside the rest.
    if (pinnedRest.length) buckets.push(pinnedRest)

    // Round-robin pop: take one deal at a time from each non-empty bucket,
    // randomising the bucket visit order per round so it doesn't look
    // perfectly cyclic.
    while (buckets.some(b => b.length > 0)) {
      const order = buckets.map((_, i) => i)
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1))
        const tmp = order[i]!; order[i] = order[j]!; order[j] = tmp
      }
      for (const idx of order) {
        const bucket = buckets[idx]
        if (!bucket || bucket.length === 0) continue
        // Skip adjacency with previous row's hotel when possible.
        const last = rows[rows.length - 1]
        if (last && bucket[0]!.hotel.id === last.hotel.id) {
          // try to defer this bucket — pick another non-empty bucket first
          const altIdx = order.find(o => o !== idx && buckets[o] && buckets[o]!.length > 0 && buckets[o]![0]!.hotel.id !== last.hotel.id)
          if (altIdx != null) continue
        }
        rows.push(bucket.shift()!)
      }
    }

    return pinnedFirstRow ? [pinnedFirstRow, ...rows] : rows
  }

  // Non-recommended sort modes: keep the hotel-sorted order, flatten deals.
  for (const h of perHotel) {
    for (const deal of h.deals) {
      rows.push({
        hotel: h.hotel,
        deal,
        siblings: [],
        _unavailable: h.unavailable && h.pinnedFirst && deal.slug === pinnedFromSlug.value,
      })
    }
  }
  return rows
})

// Close sort dropdown on click outside
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
function handleClickOutside(e: MouseEvent) {
  if (sortRef.value && !sortRef.value.contains(e.target as Node)) {
    sortOpen.value = false
  }
}

// Side panel
const panelOpen = ref(false)
const activePanelHotel = ref<SearchHotel | null>(null)

function openDealPanel(hotel: SearchHotel) {
  // The grid's `hotel` already had its deals pruned to the filter-matching
  // ("available") set. The side panel needs the FULL deal list so it can
  // render both the "available" group and the "Beschikbaar op andere
  // datums" group below it. Look the original hotel up by id.
  const full = searchHotels.find((h) => h.id === hotel.id) ?? hotel
  activePanelHotel.value = full
  panelOpen.value = true
}

function navigateToDeal(slug: string) {
  const params = new URLSearchParams()
  if (persons.value !== 2) params.set('adults', String(persons.value))
  if (rooms.value !== 1) params.set('rooms', String(rooms.value))
  const qs = params.toString()
  window.open(`/first-release/deal/${slug}${qs ? '?' + qs : ''}`, '_blank')
}

// Sync FR nav-bar variant with the user's last homepage pick so the
// SiteHeader on this internal page matches the chosen variant. Reads
// localStorage (or the URL if it matches a known variant path).
onMounted(() => {
  const { restoreFrNavVariant } = useFirstReleaseHomeVariant()
  restoreFrNavVariant(window.location.pathname)
})
</script>

<style scoped>
.search-page__main {
  padding-bottom: var(--space-3xl);
}

.search-page__breadcrumbs {
  padding-top: var(--space-lg);
  padding-bottom: var(--space-sm);
}

.search-page__grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-xl);
  align-items: start;
}

.search-page__grid--no-sidebar {
  grid-template-columns: 1fr;
}

.search-page__sidebar {
  min-width: 0;
}

/* Invisible 1-px marker at the bottom of the sidebar — the
   IntersectionObserver flips `stickyFilterVisible` when this scrolls
   above the viewport. */
.search-page__filter-sentinel {
  height: 1px;
  width: 100%;
}

/* Compact sticky filter — appears once the main sidebar has scrolled
   out of view. Fixed at the top of the viewport with the SAME left
   X-position as the regular sidebar (= `container` left edge):
   `(viewport_width - container_max) / 2 + var(--space-lg)`. The
   `max()` falls back to plain `var(--space-lg)` on viewports
   narrower than the container, matching `.container`'s real-world
   left edge. */
.search-page__sticky-filter {
  position: fixed;
  top: var(--space-md);
  left: max(
    var(--space-lg),
    calc((100vw - var(--container-max)) / 2 + var(--space-lg))
  );
  width: 280px;
  max-height: calc(100vh - var(--space-md) * 2);
  overflow-y: auto;
  z-index: 800;
}

.sticky-filter-fade-enter-from,
.sticky-filter-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.sticky-filter-fade-enter-active,
.sticky-filter-fade-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}

.search-page__map-preview {
  margin-bottom: var(--space-md);
  /* Vue merges `.search-page__map-preview` onto MapPreviewCard's root
     element (= the same element that carries `.map-preview`). Setting
     height directly here wins because the parent's data-v-PARENT
     attribute pushes specificity above the child's
     `.map-preview[data-v-CHILD] { aspect-ratio: 9/5 }` rule. */
  height: 200px;
  aspect-ratio: auto;
}

/* Make sure the inner image fills the new fixed-height box without
   distorting. */
.search-page__map-preview :deep(.map-preview__img) {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.search-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-2xl) var(--space-md);
  color: var(--color-text-secondary);
  max-width: 480px;
  margin: 0 auto;
}
.search-page__empty-illustration {
  color: var(--color-border);
  margin-bottom: var(--space-md);
}
.search-page__empty-title {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm);
}
.search-page__empty-body {
  font-size: 15px;
  line-height: 1.55;
  margin: 0 0 var(--space-lg);
}
.search-page__empty-cta {
  height: 44px;
  padding: 0 var(--space-lg);
  background: var(--color-primary);
  color: #fff;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 700;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: filter var(--transition-fast);
}
.search-page__empty-cta:hover { filter: brightness(0.95); }

/* ─── No-results state ─── */
/* Title in the search-page header takes over the "x arrangementen" spot
   when there are no results. Slightly trimmed so the longer string fits. */
.search-page__title--no-results {
  max-width: 720px;
  line-height: 1.25;
}

/* Secondary-style reset button — text link with underline, NOT the
   primary orange CTA. Sits directly under the no-results title. */
.search-page__reset-link {
  align-self: flex-start;
  margin-top: var(--space-sm);
  padding: 0;
  background: none;
  border: none;
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.search-page__reset-link:hover {
  color: var(--color-primary);
}

.search-page__no-results-suggest-title {
  margin: 0 0 var(--space-lg);
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.3;
}

.search-page__no-results-suggest-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--space-lg);
}

@media (max-width: 1023px) {
  .search-page__no-results-suggest-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .search-page__no-results-suggest-grid {
    grid-template-columns: 1fr;
  }
}

.search-page__results {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  min-width: 0;
}

.search-page__header {
  margin-bottom: var(--space-sm);
}

.search-page__header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-lg);
}

/* ── Team Avatars ── */
.team-avatars {
  display: flex;
  gap: 0;
  flex-shrink: 0;
}

.team-avatars__item {
  position: relative;
  margin-left: -8px;
}

.team-avatars__item:first-child {
  margin-left: 0;
}

.team-avatars__circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-background-secondary);
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  transition: transform 150ms ease, box-shadow 150ms ease;
  position: relative;
  z-index: 1;
}

.team-avatars__item:hover .team-avatars__circle {
  transform: scale(1.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 5;
}

.team-avatars__circle--photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.team-avatars__initials {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  line-height: 1;
}

.team-avatars__tooltip {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 240px;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  z-index: 100;
  pointer-events: none;
}

.team-avatars__tooltip-name {
  display: block;
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.team-avatars__tooltip-role {
  display: block;
  font-size: 13px;
  line-height: 1.45;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
}

.team-avatars__tooltip-score {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-discount);
}

.tooltip-fade-enter-active {
  transition: opacity 150ms ease, transform 150ms ease;
}
.tooltip-fade-leave-active {
  transition: opacity 100ms ease, transform 100ms ease;
}
.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Header text column (title + subtitle + avatars). */
.search-page__header-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  /* No explicit gap — default <h1>/<p> margins put the subtitle and
     avatars closer to the title, matching the earlier (preferred)
     spacing. */
}

/* Right-column Trustpilot block — replaces the team-avatars that used
   to live here. Right-aligned, vertical stack: logo on top, review
   count beneath. */
.search-trust {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}
.search-trust__logo {
  /* Match the Trustpilot logo size used on the home USP bar (56 px). */
  height: 56px;
  width: auto;
  display: block;
}
.search-trust__text {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.search-page__title {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-top: 0;                /* Title sits at Y=0 of header-text */
  margin-bottom: 4px;
}

.search-page__usp {
  /* Handwritten subtitle — same font family as the homepage payoff.
     Animates in from left to right after the page loads, as if being
     written by hand. Translate-y pulls the text 4 px closer to the
     title visually WITHOUT shifting siblings (the avatars stay put). */
  font-family: 'Oooh Baby', cursive;
  font-size: 20px;
  font-weight: 400;
  color: var(--color-text-secondary);
  line-height: 1;
  display: inline-block;
  /* Zero the default <p> margins (1em 0 = 16+16) so the subtitle
     doesn't bloat the header zone past 200 px. */
  margin: 0;
  transform: translateY(-4px);
  animation: search-usp-write 1.2s ease-out 0.2s both;
}

@keyframes search-usp-write {
  from { clip-path: inset(0 100% 0 0); }
  to   { clip-path: inset(0 0     0 0); }
}

/* ===== RESULT LIST / GRID ===== */
.search-page__result-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  width: 100%;
  min-width: 0;
  /* Cards top Y should equal the filter panel's outer-card top
     (= map_bottom 200 + map.margin-bottom 16 = 216).
     `.search-page__results` is a flex column with `gap: var(--space-lg)`
     (24 px) between children, so the gap already adds 24 px below the
     above-cards wrapper. We want only 16 px → use a negative margin
     to cancel the surplus 8 px: gap (24) + margin (-8) = 16 net. */
  margin-top: calc(var(--space-md) - var(--space-lg));
}

.search-page__result-list--grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-lg);
}

.search-page__result-list--grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

/* ===== TOOLBAR ===== */
/* Reserved zone above the result cards. Min-height matches the map
   preview's height + bottom margin so the toolbar's bottom border
   (the grey divider above the result list) lands at the same Y as
   the filter panel's top on the left column.
   The toolbar uses `margin-top: auto` to stick to the bottom of this
   zone; when pills wrap and grow the toolbar, the toolbar's TOP moves
   up into the empty space without affecting its bottom (= the
   divider stays put). Once the toolbar outgrows the empty space, the
   zone expands past its min-height and the divider (+ deal cards
   below) shift down. */
.search-page__above-cards {
  position: relative;
  /* Locked to the map's height so the toolbar's bottom border
     (= grey divider) sits exactly at the map's bottom edge.
     Block-flow + absolute toolbar (below) decouples the divider
     from the header content height, so it can't drift even if the
     header content unexpectedly grows. */
  height: 200px;
  /* Reserve room at the bottom for the absolute-positioned toolbar
     so header content doesn't slide under it. */
  padding-bottom: 53px;
  box-sizing: border-box;
}

/* Toolbar anchored at the bottom of the 200-px wrapper. Its bottom
   border (the grey divider) lands at exactly Y = 200, the same Y
   as the map's bottom edge on the sidebar. */
.search-page__above-cards .search-toolbar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}

.search-toolbar {
  display: flex;
  /* Bottom-align children so the filter pills line up with the Sort
     button's bottom edge. Pills wrap upward as more are picked. */
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-border-light);
}

/* Pills wrapper inside the toolbar — fills the middle horizontal slot.
   NO `display: flex` set here on purpose: that would override the
   FilterPills root's own `.filter-pills--empty { display: none }`
   rule (same specificity, cascade ties). Leaving display default
   means the empty-state hides the wrapper as designed. */
.search-toolbar__pills {
  flex: 1 1 auto;
  min-width: 0;
  /* No left margin so the first pill aligns flush with the divider
     and the avatars row above. Right margin keeps a small gap to the
     Sort/view-toggle group. */
  margin: 0 var(--space-md) 0 0;
}

/* When the filter sidebar is visible the toolbar's left group has
   no visible buttons. Hiding it as `display: none` removes it from
   the flex layout — its `gap` contribution disappears too — so the
   pills wrapper starts flush with the toolbar's left edge (= the
   divider / avatars left edge). */
.search-toolbar__left:empty {
  display: none;
}

.search-toolbar__left {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
}

.search-toolbar__filter-toggle,
.search-toolbar__map-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: inherit;
}

.search-toolbar__filter-toggle:hover,
.search-toolbar__map-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.search-toolbar__right {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  /* Always pin to the right edge — `justify-content: space-between`
     on the toolbar collapses to "start" when the left + pills siblings
     are empty/hidden, which would otherwise pull the Sort group to
     the left. */
  margin-left: auto;
}

/* Sort */
.search-toolbar__sort {
  position: relative;
}

.search-toolbar__sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.search-toolbar__sort-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.search-toolbar__sort-chevron {
  transition: transform var(--transition-fast);
}

.search-toolbar__sort-chevron--open {
  transform: rotate(180deg);
}

.search-toolbar__sort-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-hover);
  z-index: 20;
  min-width: 200px;
  overflow: hidden;
}

.search-toolbar__sort-option {
  display: block;
  width: 100%;
  padding: 10px 16px;
  font-size: 13px;
  color: var(--color-text-secondary);
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.search-toolbar__sort-option:hover {
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
}

.search-toolbar__sort-option--active {
  color: var(--color-primary);
  font-weight: 600;
}

/* View toggle */
.search-toolbar__view-toggle {
  display: flex;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.search-toolbar__view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: var(--color-surface);
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
}

.search-toolbar__view-btn:not(:last-child) {
  border-right: 1px solid var(--color-border-light);
}

.search-toolbar__view-btn:hover {
  color: var(--color-text-primary);
}

.search-toolbar__view-btn--active {
  background: var(--color-text-primary);
  color: #fff;
}

.search-toolbar__view-btn--active:hover {
  color: #fff;
}

/* ===== SIDEBAR TRANSITION ===== */
/* Sidebar mounts/unmounts instantly — no animation. */
.sidebar-slide-enter-active,
.sidebar-slide-leave-active,
.sidebar-slide-enter-from,
.sidebar-slide-leave-to,
.sidebar-slide-enter-to,
.sidebar-slide-leave-from {
  transition: none;
}

/* Dropdown transition */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 150ms ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* List view without sidebar — image takes ~2x its normal width and is taller */
.search-page__result-list--list-wide :deep(.result-card__image) {
  width: 50%;
  max-width: 560px;
  flex-shrink: 0;
  min-height: 300px;
  max-height: 300px;
}

/* Responsive */
@media (max-width: 960px) {
  .search-page__grid {
    grid-template-columns: 1fr;
  }

  .search-page__sidebar {
    position: static;
  }

  /* Grid: 3-col without sidebar shrinks to 2 between 768-960 */
  .search-page__result-list--grid-3 {
    grid-template-columns: repeat(2, 1fr);
  }

  /* List wide: image cap at 50% so it shrinks proportionally on narrower */
  .search-page__result-list--list-wide :deep(.result-card__image) {
    width: 40%;
    max-width: none;
  }
}

@media (max-width: 640px) {
  .search-page__result-list--grid,
  .search-page__result-list--grid-3 {
    grid-template-columns: 1fr;
  }
}

/* ==================== */
/* MOBILE (<768px)      */
/* ==================== */
@media (max-width: 768px) {
  /* Hide sidebar entirely; filter moves to FilterSubpage */
  .search-page__sidebar {
    display: none !important;
  }
  /* Hide team avatars (hover tooltips don't work on touch) */
  .team-avatars {
    display: none;
  }
  /* Hide list/grid view switch — grid only on mobile */
  .search-toolbar__view-switch {
    display: none;
  }
  /* Always use grid layout, single column */
  .search-page__result-list {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: var(--space-md) !important;
  }
  /* Reduce page padding */
  .search-page__main > .container,
  .search-page__breadcrumbs.container,
  .search-page__grid.container {
    padding-left: 16px;
    padding-right: 16px;
  }
  /* Filter toggle becomes a full-width tappable button */
  .search-toolbar__filter-toggle {
    padding: 10px 14px;
  }
}

/* Loading state */
.search-page__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.search-page__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
