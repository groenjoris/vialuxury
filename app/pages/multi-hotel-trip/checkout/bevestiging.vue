<script setup lang="ts">
// Multi Hotel Trip checkout — bevestigingspagina na het boeken van een vakantie
// (prototype: "Boek nu" op de gegevenspagina = betaald, geen validatie).
// Versie 2 (briefing 2026-10-13): hoofdfoto van de reis met de bevestiging en de
// route "op de foto" (witte lijn, genummerde bolletjes, plaatsnamen); daaronder
// links (⅔) de kassabon — grijs kader met wit vlak: eyebrow, reisnaam, datums,
// verticale tijdlijn met per hotel foto, naam, plaats/nachten, wat je krijgt en
// check-in/check-out, dan flexibel annuleren (en bagagetransfer), de prijs en
// "Betaald" — en rechts (⅓) boekingsnummer, "Wat er nu gebeurt", "Wat je zelf
// doet", "Download routes" en "Boeking terugvinden". Onder de kolommen het
// cadeaukaartblok en de veelgestelde vragen. Vooraf een preloader van 3 seconden.
import { tripCheckoutBySlug } from '~/data/mht-checkout/trip'
import { tripPdpBySlug } from '~/data/mht-trip-pdp'
import tripRoutesJson from '~/data/mht-trip-routes.json'
import type { TripRouteLeg } from '~/utils-multi-hotel-trip/tripMapLayers'
import { pricing } from '~/data/mht-checkout/deal'
import { CHECKOUT_BOOKING_FEE } from '~/data/mht-checkout/pricing'
import { useMultiHotelTripCheckoutTrip } from '~/composables-multi-hotel-trip/useMultiHotelTripCheckoutTrip'
import { useMultiHotelTripMobileUa } from '~/composables-multi-hotel-trip/useMultiHotelTripMobileUa'

const isMobileUa = useMultiHotelTripMobileUa()

/* ── Boekingsgegevens (gedeelde checkout-state; zonder checkout de Opaalkust-demo) ── */
const DEMO_SLUG = 'ontdek-noord-frankrijk-en-de-opaalkust-in-7-dagen'
const { trip: checkoutTrip, day: checkoutDay } = useMultiHotelTripCheckoutTrip()
const trip = computed(() => checkoutTrip.value ?? tripCheckoutBySlug(DEMO_SLUG)!)
/** De reisdata (stops met coördinaten, inclusies per hotel, inchecktijd) voor de route en de tijdlijn. */
const detail = computed(() => tripPdpBySlug(trip.value.slug)?.trip ?? null)
const routeStops = computed(() => (detail.value?.stops ?? []).map(s => ({ lat: s.lat, lng: s.lng, label: s.city })))
const routeLegs = computed<TripRouteLeg[]>(() => (tripRoutesJson as Record<string, { legs: TripRouteLeg[] }>)[detail.value?.id ?? '']?.legs ?? [])

interface SelRow { baseId: string; rateKey: 'nonrefundable' | 'flexible'; price: number; priceWas: number; quantity: number }
const selection = useState<SelRow[]>('mht-checkout-selection', () => [])
/* Flexibel annuleren is onderdeel van het pakket (uitgangspunt van de bevestiging). */
const row = computed<SelRow>(() => {
  const r = selection.value[0]
  const flex = pricing.flexibilityPerRoom * trip.value.hotels.length
  if (r) return r.rateKey === 'flexible' ? r : { ...r, rateKey: 'flexible', price: r.price + flex, priceWas: r.priceWas + flex }
  return { baseId: 'trip', rateKey: 'flexible', price: trip.value.price + flex, priceWas: trip.value.priceWas + flex, quantity: 1 }
})
const persons = computed(() => row.value.quantity * 2)
const roomsPerHotel = computed(() => row.value.quantity)
const BOOKING_FEE = CHECKOUT_BOOKING_FEE
const tripTotal = computed(() => row.value.price * row.value.quantity)
const total = computed(() => tripTotal.value + BOOKING_FEE)
/** Bagagetransfer hoort bij de fietsvakantie (of als een inclusie het noemt). */
const hasBaggage = computed(() => detail.value?.type === 'fiets' || trip.value.includes.some(t => /bagage/i.test(t)))

/* Datums: uit de kalenderstap; zonder keuze de demo-datum (zelfde als de startschermknop:
   dinsdag 18 mei 2027). De labels worden uit de datum berekend, zodat ze altijd kloppen. */
