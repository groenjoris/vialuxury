<template>
  <div class="upgrade-selection">
    <h4 class="upgrade-selection__title">{{ t('room.availableUpgradesForDate') }}</h4>
    <div class="upgrade-selection__grid">
      <button
        v-for="room in deal.roomUpgrades"
        :key="room.id"
        type="button"
        class="room-card"
        :class="{ 'room-card--selected': store.selectedRoomId === room.id }"
        @click="store.selectRoom(room.id)"
      >
        <div class="room-card__image">
          <img :src="room.image" :alt="localized(room.name)" loading="lazy" />
          <span v-if="store.selectedRoomId === room.id" class="room-card__check">✓</span>
        </div>
        <div class="room-card__info">
          <span class="room-card__name">{{ localized(room.name) }}</span>
          <span class="room-card__price">+ {{ formatPrice(room.priceExtra * deal.nights) }}</span>
        </div>
        <p class="room-card__desc">{{ localized(room.description) }}</p>
        <ul class="room-card__features">
          <li v-for="feature in room.features.slice(0, 4)" :key="localized(feature)">
            {{ localized(feature) }}
          </li>
        </ul>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Deal } from '~/types/deal'
import { useDealStore } from '~/stores/deal'
import { formatPrice } from '~/utils/formatPrice'

const { t, localized } = useI18n()

defineProps<{
  deal: Deal
}>()

const store = useDealStore()
</script>

<style scoped>
.upgrade-selection {
  grid-column: 1 / -1;
  padding: var(--space-lg);
  background: var(--color-background-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
}

.upgrade-selection__title {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--space-md);
  color: var(--color-text-primary);
}

.upgrade-selection__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.room-card {
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--color-surface);
  text-align: left;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.room-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-hover);
}

.room-card--selected {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.room-card__image {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--color-background-secondary);
}

.room-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.room-card__check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}

.room-card__info {
  padding: var(--space-md) var(--space-md) var(--space-xs);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-sm);
}

.room-card__name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.room-card__price {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  white-space: nowrap;
}

.room-card__desc {
  padding: 0 var(--space-md);
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xs);
}

.room-card__features {
  padding: var(--space-xs) var(--space-md) var(--space-md);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.room-card__features li {
  font-size: 13px;
  color: var(--color-text-secondary);
  padding-left: 16px;
  position: relative;
}

.room-card__features li::before {
  content: '·';
  position: absolute;
  left: 4px;
  color: var(--color-text-muted);
  font-weight: 700;
}

@media (max-width: 768px) {
  .upgrade-selection__grid {
    grid-template-columns: 1fr;
  }
}
</style>
