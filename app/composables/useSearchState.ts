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
/**
 * sessionStorage keys — persist the global search state through full page
 * reloads (browser refresh, the static /advertisement → /deal redirect, etc.).
 * The data lives only for the tab's lifetime, matching the user-test session.
 */
const SS_ARRIVAL = 'vl_arrival_date'
const SS_FLEX = 'vl_arrival_flex'
const SS_PERSONS = 'vl_search_persons'
const SS_ROOMS = 'vl_search_rooms'

/**
 * LIVE arrival-date — synced across every calendar/datepicker on the site
 * (navbar DatePopup, hotel page mid-page bar, deal page sidebar). Updates
 * immediately on each pick.
 */
const selectedArrivalDate = ref<string | null>(null)
/**
 * COMMITTED arrival-date — the snapshot used by /search and /kaart filters.
 * Only updates when the user actually presses the search button (or any
 * commit-equivalent). Cleared in lockstep with the live value.
 */
const committedArrivalDate = ref<string | null>(null)
const searchPersons = ref(2)
const searchRooms = ref(1)
const searchLoading = ref(false)
const searchVersion = ref(0) // increments when search params change
const selectedNights = ref<string[]>([])
/** Flex-type radio: weekend-fri-sun | weekend-sat-sun | long-weekend | midweek | null. */
const selectedFlexType = ref<string | null>(null)

/** Live flex-day window around `selectedArrivalDate` (0 = exact, 3 = ±3 days, etc.). */
const selectedFlexibility = ref(0)
/** Committed flex window — applied to /search /kaart filters together with `committedArrivalDate`. */
const committedFlexibility = ref(0)

/** Budget range filter — shared so /search and /kaart agree on the active value. */
const budgetMin = ref(100)
const budgetMax = ref(2000)

/** Unified filter-tag IDs (Arrangement + Thema + Specials).
 *  See `~/utils/filterTags.ts` for the full list of valid IDs. */
const selectedFilterTags = ref<string[]>([])

/** Destination filters (lifted from SiteHeader so /search + /kaart can read them). */
const selectedDestinations = ref<string[]>([])
const selectedCities = ref<{ name: string; province: string }[]>([])
const selectedHotels = ref<{ name: string; slug: string }[]>([])
type SelectionEntry = { type: 'destination' | 'theme' | 'city' | 'hotel'; key: string }
const selectionOrder = ref<SelectionEntry[]>([])

