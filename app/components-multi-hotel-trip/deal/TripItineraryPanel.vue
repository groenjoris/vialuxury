<template>
  <!-- Multi Hotel Trip — sidepanel "Uitgebreid voorbeeld reisschema": alleen
       tekst, per dag een kopje dat gelijk is aan de regel in de dagsamenvatting
       ("Dag 1 · Ontdek Béthune") met daaronder de lopende tekst van die dag.
       Zelfde schil als het hotel-sidepanel (rechts, volle hoogte, backdrop). -->
  <Teleport to="body">
    <Transition name="tipn-fade">
      <div v-if="open" class="tipn-backdrop" @click="$emit('close')"></div>
    </Transition>
    <Transition name="tipn-slide">
      <aside v-if="open" class="tipn" role="dialog" aria-modal="true" :aria-label="t('trip.itineraryHeading')" data-scroll-lock-allow="true">
        <div class="tipn__header">
          <div>
            <h3 class="tipn__title">{{ t('trip.itineraryHeading') }}</h3>
            <p class="tipn__meta">{{ t('trip.itin.panelIntro') }}</p>
          </div>
          <button type="button" class="tipn__close" :aria-label="t('common.close')" @click="$emit('close')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div ref="bodyEl" class="tipn__body">
          <section v-for="day in days" :key="day.day" :id="`itin-panel-dag-${day.day}`" class="tipn__day" :class="{ 'tipn__day--focus': focusDay === day.day }">
            <h4 class="tipn__dayhead">
              <span class="tipn__daylabel">{{ day.label }}</span> · {{ summaryOfDay(day) }}
            </h4>
            <p v-if="day.date" class="tipn__date">{{ day.date }}</p>
            <p class="tipn__text">{{ textOfDay(day) }}</p>
          </section>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useBodyScrollLock } from '~/composables-multi-hotel-trip/useBodyScrollLock'
import { summaryOfDay, textOfDay } from '~/utils-multi-hotel-trip/tripDaySummary'
import type { TripDayView } from './TripItinerary.vue'

const props = defineProps<{
  open: boolean
  days: TripDayView[]
  /** Dag waar het panel naartoe scrolt bij openen (klik in de dagsamenvatting). */
  focusDay?: number | null
}>()
const emit = defineEmits<{ close: [] }>()

const { t } = useMultiHotelTripI18n()
useBodyScrollLock().bindTo(computed(() => props.open))

/* Bij openen (of een andere dag terwijl het panel open is): naar die dag scrollen. */
const bodyEl = ref<HTMLElement | null>(null)
async function scrollToFocus() {
  if (!props.open || props.focusDay == null) return
  await nextTick()
  const body = bodyEl.value
  const el = body?.querySelector<HTMLElement>(`#itin-panel-dag-${props.focusDay}`)
  if (!body || !el) return
  // Direct (niet smooth): het panel schuift zelf al in en staat dan meteen op de juiste dag.
  body.scrollTo({ top: Math.max(0, el.offsetTop - body.offsetTop - 8), behavior: 'auto' })
}
watch(() => [props.open, props.focusDay], () => { setTimeout(scrollToFocus, 80) })
function onKey(e: KeyboardEvent) { if (props.open && e.key === 'Escape') emit('close') }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.tipn {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 480px;
  max-width: 95vw;
  z-index: 1260;
  display: flex;
  flex-direction: column;
  background: var(--color-surface, #fff);
  box-shadow: -8px 0 30px rgba(0, 0, 0, 0.15);
}
.tipn-backdrop { position: fixed; inset: 0; z-index: 1250; background: rgba(0, 0, 0, 0.4); }
.tipn__header {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-lg) var(--space-lg) var(--space-md);
  border-bottom: 1px solid var(--color-border-light);
}
.tipn__title { margin: 0; font-family: var(--font-heading); font-size: 22px; font-weight: 700; line-height: 1.25; }
.tipn__meta { margin: 4px 0 0; font-size: 13px; color: var(--color-text-secondary); }
.tipn__close {
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
.tipn__close:hover { background: var(--color-border-light); }
.tipn__body { flex: 1; min-height: 0; overflow: auto; padding: var(--space-md) var(--space-lg) var(--space-xl); }
.tipn__day { padding: var(--space-md) 0; border-bottom: 1px solid var(--color-border-light); }
.tipn__day:last-child { border-bottom: 0; }
/* De aangeklikte dag licht even op. */
.tipn__day--focus { animation: tipn-focus 1.8s ease-out; }
@keyframes tipn-focus {
  0%, 35% { background: var(--color-background-secondary, #fbfaf8); box-shadow: 0 0 0 8px var(--color-background-secondary, #fbfaf8); }
  100% { background: transparent; box-shadow: none; }
}
.tipn__dayhead { margin: 0 0 4px; font-size: 16px; font-weight: 600; line-height: 1.35; color: var(--color-text-primary); }
.tipn__daylabel { font-weight: 700; }
.tipn__date { margin: 0 0 6px; font-size: 13px; color: var(--color-text-secondary); }
.tipn__text { margin: 0; font-size: 14px; line-height: 1.7; color: var(--color-text-secondary); }

.tipn-slide-enter-active, .tipn-slide-leave-active { transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1); }
.tipn-slide-enter-from, .tipn-slide-leave-to { transform: translateX(100%); }
.tipn-fade-enter-active, .tipn-fade-leave-active { transition: opacity 200ms ease; }
.tipn-fade-enter-from, .tipn-fade-leave-to { opacity: 0; }
@media (max-width: 767px) {
  .tipn { width: 100%; max-width: none; }
}
</style>
