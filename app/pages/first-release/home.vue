<template>
  <div class="home">
    <!-- Hero with full-bleed background image -->
    <section class="home-hero">
      <!-- <img> + object-fit gives identical cropping in every browser
           (Edge / Firefox / Safari handle background-size: cover with
           subtly different subpixel rounding). The wrapper keeps the
           ::after gradient overlay. -->
      <div
        class="home-hero__bg"
        :class="{
          /* Pills 1 and 8 sit a bit too high in the default
             `object-position: center bottom` crop — push them 200 px
             DOWN within the same crop window so more of the upper
             portion shows. */
          'home-hero__bg--shift-down': heroPhotoIndex === 0 || heroPhotoIndex === 7,
        }"
      >
        <img class="home-hero__bg-img" :src="heroPhotoUrl" alt="" />
      </div>
      <!-- Help / phone block + pay-off both removed — both now live
           inside SiteHeader's row 2. -->

      <FirstReleaseSiteHeader variant="overlay">
        <template #hero>
          <div class="home-hero__content container">
            <div class="home-hero__eyebrow">
              <span class="home-hero__eyebrow-dot" aria-hidden="true" />
              <span>SPRING 2026</span>
            </div>
            <h1 class="home-hero__title">
              Experience<span class="home-hero__title-em"> more</span>
            </h1>
            <p class="home-hero__tagline">
              Onze experience creators stellen complete verblijven samen met luxe extra's en exclusieve voordelen, zodat jij meer beleeft voor een scherpere prijs.
            </p>
          </div>
        </template>
      </FirstReleaseSiteHeader>

    </section>

    <!-- Persuasion block — three short claims directly below the hero
         photo. Trustpilot on the left, social-proof in the middle,
         flexibility on the right. -->
    <section class="home-persuasion">
      <div class="container home-persuasion__inner">
        <div class="home-persuasion__col home-persuasion__col--trust">
          <img src="/images/trustpilot.svg" alt="Trustpilot" class="home-persuasion__trustpilot" />
          <p class="home-persuasion__text">15.294 gasten beoordelen ons met een 9 uit 10</p>
        </div>
        <div class="home-persuasion__col">
          <span class="home-persuasion__award" aria-hidden="true">
            <!-- Award / medal icon (Lucide-style). Same visual height as
                 the Trustpilot logo so the three columns sit on a line. -->
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="8" r="6" />
              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
              <!-- "1M" centred inside the medal disc. Font-size 6 fits
                   comfortably inside the r=6 circle; stroke is removed
                   so the letters render as solid currentColor fill. -->
              <text x="12" y="8" text-anchor="middle" dominant-baseline="central" font-size="6" font-weight="700" font-family="var(--font-heading)" stroke="none" fill="currentColor">1M</text>
            </svg>
          </span>
          <p class="home-persuasion__text">Al meer dan 1 miljoen arrangementen geboekt.</p>
        </div>
        <div class="home-persuasion__col">
          <!-- "Flexibel annuleren" — Lucide `arrow-left-right` icon
               (two parallel arrows, top → right, bottom → left). Common
               glyph for reversibility / "swap / undo your booking". -->
          <span class="home-persuasion__award" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="m16 3 4 4-4 4"/>
              <path d="M20 7H4"/>
              <path d="m8 21-4-4 4-4"/>
              <path d="M4 17h16"/>
            </svg>
          </span>
          <p class="home-persuasion__text">Flexibel annuleren</p>
        </div>
      </div>
    </section>

    <!-- Two-column band: press logos on the left, quick-pick filters on
         the right (in a 2-column grid). -->
    <section class="home-popular">
      <div class="container home-popular__inner">
        <div class="home-popular__col home-popular__col--press">
          <h3 class="home-popular__heading">Uitgelicht</h3>
          <div v-if="featuredDesIndes && featuredDesIndesDeal" class="home-popular__featured-wrap">
            <FirstReleaseDealCard
              class="home-popular__featured"
              :hotel="featuredDesIndes"
              :deal="featuredDesIndesDeal"
              :grid-mode="true"
              :hide-bar="true"
              :cta-label="isMobile ? 'Bekijk' : 'Bekijk arrangement'"
            />
          </div>
        </div>
        <div class="home-popular__col home-popular__col--quick">
          <h3 class="home-popular__heading">Snel zoeken</h3>
          <div class="home-popular__pills">
            <button
              v-for="f in homeFilters"
              :key="f.id"
              type="button"
              class="home-pill"
              @click="pickFilter(f.id)"
            >
              <span class="home-pill__icon" v-html="POPULAR_FILTER_ICONS[ICON_FOR[f.id]] || POPULAR_FILTER_ICONS.star" />
              <span class="home-pill__label">{{ f.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- "Gezien in:" press-logos band — decoupled from the Uitgelicht
         card so it reads as its own credibility row beneath the
         quick-filter pills. -->
    <section class="home-press-banner">
      <div class="container home-press-banner__inner">
        <span class="home-press-banner__label">Gezien in:</span>
        <div class="home-press-banner__logos">
          <img src="/images/logos/nrc.png" alt="NRC" class="home-press-banner__logo" />
          <img src="/images/logos/volkskrant.svg" alt="de Volkskrant" class="home-press-banner__logo" />
          <img src="/images/logos/nu.svg" alt="NU.nl" class="home-press-banner__logo" />
        </div>
      </div>
    </section>

    <!-- Super Hotel Deals: 3 hand-picked luxury hotels -->
    <section class="home-deals">
      <div class="container">
        <h2 class="home-deals__title">Eerder bekeken</h2>
        <div class="home-deals__grid home-deals__grid--3">
          <FirstReleaseDealCard
            v-for="hotel in superDeals"
            :key="hotel.id"
            :hotel="hotel"
            :deal="pickPrimaryDeal(hotel.deals)"
            :grid-mode="true"
            :hide-bar="true"
          />
        </div>
      </div>
    </section>

    <!-- Category banners: 3 clickable banners below "Eerder bekeken" -->
    <section class="home-categories">
      <div class="container home-categories__grid">
        <button type="button" class="home-category" :style="{ backgroundImage: `url('/images/categories/bikepackages.jpg')` }" @click="pickFilter('fiets')">
          <span class="home-category__title">FIETSVAKANTIE 2026</span>
          <span class="home-category__btn">Bekijk <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6" /></svg></span>
        </button>
        <button type="button" class="home-category" :style="{ backgroundImage: `url('/images/categories/seapackages.png')` }" @click="pickFilter('aan-zee')">
          <span class="home-category__title">ONTSPANNEN
AAN ZEE</span>
          <span class="home-category__btn">Bekijk <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6" /></svg></span>
        </button>
        <button type="button" class="home-category" :style="{ backgroundImage: `url('/images/categories/hotelexperiencepackages.jpeg')` }" @click="pickFilter('unique-stay')">
          <span class="home-category__title">HOTEL
EXPERIENCES</span>
          <span class="home-category__btn">Bekijk <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6" /></svg></span>
        </button>
      </div>
    </section>

    <!-- Actuele Deals: 3x3 grid of current hotel cards -->
    <section class="home-deals home-deals--alt">
      <div class="container">
        <h2 class="home-deals__title">Actuele deals</h2>
        <div class="home-deals__grid home-deals__grid--3">
          <FirstReleaseDealCard
            v-for="hotel in actueleDeals"
            :key="hotel.id"
            :hotel="hotel"
            :deal="pickPrimaryDeal(hotel.deals)"
            :grid-mode="true"
            :hide-bar="true"
          />
        </div>
      </div>
    </section>

    <FirstReleaseSiteFooter />
    <!-- Variant switcher is now mounted inside SiteHeader so it appears
         on every FR page; no standalone mount needed here. -->
  </div>
</template>

<script setup lang="ts">
import { POPULAR_FILTER_ICONS } from '~/utils-first-release/popularFilterIcons'
import { mappedHotels } from '~/data/deals-mapper'
import type { SearchHotel } from '~/types/searchHotel'
import { pickPrimaryDeal } from '~/utils-first-release/primaryDeal'
import { useFirstReleaseIsMobile } from '~/composables-first-release/useFirstReleaseIsMobile'

// Uitgelicht CTA: "Bekijk arrangement" on desktop (more room),
// "Bekijk" on mobile (compact).
const isMobile = useFirstReleaseIsMobile()


// Super deals: top 3 hotels by star rating (then highest discount within the same tier)
const superDeals: SearchHotel[] = [...mappedHotels]
  .sort((a, b) => {
    if (b.starRating !== a.starRating) return b.starRating - a.starRating
    const da = Math.max(...a.deals.map(d => d.discountPercentage))
    const db = Math.max(...b.deals.map(d => d.discountPercentage))
    return db - da
  })
  .slice(0, 3)

// Actuele deals: next 9 hotels after the super-three
const superIds = new Set(superDeals.map(h => h.id))
const actueleDeals: SearchHotel[] = mappedHotels.filter(h => !superIds.has(h.id)).slice(0, 9)


// Home filter pills come from the unified FILTER_TAGS config so they stay
// in sync with the filter sidebar everywhere else.
import { FILTER_TAGS } from '~/utils-first-release/filterTags'

const homeFilters = FILTER_TAGS

// Featured Hotel Des Indes "culinair verblijf" card for the "Gezien in"
// column on /home. Pick the specific culinair deal so the hero pic + price
// match the right arrangement.
const featuredDesIndes = mappedHotels.find(h => /des.indes/i.test(h.name)) ?? null
const featuredDesIndesDeal = featuredDesIndes
  ? featuredDesIndes.deals.find(d => /culinair-verblijf/.test(d.slug)) ?? pickPrimaryDeal(featuredDesIndes.deals)
  : null

// Filter id → POPULAR_FILTER_ICONS key. Renders a black Lucide-style SVG
// in place of the previous emoji glyph.
const ICON_FOR: Record<string, string> = {
  wellness: 'bath',
  'jacuzzi-room': 'bath',
  pool: 'waves',
  'with-dinner': 'utensils',
  'dog-friendly': 'dog',
  'mini-trip': 'backpack',
  'aan-zee': 'waves',
  natuur: 'leaf',
  romantisch: 'sparkles',
  culinair: 'wine',
  fiets: 'bike',
  steden: 'building',
  kasteel: 'castle',
  'unique-stay': 'sparkles',
  'five-star': 'crown',
  exclusive: 'crown',
  'best-price': 'euro',
  'new-hotels': 'star',
}

const {
  toggleFilterTag,
  clearFilterTags,
  clearDestinations,
  clearArrivalDate,
  clearDuration,
  resetBudget,
} = useFirstReleaseSearchState()

function pickFilter(tagId: string) {
  // Rule #1: arriving on /search via a home theme button starts with a
  // clean slate — every other filter wiped, only the picked tag applied.
  clearFilterTags()
  clearDestinations()
  clearArrivalDate()
  clearDuration()
  resetBudget()
  toggleFilterTag(tagId)
  navigateTo('/first-release/search')
}

// Persist this home's nav variant so internal pages render the same nav.
import { useFirstReleaseHomeVariant } from '~/composables-first-release/useFirstReleaseHomeVariant'
const { setFrNavVariant, heroPhotoUrl, heroPhotoIndex, restoreHeroPhotoIndex } = useFirstReleaseHomeVariant()
onMounted(() => { setFrNavVariant('1'); restoreHeroPhotoIndex() })
</script>

<style scoped>
.home {
  background: #fff;
}

/* Pay-off below the logo (matches /home-v2). Absolutely positioned
   inside .home-hero so it overlays the navbar without disrupting the
   flex flow. top:100 = 34 (overlay padding-top) + 56 (logo bottom
   centred in 88px nav) + 10 gap. */
.hotel-first__tagline {
  position: absolute;
  top: 100px;
  left: 0;
  right: 0;
  z-index: 600;
  pointer-events: none;
}

.hotel-first__tagline-text {
  font-family: 'Biro Script', cursive;
  font-size: 22px;
  font-weight: 400;
  color: #fff;
  letter-spacing: 0.2px;
  line-height: 1;
  white-space: nowrap;
}

/* ===== HERO ===== */
/* Don't stretch the SiteHeader to fill the hero — let it size to its
   natural nav+padding height (same as on /search) so the absolute-
   positioned search dock lands at the SAME Y on every page. */
.home-hero :deep(.site-header) {
  flex: 0 0 auto;
  align-self: stretch;
  display: block;
  position: relative;
  /* Match internal pages' padding-bottom so the half-protrude trick
     puts the bar's vertical centre at the SiteHeader's bottom edge —
     i.e. exactly where the bar sits on /search, /deal, /hotel. */
  padding-bottom: 38px;
}
/* Use the same absolute-anchored / half-overlap dock that internal
   pages use. Replaces the previous overlay rule (`position: relative;
   margin-top: auto; padding: 0 0 32px`) which pinned the bar to the
   bottom of the hero. */
.home-hero :deep(.site-header--overlay .site-header__search-dock) {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  margin-top: 0;
  padding: 0;
  transform: translateY(50%);
}

.home-hero {
  position: relative;
  isolation: isolate;
  height: 640px;  /* v1: crop 68 px off the bottom; the search bar half-overlaps the nav so the hero stays balanced */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.home-hero__bg {
  position: absolute;
  inset: 0;
  z-index: -2;
  overflow: hidden;
}

.home-hero__bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center bottom;
  display: block;
}

/* Pills 1 and 8 — shift the cover-fit image 200 px DOWN within the
   same 708-px crop window so more of the upper portion of the photo
   shows. Same trick v4/v5 used with `background-position` — adapted
   to `object-position` (the post-cover image's bottom edge is pushed
   200 px below the container's bottom edge). */
.home-hero__bg--shift-down .home-hero__bg-img {
  object-position: center calc(100% + 200px);
}

.home-hero__bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.15) 40%, rgba(0, 0, 0, 0.7) 100%);
}

