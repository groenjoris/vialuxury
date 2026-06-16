<!--
  FilterPills — Active-filter tag row.

  Renders a wrapping row of removable filter chips. Each chip shows a label
  and a × button; clicking it emits `remove(id)`. A trailing text-link
  ("Verwijder filters" by default) emits `clear`. The whole row hides
  itself when there are no pills.

  Props:
    - pills: { id: string; label: string }[]  — active filters to show.
    - resetLabel?: string                      — clear-link text.
                                                 Default 'Verwijder filters'.

  Events:
    - remove(id: string)  — a single chip's × was clicked.
    - clear               — the reset link was clicked.

  Fully decoupled: owns no filter state.
-->
<template>
  <div class="filter-pills" :class="{ 'filter-pills--empty': pills.length === 0 }">
    <button
      v-for="pill in pills"
      :key="pill.id"
      type="button"
      class="filter-pills__pill"
      @click="$emit('remove', pill.id)"
    >
      <span class="filter-pills__label">{{ pill.label }}</span>
      <svg class="filter-pills__close" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
    <button
      v-if="pills.length > 0"
      type="button"
      class="filter-pills__pill filter-pills__pill--reset"
      @click="$emit('clear')"
    >
      <span class="filter-pills__label">{{ resetLabel }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface FilterPill { id: string; label: string }

withDefaults(defineProps<{
  pills: FilterPill[]
  resetLabel?: string
}>(), {
  resetLabel: 'Verwijder filters',
})

defineEmits<{
  remove: [id: string]
  clear: []
}>()
</script>

<style scoped>
.filter-pills {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  align-items: flex-start;
  gap: 8px;
}
.filter-pills--empty { display: none; }

.filter-pills__pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px 0 12px;
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

.filter-pills__pill:hover {
  background: var(--color-border-light);
  border-color: var(--color-border);
}

.filter-pills__close {
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

/* "Verwijder filters" is a plain text link, not a chip. */
.filter-pills__pill--reset {
  background: none;
  border: 0;
  border-radius: 0;
  padding: 0 2px;
  height: 32px;
  color: var(--color-text-link);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color var(--transition-fast);
}
.filter-pills__pill--reset:hover {
  background: none;
  border-color: transparent;
  color: var(--color-primary-hover);
}
</style>
