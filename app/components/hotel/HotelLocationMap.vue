<template>
  <section id="location" class="location-section">
    <h2>{{ t('hotel.whereYouStay') }}</h2>
    <p class="location-section__address">📍 {{ address }}</p>
    <div class="location-section__map">
      <div class="map-placeholder">
        <span>{{ t('hotel.mapLabel') }} {{ city }}, {{ region }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

defineProps<{
  address: string
  city: string
  region: string
  lat: number
  lng: number
}>()
</script>

<style scoped>
.location-section {
  padding: var(--space-xl) 0;
  border-top: 1px solid var(--color-border);
}

.location-section h2 {
  margin-bottom: var(--space-sm);
}

.location-section__address {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
}

.location-section__map {
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.map-placeholder {
  background: var(--color-background-secondary);
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}
</style>
