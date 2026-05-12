<script setup lang="ts">
import { ref } from 'vue'
import type { MapHotel } from '~/types/mapHotel'
import HotelMapPackageCard from './HotelMapPackageCard.vue'

/**
 * HotelMapSidebar — left-anchored panel that shows the selected hotel's
 * details and packages. Per Figma `3642-10526`. Includes a tiny image
 * carousel and renders a list of HotelMapPackageCard.
 */

const props = defineProps<{
  hotel: MapHotel
}>()
defineEmits<{ close: [] }>()

const carouselIndex = ref(0)
// Hotels in this dataset only carry a single hero image; we fan it out
// into a synthetic gallery so the carousel UI is meaningful in the demo.
const carouselImages = [
  props.hotel.heroImage,
  '/images/hotel-ter-zand-room.jpg',
  '/images/hotel-ter-zand-tower.jpg',
  '/images/hotel-ter-zand-pool.jpg',
]

function prev() {
  carouselIndex.value = (carouselIndex.value - 1 + carouselImages.length) % carouselImages.length
}
function next() {
  carouselIndex.value = (carouselIndex.value + 1) % carouselImages.length
}

const cheapestDiscount = Math.max(...props.hotel.packages.map((p) => p.discountPct))
</script>

<template>
  <aside class="map-sidebar">
    <header class="map-sidebar__header">
      <div class="map-sidebar__top">
        <span class="map-sidebar__location">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
          </svg>
          {{ hotel.city }}, {{ hotel.country }}
        </span>
        <button type="button" class="map-sidebar__fav" aria-label="Toevoegen aan favorieten">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      <h3 class="map-sidebar__name">{{ hotel.name }}</h3>
      <div class="map-sidebar__meta">
        <div class="map-sidebar__stars">
          <span v-for="n in hotel.starRating" :key="n">★</span>
        </div>
        <span class="map-sidebar__discount">-{{ cheapestDiscount }}%</span>
      </div>
    </header>

    <div class="map-sidebar__carousel">
      <img :src="carouselImages[carouselIndex]" :alt="hotel.name" class="map-sidebar__carousel-img" />
      <button type="button" class="map-sidebar__carousel-arrow map-sidebar__carousel-arrow--prev" @click="prev" aria-label="Vorige">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button type="button" class="map-sidebar__carousel-arrow map-sidebar__carousel-arrow--next" @click="next" aria-label="Volgende">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>
      <div class="map-sidebar__carousel-dots">
        <span
          v-for="(_, i) in carouselImages"
          :key="i"
          class="map-sidebar__carousel-dot"
          :class="{ 'map-sidebar__carousel-dot--active': i === carouselIndex }"
        />
      </div>
    </div>

    <div class="map-sidebar__packages">
      <NorthstarHotelMapPackageCard
        v-for="pkg in hotel.packages"
        :key="pkg.id"
        :pkg="pkg"
      />
    </div>
  </aside>
</template>

<style scoped>
.map-sidebar {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 327px;
  background: var(--color-surface);
  box-shadow: var(--shadow-sidebar);
  z-index: 600;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-top: 4px solid var(--color-primary);
}

.map-sidebar__header {
  padding: var(--space-md) var(--space-md) var(--space-sm);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.map-sidebar__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.map-sidebar__location {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--color-text-secondary);
}

.map-sidebar__location svg {
  color: var(--color-primary);
}

.map-sidebar__fav {
  background: transparent;
  border: 0;
  color: var(--color-text-primary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.map-sidebar__name {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.15;
}

.map-sidebar__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.map-sidebar__stars {
  color: var(--color-text-primary);
  font-size: 13px;
  letter-spacing: 1px;
}

.map-sidebar__discount {
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 700;
}

.map-sidebar__carousel {
  position: relative;
  margin: 0 var(--space-md);
  border-radius: var(--radius-sm);
  overflow: hidden;
  height: 180px;
  flex-shrink: 0;
}

.map-sidebar__carousel-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.map-sidebar__carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.9);
  border: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-primary);
  box-shadow: var(--shadow-sm);
}

.map-sidebar__carousel-arrow--prev { left: 8px; }
.map-sidebar__carousel-arrow--next { right: 8px; }

.map-sidebar__carousel-dots {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
}

.map-sidebar__carousel-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
}

.map-sidebar__carousel-dot--active {
  background: white;
}

.map-sidebar__packages {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md);
}
</style>
