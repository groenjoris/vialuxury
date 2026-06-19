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
              <button
                v-if="!isMobile"
                type="button"
                class="tip-card__more"
                @click.stop="toggleTop(index)"
              >{{ activeTop === index ? t('common.readLess') : t('common.readMore') }}</button>
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
              <button
                v-if="!isMobile"
                type="button"
                class="tip-card__more"
                @click.stop="toggleBottom(index)"
              >{{ activeBottom === index ? t('common.readLess') : t('common.readMore') }}</button>
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
  /* Size is driven by flex-basis (NOT flex-grow) so it can be animated — a
     flex-grow/`flex` transition is left stuck in Chromium and never resizes.
     flex-basis is a length and animates reliably. */
  flex-grow: 0;
  flex-shrink: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: flex-basis 450ms cubic-bezier(0.4, 0, 0.2, 1);
}
/* Initial state: every card the SAME width in BOTH rows — a third of the
   row minus the two 14px gaps. flex-grow:0 keeps the 2-card bottom row from
   stretching to fill (cards match the top row, left-aligned). */
.tips-row--top .tip-card,
.tips-row--bottom .tip-card { flex-basis: calc((100% - 28px) / 3); }
/* Clicked card grows (Lees meer), its row-mates shrink — animated via
   flex-basis. (Mobile pins flex to 80vw !important, so none of this applies
   there.) */
.tips-row--top .tip-card--active { flex-basis: 56%; }
.tips-row--top .tip-card--inactive { flex-basis: 22%; }
.tips-row--bottom .tip-card--active { flex-basis: 64%; }
.tips-row--bottom .tip-card--inactive { flex-basis: 36%; }

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
  /* Collapsed: show a larger first paragraph (~6 lines) with the rest
     revealed via "Lees meer". */
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
/* Expanded card shows the full description. */
.tip-card--active .tip-card__desc {
  -webkit-line-clamp: initial;
  overflow: visible;
}

/* "Lees meer" / "Lees minder" toggle — plain orange text link. */
.tip-card__more {
  align-self: flex-start;
  margin-top: var(--space-sm);
  padding: 0;
  background: none;
  border: 0;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.tip-card__more:hover { color: var(--color-primary-hover); }

/* ── Tablet ── */
@media (max-width: 1024px) {
  .tip-card__image { height: 170px; }
  .tip-card__panel-title { font-size: 18px; }
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
    font-size: 18px;
  }
  .tip-card__desc {
    font-size: 14px;
    /* Mobile shows the full description (no clamp / "Lees meer"). */
    display: block;
    -webkit-line-clamp: initial;
    overflow: visible;
  }
  /* The "Lees meer" toggle is desktop-only (it's also gated with v-if in
     the template, but hide defensively in case of a resize). */
  .tip-card__more { display: none; }
}
</style>
