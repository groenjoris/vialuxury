<template>
  <!-- Multi Hotel Trip — één blok uit het voorbeeld-reisschema (foto + soortlabel,
       titel, locatie, tekst, "Meer over …"). Gedeeld door de twee varianten:
       TripItineraryAccordion (per dag) en TripItineraryCities (per plaats).
       layout: 'row' = foto links (240 px), 'compact' = brede foto (16:9) boven
       de tekst (smalle 50/50-kolom), 'stacked' = foto boven (mobiel). Het blok beheert
       zelf de foto-pop-up en de "Meer over"-pop-up. -->
  <article class="tib" :class="[`tib--${block.kind}`, `tib--${layout}`]">
    <button
      type="button"
      class="tib__media"
      :aria-label="`${block.title} — ${t('common.allPhotos')}`"
      @click="block.image && (lightbox = true)"
    >
      <img v-if="block.image" :src="block.image" :alt="block.title" loading="lazy" />
      <span class="tib__tag">{{ block.tag }}</span>
    </button>
    <div class="tib__body">
      <h4 class="tib__title">
        <MultiHotelTripHotelText :text="block.title" :hotels="hotels" @open-hotel="$emit('open-hotel', $event)" />
      </h4>
      <p v-if="block.meta" class="tib__meta">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4.5 9.75768C4.5 15.5 12 22 12 22C12 22 19.5 15.5 19.5 9.75768C19.5 4.81181 15.6559 2 12 2C8.34409 2 4.5 4.81181 4.5 9.75768Z" /><path d="M12 12C13.3807 12 14.5 10.8807 14.5 9.5C14.5 8.11929 13.3807 7 12 7C10.6193 7 9.5 8.11929 9.5 9.5C9.5 10.8807 10.6193 12 12 12Z" />
        </svg>
        {{ block.meta }}
      </p>
      <p class="tib__text">{{ block.text }}</p>
      <button v-if="block.more" type="button" class="tib__link" @click="info = true">{{ block.more.label }}</button>
    </div>

    <!-- "Meer over …"-pop-up -->
    <Teleport to="body">
      <Transition name="tib-fade">
        <div v-if="info && block.more" class="tib-info" @click.self="info = false">
          <article class="tib-info__card" data-scroll-lock-allow="true">
            <button type="button" class="tib-info__close" :aria-label="t('common.close')" @click="info = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
            <img v-if="block.more.image" :src="block.more.image" :alt="block.more.title" class="tib-info__img" />
            <div class="tib-info__body">
              <h3 class="tib-info__title">{{ block.more.title }}</h3>
              <p v-for="(p, i) in block.more.paragraphs" :key="i" class="tib-info__text">{{ p }}</p>
            </div>
          </article>
        </div>
      </Transition>
    </Teleport>
    <MultiHotelTripImageLightbox v-if="lightbox && block.image" :image="block.image" :title="block.title" :tag="block.tag" @close="lightbox = false" />
  </article>
</template>

<script setup lang="ts">
import { useBodyScrollLock } from '~/composables-multi-hotel-trip/useBodyScrollLock'
import type { TripHotelLink } from './TripHotelText.vue'
import type { TripBlockView } from './TripItinerary.vue'

withDefaults(defineProps<{
  block: TripBlockView
  hotels?: TripHotelLink[]
  layout?: 'row' | 'compact' | 'stacked'
}>(), { hotels: () => [], layout: 'row' })

defineEmits<{ 'open-hotel': [stopIndex: number] }>()

const { t } = useMultiHotelTripI18n()
const lightbox = ref(false)
const info = ref(false)
useBodyScrollLock().bindTo(computed(() => lightbox.value || info.value))
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') { lightbox.value = false; info.value = false } }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.tib {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: var(--space-lg);
  align-items: start;
}
.tib--compact { grid-template-columns: 1fr; gap: 12px; }
.tib--compact .tib__media { aspect-ratio: 16 / 9; }
.tib--stacked { grid-template-columns: 1fr; gap: var(--space-sm); }

.tib__media {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-background-secondary);
  cursor: zoom-in;
}
.tib__media img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s ease; }
.tib__media:hover img { transform: scale(1.03); }
.tib__media:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
.tib__tag {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.94);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
.tib--checkin .tib__tag,
.tib--checkout .tib__tag,
.tib--homeward .tib__tag { background: #141414; color: #fff; }

.tib__body { min-width: 0; padding-top: 2px; }
.tib__title {
  margin: 0 0 4px;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-text-primary);
}
.tib--compact .tib__title { font-size: 15px; }
.tib__meta {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0 0 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.tib__text { margin: 0; font-size: 14px; line-height: 1.65; color: var(--color-text-secondary); }
.tib__link {
  display: inline-block;
  margin-top: 8px;
  padding: 0;
  background: none;
  border: none;
  color: var(--color-primary);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}
.tib__link:hover { color: var(--color-primary-hover); }

.tib-info {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  background: rgba(0, 0, 0, 0.55);
}
.tib-info__card {
  position: relative;
  width: min(560px, 100%);
  max-height: 88vh;
  overflow: auto;
  border-radius: var(--radius-lg);
  background: var(--color-surface, #fff);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}
.tib-info__img { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; }
.tib-info__body { padding: var(--space-lg); }
.tib-info__title { margin: 0 0 var(--space-sm); font-size: 22px; font-weight: 700; line-height: 1.2; }
.tib-info__text { margin: 0 0 var(--space-sm); font-size: 15px; line-height: 1.7; color: var(--color-text-secondary); }
.tib-info__text:last-child { margin-bottom: 0; }
.tib-info__close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: #141414;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}
.tib-fade-enter-active, .tib-fade-leave-active { transition: opacity 180ms ease; }
.tib-fade-enter-from, .tib-fade-leave-to { opacity: 0; }

@media (max-width: 767px) {
  .tib, .tib--compact { grid-template-columns: 1fr; gap: var(--space-sm); }
}
</style>
