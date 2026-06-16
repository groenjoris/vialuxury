import { useSecondReleaseLocaleStore } from '~/stores-second-release/locale'
import type { LocalizedString } from '~/i18n/types'
import nl from '~/i18n/nl'
import en from '~/i18n/en'
import de from '~/i18n/de'

const maps = { nl, en, de, 'nl-BE': nl } as const

export function useSecondReleaseI18n() {
  const store = useSecondReleaseLocaleStore()

  /**
   * Translate a UI string by key.
   * Falls back to the NL string when a key is missing in the active
   * locale (defence against partial translations — DE is the most
   * recent addition and may be incomplete). Returns the key itself
   * as final fallback if not found in any locale.
   */
  function t(key: string): string {
    return maps[store.locale][key] ?? maps.nl[key] ?? key
  }

  /**
   * Resolve a LocalizedString object to the current locale.
   */
  function localized(value: LocalizedString | string): string {
    if (typeof value === 'string') return value
    return value[store.locale] ?? value.nl ?? String(value)
  }

  return {
    t,
    localized,
    locale: computed(() => store.locale),
  }
}
