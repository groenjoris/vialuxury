<template>
  <Teleport to="body">
    <Transition name="panel">
      <div v-if="isOpen && hotel" class="panel-overlay" @click.self="$emit('close')">
        <aside class="panel" @wheel.stop @touchmove.stop>
          <div class="panel__header">
            <h2 class="panel__title">{{ t('search.availableDeals') }}</h2>
            <p class="panel__subtitle">{{ hotel.name }}</p>
            <div class="panel__hotel-meta">
              <span class="panel__stars" aria-hidden="true">
                <span v-for="n in hotel.starRating" :key="n">★</span>
              </span>
              <span class="panel__location">{{ hotel.city }}, {{ hotel.region }}</span>
            </div>
            <p v-if="hotel.pitch" class="panel__pitch">{{ localized(hotel.pitch) }}</p>
            <button class="panel__close" @click="$emit('close')" :aria-label="t('common.close')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="panel__body">
            <!-- Hotel hero image -->
            <div class="panel__hero">
              <img :src="hotel.heroImage" :alt="hotel.name" class="panel__hero-img" />
            </div>
            <!-- Arrival date bar -->
            <div v-if="arrivalDate" class="panel__arrival-bar">
              <span>{{ t('sidebar.forArrival') }} {{ formatDisplayDate(arrivalDate) }}</span>
              <button class="panel__arrival-clear" @click="clearArrivalDate">{{ t('sidebar.clear') }}</button>
            </div>

            <div v-for="deal in hotel.deals" :key="deal.id" class="deal-card">
              <div class="deal-card__header">
                <span class="deal-card__nights">{{ deal.nights }} {{ deal.nights === 1 ? t('common.night') : t('common.nights') }} {{ t('common.for') }} {{ persons }} {{ persons === 1 ? t('common.personSingular') : t('common.personPlural') }}</span>
                <div class="deal-card__pricing">
                  <span class="deal-card__discount">-{{ deal.discountPercentage }}%</span>
                  <span class="deal-card__price">{{ formatPrice(adjustPrice(deal.basePrice, persons)) }}</span>
                  <span class="deal-card__original">{{ formatPrice(adjustPrice(deal.originalPrice, persons)) }}</span>
                </div>
              </div>

              <h3 class="deal-card__title">{{ localized(deal.title) }}</h3>

              <div class="deal-card__inclusions">
                <div
                  v-for="inc in getSmartInclusions(deal)"
                  :key="localized(inc)"
                  class="deal-card__inc"
                >
                  <span class="deal-card__check">✓</span>
                  <span>{{ localized(inc) }}</span>
                </div>
                <div v-if="getRemainingCount(deal) > 0" class="deal-card__inc deal-card__inc--more">
                  <span class="deal-card__check">✓</span>
                  <span>{{ getRemainingCount(deal) === 1 ? t('search.andOneMore') : t('search.andMore').replace('{n}', String(getRemainingCount(deal))) }}</span>
                </div>
              </div>

              <NuxtLink
                :to="`/deal/${deal.slug}${persons !== 2 || rooms !== 1 ? '?adults=' + persons + (rooms !== 1 ? '&rooms=' + rooms : '') : ''}`"
                target="_blank"
                class="btn btn-primary deal-card__btn"
              >
                {{ t('search.viewArrangement') }}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </NuxtLink>
            </div>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { SearchHotel, SearchHotelDeal } from '~/types/searchHotel'
import type { LocalizedString } from '~/i18n/types'
import { formatPrice } from '~/utils/formatPrice'
import { pickSmartInclusions } from '~/utils/smartInclusions'
import { mappedPackagesByPermalink } from '~/data/deals-mapper'

const { t, localized, locale } = useI18n()
const { arrivalDate, clearArrivalDate, persons, rooms } = useSearchState()

function adjustPrice(basePrice: number, p: number): number {
  if (p % 2 === 0) return Math.round(basePrice * (p / 2))
  return Math.round(basePrice * ((p + 1) / 2) - 50)
}

const props = defineProps<{
  isOpen: boolean
  hotel: SearchHotel | null
}>()

defineEmits<{
  (e: 'close'): void
}>()

// Look up the FULL Deal (with rich `inclusions[]` from `includesDetailed`) by package permalink.
// This matches what the deal-page sidebar shows under "Arrangement voor 2 personen".
function getDetailedTitles(slug: string): LocalizedString[] {
  const d = mappedPackagesByPermalink[slug]
  return d ? d.inclusions.map(i => i.title) : []
}

const allDealsInclusions = computed(() => {
  if (!props.hotel) return []
  return props.hotel.deals.map(d => getDetailedTitles(d.slug))
})

function getSmartInclusions(deal: SearchHotelDeal) {
  return pickSmartInclusions(
    getDetailedTitles(deal.slug),
    allDealsInclusions.value,
    locale.value as 'nl' | 'en',
    3,
  )
}

function getRemainingCount(deal: SearchHotelDeal) {
  // Use detailed-titles count (matches the data we now show in the smart-pick)
  const total = getDetailedTitles(deal.slug).filter(t => !/overnachting|night/i.test(t.nl || '')).length
  return Math.max(0, total - 3)
}

function formatDisplayDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-')
  return `${d}-${m}-${y}`
}

// Lock body scroll when panel is open
watch(() => props.isOpen, (open) => {
  if (open) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
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

.panel {
  width: 480px;
  max-width: 95vw;
  background: var(--color-surface);
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 30px rgba(0, 0, 0, 0.15);
}

.panel__header {
  padding: var(--space-lg) var(--space-lg) var(--space-md);
  border-bottom: 1px solid var(--color-border-light);
  position: relative;
  flex-shrink: 0;
}

.panel__title {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 2px;
}

.panel__subtitle {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
  padding-right: 40px;
}

.panel__hotel-meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.panel__stars {
  color: var(--color-star);
  font-size: 12px;
  display: flex;
  gap: 1px;
}

.panel__location {
  font-size: 13px;
  color: var(--color-text-secondary);
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
.panel__body {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: var(--space-lg);
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
