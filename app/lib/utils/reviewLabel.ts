/**
 * Map a review score (1-10 scale) to an i18n key for its label.
 *
 * @param score - The review score (1-10).
 * @returns An i18n key such as "review.excellent" or "review.good".
 */
export function getReviewLabelKey(score: number): string {
  if (score >= 9.9) return 'review.outstanding'
  if (score >= 9) return 'review.excellent'
  if (score >= 8) return 'review.veryGood'
  if (score >= 7) return 'review.good'
  if (score >= 6) return 'review.sufficient'
  if (score >= 5) return 'review.fair'
  return 'review.poor'
}
