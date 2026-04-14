<template>
  <div class="hotel-meta">
    <div class="hotel-meta__stars">
      <span v-for="n in starRating" :key="n" class="star">★</span>
    </div>
    <h1 class="hotel-meta__name">
      <strong>{{ name }},</strong> {{ location.city }}, {{ location.region }}
    </h1>
    <div class="hotel-meta__info">
      <span class="hotel-meta__score">{{ reviews.overallScore }}</span>
      <span class="hotel-meta__divider">|</span>
      <span class="hotel-meta__reviews">{{ reviews.totalReviews }} beoordelingen</span>
      <span class="hotel-meta__divider">·</span>
      <a href="#location" class="hotel-meta__map-link">Bekijk op kaart</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HotelLocation, ReviewSummary } from '~/types/hotel'

defineProps<{
  name: string
  starRating: number
  location: HotelLocation
  reviews: ReviewSummary
}>()
</script>

<style scoped>
.hotel-meta {
  margin-bottom: var(--space-md);
}

.hotel-meta__stars {
  color: var(--color-primary);
  font-size: 14px;
  margin-bottom: var(--space-xs);
}

.hotel-meta__name {
  font-size: 28px;
  font-weight: 400;
  margin-bottom: var(--space-sm);
}

.hotel-meta__name strong {
  font-weight: 700;
}

.hotel-meta__info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 14px;
  color: var(--color-text-secondary);
}

.hotel-meta__score {
  font-weight: 600;
  color: var(--color-text-primary);
}

.hotel-meta__divider {
  color: var(--color-text-muted);
}

.hotel-meta__map-link {
  color: var(--color-primary);
  text-decoration: underline;
}
</style>
