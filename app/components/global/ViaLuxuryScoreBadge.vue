<template>
  <div class="vl-score" :class="{ 'vl-score--compact': compact }">
    <span class="vl-score__badge" :aria-label="`ViaLuxury score ${result.score} van 10`">
      <span class="vl-score__number">{{ formattedScore }}</span>
    </span>

    <template v-if="!compact">
      <span class="vl-score__label">{{ result.band }}</span>
      <span
        class="vl-score__info"
        tabindex="0"
        :aria-describedby="tipId"
        @mouseenter="showTooltip"
        @mouseleave="hideTooltip"
        @focus="showTooltip"
        @blur="hideTooltip"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </span>
    </template>

    <Teleport to="body">
      <div
        v-if="tooltipOpen && !compact"
        :id="tipId"
        role="tooltip"
        class="vl-score__tooltip"
        :style="tooltipStyle"
        @mouseenter="cancelHide"
        @mouseleave="hideTooltip"
      >
        <p class="vl-score__tooltip-title">ViaLuxury subscores</p>
        <div class="vl-score__bars">
          <template v-for="row in subscoreRows" :key="row.label">
            <span class="vl-score__bar-label">{{ row.label }}</span>
            <span class="vl-score__bar-track">
              <span class="vl-score__bar-fill" :style="{ width: `${row.pct}%` }" />
            </span>
            <span class="vl-score__bar-value">{{ row.value.toFixed(1) }}</span>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { SearchHotel } from '~/types/searchHotel'
import { viaLuxuryScore } from '~/utils/viaLuxuryScore'

const props = defineProps<{
  hotel: SearchHotel
  allHotels?: readonly SearchHotel[]
  compact?: boolean
}>()

const result = computed(() => viaLuxuryScore(props.hotel, props.allHotels))

const formattedScore = computed(() => {
  // Trailing .0 looks odd for the rounded "Ultiem verwend" 10.0; drop it.
  const n = result.value.score
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
})

const subscoreRows = computed(() => [
  { label: 'Omgeving',       value: result.value.subscores.omgeving,       pct: result.value.subscores.omgeving * 10 },
  { label: 'Kamer',          value: result.value.subscores.kamer,          pct: result.value.subscores.kamer * 10 },
  { label: 'Hotel',          value: result.value.subscores.hotel,          pct: result.value.subscores.hotel * 10 },
  { label: 'Value for money',value: result.value.subscores.valueForMoney,  pct: result.value.subscores.valueForMoney * 10 },
])

// --- Tooltip plumbing ---
const tipId = `vl-tip-${Math.random().toString(36).slice(2, 8)}`
const tooltipOpen = ref(false)
const tooltipStyle = ref<Record<string, string>>({})
let hideTimer: ReturnType<typeof setTimeout> | null = null
const rootEl = ref<HTMLElement | null>(null)

function showTooltip(e: Event) {
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  tooltipStyle.value = {
    position: 'fixed',
    top: (rect.bottom + 8) + 'px',
    left: Math.max(8, rect.left - 80) + 'px',
    zIndex: '1500',
  }
  tooltipOpen.value = true
}
function cancelHide() {
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
}
function hideTooltip() {
  hideTimer = setTimeout(() => { tooltipOpen.value = false; hideTimer = null }, 120)
}
</script>

<style scoped>
.vl-score {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* Badge: solid black square with rounded corners. The score number is
   rendered in white on top. */
.vl-score__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  background: #000;
  border-radius: 8px;
}

.vl-score__number {
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.vl-score__label {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.vl-score__info {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  color: var(--color-text-muted);
  cursor: help;
}

.vl-score__info:hover,
.vl-score__info:focus-visible {
  color: var(--color-primary);
}

.vl-score--compact {
  gap: 0;
}

/* Tooltip: a small floating panel with a 4-row bar chart. */
.vl-score__tooltip {
  background: #fff;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 12px 14px;
  min-width: 240px;
}

.vl-score__tooltip-title {
  margin: 0 0 8px;
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.vl-score__bars {
  display: grid;
  grid-template-columns: 110px 1fr auto;
  align-items: center;
  gap: 6px 10px;
}

.vl-score__bar-label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.vl-score__bar-track {
  background: var(--color-background-secondary, #f0ede5);
  border-radius: 999px;
  height: 6px;
  overflow: hidden;
}

.vl-score__bar-fill {
  display: block;
  height: 100%;
  background: #00B67A;
  border-radius: 999px;
}

.vl-score__bar-value {
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-primary);
  text-align: right;
  min-width: 22px;
}
</style>
