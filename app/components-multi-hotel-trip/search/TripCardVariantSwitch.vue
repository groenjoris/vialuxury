<template>
  <!-- Multi Hotel Trip — variantenschakelaar voor de vakantie-dealcards
       (onder het logo op de Vakanties-zoekpagina, voor de opdrachtgever):
       "50-50" (foto | kaartje) of "Overlay" (kaartje semi-transparant over de foto). -->
  <div class="tcv" role="group" aria-label="Dealcard-variant">
    <span class="tcv__label">Dealcard</span>
    <div class="tcv__group">
      <button
        v-for="v in TRIP_CARD_VARIANTS"
        :key="v.id"
        type="button"
        class="tcv__btn"
        :class="{ 'tcv__btn--on': variant === v.id }"
        :aria-pressed="variant === v.id"
        @click="setVariant(v.id)"
      >{{ v.label }}</button>
    </div>
    <!-- Tijdelijk: kleurenkiezer voor de kaartlaag bij Overlay en Inverse —
         Aan/Uit-schakelaar naast de varianten (standaard uit); aan = de
         schuifjes eronder. -->
    <template v-if="variant === 'overlay' || variant === 'inverse'">
      <span class="tcv__label">Kleuren</span>
      <div class="tcv__group" role="group" aria-label="Kleurenkiezer">
        <button type="button" class="tcv__btn" :class="{ 'tcv__btn--on': tunerOpen }" :aria-pressed="tunerOpen" @click="tunerOpen = true">Aan</button>
        <button type="button" class="tcv__btn" :class="{ 'tcv__btn--on': !tunerOpen }" :aria-pressed="!tunerOpen" @click="tunerOpen = false">Uit</button>
      </div>
      <MultiHotelTripOverlayTuner v-if="tunerOpen" :variant="variant" class="tcv__tuner" />
    </template>
  </div>
</template>

<script setup lang="ts">
// NB: Nuxt dedupliceert het "Trip"-segment → <MultiHotelTripCardVariantSwitch>.
import { TRIP_CARD_VARIANTS, useMultiHotelTripCardVariant } from '~/composables-multi-hotel-trip/useMultiHotelTripCardVariant'
import { useMultiHotelTripOverlayTuner } from '~/composables-multi-hotel-trip/useMultiHotelTripOverlayTuner'

const { variant, setVariant } = useMultiHotelTripCardVariant()
const { open: tunerOpen } = useMultiHotelTripOverlayTuner()
</script>

<style scoped>
.tcv {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 18px;
  font-family: var(--font-body);
}
.tcv__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.4);
}
.tcv__group {
  display: inline-flex;
  padding: 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}
.tcv__btn {
  padding: 5px 12px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--color-text-primary, #141414);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.tcv__btn:hover { background: rgba(0, 0, 0, 0.06); }
.tcv__btn--on { background: var(--color-dark, #141414); color: #fff; }
/* Kleurenkiezer op een eigen regel onder de schakelaars. */
.tcv__tuner { flex-basis: 100%; }
</style>
