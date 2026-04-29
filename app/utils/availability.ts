/**
 * Availability lookup driven by `app/data/availability.json`.
 *
 * The JSON ships 16 named bitstring patterns (31 chars = day-of-month,
 * repeated for every month, 1=available 0=sold-out) and a `byPackageId`
 * map assigning each package to one pattern. Same date+package always
 * returns the same boolean — so the search-page card, the deal-page
 * calendar, and the map all stay in sync.
 */

import availabilityRaw from '~/data/availability.json'

interface AvailabilityFile {
  patterns: Record<string, string>
  byPackageId: Record<string, string>
}

const data = availabilityRaw as unknown as AvailabilityFile

/** Strip the `pkg-` prefix used by the SearchHotelDeal type to get the raw id. */
function rawPkgId(dealId: string): string {
  return dealId.startsWith('pkg-') ? dealId.slice(4) : dealId
}

/**
 * Is the deal available on the given ISO date (YYYY-MM-DD)?
 * Falls back to `true` when the deal/pattern isn't in the JSON (rather than
 * silently marking unmapped deals as sold out).
 */
export function isDealAvailable(dealId: string, isoDate: string): boolean {
  const id = rawPkgId(dealId)
  const patternKey = data.byPackageId[id]
  if (!patternKey) return true
  const pattern = data.patterns[patternKey]
  if (!pattern) return true
  const day = parseInt(isoDate.slice(8, 10), 10)
  if (!Number.isFinite(day) || day < 1 || day > 31) return true
  return pattern[day - 1] === '1'
}
