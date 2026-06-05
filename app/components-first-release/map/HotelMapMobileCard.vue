<template>
  <Teleport to="body">
    <Transition name="mapcard">
      <section
        v-if="isOpen && hotel"
        ref="cardRef"
        class="mapcard"
        role="dialog"
        aria-label="Hotel"
        @click.stop
        @touchmove.stop
      >
        <!-- Orange accent bar -->
        <div class="mapcard__bar" aria-hidden="true"></div>

        <!-- Part 1 — hotel info: landscape photo + name + stars -->
        <header class="mapcard__head">
          <img
            v-if="hotel.heroImage"
            :src="hotel.heroImage"
            :alt="hotel.name"
            class="mapcard__photo"
          />
          <div class="mapcard__head-text">
            <h2 class="mapcard__name">{{ hotel.name }}</h2>
            <div class="mapcard__stars" aria-hidden="true">
              <span v-for="n in hotel.starRating" :key="n">★</span>
            </div>
          </div>
          <button
            type="button"
            class="mapcard__close"
            :aria-label="t('common.close')"
            @click="$emit('close')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <!-- Part 2 — horizontal carousel of deal cards. A single deal
             fills the full width instead of a 290px carousel card. -->
        <div
          class="mapcard__rail"
          :class="{ 'mapcard__rail--single': dealViews.length === 1 }"
          data-scroll-lock-allow="true"
        >
          <article
            v-for="d in dealViews"
            :key="d.deal.id"
            class="mdeal"
            :class="{ 'mdeal--sold-out': d.soldOut }"
          >
            <!-- First row: title + stacked price -->
            <div class="mdeal__top">
              <p class="mdeal__title">
                <span class="mdeal__lead">Arrangement</span>{{ ' ' }}<span class="mdeal__title-rest">{{ nightsLabel(d.deal.nights, locale as 'nl' | 'en' | 'de') }}, {{ personsLabel(persons, locale as 'nl' | 'en' | 'de') }}</span>
              </p>
              <div class="mdeal__price">
                <div class="mdeal__price-top">
                  <span class="mdeal__from">{{ fromLabel }}</span>
                  <span v-if="d.originalPrice > d.price" class="mdeal__original">{{ formatPrice(d.originalPrice) }}</span>
                </div>
                <div class="mdeal__price-bot">
                  <span class="mdeal__amount">{{ priceNum(d.price) }}</span>
                  <FirstReleasePriceInfoTooltip variant="card" />
                </div>
              </div>
            </div>

            <!-- Bottom row: includes (or sold-out notice) + arrow button -->
            <div class="mdeal__bottom">
              <p v-if="d.soldOut" class="mdeal__soldout">{{ t('mapCard.soldOutForDates') }}</p>
              <ul v-else class="mdeal__includes">
                <li v-for="(inc, i) in d.includes" :key="i">
                  <span class="mdeal__check" aria-hidden="true">✓</span>
                  <span class="mdeal__inc-text">{{ inc }}</span>
                </li>
              </ul>

              <NuxtLink :to="d.href" class="mdeal__btn" :class="{ 'mdeal__btn--text': d.soldOut }">
                <template v-if="d.soldOut">{{ t('mapCard.seeAvailableDates') }}</template>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
                </svg>
              </NuxtLink>
            </div>
          </article>
        </div>
      </section>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { SearchHotel, SearchHotelDeal } from '~/types/searchHotel'
import { formatPrice } from '~/utils-first-release/formatPrice'
import { nightsLabel, personsLabel } from '~/utils-first-release/plural'
import { priceForArrival } from '~/utils-first-release/priceFormula'
import { isDealAvailableInWindow } from '~/utils-first-release/availability'

const { t, localized, locale } = useFirstReleaseI18n()
const { persons, arrivalDate, selectedFlexibility } = useFirstReleaseSearchState()

const props = defineProps<{
  isOpen: boolean
  hotel: SearchHotel | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  /** Live pixel height of the open sheet (0 when closed). The kaart
   *  page uses this to slide the map up by EXACTLY this much, so the
   *  panel stays "connected" to the map with no grey gap. */
  (e: 'height', px: number): void
}>()

const cardRef = ref<HTMLElement | null>(null)
let ro: ResizeObserver | null = null

function emitHeight() {
  emit('height', props.isOpen && cardRef.value ? Math.round(cardRef.value.getBoundingClientRect().height) : 0)
}

watch(() => props.isOpen, async (open) => {
  if (open) {
    await nextTick()
    emitHeight()
    if (cardRef.value && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(emitHeight)
      ro.observe(cardRef.value)
    }
  } else {
    ro?.disconnect(); ro = null
    emit('height', 0)
  }
})
onBeforeUnmount(() => { ro?.disconnect(); ro = null })

/** Locale-aware "from price" prefix (Vanaf / From / Ab). */
const fromLabel = computed(() =>
  locale.value === 'en' ? 'From' : locale.value === 'de' ? 'Ab' : 'Vanaf',
)

/** Big final price without a currency symbol, matching the Figma
 *  ("Vanaf €614" carries the €; the large "229" does not). */
function priceNum(n: number): string {
  return new Intl.NumberFormat('nl-NL').format(Math.round(n))
}

/** Carry arrival date + group size into the deal-page link. */
function hrefFor(deal: SearchHotelDeal): string {
  const params = new URLSearchParams()
  if (arrivalDate.value) params.set('checkin', arrivalDate.value)
  if (persons.value !== 2) params.set('persons', String(persons.value))
  const q = params.toString()
  return `/first-release/deal/${deal.slug}${q ? '?' + q : ''}`
}

