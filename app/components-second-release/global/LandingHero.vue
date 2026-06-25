<template>
  <!-- Full-bleed hero shared by the homepage and the solo-travel landing
       page. Wraps the overlay SiteHeader (which carries the nav + the
       search bar/dock that half-overlaps the hero bottom) over a
       background photo, with eyebrow / title / pitch copy. -->
  <section class="home-hero" :class="{ 'home-hero--search-below': searchBelow }">
    <div
      class="home-hero__bg"
      :class="{ 'home-hero__bg--shift-down': bgShiftDown }"
    >
      <img class="home-hero__bg-img" :src="bgUrl" alt="" />
    </div>

    <SecondReleaseSiteHeader variant="overlay">
      <template #hero>
        <div class="home-hero__content container">
          <div v-if="eyebrow" class="home-hero__eyebrow">
            <span class="home-hero__eyebrow-dot" aria-hidden="true" />
            <span>{{ eyebrow }}</span>
          </div>
          <h1 class="home-hero__title">
            {{ title }}<span v-if="titleEm" class="home-hero__title-em">{{ ' ' + titleEm }}</span>
          </h1>
          <p class="home-hero__tagline">{{ pitch }}</p>
        </div>
      </template>
    </SecondReleaseSiteHeader>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  /** Background photo URL. */
  bgUrl: string
  /** Push the cover-fit image down within its crop (matches home pills 1/8). */
  bgShiftDown?: boolean
  /** Small uppercase eyebrow above the title (omit to hide). */
  eyebrow?: string | null
  /** Main hero title. */
  title: string
  /** Optional emphasised tail appended to the title (e.g. "more"). */
  titleEm?: string | null
  /** Pitch / tagline under the title. */
  pitch: string
  /** Place the search bar BELOW the title/pitch (solo landing) instead of
   *  the homepage's top half-overlap dock. */
  searchBelow?: boolean
}>(), {
  bgShiftDown: false,
  eyebrow: null,
  titleEm: null,
  searchBelow: false,
})
</script>

<style scoped>
/* Don't stretch the SiteHeader to fill the hero — let it size to its
   natural nav+padding height (same as on /search) so the absolute-
   positioned search dock lands at the same Y on every page. */
.home-hero :deep(.site-header) {
  flex: 0 0 auto;
  align-self: stretch;
  display: block;
  position: relative;
  padding-bottom: 38px;
}
/* Same absolute-anchored / half-overlap dock that internal pages use, so
   the search bar half-overlaps the nav at the hero's bottom edge. */
.home-hero :deep(.site-header--overlay .site-header__search-dock) {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  margin-top: 0;
  padding: 0;
  transform: translateY(50%);
}

.home-hero {
  position: relative;
  isolation: isolate;
  height: 640px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.home-hero__bg {
  position: absolute;
  inset: 0;
  z-index: -2;
  overflow: hidden;
}

.home-hero__bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center bottom;
  display: block;
}

.home-hero__bg--shift-down .home-hero__bg-img {
  object-position: center calc(100% + 200px);
}

.home-hero__bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.15) 40%, rgba(0, 0, 0, 0.7) 100%);
}

/* Eyebrow + title + tagline — left-aligned, anchored toward the bottom of
   the hero so the photo gets more breathing room above. */
.home-hero__content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 28px;
  padding-bottom: 32px;
  position: absolute;
  top: 300px;
  left: 0;
  right: 0;
  z-index: 1;
}

.home-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  letter-spacing: 1.54px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
}

.home-hero__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #e97132;
}

.home-hero__title {
  font-family: var(--font-heading);
  font-size: clamp(64px, 10vw, 128px);
  line-height: 0.9;
  font-weight: 400;
  letter-spacing: -3.24px;
  color: #fff;
  margin: 0;
}

.home-hero__title-em {
  font-style: normal;
  font-weight: 600;
}

.home-hero__tagline {
  max-width: 640px;
  font-size: 20px;
  line-height: 28px;
  letter-spacing: -0.1px;
  color: #fff;
  margin: 0;
}

/* ── Solo landing (desktop): search bar BELOW the title/pitch. The hero
   becomes a flow column (nav → copy → search dock) instead of the homepage's
   absolute top-anchored copy + half-overlap dock. Gated to desktop so the
   mobile (variant-2) home layout below is left untouched. ── */
@media (min-width: 801px) {
  /* Same hero height as the homepage (640px); the SiteHeader fills it as a
     flow column (nav → copy → search), with the copy pushed down and the
     search bar pinned toward the bottom of the photo. */
  .home-hero--search-below {
    height: 640px;
  }
  .home-hero--search-below :deep(.site-header) {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding-bottom: 0;
  }
  /* width:100% defeats the flex auto-margin shrink so the copy fills the
     container and its left edge lines up with the search bar (like home). */
  .home-hero--search-below .home-hero__content {
    position: static;
    top: auto;
    width: 100%;
    padding-top: 156px;
    padding-bottom: 0;
  }
  /* Search bar follows the copy (fixed gap) rather than pinning to the
     bottom, so moving the copy up moves the search bar with it. */
  .home-hero--search-below :deep(.site-header--overlay .site-header__search-dock) {
    position: static;
    transform: none;
    margin: 28px 0 0;
    padding: 0;
  }
}

@media (max-width: 800px) {
  /* Height becomes content-driven so the searchbar + copy fit below. */
  .home-hero {
    height: auto;
    min-height: 450px;
  }
  /* Photo top-aligned so the upper portion stays visible with no grey strip. */
  .home-hero__bg-img,
  .home-hero__bg--shift-down .home-hero__bg-img {
    object-position: center top;
  }
  /* Copy flows naturally below the SiteHeader's mobile search trigger
     (the search-below-copy reorder lives in sr-home-variants.css, keyed
     on data-sr-home-variant="2"). */
  .home-hero__content {
    position: static;
    top: auto;
    left: auto;
    right: auto;
    padding: 24px 16px 32px 28px;
    gap: 16px;
  }
  .home-hero__title {
    font-size: clamp(40px, 12vw, 64px);
    line-height: 1;
    letter-spacing: -1.5px;
  }
  .home-hero__tagline {
    font-size: 16px;
    line-height: 1.45;
  }
}
</style>
