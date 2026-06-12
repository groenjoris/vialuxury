<template>
  <span class="vl-badge" :class="`vl-badge--${variant}`">
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'score' | 'discount' | 'neutral'
  label?: string
}>(), {
  variant: 'neutral',
  label: '',
})
</script>

<style scoped>
.vl-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
}

/* Score — solid green, white text */
.vl-badge--score {
  background: var(--color-discount);
  color: #fff;
}

/* Discount — light green background, green text */
.vl-badge--discount {
  background: var(--color-discount-light);
  color: var(--color-discount);
}

/* Neutral — grey */
.vl-badge--neutral {
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
}
</style>
