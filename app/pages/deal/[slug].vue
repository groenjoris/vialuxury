<template>
  <div class="deal-page">
    <TopBar />
    <SiteHeader />

    <main v-if="hotel && currentDeal" class="deal-page__main">
      <!-- Breadcrumbs -->
      <section class="deal-page__breadcrumbs container">
        <BreadcrumbNav :items="breadcrumbs" />
      </section>

      <!-- Title ABOVE gallery -->
      <section class="deal-page__title-section container">
        <div class="deal-page__title-left">
          <h1 class="deal-page__package-title">{{ localized(currentDeal.title) }}</h1>
          <div class="deal-page__hotel-name-wrap">
            <p class="deal-page__hotel-subtitle">{{ hotel.name }}</p>
            <div class="deal-page__stars-adjacent" aria-hidden="true">
              <span v-for="n in hotel.starRating" :key="n" class="star-adj">★</span>
            </div>
          </div>
          <div class="deal-page__meta">
            <span class="deal-page__score">{{ hotel.reviews.overallScore }}</span>
            <span class="deal-page__divider">|</span>
            <span>{{ hotel.reviews.totalReviews }} {{ t('common.reviews') }}</span>
            <span class="deal-page__divider">·</span>
            <span>{{ hotel.location.city }}, {{ hotel.location.region }}</span>
          </div>
        </div>
        <div class="deal-page__title-actions">
          <button class="icon-action" :class="{ 'icon-action--favorited': isFavorited }" :aria-label="t('common.save')" @click="isFavorited = !isFavorited">{{ isFavorited ? '♥' : '♡' }}</button>
          <button class="icon-action" :aria-label="t('common.share')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></button>
        </div>
      </section>

      <!-- Hero Gallery -->
      <section class="container">
        <HeroGallery :images="hotel.images" @open-gallery="openGallery" />
      </section>

      <!-- Two-column layout: Content | Booking Sidebar -->
      <div class="deal-page__grid container">
        <div class="deal-page__col-left">
          <!-- Description + Mini map row -->
          <div class="deal-page__intro">
            <p class="deal-page__description">{{ localized(hotel.description) }}</p>
            <div class="mini-map">
              <div class="mini-map__placeholder">
                <img src="/images/kasteel/iStock-1189537172.jpg" :alt="t('deal.mapArea')" class="mini-map__img" />
                <div class="mini-map__overlay">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  <span class="mini-map__label">{{ hotel.location.city }}</span>
                  <a href="#location" class="mini-map__link">{{ t('common.viewMap') }}</a>
                </div>
              </div>
            </div>
          </div>

          <!-- Highlights -->
          <section class="deal-page__highlights">
            <h2 class="section-title">{{ t('deal.highlights') }}</h2>
            <div class="highlights__grid">
              <div v-for="hl in highlights" :key="hl.text" class="highlight-item">
                <span class="highlight-item__icon" v-html="hl.icon"></span>
                <span class="highlight-item__text">{{ hl.text }}</span>
              </div>
            </div>
          </section>

          <!-- Content blocks: What's included -->
          <section class="deal-page__content-blocks">
            <h2 class="section-title">
              {{ t('deal.inclusionsHeading') }}
              <button class="inline-edit-link" @click="store.openTravelGroupModal()">
                {{ store.totalPersons }} {{ store.totalPersons === 1 ? t('common.personSingular') : t('common.personPlural') }}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              {{ t('deal.inclusionsEndAlt') }}
            </h2>
            <div class="content-blocks__grid">
              <!-- Row 1: overnight card + room info card -->
              <RoomInclusionCard :deal="currentDeal" />
              <RoomInfoCard :deal="currentDeal" @open-upgrades="isUpgradePanelOpen = true" />

              <!-- Remaining inclusions -->
              <div
                v-for="inc in filteredInclusions"
                :key="inc.id"
                class="content-block"
              >
                <div v-if="inc.image" class="content-block__image">
                  <img :src="inc.image" :alt="localized(inc.title)" loading="lazy" />
                </div>
                <div class="content-block__body">
                  <h3 class="content-block__title">
                    <span class="content-block__check">✓</span>
                    {{ localized(inc.title) }}
                  </h3>
                  <p class="content-block__desc">{{ localized(inc.description) }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Facilities -->
          <section class="deal-page__facilities">
            <h2 class="section-title">{{ t('hotel.facilities') }}</h2>
            <div class="facilities__grid">
              <div v-for="fac in hotel.facilities" :key="fac.label" class="facility-item">
                <span class="facility-item__check">✓</span>
                <span>{{ localized(fac.label) }}</span>
              </div>
            </div>
          </section>

          <!-- Hotel reviews with arrangement indicator -->
          <section class="deal-page__reviews">
            <h2 class="section-title">{{ t('hotel.reviews') }}</h2>
            <div class="reviews__score-bar">
              <span class="reviews__score-big">{{ hotel.reviews.overallScore }}</span>
              <div class="reviews__score-stars">
                <span v-for="n in 5" :key="n" class="star" :class="{ 'star--dim': n > Math.round(hotel.reviews.overallScore) }">★</span>
              </div>
              <span class="reviews__score-count">{{ hotel.reviews.totalReviews }} {{ t('common.reviews') }}</span>
            </div>
            <div class="reviews__categories">
              <div v-for="cat in hotel.reviews.categories" :key="localized(cat.name)" class="reviews__cat">
                <span class="reviews__cat-name">{{ localized(cat.name) }}</span>
                <div class="reviews__cat-bar"><div class="reviews__cat-fill" :style="{ width: (cat.score / 5 * 100) + '%' }"></div></div>
                <span class="reviews__cat-score">{{ cat.score }}</span>
              </div>
            </div>
            <div class="reviews__grid">
              <div v-for="rev in hotel.individualReviews" :key="rev.id" class="review-card">
                <div class="review-card__header">
                  <span class="review-card__author">{{ rev.author }}</span>
                  <span class="review-card__stars"><span v-for="n in rev.score" :key="n" class="star">★</span></span>
                </div>
                <p class="review-card__text">{{ localized(rev.text) }}</p>
                <div v-if="rev.arrangement" class="review-card__arrangement">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 7h-3V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM9 5h6v2H9V5z" />
                  </svg>
                  <span>{{ t('hotel.bookedAs') }} {{ localized(rev.arrangement) }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- FAQ -->
          <section class="deal-page__faq">
            <FaqSection :faq-items="hotel.faq" />
          </section>
        </div>

        <!-- Booking sidebar -->
        <div class="deal-page__col-right">
          <!-- Inclusions -->
          <h3 class="sidebar__title">
            {{ t('inclusion.inThisDealFor') }}
            <button
              type="button"
              class="sidebar__title-link"
              @click="store.openTravelGroupModal()"
            >{{ store.totalPersons }} {{ store.totalPersons === 1 ? t('common.personSingular') : t('common.personPlural') }}</button>
          </h3>
          <ul class="sidebar__inc-list">
            <li v-for="inc in currentDeal.inclusions" :key="inc.id">
              <span class="sidebar__inc-check">✓</span>
              <span>{{ localized(inc.title) }}</span>
            </li>
          </ul>

          <!-- Variant CTA -->
          <div class="sidebar__variant-cta">
            <span class="sidebar__variant-text">{{ t('deal.shorterOrLonger') }}</span>
            <button class="sidebar__variant-btn" @click="isPanelOpen = true">{{ t('deal.viewOptions') }}</button>
          </div>

          <!-- Calendar -->
          <div class="sidebar__calendar" ref="calendarRef">
            <h4 class="sidebar__cal-title">{{ t('calendar.chooseArrivalDate') }}</h4>
            <CalendarMonth
              :year="calMonth.year" :month="calMonth.month"
              :availability="calAvailability"
              :selected-check-in="store.checkInDate" :selected-check-out="store.checkOutDate"
              :show-prev-button="true" :show-next-button="true"
              @select-date="handleDateSelect" @prev-month="calPrev" @next-month="calNext"
            />
          </div>

          <!-- Room allocation (multi-room with date) -->
          <div v-if="store.isRoomAllocationActive" class="sidebar__room-allocation">
            <div class="sidebar__room-alloc-header">
              <h4 class="sidebar__room-alloc-title">{{ t('room.allocateRooms') }}</h4>
              <span class="sidebar__room-alloc-counter">
                {{ allocatedCount }} / {{ store.travelGroup.rooms }} {{ t('room.roomsAllocated') }}
              </span>
            </div>
            <div
              v-for="roomType in store.allRoomTypes"
              :key="roomType.id"
              class="sidebar__room-alloc-row"
            >
              <div class="sidebar__room-alloc-info">
                <span class="sidebar__room-alloc-name">{{ localized(roomType.name) }}</span>
                <span class="sidebar__room-alloc-price">
                  <template v-if="roomType.priceExtra > 0">+{{ formatPrice(roomType.priceExtra) }} {{ t('room.perRoom') }}</template>
                  <template v-else>{{ t('room.included') }}</template>
                </span>
                <span v-if="roomType.maxAvailable" class="sidebar__room-alloc-max">
                  {{ t('room.maxAvailable').replace('{n}', String(roomType.maxAvailable)) }}
                </span>
              </div>
              <div class="sidebar__room-alloc-stepper">
                <button
                  class="sidebar__room-alloc-btn"
                  :disabled="(store.effectiveAllocation[roomType.id] || 0) <= 0"
                  @click="decrementRoom(roomType.id)"
                >−</button>
                <span class="sidebar__room-alloc-val">{{ store.effectiveAllocation[roomType.id] || 0 }}</span>
                <button
                  class="sidebar__room-alloc-btn"
                  :disabled="allocatedCount >= store.travelGroup.rooms || (store.effectiveAllocation[roomType.id] || 0) >= (roomType.maxAvailable ?? 5)"
                  @click="incrementRoom(roomType.id)"
                >+</button>
              </div>
            </div>
          </div>

          <!-- Before date selection: disabled button -->
          <button v-if="!store.checkInDate" class="btn btn-primary sidebar__book" disabled>{{ t('deal.bookNow') }}</button>

          <!-- After date selection: price summary + active button -->
          <div v-if="store.checkInDate" class="sidebar__summary">
            <div class="sidebar__dates">
              <div class="sidebar__date">
                <span class="sidebar__date-label">Check-in</span>
                <span class="sidebar__date-val">{{ store.formattedCheckIn }}</span>
              </div>
              <span class="sidebar__date-arrow">→</span>
              <div class="sidebar__date">
                <span class="sidebar__date-label">Check-out</span>
                <span class="sidebar__date-val">{{ store.formattedCheckOut }}</span>
              </div>
              <button class="sidebar__date-clear" @click="store.clearDates()">{{ t('calendar.clearDates') }}</button>
            </div>

            <!-- Price breakdown -->
            <div v-if="store.pricing.breakdown.length > 1" class="sidebar__breakdown">
              <div v-for="(item, idx) in store.pricing.breakdown" :key="idx" class="sidebar__breakdown-row" :class="{ 'sidebar__breakdown-row--upgrade': item.amount > 0 && idx > 0, 'sidebar__breakdown-row--discount': item.amount < 0 }">
                <span>{{ item.label }}</span>
                <span>{{ item.amount < 0 ? '- ' : '' }}{{ formatPrice(Math.abs(item.amount)) }}</span>
              </div>
            </div>

            <div class="sidebar__price">
              <span class="sidebar__discount">-{{ currentDeal.discountPercentage }}%</span>
              <span class="sidebar__amount">{{ formatPrice(store.pricing.totalPrice) }}</span>
              <span class="sidebar__original">{{ formatPrice(store.pricing.originalPrice) }}</span>
            </div>
            <p class="sidebar__price-meta">{{ t('deal.priceFor').replace('{nights}', String(currentDeal.nights)).replace('{persons}', String(store.totalPersons)) }}</p>

            <p class="sidebar__disclaimer">{{ t('deal.disclaimer') }}</p>

            <button class="btn btn-primary sidebar__book" @click="() => {}">{{ t('deal.bookNow') }}</button>
          </div>
        </div>
      </div>

      <!-- Tips in de buurt — full-width carousel -->
      <NearbyTips :tips="hotel.nearbyTips" :hotel-name="hotel.name" />
    </main>

    <TravelGroupModal />
    <PackageSidePanel
      :is-open="isPanelOpen" :variants="dealVariants"
      :current-deal-id="currentDeal?.id || ''" :hotel-name="hotel?.name || ''"
      :discount-percentage="currentDeal?.discountPercentage || 0"
      :inclusions-map="inclusionsMap"
      @close="isPanelOpen = false" @select="handlePanelSelect"
    />
    <RoomUpgradeSidePanel
      v-if="currentDeal"
      :is-open="isUpgradePanelOpen"
      :deal="currentDeal"
      :hotel-name="hotel?.name || ''"
      @close="isUpgradePanelOpen = false"
    />
    <!-- Room unavailable popup -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="store.roomUnavailableMessage" class="room-unavailable-overlay" @click.self="store.cancelRoomUnavailable()">
          <div class="room-unavailable-popup">
            <p class="room-unavailable-popup__text">{{ store.roomUnavailableMessage }}</p>
            <button class="room-unavailable-popup__btn" @click="store.confirmRoomUnavailable()">Oké</button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
import { useDealStore } from '~/stores/deal'
import { formatPrice } from '~/utils/formatPrice'
import { generateDealAvailability } from '~/data/mock/deal-pricing'
import {
  hotelKasteelTerWorm,
  dealKasteel3Nights,
  dealKasteel2Nights,
  dealKasteel4Nights,
  dealVariantsKasteel,
  dealsMapKasteel,
} from '~/data/mock/kasteel-ter-worm'

const { t, localized } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useDealStore()
const calendarRef = ref<HTMLElement | null>(null)
const isFavorited = ref(false)
const isPanelOpen = ref(false)
const isUpgradePanelOpen = ref(false)

const hotel = ref(hotelKasteelTerWorm)
const currentDeal = computed(() => store.currentDeal)
const filteredInclusions = computed(() => {
  if (!currentDeal.value) return []
  return currentDeal.value.inclusions.filter((i) => !i.id.startsWith('inc-overnight'))
})
const dealVariants = dealVariantsKasteel

store.initializeDeal(dealKasteel3Nights, dealVariantsKasteel)

const query = route.query as Record<string, string>
if (Object.keys(query).length > 0) {
  store.applyFromQuery(query, dealsMapKasteel)
}

watch(() => store.queryParams, (params) => { router.replace({ query: params }) }, { deep: true })

// Calendar
const calMonth = ref({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 })
const calAvailability = computed(() => {
  if (!store.currentDeal) return []
  return generateDealAvailability(calMonth.value.year, calMonth.value.month, store.currentDeal, store.totalPersons)
})
function calPrev() { let m = calMonth.value.month - 1, y = calMonth.value.year; if (m < 1) { m = 12; y-- }; calMonth.value = { year: y, month: m } }
function calNext() { let m = calMonth.value.month + 1, y = calMonth.value.year; if (m > 12) { m = 1; y++ }; calMonth.value = { year: y, month: m } }
function handleDateSelect(date: string) { store.setCheckIn(date) }

// Room allocation helpers
const allocatedCount = computed(() => {
  return Object.values(store.effectiveAllocation).reduce((s, n) => s + n, 0)
})

function incrementRoom(roomId: string) {
  const current = store.effectiveAllocation[roomId] || 0
  const roomType = store.allRoomTypes.find(r => r.id === roomId)
  const max = roomType?.maxAvailable ?? 5
  if (current >= max || allocatedCount.value >= store.travelGroup.rooms) return
  store.setRoomAllocationCount(roomId, current + 1)
}

function decrementRoom(roomId: string) {
  const current = store.effectiveAllocation[roomId] || 0
  if (current <= 0) return
  store.setRoomAllocationCount(roomId, current - 1)
}

function handlePanelSelect(dealId: string) {
  const deal = dealsMapKasteel[dealId]
  if (deal) { store.switchDeal(deal); isPanelOpen.value = false }
}

const highlights = computed(() => [
  { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/><path d="M3 11h2"/><path d="M19 11h2"/><path d="M10 3v2"/><path d="M14 3v2"/><rect x="9" y="9" width="2" height="2"/><rect x="13" y="9" width="2" height="2"/></svg>', text: t('deal.highlight.castle') },
  { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4a4 4 0 0 1 4 4c0 3-4 5-4 5s-4-2-4-5a4 4 0 0 1 4-4z"/><path d="M4 16h16"/><path d="M4 16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2"/><path d="M6 18v2"/><path d="M18 18v2"/><path d="M8 20h8"/></svg>', text: t('deal.highlight.restaurant') },
  { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21c-1.5-1.5-6-5.5-6-10a6 6 0 0 1 12 0c0 2.5-1.5 5-3 7"/><path d="M12 3c-.5 2-1 3.5-1 5a3 3 0 0 0 6 0c0-1.5-.5-3-1-5"/><path d="M9 8c-1.5.5-3 1.5-3 3a3 3 0 0 0 5 2.2"/><path d="M15 8c1.5.5 3 1.5 3 3a3 3 0 0 1-5 2.2"/></svg>', text: t('deal.highlight.wellness') },
  { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18c2-2 4-5 6-5s3 3 5 3 3-4 5-4 3 2 4 3"/><path d="M2 14c1.5-1.5 3-4 5-4s2.5 2.5 4.5 2.5S14 9 16 9s3 1.5 4 2.5"/><path d="M22 22H2"/></svg>', text: t('deal.highlight.estate') },
  { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="17" r="2"/><circle cx="9" cy="17" r="4"/><path d="M9 13V6l7-2v4"/><path d="M17 10l3-1"/><path d="M17 14l2 2"/><path d="M19 18h2"/></svg>', text: t('deal.highlight.cycling') },
  { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="14" rx="2"/><path d="M12 8V4"/><path d="M8 8V5"/><path d="M16 8V5"/><path d="M12 8c3 0 5-1.5 5-3s-2-2.5-5-2.5S7 3.5 7 5s2 3 5 3z"/><path d="M3 12h18"/><line x1="12" y1="12" x2="12" y2="22"/></svg>', text: t('deal.highlight.exclusive') },
])

const inclusionsMap = computed(() => ({
  [dealKasteel2Nights.id]: dealKasteel2Nights.inclusions.map(i => localized(i.title)),
  [dealKasteel3Nights.id]: dealKasteel3Nights.inclusions.map(i => localized(i.title)),
  [dealKasteel4Nights.id]: dealKasteel4Nights.inclusions.map(i => localized(i.title)),
}))

useHead({ title: `${currentDeal.value?.title ? localized(currentDeal.value.title) : 'Deal'} | ViaLuxury` })

const breadcrumbs = computed(() => [
  { label: t('search.home'), href: '/' },
  { label: t('search.arrangements'), href: '/' },
  { label: hotel.value.name },
])

function openGallery() { }
</script>

<style scoped>
/* ===== TITLE (above gallery) ===== */
.deal-page__title-section {
  padding-top: var(--space-lg); padding-bottom: var(--space-md);
  display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-md);
}
.deal-page__title-left { flex: 1; min-width: 0; position: relative; }
.deal-page__package-title { font-size: 26px; font-weight: 700; line-height: 1.3; margin-bottom: 4px; position: relative; z-index: 1; }

/* Hotel name with stars adjacent on the right */
.deal-page__hotel-name-wrap {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: var(--space-sm);
}
.deal-page__stars-adjacent {
  display: inline-flex;
  align-items: center;
  gap: 1px;
}
.deal-page__stars-adjacent .star-adj {
  font-size: 16px;
  line-height: 1;
  color: #111111;
  -webkit-font-smoothing: none;
  text-rendering: geometricPrecision;
}
.deal-page__hotel-subtitle {
  font-size: 17px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0;
}
.deal-page__meta { display: flex; align-items: center; gap: var(--space-sm); font-size: 14px; color: var(--color-text-secondary); }
.deal-page__score { font-weight: 600; color: var(--color-text-primary); }
.deal-page__divider { color: var(--color-text-muted); }
.deal-page__title-actions { display: flex; gap: var(--space-sm); flex-shrink: 0; }
.icon-action { width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--color-border); display: flex; align-items: center; justify-content: center; font-size: 18px; background: var(--color-surface); cursor: pointer; }
.icon-action:hover { border-color: var(--color-primary); }
.icon-action--favorited { color: #e74c3c; border-color: #e74c3c; }
.deal-page__breadcrumbs { padding-top: var(--space-md); }

/* ===== 2-COLUMN GRID ===== */
.deal-page__grid { display: grid; grid-template-columns: 1fr 340px; gap: var(--space-xl); padding-top: var(--space-lg); align-items: start; }
.deal-page__col-left { min-width: 0; }
.deal-page__description { font-size: 15px; line-height: 1.75; color: var(--color-text-secondary); }

/* Intro row: description + mini map side by side */
.deal-page__intro { display: grid; grid-template-columns: 1fr 220px; gap: var(--space-xl); margin-bottom: var(--space-xl); }

/* Mini map */
.mini-map { border-radius: var(--radius-lg); overflow: hidden; height: 100%; min-height: 200px; max-height: 280px; }
.mini-map__placeholder { position: relative; width: 100%; height: 100%; min-height: 200px; max-height: 280px; border-radius: var(--radius-lg); overflow: hidden; }
.mini-map__img { width: 100%; height: 100%; min-height: 200px; object-fit: cover; filter: brightness(0.7) saturate(0.8); }
.mini-map__overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; color: white; }
.mini-map__label { font-size: 15px; font-weight: 600; margin-top: 4px; }
.mini-map__link { font-size: 13px; color: white; text-decoration: underline; text-underline-offset: 2px; opacity: 0.85; }
.mini-map__link:hover { opacity: 1; }

/* ===== SIDEBAR ===== */
.deal-page__col-right { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-lg); }

/* Inclusions */
.sidebar__title { font-size: 16px; font-weight: 700; line-height: 1.4; margin-bottom: var(--space-md); color: var(--color-text-primary); }
.sidebar__title-link {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: var(--color-primary);
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}
.sidebar__title-link:hover { color: var(--color-primary); }
.sidebar__inc-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: var(--space-lg); padding-bottom: var(--space-lg); border-bottom: 1px solid var(--color-border-light); }
.sidebar__inc-list li { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--color-text-secondary); }
.sidebar__inc-check { color: var(--color-discount); font-weight: 700; flex-shrink: 0; }

/* Variant CTA */
.sidebar__variant-cta { display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); padding: 10px 14px; background: var(--color-background-secondary); border-radius: var(--radius-md); margin-bottom: var(--space-lg); }
.sidebar__variant-text { font-size: 13px; color: var(--color-text-secondary); font-weight: 500; }
.sidebar__variant-btn { font-size: 12px; font-weight: 600; color: var(--color-primary); background: none; border: none; cursor: pointer; white-space: nowrap; text-decoration: underline; text-underline-offset: 2px; }

/* Calendar */
.sidebar__calendar { margin-bottom: var(--space-md); }
.sidebar__cal-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; color: var(--color-text-muted); margin-bottom: var(--space-sm); }

/* Book button */
.sidebar__book { width: 100%; padding: 14px; font-size: 16px; }
.sidebar__book:disabled { opacity: 0.5; cursor: not-allowed; }

/* Summary (after date selection) */
.sidebar__summary { border-top: 1px solid var(--color-border-light); padding-top: var(--space-md); }
.sidebar__dates { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md); }
.sidebar__date { display: flex; flex-direction: column; gap: 1px; }
.sidebar__date-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-text-muted); letter-spacing: 0.3px; }
.sidebar__date-val { font-size: 14px; font-weight: 500; }
.sidebar__date-arrow { color: var(--color-text-muted); margin: 0 var(--space-xs); }
.sidebar__date-clear { margin-left: auto; font-size: 12px; color: var(--color-text-muted); text-decoration: underline; cursor: pointer; background: none; border: none; }
/* Price breakdown */
.sidebar__breakdown { margin-bottom: var(--space-md); display: flex; flex-direction: column; gap: 6px; }
.sidebar__breakdown-row { display: flex; justify-content: space-between; align-items: baseline; font-size: 13px; color: var(--color-text-secondary); }
.sidebar__breakdown-row span:last-child { font-weight: 600; white-space: nowrap; }
.sidebar__breakdown-row--upgrade { color: var(--color-primary); }

