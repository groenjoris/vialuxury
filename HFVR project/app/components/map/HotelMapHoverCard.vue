<script setup lang="ts">
import { computed } from 'vue'
import type { MapHotel } from '~/types/mapHotel'

/**
 * HotelMapHoverCard — the popup card that appears above a hotel pin on
 * hover. Variants are derived from hotel state:
 *  - Multiple packages, varied nights → "Deals for 1, 2 or 3 nights"
 *  - Single package → "Package for 3 nights"
 *  - Sold out → red "Sold out for your dates"
 *  - Persuasive → dark bottom bar "Only X packages left"
 *
 * Position is supplied in viewport coordinates by the parent (which gets
 * them from the Leaflet mouseover event).
 */

const props = defineProps<{
  hotel: MapHotel
  position: { x: number; y: number } | null
}>()

const cheapestPackage = computed(() => {
  return [...props.hotel.packages]
    .filter((p) => !p.soldOut)
    .sort((a, b) => a.priceFrom - b.priceFrom)[0] ?? props.hotel.packages[0]!
})

const dealsLabel = computed(() => {
  if (props.hotel.soldOut) return 'Sold out for your dates'
  const nights = Array.from(new Set(props.hotel.packages.map((p) => p.nights))).sort()
  if (nights.length === 1) return `Package for ${nights[0]} nights`
  if (nights.length === 2) return `Deals for ${nights[0]} or ${nights[1]} nights`
  return `Deals for ${nights.slice(0, -1).join(', ')} or ${nights[nights.length - 1]} nights`
})

const cardStyle = computed(() => {
  if (!props.position) return { display: 'none' }
  // Position the card so the bottom-center anchors above the pin.
  const CARD_W = 320
  const CARD_H = 140
  const PIN_OFFSET = 28
  return {
    left: `${props.position.x - CARD_W / 2}px`,
    top: `${props.position.y - CARD_H - PIN_OFFSET}px`,
    width: `${CARD_W}px`,
  }
})
</script>

<template>
  <Teleport to="body">
    <div v-if="position" class="hover-card" :style="cardStyle">
      <div class="hover-card__inner" :class="{ 'hover-card__inner--soldOut': hotel.soldOut }">
        <img :src="hotel.heroImage" :alt="hotel.name" class="hover-card__image" />
        <div class="hover-card__body">
          <h4 class="hover-card__title">{{ hotel.name }}</h4>
          <div class="hover-card__stars">
            <span v-for="n in hotel.starRating" :key="n">★</span>
          </div>
          <p
            class="hover-card__deals"
            :class="{ 'hover-card__deals--soldOut': hotel.soldOut }"
          >
            {{ dealsLabel }}
          </p>
          <div class="hover-card__footer">
            <span
              class="hover-card__discount"
              :class="{ 'hover-card__discount--soldOut': hotel.soldOut }"
            >
              -{{ cheapestPackage.discountPct }}%
            </span>
            <div class="hover-card__price">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span class="hover-card__price-old">€{{ cheapestPackage.originalPrice }}</span>
              <span class="hover-card__price-from">From</span>
              <span class="hover-card__price-final">{{ cheapestPackage.priceFrom }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="hotel.lowAvailabilityCount && !hotel.soldOut" class="hover-card__persuasive">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        Only {{ hotel.lowAvailabilityCount }} packages left
      </div>
      <div class="hover-card__tail" />
    </div>
  </Teleport>
</template>

<style scoped>
.hover-card {
  position: fixed;
  z-index: 1000;
  pointer-events: none;
  filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.18));
}

.hover-card__inner {
  display: flex;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  overflow: hidden;
  border-top: 4px solid var(--color-primary);
}

.hover-card__inner--soldOut {
  border-top-color: var(--color-text-muted);
}

.hover-card__image {
  width: 96px;
  height: 96px;
  object-fit: cover;
  flex-shrink: 0;
}

.hover-card__body {
  flex: 1;
  padding: 8px 10px 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.hover-card__title {
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hover-card__stars {
  color: var(--color-text-primary);
  font-size: 10px;
  letter-spacing: 1px;
  line-height: 1;
  margin-top: 2px;
}

.hover-card__deals {
  font-family: var(--font-body);
  font-size: 11px;
  margin: 2px 0 0;
  color: var(--color-primary);
  font-weight: 600;
}

.hover-card__deals--soldOut {
  color: var(--color-error);
}

.hover-card__footer {
  margin-top: auto;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-top: 6px;
}

.hover-card__discount {
  background: var(--color-text-primary);
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: var(--radius-xs);
}

.hover-card__discount--soldOut {
  background: var(--color-text-muted);
}

.hover-card__price {
  display: flex;
  align-items: baseline;
  gap: 4px;
  color: var(--color-text-primary);
  font-size: 11px;
}

.hover-card__price svg {
  align-self: center;
  color: var(--color-text-secondary);
}

.hover-card__price-old {
  text-decoration: line-through;
  color: var(--color-error);
  font-size: 10px;
}

.hover-card__price-from {
  color: var(--color-text-secondary);
  font-size: 10px;
}

.hover-card__price-final {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.hover-card__persuasive {
  background: var(--color-text-primary);
  color: white;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-bottom-left-radius: var(--radius-md);
  border-bottom-right-radius: var(--radius-md);
}

.hover-card__tail {
  position: absolute;
  bottom: -7px;
  left: 50%;
  width: 14px;
  height: 14px;
  transform: translateX(-50%) rotate(45deg);
  background: var(--color-surface);
}
</style>
