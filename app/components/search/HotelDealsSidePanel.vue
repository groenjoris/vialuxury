<template>
  <Teleport to="body">
    <Transition name="panel">
      <div
        v-if="isOpen && hotel"
        class="panel-overlay"
        :class="{ 'panel-overlay--map': mapMode }"
        @click.self="$emit('close')"
      >
        <aside class="panel" @wheel.stop @touchmove.stop>
          <div class="panel__header">
            <div class="panel__header-info">
              <h2 class="panel__name-row">
                <span class="panel__hotel-name">{{ hotel.name }}</span>
                <span class="panel__stars" aria-hidden="true">
                  <span v-for="n in hotel.starRating" :key="n">★</span>
                </span>
              </h2>
              <div class="panel__hotel-meta">
                <ViaLuxuryScoreBadge :hotel="hotel" :all-hotels="mappedHotels" />
                <span class="panel__sep" aria-hidden="true">|</span>
                <svg class="panel__loc-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span class="panel__location">{{ hotel.city }}, {{ hotel.region }}</span>
              </div>
            </div>
            <button class="panel__close" @click="$emit('close')" :aria-label="t('common.close')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="panel__body">
            <!-- Single flat list — available deals first (cheapest first),
                 unavailable-on-date deals appended at the bottom. Each
                 unavailable card carries its own "Niet beschikbaar op …"
                 status + greyed-out style + fallback price. -->
            <div class="panel__deal-list">
              <DealCard
                v-for="entry in orderedDeals"
                :key="entry.deal.id"
                :deal="entry.deal"
                :hotel="hotel"
                hide-hotel-info
                hide-labels
                grid-mode
                panel-mode
                :date-mismatch="entry.dateMismatch"
                :nights-mismatch="entry.nightsMismatch"
                :ignore-arrival="entry.dateMismatch"
              />
            </div>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { SearchHotel } from '~/types/searchHotel'
import { mappedHotels } from '~/data/deals-mapper'
import { isDealAvailableInWindow } from '~/utils/availability'

const { t } = useI18n()
// Use the *selected* (live) arrival date + flex — same source the deal
// cards use for their pricing — so the heading matches what the user just
// picked, even when they haven't re-submitted a search.
const {
  arrivalDate: activeArrivalDate,
  selectedFlexibility: activeFlexibility,
  selectedNights,
} = useSearchState()

const props = defineProps<{
  isOpen: boolean
  hotel: SearchHotel | null
  /** When true (used on /kaart): no dim background, no body-scroll lock,
   *  the rest of the page (the map) stays clickable. */
  mapMode?: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()

/** All sibling deals, cheapest first by base price. Used for both the
 *  "available" and "andere data" groups below. */
const sortedSiblingDeals = computed(() => {
  if (!props.hotel) return []
  return [...props.hotel.deals].sort((a, b) => a.basePrice - b.basePrice)
})

/** Match selected nights filter (string array; '5+' covers ≥ 5). When no
 *  nights are selected, every deal qualifies. */
function matchesNights(deal: { nights: number }): boolean {
  const ns = selectedNights.value
  if (!ns || ns.length === 0) return true
  if (ns.includes('5+') && deal.nights >= 5) return true
  return ns.includes(String(deal.nights))
}

/** A deal is "available" when it has at least one bookable date inside the
 *  flex window AND its nights match the duration filter. Without an
 *  arrival date everything is available (single-list fallback). */
function isAvailable(deal: { id: string; nights: number }): boolean {
  if (!matchesNights(deal)) return false
  if (!activeArrivalDate.value) return true
  return isDealAvailableInWindow(deal.id, activeArrivalDate.value, activeFlexibility.value)
}

const availableDeals = computed(() => sortedSiblingDeals.value.filter(isAvailable))
// Deals that fail ONLY the date filter (nights still match). Deals that
// don't match the active duration filter are hidden from the panel
// entirely — there's no point offering arrangements of the wrong length.
const unavailableDeals = computed(() =>
  sortedSiblingDeals.value.filter((d) => matchesNights(d) && !isAvailable(d)),
)

/** Per-deal mismatch flags — drives the side-panel card variant copy.
 *  - dateMismatch  : deal has no bookable date in the active flex window.
 *  - nightsMismatch: deal's nights don't match the active duration filter.
 *  Available deals have neither flag set. */
function dateMismatch(deal: { id: string }): boolean {
  if (!activeArrivalDate.value) return false
  return !isDealAvailableInWindow(deal.id, activeArrivalDate.value, activeFlexibility.value)
}
function nightsMismatch(deal: { nights: number }): boolean {
  return !matchesNights(deal)
}

const orderedDeals = computed(() => [
  ...availableDeals.value.map((deal) => ({
    deal,
    dateMismatch: false,
    nightsMismatch: false,
  })),
  ...unavailableDeals.value.map((deal) => ({
    deal,
    dateMismatch: dateMismatch(deal),
    nightsMismatch: nightsMismatch(deal),
  })),
])


// Lock body scroll when panel is open — except on /kaart where the map
// underneath needs to stay scroll/zoom-able.
watch(() => props.isOpen, (open) => {
  if (props.mapMode) return
  if (open) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  if (!props.mapMode) document.body.style.overflow = ''
})
</script>

<style scoped>
/* Overlay + panel — matches PackageSidePanel exactly */
.panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

/* Map mode: no dim, and the overlay itself doesn't capture clicks so the
   map underneath stays clickable. The panel below re-enables pointer events. */
.panel-overlay--map {
  background: transparent;
  pointer-events: none;
}

.panel-overlay--map .panel {
  pointer-events: auto;
}

.panel {
  /* 16 + 348 (deal card grid width) + 16 = 380 */
  width: 380px;
  max-width: 95vw;
  background: var(--color-surface);
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 30px rgba(0, 0, 0, 0.15);
}

.panel__header {
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-border-light);
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
}

