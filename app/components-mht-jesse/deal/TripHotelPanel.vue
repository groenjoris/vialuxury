<template>
  <!-- Multi Hotel Trip — hotel-sidepanel (440 px, rechts, volle hoogte) met de
       hotelinformatie uit TripHotelDetails. Twee gebruiken:
       - in de fullscreen kaart (inline, absolute in `.tfm`; de kaart schuift
         zelf naar links via `.tfm__stage--with-panel`);
       - `overlay` op de dealpagina ("Meer over dit hotel"): via Teleport in
         body, vast rechts over de pagina met een donkere achtergrond;
         klik op de achtergrond of Escape sluit. -->
  <Teleport to="body" :disabled="!overlay">
    <Transition name="thp-fade">
      <div v-if="overlay && hotel" class="thp-backdrop" @click="$emit('close')"></div>
    </Transition>
    <Transition name="thp-slide">
      <aside v-if="hotel" class="thp" :class="{ 'thp--overlay': overlay }" role="dialog" :aria-label="hotel.name" data-scroll-lock-allow="true">
        <div class="thp__header">
          <div class="thp__heading">
            <h3 class="thp__title">
              {{ hotel.name }}
              <span v-if="hotel.starRating" class="thp__stars" aria-hidden="true">
                <span v-for="n in hotel.starRating" :key="n" class="thp__star"><svg viewBox="0 0 18 18" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M16.963,6.786c-.088-.271-.323-.469-.605-.51l-4.62-.671L9.672,1.418c-.252-.512-1.093-.512-1.345,0l-2.066,4.186-4.62,.671c-.282,.041-.517,.239-.605,.51-.088,.271-.015,.57,.19,.769l3.343,3.258-.79,4.601c-.048,.282,.067,.566,.298,.734,.231,.167,.538,.189,.79,.057l4.132-2.173,4.132,2.173c.11,.058,.229,.086,.349,.086,.155,0,.31-.048,.441-.143,.231-.168,.347-.452,.298-.734l-.79-4.601,3.343-3.258c.205-.199,.278-.498,.19-.769Z"/></svg></span>
              </span>
            </h3>
            <p class="thp__meta">{{ hotel.location }}</p>
            <!-- Met een gekozen aankomstdatum: in- en uitcheckdatum van dit hotel
                 (geen inchecktijd — die staat in het dagprogramma). -->
            <div v-if="hotel.checkInDate && hotel.checkOutDate" class="thp__dates">
              <span class="thp__date">
                <span class="thp__date-label">{{ t('trip.checkIn') }}</span>
                <span class="thp__date-val">{{ hotel.checkInDate }}</span>
              </span>
              <span class="thp__date-arrow" aria-hidden="true">→</span>
              <span class="thp__date">
                <span class="thp__date-label">{{ t('trip.checkOut') }}</span>
                <span class="thp__date-val">{{ hotel.checkOutDate }}</span>
              </span>
            </div>
          </div>
          <button type="button" class="thp__close" :aria-label="t('common.close')" @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div class="thp__body">
          <MhtJesseTripHotelDetails :hotel="hotel" />
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useBodyScrollLock } from '~/composables-mht-jesse/useBodyScrollLock'
import type { TripHotelModalData } from './TripHotelDetails.vue'

const props = defineProps<{
  /** Hotel dat getoond wordt; `null` = panel dicht. */
  hotel: TripHotelModalData | null
  /** Over de pagina heen (Teleport, vaste positie, achtergrond, Escape). */
  overlay?: boolean
}>()

const emit = defineEmits<{ close: [] }>()

const { t } = useMhtJesseI18n()

/* Alleen als overlay: pagina-scroll op slot en Escape sluit. In de fullscreen
   kaart regelt de kaart zelf scroll-lock en Escape (eerst panel, dan kaart). */
useBodyScrollLock().bindTo(computed(() => !!props.overlay && !!props.hotel))
function onKey(e: KeyboardEvent) {
  if (props.overlay && props.hotel && e.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
/* Panel rechts, volle hoogte (zoals het sidepanel op /kaart). */
.thp {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 440px;
  max-width: 95vw;
  z-index: 1300;
  display: flex;
  flex-direction: column;
  background: var(--color-surface, #fff);
  box-shadow: -8px 0 30px rgba(0, 0, 0, 0.15);
}
.thp--overlay { position: fixed; z-index: 1260; }
.thp-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1250;
  background: rgba(0, 0, 0, 0.4);
}
.thp__header {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-lg) var(--space-lg) var(--space-md);
  border-bottom: 1px solid var(--color-border-light);
}
.thp__title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.25;
}
.thp__stars { display: inline-flex; align-items: center; gap: 1px; }
.thp__star { font-size: 15px; line-height: 1; color: #141414; display: inline-flex; }
.thp__meta { margin: 4px 0 0; font-size: 13px; color: var(--color-text-secondary); }
/* In-/uitcheckdatum (zelfde opzet als de datums in de zijbalk van de PDP). */
.thp__dates {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  font-family: var(--font-body);
}
.thp__date { display: flex; flex-direction: column; gap: 2px; }
.thp__date-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.thp__date-val { font-size: 14px; font-weight: 600; color: var(--color-text-primary); }
.thp__date-arrow { color: var(--color-text-muted, #9a958c); font-size: 14px; }
.thp__close {
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
.thp__close:hover { background: var(--color-border-light); }
.thp__body { flex: 1; min-height: 0; overflow: auto; }

.thp-slide-enter-active, .thp-slide-leave-active { transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1); }
.thp-slide-enter-from, .thp-slide-leave-to { transform: translateX(100%); }
.thp-fade-enter-active, .thp-fade-leave-active { transition: opacity 200ms ease; }
.thp-fade-enter-from, .thp-fade-leave-to { opacity: 0; }

@media (max-width: 767px) {
  .thp { width: 100%; max-width: none; }
}
</style>