.sidebar__price { display: flex; align-items: baseline; gap: 6px; margin-bottom: 2px; }
.sidebar__discount { background: var(--color-discount-light); color: var(--color-discount); font-weight: 700; font-size: 13px; padding: 2px 7px; border-radius: var(--radius-sm); }
.sidebar__amount { font-size: 26px; font-weight: 700; font-family: var(--font-heading); }
.sidebar__original { font-size: 15px; color: var(--color-text-muted); text-decoration: line-through; }
.sidebar__price-meta { font-size: 13px; color: var(--color-text-secondary); margin-bottom: var(--space-md); }
.sidebar__disclaimer { font-size: 12px; line-height: 1.5; color: var(--color-text-muted); margin-bottom: var(--space-md); }
.sidebar__summary .sidebar__book { margin-top: 0; }

/* Room allocation */
.sidebar__room-allocation { margin-bottom: var(--space-md); padding: var(--space-md); background: var(--color-background-secondary); border-radius: var(--radius-md); }
.sidebar__room-alloc-header { margin-bottom: var(--space-sm); }
.sidebar__room-alloc-title { font-size: 14px; font-weight: 700; color: var(--color-text-primary); margin-bottom: 2px; }
.sidebar__room-alloc-counter { font-size: 12px; color: var(--color-text-muted); }
.sidebar__room-alloc-row { display: flex; align-items: center; justify-content: space-between; padding: var(--space-sm) 0; border-top: 1px solid var(--color-border-light); }
.sidebar__room-alloc-row:first-of-type { border-top: none; }
.sidebar__room-alloc-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.sidebar__room-alloc-name { font-size: 13px; font-weight: 600; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sidebar__room-alloc-price { font-size: 12px; color: var(--color-primary); font-weight: 600; }
.sidebar__room-alloc-max { font-size: 11px; color: var(--color-text-muted); font-style: italic; }
.sidebar__room-alloc-stepper { display: flex; align-items: center; gap: var(--space-sm); flex-shrink: 0; }
.sidebar__room-alloc-btn { width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--color-border); background: var(--color-surface); font-size: 16px; font-weight: 500; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all var(--transition-fast); color: var(--color-text-primary); line-height: 1; }
.sidebar__room-alloc-btn:hover:not(:disabled) { border-color: var(--color-primary); color: var(--color-primary); }
.sidebar__room-alloc-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.sidebar__room-alloc-val { min-width: 18px; text-align: center; font-size: 14px; font-weight: 600; }

