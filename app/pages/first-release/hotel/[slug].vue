<template>
  <div class="hotel-page">
    <FirstReleaseSiteHeader />

    <main v-if="hotel" class="hotel-page__main">
      <!-- Breadcrumbs -->
      <section class="hotel-page__breadcrumbs container">
        <FirstReleaseBreadcrumbNav :items="breadcrumbs" />
      </section>

      <!-- Anchor tabs — desktop only. Mobile uses the sticky footer
           CTA instead of a top anchor nav. -->
      <nav v-if="!isMobile" class="hotel-page__tabs container">
        <a href="#overzicht" class="hotel-page__tab">{{ t('hotel.tabOverview') }}</a>
        <a href="#arrangementen" class="hotel-page__tab">{{ t('hotel.tabDeals') }}</a>
        <a href="#veelgestelde-vragen" class="hotel-page__tab">{{ t('hotel.tabFaq') }}</a>
        <a href="#huisregels" class="hotel-page__tab">{{ t('hotel.tabHouseRules') }}</a>
        <a href="#tips" class="hotel-page__tab">{{ t('hotel.tabNearby') }}</a>
        <!-- Heart + share — right-aligned in the tabs row, above the grey
             divider. Mirrors the deal-page `.deal-page__tabs-actions`
             pattern for cross-page consistency. -->
        <div class="hotel-page__tabs-actions">
          <button
            class="icon-action"
            :class="{ 'icon-action--favorited': isFavorited }"
            :aria-label="t('common.save')"
            @click="toggleFav(hotel.slug)"
          >{{ isFavorited ? '♥' : '♡' }}</button>
          <button class="icon-action" :aria-label="t('common.share')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
        </div>
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
            <svg class="hotel-page__meta-pin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{{ hotel.location.city }}, {{ hotel.location.region }}</span>
            <a href="#location" class="hotel-page__view-map-link" @click.prevent="scrollToMiniMap">{{ t('common.viewMap') || 'Bekijk op kaart' }}</a>
          </div>
        </div>
      </section>

      <!-- Hero Gallery -->
      <section class="container">
        <FirstReleaseHeroGallery :images="hotel.images" />
      </section>

      <!-- Description + Mini Map -->
      <section class="hotel-page__intro container">
        <div class="hotel-page__description-col">
          <div class="hotel-page__description">
            <div v-html="firstDescriptionParagraph"></div>
            <button
              v-if="hasMoreDescription"
              type="button"
              class="hotel-page__read-more"
              @click="showFullDescription = true"
            >
              {{ t('hotel.readMore') }}
            </button>
          </div>
        </div>
        <div id="location" class="mini-map">
          <NuxtLink
            :to="`/first-release/kaart?focus=${hotel.slug}`"
            class="mini-map__placeholder"
            :aria-label="t('common.viewMap')"
          >
            <FirstReleaseStaticMiniMap
              :lat="hotel.location.coordinates.lat"
              :lng="hotel.location.coordinates.lng"
              :zoom="10"
            />
            <div class="mini-map__pin">
              <FirstReleaseMapPin />
            </div>
          </NuxtLink>
          <div class="mini-map__footer">
            <span class="mini-map__address">{{ hotelStreetCity }}</span>
            <NuxtLink
              :to="`/first-release/kaart?focus=${hotel.slug}`"
              class="mini-map__view-link"
            >{{ t('common.viewMap') }}</NuxtLink>
          </div>
        </div>
      </section>

      <!-- Facilities -->
      <section class="hotel-page__facilities container">
        <h2 class="section-title">{{ t('hotel.facilities') }}</h2>
        <div class="facilities__grid">
          <div v-for="fac in hotel.facilities" :key="localized(fac.label)" class="facility-item">
            <img v-if="fac.icon" :src="fac.icon" alt="" class="facility-item__icon" loading="lazy" />
            <span v-else class="facility-item__check">✓</span>
            <span>{{ localized(fac.label) }}</span>
          </div>
        </div>
      </section>

      <!-- Deals section -->
      <section id="arrangementen" class="hotel-page__deals container">
        <!-- Search-page style header: bold title, handwritten subtitle,
             team avatars below. Mirrors `.search-page__header` styling. -->
        <div class="hotel-page__deals-header">
          <h2 class="hotel-page__deals-title">
            {{ filteredDealCards.length }} beschikbare arrangementen bij dit hotel
          </h2>
          <p class="hotel-page__deals-handwritten">
            Samengesteld door het ViaLuxury Team
          </p>
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
        <!-- Mid-page search bar — desktop only. Mobile users edit
             persons / arrival via the SiteHeader's search modal. -->
        <div v-if="!isMobile" class="hotel-page__deals-search">
          <FirstReleaseHotelSearchBar ref="searchBarRef" @search="handleSearchChange" />
        </div>
        <div class="deals__grid">
          <FirstReleaseDealCard
            v-for="card in filteredDealCards"
            :key="card.deal.id"
            :deal="card.deal"
            :hotel="searchHotel"
            :full-inclusions="card.inclusions"
            hide-hotel-info
            hide-labels
            grid-mode
          />
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
        <FirstReleaseHotelNearbyTips :tips="hotel.nearbyTips" :hotel-name="hotel.name" />
      </div>
    </main>

    <!-- Sticky CTA — TWO SEPARATE BRANCHES.
         MOBILE: bottom sticky footer with `ref="ctaBarRef"` so the
                 visualViewport-pin composable can keep it flush
                 with the visible bottom.
         DESKTOP: top sticky header that appears once scrolled
                  past 200 px (ctaBarVisible). NO ref, NO
                  composable — pure CSS `position: fixed; top: 0`.
                  Splitting prevents the composable from ever
                  writing inline `bottom` on the desktop element. -->
    <div
      v-if="hotel && isMobile"
      ref="ctaBarRef"
      class="hotel-page__cta-bar hotel-page__cta-bar--mobile"
    >
      <div class="hotel-page__cta-bar-inner container">
        <div class="hotel-page__cta-bar-cluster">
          <div v-if="cheapestDeal" class="hotel-page__cta-bar-price-block">
            <FirstReleaseStickyPriceRow
              lead="Vanaf"
              :lead-is-chip="false"
              :original="formatPrice(cheapestDeal.originalPrice)"
              :amount="formatPrice(cheapestDeal.basePrice)"
              :show-info="!isGerman"
              info-variant="deal"
            />
            <span v-if="isGerman" class="hotel-page__cta-bar-meta hotel-page__cta-bar-meta--de">
              <span>{{ stickyDeLine1 }}</span>
              <span>{{ stickyDeLine2 }}</span>
            </span>
            <span v-else class="hotel-page__cta-bar-meta">{{ cheapestPriceForLabel }}</span>
          </div>
          <button type="button" class="hotel-page__cta-bar-btn" @click="scrollToArrangements">
            Bekijk arrangementen
          </button>
        </div>
      </div>
    </div>

    <div
      v-else-if="hotel && ctaBarVisible"
      class="hotel-page__cta-bar"
    >
      <div class="hotel-page__cta-bar-inner container">
        <nav class="hotel-page__tabs hotel-page__tabs--in-bar">
          <a href="#overzicht" class="hotel-page__tab" :class="{ 'hotel-page__tab--active': activeAnchor === 'overzicht' }">{{ t('hotel.tabOverview') }}</a>
          <a href="#arrangementen" class="hotel-page__tab" :class="{ 'hotel-page__tab--active': activeAnchor === 'arrangementen' }">{{ t('hotel.tabDeals') }}</a>
          <a href="#veelgestelde-vragen" class="hotel-page__tab" :class="{ 'hotel-page__tab--active': activeAnchor === 'veelgestelde-vragen' }">{{ t('hotel.tabFaq') }}</a>
          <a v-if="hotel.houseRules && hotel.houseRules.length" href="#huisregels" class="hotel-page__tab" :class="{ 'hotel-page__tab--active': activeAnchor === 'huisregels' }">{{ t('hotel.tabHouseRules') }}</a>
          <a href="#tips" class="hotel-page__tab" :class="{ 'hotel-page__tab--active': activeAnchor === 'tips' }">{{ t('hotel.tabNearby') }}</a>
        </nav>
        <div class="hotel-page__cta-bar-cluster">
          <div v-if="cheapestDeal" class="hotel-page__cta-bar-price-block">
            <FirstReleaseStickyPriceRow
              lead="Vanaf"
              :lead-is-chip="false"
              :original="formatPrice(cheapestDeal.originalPrice)"
              :amount="formatPrice(cheapestDeal.basePrice)"
              :show-info="!isGerman"
              info-variant="deal"
            />
            <span v-if="isGerman" class="hotel-page__cta-bar-meta hotel-page__cta-bar-meta--de">
              <span>{{ stickyDeLine1 }}</span>
              <span>{{ stickyDeLine2 }}</span>
            </span>
            <span v-else class="hotel-page__cta-bar-meta">{{ cheapestPriceForLabel }}</span>
          </div>
          <button type="button" class="hotel-page__cta-bar-btn" @click="scrollToArrangements">
            Bekijk arrangementen
          </button>
        </div>
      </div>
    </div>

    <!-- Full description modal — same card layout as the deal page
         (square 2-col card, hotel photo left, scrolling text right). -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showFullDescription && hotel"
          class="desc-modal"
          @click.self="showFullDescription = false"
        >
          <div class="desc-modal__card">
            <div v-if="hotel.images && hotel.images.length" class="desc-modal__photo">
              <img :src="hotel.images[0].url" :alt="hotel.name" />
            </div>
            <div class="desc-modal__text" data-scroll-lock-allow="true">
              <button type="button" class="desc-modal__close" @click="showFullDescription = false" :aria-label="t('common.close')">×</button>
              <h2 class="desc-modal__title">{{ hotel.name }}</h2>
              <div class="desc-modal__body" v-html="localized(hotel.description)"></div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <FirstReleaseToastNotification />
    <FirstReleaseSiteFooter />
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/utils-first-release/formatPrice'
import { nightsLabel, personsLabel, roomsLabel } from '~/utils-first-release/plural'
import { useBodyScrollLock } from '~/composables-first-release/useBodyScrollLock'
import { usePinToViewportBottom } from '~/composables-first-release/usePinToViewportBottom'
import { isDealAvailableInWindow } from '~/utils-first-release/availability'
import { teamMembers } from '~/data/team-members'
import {
  mappedHotelsByHotelPermalink,
  mappedPackagesByPermalink,
  defaultDealPermalink,
} from '~/data/deals-mapper'
import { searchHotels } from '~/data/mock/search-hotels'
import DealCard from '~/components-first-release/search/DealCard.vue'

