<template>
  <article
    class="deal-card-v2"
    :class="{
      'deal-card-v2--grid': gridMode,
      'deal-card-v2--has-bar': hasBar,
      'deal-card-v2--wide': wide,
    }"
  >
    <!-- Image area (top in grid, left in list) -->
    <div class="deal-card-v2__image">
      <img :src="imageSrc" :alt="hotel?.name || localized(deal.title)" loading="lazy" />
      <span v-if="deal.discountPercentage" class="deal-card-v2__discount-badge">
        -{{ deal.discountPercentage }}%
      </span>
      <div v-if="hotel?.labels && hotel.labels.length && !hideLabels" class="deal-card-v2__labels">
        <img
          v-for="label in hotel.labels"
          :key="label"
          :src="`/images/labels/${labelFile(label)}`"
          :alt="label"
          class="deal-card-v2__label"
          loading="lazy"
        />
      </div>
      <button
        type="button"
        class="deal-card-v2__favorite"
        :class="{ 'deal-card-v2__favorite--active': isFavorite }"
        :aria-label="isFavorite ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'"
        :aria-pressed="isFavorite"
        @click.stop="isFavorite = !isFavorite"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </div>

    <!-- Content (single column in grid, two columns in list) -->
    <!-- Content: column flex with top hotel-row + full-width divider + body-row -->
    <div class="deal-card-v2__content">
      <!-- TOP ROW — full content width: hotel name + stars on line 1,
           score + label + location on line 2 -->
      <div v-if="showHotelInfo && hotel" class="deal-card-v2__hotel-info">
        <NuxtLink :to="`/hotel/${hotel.slug}`" target="_blank" class="deal-card-v2__name-link" @click.stop>
          <h3 class="deal-card-v2__name-row">
            <span class="deal-card-v2__name">{{ hotel.name }}</span>
            <span class="deal-card-v2__stars" aria-hidden="true">
              <span v-for="n in hotel.starRating" :key="n">★</span>
            </span>
          </h3>
        </NuxtLink>
        <div ref="metaEl" class="deal-card-v2__meta">
          <span class="deal-card-v2__score">{{ hotel.reviewScore.toFixed(1) }}</span>
          <span class="deal-card-v2__score-label">{{ t(getReviewLabelKey(hotel.reviewScore)) }}</span>
          <span class="deal-card-v2__sep" aria-hidden="true">|</span>
          <svg class="deal-card-v2__loc-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span class="deal-card-v2__location">
            <span>{{ hotel.city }}</span>
            <span v-if="!hideRegion" class="deal-card-v2__location-region">, {{ hotel.region }}</span>
          </span>
        </div>
      </div>

      <!-- Full-width divider (spans both cols in list view) -->
      <hr v-if="showHotelInfo && hotel" class="deal-card-v2__divider" />

      <!-- Deal pitch (full content width — spans both cols in list) -->
      <h2 class="deal-card-v2__pitch">{{ localized(deal.title) }}</h2>

      <!-- BODY ROW — column in grid; main-col + right-col in list -->
      <div class="deal-card-v2__body-row">
        <div class="deal-card-v2__main-col">
          <div class="deal-card-v2__includes" :class="{ 'deal-card-v2__includes--full': fullInclusions && fullInclusions.length }">
            <div class="deal-card-v2__includes-list">
              <span v-for="item in includesBullets" :key="item" class="deal-card-v2__include">
                <span class="deal-card-v2__check">✓</span>
                <span class="deal-card-v2__include-text">{{ item }}</span>
              </span>
            </div>
          </div>

          <!-- GRID ONLY: meta + price-row inline below includes -->
          <div v-if="gridMode" class="deal-card-v2__grid-bottom">
            <template v-if="unavailable">
              <p class="deal-card-v2__unavailable">Niet beschikbaar voor jouw zoekopdracht</p>
            </template>
            <template v-else>
              <p class="deal-card-v2__meta-line">{{ persons }} {{ persons === 1 ? 'persoon' : 'personen' }}, {{ deal.nights }} {{ deal.nights === 1 ? 'nacht' : 'nachten' }}</p>
              <div class="deal-card-v2__grid-price-row">
                <p class="deal-card-v2__price-line">
                  <span class="deal-card-v2__price-prefix">Vanaf</span>
                  <span class="deal-card-v2__price">{{ formatPrice(price) }}</span>
                  <span v-if="originalPrice > price" class="deal-card-v2__original">{{ formatPrice(originalPrice) }}</span>
                </p>
                <NuxtLink :to="dealHref" target="_blank" rel="noopener" class="deal-card-v2__cta">
                  Bekijk
                </NuxtLink>
              </div>
            </template>
          </div>
        </div>

        <!-- LIST ONLY: virtual right column with meta + price + CTA -->
        <div v-if="!gridMode" class="deal-card-v2__right-col">
          <template v-if="unavailable">
            <p class="deal-card-v2__unavailable">Niet beschikbaar voor jouw zoekopdracht</p>
          </template>
          <template v-else>
            <p class="deal-card-v2__meta-line deal-card-v2__meta-line--small deal-card-v2__meta-line--right">
              {{ persons }} {{ persons === 1 ? 'persoon' : 'personen' }}, {{ deal.nights }} {{ deal.nights === 1 ? 'nacht' : 'nachten' }}
            </p>
            <p class="deal-card-v2__price-line deal-card-v2__price-line--right">
              <span class="deal-card-v2__price-prefix">Vanaf</span>
              <span v-if="originalPrice > price" class="deal-card-v2__original">{{ formatPrice(originalPrice) }}</span>
              <span class="deal-card-v2__price">{{ formatPrice(price) }}</span>
            </p>
            <NuxtLink :to="dealHref" target="_blank" rel="noopener" class="deal-card-v2__cta deal-card-v2__cta--full">
              Bekijk
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>

    <!-- Sibling-deals bar — light grey, single underlined link.
         Mirrors the deal page's room-info CTA footer styling. -->
    <div v-if="hasBar" class="deal-card-v2__siblings-bar">
      <button
        v-if="hasSiblings"
        type="button"
        class="deal-card-v2__siblings-link"
        @click="$emit('view-siblings')"
      >
        Bekijk alle {{ (siblingCount ?? 0) + 1 }} arrangementen
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { SearchHotel, SearchHotelDeal } from '~/types/searchHotel'
import { formatPrice } from '~/utils/formatPrice'
import { pickSmartInclusions } from '~/utils/smartInclusions'
import { getReviewLabelKey } from '~/utils/reviewLabel'
import { priceForArrival } from '~/utils/priceFormula'

