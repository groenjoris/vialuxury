<template>
  <Teleport to="body">
    <Transition name="mapcard">
      <section
        v-if="isOpen && hotel"
        class="mapcard"
        role="dialog"
        aria-label="Hotel"
        @click.stop
        @touchmove.stop
      >
        <!-- Part 1 — hotel info: photo + name + stars -->
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <!-- Part 2 — horizontal carousel of small deal cards -->
        <div class="mapcard__rail" data-scroll-lock-allow="true">
          <article
            v-for="d in dealViews"
            :key="d.deal.id"
            class="mdeal"
            :class="{ 'mdeal--sold-out': d.soldOut }"
          >
            <p class="mdeal__title">
              Arrangement voor {{ nightsLabel(d.deal.nights, locale as 'nl' | 'en' | 'de') }}
            </p>

            <FirstReleaseStickyPriceRow
              class="mdeal__price"
              :lead="''"
              :lead-is-chip="false"
              :original="d.originalPrice > d.price ? formatPrice(d.originalPrice) : ''"
              :amount="formatPrice(d.price)"
              :show-info="true"
              info-variant="card"
            />

            <!-- Scarcity (≤ 5 rooms) — only when NOT sold out. -->
            <p v-if="!d.soldOut && d.roomsLeft <= 5" class="mdeal__scarcity">
              {{ t('mapCard.roomsLeft').replace('{n}', String(d.roomsLeft)) }}
            </p>

            <!-- Includes (first 2) OR sold-out notice. -->
            <p v-if="d.soldOut" class="mdeal__soldout">
              {{ t('mapCard.soldOutForDates') }}
            </p>
            <ul v-else class="mdeal__includes">
              <li v-for="(inc, i) in d.includes" :key="i">
                <span class="mdeal__check">✓</span>
                <span class="mdeal__inc-text">{{ inc }}</span>
              </li>
            </ul>

            <NuxtLink :to="d.href" class="mdeal__btn" :class="{ 'mdeal__btn--text': d.soldOut }">
              <template v-if="d.soldOut">{{ t('mapCard.seeAvailableDates') }}</template>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
              </svg>
            </NuxtLink>
          </article>
        </div>
      </section>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { SearchHotel, SearchHotelDeal } from '~/types/searchHotel'
import { formatPrice } from '~/utils-first-release/formatPrice'
import { nightsLabel } from '~/utils-first-release/plural'
import { priceForArrival } from '~/utils-first-release/priceFormula'
import { isDealAvailableInWindow } from '~/utils-first-release/availability'

const { t, localized, locale } = useFirstReleaseI18n()
const { persons, arrivalDate, selectedFlexibility } = useFirstReleaseSearchState()

const props = defineProps<{
  isOpen: boolean
  hotel: SearchHotel | null
}>()

defineEmits<{ (e: 'close'): void }>()

/** Stable pseudo "rooms left" (1–8) per deal so the scarcity badge is
 *  deterministic across renders (no live stock field exists on the deal). */
function roomsLeftFor(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return (Math.abs(h) % 8) + 1
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
      // Sold-out cards show the deal's lowest price (ignore the date).
      const effArrival = soldOut ? null : arrivalDate.value
      return {
        deal,
        soldOut,
        price: priceForArrival(deal.basePrice, deal.id, effArrival, persons.value),
        originalPrice: priceForArrival(deal.originalPrice, deal.id, effArrival, persons.value),
        roomsLeft: roomsLeftFor(deal.id),
        includes: (deal.inclusions || []).slice(0, 2).map(i => localized(i)),
        href: hrefFor(deal),
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
  background: var(--color-surface);
  border-top-left-radius: var(--radius-lg);
  border-top-right-radius: var(--radius-lg);
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.18);
  padding: var(--space-md) 0 calc(var(--space-md) + env(safe-area-inset-bottom, 0));
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

/* ── Part 1: hotel info ── */
.mapcard__head {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: 0 var(--space-md);
  position: relative;
}
.mapcard__photo {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: var(--radius-md);
}
.mapcard__head-text {
  min-width: 0;
  flex: 1;
  padding-right: 40px; /* clear the close button */
}
.mapcard__name {
  margin: 0 0 2px;
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.mapcard__stars {
  color: var(--color-text-primary);
  font-size: 13px;
  letter-spacing: 1px;
}
.mapcard__close {
  position: absolute;
  top: 0;
  right: var(--space-md);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--color-background-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-primary);
}

/* ── Part 2: horizontal deal-card carousel ── */
.mapcard__rail {
  display: flex;
  gap: var(--space-md);
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  padding: 0 var(--space-md) 2px;
}
.mapcard__rail::-webkit-scrollbar { display: none; }

.mdeal {
  scroll-snap-align: start;
  flex: 0 0 260px;
  width: 260px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mdeal__title {
  margin: 0;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.3;
}
.mdeal__price { margin: 0; }

.mdeal__scarcity {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-discount, #d6492f);
}

.mdeal__includes {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.mdeal__includes li {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.3;
}
.mdeal__check { color: var(--color-discount); font-weight: 700; flex-shrink: 0; }
.mdeal__inc-text {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.mdeal__soldout {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.mdeal__btn {
  margin-top: auto;
  align-self: flex-end;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  min-width: 44px;
  padding: 0 14px;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: #fff;
  text-decoration: none;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
}
.mdeal__btn--text { align-self: stretch; width: 100%; }
.mdeal__btn:hover { background: var(--color-primary-hover); }

/* Greyed-out sold-out card body (button stays active). */
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