const { t, localized, locale } = useFirstReleaseI18n()
const isMobile = useFirstReleaseIsMobile()
const isGerman = computed(() => locale.value === 'de')
const route = useRoute()

// Resolve hotel by permalink with safe fallback
const hotelSlug = (route.params.slug as string) || ''
const fallbackHotel = mappedHotelsByHotelPermalink[Object.keys(mappedHotelsByHotelPermalink)[0]]
const initialHotel = mappedHotelsByHotelPermalink[hotelSlug] || fallbackHotel

const hotel = ref(initialHotel)

// Session-wide favourites (no login popup), keyed by hotel slug.
const { isFavorite: isFav, toggle: toggleFav } = useFirstReleaseFavorites()
const isFavorited = computed(() => isFav(hotel.value?.slug))

// Find all deals (packages) for this hotel
import { dealVariantsByPermalink, dealsMapByPermalink } from '~/data/deals-mapper'
const _firstPkgPermalink = Object.keys(dealsMapByPermalink).find(p => {
  const pkg = mappedPackagesByPermalink[p]
  return pkg && p.startsWith(hotelSlug)
}) || defaultDealPermalink
const _dealsMap = dealsMapByPermalink[_firstPkgPermalink] || {}
const deals = Object.values(_dealsMap)

/** SearchHotel record (with .deals as SearchHotelDeal[]) for the unified DealCard. */
const searchHotel = computed(() =>
  searchHotels.find(h => h.slug === hotelSlug)
    || searchHotels.find(h => h.deals.some(d => deals.some(dd => dd.id === d.id)))
    || null,
)

