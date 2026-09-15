import dayjs from 'dayjs'
import 'dayjs/locale/nl'

dayjs.locale('nl')

const DUTCH_MONTHS = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
]

const DUTCH_MONTHS_SHORT = [
  'jan', 'feb', 'mrt', 'apr', 'mei', 'jun',
  'jul', 'aug', 'sep', 'okt', 'nov', 'dec',
]

const DUTCH_DAYS = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag']
const DUTCH_DAYS_SHORT = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']

/**
 * Format date as "15 maart 2026"
 */
export function formatDateLong(date: string): string {
  const d = dayjs(date)
  return `${d.date()} ${DUTCH_MONTHS[d.month()]} ${d.year()}`
}

/**
 * Format date as "15 mrt"
 */
export function formatDateShort(date: string): string {
  const d = dayjs(date)
  return `${d.date()} ${DUTCH_MONTHS_SHORT[d.month()]}`
}

/**
 * Get Dutch month name
 */
export function getDutchMonthName(month: number): string {
  return DUTCH_MONTHS[month]
}

/**
 * Get Dutch short day names for calendar headers
 */
export function getDutchDayHeaders(): string[] {
  // Start with Monday (Dutch convention)
  return ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']
}

/**
 * Format date as "do 15 mrt" (weekday short, lower-case — same notation as
 * the arrival pill on the results page). Multi Hotel Trip: check-in/check-out
 * per hotel on the vakantie-PDP.
 */
export function formatDateWeekdayShort(date: string): string {
  const d = dayjs(date)
  const day = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'][d.day()]
  return `${day} ${d.date()} ${DUTCH_MONTHS_SHORT[d.month()]}`
}
