<script setup lang="ts">
// Multi Hotel Trip — persoonlijke reispagina na het boeken ("Tips & routes speciaal voor
// <voornaam>"), bereikbaar via de bevestigingspagina, de bevestigingsmail en het startscherm,
// en bedoeld om de hele reis bij de hand te hebben: hero met de reis en (nog gefakete)
// weersverwachting; "Vandaag" met het dagprogramma en het weer van die dag; de route tussen
// de hotels (lijst met afstand/duur/mini-kaartje + witte routeschets); routes rondom elk hotel
// (type, afstand, duur, schematisch rondje) met een ingang naar alle tips op de dealpagina;
// het voorbeeld reisschema (sidepanel + pdf); je hotels; en "Handig onderweg". De links
// Download pdf / Download gpx zijn in het prototype zonder werking.
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
const pdpHref = computed(() => `/multi-hotel-trip/deal/${checkout.value.slug}`)

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
/** "1 u 10 min" / "45 min". */
const durationShort = (minutes: number) => { const h = Math.floor(minutes / 60), m = Math.round(minutes % 60); return h ? `${h} u${m ? ` ${m} min` : ''}` : `${m} min` }

/* ── Weersverwachting (prototype: gefaket, mooi weer; later via een weer-API) ── */
const WEATHER = [
  { icon: 'sun', hi: 22, text: 'zonnig' }, { icon: 'sun', hi: 23, text: 'zonnig' }, { icon: 'suncloud', hi: 21, text: 'zon en wolken' }, { icon: 'sun', hi: 24, text: 'zonnig' },
  { icon: 'sun', hi: 25, text: 'zonnig en warm' }, { icon: 'suncloud', hi: 23, text: 'zon en wolken' }, { icon: 'sun', hi: 22, text: 'zonnig' }, { icon: 'sun', hi: 24, text: 'zonnig' },
] as const
const weatherDays = computed(() => Array.from({ length: nights.value + 1 }, (_, i) => {
  const d = dateAt(i)
  return { key: i, day: WEEKDAYS[d.getDay()]!, date: d.getDate(), ...WEATHER[i % WEATHER.length]! }
}))
const weatherRegion = computed(() => trip.value?.stops[0]?.region ?? trip.value?.stops[0]?.city ?? '')

/* ── De route tussen de hotels: per etappe titel, afstand/duur en de geometrie voor het mini-kaartje ── */
const routeLegs = computed<TripRouteLeg[]>(() => (tripRoutesJson as Record<string, { legs: TripRouteLeg[] }>)[trip.value?.id ?? '']?.legs ?? [])
const routeStops = computed(() => (trip.value?.stops ?? []).map(s => ({ lat: s.lat, lng: s.lng, label: s.city })))
interface LegItem { title: string; meta: string; kind: 'auto' | 'fiets'; mini?: { stops: { lat: number; lng: number; label: string }[]; legs: TripRouteLeg[] } }
const legs = computed<LegItem[]>(() => {
  const d = trip.value
  if (!d) return []
  const names = d.stops.map(s => s.hotelName)
  const home = d.fromHome?.city ? `Thuis (${d.fromHome.city})` : 'Thuis'
  const kind = isBike.value ? 'fiets' : 'auto'
  const meta = (travel?: { km: number; minutes: number }) => (travel ? tripDistanceLabelFn(travel, t, isBike.value) : '')
  const out: LegItem[] = []
  const fromHome = d.fromHomeByLocale?.nl ?? (d.fromHome ? { km: 0, minutes: d.fromHome.minutes } : undefined)
  if (names[0]) out.push({ title: `${home} → ${names[0]}`, meta: fromHome?.km ? meta(fromHome) : '', kind: 'auto' })
  for (let i = 1; i < names.length; i++) {
    const leg = routeLegs.value.find(l => l.from === i - 1 && l.to === i)
    out.push({
      title: `${names[i - 1]} → ${names[i]}`,
      meta: meta(d.stops[i]?.travel),
      kind,
      mini: leg ? { stops: [routeStops.value[i - 1]!, routeStops.value[i]!], legs: [{ ...leg, from: 0, to: 1 }] } : undefined,
    })
  }
  if (names.length) {
    const back = routeLegs.value.find(l => l.return)
    out.push({
      title: `${names[names.length - 1]} → ${d.loop ? names[0] : home}`,
      meta: meta(d.returnTravel),
      kind: d.loop ? kind : 'auto',
      mini: d.loop && back ? { stops: [routeStops.value[names.length - 1]!, routeStops.value[0]!], legs: [{ ...back, from: 0, to: 1, return: false }] } : undefined,
    })
  }
  return out
})

