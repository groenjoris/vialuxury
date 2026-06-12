/** Supported locale codes. */
export type Locale = 'nl' | 'en' | 'de'

/** A string localized into supported languages. */
export type LocalizedString = {
  /** Dutch translation. */
  nl: string
  /** English translation. */
  en: string
  /** German translation. Falls back to `nl` when absent. */
  de?: string
}
