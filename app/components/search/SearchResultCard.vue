<!--
  Deprecated — use <DealCard> instead. The deal-first refactor replaced this
  hotel-first card everywhere (search, side panel, home). Kept temporarily for
  reference; safe to delete once we sweep the codebase.
-->
<template>
  <article class="result-card" :class="{ 'result-card--grid': gridMode, 'result-card--single': isSingleDeal }">
    <div class="result-card__image">
      <img :src="hotel.heroImage" :alt="hotel.name" loading="lazy" />
      <span v-if="lowestDiscount" class="result-card__discount-badge">
        -{{ lowestDiscount }}%
      </span>
      <div v-if="hotel.labels && hotel.labels.length" class="result-card__labels">
        <DealLabel
          v-for="label in hotel.labels"
          :key="label"
          :key-name="label"
          class="result-card__label"
        />
      </div>
      <button
        type="button"
        class="result-card__favorite"
        :class="{ 'result-card__favorite--active': isFavorite }"
        :aria-label="isFavorite ? t('search.unfavorite') : t('search.favorite')"
        :aria-pressed="isFavorite"
        @click.stop="isFavorite = !isFavorite"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </div>
    <div class="result-card__content">
      <!-- Hotel info header -->
      <div class="result-card__hotel-header">
        <div class="result-card__hotel-info">
          <NuxtLink :to="`/hotel/${hotel.slug}`" target="_blank" class="result-card__name-link" @click.stop>
            <h3 class="result-card__name">{{ hotel.name }}</h3>
          </NuxtLink>
          <div class="result-card__meta">
            <span class="result-card__stars" aria-hidden="true">
              <span v-for="n in hotel.starRating" :key="n">★</span>
            </span>
            <span class="result-card__location">{{ hotel.city }} - {{ t('common.nederland') }}</span>
          </div>
          <p class="result-card__pitch">{{ pitchText }}</p>
        </div>
      </div>

      <!-- Arrangement line -->
      <div class="result-card__arrangement">
        <template v-if="isSingleDeal">
          <span class="result-card__arrangement-highlight">{{ t('search.arrangement') }}</span>
          <span class="result-card__arrangement-bold"> {{ singleDealArrangementSuffix }}</span>
        </template>
        <template v-else>
          <span class="result-card__arrangement-highlight">{{ t('search.arrangement') }}</span>
          <span class="result-card__arrangement-sep">|</span>
          <span class="result-card__arrangement-bold">{{ durationLabel }}</span>
          <span class="result-card__arrangement-sep">|</span>
          <span class="result-card__arrangement-bold">{{ persons }} {{ persons === 1 ? t('common.personSingular') : t('common.personPlural') }}</span>
        </template>
      </div>

      <!-- Two-column area -->
      <div class="result-card__details">
        <!-- Left column: 3 highlights (plain checkmarks) -->
        <div class="result-card__highlights">
          <strong class="result-card__highlights-subtitle">Inclusief</strong>
          <div class="result-card__highlight-list">
            <span v-for="item in inclusionItems" :key="item" class="result-card__highlight">
              <span class="result-card__highlight-check">✓</span>
              <span class="result-card__highlight-text">{{ item }}</span>
            </span>
          </div>
        </div>

        <!-- Right column: pricing + CTA — replaced by 'unavailable' message
             when the hotel is pinned-from-deal but doesn't match the filters. -->
        <div class="result-card__pricing-col">
          <template v-if="unavailable">
            <p class="result-card__unavailable">Niet beschikbaar voor jouw zoekopdracht</p>
          </template>
          <template v-else>
            <div class="result-card__price-block">
              <div class="result-card__price-row">
                <template v-if="!gridMode">
                  <span v-if="lowestOriginal > lowestPrice" class="result-card__original">
                    {{ formatPrice(lowestOriginal) }}
                  </span>
                  <div class="result-card__price-with-label">
                    <span class="result-card__price-label">{{ t('search.fromPrice') }}</span>
                    <span class="result-card__price">{{ formatPrice(lowestPrice) }}</span>
                  </div>
                </template>
                <template v-else>
                  <div class="result-card__price-with-label">
                    <span class="result-card__price-label">{{ t('search.fromPrice') }}</span>
                    <span class="result-card__price">{{ formatPrice(lowestPrice) }}</span>
                  </div>
                  <span v-if="lowestOriginal > lowestPrice" class="result-card__original">
                    {{ formatPrice(lowestOriginal) }}
                  </span>
                </template>
              </div>
            </div>
            <NuxtLink
              v-if="isSingleDeal"
              :to="singleDealHref"
              target="_blank"
              rel="noopener"
              class="result-card__cta"
            >
              {{ t('search.viewArrangementSingle') }}
            </NuxtLink>
            <button v-else class="result-card__cta" @click="$emit('view-deals')">
              {{ t('search.viewDeals') }} {{ hotel.deals.length }} {{ hotel.deals.length === 1 ? t('search.deal') : t('search.dealPlural') }}
            </button>
          </template>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { SearchHotel } from '~/types/searchHotel'
