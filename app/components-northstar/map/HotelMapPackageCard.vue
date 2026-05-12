<script setup lang="ts">
import type { MapHotelPackage } from '~/types/mapHotel'

const { t, localized } = useNorthstarI18n()

defineProps<{
  pkg: MapHotelPackage
}>()
</script>

<template>
  <div class="package-card" :class="{ 'package-card--soldOut': pkg.soldOut }">
    <div class="package-card__header">
      <div class="package-card__title">
        <span class="package-card__pill">Package</span>
        <span>{{ pkg.nights }} {{ pkg.nights === 1 ? 'night' : 'nights' }}, {{ pkg.people }} people</span>
      </div>
      <div class="package-card__price">
        <span class="package-card__price-old">€{{ pkg.originalPrice }}</span>
        <span class="package-card__price-from">From</span>
        <span class="package-card__price-final">{{ pkg.priceFrom }}</span>
        <button type="button" class="package-card__info" aria-label="Meer info">i</button>
      </div>
    </div>

    <template v-if="!pkg.soldOut">
      <ul class="package-card__inclusions">
        <li v-for="inc in pkg.inclusions" :key="localized(inc)">
          <span class="package-card__check" aria-hidden="true">✓</span>
          {{ localized(inc) }}
        </li>
        <li class="package-card__more">
          {{ Math.max(0, pkg.totalInclusions - pkg.inclusions.length) }} more extras included!
        </li>
      </ul>
      <button type="button" class="package-card__cta" :aria-label="t('search.viewArrangement')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </button>
    </template>
    <template v-else>
      <p class="package-card__soldout">Sold out for your dates</p>
      <a href="#" class="package-card__alt-link">See available dates</a>
    </template>
  </div>
</template>

<style scoped>
.package-card {
  position: relative;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.package-card--soldOut {
  background: var(--color-background-secondary);
}

.package-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-sm);
}

.package-card__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-primary);
  font-weight: 600;
}

.package-card__pill {
  background: var(--color-primary);
  color: white;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: var(--radius-xs);
  letter-spacing: 0.5px;
}

.package-card__price {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}

.package-card__price-old {
  text-decoration: line-through;
  color: var(--color-error);
  font-size: 10px;
}

.package-card__price-from {
  color: var(--color-text-secondary);
  font-size: 10px;
}

.package-card__price-final {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.package-card__info {
  background: transparent;
  border: 1px solid var(--color-text-muted);
  color: var(--color-text-muted);
  font-size: 10px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-style: italic;
  margin-left: 2px;
}

.package-card__inclusions {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
  color: var(--color-text-primary);
}

.package-card__check {
  color: var(--color-text-primary);
  margin-right: 6px;
  font-weight: 700;
}

.package-card__more {
  font-weight: 600;
  color: var(--color-text-primary);
  margin-top: 2px;
}

.package-card__cta {
  position: absolute;
  bottom: var(--space-md);
  right: var(--space-md);
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: white;
  border: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.package-card__cta:hover {
  background: var(--color-primary-hover);
}

.package-card__soldout {
  margin: 0;
  color: var(--color-error);
  font-size: 12px;
  font-weight: 600;
}

.package-card__alt-link {
  color: var(--color-text-primary);
  font-size: 11px;
  text-decoration: underline;
}
</style>
