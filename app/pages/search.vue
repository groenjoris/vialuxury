<template>
  <div class="search-page">
    <TopBar />
    <SiteHeader />

    <main class="search-page__main">
      <!-- Breadcrumbs -->
      <section class="search-page__breadcrumbs container">
        <BreadcrumbNav :items="breadcrumbs" />
      </section>

      <!-- Header -->
      <section class="search-page__header container">
        <h1 class="search-page__title">{{ searchHotels.length }} luxe hotels gevonden</h1>
        <p class="search-page__usp">Unieke deals, samengesteld en onderhandeld door ViaLuxury</p>
      </section>

      <!-- Grid: Filter Sidebar + Results -->
      <div class="search-page__grid container">
        <div class="search-page__sidebar">
          <SearchFilterPanel />
        </div>

        <div class="search-page__results">
          <SearchResultCard
            v-for="hotel in searchHotels"
            :key="hotel.id"
            :hotel="hotel"
            @view-deals="openDealPanel(hotel)"
          />
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

const breadcrumbs = [
  { label: 'Home', to: '/' },
  { label: 'Zoekresultaten' },
]

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

.search-page__header {
  padding-bottom: var(--space-xl);
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

.search-page__grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-xl);
  align-items: start;
}

.search-page__sidebar {
  position: sticky;
  top: 20px;
}

.search-page__results {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

/* Responsive */
@media (max-width: 960px) {
  .search-page__grid {
    grid-template-columns: 1fr;
  }

  .search-page__sidebar {
    position: static;
  }
}
</style>
