<template>
  <section class="inclusions">
    <div class="inclusions__header">
      <h3 class="inclusions__title">
        {{ t('inclusion.inThisDealFor') }}
        <button class="inclusions__persons-link" @click="store.openTravelGroupModal()">
          {{ store.travelGroupSummary }}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        {{ t('inclusion.isIncluded') }}
      </h3>
    </div>

    <ul class="inclusions__list">
      <li
        v-for="item in deal.inclusions"
        :key="item.id"
        class="inclusions__item"
        :class="{ 'inclusions__item--highlight': item.highlight }"
      >
        <span class="inclusions__check">✓</span>
        <span class="inclusions__item-title">{{ localized(item.title) }}</span>
        <span v-if="item.highlight" class="inclusions__badge">{{ t('inclusion.included') }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { useDealStore } from '~/stores/deal'
import type { Deal } from '~/types/deal'

const { t, localized } = useI18n()

defineProps<{
  deal: Deal
}>()

const store = useDealStore()
</script>

<style scoped>
.inclusions {
  padding-bottom: var(--space-lg);
}

.inclusions__header {
  margin-bottom: var(--space-md);
}

.inclusions__title {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.inclusions__persons-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  font-size: inherit;
  font-weight: 600;
  color: var(--color-text-primary);
  text-decoration: underline;
  text-decoration-color: var(--color-primary);
  text-underline-offset: 2px;
  transition: color var(--transition-fast);
}

.inclusions__persons-link:hover {
  color: var(--color-primary);
}

.inclusions__persons-link svg {
  color: var(--color-primary);
  flex-shrink: 0;
}

.inclusions__list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px var(--space-xl);
}

.inclusions__item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 14px;
  color: var(--color-text-primary);
}

.inclusions__check {
  color: var(--color-discount);
  font-weight: 700;
  flex-shrink: 0;
  font-size: 15px;
}

.inclusions__item-title {
  flex: 1;
}

.inclusions__badge {
  background: var(--color-primary-light);
  color: var(--color-primary-hover);
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  flex-shrink: 0;
}

.inclusions__item--highlight .inclusions__item-title {
  font-weight: 500;
}

@media (max-width: 640px) {
  .inclusions__list {
    grid-template-columns: 1fr;
  }
}
</style>
