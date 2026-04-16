<template>
  <article class="hotel-deal-card">
    <div v-if="cardImage" class="hotel-deal-card__image">
      <img :src="cardImage" :alt="localized(deal.title)" loading="lazy" />
    </div>
    <div class="hotel-deal-card__body">
      <h3 class="hotel-deal-card__title">{{ localized(deal.title) }}</h3>
      <div class="hotel-deal-card__meta">
        <span class="hotel-deal-card__nights">{{ deal.nights }} {{ deal.nights === 1 ? t('common.night') : t('common.nights') }}<template v-if="persons"> · {{ persons }} {{ persons === 1 ? t('common.personSingular') : t('common.personPlural') }}</template></span>
        <div class="hotel-deal-card__pricing">
          <span class="hotel-deal-card__discount">-{{ deal.discountPercentage }}%</span>
          <span class="hotel-deal-card__price">{{ formatPrice(deal.basePrice) }}</span>
          <span class="hotel-deal-card__original">{{ formatPrice(deal.originalPrice) }}</span>
        </div>
      </div>
      <ul class="hotel-deal-card__inclusions">
        <template v-if="inclusionLabels && inclusionLabels.length">
          <li v-for="(label, idx) in inclusionLabels" :key="idx">
            <span class="hotel-deal-card__check">&#10003;</span>
            <span>{{ label }}</span>
          </li>
        </template>
        <template v-else>
          <li v-for="inc in visibleInclusions" :key="inc.id">
            <span class="hotel-deal-card__check">&#10003;</span>
            <span>{{ localized(inc.title) }}</span>
          </li>
        </template>
      </ul>
      <NuxtLink :to="`/deal/${hotelSlug}?deal=${deal.id}`" target="_blank" class="btn btn-primary hotel-deal-card__btn">
        {{ t('hotel.selectDeal') }}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Deal } from '~/types/deal'
import { formatPrice } from '~/utils/formatPrice'

const { t, localized } = useI18n()

const props = defineProps<{
  deal: Deal
  hotelSlug: string
  image?: string
  inclusionLabels?: string[]
  persons?: number
}>()

const cardImage = computed(() => {
  if (props.image) return props.image
  const inc = props.deal.inclusions.find(i => i.image)
  return inc?.image || ''
})

const visibleInclusions = computed(() => {
  return props.deal.inclusions
    .filter(i => !i.id.startsWith('inc-overnight'))
    .slice(0, 4)
})
</script>

<style scoped>
.hotel-deal-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: box-shadow var(--transition-fast);
}

.hotel-deal-card:hover {
  box-shadow: var(--shadow-hover);
}

.hotel-deal-card__image {
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--color-background-secondary);
}

.hotel-deal-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hotel-deal-card__body {
  padding: var(--space-md) var(--space-lg) var(--space-lg);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.hotel-deal-card__title {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.35;
  margin-bottom: var(--space-sm);
}

.hotel-deal-card__meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: var(--space-md);
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.hotel-deal-card__nights {
  font-size: 15px;
  font-weight: 700;
  font-family: var(--font-heading);
}

.hotel-deal-card__pricing {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.hotel-deal-card__discount {
  background: var(--color-discount-light);
  color: var(--color-discount);
  font-size: 12px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.hotel-deal-card__price {
  font-size: 20px;
  font-weight: 700;
  font-family: var(--font-heading);
}

.hotel-deal-card__original {
  font-size: 14px;
  color: var(--color-text-muted);
  text-decoration: line-through;
}

.hotel-deal-card__inclusions {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.hotel-deal-card__inclusions li {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.hotel-deal-card__check {
  color: var(--color-discount);
  font-weight: 700;
  flex-shrink: 0;
}

.hotel-deal-card__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 12px;
  font-size: 14px;
  text-decoration: none;
}
</style>
