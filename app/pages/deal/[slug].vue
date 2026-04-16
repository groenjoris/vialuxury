<template>
  <div class="deal-page">
    <TopBar />
    <SiteHeader />

    <main v-if="hotel && currentDeal" class="deal-page__main">
      <!-- Back link + Breadcrumbs -->
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
            <div class="deal-page__score-wrap">
              <span class="deal-page__score">{{ hotel.reviews.overallScore.toFixed(1) }}</span>
              <span class="deal-page__score-label">{{ t(getReviewLabelKey(hotel.reviews.overallScore)) }}</span>
            </div>
            <span class="deal-page__divider">|</span>
            <span>{{ hotel.reviews.totalReviews }} {{ t('common.reviews') }}</span>
            <span class="deal-page__divider">·</span>
            <span>{{ hotel.location.city }}, {{ hotel.location.region }}</span>
          </div>
        </div>
        <div class="deal-page__title-actions">
          <button class="icon-action" :class="{ 'icon-action--favorited': isFavorited }" :aria-label="t('common.save')" @click="handleFavoriteClick">{{ isFavorited ? '♥' : '♡' }}</button>
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
                <img
                  :src="mapTileUrl"
                  :alt="t('deal.mapArea')"
                  class="mini-map__img mini-map__img--map"
                  @error="($event.target as HTMLImageElement).src = '/images/kasteel/iStock-1189537172.jpg'"
                />
                <div class="mini-map__pin">
                  <svg width="32" height="42" viewBox="0 0 32 42" fill="none">
                    <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z" fill="#c5a254"/>
                    <circle cx="16" cy="16" r="6" fill="#fff"/>
                  </svg>
                </div>
                <div class="mini-map__bottom">
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
                <span class="highlight-item__icon"><img :src="hl.icon" :alt="hl.text" width="20" height="20" /></span>
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
              <!-- Row 1: overnight card + first room info card -->
              <RoomInclusionCard :deal="currentDeal" />
              <RoomInfoCard
                v-for="(entry, idx) in roomAllocationEntries"
                :key="entry.room.id"
                :room="entry.room"
                :count="entry.count"
                :is-first="idx === 0"
                :deal="currentDeal"
                @open-upgrades="isUpgradePanelOpen = true"
              />

              <!-- Inclusions before Yvette (breakfast, welcome bubbles) -->
              <div
                v-for="inc in inclusionsBeforeYvette"
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

              <!-- Yvette banner -->
              <YvetteBanner />

              <!-- Inclusions after Yvette (wellness, pool, dinner) -->
              <div
                v-for="inc in inclusionsAfterYvette"
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
              <span class="reviews__score-big">{{ hotel.reviews.overallScore.toFixed(1) }}</span>
              <div class="reviews__score-meta">
                <span class="reviews__score-verdict">{{ t(getReviewLabelKey(hotel.reviews.overallScore)) }}</span>
                <span class="reviews__score-count">{{ hotel.reviews.totalReviews }} {{ t('common.reviews') }}</span>
              </div>
            </div>
            <div class="reviews__categories">
              <div v-for="cat in hotel.reviews.categories" :key="localized(cat.name)" class="reviews__cat">
                <span class="reviews__cat-name">{{ localized(cat.name) }}</span>
                <div class="reviews__cat-bar"><div class="reviews__cat-fill" :style="{ width: (cat.score / 10 * 100) + '%' }"></div></div>
                <span class="reviews__cat-score">{{ cat.score.toFixed(1) }}</span>
              </div>
            </div>
            <div class="reviews__grid">
              <div v-for="rev in hotel.individualReviews" :key="rev.id" class="review-card">
                <div class="review-card__header">
                  <span class="review-card__author">{{ rev.author }}</span>
                  <span class="review-card__review-score">{{ Number(rev.score).toFixed(1) }}/10</span>
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
            {{ t('sidebar.arrangementFor') }}
            <button
              type="button"
              class="sidebar__title-link"
              @click="store.openTravelGroupModal()"
            >{{ store.totalPersons }} {{ store.totalPersons === 1 ? t('common.personSingular') : t('common.personPlural') }}</button>
          </h3>
          <ul class="sidebar__inc-list">
            <template v-for="(inc, idx) in currentDeal.inclusions" :key="inc.id">
              <li>
                <span class="sidebar__inc-check">✓</span>
                <span>{{ localized(inc.title) }}</span>
              </li>
              <li v-if="idx === 0">
                <span class="sidebar__inc-check">✓</span>
                <span>{{ store.travelGroup.rooms }} {{ store.travelGroup.rooms === 1 ? t('sidebar.luxeRoomSingular') : t('sidebar.luxeRoomPlural') }}</span>
              </li>
            </template>
          </ul>

          <!-- Variant CTA -->
          <div class="sidebar__variant-cta">
            <h4 class="sidebar__variant-heading">{{ t('deal.shorterOrLonger') }}</h4>
            <button class="sidebar__variant-btn" @click="isPanelOpen = true">
              {{ t('deal.viewOptions') }}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <!-- Calendar -->
          <div class="sidebar__calendar" ref="calendarRef">
            <h4 class="sidebar__cal-title">{{ t('calendar.chooseArrivalDate') }}</h4>
            <CalendarMonth
              :year="calMonth.year" :month="calMonth.month"
              :availability="calAvailability"
              :selected-check-in="store.checkInDate" :selected-check-out="store.checkOutDate"
              :cheapest-price="calCheapestPrice"
              :show-prev-button="true" :show-next-button="true"
              @select-date="handleDateSelect" @prev-month="calPrev" @next-month="calNext"
            />
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

          <!-- Trust USPs + Trustpilot logo -->
          <div class="sidebar__trust">
            <ul class="sidebar__trust-list">
              <li><span class="sidebar__trust-check">✓</span> {{ t('deal.trust2min') }}</li>
              <li><span class="sidebar__trust-check">✓</span> {{ t('deal.trustCancel') }}</li>
              <li><span class="sidebar__trust-check">✓</span> {{ t('deal.trustTrustpilot') }}</li>
            </ul>
            <img src="/images/trustpilot.svg" alt="Trustpilot" class="sidebar__trust-logo" />
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
      :titles-map="titlesMap"
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

    <!-- Toast notification -->
    <ToastNotification :message="toastMessage" type="success" />

    <!-- Auth popup -->
    <AuthPopup :is-open="isAuthPopupOpen" @close="isAuthPopupOpen = false" @login="handleLogin" />

    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
