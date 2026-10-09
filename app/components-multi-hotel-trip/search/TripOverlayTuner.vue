<template>
  <!-- Multi Hotel Trip — TIJDELIJKE kaartlaag-tuner (zie useMultiHotelTripOverlayTuner):
       kleur + dekking van land en water voor de actieve variant Overlay/Inverse.
       De uitlees-regel is de rgba die in TripRouteMap.vue overgenomen kan worden. -->
  <div class="tot" role="group" aria-label="Kaartlaag instellen (tijdelijk)">
    <span class="tot__label">Kaartlaag {{ variant === 'inverse' ? 'Inverse' : 'Overlay' }}</span>
    <div class="tot__panel">
      <label class="tot__field">
        <span>Land</span>
        <input v-model="tune[variant].land" type="color" class="tot__color" />
        <input v-model.number="tune[variant].landAlpha" type="range" min="0" max="1" step="0.02" class="tot__range" />
        <span class="tot__num">{{ Math.round(tune[variant].landAlpha * 100) }}%</span>
      </label>
      <label class="tot__field">
        <span>Water</span>
        <input v-model="tune[variant].water" type="color" class="tot__color" />
        <input v-model.number="tune[variant].waterAlpha" type="range" min="0" max="1" step="0.02" class="tot__range" />
        <span class="tot__num">{{ Math.round(tune[variant].waterAlpha * 100) }}%</span>
      </label>
      <code class="tot__readout">{{ readout(variant) }}</code>
      <button type="button" class="tot__reset" @click="reset(variant)">Reset</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// NB: Nuxt dedupliceert het "Trip"-segment → <MultiHotelTripOverlayTuner>.
import { useMultiHotelTripOverlayTuner, type OverlayVariant } from '~/composables-multi-hotel-trip/useMultiHotelTripOverlayTuner'

defineProps<{ variant: OverlayVariant }>()
const { tune, reset, readout } = useMultiHotelTripOverlayTuner()
</script>

<style scoped>
.tot {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-body);
}
.tot__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.4);
  white-space: nowrap;
}
.tot__panel {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  font-size: 12px;
  color: var(--color-text-primary, #141414);
}
.tot__field { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; }
.tot__color { width: 26px; height: 22px; padding: 0; border: 1px solid rgba(0, 0, 0, 0.15); border-radius: 6px; background: none; cursor: pointer; }
.tot__range { width: 90px; accent-color: var(--color-dark, #141414); }
.tot__num { min-width: 32px; font-variant-numeric: tabular-nums; font-weight: 400; }
.tot__readout { font-size: 11px; color: #555; white-space: nowrap; }
.tot__reset {
  padding: 3px 10px;
  border: 0;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.06);
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}
.tot__reset:hover { background: rgba(0, 0, 0, 0.12); }
</style>
