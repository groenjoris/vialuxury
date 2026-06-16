<template>
  <button
    class="btn"
    :class="[
      `btn--${variant}`,
      `btn--${size}`,
      { 'btn--full': fullWidth },
    ]"
    :type="type"
    :disabled="disabled"
    @click="onClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit'
  fullWidth?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  type: 'button',
  fullWidth: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function onClick(event: MouseEvent) {
  if (props.disabled) return
  emit('click', event)
}
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-weight: 600;
  line-height: 1.4;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background-color var(--transition-fast),
              border-color var(--transition-fast),
              color var(--transition-fast);
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sizes */
.btn--sm {
  padding: 6px 16px;
  font-size: 14px;
}

.btn--md {
  padding: 10px 24px;
  font-size: 16px;
}

.btn--lg {
  padding: 14px 32px;
  font-size: 17px;
}

.btn--full {
  width: 100%;
}

/* Primary — orange, white text */
.btn--primary {
  background-color: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.btn--primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

/* Secondary — white bg with border */
.btn--secondary {
  background-color: var(--color-background-secondary);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.btn--secondary:hover:not(:disabled) {
  background-color: var(--color-border-light);
}

/* Dark — black bg, white text */
.btn--dark {
  background-color: var(--color-dark);
  color: #fff;
  border-color: var(--color-dark);
}

.btn--dark:hover:not(:disabled) {
  background-color: #2b2b2b;
  border-color: #2b2b2b;
}
</style>