/* Hotel thumbnail in the sticky header */
.panel__hero-thumb {
  width: 96px;
  height: 96px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: var(--radius-md);
}

.panel__header-info {
  flex: 1;
  min-width: 0;
  padding-right: 48px; /* leave room for the top-right close button (32 px + 16 px inset) */
}

/* Line 1: hotel name + stars on the same line */
.panel__name-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0 0 6px;
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
  min-width: 0;
}

.panel__hotel-name {
  min-width: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.panel__stars {
  color: var(--color-text-primary);
  font-size: 14px;
  letter-spacing: 1px;
  display: inline-flex;
  flex-shrink: 0;
  font-weight: 400;
}

/* Line 2: review badge + label | map-pin + location */
.panel__hotel-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
  white-space: nowrap;
  overflow: hidden;
  font-size: 14px;
}

.panel__score {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #00B67A;
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.panel__score-label {
  color: var(--color-text-primary);
  font-weight: 600;
}

.panel__sep {
  color: var(--color-text-muted);
}

.panel__loc-icon {
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.panel__location {
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.panel__pitch {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 400;
  color: var(--color-text-primary);
  line-height: 1.4;
  margin-top: 4px;
}

.panel__close {
  position: absolute;
  top: var(--space-md);
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

.panel__close:hover {
  background: var(--color-border);
}

/* Hotel hero image */
.panel__hero {
  height: 200px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
}

.panel__hero-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
  border-radius: var(--radius-md);
}

/* Arrival date bar */
.panel__arrival-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-background-secondary);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
}

.panel__arrival-clear {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 600;
  text-decoration: underline;
}

/* Scrollable body */
.panel__deal-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.panel__body {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

/* Deal card */
.deal-card {
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  transition: border-color var(--transition-fast);
}

.deal-card:hover {
  border-color: var(--color-primary);
}

.deal-card__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.deal-card__nights {
  font-size: 16px;
  font-weight: 700;
  font-family: var(--font-heading);
}

.deal-card__pricing {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.deal-card__discount {
  background: var(--color-discount-light);
  color: var(--color-discount);
  font-size: 12px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.deal-card__price {
  font-size: 20px;
  font-weight: 700;
  font-family: var(--font-heading);
}

.deal-card__original {
  font-size: 14px;
  color: var(--color-text-muted);
  text-decoration: line-through;
}

.deal-card__title {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 400;
  color: var(--color-text-primary);
  line-height: 1.4;
  margin-bottom: var(--space-md);
}

.deal-card__inclusions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: var(--space-md);
}

.deal-card__inc {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.deal-card__check {
  color: var(--color-discount);
  font-weight: 700;
  flex-shrink: 0;
}

.deal-card__inc--more span:last-child {
  color: var(--color-text-muted);
  font-style: italic;
}

.deal-card__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px;
  font-size: 14px;
  text-decoration: none;
}

.deal-card__btn:hover {
  color: #fff;
}

.deal-card__btn svg {
  flex-shrink: 0;
}

/* Transitions — matches PackageSidePanel */
.panel-enter-active,
.panel-leave-active {
  transition: opacity 300ms ease;
}

.panel-enter-active .panel,
.panel-leave-active .panel {
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
}

.panel-enter-from .panel,
.panel-leave-to .panel {
  transform: translateX(100%);
}
</style>
