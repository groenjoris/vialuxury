/**
 * Shared search state composable.
 * Exposes search-bar selections (arrival date, travel group, nights) so the
 * search page filter panel and side panels stay in sync.
 *
 * Nights:
 *   - String IDs from the duration picker: '1', '2', '3', '4', '5+'
 *   - Multi-select: ['2', '3'] = "2 or 3 nights"
 *   - Empty array = no nights filter (show all)
 */
const selectedArrivalDate = ref<string | null>(null)
const searchPersons = ref(2)
const searchRooms = ref(1)
const searchLoading = ref(false)
const searchVersion = ref(0) // increments when search params change
const selectedNights = ref<string[]>([])

export function useSearchState() {
  function setArrivalDate(date: string | null) {
    selectedArrivalDate.value = date
  }

  function clearArrivalDate() {
    selectedArrivalDate.value = null
  }

  function setSearchGroup(persons: number, rooms: number) {
    searchPersons.value = persons
    searchRooms.value = rooms
  }

  function setLoading(val: boolean) {
    searchLoading.value = val
  }

  function setSelectedNights(values: string[]) {
    selectedNights.value = [...values]
  }

  function toggleNight(value: string) {
    const idx = selectedNights.value.indexOf(value)
    if (idx === -1) selectedNights.value.push(value)
    else selectedNights.value.splice(idx, 1)
  }

  function clearNights() {
    selectedNights.value = []
  }

  function triggerSearchUpdate() {
    searchVersion.value++
  }

  return {
    arrivalDate: readonly(selectedArrivalDate),
    persons: readonly(searchPersons),
    rooms: readonly(searchRooms),
    loading: readonly(searchLoading),
    searchVersion: readonly(searchVersion),
    selectedNights: readonly(selectedNights),
    setArrivalDate,
    clearArrivalDate,
    setSearchGroup,
    setLoading,
    setSelectedNights,
    toggleNight,
    clearNights,
    triggerSearchUpdate,
  }
}
