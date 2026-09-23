<template>
  <!-- Multi Hotel Trip checkout — "Bekijk je volledige reis": alle hotels met
       plaats, aantal nachten en kamer, plus wat er inbegrepen is. Krijgt de
       .mht-checkout-klasse mee zodat de checkout-tokens ook na de Teleport gelden. -->
  <Teleport to="body">
    <div class="mht-checkout ctp" @click.self="$emit('close')">
      <article class="ctp__card" role="dialog" aria-modal="true" :aria-label="trip.name" data-scroll-lock-allow="true">
        <button type="button" class="ctp__close" aria-label="Sluiten" @click="$emit('close')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
        <img v-if="trip.thumb" :src="trip.thumb" :alt="trip.name" class="ctp__img" />
        <div class="ctp__body">
          <p class="t-caption c-mgrey ctp__eyebrow">{{ trip.typeLabel }} · {{ trip.hotels.length }} hotels · {{ trip.nights }} nachten</p>
          <h3 class="ctp__title">{{ trip.name }}</h3>

          <ol class="ctp__hotels">
            <li v-for="(h, i) in trip.hotels" :key="h.name" class="ctp__hotel">
              <span class="ctp__num">{{ i + 1 }}</span>
              <div class="ctp__hotelbody">
                <p class="t-body t-bold ctp__hotelname">
                  {{ h.name }}
                  <span v-if="h.starRating" class="ctp__stars" aria-hidden="true">{{ '★'.repeat(h.starRating) }}</span>
                </p>
                <p class="t-caption c-mgrey">{{ h.city }} · {{ h.nights }} {{ h.nights === 1 ? 'nacht' : 'nachten' }} · {{ h.roomName }}</p>
              </div>
            </li>
          </ol>

          <p class="t-body t-bold ctp__inchead">Inbegrepen</p>
          <ul class="ctp__includes">
            <li v-for="item in trip.includes" :key="item" class="ctp__inc t-body">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
              {{ item }}
            </li>
          </ul>
        </div>
      </article>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { TripCheckout } from '~/data/mht-checkout/trip'
import { useBodyScrollLock } from '~/composables-multi-hotel-trip/useBodyScrollLock'

defineProps<{ trip: TripCheckout }>()
const emit = defineEmits<{ close: [] }>()

// Scroll-lock voor de levensduur van de pop-up (v-if in de ouder): expliciet
// acquire/release, want een gestopte watcher geeft de lock niet terug.
const scrollLock = useBodyScrollLock()
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') emit('close') }
onMounted(() => {
  scrollLock.acquire()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  scrollLock.release()
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.ctp {
  position: fixed;
  inset: 0;
  z-index: 1300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.45);
}
.ctp__card {
  position: relative;
  width: min(560px, 100%);
  max-height: 90vh;
  overflow: auto;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.25);
}
.ctp__close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: var(--c-via-black, #1a1e1e);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.ctp__img { display: block; width: 100%; aspect-ratio: 16 / 8; object-fit: cover; }
.ctp__body { padding: 24px; }
.ctp__eyebrow { margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.06em; }
.ctp__title { margin: 0 0 18px; font-size: 20px; line-height: 1.3; font-weight: 700; color: var(--c-via-black, #1a1e1e); }
.ctp__hotels { list-style: none; margin: 0 0 20px; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.ctp__hotel { display: flex; align-items: flex-start; gap: 12px; }
.ctp__num {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--c-via-black, #1a1e1e);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.ctp__hotelbody { min-width: 0; }
.ctp__hotelname { margin: 0 0 2px; }
.ctp__stars { font-size: 12px; margin-left: 4px; color: var(--c-via-black, #1a1e1e); }
.ctp__inchead { margin: 0 0 8px; }
.ctp__includes { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.ctp__inc { display: flex; align-items: flex-start; gap: 8px; }
.ctp__inc svg { flex-shrink: 0; margin-top: 4px; color: var(--c-via-green, #36c890); }
</style>
