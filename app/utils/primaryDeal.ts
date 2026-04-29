import type { SearchHotelDeal } from '~/types/searchHotel'

/**
 * Pick the most attractive deal of a hotel for the listing card.
 *  - Prefer dinner-inclusive deals
 *  - Within those, shortest stay
 *  - Tiebreaker: cheapest base price
 *  - No dinner deals at all? Just cheapest.
 */
export function pickPrimaryDeal(deals: SearchHotelDeal[]): SearchHotelDeal {
  if (deals.length === 1) return deals[0]
  const dinner = deals.filter(d => d.hasDinner)
  if (dinner.length > 0) {
    return [...dinner].sort(
      (a, b) => a.nights - b.nights || a.basePrice - b.basePrice,
    )[0]
  }
  return [...deals].sort((a, b) => a.basePrice - b.basePrice)[0]
}
