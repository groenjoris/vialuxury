<template>
  <section class="arrangement-details">
    <div class="arrangement-details__header">
      <h2>
        In dit arrangement voor <strong>{{ persons }} {{ persons === 1 ? 'persoon' : 'personen' }}</strong> is het volgende inbegrepen:
      </h2>
      <p class="text-secondary">ViaLuxury en het hotel hebben met zorg een mooi arrangement samengesteld.</p>
    </div>

    <div class="arrangement-details__grid">
      <div v-for="item in items" :key="item.id" class="detail-card">
        <div v-if="item.image" class="detail-card__image">
          <img :src="item.image" :alt="item.title" />
        </div>
        <div class="detail-card__content">
          <h3 class="detail-card__title">{{ item.title }}</h3>
          <p class="detail-card__desc">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ArrangementItem } from '~/types/booking'

defineProps<{
  items: ArrangementItem[]
  persons: number
}>()
</script>

<style scoped>
.arrangement-details {
  padding: var(--space-xl) 0;
  border-top: 1px solid var(--color-border);
}

.arrangement-details__header {
  margin-bottom: var(--space-xl);
}

.arrangement-details__header h2 {
  font-size: 22px;
  margin-bottom: var(--space-sm);
}

.arrangement-details__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-xl);
}

.detail-card__image {
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: var(--space-md);
  aspect-ratio: 16/10;
}

.detail-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-card__title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: var(--space-sm);
}

.detail-card__desc {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}
</style>
