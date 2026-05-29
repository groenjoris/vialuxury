<template>
  <FirstReleaseMobileFullscreen :open="open" :title="t('search.filters')" @close="$emit('close')">
    <template #header-right>
      <button type="button" class="filter-subpage__reset" @click="$emit('clear')">
        <svg class="filter-subpage__reset-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        </svg>
        <span>{{ t('filter.clearAll') }}</span>
      </button>
    </template>

    <div class="filter-subpage__body">
      <FirstReleaseSearchFilterPanel
        :budget-min="budgetMin"
        :budget-max="budgetMax"
        :persons="persons"
        :counts="counts"
        @update:budget-min="$emit('update:budgetMin', $event)"
        @update:budget-max="$emit('update:budgetMax', $event)"
      />
    </div>

    <template #footer>
      <button type="button" class="filter-subpage__apply" @click="$emit('apply')">
        {{ t('search.showResultsPrefix') }} {{ resultCount }} {{ t('search.showResultsSuffix') }}
      </button>
    </template>
  </FirstReleaseMobileFullscreen>
</template>

<script setup lang="ts">
const { t } = useFirstReleaseI18n()

defineProps<{
  open: boolean
  budgetMin: number
  budgetMax: number
  persons: number
  resultCount: number
  /** Optional `{ itemValue → number }` map — drives the
   *  `(N)` suffix + disabled-when-zero state in the panel. */
  counts?: Record<string, number>
}>()

defineEmits<{
  close: []
  clear: []
  apply: []
  'update:budgetMin': [val: number]
  'update:budgetMax': [val: number]
}>()
</script>

<style scoped>
.filter-subpage__body {
  padding: var(--space-md) var(--space-lg);
}

/* Mirror the desktop FilterPills reset pill — neutral grey background,
   trashcan icon + "Verwijder filters" label. */
.filter-subpage__reset {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}
.filter-subpage__reset:hover {
  background: var(--color-border-light);
  border-color: var(--color-border);
}
.filter-subpage__reset-icon {
  flex-shrink: 0;
}

.filter-subpage__apply {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  font-family: inherit;
}
.filter-subpage__apply:hover {
  background: var(--color-primary-hover);
}
</style>
