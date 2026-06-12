<template>
  <span
    ref="rootEl"
    class="vl-tooltip"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="hide"
  >
    <slot />

    <Teleport to="body">
      <Transition name="vl-tooltip-fade">
        <span
          v-if="open"
          role="tooltip"
          class="vl-tooltip__bubble"
          :class="`vl-tooltip__bubble--${position}`"
          :style="bubbleStyle"
        >
          {{ text }}
        </span>
      </Transition>
    </Teleport>
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  text: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}>(), {
  position: 'top',
})

const GAP = 8

const open = ref(false)
const rootEl = ref<HTMLElement | null>(null)
const bubbleStyle = ref<Record<string, string>>({})

function reposition() {
  const el = rootEl.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const cx = r.left + r.width / 2
  const cy = r.top + r.height / 2

  const style: Record<string, string> = {
    position: 'fixed',
    zIndex: '2147483600',
  }

  switch (props.position) {
    case 'bottom':
      style.top = `${r.bottom + GAP}px`
      style.left = `${cx}px`
      style.transform = 'translateX(-50%)'
      break
    case 'left':
      style.top = `${cy}px`
      style.left = `${r.left - GAP}px`
      style.transform = 'translate(-100%, -50%)'
      break
    case 'right':
      style.top = `${cy}px`
      style.left = `${r.right + GAP}px`
      style.transform = 'translateY(-50%)'
      break
    case 'top':
    default:
      style.top = `${r.top - GAP}px`
      style.left = `${cx}px`
      style.transform = 'translate(-50%, -100%)'
      break
  }

  bubbleStyle.value = style
}

function show() {
  open.value = true
  nextTick(reposition)
}

function hide() {
  open.value = false
}
</script>

<style scoped>
.vl-tooltip {
  display: inline-flex;
  align-items: center;
}
</style>

<!-- Bubble is teleported to <body>, so its styles must be global. -->
<style>
.vl-tooltip__bubble {
  padding: 8px 10px;
  max-width: 240px;
  background: var(--color-dark);
  color: #fff;
  font-family: var(--font-body);
  font-size: 12px;
  line-height: 1.5;
  font-weight: 400;
  border-radius: var(--radius-sm);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  text-align: center;
  pointer-events: none;
  white-space: normal;
}

/* Caret */
.vl-tooltip__bubble::after {
  content: '';
  position: absolute;
  border: 5px solid transparent;
}

.vl-tooltip__bubble--top::after {
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-top-color: var(--color-dark);
}

.vl-tooltip__bubble--bottom::after {
  bottom: 100%;
  left: 50%;
  margin-left: -5px;
  border-bottom-color: var(--color-dark);
}

.vl-tooltip__bubble--left::after {
  left: 100%;
  top: 50%;
  margin-top: -5px;
  border-left-color: var(--color-dark);
}

.vl-tooltip__bubble--right::after {
  right: 100%;
  top: 50%;
  margin-top: -5px;
  border-right-color: var(--color-dark);
}

.vl-tooltip-fade-enter-active,
.vl-tooltip-fade-leave-active {
  transition: opacity 120ms ease;
}

.vl-tooltip-fade-enter-from,
.vl-tooltip-fade-leave-to {
  opacity: 0;
}
</style>