const DEMO_YMD = { year: 2027, month: 4, day: 18 }
const WEEKDAYS = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']
const WEEKDAYS_LONG = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag']
const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
const MONTHS_LONG = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']
const fmt = (d: Date) => `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
const fmtLong = (d: Date) => `${WEEKDAYS_LONG[d.getDay()]} ${d.getDate()} ${MONTHS_LONG[d.getMonth()]}`
const checkInYmd = computed(() => checkoutDay.value?.checkInYmd ?? DEMO_YMD)
const dateAt = (offsetDays: number) => { const y = checkInYmd.value; return new Date(y.year, y.month, y.day + offsetDays) }
const checkIn = computed(() => checkoutDay.value?.checkIn || fmt(dateAt(0)))
const checkOut = computed(() => checkoutDay.value?.checkOut || fmt(dateAt(trip.value.nights)))
const checkInLong = computed(() => fmtLong(dateAt(0)))
const checkOutLong = computed(() => fmtLong(dateAt(trip.value.nights)))
/** Datum 14 dagen voor vertrek (reisdocument) en 30 dagen ervoor (gratis annuleren, als in de room table). */
const docsDate = computed(() => fmt(dateAt(-14)))
const cancelDate = computed(() => fmt(dateAt(-30)))

/** Per hotel: datums, inchecktijd (reisdata, anders 15:00), uitchecktijd (late check-out uit de
 *  inclusies, anders 11:00) en de lijst "wat je krijgt": kamer + inclusies van dat hotel
 *  (zonder de overnachtingen en de in-/uitchecktijden, die staan er apart). */
const stays = computed(() => {
  let offset = 0
  return trip.value.hotels.map((h, i) => {
    const stop = detail.value?.stops[i]
    const from = dateAt(offset)
    const to = dateAt(offset + h.nights)
    offset += h.nights
    const incl = (stop?.includes ?? []).map(x => x.nl)
    const lateOut = incl.map(t => t.match(/check-?out[^0-9]*(\d{1,2})[:.](\d{2})/i)).find(Boolean)
    return {
      ...h,
      from: fmt(from),
      to: fmt(to),
      checkInTime: stop?.checkIn ?? '15:00',
      checkOutTime: lateOut ? `${lateOut[1]}:${lateOut[2]}` : '11:00',
      items: [`${roomsPerHotel.value}× ${h.roomName}`, ...incl.filter(t => !/overnachting|check-?in|check-?out/i.test(t))],
    }
  })
})

/* Gast: voornaam + e-mail uit het formulier ("Boek nu"); anders de demo-gast. */
const guest = useState<{ firstName: string; email: string } | null>('mht-checkout-guest', () => null)
const firstName = computed(() => guest.value?.firstName || 'Rijo')
const email = computed(() => guest.value?.email || 'rijo.verburg@gmail.com')

/** Boekingsnummer: vast per reis (demo; TODO echt nummer uit het boekingssysteem). */
const bookingRef = computed(() => {
  let h = 0
  for (const ch of trip.value.slug) h = (h * 31 + ch.charCodeAt(0)) % 100000
  return `VL-${String(27000 + h).slice(0, 2)} ${String(h).padStart(5, '0').slice(0, 3)} ${String(h * 7 % 1000).padStart(3, '0')}`
})

/* Wat er nu gebeurt — chronologisch (verticale tijdlijn). */
const nextSteps = computed(() => [
  { when: 'Nu', title: 'Bevestiging in je mailbox', text: `Binnen een paar minuten staat deze bevestiging op ${email.value}, met je boekingsnummer en alles wat je hier ziet.` },
  { when: `Rond ${docsDate.value}`, title: 'Je reisdocument', text: 'Twee weken voor vertrek mailen we je reisdocument: adressen, parkeren, inchecktijden en de tips van Yvette per hotel.' },
  { when: checkIn.value, title: `Inchecken bij ${trip.value.hotels[0]?.name}`, text: `Vanaf ${stays.value[0]?.checkInTime} uur staat je eerste kamer klaar. Je hoeft niets te printen; je naam en boekingsnummer zijn genoeg.` },
  { when: checkOut.value, title: 'Weer thuis', text: 'Na je vakantie ontvang je een mail met de vraag hoe het was. Daar helpen we andere reizigers mee.' },
])

/* Wat je zelf doet. */
const todos = computed(() => [
  `Nu: niets. Je boeking is rond; tot ${cancelDate.value} (30 dagen voor aankomst) kun je gratis annuleren of wijzigen.`,
  'Zet de aankomst- en vertrekdatum in je agenda; de inchecktijd per hotel staat hiernaast in je boeking.',
  'Download de routes voor je navigatie (hieronder) of plan ze in je eigen app.',
  'Neem een geldig identiteitsbewijs mee; de hotels vragen daar bij het inchecken om.',
])

/* Download routes — per etappe (thuis → hotel 1 → … → thuis), met afstand/reistijd uit de reisdata. */
const routeDownloads = computed(() => {
  const d = detail.value
  const names = trip.value.hotels.map(h => h.name)
  const home = d?.fromHome?.city ? `Thuis (${d.fromHome.city})` : 'Thuis'
  const fmtTravel = (t?: { km?: number; minutes: number }) => {
    if (!t) return ''
    const hrs = Math.floor(t.minutes / 60), min = t.minutes % 60
    const time = hrs ? `${hrs} u${min ? ` ${min} min` : ''}` : `${min} min`
    return t.km ? `${t.km} km · ${time}` : time
  }
  const legs: { from: string; to: string; meta: string }[] = []
  if (names[0]) legs.push({ from: home, to: names[0], meta: fmtTravel(d?.fromHomeByLocale?.nl ?? (d?.fromHome ? { minutes: d.fromHome.minutes } : undefined)) })
  for (let i = 1; i < names.length; i++) legs.push({ from: names[i - 1]!, to: names[i]!, meta: fmtTravel(d?.stops[i]?.travel) })
  if (names.length) legs.push({ from: names[names.length - 1]!, to: d?.loop ? names[0]! : home, meta: fmtTravel(d?.returnTravel) })
  return legs
})

/* Veelgestelde vragen (accordeon). */
const faq = computed(() => [
  { q: 'Hoe kan ik annuleren of wijzigen?', a: `Via je account. Log in met ${email.value}, open deze boeking en kies "Annuleren" of "Datum wijzigen". Tot ${cancelDate.value} (30 dagen voor aankomst) is dat gratis; je krijgt het volledige bedrag terug.` },
  { q: 'Hoe log ik in op mijn account?', a: 'Je hebt geen wachtwoord nodig. Vul op vialuxury.com je e-mailadres in, je ontvangt direct een inloglink per mail. Eén klik en je bent binnen.' },
  { q: `Hoe werkt het inchecken bij ${trip.value.hotels.length} hotels?`, a: 'Elk hotel heeft je naam en boekingsnummer. Je meldt je bij de receptie met een geldig identiteitsbewijs; uitchecken en doorreizen naar het volgende hotel regel je gewoon ter plekke.' },
  { q: 'Wat betaal ik nog in de hotels?', a: 'Alleen de lokale toeristenbelasting; die rekent elk hotel bij het uitchecken af. Alles wat hierboven bij "wat je krijgt" staat is al betaald.' },
  { q: 'Zijn de attracties uit de tips inbegrepen?', a: 'Nee. De tips per hotel zijn inspiratie; entree betaal je ter plaatse en alleen voor wat je zelf kiest. Een Museumkaart of kortingspas loont bij vakanties in Nederland.' },
  { q: 'Ik heb mijn e-mailadres verkeerd ingevuld', a: `Mail ons op service@vialuxury.com met boekingsnummer ${bookingRef.value} en het juiste adres. We sturen de bevestiging en je reisdocument dan opnieuw.` },
])
const openFaq = ref<number | null>(null)

const shareHref = computed(() => `mailto:?subject=${encodeURIComponent(`Onze vakantie: ${trip.value.name}`)}&body=${encodeURIComponent(`We gaan! ${trip.value.name}, ${checkIn.value} t/m ${checkOut.value}. Boekingsnummer ${bookingRef.value}.`)}`)

function money(v: number) {
  return `€${v.toLocaleString('nl-NL', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 })}`
}

/* Preloader (ontwerpdocument, principe 5): de betaling/boeking wordt "bevestigd" — hier een
   gesimuleerde 3 seconden met een rustige animatie en wisselende teksten, zodat niemand naar een
   leeg scherm kijkt. Server én eerste client-render tonen de loader (geen flits), daarna de pagina. */
const loading = ref(true)
const loadStep = ref(0)
const loadSteps = computed(() => [
  'Betaling ontvangen',
  ...trip.value.hotels.map((h) => `Kamer bevestigen bij ${h.name}…`),
  'Bevestiging klaarzetten…',
])
onMounted(() => {
  const per = 3000 / loadSteps.value.length
  const tick = setInterval(() => { loadStep.value = Math.min(loadStep.value + 1, loadSteps.value.length - 1) }, per)
  setTimeout(() => { clearInterval(tick); loading.value = false; window.scrollTo(0, 0) }, 3000)
})

useHead({ title: 'Je vakantie is geboekt — ViaLuxury' })
</script>

<template>
  <div class="mht-checkout page page--white cf" :class="{ 'page--m': isMobileUa }">
    <MultiHotelTripCheckoutMobileHeader v-if="isMobileUa" :step="3" />
    <MultiHotelTripCheckoutTopNav v-else />

    <!-- Preloader: 3 seconden "boeking bevestigen" voordat de bevestiging verschijnt. -->
    <Transition name="cf-load">
      <div v-if="loading" class="cf__loader" role="status" aria-live="polite">
        <div class="cf__loader-inner">
          <span class="cf__spinner" aria-hidden="true" />
          <p class="cf__loader-title">Je boeking wordt bevestigd</p>
          <Transition name="cf-step" mode="out-in">
            <p :key="loadStep" class="cf__loader-step">{{ loadSteps[loadStep] }}</p>
          </Transition>
          <ol class="cf__loader-list" aria-hidden="true">
            <li v-for="(st, i) in loadSteps" :key="st" :class="{ 'cf__loader-item--done': i < loadStep, 'cf__loader-item--on': i === loadStep }">{{ st.replace('…', '') }}</li>
          </ol>
          <p class="cf__loader-note">Dit duurt een paar seconden. Sluit de pagina niet.</p>
        </div>
      </div>
    </Transition>

    <main v-show="!loading" class="cf__main">
      <!-- ── 1. Hoofdfoto: vinkje + kop links, de route "op de foto" rechts ──────── -->
      <section class="cf__hero" :style="{ backgroundImage: `url(${trip.thumb})` }">
        <div class="cf__hero-inner container">
          <div class="cf__hero-text">
            <span class="cf__check" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path class="cf__check-path" d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </span>
            <h1 class="cf__title">Je {{ trip.typeWord }} is geboekt, {{ firstName }}!</h1>
          </div>
          <MultiHotelTripCheckoutRouteSketch v-if="routeStops.length" class="cf__hero-route" :stops="routeStops" :legs="routeLegs" />
        </div>
        <span v-for="n in 14" :key="n" class="cf__confetti" :style="{ left: `${(n * 7.1) % 100}%`, animationDelay: `${(n % 5) * 0.18}s`, background: n % 3 === 0 ? 'var(--c-via-green)' : n % 3 === 1 ? 'var(--c-via-orange)' : '#fff' }" aria-hidden="true" />
      </section>

      <div class="container cf__body">
        <div class="cf__cols">
          <!-- ── 2. Kassabon (⅔): grijs kader, wit vlak ──────────────────────── -->
          <section class="cf__receipt-wrap" aria-label="Je boeking">
            <div class="cf__receipt">
              <p class="cf__eyebrow">{{ trip.typeLabel }} met {{ trip.hotels.length }} hotels</p>
              <h2 class="cf__trip-title">{{ trip.name }}</h2>
              <p class="cf__trip-meta t-body">{{ checkInLong }} t/m {{ checkOutLong }} · {{ trip.nights }} nachten · {{ persons }} personen · {{ roomsPerHotel }} {{ roomsPerHotel === 1 ? 'kamer' : 'kamers' }} per hotel</p>

              <!-- Tijdlijn: per hotel bolletje (gecentreerd op de kamerfoto), naam + sterren,
                   plaats · nachten, wat je krijgt, check-in en check-out. -->
              <ol class="cf__stays">
                <li v-for="(h, i) in stays" :key="h.name" class="cf__stay">
                  <span class="cf__stay-dot" aria-hidden="true"><span class="cf__num">{{ i + 1 }}</span></span>
                  <img v-if="h.image" class="cf__stay-img" :src="h.image" :alt="`${h.roomName} — ${h.name}`" />
                  <span v-else class="cf__stay-img cf__stay-img--empty" aria-hidden="true" />
                  <div class="cf__stay-body">
                    <p class="cf__stay-name">{{ h.name }} <span v-if="h.starRating" class="cf__stars" aria-hidden="true">{{ '★'.repeat(h.starRating) }}</span></p>
                    <p class="t-caption c-mgrey cf__stay-meta">{{ h.city }} · {{ h.nights }} {{ h.nights === 1 ? 'nacht' : 'nachten' }}</p>
                    <ul class="cf__stay-items">
                      <li v-for="item in h.items" :key="item" class="t-caption c-grey">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
                        {{ item }}
                      </li>
                    </ul>
                    <p class="t-caption cf__stay-times">
                      <span><b>Check-in</b> {{ h.from }} vanaf {{ h.checkInTime }} uur</span>
                      <span><b>Check-out</b> {{ h.to }} tot {{ h.checkOutTime }} uur</span>
                    </p>
                  </div>
                </li>
              </ol>

              <!-- Flexibel annuleren (en bagagetransfer): uitgelijnd met de hotelnamen, icoon vooraan. -->
              <ul class="cf__extras">
                <li class="cf__extra">
                  <svg class="cf__extra-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                  <div>
                    <p class="cf__stay-name">Flexibel annuleren</p>
                    <p class="t-caption c-grey">Tot {{ cancelDate }} (30 dagen voor aankomst) gratis annuleren of wijzigen, bij alle {{ trip.hotels.length }} hotels.</p>
                  </div>
                </li>
                <li v-if="hasBaggage" class="cf__extra">
                  <svg class="cf__extra-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 6v14M17 6v14" stroke="currentColor" stroke-width="2" stroke-linecap="square" /><path d="M9 6V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" stroke="currentColor" stroke-width="2" stroke-linecap="square" /><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" stroke="currentColor" stroke-width="2" /></svg>
                  <div>
                    <p class="cf__stay-name">Bagagetransfer</p>
                    <p class="t-caption c-grey">Je bagage reist elke etappe vooruit naar het volgende hotel; jij fietst met alleen een dagtas.</p>
                  </div>
                </li>
              </ul>

              <!-- Prijs -->
              <div class="cf__price">
                <div class="cf__price-row"><span class="t-body">{{ trip.typeLabel }}, {{ persons }} personen, incl. flexibel annuleren</span><span class="t-body">{{ money(tripTotal) }}</span></div>
                <div class="cf__price-row"><span class="t-body">Boekingskosten</span><span class="t-body">{{ money(BOOKING_FEE) }}</span></div>
                <div class="cf__price-row cf__price-row--total"><span class="t-body t-bold">Betaald</span><span class="t-body t-bold">{{ money(total) }}</span></div>
                <p class="t-caption c-mgrey cf__price-note">In de hotels betaal je alleen de lokale toeristenbelasting.</p>
              </div>
            </div>
          </section>

          <!-- ── 3. Rechterkolom (⅓) ─────────────────────────────────────────── -->
          <aside class="cf__side">
            <section class="card cf__ref">
              <p class="t-caption c-mgrey">Boekingsnummer</p>
              <p class="cf__ref-number">{{ bookingRef }}</p>
            </section>

            <section class="card">
              <h2 class="cf__h2">Wat er nu gebeurt</h2>
              <ol class="cf__timeline">
                <li v-for="s in nextSteps" :key="s.title" class="cf__step">
                  <span class="cf__step-dot" aria-hidden="true" />
                  <div>
                    <p class="t-caption c-mgrey">{{ s.when }}</p>
                    <p class="t-body t-bold">{{ s.title }}</p>
                    <p class="t-caption c-grey">{{ s.text }}</p>
                  </div>
                </li>
              </ol>
            </section>

            <section class="card">
              <h2 class="cf__h2">Wat je zelf doet</h2>
              <ul class="cf__list">
                <li v-for="item in todos" :key="item" class="t-body">{{ item }}</li>
              </ul>
            </section>

            <section class="card">
              <h2 class="cf__h2">Download routes</h2>
              <p class="t-caption c-grey cf__card-intro">Per etappe voor je navigatie, als GPX of direct in Google Maps. De routes staan ook in je reisdocument.</p>
              <ul class="cf__routes">
                <li v-for="leg in routeDownloads" :key="`${leg.from}-${leg.to}`" class="cf__route">
                  <svg class="cf__route-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="6" cy="5" r="2.5" stroke="currentColor" stroke-width="2" /><circle cx="18" cy="19" r="2.5" stroke="currentColor" stroke-width="2" /><path d="M6 7.5V13a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3v-2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
                  <div class="cf__route-body">
                    <p class="t-body cf__route-title">{{ leg.from }} → {{ leg.to }}</p>
                    <p class="t-caption c-mgrey"><template v-if="leg.meta">{{ leg.meta }} · </template><a class="cf__link" href="#" @click.prevent>GPX</a> · <a class="cf__link" href="#" @click.prevent>Google Maps</a></p>
                  </div>
                </li>
              </ul>
            </section>

            <section class="card">
              <h2 class="cf__h2">Boeking terugvinden</h2>
              <p class="t-body c-grey">Je boeking staat in je ViaLuxury-account op <b>{{ email }}</b>. Inloggen doe je zonder wachtwoord: je krijgt een inloglink per mail.</p>
              <a class="btn-primary cf__cta" href="#" @click.prevent>Bekijk je boeking</a>
              <p class="t-caption c-mgrey cf__find-note">Geen mail ontvangen? Zoek je boeking op met je boekingsnummer en e-mailadres, of <a class="cf__link" :href="shareHref">deel de boeking met je reisgenoot</a>.</p>
            </section>
          </aside>
        </div>

        <!-- ── 4. Cadeaukaart: iemand anders blij maken ────────────────────── -->
        <section class="cf__gift">
          <div class="cf__gift-text">
            <p class="cf__eyebrow">Cadeautip</p>
            <h2 class="cf__gift-title">Maak iemand anders blij met een ViaLuxury-experience</h2>
            <p class="t-body c-grey">Een verjaardag, een jubileum of gewoon omdat het kan: met een ViaLuxury-cadeaukaart geef je een verblijf in een van onze handgekozen hotels, met alle extra's erbij.</p>
            <p class="t-body c-grey">De ontvanger kiest zelf het hotel, de datum en het arrangement. De kaart is drie jaar geldig en komt digitaal of in een mooie envelop.</p>
            <a class="btn-primary cf__cta cf__gift-cta" href="https://cadeaukaart.vialuxury.com/Product/Products" target="_blank" rel="noopener">Bekijk onze cadeaukaarten</a>
          </div>
          <!-- Placeholder-afbeelding van de cadeaukaart (TODO: echte productfoto). -->
          <div class="cf__giftcard" aria-hidden="true">
            <img src="/images/logo-vialuxury-horizontal.svg" alt="" class="cf__giftcard-logo" />
            <span class="cf__giftcard-label">Cadeaukaart</span>
            <span class="cf__giftcard-sub">Experience more</span>
          </div>
        </section>

        <!-- ── 5. Veelgestelde vragen ──────────────────────────────────────── -->
        <section class="cf__faq">
          <h2 class="cf__h2">Veelgestelde vragen</h2>
          <div v-for="(f, i) in faq" :key="f.q" class="cf__faq-item" :class="{ 'cf__faq-item--open': openFaq === i }">
            <button type="button" class="cf__faq-q" :aria-expanded="openFaq === i" @click="openFaq = openFaq === i ? null : i">
              <span>{{ f.q }}</span>
              <svg class="cf__chev" :class="{ 'cf__chev--open': openFaq === i }" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </button>
            <p v-show="openFaq === i" class="cf__faq-a t-body c-grey">{{ f.a }}</p>
          </div>
        </section>
      </div>
    </main>

    <MultiHotelTripCheckoutFooter />
  </div>
</template>

<style scoped>
.page { min-height: 100vh; display: flex; flex-direction: column; }
.page--white { background: var(--c-white); }
.cf__main { flex: 1; padding-bottom: 56px; }
.cf__body { padding-top: 32px; display: flex; flex-direction: column; gap: 32px; }
.cf__h2 { margin: 0 0 12px; font-size: var(--t-h2); font-weight: var(--w-black); line-height: 1.25; }
.cf__eyebrow { margin: 0 0 4px; font-size: var(--t-caption); font-weight: var(--w-medium); letter-spacing: 0.06em; text-transform: uppercase; color: var(--c-medium-grey); }
.cf__link { color: var(--c-via-orange); text-decoration: underline; text-underline-offset: 2px; font-weight: var(--w-medium); }
.card { border: 1px solid var(--c-light-grey); border-radius: var(--radius); padding: var(--card-pad, 20px); background: var(--c-white); }
.cf__chev { flex-shrink: 0; transition: transform 200ms ease; }
.cf__chev--open { transform: rotate(180deg); }
.cf__cta { display: inline-flex; align-items: center; justify-content: center; width: 100%; margin-top: 14px; text-decoration: none; }

/* Preloader */
.cf__loader {
  position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center;
  background: var(--c-white); padding: 24px; text-align: center;
}
.cf__loader-inner { max-width: 420px; }
.cf__spinner {
  display: inline-block; width: 56px; height: 56px; margin-bottom: 20px; border-radius: 50%;
  border: 4px solid var(--c-light-grey); border-top-color: var(--c-via-orange);
  animation: cf-spin 900ms linear infinite;
}
@keyframes cf-spin { to { transform: rotate(360deg); } }
.cf__loader-title { margin: 0 0 6px; font-size: var(--t-h1); font-weight: var(--w-black); line-height: 1.2; }
.cf__loader-step { margin: 0 0 20px; min-height: 24px; font-size: var(--t-body-lg); color: var(--c-dark-grey); }
.cf__loader-list { list-style: none; margin: 0 auto 20px; padding: 0; display: inline-flex; flex-direction: column; align-items: flex-start; gap: 6px; text-align: left; }
.cf__loader-list li { position: relative; padding-left: 24px; font-size: var(--t-body); color: var(--c-medium-grey); }
.cf__loader-list li::before {
  content: ''; position: absolute; left: 0; top: 4px; width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid var(--c-light-grey); box-sizing: border-box;
}
.cf__loader-item--on { color: var(--c-via-black); }
.cf__loader-item--on::before { border-color: var(--c-via-orange); }
.cf__loader-item--done { color: var(--c-via-black); }
.cf__loader-item--done::before { border-color: var(--c-via-green); background: var(--c-via-green); }
.cf__loader-note { margin: 0; font-size: var(--t-caption); color: var(--c-medium-grey); }
.cf-load-leave-active { transition: opacity 350ms ease; }
.cf-load-leave-to { opacity: 0; }
.cf-step-enter-active, .cf-step-leave-active { transition: opacity 200ms ease, transform 200ms ease; }
.cf-step-enter-from { opacity: 0; transform: translateY(6px); }
.cf-step-leave-to { opacity: 0; transform: translateY(-6px); }

/* 1. Hoofdfoto: kop links onder, route rechts (in beeld) */
.cf__hero {
  position: relative; overflow: hidden; min-height: 480px; display: flex; align-items: stretch;
  background-size: cover; background-position: center; color: #fff;
}
.cf__hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0, 0, 0, 0.12) 0%, rgba(0, 0, 0, 0.62) 100%); }
.cf__hero-inner {
  position: relative; display: grid; grid-template-columns: minmax(0, 1fr) 400px; gap: 40px; align-items: end;
  padding-top: 48px; padding-bottom: 40px; width: 100%;
}
.cf__hero-text { max-width: 640px; }
.cf__hero-route { align-self: center; width: 400px; max-width: 100%; margin-top: 16px; }
.cf__check {
  display: inline-flex; align-items: center; justify-content: center;
  width: 64px; height: 64px; margin-bottom: 16px; border-radius: 50%;
  background: var(--c-white); color: var(--c-via-green);
  animation: cf-pop 500ms cubic-bezier(0.2, 1.4, 0.4, 1) both;
}
.cf__check svg { width: 34px; height: 34px; }
.cf__check-path { stroke-dasharray: 24; stroke-dashoffset: 24; animation: cf-draw 450ms 250ms ease-out forwards; }
.cf__title { margin: 0; font-size: var(--t-display); font-weight: var(--w-black); line-height: 1.15; color: #fff; }
@keyframes cf-pop { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes cf-draw { to { stroke-dashoffset: 0; } }
.cf__confetti { position: absolute; top: -12px; width: 8px; height: 12px; border-radius: 2px; opacity: 0; animation: cf-fall 2.4s ease-in forwards; }
@keyframes cf-fall { 0% { transform: translateY(0) rotate(0); opacity: 0.95; } 100% { transform: translateY(420px) rotate(260deg); opacity: 0; } }

/* 2 + 3. Kolommen ⅔ / ⅓ */
.cf__cols { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 24px; align-items: start; }

/* Kassabon: grijs kader met wit vlak erin */
.cf__receipt-wrap { padding: 16px; border-radius: var(--radius); background: var(--c-surface); }
.cf__receipt { padding: 28px 28px 24px; border-radius: var(--radius-sm); background: var(--c-white); box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06); }
.cf__trip-title { margin: 0 0 6px; font-size: var(--t-h1); font-weight: var(--w-black); line-height: 1.2; }
.cf__trip-meta { margin: 0 0 24px; color: var(--c-dark-grey); }

/* Tijdlijn per hotel: bolletje | kamerfoto | tekst */
.cf__stays { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 28px; }
.cf__stay { position: relative; display: grid; grid-template-columns: 32px 128px minmax(0, 1fr); column-gap: 16px; align-items: start; }
/* Verbindingslijn van bolletje naar bolletje (midden van de foto's). */
.cf__stay:not(:last-child)::before { content: ''; position: absolute; left: 12px; top: 46px; bottom: -74px; width: 2px; background: var(--c-light-grey); }
.cf__stay-dot { position: relative; z-index: 1; display: flex; align-items: center; height: 92px; }
.cf__num {
  display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%;
  background: var(--c-via-black); color: #fff; font-size: 13px; font-weight: 700; box-shadow: 0 0 0 4px #fff;
}
.cf__stay-img { display: block; width: 128px; height: 92px; object-fit: cover; border-radius: var(--radius-sm); }
.cf__stay-img--empty { background: var(--c-surface); }
.cf__stay-body { min-width: 0; }
.cf__stay-name { margin: 0; font-size: var(--t-body-lg); font-weight: 700; line-height: 1.3; }
.cf__stars { color: #e3a008; font-size: 12px; letter-spacing: 1px; margin-left: 4px; }
.cf__stay-meta { margin: 2px 0 8px; }
.cf__stay-items { list-style: none; margin: 0 0 8px; padding: 0; display: flex; flex-direction: column; gap: 3px; }
.cf__stay-items li { display: flex; align-items: flex-start; gap: 6px; }
.cf__stay-items svg { flex-shrink: 0; margin-top: 2px; color: var(--c-via-green); }
.cf__stay-times { margin: 0; display: flex; flex-wrap: wrap; gap: 4px 18px; color: var(--c-dark-grey); }
.cf__stay-times b { color: var(--c-via-black); }

/* Flexibel annuleren / bagagetransfer: de tekst lijnt uit met de hotelnamen (kolom 3, 192px),
   het icoon (22px + 10px) staat ervoor in de fotokolom. */
.cf__extras { list-style: none; margin: 24px 0 0; padding: 20px 0 0 160px; border-top: 1px solid var(--c-light-grey); display: flex; flex-direction: column; gap: 14px; }
.cf__extra { display: flex; gap: 10px; align-items: flex-start; }
.cf__extra p { margin: 0; }
.cf__extra-icon { flex-shrink: 0; width: 22px; height: 22px; margin-top: 1px; color: var(--c-via-green); }

.cf__price { margin-top: 20px; padding-top: 14px; border-top: 1px solid var(--c-light-grey); }
.cf__price-row { display: flex; justify-content: space-between; gap: 12px; padding: 3px 0; }
.cf__price-row--total { margin-top: 4px; padding-top: 10px; border-top: 1px solid var(--c-light-grey); font-size: var(--t-body-lg); }
.cf__price-note { margin: 6px 0 0; }

/* Rechterkolom */
.cf__side { display: flex; flex-direction: column; gap: 16px; }
.cf__ref { text-align: center; }
.cf__ref p { margin: 0; }
.cf__ref-number { margin-top: 2px; font-size: var(--t-h2); font-weight: var(--w-black); letter-spacing: 0.04em; }
.cf__list { margin: 0; padding-left: 20px; list-style: disc outside; display: flex; flex-direction: column; gap: 8px; }
.cf__list li { display: list-item; }
.cf__card-intro { margin: -4px 0 12px; }
.cf__timeline { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.cf__step { position: relative; display: flex; gap: 12px; }
.cf__step p { margin: 0; }
.cf__step-dot { flex-shrink: 0; width: 12px; height: 12px; margin-top: 5px; border-radius: 50%; background: var(--c-via-green); box-shadow: 0 0 0 3px var(--c-green-pale); }
.cf__step:not(:last-child)::before { content: ''; position: absolute; left: 5px; top: 20px; bottom: -14px; width: 2px; background: var(--c-light-grey); }
.cf__routes { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.cf__route { display: flex; gap: 10px; align-items: flex-start; }
.cf__route p { margin: 0; }
.cf__route-icon { flex-shrink: 0; width: 20px; height: 20px; margin-top: 1px; color: var(--c-via-black); }
.cf__route-body { min-width: 0; }
.cf__route-title { font-weight: var(--w-medium); }
.cf__find-note { margin: 10px 0 0; }

/* 4. Cadeaukaart */
.cf__gift {
  display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 40px; align-items: center;
  padding: 32px 36px; border-radius: var(--radius); background: var(--c-surface);
}
.cf__gift-title { margin: 0 0 10px; font-size: var(--t-h1); font-weight: var(--w-black); line-height: 1.2; }
.cf__gift-text p { margin: 0 0 10px; }
.cf__gift-cta { width: auto; min-width: 260px; margin-top: 6px; }
.cf__giftcard {
  position: relative; aspect-ratio: 16 / 10; border-radius: 14px; padding: 22px 24px;
  background: linear-gradient(135deg, #1a1e1e 0%, #343b3b 100%); color: #fff;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22); transform: rotate(-3deg);
  display: flex; flex-direction: column; justify-content: space-between;
}
.cf__giftcard-logo { width: 150px; height: auto; filter: brightness(0) invert(1); }
.cf__giftcard-label { font-size: 22px; font-weight: var(--w-black); }
.cf__giftcard-sub { position: absolute; right: 24px; bottom: 22px; font-size: var(--t-caption); color: rgba(255, 255, 255, 0.7); }

/* 5. FAQ */
.cf__faq { max-width: 760px; }
.cf__faq-item { border-bottom: 1px solid var(--c-light-grey); }
.cf__faq-q {
  display: flex; justify-content: space-between; align-items: center; gap: 16px; width: 100%; padding: 14px 0;
  background: none; border: 0; cursor: pointer; text-align: left; font-family: inherit; font-size: var(--t-body-lg); font-weight: var(--w-medium); color: var(--c-via-black);
}
.cf__faq-a { margin: 0 0 16px; max-width: 680px; }

/* Mobiel: één kolom, route boven de kop op de foto */
@media (max-width: 800px) {
  .cf__body { padding-top: 20px; gap: 24px; }
  .card { padding: 16px; }
  .cf__hero { min-height: 440px; }
  .cf__hero-inner { grid-template-columns: 1fr; gap: 20px; padding-top: 28px; padding-bottom: 24px; }
  .cf__hero-route { order: -1; width: 68%; max-width: 280px; margin: 0 0 0 auto; }
  .cf__title { font-size: var(--t-h1); }
  .cf__cols { grid-template-columns: 1fr; gap: 20px; }
  .cf__receipt-wrap { padding: 10px; }
  .cf__receipt { padding: 20px 16px; }
  .cf__trip-title { font-size: var(--t-h2); }
  .cf__stay { grid-template-columns: 28px 96px minmax(0, 1fr); column-gap: 12px; }
  .cf__stay:not(:last-child)::before { left: 12px; top: 35px; bottom: -63px; }
  .cf__stay-dot { height: 70px; }
  .cf__stay-img { width: 96px; height: 70px; }
  .cf__extras { padding-left: 0; }
  .cf__gift { grid-template-columns: 1fr; gap: 24px; padding: 24px 20px; }
  .cf__giftcard { max-width: 300px; margin: 0 auto; transform: none; }
  .cf__gift-cta { width: 100%; }
}
</style>
