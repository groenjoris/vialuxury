<template>
  <Teleport to="body">
    <Transition name="panel">
      <div v-if="isOpen && hotel" class="panel-overlay" @click.self="$emit('close')">
        <aside class="panel" @wheel.stop @touchmove.stop>
          <div class="panel__header">
            <h2 class="panel__title">Beschikbare deals</h2>
            <p class="panel__subtitle">{{ hotel.name }}</p>
            <div class="panel__hotel-meta">
              <span class="panel__stars" aria-hidden="true">
                <span v-for="n in hotel.starRating" :key="n">★</span>
              </span>
              <span class="panel__location">{{ hotel.city }}, {{ hotel.region }}</span>
            </div>
            <button class="panel__close" @click="$emit('close')" aria-label="Sluiten">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="panel__body">
            <div v-for="deal in hotel.deals" :key="deal.id" class="deal-card">
              <div class="deal-card__header">
                <span class="deal-card__nights">{{ deal.nights }} nachten</span>
                <div class="deal-card__pricing">
                  <span class="deal-card__discount">-{{ deal.discountPercentage }}%</span>
                  <span class="deal-card__price">{{ formatPrice(deal.basePrice) }}</span>
                  <span class="deal-card__original">{{ formatPrice(deal.originalPrice) }}</span>
                </div>
              </div>

              <h3 class="deal-card__title">{{ deal.title }}</h3>

              <div class="deal-card__inclusions">
                <div
                  v-for="inc in deal.inclusions"
                  :key="inc"
                  class="deal-card__inc"
                >
                  <span class="deal-card__check">✓</span>
                  <span>{{ inc }}</span>
                </div>
              </div>

              <NuxtLink
                :to="`/deal/${deal.slug}`"
                class="btn btn-primary deal-card__btn"
              >
                Bekijk arrangement
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
import type { SearchHotel } from '~/types/searchHotel'
import { formatPrice } from '~/utils/formatPrice'

const props = defineProps<{
  isOpen: boolean
  hotel: SearchHotel | null
}>()

defineEmits<{
  (e: 'close'): void
}>()

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
  font-size: 18px;
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
  font-size: 14px;
  font-weight: 600;
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
