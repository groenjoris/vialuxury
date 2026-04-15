<template>
  <section class="related-deals">
    <h2>{{ t('hotel.relatedDeals') }} {{ hotelName }} {{ t('hotel.relatedDealsEnd') }}</h2>
    <div class="related-deals__grid">
      <div v-for="deal in mockDeals" :key="deal.id" class="deal-card">
        <div class="deal-card__image">
          <img :src="deal.image" :alt="localized(deal.title)" />
          <span class="deal-card__rating">{{ deal.rating }} ★</span>
        </div>
        <div class="deal-card__content">
          <h4 class="deal-card__title">{{ localized(deal.title) }}</h4>
          <p class="deal-card__subtitle">{{ localized(deal.subtitle) }}</p>
          <div class="deal-card__price">
            <span class="deal-card__price-current">{{ formatPrice(deal.price) }}</span>
            <span class="deal-card__price-original">{{ formatPrice(deal.originalPrice) }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatPrice } from '~/utils/formatPrice'

const { t, localized } = useI18n()

defineProps<{
  hotelName: string
}>()

// Mock related deals
const mockDeals = computed(() => [
  {
    id: 'deal-1',
    title: 'Hotel Ter Zand - Handwritten Collection ★★★★',
    subtitle: `2 ${t('common.nights')} incl. ${t('related.breakfastAndDinner')}`,
    image: '/images/related/deal-1.jpg',
    rating: 4.3,
    price: 289,
    originalPrice: 520,
  },
  {
    id: 'deal-2',
    title: 'Hotel Ter Zand - Handwritten Collection ★★★★',
    subtitle: `3 ${t('common.nights')} incl. ${t('related.breakfast')}`,
    image: '/images/related/deal-2.jpg',
    rating: 4.3,
    price: 399,
    originalPrice: 680,
  },
  {
    id: 'deal-3',
    title: 'Amber Hotel Amsterdam ★★★★',
    subtitle: `2 ${t('common.nights')} incl. ${t('related.breakfast')}`,
    image: '/images/related/deal-3.jpg',
    rating: 4.5,
    price: 259,
    originalPrice: 450,
  },
])
</script>

<style scoped>
.related-deals {
  padding: var(--space-xl) 0;
  border-top: 1px solid var(--color-border);
}

.related-deals h2 {
  font-size: 20px;
  margin-bottom: var(--space-xl);
}

.related-deals__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-xl);
}

.deal-card {
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: box-shadow var(--transition-fast);
  cursor: pointer;
}

.deal-card:hover {
  box-shadow: var(--shadow-hover);
}

.deal-card__image {
  position: relative;
  aspect-ratio: 16/10;
}

.deal-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.deal-card__rating {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
}

.deal-card__content {
  padding: var(--space-md);
}

.deal-card__title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.deal-card__subtitle {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.deal-card__price {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
}

.deal-card__price-current {
  font-size: 18px;
  font-weight: 700;
  font-family: var(--font-heading);
}

.deal-card__price-original {
  font-size: 14px;
  color: var(--color-text-muted);
  text-decoration: line-through;
}
</style>
