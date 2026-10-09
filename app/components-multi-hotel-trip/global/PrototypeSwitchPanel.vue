<template>
  <!-- Multi Hotel Trip — zwevend prototype-schakelpaneel linksboven (homepage en
       vakantie-PDP). Ingeklapt een klein rond icoon; uitgeklapt alle
       schakelaars (via de slot), met rechtsboven "× Sluiten" om weer in te
       klappen. Standaard ingeklapt; daarna wordt de stand per paneel
       (storageKey) bewaard. Alleen voor testen/stakeholders.
       De slot-inhoud gebruikt de klassen .psw__section, .psw__label,
       .psw__group en .psw__btn(--on) (ongescoped hieronder). -->
  <div class="psw" :class="{ 'psw--open': open }">
    <Transition name="psw-swap" mode="out-in">
      <button
        v-if="!open"
        key="fab"
        type="button"
        class="psw__fab"
        :aria-label="`${title} — schakelaars tonen`"
        :title="title"
        aria-expanded="false"
        @click="setOpen(true)"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4 3 8l4 4" /><path d="M3 8h14" /><path d="m17 20 4-4-4-4" /><path d="M21 16H7" /></svg>
      </button>
      <div v-else key="panel" class="psw__panel" role="group" :aria-label="title">
        <div class="psw__head">
          <span class="psw__title">{{ title }}</span>
          <button type="button" class="psw__close" aria-expanded="true" @click="setOpen(false)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
            Sluiten
          </button>
        </div>
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  /** Kop van het paneel, bv. "Prototype". */
  title: string
  /** localStorage-sleutel voor de in-/uitgeklapte stand. */
  storageKey: string
}>()

const open = ref(false)
function setOpen(v: boolean) {
  open.value = v
  try { localStorage.setItem(props.storageKey, v ? '1' : '0') } catch { /* ignore */ }
}
onMounted(() => {
  try {
    const stored = localStorage.getItem(props.storageKey)
    open.value = stored === '1' // standaard ingeklapt
  } catch { /* ignore */ }
})
</script>

<style scoped>
.psw {
  position: fixed;
  top: 88px;
  left: 16px;
  z-index: 1100;
  font-family: var(--font-body);
}
.psw__fab {
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
.psw__fab:hover { transform: scale(1.06); background: #141414; }
.psw__fab:focus-visible,
.psw__close:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
.psw__panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 10px 12px 12px;
  border-radius: 14px;
  background: rgba(20, 20, 20, 0.88);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(6px);
}
.psw__head { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.psw__title {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
}
.psw__close {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  margin-right: -4px;
  padding: 0 10px 0 8px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.psw__close:hover { background: rgba(255, 255, 255, 0.22); }

.psw-swap-enter-active, .psw-swap-leave-active { transition: opacity 120ms ease, transform 120ms ease; }
.psw-swap-enter-from, .psw-swap-leave-to { opacity: 0; transform: scale(0.92); transform-origin: top left; }

@media (max-width: 767px) {
  .psw { top: 104px; left: 8px; }
  .psw__fab { width: 40px; height: 40px; }
}
</style>

<style>
/* Slot-inhoud (ongescoped, met psw-prefix): een sectie met label en een segmentknop-groep. */
.psw__section { display: flex; flex-direction: column; gap: 4px; }
.psw__label {
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
}
.psw__group {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  padding: 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
}
.psw__btn {
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
.psw__btn:hover { background: rgba(255, 255, 255, 0.12); }
.psw__btn--on, .psw__btn--on:hover { background: #fff; color: #141414; }
.psw__btn:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
/* Stapper (‹ 1/8 ›): ronde pijlknoppen met de teller ertussen. */
.psw__btn--icon { width: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center; }
.psw__count { min-width: 34px; text-align: center; font-family: var(--font-body); font-size: 13px; font-weight: 700; color: #fff; font-variant-numeric: tabular-nums; }
@media (max-width: 767px) {
  .psw__btn { padding: 6px 10px; font-size: 12px; }
}
</style>
