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

/* ── Row: equal-width cards; the text sits BELOW the image so long tip
   descriptions (which can run ~3× the title) fit without being clipped. ── */
.tips-row {
  display: flex;
  gap: 14px;
  align-items: stretch;   /* cards in a row share the tallest height */
}

/* ── Card: image on top, text below ── */
.tip-card {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: default;
}

/* ── Image: top of the card, fixed height ── */
.tip-card__image {
  position: relative;
  height: 200px;
  flex: 0 0 auto;
  overflow: hidden;
}

.tip-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

.tip-card:hover .tip-card__image img {
  transform: scale(1.04);
}

/* The dark number+title overlay is no longer used — the title lives in the
   text block below the image. */
.tip-card__overlay { display: none; }

/* ── Text block below the image ── */
.tip-card__panel {
  display: block;
  background: #fff;
  flex: 1 1 auto;
}

.tip-card__panel-inner {
  padding: var(--space-lg);
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
  font-size: 18px;
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

/* ── Tablet ── */
@media (max-width: 1024px) {
  .tip-card__image { height: 170px; }
  .tip-card__panel-title { font-size: 17px; }
  .tip-card__desc { font-size: 13px; }
}

@media (max-width: 800px) {
  /* Mobile: a different card shape — image on top, text BELOW it — so the
     full title + description always fit (the overlaid 55%-width panel cut
     long text off). Cards are 80vw wide and swipe horizontally; there is no
     tap/expand interaction. */
  .tips-section {
    padding-left: 16px;
    padding-right: 16px;
  }
  .tips-section__header {
    padding-left: 0;
    padding-right: 0;
  }
  .tips-section__grid {
    gap: 16px;
  }
  .tips-row {
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: stretch;   /* all cards in a row share the tallest height */
    height: auto;
    gap: 12px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
    /* Keep the first card at the section's 16px left margin (a scrolling flex
       row drops its left padding, so the old `margin:0 -16px` put the first
       card flush against the edge). Bleed only on the RIGHT so the next card
       still peeks at the right edge. */
    margin: 0 -16px 0 0;
    padding: 0 0 8px;
  }
  .tips-row--bottom {
    height: auto;
  }
  .tip-card {
    flex: 0 0 80vw !important;
    max-width: 80vw;
    height: auto !important;
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-lg);
    overflow: hidden;
    cursor: default;          /* no interaction */
    scroll-snap-align: start;
  }
  /* Image sits in normal flow at the top of the card (was absolute-filled). */
  .tip-card__image {
    position: static !important;
    height: 160px;
    flex: 0 0 auto;
  }
  .tip-card .tip-card__image img {
    transform: none !important;   /* no hover zoom on touch */
  }
  /* Drop the dark gradient overlay (number + title over the image). */
  .tip-card__overlay {
    display: none !important;
  }
  /* The text "panel" becomes a normal white block below the image, always
     visible (no slide-in), full width, growing to fit the description. */
  .tip-card__panel {
    position: static !important;
    width: 100% !important;
    opacity: 1 !important;
    transform: none !important;
    pointer-events: auto;
    background: #fff;
    display: block;
    flex: 1 1 auto;
  }
  .tip-card__panel-inner {
    padding: var(--space-md) var(--space-lg) var(--space-lg);
  }
  .tip-card__panel-title {
    font-size: 17px;
  }
  .tip-card__desc {
    font-size: 14px;
  }
}
</style>
