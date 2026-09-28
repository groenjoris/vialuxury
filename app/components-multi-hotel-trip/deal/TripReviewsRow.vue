<template>
  <!-- Multi Hotel Trip — drie reizigersbeoordelingen van de vakantie, horizontaal
       naast elkaar (variant "Reviews" van het reisschema: onder het blok "Je reis
       in het kort"). Kaart: score + oordeel, citaat (max. 5 regels), naam ·
       woonplaats · datum. Link rechtsboven naar alle beoordelingen onderaan. -->
  <section class="trr" :aria-label="t('trip.reviews.heading')">
    <div class="trr__head">
      <h3 class="trr__title">{{ t('trip.reviews.heading') }}</h3>
      <a v-if="count" href="#beoordelingen" class="trr__all">{{ t('trip.reviews.all').replace('{n}', String(count)) }}</a>
    </div>
    <div class="trr__grid">
      <article v-for="(r, i) in reviews" :key="i" class="trr-card">
        <div class="trr-card__top">
          <span class="trr-card__score">{{ r.score.toFixed(1) }}</span>
          <span class="trr-card__verdict">{{ t(getReviewLabelKey(r.score)) }}</span>
        </div>
        <p class="trr-card__text">“{{ r.text }}”</p>
        <p class="trr-card__meta">
          <span class="trr-card__author">{{ r.author }}</span>
          <span v-if="r.city"> · {{ r.city }}</span>
          <span v-if="r.date"> · {{ r.date }}</span>
        </p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { getReviewLabelKey } from '~/utils-multi-hotel-trip/reviewLabel'

export interface TripReviewView {
  author: string
  city?: string
  date?: string
  score: number
  text: string
}

defineProps<{
  reviews: TripReviewView[]
  /** Totaal aantal beoordelingen (voor de link "Alle … beoordelingen"). */
  count?: number
}>()

const { t } = useMultiHotelTripI18n()
</script>

<style scoped>
.trr { display: flex; flex-direction: column; gap: var(--space-md); }
.trr__head { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-md); }
.trr__title { margin: 0; font-family: var(--font-heading); font-size: 20px; font-weight: 700; line-height: 1.25; color: var(--color-text-primary); }
.trr__all {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
  white-space: nowrap;
}
.trr__all:hover { color: var(--color-primary-hover); }
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
.trr-card__top { display: flex; align-items: center; gap: 8px; }
.trr-card__score {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 28px;
  padding: 0 8px;
  border-radius: 6px;
  /* Trustpilot-groen — dezelfde kleur als de prijzen in de kalender. */
  background: var(--color-discount, #00b67a);
  color: #fff;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.trr-card__verdict { font-size: 14px; font-weight: 600; color: var(--color-text-primary); }
.trr-card__text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.trr-card__meta { margin: auto 0 0; font-size: 13px; color: var(--color-text-secondary); }
.trr-card__author { font-weight: 600; color: var(--color-text-primary); }
@media (max-width: 767px) {
  .trr__grid { grid-template-columns: 1fr; }
}
</style>
