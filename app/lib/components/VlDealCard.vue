<template>
  <article
    class="vl-deal-card"
    :class="{
      'vl-deal-card--grid': gridMode,
      'vl-deal-card--unavailable': isMismatch,
    }"
    @click="onCardClick"
  >
    <!-- Image area (top in grid, left in list). Grid mode renders a small
         carousel (up to 5 hotel photos) with prev/next arrows that fade in
         on hover. List mode + panel mode keep a single static image. -->
    <div class="vl-deal-card__image">
      <!-- Whole-photo click target → deal page (anti rage-click). Below the
           carousel arrows (z2) + favourite (z3); above the image (z1). -->
      <a
        :href="dealHref"
        class="vl-deal-card__image-link"
        :aria-label="hotel?.name || deal.title"
        @click.stop
      />
      <img :src="displayedImage" :alt="hotel?.name || deal.title" loading="lazy" />

      <!-- Grid carousel arrows (multiple gallery images, not in panel mode) -->
      <template v-if="gridMode && carouselImages.length > 1 && !panelMode">
        <button
          type="button"
          class="vl-deal-card__carousel-nav vl-deal-card__carousel-nav--prev"
          aria-label="Vorige foto"
          @click.stop.prevent="prevImage"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <button
          type="button"
          class="vl-deal-card__carousel-nav vl-deal-card__carousel-nav--next"
          aria-label="Volgende foto"
          @click.stop.prevent="nextImage"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </template>

      <!-- Discount badge — hidden in panel mode. -->
      <span
        v-if="deal.discountPercentage && !panelMode"
        class="vl-deal-card__discount-badge"
      >-{{ deal.discountPercentage }}%</span>

      <!-- Favourite heart (top-right) -->
      <button
        type="button"
        class="vl-deal-card__favorite"
        :class="{ 'vl-deal-card__favorite--active': isFavorite }"
        :aria-label="isFavorite ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'"
        :aria-pressed="isFavorite"
        @click.stop="$emit('favorite')"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </div>

    <!-- Content (single column in grid, two columns in list) -->
    <div class="vl-deal-card__content">
      <!-- TOP ROW — hotel name + stars on line 1, location on line 2 -->
      <div v-if="showHotelInfo && hotel" class="vl-deal-card__hotel-info">
        <a :href="`/hotel/${hotel.slug}`" class="vl-deal-card__name-link" @click.stop>
          <h3 class="vl-deal-card__name-row">
            <span class="vl-deal-card__name">{{ hotel.name }}</span>
            <span v-if="hotel.starRating" class="vl-deal-card__stars" aria-hidden="true">
              <span v-for="n in hotel.starRating" :key="n">★</span>
            </span>
          </h3>
        </a>
        <div class="vl-deal-card__meta">
          <svg class="vl-deal-card__loc-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span class="vl-deal-card__location">
            <span>{{ hotel.city }}</span>
            <span v-if="hotel.region" class="vl-deal-card__location-region">, {{ hotel.region }}</span>
          </span>
        </div>
      </div>

      <hr v-if="showHotelInfo && hotel" class="vl-deal-card__divider" />

      <!-- Deal pitch (4-line clamp) -->
      <h2 class="vl-deal-card__pitch">{{ deal.title }}</h2>

      <!-- BODY ROW — column in grid; main-col + right-col in list -->
      <div class="vl-deal-card__body-row">
        <div class="vl-deal-card__main-col">
          <div class="vl-deal-card__includes" :class="{ 'vl-deal-card__includes--full': fullInclusions && fullInclusions.length }">
            <div class="vl-deal-card__includes-list">
              <span v-for="item in includesBullets" :key="item" class="vl-deal-card__include">
                <span class="vl-deal-card__check">✓</span>
                <span class="vl-deal-card__include-text">{{ item }}</span>
              </span>
            </div>
          </div>

          <!-- GRID ONLY: meta + price-row inline below includes -->
          <div v-if="gridMode" class="vl-deal-card__grid-bottom">
            <div v-if="mismatchMessages && mismatchMessages.length" class="vl-deal-card__mismatch-messages">
              <p v-for="msg in mismatchMessages" :key="msg" class="vl-deal-card__mismatch-msg">{{ msg }}</p>
            </div>

            <div class="vl-deal-card__grid-price-row">
              <p class="vl-deal-card__meta-line">{{ personsLabel(pricedPersons) }}, {{ nightsLabel(deal.nights) }}</p>
              <p class="vl-deal-card__price-line">
                <span class="vl-deal-card__price-prefix">Vanaf</span>
                <span class="vl-deal-card__price">{{ formatPrice(deal.basePrice) }}</span>
                <span v-if="deal.originalPrice > deal.basePrice" class="vl-deal-card__original">{{ formatPrice(deal.originalPrice) }}</span>
              </p>
              <a
                :href="dealHref"
                class="vl-deal-card__cta"
                :class="{ 'vl-deal-card__cta--two-line': dateMismatch }"
                @click.stop
              >
                <template v-if="dateMismatch">
                  <span>Beschikbare</span>
                  <span>datums</span>
                </template>
                <template v-else>Bekijk</template>
              </a>
            </div>
          </div>
        </div>

        <!-- LIST ONLY: right column with meta + price + CTA -->
        <div v-if="!gridMode" class="vl-deal-card__right-col">
          <div v-if="mismatchMessages && mismatchMessages.length" class="vl-deal-card__mismatch-messages">
            <p v-for="msg in mismatchMessages" :key="msg" class="vl-deal-card__mismatch-msg">{{ msg }}</p>
          </div>
          <p class="vl-deal-card__meta-line vl-deal-card__meta-line--small vl-deal-card__meta-line--right">
            {{ personsLabel(pricedPersons) }}, {{ nightsLabel(deal.nights) }}
          </p>
          <p class="vl-deal-card__price-line vl-deal-card__price-line--right">
            <span class="vl-deal-card__price-prefix">Vanaf</span>
            <span v-if="deal.originalPrice > deal.basePrice" class="vl-deal-card__original">{{ formatPrice(deal.originalPrice) }}</span>
            <span class="vl-deal-card__price">{{ formatPrice(deal.basePrice) }}</span>
          </p>
          <a
            :href="dealHref"
            class="vl-deal-card__cta vl-deal-card__cta--full"
            :class="{ 'vl-deal-card__cta--two-line': dateMismatch }"
            @click.stop
          >
            <template v-if="dateMismatch">
              <span>Beschikbare</span>
              <span>datums</span>
            </template>
            <template v-else>Bekijk</template>
          </a>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { formatPrice } from '~/lib/utils/formatPrice'
