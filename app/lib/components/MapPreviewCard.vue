<template>
  <!--
    MapPreviewCard — the floating preview card that appears above (or below)
    a hovered hotel pin on the map. Ported from the production
    `HotelMapHoverCard`. Standalone: takes plain props instead of a
    SearchHotel + map store.

    Visuals:
      • 296 px wide wrapper with a 4 px coloured top (or bottom) band.
      • 80 px image on the left, 8 px content padding on the right.
      • Footer with discount pill, persons icon, "Vanaf" + price, and a
        strikethrough original price (top-right).
      • A pointer / caret ("beltje") that points toward the map pin —
        down by default (card ABOVE the pin), flipped up when the card
        sits BELOW the pin.
      • Optional sold-out state (greyed accent + "Uitverkocht" copy).
      • Optional scarcity bar ("Nog X beschikbaar").
  -->
  <div
    class="map-preview"
    :class="{
      'map-preview--soldOut': soldOut,
      'map-preview--flipped': placement === 'below',
      'map-preview--scarcity': showScarcity,
    }"
  >
    <div class="map-preview__box">
      <div class="map-preview__band" />
      <div class="map-preview__inner">
        <img :src="image" :alt="name" class="map-preview__image" />
        <div class="map-preview__body">
          <h4 class="map-preview__title">{{ name }}</h4>
          <div v-if="starRating" class="map-preview__stars" aria-hidden="true">
            <span v-for="n in starRating" :key="n">★</span>
          </div>
          <p class="map-preview__deals">
            <span class="map-preview__deals-top">{{ dealsLabel.top }}</span>
            <span class="map-preview__deals-bottom">{{ dealsLabel.bottom }}</span>
          </p>
          <div class="map-preview__footer">
            <span v-if="discountPercentage" class="map-preview__discount">-{{ discountPercentage }}%</span>
            <div class="map-preview__price-block">
              <svg class="map-preview__persons" width="18" height="14" viewBox="0 0 24 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="7" cy="6" r="3" />
                <circle cx="17" cy="6" r="3" />
                <path d="M2 17c0-3 2.2-5 5-5s5 2 5 5" />
                <path d="M12 17c0-3 2.2-5 5-5s5 2 5 5" />
              </svg>
              <span class="map-preview__price-from">Vanaf</span>
              <span class="map-preview__price-final">{{ formatPrice(price) }}</span>
              <span v-if="originalPrice && originalPrice > price" class="map-preview__price-old">
                {{ formatPrice(originalPrice) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <!-- Scarcity layer — full-width dark bar at the bottom. -->
      <div v-if="showScarcity" class="map-preview__scarcity">Nog {{ roomsLeft }} beschikbaar</div>
    </div>
    <!-- Caret / "beltje" pointing toward the pin. -->
    <div class="map-preview__tail" />
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/lib/utils/formatPrice'
import { nightsLabel } from '~/lib/utils/plural'

const props = withDefaults(
  defineProps<{
    /** Hotel display name. */
    name: string
    /** Hero image URL. */
    image: string
    /** Star rating (number of ★ glyphs). */
    starRating?: number
    /** City line (used in the deals/location copy). */
    city: string
    /** Region appended after the city. */
    region?: string
    /** Cheapest price shown after "Vanaf". */
    price: number
    /** Original (pre-discount) price — strikethrough when higher than `price`. */
    originalPrice?: number
    /** Discount percentage shown in the pill (omit to hide). */
    discountPercentage?: number
    /** Nights for the "Arrangement voor N nachten" copy line. */
    nights?: number
    /**
     * Where the card sits relative to the pin:
     *   - 'above' (default): card is above the pin, caret points DOWN.
     *   - 'below': card is below the pin, band + caret flip to the top.
     */
    placement?: 'above' | 'below'
    /** Sold-out state — greyed accent + "Uitverkocht" copy. */
    soldOut?: boolean
    /** Rooms left — drives the "Nog X beschikbaar" scarcity bar (omit/0 to hide). */
    roomsLeft?: number
  }>(),
  {
    starRating: 0,
    region: '',
    originalPrice: 0,
    discountPercentage: 0,
    nights: 0,
    placement: 'above',
    soldOut: false,
    roomsLeft: 0,
  },
)

/** Scarcity bar only shows when not sold out and rooms-left is supplied. */
const showScarcity = computed(() => !props.soldOut && props.roomsLeft > 0)

/** Top + bottom copy lines (mirrors the production card's split). */
const dealsLabel = computed(() => {
  if (props.soldOut) {
    return { top: 'Uitverkocht voor', bottom: 'jouw datum' }
  }
  if (props.nights) {
    return { top: 'Arrangement voor', bottom: nightsLabel(props.nights) }
  }
  // Fall back to a location line when no nights are supplied.
  return {
    top: props.city,
    bottom: props.region || '',
  }
})
</script>

<style scoped>
.map-preview {
  position: relative;
  width: 296px;
  /* Flex column so __box can use `flex: 1` and pass a definite height down
     to the image (which uses `align-self: stretch`). */
  display: flex;
  flex-direction: column;
  min-height: 140px;
  filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.18));
}

