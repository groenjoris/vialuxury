<template>
  <div class="hotel-page">
    <TopBar />
    <SiteHeader />

    <main v-if="hotel && arrangement" class="hotel-page__main">
      <!-- Hero Section -->
      <section class="hotel-page__hero container">
        <BreadcrumbNav :items="breadcrumbs" />
        <HotelMeta
          :name="hotel.name"
          :star-rating="hotel.starRating"
          :location="hotel.location"
          :reviews="hotel.reviews"
        />
        <div class="hotel-page__hero-actions">
          <button class="icon-action">♡</button>
          <button class="icon-action">↗</button>
          <button class="btn btn-primary hero-cta" @click="scrollToCalendar">Boek nu</button>
        </div>
      </section>

      <section class="container">
        <HeroGallery :images="hotel.images" @open-gallery="openGallery" />
      </section>

      <!-- Two-column layout -->
      <div class="hotel-page__content container">
        <div class="hotel-page__left">
          <!-- Description & Included Items -->
          <DealDescription
            :description="hotel.description"
            :items="store.includedItems"
            :persons="store.configuration.persons"
          />

          <!-- Configurator -->
          <DealConfigurator :arrangement="arrangement" />

          <!-- Facilities -->
          <HotelFacilities :facilities="hotel.facilities" />

          <!-- Date Picker -->
          <div ref="calendarRef">
            <DatePickerSection />
          </div>
        </div>

        <div class="hotel-page__right">
          <BookingSidebar />
        </div>
      </div>

      <!-- Full-width sections -->
      <div class="container">
        <!-- Reviews -->
        <ReviewsSection
          :reviews="hotel.reviews"
          :individual-reviews="hotel.individualReviews"
        />

        <!-- Arrangement Details -->
        <ArrangementDetails
          :items="store.includedItems"
          :persons="store.configuration.persons"
        />

        <!-- Location -->
        <HotelLocationMap
          :address="hotel.location.address"
          :city="hotel.location.city"
          :region="hotel.location.region"
          :lat="hotel.location.coordinates.lat"
          :lng="hotel.location.coordinates.lng"
        />

        <!-- Nearby Tips -->
        <NearbyTips :tips="hotel.nearbyTips" />

        <!-- FAQ -->
        <FaqSection :faq-items="hotel.faq" />

        <!-- Related Deals -->
        <RelatedDeals :hotel-name="hotel.name" />
      </div>
    </main>

    <!-- Loading state -->
    <div v-else class="hotel-page__loading container">
      <p>Laden...</p>
    </div>

    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'
import { hotelTerZand, arrangementTerZand } from '~/data/mock/hotel-ter-zand'

const route = useRoute()
const store = useBookingStore()
const calendarRef = ref<HTMLElement | null>(null)

// Load data (mock for now, later from API)
const hotel = ref(hotelTerZand)
const arrangement = ref(arrangementTerZand)

// Initialize store
store.initializeArrangement(arrangement.value)

// Apply URL query params if present
const query = route.query as Record<string, string>
if (Object.keys(query).length > 0) {
  store.applyFromQuery(query)
}

// Sync store changes back to URL
const router = useRouter()
watch(
  () => store.queryParams,
  (params) => {
    router.replace({ query: params })
  },
  { deep: true },
)

// SEO
useHead({
  title: `${hotel.value.name} - ViaLuxury Arrangement`,
  meta: [
    {
      name: 'description',
      content: `Boek het exclusieve ${hotel.value.name} arrangement in ${hotel.value.location.city}. Inclusief overnachting, ontbijt en diner.`,
    },
  ],
})

const breadcrumbs = computed(() => [
  { label: 'Home', href: '/' },
  { label: 'Arrangementen', href: '/' },
  { label: `${hotel.value.name}` },
])

function scrollToCalendar() {
  calendarRef.value?.scrollIntoView({ behavior: 'smooth' })
}

function openGallery() {
  // TODO: Open lightbox modal
}
</script>

<style scoped>
.hotel-page__hero {
  padding-top: var(--space-lg);
  padding-bottom: var(--space-md);
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}

.hotel-page__hero-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-left: auto;
}

.icon-action {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all var(--transition-fast);
}

.icon-action:hover {
  border-color: var(--color-primary);
}

.hero-cta {
  max-width: 120px;
  padding: 8px 20px;
  font-size: 15px;
}

.hotel-page__content {
  display: grid;
  grid-template-columns: var(--content-width) var(--sidebar-width);
  gap: var(--layout-gap);
  padding-top: var(--space-xl);
}

.hotel-page__left {
  min-width: 0;
}

.hotel-page__right {
  min-width: 0;
}

.hotel-page__loading {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive */
@media (max-width: 1200px) {
  .hotel-page__content {
    grid-template-columns: 1fr;
    gap: var(--space-xl);
  }

  .hotel-page__right {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
  }
}
</style>
