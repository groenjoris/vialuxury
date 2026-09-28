<template>
  <!-- Multi Hotel Trip — drie reizigersbeoordelingen van de vakantie naast
       elkaar, onder het voorbeeld-reisschema. Opzet als booking.com: kaart met
       avatar, naam en land, één citaat (het pluspunt) en "Meer info" → pop-up
       met datum, titel, score, pluspunt (blije smiley) en minpunt (droevige
       smiley). Geen link naar "alle beoordelingen" — die zijn er niet. -->
  <section class="trr" :aria-label="t('trip.reviews.heading')">
    <h3 class="trr__title">{{ t('trip.reviews.heading') }}</h3>
    <div class="trr__grid">
      <article v-for="(r, i) in reviews" :key="i" class="trr-card">
        <div class="trr-card__who">
          <span class="trr-avatar" :class="{ 'trr-avatar--img': r.avatar }" aria-hidden="true">
            <img v-if="r.avatar" :src="r.avatar" alt="" />
            <template v-else>{{ initialOf(r.author) }}</template>
          </span>
          <div class="trr-card__id">
            <p class="trr-card__name">{{ r.author }}</p>
            <p class="trr-card__country"><span class="trr-flag" :class="`trr-flag--${r.country.toLowerCase()}`" aria-hidden="true"></span>{{ t(`country.${r.country}`) }}</p>
          </div>
        </div>
        <p class="trr-card__quote">“{{ r.positive }}”</p>
        <button type="button" class="trr-card__more" @click="info = r">{{ t('trip.reviews.moreInfo') }}</button>
      </article>
    </div>

    <!-- Pop-up met de volledige beoordeling -->
    <Teleport to="body">
      <Transition name="trr-fade">
        <div v-if="info" class="trr-info" @click.self="info = null">
          <article class="trr-info__card" role="dialog" aria-modal="true" :aria-label="info.title || info.author" data-scroll-lock-allow="true">
            <button type="button" class="trr-info__close" :aria-label="t('common.close')" @click="info = null">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
            <div class="trr-info__grid">
              <div class="trr-info__who">
                <span class="trr-avatar trr-avatar--lg" :class="{ 'trr-avatar--img': info.avatar }" aria-hidden="true">
                  <img v-if="info.avatar" :src="info.avatar" alt="" />
                  <template v-else>{{ initialOf(info.author) }}</template>
                </span>
                <div>
                  <p class="trr-card__name trr-info__name">{{ info.author }}</p>
                  <p class="trr-card__country"><span class="trr-flag" :class="`trr-flag--${info.country.toLowerCase()}`" aria-hidden="true"></span>{{ t(`country.${info.country}`) }}</p>
                </div>
              </div>
              <div class="trr-info__main">
                <p class="trr-info__date">{{ t('trip.reviews.reviewedOn').replace('{date}', info.date) }}</p>
                <h3 v-if="info.title" class="trr-info__title">{{ info.title }}</h3>
                <p class="trr-info__line">
                  <svg class="trr-info__face trr-info__face--pos" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5" /><path d="M8.5 14.2c.9 1.3 2.1 1.9 3.5 1.9s2.6-.6 3.5-1.9" /><path d="M9 9.5h.01M15 9.5h.01" stroke-width="2.4" /></svg>
                  <span>{{ info.positive }}</span>
                </p>
                <p v-if="info.negative" class="trr-info__line">
                  <svg class="trr-info__face trr-info__face--neg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5" /><path d="M8.5 16.2c.9-1.3 2.1-1.9 3.5-1.9s2.6.6 3.5 1.9" /><path d="M9 9.5h.01M15 9.5h.01" stroke-width="2.4" /></svg>
                  <span>{{ info.negative }}</span>
                </p>
              </div>
              <span class="trr-info__score" :aria-label="`${info.score.toFixed(1)}/10`">{{ info.score.toFixed(1) }}</span>
            </div>
          </article>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { useBodyScrollLock } from '~/composables-multi-hotel-trip/useBodyScrollLock'

export interface TripReviewView {
  author: string
  /** Landcode voor het vlaggetje en de landnaam: NL, BE, DE. */
  country: 'NL' | 'BE' | 'DE'
  avatar?: string
  /** Al opgemaakte datum, bv. "18 juni 2026". */
  date: string
  score: number
  title: string
  positive: string
  negative?: string
}

defineProps<{ reviews: TripReviewView[] }>()

const { t } = useMultiHotelTripI18n()
const initialOf = (name: string) => (name.trim().charAt(0) || '?').toUpperCase()

