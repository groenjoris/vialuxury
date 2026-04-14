import { ref } from 'vue'

/**
 * useHotelMap — shared selection/hover state for the /kaart browse map.
 *
 * Kept as plain refs (no Pinia) because the state only needs to live for
 * the lifetime of the page; refreshing the route should always reset
 * to a clean map view.
 */

const selectedHotelId = ref<string | null>(null)
const hoveredHotelId = ref<string | null>(null)
const hoverPosition = ref<{ x: number; y: number } | null>(null)

export function useHotelMap() {
  function selectHotel(id: string) {
    selectedHotelId.value = id
  }

  function clearSelection() {
    selectedHotelId.value = null
  }

  function setHover(id: string | null, pos?: { x: number; y: number }) {
    hoveredHotelId.value = id
    hoverPosition.value = id && pos ? pos : null
  }

  return {
    selectedHotelId,
    hoveredHotelId,
    hoverPosition,
    selectHotel,
    clearSelection,
    setHover,
  }
}
