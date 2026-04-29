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
                <span class="panel__score">{{ hotel.reviewScore.toFixed(1) }}</span>
                <span class="panel__score-label">{{ t(getReviewLabelKey(hotel.reviewScore)) }}</span>
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
            <!-- Arrival date bar -->
            <div v-if="arrivalDate" class="panel__arrival-bar">
              <span>{{ t('sidebar.forArrival') }} {{ formatDisplayDate(arrivalDate) }}</span>
              <button class="panel__arrival-clear" @click="clearArrivalDate">{{ t('sidebar.clear') }}</button>
            </div>

            <div class="panel__deal-list">
              <DealCard
                v-for="deal in sortedSiblingDeals"
                :key="deal.id"
                :deal="deal"
                :hotel="hotel"
                hide-hotel-info
                hide-labels
                grid-mode
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
import { getReviewLabelKey } from '~/utils/reviewLabel'

const { t } = useI18n()
const { arrivalDate, clearArrivalDate } = useSearchState()

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

/** Side-panel deals sorted by basePrice ascending (cheapest first). */
const sortedSiblingDeals = computed(() => {
  if (!props.hotel) return []
  return [...props.hotel.deals].sort((a, b) => a.basePrice - b.basePrice)
})

function formatDisplayDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-')
  return `${d}-${m}-${y}`
}

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
  padding-right: 40px; /* leave room for the close button */
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
  text-overflow: ellipsis;
  white-space: nowrap;
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
  top: var(--space-lg);
  right: var(--space-lg);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--color-background-secondary);
  display: flex;
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