/* ── Routes rondom elk hotel: de tips van dat hotel uit de reisinhoud (geen restauranttips),
   anders de activiteiten van de dagen bij dat hotel. Type, afstand en duur zijn in het
   prototype afgeleid (vast per titel); het rondje is schematisch. ── */
type RouteKind = 'auto' | 'fiets' | 'wandelen'
const KIND_LABEL: Record<RouteKind, string> = { auto: 'Met de auto', fiets: 'Fietsroute', wandelen: 'Wandelroute' }
const hash = (s: string) => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h }
function localMeta(title: string, i: number): { kind: RouteKind; km: number; minutes: number; label: string } {
  const kinds: RouteKind[] = isBike.value ? ['fiets', 'fiets', 'wandelen'] : ['auto', 'fiets', 'wandelen']
  const h = hash(title)
  const kind = kinds[(h + i) % kinds.length]!
  const km = kind === 'auto' ? 30 + (h % 36) : kind === 'fiets' ? 22 + (h % 24) : 5 + (h % 8)
  const minutes = kind === 'auto' ? Math.round(km * 1.25) : kind === 'fiets' ? km * 4 : km * 15
  return { kind, km, minutes, label: `${KIND_LABEL[kind]} · ${km} km · ${durationShort(minutes)}` }
}
/** Schematisch rondje (gesloten, vloeiende lus) rond het hotel, vast per titel. */
function loopPath(title: string): { d: string; start: { x: number; y: number } } {
  const h = hash(title)
  const n = 8
  const pts = Array.from({ length: n }, (_, k) => {
    const a = (k / n) * Math.PI * 2 - Math.PI / 2
    const r = 20 + (((h >> (k * 3)) & 7) - 3) * 1.6
    return { x: 36 + Math.cos(a) * r * 1.15, y: 36 + Math.sin(a) * r }
  })
  // Catmull-Rom → cubic Bézier, gesloten.
  let d = `M${pts[0]!.x.toFixed(1)} ${pts[0]!.y.toFixed(1)}`
  for (let k = 0; k < n; k++) {
    const p0 = pts[(k - 1 + n) % n]!, p1 = pts[k]!, p2 = pts[(k + 1) % n]!, p3 = pts[(k + 2) % n]!
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }
    d += ` C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return { d: d + ' Z', start: pts[0]! }
}
const localRoutes = computed(() => (trip.value?.stops ?? []).map((s, i) => {
  const tips = tripPdp.value?.content?.hotels[s.hotelName]?.tips ?? []
  let titles = tips.map(x => localized(x.title)).filter(x => !/restauranttip/i.test(x))
  if (!titles.length) {
    titles = (tripPdp.value?.days ?? [])
      .filter(d => d.stopIndex === i)
      .flatMap(d => d.blocks.filter(b => b.kind === 'activity' && b.title).map(b => localized(b.title!)))
  }
  return {
    stopIndex: i,
    hotelName: s.hotelName,
    city: s.city,
    image: s.image,
    routes: titles.slice(0, 5).map((title, k) => ({ title, ...localMeta(title, k), loop: loopPath(title) })),
  }
}))

/* ── Voorbeeld reisschema (sidepanel) en kaart ── */
const daysView = computed(() => buildTripDaysView(tripPdp.value, trip.value, checkInIso.value, t, localized))
const itinOpen = ref(false)
const itinFocus = ref<number | null>(null)
function openItin(day: number | null = null) { itinFocus.value = day; itinOpen.value = true }
const mapOpen = ref(false)

/* ── Vandaag: tijdens de reis de echte dag; daarbuiten (prototype) dag 3 als voorbeeld ── */
const today = computed(() => {
  const start = dateAt(0)
  const now = new Date()
  const diff = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - start.getTime()) / 86400000) + 1
  const inTrip = diff >= 1 && diff <= nights.value + 1
  return { day: inTrip ? diff : Math.min(3, nights.value + 1), demo: !inTrip }
})
const todayView = computed(() => daysView.value.find(d => d.day === today.value.day))
const todayWeather = computed(() => weatherDays.value[today.value.day - 1])
const todayStop = computed(() => (todayView.value?.stopIndex != null ? trip.value?.stops[todayView.value.stopIndex] : null) ?? null)
/** De etappe van vandaag: aankomstdag = thuis → hotel 1, wisseldag = vorig → volgend hotel, terugreis = laatste etappe. */
const todayLeg = computed<LegItem | null>(() => {
  const v = todayView.value
  if (!v) return null
  if (v.type === 'arrival') return legs.value[0] ?? null
  if (v.type === 'transfer' && v.stopIndex != null) return legs.value[v.stopIndex] ?? null
  if (v.type === 'home') return legs.value[legs.value.length - 1] ?? null
  return null
})
const todayTitle = computed(() => {
  const v = todayView.value
  if (!v) return ''
  return v.heading ?? v.subtitle ?? v.label
})
const todaySummary = computed(() => {
  const v = todayView.value
  if (!v) return ''
  return v.summary ?? v.blocks.map(b => b.title).filter(Boolean).slice(0, 3).join(' · ')
})

/* ── Je hotels + Handig onderweg (telefoonnummers en laadpunten zijn prototype-placeholders) ── */
const stays = computed(() => {
  let offset = 0
  return (trip.value?.stops ?? []).map((s, i) => {
    const from = dateAt(offset)
    const to = dateAt(offset + s.nights)
    offset += s.nights
    const parking = s.includes.map(x => localized(x)).find(x => /parkeren/i.test(x)) ?? 'Parkeren bij het hotel'
    return {
      ...s,
      from: fmt(from),
      to: fmt(to),
      phone: `+33 3 21 12 34 5${i + 1}`,
      parking,
      charging: i === 0 ? 'Laadpunt bij het hotel' : `Laadpunt op ${i + 1} km`,
    }
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
            <li v-for="w in weatherDays" :key="w.key" class="rp__weather-day" :class="{ 'rp__weather-day--today': w.key === today.day - 1 }">
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
      <!-- ── Vandaag: dagprogramma + weer van vandaag ── -->
      <section v-if="todayView" class="rp__today">
        <div class="rp__today-main">
          <p class="rp__eyebrow rp__eyebrow--dark">
            Vandaag · {{ todayView.date ?? '' }} · {{ todayView.label }}
            <span v-if="today.demo" class="rp__demo">prototype: we doen alsof het {{ todayView.label.toLowerCase() }} is</span>
          </p>
          <h2 class="rp__h2 rp__h2--today">{{ todayTitle }}</h2>
          <p class="rp__text">{{ todaySummary }}</p>
          <div v-if="todayLeg" class="rp__today-leg">
            <svg v-if="todayLeg.kind === 'fiets'" class="rp__kind-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="5.5" cy="17.5" r="3.5" stroke="currentColor" stroke-width="2" /><circle cx="18.5" cy="17.5" r="3.5" stroke="currentColor" stroke-width="2" /><path d="M5.5 17.5l3-8h5l5 8M8.5 9.5h4M12 5h3l1 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            <svg v-else class="rp__kind-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 17h2M19 17h2M5 17l1.5-5h11L19 17M4 17v3M20 17v3M3 17h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /><path d="M8 12V8h8v4" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /></svg>
            <div>
              <p class="rp__route-title">Route van vandaag: {{ todayLeg.title }}</p>
              <p v-if="todayLeg.meta" class="rp__route-meta">{{ todayLeg.meta }}</p>
            </div>
          </div>
          <p class="rp__route-links rp__route-links--lg">
            <a href="#" @click.prevent="openItin(todayView.day)">Bekijk {{ todayView.label.toLowerCase() }} in het reisschema</a>
            <a v-if="todayStop" :href="`#hotel-${todayView.stopIndex}`">Routes rondom {{ todayStop.hotelName }}</a>
            <a v-if="todayLeg" href="#" @click.prevent="mapOpen = true">Route op de kaart</a>
          </p>
        </div>
        <div v-if="todayWeather" class="rp__today-weather">
          <svg v-if="todayWeather.icon === 'sun'" class="rp__today-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="#f5b400" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" stroke="#f5b400" stroke-width="2" stroke-linecap="round" /></svg>
          <svg v-else class="rp__today-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="4" fill="#f5b400" /><path d="M9 2v2M2 9h2M4 4l1.4 1.4M14 4l-1.4 1.4" stroke="#f5b400" stroke-width="1.8" stroke-linecap="round" /><path d="M8 20h9.5a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.6-1.4A4.2 4.2 0 0 0 8 20z" fill="#fff" stroke="#9aa3a3" stroke-width="1.6" stroke-linejoin="round" /></svg>
          <p class="rp__today-temp">{{ todayWeather.hi }}°</p>
          <p class="rp__today-weathertext">{{ todayWeather.text }}<br><span class="rp__today-place">{{ todayStop?.city ?? weatherRegion }}</span></p>
        </div>
      </section>

      <!-- ── De route tussen de hotels: lijst (met mini-kaartje) + witte routeschets ── -->
      <section class="rp__section">
        <h2 class="rp__h2">De route tussen de hotels</h2>
        <div class="rp__between">
          <ul class="rp__routes">
            <li v-for="(leg, i) in legs" :key="leg.title" class="rp__route">
              <span class="rp__mini" aria-hidden="true">
                <MultiHotelTripCheckoutRouteSketch v-if="leg.mini" tone="dark" :labels="false" :radius="6" :stroke-width="3" :width="72" :height="72" :stops="leg.mini.stops" :legs="leg.mini.legs" />
                <svg v-else class="rp__mini-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 17h2M19 17h2M5 17l1.5-5h11L19 17M4 17v3M20 17v3M3 17h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /><path d="M8 12V8h8v4" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /></svg>
              </span>
              <div class="rp__route-text">
                <p class="rp__route-title"><span class="rp__route-num">{{ i + 1 }}</span>{{ leg.title }}</p>
                <p class="rp__route-meta">{{ leg.kind === 'fiets' ? 'Fietsroute' : 'Met de auto' }}<template v-if="leg.meta"> · {{ leg.meta }}</template></p>
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

      <!-- ── Routes rondom elk hotel: twee blokken naast elkaar, met ingang naar alle tips ── -->
      <section class="rp__section">
        <h2 class="rp__h2">Routes rondom je hotels</h2>
        <div class="rp__grid">
          <article v-for="h in localRoutes" :id="`hotel-${h.stopIndex}`" :key="h.hotelName" class="rp__card rp__anchor">
            <img v-if="h.image" class="rp__card-img" :src="h.image" :alt="h.hotelName" />
            <div class="rp__card-body">
              <h3 class="rp__h3">Routes rondom {{ h.hotelName }}</h3>
              <p class="rp__card-sub">{{ h.city }}</p>
              <ul class="rp__routes rp__routes--compact">
                <li v-for="r in h.routes" :key="r.title" class="rp__route">
                  <span class="rp__mini rp__mini--loop" aria-hidden="true">
                    <svg viewBox="0 0 72 72" class="rp__loop"><path :d="r.loop.d" /><circle :cx="r.loop.start.x" :cy="r.loop.start.y" r="4.5" /></svg>
                  </span>
                  <div class="rp__route-text">
                    <p class="rp__route-title">{{ r.title }}</p>
                    <p class="rp__route-meta rp__route-meta--kind">
                      <svg v-if="r.kind === 'auto'" class="rp__kind-icon rp__kind-icon--sm" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 17h2M19 17h2M5 17l1.5-5h11L19 17M4 17v3M20 17v3M3 17h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /><path d="M8 12V8h8v4" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /></svg>
                      <svg v-else-if="r.kind === 'fiets'" class="rp__kind-icon rp__kind-icon--sm" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="5.5" cy="17.5" r="3.5" stroke="currentColor" stroke-width="2" /><circle cx="18.5" cy="17.5" r="3.5" stroke="currentColor" stroke-width="2" /><path d="M5.5 17.5l3-8h5l5 8M8.5 9.5h4M12 5h3l1 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                      <svg v-else class="rp__kind-icon rp__kind-icon--sm" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="13" cy="4" r="2" stroke="currentColor" stroke-width="2" /><path d="M10 9l3-1 3 3 2 1M10 9l-2 5 3 2-1 6M11 16l3 2 1 4M10 9l-3 1-1 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                      {{ r.label }}
                    </p>
                  </div>
                  <p class="rp__route-links">
                    <a href="#" @click.prevent>Bekijk</a>
                    <a href="#" @click.prevent>Download pdf</a>
                    <a href="#" @click.prevent>Download gpx</a>
                  </p>
                </li>
              </ul>
              <p class="rp__route-links rp__route-links--lg rp__card-more">
                <NuxtLink :to="`${pdpHref}#arrangement`">Alle tips rondom {{ h.hotelName }} ›</NuxtLink>
              </p>
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
              <a href="#" @click.prevent="openItin(null)">Bekijk</a>
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

      <!-- ── Handig onderweg ── -->
      <section class="rp__section">
        <h2 class="rp__h2">Handig onderweg</h2>
        <div class="rp__handy">
          <article v-for="(s, i) in stays" :key="`handy-${s.hotelName}`" class="rp__card">
            <div class="rp__card-body rp__card-body--handy">
              <p class="rp__route-title"><span class="rp__route-num">{{ i + 1 }}</span>{{ s.hotelName }}</p>
              <ul class="rp__handy-list">
                <li><span class="rp__handy-label">Telefoon</span><a class="rp__handy-link" :href="`tel:${s.phone.replace(/\s/g, '')}`">{{ s.phone }}</a></li>
                <li><span class="rp__handy-label">Parkeren</span>{{ s.parking }}</li>
                <li><span class="rp__handy-label">{{ isBike ? 'Fietsenstalling' : 'Opladen' }}</span>{{ isBike ? 'Afgesloten stalling bij het hotel' : s.charging }}</li>
                <li><span class="rp__handy-label">Inchecken</span>vanaf {{ s.checkIn }} uur</li>
              </ul>
            </div>
          </article>
          <article class="rp__card rp__card--dark">
            <div class="rp__card-body rp__card-body--handy">
              <p class="rp__route-title">ViaLuxury onderweg</p>
              <ul class="rp__handy-list">
                <li><span class="rp__handy-label">Bellen</span><a class="rp__handy-link" href="tel:+31207052222">+31 20 705 2222</a></li>
                <li><span class="rp__handy-label">WhatsApp</span><a class="rp__handy-link" href="https://wa.me/31208088809">+31 20 808 8809</a></li>
                <li><span class="rp__handy-label">Bereikbaar</span>ma t/m vr 8:00 – 18:00</li>
                <li><span class="rp__handy-label">Boeking</span>{{ checkout.hotels.length }} hotels, {{ nights }} nachten</li>
              </ul>
            </div>
          </article>
        </div>
      </section>
    </main>

    <TripItineraryPanel :open="itinOpen" :days="daysView" :focus-day="itinFocus" :trip-name="checkout.name" @close="itinOpen = false" />
    <MultiHotelTripFullscreenMap :open="mapOpen" :title="checkout.name" :stops="routeStops" :legs="routeLegs" :highlights="[]" @close="mapOpen = false" />

    <MultiHotelTripSiteFooter />
  </div>
</template>

<style scoped>
.rp { min-height: 100vh; display: flex; flex-direction: column; background: var(--color-bg, #fff); color: var(--color-text-primary); }
.rp__main { flex: 1; padding-top: 32px; padding-bottom: 64px; display: flex; flex-direction: column; gap: 40px; }
.rp__h2 { margin: 0 0 16px; font-family: var(--font-heading); font-size: 26px; font-weight: 700; line-height: 1.25; }
.rp__h2--card { font-size: 22px; margin-bottom: 8px; }
.rp__h2--today { font-size: 24px; margin: 6px 0 8px; }
.rp__h3 { margin: 0; font-family: var(--font-heading); font-size: 20px; font-weight: 700; line-height: 1.25; }
.rp__text { margin: 0 0 12px; font-size: 15px; line-height: 1.5; color: var(--color-text-secondary); }
.rp__anchor { scroll-margin-top: 90px; }

/* Hero */
.rp__hero { position: relative; min-height: 420px; display: flex; align-items: stretch; background-size: cover; background-position: center; color: #fff; }
.rp__hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.62) 100%); }
.rp__hero-inner { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 32px; align-items: end; width: 100%; padding-top: 40px; padding-bottom: 40px; }
.rp__eyebrow { margin: 0 0 8px; font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(255, 255, 255, 0.85); }
.rp__eyebrow--dark { color: var(--color-text-secondary); display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.rp__demo { font-size: 11px; font-weight: 500; letter-spacing: 0; text-transform: none; padding: 2px 8px; border-radius: 999px; background: #fff; color: var(--color-text-secondary); border: 1px solid var(--color-border); }
.rp__title { margin: 0; font-family: var(--font-heading); font-size: 44px; font-weight: 700; line-height: 1.1; color: #fff; }
.rp__tripname { margin: 10px 0 0; font-size: 17px; color: rgba(255, 255, 255, 0.9); }
/* Weersverwachting: witte kaart rechts(boven) in de hero */
.rp__weather { align-self: start; min-width: 320px; padding: 16px 18px; border-radius: 12px; background: rgba(255, 255, 255, 0.96); color: var(--color-text-primary); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); }
.rp__weather-head { margin: 0 0 10px; font-size: 14px; font-weight: 700; }
.rp__weather-region { font-weight: 400; color: var(--color-text-secondary); }
.rp__weather-days { list-style: none; margin: 0; padding: 0; display: flex; gap: 4px; }
.rp__weather-day { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 6px 2px; border-radius: 8px; background: #f7f7f7; }
.rp__weather-day--today { background: #f4f1ec; box-shadow: inset 0 0 0 1.5px var(--color-text-primary); }
.rp__weather-dow { font-size: 11px; color: var(--color-text-secondary); white-space: nowrap; }
.rp__weather-icon { width: 24px; height: 24px; }
.rp__weather-temp { font-size: 14px; font-weight: 700; }
.rp__weather-note { margin: 10px 0 0; font-size: 12px; color: var(--color-text-secondary); }

/* Vandaag */
.rp__today { display: grid; grid-template-columns: minmax(0, 1fr) 200px; gap: 24px; align-items: center; padding: 24px 28px; border-radius: var(--radius-md); background: #f4f1ec; }
.rp__today-leg { display: flex; align-items: center; gap: 12px; margin: 4px 0 12px; padding: 12px 14px; border-radius: 8px; background: #fff; }
.rp__today-leg p { margin: 0; }
.rp__kind-icon { flex-shrink: 0; width: 26px; height: 26px; color: var(--color-text-primary); }
.rp__kind-icon--sm { width: 16px; height: 16px; vertical-align: -3px; margin-right: 4px; }
.rp__today-weather { text-align: center; padding: 12px; border-radius: 12px; background: #fff; }
.rp__today-icon { width: 56px; height: 56px; }
.rp__today-temp { margin: 0; font-family: var(--font-heading); font-size: 34px; font-weight: 700; line-height: 1.1; }
.rp__today-weathertext { margin: 4px 0 0; font-size: 13px; color: var(--color-text-secondary); line-height: 1.4; }
.rp__today-place { color: var(--color-text-primary); font-weight: 600; }

/* Routelijsten: mini-kaartje | titel + meta | linkjes */
.rp__routes { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.rp__route { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-top: 1px solid var(--color-border); }
.rp__route:first-child { border-top: 0; }
.rp__routes--compact .rp__route { padding: 9px 0; gap: 12px; }
.rp__route-text { flex: 1; min-width: 0; }
.rp__route-title { margin: 0; display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 600; line-height: 1.35; }
.rp__route-meta { margin: 2px 0 0; font-size: 13px; color: var(--color-text-secondary); }
.rp__route-meta--kind { display: flex; align-items: center; }
.rp__route-num { flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: var(--color-text-primary); color: #fff; font-size: 12px; font-weight: 700; }
.rp__route-links { margin: 0; flex-shrink: 0; display: flex; gap: 14px; font-size: 13px; white-space: nowrap; }
.rp__route-links a { color: var(--color-primary); font-weight: 600; text-decoration: underline; text-underline-offset: 2px; }
.rp__route-links a:hover { color: var(--color-primary-hover); }
.rp__route-links--lg { font-size: 15px; flex-wrap: wrap; white-space: normal; }
.rp__card-more { margin-top: 12px; }
/* Mini-kaartjes: etappe (echte route, donker op licht) of schematisch rondje */
.rp__mini { flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 8px; background: #f4f1ec; overflow: hidden; }
.rp__mini :deep(svg.crs) { width: 48px; height: 48px; }
.rp__mini-icon { width: 26px; height: 26px; color: var(--color-text-primary); }
.rp__routes--compact .rp__mini { width: 48px; height: 48px; }
.rp__loop { width: 42px; height: 42px; }
.rp__loop path { fill: none; stroke: var(--color-text-primary); stroke-width: 3; stroke-linejoin: round; }
.rp__loop circle { fill: var(--color-text-primary); }

/* Route tussen de hotels: lijst + schets op een donker vlak */
.rp__between { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 32px; align-items: start; }
.rp__sketch { position: relative; display: block; width: 100%; padding: 28px 24px 20px; border: 0; border-radius: var(--radius-md); background: var(--color-text-primary); cursor: pointer; text-align: center; }
.rp__sketch-svg { width: 100%; height: auto; }
.rp__sketch-caption { display: inline-block; margin-top: 14px; font-family: var(--font-body); font-size: 13px; font-weight: 600; color: #fff; text-decoration: underline; text-underline-offset: 2px; }

/* Kaarten in een raster van twee */
.rp__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; align-items: start; }
.rp__card { overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: #fff; }
.rp__card--tint { background: #f4f1ec; border-color: #f4f1ec; }
.rp__card--dark { background: var(--color-text-primary); border-color: var(--color-text-primary); color: #fff; }
.rp__card--dark .rp__handy-label { color: rgba(255, 255, 255, 0.65); }
.rp__card--dark .rp__handy-link { color: #fff; }
.rp__card-img { display: block; width: 100%; height: 160px; object-fit: cover; }
.rp__card-body { padding: 20px 22px 18px; }
.rp__card-body--handy { padding: 18px 20px; }
.rp__card-sub { margin: 2px 0 10px; font-size: 13px; color: var(--color-text-secondary); }
.rp__stays { list-style: none; margin: 0 0 12px; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.rp__stay { display: flex; gap: 10px; align-items: flex-start; }
.rp__stay .rp__route-num { margin-top: 1px; }
.rp__stay p { margin: 0; }

/* Handig onderweg: hotels + ViaLuxury naast elkaar */
.rp__handy { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.rp__handy-list { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; font-size: 13px; line-height: 1.4; }
.rp__handy-label { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--color-text-secondary); }
.rp__handy-link { color: inherit; font-weight: 600; text-decoration: underline; text-underline-offset: 2px; }

@media (max-width: 1100px) {
  .rp__handy { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 900px) {
  .rp__hero { min-height: 0; }
  .rp__hero-inner { grid-template-columns: 1fr; gap: 20px; padding-top: 28px; padding-bottom: 24px; }
  .rp__title { font-size: 30px; }
  .rp__weather { min-width: 0; width: 100%; padding: 14px; }
  .rp__weather-days { overflow-x: auto; }
  .rp__weather-day { min-width: 44px; }
  .rp__main { padding-top: 24px; gap: 32px; }
  .rp__today { grid-template-columns: 1fr; padding: 18px 16px; }
  .rp__today-weather { display: flex; align-items: center; justify-content: center; gap: 12px; text-align: left; }
  .rp__today-icon { width: 40px; height: 40px; }
  .rp__today-temp { font-size: 28px; }
  .rp__between, .rp__grid { grid-template-columns: 1fr; gap: 16px; }
  .rp__handy { grid-template-columns: 1fr; }
  .rp__sketch { padding: 20px 16px 16px; }
  .rp__route { flex-wrap: wrap; }
  .rp__route-links { width: 100%; padding-left: 70px; white-space: normal; }
  .rp__routes--compact .rp__route-links { padding-left: 60px; }
}
</style>
