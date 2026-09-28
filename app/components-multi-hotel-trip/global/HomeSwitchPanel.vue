<template>
  <!-- Multi Hotel Trip — prototype-schakelaars van de homepage, samen in het
       zwevende paneel linksboven (zelfde systeem als op de vakantie-PDP):
       prijsweergave vakanties (totaalprijs / prijs p.p., geldt op alle
       pagina's) en de hero-foto (‹ 1/8 ›). -->
  <PrototypeSwitchPanel title="Prototype" storage-key="vl_mht_home_switch_open_v2">
    <div class="psw__section">
      <span class="psw__label">Prijs vakanties</span>
      <div class="psw__group" role="group" aria-label="Prijsweergave vakanties">
        <button
          v-for="v in PRICE_VARIANTS"
          :key="v.id"
          type="button"
          class="psw__btn"
          :class="{ 'psw__btn--on': priceVariant === v.id }"
          :aria-pressed="priceVariant === v.id"
          @click="setPriceVariant(v.id)"
        >{{ v.label }}</button>
      </div>
    </div>
    <div class="psw__section">
      <span class="psw__label">Hero-foto</span>
      <div class="psw__group" role="group" aria-label="Wissel hero-foto">
        <button type="button" class="psw__btn psw__btn--icon" aria-label="Vorige foto" @click="setHeroPhotoIndex(heroPhotoIndex - 1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <span class="psw__count" aria-live="polite">{{ heroPhotoIndex + 1 }}/{{ heroPhotos.length }}</span>
        <button type="button" class="psw__btn psw__btn--icon" aria-label="Volgende foto" @click="setHeroPhotoIndex(heroPhotoIndex + 1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>
    </div>
  </PrototypeSwitchPanel>
</template>

<script setup lang="ts">
import PrototypeSwitchPanel from './PrototypeSwitchPanel.vue'
import { PRICE_VARIANTS, useMultiHotelTripPriceVariant } from '~/composables-multi-hotel-trip/useMultiHotelTripPriceVariant'
import { useMultiHotelTripHomeVariant } from '~/composables-multi-hotel-trip/useMultiHotelTripHomeVariant'

const { variant: priceVariant, setVariant: setPriceVariant } = useMultiHotelTripPriceVariant()
// setHeroPhotoIndex rekent zelf rond (modulo), dus -1 en +1 lopen door.
const { heroPhotos, heroPhotoIndex, setHeroPhotoIndex } = useMultiHotelTripHomeVariant()
</script>
