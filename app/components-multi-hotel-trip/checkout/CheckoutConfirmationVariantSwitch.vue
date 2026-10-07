<template>
  <!-- Multi Hotel Trip — zwevende prototype-schakelaar linksboven op de
       bevestigingspagina van een vakantie: Rustig / Beeld / Reis
       (zie useMultiHotelTripConfirmationVariant). Alleen voor testen/stakeholders. -->
  <div class="ccvs" role="group" aria-label="Variant bevestigingspagina">
    <span class="ccvs__label">Bevestiging</span>
    <div class="ccvs__group">
      <button
        v-for="v in CONFIRMATION_VARIANTS"
        :key="v.id"
        type="button"
        class="ccvs__btn"
        :class="{ 'ccvs__btn--on': variant === v.id }"
        :aria-pressed="variant === v.id"
        @click="setVariant(v.id)"
      >{{ v.label }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CONFIRMATION_VARIANTS, useMultiHotelTripConfirmationVariant } from '~/composables-multi-hotel-trip/useMultiHotelTripConfirmationVariant'

const { variant, setVariant } = useMultiHotelTripConfirmationVariant()
</script>

<style scoped>
/* Zelfde look als de room-table-schakelaar in de checkout (CheckoutRoomTableVariantSwitch). */
.ccvs {
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
.ccvs__label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
}
.ccvs__group { display: flex; gap: 4px; }
.ccvs__btn {
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
.ccvs__btn:hover { background: rgba(255, 255, 255, 0.14); }
.ccvs__btn--on { background: #fff; border-color: #fff; color: #141414; }
.ccvs__btn:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
/* Mobiel: onder de donkere kop, niet over de inhoud. */
@media (max-width: 800px) {
  .ccvs { top: auto; bottom: 16px; left: 12px; }
}
</style>
