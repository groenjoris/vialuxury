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

/**
 * Format a date string as a long Dutch date.
 *
 * @param date - An ISO date string (e.g. "2026-03-15").
 * @returns Formatted string, e.g. "15 maart 2026".
 */
export function formatDateLong(date: string): string {
  const d = dayjs(date)
  return `${d.date()} ${DUTCH_MONTHS[d.month()]} ${d.year()}`
}

/**
 * Format a date string as a short Dutch date.
 *
 * @param date - An ISO date string (e.g. "2026-03-15").
 * @returns Formatted string, e.g. "15 mrt".
 */
export function formatDateShort(date: string): string {
  const d = dayjs(date)
  return `${d.date()} ${DUTCH_MONTHS_SHORT[d.month()]}`
}

/**
 * Get the full Dutch name of a month.
 *
 * @param month - Zero-based month index (0 = januari, 11 = december).
 * @returns The Dutch month name, e.g. "maart".
 */
export function getDutchMonthName(month: number): string {
  return DUTCH_MONTHS[month]
}

/**
 * Get Dutch short day-name headers starting with Monday.
 *
 * @returns An array of two-letter day abbreviations: ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].
 */
export function getDutchDayHeaders(): string[] {
  return ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']
}
