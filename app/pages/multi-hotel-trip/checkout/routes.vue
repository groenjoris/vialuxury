<script setup lang="ts">
// Multi Hotel Trip — persoonlijke reispagina na het boeken ("Tips & routes speciaal voor
// <voornaam>"), bereikbaar via de bevestigingspagina, de bevestigingsmail en het startscherm,
// en bedoeld om de hele reis bij de hand te hebben: hero met de reis en (nog gefakete)
// weersverwachting; "Vandaag" (aan/uit met de schakelaar linksboven) met het dagprogramma en
// het weer van die dag; de route tussen de hotels (per etappe de hotelfoto, afstand/duur en
// links) naast de minimap van de dealpagina; routes rondom elk hotel met foto-thumbs en een
// ingang naar alle tips op de dealpagina; het voorbeeld reisschema zoals op de dealpagina
// (dagen klikbaar → sidepanel) met Bekijken / Download pdf; "Boeking terugvinden" (als op de
// bevestigingspagina) en "Handig onderweg". Download pdf / gpx zijn in het prototype zonder werking.
import { tripCheckoutBySlug } from '~/data/mht-checkout/trip'
import { tripPdpBySlug } from '~/data/mht-trip-pdp'
import tripRoutesJson from '~/data/mht-trip-routes.json'
import type { TripRouteLeg, TripMapStop } from '~/utils-multi-hotel-trip/tripMapLayers'
import { useMultiHotelTripCheckoutTrip } from '~/composables-multi-hotel-trip/useMultiHotelTripCheckoutTrip'
import { useMultiHotelTripI18n } from '~/composables-multi-hotel-trip/useMultiHotelTripI18n'
import { buildTripDaysView, tripDistanceLabelFn, tripDurationLabel } from '~/composables-multi-hotel-trip/useMultiHotelTripDaysView'
import TripItineraryPanel from '~/components-multi-hotel-trip/deal/TripItineraryPanel.vue'
import TripItinerarySummary from '~/components-multi-hotel-trip/deal/TripItinerarySummary.vue'

const { t, localized } = useMultiHotelTripI18n()

/* ── Reis + gast (gedeelde checkout-state; zonder checkout de Opaalkust-demo) ── */
const DEMO_SLUG = 'ontdek-noord-frankrijk-en-de-opaalkust-in-7-dagen'
const { trip: checkoutTrip, day: checkoutDay } = useMultiHotelTripCheckoutTrip()
const checkout = computed(() => checkoutTrip.value ?? tripCheckoutBySlug(DEMO_SLUG)!)
const tripPdp = computed(() => tripPdpBySlug(checkout.value.slug))
const trip = computed(() => tripPdp.value?.trip ?? null)
const guest = useState<{ firstName: string; email: string } | null>('mht-checkout-guest', () => null)
const firstName = computed(() => guest.value?.firstName || 'Rijo')
const email = computed(() => guest.value?.email || 'rijo.verburg@gmail.com')
const isBike = computed(() => trip.value?.type === 'fiets')
const pdpHref = computed(() => `/multi-hotel-trip/deal/${checkout.value.slug}`)

/* ── Prototype-schakelaar: het Vandaag-blok aan of uit ── */
const showToday = useState<boolean>('mht-trip-page-today', () => true)

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

