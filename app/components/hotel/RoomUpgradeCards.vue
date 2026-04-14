<template>
  <section class="room-upgrades">
    <h3 class="room-upgrades__title">Kies je kamertype</h3>
    <p class="room-upgrades__subtitle">
      Standaard kamer is inbegrepen. Upgrade voor extra comfort.
    </p>

    <div class="room-upgrades__grid">
      <!-- Base room (included) -->
      <button
        class="room-card"
        :class="{ 'room-card--selected': store.selectedRoomId === deal.baseRoomType.id }"
        @click="store.selectRoom(deal.baseRoomType.id)"
      >
        <div class="room-card__image">
          <img :src="deal.baseRoomType.image" :alt="deal.baseRoomType.name" loading="lazy" />
          <span v-if="store.selectedRoomId === deal.baseRoomType.id" class="room-card__check">✓</span>
        </div>
        <div class="room-card__info">
          <span class="room-card__name">{{ deal.baseRoomType.name }}</span>
          <span class="room-card__price room-card__price--included">Inbegrepen</span>
        </div>
        <ul class="room-card__features">
          <li v-for="feature in deal.baseRoomType.features.slice(0, 3)" :key="feature">
            {{ feature }}
          </li>
        </ul>
      </button>

      <!-- Upgrade options -->
      <button
        v-for="room in deal.roomUpgrades"
        :key="room.id"
        class="room-card"
        :class="{ 'room-card--selected': store.selectedRoomId === room.id }"
        @click="store.selectRoom(room.id)"
      >
        <div class="room-card__image">
          <img :src="room.image" :alt="room.name" loading="lazy" />
          <span v-if="store.selectedRoomId === room.id" class="room-card__check">✓</span>
        </div>
        <div class="room-card__info">
          <span class="room-card__name">{{ room.name }}</span>
          <span class="room-card__price">+ {{ formatPrice(room.priceExtra * deal.nights) }}</span>
        </div>
        <ul class="room-card__features">
          <li v-for="feature in room.features.slice(0, 3)" :key="feature">
            {{ feature }}
          </li>
        </ul>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useDealStore } from '~/stores/deal'
import { formatPrice } from '~/utils/formatPrice'
import type { Deal } from '~/types/deal'

defineProps<{
  deal: Deal
}>()

const store = useDealStore()
</script>

<style scoped>
.room-upgrades {
  padding: var(--space-xl) 0;
  border-top: 1px solid var(--color-border-light);
}

.room-upgrades__title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.room-upgrades__subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
}

.room-upgrades__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
}

.room-card__price--included {
  color: var(--color-discount);
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

@media (max-width: 640px) {
  .room-upgrades__grid {
    grid-template-columns: 1fr;
  }
}
</style>