/** One card per deal of this hotel — feed the unified DealCard with the
 *  matching SearchHotelDeal and the full localised include list. */
const dealCards = computed(() => {
  const sh = searchHotel.value
  if (!sh) return []
  return sh.deals.map((shDeal) => {
    // Find the original raw Deal (with full .inclusions) so we can pass every
    // inclusion line, not just the 6 cached on SearchHotelDeal.
    const raw = deals.find(d => d.id === shDeal.id)
    const fullList = raw
      ? raw.inclusions.filter(i => !i.id.startsWith('inc-overnight')).map(i => localized(i.title))
      : shDeal.inclusions.map(i => localized(i))
    return { deal: shDeal, inclusions: fullList }
  })
})

const {
  setSearchGroup,
  persons: globalPersons,
  rooms: globalRooms,
  committedArrivalDate: globalArrivalDate,
  committedFlexibility: globalFlexibility,
} = useFirstReleaseSearchState()
const searchPersons = ref(globalPersons.value || 2)
const searchBarRef = ref<InstanceType<typeof import('~/components/hotel/HotelSearchBar.vue').default> | null>(null)

useHead({ title: `${hotel.value.name} | ViaLuxury` })

const dealsHeading = computed(() => t('hotel.availableDeals'))

// Team members for avatar row — shared with /search via the
// `~/data/team-members.ts` module so the hover-tooltip widget shows
// the same five Experience Makers (each with a real photo).
const hoveredMember = ref<string | null>(null)

