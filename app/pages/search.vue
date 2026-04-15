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
            <SearchFilterPanel />
          </div>
        </Transition>

        <div class="search-page__results">
          <!-- Header inside results column for alignment -->
          <div class="search-page__header">
            <h1 class="search-page__title">{{ totalDeals }} {{ t('search.deals') }}</h1>
            <p class="search-page__usp">{{ t('search.usp') }}</p>
          </div>

          <!-- Toolbar: filter toggle, sort, view switch -->
          <div class="search-toolbar">
            <button class="search-toolbar__filter-toggle" @click="showFilters = !showFilters">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="8" y1="12" x2="20" y2="12" />
                <line x1="12" y1="18" x2="20" y2="18" />
              </svg>
              {{ showFilters ? t('search.hideFilters') : t('search.showFilters') }}
            </button>

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

          <!-- Results: list or grid -->
          <div
            class="search-page__result-list"
            :class="{
              'search-page__result-list--grid': viewMode === 'grid',
              'search-page__result-list--grid-3': viewMode === 'grid' && !showFilters,
            }"
          >
            <SearchResultCard
              v-for="hotel in sortedHotels"
              :key="hotel.id"
              :hotel="hotel"
              :grid-mode="viewMode === 'grid'"
              @view-deals="openDealPanel(hotel)"
            />
          </div>
        </div>
      </div>
    </main>

    <SiteFooter />

    <!-- Deals side panel -->
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

const { t } = useI18n()

const breadcrumbs = computed(() => [
  { label: t('search.home'), href: '/' },
  { label: t('search.arrangements'), href: '/search' },
])

const totalDeals = computed(() => {
  return searchHotels.reduce((sum, hotel) => sum + hotel.deals.length, 0)
})

// View mode & filter state
const viewMode = ref<'list' | 'grid'>('list')
const showFilters = ref(true)

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

const sortedHotels = computed(() => {
  const hotels = [...searchHotels]
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
  transition: grid-template-columns 300ms ease;
}

.search-page__grid--no-sidebar {
  grid-template-columns: 1fr;
}

.search-page__sidebar {
  min-width: 0;
}

.search-page__results {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.search-page__header {
  margin-bottom: var(--space-sm);
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

.search-toolbar__filter-toggle {
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

.search-toolbar__filter-toggle:hover {
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
.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: opacity 250ms ease;
  min-width: 280px;
}

.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  opacity: 0;
}

.sidebar-slide-enter-to,
.sidebar-slide-leave-from {
  opacity: 1;
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

/* Responsive */
@media (max-width: 960px) {
  .search-page__grid {
    grid-template-columns: 1fr;
  }

  .search-page__sidebar {
    position: static;
  }

  .search-page__result-list--grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .search-page__result-list--grid-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .search-page__result-list--grid,
  .search-page__result-list--grid-3 {
    grid-template-columns: 1fr;
  }
}
</style>
