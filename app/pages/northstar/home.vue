<template>
  <div class="home">
    <!-- Hero with full-bleed background image -->
    <section class="home-hero">
      <div class="home-hero__bg" />
      <div class="home-hero__location container">
        <span class="home-hero__location-line" aria-hidden="true" />
        <span>Château St. Gerlach — Valkenburg</span>
      </div>

      <NorthstarSiteHeader variant="overlay">
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
              Elke deal is door ons team samengesteld: van kamerupgrade tot diner en ontbijt, altijd met exclusieve kortingen inbegrepen.
            </p>
          </div>
        </template>
      </NorthstarSiteHeader>

      <!-- Trust row: wrap inside .container exactly like the search-dock so
           the inner row's edges match the search-bar's visible edges. -->
      <div class="container home-hero__trust-wrap">
        <div class="home-hero__trust">
          <span class="home-hero__trust-item">
            <span class="home-hero__trust-star" aria-hidden="true">★</span>
            <span class="home-hero__trust-text">15.294 gasten beoordelen ons met een</span>
            <span class="home-hero__trust-link">4.5/5 op Trustpilot</span>
          </span>
          <span class="home-hero__trust-item home-hero__trust-item--soft">
            <span class="home-hero__trust-check" aria-hidden="true">✓</span>
            <span class="home-hero__trust-text">Gratis annuleren op de meeste verblijven</span>
          </span>
          <span class="home-hero__trust-item home-hero__trust-item--soft">
            <span class="home-hero__trust-check" aria-hidden="true">✓</span>
            <span class="home-hero__trust-text">Unieke deals met heel veel korting</span>
          </span>
        </div>
      </div>
    </section>

    <!-- Popular filter pills (single wrapping row, no heading) -->
    <section class="home-popular">
      <div class="container">
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
    </section>

    <!-- Super Hotel Deals: 3 hand-picked luxury hotels -->
    <section class="home-deals">
      <div class="container">
        <h2 class="home-deals__title">Super Hotel Deals</h2>
        <div class="home-deals__grid home-deals__grid--3">
          <NorthstarDealCard
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
        <h2 class="home-deals__title">Actuele Deals</h2>
        <div class="home-deals__grid home-deals__grid--3">
          <NorthstarDealCard
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

    <NorthstarSiteFooter />
  </div>
</template>

<script setup lang="ts">
import { POPULAR_FILTER_ICONS } from '~/utils-northstar/popularFilterIcons'
import { mappedHotels } from '~/data/deals-mapper'
import type { SearchHotel } from '~/types/searchHotel'
import { pickPrimaryDeal } from '~/utils-northstar/primaryDeal'


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
import { FILTER_TAGS } from '~/utils-northstar/filterTags'

const homeFilters = FILTER_TAGS

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

const { toggleFilterTag, selectedFilterTags } = useNorthstarSearchState()

function pickFilter(tagId: string) {
  if (!selectedFilterTags.value.includes(tagId)) toggleFilterTag(tagId)
  navigateTo('/search')
}
</script>

<style scoped>
.home {
  background: #fff;
}

/* ===== HERO ===== */
.home-hero {
  position: relative;
  isolation: isolate;
  min-height: 804px;
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
  top: 124px;
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

/* Slot content (eyebrow + heading + tagline) — left-aligned, pushed toward
   the bottom of the hero so the photo gets more breathing room above. */
.home-hero__content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 28px;
  padding-top: 248px;
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
  max-width: 480px;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.08px;
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

/* ===== POPULAR FILTERS ===== */
.home-popular {
  background: var(--color-background-secondary, #faf9f6);
  padding: 28px 0;
}

.home-popular__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.home-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 13px 17px;
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
  border-top: 1px solid var(--color-border-light, #e5e2da);
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
    min-height: 540px;
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
