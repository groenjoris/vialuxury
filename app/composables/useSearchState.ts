/**
 * Shared search state composable.
 * Exposes the arrival date and travel group selected in the SiteHeader search bar
 * so other components (e.g. HotelDealsSidePanel, search page) can read them.
 */
const selectedArrivalDate = ref<string | null>(null)
const searchPersons = ref(2)
const searchRooms = ref(1)
const searchLoading = ref(false)
const searchVersion = ref(0) // increments when search params change

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

  function triggerSearchUpdate() {
    searchVersion.value++
  }

  return {
    arrivalDate: readonly(selectedArrivalDate),
    persons: readonly(searchPersons),
    rooms: readonly(searchRooms),
    loading: readonly(searchLoading),
    searchVersion: readonly(searchVersion),
    setArrivalDate,
    clearArrivalDate,
    setSearchGroup,
    setLoading,
    triggerSearchUpdate,
  }
}
