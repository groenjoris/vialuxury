<template>
  <div class="hvs" role="group" aria-label="Schakel tussen homepage-varianten">
    <button
      type="button"
      class="hvs__btn"
      :aria-label="`Vorige variant (${prev})`"
      @click="goto(prev)"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
    <span class="hvs__label" aria-hidden="true">{{ current }}<span class="hvs__sep">/</span>{{ VARIANTS.length }}</span>
    <button
      type="button"
      class="hvs__btn"
      :aria-label="`Volgende variant (${next})`"
      @click="goto(next)"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useHomeVariant } from '~/composables/useHomeVariant'

type Variant = '1' | '2' | '3' | '4' | '5'

const props = defineProps<{
  /** The variant the current page represents — used to compute prev/next. */
  current: Variant
}>()

const VARIANTS: Variant[] = ['1', '2', '3', '4', '5']
const { setHomeVariant } = useHomeVariant()

const idx = computed(() => VARIANTS.indexOf(props.current))
const prev = computed<Variant>(() => VARIANTS[(idx.value - 1 + VARIANTS.length) % VARIANTS.length] as Variant)
const next = computed<Variant>(() => VARIANTS[(idx.value + 1) % VARIANTS.length] as Variant)

function pathFor(v: Variant): string {
  return v === '1' ? '/home' : `/home-v${v}`
}

function goto(v: Variant) {
  setHomeVariant(v)
  navigateTo(pathFor(v))
}
</script>

<style scoped>
/* Subtle right-edge carousel control for variant-hopping between
   /home, /home-v2, /home-v3, /home-v4. Fixed-position so it stays put
   on scroll; vertically centred; 20px from the right edge. */
.hvs {
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
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

.hvs:hover,
.hvs:focus-within {
  opacity: 1;
  background: rgba(14, 14, 12, 0.85);
}

.hvs__btn {
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

.hvs__btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.hvs__btn:active {
  transform: scale(0.94);
}

.hvs__btn:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.hvs__label {
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.5px;
  line-height: 1;
  user-select: none;
}

.hvs__sep {
  margin: 0 1px;
  opacity: 0.6;
}

/* The SVG icon: by default the arrows point left (prev) and right (next).
   That's the convention for a horizontal carousel even though the
   buttons stack vertically — feels less ambiguous than up/down for a
   "previous/next variant" affordance. */
</style>
