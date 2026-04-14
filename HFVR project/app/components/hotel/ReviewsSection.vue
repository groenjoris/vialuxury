<template>
  <section id="reviews" class="reviews-section">
    <div class="reviews-section__header">
      <h2>Beoordelingen</h2>
      <div class="reviews-section__actions">
        <span class="text-secondary text-sm">Alle beoordelingen ({{ reviews.totalReviews }})</span>
        <button class="btn btn-secondary">✏️ Schrijf een beoordeling</button>
      </div>
    </div>

    <!-- Score overview -->
    <div class="reviews-section__overview">
      <div class="score-big">
        <span class="score-big__number">{{ reviews.overallScore }}</span>
        <div class="score-big__meta">
          <span class="score-big__stars">★★★★☆</span>
          <span class="score-big__count">{{ reviews.totalReviews }} beoordelingen</span>
        </div>
      </div>

      <div class="category-scores">
        <div v-for="cat in reviews.categories" :key="cat.name" class="category-score">
          <span class="category-score__name">{{ cat.name }}</span>
          <span class="category-score__value">{{ cat.score }}</span>
        </div>
      </div>
    </div>

    <!-- Individual reviews -->
    <div class="reviews-section__list">
      <div v-for="review in individualReviews" :key="review.id" class="review-card">
        <div v-if="review.images?.length" class="review-card__images">
          <div v-for="(img, i) in review.images.slice(0, 2)" :key="i" class="review-card__img-wrapper">
            <img :src="img" alt="Review foto" class="review-card__img" />
          </div>
          <button v-if="review.images.length > 2" class="review-card__more-images">
            Alle {{ review.images.length }} foto's weergeven
          </button>
        </div>

        <div class="review-card__header">
          <span class="review-card__author">{{ review.author }}</span>
          <span class="review-card__divider">·</span>
          <span class="review-card__date">{{ formatReviewDate(review.date) }}</span>
          <span class="review-card__divider">·</span>
          <span class="review-card__stars">
            <span v-for="n in 5" :key="n" :class="n <= review.score ? 'star-filled' : 'star-empty'">★</span>
          </span>
        </div>

        <p class="review-card__text">{{ review.text }}</p>
        <button class="review-card__readmore">Lees meer</button>
      </div>
    </div>

    <button v-if="individualReviews.length > 6" class="btn btn-secondary reviews-section__load-more">
      Alle {{ reviews.totalReviews }} beoordelingen
    </button>
  </section>
</template>

<script setup lang="ts">
import type { ReviewSummary, Review } from '~/types/hotel'
import dayjs from 'dayjs'

defineProps<{
  reviews: ReviewSummary
  individualReviews: Review[]
}>()

function formatReviewDate(date: string): string {
  const d = dayjs(date)
  const months = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
  return `${d.date()} ${months[d.month()]}`
}
</script>

<style scoped>
.reviews-section {
  padding: var(--space-xl) 0;
  border-top: 1px solid var(--color-border);
}

.reviews-section__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.reviews-section__actions {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.reviews-section__overview {
  display: flex;
  gap: var(--space-2xl);
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-xl);
  border-bottom: 1px solid var(--color-border);
}

.score-big {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.score-big__number {
  font-size: 48px;
  font-weight: 700;
  font-family: var(--font-heading);
  line-height: 1;
}

.score-big__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.score-big__stars {
  color: var(--color-primary);
  font-size: 14px;
}

.score-big__count {
  font-size: 13px;
  color: var(--color-text-muted);
}

.category-scores {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm) var(--space-xl);
  flex: 1;
}

.category-score {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-background-secondary);
  border-radius: var(--radius-md);
}

.category-score__name {
  font-size: 14px;
}

.category-score__value {
  font-weight: 700;
  font-size: 14px;
}

.reviews-section__list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xl);
}

.review-card {
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.review-card__images {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.review-card__img-wrapper {
  width: 120px;
  height: 80px;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.review-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.review-card__more-images {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  font-size: 12px;
  color: var(--color-text-secondary);
  min-width: 80px;
}

.review-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
  font-size: 13px;
}

.review-card__author {
  font-weight: 600;
}

.review-card__divider {
  color: var(--color-text-muted);
}

.review-card__date {
  color: var(--color-text-muted);
}

.star-filled { color: var(--color-primary); font-size: 12px; }
.star-empty { color: var(--color-border); font-size: 12px; }

.review-card__text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.review-card__readmore {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: var(--space-sm);
  text-align: right;
  display: block;
  width: 100%;
}

.reviews-section__load-more {
  margin-top: var(--space-xl);
}
</style>
