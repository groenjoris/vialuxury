<script setup lang="ts">
import { computed } from 'vue'
import type { SearchHotel } from '~/types/searchHotel'
import { formatPrice } from '~/utils/formatPrice'

/**
 * HotelMapHoverCard — preview card that floats above a hovered hotel pin
 * on /kaart. Matches the Figma spec (`Hover on map`, node 4609:6708):
 *
 *   • 296 × 157 px wrapper (4 px coloured top border).
 *   • 80 × 137 px image on the left, 8 px content padding on the right.
 *   • Name 16 px, deals line 14 px, main price 20 px.
 *   • Footer with discount pill, persons icon, "Vanaf" + main price,
 *     and a strikethrough original price (top-right).
 *   • Bottom-centre tail/pointer.
 *
 * Three states:
 *   - default          (active, has available deals)
 *   - sold-out         (greyed; reachable when arrival-date filter applied)
 *
 * Title rules (per spec):
 *   - Single deal → "Pakket voor N nacht(en)"
 *   - Consecutive nights → "Deals voor X-Y nachten"
 *   - Non-consecutive → "Deals voor 1, 2 of 4 nachten"
 *   - Sold out → "Uitverkocht voor {datum}"
 */

const props = defineProps<{
  hotel: SearchHotel
  position: { x: number; y: number } | null
  /** YYYY-MM-DD selected arrival date, or null when none. */
  arrivalDate?: string | null
  /** Hotel is sold out for the active arrival-date filter. */
  soldOut?: boolean
}>()

/** Cheapest deal — the price + discount source for the preview. */
const cheapest = computed(() => {
  return [...props.hotel.deals].sort((a, b) => a.basePrice - b.basePrice)[0]
})

const nights = computed<number[]>(() => {
  const set = new Set<number>()
  for (const d of props.hotel.deals) set.add(d.nights)
  return [...set].sort((a, b) => a - b)
})

const isConsecutive = (arr: number[]) =>
  arr.length > 1 && arr.every((n, i) => i === 0 || n === arr[i - 1] + 1)

function formatNightList(arr: number[]): string {
  if (arr.length === 1) return String(arr[0])
  if (isConsecutive(arr)) return `${arr[0]}-${arr[arr.length - 1]}`
  const head = arr.slice(0, -1).join(', ')
  return `${head} of ${arr[arr.length - 1]}`
}