const { t, localized, locale } = useI18n()

const isFavorite = ref(false)
const { persons, arrivalDate } = useSearchState()

const props = defineProps<{
  deal: SearchHotelDeal
  hotel?: SearchHotel
  /** Number of OTHER deals on the same hotel; >0 → bottom bar shown. */
  siblingCount?: number
  gridMode?: boolean
  /** Pinned-from-deal whose deal doesn't match filters → replace price/CTA. */
  unavailable?: boolean
  /** Forced-hide hotel header (used in side panel). */
  hideHotelInfo?: boolean
  /** Hide the special-deal sticker overlays (used in side panel). */
  hideLabels?: boolean
  /** Wider card variant (filter sidebar collapsed): list image scales to 560 px. */
  wide?: boolean
  /** When set, render every line in this list (no smartInclusions cap, no
   *  dedupe-by-popularity). Wrapping is allowed so long items take 2 lines. */
  fullInclusions?: string[]
}>()

defineEmits<{ 'view-siblings': [] }>()

const metaEl = ref<HTMLElement | null>(null)
const hideRegion = ref(false)

/** When the meta line (stars + city - region) would wrap to a 2nd line in
 *  grid mode, drop the region (e.g. "Netherlands") so it stays single-line. */
function checkRegionFit() {
  if (!props.gridMode) {
    hideRegion.value = false
    return
  }
  const el = metaEl.value
  if (!el) return
  // Step 1: try with region visible.
  hideRegion.value = false
  nextTick(() => {
    const node = metaEl.value
    if (!node) return
    if (node.scrollWidth > node.clientWidth + 1) {
      hideRegion.value = true
    }
  })
}

