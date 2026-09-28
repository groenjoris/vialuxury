<template>
  <!-- Prijsweergave-schakelaar (prototype): totaalprijs of prijs per persoon
       voor de vakanties. Rechtsonder op de homepage, boven de hero-fotoschakelaar. -->
  <div class="pvs" role="group" aria-label="Prijsweergave vakanties">
    <span class="pvs__title">Prijs vakanties</span>
    <div class="pvs__seg">
      <button
        v-for="v in PRICE_VARIANTS"
        :key="v.id"
        type="button"
        class="pvs__btn"
        :class="{ 'pvs__btn--active': variant === v.id }"
        :aria-pressed="variant === v.id"
        @click="setVariant(v.id)"
      >{{ v.label }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PRICE_VARIANTS, useMultiHotelTripPriceVariant } from '~/composables-multi-hotel-trip/useMultiHotelTripPriceVariant'

const { variant, setVariant } = useMultiHotelTripPriceVariant()
</script>

<style scoped>
/* Zelfde look als de hero-fotoschakelaar (HeroPhotoSwitcher), erboven geplaatst. */
.pvs {
  position: fixed;
  bottom: 196px;
  right: 20px;
  z-index: 900;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 8px 8px 6px;
  background: rgba(14, 14, 12, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  transition: opacity 200ms ease, background 200ms ease;
  opacity: 0.55;
}
.pvs:hover,
.pvs:focus-within {
  opacity: 1;
  background: rgba(14, 14, 12, 0.85);
}
.pvs__title {
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1;
  user-select: none;
}
.pvs__seg { display: flex; gap: 2px; padding: 2px; border-radius: 999px; background: rgba(255, 255, 255, 0.12); }
.pvs__btn {
  padding: 6px 10px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #fff;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease;
}
.pvs__btn:hover { background: rgba(255, 255, 255, 0.14); }
.pvs__btn--active { background: #fff; color: #141414; }
.pvs__btn:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
</style>
