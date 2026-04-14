import type { DateAvailability } from '~/types/calendar'
import type { BookingConfiguration, PriceBreakdown } from '~/types/booking'
import type { Arrangement } from '~/types/booking'
import dayjs from 'dayjs'

/**
 * Calculate the total price for a booking configuration.
 */
export function calculatePrice(
  config: BookingConfiguration,
  arrangement: Arrangement,
): PriceBreakdown {
  // Base price: per night cost
  const basePrice = arrangement.basePricePerNight * config.nights * config.persons

  // Room upgrade cost
  const selectedRoom = arrangement.roomTypes.find((r) => r.id === config.roomTypeId)
  const roomUpgradePrice = (selectedRoom?.pricePerNight ?? 0) * config.nights

  // Extras cost
  let extrasPrice = 0
  for (const extraId of config.selectedExtras) {
    const extra = arrangement.configurableExtras.find((e) => e.id === extraId)
    if (!extra) continue

    switch (extra.pricingBasis) {
      case 'flat':
        extrasPrice += extra.pricePerUnit
        break
      case 'per_night':
        extrasPrice += extra.pricePerUnit * config.nights
        break
      case 'per_person':
        extrasPrice += extra.pricePerUnit * config.persons
        break
      case 'per_person_per_night':
        extrasPrice += extra.pricePerUnit * config.persons * config.nights
        break
    }
  }

  const totalBeforeDiscount = basePrice + roomUpgradePrice + extrasPrice
  const discountPercentage = arrangement.discountPercentage
  const discountAmount = Math.round(totalBeforeDiscount * (discountPercentage / 100))
  const finalPrice = totalBeforeDiscount - discountAmount
  const pricePerPerson = Math.round(finalPrice / config.persons)

  return {
    basePrice,
    roomUpgradePrice,
    extrasPrice,
    totalBeforeDiscount,
    discountPercentage,
    discountAmount,
    finalPrice,
    pricePerPerson,
  }
}

/**
 * Generate mock date availability for a given month.
 * Prices vary by day of week (weekends more expensive).
 */
export function generateAvailability(
  year: number,
  month: number,
  config: BookingConfiguration,
  arrangement: Arrangement,
): DateAvailability[] {
  const availability: DateAvailability[] = []
  const startOfMonth = dayjs(`${year}-${String(month).padStart(2, '0')}-01`)
  const daysInMonth = startOfMonth.daysInMonth()
  const today = dayjs()

  for (let day = 1; day <= daysInMonth; day++) {
    const date = startOfMonth.date(day)
    const dateStr = date.format('YYYY-MM-DD')
    const dayOfWeek = date.day() // 0 = Sunday

    // Not available in the past
    if (date.isBefore(today, 'day')) {
      availability.push({
        date: dateStr,
        available: false,
        totalPrice: 0,
      })
      continue
    }

    // Weekend premium: Friday & Saturday check-ins are more expensive
    let nightlyRate = arrangement.basePricePerNight
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      nightlyRate = Math.round(nightlyRate * 1.15) // 15% weekend premium
    }

    // Calculate total for this check-in date with current config
    const totalBeforeDiscount = nightlyRate * config.nights * config.persons
    const discount = Math.round(totalBeforeDiscount * (arrangement.discountPercentage / 100))
    const totalPrice = totalBeforeDiscount - discount

    // Some random dates are unavailable (simulate bookings)
    const isAvailable = !(day % 7 === 0 && dayOfWeek === 3) // Block some Wednesdays

    availability.push({
      date: dateStr,
      available: isAvailable,
      totalPrice,
      originalPrice: totalBeforeDiscount,
      discountPercentage: arrangement.discountPercentage,
    })
  }

  return availability
}
