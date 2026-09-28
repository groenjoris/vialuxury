<template>
  <!-- Multi Hotel Trip — drie reizigersbeoordelingen van de vakantie naast
       elkaar (geen carrousel) met de kop "Beoordelingen", boven het voorbeeld-reisschema. Kaart:
       cijfer (groen) + oordeel, het gekozen citaat, daaronder de
       naam en, op een eigen regel, het land, en "Meer info" → pop-up met de hele
       review: titel (klein), maand van de vakantie, score, de volledige tekst
       (scrollt als hij lang is) en de schrijver. Mobiel: horizontaal swipen. -->
  <section class="trr" :class="{ 'trr--plain': plain }" :aria-label="t('trip.reviews.heading')">
    <h2 class="trr__title">{{ t('trip.reviews.heading') }}</h2>
    <div class="trr__grid">
      <article v-for="(r, i) in reviews" :key="i" class="trr-card">
        <div class="trr-card__top">
          <span class="trr-card__score" :aria-label="`${r.score.toFixed(1)}/10`">{{ r.score.toFixed(1) }}</span>
          <span class="trr-card__verdict">{{ t(getReviewLabelKey(r.score)) }}</span>
        </div>
        <p class="trr-card__quote">“{{ r.quote }}”</p>
        <div class="trr-card__who">
          <span class="trr-card__whotext">
            <span class="trr-card__name">{{ r.author }}</span>
            <span class="trr-card__country"><span class="trr-flag" :class="`trr-flag--${r.country.toLowerCase()}`" aria-hidden="true"></span>{{ t(`country.${r.country}`) }}</span>
          </span>
        </div>
        <button type="button" class="trr-card__more" @click="info = r">{{ t('trip.reviews.moreInfo') }}</button>
      </article>
    </div>

    <!-- Pop-up met de volledige review -->
    <Teleport to="body">
      <Transition name="trr-fade">
        <div v-if="info" class="trr-info" @click.self="info = null">
          <article class="trr-info__card" role="dialog" aria-modal="true" :aria-label="info.title" data-scroll-lock-allow="true">
            <button type="button" class="trr-info__close" :aria-label="t('common.close')" @click="info = null">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
            <header class="trr-info__head">
              <span class="trr-info__score" :aria-label="`${info.score.toFixed(1)}/10`">{{ info.score.toFixed(1) }}</span>
              <div class="trr-info__headtext">
                <h3 class="trr-info__title">{{ info.title }}</h3>
                <p class="trr-info__meta">{{ t('trip.reviews.travelledIn').replace('{month}', info.month) }}</p>
              </div>
            </header>
            <div class="trr-info__body">
              <p v-for="(p, i) in paragraphsOf(info.text)" :key="i" class="trr-info__text">{{ p }}</p>
            </div>
            <!-- Schrijver: avatar, naam en land op één regel. -->
            <footer class="trr-info__foot">
              <span class="trr-info__avatar" aria-hidden="true">
                <img v-if="info.avatar" :src="info.avatar" alt="" />
                <template v-else>{{ initialOf(info.author) }}</template>
              </span>
              <span class="trr-info__who">
                <span class="trr-info__name">{{ info.author }}</span>
                <span class="trr-info__country"><span class="trr-flag trr-flag--lg" :class="`trr-flag--${info.country.toLowerCase()}`" aria-hidden="true"></span>{{ t(`country.${info.country}`) }}</span>
              </span>
            </footer>
          </article>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { useBodyScrollLock } from '~/composables-multi-hotel-trip/useBodyScrollLock'
import { getReviewLabelKey } from '~/utils-multi-hotel-trip/reviewLabel'

export interface TripReviewView {
  author: string
  /** Landcode voor het vlaggetje en de landnaam: NL, BE, DE. */
  country: 'NL' | 'BE' | 'DE'
  avatar?: string
  /** Maand van de vakantie, al opgemaakt: "juni 2026". */
  month: string
  score: number
  title: string
  /** Het gekozen citaat op de kaart. */
  quote: string
  /** De volledige review (pop-up). */
  text: string
}

/** `plain`: zonder grijs vlak (sub-variant "No background" bij reisschema-variant Final). */
defineProps<{ reviews: TripReviewView[]; plain?: boolean }>()

const { t } = useMultiHotelTripI18n()
const initialOf = (name: string) => (name.trim().charAt(0) || '?').toUpperCase()
const paragraphsOf = (text: string) => text.split(/\n+/).map(s => s.trim()).filter(Boolean)

