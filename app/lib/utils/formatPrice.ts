/**
 * Format a number as a Euro price string (no decimals).
 *
 * @param amount - The price in euros.
 * @returns Formatted string, e.g. 319 → "€319", 1299 → "€1.299".
 */
export function formatPrice(amount: number): string {
  return `€${amount.toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

/**
 * Format a number as a Euro price string with cents.
 *
 * @param amount - The price in euros (may include decimals).
 * @returns Formatted string, e.g. 319.50 → "€319,50".
 */
export function formatPriceWithCents(amount: number): string {
  return `€${amount.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