import { formatPrice } from '~/utils/formatPrice'
import { mappedPackagesByPermalink } from '~/data/deals-mapper'
import { priceForArrival } from '~/utils/priceFormula'
import { nightsLabel, personsLabel } from '~/utils/plural'

const { t, localized, locale } = useI18n()
const lang = computed<'nl' | 'en'>(() => (locale.value === 'en' ? 'en' : 'nl'))

// Favorite state — local per-card for prototype
const isFavorite = ref(false)
const { persons, rooms, arrivalDate } = useSearchState()

// Label rendering moved to <DealLabel>; PNG/SVG lookup retired.

function adjustPrice(basePrice: number, p: number): number {
  if (p % 2 === 0) return Math.round(basePrice * (p / 2))
  return Math.round(basePrice * ((p + 1) / 2) - 50)
}

const props = defineProps<{
  hotel: SearchHotel
  gridMode?: boolean
  /** Mark this card as a pinned "from-deal" card whose deal doesn't match
   *  the current filters; the price/CTA section is replaced by a notice. */
  unavailable?: boolean
}>()

defineEmits<{
  'view-deals': []
  'view-deal': [slug: string]
}>()

const isSingleDeal = computed(() => props.hotel.deals.length === 1)

// When a hotel has a single deal (= dedicated package), show the package title
// instead of the generic hotel pitch.
const pitchText = computed(() => {
  if (isSingleDeal.value) {
    const deal = props.hotel.deals[0]
    if (deal.title) return localized(deal.title)
  }
  return localized(props.hotel.pitch)
})

const durationLabel = computed(() => {
  const nights = [...new Set(props.hotel.deals.map(d => d.nights))].sort((a, b) => a - b)
  if (nights.length === 1) return `${nights[0]} ${t('common.nights')}`
  if (nights.length === 2) return `${nights[0]} of ${nights[1]} ${t('common.nights')}`
  return `${nights.slice(0, -1).join(', ')} of ${nights[nights.length - 1]} ${t('common.nights')}`
})

const singleDealArrangementText = computed(() => {
  if (!isSingleDeal.value) return ''
  const deal = props.hotel.deals[0]
  return t('search.inclArrangement')
    .replace('{nightsLabel}', nightsLabel(deal.nights, lang.value))
    .replace('{personsLabel}', personsLabel(persons.value, lang.value))
})

const singleDealArrangementSuffix = computed(() => {
  if (!isSingleDeal.value) return ''
  const deal = props.hotel.deals[0]
  return t('search.arrangementSuffix')
    .replace('{nightsLabel}', nightsLabel(deal.nights, lang.value))
    .replace('{personsLabel}', personsLabel(persons.value, lang.value))
})

const roomPhrases = [
  'Fantastische kamer',
  'Hele luxe kamer',
  'Kamer met alles erop en eraan',
  'Luxe kamer op topniveau',
  'Stijlvolle premium kamer',
]

// Excluded from "common across arrangements" pick: overnight stays + room upgrades
function isExcludedInclusion(text: string): boolean {
  const t = text.trim().toLowerCase()
  if (!t) return true
  if (/overnacht|night/.test(t)) return true
  if (/upgrade/.test(t)) return true
  if (/^kamer\b/.test(t)) return true // "Kamer", "Kamerupgrade naar..." etc.
  if (/ontbijt|breakfast/.test(t)) return true // too trivial
  return false
}

