<template>
  <!-- Multi Hotel Trip — gecentreerde pop-up met hotelinformatie vanuit de
       dealpagina (klik op een hotelnaam, "Meer over dit hotel" of een marker
       op de minimap). De inhoud zelf staat in TripHotelDetails, gedeeld met
       het sidepanel op de fullscreen kaart. -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open && hotel" class="thm" @click.self="$emit('close')">
        <div class="thm__card" data-scroll-lock-allow="true">
          <div class="thm__header">
            <div class="thm__heading">
              <h2 class="thm__title">
                {{ hotel.name }}
                <span v-if="hotel.starRating" class="thm__stars" aria-hidden="true">
                  <span v-for="n in hotel.starRating" :key="n" class="thm__star"><svg viewBox="0 0 18 18" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M16.963,6.786c-.088-.271-.323-.469-.605-.51l-4.62-.671L9.672,1.418c-.252-.512-1.093-.512-1.345,0l-2.066,4.186-4.62,.671c-.282,.041-.517,.239-.605,.51-.088,.271-.015,.57,.19,.769l3.343,3.258-.79,4.601c-.048,.282,.067,.566,.298,.734,.231,.167,.538,.189,.79,.057l4.132-2.173,4.132,2.173c.11,.058,.229,.086,.349,.086,.155,0,.31-.048,.441-.143,.231-.168,.347-.452,.298-.734l-.79-4.601,3.343-3.258c.205-.199,.278-.498,.19-.769Z"/></svg></span>
                </span>
              </h2>
              <p class="thm__meta">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M4.5 9.75768C4.5 15.5 12 22 12 22C12 22 19.5 15.5 19.5 9.75768C19.5 4.81181 15.6559 2 12 2C8.34409 2 4.5 4.81181 4.5 9.75768Z" /><path d="M12 12C13.3807 12 14.5 10.8807 14.5 9.5C14.5 8.11929 13.3807 7 12 7C10.6193 7 9.5 8.11929 9.5 9.5C9.5 10.8807 10.6193 12 12 12Z" />
                </svg>
                {{ hotel.location }}
                <span v-if="hotel.checkIn" class="thm__meta-sep" aria-hidden="true">·</span>
                <span v-if="hotel.checkIn">{{ t('trip.checkInFrom').replace('{time}', hotel.checkIn) }}</span>
              </p>
            </div>
            <button type="button" class="thm__close" :aria-label="t('common.close')" @click="$emit('close')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <MultiHotelTripHotelDetails :hotel="hotel" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useBodyScrollLock } from '~/composables-multi-hotel-trip/useBodyScrollLock'
import type { TripHotelModalData } from './TripHotelDetails.vue'

export type { TripHotelModalData }

const props = defineProps<{
  open: boolean
  hotel: TripHotelModalData | null
}>()

defineEmits<{ close: [] }>()

const { t } = useMultiHotelTripI18n()
useBodyScrollLock().bindTo(computed(() => props.open))
</script>

<style scoped>
.thm {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  background: rgba(20, 20, 20, 0.55);
}
.thm__card {
  width: min(760px, 100%);
  max-height: calc(100vh - 2 * var(--space-lg));
  overflow: auto;
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}
.thm__header {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-lg) var(--space-lg) var(--space-md);
  background: var(--color-surface, #fff);
  border-bottom: 1px solid var(--color-border-light);
}
.thm__title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.25;
}
.thm__stars { display: inline-flex; align-items: center; gap: 1px; }
.thm__star { font-size: 16px; line-height: 1; color: #141414; display: inline-flex; }
.thm__meta {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}
.thm__meta-sep { margin: 0 4px; color: var(--color-text-muted, #9a958c); }
.thm__close {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.thm__close:hover { background: var(--color-border-light); }
.fade-enter-active, .fade-leave-active { transition: opacity 180ms ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 767px) {
  .thm { padding: 0; align-items: flex-end; }
  .thm__card { max-height: 92vh; border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
}
</style>