const dealsLabel = computed(() => {
  if (props.soldOut) {
    return props.arrivalDate
      ? `Uitverkocht voor ${formatDate(props.arrivalDate)}`
      : 'Uitverkocht voor jouw datum'
  }
  const ns = nights.value
  if (ns.length === 0) return ''
  if (ns.length === 1) {
    return `Pakket voor ${ns[0]} ${ns[0] === 1 ? 'nacht' : 'nachten'}`
  }
  return `Deals voor ${formatNightList(ns)} nachten`
})

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}-${m}-${y}`
}

/** Card sits ABOVE the pin by default. If that would push it within
 *  SAFE_TOP px of the viewport edge (where chrome / floating controls
 *  obscure it), flip and render BELOW the pin (orange bar + tail mirror). */
const flipped = computed(() => {
  if (!props.position) return false
  const CARD_H = 140
  const PIN_OFFSET = 28
  const SAFE_TOP = 24
  return props.position.y - CARD_H - PIN_OFFSET < SAFE_TOP
})

const cardStyle = computed(() => {
  if (!props.position) return { display: 'none' }
  const CARD_W = 296
  const CARD_H = 140
  const PIN_OFFSET = 28
  // Pin marker centre sits on the coordinate; offset the card by half the
  // pin height + a touch of breathing room.
  const top = flipped.value
    ? props.position.y + PIN_OFFSET
    : props.position.y - CARD_H - PIN_OFFSET
  return {
    left: `${props.position.x - CARD_W / 2}px`,
    top: `${top}px`,
    width: `${CARD_W}px`,
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="position"
      class="hover-card"
      :class="{ 'hover-card--soldOut': soldOut, 'hover-card--flipped': flipped }"
      :style="cardStyle"
    >
      <div class="hover-card__inner">
        <img :src="hotel.heroImage" :alt="hotel.name" class="hover-card__image" />
        <div class="hover-card__body">
          <h4 class="hover-card__title">{{ hotel.name }}</h4>
          <div class="hover-card__stars" aria-hidden="true">
            <span v-for="n in hotel.starRating" :key="n">★</span>
          </div>
          <p class="hover-card__deals">{{ dealsLabel }}</p>
          <div v-if="cheapest" class="hover-card__footer">
            <span class="hover-card__discount">-{{ cheapest.discountPercentage }}%</span>
            <div class="hover-card__price-block">
              <svg class="hover-card__persons" width="18" height="14" viewBox="0 0 24 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="7" cy="6" r="3" />
                <circle cx="17" cy="6" r="3" />
                <path d="M2 17c0-3 2.2-5 5-5s5 2 5 5" />
                <path d="M12 17c0-3 2.2-5 5-5s5 2 5 5" />
              </svg>
              <span class="hover-card__price-from">Vanaf</span>
              <span class="hover-card__price-final">{{ formatPrice(cheapest.basePrice) }}</span>
              <span v-if="cheapest.originalPrice > cheapest.basePrice" class="hover-card__price-old">
                {{ formatPrice(cheapest.originalPrice) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="hover-card__tail" />
    </div>
  </Teleport>
</template>

<style scoped>
.hover-card {
  position: fixed;
  z-index: 1000;
  pointer-events: none;
  filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.18));
  /* 4 px coloured "border" baked in as a background fill the inner panel
     sits on top of, so the tail can inherit the same fill at the join. */
  background: var(--color-primary);
  border-radius: var(--radius-lg);
  height: 140px;
  /* Default orientation: orange bar at TOP, tail at BOTTOM pointing down. */
  padding-top: 4px;
}

.hover-card--soldOut {
  background: var(--color-border);
}

/* Flipped: orange bar at BOTTOM, tail at TOP pointing up. */
.hover-card--flipped {
  padding-top: 0;
  padding-bottom: 4px;
}

.hover-card__inner {
  display: flex;
  background: var(--color-surface);
  border-radius: var(--radius-lg) var(--radius-lg) calc(var(--radius-lg) - 2px) calc(var(--radius-lg) - 2px);
  height: 136px;
  overflow: hidden;
}

.hover-card--flipped .hover-card__inner {
  border-radius: calc(var(--radius-lg) - 2px) calc(var(--radius-lg) - 2px) var(--radius-lg) var(--radius-lg);
}

.hover-card__image {
  width: 80px;
  height: 136px;
  flex-shrink: 0;
  object-fit: cover;
}

.hover-card__body {
  flex: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.hover-card__title {
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hover-card__stars {
  color: var(--color-text-primary);
  font-size: 13px;
  letter-spacing: 1px;
  line-height: 1;
  margin-top: 4px;
}

.hover-card__deals {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  margin: 4px 0 0;
  color: var(--color-primary);
}

.hover-card--soldOut .hover-card__deals {
  color: var(--color-error);
}

.hover-card__footer {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.hover-card__discount {
  background: #1A1A1A;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
  letter-spacing: 0.3px;
}

.hover-card--soldOut .hover-card__discount {
  background: var(--color-text-muted);
}

.hover-card__price-block {
  display: flex;
  align-items: baseline;
  gap: 4px;
  color: var(--color-text-primary);
  position: relative;
}

.hover-card--soldOut .hover-card__price-block {
  color: var(--color-text-muted);
}

.hover-card__persons {
  align-self: center;
  color: var(--color-text-primary);
  flex-shrink: 0;
}

.hover-card--soldOut .hover-card__persons {
  color: var(--color-text-muted);
}

.hover-card__price-from {
  font-size: 11px;
  font-style: italic;
  color: var(--color-text-secondary);
}

.hover-card__price-final {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
}

.hover-card__price-old {
  position: absolute;
  right: 0;
  top: -14px;
  font-size: 11px;
  text-decoration: line-through;
  color: var(--color-error);
}

.hover-card--soldOut .hover-card__price-old {
  color: var(--color-text-muted);
}

/* Tail/pointer — square rotated 45°, inherits the card's surface fill so
   the seam disappears against the body. Default position: bottom-centre
   pointing down. Flipped: top-centre pointing up. */
.hover-card__tail {
  position: absolute;
  left: 50%;
  width: 14px;
  height: 14px;
  background: var(--color-surface);
  bottom: -7px;
  transform: translateX(-50%) rotate(45deg);
}

.hover-card--flipped .hover-card__tail {
  bottom: auto;
  top: -7px;
}
</style>