/* ===== SECTION TITLES ===== */
.section-title { font-size: 22px; font-weight: 600; margin-bottom: var(--space-lg); }

/* ===== HIGHLIGHTS ===== */
.deal-page__highlights { padding: var(--space-xl) 0; border-top: 1px solid var(--color-border-light); }
.highlights__grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md) var(--space-xl); }
.highlight-item { display: flex; align-items: center; gap: var(--space-md); }
.highlight-item__icon { width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--color-primary-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--color-primary); }
.highlight-item__text { font-size: 14px; font-weight: 500; color: var(--color-text-primary); }

/* ===== CONTENT BLOCKS ===== */
.deal-page__content-blocks { padding: var(--space-xl) 0; border-top: 1px solid var(--color-border-light); }
.inline-edit-link { display: inline-flex; align-items: center; gap: 3px; padding: 0; border: none; background: none; cursor: pointer; font-size: inherit; font-weight: 700; font-family: inherit; color: var(--color-text-primary); text-decoration: underline; text-decoration-color: var(--color-primary); text-underline-offset: 2px; }
.inline-edit-link:hover { color: var(--color-primary); }
.inline-edit-link svg { color: var(--color-primary); }
.content-blocks__grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xl); }
.content-block { border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--color-border-light); }
.content-block__image { aspect-ratio: 16/10; overflow: hidden; background: var(--color-background-secondary); }
.content-block__image img { width: 100%; height: 100%; object-fit: cover; }
.content-block__body { padding: var(--space-md) var(--space-lg) var(--space-lg); }
.content-block__title { font-size: 16px; font-weight: 600; margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }
.content-block__check { color: var(--color-discount); font-weight: 700; }
.content-block__desc { font-size: 14px; line-height: 1.65; color: var(--color-text-secondary); }

