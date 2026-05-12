import { defineStore } from 'pinia'
import type { Deal, DealVariant, TravelGroup, TravelGroupPricing, RoomOption } from '~/types/deal'
import type { DateAvailability } from '~/types/calendar'
import { priceForArrival, minRoomsFor, maxRoomsFor } from '~/utils-northstar/priceFormula'
import dayjs from 'dayjs'

export const useNorthstarDealStore = defineStore('northstar-deal', () => {
  const { t, localized } = useNorthstarI18n()
  // --- State ---
  const currentDeal = ref<Deal | null>(null)
  const dealVariants = ref<DealVariant[]>([])
  // Bidirectional sync with the global arrival-date + persons/rooms in
  // useNorthstarSearchState so every calendar on the site (navbar DatePopup, hotel
  // page, deal page sidebar) shows the same selection AND the deal page
  // pricing reflects the persons/rooms picked on /search.
  const {
    arrivalDate: globalArrivalDate, setArrivalDate,
    persons: globalPersons, rooms: globalRooms, setSearchGroup,
  } = useNorthstarSearchState()
  const travelGroup = ref<TravelGroup>({
    adults: globalPersons.value || 2,
    children: [],
    rooms: globalRooms.value || 1,
  })
  const selectedRoomId = ref<string>('')
  const checkInDate = ref<string | null>(globalArrivalDate.value)
  watch(globalArrivalDate, (v) => {
    if (v !== checkInDate.value) {
      checkInDate.value = v
      // Recompute checkout whenever the arrival date is set from outside
      // the deal store (navbar When-popup, ?checkin= URL, search-result
      // link). Without this the checkout sticks to the previous date.
      updateCheckOut()
    }
  })
  watch(checkInDate, (v) => { if (v !== globalArrivalDate.value) setArrivalDate(v) })

  // Mirror global persons/rooms → travelGroup whenever the navbar Wie-popup
  // commits (Klaar / outside-click / search button). Adults absorb the new
  // total; children unchanged. Enforce min rooms = ceil(persons/2) so the
  // sidebar never shows a sub-capacity room count.
  watch(globalPersons, (p) => {
    const total = travelGroup.value.adults + travelGroup.value.children.length
    const newAdults = (p !== total)
      ? Math.max(1, p - travelGroup.value.children.length)
      : travelGroup.value.adults
    const min = minRoomsFor(p)
    const max = maxRoomsFor(p)
    // Enforce both bounds: rooms ≥ minRooms (no over-stuffed rooms) AND
    // rooms ≤ persons (no empty rooms).
    const newRooms = Math.min(max, Math.max(travelGroup.value.rooms, min))
    if (newAdults !== travelGroup.value.adults || newRooms !== travelGroup.value.rooms) {
      travelGroup.value = { ...travelGroup.value, adults: newAdults, rooms: newRooms }
    }
  })
  watch(globalRooms, (r) => {
    if (r !== travelGroup.value.rooms) {
      const total = travelGroup.value.adults + travelGroup.value.children.length
      const clamped = Math.min(maxRoomsFor(total), Math.max(r, minRoomsFor(total)))
      travelGroup.value = { ...travelGroup.value, rooms: clamped }
    }
  })

  /** Push the deal-page travelGroup back into the global search state so
   *  /search and the navbar Wie-field stay in sync after the user adjusts
   *  the Travel Group modal. */
  function pushSearchGroup() {
    const total = travelGroup.value.adults + travelGroup.value.children.length
    if (total !== globalPersons.value || travelGroup.value.rooms !== globalRooms.value) {
      setSearchGroup(total, travelGroup.value.rooms)
    }
  }
  const checkOutDate = ref<string | null>(null)
  const dateAvailability = ref<DateAvailability[]>([])
  const isTravelGroupModalOpen = ref(false)
  const roomUnavailableMessage = ref<string | null>(null)
  const previousCheckInDate = ref<string | null>(null)

  /**
   * Room allocation: maps roomId → count.
   * Used when rooms >= 2 to allow mixing room types.
   * e.g. { 'room-kasteel-std': 2, 'room-kasteel-baron': 1 }
   */
  const roomAllocation = ref<Record<string, number>>({})

  // --- Getters ---

  /** Total number of persons (adults + children) */
  const totalPersons = computed(() => {
    return travelGroup.value.adults + travelGroup.value.children.length
  })

  /** Human-readable travel group summary */
  const travelGroupSummary = computed(() => {
    const parts: string[] = []
    parts.push(`${travelGroup.value.adults} ${travelGroup.value.adults === 1 ? t('common.adultSingular') : t('common.adultPlural')}`)
    if (travelGroup.value.children.length > 0) {
      parts.push(`${travelGroup.value.children.length} ${travelGroup.value.children.length === 1 ? t('common.childSingular') : t('common.childPlural')}`)
    }
    parts.push(`${travelGroup.value.rooms} ${travelGroup.value.rooms === 1 ? t('common.roomSingular') : t('common.roomPlural')}`)
    return parts.join(', ')
  })

  /** Currently selected room */
  const selectedRoom = computed<RoomOption | null>(() => {
    if (!currentDeal.value) return null
    if (selectedRoomId.value === currentDeal.value.baseRoomType.id) {
      return currentDeal.value.baseRoomType
    }
    return currentDeal.value.roomUpgrades.find(r => r.id === selectedRoomId.value) ?? null
  })

  /** Room upgrade cost (flat per stay) */
  const roomUpgradeCost = computed(() => {
    if (!currentDeal.value || !selectedRoom.value) return 0
    return selectedRoom.value.priceExtra
  })

  /** All available room types (base + upgrades) */
  const allRoomTypes = computed<RoomOption[]>(() => {
    if (!currentDeal.value) return []
    return [currentDeal.value.baseRoomType, ...currentDeal.value.roomUpgrades]
  })

  /** Whether room allocation mode is active (2+ rooms with date) */
  const isRoomAllocationActive = computed(() => {
    return travelGroup.value.rooms >= 2 && checkInDate.value !== null
  })

  /** Effective room allocation — either custom or default (all base rooms) */
  const effectiveAllocation = computed<Record<string, number>>(() => {
    if (!currentDeal.value) return {}
    const totalRooms = travelGroup.value.rooms
    const alloc = roomAllocation.value

    // Check if allocation sums to total rooms
    const allocSum = Object.values(alloc).reduce((s, n) => s + n, 0)
    if (allocSum === totalRooms && allocSum > 0) {
      return alloc
    }

    // Default: all rooms are base type
    return { [currentDeal.value.baseRoomType.id]: totalRooms }
  })

  /** Total upgrade cost based on allocation */
  const allocationUpgradeCost = computed(() => {
    if (!currentDeal.value) return 0
    let cost = 0
    for (const [roomId, count] of Object.entries(effectiveAllocation.value)) {
      if (count <= 0) continue
      const room = allRoomTypes.value.find(r => r.id === roomId)
      if (room && room.priceExtra > 0) {
        cost += room.priceExtra * count
      }
    }
    return cost
  })

  /** Price calculations for current configuration */
  const pricing = computed<TravelGroupPricing>(() => {
    if (!currentDeal.value) {
      return { totalPrice: 0, originalPrice: 0, pricePerPerson: 0, breakdown: [] }
    }

    const deal = currentDeal.value
    const persons = totalPersons.value
    const rooms = travelGroup.value.rooms

    // Single source of truth for the headline price: `priceForArrival` applies
    // both the per-person formula and the calendar's premium-day surcharge,
    // so the number shown in the sidebar / sticky CTA / side-panel always
    // matches the calendar cell for the selected day.
    const arrangementAmount = priceForArrival(deal.basePrice, deal.id, checkInDate.value, persons)
    const originalArrangementAmount = priceForArrival(deal.originalPrice, deal.id, checkInDate.value, persons)

    // Extra rooms: only rooms beyond minRooms are charged
    const minRooms = minRoomsFor(persons)
    const extraRooms = Math.max(0, rooms - minRooms)
    const extraRoomsCost = extraRooms * 109 * deal.nights

    // Room upgrade — use allocation-based cost in multi-room mode
    const roomUpgrade = isRoomAllocationActive.value
      ? allocationUpgradeCost.value
      : roomUpgradeCost.value * rooms

    // Children discount: 50% for children under 12
    const childrenDiscount = travelGroup.value.children
      .filter(c => c.age < 12)
      .length * Math.round(89 * deal.nights * 0.5)

    const totalPrice = arrangementAmount + extraRoomsCost + roomUpgrade - childrenDiscount
    const originalPrice = originalArrangementAmount + extraRoomsCost + roomUpgrade
    const pricePerPerson = Math.round(totalPrice / Math.max(1, persons))

    // Breakdown
    const arrangementLabel = `${t('sidebar.arrangementFor')} ${persons} ${persons === 1 ? t('common.personSingular') : t('common.personPlural')}`

    const breakdown: { label: string; amount: number }[] = [
      { label: arrangementLabel, amount: arrangementAmount },
    ]

    if (extraRooms > 0) {
      breakdown.push({ label: `${extraRooms}x ${t('store.extraRoom')}`, amount: extraRoomsCost })
    }

    if (roomUpgrade > 0) {
      // Count rooms with paid upgrades
      let upgradeRoomCount = 0
      if (isRoomAllocationActive.value) {
        for (const [roomId, count] of Object.entries(effectiveAllocation.value)) {
          const room = allRoomTypes.value.find(r => r.id === roomId)
          if (room && room.priceExtra > 0 && count > 0) {
            upgradeRoomCount += count
          }
        }
      } else {
        upgradeRoomCount = rooms
      }
      breakdown.push({ label: `${upgradeRoomCount}x ${t('store.roomUpgrade')}`, amount: roomUpgrade })
    }

    return { totalPrice, originalPrice, pricePerPerson, breakdown }
  })

  /** Formatted check-in */
  const formattedCheckIn = computed(() => {
    if (!checkInDate.value) return null
    return dayjs(checkInDate.value).format('DD MMM YYYY')
  })

  /** Formatted check-out */
  const formattedCheckOut = computed(() => {
    if (!checkOutDate.value) return null
    return dayjs(checkOutDate.value).format('DD MMM YYYY')
  })

  /** Is booking ready? */
  const isBookingReady = computed(() => {
    return checkInDate.value !== null && checkOutDate.value !== null
  })

  /** Currently selected variant */
  const currentVariant = computed(() => {
    if (!currentDeal.value) return null
    return dealVariants.value.find(v => v.id === currentDeal.value!.id) ?? null
  })

  /** URL query params for shareable links */
  const queryParams = computed(() => {
    const params: Record<string, string> = {}
    if (currentDeal.value) {
      params.deal = currentDeal.value.id
    }
    if (travelGroup.value.adults !== 2) {
      params.adults = String(travelGroup.value.adults)
    }
    if (travelGroup.value.children.length > 0) {
      params.children = travelGroup.value.children.map(c => c.age).join(',')
    }
    if (travelGroup.value.rooms !== 1) {
      params.rooms = String(travelGroup.value.rooms)
    }
    if (selectedRoomId.value && currentDeal.value && selectedRoomId.value !== currentDeal.value.baseRoomType.id) {
      params.room = selectedRoomId.value
    }
    if (checkInDate.value) {
      params.checkin = checkInDate.value
    }
    return params
  })

  // --- Actions ---

  /** Initialize with a deal */
  function initializeDeal(deal: Deal, variants: DealVariant[]) {
    currentDeal.value = deal
    dealVariants.value = variants
    selectedRoomId.value = deal.baseRoomType.id
    // Reset state coming from search results
    roomUnavailableMessage.value = null
    previousCheckInDate.value = null
    roomAllocation.value = {}
    // If an arrival date was already set globally (URL ?checkin= /
    // sessionStorage / picked on /search before navigating here) we need
    // to compute the checkout from the new deal's `nights`. Without this
    // the sidebar shows a stale checkout date or none at all.
    if (checkInDate.value) updateCheckOut()
  }

  /** Switch to a different deal variant (different nights) */
  function switchDeal(deal: Deal) {
    currentDeal.value = deal
    // Reset room to base when switching deals
    selectedRoomId.value = deal.baseRoomType.id
    // Update checkout if check-in is set
    updateCheckOut()
  }

  /** Set travel group */
  function setTravelGroup(group: TravelGroup) {
    // Auto-adjust rooms: minimum ceil(totalPersons / 2). User-added extras
    // are preserved (we only bump UP, never down).
    const totalPersons = group.adults + group.children.length
    const minRooms = minRoomsFor(totalPersons)
    if (group.rooms < minRooms) {
      group.rooms = minRooms
    }
    travelGroup.value = { ...group }
    // Propagate to the global search state so the navbar Wie-field, /search
    // pricing and any other calendars stay in sync.
    pushSearchGroup()
  }

  /** Select a room (single-room mode) */
  function selectRoom(roomId: string) {
    selectedRoomId.value = roomId
  }

  /** Set room allocation for a specific room type */
  function setRoomAllocationCount(roomId: string, count: number) {
    const newAlloc = { ...roomAllocation.value }
    if (count <= 0) {
      delete newAlloc[roomId]
    } else {
      newAlloc[roomId] = count
    }
    roomAllocation.value = newAlloc
  }

  /** Reset room allocation to default (all base rooms) */
  function resetRoomAllocation() {
    roomAllocation.value = {}
  }

  /** Set check-in date */
  function setCheckIn(date: string) {
    // Only show unavailability popup when CHANGING an existing date while a paid upgrade is selected
    if (checkInDate.value && currentDeal.value && selectedRoom.value && !selectedRoom.value.isDefault) {
      previousCheckInDate.value = checkInDate.value
      roomUnavailableMessage.value = t('store.roomUnavailable').replace('{room}', localized(selectedRoom.value.name))
    }
    checkInDate.value = date
    updateCheckOut()
  }

  /** User confirms room unavailable — reset room to default */
  function confirmRoomUnavailable() {
    roomUnavailableMessage.value = null
    if (currentDeal.value) {
      selectedRoomId.value = currentDeal.value.baseRoomType.id
    }
    previousCheckInDate.value = null
  }

  /** User cancels (clicks outside) — revert date, keep room */
  function cancelRoomUnavailable() {
    roomUnavailableMessage.value = null
    if (previousCheckInDate.value !== null) {
      checkInDate.value = previousCheckInDate.value
      updateCheckOut()
    }
    previousCheckInDate.value = null
  }

  /** Clear dates and reset room to default */
  function clearDates() {
    checkInDate.value = null
    checkOutDate.value = null
    if (currentDeal.value) {
      selectedRoomId.value = currentDeal.value.baseRoomType.id
    }
  }

  /** Auto-compute check-out from check-in + deal nights */
  function updateCheckOut() {
    if (checkInDate.value && currentDeal.value) {
      checkOutDate.value = dayjs(checkInDate.value)
        .add(currentDeal.value.nights, 'day')
        .format('YYYY-MM-DD')
    }
  }

  /** Set date availability */
  function setDateAvailability(data: DateAvailability[]) {
    dateAvailability.value = data
  }

  /** Open/close travel group modal */
  function openTravelGroupModal() {
    isTravelGroupModalOpen.value = true
  }

  function closeTravelGroupModal() {
    isTravelGroupModalOpen.value = false
  }

  /** Apply URL query params */
  function applyFromQuery(query: Record<string, string>, dealsMap: Record<string, Deal>) {
    if (query.deal && dealsMap[query.deal]) {
      switchDeal(dealsMap[query.deal])
    }
    if (query.adults) {
      travelGroup.value.adults = parseInt(query.adults) || 2
    }
    if (query.children) {
      travelGroup.value.children = query.children.split(',').map((age, i) => ({
        id: `child-${i}`,
        age: parseInt(age) || 0,
      }))
    }
    if (query.rooms) {
      travelGroup.value.rooms = parseInt(query.rooms) || 1
    }
    if (query.room) {
      selectedRoomId.value = query.room
    }
    if (query.checkin) {
      setCheckIn(query.checkin)
    }
  }

  return {
    // State
    currentDeal,
    dealVariants,
    travelGroup,
    selectedRoomId,
    checkInDate,
    checkOutDate,
    dateAvailability,
    isTravelGroupModalOpen,
    roomUnavailableMessage,
    roomAllocation,
    // Getters
    totalPersons,
    travelGroupSummary,
    selectedRoom,
    roomUpgradeCost,
    allRoomTypes,
    isRoomAllocationActive,
    effectiveAllocation,
    allocationUpgradeCost,
    pricing,
    formattedCheckIn,
    formattedCheckOut,
    isBookingReady,
    currentVariant,
    queryParams,
    // Actions
    initializeDeal,
    switchDeal,
    setTravelGroup,
    selectRoom,
    setRoomAllocationCount,
    resetRoomAllocation,
    setCheckIn,
    clearDates,
    setDateAvailability,
    openTravelGroupModal,
    closeTravelGroupModal,
    confirmRoomUnavailable,
    cancelRoomUnavailable,
    applyFromQuery,
  }
})
