<template>
  <SecondReleaseMobileFullscreen :open="open" :title="t('search.filters')" :header-divider="false" @close="$emit('close')">
    <template #header-right>
      <button type="button" class="filter-subpage__reset" @click="$emit('clear')">
        <span>{{ t('filter.clearAll') }}</span>
      </button>
    </template>

    <div class="filter-subpage__body">
      <SecondReleaseSearchFilterPanel
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
  </SecondReleaseMobileFullscreen>
</template>

<script setup lang="ts">
const { t } = useSecondReleaseI18n()

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
  /* No top padding — the modal header sits directly above, so the
     first filter group starts right under it (no white gap). */
  padding: 0 var(--space-lg) var(--space-md);
}

/* "Verwijder filters" is a plain text link (matches the desktop FilterPills
   reset): no background/border, dark grey, going black on hover. */
.filter-subpage__reset {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 2px;
  background: none;
  border: 0;
  border-radius: 0;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-link);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
  transition: color var(--transition-fast);
}
.filter-subpage__reset:hover {
  color: var(--color-primary-hover);
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

/* +2 pt across every text element inside the mobile filter subpage —
   group headings, checkbox labels, count suffixes, budget chrome.
   The "Verwijder filters" reset chip and the apply button keep
   their own sizes; everything else nested under SearchFilterPanel
   inherits the bump via the `:deep()` selector. */
.filter-subpage__body :deep(.filter-panel__title) { font-size: 22px; }
.filter-subpage__body :deep(.filter-group__label) { font-size: 16px; }
.filter-subpage__body :deep(.filter-item__label),
.filter-subpage__body :deep(.filter-item__count) { font-size: 16px; }
.filter-subpage__body :deep(.filter-budget__label) { font-size: 16px; }
.filter-subpage__body :deep(.filter-budget__range) { font-size: 16px; }
.filter-subpage__body :deep(.filter-budget__persons) { font-size: 14px; }
.filter-subpage__body :deep(.filter-budget__labels) { font-size: 14px; }

/* Only ONE "Filters" title — promote the MobileFullscreen
   header title to deal-page-style 22 px, and hide the
   SearchFilterPanel's own h2 inside the body. */
:deep(.mobile-fs__title) {
  font-size: 22px;
  font-weight: 700;
}
.filter-subpage__body :deep(.filter-panel__header) {
  display: none;
}

/* The fullscreen modal IS the container — drop the inner
   filter-panel's border/radius so we don't get a "container inside
   a container" look on mobile. (The header divider is removed via
   the MobileFullscreen `:header-divider="false"` prop, since that
   header is teleported outside this component's scope.) */
.filter-subpage__body :deep(.filter-panel) {
  border: none;
  border-radius: 0;
  /* Drop the panel's own padding — the modal body supplies the
     horizontal inset and we want zero top gap. */
  padding: 0;
}
/* The first filter group (right after the hidden panel header) keeps
   its top margin/padding/border, which collapses up through the
   zero-padding body and re-creates a gap under the modal header.
   Zero it so the first group starts flush. */
.filter-subpage__body :deep(.filter-panel__header + .filter-group) {
  margin-top: 0;
  padding-top: 0;
  border-top: 0;
}
</style>
