<template>
  <Teleport to="body">
    <Transition name="panel">
      <div v-if="isOpen" class="panel-overlay" @click.self="$emit('close')">
        <aside class="panel">
          <div class="panel__header">
            <h2 class="panel__title">{{ t('deal.availableArrangements') }}</h2>
            <p class="panel__subtitle">{{ hotelName }}</p>
            <button class="panel__close" @click="$emit('close')" :aria-label="t('common.close')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="panel__body">
            <div
              v-for="variant in variants"
              :key="variant.id"
              class="package-card"
              :class="{ 'package-card--active': variant.id === currentDealId }"
            >
              <div class="package-card__header">
                <span class="package-card__nights">{{ variant.nights }} {{ t('common.nights') }}</span>
                <div class="package-card__pricing">
                  <span class="package-card__discount">-{{ discountPercentage }}%</span>
                  <span class="package-card__price">{{ formatPrice(variant.basePrice) }}</span>
                  <span class="package-card__original">{{ formatPrice(variant.originalPrice) }}</span>
                </div>
              </div>

              <div class="package-card__inclusions">
                <div
                  v-for="inc in getInclusions(variant.id)"
                  :key="localized(inc)"
                  class="package-card__inc"
                >
                  <span class="package-card__check">✓</span>
                  <span>{{ localized(inc) }}</span>
                </div>
              </div>

              <button
                v-if="variant.id !== currentDealId"
                class="btn btn-primary package-card__btn"
                @click="$emit('select', variant.id)"
              >
                {{ t('deal.selectArrangement') }}
              </button>
              <div v-else class="package-card__current">
                <span class="package-card__current-badge">{{ t('deal.currentArrangement') }}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { DealVariant } from '~/types/deal'
import { formatPrice } from '~/utils/formatPrice'

const { t, localized } = useI18n()

const props = defineProps<{
  isOpen: boolean
  variants: DealVariant[]
  currentDealId: string
  hotelName: string
  discountPercentage: number
  inclusionsMap: Record<string, string[]>
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'select', dealId: string): void
}>()

function getInclusions(dealId: string): string[] {
  return props.inclusionsMap[dealId] || []
}
</script>

<style scoped>
.panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.panel {
  width: 420px;
  max-width: 90vw;
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
}

.panel__title {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 2px;
}

.panel__subtitle {
  font-size: 14px;
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

.panel__body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

/* Package card */
.package-card {
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  transition: all var(--transition-fast);
}

.package-card:hover {
  border-color: var(--color-primary);
}

.package-card--active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.package-card__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.package-card__nights {
  font-size: 18px;
  font-weight: 700;
  font-family: var(--font-heading);
}

.package-card__pricing {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.package-card__discount {
  background: var(--color-discount-light);
  color: var(--color-discount);
  font-size: 12px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.package-card__price {
  font-size: 20px;
  font-weight: 700;
  font-family: var(--font-heading);
}

.package-card__original {
  font-size: 14px;
  color: var(--color-text-muted);
  text-decoration: line-through;
}

.package-card__inclusions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: var(--space-md);
}

.package-card__inc {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.package-card__check {
  color: var(--color-discount);
  font-weight: 700;
  flex-shrink: 0;
}

.package-card__btn {
  width: 100%;
  padding: 10px;
  font-size: 14px;
}

.package-card__current {
  text-align: center;
}

.package-card__current-badge {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
}

/* Transitions */
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