/* ── Minimap als op de dealpagina: stops met reistijd, rijroutes, regels eronder ── */
const routeLegs = computed<TripRouteLeg[]>(() => (tripRoutesJson as Record<string, { legs: TripRouteLeg[] }>)[trip.value?.id ?? '']?.legs ?? [])
const routeStops = computed(() => (trip.value?.stops ?? []).map(s => ({ lat: s.lat, lng: s.lng, label: s.city })))
function travelShort(travel: { km: number; minutes: number } | undefined, i: number): string | undefined {
  const minutes = travel?.minutes ?? routeLegs.value.find(l => l.to === i)?.minutes
  if (!minutes) return undefined
  if (minutes < 60) return t('trip.durShort.minutes').replace('{m}', String(minutes))
  const h = Math.floor(minutes / 60), m = minutes % 60
  return m === 0 ? t('trip.durShort.hours').replace('{h}', String(h)) : t('trip.durShort.hoursMinutes').replace('{h}', String(h)).replace('{m}', String(m))
}
const mapStops = computed<TripMapStop[]>(() => (trip.value?.stops ?? []).map((s, i) => ({
  lat: s.lat, lng: s.lng, label: s.city, title: s.hotelName, starRating: s.starRating, nights: s.nights, image: s.image,
  travelKm: s.travel?.km ?? routeLegs.value.find(l => l.to === i && !l.return)?.km,
  travelShort: travelShort(s.travel, i),
})))
const mapReturnLabel = computed(() => (trip.value?.returnTravel ? `${trip.value.returnTravel.km} km` : undefined))
const mapSummary = computed<({ icon: string; text: string } | undefined)[]>(() => {
  const d = trip.value
  if (!d) return []
  const first = d.stops[0]
  const legs = routeLegs.value
  if (d.type === 'fiets') {
    const legKm = d.stops.slice(1).map((s, k) => s.travel?.km ?? legs.find(l => l.to === k + 1 && !l.return)?.km ?? 0)
    if (d.returnTravel) legKm.push(d.returnTravel.km)
    const total = legKm.reduce((a, b) => a + b, 0)
    return [
      d.fromHome && first ? { icon: 'car', text: t('trip.bike.arrivalLine').replace('{duration}', tripDurationLabel(d.fromHome.minutes, t)).replace('{city}', d.fromHome.city) } : undefined,
      total ? { icon: 'route', text: t('trip.bike.stagesLine').replace('{n}', String(legKm.length)).replace('{list}', legKm.join(' · ')).replace('{total}', String(total)) } : undefined,
    ]
  }
  const origin = d.fromHomeByLocale?.nl
  const km = d.stops.reduce((sum, s, i) => sum + (s.travel?.km ?? legs.find(l => l.to === i && !l.return)?.km ?? 0), 0)
  const fromHomeLine = origin && first
    ? { icon: 'car', text: t('trip.fromHomeShort').replace('{city}', origin.city).replace('{to}', first.city).replace('{duration}', durationShort(origin.minutes)).replace('{km}', String(origin.km)) }
    : d.fromHome && first
      ? { icon: 'car', text: t('trip.fromHomeShortNoKm').replace('{city}', d.fromHome.city).replace('{duration}', durationShort(d.fromHome.minutes)).replace('{to}', first.city) }
      : undefined
  return [fromHomeLine, km ? { icon: 'route', text: t('trip.totalRouteLine').replace('{km}', String(km)) } : undefined]
})

/* ── De route tussen de hotels: alleen de etappes van hotel naar hotel, met de foto van het volgende hotel ── */
interface LegItem { toIndex: number; title: string; meta: string; image?: string }
const legs = computed<LegItem[]>(() => {
  const d = trip.value
  if (!d) return []
  const kindLabel = isBike.value ? 'Fietsroute' : 'Met de auto'
  const out: LegItem[] = []
  for (let i = 1; i < d.stops.length; i++) {
    const s = d.stops[i]!
    const travel = s.travel ?? (() => { const l = routeLegs.value.find(x => x.to === i && !x.return); return l ? { km: l.km, minutes: l.minutes } : undefined })()
    out.push({ toIndex: i, title: `${d.stops[i - 1]!.hotelName} → ${s.hotelName}`, meta: travel ? `${kindLabel} · ${tripDistanceLabelFn(travel, t, isBike.value)}` : kindLabel, image: s.image })
  }
  if (d.loop && d.stops.length > 1) {
    const back = routeLegs.value.find(l => l.return)
    const travel = d.returnTravel ?? (back ? { km: back.km, minutes: back.minutes } : undefined)
    out.push({ toIndex: 0, title: `${d.stops[d.stops.length - 1]!.hotelName} → ${d.stops[0]!.hotelName}`, meta: travel ? `${kindLabel} · ${tripDistanceLabelFn(travel, t, isBike.value)}` : kindLabel, image: d.stops[0]!.image })
  }
  return out
})

/* ── Routes rondom elk hotel: de tips van dat hotel (geen restauranttips) met hun foto; zonder
   foto een willekeurige uit de foto's van dat hotel of de omgeving. Type, afstand en duur zijn
   in het prototype afgeleid (vast per titel). ── */
