<template>
  <section class="facilities">
    <h3 class="facilities__title">Hotelfaciliteiten</h3>
    <div class="facilities__grid">
      <div v-for="facility in facilities" :key="facility.label" class="facility-item">
        <span class="facility-item__icon">✓</span>
        <span class="facility-item__label">{{ facility.label }}</span>
      </div>
    </div>
    <button class="facilities__more">Bekijk alle {{ facilities.length }} faciliteiten</button>
  </section>
</template>

<script setup lang="ts">
import type { Facility } from '~/types/hotel'

defineProps<{
  facilities: Facility[]
}>()
</script>

<style scoped>
.facilities {
  padding: var(--space-xl) 0;
  border-top: 1px solid var(--color-border);
}

.facilities__title {
  margin-bottom: var(--space-lg);
}

.facilities__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm) var(--space-xl);
}

.facility-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) 0;
  font-size: 14px;
}

.facility-item__icon {
  color: var(--color-primary);
  font-size: 16px;
  font-weight: 700;
}

.facilities__more {
  margin-top: var(--space-md);
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 600;
  text-decoration: underline;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.facilities__more:hover {
  background: var(--color-background-secondary);
}
</style>
