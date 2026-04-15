import { useLocaleStore } from '~/stores/locale'
import type { LocalizedString } from '~/i18n/types'
import nl from '~/i18n/nl'
import en from '~/i18n/en'

const maps = { nl, en } as const

export function useI18n() {
  const store = useLocaleStore()

  /**
   * Translate a UI string by key.
   * Returns the key itself as fallback if not found.
   */
  function t(key: string): string {
    return maps[store.locale][key] ?? key
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
