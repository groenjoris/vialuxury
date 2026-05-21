<template>
  <!-- Small "i" icon next to a price. Hover (desktop) / tap (mobile) /
       keyboard focus reveals a popover with the matching disclaimer.

       The bubble is `<Teleport to="body">`-ed so it escapes any clipped
       parent (deal-card `overflow: hidden`, sticky CTA bar, etc.) and is
       positioned in fixed coordinates relative to the icon. The
       placement flips above ↔ below based on available viewport space.

       `variant="card"` — used on deal cards (long disclaimer about how
       the strike-through price is calculated + booking-fee mention).
       `variant="deal"` — used on the deal page sidebar / sticky CTA
       (short disclaimer about booking fee and local surcharges). -->
  <span
    ref="rootEl"
    class="price-info"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @click.stop="onClick"
    @keydown.enter.stop.prevent="toggle"
    @keydown.space.stop.prevent="toggle"
    role="button"
    tabindex="0"
    :aria-expanded="open"
    :aria-label="'Toelichting prijs'"
  >
    <span class="price-info__icon" aria-hidden="true">i</span>
  </span>

  <Teleport to="body">
    <Transition name="price-info-fade">
      <span
        v-if="open"
        ref="bubbleEl"
        class="price-info__bubble"
        :class="{ 'price-info__bubble--below': placeBelow }"
        role="tooltip"
        :style="bubbleStyle"
        @mouseenter="onBubbleEnter"
        @mouseleave="onLeave"
        @click.stop
      >
        {{ disclaimer }}
      </span>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'card' | 'deal'
}>(), {
  variant: 'card',
})

const open = ref(false)
let closeTimer: ReturnType<typeof setTimeout> | null = null

const rootEl = ref<HTMLElement | null>(null)
const bubbleEl = ref<HTMLElement | null>(null)
const bubbleStyle = ref<Record<string, string>>({})
const placeBelow = ref(false)

const BUBBLE_W = 280
const BUBBLE_MAX_H = 220
const GAP = 8

function reposition() {
  const root = rootEl.value
  if (!root) return
  const r = root.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight
  const spaceAbove = r.top
  const spaceBelow = vh - r.bottom
  // Default: prefer above (matches the existing card visual rhythm).
  // Flip to below when there's not enough room above and there is below
  // (sticky CTA bar at top of viewport is the canonical case).
  const below = spaceAbove < BUBBLE_MAX_H + GAP + 8 && spaceBelow > spaceAbove
  placeBelow.value = below

  // Right-anchor horizontally to the icon's centre, then clamp into
  // the viewport with an 8 px gutter.
  const iconCenter = r.left + r.width / 2
  let left = iconCenter - BUBBLE_W + 14  // caret near right edge
  left = Math.max(8, Math.min(left, vw - BUBBLE_W - 8))

  const top = below
    ? r.bottom + GAP
    : r.top - GAP // bottom of bubble = r.top - GAP; we set "top" via translateY below

  bubbleStyle.value = {
    position: 'fixed',
    left: `${left}px`,
    top: `${top}px`,
    width: `${BUBBLE_W}px`,
    // When placing above, shift the bubble up by its own height so its
    // BOTTOM edge sits GAP px above the icon's top.
    transform: below ? 'none' : 'translateY(-100%)',
    zIndex: '2147483600',
  }
}

function onEnter() {
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null }
  open.value = true
  // Wait for the bubble to mount before measuring viewport space.
  nextTick(reposition)
}
function onBubbleEnter() {
  // Pointer moved onto the bubble itself — cancel any pending close.
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null }
}
function onLeave() {
  // Small delay so a stray pointer movement off the icon doesn't blink
  // the bubble away before the user can read it.
  closeTimer = setTimeout(() => { open.value = false }, 100)
}
function onClick(e: MouseEvent) {
  // Mobile tap toggles the bubble. Stop propagation so the click
  // doesn't also trigger the underlying card link / button.
  e.preventDefault()
  toggle()
}
function toggle() {
  open.value = !open.value
  if (open.value) nextTick(reposition)
}

