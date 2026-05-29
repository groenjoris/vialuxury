export type Locale = 'nl' | 'en' | 'de'

export type LocalizedString = {
  nl: string
  en: string
  /** Optional German override. When absent, `localized()` falls back to `nl`. */
  de?: string
}
