<template>
  <MobileFullscreen :open="open" :title="t('search.filters')" @close="$emit('close')">
    <template #header-right>
      <a href="#" class="filter-subpage__clear" @click.prevent="$emit('clear')">{{ t('header.clear') }}</a>
    </template>

    <div class="filter-subpage__body">
      <SearchFilterPanel
        :budget-min="budgetMin"
        :budget-max="budgetMax"
        :persons="persons"
        @update:budget-min="$emit('update:budgetMin', $event)"
        @update:budget-max="$emit('update:budgetMax', $event)"
      />
    </div>

    <template #footer>
      <button type="button" class="filter-subpage__apply" @click="$emit('apply')">
        {{ t('search.showResultsPrefix') }} {{ resultCount }} {{ t('search.showResultsSuffix') }}
      </button>
    </template>
  </MobileFullscreen>
</template>

<script setup lang="ts">
const { t } = useI18n()

defineProps<{
  open: boolean
  budgetMin: number
  budgetMax: number
  persons: number
  resultCount: number
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

.filter-subpage__clear {
  font-size: 13px;
  color: var(--color-text-muted);
  text-decoration: underline;
  cursor: pointer;
}
.filter-subpage__clear:hover {
  color: var(--color-text-primary);
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