/* Hero credit line — right-aligned with the hamburger / nav-actions */
.home-hero__location {
  position: absolute;
  top: 184px;
  left: 0;
  right: 0;
  z-index: 5;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
  pointer-events: none;
}

.home-hero__location-line {
  display: inline-block;
  width: 18px;
  height: 1px;
  background: rgba(255, 255, 255, 0.5);
}

/* Right-aligned help / phone block — sits a few px under the location
   credit line, on top of the hero photo. Stays clickable (pointer
   events on) so calling the number works in-place. */
.home-hero__help {
  position: absolute;
  top: 124px;
  left: 0;
  right: 0;
  /* Sit ABOVE the SiteHeader (z-index 500) so clicks reach the button. */
  z-index: 600;
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  gap: 6px;
  /* Container itself shouldn't capture clicks — only the phone button
     does — otherwise the whole row would intercept events that should
     reach SiteHeader controls (hamburger, etc.). */
  pointer-events: none;
  color: #fff;
  text-decoration: none;
  font-family: var(--font-body);
}

.home-hero__help-phone {
  pointer-events: auto;
}

.home-hero__help-icon {
  color: var(--color-primary);
  flex-shrink: 0;
  align-self: center;
}

.home-hero__help-label {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.2px;
}

.home-hero__help-phone {
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  letter-spacing: 0.2px;
  transition: color 150ms ease;
}