/* ===== FACILITIES ===== */
.deal-page__facilities { padding: var(--space-xl) 0; border-top: 1px solid var(--color-border-light); }
.facilities__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md); }
.facility-item { display: flex; align-items: center; gap: var(--space-sm); font-size: 14px; }
.facility-item__check { color: var(--color-primary); font-weight: 700; }

/* ===== TIPS ===== */

/* ===== REVIEWS ===== */
.deal-page__reviews { padding: var(--space-xl) 0; border-top: 1px solid var(--color-border-light); }
.reviews__score-bar { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md); }
.reviews__score-big { font-size: 32px; font-weight: 700; font-family: var(--font-heading); }
.reviews__score-stars { color: var(--color-primary); font-size: 14px; }
.star--dim { opacity: 0.25; }
.reviews__score-count { font-size: 13px; color: var(--color-text-muted); }
.reviews__categories { display: grid; grid-template-columns: 1fr 1fr; gap: 6px var(--space-xl); margin-bottom: var(--space-lg); max-width: 720px; }
.reviews__cat { display: grid; grid-template-columns: 110px 1fr 32px; align-items: center; gap: var(--space-sm); font-size: 13px; }
.reviews__cat-name { color: var(--color-text-secondary); }
.reviews__cat-bar { height: 6px; background: var(--color-border-light); border-radius: 3px; overflow: hidden; }
.reviews__cat-fill { height: 100%; background: var(--color-primary); border-radius: 3px; }
.reviews__cat-score { font-weight: 600; text-align: right; }
.reviews__grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
.review-card { padding: var(--space-md); background: var(--color-background-secondary); border-radius: var(--radius-md); display: flex; flex-direction: column; }
.review-card__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-sm); }
.review-card__author { font-size: 14px; font-weight: 600; }
.review-card__stars { color: var(--color-primary); font-size: 12px; }
.review-card__text { font-size: 13px; line-height: 1.6; color: var(--color-text-secondary); }
.review-card__arrangement {
  margin-top: var(--space-sm);
  padding-top: var(--space-sm);
  border-top: 1px dashed var(--color-border);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
}
.review-card__arrangement svg { color: var(--color-primary); flex-shrink: 0; }

