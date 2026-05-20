<template>
  <Teleport to="body">
    <Transition name="mobile-fs">
      <div v-if="open" class="mobile-fs" role="dialog" aria-modal="true">
        <!-- Header -->
        <header class="mobile-fs__header">
          <button
            v-if="showBack"
            type="button"
            class="mobile-fs__back"
            :aria-label="backLabel"
            @click="$emit('close')"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2 class="mobile-fs__title">{{ title }}</h2>
          <div class="mobile-fs__right">
            <slot name="header-right" />
          </div>
        </header>

        <!-- Body -->
        <div class="mobile-fs__body">
          <slot />
        </div>

        <!-- Footer (sticky) -->
        <footer v-if="$slots.footer" class="mobile-fs__footer">
          <slot name="footer" />
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  open: boolean
  title: string
  showBack?: boolean
  backLabel?: string
}>(), {
  showBack: true,
  backLabel: 'Terug',
})

defineEmits<{
  close: []
}>()

// Body-scroll lock while open
watch(() => props.open, (isOpen) => {
  if (typeof document === 'undefined') return
  if (isOpen) document.body.style.overflow = 'hidden'
  else document.body.style.overflow = ''
}, { immediate: true })

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>

<style scoped>
.mobile-fs {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: var(--color-surface, #fff);
  display: flex;
  flex-direction: column;
}

.mobile-fs__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
  height: 56px;
  padding: 0 var(--space-md, 16px);
  border-bottom: 1px solid var(--color-border-light, #f0f0f0);
  background: var(--color-surface, #fff);
}

.mobile-fs__back {
  width: 40px;
  height: 40px;
  margin-left: -8px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--color-text-primary, #1A1A1A);
  transition: background 150ms ease;
}

.mobile-fs__back:hover {
  background: var(--color-background-secondary, #F8F8F8);
}

.mobile-fs__title {
  flex: 1;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #1A1A1A);
  margin: 0;
}

.mobile-fs__right {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
}

.mobile-fs__body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.mobile-fs__footer {
  flex-shrink: 0;
  padding: var(--space-md, 16px);
  border-top: 1px solid var(--color-border-light, #f0f0f0);
  background: var(--color-surface, #fff);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
}

/* Slide-up transition */
.mobile-fs-enter-active,
.mobile-fs-leave-active {
  transition: transform 280ms ease-out;
}

.mobile-fs-enter-from,
.mobile-fs-leave-to {
  transform: translateY(100vh);
}

.mobile-fs-enter-to,
.mobile-fs-leave-from {
  transform: translateY(0);
}
</style>
