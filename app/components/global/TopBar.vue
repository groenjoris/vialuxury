<template>
  <div class="top-bar">
    <div class="top-bar__inner container">
      <!-- Desktop: all items in one row -->
      <template v-if="!isMobile">
        <div v-for="(item, idx) in items" :key="idx" class="top-bar__item">
          <span class="top-bar__icon">{{ item.icon }}</span>
          <span v-html="item.text" />
        </div>
      </template>
      <!-- Mobile: single rotating item with fade -->
      <Transition v-else name="top-bar-fade" mode="out-in">
        <div :key="currentIdx" class="top-bar__item top-bar__item--mobile">
          <span class="top-bar__icon">{{ items[currentIdx].icon }}</span>
          <span v-html="items[currentIdx].text" />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const isMobile = useIsMobile()

const items = computed(() => [
  { icon: '★', text: '12.333 gasten waarderen ons met 4,8/5 op Trustpilot' },
  { icon: '✓', text: 'Gratis annuleren op de meeste verblijven' },
  { icon: '✓', text: 'Unieke deals met heul veul korting' },
])
// keep i18n import noop suppressed in case the translations are removed later
void t

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
  background-color: #1E1E1E;
  color: rgba(255, 255, 255, 0.55);
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
  color: #00b57e;
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
