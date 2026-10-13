<script setup lang="ts">
// Multi Hotel Trip checkout — de routes van je vakantie: aparte pagina ná het boeken
// (knop "Bekijk de routes" op de bevestiging). Per etappe (thuis → hotel 1 → … → thuis)
// de afstand en reistijd uit de reisdata, met "Download GPX", "Download PDF" en "Open in Google Maps"
// (prototype: knoppen zonder werking).
import { tripCheckoutBySlug } from '~/data/mht-checkout/trip'
import { tripPdpBySlug } from '~/data/mht-trip-pdp'
import { useMultiHotelTripCheckoutTrip } from '~/composables-multi-hotel-trip/useMultiHotelTripCheckoutTrip'
import { useMultiHotelTripMobileUa } from '~/composables-multi-hotel-trip/useMultiHotelTripMobileUa'

const isMobileUa = useMultiHotelTripMobileUa()
const DEMO_SLUG = 'ontdek-noord-frankrijk-en-de-opaalkust-in-7-dagen'
const { trip: checkoutTrip } = useMultiHotelTripCheckoutTrip()
const trip = computed(() => checkoutTrip.value ?? tripCheckoutBySlug(DEMO_SLUG)!)
const detail = computed(() => tripPdpBySlug(trip.value.slug)?.trip ?? null)

/* Etappes: thuis → hotel 1 → … → laatste hotel → thuis (of rondje terug naar hotel 1). */
const legs = computed(() => {
  const d = detail.value
  const names = trip.value.hotels.map(h => h.name)
  const home = d?.fromHome?.city ? `Thuis (${d.fromHome.city})` : 'Thuis'
  const fmtTravel = (t?: { km?: number; minutes: number }) => {
    if (!t) return ''
    const hrs = Math.floor(t.minutes / 60), min = t.minutes % 60
    const time = hrs ? `${hrs} u${min ? ` ${min} min` : ''}` : `${min} min`
    return t.km ? `${t.km} km · ${time}` : time
  }
  const out: { from: string; to: string; meta: string }[] = []
  if (names[0]) out.push({ from: home, to: names[0], meta: fmtTravel(d?.fromHomeByLocale?.nl ?? (d?.fromHome ? { minutes: d.fromHome.minutes } : undefined)) })
  for (let i = 1; i < names.length; i++) out.push({ from: names[i - 1]!, to: names[i]!, meta: fmtTravel(d?.stops[i]?.travel) })
  if (names.length) out.push({ from: names[names.length - 1]!, to: d?.loop ? names[0]! : home, meta: fmtTravel(d?.returnTravel) })
  return out
})
const byBike = computed(() => detail.value?.type === 'fiets')

useHead({ title: 'De routes van je vakantie — ViaLuxury' })
</script>

<template>
  <div class="mht-checkout page page--white rp" :class="{ 'page--m': isMobileUa }">
    <MultiHotelTripCheckoutMobileHeader v-if="isMobileUa" :step="3" />
    <MultiHotelTripCheckoutTopNav v-else />

    <main class="rp__main container">
      <NuxtLink class="rp__back" to="/multi-hotel-trip/checkout/bevestiging">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        Terug naar je boeking
      </NuxtLink>
      <p class="rp__eyebrow">{{ trip.typeLabel }} met {{ trip.hotels.length }} hotels</p>
      <h1 class="rp__title">De routes van je {{ trip.typeWord }}</h1>
      <p class="t-body c-grey rp__intro">
        Yvette heeft per etappe een mooie route samengesteld{{ byBike ? ', zo veel mogelijk over rustige fietspaden' : ', liefst over de mooie weg in plaats van de snelste' }}.
        Download ze als GPX voor je navigatie, als PDF om te printen, of open ze direct in Google Maps. Je krijgt deze routes ook per mail.
      </p>

      <ol class="rp__legs">
        <li v-for="(leg, i) in legs" :key="`${leg.from}-${leg.to}`" class="rp__leg">
          <span class="rp__num" aria-hidden="true">{{ i + 1 }}</span>
          <div class="rp__leg-body">
            <p class="rp__leg-title">{{ leg.from }} → {{ leg.to }}</p>
            <p v-if="leg.meta" class="t-caption c-mgrey">{{ leg.meta }}</p>
          </div>
          <div class="rp__leg-actions">
            <a class="btn-primary rp__btn" href="#" @click.prevent>Download GPX</a>
            <span class="rp__links">
              <a class="rp__link" href="#" @click.prevent>Download PDF</a>
              <span class="rp__sep" aria-hidden="true">·</span>
              <a class="rp__link" href="#" @click.prevent>Open in Google Maps</a>
            </span>
          </div>
        </li>
      </ol>

      <p class="t-caption c-mgrey rp__note">Routes zijn een suggestie: je bepaalt zelf je tempo en je tussenstops. De tips per hotel staan op de dealpagina en in je mail.</p>
    </main>

    <MultiHotelTripCheckoutFooter />
  </div>
</template>

<style scoped>
.page { min-height: 100vh; display: flex; flex-direction: column; }
.page--white { background: var(--c-white); }
.rp__main { flex: 1; padding-top: 28px; padding-bottom: 64px; max-width: 860px; }
.rp__back { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 20px; font-size: var(--t-body); font-weight: var(--w-medium); color: var(--c-via-black); text-decoration: underline; text-underline-offset: 2px; }
.rp__eyebrow { margin: 0 0 4px; font-size: var(--t-caption); font-weight: var(--w-medium); letter-spacing: 0.06em; text-transform: uppercase; color: var(--c-medium-grey); }
.rp__title { margin: 0 0 10px; font-size: var(--t-display); font-weight: var(--w-black); line-height: 1.15; }
.rp__intro { margin: 0 0 24px; max-width: 680px; }
.rp__legs { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.rp__leg {
  display: grid; grid-template-columns: 32px minmax(0, 1fr) auto; gap: 16px; align-items: center;
  padding: 16px 20px; border: 1px solid var(--c-light-grey); border-radius: var(--radius); background: var(--c-white);
}
.rp__num {
  display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%;
  background: var(--c-via-black); color: #fff; font-size: 13px; font-weight: 700;
}
.rp__leg p { margin: 0; }
.rp__leg-title { font-size: var(--t-body-lg); font-weight: 700; line-height: 1.3; }
.rp__leg-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.rp__btn { display: inline-flex; align-items: center; justify-content: center; width: auto; min-width: 160px; text-decoration: none; }
.rp__links { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.rp__sep { color: var(--c-medium-grey); font-size: var(--t-caption); }
.rp__link { font-size: var(--t-caption); color: var(--c-via-orange); text-decoration: underline; text-underline-offset: 2px; font-weight: var(--w-medium); }
.rp__note { margin: 20px 0 0; }
@media (max-width: 800px) {
  .rp__title { font-size: var(--t-h1); }
  .rp__leg { grid-template-columns: 28px minmax(0, 1fr); padding: 14px 16px; }
  .rp__leg-actions { grid-column: 2; align-items: stretch; gap: 8px; }
  .rp__btn { min-width: 0; width: 100%; }
  .rp__links { white-space: normal; flex-wrap: wrap; justify-content: center; }
}
</style>
