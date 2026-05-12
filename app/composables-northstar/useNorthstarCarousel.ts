import { ref, watch, onUnmounted, type Ref, type ComputedRef } from 'vue'

export interface UseCarouselOptions {
  /** Milliseconds between auto-advances. Defaults to 3000. */
  intervalMs?: number
  /** Reactive flag controlling whether the auto-advance timer runs. Defaults to always on. */
  enabled?: Ref<boolean> | ComputedRef<boolean>
}

/**
 * Auto-rotating index for a list of items.
 * Returns the current index plus a `goTo()` function that resets the timer.
 *
 * Example:
 *   const images = computed(() => deal.value.images)
 *   const { activeIndex, goTo } = useNorthstarCarousel(images, { enabled: isMultiRoom })
 */
export function useNorthstarCarousel<T>(
  items: Ref<T[]> | ComputedRef<T[]>,
  options: UseCarouselOptions = {},
) {
  const { intervalMs = 3000, enabled } = options
  const activeIndex = ref(0)
  let timer: ReturnType<typeof setInterval> | null = null

  function clear() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function start() {
    clear()
    if (items.value.length > 1 && (!enabled || enabled.value)) {
      timer = setInterval(() => {
        activeIndex.value = (activeIndex.value + 1) % items.value.length
      }, intervalMs)
    }
  }

  function goTo(idx: number) {
    activeIndex.value = idx
    start()
  }

  // Restart timer when items list or enabled flag changes.
  watch(
    () => [items.value.length, enabled?.value],
    () => {
      if (enabled && !enabled.value) {
        clear()
        return
      }
      if (activeIndex.value >= items.value.length) activeIndex.value = 0
      start()
    },
    { immediate: true },
  )

  onUnmounted(clear)

  return { activeIndex, goTo }
}
