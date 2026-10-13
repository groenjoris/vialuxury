<script setup lang="ts">
// Multi Hotel Trip — persoonlijke reispagina na het boeken ("Tips & routes speciaal voor
// <voornaam>"), bereikbaar via de bevestigingspagina en de bevestigingsmail en bedoeld om
// de hele reis bij de hand te hebben: hero met de reis en (nog gefakete) weersverwachting,
// de route tussen de hotels (lijst + witte routeschets), routes rondom elk hotel, het
// voorbeeld reisschema (sidepanel + pdf) en je hotels op een rij. De links Bekijk /
// Download pdf / Download gpx zijn in het prototype nog zonder werking, behalve "Bekijk"
// bij de route tussen de hotels (fullscreen kaart) en bij het reisschema (sidepanel).
import { tripCheckoutBySlug } from '~/data/mht-checkout/trip'
import { tripPdpBySlug } from '~/data/mht-trip-pdp'
import tripRoutesJson from '~/data/mht-trip-routes.json'
import type { TripRouteLeg } from '~/utils-multi-hotel-trip/tripMapLayers'
import { useMultiHotelTripCheckoutTrip } from '~/composables-multi-hotel-trip/useMultiHotelTripCheckoutTrip'
import { useMultiHotelTripI18n } from '~/composables-multi-hotel-trip/useMultiHotelTripI18n'
import { buildTripDaysView, tripDistanceLabelFn } from '~/composables-multi-hotel-trip/useMultiHotelTripDaysView'
import TripItineraryPanel from '~/components-multi-hotel-trip/deal/TripItineraryPanel.vue'

const { t, localized } = useMultiHotelTripI18n()

/* ── Reis + gast (gedeelde checkout-state; zonder checkout de Opaalkust-demo) ── */
const DEMO_SLUG = 'ontdek-noord-frankrijk-en-de-opaalkust-in-7-dagen'
const { trip: checkoutTrip, day: checkoutDay } = useMultiHotelTripCheckoutTrip()
const checkout = computed(() => checkoutTrip.value ?? tripCheckoutBySlug(DEMO_SLUG)!)
const tripPdp = computed(() => tripPdpBySlug(checkout.value.slug))
const trip = computed(() => tripPdp.value?.trip ?? null)
const guest = useState<{ firstName: string; email: string } | null>('mht-checkout-guest', () => null)
const firstName = computed(() => guest.value?.firstName || 'Rijo')
const isBike = computed(() => trip.value?.type === 'fiets')

