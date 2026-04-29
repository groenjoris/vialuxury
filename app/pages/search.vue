<template>
  <div class="search-page">
    <TopBar />
    <SiteHeader />

    <main class="search-page__main">
      <!-- Breadcrumbs -->
      <section class="search-page__breadcrumbs container">
        <BreadcrumbNav :items="breadcrumbs" />
      </section>

      <!-- Grid: Filter Sidebar + Results -->
      <div class="search-page__grid container" :class="{ 'search-page__grid--no-sidebar': !showFilters }">
        <Transition name="sidebar-slide">
          <div v-if="showFilters" class="search-page__sidebar">
            <!-- Map preview (fake door) at the top of sidebar -->
            <MapPreviewCard class="search-page__map-preview" @click="handleMapClick" />
            <SearchFilterPanel
              :budget-min="budgetMin"
              :budget-max="budgetMax"
              @update:budget-min="budgetMin = $event"
              @update:budget-max="budgetMax = $event"
            />
          </div>
        </Transition>

        <div class="search-page__results">
          <!-- Header inside results column for alignment -->
          <div class="search-page__header">
            <div class="search-page__header-row">
              <div>
                <h1 class="search-page__title">{{ totalDeals }} {{ t('search.deals') }}</h1>
                <p class="search-page__usp">{{ t('search.usp') }}</p>
              </div>
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
                class="search-toolbar__filter-toggle"
                @click="handleFilterButtonClick"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="8" y1="12" x2="20" y2="12" />
                  <line x1="12" y1="18" x2="20" y2="18" />
                </svg>
                <span v-if="isMobile">{{ t('search.filters') }}</span>
                <span v-else>{{ showFilters ? t('search.hideFilters') : t('search.showFilters') }}</span>
              </button>
            </div>

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

          <!-- Loading overlay -->
          <Transition name="fade">
            <div v-if="searchLoading" class="search-page__loading">
              <div class="search-page__spinner"></div>
            </div>
          </Transition>

          <!-- Results: list or grid -->
          <div
            v-if="!searchLoading"
            class="search-page__result-list"
            :class="{
              'search-page__result-list--grid': effectiveViewMode === 'grid',
              'search-page__result-list--grid-3': effectiveViewMode === 'grid' && !showFilters,
              'search-page__result-list--list-wide': effectiveViewMode === 'list' && !showFilters,
            }"
          >
            <DealCard
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
        </div>
      </div>
    </main>

    <SiteFooter />

    <!-- Deals side panel -->
    <!-- Mobile filter subpage -->
    <FilterSubpage
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

    <HotelDealsSidePanel
      :is-open="panelOpen"
      :hotel="activePanelHotel"
      @close="panelOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { SearchHotel } from '~/types/searchHotel'
import { searchHotels } from '~/data/mock/search-hotels'
import { pickPrimaryDeal } from '~/utils/primaryDeal'

const { t } = useI18n()
const { loading, setLoading, persons, rooms, selectedNights } = useSearchState()

// Team members for avatar row
const hoveredMember = ref<string | null>(null)
const teamMembers = [
  {
    name: 'Yvette',
    initials: 'YV',
    photo: '/images/yvette.jpeg',
    role: '15 jaar Experience Maker bij ViaLuxury',
    score: 'Gemiddelde score voor haar experiences: 9.8',
  },
  {
    name: 'Jan',
    initials: 'JA',
    photo: '/images/team/jan.avif',
    role: 'Gespecialiseerd in oude kastelen en landgoederen',
    score: 'Gemiddelde score voor zijn experiences: 9.6',
  },
  {
    name: 'Anoeska',
    initials: 'AN',
    photo: '/images/team/anoeska.jpeg',
    role: 'Onze België-kenner — van de Ardennen tot de kust',
    score: 'Gemiddelde score voor haar experiences: 9.7',
  },
  {
    name: 'Alyssa',
    initials: 'AL',
    photo: '/images/team/alyssa.jpeg',
    role: 'Specialist wellness & romantische weekendjes',
    score: 'Gemiddelde score voor haar experiences: 9.5',
  },
  {
    name: 'Esther',
    initials: 'ES',
    photo: '/images/team/esther.jpeg',
    role: 'Culinaire hotspots en stedentrips',
    score: 'Gemiddelde score voor haar experiences: 9.4',
  },
]

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