type RouteKind = 'auto' | 'fiets' | 'wandelen'
const KIND_LABEL: Record<RouteKind, string> = { auto: 'Met de auto', fiets: 'Fietsroute', wandelen: 'Wandelroute' }
const hash = (s: string) => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h }
function localMeta(title: string, i: number): string {
  const kinds: RouteKind[] = isBike.value ? ['fiets', 'fiets', 'wandelen'] : ['auto', 'fiets', 'wandelen']
  const h = hash(title)
  const kind = kinds[(h + i) % kinds.length]!
  const km = kind === 'auto' ? 30 + (h % 36) : kind === 'fiets' ? 22 + (h % 24) : 5 + (h % 8)
  const minutes = kind === 'auto' ? Math.round(km * 1.25) : kind === 'fiets' ? km * 4 : km * 15
  return `${KIND_LABEL[kind]} · ${km} km · ${durationShort(minutes)}`
}
const localRoutes = computed(() => (trip.value?.stops ?? []).map((s, i) => {
  const tips = tripPdp.value?.content?.hotels[s.hotelName]?.tips ?? []
  const pool = [...(s.extraImages ?? []), ...(trip.value?.nearbyImages ?? []), s.image].filter((x): x is string => !!x)
  let items = tips.filter(x => !/restauranttip/i.test(localized(x.title))).map(x => ({ title: localized(x.title), image: x.image }))
  if (!items.length) {
    items = (tripPdp.value?.days ?? [])
      .filter(d => d.stopIndex === i)
      .flatMap(d => d.blocks.filter(b => b.kind === 'activity' && b.title).map(b => ({ title: localized(b.title!), image: b.image })))
  }
  return {
    stopIndex: i,
    hotelName: s.hotelName,
    city: s.city,
    image: s.image,
    // Tips met alleen een grijze placeholder-afbeelding krijgen ook een willekeurige echte foto.
    routes: items.slice(0, 5).map((r, k) => ({ title: r.title, meta: localMeta(r.title, k), image: r.image && !/placeholder/i.test(r.image) ? r.image : pool[(hash(r.title) + k) % Math.max(pool.length, 1)] })),
  }
}))

/* ── Voorbeeld reisschema (dagsamenvatting + sidepanel) en kaart ── */
const daysView = computed(() => buildTripDaysView(tripPdp.value, trip.value, checkInIso.value, t, localized))
const hotelLinks = computed(() => (trip.value?.stops ?? []).map((s, i) => ({ name: s.hotelName, stopIndex: i })))
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
/** De etappe van vandaag (alleen op een wisseldag: van het vorige naar het volgende hotel). */
const todayLeg = computed<LegItem | null>(() => {
  const v = todayView.value
  if (!v || v.type !== 'transfer' || v.stopIndex == null) return null
  return legs.value.find(l => l.toIndex === v.stopIndex) ?? null
})
const todayTitle = computed(() => todayView.value?.heading ?? todayView.value?.subtitle ?? todayView.value?.label ?? '')
const todaySummary = computed(() => {
  const v = todayView.value
  if (!v) return ''
  return v.summary ?? v.blocks.map(b => b.title).filter(Boolean).slice(0, 3).join(' · ')
})

