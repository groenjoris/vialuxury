<template>
  <NuxtPage />
</template>

<script setup lang="ts">
import { useLocaleStore } from '~/stores/locale'
import { useHomeVariant } from '~/composables/useHomeVariant'

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
const {
  restoreSearchSession, setArrivalDate, arrivalDate,
  setSearchGroup, persons: globalPersons, rooms: globalRooms,
} = useSearchState()
// Northstar mirror — separate restore so reloading on /northstar/* keeps
// its own filter state (independent localStorage namespace).
const { restore: restoreNs } = useNorthstarPartner()
const { restoreSearchSession: restoreSearchSessionNs } = useNorthstarSearchState()
// Homepage variant ('1' / '2' / '3' / '4') — restored from URL first,
// then localStorage. The active variant is also reflected on <body> as
// `vl-variant-2` etc., so global CSS (e.g. variant-2.css) can re-style
// shared components (DealCard, etc.) consistently across all pages.
const { restoreHomeVariant, homeVariant } = useHomeVariant()

function applyCheckinFromUrl(val: unknown) {
  if (typeof val !== 'string') return
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return
  if (val !== arrivalDate.value) setArrivalDate(val)
}

function applyGroupFromUrl(p: unknown, r: unknown) {
  const personsNum = typeof p === 'string' ? Number(p) : NaN
  const roomsNum = typeof r === 'string' ? Number(r) : NaN
  if (!Number.isFinite(personsNum) || personsNum <= 0) return
  const finalRooms = Number.isFinite(roomsNum) && roomsNum > 0 ? roomsNum : globalRooms.value
  if (personsNum !== globalPersons.value || finalRooms !== globalRooms.value) {
    setSearchGroup(personsNum, finalRooms)
  }
}

onMounted(() => {
  restore()
  restoreSearchSession()
  restoreNs()
  restoreSearchSessionNs()
  restoreHomeVariant(route.path)
  const p = route.query.partner
  if (p === 'nu') set('nu')
  applyCheckinFromUrl(route.query.checkin)
  applyGroupFromUrl(route.query.persons, route.query.rooms)
})
// Re-evaluate variant when the user navigates between /home and /home-v2.
watch(() => route.path, (p) => restoreHomeVariant(p))

// Reflect the active variant on <body> so global CSS rules can target
// it (e.g. variant-2.css restyles deal cards everywhere when v2 is
// active). Re-runs whenever the active variant changes.
watch(homeVariant, (v) => {
  if (!import.meta.client) return
  const body = document.body
  body.classList.remove('vl-variant-1', 'vl-variant-2', 'vl-variant-3', 'vl-variant-4', 'vl-variant-5', 'vl-variant-hf')
  body.classList.add(`vl-variant-${v}`)
}, { immediate: true })
watch(() => route.query.partner, (val) => {
  if (val === 'nu') set('nu')
})
watch(() => route.query.checkin, applyCheckinFromUrl)
watch(() => [route.query.persons, route.query.rooms], ([p, r]) => applyGroupFromUrl(p, r))
</script>
