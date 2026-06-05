<template>
  <!-- Mobile-only floating control to switch the home/nav layout variant
       (1–4). Hidden on desktop via CSS. Sits bottom-left so it doesn't
       collide with the bottom-right hero-photo switcher on the home page. -->
  <div class="hvs" role="group" aria-label="Layout variant">
    <span class="hvs__caption" aria-hidden="true">Variant</span>
    <button
      v-for="v in (['1','2','3','4'] as const)"
      :key="v"
      type="button"
      class="hvs__btn"
      :class="{ 'hvs__btn--active': homeLayoutVariant === v }"
      :aria-pressed="homeLayoutVariant === v"
      :aria-label="`Variant ${v}`"
      @click="setHomeLayoutVariant(v)"
    >{{ v }}</button>
  </div>
</template>

<script setup lang="ts">
import { useFirstReleaseHomeVariant } from '~/composables-first-release/useFirstReleaseHomeVariant'

const { homeLayoutVariant, setHomeLayoutVariant } = useFirstReleaseHomeVariant()
</script>

<style scoped>
.hvs {
  display: none; /* desktop: hidden (mobile-only control) */
}

@media (max-width: 800px) {
  .hvs {
    position: fixed;
    /* Sit above the sticky booking CTA bar on deal/hotel pages (≈64px tall)
       so the switcher never covers the price / "Ik ga boeken" button. */
    bottom: 88px;
    left: 20px;
    z-index: 1300;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 8px;
    background: rgba(14, 14, 12, 0.6);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    border-radius: 999px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
    opacity: 0.6;
    transition: opacity 200ms ease, background 200ms ease;
  }
  .hvs:hover,
  .hvs:focus-within {
    opacity: 1;
    background: rgba(14, 14, 12, 0.85);
  }

  .hvs__caption {
    font-family: var(--font-body);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: rgba(255, 255, 255, 0.7);
    padding: 0 2px 0 2px;
    user-select: none;
  }

  .hvs__btn {
    width: 26px;
    height: 26px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: rgba(255, 255, 255, 0.85);
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background 150ms ease, color 150ms ease;
  }
  .hvs__btn:hover { background: rgba(255, 255, 255, 0.14); }
  .hvs__btn--active {
    background: #fff;
    color: #1a1a1a;
  }
}
</style>