import { useDealStore } from '~/stores/deal'
import { formatPrice } from '~/utils/formatPrice'
import { getReviewLabelKey } from '~/utils/reviewLabel'
import { generateDealAvailability } from '~/data/mock/deal-pricing'
import {
  hotelKasteelTerWorm,
  dealKasteel1Night,
  dealKasteel2Nights,
  dealKasteel3Nights,
  dealVariantsKasteel,
  dealsMapKasteel,
} from '~/data/mock/kasteel-ter-worm'

const { t, localized } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useDealStore()
const calendarRef = ref<HTMLElement | null>(null)
const isFavorited = ref(false)
const isLoggedIn = ref(false)
const isPanelOpen = ref(false)
const isUpgradePanelOpen = ref(false)
const isAuthPopupOpen = ref(false)
const toastMessage = ref('')

function handleFavoriteClick() {
  if (!isLoggedIn.value) {
    isAuthPopupOpen.value = true
    return
  }
  isFavorited.value = !isFavorited.value
  // Reset toast to re-trigger the watcher
  toastMessage.value = ''
  nextTick(() => {
    toastMessage.value = isFavorited.value
      ? t('toast.addedToFavorites')
      : t('toast.removedFromFavorites')
  })
}

function handleLogin() {
  isLoggedIn.value = true
  isAuthPopupOpen.value = false
  // Auto-favorite after login
  isFavorited.value = true
  toastMessage.value = ''
  nextTick(() => {
    toastMessage.value = t('toast.addedToFavorites')
  })
}