/* Build the card as a plain white rectangle next to a 4 px coloured strip,
   then clip the assembly with rounded corners via this single mask box. */
.map-preview__box {
  display: flex;
  flex-direction: column;
  flex: 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.map-preview__band {
  flex: 0 0 4px;
  background: var(--color-primary);
}

.map-preview__inner {
  flex: 1;
  display: flex;
  background: var(--color-surface);
}

/* Flipped (card rendered below the pin): band moves below the inner. */
.map-preview--flipped .map-preview__box {
  flex-direction: column-reverse;
}

/* Sold-out variant: grey accent. */
.map-preview--soldOut .map-preview__band {
  background: var(--color-border);
}

.map-preview__image {
  display: block;
  width: 80px;
  height: auto;
  align-self: stretch;
  min-height: 0;
  flex-shrink: 0;
  object-fit: cover;
}

.map-preview__body {
  flex: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.map-preview__title {
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

.map-preview__stars {
  color: var(--color-text-primary);
  font-size: 13px;
  letter-spacing: 1px;
  line-height: 1;
  margin-top: 4px;
}

.map-preview__deals {
  display: flex;
  flex-direction: column;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  margin: 4px 0 0;
  color: var(--color-primary);
  line-height: 1.25;
}

.map-preview__deals-top,
.map-preview__deals-bottom {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.map-preview--soldOut .map-preview__deals {
  color: var(--color-error);
}

/* Scarcity layer — full-width dark bar at the bottom of the card. Rounded
   bottom corners inherited from the box's `overflow: hidden` + radius. */
.map-preview__scarcity {
  width: 100%;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  background: var(--color-dark);
  color: #fff;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  white-space: nowrap;
}

.map-preview__footer {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.map-preview__discount {
  background: var(--color-dark);
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
  letter-spacing: 0.3px;
}

.map-preview--soldOut .map-preview__discount {
  background: var(--color-text-muted);
}

.map-preview__price-block {
  display: flex;
  align-items: baseline;
  gap: 4px;
  color: var(--color-text-primary);
  position: relative;
}

.map-preview--soldOut .map-preview__price-block {
  color: var(--color-text-muted);
}

.map-preview__persons {
  align-self: center;
  color: var(--color-text-primary);
  flex-shrink: 0;
}

.map-preview--soldOut .map-preview__persons {
  color: var(--color-text-muted);
}

.map-preview__price-from {
  font-size: 11px;
  font-style: italic;
  color: var(--color-text-secondary);
}

.map-preview__price-final {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
}

.map-preview__price-old {
  position: absolute;
  right: 0;
  top: -14px;
  font-size: 11px;
  text-decoration: line-through;
  color: var(--color-error);
}

.map-preview--soldOut .map-preview__price-old {
  color: var(--color-text-muted);
}

/* Tail / "beltje" — a square rotated 45°, inheriting the card's surface
   fill so the seam disappears against the body. Default: bottom-centre,
   pointing down toward the pin. Flipped: top-centre, pointing up. */
.map-preview__tail {
  position: absolute;
  left: 50%;
  width: 14px;
  height: 14px;
  background: var(--color-surface);
  bottom: -7px;
  transform: translateX(-50%) rotate(45deg);
}

/* When placed below the pin, the tail flips to the top edge. */
.map-preview--flipped .map-preview__tail {
  bottom: auto;
  top: -7px;
}

/* With the scarcity bar shown, the tail sits against the dark bar
   (bottom by default, top when flipped) — match its colour. */
.map-preview--scarcity .map-preview__tail {
  background: var(--color-dark);
}
/* Flipped + scarcity: the dark bar is now at the TOP (column-reverse), so
   the top tail still meets the bar; but the bottom band is the coloured
   strip, so a top tail against the bar stays dark — handled above. */
</style>
