import { defineStore } from 'pinia'
import type { Locale } from '~/i18n/types'

export const useNorthstarLocaleStore = defineStore('northstar-locale', () => {
  const locale = ref<Locale>('nl')

  // Restore from localStorage on client
  if (import.meta.client) {
    const saved = localStorage.getItem('vialuxury-locale') as Locale | null
    if (saved === 'en' || saved === 'nl') {
      locale.value = saved
    }
  }

  function setLocale(l: Locale) {
    locale.value = l
    if (import.meta.client) {
      localStorage.setItem('vialuxury-locale', l)
      document.documentElement.lang = l
    }
  }

  return { locale, setLocale }
})