let ro: ResizeObserver | null = null
onMounted(() => {
  checkRegionFit()
  if (typeof ResizeObserver !== 'undefined' && metaEl.value) {
    ro = new ResizeObserver(() => checkRegionFit())
    ro.observe(metaEl.value)
  }
})
onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
})

const showHotelInfo = computed(() => !!props.hotel && !props.hideHotelInfo)
const hasSiblings = computed(() => !!props.siblingCount && props.siblingCount > 0)
/** Whether to render the grey bottom bar.
 *  - Always in grid mode for regular cards (empty bar = equal-height visual)
 *  - In list mode only when there are sibling deals to link to
 *  - Never in side-panel cards (hideHotelInfo) */
const hasBar = computed(() => {
  if (hasSiblings.value) return true
  if (props.gridMode && !props.hideHotelInfo) return true
  return false
})

const imageSrc = computed(() => {
  return props.deal.heroImage || props.deal.inclusionImage || props.hotel?.heroImage || ''
})

/** Carry the arrival date through the URL so a new-tab navigation
 *  (target=_blank with rel=noopener) lands on the right month even if
 *  Chrome doesn't clone sessionStorage to the new tab. */
const dealHref = computed(() => {
  const base = `/deal/${props.deal.slug}`
  return arrivalDate.value ? `${base}?checkin=${arrivalDate.value}` : base
})

/** Card price reflects the global arrival date when set — same surcharge
 *  rule as the deal-page calendar, so the headline price on the card lines
 *  up with what the user sees in the calendar after clicking through. */
const price = computed(() =>
  priceForArrival(props.deal.basePrice, props.deal.id, arrivalDate.value, persons.value),
)
const originalPrice = computed(() =>
  priceForArrival(props.deal.originalPrice, props.deal.id, arrivalDate.value, persons.value),
)

const includesBullets = computed<string[]>(() => {
  // Caller-supplied full list wins (used on /hotel/<slug>): show everything,
  // de-duped, with no smartInclusions trimming.
  if (props.fullInclusions && props.fullInclusions.length > 0) {
    const seen = new Set<string>()
    const out: string[] = []
    for (const t of props.fullInclusions) {
      const text = (t || '').trim()
      if (!text) continue
      const key = text.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      out.push(text)
    }
    return out
  }
  const dealInc = props.deal.inclusions
  const allInc = props.hotel?.deals.map(d => d.inclusions) ?? [dealInc]
  // Up to 5 unique inclusions. The picker cycles to pad when fewer unique
  // items exist; we dedupe afterwards so we never repeat the same text.
  const picks = pickSmartInclusions(dealInc, allInc, locale.value as 'nl' | 'en', 5)
  const seen = new Set<string>()
  const out: string[] = []
  for (const p of picks) {
    const text = localized(p).trim()
    if (!text) continue
    const key = text.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(text)
    if (out.length >= 5) break
  }
  return out
})

const LABEL_FILES: Record<string, string> = {
  'wellness': 'WELLNESS.svg',
  'spa-kamer': 'spa kamer.svg',
  'super-deal': 'super deal.svg',
  'exclusief': 'exclusief.svg',
  'last-minute': 'last minute.svg',
  'nieuw': 'nieuw.svg',
}
function labelFile(label: string): string {
  return LABEL_FILES[label] || `${label}.svg`
}
</script>

<style scoped>
.deal-card-v2 {
  display: flex;
  width: 100%;
  min-width: 0;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: box-shadow var(--transition-fast);
  position: relative;
}

.deal-card-v2:hover {
  box-shadow: var(--shadow-hover);
}

/* ===== IMAGE ===== */
.deal-card-v2__image {
  width: 280px;
  min-height: 224px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  background: var(--color-background-secondary);
}

/* List view, WIDE variant (filter sidebar hidden): image at double width
   (560 px) for both bar and no-bar cards. Default list keeps 280 px.
   Height follows the card (default flex stretch) so the image fills the
   full card height, no awkward gap below. */