.home-hero__help-phone:hover,
.home-hero__help-phone:focus-visible {
  color: var(--color-primary);
  text-decoration: underline;
}

.home-hero__help-popover {
  background: #fff;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  padding: 14px 18px;
  min-width: 200px;
  color: var(--color-text-primary);
}

.home-hero__help-popover-title {
  margin: 0 0 6px;
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 700;
}

.home-hero__help-popover-row {
  margin: 0;
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.4;
  color: var(--color-text-secondary);
}

.home-hero__help-popover-row--bold {
  color: var(--color-text-primary);
  font-weight: 700;
}

/* Slot content (eyebrow + heading + tagline) — left-aligned, pushed toward
   the bottom of the hero so the photo gets more breathing room above. */
.home-hero__content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 28px;
  padding-bottom: 32px;
  /* Anchor the slot's TOP edge to a fixed Y from the top of the hero
     (= browser top). Independent of nav height so v1 and v2 line up
     pixel-perfectly. */
  position: absolute;
  top: 300px;
  left: 0;
  right: 0;
  z-index: 1;
}

.home-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  letter-spacing: 1.54px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
}

.home-hero__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #e97132;
}

.home-hero__title {
  font-family: var(--font-heading);
  font-size: clamp(64px, 10vw, 128px);
  line-height: 0.9;
  font-weight: 400;
  letter-spacing: -3.24px;
  color: #fff;
  margin: 0;
}

