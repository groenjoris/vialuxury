<template>
  <article class="result-card">
    <div class="result-card__image">
      <img :src="hotel.heroImage" :alt="hotel.name" loading="lazy" />
      <span v-if="lowestDiscount" class="result-card__discount-badge">
        -{{ lowestDiscount }}%
      </span>
    </div>
    <div class="result-card__content">
      <div class="result-card__top">
        <div class="result-card__name-row">
          <h3 class="result-card__name">
            <span class="result-card__name-text">{{ hotel.name }}</span>
          </h3>
          <div class="result-card__stars" aria-hidden="true">
            <span v-for="n in hotel.starRating" :key="n" class="result-card__star">★</span>
          </div>
        </div>
        <div class="result-card__meta">
          <span class="result-card__location">{{ hotel.city }}, {{ hotel.region }}</span>
          <span class="result-card__review-pill">
            <span class="result-card__review-score">{{ hotel.reviewScore }}</span>
            <span class="result-card__review-count">{{ hotel.reviewCount }} beoordelingen</span>
          </span>
        </div>
        <span class="result-card__duration">{{ durationLabel }}</span>
      </div>

      <div class="result-card__highlights">
        <span v-for="h in topHighlights" :key="h" class="result-card__highlight">
          <span class="result-card__highlight-check">✓</span> {{ h }}
        </span>
      </div>

      <div class="result-card__bottom">
        <div class="result-card__pricing">
          <span class="result-card__price-label">Vanaf</span>
          <span class="result-card__price">{{ formatPrice(lowestPrice) }}</span>
          <span v-if="lowestOriginal > lowestPrice" class="result-card__original">
            {{ formatPrice(lowestOriginal) }}
          </span>
        </div>
        <button class="btn btn-primary result-card__cta" @click="$emit('view-deals')">
          Bekijk {{ hotel.deals.length }} {{ hotel.deals.length === 1 ? 'deal' : 'deals' }}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { SearchHotel } from '~/types/searchHotel'
import { formatPrice } from '~/utils/formatPrice'

const props = defineProps<{
  hotel: SearchHotel
}>()

defineEmits<{
  'view-deals': []
}>()

const durationLabel = computed(() => {
  const nights = [...new Set(props.hotel.deals.map(d => d.nights))].sort((a, b) => a - b)
  if (nights.length === 1) return `${nights[0]} nachten`
  if (nights.length === 2) return `${nights[0]} of ${nights[1]} nachten`
  return `${nights.slice(0, -1).join(', ')} of ${nights[nights.length - 1]} nachten`
})

const topHighlights = computed(() => {
  const all = props.hotel.deals.flatMap(d => d.highlights)
  const unique = [...new Set(all)]
  return unique.slice(0, 3)
})

const lowestPrice = computed(() => {
  return Math.min(...props.hotel.deals.map(d => d.basePrice))
})

const lowestOriginal = computed(() => {
  const cheapestDeal = props.hotel.deals.reduce((min, d) => d.basePrice < min.basePrice ? d : min)
  return cheapestDeal.originalPrice
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
  background: var(--color-discount);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}

.result-card__content {
  flex: 1;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.result-card__top {
  margin-bottom: var(--space-md);
}

.result-card__name-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
  margin-bottom: 4px;
}

.result-card__name {
  font-family: var(--font-heading);
  font-size: 19px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.3;
}

.result-card__name-text {
  text-decoration: none;
  transition: text-decoration var(--transition-fast);
}

.result-card:hover .result-card__name-text {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.result-card__stars {
  display: flex;
  gap: 1px;
  flex-shrink: 0;
}

.result-card__star {
  color: var(--color-star);
  font-size: 13px;
}

.result-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: 6px;
}

.result-card__location {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.result-card__review-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.result-card__review-score {
  background: var(--color-primary);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.result-card__review-count {
  font-size: 12px;
  color: var(--color-text-muted);
}

.result-card__duration {
  font-size: 13px;
  color: var(--color-text-muted);
  font-weight: 500;
}

.result-card__highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 6px var(--space-md);
  margin-bottom: auto;
  padding-bottom: var(--space-md);
}

.result-card__highlight {
  font-size: 13px;
  color: var(--color-text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.result-card__highlight-check {
  color: var(--color-discount);
  font-weight: 700;
  font-size: 13px;
}

.result-card__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--color-border-light);
  padding-top: var(--space-md);
}

.result-card__pricing {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.result-card__price-label {
  font-size: 13px;
  color: var(--color-text-muted);
}

.result-card__price {
  font-size: 22px;
  font-weight: 700;
  font-family: var(--font-heading);
  color: var(--color-text-primary);
}

.result-card__original {
  font-size: 14px;
  color: var(--color-text-muted);
  text-decoration: line-through;
}

.result-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  font-size: 14px;
  white-space: nowrap;
  flex-shrink: 0;
}

.result-card__cta svg {
  flex-shrink: 0;
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
}
</style>
