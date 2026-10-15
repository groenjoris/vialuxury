<script setup lang="ts">
// Multi Hotel Trip — persoonlijke reispagina na het boeken (autovariant, briefing 2026-10-15):
// hero (foto sluit aan op de zwarte navigatiebalk, de zoekbalk valt over de foto) met de
// reistitel, de reisdatums + "Nog x dagen te gaan" (gerekend vanaf de vaste prototype-datum
// 1 november 2026) en rechts de weersverwachting: ver van tevoren een weekverwachting op basis
// van historische gemiddelden (gekleurde tegels met thermometer, zon en regenwolk), vanaf 10
// dagen voor vertrek (of met het Vandaag-blok aan) per dag. Daaronder "Praktische informatie":
// de drie hotels naast elkaar met foto, datums, check-in (datum + tijd) en check-out, adres +
// routebeschrijving, telefoon, parkeren en opladen (fiets: stalling); bij een fietsvakantie
// daaronder "Bagagetransfer" (⅔) en "Routes" (⅓); een contactregel; dan het voorbeeld
// reisschema (dagen klikbaar → sidepanel, Bekijken / Download pdf) naast de minimap; en
// onderaan de tips per hotel zoals op de dealpagina ("Wat te doen tijdens je vakantie"). Het
// Vandaag-blok staat standaard uit; de prototype-schakelaar zit linksboven in de navigatiebalk.
// Telefoonnummers, adressen en laadpunten zijn prototype-placeholders.
import dayjs from 'dayjs'
import { tripCheckoutBySlug } from '~/data/mht-checkout/trip'
import { tripPdpBySlug, tripHotelDetails } from '~/data/mht-trip-pdp'
import tripRoutesJson from '~/data/mht-trip-routes.json'
import type { TripRouteLeg, TripMapStop } from '~/utils-multi-hotel-trip/tripMapLayers'
import { isTripSight } from '~/utils-multi-hotel-trip/tripSights'
import { nightsLabel } from '~/utils-multi-hotel-trip/plural'
import { formatDateWeekdayShort } from '~/utils-multi-hotel-trip/formatDate'
import { useMultiHotelTripCheckoutTrip } from '~/composables-multi-hotel-trip/useMultiHotelTripCheckoutTrip'
import { useMultiHotelTripI18n } from '~/composables-multi-hotel-trip/useMultiHotelTripI18n'
import { buildTripDaysView, tripDistanceLabelFn, tripDurationLabel } from '~/composables-multi-hotel-trip/useMultiHotelTripDaysView'
import TripItineraryPanel from '~/components-multi-hotel-trip/deal/TripItineraryPanel.vue'
import TripItinerarySummary from '~/components-multi-hotel-trip/deal/TripItinerarySummary.vue'
import TripItineraryPerCity from '~/components-multi-hotel-trip/deal/TripItineraryPerCity.vue'
import type { TripCityChapter, TripCityAttraction } from '~/components-multi-hotel-trip/deal/TripItineraryPerCity.vue'
import type { TripHotelModalData } from '~/components-multi-hotel-trip/deal/TripHotelDetails.vue'

const { t, localized } = useMultiHotelTripI18n()
// Dag- en nachtlabels in het Nederlands (de reispagina is alleen Nederlandstalig).
const lang = computed<'nl'>(() => 'nl')

/* ── Reis + gast (gedeelde checkout-state; zonder checkout de Opaalkust-demo) ── */
const DEMO_SLUG = 'ontdek-noord-frankrijk-en-de-opaalkust-in-7-dagen'
const { trip: checkoutTrip, day: checkoutDay } = useMultiHotelTripCheckoutTrip()
const checkout = computed(() => checkoutTrip.value ?? tripCheckoutBySlug(DEMO_SLUG)!)
const tripPdp = computed(() => tripPdpBySlug(checkout.value.slug))
const trip = computed(() => tripPdp.value?.trip ?? null)
const isBike = computed(() => trip.value?.type === 'fiets')

/* ── Prototype-schakelaar (linksboven in de navigatiebalk): het Vandaag-blok aan of uit; standaard uit ── */
const showToday = useState<boolean>('mht-trip-page-today', () => false)