/** Local-only search state — only `persons` propagates to the global state
 *  (so the rest of the site picks up the change); date / duration are kept
 *  per-page so the local bar doesn't override the user's main search. */
const localDuration = ref<string>('')
const localDate = ref<string | null>(null)

function handleSearchChange(params: { persons: number; rooms: number; duration: string; flexibility: number; date: string | null }) {
  searchPersons.value = params.persons
  // Persons + rooms ARE shared with the rest of the site (per spec).
  setSearchGroup(params.persons, params.rooms)
  // Date + duration only affect this page's deal list.
  localDate.value = params.date
  localDuration.value = params.duration
}

/** Filter the deal cards by the local search query (duration only — date
 *  doesn't change which packages exist, just which dates they apply to). */
const filteredDealCards = computed(() => {
  const dur = localDuration.value
  if (!dur) return dealCards.value
  return dealCards.value.filter(c => {
    const n = c.deal.nights
    if (dur === '5+') return n >= 5
    return String(n) === dur
  })
})

const breadcrumbs = computed(() => [
  { label: t('search.home'), href: '/' },
  { label: t('search.arrangements'), href: '/first-release/search' },
  { label: hotel.value.name },
])

const descriptionParagraphs = computed(() => {
  return localized(hotel.value.description).split('\n').filter(p => p.trim())
})

/** Show only the first paragraph; "Lees meer" opens the full description modal. */
const firstDescriptionParagraph = computed(() => descriptionParagraphs.value[0] ?? '')
const hasMoreDescription = computed(() => descriptionParagraphs.value.length > 1)
const showFullDescription = ref(false)
// Lock the underlying page while the description modal is open.
useBodyScrollLock().bindTo(showFullDescription)

// House rules accordion
const openRuleId = ref<string | null>(null)
function toggleRule(id: string) {
  openRuleId.value = openRuleId.value === id ? null : id
}

const openFaqId = ref<string | null>(null)
function toggleFaq(id: string) {
  openFaqId.value = openFaqId.value === id ? null : id
}


/** Cheapest deal of this hotel — drives the sticky CTA bar's price
 *  block. When a global arrival date is set, prefer the cheapest
 *  deal that's actually AVAILABLE in the flex-window around that
 *  date; fall back to the cheapest overall if nothing's available. */
const cheapestDeal = computed(() => {
  const sh = searchHotel.value
  if (!sh || sh.deals.length === 0) return null
  const sorted = [...sh.deals].sort((a, b) => a.basePrice - b.basePrice)
  const arrival = globalArrivalDate.value
  if (arrival) {
    const flex = globalFlexibility.value || 0
    const bookable = sorted.find(d => isDealAvailableInWindow(d.id, arrival, flex))
    if (bookable) return bookable
  }
  return sorted[0]
})

/** Plural-aware "Voor X nacht(en), Y personen, Z kamer(s)" — matches
 *  the deal-page sticky bar's wording. */
const cheapestPriceForLabel = computed(() => {
  const d = cheapestDeal.value
  if (!d) return ''
  return t('deal.priceFor')
    .replace('{nightsLabel}', nightsLabel(d.nights, 'nl'))
    .replace('{personsLabel}', personsLabel(globalPersons.value || 2, 'nl'))
    .replace('{roomsLabel}', roomsLabel(globalRooms.value || 1, 'nl'))
})