.deal-card-v2--wide:not(.deal-card-v2--grid) .deal-card-v2__image {
  width: 560px;
}

/* List view: card height is driven by content. Each card may differ in
   height from its neighbours — that is fine. */

.deal-card-v2__image > img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.deal-card-v2__labels {
  position: absolute;
  left: var(--space-md);
  bottom: var(--space-md);
  display: flex;
  gap: 6px;
  z-index: 2;
  pointer-events: none;
}

.deal-card-v2__label {
  height: 36px; /* 80% of 45 */
  width: auto;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35));
}

.deal-card-v2__discount-badge {
  position: absolute;
  top: var(--space-md);
  left: var(--space-md);
  background: #1A1A1A;
  color: #fff;
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  letter-spacing: 0.5px;
}

.deal-card-v2__favorite {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
}

.deal-card-v2__favorite:hover { background: rgba(0, 0, 0, 0.55); transform: scale(1.05); }
.deal-card-v2__favorite--active { background: rgba(255, 255, 255, 0.95); color: #E11D48; }
.deal-card-v2__favorite--active svg { fill: currentColor; }

/* ===== CONTENT ===== */
.deal-card-v2__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: var(--space-md);
}

/* Hotel info section: line 1 = name + stars, line 2 = score + label + loc */
.deal-card-v2__hotel-info {
  min-width: 0;
}

/* Body row: in grid → just main-col (full width).
   In list → main-col + right-col side-by-side. */
.deal-card-v2__body-row {
  display: flex;
  flex: 1;
  min-width: 0;
  gap: var(--space-md);
  margin-top: var(--space-sm);
}

.deal-card-v2__main-col {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* ===== HOTEL INFO ===== */
.deal-card-v2__name-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  display: block;
}

/* Line 1: hotel name + stars on the same line */
.deal-card-v2__name-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 0 0 4px;
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.3;
  min-width: 0;
}

.deal-card-v2__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.deal-card-v2__name-link:hover .deal-card-v2__name {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.deal-card-v2__stars {
  color: #1A1A1A;
  font-size: 13px;
  letter-spacing: 1px;
  flex-shrink: 0;
  font-weight: 400;
}

/* Line 2: review badge + label | map-pin + location */
.deal-card-v2__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
  white-space: nowrap;
  overflow: hidden;
  min-width: 0;
  font-size: 13px;
}

.deal-card-v2__score {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: #00B67A;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.deal-card-v2__score-label {
  font-weight: 600;
  color: var(--color-text-primary);
}

.deal-card-v2__sep {
  color: var(--color-text-muted);
}