const info = ref<TripReviewView | null>(null)
useBodyScrollLock().bindTo(computed(() => !!info.value))
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') info.value = null }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.trr { display: flex; flex-direction: column; gap: var(--space-md); }
.trr__title { margin: 0; font-family: var(--font-heading); font-size: 20px; font-weight: 700; line-height: 1.25; color: var(--color-text-primary); }
.trr__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-md); }
.trr-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: var(--space-md);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface, #fff);
}
.trr-card__who { display: flex; align-items: center; gap: 10px; }
.trr-card__id { min-width: 0; }
.trr-card__name { margin: 0; font-size: 15px; font-weight: 700; color: var(--color-text-primary); }
.trr-card__country { display: flex; align-items: center; gap: 6px; margin: 2px 0 0; font-size: 13px; color: var(--color-text-secondary); }
.trr-card__quote { margin: 0; font-size: 14px; line-height: 1.6; color: var(--color-text-primary); }
.trr-card__more {
  align-self: flex-start;
  margin-top: auto;
  padding: 0;
  border: 0;
  background: none;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}
.trr-card__more:hover { color: var(--color-primary-hover); }

/* Avatar: foto, anders de initiaal op Trustpilot-groen. */
.trr-avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-discount, #00b67a);
  color: #fff;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 700;
}
.trr-avatar--lg { width: 56px; height: 56px; font-size: 20px; }
.trr-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
/* Vlaggetje (drie banen) per land. */
.trr-flag { display: inline-block; width: 16px; height: 11px; border-radius: 2px; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08); }
.trr-flag--nl { background: linear-gradient(#ae1c28 0 33.4%, #fff 33.4% 66.7%, #21468b 66.7%); }
.trr-flag--be { background: linear-gradient(to right, #000 0 33.4%, #fdda24 33.4% 66.7%, #ef3340 66.7%); }
.trr-flag--de { background: linear-gradient(#000 0 33.4%, #dd0000 33.4% 66.7%, #ffce00 66.7%); }

/* Pop-up */
.trr-info {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  background: rgba(0, 0, 0, 0.55);
}
.trr-info__card {
  position: relative;
  width: min(760px, 100%);
  max-height: 88vh;
  overflow: auto;
  padding: var(--space-xl) var(--space-xl) var(--space-lg);
  border-radius: var(--radius-lg);
  background: var(--color-surface, #fff);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}
.trr-info__grid { display: grid; grid-template-columns: 180px minmax(0, 1fr) auto; gap: var(--space-lg); align-items: start; }
.trr-info__who { display: flex; align-items: center; gap: 12px; }
.trr-info__name { font-size: 17px; }
.trr-info__date { margin: 0 0 4px; font-size: 13px; color: var(--color-text-secondary); }
.trr-info__title { margin: 0 0 var(--space-md); font-family: var(--font-heading); font-size: 24px; font-weight: 700; line-height: 1.2; color: var(--color-text-primary); }
.trr-info__line { display: flex; align-items: flex-start; gap: 10px; margin: 0 0 12px; font-size: 15px; line-height: 1.6; color: var(--color-text-primary); }
.trr-info__line:last-child { margin-bottom: 0; }
.trr-info__face { flex-shrink: 0; margin-top: 1px; }
.trr-info__face--pos { color: var(--color-discount, #00b67a); }
.trr-info__face--neg { color: var(--color-text-secondary); }
.trr-info__score {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  height: 44px;
  padding: 0 10px;
  border-radius: 8px;
  background: var(--color-discount, #00b67a);
  color: #fff;
  font-family: var(--font-body);
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.trr-info__close {
  position: absolute;
  top: 14px;
  right: 14px;
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
.trr-info__close:hover { background: var(--color-border-light); }
.trr-fade-enter-active, .trr-fade-leave-active { transition: opacity 180ms ease; }
.trr-fade-enter-from, .trr-fade-leave-to { opacity: 0; }

@media (max-width: 767px) {
  /* Mobiel: horizontaal swipen, kaarten 80% breed. */
  .trr__grid { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 12px; padding-bottom: 4px; scrollbar-width: none; }
  .trr__grid::-webkit-scrollbar { display: none; }
  .trr-card { flex: 0 0 80%; scroll-snap-align: start; }
  .trr-info__card { padding: var(--space-lg); }
  .trr-info__grid { grid-template-columns: 1fr; }
  .trr-info__score { justify-self: start; }
}
</style>
