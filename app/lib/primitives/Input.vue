<template>
  <input
    class="input"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :aria-label="ariaLabel"
    @input="onInput"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
  >
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  ariaLabel?: string
}>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  disabled: false,
  ariaLabel: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<style scoped>
/* Mirrors the footer newsletter field (.footer-newsletter__input):
   white fill, transparent border, no orange focus stroke. */
.input {
  width: 100%;
  height: 42px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: #fff;
  color: #1A1A1A;
  font-family: var(--font-body);
  font-size: 14px;
  transition: border-color var(--transition-fast);
}

.input::placeholder {
  color: #9a9a9a;
}

.input:focus {
  outline: none;
  /* No orange ring on the active field — keep a neutral dark border. */
  border-color: rgba(26, 26, 26, 0.35);
}

.input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--color-background-secondary);
}
</style>