/** Sticky CTA bar element + viewport-bottom pin. Gated by
 *  `isMobile` so the desktop top-sticky-header variant of the
 *  bar stays untouched (no inline `bottom` written). On mobile,
 *  the pin tracks `visualViewport` and keeps the bar flush with
 *  the VISIBLE bottom edge as the browser chrome animates. */
const ctaBarRef = ref<HTMLElement | null>(null)
usePinToViewportBottom(ctaBarRef, isMobile)

/** Sticky CTA bar visibility — same scroll threshold as the deal page. */
const ctaBarVisible = ref(false)
function handleScroll() {
  ctaBarVisible.value = window.scrollY > 200
}

/** Smooth-scroll to the arrangements section. */
function scrollToArrangements() {
  const el = document.getElementById('arrangementen')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** Smooth-scroll to the mini-map block — wired to the "Bekijk
 *  kaart" link in the title meta line. */
function scrollToMiniMap() {
  if (!import.meta.client) return
  const el = document.getElementById('location')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** Street + city for the mini-map footer, mirrors the deal page. */
const hotelStreetCity = computed(() => {
  const loc = hotel.value.location
  const street = (loc as { street?: string }).street
  return street ? `${street}, ${loc.city}` : loc.city
})

/** Sticky CTA bar — German two-line meta (matches deal page). */
const stickyDeLine1 = computed(() => {
  const d = cheapestDeal.value
  if (!d) return ''
  return t('deal.stickyNoDatePrice').replace('{persons}', String(globalPersons.value || 2))
})
const stickyDeLine2 = computed(() =>
  globalArrivalDate.value ? t('deal.stickyTaxWithDate') : t('deal.stickyTaxNoDate'),
)

/** Active anchor for the sticky-bar nav — IntersectionObserver
 *  flips this to the section ID closest to the top of the viewport.
 *  Drives the bold/underline-off treatment on the matching tab. */
const activeAnchor = ref<string>('overzicht')
let anchorObserver: IntersectionObserver | null = null
function setupAnchorObserver() {
  if (!import.meta.client) return
  const ids = ['overzicht', 'arrangementen', 'veelgestelde-vragen', 'huisregels', 'tips', 'location']
  const targets = ids.map(id => document.getElementById(id)).filter((el): el is HTMLElement => !!el)
  if (!targets.length) return
  anchorObserver?.disconnect()
  anchorObserver = new IntersectionObserver(
    (entries) => {
      // Pick the topmost intersecting section (smallest top offset).
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (visible.length && visible[0].target.id) activeAnchor.value = visible[0].target.id
    },
    { rootMargin: '-100px 0px -60% 0px', threshold: 0 },
  )
  for (const el of targets) anchorObserver.observe(el)
}

// Sync FR nav-bar variant with the user's last homepage pick so the
// SiteHeader on this internal page matches the chosen variant. Reads
// localStorage (or the URL if it matches a known variant path).
onMounted(() => {
  const { restoreFrNavVariant } = useFirstReleaseHomeVariant()
  restoreFrNavVariant(window.location.pathname)
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
  nextTick(setupAnchorObserver)
})
onBeforeUnmount(() => {
  if (typeof window !== 'undefined') window.removeEventListener('scroll', handleScroll)
  anchorObserver?.disconnect()
  anchorObserver = null
})
</script>

<style scoped>
/* ===== BREADCRUMBS ===== */
.hotel-page__breadcrumbs { padding-top: var(--space-md); }

/* ===== ANCHOR TABS ===== */
.hotel-page__tabs {
  position: relative;
  display: flex;
  gap: var(--space-lg);
  padding-top: var(--space-md);
  padding-bottom: var(--space-md);
}
.hotel-page__tabs::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: var(--space-lg);
  right: var(--space-lg);
  height: 1px;
  background: var(--color-border-light);
}
/* Anchor tabs — underlined deal-page style. Default underlined,
   hover deepens text. In-bar variant drops underline on the
   active tab and bumps to bold. */
.hotel-page__tab {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: underline;
  text-underline-offset: 3px;
  padding-bottom: var(--space-sm);
  border-bottom: none;
  transition: color var(--transition-fast);
}
.hotel-page__tab:hover {
  color: var(--color-text-primary);
  text-decoration: underline;
}
.hotel-page__tabs--in-bar { padding: 0; border-bottom: none; }
.hotel-page__tabs--in-bar::after { display: none; }
.hotel-page__tabs--in-bar .hotel-page__tab {
  padding-bottom: 0;
  border-bottom: none;
  text-decoration: underline;
}
.hotel-page__tabs--in-bar .hotel-page__tab--active {
  text-decoration: none;
  color: var(--color-text-primary);
  font-weight: 700;
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
.hotel-page__meta { display: flex; align-items: center; gap: var(--space-sm); font-size: 14px; color: var(--color-text-secondary); flex-wrap: wrap; }
.hotel-page__meta-pin { flex-shrink: 0; color: var(--color-text-secondary); }
.hotel-page__meta .hotel-page__view-map-link { margin-left: 8px; color: var(--color-primary, #c9a85c); font-weight: 600; text-decoration: underline; }
.hotel-page__score-wrap { display: flex; align-items: center; gap: 6px; }
.hotel-page__score { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: var(--radius-sm); background: #00B67A; color: #fff; font-size: 13px; font-weight: 700; flex-shrink: 0; }
.hotel-page__score-label { font-size: 13px; font-weight: 600; color: var(--color-text-primary); }
.hotel-page__divider { color: var(--color-text-muted); }
/* Heart + share live inside `.hotel-page__tabs` (right-aligned via
   `.hotel-page__tabs-actions` in fr-variant-6.css), same row as the
   anchor links and above the section's grey divider — mirrors the
   deal page. */
.icon-action { width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--color-border); display: inline-flex; align-items: center; justify-content: center; font-size: 16px; background: var(--color-surface); cursor: pointer; color: var(--color-text-primary); }
.icon-action:hover { border-color: var(--color-primary); }
.icon-action--favorited { color: #e74c3c; border-color: #e74c3c; }

/* ===== INTRO (description + map) ===== */
.hotel-page__intro { display: grid; grid-template-columns: 1fr 340px; gap: var(--space-xl); padding-top: var(--space-lg); padding-bottom: var(--space-xl); }
.hotel-page__description-col { display: flex; flex-direction: column; gap: var(--space-md); }
.hotel-page__description { font-size: 15px; line-height: 1.75; color: var(--color-text-secondary); }
.hotel-page__description p { margin: 0; }
.hotel-page__read-more { background: none; border: 0; padding: 0; margin-top: 6px; cursor: pointer; color: var(--color-primary); font-size: 14px; font-weight: 600; text-decoration: underline; text-underline-offset: 2px; }
.hotel-page__read-more:hover { color: var(--color-primary-hover); }

/* Description modal */
/* Full description modal — same look as the deal page. Overlay
   + close button styles are local; the card layout (2-col grid,
   photo left, scrolling text right) lives in fr-variant-6.css
   keyed on `.desc-modal__card`. */
.desc-modal {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  padding: var(--space-lg);
}
.desc-modal__close {
  position: absolute;
  top: var(--space-md); right: var(--space-md);
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: var(--color-text-primary);
  font-size: 22px; line-height: 1;
}
.desc-modal__close:hover { border-color: var(--color-primary); }
.desc-modal__title { font-family: var(--font-heading); font-size: 22px; font-weight: 700; margin: 0 0 var(--space-md); padding-right: 40px; }
.desc-modal__body { font-size: 15px; line-height: 1.75; color: var(--color-text-secondary); }
.desc-modal__body p { margin: 0 0 var(--space-md); }

/* Mini map */
/* Mini map — match the deal-page layout. Photo wrapped in a
   NuxtLink that navigates to the full kaart; a separate footer
   row below the photo carries the street + city and a
   "Bekijk kaart" link (no overlay strip on the image). */
.mini-map { display: flex; flex-direction: column; gap: 8px; scroll-margin-top: 88px; }
.mini-map__placeholder { position: relative; display: block; width: 100%; aspect-ratio: 1 / 1; border-radius: var(--radius-lg); overflow: hidden; cursor: pointer; }
.mini-map__pin { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -100%); filter: drop-shadow(0 3px 6px rgba(0,0,0,0.25)); z-index: 2; pointer-events: none; }
.mini-map__footer { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-md); }
.mini-map__address { font-family: var(--font-body); font-size: 13px; color: var(--color-text-secondary); line-height: 1.4; }
.mini-map__view-link {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary, #c9a85c);
  text-decoration: underline;
  text-underline-offset: 2px;
  white-space: nowrap;
}
.mini-map__view-link:hover { color: var(--color-primary-hover, #b08a40); }

/* ===== SECTION TITLES ===== */
.section-title { font-size: 22px; font-weight: 600; margin-bottom: var(--space-lg); }

/* ===== FACILITIES ===== */
.hotel-page__facilities { padding: var(--space-xl) var(--space-lg); position: relative; }
.facilities__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md); }
.facility-item { display: flex; align-items: center; gap: var(--space-sm); font-size: 14px; }
.facility-item__icon { width: 22px; height: 22px; flex-shrink: 0; object-fit: contain; }
.facility-item__check { color: var(--color-discount); font-weight: 700; }

/* ===== DEALS ===== */
.hotel-page__deals { padding: var(--space-xl) var(--space-lg); position: relative; }
.hotel-page__deals .section-title { margin-bottom: var(--space-md); }

/* Search-page style header: bold title + handwritten subtitle +
   team avatars stacked below. Mirrors `.search-page__header` so the
   two pages share the same celebratory typography. */
.hotel-page__deals-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: var(--space-lg);
}
.hotel-page__deals-title {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-text-primary);
  margin: 0;
}
.hotel-page__deals-handwritten {
  font-family: 'Oooh Baby', cursive;
  font-size: 23px;
  line-height: 1.1;
  color: var(--color-text-primary);
  margin: 4px 0 8px;
  padding-right: 6px;
}
.hotel-page__deals-search {
  display: flex;
  justify-content: flex-start;
  margin: var(--space-md) 0 var(--space-lg);
}
.hotel-page__deals-search .hotel-search-bar { width: 75%; max-width: none; }
.hotel-page__deals-search .hotel-search-bar__fields { max-width: none; }

/* Team avatars (mirrors /search styles) */
.team-avatars { display: flex; gap: 0; flex-shrink: 0; }
.team-avatars__item { position: relative; margin-left: -8px; }
.team-avatars__item:first-child { margin-left: 0; }
.team-avatars__circle {
  width: 40px; height: 40px; border-radius: 50%; background: var(--color-background-secondary);
  border: 2px solid #fff; display: flex; align-items: center; justify-content: center;
  overflow: hidden; cursor: pointer; transition: transform 150ms ease, box-shadow 150ms ease;
  position: relative; z-index: 1;
}
.team-avatars__item:hover .team-avatars__circle {
  transform: scale(1.15); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); z-index: 5;
}
.team-avatars__circle--photo img { width: 100%; height: 100%; object-fit: cover; }
.team-avatars__initials { font-family: var(--font-body); font-size: 13px; font-weight: 600; color: var(--color-text-secondary); line-height: 1; }
.team-avatars__tooltip {
  position: absolute; top: calc(100% + 8px); right: 0; width: 240px; padding: 12px 14px;
  background: #fff; border: 1px solid var(--color-border); border-radius: var(--radius-md);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12); z-index: 100; pointer-events: none;
}
.team-avatars__tooltip-name { display: block; font-family: var(--font-heading); font-size: 15px; font-weight: 700; color: var(--color-text-primary); margin-bottom: 4px; }
.team-avatars__tooltip-role { display: block; font-size: 13px; line-height: 1.45; color: var(--color-text-secondary); margin-bottom: 6px; }
.team-avatars__tooltip-score { display: block; font-size: 12px; font-weight: 600; color: var(--color-text-primary); }
.tooltip-fade-enter-active, .tooltip-fade-leave-active { transition: opacity 150ms ease; }
.tooltip-fade-enter-from, .tooltip-fade-leave-to { opacity: 0; }
.deals__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-lg); margin-top: var(--space-lg); }
@media (max-width: 1023px) { .deals__grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 640px)  { .deals__grid { grid-template-columns: 1fr; } }