.home-hero__title-em {
  font-style: normal;
  font-weight: 600;
}

.home-hero__tagline {
  max-width: 640px;
  font-size: 20px;
  line-height: 28px;
  letter-spacing: -0.1px;
  color: #fff;
  margin: 0;
}

/* Trust row under the search bar — flex-row inside its own .container wrap.
   The flex row itself is width:100% so the first/last items pin to the
   container content edges = the search bar's visible white-card edges. */
.home-hero__trust-wrap {
  /* Explicit positioning identical to the search bar's .container wrapper —
     don't rely on .container alone in case any rule overrides it. */
  width: 100%;
  max-width: var(--container-max);
  margin: 16px auto 0;
  padding: 0 var(--space-lg) 32px;
  box-sizing: border-box;
}

.home-hero__trust {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px 16px;
  width: 100%;
  font-size: 14px;
  letter-spacing: 0.12px;
}

.home-hero__trust-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #fff;
}

.home-hero__trust-item--soft {
  color: #fff;
}

.home-hero__trust-star {
  color: #00b57e;
  font-size: 13px;
}

.home-hero__trust-check {
  color: #00b57e;
  font-size: 13px;
}

.home-hero__trust-link {
  color: #fff;
}

/* ===== PERSUASION BAND (directly under the hero) ===== */
.home-persuasion {
  background: #fff;
  padding: 30px 0;  /* −10 px top padding: 40px 0; bottom */
}