/* ── Datums ── */
const DEMO_YMD = { year: 2027, month: 4, day: 18 }
const WEEKDAYS = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']
const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
const checkInYmd = computed(() => checkoutDay.value?.checkInYmd ?? DEMO_YMD)
const dateAt = (offset: number) => { const y = checkInYmd.value; return new Date(y.year, y.month, y.day + offset) }
const fmt = (d: Date) => `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
const pad = (n: number) => String(n).padStart(2, '0')
const checkInIso = computed(() => { const y = checkInYmd.value; return `${y.year}-${pad(y.month + 1)}-${pad(y.day)}` })
const nights = computed(() => trip.value?.nights ?? checkout.value.nights)
const dateRange = computed(() => `${fmt(dateAt(0))} t/m ${fmt(dateAt(nights.value))}`)

/* ── Weersverwachting (prototype: gefaket, mooi weer; later via een weer-API) ── */
const WEATHER = [
  { icon: 'sun', hi: 22 }, { icon: 'sun', hi: 23 }, { icon: 'suncloud', hi: 21 }, { icon: 'sun', hi: 24 },
  { icon: 'sun', hi: 25 }, { icon: 'suncloud', hi: 23 }, { icon: 'sun', hi: 22 }, { icon: 'sun', hi: 24 },
] as const
const weatherDays = computed(() => Array.from({ length: nights.value + 1 }, (_, i) => {
  const d = dateAt(i)
  return { key: i, day: WEEKDAYS[d.getDay()]!, date: d.getDate(), ...WEATHER[i % WEATHER.length]! }
}))
const weatherRegion = computed(() => trip.value?.stops[0]?.region ?? trip.value?.stops[0]?.city ?? '')

/* ── De route tussen de hotels ── */
const routeLegs = computed<TripRouteLeg[]>(() => (tripRoutesJson as Record<string, { legs: TripRouteLeg[] }>)[trip.value?.id ?? '']?.legs ?? [])
const routeStops = computed(() => (trip.value?.stops ?? []).map(s => ({ lat: s.lat, lng: s.lng, label: s.city })))
const legs = computed(() => {
  const d = trip.value
  if (!d) return []
  const names = d.stops.map(s => s.hotelName)
  const home = d.fromHome?.city ? `Thuis (${d.fromHome.city})` : 'Thuis'
  const meta = (travel?: { km: number; minutes: number }) => (travel ? tripDistanceLabelFn(travel, t, isBike.value) : '')
  const out: { title: string; meta: string }[] = []
  const fromHome = d.fromHomeByLocale?.nl ?? (d.fromHome ? { km: 0, minutes: d.fromHome.minutes } : undefined)
  if (names[0]) out.push({ title: `${home} → ${names[0]}`, meta: fromHome?.km ? meta(fromHome) : '' })
  for (let i = 1; i < names.length; i++) out.push({ title: `${names[i - 1]} → ${names[i]}`, meta: meta(d.stops[i]?.travel) })
  if (names.length) out.push({ title: `${names[names.length - 1]} → ${d.loop ? names[0] : home}`, meta: meta(d.returnTravel) })
  return out
})

/* ── Routes rondom elk hotel: de tips van dat hotel uit de reisinhoud (geen restauranttips),
   anders de activiteiten van de dagen bij dat hotel. ── */
const localRoutes = computed(() => (trip.value?.stops ?? []).map((s, i) => {
  const tips = tripPdp.value?.content?.hotels[s.hotelName]?.tips ?? []
  let titles = tips.map(x => localized(x.title)).filter(x => !/restauranttip/i.test(x))
  if (!titles.length) {
    titles = (tripPdp.value?.days ?? [])
      .filter(d => d.stopIndex === i)
      .flatMap(d => d.blocks.filter(b => b.kind === 'activity' && b.title).map(b => localized(b.title!)))
  }
  return { hotelName: s.hotelName, city: s.city, image: s.image, routes: titles.slice(0, 5) }
}))

/* ── Voorbeeld reisschema (sidepanel) en kaart ── */
const daysView = computed(() => buildTripDaysView(tripPdp.value, trip.value, checkInIso.value, t, localized))
const itinOpen = ref(false)
const mapOpen = ref(false)

/* ── Je hotels (datums per hotel uit de nachten) ── */
const stays = computed(() => {
  let offset = 0
  return (trip.value?.stops ?? []).map((s) => {
    const from = dateAt(offset)
    const to = dateAt(offset + s.nights)
    offset += s.nights
    return { ...s, from: fmt(from), to: fmt(to) }
  })
})

useHead({ title: `Tips & routes speciaal voor ${firstName.value} — ViaLuxury` })
</script>

<template>
  <div class="rp">
    <MultiHotelTripSiteHeader />

    <!-- ── Hero: reisfoto, persoonlijke kop, weersverwachting rechtsboven ── -->
    <section class="rp__hero" :style="{ backgroundImage: `url(${trip?.coverImage ?? checkout.thumb})` }">
      <div class="rp__hero-inner container">
        <div class="rp__hero-text">
          <p class="rp__eyebrow">{{ checkout.typeLabel }} met {{ checkout.hotels.length }} hotels · {{ dateRange }}</p>
          <h1 class="rp__title">Tips &amp; routes speciaal voor {{ firstName }}</h1>
          <p class="rp__tripname">{{ checkout.name }}</p>
        </div>
        <aside class="rp__weather" aria-label="Weersverwachting">
          <p class="rp__weather-head">Weersverwachting <span class="rp__weather-region">{{ weatherRegion }}</span></p>
          <ul class="rp__weather-days">
            <li v-for="w in weatherDays" :key="w.key" class="rp__weather-day">
              <span class="rp__weather-dow">{{ w.day }} {{ w.date }}</span>
              <svg v-if="w.icon === 'sun'" class="rp__weather-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="#f5b400" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" stroke="#f5b400" stroke-width="2" stroke-linecap="round" /></svg>
              <svg v-else class="rp__weather-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="4" fill="#f5b400" /><path d="M9 2v2M2 9h2M4 4l1.4 1.4M14 4l-1.4 1.4" stroke="#f5b400" stroke-width="1.8" stroke-linecap="round" /><path d="M8 20h9.5a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.6-1.4A4.2 4.2 0 0 0 8 20z" fill="#fff" stroke="#9aa3a3" stroke-width="1.6" stroke-linejoin="round" /></svg>
              <span class="rp__weather-temp">{{ w.hi }}°</span>
            </li>
          </ul>
          <p class="rp__weather-note">Mooi weer op komst: zonnig en 21 tot 25 graden.</p>
        </aside>
      </div>
    </section>

    <main class="container rp__main">
      <!-- ── De route tussen de hotels: lijst + witte routeschets ── -->
      <section class="rp__section">
        <h2 class="rp__h2">De route tussen de hotels</h2>
        <div class="rp__between">
          <ul class="rp__routes">
            <li v-for="(leg, i) in legs" :key="leg.title" class="rp__route">
              <div class="rp__route-text">
                <p class="rp__route-title"><span class="rp__route-num">{{ i + 1 }}</span>{{ leg.title }}</p>
                <p v-if="leg.meta" class="rp__route-meta">{{ leg.meta }}</p>
              </div>
              <p class="rp__route-links">
                <a href="#" @click.prevent="mapOpen = true">Bekijk</a>
                <a href="#" @click.prevent>Download pdf</a>
                <a href="#" @click.prevent>Download gpx</a>
              </p>
            </li>
          </ul>
          <button type="button" class="rp__sketch" aria-label="Bekijk de route op de kaart" @click="mapOpen = true">
            <MultiHotelTripCheckoutRouteSketch v-if="routeStops.length" class="rp__sketch-svg" :stops="routeStops" :legs="routeLegs" :width="340" :height="260" />
            <span class="rp__sketch-caption">Bekijk op de kaart</span>
          </button>
        </div>
      </section>

      <!-- ── Routes rondom elk hotel: twee blokken naast elkaar ── -->
      <section class="rp__section">
        <h2 class="rp__h2">Routes rondom je hotels</h2>
        <div class="rp__grid">
          <article v-for="h in localRoutes" :key="h.hotelName" class="rp__card">
            <img v-if="h.image" class="rp__card-img" :src="h.image" :alt="h.hotelName" />
            <div class="rp__card-body">
              <h3 class="rp__h3">Routes rondom {{ h.hotelName }}</h3>
              <p class="rp__card-sub">{{ h.city }}</p>
              <ul class="rp__routes rp__routes--compact">
                <li v-for="r in h.routes" :key="r" class="rp__route">
                  <p class="rp__route-title">{{ r }}</p>
                  <p class="rp__route-links">
                    <a href="#" @click.prevent>Bekijk</a>
                    <a href="#" @click.prevent>Download pdf</a>
                    <a href="#" @click.prevent>Download gpx</a>
                  </p>
                </li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <!-- ── Voorbeeld reisschema + je hotels ── -->
      <section class="rp__section rp__grid">
        <article class="rp__card rp__card--tint">
          <div class="rp__card-body">
            <h2 class="rp__h2 rp__h2--card">Voorbeeld reisschema</h2>
            <p class="rp__text">Dag voor dag een voorstel voor je {{ checkout.typeWord }}: de route, de hotels en de mooiste uitjes onderweg. Jij bepaalt het tempo.</p>
            <p class="rp__route-links rp__route-links--lg">
              <a href="#" @click.prevent="itinOpen = true">Bekijk</a>
              <a href="#" @click.prevent>Download pdf</a>
            </p>
          </div>
        </article>
        <article class="rp__card">
          <div class="rp__card-body">
            <h2 class="rp__h2 rp__h2--card">Je hotels</h2>
            <ol class="rp__stays">
              <li v-for="(s, i) in stays" :key="s.hotelName" class="rp__stay">
                <span class="rp__route-num">{{ i + 1 }}</span>
                <div>
                  <p class="rp__route-title">{{ s.hotelName }}</p>
                  <p class="rp__route-meta">{{ s.city }} · {{ s.from }} – {{ s.to }} · inchecken vanaf {{ s.checkIn }} uur</p>
                </div>
              </li>
            </ol>
            <p class="rp__route-links rp__route-links--lg">
              <NuxtLink to="/multi-hotel-trip/checkout/bevestiging">Bekijk je boeking</NuxtLink>
            </p>
          </div>
        </article>
      </section>
    </main>

    <TripItineraryPanel :open="itinOpen" :days="daysView" :trip-name="checkout.name" @close="itinOpen = false" />
    <MultiHotelTripFullscreenMap :open="mapOpen" :title="checkout.name" :stops="routeStops" :legs="routeLegs" :highlights="[]" @close="mapOpen = false" />

    <MultiHotelTripSiteFooter />
  </div>
</template>

<style scoped>
.rp { min-height: 100vh; display: flex; flex-direction: column; background: var(--color-bg, #fff); color: var(--color-text-primary); }
.rp__main { flex: 1; padding-top: 40px; padding-bottom: 64px; display: flex; flex-direction: column; gap: 40px; }
.rp__h2 { margin: 0 0 16px; font-family: var(--font-heading); font-size: 26px; font-weight: 700; line-height: 1.25; }
.rp__h2--card { font-size: 22px; margin-bottom: 8px; }
.rp__h3 { margin: 0; font-family: var(--font-heading); font-size: 20px; font-weight: 700; line-height: 1.25; }
.rp__text { margin: 0 0 12px; font-size: 15px; line-height: 1.5; color: var(--color-text-secondary); }

/* Hero */
.rp__hero { position: relative; min-height: 420px; display: flex; align-items: stretch; background-size: cover; background-position: center; color: #fff; }
.rp__hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.62) 100%); }
.rp__hero-inner { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 32px; align-items: end; width: 100%; padding-top: 40px; padding-bottom: 40px; }
.rp__eyebrow { margin: 0 0 8px; font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(255, 255, 255, 0.85); }
.rp__title { margin: 0; font-family: var(--font-heading); font-size: 44px; font-weight: 700; line-height: 1.1; color: #fff; }
.rp__tripname { margin: 10px 0 0; font-size: 17px; color: rgba(255, 255, 255, 0.9); }
/* Weersverwachting: witte kaart rechts(boven) in de hero */
.rp__weather { align-self: start; min-width: 320px; padding: 16px 18px; border-radius: 12px; background: rgba(255, 255, 255, 0.96); color: var(--color-text-primary); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); }
.rp__weather-head { margin: 0 0 10px; font-size: 14px; font-weight: 700; }
.rp__weather-region { font-weight: 400; color: var(--color-text-secondary); }
.rp__weather-days { list-style: none; margin: 0; padding: 0; display: flex; gap: 4px; }
.rp__weather-day { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 6px 2px; border-radius: 8px; background: #f7f7f7; }
.rp__weather-dow { font-size: 11px; color: var(--color-text-secondary); white-space: nowrap; }
.rp__weather-icon { width: 24px; height: 24px; }
.rp__weather-temp { font-size: 14px; font-weight: 700; }
.rp__weather-note { margin: 10px 0 0; font-size: 12px; color: var(--color-text-secondary); }

/* Routelijsten: titel links, linkjes rechts */
.rp__routes { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.rp__route { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 0; border-top: 1px solid var(--color-border); }
.rp__route:first-child { border-top: 0; }
.rp__routes--compact .rp__route { padding: 9px 0; }
.rp__route-text { min-width: 0; }
.rp__route-title { margin: 0; display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 600; line-height: 1.35; }
.rp__route-meta { margin: 2px 0 0; font-size: 13px; color: var(--color-text-secondary); }
.rp__route-num { flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: var(--color-text-primary); color: #fff; font-size: 12px; font-weight: 700; }
.rp__route-links { margin: 0; flex-shrink: 0; display: flex; gap: 14px; font-size: 13px; white-space: nowrap; }
.rp__route-links a { color: var(--color-primary); font-weight: 600; text-decoration: underline; text-underline-offset: 2px; }
.rp__route-links a:hover { color: var(--color-primary-hover); }
.rp__route-links--lg { font-size: 15px; }

/* Route tussen de hotels: lijst + schets op een donker vlak */
.rp__between { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 32px; align-items: start; }
.rp__sketch { position: relative; display: block; width: 100%; padding: 28px 24px 20px; border: 0; border-radius: var(--radius-md); background: var(--color-text-primary); cursor: pointer; text-align: center; }
.rp__sketch-svg { width: 100%; height: auto; }
.rp__sketch-caption { display: inline-block; margin-top: 14px; font-family: var(--font-body); font-size: 13px; font-weight: 600; color: #fff; text-decoration: underline; text-underline-offset: 2px; }

/* Kaarten in een raster van twee */
.rp__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; align-items: start; }
.rp__card { overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: #fff; }
.rp__card--tint { background: #f4f1ec; border-color: #f4f1ec; }
.rp__card-img { display: block; width: 100%; height: 160px; object-fit: cover; }
.rp__card-body { padding: 20px 22px 18px; }
.rp__card-sub { margin: 2px 0 10px; font-size: 13px; color: var(--color-text-secondary); }
.rp__stays { list-style: none; margin: 0 0 12px; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.rp__stay { display: flex; gap: 10px; align-items: flex-start; }
.rp__stay .rp__route-num { margin-top: 1px; }
.rp__stay p { margin: 0; }

@media (max-width: 900px) {
  .rp__hero { min-height: 0; }
  .rp__hero-inner { grid-template-columns: 1fr; gap: 20px; padding-top: 28px; padding-bottom: 24px; }
  .rp__title { font-size: 30px; }
  .rp__weather { min-width: 0; width: 100%; padding: 14px; }
  .rp__weather-days { overflow-x: auto; }
  .rp__weather-day { min-width: 44px; }
  .rp__main { padding-top: 28px; gap: 32px; }
  .rp__between, .rp__grid { grid-template-columns: 1fr; gap: 16px; }
  .rp__sketch { padding: 20px 16px 16px; }
  .rp__route { flex-direction: column; align-items: flex-start; gap: 6px; }
  .rp__route-links { white-space: normal; }
}
</style>
