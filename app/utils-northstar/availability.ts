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

/**
 * Expand a "flexible" arrival date into the candidate window.
 * `flexibility = 0` → just the date itself.
 * `flexibility = 3` → 7 dates (date − 3 ... date + 3).
 * Returns an array of YYYY-MM-DD strings.
 */
export function expandFlex(isoDate: string, flexibility: number): string[] {
  if (!isoDate) return []
  const flex = Math.max(0, Math.min(14, flexibility | 0))
  if (flex === 0) return [isoDate]
  const [y, m, d] = isoDate.split('-').map((s) => parseInt(s, 10))
  const center = new Date(Date.UTC(y, m - 1, d))
  const out: string[] = []
  for (let dx = -flex; dx <= flex; dx++) {
    const dt = new Date(center.getTime() + dx * 86400000)
    const ys = dt.getUTCFullYear()
    const ms = String(dt.getUTCMonth() + 1).padStart(2, '0')
    const ds = String(dt.getUTCDate()).padStart(2, '0')
    out.push(`${ys}-${ms}-${ds}`)
  }
  return out
}

/** Does the deal have at least one available date within the flex window? */
export function isDealAvailableInWindow(
  dealId: string,
  isoDate: string,
  flexibility: number,
): boolean {
  if (!isoDate) return true
  const days = expandFlex(isoDate, flexibility)
  return days.some((d) => isDealAvailable(dealId, d))
}
