<template>
  <div class="mini-map">
    <NuxtLink
      :to="`/first-release/kaart?focus=${slug}`"
      class="mini-map__placeholder"
      :aria-label="t('common.viewMap')"
    >
      <FirstReleaseStaticMiniMap :lat="lat" :lng="lng" :zoom="zoom" />
      <div class="mini-map__pin">
        <FirstReleaseMapPin />
      </div>
    </NuxtLink>
    <div class="mini-map__footer">
      <span class="mini-map__address">{{ address }}</span>
      <NuxtLink :to="`/first-release/kaart?focus=${slug}`" class="mini-map__view-link">
        {{ t('common.viewMap') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Shared mini-map card for the deal + hotel pages: a square static map
 * (centred on the hotel, with the teardrop pin) that links through to the
 * full-screen /kaart, plus an address + "Bekijk op kaart" footer row.
 * Per-page mobile height caps are driven by `--vl-minimap-max-h`.
 */
const { t } = useFirstReleaseI18n()

withDefaults(defineProps<{
  slug: string
  lat: number
  lng: number
  address: string
  zoom?: number
}>(), {
  zoom: 10,
})
</script>

<style scoped>
.mini-map {
  display: flex;
  flex-direction: column;
  gap: 8px;
  scroll-margin-top: 88px;
}
.mini-map__placeholder {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  max-height: var(--vl-minimap-max-h, none);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
}
.mini-map__pin {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.25));
  z-index: 2;
  pointer-events: none;
}
.mini-map__footer {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-md);
}
.mini-map__address {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}
.mini-map__view-link {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
  flex-shrink: 0;
}
.mini-map__view-link:hover {
  color: var(--color-primary-hover);
  text-decoration: underline;
}
</style>
