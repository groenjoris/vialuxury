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
/** Flex-type radio: weekend-fri-sun | weekend-sat-sun | long-weekend | midweek | null. */
const selectedFlexType = ref<string | null>(null)

/** Budget range filter — shared so /search and /kaart agree on the active value. */
const budgetMin = ref(100)
const budgetMax = ref(2000)

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
    if (values.length > 0) selectedFlexType.value = null
  }

  function toggleNight(value: string) {
    const idx = selectedNights.value.indexOf(value)
    if (idx === -1) selectedNights.value.push(value)
    else selectedNights.value.splice(idx, 1)
    // Selecting a night clears any active weekend/midweek flex-type
    if (selectedNights.value.length > 0) selectedFlexType.value = null
  }

  function setFlexType(val: string | null) {
    selectedFlexType.value = val
    if (val) selectedNights.value = []
  }

  function clearDuration() {
    selectedNights.value = []
    selectedFlexType.value = null
  }

  function clearNights() {
    selectedNights.value = []
  }

  function triggerSearchUpdate() {
    searchVersion.value++
  }

  function setBudgetMin(v: number) { budgetMin.value = v }
  function setBudgetMax(v: number) { budgetMax.value = v }
  function resetBudget() { budgetMin.value = 100; budgetMax.value = 2000 }

  return {
    arrivalDate: readonly(selectedArrivalDate),
    persons: readonly(searchPersons),
    rooms: readonly(searchRooms),
    loading: readonly(searchLoading),
    searchVersion: readonly(searchVersion),
    selectedNights: readonly(selectedNights),
    selectedFlexType: readonly(selectedFlexType),
    budgetMin: readonly(budgetMin),
    budgetMax: readonly(budgetMax),
    setArrivalDate,
    clearArrivalDate,
    setSearchGroup,
    setLoading,
    setSelectedNights,
    toggleNight,
    setFlexType,
    clearDuration,
    clearNights,
    triggerSearchUpdate,
    setBudgetMin,
    setBudgetMax,
    resetBudget,
  }
}
