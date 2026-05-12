<template>
  <div class="map-preview" @click="$emit('click')">
    <img
      :src="mapImage"
      :alt="t('search.viewOnMap')"
      class="map-preview__img"
      loading="lazy"
    />
    <button type="button" class="map-preview__btn" @click.stop="$emit('click')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      {{ t('search.viewOnMap') }}
    </button>
  </div>
</template>

<script setup lang="ts">
const { t } = useNorthstarI18n()

defineEmits<{
  click: []
}>()

// Static OSM tile around Amsterdam (zoom 11) — gives a nice city-level overview.
// Composes 2x1 tiles for a wider aspect ratio.
const mapImage = computed(() => {
  // Single tile: Amsterdam ~ zoom 11 → x=1052, y=671
  return 'https://tile.openstreetmap.org/11/1052/671.png'
})
</script>

<style scoped>
.map-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 5;
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  background: var(--color-background-secondary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow var(--transition-fast);
}

.map-preview:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.map-preview__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.map-preview__btn {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: background var(--transition-fast), transform var(--transition-fast);
}

.map-preview__btn:hover {
  background: var(--color-primary-hover);
  transform: translate(-50%, -50%) scale(1.04);
}
</style>
