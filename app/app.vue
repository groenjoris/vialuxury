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
const {
  restoreSearchSession, setArrivalDate, arrivalDate,
  setSearchGroup, persons: globalPersons, rooms: globalRooms,
} = useSearchState()

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
  const p = route.query.partner
  if (p === 'nu') set('nu')
  applyCheckinFromUrl(route.query.checkin)
  applyGroupFromUrl(route.query.persons, route.query.rooms)
})
watch(() => route.query.partner, (val) => {
  if (val === 'nu') set('nu')
})
watch(() => route.query.checkin, applyCheckinFromUrl)
watch(() => [route.query.persons, route.query.rooms], ([p, r]) => applyGroupFromUrl(p, r))
</script>