// Pick the inclusion title shared by EVERY deal of this hotel (excluding overnights/upgrades).
function commonInclusion(hotel: SearchHotel): string {
  const perDealTitles: string[][] = hotel.deals.map((d) => {
    const pkg = mappedPackagesByPermalink[d.slug]
    if (!pkg) return []
    return pkg.inclusions
      .map(i => localized(i.title).trim())
      .filter(t => !isExcludedInclusion(t))
  })
  if (perDealTitles.length === 0 || perDealTitles[0].length === 0) return ''
  // Intersection across all deals (case-insensitive match, preserve original casing of first deal)
  const [first, ...rest] = perDealTitles
  const common = first.filter(title =>
    rest.every(arr => arr.some(t => t.toLowerCase() === title.toLowerCase())),
  )
  return common[0] || first[0] || ''
}

// Stable pseudo-random pick from list using string hash → no shuffle on re-render.
function pickStable<T>(list: T[], seed: string): T {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return list[Math.abs(h) % list.length]
}

const inclusionItems = computed(() => {
  const first = commonInclusion(props.hotel) || 'Welkomstdrankje'
  const second = pickStable(roomPhrases, props.hotel.name + props.hotel.slug)
  return [first, second, 'En andere extra\'s']
})

/** Pick the deal whose date-adjusted price is cheapest. With a global arrival
 *  date, that may be a different deal than the basePrice-cheapest one (premium
 *  vs non-premium days have different surcharges). */
const cheapestDeal = computed(() => {
  return props.hotel.deals.reduce((min, d) => {
    const dPrice = priceForArrival(d.basePrice, d.id, arrivalDate.value, persons.value)
    const minPrice = priceForArrival(min.basePrice, min.id, arrivalDate.value, persons.value)
    return dPrice < minPrice ? d : min
  })
})

const lowestPrice = computed(() =>
  priceForArrival(cheapestDeal.value.basePrice, cheapestDeal.value.id, arrivalDate.value, persons.value),
)
const lowestOriginal = computed(() =>
  priceForArrival(cheapestDeal.value.originalPrice, cheapestDeal.value.id, arrivalDate.value, persons.value),
)
const lowestDiscount = computed(() => cheapestDeal.value.discountPercentage)

/** Carry arrival date AND persons/rooms through the URL so the new-tab deal
 *  page lands on the right month with the right group size — without
 *  relying on cross-tab sessionStorage cloning. */
const isSingleDealLink = computed(() => props.hotel.deals[0]?.slug || '')
const singleDealHref = computed(() => {
  const params = new URLSearchParams()
  if (arrivalDate.value) params.set('checkin', arrivalDate.value)
  if (persons.value !== 2) params.set('persons', String(persons.value))
  if (rooms.value !== 1) params.set('rooms', String(rooms.value))
  const q = params.toString()
  return `/deal/${isSingleDealLink.value}${q ? '?' + q : ''}`
})
</script>

<style scoped>
.result-card {
  display: flex;
  width: 100%;
  min-width: 0;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: box-shadow var(--transition-fast);
}

.result-card:hover {
  box-shadow: var(--shadow-hover);
}

/* Single deal accent */
.result-card--single {
  border-left: none;
}

.result-card__image {
  width: 280px;
  min-height: 224px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  background: var(--color-background-secondary);
}

.result-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Special-deal sticker overlay (bottom-left of the hero image) */
.result-card__labels {
  position: absolute;
  left: var(--space-sm);
  bottom: var(--space-sm);
  display: flex;
  gap: 6px;
  z-index: 2;
  pointer-events: none;
}

.result-card__label {
  height: 56px;
  width: auto;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35));
}

.result-card__discount-badge {
  position: absolute;
  top: var(--space-sm);
  left: var(--space-sm);
  background: #1A1A1A;
  color: #fff;
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  letter-spacing: 0.5px;
}

.result-card__favorite {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
}

.result-card__favorite:hover {
  background: rgba(0, 0, 0, 0.55);
  transform: scale(1.05);
}

.result-card__favorite svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}

.result-card__favorite--active {
  background: rgba(255, 255, 255, 0.95);
  color: #E11D48;
}

