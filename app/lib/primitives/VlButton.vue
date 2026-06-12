<template>
  <button
    class="vl-btn"
    :class="[
      `vl-btn--${variant}`,
      `vl-btn--${size}`,
      { 'vl-btn--full': fullWidth },
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
  variant?: 'primary' | 'secondary' | 'ghost'
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
.vl-btn {
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

.vl-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sizes */
.vl-btn--sm {
  padding: 6px 16px;
  font-size: 14px;
}

.vl-btn--md {
  padding: 10px 24px;
  font-size: 16px;
}

.vl-btn--lg {
  padding: 14px 32px;
  font-size: 17px;
}

.vl-btn--full {
  width: 100%;
}

/* Primary — orange, white text */
.vl-btn--primary {
  background-color: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.vl-btn--primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

/* Secondary — subtle filled with border */
.vl-btn--secondary {
  background-color: var(--color-background-secondary);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.vl-btn--secondary:hover:not(:disabled) {
  background-color: var(--color-border-light);
}

/* Ghost — transparent with border */
.vl-btn--ghost {
  background-color: transparent;
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.vl-btn--ghost:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