.deal-card-v2__loc-icon {
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.deal-card-v2__location {
  color: var(--color-text-secondary);
  white-space: nowrap;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Divider between hotel info and deal pitch */
.deal-card-v2__divider {
  border: none;
  border-top: 1px solid var(--color-border-light);
  margin: var(--space-sm) 0 0;
}

/* Divider spans the full content width — no extra right inset. */

/* ===== DEAL PITCH ===== */
.deal-card-v2__pitch {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--color-text-primary);
  /* Tighter bottom margin so the includes sit closer to the title */
  margin: var(--space-sm) 0 var(--space-sm);
}

/* ===== INCLUDES ===== */
.deal-card-v2__includes {
  flex: 1;
  min-width: 0;
}

.deal-card-v2__includes-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.deal-card-v2__include {
  font-size: 13px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.deal-card-v2__include-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

/* Full-list mode (hotel page): allow each include to wrap to 2 lines. */
.deal-card-v2__includes--full .deal-card-v2__include {
  align-items: flex-start;
}

.deal-card-v2__includes--full .deal-card-v2__include-text {
  white-space: normal;
  text-overflow: clip;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.35;
}

.deal-card-v2__check {
  color: var(--color-discount);
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}


/* ===== META + PRICE LINES ===== */
.deal-card-v2__meta-line {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.deal-card-v2__meta-line--small {
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.deal-card-v2__price-line {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 0;
  flex-wrap: wrap;
}

.deal-card-v2__price-prefix {
  font-size: 13px;
  color: var(--color-text-muted);
  font-style: italic;
}

.deal-card-v2__price {
  font-size: 22px;
  font-weight: 700;
  font-family: var(--font-heading);
  color: var(--color-text-primary);
}

.deal-card-v2__original {
  font-size: 13px;
  color: var(--color-error);
  text-decoration: line-through;
}

/* ===== CTA ===== */
.deal-card-v2__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 24px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-decoration: none;
  transition: background var(--transition-fast);
}

.deal-card-v2__cta:hover { background: var(--color-primary-hover); }

.deal-card-v2__cta--full {
  width: 100%;
}

/* Grid price row: price left, CTA right.
   Use baseline so the price text aligns visually with the CTA text,
   not the CTA's outer box bottom (which has 8 px button padding). */
.deal-card-v2__grid-price-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-md);
}

.deal-card-v2__unavailable {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-muted, #999);
  margin: 0;
  line-height: 1.4;
}

/* ===== LIST: virtual 180 px right column ===== */
.deal-card-v2__right-col {
  width: 180px;
  flex-shrink: 0;
  /* Right edge sits flush with the content padding (16 px from card right);
     no extra padding inside this column. */
  padding: var(--space-md) 0 0 var(--space-md);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: stretch;
  /* Tight, uniform gap — meta↔price = price↔button */
  gap: 4px;
}

/* Right-col children: stacked and right-aligned at the bottom */
.deal-card-v2__right-col > * { align-self: flex-end; }
.deal-card-v2__right-col {
  align-items: stretch;
  justify-content: flex-end;
  gap: 4px;
}

.deal-card-v2__meta-line--right { width: 100%; text-align: right; }
.deal-card-v2__price-line--right { justify-content: flex-end; }
.deal-card-v2__original--right { display: block; }

/* ===== GRID-only stacked bottom =====
   `margin-top: auto` pushes the bottom block flush to the card's bottom so
   shorter content shows the slack between the includes and the persons line,
   not below the CTA. */
.deal-card-v2__grid-bottom {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: auto;
  padding-top: var(--space-md);
}

/* Pull the persons/nights line 4 px closer to the price row. */
.deal-card-v2__grid-bottom .deal-card-v2__grid-price-row {
  margin-top: -4px;
}

/* ===== GRID MODE ===== */
.deal-card-v2--grid {
  flex-direction: column;
}

.deal-card-v2--grid .deal-card-v2__image {
  width: 100%;
  min-height: 224px;
  max-height: 224px;
}

.deal-card-v2--grid .deal-card-v2__content {
  padding: var(--space-md);
  /* Default `.deal-card-v2__content { flex: 1 }` already lets the content
     stretch to fill the card height — we keep that on grid so the bottom
     block can dock at the bottom via `.grid-bottom { margin-top: auto }`. */
}


.deal-card-v2--grid .deal-card-v2__pitch {
  -webkit-line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ===== SIBLINGS BAR ===== */
.deal-card-v2__siblings-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 36px;
  display: flex;
  align-items: center;
  padding: 0 var(--space-md);
  background: var(--color-background-secondary);
  border-top: 1px solid var(--color-border-light);
  font-size: 13px;
  z-index: 1;
}

/* List view: bar starts to the RIGHT of the image (image fills full card height) */
.deal-card-v2:not(.deal-card-v2--grid) .deal-card-v2__siblings-bar {
  left: 280px;
  justify-content: flex-end;
}

.deal-card-v2--wide:not(.deal-card-v2--grid) .deal-card-v2__siblings-bar {
  left: 560px;
}

.deal-card-v2--grid .deal-card-v2__siblings-bar {
  justify-content: flex-end;
}

.deal-card-v2--has-bar .deal-card-v2__content {
  padding-bottom: calc(var(--space-md) + 36px);
}

.deal-card-v2__siblings-link {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.deal-card-v2__siblings-link:hover { color: var(--color-primary); }
</style>