const hotel = ref(hotelKasteelTerWorm)
const currentDeal = computed(() => store.currentDeal)
const filteredInclusions = computed(() => {
  if (!currentDeal.value) return []
  return currentDeal.value.inclusions.filter((i) => !i.id.startsWith('inc-overnight'))
})

/** Split inclusions around Yvette banner: after welcome bubbles, before wellness */
const inclusionSplitIndex = computed(() => {
  const idx = filteredInclusions.value.findIndex(i => i.id.startsWith('inc-welcome'))
  return idx >= 0 ? idx + 1 : 1
})
const inclusionsBeforeYvette = computed(() => filteredInclusions.value.slice(0, inclusionSplitIndex.value))
const inclusionsAfterYvette = computed(() => filteredInclusions.value.slice(inclusionSplitIndex.value))

/** Room allocation entries for rendering separate room cards */
const roomAllocationEntries = computed(() => {
  if (!store.isRoomAllocationActive) {
    const room = store.selectedRoom ?? currentDeal.value?.baseRoomType
    if (!room) return []
    return [{ room, count: store.travelGroup.rooms }]
  }
  const entries: { room: any; count: number }[] = []
  for (const [roomId, count] of Object.entries(store.effectiveAllocation)) {
    if (count <= 0) continue
    const room = store.allRoomTypes.find(r => r.id === roomId)
    if (room) entries.push({ room, count })
  }
  return entries
})
const dealVariants = dealVariantsKasteel

