<template>
  <!-- Multi Hotel Trip — zwevende prototype-schakelaar linksboven op de
       vakantie-PDP: wisselt het voorbeeld-reisschema tussen "Per dag"
       (accordeon-tijdlijn) en "Per plaats" (kaart + plaatsen). Klik scrolt
       meteen naar het reisschema zodat je het verschil direct ziet.
       Inklapbaar tot een rond knopje (bij het eerste bezoek uitgeklapt, daarna
       wordt de in-/uitgeklapte stand bewaard) zodat hij de pagina niet afdekt.
       Alleen voor testen/stakeholders. -->
  <div class="tivs" :class="{ 'tivs--open': open }">
    <Transition name="tivs-swap" mode="out-in">
      <button
        v-if="!open"
        key="fab"
        type="button"
        class="tivs__fab"
        :aria-label="`Reisschema-variant: ${currentLabel} — wisselen`"
        :title="`Reisschema: ${currentLabel}`"
        aria-expanded="false"
        @click="setOpen(true)"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4 3 8l4 4" /><path d="M3 8h14" /><path d="m17 20 4-4-4-4" /><path d="M21 16H7" /></svg>
      </button>
      <div v-else key="panel" class="tivs__panel" role="group" aria-label="Variant voorbeeld reisschema">
        <div class="tivs__head">
          <span class="tivs__label">Reisschema</span>
          <button type="button" class="tivs__close" aria-label="Schakelaar inklappen" aria-expanded="true" @click="setOpen(false)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
        </div>
        <div class="tivs__group">
          <button
            v-for="v in ITINERARY_VARIANTS"
            :key="v.id"
            type="button"
            class="tivs__btn"
            :class="{ 'tivs__btn--on': variant === v.id }"
            :aria-pressed="variant === v.id"
            @click="pick(v.id)"
          >{{ v.label }}</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ITINERARY_VARIANTS, useMultiHotelTripItineraryVariant, type ItineraryVariant } from '~/composables-multi-hotel-trip/useMultiHotelTripItineraryVariant'

const props = defineProps<{ /** Element-id om naartoe te scrollen na wisselen. */ target?: string }>()
const { variant, setVariant, restore } = useMultiHotelTripItineraryVariant()
const currentLabel = computed(() => ITINERARY_VARIANTS.find(v => v.id === variant.value)?.label ?? '')

/* Ingeklapt/uitgeklapt — standaard ingeklapt, bewaard per browser. */
const OPEN_KEY = 'vl_mht_itinerary_switch_open'
const open = ref(false)
function setOpen(v: boolean) {
  open.value = v
  try { localStorage.setItem(OPEN_KEY, v ? '1' : '0') } catch { /* ignore */ }
}
onMounted(() => {
  restore()
  try {
    const stored = localStorage.getItem(OPEN_KEY)
    open.value = stored === null ? true : stored === '1'
  } catch { /* ignore */ }
})

async function pick(v: ItineraryVariant) {
  setVariant(v)
  if (!props.target) return
  await nextTick()
  const el = [...document.querySelectorAll<HTMLElement>(`#${props.target}`)].find(e => e.offsetParent !== null)
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' })
}
</script>

<style scoped>
.tivs {
  position: fixed;
  top: 88px;
  left: 16px;
  z-index: 1100;
  font-family: var(--font-body);
}
.tivs__fab {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(20, 20, 20, 0.88);
  color: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(6px);
  cursor: pointer;
  transition: transform 150ms ease, background 150ms ease;
}
.tivs__fab:hover { transform: scale(1.06); background: #141414; }
.tivs__fab:focus-visible,
.tivs__close:focus-visible,
.tivs__btn:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
.tivs__panel {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px 10px 12px;
  border-radius: 14px;
  background: rgba(20, 20, 20, 0.88);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(6px);
}
.tivs__head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.tivs__label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
}
.tivs__close {
  width: 28px;
  height: 28px;
  margin-right: -4px;
  border: 0;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #fff;
  cursor: pointer;
}
.tivs__close:hover { background: rgba(255, 255, 255, 0.14); }
.tivs__group {
  display: inline-flex;
  padding: 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
}
.tivs__btn {
  min-height: 32px;
  padding: 6px 14px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #fff;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.tivs__btn:hover { background: rgba(255, 255, 255, 0.12); }
.tivs__btn--on, .tivs__btn--on:hover { background: #fff; color: #141414; }

.tivs-swap-enter-active, .tivs-swap-leave-active { transition: opacity 120ms ease, transform 120ms ease; }
.tivs-swap-enter-from, .tivs-swap-leave-to { opacity: 0; transform: scale(0.92); transform-origin: top left; }

@media (max-width: 767px) {
  /* Mobiel: onder de sticky voortgangsbalk van "Per plaats". */
  .tivs { top: 104px; left: 8px; }
  .tivs__fab { width: 40px; height: 40px; }
  .tivs__btn { padding: 6px 10px; font-size: 12px; }
}
</style>
