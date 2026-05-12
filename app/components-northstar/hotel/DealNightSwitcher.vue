<template>
  <div class="night-switcher">
    <span class="night-switcher__label">{{ t('deal.chooseStay') }}</span>
    <div class="night-switcher__tabs" role="tablist">
      <button
        v-for="variant in store.dealVariants"
        :key="variant.id"
        class="night-switcher__tab"
        :class="{
          'night-switcher__tab--active': variant.id === store.currentDeal?.id,
          'night-switcher__tab--unavailable': !variant.available,
        }"
        role="tab"
        :aria-selected="variant.id === store.currentDeal?.id"
        :disabled="!variant.available"
        @click="switchToVariant(variant)"
      >
        <span class="night-switcher__nights">{{ localized(variant.label) }}</span>
        <span class="night-switcher__price">
          <span class="night-switcher__price-from">{{ t('common.from') }}</span>
          {{ formatPrice(variant.basePrice) }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNorthstarDealStore } from '~/stores-northstar/deal'
import { formatPrice } from '~/utils-northstar/formatPrice'
import type { DealVariant } from '~/types/deal'

const { t, localized } = useNorthstarI18n()
const store = useNorthstarDealStore()

const emit = defineEmits<{
  (e: 'switch', dealId: string): void
}>()

function switchToVariant(variant: DealVariant) {
  if (!variant.available) return
  emit('switch', variant.id)
}
</script>

<style scoped>
.night-switcher {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.night-switcher__label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.night-switcher__tabs {
  display: flex;
  gap: var(--space-sm);
}

.night-switcher__tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 12px 16px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.night-switcher__tab:hover:not(:disabled) {
  border-color: var(--color-primary);
}

.night-switcher__tab--active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.night-switcher__tab--unavailable {
  opacity: 0.4;
  cursor: not-allowed;
}

.night-switcher__nights {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.night-switcher__price {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.night-switcher__price-from {
  font-size: 11px;
  color: var(--color-text-muted);
}

.night-switcher__tab--active .night-switcher__nights {
  color: var(--color-primary-hover);
}
</style>
