<template>
  <article class="result-card" :class="{ 'result-card--grid': gridMode, 'result-card--single': isSingleDeal }">
    <div class="result-card__image">
      <img :src="hotel.heroImage" :alt="hotel.name" loading="lazy" />
      <span v-if="lowestDiscount" class="result-card__discount-badge">
        -{{ lowestDiscount }}%
      </span>
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
          <p class="result-card__pitch">{{ localized(hotel.pitch) }}</p>
        </div>
        <div class="result-card__score-wrap">
          <span class="result-card__score">{{ hotel.reviewScore.toFixed(1) }}</span>
          <span class="result-card__score-label">{{ t(getReviewLabelKey(hotel.reviewScore)) }}</span>
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
              <span class="result-card__highlight-check">✓</span> {{ item }}
            </span>
          </div>
        </div>

        <!-- Right column: pricing + CTA -->
        <div class="result-card__pricing-col">
          <span class="result-card__price-label">{{ t('search.fromPrice') }}</span>
          <div class="result-card__price-row">
            <span v-if="lowestOriginal > lowestPrice" class="result-card__original">
              {{ formatPrice(lowestOriginal) }}
            </span>
            <span class="result-card__price">{{ formatPrice(lowestPrice) }}</span>
          </div>
          <button v-if="isSingleDeal" class="result-card__cta" @click="$emit('view-deal', hotel.deals[0].slug)">
            {{ t('search.viewArrangementSingle') }}
          </button>
          <button v-else class="result-card__cta" @click="$emit('view-deals')">
            {{ t('search.viewDeals') }} {{ hotel.deals.length }} {{ hotel.deals.length === 1 ? t('search.deal') : t('search.dealPlural') }}
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { SearchHotel } from '~/types/searchHotel'
import { formatPrice } from '~/utils/formatPrice'
import { getReviewLabelKey } from '~/utils/reviewLabel'

const { t, localized } = useI18n()
const { persons } = useSearchState()

function adjustPrice(basePrice: number, p: number): number {
  if (p % 2 === 0) return Math.round(basePrice * (p / 2))
  return Math.round(basePrice * ((p + 1) / 2) - 50)
}

const props = defineProps<{
  hotel: SearchHotel
  gridMode?: boolean
}>()

defineEmits<{
  'view-deals': []
  'view-deal': [slug: string]
}>()

const isSingleDeal = computed(() => props.hotel.deals.length === 1)

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
    .replace('{nights}', String(deal.nights))
    .replace('{persons}', String(persons.value))
})

const singleDealArrangementSuffix = computed(() => {
  if (!isSingleDeal.value) return ''
  const deal = props.hotel.deals[0]
  return t('search.arrangementSuffix')
    .replace('{nights}', String(deal.nights))
    .replace('{persons}', String(persons.value))
})

const firstInclusionOptions = [
  'Diner', 'Museumkaartjes', 'Welkomstbubbels',
  'Gebruik wellness', 'Een fiets voor iedereen', 'Royaal ontbijt', 'Super lang uitslapen',
]

const inclusionItems = computed(() => {
  const name = props.hotel.name
  let first: string
  if (name === 'Hotel Haarhuis' || name === 'Kasteel TerWorm') {
    first = 'Culinair 3-gangendiner'
  } else {
    // Pick a stable option based on hotel name length as a simple hash
    const index = name.length % firstInclusionOptions.length
    first = firstInclusionOptions[index]
  }
  return [first, 'De beste kamer', 'En andere extra\'s']
})

const lowestPrice = computed(() => {
  return Math.min(...props.hotel.deals.map(d => adjustPrice(d.basePrice, persons.value)))
})

const lowestOriginal = computed(() => {
  const cheapestDeal = props.hotel.deals.reduce((min, d) => d.basePrice < min.basePrice ? d : min)
  return adjustPrice(cheapestDeal.originalPrice, persons.value)
})

const lowestDiscount = computed(() => {
  const cheapestDeal = props.hotel.deals.reduce((min, d) => d.basePrice < min.basePrice ? d : min)
  return cheapestDeal.discountPercentage
})
</script>

<style scoped>
.result-card {
  display: flex;
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
  min-height: 220px;
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

.result-card__discount-badge {
  position: absolute;
  top: var(--space-sm);
  left: var(--space-sm);
  background: #1A1A1A;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}

.result-card__content {
  flex: 1;
  padding: var(--space-md) var(--space-xl) var(--space-md) var(--space-lg);
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

.result-card:hover .result-card__name {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.result-card__score-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  gap: 2px;
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
}

.result-card__highlight-check {
  color: var(--color-discount);
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
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
  align-items: baseline;
  gap: 8px;
  margin-bottom: var(--space-sm);
}

.result-card__original {
  font-size: 14px;
  color: var(--color-text-muted);
  text-decoration: line-through;
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
  min-height: 180px;
  max-height: 200px;
}

.result-card--grid .result-card__content {
  padding: var(--space-md);
}

.result-card--grid .result-card__name {
  font-size: 17px;
}

.result-card--grid .result-card__pitch {
  display: block;
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
}

.result-card--grid .result-card__price-row {
  margin-bottom: 0;
}

/* Single deal in grid */
.result-card--grid.result-card--single {
  border-left: none;
  border-top: none;
}

/* Responsive */
@media (max-width: 768px) {
  .result-card {
    flex-direction: column;
  }

  .result-card__image {
    width: 100%;
    min-height: 180px;
    max-height: 200px;
  }

  .result-card__details {
    flex-direction: column;
  }

  .result-card__pricing-col {
    align-items: flex-start;
  }

  .result-card--single {
    border-left: none;
    border-top: none;
  }
}
</style>