const info = ref<TripReviewView | null>(null)
useBodyScrollLock().bindTo(computed(() => !!info.value))
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') info.value = null }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
/* Grijs vlak, zoals het voorbeeld-reisschema en de inclusies. */
.trr {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  padding: var(--space-lg);
  background: var(--color-background-secondary, #FBFAF8);
  border-radius: var(--radius-lg);
}
.trr--plain { padding: 0; background: none; border-radius: 0; }
/* Kop in dezelfde stijl als de andere sectiekoppen op de pagina (22px/600). */
.trr__title { margin: 0; font-family: var(--font-heading); font-size: 22px; font-weight: 600; line-height: 1.3; color: var(--color-text-primary); }
/* Drie kaarten naast elkaar, even hoog. */
.trr__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.trr-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface, #fff);
}
.trr-card__top { display: flex; align-items: center; gap: 8px; }
.trr-card__score {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  height: 26px;
  padding: 0 7px;
  border-radius: 6px;
  background: #27C88D; /* zelfde groen als de scorebadge bij de hotelreviews */
  color: #fff;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.trr-card__verdict { font-size: 14px; font-weight: 700; color: var(--color-text-primary); }
.trr-card__quote {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--color-text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.trr-card__who { display: flex; align-items: center; gap: 8px; margin-top: auto; }
.trr-card__whotext { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.trr-card__name { font-size: 13px; font-weight: 700; line-height: 1.2; color: var(--color-text-primary); }
.trr-card__country { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; line-height: 1.2; color: var(--color-text-secondary); }
.trr-card__more {
  align-self: flex-start;
  padding: 0;
  border: 0;
  background: none;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-link); /* donker onderstreept, als de ankernavigatie */
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
  transition: color var(--transition-fast);
}
.trr-card__more:hover { color: var(--color-primary-hover); }

/* Vlaggetje (drie banen) per land. */
.trr-flag { display: inline-block; width: 14px; height: 10px; border-radius: 2px; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08); }
.trr-flag--nl { background: linear-gradient(#ae1c28 0 33.4%, #fff 33.4% 66.7%, #21468b 66.7%); }
.trr-flag--be { background: linear-gradient(to right, #000 0 33.4%, #fdda24 33.4% 66.7%, #ef3340 66.7%); }
.trr-flag--de { background: linear-gradient(#000 0 33.4%, #dd0000 33.4% 66.7%, #ffce00 66.7%); }

/* Pop-up: vaste, hoge kaart; de tekst scrolt als hij langer is. */
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
  width: min(640px, 100%);
  max-height: 88vh; /* zo hoog als de tekst; alleen lange reviews scrollen */
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  background: var(--color-surface, #fff);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}
.trr-info__head {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: var(--space-xl) 64px var(--space-md) var(--space-xl);
  border-bottom: 1px solid var(--color-border-light);
}
.trr-info__headtext { min-width: 0; }
.trr-info__title { margin: 0 0 2px; font-family: var(--font-heading); font-size: 18px; font-weight: 700; line-height: 1.3; color: var(--color-text-primary); }
.trr-info__meta { margin: 0; font-size: 13px; color: var(--color-text-secondary); }
.trr-info__score {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 30px;
  padding: 0 8px;
  border-radius: 6px;
  background: #27C88D;
  color: #fff;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.trr-info__body { flex: 1; min-height: 0; overflow: auto; padding: var(--space-md) var(--space-xl); }
.trr-info__text { margin: 0 0 var(--space-sm); font-size: 15px; line-height: 1.7; color: var(--color-text-primary); }
.trr-info__text:last-child { margin-bottom: 0; }
.trr-info__foot {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: var(--space-md) var(--space-xl) var(--space-lg);
  border-top: 1px solid var(--color-border-light);
}
/* Avatar op social-media-formaat (40px); naam en land in dezelfde grootte ernaast. */
.trr-info__avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #4a4a4a;
  color: #fff;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 700;
}
.trr-info__avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
/* Naam en land op één regel; op een smal scherm valt alleen het land eronder (naast de avatar). */
.trr-info__who { display: flex; align-items: center; flex-wrap: wrap; gap: 2px 10px; min-width: 0; }
.trr-info__name { font-size: 15px; font-weight: 700; color: var(--color-text-primary); }
.trr-info__country { display: inline-flex; align-items: center; gap: 6px; font-size: 15px; color: var(--color-text-secondary); }
.trr-flag--lg { width: 18px; height: 13px; }
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
  /* Mobiel: horizontaal swipen, kaarten 76% breed (de rij loopt tot de rand van het vlak). */
  .trr { padding: var(--space-md); }
  .trr__grid { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 4px; scrollbar-width: none; }
  .trr__grid::-webkit-scrollbar { display: none; }
  .trr-card { flex: 0 0 76%; scroll-snap-align: start; }
  .trr-info__head { padding: var(--space-lg) 60px var(--space-md) var(--space-lg); }
  .trr-info__body, .trr-info__foot { padding-left: var(--space-lg); padding-right: var(--space-lg); }
}
</style>