.home-persuasion__inner {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  gap: var(--space-lg);
}

.home-persuasion__col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 0 var(--space-md);
  text-align: center;
  position: relative;
}

/* All three columns center their icon over the caption text for a
   tidy, symmetrical USP bar — no edge-hugging overrides on first /
   last child anymore. */

/* Vertical divider between columns (skip first). */
.home-persuasion__col + .home-persuasion__col::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12%;
  bottom: 12%;
  width: 1px;
  background: var(--color-border-light);
}

/* All three logos in the USP bar share the same visual height so the
   row reads as a tidy band. */
.home-persuasion__trustpilot {
  height: 56px;
  width: auto;
  display: block;
  object-fit: contain;
}

.home-persuasion__award {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  color: #00B67A;
}

.home-persuasion__award svg {
  height: 56px;
  width: auto;
}

.home-persuasion__text {
  margin: 0;
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.35;
  color: var(--color-text-primary);
  max-width: 320px;
}

@media (max-width: 800px) {
  .home-persuasion__inner {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
  .home-persuasion__col + .home-persuasion__col::before { display: none; }
  /* Drop the medal "1M arrangementen" + "Flexibel annuleren" columns —
     only the Trustpilot block stays on mobile. */
  .home-persuasion__col + .home-persuasion__col { display: none; }
}

/* ===== POPULAR FILTERS BAND ===== */
.home-popular {
  background: var(--color-background-secondary, #faf9f6);
  padding: 28px 0;
}

.home-popular__inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2xl);
  align-items: start;
}

.home-popular__col {
  display: flex;
  flex-direction: column;
}

.home-popular__heading {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 var(--space-xl);
  color: var(--color-text-primary);
  line-height: 1.1;
}

/* Featured card + "Gezien in" press footer are wrapped as one visual
   card: the wrap owns the shadow + rounded corners + clipping; the
   DealCard inside loses its own frame so it blends in. The press
   footer sits flush below the deal content, separated by a thin grey
   divider only. */
