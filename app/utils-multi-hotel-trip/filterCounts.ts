/**
 * Compute "would-be-available-deal" counts per filter item so the
 * search/kaart filter panel can show `(N)` after every checkbox and
 * grey out options that would yield zero results.
 *
 * Semantics (matches the UX spec):
 *  - Arrangement is AND within its group → for each arrangement item,
 *    count = deals that match all CURRENT filters AND this item too.
 *  - Thema / Specials / Reisduur are OR within their group → for each
 *    item, count = deals matching all OTHER category filters AND just
 *    this single item (the other current picks in the same OR group
 *    are ignored, so the count reflects "how many you'd add by
 *    selecting this").
 *
 *  Budget + arrival-date + destination filters always apply (they
 *  sit outside the checkbox groups and are not user-toggleable from
 *  within these counts).
 */
import type { SearchHotel, SearchHotelDeal } from '~/types/searchHotel'
import { getFilterTag, FILTER_TAGS } from './filterTags'

export interface FilterCountContext {
  hotels: readonly SearchHotel[]
  /** Per-person-adjusted price predicate. Should return true when the
   *  deal's basePrice falls inside the current budget for the active
   *  person count. */
  inBudget: (deal: SearchHotelDeal) => boolean
  /** Optional arrival-date / flex predicate. Should return true when
   *  the deal has at least one available date inside the flex window.
   *  When the user hasn't picked an arrival date, pass `undefined`. */
  isAvailableOnDate?: (deal: SearchHotelDeal) => boolean
  /** Optional hotel-level destination filter. When null/undefined the
   *  destination filter is considered inactive. */
  matchesDestination?: (hotel: SearchHotel) => boolean
  /** Current selected night keys ("1", "2", …, "5+"). */
  selectedNights: readonly string[]
  /** Currently checked filter-tag ids (across arrangement/thema/
   *  specials — the function partitions them internally). */
  selectedTagIds: readonly string[]
}

function nightKeyFor(deal: SearchHotelDeal): string {
  return deal.nights >= 5 ? '5+' : String(deal.nights)
}

function matchesNights(deal: SearchHotelDeal, nights: readonly string[]): boolean {
  if (nights.length === 0) return true
  return nights.includes(nightKeyFor(deal))
}

function partitionTags(ids: readonly string[]) {
  const arrangement: string[] = []
  const thema: string[] = []
  const specials: string[] = []
  for (const id of ids) {
    const tag = getFilterTag(id)
    if (!tag) continue
    if (tag.category === 'arrangement') arrangement.push(id)
    else if (tag.category === 'thema') thema.push(id)
    else if (tag.category === 'specials') specials.push(id)
  }
  return { arrangement, thema, specials }
}

function dealMatchesArrangementAll(deal: SearchHotelDeal, hotel: SearchHotel, ids: readonly string[]): boolean {
  for (const id of ids) {
    const tag = getFilterTag(id)
    if (!tag) continue
    if (!tag.matches(deal, hotel)) return false
  }
  return true
}

function dealMatchesAnyTag(deal: SearchHotelDeal, hotel: SearchHotel, ids: readonly string[]): boolean {
  if (ids.length === 0) return true
  for (const id of ids) {
    const tag = getFilterTag(id)
    if (tag?.matches(deal, hotel)) return true
  }
  return false
}

/** Walk every deal across every hotel and count those that satisfy the
 *  given category overrides + the always-on (budget, date, destination)
 *  filters. */
function countDeals(
  ctx: FilterCountContext,
  overrides: {
    nights?: readonly string[]
    arrangement?: readonly string[]
    thema?: readonly string[]
    specials?: readonly string[]
  },
): number {
  const partitioned = partitionTags(ctx.selectedTagIds)
  const nights = overrides.nights ?? ctx.selectedNights
  const arrangement = overrides.arrangement ?? partitioned.arrangement
  const thema = overrides.thema ?? partitioned.thema
  const specials = overrides.specials ?? partitioned.specials

  let count = 0
  for (const hotel of ctx.hotels) {
    if (ctx.matchesDestination && !ctx.matchesDestination(hotel)) continue
    for (const deal of hotel.deals) {
      if (!ctx.inBudget(deal)) continue
      if (ctx.isAvailableOnDate && !ctx.isAvailableOnDate(deal)) continue
      if (!matchesNights(deal, nights)) continue
      if (!dealMatchesArrangementAll(deal, hotel, arrangement)) continue
      // Thema / Specials are OR-within-group; only enforce when any are
      // present in the override.
      if (thema.length > 0 && !dealMatchesAnyTag(deal, hotel, thema)) continue
      if (specials.length > 0 && !dealMatchesAnyTag(deal, hotel, specials)) continue
      count++
    }
  }
  return count
}

/** Build a `{ itemValue → count }` lookup for every filter item the
 *  panel renders (tags + night keys). */
export function computeFilterCounts(ctx: FilterCountContext): Record<string, number> {
  const out: Record<string, number> = {}
  const { arrangement, thema, specials } = partitionTags(ctx.selectedTagIds)

  for (const tag of FILTER_TAGS) {
    if (tag.category === 'arrangement') {
      // AND group → "if I add this item to my current arrangement
      // picks, how many deals stay?"
      const next = arrangement.includes(tag.id) ? arrangement : [...arrangement, tag.id]
      out[tag.id] = countDeals(ctx, { arrangement: next })
    } else if (tag.category === 'thema') {
      // OR group → "deals matching this theme + every other category's
      // current filters" (ignore the other thema picks).
      out[tag.id] = countDeals(ctx, { thema: [tag.id] })
    } else if (tag.category === 'specials') {
      out[tag.id] = countDeals(ctx, { specials: [tag.id] })
    }
  }

  for (const key of ['1', '2', '3', '4', '5+']) {
    out[key] = countDeals(ctx, { nights: [key] })
  }

  return out
}
