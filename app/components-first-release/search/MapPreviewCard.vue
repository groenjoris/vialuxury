<template>
  <div class="map-preview" @click="$emit('click')">
    <FirstReleaseStaticMiniMap :lat="center.lat" :lng="center.lng" :zoom="center.zoom" />
    <button type="button" class="map-preview__btn" @click.stop="$emit('click')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4.5 9.75768C4.5 15.5 12 22 12 22C12 22 19.5 15.5 19.5 9.75768C19.5 4.81181 15.6559 2 12 2C8.34409 2 4.5 4.81181 4.5 9.75768Z" /><path d="M12 12C13.3807 12 14.5 10.8807 14.5 9.5C14.5 8.11929 13.3807 7 12 7C10.6193 7 9.5 8.11929 9.5 9.5C9.5 10.8807 10.6193 12 12 12Z" />
      </svg>
      {{ t('search.viewOnMap') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { CITY_COORDS, PROVINCE_COORDS } from '~/data/city-coordinates'

const { t } = useFirstReleaseI18n()

defineEmits<{
  click: []
}>()

const { selectedCities, selectedDestinations } = useFirstReleaseSearchState()

/** Centre the preview on the entered destination:
 *   - a picked city  → city centroid, zoom 11
 *   - a picked region/province → its centroid + zoom
 *   - nothing entered → a zoomed-out view with Amsterdam visible. */
const AMSTERDAM_DEFAULT = { lat: 52.3676, lng: 4.9041, zoom: 7 }
const center = computed(() => {
  const city = selectedCities.value[0]
  if (city && CITY_COORDS[city.name]) {
    const c = CITY_COORDS[city.name]
    return { lat: c.lat, lng: c.lng, zoom: 11 }
  }
  const destId = selectedDestinations.value[0]
  if (destId && PROVINCE_COORDS[destId]) {
    return { ...PROVINCE_COORDS[destId] }
  }
  return AMSTERDAM_DEFAULT
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
  /* Match the standard small radius used by Bekijk / Vind deals. */
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: background var(--transition-fast);
}

.map-preview__btn:hover {
  /* Colour-only hover — no grow. */
  background: var(--color-primary-hover);
}
</style>