/* ===== FAQ ===== */
.deal-page__faq { padding: var(--space-xl) 0; border-top: 1px solid var(--color-border-light); }

/* ===== RESPONSIVE ===== */
@media (max-width: 1100px) {
  .deal-page__grid { grid-template-columns: 1fr; }
  .deal-page__col-right { position: static; }
  .deal-page__intro { grid-template-columns: 1fr; }
  .mini-map { max-height: 200px; }
  .mini-map__placeholder { max-height: 200px; }
  .content-blocks__grid { grid-template-columns: 1fr; }
  .reviews__grid { grid-template-columns: 1fr; }
  .reviews__categories { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .deal-page__package-title { font-size: 22px; }
  .facilities__grid { grid-template-columns: 1fr 1fr; }
}

/* ===== ROOM UNAVAILABLE POPUP ===== */
.room-unavailable-overlay {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); z-index: 1100;
  display: flex; align-items: center; justify-content: center;
}
.room-unavailable-popup {
  background: #fff; border: 2px solid #c5a254; border-radius: 12px;
  width: 450px; max-width: 90vw; min-height: 300px;
  padding: var(--space-2xl);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.14);
}
.room-unavailable-popup__text {
  font-size: 16px; line-height: 1.5; color: #1a1a1a;
  margin-bottom: var(--space-xl);
}
.room-unavailable-popup__btn {
  display: inline-block; padding: 12px 40px; border-radius: 8px;
  background: #c5a254; color: #fff; font-size: 14px; font-weight: 600;
  border: none; cursor: pointer; transition: background 150ms ease-out;
}
.room-unavailable-popup__btn:hover { background: #b08e3f; }
.fade-enter-active, .fade-leave-active { transition: opacity 200ms ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
