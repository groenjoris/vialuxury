<template>
  <span class="badge" :class="`badge--${variant}`">
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'score' | 'dark'
  label?: string
}>(), {
  variant: 'score',
  label: '',
})
</script>

<style scoped>
.badge {
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
  color: #fff;
}

/* Score — solid green, white text */
.badge--score {
  background: var(--color-discount);
}

/* Dark — solid black, white text */
.badge--dark {
  background: var(--color-dark);
}
</style>
