<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="visible" class="toast" :class="`toast--${type}`">
        <span class="toast__icon">{{ type === 'success' ? '✓' : 'ℹ' }}</span>
        <span class="toast__text">{{ message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  message: string
  type?: 'success' | 'info'
  duration?: number
}>()

const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

watch(() => props.message, (msg) => {
  if (!msg) return
  visible.value = true
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    visible.value = false
  }, props.duration ?? 3000)
}, { immediate: true })
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  border-radius: 12px;
  background: #1a1a1a;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  pointer-events: none;
}

.toast--success .toast__icon {
  color: #4ade80;
  font-weight: 700;
}

.toast--info .toast__icon {
  color: #60a5fa;
}

.toast-enter-active {
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-leave-active {
  transition: all 200ms ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