const dealViews = computed(() => {
  const h = props.hotel
  if (!h) return []
  return [...h.deals]
    .sort((a, b) => a.basePrice - b.basePrice)
    .map((deal) => {
      const soldOut = !!arrivalDate.value
        && !isDealAvailableInWindow(deal.id, arrivalDate.value, selectedFlexibility.value)
      const effArrival = soldOut ? null : arrivalDate.value
      // Sold-out → "beschikbare datums": land on the deal page's calendar
      // (cal=1) WITHOUT a checkin (the page applies ?checkin to the store, so
      // carrying the unavailable date would pre-select it). Empty calendar.
      let href: string
      if (soldOut) {
        const p = new URLSearchParams()
        if (persons.value !== 2) p.set('persons', String(persons.value))
        p.set('cal', '1')
        href = `/first-release/deal/${deal.slug}?${p.toString()}`
      } else {
        href = hrefFor(deal)
      }
      return {
        deal,
        soldOut,
        // Prototype: always the 2-person / 1-room price (party size doesn't scale it).
        price: priceForArrival(deal.basePrice, deal.id, effArrival, 2),
        originalPrice: priceForArrival(deal.originalPrice, deal.id, effArrival, 2),
        includes: (deal.inclusions || []).slice(0, 2).map(i => localized(i)),
        href,
      }
    })
})
</script>

<style scoped>
.mapcard {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: #fff;
  box-shadow: 0 -6px 20px rgba(0, 0, 0, 0.18);
  padding-bottom: env(safe-area-inset-bottom, 0);
  display: flex;
  flex-direction: column;
}

/* Orange accent bar across the top edge. */
.mapcard__bar {
  height: 4px;
  width: 100%;
  background: var(--color-primary);
}

/* ── Part 1: hotel info row (white) ── */
.mapcard__head {
  display: flex;
  align-items: stretch;
  gap: 10px;
  height: 80px;
  background: #fff;
  padding-right: 10px;
  position: relative;
}
.mapcard__photo {
  width: 150px;
  height: 80px;
  flex-shrink: 0;
  object-fit: cover;
}
.mapcard__head-text {
  min-width: 0;
  flex: 1;
  padding: 6px 0;
  padding-right: 28px; /* clear the close button */
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: flex-start; /* hotel name aligns to the top */
}
.mapcard__name {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 700;
  color: #1a1e1e;
  line-height: 1.175;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.mapcard__stars {
  color: var(--color-text-primary);
  font-size: 14px;
  letter-spacing: 1px;
  line-height: 1;
}
.mapcard__close {
  position: absolute;
  top: 6px;
  right: 8px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: var(--color-background-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-primary);
}

/* ── Part 2: cream rail + deal cards ── */
.mapcard__rail {
  display: flex;
  gap: 4px;
  background: #fff3ea;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  padding: 4px;
}
.mapcard__rail::-webkit-scrollbar { display: none; }

/* Single deal → fill the full width (no carousel). */
.mapcard__rail--single .mdeal {
  flex: 1 1 auto;
  width: auto;
}

.mdeal {
  scroll-snap-align: start;
  flex: 0 0 290px;
  width: 290px;
  background: #fff;
  border: 1px solid #f5f5f5;
  border-radius: 4px;
  box-shadow: 0 4px 2px rgba(0, 0, 0, 0.1);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* First row: title (left) + stacked price (right) */
.mdeal__top {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.mdeal__title {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 15px;
  line-height: 1.25;
}
.mdeal__lead {
  font-family: var(--font-heading);
  font-weight: 600;
  color: var(--color-primary);
}
.mdeal__title-rest {
  font-family: var(--font-body);
  font-weight: 700;
  color: var(--color-text-primary);
}

.mdeal__price {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.mdeal__price-top {
  display: flex;
  align-items: baseline;
  gap: 5px;
}
.mdeal__from {
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 10px;
  color: #222;
}
.mdeal__original {
  font-family: var(--font-heading);
  font-weight: 400;
  font-size: 11px;
  color: var(--color-error);
  text-decoration: line-through;
}
.mdeal__price-bot {
  display: flex;
  align-items: flex-end;
  gap: 5px;
}
.mdeal__amount {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 20px;
  line-height: 1;
  color: #222;
}
.mdeal__price-bot :deep(.price-info) { align-self: flex-end; margin-bottom: 1px; }

/* Bottom row: includes (left) + arrow button (right) */
.mdeal__bottom {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
.mdeal__includes {
  flex: 1;
  min-width: 0;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.mdeal__includes li {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-body);
  font-size: 12px;
  color: #222;
  line-height: 1.2;
}
.mdeal__check { color: var(--color-discount, #00B67A); font-weight: 700; flex-shrink: 0; }
.mdeal__inc-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.mdeal__soldout {
  flex: 1;
  margin: 0;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.mdeal__btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--color-primary);
  color: #fff;
  text-decoration: none;
}
.mdeal__btn--text {
  /* "Beschikbare datums" wraps onto 2 lines so the button stays compact and
     sits neatly beside the price info (ⓘ). Halved horizontal padding. */
  width: auto;
  max-width: 96px;
  padding: 4px 6px;
  height: auto;
  min-height: 36px;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.1;
  text-align: center;
  white-space: normal;
}
.mdeal__btn:hover { background: var(--color-primary-hover); }

.mdeal--sold-out .mdeal__title,
.mdeal--sold-out .mdeal__price { opacity: 0.6; }

/* ── Slide-up transition ── */
.mapcard-enter-active,
.mapcard-leave-active {
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
.mapcard-enter-from,
.mapcard-leave-to {
  transform: translateY(100%);
}
</style>
