<template>
  <!-- Multi Hotel Trip — variantenschakelaar voor de vakantie-PDP (voor de
       opdrachtgever): highlights aan/uit en de weergave van de inclusies. -->
  <div class="tpv" role="group" aria-label="PDP-varianten">
    <div class="tpv__group">
      <span class="tpv__label">Highlights</span>
      <div class="tpv__seg">
        <button type="button" class="tpv__btn" :class="{ 'tpv__btn--on': highlights }" :aria-pressed="highlights" @click="setHighlights(true)">Aan</button>
        <button type="button" class="tpv__btn" :class="{ 'tpv__btn--on': !highlights }" :aria-pressed="!highlights" @click="setHighlights(false)">Uit</button>
      </div>
    </div>
    <div class="tpv__group">
      <span class="tpv__label">Includes</span>
      <div class="tpv__seg">
        <button
          v-for="v in TRIP_INCLUDES_VARIANTS"
          :key="v.id"
          type="button"
          class="tpv__btn"
          :class="{ 'tpv__btn--on': includes === v.id }"
          :aria-pressed="includes === v.id"
          @click="setIncludes(v.id)"
        >{{ v.label }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// NB: Nuxt dedupliceert het "Trip"-segment → <MultiHotelTripPdpVariantSwitch>.
import { TRIP_INCLUDES_VARIANTS, useMultiHotelTripPdpVariant } from '~/composables-multi-hotel-trip/useMultiHotelTripPdpVariant'

const { highlights, includes, setHighlights, setIncludes } = useMultiHotelTripPdpVariant()
</script>

<style scoped>
.tpv { display: inline-flex; align-items: center; gap: 16px; font-family: var(--font-body); }
.tpv__group { display: inline-flex; align-items: center; gap: 8px; }
.tpv__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.tpv__seg {
  display: inline-flex;
  padding: 3px;
  border-radius: 999px;
  background: var(--color-background-secondary, #f3f1ec);
  border: 1px solid var(--color-border-light);
}
.tpv__btn {
  padding: 4px 11px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.tpv__btn:hover { background: rgba(0, 0, 0, 0.06); }
.tpv__btn--on { background: var(--color-dark, #141414); color: #fff; }
</style>
