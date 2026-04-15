import { defineStore } from 'pinia'
import type { Deal, DealVariant, TravelGroup, TravelGroupPricing, RoomOption } from '~/types/deal'
import type { DateAvailability } from '~/types/calendar'
import dayjs from 'dayjs'

export const useDealStore = defineStore('deal', () => {
  const { t, localized } = useI18n()
  // --- State ---
  const currentDeal = ref<Deal | null>(null)
  const dealVariants = ref<DealVariant[]>([])
  const travelGroup = ref<TravelGroup>({
    adults: 2,
    children: [],
    rooms: 1,
  })
  const selectedRoomId = ref<string>('')
  const checkInDate = ref<string | null>(null)
  const checkOutDate = ref<string | null>(null)
  const dateAvailability = ref<DateAvailability[]>([])
  const isTravelGroupModalOpen = ref(false)
  const roomUnavailableMessage = ref<string | null>(null)
  const previousCheckInDate = ref<string | null>(null)

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

  /** Price calculations for current configuration */
  const pricing = computed<TravelGroupPricing>(() => {
    if (!currentDeal.value) {
      return { totalPrice: 0, originalPrice: 0, pricePerPerson: 0, breakdown: [] }
    }

    const deal = currentDeal.value
    const persons = totalPersons.value
    const rooms = travelGroup.value.rooms
    const extraPersons = Math.max(0, persons - 2) // base deal is for 2

    // Base deal price (for 2 persons, 1 room)
    const baseDealPrice = deal.basePrice

    // Extra persons cost (per person per night)
    const extraPersonCost = extraPersons * 89 * deal.nights

    // Extra rooms cost
    const extraRoomsCost = Math.max(0, rooms - 1) * 109 * deal.nights

    // Room upgrade
    const roomUpgrade = roomUpgradeCost.value * rooms

    // Children discount: 50% for children under 12
    const childrenDiscount = travelGroup.value.children
      .filter(c => c.age < 12)
      .length * Math.round(89 * deal.nights * 0.5)

    const totalPrice = baseDealPrice + extraPersonCost + extraRoomsCost + roomUpgrade - childrenDiscount
    const originalMultiplier = 1 / (1 - deal.discountPercentage / 100)
    const originalPrice = Math.round(totalPrice * originalMultiplier)
    const pricePerPerson = Math.round(totalPrice / Math.max(1, persons))

    const breakdown: { label: string; amount: number }[] = [
      { label: localized(deal.title), amount: baseDealPrice },
    ]

    if (extraPersonCost > 0) {
      breakdown.push({ label: `${extraPersons} ${t('store.extraPerson')} ${extraPersons === 1 ? t('common.personSingular') : t('common.personPlural')}`, amount: extraPersonCost })
    }
    if (extraRoomsCost > 0) {
      breakdown.push({ label: `${rooms - 1} ${t('store.extraPerson')} ${rooms - 1 === 1 ? t('common.roomSingular') : t('common.roomPlural')}`, amount: extraRoomsCost })
    }
    if (roomUpgrade > 0) {
      breakdown.push({ label: `${t('store.roomUpgrade')} ${localized(selectedRoom.value!.name)}`, amount: roomUpgrade })
    }
    if (childrenDiscount > 0) {
      breakdown.push({ label: t('store.childDiscount'), amount: -childrenDiscount })
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
    travelGroup.value = { ...group }
  }

  /** Select a room */
  function selectRoom(roomId: string) {
    selectedRoomId.value = roomId
  }

  /** Set check-in date */
  function setCheckIn(date: string) {
    // If a paid upgrade was selected, show unavailability popup (don't change room yet)
    if (currentDeal.value && selectedRoom.value && !selectedRoom.value.isDefault) {
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
    // Getters
    totalPersons,
    travelGroupSummary,
    selectedRoom,
    roomUpgradeCost,
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
