<template>
  <div class="vl-carousel">
    <div class="vl-carousel__viewport">
      <div
        class="vl-carousel__track"
        :style="{ transform: `translateX(-${activeIndex * 100}%)` }"
      >
        <div
          v-for="(item, index) in items"
          :key="index"
          class="vl-carousel__slide"
        >
          <slot :item="item" :index="index">
            <img
              v-if="typeof item === 'string'"
              :src="item"
              alt=""
              class="vl-carousel__img"
              loading="lazy"
            />
          </slot>
        </div>
      </div>

      <!-- Prev / next arrows -->
      <template v-if="showArrows && items.length > 1">
        <button
          type="button"
          class="vl-carousel__nav vl-carousel__nav--prev"
          aria-label="Vorige"
          @click="prev"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <button
          type="button"
          class="vl-carousel__nav vl-carousel__nav--next"
          aria-label="Volgende"
          @click="next"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </template>
    </div>

    <!-- Dot indicators -->
    <div v-if="showDots && items.length > 1" class="vl-carousel__dots">
      <button
        v-for="(item, index) in items"
        :key="index"
        type="button"
        class="vl-carousel__dot"
        :class="{ 'vl-carousel__dot--active': index === activeIndex }"
        :aria-label="`Ga naar item ${index + 1}`"
        :aria-current="index === activeIndex"
        @click="goTo(index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCarousel } from '~/lib/composables/useCarousel'

const props = withDefaults(
  defineProps<{
    /** Items to cycle through. Plain strings render as images via the default slot. */
    items: unknown[]
    /** Auto-advance through the items. */
    autoplay?: boolean
    /** Milliseconds between auto-advances. */
    interval?: number
    /** Show the prev/next arrow buttons. */
    showArrows?: boolean
    /** Show the dot indicators. */
    showDots?: boolean
  }>(),
  {
    autoplay: false,
    interval: 5000,
    showArrows: true,
    showDots: true,
  },
)

const itemsRef = computed(() => props.items)
const enabled = computed(() => props.autoplay)

const { activeIndex, goTo } = useCarousel(itemsRef, {
  intervalMs: props.interval,
  enabled,
})

function prev() {
  const n = props.items.length
  if (n < 2) return
  goTo((activeIndex.value - 1 + n) % n)
}
function next() {
  const n = props.items.length
  if (n < 2) return
  goTo((activeIndex.value + 1) % n)
}
</script>

<style scoped>
.vl-carousel {
  width: 100%;
}

.vl-carousel__viewport {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
}

.vl-carousel__track {
  display: flex;
  transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
}

.vl-carousel__slide {
  flex: 0 0 100%;
  width: 100%;
  min-width: 0;
}

.vl-carousel__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Prev / next arrows — white circular buttons, vertically centred. */
.vl-carousel__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  color: #1a1a1a;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: background var(--transition-fast);
  z-index: 2;
}
.vl-carousel__nav:hover { background: #fff; }
.vl-carousel__nav--prev { left: 10px; }
.vl-carousel__nav--next { right: 10px; }

.vl-carousel__dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: var(--space-sm);
}

.vl-carousel__dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: var(--color-border);
  cursor: pointer;
  transition: background var(--transition-fast), transform var(--transition-fast);
}
.vl-carousel__dot:hover { background: var(--color-text-muted); }
.vl-carousel__dot--active {
  background: var(--color-primary);
  transform: scale(1.25);
}
</style>