import { nightsLabel, personsLabel } from '~/lib/utils/plural'

interface DealCardDeal {
  id: string
  title: string
  nights: number
  basePrice: number
  originalPrice: number
  discountPercentage?: number
  inclusions: string[]
}

interface DealCardHotel {
  name: string
  slug: string
  city: string
  region?: string
  starRating?: number
  heroImage?: string
  galleryImages?: string[]
}

const props = withDefaults(
  defineProps<{
    /** The deal to render (title + inclusions are plain strings). */
    deal: DealCardDeal
    /** Optional hotel header (name, stars, location). */
    hotel?: DealCardHotel
    /** Grid layout (photo on top) vs list layout (photo on the left). */
    gridMode?: boolean
    /** Sidepanel variant: single deterministic photo, no arrows, hidden discount chip. */
    panelMode?: boolean
    /** Show every inclusion line instead of capping at 5. */
    fullInclusions?: string[]
    /** Hide the hotel header even when a hotel is supplied. */
    hideHotelInfo?: boolean
    /** Hide label overlays (reserved). */
    hideLabels?: boolean
    /** Deal's nights don't match the active duration filter (greys the card). */
    nightsMismatch?: boolean
    /** Deal can't be booked on the active date (greys the card, two-line CTA). */
    dateMismatch?: boolean
    /** Red stacked messages above the meta line. */
    mismatchMessages?: string[]
    /** Link target for the whole-card / CTA navigation. */
    dealHref?: string
    /** Party size shown in the "X personen, Y nachten" line. */
    pricedPersons?: number
    /** Favourite heart filled state. */
    isFavorite?: boolean
  }>(),
  {
    gridMode: false,
    panelMode: false,
    hideHotelInfo: false,
    hideLabels: false,
    nightsMismatch: false,
    dateMismatch: false,
    dealHref: '#',
    pricedPersons: 2,
    isFavorite: false,
  },
)

const emit = defineEmits<{
  /** Whole-card click (fires when navigation isn't on an interactive child). */
  click: []
  /** Favourite heart toggled. */
  favorite: []
}>()

const showHotelInfo = computed(() => !!props.hotel && !props.hideHotelInfo)
const isMismatch = computed(() => !!(props.dateMismatch || props.nightsMismatch))

const imageSrc = computed(() => props.hotel?.heroImage || '')

/** Up to 5 photos for the grid carousel; falls back to the hero image. */
const carouselImages = computed<string[]>(() => {
  const list = props.hotel?.galleryImages
  if (list && list.length > 0) return list.slice(0, 5)
  const hero = props.hotel?.heroImage
  return hero ? [hero] : []
})

