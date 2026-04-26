<template>
  <div class="top-bar">
    <div class="top-bar__inner container">
      <!-- Desktop: all 4 items in one row -->
      <template v-if="!isMobile">
        <div v-for="(item, idx) in items" :key="idx" class="top-bar__item">
          <span class="top-bar__icon">{{ item.icon }}</span>
          <span>{{ item.text }}</span>
        </div>
      </template>
      <!-- Mobile: single rotating item with fade -->
      <Transition v-else name="top-bar-fade" mode="out-in">
        <div :key="currentIdx" class="top-bar__item top-bar__item--mobile">
          <span class="top-bar__icon">{{ items[currentIdx].icon }}</span>
          <span>{{ items[currentIdx].text }}</span>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const isMobile = useIsMobile()

const items = computed(() => [
  { icon: '★', text: t('topbar.trustpilot') },
  { icon: '✓', text: t('topbar.bestDeal') },
  { icon: '✓', text: t('topbar.easyCancel') },
  { icon: '✓', text: t('topbar.wideSelection') },
])

const currentIdx = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function startRotation() {
  if (timer) return
  timer = setInterval(() => {
    currentIdx.value = (currentIdx.value + 1) % items.value.length
  }, 4000)
}

function stopRotation() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

watch(isMobile, (val) => {
  if (val) startRotation()
  else stopRotation()
}, { immediate: true })

onBeforeUnmount(stopRotation)
</script>

<style scoped>
.top-bar {
  background-color: #3A3A3A;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  height: 34px;
  display: flex;
  align-items: center;
}

.top-bar__inner {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.top-bar__item {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.top-bar__item--mobile {
  /* Center the single rotating item on mobile */
  margin: 0 auto;
}

.top-bar__icon {
  font-size: 12px;
  color: var(--color-primary);
}

/* Crossfade transition */
.top-bar-fade-enter-active,
.top-bar-fade-leave-active {
  transition: opacity 400ms ease;
}
.top-bar-fade-enter-from,
.top-bar-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .top-bar {
    font-size: 12px;
  }
  .top-bar__inner {
    justify-content: center;
  }
}
</style>
