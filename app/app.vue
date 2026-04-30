<template>
  <NuxtPage />
</template>

<script setup lang="ts">
import { useLocaleStore } from '~/stores/locale'

const localeStore = useLocaleStore()

useHead({
  htmlAttrs: {
    lang: computed(() => localeStore.locale),
  },
})

// User-test partner co-branding + cross-tab arrival-date carry: pick up
// sessionStorage on mount and read URL query params (`?partner=nu`,
// `?checkin=YYYY-MM-DD`) so a new tab opened from a search-card link
// (target=_blank, where Chrome may not clone sessionStorage) still lands
// on the right month with the right date selected.
const route = useRoute()
const { restore, set } = usePartner()
const { restoreSearchSession, setArrivalDate, arrivalDate } = useSearchState()

function applyCheckinFromUrl(val: unknown) {
  if (typeof val !== 'string') return
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return
  if (val !== arrivalDate.value) setArrivalDate(val)
}

onMounted(() => {
  restore()
  restoreSearchSession()
  const p = route.query.partner
  if (p === 'nu') set('nu')
  applyCheckinFromUrl(route.query.checkin)
})
watch(() => route.query.partner, (val) => {
  if (val === 'nu') set('nu')
})
watch(() => route.query.checkin, applyCheckinFromUrl)
</script>
