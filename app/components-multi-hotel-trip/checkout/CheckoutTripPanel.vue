<template>
  <!-- Multi Hotel Trip checkout — "Bekijk je volledige reis" als sidepanel
       (440 px, rechts, volle hoogte; zelfde opzet als het hotel-sidepanel op de
       dealpagina): alle hotels met plaats, aantal nachten en kamer, plus wat er
       inbegrepen is. Klik op de achtergrond, het kruisje of Escape sluit.
       Krijgt de .mht-checkout-klasse mee zodat de checkout-tokens ook na de
       Teleport gelden. -->
  <Teleport to="body">
    <div class="mht-checkout ctp">
      <div class="ctp__backdrop" @click="$emit('close')"></div>
      <aside class="ctp__panel" role="dialog" aria-modal="true" :aria-label="trip.name" data-scroll-lock-allow="true">
          <header class="ctp__header">
            <div class="ctp__heading">
              <p class="t-caption c-mgrey ctp__eyebrow">{{ trip.typeLabel }} · {{ trip.hotels.length }} hotels · {{ trip.nights }} nachten</p>
              <h3 class="ctp__title">{{ trip.name }}</h3>
            </div>
            <button ref="closeEl" type="button" class="ctp__close" aria-label="Sluiten" @click="$emit('close')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </header>

          <div class="ctp__body">
            <img v-if="trip.thumb" :src="trip.thumb" :alt="trip.name" class="ctp__img" />

            <p class="t-body t-bold ctp__sechead">Je reis</p>
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

            <p class="t-body t-bold ctp__sechead">Inbegrepen</p>
            <ul class="ctp__includes">
              <li v-for="item in trip.includes" :key="item" class="ctp__inc t-body">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                {{ item }}
              </li>
            </ul>
          </div>
        </aside>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { TripCheckout } from '~/data/mht-checkout/trip'
import { useBodyScrollLock } from '~/composables-multi-hotel-trip/useBodyScrollLock'

defineProps<{ trip: TripCheckout }>()
const emit = defineEmits<{ close: [] }>()

// Scroll-lock voor de levensduur van het panel (v-if in de ouder): expliciet
// acquire/release, want een gestopte watcher geeft de lock niet terug.
const scrollLock = useBodyScrollLock()
const closeEl = ref<HTMLButtonElement | null>(null)
let returnFocus: HTMLElement | null = null
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') emit('close') }
onMounted(() => {
  returnFocus = document.activeElement as HTMLElement | null
  scrollLock.acquire()
  window.addEventListener('keydown', onKey)
  nextTick(() => closeEl.value?.focus())
})
onBeforeUnmount(() => {
  scrollLock.release()
  window.removeEventListener('keydown', onKey)
  returnFocus?.focus?.()
})
</script>

<style scoped>
.ctp { position: fixed; inset: 0; z-index: 1300; }
.ctp__backdrop { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.4); }
.ctp__panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 440px;
  max-width: 95vw;
  display: flex;
  flex-direction: column;
  background: #fff;
  box-shadow: -8px 0 30px rgba(0, 0, 0, 0.15);
}
.ctp__header {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 24px 16px;
  border-bottom: 1px solid var(--c-light-grey, #e6e6e6);
}
.ctp__heading { min-width: 0; }
.ctp__eyebrow { margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.06em; }
.ctp__title { margin: 0; font-size: 20px; line-height: 1.3; font-weight: 700; color: var(--c-via-black, #1a1e1e); }
.ctp__close {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: var(--c-lighter-grey, #f4f4f4);
  color: var(--c-via-black, #1a1e1e);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.ctp__close:hover { background: var(--c-light-grey, #e6e6e6); }
.ctp__close:focus-visible { outline: 2px solid var(--c-via-green, #36c890); outline-offset: 2px; }
.ctp__body { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 20px 24px 32px; }
.ctp__img { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 8px; margin-bottom: 20px; }
.ctp__sechead { margin: 0 0 10px; }
.ctp__hotels { list-style: none; margin: 0 0 24px; padding: 0; display: flex; flex-direction: column; gap: 12px; }
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
.ctp__includes { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.ctp__inc { display: flex; align-items: flex-start; gap: 8px; }
.ctp__inc svg { flex-shrink: 0; margin-top: 4px; color: var(--c-via-green, #36c890); }

/* Inschuiven van rechts (CSS-animatie: loopt ook zonder Vue-transitieframes). */
.ctp__backdrop { animation: ctp-fade 200ms ease; }
.ctp__panel { animation: ctp-slide 260ms cubic-bezier(0.2, 0.8, 0.2, 1); }
@keyframes ctp-fade { from { opacity: 0; } }
@keyframes ctp-slide { from { transform: translateX(100%); } }
@media (prefers-reduced-motion: reduce) {
  .ctp__backdrop, .ctp__panel { animation: none; }
}
</style>