const carouselIndex = ref(0)
function prevImage() {
  const n = carouselImages.value.length
  if (n < 2) return
  carouselIndex.value = (carouselIndex.value - 1 + n) % n
}
function nextImage() {
  const n = carouselImages.value.length
  if (n < 2) return
  carouselIndex.value = (carouselIndex.value + 1) % n
}

/** Stable hash of a string → non-negative int (for deterministic panel photo). */
function dealHash(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/** Displayed image — carousel frame normally; panel mode picks a
 *  deterministic frame per deal so adjacent cards differ. */
const displayedImage = computed(() => {
  if (props.panelMode && carouselImages.value.length > 1) {
    const i = dealHash(props.deal.id) % carouselImages.value.length
    return carouselImages.value[i] || imageSrc.value
  }
  return carouselImages.value[carouselIndex.value] || imageSrc.value
})

/** Inclusion bullet list. `fullInclusions` wins; panel mode shows all; the
 *  default caps at 5. All are de-duped case-insensitively. */
const includesBullets = computed<string[]>(() => {
  const source = (props.fullInclusions && props.fullInclusions.length > 0)
    ? props.fullInclusions
    : props.deal.inclusions
  const cap = (props.fullInclusions && props.fullInclusions.length > 0) || props.panelMode
    ? Infinity
    : 5
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of source) {
    const text = (raw || '').trim()
    if (!text) continue
    const key = text.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(text)
    if (out.length >= cap) break
  }
  return out
})

function onCardClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target.closest('a, button, [role="button"]')) return
  emit('click')
}
</script>

<style scoped>
.vl-deal-card {
  display: flex;
  width: 100%;
  min-width: 0;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: box-shadow var(--transition-fast);
  position: relative;
  cursor: pointer;
}
.vl-deal-card:hover { box-shadow: var(--shadow-hover); }

