<template>
  <div class="vl-hotel-card" role="button" tabindex="0" @click="$emit('click')" @keydown.enter="$emit('click')">
    <div class="vl-hotel-card__box">
      <div class="vl-hotel-card__band" />
      <div class="vl-hotel-card__inner">
        <img :src="image" :alt="name" class="vl-hotel-card__image" />
        <div class="vl-hotel-card__body">
          <h4 class="vl-hotel-card__title">{{ name }}</h4>
          <div v-if="starRating" class="vl-hotel-card__stars" aria-hidden="true">
            <span v-for="n in starRating" :key="n">★</span>
          </div>
          <p class="vl-hotel-card__location">
            <svg class="vl-hotel-card__loc-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span class="vl-hotel-card__location-text">
              {{ city }}<span v-if="region">, {{ region }}</span>
            </span>
          </p>
          <div class="vl-hotel-card__footer">
            <svg class="vl-hotel-card__persons" width="18" height="14" viewBox="0 0 24 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="7" cy="6" r="3" />
              <circle cx="17" cy="6" r="3" />
              <path d="M2 17c0-3 2.2-5 5-5s5 2 5 5" />
              <path d="M12 17c0-3 2.2-5 5-5s5 2 5 5" />
            </svg>
            <span class="vl-hotel-card__price-from">Vanaf</span>
            <span class="vl-hotel-card__price">{{ formatPrice(price) }}</span>
            <span v-if="nights" class="vl-hotel-card__nights">/ {{ nightsLabel(nights) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/lib/utils/formatPrice'
import { nightsLabel } from '~/lib/utils/plural'

withDefaults(
  defineProps<{
    /** Hotel display name. */
    name: string
    /** Hero image URL. */
    image: string
    /** Star rating (number of ★ glyphs). */
    starRating?: number
    /** City line. */
    city: string
    /** Region appended after the city. */
    region?: string
    /** Cheapest price shown after "Vanaf". */
    price: number
    /** Nights for the "/ N nachten" suffix. */
    nights?: number
  }>(),
  {
    starRating: 0,
    region: '',
    nights: 0,
  },
)

defineEmits<{ click: [] }>()
</script>

<style scoped>
.vl-hotel-card {
  width: 296px;
  cursor: pointer;
  filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.18));
  outline: none;
}
.vl-hotel-card:focus-visible .vl-hotel-card__box {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.vl-hotel-card__box {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.vl-hotel-card__band {
  flex: 0 0 4px;
  background: var(--color-primary);
}

.vl-hotel-card__inner {
  display: flex;
  background: var(--color-surface);
  min-height: 136px;
}

.vl-hotel-card__image {
  display: block;
  width: 88px;
  align-self: stretch;
  flex-shrink: 0;
  object-fit: cover;
}

.vl-hotel-card__body {
  flex: 1;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.vl-hotel-card__title {
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.vl-hotel-card__stars {
  color: var(--color-text-primary);
  font-size: 13px;
  letter-spacing: 1px;
  line-height: 1;
  margin-top: 2px;
}

.vl-hotel-card__location {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 4px 0 0;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.25;
  min-width: 0;
}
.vl-hotel-card__loc-icon { flex-shrink: 0; }
.vl-hotel-card__location-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.vl-hotel-card__footer {
  margin-top: auto;
  display: flex;
  align-items: baseline;
  gap: 4px;
  color: var(--color-text-primary);
}
.vl-hotel-card__persons { align-self: center; flex-shrink: 0; }
.vl-hotel-card__price-from {
  font-size: 11px;
  font-style: italic;
  color: var(--color-text-secondary);
}
.vl-hotel-card__price {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
}
.vl-hotel-card__nights {
  font-size: 12px;
  color: var(--color-text-secondary);
}
</style>
