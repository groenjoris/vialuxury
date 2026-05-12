import { ref } from 'vue'

/**
 * useNorthstarHotelMap — shared selection/hover state for the /kaart browse map.
 *
 * Kept as plain refs (no Pinia) because the state only needs to live for
 * the lifetime of the page; refreshing the route should always reset
 * to a clean map view.
 */

const selectedHotelId = ref<string | null>(null)
const hoveredHotelId = ref<string | null>(null)
const hoverPosition = ref<{ x: number; y: number } | null>(null)

// Deferred-hide timer. When the mouse leaves a pin we don't hide the
// preview immediately — we wait briefly so the user has time to move the
// cursor INTO the preview card. Entering the card cancels the hide.
let hideTimer: ReturnType<typeof setTimeout> | null = null

export function useNorthstarHotelMap() {
  function selectHotel(id: string) {
    selectedHotelId.value = id
  }

  function clearSelection() {
    selectedHotelId.value = null
  }

  function clearHideTimer() {
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
  }

  function setHover(id: string | null, pos?: { x: number; y: number }) {
    clearHideTimer()
    hoveredHotelId.value = id
    hoverPosition.value = id && pos ? pos : null
  }

  /** Schedule the preview to disappear after `delay` ms. Calling
   *  `setHover()` (e.g. mouse re-enters a pin or the card) cancels it. */
  function scheduleHover(id: string | null, delay = 150) {
    clearHideTimer()
    if (id !== null) {
      // re-show synchronously
      hoveredHotelId.value = id
      return
    }
    hideTimer = setTimeout(() => {
      hoveredHotelId.value = null
      hoverPosition.value = null
      hideTimer = null
    }, delay)
  }

  /** Cancel a pending hide — used when the cursor enters the preview card. */
  function keepHover() {
    clearHideTimer()
  }

  return {
    selectedHotelId,
    hoveredHotelId,
    hoverPosition,
    selectHotel,
    clearSelection,
    setHover,
    scheduleHover,
    keepHover,
  }
}
