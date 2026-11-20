/**
 * Format a number as a Euro price string.
 * Example: 319 → "€319"
 * Example: 1299 → "€1.299"
 */
export function formatPrice(amount: number): string {
  return `€${amount.toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

/**
 * Format a price with cents.
 * Example: 319.50 → "€319,50"
 */
export function formatPriceWithCents(amount: number): string {
  return `€${amount.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
