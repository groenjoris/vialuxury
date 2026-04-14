<template>
  <section class="deal-description">
    <div class="deal-description__text">
      <p>{{ description }}</p>
    </div>

    <div class="deal-description__included">
      <h3 class="deal-description__heading">
        In dit arrangement voor <strong>{{ persons }} {{ persons === 1 ? 'persoon' : 'personen' }}</strong> is het volgende inbegrepen:
      </h3>
      <ul class="included-list">
        <li v-for="item in items" :key="item.id" class="included-list__item">
          <span class="included-list__icon">✓</span>
          <span>{{ item.title }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ArrangementItem } from '~/types/booking'

defineProps<{
  description: string
  items: ArrangementItem[]
  persons: number
}>()
</script>

<style scoped>
.deal-description__text {
  font-size: 15px;
  line-height: 1.7;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
}

.deal-description__heading {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 400;
  margin-bottom: var(--space-md);
}

.deal-description__heading strong {
  font-weight: 700;
}

.included-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm) var(--space-xl);
}

.included-list__item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 14px;
}

.included-list__icon {
  color: var(--color-primary);
  font-weight: 700;
  flex-shrink: 0;
}
</style>
