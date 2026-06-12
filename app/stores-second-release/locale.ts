import { defineStore } from 'pinia'
import type { Locale } from '~/i18n/types'

export const useSecondReleaseLocaleStore = defineStore('second-release-locale', () => {
  const locale = ref<Locale>('nl')

  function setLocale(l: Locale) {
    locale.value = l
    if (import.meta.client) {
      localStorage.setItem('vialuxury-locale', l)
      document.documentElement.lang = l
    }
  }

  function restoreLocale() {
    if (!import.meta.client) return
    const saved = localStorage.getItem('vialuxury-locale') as Locale | null
    if (saved === 'en' || saved === 'nl' || saved === 'de') {
      locale.value = saved
      document.documentElement.lang = saved
    }
  }

  return { locale, setLocale, restoreLocale }
})
