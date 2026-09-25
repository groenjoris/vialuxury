<template>
  <!-- Multi Hotel Trip — kerngetallen boven het voorbeeld-reisschema:
       "7 dagen · 3 tophotels · 9 bezienswaardigheden", elk met een icoon.
       Gedeeld door de varianten Summary, Collapsed en Per stad. -->
  <ul class="tis">
    <li class="tis__item">
      <svg class="tis__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" />
      </svg>
      <span>{{ t('trip.itin.stats.days').replace('{n}', String(days)) }}</span>
    </li>
    <li class="tis__item">
      <svg class="tis__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 21V8l9-5 9 5v13" /><path d="M3 21h18" /><path d="M9.5 21v-5h5v5" /><path d="M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M15.5 14.5h.01" />
      </svg>
      <span>{{ t('trip.itin.stats.hotels').replace('{n}', String(hotels)) }}</span>
    </li>
    <li class="tis__item">
      <svg class="tis__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 22s7-6.4 7-12a7 7 0 0 0-14 0c0 5.6 7 12 7 12z" /><path d="m12 6.8 1.1 2.3 2.5.3-1.8 1.7.5 2.5-2.3-1.2-2.3 1.2.5-2.5-1.8-1.7 2.5-.3z" />
      </svg>
      <span>{{ t('trip.itin.stats.sights').replace('{n}', String(sights)) }}</span>
    </li>
  </ul>
</template>

<script setup lang="ts">
defineProps<{ days: number; hotels: number; sights: number }>()
const { t } = useMultiHotelTripI18n()
</script>

<style scoped>
.tis {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 24px;
}
.tis__item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-text-primary);
}
.tis__icon { width: 22px; height: 22px; flex-shrink: 0; color: var(--color-text-primary); }
@media (max-width: 767px) {
  .tis { gap: 6px 16px; }
  .tis__item { font-size: 14px; gap: 6px; }
  .tis__icon { width: 20px; height: 20px; }
}
</style>
