import { defineStore } from 'pinia'
import type { Arrangement, BookingConfiguration, PriceBreakdown } from '~/types/booking'
import type { DateAvailability } from '~/types/calendar'
import { calculatePrice } from '~/data/mock/pricing-matrix'
import dayjs from 'dayjs'

export const useNorthstarBookingStore = defineStore('northstar-booking', () => {
  // --- State ---
  const arrangement = ref<Arrangement | null>(null)
  const configuration = ref<BookingConfiguration>({
    hotelSlug: '',
    nights: 2,
    persons: 2,
    roomTypeId: '',
    selectedExtras: [],
    checkInDate: null,
    checkOutDate: null,
  })
  const dateAvailability = ref<DateAvailability[]>([])
  const isLoading = ref(false)

  // --- Getters ---

  /**
   * Returns the list of included items with dynamic titles
   * based on the current configuration (e.g., "3 x Overnachting").
   */
  const includedItems = computed(() => {
    if (!arrangement.value) return []
    return arrangement.value.baseItems
      .filter((item) => item.included)
      .map((item) => {
        let title = item.title
        if (item.isPerNight) {
          title = item.titleTemplate.replace('{count}', String(configuration.value.nights))
        }
        return { ...item, title }
      })
  })

  /**
   * Returns the selected extras as full objects.
   */
  const selectedExtrasDetails = computed(() => {
    if (!arrangement.value) return []
    return arrangement.value.configurableExtras.filter((extra) =>
      configuration.value.selectedExtras.includes(extra.id),
    )
  })

  /**
   * Computes the full price breakdown based on current configuration.
   */
  const priceBreakdown = computed<PriceBreakdown>(() => {
    if (!arrangement.value) {
      return {
        basePrice: 0,
        roomUpgradePrice: 0,
        extrasPrice: 0,
        totalBeforeDiscount: 0,
        discountPercentage: 0,
        discountAmount: 0,
        finalPrice: 0,
        pricePerPerson: 0,
      }
    }
    return calculatePrice(configuration.value, arrangement.value)
  })

  /**
   * Currently selected room type.
   */
  const selectedRoomType = computed(() => {
    if (!arrangement.value) return null
    return arrangement.value.roomTypes.find((r) => r.id === configuration.value.roomTypeId) ?? null
  })

  /**
   * Checks if all required fields are filled for booking.
   */
  const isBookingReady = computed(() => {
    return (
      configuration.value.checkInDate !== null &&
      configuration.value.checkOutDate !== null &&
      configuration.value.nights >= 1 &&
      configuration.value.persons >= 1 &&
      configuration.value.roomTypeId !== ''
    )
  })

  /**
   * Formatted check-in date in Dutch.
   */
  const formattedCheckIn = computed(() => {
    if (!configuration.value.checkInDate) return null
    return dayjs(configuration.value.checkInDate).format('DD MMM YYYY')
  })

  /**
   * Formatted check-out date in Dutch.
   */
  const formattedCheckOut = computed(() => {
    if (!configuration.value.checkOutDate) return null
    return dayjs(configuration.value.checkOutDate).format('DD MMM YYYY')
  })

  // --- Actions ---

  /**
   * Initialize the store with arrangement data.
   */
  function initializeArrangement(arr: Arrangement) {
    arrangement.value = arr
    configuration.value = {
      hotelSlug: arr.hotelSlug,
      nights: arr.baseNights,
      persons: arr.basePersons,
      roomTypeId: arr.roomTypes.find((r) => r.isDefault)?.id ?? arr.roomTypes[0]?.id ?? '',
      selectedExtras: arr.configurableExtras.filter((e) => e.defaultSelected).map((e) => e.id),
      checkInDate: null,
      checkOutDate: null,
    }
  }

  /**
   * Set the number of nights and auto-update checkout date.
   */
  function setNights(nights: number) {
    if (!arrangement.value) return
    const clamped = Math.max(arrangement.value.minNights, Math.min(arrangement.value.maxNights, nights))
    configuration.value.nights = clamped
    updateCheckOutDate()
  }

  /**
   * Set the number of persons.
   */
  function setPersons(persons: number) {
    if (!arrangement.value) return
    const clamped = Math.max(arrangement.value.minPersons, Math.min(arrangement.value.maxPersons, persons))
    configuration.value.persons = clamped
  }

  /**
   * Set the room type.
   */
  function setRoomType(roomTypeId: string) {
    configuration.value.roomTypeId = roomTypeId
  }

  /**
   * Toggle an extra on/off.
   */
  function toggleExtra(extraId: string) {
    const index = configuration.value.selectedExtras.indexOf(extraId)
    if (index === -1) {
      configuration.value.selectedExtras.push(extraId)
    } else {
      configuration.value.selectedExtras.splice(index, 1)
    }
  }

  /**
   * Set check-in date and auto-compute check-out.
   */
  function setCheckInDate(date: string) {
    configuration.value.checkInDate = date
    updateCheckOutDate()
  }

  /**
   * Clear selected dates.
   */
  function clearDates() {
    configuration.value.checkInDate = null
    configuration.value.checkOutDate = null
  }

  /**
   * Update check-out date based on check-in + nights.
   */
  function updateCheckOutDate() {
    if (configuration.value.checkInDate) {
      configuration.value.checkOutDate = dayjs(configuration.value.checkInDate)
        .add(configuration.value.nights, 'day')
        .format('YYYY-MM-DD')
    }
  }

  /**
   * Set date availability data (from API or mock).
   */
  function setDateAvailability(data: DateAvailability[]) {
    dateAvailability.value = data
  }

  /**
   * Apply configuration from URL query params.
   */
  function applyFromQuery(query: Record<string, string>) {
    if (!arrangement.value) return

    if (query.nights) setNights(parseInt(query.nights))
    if (query.persons) setPersons(parseInt(query.persons))
    if (query.room) setRoomType(query.room)
    if (query.extras) {
      configuration.value.selectedExtras = query.extras.split(',').filter(Boolean)
    }
    if (query.checkin) setCheckInDate(query.checkin)
  }

  /**
   * Get current configuration as URL query params.
   */
  const queryParams = computed(() => {
    const params: Record<string, string> = {}
    if (!arrangement.value) return params

    if (configuration.value.nights !== arrangement.value.baseNights) {
      params.nights = String(configuration.value.nights)
    }
    if (configuration.value.persons !== arrangement.value.basePersons) {
      params.persons = String(configuration.value.persons)
    }
    const defaultRoom = arrangement.value.roomTypes.find((r) => r.isDefault)?.id
    if (configuration.value.roomTypeId !== defaultRoom) {
      params.room = configuration.value.roomTypeId
    }
    if (configuration.value.selectedExtras.length > 0) {
      params.extras = configuration.value.selectedExtras.join(',')
    }
    if (configuration.value.checkInDate) {
      params.checkin = configuration.value.checkInDate
    }

    return params
  })

  return {
    // State
    arrangement,
    configuration,
    dateAvailability,
    isLoading,
    // Getters
    includedItems,
    selectedExtrasDetails,
    priceBreakdown,
    selectedRoomType,
    isBookingReady,
    formattedCheckIn,
    formattedCheckOut,
    queryParams,
    // Actions
    initializeArrangement,
    setNights,
    setPersons,
    setRoomType,
    toggleExtra,
    setCheckInDate,
    clearDates,
    setDateAvailability,
    applyFromQuery,
  }
})
