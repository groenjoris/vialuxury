<template>
  <!-- Multi Hotel Trip — zwevende prototype-schakelaar linksboven op de
       checkoutstap "Kies je opties" van een vakantie: room-table-variant
       Strak / Lange kolom / Carousel (zie useMultiHotelTripRoomTableVariant).
       Alleen voor testen/stakeholders. -->
  <div class="rtvs" role="group" aria-label="Variant room table">
    <span class="rtvs__label">Room table</span>
    <div class="rtvs__group">
      <button
        v-for="v in ROOM_TABLE_VARIANTS"
        :key="v.id"
        type="button"
        class="rtvs__btn"
        :class="{ 'rtvs__btn--on': variant === v.id }"
        :aria-pressed="variant === v.id"
        @click="setVariant(v.id)"
      >{{ v.label }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ROOM_TABLE_VARIANTS, useMultiHotelTripRoomTableVariant } from '~/composables-multi-hotel-trip/useMultiHotelTripRoomTableVariant'

const { variant, setVariant } = useMultiHotelTripRoomTableVariant()
</script>

<style scoped>
/* Zelfde look als de reisschema-schakelaar op de vakantie-PDP (TripItineraryVariantSwitch). */
.rtvs {
  position: fixed;
  top: 88px;
  left: 16px;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px 10px 12px;
  border-radius: 14px;
  background: rgba(20, 20, 20, 0.88);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(6px);
  font-family: var(--font-body);
}
.rtvs__label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
}
.rtvs__group { display: flex; gap: 4px; }
.rtvs__btn {
  padding: 6px 10px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 999px;
  background: transparent;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease;
}
.rtvs__btn:hover { background: rgba(255, 255, 255, 0.14); }
.rtvs__btn--on { background: #fff; border-color: #fff; color: #141414; }
.rtvs__btn:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
</style>