/* ── Handig onderweg (telefoonnummers en laadpunten zijn prototype-placeholders) ── */
const stays = computed(() => (trip.value?.stops ?? []).map((s, i) => ({
  ...s,
  phone: `+33 3 21 12 34 5${i + 1}`,
  parking: s.includes.map(x => localized(x)).find(x => /parkeren/i.test(x)) ?? 'Parkeren bij het hotel',
  charging: i === 0 ? 'Laadpunt bij het hotel' : `Laadpunt op ${i + 1} km`,
})))

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
            <li v-for="w in weatherDays" :key="w.key" class="rp__weather-day" :class="{ 'rp__weather-day--today': showToday && w.key === today.day - 1 }">
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
      <!-- ── Prototype-schakelaar (linksboven): Vandaag-blok aan/uit ── -->
      <div class="rp__proto">
        <label class="rp__switch">
          <input v-model="showToday" type="checkbox" class="rp__switch-input" />
          <span class="rp__switch-track" aria-hidden="true"><span class="rp__switch-knob" /></span>
          <span class="rp__switch-label">Vandaag-blok {{ showToday ? 'aan' : 'uit' }}</span>
        </label>
      </div>

      <!-- ── Vandaag: dagprogramma + weer van vandaag ── -->
      <section v-if="showToday && todayView" class="rp__today">
        <div class="rp__today-main">
          <p class="rp__eyebrow rp__eyebrow--dark">
            Vandaag · {{ todayView.date ?? '' }} · {{ todayView.label }}
            <span v-if="today.demo" class="rp__demo">prototype: we doen alsof het {{ todayView.label.toLowerCase() }} is</span>
          </p>
          <h2 class="rp__h2 rp__h2--today">{{ todayTitle }}</h2>
          <p class="rp__text">{{ todaySummary }}</p>
          <div v-if="todayLeg" class="rp__today-leg">
            <img v-if="todayLeg.image" class="rp__photo rp__photo--sm" :src="todayLeg.image" alt="" />
            <div>
              <p class="rp__route-title">Route van vandaag: {{ todayLeg.title }}</p>
              <p class="rp__route-meta">{{ todayLeg.meta }}</p>
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

      <!-- ── De route tussen de hotels: etappes met hotelfoto + de minimap van de dealpagina ── -->
      <section class="rp__section">
        <h2 class="rp__h2">De route tussen de hotels</h2>
        <div class="rp__between">
          <ul class="rp__routes">
            <li v-for="(leg, i) in legs" :key="leg.title" class="rp__route">
              <img v-if="leg.image" class="rp__photo" :src="leg.image" alt="" />
              <div class="rp__route-text">
                <p class="rp__route-title"><span class="rp__route-num">{{ i + 1 }}</span>{{ leg.title }}</p>
                <p class="rp__route-meta">{{ leg.meta }}</p>
              </div>
              <p class="rp__route-links">
                <a href="#" @click.prevent="mapOpen = true">Bekijk</a>
                <a href="#" @click.prevent>Download pdf</a>
                <a href="#" @click.prevent>Download gpx</a>
              </p>
            </li>
          </ul>
          <MultiHotelTripRouteMapCard
            class="rp__minimap"
            :stops="mapStops" :legs="routeLegs" :return-label="mapReturnLabel" :summary="mapSummary"
            @open="mapOpen = true"
          />
        </div>
      </section>

      <!-- ── Routes rondom elk hotel: twee blokken naast elkaar, met foto-thumbs en ingang naar alle tips ── -->
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
                  <img v-if="r.image" class="rp__photo rp__photo--sm" :src="r.image" alt="" />
                  <div class="rp__route-text">
                    <p class="rp__route-title">{{ r.title }}</p>
                    <p class="rp__route-meta">{{ r.meta }}</p>
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

      <!-- ── Voorbeeld reisschema (zoals op de dealpagina) + Boeking terugvinden ── -->
      <section class="rp__section rp__grid rp__grid--wide">
        <article class="rp__card">
          <div class="rp__card-body">
            <h2 class="rp__h2 rp__h2--card rp__h2--icon">
              <svg class="rp__h2-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-miterlimit="10" stroke-linecap="square" aria-hidden="true"><path d="M15 5h7M15 15h7M15 9h2M15 19h2" /><circle cx="6.5" cy="17.5" r="3.5" /><circle cx="6.5" cy="6.5" r="3.5" /></svg>
              Voorbeeld reisschema
            </h2>
            <TripItinerarySummary :days="daysView" :hotels="hotelLinks" :show-stats="false" lines @select="openItin($event)" />
            <p class="rp__route-links rp__route-links--lg rp__card-more">
              <a href="#" @click.prevent="openItin(null)">Bekijken</a>
              <a href="#" @click.prevent>Download pdf</a>
            </p>
          </div>
        </article>
        <article class="rp__card rp__card--tint rp__card--self">
          <div class="rp__card-body">
            <h2 class="rp__h2 rp__h2--card">Boeking terugvinden</h2>
            <p class="rp__text">Je boeking staat in je ViaLuxury-account op <b>{{ email }}</b>. Inloggen doe je zonder wachtwoord: je krijgt een inloglink per mail.</p>
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
.rp__main { flex: 1; padding-top: 24px; padding-bottom: 64px; display: flex; flex-direction: column; gap: 40px; }
.rp__h2 { margin: 0 0 16px; font-family: var(--font-heading); font-size: 26px; font-weight: 700; line-height: 1.25; }
.rp__h2--card { font-size: 22px; margin-bottom: 8px; }
.rp__h2--icon { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.rp__h2-icon { flex-shrink: 0; width: 24px; height: 24px; }
.rp__h2--today { font-size: 24px; margin: 6px 0 8px; }
.rp__h3 { margin: 0; font-family: var(--font-heading); font-size: 20px; font-weight: 700; line-height: 1.25; }
.rp__text { margin: 0 0 12px; font-size: 15px; line-height: 1.5; color: var(--color-text-secondary); }
.rp__anchor { scroll-margin-top: 90px; }

/* Prototype-schakelaar linksboven */
.rp__proto { display: flex; margin-bottom: -16px; }
.rp__switch { display: inline-flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; font-size: 13px; color: var(--color-text-secondary); }
.rp__switch-input { position: absolute; opacity: 0; width: 0; height: 0; }
.rp__switch-track { position: relative; width: 38px; height: 22px; border-radius: 11px; background: #cfcfcf; transition: background var(--transition-fast); }
.rp__switch-knob { position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); transition: transform var(--transition-fast); }
.rp__switch-input:checked + .rp__switch-track { background: var(--color-primary); }
.rp__switch-input:checked + .rp__switch-track .rp__switch-knob { transform: translateX(16px); }
.rp__switch-input:focus-visible + .rp__switch-track { outline: 2px solid var(--color-primary); outline-offset: 2px; }

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
.rp__today-leg { display: flex; align-items: center; gap: 12px; margin: 4px 0 12px; padding: 10px 12px; border-radius: 8px; background: #fff; }
.rp__today-leg p { margin: 0; }
.rp__today-weather { text-align: center; padding: 12px; border-radius: 12px; background: #fff; }
.rp__today-icon { width: 56px; height: 56px; }
.rp__today-temp { margin: 0; font-family: var(--font-heading); font-size: 34px; font-weight: 700; line-height: 1.1; }
.rp__today-weathertext { margin: 4px 0 0; font-size: 13px; color: var(--color-text-secondary); line-height: 1.4; }
.rp__today-place { color: var(--color-text-primary); font-weight: 600; }

/* Routelijsten: foto | titel + meta | linkjes */
.rp__routes { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.rp__route { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-top: 1px solid var(--color-border); }
.rp__route:first-child { border-top: 0; }
.rp__routes--compact .rp__route { padding: 9px 0; gap: 12px; }
.rp__route-text { flex: 1; min-width: 0; }
.rp__route-title { margin: 0; display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 600; line-height: 1.35; }
.rp__route-meta { margin: 2px 0 0; font-size: 13px; color: var(--color-text-secondary); }
.rp__route-num { flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: var(--color-text-primary); color: #fff; font-size: 12px; font-weight: 700; }
.rp__route-links { margin: 0; flex-shrink: 0; display: flex; gap: 14px; font-size: 13px; white-space: nowrap; }
.rp__route-links a { color: var(--color-primary); font-weight: 600; text-decoration: underline; text-underline-offset: 2px; }
.rp__route-links a:hover { color: var(--color-primary-hover); }
.rp__route-links--lg { font-size: 15px; flex-wrap: wrap; white-space: normal; }
.rp__card-more { margin-top: 12px; }
.rp__photo { flex-shrink: 0; width: 72px; height: 54px; object-fit: cover; border-radius: 6px; }
.rp__photo--sm { width: 60px; height: 44px; }

/* Route tussen de hotels: lijst + minimap (zoals op de dealpagina) */
.rp__between { display: grid; grid-template-columns: minmax(0, 1fr) 400px; gap: 32px; align-items: start; }
.rp__minimap { width: 100%; }

/* Kaarten in een raster van twee */
.rp__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; align-items: start; }
.rp__grid--wide { grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); }
.rp__card { overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: #fff; }
.rp__card--tint { background: #f4f1ec; border-color: #f4f1ec; }
.rp__card--dark { background: var(--color-text-primary); border-color: var(--color-text-primary); color: #fff; }
.rp__card--dark .rp__handy-label { color: rgba(255, 255, 255, 0.65); }
.rp__card--dark .rp__handy-link { color: #fff; }
.rp__card-img { display: block; width: 100%; height: 160px; object-fit: cover; }
.rp__card-body { padding: 20px 22px 18px; }
.rp__card-body--handy { padding: 18px 20px; }
.rp__card-sub { margin: 2px 0 10px; font-size: 13px; color: var(--color-text-secondary); }

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
  .rp__main { padding-top: 20px; gap: 32px; }
  .rp__today { grid-template-columns: 1fr; padding: 18px 16px; }
  .rp__today-weather { display: flex; align-items: center; justify-content: center; gap: 12px; text-align: left; }
  .rp__today-icon { width: 40px; height: 40px; }
  .rp__today-temp { font-size: 28px; }
  .rp__between, .rp__grid, .rp__grid--wide { grid-template-columns: 1fr; gap: 16px; }
  .rp__handy { grid-template-columns: 1fr; }
  .rp__route { flex-wrap: wrap; }
  .rp__route-links { width: 100%; padding-left: 86px; white-space: normal; }
  .rp__routes--compact .rp__route-links { padding-left: 72px; }
}
</style>