/* ── Datums ── */
const DEMO_YMD = { year: 2027, month: 4, day: 18 }
const WEEKDAYS = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']
const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
const MONTHS_LONG = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']
const checkInYmd = computed(() => checkoutDay.value?.checkInYmd ?? DEMO_YMD)
const dateAt = (offset: number) => { const y = checkInYmd.value; return new Date(y.year, y.month, y.day + offset) }
const fmt = (d: Date) => `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
const pad = (n: number) => String(n).padStart(2, '0')
const checkInIso = computed(() => { const y = checkInYmd.value; return `${y.year}-${pad(y.month + 1)}-${pad(y.day)}` })
const nights = computed(() => trip.value?.nights ?? checkout.value.nights)
const dateRange = computed(() => `${fmt(dateAt(0))} t/m ${fmt(dateAt(nights.value))} ${checkInYmd.value.year}`)
/** Vaste "vandaag" van het prototype: 1 november 2026 (daarvandaan tellen we de dagen tot vertrek). */
const TODAY = new Date(2026, 10, 1)
/** Dagen tot vertrek (negatief = al vertrokken). */
const daysToGo = computed(() => Math.round((dateAt(0).getTime() - TODAY.getTime()) / 86400000))
const countdown = computed(() => {
  const d = daysToGo.value
  if (d > 1) return `Nog ${d} dagen te gaan`
  if (d === 1) return 'Morgen vertrek je!'
  if (d === 0) return 'Vandaag vertrek je!'
  if (d >= -nights.value) return 'Je bent onderweg'
  return 'Welkom thuis'
})
/** "1 u 10 min" / "45 min". */
const durationShort = (minutes: number) => { const h = Math.floor(minutes / 60), m = Math.round(minutes % 60); return h ? `${h} u${m ? ` ${m} min` : ''}` : `${m} min` }

/* ── Weersverwachting (prototype: gefaket). Ver van tevoren een weekverwachting op basis van
   historische gemiddelden; vanaf 10 dagen voor vertrek (of met het Vandaag-blok aan) per dag. ── */
const WEATHER = [
  { icon: 'sun', hi: 22, text: 'zonnig' }, { icon: 'sun', hi: 23, text: 'zonnig' }, { icon: 'suncloud', hi: 21, text: 'zon en wolken' }, { icon: 'sun', hi: 24, text: 'zonnig' },
  { icon: 'sun', hi: 25, text: 'zonnig en warm' }, { icon: 'suncloud', hi: 23, text: 'zon en wolken' }, { icon: 'sun', hi: 22, text: 'zonnig' }, { icon: 'sun', hi: 24, text: 'zonnig' },
] as const
const weatherDays = computed(() => Array.from({ length: nights.value + 1 }, (_, i) => {
  const d = dateAt(i)
  return { key: i, day: WEEKDAYS[d.getDay()]!, date: d.getDate(), ...WEATHER[i % WEATHER.length]! }
}))
const weatherRegion = computed(() => trip.value?.stops[0]?.region ?? trip.value?.stops[0]?.city ?? '')
const detailedWeather = computed(() => showToday.value || daysToGo.value <= 10)
/** Gemiddeld weer per maand (West-Europa, indicatief): max. temperatuur, zonuren per dag, kans op regen. */
const HIST = [
  { hi: 6, sun: 2, rain: 45 }, { hi: 7, sun: 3, rain: 40 }, { hi: 10, sun: 4, rain: 40 }, { hi: 14, sun: 6, rain: 35 }, { hi: 18, sun: 7, rain: 35 }, { hi: 21, sun: 7, rain: 30 },
  { hi: 23, sun: 7, rain: 30 }, { hi: 23, sun: 7, rain: 30 }, { hi: 19, sun: 5, rain: 35 }, { hi: 15, sun: 4, rain: 40 }, { hi: 10, sun: 2, rain: 45 }, { hi: 7, sun: 2, rain: 45 },
]
const hist = computed(() => HIST[checkInYmd.value.month]!)
const monthName = computed(() => MONTHS_LONG[checkInYmd.value.month]!)
/** Kleur van de temperatuurtegel: fris (< 12°), mild (12–17°) of warm (≥ 18°). */
const tempTone = computed(() => (hist.value.hi >= 18 ? 'warm' : hist.value.hi >= 12 ? 'mild' : 'cool'))
/** Regentegel: bij veel kans op regen een wolk met meer druppels. */
const rainTone = computed(() => (hist.value.rain >= 40 ? 'wet' : 'dry'))

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

/* ── Etappes van hotel naar hotel (voor "Route van vandaag" in het Vandaag-blok) ── */
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
  return out
})

/* ── Praktische informatie per hotel: datums, check-in (datum + tijd), check-out, adres,
   telefoon, parkeren, opladen. Adressen, telefoonnummers en laadpunten zijn placeholders. ── */
const ADDRESSES: Record<string, string> = {
  'Château Tilques': 'Rue du Château, 62500 Tilques',
  'Château Cléry': 'Rue du Château, 62360 Hesdin-l\'Abbé',
  'Hotel Royal Beaulaincourt': 'Rue de Beaulaincourt, 62400 Béthune',
}
const stays = computed(() => {
  let offset = 0
  return (trip.value?.stops ?? []).map((s, i) => {
    const from = dateAt(offset)
    const to = dateAt(offset + s.nights)
    offset += s.nights
    const incl = s.includes.map(x => localized(x))
    const lateOut = incl.map(x => x.match(/check-?out[^0-9]*(\d{1,2})[:.](\d{2})/i)).find(Boolean)
    return {
      ...s,
      from: fmt(from),
      to: fmt(to),
      nightsLabel: nightsLabel(s.nights, lang.value),
      checkInTime: s.checkIn,
      checkOutTime: lateOut ? `${lateOut[1]}:${lateOut[2]}` : '11:00',
      address: ADDRESSES[s.hotelName] ?? `${s.city}, ${s.region}`,
      mapsHref: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.hotelName} ${s.city}`)}`,
      phone: `+33 3 21 12 34 5${i + 1}`,
      parking: incl.find(x => /parkeren/i.test(x)) ?? 'Gratis parkeren bij het hotel',
      charging: i === 0 ? 'Laadpunt bij het hotel' : `Laadpunt op ${i + 1} km`,
    }
  })
})

/* ── Voorbeeld reisschema (dagsamenvatting + sidepanel) en kaart ── */
const daysView = computed(() => buildTripDaysView(tripPdp.value, trip.value, checkInIso.value, t, localized))
const hotelLinks = computed(() => (trip.value?.stops ?? []).map((s, i) => ({ name: s.hotelName, stopIndex: i })))
const itinOpen = ref(false)
const itinFocus = ref<number | null>(null)
function openItin(day: number | null = null) { itinFocus.value = day; itinOpen.value = true }
const mapOpen = ref(false)

/* ── Tips per hotel, zoals "Wat te doen tijdens je vakantie" op de dealpagina (zelfde opbouw) ── */
const cityChapters = computed<TripCityChapter[]>(() => {
  const d = trip.value
  const pdp = tripPdp.value
  if (!d || !pdp) return []
  const days = daysView.value
  const lastDay = d.nights + 1
  return d.stops.map((s, i) => {
    const isLast = i === d.stops.length - 1
    const dayTo = isLast ? Math.max(s.dayTo, lastDay) : s.dayTo
    const stopDays = days.filter(day => day.stopIndex === i || (isLast && day.stopIndex == null && day.day > s.dayTo))
    const ownTips = pdp.content?.hotels[s.hotelName]?.tips
    const attractions: TripCityAttraction[] = ownTips?.length
      ? ownTips.map(tip => ({ kind: 'activity', tag: t('trip.tag.activity'), title: localized(tip.title), text: localized(tip.text), image: tip.image ?? s.image, dayLabel: '' }))
      : stopDays
        .flatMap(day => day.blocks.filter(isTripSight).map(b => ({ ...b, dayLabel: day.label })))
        .map((a, k) => ({ ...a, image: a.image ?? a.more?.image ?? s.extraImages?.[k] ?? s.image }))
        .slice(0, 3)
    const dayLabel = dayTo === s.dayFrom
      ? t('trip.daySingle').replace('{a}', String(s.dayFrom))
      : dayTo === s.dayFrom + 1
        ? t('trip.dayAnd').replace('{a}', String(s.dayFrom)).replace('{b}', String(dayTo))
        : t('trip.dayRange').replace('{a}', String(s.dayFrom)).replace('{b}', String(dayTo))
    return {
      stopIndex: i,
      city: s.city,
      region: s.region,
      hotelName: s.hotelName,
      starRating: s.starRating,
      image: s.image,
      nightsLabel: nightsLabel(s.nights, lang.value),
      dayLabel,
      checkIn: formatDateWeekdayShort(dayjs(checkInIso.value).add(s.dayFrom - 1, 'day').format('YYYY-MM-DD')),
      checkOut: formatDateWeekdayShort(dayjs(checkInIso.value).add(s.dayFrom - 1 + s.nights, 'day').format('YYYY-MM-DD')),
      travelKm: s.travel?.km,
      attractions,
    }
  })
})
/* Hotelsidepanel (via de hotels op de minimap), zoals op de dealpagina. */
const panelIndex = ref<number | null>(null)
function openHotel(i: number) { panelIndex.value = i }
const panelHotel = computed<TripHotelModalData | null>(() => {
  const d = trip.value, pdp = tripPdp.value, i = panelIndex.value
  if (!d || !pdp || i == null) return null
  const h = tripHotelDetails(d, pdp.content, i)
  const stop = d.stops[i]
  if (!h || !stop) return null
  const checkInDay = dayjs(checkInIso.value).add(stop.dayFrom - 1, 'day')
  return {
    name: h.name,
    starRating: h.starRating,
    location: `${h.city}, ${h.region}`,
    checkInDate: formatDateWeekdayShort(checkInDay.format('YYYY-MM-DD')),
    checkOutDate: formatDateWeekdayShort(checkInDay.add(stop.nights, 'day').format('YYYY-MM-DD')),
    images: h.images,
    description: localized(h.description),
    facilities: h.facilities,
    includes: h.includes.map(inc => localized(inc)),
    houseRules: h.houseRules.map(r => ({ title: localized(r.title), description: localized(r.description) })),
    room: h.room ? { name: localized(h.room.name), description: localized(h.room.description), image: h.room.image } : undefined,
    checkIn: h.checkIn,
  }
})

/* ── Vandaag: tijdens de reis de echte dag; daarbuiten (prototype) dag 3 als voorbeeld ── */
const today = computed(() => {
  const d = 1 - daysToGo.value
  const inTrip = d >= 1 && d <= nights.value + 1
  return { day: inTrip ? d : Math.min(3, nights.value + 1), demo: !inTrip }
})
const todayView = computed(() => daysView.value.find(d => d.day === today.value.day))
const todayWeather = computed(() => weatherDays.value[today.value.day - 1])
const todayStop = computed(() => (todayView.value?.stopIndex != null ? trip.value?.stops[todayView.value.stopIndex] : null) ?? null)
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

useHead({ title: `${checkout.value.name} — Tips & routes — ViaLuxury` })
</script>

<template>
  <div class="rp">
    <MultiHotelTripSiteHeader />
    <MultiHotelTripFlowLink />

    <!-- Prototype-schakelaar linksboven in de navigatiebalk, onder het flow-linkje (niet voor de gast): Vandaag-blok aan/uit -->
    <label class="rp__proto" title="Prototype: Vandaag-blok aan/uit">
      <input v-model="showToday" type="checkbox" class="rp__switch-input" />
      <span class="rp__switch-track" aria-hidden="true"><span class="rp__switch-knob" /></span>
      <span class="rp__switch-label">Vandaag</span>
    </label>

    <!-- ── Hero: reisfoto direct onder de navigatiebalk (de zoekbalk valt eroverheen), reistitel, datums, weer ── -->
    <section class="rp__hero" :style="{ backgroundImage: `url(${trip?.coverImage ?? checkout.thumb})` }">
      <div class="rp__hero-inner container">
        <div class="rp__hero-text">
          <h1 class="rp__title">{{ checkout.name }}</h1>
          <p class="rp__dates">{{ dateRange }} <span class="rp__countdown">{{ countdown }}</span></p>
        </div>
        <aside class="rp__weather" aria-label="Weersverwachting">
          <template v-if="detailedWeather">
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
          </template>
          <template v-else>
            <p class="rp__weather-head">Verwachting voor je reisweek <span class="rp__weather-region">{{ weatherRegion }} · {{ monthName }}</span></p>
            <ul class="rp__weather-stats">
              <li class="rp__wstat" :class="`rp__wstat--${tempTone}`">
                <svg class="rp__wstat-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10 4a2 2 0 1 1 4 0v9.3a4 4 0 1 1-4 0V4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /><path d="M12 9v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" /><circle cx="12" cy="17" r="1.6" fill="currentColor" /></svg>
                <span class="rp__weather-big">{{ hist.hi }}°</span><span class="rp__weather-stat">gemiddeld overdag</span>
              </li>
              <li class="rp__wstat rp__wstat--sun">
                <svg class="rp__wstat-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="currentColor" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
                <span class="rp__weather-big">{{ hist.sun }} u</span><span class="rp__weather-stat">zon per dag</span>
              </li>
              <li class="rp__wstat rp__wstat--rain" :class="`rp__wstat--${rainTone}`">
                <svg class="rp__wstat-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 15h10a4 4 0 0 0 .5-8A5.5 5.5 0 0 0 7 6.5 4.3 4.3 0 0 0 7 15z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /><path d="M9 18l-1 2.5M13 18l-1 2.5M17 18l-1 2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
                <span class="rp__weather-big">{{ hist.rain }}%</span><span class="rp__weather-stat">kans op regen</span>
              </li>
            </ul>
            <p class="rp__weather-note">Op basis van het gemiddelde weer in {{ monthName }} van de afgelopen jaren. De verwachting per dag verschijnt 10 dagen voor vertrek.</p>
          </template>
        </aside>
      </div>
    </section>

    <main class="container rp__main">
      <!-- ── Vandaag (alleen met de schakelaar aan): dagprogramma + weer van vandaag ── -->
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
            <a v-if="todayStop" :href="`#hotel-${todayView.stopIndex}`">Praktische informatie {{ todayStop.hotelName }}</a>
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

      <!-- ── Praktische informatie: de drie hotels naast elkaar ── -->
      <section class="rp__section">
        <h2 class="rp__h2">Praktische informatie</h2>
        <div class="rp__hotels">
          <article v-for="(s, i) in stays" :id="`hotel-${i}`" :key="s.hotelName" class="rp__hotel rp__anchor">
            <img v-if="s.image" class="rp__hotel-img" :src="s.image" :alt="s.hotelName" />
            <div class="rp__hotel-body">
              <p class="rp__hotel-name">
                <span class="rp__route-num">{{ i + 1 }}</span>
                <span>{{ s.hotelName }} <span v-if="s.starRating" class="rp__stars" aria-hidden="true"><svg v-for="n in s.starRating" :key="n" class="icon-star" viewBox="0 0 18 18" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M16.963,6.786c-.088-.271-.323-.469-.605-.51l-4.62-.671L9.672,1.418c-.252-.512-1.093-.512-1.345,0l-2.066,4.186-4.62,.671c-.282,.041-.517,.239-.605,.51-.088,.271-.015,.57,.19,.769l3.343,3.258-.79,4.601c-.048,.282,.067,.566,.298,.734,.231,.167,.538,.189,.79,.057l4.132-2.173,4.132,2.173c.11,.058,.229,.086,.349,.086,.155,0,.31-.048,.441-.143,.231-.168,.347-.452,.298-.734l-.79-4.601,3.343-3.258c.205-.199,.278-.498,.19-.769Z"/></svg></span></span>
              </p>
              <p class="rp__hotel-sub">{{ s.city }} · {{ s.nightsLabel }} · {{ s.from }} t/m {{ s.to }}</p>
              <div class="rp__checks">
                <div class="rp__check">
                  <span class="rp__label">Check-in</span>
                  <span class="rp__check-date">{{ s.from }}</span>
                  <span class="rp__check-time">vanaf {{ s.checkInTime }} uur</span>
                </div>
                <div class="rp__check">
                  <span class="rp__label">Check-out</span>
                  <span class="rp__check-date">{{ s.to }}</span>
                  <span class="rp__check-time">tot {{ s.checkOutTime }} uur</span>
                </div>
              </div>
              <ul class="rp__info">
                <li><span class="rp__label">Adres</span>{{ s.address }} · <a class="rp__info-link" :href="s.mapsHref" target="_blank" rel="noopener">Routebeschrijving</a></li>
                <li><span class="rp__label">Telefoon</span><a class="rp__info-link" :href="`tel:${s.phone.replace(/\s/g, '')}`">{{ s.phone }}</a></li>
                <li><span class="rp__label">Parkeren</span>{{ s.parking }}</li>
                <li><span class="rp__label">{{ isBike ? 'Fietsenstalling' : 'Opladen elektrische auto' }}</span>{{ isBike ? 'Afgesloten stalling bij het hotel' : s.charging }}</li>
              </ul>
            </div>
          </article>
        </div>
        <!-- Fietsvakantie: bagagetransfer (⅔) en routes (⅓) onder de hotels -->
        <div v-if="isBike" class="rp__bike">
          <article class="rp__card">
            <div class="rp__card-body">
              <h3 class="rp__h3 rp__h3--icon">
                <svg class="rp__h3-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V4h6v3M8 11v5M16 11v5" /></svg>
                Bagagetransfer
              </h3>
              <p class="rp__text rp__text--last">Je bagage reist elke etappe vooruit naar het volgende hotel. Neem per persoon één koffer of tas mee en zet die op de dag van vertrek vóór 9:00 uur 's ochtends bij de receptie; aan het eind van de dag staat hij klaar in je volgende hotel. Jij fietst met alleen een dagtas. Bij het hotel krijg je meer gedetailleerde informatie over de transfer.</p>
            </div>
          </article>
          <article class="rp__card">
            <div class="rp__card-body">
              <h3 class="rp__h3 rp__h3--icon">
                <svg class="rp__h3-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="6" r="2.5" /><path d="M8.5 18H14a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h5.5" /></svg>
                Routes
              </h3>
              <p class="rp__text rp__text--last">Bij aankomst in het hotel ontvang je de fietsroutes van de volgende etappe: uitgeprint én met een QR-code om ze online te bekijken.</p>
            </div>
          </article>
        </div>

        <p class="rp__contact">
          Hulp nodig onderweg? Bel <a class="rp__info-link" href="tel:+31207052222">+31 20 705 2222</a> of WhatsApp <a class="rp__info-link" href="https://wa.me/31208088809">+31 20 808 8809</a> · ma t/m vr 8:00 – 18:00
        </p>
      </section>

      <!-- ── Voorbeeld reisschema (dagen klikbaar → sidepanel) naast de minimap ── -->
      <section class="rp__section rp__plan">
        <article class="rp__card">
          <div class="rp__card-body">
            <h2 class="rp__h2 rp__h2--card rp__h2--icon">
              <svg class="rp__h2-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-miterlimit="10" stroke-linecap="square" aria-hidden="true"><path d="M15 5h7M15 15h7M15 9h2M15 19h2" /><circle cx="6.5" cy="17.5" r="3.5" /><circle cx="6.5" cy="6.5" r="3.5" /></svg>
              Voorbeeld reisschema
            </h2>
            <p class="rp__text">{{ t('trip.itineraryIntro') }}</p>
            <TripItinerarySummary :days="daysView" :hotels="hotelLinks" :show-stats="false" lines @select="openItin($event)" />
            <p class="rp__route-links rp__route-links--lg rp__card-more">
              <a href="#" @click.prevent="openItin(null)">Bekijken</a>
              <a href="#" @click.prevent>Download pdf</a>
            </p>
          </div>
        </article>
        <MultiHotelTripRouteMapCard
          class="rp__minimap"
          :stops="mapStops" :legs="routeLegs" :return-label="mapReturnLabel" :summary="mapSummary"
          @open="mapOpen = true"
          @stop-click="openHotel"
        />
      </section>

      <!-- ── Tips per hotel, zoals op de dealpagina ── -->
      <section class="rp__section rp__tips">
        <h2 class="rp__h2">{{ t('trip.itin.city.heading') }}</h2>
        <p class="rp__text">{{ t('trip.itin.city.intro') }}</p>
        <TripItineraryPerCity :chapters="cityChapters" :days="daysView" :hotels="hotelLinks" :show-stats="false" :show-toggle="false" @open-hotel="openHotel" />
      </section>
    </main>

    <TripItineraryPanel :open="itinOpen" :days="daysView" :focus-day="itinFocus" :trip-name="checkout.name" @close="itinOpen = false" />
    <MultiHotelTripFullscreenMap :open="mapOpen" :title="checkout.name" :stops="routeStops" :legs="routeLegs" :highlights="[]" @close="mapOpen = false" />
    <MultiHotelTripHotelPanel overlay :hotel="panelHotel" @close="panelIndex = null" />

    <MultiHotelTripSiteFooter />
  </div>
