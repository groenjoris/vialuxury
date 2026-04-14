import { arrangementTerZand } from '~/data/mock/hotel-ter-zand'
import { generateAvailability } from '~/data/mock/pricing-matrix'
import type { BookingConfiguration } from '~/types/booking'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  const query = getQuery(event)

  if (slug !== 'ter-zand') {
    throw createError({ statusCode: 404, statusMessage: 'Hotel niet gevonden' })
  }

  const year = parseInt(query.year as string) || new Date().getFullYear()
  const month = parseInt(query.month as string) || new Date().getMonth() + 1

  const config: BookingConfiguration = {
    hotelSlug: slug,
    nights: parseInt(query.nights as string) || arrangementTerZand.baseNights,
    persons: parseInt(query.persons as string) || arrangementTerZand.basePersons,
    roomTypeId: (query.room as string) || arrangementTerZand.roomTypes.find((r) => r.isDefault)?.id || '',
    selectedExtras: query.extras ? (query.extras as string).split(',') : [],
    checkInDate: null,
    checkOutDate: null,
  }

  const availability = generateAvailability(year, month, config, arrangementTerZand)

  return { availability, year, month }
})
