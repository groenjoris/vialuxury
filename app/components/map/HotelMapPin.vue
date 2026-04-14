<script setup lang="ts">
/**
 * HotelMapPin — visual-only component for documentation. The actual
 * Leaflet markers use the helpers in `./pinTemplates.ts` (plain HTML
 * strings) for performance: rendering 50+ Vue subtrees through divIcons
 * would be wasteful.
 */
defineProps<{
  state?: 'default' | 'selected' | 'soldOut'
}>()
</script>

<template>
  <div class="hotel-pin" :class="`hotel-pin--${state ?? 'default'}`">
    <svg viewBox="0 0 24 24" :width="state === 'selected' ? 22 : 14" :height="state === 'selected' ? 22 : 14" fill="white" aria-hidden="true">
      <path d="M12 2 15 8l6 .9-4.5 4.4L17.5 20 12 16.9 6.5 20 8 13.3 3.5 8.9 9.5 8z" />
    </svg>
  </div>
</template>
