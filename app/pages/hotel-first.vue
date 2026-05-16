<template>
  <div class="home">
    <!-- Hero with full-bleed background image -->
    <section class="home-hero">
      <div class="home-hero__bg" />
      <!-- Help / phone block + pay-off both removed — both now live
           inside SiteHeader's row 2. -->

      <SiteHeader variant="overlay">
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
      </SiteHeader>

    </section>

    <!-- Persuasion / USP bar removed. -->

    <!-- Two-column band: press logos on the left, quick-pick filters on
         the right (in a 2-column grid). -->
    <section class="home-popular">
      <div class="container home-popular__inner">
        <div class="home-popular__col home-popular__col--press">
          <h3 class="home-popular__heading">Uitgelicht</h3>
          <div v-if="featuredDesIndes && featuredDesIndesDeal" class="home-popular__featured-wrap">
            <DealCard
              class="home-popular__featured"
              :hotel="featuredDesIndes"
              :deal="featuredDesIndesDeal"
              :grid-mode="true"
              :hide-bar="true"
              cta-label="Bekijk arrangement"
            />
            <div class="home-popular__featured-press">
              <span class="home-popular__featured-press-label">Gezien in:</span>
              <img src="/images/logos/nrc.png" alt="NRC" class="home-popular__logo" />
              <img src="/images/logos/telegraaf.png" alt="De Telegraaf" class="home-popular__logo" />
              <img src="/images/logos/nushoplogo.svg" alt="NU shop" class="home-popular__logo" />
            </div>
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

    <!-- Super Hotel Deals: 3 hand-picked luxury hotels -->
    <section class="home-deals">
      <div class="container">
        <h2 class="home-deals__title">Hoogste ViaLuxury-score</h2>
        <div class="home-deals__grid home-deals__grid--3">
          <DealCard
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

    <!-- Actuele Deals: 3x3 grid of current hotel cards -->
    <section class="home-deals home-deals--alt">
      <div class="container">
        <h2 class="home-deals__title">Laatste beschikbaarheid</h2>
        <div class="home-deals__grid home-deals__grid--3">
          <DealCard
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

    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
import { POPULAR_FILTER_ICONS } from '~/utils/popularFilterIcons'
import { mappedHotels } from '~/data/deals-mapper'
import type { SearchHotel } from '~/types/searchHotel'
import { pickPrimaryDeal } from '~/utils/primaryDeal'


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
import { FILTER_TAGS } from '~/utils/filterTags'

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

const { toggleFilterTag, selectedFilterTags } = useSearchState()

function pickFilter(tagId: string) {
  if (!selectedFilterTags.value.includes(tagId)) toggleFilterTag(tagId)
  navigateTo('/search')
}
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
.home-hero {
  position: relative;
  isolation: isolate;
  min-height: 768px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.home-hero__bg {
  position: absolute;
  inset: 0;
  z-index: -2;
  background: url('/images/home-hero.jpg') center/cover no-repeat;
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
  /* Tagline is now 1.5× larger so the whole content block needs to start
     a bit higher in the hero to keep enough breathing room around the
     search-bar dock at the bottom. */
  padding-top: 200px;
  padding-bottom: 32px;
  margin-top: auto;
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
  padding: 40px 0;
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

/* First column hugs the left edge of the container; last column hugs
   the right edge so they line up with the search-bar's outer margins. */
.home-persuasion__col:first-child {
  align-items: flex-start;
  text-align: left;
  padding-left: 0;
}

.home-persuasion__col:last-child {
  align-items: flex-end;
  text-align: right;
  padding-right: 0;
}

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
.home-persuasion__trustpilot,
.home-persuasion__klarna {
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

@media (max-width: 768px) {
  .home-persuasion__inner {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
  .home-persuasion__col + .home-persuasion__col::before { display: none; }
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

@media (max-width: 768px) {
  .home-popular__inner {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }
  .home-popular__pills {
    grid-template-columns: 1fr;
  }
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
  border-color: #1a1411;
  background: #fafaf6;
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
@media (max-width: 600px) {
  .home-deals__grid--3 { grid-template-columns: 1fr; }
}

/* Mobile tweaks */
@media (max-width: 768px) {
  .home-hero {
    min-height: 504px;
  }
  .home-hero__location {
    top: 60px;
    right: 16px;
  }
  .home-hero__title {
    letter-spacing: -1.5px;
  }
  .home-hero__trust {
    gap: 16px;
    padding-bottom: 24px;
  }
  .home-popular {
    padding: 40px 0;
  }
}
</style>
