<template>
  <button class="travel-trigger" @click="store.openTravelGroupModal()">
    <span class="travel-trigger__icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    </span>
    <span class="travel-trigger__text">{{ store.travelGroupSummary }}</span>
    <span class="travel-trigger__edit">{{ t('common.edit') }}</span>
  </button>
</template>

<script setup lang="ts">
import { useDealStore } from '~/stores/deal'

const { t } = useI18n()
const store = useDealStore()
</script>

<style scoped>
.travel-trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 14px;
  color: var(--color-text-primary);
}

.travel-trigger:hover {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}

.travel-trigger__icon {
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
}

.travel-trigger__text {
  font-weight: 500;
}

.travel-trigger__edit {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 13px;
  margin-left: var(--space-xs);
}
</style>
