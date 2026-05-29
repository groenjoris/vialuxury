<template>
  <section class="tips-section container">
    <div class="tips-section__header">
      <h2 class="tips-section__title">{{ t('hotel.nearbyTips') }}</h2>
      <p class="tips-section__subtitle">{{ tips.length }} {{ t('hotel.nearbySubtitle') }} {{ hotelName }}</p>
    </div>

    <div class="tips-section__grid">
      <!-- Row 1: first 3 tips -->
      <div class="tips-row tips-row--top">
        <div
          v-for="(tip, index) in topRow"
          :key="tip.id"
          class="tip-card"
          :class="{
            'tip-card--active': isMobile || activeTop === index,
            'tip-card--inactive': !isMobile && activeTop !== null && activeTop !== index,
          }"
          @click="toggleTop(index)"
        >
          <!-- Image layer (always visible, fills card) -->
          <div class="tip-card__image">
            <img :src="tip.image" :alt="localized(tip.title)" loading="lazy" />
          </div>

          <!-- Collapsed overlay: number + title -->
          <div class="tip-card__overlay">
            <span class="tip-card__number">{{ String(index + 1).padStart(2, '0') }}</span>
            <h3 class="tip-card__title">{{ localized(tip.title) }}</h3>
          </div>

          <!-- Expanded: text panel on the right -->
          <div class="tip-card__panel">
            <div class="tip-card__panel-inner">
              <div class="tip-card__accent"></div>
              <h3 class="tip-card__panel-title">{{ localized(tip.title) }}</h3>
              <p class="tip-card__desc">{{ localized(tip.description) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 2: last 2 tips — hidden when there are none, otherwise the
           fixed 280 px row height leaves a ghost empty band below. -->
      <div v-if="bottomRow.length > 0" class="tips-row tips-row--bottom">
        <div
          v-for="(tip, index) in bottomRow"
          :key="tip.id"
          class="tip-card"
          :class="{
            'tip-card--active': isMobile || activeBottom === index,
            'tip-card--inactive': !isMobile && activeBottom !== null && activeBottom !== index,
          }"
          @click="toggleBottom(index)"
        >
          <div class="tip-card__image">
            <img :src="tip.image" :alt="localized(tip.title)" loading="lazy" />
          </div>

          <div class="tip-card__overlay">
            <span class="tip-card__number">{{ String(index + 4).padStart(2, '0') }}</span>
            <h3 class="tip-card__title">{{ localized(tip.title) }}</h3>
          </div>

          <div class="tip-card__panel">
            <div class="tip-card__panel-inner">
              <div class="tip-card__accent"></div>
              <h3 class="tip-card__panel-title">{{ localized(tip.title) }}</h3>
              <p class="tip-card__desc">{{ localized(tip.description) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { NearbyTip } from '~/types/hotel'

const { t, localized } = useFirstReleaseI18n()
const isMobile = useFirstReleaseIsMobile()

const props = defineProps<{
  tips: NearbyTip[]
  hotelName: string
}>()

const topRow = computed(() => props.tips.slice(0, 3))
const bottomRow = computed(() => props.tips.slice(3, 5))

const activeTop = ref<number | null>(null)
const activeBottom = ref<number | null>(null)

/** Mobile turns the component into a horizontal swipe carousel with
 *  every card always expanded — no toggle. Click handlers no-op so
 *  the text panel stays visible on tap. */
function toggleTop(index: number) {
  if (isMobile.value) return
  activeTop.value = activeTop.value === index ? null : index
}

function toggleBottom(index: number) {
  if (isMobile.value) return
  activeBottom.value = activeBottom.value === index ? null : index
}
</script>

<style scoped>
.tips-section {
  /* Match the other deal/hotel-page sections: standard vertical padding,
     keep the container's horizontal padding so inner content aligns with
     other sections, subtle inset top divider. */
  position: relative;
  padding: var(--space-xl) var(--space-lg);
}
.tips-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: var(--space-lg);
  right: var(--space-lg);
  height: 1px;
  background: var(--color-border-light);
}

.tips-section__header {
  text-align: left;
  margin-bottom: var(--space-md);
}

.tips-section__title {
  /* Same look as `.section-title` used elsewhere on the page */
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-xs) 0;
}

.tips-section__subtitle {
  font-size: 15px;
  color: var(--color-text-secondary);
}

/* ── Grid: two rows ── */
.tips-section__grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── Row ── */
.tips-row {
  display: flex;
  gap: 14px;
  height: 300px; /* Fixed height — no layout shift */
}

.tips-row--bottom {
  height: 280px;
}

/* ── Card ── */
.tip-card {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: flex 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

.tip-card--active {
  flex: 2.4 1 0;
}

.tip-card--inactive {
  flex: 0.8 1 0;
}

/* ── Image: fills the entire card ── */
.tip-card__image {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.tip-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

.tip-card:hover .tip-card__image img {
  transform: scale(1.05);
}

/* ── Overlay: number + title (visible when collapsed) ── */
.tip-card__overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 3;
  padding: var(--space-xl) var(--space-lg) var(--space-md);
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 100%);
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: opacity 400ms ease;
}

.tip-card--active .tip-card__overlay {
  opacity: 0;
  pointer-events: none;
}

.tip-card__number {
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  letter-spacing: 0.05em;
}

.tip-card__title {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  color: white;
  line-height: 1.3;
  margin: 0;
  transition: font-size 400ms ease;
}

.tip-card--inactive .tip-card__title {
  font-size: 15px;
}

/* ── Panel: text side (visible when expanded) ── */
.tip-card__panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 45%;
  z-index: 4;
  background: #F5F5F5;
  display: flex;
  align-items: center;
  opacity: 0;
  transform: translateX(30px);
  transition: opacity 400ms ease, transform 500ms cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.tip-card--active .tip-card__panel {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

.tip-card__panel-inner {
  padding: var(--space-xl) var(--space-xl) var(--space-xl) var(--space-lg);
}

.tip-card__accent {
  width: 40px;
  height: 3px;
  background: var(--color-primary);
  border-radius: 2px;
  margin-bottom: var(--space-md);
}

.tip-card__panel-title {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm) 0;
  line-height: 1.3;
}

.tip-card__desc {
  font-size: 14px;
  line-height: 1.7;
  color: var(--color-text-secondary);
  margin: 0;
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .tips-row {
    height: 260px;
  }

  .tips-row--bottom {
    height: 240px;
  }

  .tip-card__panel {
    width: 50%;
  }

  .tip-card__panel-title {
    font-size: 18px;
  }

  .tip-card__desc {
    font-size: 13px;
  }

  .tip-card__title {
    font-size: 16px;
  }
}

@media (max-width: 800px) {
  /* Mobile: convert the two-row grid into horizontal scroll
     carousels. Each card is 80 vw wide; ~20 vw of the next card
     peeks at the right edge so the user knows it's swipeable.
     Every card is forced into its expanded `--active` state via
     the template binding above, so the text panel is always
     visible. */
  /* Restore 16 px horizontal section padding so the Tips block
     aligns with the other mobile sections; the scroll row inside
     keeps its own 16 px padding so the next-card peek remains. */
  .tips-section {
    padding-left: 16px;
    padding-right: 16px;
  }
  .tips-section__header {
    padding-left: 0;
    padding-right: 0;
  }
  .tips-section__grid {
    gap: 12px;
  }
  .tips-row {
    flex-direction: row;
    flex-wrap: nowrap;
    height: auto;
    gap: 12px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
    padding: 0 16px 8px;
  }
  .tips-row--bottom {
    height: auto;
  }
  .tip-card {
    flex: 0 0 80vw !important;
    max-width: 80vw;
    height: 220px;
    scroll-snap-align: start;
  }
  .tip-card__panel {
    width: 55%;
  }
  /* Overlay (number + tiny title) is hidden on mobile — the
     expanded text panel covers the same info and looks better
     full-width. */
  .tip-card__overlay {
    opacity: 0 !important;
  }
  .tip-card__panel-inner {
    padding: var(--space-md) var(--space-lg);
  }
  .tip-card__panel-title {
    font-size: 17px;
  }
}
</style>