</template>

<style scoped>
.rp { position: relative; min-height: 100vh; display: flex; flex-direction: column; background: var(--color-bg, #fff); color: var(--color-text-primary); }
/* De foto sluit aan op de zwarte navigatiebalk: geen witte band; de zoekbalk steekt 38px over de foto. */
.rp :deep(.site-header) { margin-bottom: 0; }
/* width: 100% — `.container` heeft `margin: 0 auto`, waardoor het flex-item anders niet uitrekt maar zo breed wordt als de breedste inhoud (minimap, tipskaarten). */
.rp__main { flex: 1; width: 100%; padding-top: 40px; padding-bottom: 64px; display: flex; flex-direction: column; gap: 48px; }
.rp__h2 { margin: 0 0 16px; font-family: var(--font-heading); font-size: 26px; font-weight: 700; line-height: 1.25; }
.rp__h2--card { font-size: 22px; margin-bottom: 8px; }
.rp__h2--icon { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.rp__h2-icon { flex-shrink: 0; width: 24px; height: 24px; }
.rp__h2--today { font-size: 24px; margin: 6px 0 8px; }
.rp__h3 { margin: 0 0 8px; font-family: var(--font-heading); font-size: 20px; font-weight: 700; line-height: 1.25; }
.rp__h3--icon { display: flex; align-items: center; gap: 10px; }
.rp__h3-icon { flex-shrink: 0; width: 22px; height: 22px; }
.rp__text--last { margin-bottom: 0; }
.rp__text { margin: 0 0 14px; font-size: 15px; line-height: 1.5; color: var(--color-text-secondary); }
.rp__anchor { scroll-margin-top: 90px; }
.rp__label { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--color-text-secondary); }

/* Prototype-schakelaar: linksboven in de zwarte navigatiebalk, boven de header (z 500) */
.rp__proto { position: absolute; top: 34px; left: 8px; z-index: 600; display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer; user-select: none; }
.rp__switch-input { position: absolute; opacity: 0; width: 0; height: 0; }
.rp__switch-track { position: relative; width: 30px; height: 18px; border-radius: 9px; background: rgba(255, 255, 255, 0.28); transition: background var(--transition-fast); }
.rp__switch-knob { position: absolute; top: 3px; left: 3px; width: 12px; height: 12px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); transition: transform var(--transition-fast); }
.rp__switch-input:checked + .rp__switch-track { background: var(--color-primary); }
.rp__switch-input:checked + .rp__switch-track .rp__switch-knob { transform: translateX(12px); }
.rp__switch-input:focus-visible + .rp__switch-track { outline: 2px solid var(--color-primary); outline-offset: 2px; }
.rp__switch-label { font-size: 9px; letter-spacing: 0.04em; text-transform: uppercase; color: rgba(255, 255, 255, 0.6); }

/* Hero */
.rp__hero { position: relative; min-height: 460px; display: flex; align-items: stretch; background-size: cover; background-position: center; color: #fff; }
.rp__hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 30%, rgba(0, 0, 0, 0.65) 100%); }
.rp__hero-inner { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 32px; align-items: end; width: 100%; padding-top: 86px; padding-bottom: 40px; }
.rp__eyebrow { margin: 0 0 8px; font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(255, 255, 255, 0.85); }
.rp__eyebrow--dark { color: var(--color-text-secondary); display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.rp__demo { font-size: 11px; font-weight: 500; letter-spacing: 0; text-transform: none; padding: 2px 8px; border-radius: 999px; background: #fff; color: var(--color-text-secondary); border: 1px solid var(--color-border); }
.rp__title { margin: 0; max-width: 720px; font-family: var(--font-heading); font-size: 42px; font-weight: 700; line-height: 1.1; color: #fff; }
.rp__dates { margin: 12px 0 0; display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; font-size: 17px; color: rgba(255, 255, 255, 0.92); }
.rp__countdown { display: inline-block; padding: 4px 12px; border-radius: 999px; background: #fff; color: var(--color-text-primary); font-size: 14px; font-weight: 700; }
/* Weer: witte kaart rechts(onder) in de hero */
.rp__weather { align-self: end; min-width: 320px; max-width: 360px; padding: 16px 18px; border-radius: 12px; background: rgba(255, 255, 255, 0.96); color: var(--color-text-primary); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); }
.rp__weather-head { margin: 0 0 10px; font-size: 14px; font-weight: 700; }
.rp__weather-region { font-weight: 400; color: var(--color-text-secondary); }
.rp__weather-days { list-style: none; margin: 0; padding: 0; display: flex; gap: 4px; }
.rp__weather-day { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 6px 2px; border-radius: 8px; background: #f7f7f7; }
.rp__weather-day--today { background: #f4f1ec; box-shadow: inset 0 0 0 1.5px var(--color-text-primary); }
.rp__weather-dow { font-size: 11px; color: var(--color-text-secondary); white-space: nowrap; }
.rp__weather-icon { width: 24px; height: 24px; }
.rp__weather-temp { font-size: 14px; font-weight: 700; }
/* Weektegels: gekleurd naar het weer — temperatuur (fris/mild/warm), zon (geel), regen (blauw) */
.rp__weather-stats { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.rp__wstat { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 12px 4px 10px; border-radius: 10px; background: #f7f7f7; text-align: center; }
.rp__wstat-icon { width: 28px; height: 28px; margin-bottom: 4px; }
.rp__wstat--cool { background: #e7f1fb; color: #3b7fc4; }
.rp__wstat--mild { background: #eaf6ec; color: #3f9a57; }
.rp__wstat--warm { background: #fff0e4; color: #e8632b; }
.rp__wstat--sun { background: #fff7d6; color: #f0b400; }
.rp__wstat--rain { background: #e7f1fb; color: #4a90d9; }
.rp__wstat--wet { background: #dde9f7; color: #2f6fb5; }
.rp__wstat .rp__weather-big, .rp__wstat .rp__weather-stat { color: var(--color-text-primary); }
.rp__wstat .rp__weather-stat { color: var(--color-text-secondary); }
.rp__weather-big { font-family: var(--font-heading); font-size: 24px; font-weight: 700; line-height: 1.1; }
.rp__weather-stat { font-size: 11px; line-height: 1.3; color: var(--color-text-secondary); }
.rp__weather-note { margin: 10px 0 0; font-size: 12px; line-height: 1.4; color: var(--color-text-secondary); }

/* Vandaag */
.rp__today { display: grid; grid-template-columns: minmax(0, 1fr) 200px; gap: 24px; align-items: center; padding: 24px 28px; border-radius: var(--radius-md); background: #f4f1ec; }
.rp__today-leg { display: flex; align-items: center; gap: 12px; margin: 4px 0 12px; padding: 10px 12px; border-radius: 8px; background: #fff; }
.rp__today-leg p { margin: 0; }
.rp__today-weather { text-align: center; padding: 12px; border-radius: 12px; background: #fff; }
.rp__today-icon { width: 56px; height: 56px; }
.rp__today-temp { margin: 0; font-family: var(--font-heading); font-size: 34px; font-weight: 700; line-height: 1.1; }
.rp__today-weathertext { margin: 4px 0 0; font-size: 13px; color: var(--color-text-secondary); line-height: 1.4; }
.rp__today-place { color: var(--color-text-primary); font-weight: 600; }
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

/* Praktische informatie: drie hotelblokken naast elkaar */
.rp__hotels { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
.rp__hotel { overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: #fff; }
.rp__hotel-img { display: block; width: 100%; height: 180px; object-fit: cover; }
.rp__hotel-body { padding: 18px 20px 20px; }
.rp__hotel-name { margin: 0; display: flex; align-items: flex-start; gap: 10px; font-family: var(--font-heading); font-size: 20px; font-weight: 700; line-height: 1.25; }
.rp__hotel-name .rp__route-num { margin-top: 1px; }
.rp__stars { color: #141414; font-size: 13px; letter-spacing: 1px; margin-left: 2px; white-space: nowrap; }
.rp__stars svg { display: inline-block; vertical-align: -0.1em; }
.rp__hotel-sub { margin: 4px 0 14px 34px; font-size: 13px; color: var(--color-text-secondary); }
/* Check-in (nadruk) en check-out naast elkaar */
.rp__checks { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-bottom: 14px; }
.rp__check { display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; border-radius: 8px; background: #f7f7f7; }
.rp__check-date { font-size: 16px; font-weight: 700; line-height: 1.25; }
.rp__check-time { font-size: 13px; color: var(--color-text-secondary); }
.rp__info { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; font-size: 14px; line-height: 1.4; }
/* Links in de praktische informatie (routebeschrijving, telefoon): in de tekstkleur, niet oranje. */
.rp__info-link { color: var(--color-text-primary); font-weight: 600; text-decoration: underline; text-underline-offset: 2px; }
.rp__info-link:hover { color: var(--color-text-secondary); }
.rp__contact { margin: 16px 0 0; font-size: 14px; color: var(--color-text-secondary); }
/* Fietsvakantie: bagagetransfer (⅔) naast routes (⅓) */
.rp__bike { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 24px; margin-top: 24px; }

/* Reisschema naast de minimap */
.rp__plan { display: grid; grid-template-columns: minmax(0, 1fr) 400px; gap: 32px; align-items: start; }
.rp__minimap { width: 100%; }
.rp__card { overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: #fff; }
.rp__card-body { padding: 20px 22px 18px; }

/* Tips zoals op de dealpagina, over de volle contentbreedte (zelfde ritme als de drie hotelblokken) */
.rp__tips { max-width: none; }

@media (max-width: 1100px) {
  .rp__hotels { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 900px) {
  .rp__hero { min-height: 0; }
  .rp__hero-inner { grid-template-columns: 1fr; gap: 20px; padding-top: 72px; padding-bottom: 24px; }
  .rp__title { font-size: 30px; }
  .rp__weather { min-width: 0; max-width: none; width: 100%; padding: 14px; }
  .rp__weather-days { overflow-x: auto; }
  .rp__weather-day { min-width: 44px; }
  .rp__main { padding-top: 24px; gap: 36px; }
  .rp__today { grid-template-columns: 1fr; padding: 18px 16px; }
  .rp__today-weather { display: flex; align-items: center; justify-content: center; gap: 12px; text-align: left; }
  .rp__today-icon { width: 40px; height: 40px; }
  .rp__today-temp { font-size: 28px; }
  .rp__hotels, .rp__plan, .rp__bike { grid-template-columns: 1fr; gap: 16px; }
  .rp__hotel-img { height: 160px; }
}
</style>