/* ===== REVIEWS ===== */
.hotel-page__reviews { padding: var(--space-xl) var(--space-lg); position: relative; }
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
.hotel-page__house-rules { padding: var(--space-xl) var(--space-lg); position: relative; }
/* Inset top divider for the lower full-width sections */
.hotel-page__facilities::before,
.hotel-page__deals::before,
.hotel-page__reviews::before,
.hotel-page__house-rules::before,
.hotel-page__faq::before {
  content: '';
  position: absolute;
  top: 0;
  left: var(--space-lg);
  right: var(--space-lg);
  height: 1px;
  background: var(--color-border-light);
}
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
.house-rule:first-child {
  border-top: none;
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
.hotel-page__faq { padding: var(--space-xl) var(--space-lg); position: relative; }
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
  .hotel-page__deals-title { font-size: 22px; }
  .facilities__grid { grid-template-columns: 1fr 1fr; }
  .deals__grid { grid-template-columns: 1fr; }
  /* Reserve space for the mobile sticky footer (12 + 55 + 12 px =
     79 px, + small breathing margin) so the FAQ / Tips sections at
     the bottom of the page don't slide under the fixed bar. */
  .hotel-page__main { padding-bottom: 112px; }
}

/* ===== STICKY CTA BAR (top, after scroll) =====
   Mirrors `.deal-page__cta-bar` so both pages share one visual
   language. The button smooth-scrolls to #arrangementen. */
