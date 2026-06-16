// `nl-BE` is Belgian Dutch (Vlaams) — it reuses the `nl` translations
// and LocalizedString values, but is a distinct selectable language.
export type Locale = 'nl' | 'nl-BE' | 'en' | 'de'

export type LocalizedString = {
  nl: string
  en: string
  /** Optional German override. When absent, `localized()` falls back to `nl`. */
  de?: string
}