.home-popular__featured-wrap {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

/* Drop the inner DealCard's own frame so the wrap's frame wins. Uses
   :deep because DealCard is scoped to its own component. */
.home-popular__featured-wrap :deep(.deal-card-v2) {
  border-radius: 0;
  box-shadow: none;
}

/* Override the small-card image height (224px) so the featured photo
   keeps the same aspect ratio as the small cards (~12/7) when the
   featured card is rendered at the wider half-container width. */
.home-popular__featured-wrap :deep(.deal-card-v2__image) {
  min-height: 0;
  max-height: none;
  aspect-ratio: 12 / 7;
}

/* "Gezien in:" + three press logos. Label on the left, logos distributed
   evenly across the remaining width via a 1fr-per-logo grid track. */
.home-popular__featured-press {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr 1fr 1fr;
  align-items: center;
  gap: var(--space-md);
  padding: 14px var(--space-md);
}

/* Grey divider above the press footer, inset from the card edges so it
   doesn't run flush to the corners. */
.home-popular__featured-press::before {
  content: '';
  position: absolute;
  top: 0;
  left: var(--space-md);
  right: var(--space-md);
  height: 1px;
  background: var(--color-border-light);
}

.home-popular__featured-press-label {
  /* Match the deal-title typography (Recoleta, 18px/700) so the press
     label reads at the same visual weight as the card title above. */
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--color-text-primary);
}

.home-popular__logos {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
}

/* Logos as tall as the cap-height of the "G" in "Gezien in".
   At 24 px heading font-size, cap-height ≈ 18 px. */
.home-popular__logo {
  height: 22px;
  max-height: 22px;
  width: auto;
  object-fit: contain;
  display: block;
  /* Centre each logo inside its 1fr grid cell so the three press logos
     sit at evenly spaced positions across the press footer. */
  justify-self: center;
}

/* Featured Marriott deal under the heading row. Width is bounded by the
   left column so the card fills the available space. */
.home-popular__featured {
  width: 100%;
}

/* Quick-pick pills become a 2-column grid so the right block is ~half
   as wide and roughly twice as tall as the previous full-row layout. */