.hotel-page__cta-bar {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 100;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
/* Mobile variant: anchored to the BOTTOM of the viewport, always
   visible (no scroll trigger). Mirrors the deal page's mobile
   sticky footer chrome. */
.hotel-page__cta-bar--mobile {
  top: auto;
  bottom: 0;
  border-bottom: none;
  border-top: 1px solid var(--color-border);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
  /* Extend the bar's white bg into the safe-area inset at the
     bottom (iPhone home-indicator strip, Chrome dynamic bottom
     bar). Mirrors the deal-page sticky footer. */
  padding-bottom: env(safe-area-inset-bottom, 0);
}
.hotel-page__cta-bar--mobile .hotel-page__cta-bar-inner {
  padding-top: 12px;
  padding-bottom: 12px;
}
.hotel-page__cta-bar--mobile .hotel-page__cta-bar-cluster {
  flex: 1 1 auto;
  justify-content: space-between;
}
.hotel-page__cta-bar--mobile .hotel-page__cta-bar-price-block {
  align-items: flex-start;
  flex: 1 1 auto;
  min-width: 0;
}
.hotel-page__cta-bar--mobile .hotel-page__cta-bar-btn {
  margin-left: auto;
  flex: 0 0 auto;
}
.hotel-page__cta-bar--mobile .hotel-page__cta-bar-meta {
  text-align: left;
}
.hotel-page__cta-bar--mobile .hotel-page__cta-bar-meta--de {
  align-items: flex-start;
  font-size: 11px;
  color: var(--color-text-muted);
  line-height: 1.3;
}
.hotel-page__cta-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: 10px var(--space-lg);
}
.hotel-page__tabs--in-bar {
  padding: 0;
  border: 0;
}
.hotel-page__tabs--in-bar::after { display: none; }
.hotel-page__cta-bar-cluster {
  display: flex;
  align-items: center;
  gap: 16px;
}
.hotel-page__cta-bar-price-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
/* NOTE: the price ROW (vanaf/chip · original · amount · icon) and
   its bottom-alignment live in the shared
   `FirstReleaseStickyPriceRow` component — single source of truth,
   do NOT re-add price-row CSS here. */
.hotel-page__cta-bar-meta {
  font-size: 11px;
  color: var(--color-text-muted);
  white-space: nowrap;
}
/* German two-line meta — stacks "Preis für …" + "Exkl. Kurtaxe
   und Verwaltungskosten" right-aligned, matching deal page. */
.hotel-page__cta-bar-meta--de {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.3;
  white-space: nowrap;
}
.hotel-page__cta-bar-btn {
  flex: 0 0 auto;
  /* 1.25× the previous 44 px — matches the deal-page sticky bar. */
  height: 55px;
  padding: 0 24px;
  font-size: 15px;
  font-weight: 600;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: background var(--transition-fast);
}
.hotel-page__cta-bar-btn:hover {
  background: var(--color-primary-hover);
}
@media (max-width: 768px) {
  .hotel-page__cta-bar-inner { padding: 8px var(--space-md); }
  .hotel-page__tabs--in-bar { display: none; }
  .hotel-page__cta-bar-cluster { flex: 1; justify-content: space-between; }
}
</style>