// Click-outside on touch devices: close when the user taps anywhere
// outside both the icon and the bubble.
let docClickHandler: ((e: MouseEvent) => void) | null = null
let scrollHandler: (() => void) | null = null
onMounted(() => {
  if (typeof window === 'undefined') return
  docClickHandler = (e: MouseEvent) => {
    if (!open.value) return
    const target = e.target as Node | null
    const root = rootEl.value
    const bubble = bubbleEl.value
    if (root && target && root.contains(target)) return
    if (bubble && target && bubble.contains(target)) return
    open.value = false
  }
  document.addEventListener('click', docClickHandler)
  // Keep the bubble glued to its icon if the page scrolls while open.
  scrollHandler = () => { if (open.value) reposition() }
  window.addEventListener('scroll', scrollHandler, { passive: true, capture: true })
  window.addEventListener('resize', scrollHandler)
})
onBeforeUnmount(() => {
  if (docClickHandler) document.removeEventListener('click', docClickHandler)
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler, { capture: true } as EventListenerOptions)
    window.removeEventListener('resize', scrollHandler)
  }
})

const disclaimer = computed(() => {
  if (props.variant === 'deal') {
    return 'Prijs is exclusief boekingskosten t.w.v. €27,50, eventuele servicekosten en lokale toeslagen.'
  }
  return 'De korting is gebaseerd op de oorspronkelijke verkoopprijs, zoals het standaardtarief van het hotel of de gangbare prijs op bekende boekingssites. Deze vergelijken we met de laagste actieprijs bij ViaLuxury, binnen een periode van drie maanden. De doorgestreepte prijs laat de oorspronkelijke verkoopprijs zien. Let op: de actieprijs is exclusief mogelijke servicekosten, boekingskosten van €27,50 en lokale toeslagen. Zie je iets opvallends of heb je een vraag? Laat het ons weten. We waarderen je feedback. Veel reisplezier!'
})
</script>

<style scoped>
/* Icon stays scoped — sits inline next to the price text. */
.price-info {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  vertical-align: middle;
  margin-left: 4px;
  cursor: help;
  outline: none;
}
.price-info:focus-visible .price-info__icon {
  box-shadow: 0 0 0 2px var(--color-primary, #ee7126);
}
.price-info__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid var(--color-text-muted, #9a9a9a);
  color: var(--color-text-muted, #9a9a9a);
  font-family: var(--font-body);
  font-style: italic;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  user-select: none;
  transition: color 120ms ease, border-color 120ms ease;
}
.price-info:hover .price-info__icon,
.price-info[aria-expanded="true"] .price-info__icon {
  color: var(--color-text-primary, #0e0e0c);
  border-color: var(--color-text-primary, #0e0e0c);
}
</style>

<!-- Bubble lives at the <body> root (Teleport target) so any scoped
     selector here would never match it. The bubble's visuals are
     therefore declared globally below. -->
<style>
.price-info__bubble {
  padding: 10px 12px;
  background: #1a1a1a;
  color: #fff;
  font-family: var(--font-body);
  font-size: 12px;
  line-height: 1.5;
  font-weight: 400;
  letter-spacing: 0;
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  white-space: normal;
  text-align: left;
  cursor: default;
  pointer-events: auto;
}
/* Caret points DOWN at the icon when the bubble sits above (default). */
.price-info__bubble::after {
  content: '';
  position: absolute;
  top: 100%;
  right: 8px;
  border: 6px solid transparent;
  border-top-color: #1a1a1a;
}
/* Caret points UP at the icon when the bubble sits below. */
.price-info__bubble--below::after {
  top: auto;
  bottom: 100%;
  border-top-color: transparent;
  border-bottom-color: #1a1a1a;
}

.price-info-fade-enter-active,
.price-info-fade-leave-active {
  transition: opacity 120ms ease, transform 120ms ease;
}
.price-info-fade-enter-from,
.price-info-fade-leave-to {
  opacity: 0;
}
</style>