.home-popular__pills {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

@media (max-width: 800px) {
  .home-popular__inner {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }
  /* Pills override moved into the larger mobile block below — flex-
     wrap there fits more pills per row than a forced 1-col grid. */
}

.home-pill {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  padding: 13px 17px;
  width: 100%;
  background: #fff;
  border: 1px solid #e5e2da;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: #1a1411;
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.home-pill:hover {
  /* Consistent neutral hover: the fill darkens (clearly darker than the
     white base), no stroke change. */
  background: var(--color-border);
}

.home-pill__icon {
  display: inline-flex;
  width: 14px;
  height: 14px;
  color: #1a1411;
  margin-right: 2px;
}

.home-pill__icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.home-pill__count {
  color: #9a9a93;
}

/* ===== HOTEL DEALS SECTIONS ===== */
.home-deals {
  background: #fff;
  padding: 56px 0;
}

.home-deals--alt {
  background: var(--color-background-secondary, #faf9f6);
}

.home-deals__title {
  font-family: var(--font-heading);
  font-size: clamp(32px, 4vw, 44px);
  line-height: 1;
  font-weight: 400;
  letter-spacing: -0.88px;
  color: #0e0e0c;
  margin: 0 0 32px;
}

.home-deals__grid {
  display: grid;
  gap: var(--space-lg);
}

/* Homepage-only: bottom-align the CTA button with the price text's
   bottom edge (default is baseline). `line-height: 1` on the price
   elements collapses the line-box padding below the glyphs so the
   price's box-bottom = glyph-bottom; combined with flex-end on the
   row, the button's bottom border lines up with the price text's
   bottom edge exactly. */
.home-deals :deep(.deal-card-v2__grid-price-row) {
  align-items: flex-end;
}
.home-deals :deep(.deal-card-v2__price-line),
.home-deals :deep(.deal-card-v2__price),
.home-deals :deep(.deal-card-v2__price-prefix),
.home-deals :deep(.deal-card-v2__original) {
  line-height: 1;
}

.home-deals__grid--3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

@media (max-width: 1024px) {
  .home-deals__grid--3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  /* Slightly earlier collapse to 1 col so the cards have room on
     small-tablet portrait too. */
  .home-deals__grid--3 { grid-template-columns: 1fr; }
}

/* ==========================================================
   Mobile tweaks (< 800 px) — matches the breakpoint used by
   the SiteHeader compact searchbar swap.
   ========================================================== */
@media (max-width: 800px) {
  /* "Gezien in" press-banner — hidden on mobile per spec. */
  .home-press-banner { display: none; }

  /* "Eerder bekeken" + "Actuele deals" — convert the 3-column grid
     into a horizontal swipe carousel. Each card spans 80 % of the
     viewport width with ~20 vw of the next card peeking at the
     right edge so the user knows it's scrollable. */
  .home-deals__grid--3 {
    display: flex !important;
    flex-direction: row;
    flex-wrap: nowrap;
    grid-template-columns: none;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
    gap: 12px;
    /* Negative inline margin escapes the .container's 16 px padding
       so the first card aligns flush-left at 16 px AND the row
       bleeds to the right edge. */
    margin-left: -16px;
    margin-right: -16px;
    padding: 0 16px 8px;
  }
  .home-deals__grid--3 > * {
    flex: 0 0 80vw;
    max-width: 80vw;
    scroll-snap-align: start;
  }

  /* Hero — keep the photo visible (top-aligned), but let the hero
     section grow to fit the searchbar + content below. */
  .home-hero {
    /* Height becomes content-driven; min-height trimmed by 30 px
       (480 → 450) so the hero feels less tall on phones. */
    height: auto;
    min-height: 450px;
  }
  /* Photo top-aligned with container — `center top` (= 0 offset)
     keeps the image fully covering the section with no grey
     strip at the top, while still showing the top portion of
     the photo where the woman's face sits. */
  .home-hero__bg-img,
  .home-hero__bg--shift-down .home-hero__bg-img {
    object-position: center top;
  }

  /* Hero copy: flow naturally below the SiteHeader's mobile search
     trigger instead of absolute-positioned at top: 300 px. Extra
     left padding (24 px vs the standard 16 px content edge) gives
     "SPRING 2026 / Experience more / tagline" some breathing room
     from the viewport edge so the headline doesn't feel pinched. */
  .home-hero__content {
    position: static;
    top: auto;
    left: auto;
    right: auto;
    padding: 24px 16px 32px 28px;
    gap: 16px;
  }

  /* Mobile home: the search bar sits BELOW the hero copy (which moves up
     onto the photo). Make the overlay header a flex column and reorder
     its in-flow children: nav → hero copy → search pill. The hero-photo
     switcher is position:fixed, so it stays out of this flow. */
  .home-hero :deep(.site-header--overlay) {
    display: flex;
    flex-direction: column;
  }
  .home-hero :deep(.site-header--overlay .site-header__nav) { order: 1; }
  .home-hero__content { order: 2; }
  .home-hero :deep(.site-header--overlay .site-header__mobile-search) {
    order: 3;
    /* 30 px gap below the search bar. */
    padding-bottom: 30px;
  }
  .home-hero__title {
    font-size: clamp(40px, 12vw, 64px);
    line-height: 1;
    letter-spacing: -1.5px;
  }
  .home-hero__tagline {
    font-size: 16px;
    line-height: 1.45;
  }
  .home-hero__location {
    top: 60px;
    right: 16px;
  }
  .home-hero__trust {
    gap: 16px;
    padding-bottom: 24px;
  }
  .home-popular {
    padding: 30px 0;  /* −10 px top padding: 40px 0; bottom */
  }

  /* Quick filter pills: wrap naturally — pills size to content so
     more fit per row. Drops the 1-col grid. */
  .home-popular__pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    grid-template-columns: none;
  }
  .home-pill {
    width: auto;
    flex: 0 0 auto;
  }
}
</style>
