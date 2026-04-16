<template>
  <div class="hotel-page">
    <TopBar />
    <SiteHeader />

    <main v-if="hotel" class="hotel-page__main">
      <!-- Breadcrumbs -->
      <section class="hotel-page__breadcrumbs container">
        <BreadcrumbNav :items="breadcrumbs" />
      </section>

      <!-- Anchor tabs -->
      <nav class="hotel-page__tabs container">
        <a href="#overzicht" class="hotel-page__tab">{{ t('hotel.tabOverview') }}</a>
        <a href="#arrangementen" class="hotel-page__tab">{{ t('hotel.tabDeals') }}</a>
        <a href="#beoordelingen" class="hotel-page__tab">{{ t('hotel.tabReviews') }}</a>
        <a href="#veelgestelde-vragen" class="hotel-page__tab">{{ t('hotel.tabFaq') }}</a>
        <a href="#huisregels" class="hotel-page__tab">{{ t('hotel.tabHouseRules') }}</a>
        <a href="#tips" class="hotel-page__tab">{{ t('hotel.tabNearby') }}</a>
      </nav>

      <!-- Title section -->
      <section id="overzicht" class="hotel-page__title-section container">
        <div class="hotel-page__title-left">
          <div class="hotel-page__name-wrap">
            <h1 class="hotel-page__name">{{ hotel.name }}</h1>
            <div class="hotel-page__stars" aria-hidden="true">
              <span v-for="n in hotel.starRating" :key="n" class="star-adj">★</span>
            </div>
          </div>
          <p v-if="hotel.pitch" class="hotel-page__pitch">{{ localized(hotel.pitch) }}</p>
          <div class="hotel-page__meta">
            <div class="hotel-page__score-wrap">
              <span class="hotel-page__score">{{ hotel.reviews.overallScore.toFixed(1) }}</span>
              <span class="hotel-page__score-label">{{ t(getReviewLabelKey(hotel.reviews.overallScore)) }}</span>
            </div>
            <span class="hotel-page__divider">|</span>
            <span>{{ hotel.reviews.totalReviews }} {{ t('common.reviews') }}</span>
            <span class="hotel-page__divider">·</span>
            <span>{{ hotel.location.city }}, {{ hotel.location.region }}</span>
          </div>
        </div>
        <div class="hotel-page__title-actions">
          <button class="icon-action" :aria-label="t('common.save')">♡</button>
          <button class="icon-action" :aria-label="t('common.share')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
        </div>
      </section>

      <!-- Hero Gallery -->
      <section class="container">
        <HeroGallery :images="hotel.images" />
      </section>

      <!-- Description + Mini Map -->
      <section class="hotel-page__intro container">
        <div class="hotel-page__description-col">
          <p v-for="(para, idx) in descriptionParagraphs" :key="idx" class="hotel-page__description">{{ para }}</p>
        </div>
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
                <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z" fill="#00B67A"/>
                <circle cx="16" cy="16" r="6" fill="#fff"/>
              </svg>
            </div>
            <div class="mini-map__bottom">
              <span class="mini-map__label">{{ hotel.location.city }}</span>
              <a href="#location" class="mini-map__link">{{ t('common.viewMap') }}</a>
            </div>
          </div>
        </div>
      </section>

      <!-- Facilities -->
      <section class="hotel-page__facilities container">
        <h2 class="section-title">{{ t('hotel.facilities') }}</h2>
        <div class="facilities__grid">
          <div v-for="fac in hotel.facilities" :key="localized(fac.label)" class="facility-item">
            <span class="facility-item__check">✓</span>
            <span>{{ localized(fac.label) }}</span>
          </div>
        </div>
      </section>

      <!-- Deals section -->
      <section id="arrangementen" class="hotel-page__deals container">
        <h2 class="section-title">{{ dealsHeading }}</h2>
        <HotelSearchBar ref="searchBarRef" @search="handleSearchChange" />
        <div class="deals__grid">
          <HotelDealCard
            v-for="card in dealCards"
            :key="card.deal.id"
            :deal="card.deal"
            :hotel-slug="hotel.slug"
            :image="card.image"
            :inclusion-labels="card.inclusions"
            :persons="searchPersons"
          />
        </div>
      </section>

      <!-- Reviews -->
      <section id="beoordelingen" class="hotel-page__reviews container">
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

      <!-- House Rules -->
      <section v-if="hotel.houseRules && hotel.houseRules.length" id="huisregels" class="hotel-page__house-rules container">
        <div class="house-rules__layout">
          <div class="house-rules__left">
            <h2 class="section-title">{{ t('hotel.houseRules') }}</h2>
            <p class="house-rules__intro">{{ t('hotel.houseRulesIntro') }}</p>
          </div>
          <div class="house-rules__right">
            <div
              v-for="rule in hotel.houseRules"
              :key="rule.id"
              class="house-rule"
              :class="{ 'house-rule--open': openRuleId === rule.id }"
            >
              <button class="house-rule__title" @click="toggleRule(rule.id)">
                <span>{{ localized(rule.title) }}</span>
                <span class="house-rule__arrow">{{ openRuleId === rule.id ? '−' : '+' }}</span>
              </button>
              <div v-if="openRuleId === rule.id" class="house-rule__body">
                <p>{{ localized(rule.description) }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section id="veelgestelde-vragen" class="hotel-page__faq container">
        <div class="faq__layout">
          <div class="faq__left">
            <h2 class="section-title">{{ t('hotel.faqHeading') }}</h2>
          </div>
          <div class="faq__right">
            <div
              v-for="item in hotel.faq"
              :key="item.id"
              class="house-rule"
              :class="{ 'house-rule--open': openFaqId === item.id }"
            >
              <button class="house-rule__title" @click="toggleFaq(item.id)">
                <span>{{ localized(item.question) }}</span>
                <span class="house-rule__arrow">{{ openFaqId === item.id ? '−' : '+' }}</span>
              </button>
              <div v-if="openFaqId === item.id" class="house-rule__body">
                <p>{{ localized(item.answer) }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Nearby Tips -->
      <div id="tips">
        <HotelNearbyTips :tips="hotel.nearbyTips" :hotel-name="hotel.name" />
      </div>
    </main>

    <AuthPopup />
    <ToastNotification />
    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/utils/formatPrice'
import { getReviewLabelKey } from '~/utils/reviewLabel'
import {
  hotelKasteelTerWorm,
  dealKasteel1Night,
  dealKasteel2Nights,
  dealKasteel3Nights,
} from '~/data/mock/kasteel-ter-worm'

const { t, localized } = useI18n()

const hotel = ref(hotelKasteelTerWorm)
const deals = [dealKasteel1Night, dealKasteel2Nights, dealKasteel3Nights]

const dealCards = [
  {
    deal: dealKasteel1Night,
    image: '/images/arrangement/wellness.jpg',
    inclusions: [
      '1x Overnachting',
      'Dagelijks uitgebreid ontbijtbuffet',
      'Welkomstbubbels bij aankomst',
      'Toegang tot gloednieuwe wellness',
      'Gebruik van binnenzwembad',
      'Culinair 3-gangendiner (1 avond)',
    ],
  },
  {
    deal: dealKasteel2Nights,
    image: '/images/arrangement/diner.jpg',
    inclusions: [
      '2x Overnachting',
      'Dagelijks uitgebreid ontbijtbuffet',
      'Welkomstbubbels bij aankomst',
      'Toegang tot gloednieuwe wellness',
      'Gebruik van binnenzwembad',
      'Culinair 3-gangendiner (2 avonden)',
    ],
  },
  {
    deal: dealKasteel3Nights,
    image: '/images/arrangement/bike.jpg',
    inclusions: [
      '3x Overnachting',
      'Dagelijks uitgebreid ontbijtbuffet',
      'Welkomstbubbels bij aankomst',
      'Toegang tot gloednieuwe wellness',
      'Gebruik van binnenzwembad',
      'Culinair 3-gangendiner (2 avonden)',
      'Gratis fietsverhuur (1 dag)',
    ],
  },
]

const { setSearchGroup, persons: globalPersons } = useSearchState()
const searchPersons = ref(globalPersons.value || 2)
const searchBarRef = ref<InstanceType<typeof import('~/components/hotel/HotelSearchBar.vue').default> | null>(null)

useHead({ title: `${hotel.value.name} | ViaLuxury` })

const dealsHeading = computed(() => t('hotel.availableDeals'))

function handleSearchChange(params: { persons: number; rooms: number; duration: string; flexibility: number; date: string | null }) {
  searchPersons.value = params.persons
  setSearchGroup(params.persons, params.rooms)
}

const breadcrumbs = computed(() => [
  { label: t('search.home'), href: '/' },
  { label: t('search.arrangements'), href: '/search' },
  { label: hotel.value.name },
])

const descriptionParagraphs = computed(() => {
  return localized(hotel.value.description).split('\n').filter(p => p.trim())
})

// House rules accordion
const openRuleId = ref<string | null>(null)
function toggleRule(id: string) {
  openRuleId.value = openRuleId.value === id ? null : id
}

const openFaqId = ref<string | null>(null)
function toggleFaq(id: string) {
  openFaqId.value = openFaqId.value === id ? null : id
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
</script>

<style scoped>
/* ===== BREADCRUMBS ===== */
.hotel-page__breadcrumbs { padding-top: var(--space-md); }

/* ===== ANCHOR TABS ===== */
.hotel-page__tabs {
  display: flex;
  gap: var(--space-lg);
  padding-top: var(--space-md);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border-light);
}
.hotel-page__tab {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  text-decoration: none;
  padding-bottom: var(--space-sm);
  border-bottom: 2px solid transparent;
  transition: border-color var(--transition-fast), color var(--transition-fast);
}
.hotel-page__tab:hover {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

/* ===== TITLE SECTION ===== */
.hotel-page__title-section {
  padding-top: var(--space-lg); padding-bottom: var(--space-md);
  display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-md);
}
.hotel-page__title-left { flex: 1; min-width: 0; }
.hotel-page__name-wrap {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.hotel-page__name {
  font-size: 26px;
  font-weight: 700;
  line-height: 1.3;
}
.hotel-page__stars {
  display: inline-flex;
  align-items: center;
  gap: 1px;
}
.hotel-page__stars .star-adj {
  font-size: 20px;
  line-height: 1;
  color: #111111;
  -webkit-font-smoothing: none;
  text-rendering: geometricPrecision;
}
.hotel-page__pitch {
  font-size: 15px;
  line-height: 1.65;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}
.hotel-page__meta { display: flex; align-items: center; gap: var(--space-sm); font-size: 14px; color: var(--color-text-secondary); }
.hotel-page__score-wrap { display: flex; align-items: center; gap: 6px; }
.hotel-page__score { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: var(--radius-sm); background: #00B67A; color: #fff; font-size: 13px; font-weight: 700; flex-shrink: 0; }
.hotel-page__score-label { font-size: 13px; font-weight: 600; color: var(--color-text-primary); }
.hotel-page__divider { color: var(--color-text-muted); }
.hotel-page__title-actions { display: flex; gap: var(--space-sm); flex-shrink: 0; }
.icon-action { width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--color-border); display: flex; align-items: center; justify-content: center; font-size: 18px; background: var(--color-surface); cursor: pointer; }
.icon-action:hover { border-color: var(--color-primary); }

/* ===== INTRO (description + map) ===== */
.hotel-page__intro { display: grid; grid-template-columns: 1fr 340px; gap: var(--space-xl); padding-top: var(--space-lg); padding-bottom: var(--space-xl); }
.hotel-page__description-col { display: flex; flex-direction: column; gap: var(--space-md); }
.hotel-page__description { font-size: 15px; line-height: 1.75; color: var(--color-text-secondary); }

/* Mini map */
.mini-map { border-radius: var(--radius-lg); overflow: hidden; height: 100%; min-height: 200px; }
.mini-map__placeholder { position: relative; width: 100%; height: 100%; min-height: 200px; border-radius: var(--radius-lg); overflow: hidden; }
.mini-map__img { width: 100%; height: 100%; min-height: 200px; object-fit: cover; }
.mini-map__img--map { filter: saturate(0.85) contrast(1.05); }
.mini-map__pin { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -100%); filter: drop-shadow(0 3px 6px rgba(0,0,0,0.25)); z-index: 2; pointer-events: none; }
.mini-map__bottom { position: absolute; bottom: 0; left: 0; right: 0; padding: 10px 14px; background: linear-gradient(transparent, rgba(0,0,0,0.6)); display: flex; align-items: center; justify-content: space-between; z-index: 2; }
.mini-map__label { font-size: 14px; font-weight: 600; color: #fff; }
.mini-map__link { font-size: 13px; color: #fff; text-decoration: underline; text-underline-offset: 2px; opacity: 0.85; }
.mini-map__link:hover { opacity: 1; }

/* ===== SECTION TITLES ===== */
.section-title { font-size: 22px; font-weight: 600; margin-bottom: var(--space-lg); }

/* ===== FACILITIES ===== */
.hotel-page__facilities { padding: var(--space-xl) 0; border-top: 1px solid var(--color-border-light); }
.facilities__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md); }
.facility-item { display: flex; align-items: center; gap: var(--space-sm); font-size: 14px; }
.facility-item__check { color: var(--color-discount); font-weight: 700; }

/* ===== DEALS ===== */
.hotel-page__deals { padding: var(--space-xl) 0; border-top: 1px solid var(--color-border-light); }
.hotel-page__deals .section-title { margin-bottom: var(--space-md); }
.deals__grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xl); margin-top: var(--space-lg); }

