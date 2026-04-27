<template>
  <div class="home">
    <!-- Hero with full-bleed background image -->
    <section class="home-hero">
      <div class="home-hero__bg" />
      <div class="home-hero__location container">
        <span class="home-hero__location-line" aria-hidden="true" />
        <span>Château St. Gerlach — Valkenburg</span>
      </div>

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
              Elke deal is door ons team samengesteld: van kamerupgrade tot diner en ontbijt, altijd met exclusieve kortingen inbegrepen.
            </p>
          </div>
        </template>
      </SiteHeader>

      <!-- Trust row sits below the search dock, still inside the hero -->
      <div class="home-hero__trust container">
        <span class="home-hero__trust-item">
          <span class="home-hero__trust-star" aria-hidden="true">★</span>
          <span class="home-hero__trust-text">12.333 gasten waarderen ons met</span>
          <span class="home-hero__trust-link">4,8/5 op Trustpilot</span>
        </span>
        <span class="home-hero__trust-item home-hero__trust-item--soft">
          <span class="home-hero__trust-check" aria-hidden="true">✓</span>
          <span class="home-hero__trust-text">Gratis annuleren op de meeste verblijven</span>
        </span>
        <span class="home-hero__trust-item home-hero__trust-item--soft">
          <span class="home-hero__trust-check" aria-hidden="true">✓</span>
          <span class="home-hero__trust-text">Unieke deals met heul veul korting</span>
        </span>
      </div>
    </section>

    <!-- Popular filter pills (single wrapping row, no heading) -->
    <section class="home-popular">
      <div class="container">
        <div class="home-popular__pills">
          <NuxtLink
            v-for="f in filters"
            :key="f.label"
            :to="`/search?filter=${encodeURIComponent(f.label)}`"
            class="home-pill"
          >
            <span class="home-pill__icon" v-html="POPULAR_FILTER_ICONS[f.icon]" />
            <span class="home-pill__label">{{ f.label }}</span>
            <span class="home-pill__count">({{ f.count }})</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Super Hotel Deals: 3 hand-picked luxury hotels -->
    <section class="home-deals">
      <div class="container">
        <h2 class="home-deals__title">Super Hotel Deals</h2>
        <div class="home-deals__grid home-deals__grid--3">
          <SearchResultCard
            v-for="hotel in superDeals"
            :key="hotel.id"
            :hotel="hotel"
            :grid-mode="true"
            @view-deals="navigateToFirstDeal(hotel)"
            @view-deal="navigateToDeal"
          />
        </div>
      </div>
    </section>

    <!-- Actuele Deals: 3x3 grid of current hotel cards -->
    <section class="home-deals home-deals--alt">
      <div class="container">
        <h2 class="home-deals__title">Actuele Deals</h2>
        <div class="home-deals__grid home-deals__grid--3">
          <SearchResultCard
            v-for="hotel in actueleDeals"
            :key="hotel.id"
            :hotel="hotel"
            :grid-mode="true"
            @view-deals="navigateToFirstDeal(hotel)"
            @view-deal="navigateToDeal"
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

const router = useRouter()

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

function navigateToDeal(slug: string) {
  router.push(`/deal/${slug}`)
}

function navigateToFirstDeal(hotel: SearchHotel) {
  if (hotel.deals.length > 0) router.push(`/deal/${hotel.deals[0].slug}`)
}

interface Filter { label: string; count: number; icon: keyof typeof POPULAR_FILTER_ICONS }

const filters: Filter[] = [
  { label: 'Nieuwe hotels', count: 78, icon: 'star' },
  { label: 'Aan zee', count: 69, icon: 'waves' },
  { label: 'Met fiets', count: 92, icon: 'bike' },
  { label: 'Kastelen & landgoederen', count: 92, icon: 'castle' },
  { label: 'Unieke verblijven', count: 92, icon: 'sparkles' },
  { label: 'Mini-vakanties', count: 70, icon: 'backpack' },
  { label: 'Wellness', count: 92, icon: 'leaf' },
  { label: 'In de natuur', count: 92, icon: 'treePine' },
  { label: 'Jacuzzi op de kamer', count: 78, icon: 'bath' },
  { label: 'Zwembad', count: 69, icon: 'waves' },
  { label: 'Exclusief', count: 92, icon: 'crown' },
  { label: 'Beste prijs', count: 92, icon: 'euro' },
  { label: 'Honden welkom', count: 92, icon: 'dog' },
  { label: 'Stedentrip', count: 92, icon: 'building' },
  { label: 'Met diner', count: 70, icon: 'wine' },
  { label: 'Culinair genieten', count: 92, icon: 'utensils' },
  { label: '5-sterren luxe', count: 78, icon: 'star' },
]
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
  top: 100px;
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

/* Trust row under the search bar */
.home-hero__trust {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 40px;
  padding-bottom: 32px;
  margin-top: 16px;
  font-size: 12px;
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
  font-size: 11px;
}

.home-hero__trust-check {
  color: #00b57e;
  font-size: 11px;
}

.home-hero__trust-link {
  color: #fff;
}

/* ===== POPULAR FILTERS ===== */
.home-popular {
  background: #fff;
  padding: 56px 0;
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
  text-decoration: none;
  color: #1a1411;
  font-size: 14px;
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
