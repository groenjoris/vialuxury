<template>
  <Teleport to="body">
    <Transition name="vl-toast">
      <div
        v-if="modelValue"
        class="vl-toast"
        role="status"
        aria-live="polite"
      >
        <span class="vl-toast__text">{{ message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: boolean
  message?: string
  duration?: number
}>(), {
  message: '',
  duration: 3000,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

let timer: ReturnType<typeof setTimeout> | null = null

function clear() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

watch(() => props.modelValue, (visible) => {
  clear()
  // duration 0 = sticky (no auto-dismiss)
  if (visible && props.duration > 0) {
    timer = setTimeout(() => {
      emit('update:modelValue', false)
      timer = null
    }, props.duration)
  }
}, { immediate: true })

onBeforeUnmount(clear)
</script>

<style scoped>
.vl-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  border-radius: var(--radius-lg);
  background: var(--color-dark);
  color: #fff;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  pointer-events: none;
  max-width: 90vw;
}

.vl-toast-enter-active {
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.vl-toast-leave-active {
  transition: all 200ms ease-in;
}

.vl-toast-enter-from,
.vl-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