/* ===== REVIEWS ===== */
.hotel-page__reviews { padding: var(--space-xl) 0; border-top: 1px solid var(--color-border-light); }
.reviews__score-bar { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md); }
.reviews__score-big { font-size: 24px; font-weight: 700; font-family: var(--font-heading); background: #00B67A; color: #fff; padding: 8px 12px; border-radius: var(--radius-sm); }
.reviews__score-meta { display: flex; flex-direction: column; gap: 1px; }
.reviews__score-verdict { font-size: 15px; font-weight: 600; color: var(--color-text-primary); }
.reviews__score-count { font-size: 13px; color: var(--color-text-muted); }
.reviews__categories { display: grid; grid-template-columns: 1fr 1fr; gap: 6px var(--space-xl); margin-bottom: var(--space-lg); max-width: 720px; }
.reviews__cat { display: grid; grid-template-columns: 110px 1fr 32px; align-items: center; gap: var(--space-sm); font-size: 13px; }
.reviews__cat-name { color: var(--color-text-secondary); }
.reviews__cat-bar { height: 6px; background: var(--color-border-light); border-radius: 3px; overflow: hidden; }
.reviews__cat-fill { height: 100%; background: #00B67A; border-radius: 3px; }
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
.review-card__arrangement svg { color: #00B67A; flex-shrink: 0; }

/* ===== HOUSE RULES ===== */
.hotel-page__house-rules { padding: var(--space-xl) 0; border-top: 1px solid var(--color-border-light); }
.house-rules__layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: var(--space-2xl);
}
.house-rules__left .section-title { margin-bottom: var(--space-sm); }
.house-rules__intro {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}
.house-rules__right {
  max-width: 700px;
}
.house-rule {
  border-top: 1px solid var(--color-border-light);
}
.house-rule:last-child {
  border-bottom: 1px solid var(--color-border-light);
}
.house-rule__title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: var(--space-md) 0;
  font-size: 15px;
  font-weight: 600;
  text-align: left;
  color: var(--color-text-primary);
  background: none;
  border: none;
  cursor: pointer;
}
.house-rule__title:hover { color: var(--color-primary); }
.house-rule__arrow {
  font-size: 20px;
  font-weight: 300;
  flex-shrink: 0;
  margin-left: var(--space-md);
}
.house-rule__body {
  padding-bottom: var(--space-md);
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

/* ===== FAQ ===== */
.hotel-page__faq { padding: var(--space-xl) 0; }
.faq__layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: var(--space-2xl);
}
.faq__right {
  max-width: 700px;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1100px) {
  .hotel-page__intro { grid-template-columns: 1fr; }
  .mini-map { max-height: 250px; }
  .mini-map__placeholder { max-height: 250px; }
  .reviews__grid { grid-template-columns: 1fr; }
  .reviews__categories { grid-template-columns: 1fr; }
  .house-rules__layout { grid-template-columns: 1fr; gap: var(--space-lg); }
  .faq__layout { grid-template-columns: 1fr; gap: var(--space-lg); }
}
@media (max-width: 768px) {
  .hotel-page__name { font-size: 22px; }
  .hotel-page__name-wrap { flex-wrap: wrap; }
  .hotel-page__tabs { gap: var(--space-md); overflow-x: auto; white-space: nowrap; }
  .facilities__grid { grid-template-columns: 1fr 1fr; }
  .deals__grid { grid-template-columns: 1fr; }
}
</style>
