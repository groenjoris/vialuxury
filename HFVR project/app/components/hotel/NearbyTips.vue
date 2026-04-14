<template>
  <section class="nearby-tips">
    <div class="nearby-tips__header container">
      <h2 class="nearby-tips__title">Tips in de buurt</h2>
      <p class="nearby-tips__subtitle">{{ tips.length }} leuke uitjes bij {{ hotelName }}</p>
    </div>

    <div class="nearby-tips__carousel">
      <!-- Prev arrow -->
      <button class="nearby-tips__arrow nearby-tips__arrow--prev" @click="prev" aria-label="Vorige tip">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <!-- Slides -->
      <div class="nearby-tips__viewport">
        <div
          v-for="(tip, index) in tips"
          :key="tip.id"
          class="nearby-tips__slide"
          :class="{ 'nearby-tips__slide--active': index === currentIndex }"
        >
          <div class="nearby-tips__slide-inner container">
            <div class="nearby-tips__image-col">
              <div class="nearby-tips__image-wrap">
                <img :src="tip.image" :alt="tip.title" loading="lazy" />
              </div>
            </div>
            <div class="nearby-tips__text-col">
              <div class="nearby-tips__text-inner">
                <hr class="nearby-tips__divider" />
                <h3 class="nearby-tips__tip-title">{{ tip.title }}</h3>
                <p class="nearby-tips__tip-desc">{{ tip.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Next arrow -->
      <button class="nearby-tips__arrow nearby-tips__arrow--next" @click="next" aria-label="Volgende tip">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <!-- Dots -->
      <div class="nearby-tips__dots">
        <button
          v-for="(tip, index) in tips"
          :key="tip.id"
          class="nearby-tips__dot"
          :class="{ 'nearby-tips__dot--active': index === currentIndex }"
          :aria-label="`Ga naar tip ${index + 1}`"
          @click="currentIndex = index"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { NearbyTip } from '~/types/hotel'

const props = defineProps<{
  tips: NearbyTip[]
  hotelName: string
}>()

const currentIndex = ref(0)

function next() {
  currentIndex.value = (currentIndex.value + 1) % props.tips.length
}

function prev() {
  currentIndex.value = (currentIndex.value - 1 + props.tips.length) % props.tips.length
}
</script>

<style scoped>
.nearby-tips {
  background: #f0f0ee;
  padding: var(--space-2xl) 0;
}

.nearby-tips__header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.nearby-tips__title {
  font-family: var(--font-heading);
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.nearby-tips__subtitle {
  font-size: 15px;
  color: var(--color-text-secondary);
}

/* Carousel */
.nearby-tips__carousel {
  position: relative;
}

.nearby-tips__viewport {
  position: relative;
  overflow: hidden;
  min-height: 420px;
}

/* Slide */
.nearby-tips__slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 400ms ease;
}

.nearby-tips__slide--active {
  position: relative;
  opacity: 1;
  pointer-events: auto;
}

.nearby-tips__slide-inner {
  display: grid;
  grid-template-columns: 55% 45%;
  gap: var(--space-2xl);
  align-items: center;
  min-height: 420px;
}

/* Image column */
.nearby-tips__image-col {
  position: relative;
}

.nearby-tips__image-wrap {
  border-radius: var(--radius-lg);
  overflow: hidden;
  border-top: 4px solid var(--color-primary);
  aspect-ratio: 4/3;
}

.nearby-tips__image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Text column */
.nearby-tips__text-col {
  display: flex;
  align-items: center;
  padding: var(--space-xl) var(--space-xl) var(--space-xl) 0;
}

.nearby-tips__text-inner {
  max-width: 420px;
}

.nearby-tips__divider {
  width: 48px;
  border: none;
  border-top: 3px solid var(--color-text-primary);
  margin: 0 0 var(--space-lg) 0;
}

.nearby-tips__tip-title {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
}

.nearby-tips__tip-desc {
  font-size: 15px;
  line-height: 1.7;
  color: var(--color-text-secondary);
}

/* Arrows */
.nearby-tips__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: rgba(30, 30, 30, 0.7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 200ms ease;
}

.nearby-tips__arrow:hover {
  background: rgba(30, 30, 30, 0.9);
}

.nearby-tips__arrow--prev {
  left: var(--space-md);
}

.nearby-tips__arrow--next {
  right: var(--space-md);
}

/* Dots */
.nearby-tips__dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: var(--space-lg);
}

.nearby-tips__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: var(--color-border);
  cursor: pointer;
  padding: 0;
  transition: background 200ms ease;
}

.nearby-tips__dot--active {
  background: var(--color-primary);
}

/* Responsive */
@media (max-width: 768px) {
  .nearby-tips__slide-inner {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
    min-height: auto;
  }

  .nearby-tips__text-col {
    padding: 0 var(--space-lg) var(--space-lg);
  }

  .nearby-tips__viewport {
    min-height: auto;
  }

  .nearby-tips__tip-title {
    font-size: 22px;
  }

  .nearby-tips__arrow {
    width: 36px;
    height: 36px;
  }

  .nearby-tips__arrow svg {
    width: 18px;
    height: 18px;
  }
}
</style>