export function useSearchState() {
  function setArrivalDate(date: string | null) {
    selectedArrivalDate.value = date
    if (import.meta.client) {
      if (date) sessionStorage.setItem(SS_ARRIVAL, date)
      else sessionStorage.removeItem(SS_ARRIVAL)
    }
  }

  /** Clear the live AND committed arrival-date in one go (used by the pill,
   *  date-popup "Wis" link and any "clear arrival" UI). */
  function clearArrivalDate() {
    selectedArrivalDate.value = null
    committedArrivalDate.value = null
    if (import.meta.client) {
      sessionStorage.removeItem(SS_ARRIVAL)
      sessionStorage.removeItem(SS_FLEX)
    }
  }

  /** Restore arrival date / flex / persons-rooms from sessionStorage. Call
   *  once on app mount so the global state survives full-page reloads
   *  (browser refresh, redirects through the static /advertisement page,
   *  external partner navigation). */
  function restoreSearchSession() {
    if (!import.meta.client) return
    const date = sessionStorage.getItem(SS_ARRIVAL)
    if (date && !selectedArrivalDate.value) selectedArrivalDate.value = date
    const flex = sessionStorage.getItem(SS_FLEX)
    if (flex !== null && !selectedFlexibility.value) {
      const n = Number(flex)
      if (!Number.isNaN(n)) selectedFlexibility.value = Math.max(0, Math.min(14, n | 0))
    }
    const p = sessionStorage.getItem(SS_PERSONS)
    if (p !== null) {
      const n = Number(p); if (!Number.isNaN(n) && n > 0) searchPersons.value = n
    }
    const r = sessionStorage.getItem(SS_ROOMS)
    if (r !== null) {
      const n = Number(r); if (!Number.isNaN(n) && n > 0) searchRooms.value = n
    }
  }

  /** Commit the live arrival/flex values into the snapshot used by the search
   *  filter on /search and /kaart. Triggered by the main search button so
   *  selecting a date elsewhere on the site doesn't yank the result list. */
  function commitArrivalDate() {
    committedArrivalDate.value = selectedArrivalDate.value
    committedFlexibility.value = selectedFlexibility.value
  }

  function setSearchGroup(persons: number, rooms: number) {
    searchPersons.value = persons
    searchRooms.value = rooms
    if (import.meta.client) {
      sessionStorage.setItem(SS_PERSONS, String(persons))
      sessionStorage.setItem(SS_ROOMS, String(rooms))
    }
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
  function setFlexibility(v: number) {
    selectedFlexibility.value = Math.max(0, Math.min(14, v | 0))
    if (import.meta.client) sessionStorage.setItem(SS_FLEX, String(selectedFlexibility.value))
  }

  // Single unified set of "soft" filter tags (Arrangement + Thema + Specials).
  function toggleFilterTag(id: string) {
    const idx = selectedFilterTags.value.indexOf(id)
    if (idx === -1) {
      selectedFilterTags.value.push(id)
      // Mirror to selectionOrder so chips can render in toggle order.
      selectionOrder.value.push({ type: 'theme', key: id })
    } else {
      selectedFilterTags.value.splice(idx, 1)
      selectionOrder.value = selectionOrder.value.filter(
        e => !(e.type === 'theme' && e.key === id),
      )
    }
  }
  function clearFilterTags() {
    const removed = new Set(selectedFilterTags.value)
    selectedFilterTags.value = []
    selectionOrder.value = selectionOrder.value.filter(e => !(e.type === 'theme' && removed.has(e.key)))
  }

  // ----- Destination helpers (mirroring the previous SiteHeader-local logic) -----
  function toggleDestination(id: string) {
    const idx = selectedDestinations.value.indexOf(id)
    if (idx === -1) {
      selectedDestinations.value.push(id)
      selectionOrder.value.push({ type: 'destination', key: id })
    } else {
      selectedDestinations.value.splice(idx, 1)
      selectionOrder.value = selectionOrder.value.filter(
        e => !(e.type === 'destination' && e.key === id),
      )
    }
  }
  function addCity(city: { name: string; province: string }) {
    if (!selectedCities.value.find(c => c.name === city.name)) {
      selectedCities.value.push(city)
      selectionOrder.value.push({ type: 'city', key: city.name })
    }
  }
  function removeCity(name: string) {
    selectedCities.value = selectedCities.value.filter(c => c.name !== name)
    selectionOrder.value = selectionOrder.value.filter(e => !(e.type === 'city' && e.key === name))
  }
  function addHotel(hotel: { name: string; slug: string }) {
    if (!selectedHotels.value.some(h => h.slug === hotel.slug)) {
      selectedHotels.value.push(hotel)
      selectionOrder.value.push({ type: 'hotel', key: hotel.slug })
    }
  }
  function removeHotel(slug: string) {
    selectedHotels.value = selectedHotels.value.filter(h => h.slug !== slug)
    selectionOrder.value = selectionOrder.value.filter(e => !(e.type === 'hotel' && e.key === slug))
  }
  function clearDestinations() {
    selectedDestinations.value = []
    selectedCities.value = []
    selectedHotels.value = []
    // Also drop any thema-tags from filter list (Thema cat) — matches the
    // previous behaviour where the destination popup owned the theme chips.
    // We can't tell here which IDs are theme-only, so leave selectedFilterTags
    // intact; callers that want a full reset use clearFilterTags() too.
    selectionOrder.value = selectionOrder.value.filter(
      e => e.type !== 'destination' && e.type !== 'city' && e.type !== 'hotel',
    )
  }

  return {
    arrivalDate: readonly(selectedArrivalDate),
    /** Snapshot used by /search & /kaart filters; only updates on commit. */
    committedArrivalDate: readonly(committedArrivalDate),
    persons: readonly(searchPersons),
    rooms: readonly(searchRooms),
    loading: readonly(searchLoading),
    searchVersion: readonly(searchVersion),
    selectedNights: readonly(selectedNights),
    selectedFlexType: readonly(selectedFlexType),
    selectedFlexibility: readonly(selectedFlexibility),
    committedFlexibility: readonly(committedFlexibility),
    budgetMin: readonly(budgetMin),
    budgetMax: readonly(budgetMax),
    selectedFilterTags: readonly(selectedFilterTags),
    selectedDestinations: readonly(selectedDestinations),
    selectedCities: readonly(selectedCities),
    selectedHotels: readonly(selectedHotels),
    selectionOrder: readonly(selectionOrder),
    setArrivalDate,
    clearArrivalDate,
    commitArrivalDate,
    restoreSearchSession,
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
    setFlexibility,
    toggleFilterTag,
    clearFilterTags,
    toggleDestination,
    addCity,
    removeCity,
    addHotel,
    removeHotel,
    clearDestinations,
  }
}
