<template>
  <!-- Multi Hotel Trip — gecentreerde foto-pop-up (grotere versie van een
       thumbnail) met label en titel eronder. Gebruikt door het dagprogramma
       (TripItinerary) en het inclusieblok op de vakantie-PDP. Escape en een
       klik naast de foto sluiten. -->
  <Teleport to="body">
    <Transition name="tlb-fade" appear>
      <div class="tlb" @click.self="$emit('close')">
        <figure class="tlb__card">
          <button type="button" class="tlb__close" :aria-label="t('common.close')" @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
          <img :src="image" :alt="title" class="tlb__img" />
          <figcaption class="tlb__caption">
            <span v-if="tag" class="tlb__tag">{{ tag }}</span>
            {{ title }}
          </figcaption>
        </figure>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useBodyScrollLock } from '~/composables-multi-hotel-trip/useBodyScrollLock'

defineProps<{ image: string; title: string; tag?: string }>()
const emit = defineEmits<{ close: [] }>()
const { t } = useMultiHotelTripI18n()

useBodyScrollLock().bindTo(ref(true))
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') emit('close') }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.tlb {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  background: rgba(20, 20, 20, 0.7);
}
.tlb__card {
  position: relative;
  margin: 0;
  max-width: min(1100px, 100%);
  max-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.tlb__img {
  display: block;
  max-width: 100%;
  max-height: calc(100vh - 2 * var(--space-lg) - 48px);
  object-fit: contain;
  border-radius: var(--radius-lg);
  background: #000;
}
.tlb__caption {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
}
.tlb__tag {
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.94);
  color: #141414;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.tlb__close {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.94);
  color: #141414;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.tlb__close:hover { background: #fff; }
.tlb-fade-enter-active, .tlb-fade-leave-active { transition: opacity 180ms ease; }
.tlb-fade-enter-from, .tlb-fade-leave-to { opacity: 0; }
</style>