// Show a brief spinner whenever the nights filter changes (mimics network latency)
let loaderTimer: ReturnType<typeof setTimeout> | null = null
watch(() => [...selectedNights.value], () => {
  localLoading.value = true
  if (loaderTimer) clearTimeout(loaderTimer)
  loaderTimer = setTimeout(() => { localLoading.value = false }, 350)
}, { deep: true })

const breadcrumbs = computed(() => [
  { label: t('search.home'), href: '/' },
  { label: t('search.arrangements'), href: '/search' },
])

const totalDeals = computed(() => {
  return sortedHotels.value.reduce((sum, hotel) => sum + hotel.deals.length, 0)
})

// View mode & filter state
const viewMode = ref<'list' | 'grid'>('list')

// Force grid mode on mobile (list view would be too cramped)
const isMobile = useIsMobile()
const effectiveViewMode = computed<'list' | 'grid'>(() => (isMobile.value ? 'grid' : viewMode.value))
const showFilters = ref(true)

// Budget range — shared with /kaart via useSearchState so toggling between
// list and map view preserves the user's filter selection.
const {
  budgetMin: sharedBudgetMin,
  budgetMax: sharedBudgetMax,
  setBudgetMin,
  setBudgetMax,
  resetBudget,
} = useSearchState()
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

// Mobile filter modal
const mobileFilterOpen = ref(false)

function handleMapClick() {
  navigateTo('/kaart')
}

function handleFilterButtonClick() {
  if (isMobile.value) {
    mobileFilterOpen.value = true
  } else {
    showFilters.value = !showFilters.value
  }
}

function resetFilters() {
  resetBudget()
}

// Sort
const sortOpen = ref(false)
const sortBy = ref<'priceLow' | 'priceHigh' | 'ratingHigh' | 'ratingLow'>('priceLow')
const sortRef = ref<HTMLElement | null>(null)

const sortOptions = computed(() => [
  { value: 'priceLow' as const, label: t('search.sort.priceLow') },
  { value: 'priceHigh' as const, label: t('search.sort.priceHigh') },
  { value: 'ratingHigh' as const, label: t('search.sort.ratingHigh') },
  { value: 'ratingLow' as const, label: t('search.sort.ratingLow') },
])

// Filtered hotels — applies budget AND nights filter.
// A hotel only matches if it has at least one deal that satisfies BOTH filters.
// The hotel's deals[] is also pruned to only the matching deals (used by sidepanel).
const filteredHotels = computed(() => {
  const nightsActive = selectedNights.value.length > 0
  const out = []
  for (const hotel of searchHotels) {
    const matchingDeals = hotel.deals.filter((d) => {
      const inBudget = d.basePrice >= budgetMin.value && d.basePrice <= budgetMax.value
      if (!inBudget) return false
      if (!nightsActive) return true
      const nightKey = d.nights >= 5 ? '5+' : String(d.nights)
      return selectedNights.value.includes(nightKey)
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

/** One row per hotel: the primary (most attractive) deal + sibling count.
 *  For the pinned-from-deal slot, force the deal to be the slug from `?from=`. */
const displayedDeals = computed(() => {
  return displayedHotels.value.map((hotel) => {
    const fromSlug = pinnedHotel.value && hotel.id === pinnedHotel.value.id ? pinnedFromSlug.value : null
    const fromDeal = fromSlug ? hotel.deals.find(d => d.slug === fromSlug) : null
    const primary = fromDeal ?? pickPrimaryDeal(hotel.deals)
    const siblings = hotel.deals.filter(d => d.id !== primary.id)
    return {
      hotel,
      deal: primary,
      siblings,
      _unavailable: (hotel as { _unavailable?: boolean })._unavailable === true,
    }
  })
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
  activePanelHotel.value = hotel
  panelOpen.value = true
}

function navigateToDeal(slug: string) {
  const params = new URLSearchParams()
  if (persons.value !== 2) params.set('adults', String(persons.value))
  if (rooms.value !== 1) params.set('rooms', String(rooms.value))
  const qs = params.toString()
  window.open(`/deal/${slug}${qs ? '?' + qs : ''}`, '_blank')
}
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

.search-page__map-preview {
  margin-bottom: var(--space-md);
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

.search-page__title {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.search-page__usp {
  font-size: 15px;
  color: var(--color-text-secondary);
}

/* ===== RESULT LIST / GRID ===== */
.search-page__result-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  width: 100%;
  min-width: 0;
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
.search-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-border-light);
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
