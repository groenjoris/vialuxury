import { hotelTerZand, arrangementTerZand } from '~/data/mock/hotel-ter-zand'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')

  // For now, only one hotel in mock data
  if (slug === 'ter-zand') {
    return {
      hotel: hotelTerZand,
      arrangement: arrangementTerZand,
    }
  }

  throw createError({
    statusCode: 404,
    statusMessage: 'Hotel niet gevonden',
  })
})