.result-card__favorite--active svg {
  fill: currentColor;
  stroke: currentColor;
}

.result-card__favorite--active:hover {
  background: #fff;
  color: #B91C1C;
}

/* Inline discount (used in grid mode price row) */
.result-card__inline-discount {
  flex-shrink: 0;
  align-self: center;
  background: var(--color-discount);
  color: #fff;
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}

.result-card__content {
  flex: 1;
  padding: var(--space-md) var(--space-md) var(--space-md) var(--space-lg);
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* Hotel header with score */
.result-card__hotel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-md);
  margin-bottom: 6px;
}

.result-card__hotel-info {
  flex: 1;
  min-width: 0;
}

.result-card__name {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.3;
  margin-bottom: 2px;
}

.result-card__name-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  display: block;
}

.result-card__name-link:hover .result-card__name {
  text-decoration: underline;
  text-underline-offset: 2px;
}


.result-card__score {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: #00B67A;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.result-card__score-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* Stars + location */
.result-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: 4px;
}

.result-card__stars {
  color: #1A1A1A;
  font-size: 13px;
  letter-spacing: 1px;
}

.result-card__location {
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* Pitch */
.result-card__pitch {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Arrangement line */
.result-card__arrangement {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--color-border-light);
}

.result-card__arrangement-highlight {
  color: var(--color-primary);
  font-weight: 600;
}

.result-card__arrangement-sep {
  color: var(--color-text-muted);
}

.result-card__arrangement-bold {
  font-weight: 600;
  color: var(--color-text-primary);
}

/* Two-column details area */
.result-card__details {
  display: flex;
  gap: var(--space-lg);
  margin-top: auto;
}

/* Left column: highlights */
.result-card__highlights {
  flex: 1;
  min-width: 0;
}

.result-card__highlights-subtitle {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

.result-card__highlight-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-card__highlight {
  font-size: 13px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.result-card__highlight-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.result-card__highlight-check {
  color: var(--color-discount);
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

/* Pinned-from-deal card whose deal doesn't match current filters */
.result-card__unavailable {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-muted, #999);
  text-align: right;
  margin: 0;
  align-self: flex-end;
  max-width: 200px;
  line-height: 1.4;
}

/* Right column: pricing */
.result-card__pricing-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  flex-shrink: 0;
  min-width: 140px;
}

.result-card__price-label {
  font-size: 13px;
  color: var(--color-text-muted);
  font-style: italic;
  margin-bottom: 2px;
}

.result-card__price-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: var(--space-sm);
}

.result-card__original {
  font-size: 14px;
  color: var(--color-error);
  text-decoration: line-through;
}

.result-card__price-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.result-card__price-with-label {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  line-height: 1;
}

.result-card__price {
  font-size: 24px;
  font-weight: 700;
  font-family: var(--font-heading);
  color: var(--color-text-primary);
}

.result-card__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.result-card__cta:hover {
  background: var(--color-primary-hover);
}

/* ===== GRID MODE ===== */
.result-card--grid {
  flex-direction: column;
}

.result-card--grid .result-card__image {
  width: 100%;
  min-height: 224px;
  max-height: 224px;
}

.result-card--grid .result-card__content {
  padding: var(--space-md);
}

.result-card--grid .result-card__name {
  font-size: 17px;
}

.result-card--grid .result-card__pitch {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: normal;
  text-overflow: clip;
  line-height: 1.4;
  max-height: calc(1.4em * 2);
}

.result-card--grid .result-card__details {
  flex-direction: column;
  gap: var(--space-sm);
}

.result-card--grid .result-card__pricing-col {
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  min-width: 0;
  width: 100%;
  gap: var(--space-sm);
  padding-top: var(--space-md);
}

.result-card--grid .result-card__price-block {
  align-items: flex-start;
}

.result-card--grid .result-card__price-row {
  margin-bottom: 0;
}

/* Single deal in grid */
.result-card--grid.result-card--single {
  border-left: none;
  border-top: none;
}

/* Responsive: only adjust image height; grid card layout stays the same */
@media (max-width: 768px) {
  .result-card--grid .result-card__image {
    min-height: 224px;
    max-height: 224px;
  }
}
</style>