store.initializeDeal(dealKasteel2Nights, dealVariantsKasteel)

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
const calCheapestPrice = computed(() => {
  const prices = calAvailability.value.filter(a => a.available && a.totalPrice > 0).map(a => a.totalPrice)
  return prices.length > 0 ? Math.min(...prices) : null
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

// Static map tile URL (OpenStreetMap)
const mapTileUrl = computed(() => {
  const { lat, lng } = hotel.value.location.coordinates
  const zoom = 13
  const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom))
  const latRad = (lat * Math.PI) / 180
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * Math.pow(2, zoom))
  return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`
})

const highlights = computed(() => [
  { icon: '/icons/highlights/castle.svg', text: t('deal.highlight.castle') },
  { icon: '/icons/highlights/restaurant.svg', text: t('deal.highlight.restaurant') },
  { icon: '/icons/highlights/spa.svg', text: t('deal.highlight.wellness') },
  { icon: '/icons/highlights/nature.svg', text: t('deal.highlight.estate') },
  { icon: '/icons/highlights/bike.svg', text: t('deal.highlight.cycling') },
  { icon: '/icons/highlights/special.svg', text: t('deal.highlight.exclusive') },
])

const inclusionsMap = computed(() => ({
  [dealKasteel1Night.id]: dealKasteel1Night.inclusions.map(i => localized(i.title)),
  [dealKasteel2Nights.id]: dealKasteel2Nights.inclusions.map(i => localized(i.title)),
  [dealKasteel3Nights.id]: dealKasteel3Nights.inclusions.map(i => localized(i.title)),
}))

const titlesMap = computed(() => ({
  [dealKasteel1Night.id]: localized(dealKasteel1Night.title),
  [dealKasteel2Nights.id]: localized(dealKasteel2Nights.title),
  [dealKasteel3Nights.id]: localized(dealKasteel3Nights.title),
}))

useHead({ title: `${currentDeal.value?.title ? localized(currentDeal.value.title) : 'Deal'} | ViaLuxury` })

const breadcrumbs = computed(() => [
  { label: t('search.home'), href: '/' },
  { label: t('search.arrangements'), href: '/search' },
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
.deal-page__score-wrap { display: flex; align-items: center; gap: 6px; }
.deal-page__score { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: var(--radius-sm); background: #004E4A; color: #fff; font-size: 13px; font-weight: 700; flex-shrink: 0; }
.deal-page__score-label { font-size: 13px; font-weight: 600; color: var(--color-text-primary); }
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
.mini-map__img { width: 100%; height: 100%; min-height: 200px; object-fit: cover; }
.mini-map__img--map { filter: saturate(0.85) contrast(1.05); }
.mini-map__pin { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -100%); filter: drop-shadow(0 3px 6px rgba(0,0,0,0.25)); z-index: 2; pointer-events: none; }
.mini-map__bottom { position: absolute; bottom: 0; left: 0; right: 0; padding: 10px 14px; background: linear-gradient(transparent, rgba(0,0,0,0.6)); display: flex; align-items: center; justify-content: space-between; z-index: 2; }
.mini-map__label { font-size: 14px; font-weight: 600; color: #fff; }
.mini-map__link { font-size: 13px; color: #fff; text-decoration: underline; text-underline-offset: 2px; opacity: 0.85; }
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
.sidebar__variant-cta { display: flex; flex-direction: column; align-items: flex-start; padding: var(--space-md) var(--space-lg); background: var(--color-background-secondary); border-radius: var(--radius-md); margin-bottom: var(--space-lg); }
.sidebar__variant-heading { font-family: var(--font-body); font-size: 14px; font-weight: 500; color: var(--color-text-primary); margin-bottom: 6px; }
.sidebar__variant-btn { display: inline-flex; align-items: center; gap: 6px; font: inherit; font-size: 14px; font-weight: 600; color: var(--color-primary); background: none; border: none; padding: 0; cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }
.sidebar__variant-btn:hover { opacity: 0.85; }
.sidebar__variant-btn svg { flex-shrink: 0; }

/* Calendar */
.sidebar__calendar { margin-bottom: var(--space-md); }
.sidebar__cal-title { font-family: var(--font-heading); font-size: 16px; font-weight: 700; color: var(--color-text-primary); margin-bottom: var(--space-sm); }

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

/* Trust section below sidebar */
.sidebar__trust {
  margin-top: var(--space-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.sidebar__trust-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: var(--space-lg);
}
.sidebar__trust-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}
.sidebar__trust-check {
  color: #004E4A;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}
.sidebar__trust-logo {
  height: 72px;
}

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
.highlight-item__icon { width: 40px; height: 40px; border-radius: var(--radius-md); background: #F8F2E6; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
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
.reviews__score-big { font-size: 24px; font-weight: 700; font-family: var(--font-heading); background: #004E4A; color: #fff; padding: 8px 12px; border-radius: var(--radius-sm); }
.reviews__score-meta { display: flex; flex-direction: column; gap: 1px; }
.reviews__score-verdict { font-size: 15px; font-weight: 600; color: var(--color-text-primary); }
.reviews__score-count { font-size: 13px; color: var(--color-text-muted); }
.reviews__categories { display: grid; grid-template-columns: 1fr 1fr; gap: 6px var(--space-xl); margin-bottom: var(--space-lg); max-width: 720px; }
.reviews__cat { display: grid; grid-template-columns: 110px 1fr 32px; align-items: center; gap: var(--space-sm); font-size: 13px; }
.reviews__cat-name { color: var(--color-text-secondary); }
.reviews__cat-bar { height: 6px; background: var(--color-border-light); border-radius: 3px; overflow: hidden; }
.reviews__cat-fill { height: 100%; background: #004E4A; border-radius: 3px; }
.reviews__cat-score { font-weight: 600; text-align: right; }
.reviews__grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
.review-card { padding: var(--space-md); background: var(--color-background-secondary); border-radius: var(--radius-md); display: flex; flex-direction: column; }
.review-card__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-sm); }
.review-card__author { font-size: 14px; font-weight: 600; }
.review-card__review-score { font-size: 13px; font-weight: 700; color: var(--color-text-primary); }
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
.review-card__arrangement svg { color: #004E4A; flex-shrink: 0; }

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
