<template>
  <Teleport to="body">
    <Transition name="vl-modal-fade">
      <div
        v-if="modelValue"
        class="vl-modal__overlay"
        @click.self="close"
      >
        <div
          class="vl-modal"
          data-scroll-lock-allow="true"
          role="dialog"
          aria-modal="true"
          :aria-label="title || undefined"
          :style="{ maxWidth }"
        >
          <header class="vl-modal__header">
            <slot name="header">
              <h2 v-if="title" class="vl-modal__title">{{ title }}</h2>
            </slot>
            <button
              class="vl-modal__close"
              type="button"
              aria-label="Close"
              @click="close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </header>

          <div class="vl-modal__body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="vl-modal__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useScrollLock } from '~/lib/composables/useScrollLock'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  maxWidth?: string
}>(), {
  title: '',
  maxWidth: '480px',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

function close() {
  emit('update:modelValue', false)
  emit('close')
}

// Escape to close
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue) close()
}

onMounted(() => {
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', onKeydown)
  }
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('keydown', onKeydown)
  }
})

// Body scroll lock while open.
const scrollLock = useScrollLock()
let locked = false
watch(() => props.modelValue, (open) => {
  if (open && !locked) { scrollLock.acquire(); locked = true }
  else if (!open && locked) { scrollLock.release(); locked = false }
}, { immediate: true })

onBeforeUnmount(() => {
  if (locked) { scrollLock.release(); locked = false }
})
</script>

<style scoped>
.vl-modal__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
}

.vl-modal {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.16);
  display: flex;
  flex-direction: column;
}

.vl-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-lg) var(--space-lg) 0;
}

.vl-modal__title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.3;
}

.vl-modal__close {
  flex-shrink: 0;
  margin-left: auto;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--color-background-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.vl-modal__close:hover {
  background: var(--color-border);
  color: var(--color-text-primary);
}

.vl-modal__body {
  padding: var(--space-lg);
  font-family: var(--font-body);
  color: var(--color-text-primary);
}

.vl-modal__footer {
  padding: 0 var(--space-lg) var(--space-lg);
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
}

.vl-modal-fade-enter-active,
.vl-modal-fade-leave-active {
  transition: opacity 200ms ease;
}

.vl-modal-fade-enter-from,
.vl-modal-fade-leave-to {
  opacity: 0;
}
</style>
