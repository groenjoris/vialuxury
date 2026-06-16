<!--
  MobileSearchTrigger — Mobile search pill button.

  A white rounded-rectangle bar with a label on the left and an orange
  square search-icon button on the right. Tapping anywhere on the bar
  emits `click`; the consuming app opens its own search modal.

  Props:
    - label?: string  — left-hand placeholder text.
                        Default 'Doorzoek hotelarrangementen'.

  Events:
    - click — fired when the bar is tapped.

  Fully decoupled: holds no search state.
-->
<template>
  <button type="button" class="mobile-search-trigger" @click="$emit('click')">
    <span class="mobile-search-trigger__label">{{ label }}</span>
    <span class="mobile-search-trigger__cta" aria-label="Zoeken">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </span>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
}>(), {
  label: 'Doorzoek hotelarrangementen',
})

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.mobile-search-trigger {
  display: flex;
  align-items: stretch;
  gap: 0;
  width: 100%;
  height: 68px;
  padding: 6px 6px 6px 18px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 10px;            /* rounded rectangle, NOT pill */
  background: #fff;
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 16px;
  cursor: pointer;
  text-align: left;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.mobile-search-trigger__label {
  flex: 1;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-text-secondary);
  font-weight: 500;
  font-size: 16px;
}

.mobile-search-trigger__cta {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* Narrow square button; width matches the bar's inner height so it
     reads as a clean square. */
  height: 100%;
  width: 56px;
  padding: 0;
  border-radius: 6px;             /* rounded rectangle, NOT circle */
  background: var(--color-primary);
  color: #fff;
  transition: background var(--transition-fast);
}

.mobile-search-trigger:hover .mobile-search-trigger__cta {
  background: var(--color-primary-hover);
}
</style>
