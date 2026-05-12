<script setup lang="ts">
import { computed } from 'vue'
import type { SearchHotel } from '~/types/searchHotel'
import { formatPrice } from '~/utils-northstar/formatPrice'
import { priceForArrival } from '~/utils-northstar/priceFormula'

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
  /** Hotel has no deals matching the active filters (nights / themes /
   *  arrangement / specials / budget). The card shows a different copy line
   *  but the hotel pin remains clickable so the side panel can be opened. */
  unmatched?: boolean
}>()

const { persons, arrivalDate: globalArrivalDate } = useNorthstarSearchState()
const { selectHotel, setHover, scheduleHover, keepHover } = useNorthstarHotelMap()

/** Cancel any pending hide while the cursor is inside the preview. */
function onCardEnter() {
  // Disabled hotels don't open the side panel — only signal "still hovering"
  // when the card itself is clickable.
  if (props.unmatched || props.soldOut) return
  keepHover()
}

/** When the cursor leaves the card, hide immediately (no grace period). */
function onCardLeave() {
  setHover(null)
}

/** Clicking anywhere on the preview opens the side panel for this hotel. */
function onCardClick() {
  if (props.unmatched || props.soldOut) return
  setHover(null)
  selectHotel(props.hotel.id)
}
/** When an arrival date is locked-in globally, use that for pricing; the
 *  prop `arrivalDate` is passed by the map for sold-out marking but matches
 *  the global state for pricing purposes. */
const activeArrival = computed(() => globalArrivalDate.value || props.arrivalDate || null)

/** Cheapest deal — picked by the date-adjusted price so the preview matches
 *  what the user sees on the deal/search cards. */
const cheapest = computed(() => {
  return [...props.hotel.deals].reduce((min, d) => {
    const dPrice = priceForArrival(d.basePrice, d.id, activeArrival.value, persons.value)
    const minPrice = priceForArrival(min.basePrice, min.id, activeArrival.value, persons.value)
    return dPrice < minPrice ? d : min
  })
})

const cheapestPrice = computed(() =>
  priceForArrival(cheapest.value.basePrice, cheapest.value.id, activeArrival.value, persons.value),
)
const cheapestOriginal = computed(() =>
  priceForArrival(cheapest.value.originalPrice, cheapest.value.id, activeArrival.value, persons.value),
)

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

/** Split into a top line ("Arrangement voor" / "Arrangementen voor" /
 *  "Uitverkocht voor" / "Voldoet niet aan…") and a bottom line. */
const dealsLabel = computed(() => {
  if (props.unmatched) {
    // Show on a single visual line; rendered via a top/bottom split so the
    // card layout stays consistent with the matched/sold-out states.
    return { top: 'Voldoet niet aan', bottom: 'je zoekwensen' }
  }
  if (props.soldOut) {
    return {
      top: 'Uitverkocht voor',
      bottom: props.arrivalDate ? formatDate(props.arrivalDate) : 'jouw datum',
    }
  }
  const ns = nights.value
  if (ns.length === 0) return { top: '', bottom: '' }
  if (ns.length === 1) {
    return {
      top: 'Arrangement voor',
      bottom: `${ns[0]} ${ns[0] === 1 ? 'nacht' : 'nachten'}`,
    }
  }
  return {
    top: 'Arrangementen voor',
    bottom: `${formatNightList(ns)} nachten`,
  }
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
      @mouseenter="onCardEnter"
      @mouseleave="onCardLeave"
      @click="onCardClick"
    >
      <div class="hover-card__box">
        <div class="hover-card__band" />
        <div class="hover-card__inner">
          <img :src="hotel.heroImage" :alt="hotel.name" class="hover-card__image" />
          <div class="hover-card__body">
            <h4 class="hover-card__title">{{ hotel.name }}</h4>
            <div class="hover-card__stars" aria-hidden="true">
              <span v-for="n in hotel.starRating" :key="n">★</span>
            </div>
            <p class="hover-card__deals">
            <span class="hover-card__deals-top">{{ dealsLabel.top }}</span>
            <span class="hover-card__deals-bottom">{{ dealsLabel.bottom }}</span>
          </p>
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
                <span class="hover-card__price-final">{{ formatPrice(cheapestPrice) }}</span>
                <span v-if="cheapestOriginal > cheapestPrice" class="hover-card__price-old">
                  {{ formatPrice(cheapestOriginal) }}
                </span>
              </div>
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
  /* Card is clickable: hovering keeps it open and clicking opens the
     side panel. Disabled-hotel variants opt out via the JS handlers. */
  pointer-events: auto;
  cursor: pointer;
  /* Default 140 px tall; can grow when the hotel name wraps to a 2nd line.
     Flex column so __box can use `flex: 1` and pass a definite height down
     to the image (which uses `height: 100%`). */
  display: flex;
  flex-direction: column;
  min-height: 140px;
  filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.18));
}

/* Build the card as a plain white rectangle next to a plain 4 px coloured
   strip, then clip the assembly with rounded corners via this single mask
   box. The white inner has no border-radius of its own. */
.hover-card__box {
  display: flex;
  flex-direction: column;
  flex: 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.hover-card__band {
  flex: 0 0 4px;
  background: var(--color-primary);
}

.hover-card__inner {
  flex: 1;
  display: flex;
  background: var(--color-surface);
}

/* Flipped (card rendered below the pin): band moves below the inner. */
.hover-card--flipped .hover-card__box {
  flex-direction: column-reverse;
}

/* Sold-out variant: grey accent. */
.hover-card--soldOut .hover-card__band {
  background: var(--color-border);
}

/* Disabled (soldOut / unmatched) cards aren't clickable. */
.hover-card--soldOut {
  cursor: default;
}

.hover-card__image {
  display: block;
  width: 80px;
  height: auto;
  align-self: stretch;
  min-height: 0;
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
  display: flex;
  flex-direction: column;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  margin: 4px 0 0;
  color: var(--color-primary);
  line-height: 1.25;
}

.hover-card__deals-top,
.hover-card__deals-bottom {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
