<template>
  <div class="hps" role="group" aria-label="Wissel hero-foto">
    <button
      type="button"
      class="hps__btn"
      :aria-label="`Vorige foto`"
      @click="goto(prev)"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
    <span class="hps__label" aria-hidden="true">{{ heroPhotoIndex + 1 }}<span class="hps__sep">/</span>{{ heroPhotos.length }}</span>
    <button
      type="button"
      class="hps__btn"
      :aria-label="`Volgende foto`"
      @click="goto(next)"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useSecondReleaseHomeVariant } from '~/composables-second-release/useSecondReleaseHomeVariant'

const { heroPhotos, heroPhotoIndex, setHeroPhotoIndex } = useSecondReleaseHomeVariant()

const prev = computed(() => (heroPhotoIndex.value - 1 + heroPhotos.length) % heroPhotos.length)
const next = computed(() => (heroPhotoIndex.value + 1) % heroPhotos.length)

function goto(idx: number) {
  setHeroPhotoIndex(idx)
}
</script>

<style scoped>
/* Floating photo-switcher pill in the bottom-right corner. Same look
   as the variant switcher (mid-right), tuned for a different anchor
   so it doesn't overlap. */
.hps {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 900;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 6px 6px;
  background: rgba(14, 14, 12, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius: 999px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  transition: opacity 200ms ease, background 200ms ease;
  opacity: 0.55;
}

.hps:hover,
.hps:focus-within {
  opacity: 1;
  background: rgba(14, 14, 12, 0.85);
}

.hps__btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: #fff;
  cursor: pointer;
  border-radius: 50%;
  transition: background 150ms ease, transform 150ms ease;
}

.hps__btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.hps__btn:active {
  transform: scale(0.94);
}

.hps__btn:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.hps__label {
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.5px;
  line-height: 1;
  user-select: none;
}

.hps__sep {
  margin: 0 1px;
  opacity: 0.6;
}
</style>