/* ===== IMAGE ===== */
.vl-deal-card__image {
  width: 280px;
  min-height: 224px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  background: var(--color-background-secondary);
}
.vl-deal-card__image-link {
  position: absolute;
  inset: 0;
  z-index: 1;
}
.vl-deal-card__image > img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Carousel arrows — fade in on hover. */
.vl-deal-card__carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  color: #1a1a1a;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
  opacity: 0;
  transition: opacity 150ms ease, background 150ms ease;
  z-index: 2;
}
.vl-deal-card__image:hover .vl-deal-card__carousel-nav { opacity: 1; }
.vl-deal-card__carousel-nav:hover { background: #fff; }
.vl-deal-card__carousel-nav--prev { left: 10px; }
.vl-deal-card__carousel-nav--next { right: 10px; }

.vl-deal-card__discount-badge {
  position: absolute;
  top: var(--space-md);
  left: var(--space-md);
  background: var(--color-dark);
  color: #fff;
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  letter-spacing: 0.5px;
  z-index: 2;
}

.vl-deal-card__favorite {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  z-index: 3;
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
.vl-deal-card__favorite:hover { background: rgba(0, 0, 0, 0.55); transform: scale(1.05); }
.vl-deal-card__favorite--active { background: rgba(255, 255, 255, 0.95); color: #e11d48; }
.vl-deal-card__favorite--active svg { fill: currentColor; }

/* ===== CONTENT ===== */
.vl-deal-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: var(--space-md);
}
.vl-deal-card__hotel-info { min-width: 0; }

.vl-deal-card__body-row {
  display: flex;
  flex: 1;
  min-width: 0;
  gap: var(--space-md);
  margin-top: var(--space-sm);
}
.vl-deal-card__main-col {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* ===== HOTEL INFO ===== */
.vl-deal-card__name-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  display: block;
}
.vl-deal-card__name-row {
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
.vl-deal-card__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.vl-deal-card__name-link:hover .vl-deal-card__name {
  text-decoration: underline;
  text-underline-offset: 2px;
}
.vl-deal-card__stars {
  color: #1a1a1a;
  font-size: 13px;
  letter-spacing: 1px;
  flex-shrink: 0;
  font-weight: 400;
}
.vl-deal-card__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
  white-space: nowrap;
  overflow: hidden;
  min-width: 0;
  font-size: 13px;
}
.vl-deal-card__loc-icon { color: var(--color-text-secondary); flex-shrink: 0; }
.vl-deal-card__location {
  color: var(--color-text-secondary);
  white-space: nowrap;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vl-deal-card__divider {
  border: none;
  border-top: 1px solid var(--color-border-light);
  margin: var(--space-sm) 0 0;
}

/* ===== DEAL PITCH ===== */
.vl-deal-card__pitch {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--color-text-primary);
  margin: var(--space-sm) 0 var(--space-sm);
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ===== INCLUDES ===== */
.vl-deal-card__includes { flex: 1; min-width: 0; }
.vl-deal-card__includes-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.vl-deal-card__include {
  font-size: 13px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.vl-deal-card__include-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.vl-deal-card__includes--full .vl-deal-card__include { align-items: flex-start; }
.vl-deal-card__includes--full .vl-deal-card__include-text {
  white-space: normal;
  text-overflow: clip;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.35;
}
.vl-deal-card__check {
  color: var(--color-discount);
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

/* ===== META + PRICE LINES ===== */
.vl-deal-card__meta-line {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}
.vl-deal-card__meta-line--small {
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.vl-deal-card__price-line {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 0;
  flex-wrap: wrap;
}
.vl-deal-card__price-prefix {
  font-size: 13px;
  color: var(--color-text-muted);
  font-style: italic;
}
.vl-deal-card__price {
  font-size: 22px;
  font-weight: 700;
  font-family: var(--font-heading);
  color: var(--color-text-primary);
}
.vl-deal-card__original {
  font-size: 13px;
  color: var(--color-error);
  text-decoration: line-through;
}

/* ===== MISMATCH MESSAGES ===== */
.vl-deal-card__mismatch-messages {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 4px;
}
.vl-deal-card__mismatch-msg {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-error, #d32f2f);
  line-height: 1.3;
  margin: 0;
}

/* ===== CTA ===== */
.vl-deal-card__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
  font-family: var(--font-body);
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
.vl-deal-card__cta:hover { background: var(--color-primary-hover); }
.vl-deal-card__cta--full { width: 100%; }
.vl-deal-card__cta--two-line {
  flex-direction: column;
  line-height: 1.15;
  padding: 10px 8px;
  font-size: 13px;
  white-space: normal;
}

/* ===== GRID price row (2 cols × 2 rows, CTA spans both) ===== */
.vl-deal-card__grid-price-row {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    "meta  cta"
    "price cta";
  grid-template-rows: auto auto;
  column-gap: var(--space-md);
  row-gap: 4px;
}
.vl-deal-card__grid-price-row > .vl-deal-card__meta-line {
  grid-area: meta;
  align-self: end;
  line-height: 1;
  margin: 0;
}
.vl-deal-card__grid-price-row > .vl-deal-card__price-line {
  grid-area: price;
  align-self: end;
  line-height: 1;
  margin: 0;
}
.vl-deal-card__grid-price-row > .vl-deal-card__cta {
  grid-area: cta;
  align-self: end;
}

/* ===== GREYED-OUT (mismatch) ===== */
.vl-deal-card--unavailable .vl-deal-card__pitch,
.vl-deal-card--unavailable .vl-deal-card__meta-line,
.vl-deal-card--unavailable .vl-deal-card__price-line,
.vl-deal-card--unavailable .vl-deal-card__price,
.vl-deal-card--unavailable .vl-deal-card__price-prefix,
.vl-deal-card--unavailable .vl-deal-card__includes-list,
.vl-deal-card--unavailable .vl-deal-card__include {
  color: var(--color-text-muted);
}
.vl-deal-card--unavailable .vl-deal-card__check {
  color: var(--color-border);
}

/* ===== LIST right column ===== */
.vl-deal-card__right-col {
  width: 180px;
  flex-shrink: 0;
  padding: var(--space-md) 0 0 var(--space-md);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: stretch;
  gap: 4px;
}
.vl-deal-card__right-col > * { align-self: flex-end; }
.vl-deal-card__meta-line--right { width: 100%; text-align: right; }
.vl-deal-card__price-line--right { justify-content: flex-end; }

/* ===== GRID stacked bottom ===== */
.vl-deal-card__grid-bottom {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: auto;
  padding-top: var(--space-md);
}
.vl-deal-card__grid-bottom .vl-deal-card__grid-price-row { margin-top: -4px; }

/* ===== GRID MODE ===== */
.vl-deal-card--grid { flex-direction: column; }
.vl-deal-card--grid .vl-deal-card__image {
  width: 100%;
  min-height: 224px;
  max-height: 224px;
}

/* ===== Mobile ===== */
@media (max-width: 800px) {
  .vl-deal-card__pitch { font-size: 19px; }
  .vl-deal-card__include { font-size: 15px; }
  .vl-deal-card__cta { padding: 11px 24px; }
}
</style>
