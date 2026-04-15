<template>
  <article class="result-card">
    <div class="result-card__image">
      <img :src="hotel.heroImage" :alt="hotel.name" loading="lazy" />
      <span v-if="lowestDiscount" class="result-card__discount-badge">
        -{{ lowestDiscount }}%
      </span>
    </div>
    <div class="result-card__content">
      <!-- Row 1: Hotel name -->
      <h3 class="result-card__name">{{ hotel.name }}</h3>

      <!-- Row 2: Stars + location -->
      <div class="result-card__meta">
        <span class="result-card__stars" aria-hidden="true">
          <span v-for="n in hotel.starRating" :key="n">★</span>
        </span>
        <span class="result-card__location">{{ hotel.city }} - {{ t('common.nederland') }}</span>
      </div>

      <!-- Row 3: Arrangement | duration | persons -->
      <div class="result-card__arrangement">
        <span class="result-card__arrangement-label">{{ t('search.arrangement') }}</span>
        <span class="result-card__arrangement-sep">|</span>
        <span>{{ durationLabel }}</span>
        <span class="result-card__arrangement-sep">|</span>
        <span>{{ t('search.persons') }}</span>
      </div>

      <!-- Two-column area -->
      <div class="result-card__details">
        <!-- Left column: highlights -->
        <div class="result-card__highlights">
          <span class="result-card__highlights-subtitle">{{ t('search.dependsOnPackage') }}</span>
          <div class="result-card__highlight-list">
            <span v-for="h in topHighlights" :key="localized(h)" class="result-card__highlight">
              <span class="result-card__highlight-check">✓</span> {{ localized(h) }}
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
          <button class="result-card__cta" @click="$emit('view-deals')">
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

const { t, localized } = useI18n()

const props = defineProps<{
  hotel: SearchHotel
}>()

defineEmits<{
  'view-deals': []
}>()

const durationLabel = computed(() => {
  const nights = [...new Set(props.hotel.deals.map(d => d.nights))].sort((a, b) => a - b)
  if (nights.length === 1) return `${nights[0]} ${t('common.nights')}`
  if (nights.length === 2) return `${nights[0]} of ${nights[1]} ${t('common.nights')}`
  return `${nights.slice(0, -1).join(', ')} of ${nights[nights.length - 1]} ${t('common.nights')}`
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
  padding: var(--space-lg) var(--space-xl) var(--space-lg) var(--space-lg);
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* Row 1: Hotel name */
.result-card__name {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.3;
  margin-bottom: 4px;
}

.result-card:hover .result-card__name {
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* Row 2: Stars + location */
.result-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: 6px;
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

/* Row 3: Arrangement line */
.result-card__arrangement {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
  font-style: italic;
}

.result-card__arrangement-label {
  color: var(--color-primary);
  font-weight: 600;
  font-style: italic;
}

.result-card__arrangement-sep {
  color: var(--color-text-muted);
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
  font-weight: 600;
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
}
</style>
