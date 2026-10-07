<script setup lang="ts">
// Multi Hotel Trip checkout — bevestigingspagina na het boeken van een vakantie
// (prototype: "Boek nu" op de gegevenspagina = betaald, geen validatie).
// Opbouw volgens skills/How_to_design_thank_you_pages.md, gekozen variant "Beeld"
// (2026-10-07): hoofdfoto van de reis als kop met alleen de bevestiging; daaronder
// links (⅔) het productblok met alle praktische informatie (hotels in- en uitklapbaar,
// flexibel annuleren als onderdeel van het pakket, betaald bedrag, boekingsnummer) en
// rechts (⅓) "Goed om te weten"; dan de banner "Goede keuze"; dan "Wat er nu gebeurt"
// naast "Wat je zelf doet"; dan je account (bestaat al, inloggen zonder wachtwoord),
// veelgestelde vragen en contact. Vooraf een preloader van 3 seconden.
import { tripCheckoutBySlug } from '~/data/mht-checkout/trip'
import { pricing } from '~/data/mht-checkout/deal'
import { CHECKOUT_BOOKING_FEE } from '~/data/mht-checkout/pricing'
import { useMultiHotelTripCheckoutTrip } from '~/composables-multi-hotel-trip/useMultiHotelTripCheckoutTrip'
import { useMultiHotelTripMobileUa } from '~/composables-multi-hotel-trip/useMultiHotelTripMobileUa'

const isMobileUa = useMultiHotelTripMobileUa()

/* ── Boekingsgegevens (gedeelde checkout-state; zonder checkout de Opaalkust-demo) ── */
const DEMO_SLUG = 'ontdek-noord-frankrijk-en-de-opaalkust-in-7-dagen'
const { trip: checkoutTrip, day: checkoutDay } = useMultiHotelTripCheckoutTrip()
const trip = computed(() => checkoutTrip.value ?? tripCheckoutBySlug(DEMO_SLUG)!)

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
const saved = computed(() => (row.value.priceWas - row.value.price) * row.value.quantity)
const savedPct = computed(() => Math.round((saved.value / (row.value.priceWas * row.value.quantity)) * 100))

/* Datums: uit de kalenderstap; zonder keuze de demo-datum (zelfde als de startschermknop:
   dinsdag 18 mei 2027). De labels worden uit de datum berekend, zodat ze altijd kloppen. */
const DEMO_YMD = { year: 2027, month: 4, day: 18 }
const WEEKDAYS = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']
const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
const fmt = (d: Date) => `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
const checkInYmd = computed(() => checkoutDay.value?.checkInYmd ?? DEMO_YMD)
const checkIn = computed(() => checkoutDay.value?.checkIn || fmt(new Date(checkInYmd.value.year, checkInYmd.value.month, checkInYmd.value.day)))
const checkOut = computed(() => checkoutDay.value?.checkOut || fmt(new Date(checkInYmd.value.year, checkInYmd.value.month, checkInYmd.value.day + trip.value.nights)))
/** Per hotel "di 18 – do 20 mei" op basis van de aankomstdatum en de nachten per hotel. */
const stays = computed(() => {
  const ymd = checkInYmd.value
  let offset = 0
  return trip.value.hotels.map((h) => {
    const from = new Date(ymd.year, ymd.month, ymd.day + offset)
    const to = new Date(ymd.year, ymd.month, ymd.day + offset + h.nights)
    offset += h.nights
    return { ...h, from: fmt(from), to: fmt(to) }
  })
})
/** Datum 14 dagen voor vertrek (reisdocument) en 72 uur ervoor (annuleren). */
const docsDate = computed(() => { const y = checkInYmd.value; return fmt(new Date(y.year, y.month, y.day - 14)) })
const cancelDate = computed(() => { const y = checkInYmd.value; return fmt(new Date(y.year, y.month, y.day - 3)) })

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

/* Hotels in het productblok: ingeklapt (alleen de namen) of uitgeklapt (foto, datums, kamer). */
const hotelsOpen = ref(false)
const hotelNames = computed(() => trip.value.hotels.map((h) => h.name).join(' · '))

/* "Goed om te weten" — eigen tekst voor de bevestiging (niet die van het dagprogramma). */
const goodToKnow = [
  'De tips per hotel zijn inspiratie: jij bepaalt het tempo en wat je doet, de hotels zijn je thuisbasis.',
  'Entree van attracties is niet inbegrepen, zo betaal je alleen voor wat jij kiest.',
  'Check vooraf even de openingstijden van restaurants en attracties, dan sta je nergens voor een dichte deur.',
  'Museumkaart of andere kortingspas? Neem hem mee: bij vakanties in Nederland levert dat vaak gratis of voordelige entree op.',
]

/* Wat er nu gebeurt — chronologisch. */
const nextSteps = computed(() => [
  { when: 'Nu', title: 'Bevestiging in je mailbox', text: `Binnen een paar minuten staat deze bevestiging op ${email.value}, met je boekingsnummer en alles wat je hier ziet.` },
  { when: `Rond ${docsDate.value}`, title: 'Je reisdocument', text: 'Twee weken voor vertrek mailen we je reisdocument: adressen, parkeren, inchecktijden en de tips van Yvette per hotel.' },
  { when: checkIn.value, title: `Inchecken bij ${trip.value.hotels[0]?.name}`, text: 'Vanaf 15:00 uur staat je eerste kamer klaar. Je hoeft niets te printen; je naam en boekingsnummer zijn genoeg.' },
  { when: checkOut.value, title: 'Weer thuis', text: 'Na je vakantie ontvang je een mail met de vraag hoe het was. Daar helpen we andere reizigers mee.' },
])

/* Wat je zelf doet. */
const todos = computed(() => [
  `Nu: niets. Je boeking is rond; tot ${cancelDate.value} (72 uur voor vertrek) kun je kosteloos annuleren of wijzigen.`,
  'Je kunt deze boeking altijd bekijken in je account: inloggen met je e-mailadres, je krijgt een inloglink, geen wachtwoord nodig.',
  'Zet de aankomst- en vertrekdatum in je agenda en check de inchecktijd per hotel in je reisdocument.',
  'Neem een geldig identiteitsbewijs mee; de hotels vragen daar bij het inchecken om.',
])

/* Veelgestelde vragen (accordeon). */
const faq = computed(() => [
  { q: 'Hoe kan ik annuleren of wijzigen?', a: `Via je account. Log in met ${email.value}, open deze boeking en kies "Annuleren" of "Datum wijzigen". Tot ${cancelDate.value} (72 uur voor vertrek) is dat kosteloos; je krijgt het volledige bedrag terug.` },
  { q: 'Hoe log ik in op mijn account?', a: 'Je hebt geen wachtwoord nodig. Vul op vialuxury.com je e-mailadres in, je ontvangt direct een inloglink per mail. Eén klik en je bent binnen.' },
  { q: 'Hoe werkt het inchecken bij drie hotels?', a: 'Elk hotel heeft je naam en boekingsnummer. Je meldt je bij de receptie met een geldig identiteitsbewijs; uitchecken en doorrijden naar het volgende hotel regel je gewoon ter plekke.' },
  { q: 'Zijn de attracties uit de tips inbegrepen?', a: 'Nee. De tips per hotel zijn inspiratie; entree betaal je ter plaatse en alleen voor wat je zelf kiest. Een Museumkaart of kortingspas loont bij vakanties in Nederland.' },
  { q: 'Ik heb mijn e-mailadres verkeerd ingevuld', a: `Mail ons op service@vialuxury.com met boekingsnummer ${bookingRef.value} en het juiste adres. We sturen de bevestiging en je reisdocument dan opnieuw.` },
])
const openFaq = ref<number | null>(null)

const pdpHref = computed(() => `/multi-hotel-trip/deal/${trip.value.slug}`)
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
      <!-- ── 1. Bevestiging: hoofdfoto met alleen vinkje + kop ──────────────── -->
      <section class="cf__hero" :style="{ backgroundImage: `url(${trip.thumb})` }">
        <div class="cf__hero-inner container">
          <span class="cf__check" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><path class="cf__check-path" d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </span>
          <h1 class="cf__title">Je {{ trip.typeWord }} is geboekt, {{ firstName }}!</h1>
        </div>
        <span v-for="n in 14" :key="n" class="cf__confetti" :style="{ left: `${(n * 7.1) % 100}%`, animationDelay: `${(n % 5) * 0.18}s`, background: n % 3 === 0 ? 'var(--c-via-green)' : n % 3 === 1 ? 'var(--c-via-orange)' : '#fff' }" aria-hidden="true" />
      </section>

      <div class="container cf__body">
        <!-- ── 2. Productblok (⅔) + Goed om te weten (⅓) ───────────────────── -->
        <div class="cf__row cf__row--product">
          <section class="card cf__product">
            <div class="cf__product-head">
              <div>
                <p class="t-caption c-mgrey">{{ trip.typeLabel }} · {{ trip.hotels.length }} hotels · {{ trip.nights }} nachten</p>
                <h2 class="cf__product-title">{{ trip.name }}</h2>
                <p class="t-body"><b>{{ checkIn }} t/m {{ checkOut }}</b> · {{ persons }} personen · {{ roomsPerHotel }} {{ roomsPerHotel === 1 ? 'kamer' : 'kamers' }} per hotel</p>
              </div>
              <p class="cf__ref">Boekingsnummer<br><b>{{ bookingRef }}</b></p>
            </div>

            <!-- Hotels: ingeklapt alleen de namen, uitgeklapt per hotel foto, datums, kamer en wat je krijgt -->
            <div class="cf__hotels-wrap">
              <button type="button" class="cf__hotels-toggle" :aria-expanded="hotelsOpen" @click="hotelsOpen = !hotelsOpen">
                <span class="cf__hotels-names"><b>Je {{ trip.hotels.length }} hotels:</b> {{ hotelNames }}</span>
                <span class="cf__hotels-more">{{ hotelsOpen ? 'Verberg details' : 'Bekijk details' }}
                  <svg class="cf__chev" :class="{ 'cf__chev--open': hotelsOpen }" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
                </span>
              </button>
              <ol v-show="hotelsOpen" class="cf__hotels">
                <li v-for="h in stays" :key="h.name" class="cf__hotel">
                  <img v-if="h.image" class="cf__hotel-img" :src="h.image" :alt="h.name" />
                  <div class="cf__hotel-body">
                    <p class="t-body t-bold">{{ h.name }} <span v-if="h.starRating" class="cf__stars" aria-hidden="true">{{ '★'.repeat(h.starRating) }}</span></p>
                    <p class="t-caption c-mgrey">{{ h.city }} · {{ h.from }} – {{ h.to }} · {{ h.nights }} {{ h.nights === 1 ? 'nacht' : 'nachten' }}</p>
                    <p class="t-caption c-grey">{{ roomsPerHotel }}× {{ h.roomName }} · dagelijks ontbijt · 3-gangendiner op de dag van aankomst</p>
                  </div>
                </li>
              </ol>
            </div>

            <!-- Flexibel annuleren: onderdeel van het pakket -->
            <p class="cf__flex">
              <svg class="cf__flex-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
              <span class="t-body"><b>Flexibel annuleren</b> — tot {{ cancelDate }} (72 uur voor vertrek) kosteloos annuleren of wijzigen, bij alle {{ trip.hotels.length }} hotels.</span>
            </p>

            <div class="cf__price">
              <div class="cf__price-row"><span class="t-body">{{ trip.typeLabel }}, {{ persons }} personen, incl. flexibel annuleren</span><span class="t-body">{{ money(tripTotal) }}</span></div>
              <div class="cf__price-row"><span class="t-body">Boekingskosten</span><span class="t-body">{{ money(BOOKING_FEE) }}</span></div>
              <div class="cf__price-row cf__price-row--total"><span class="t-body t-bold">Betaald</span><span class="t-body t-bold">{{ money(total) }}</span></div>
            </div>
          </section>

          <aside class="card cf__gtk">
            <h2 class="cf__h2 cf__h2--icon">
              <svg class="cf__gtk-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2V17h5v-1.2c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
              Goed om te weten
            </h2>
            <ul class="cf__list">
              <li v-for="item in goodToKnow" :key="item" class="t-body">{{ item }}</li>
            </ul>
          </aside>
        </div>

        <!-- ── 3. Goede keuze (banner) ──────────────────────────────────────── -->
        <section class="cf__value">
          <svg class="cf__value-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.7-5.2 4.7 1.5 6.8L12 17l-6.1 3.5 1.5-6.8L2.2 9l6.9-.7L12 2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /></svg>
          <p class="t-body-lg"><b>Goede keuze.</b> Je betaalde {{ money(saved) }} ({{ savedPct }}%) minder dan wanneer je de {{ trip.hotels.length }} hotels, de diners en de extra's los had geboekt. En Yvette heeft elk hotel zelf bezocht: je weet dus precies wat je krijgt.</p>
        </section>

        <!-- ── 4. Wat er nu gebeurt | Wat je zelf doet ─────────────────────── -->
        <div class="cf__row cf__row--next">
          <section class="card cf__steps">
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

          <section class="card cf__todo">
            <h2 class="cf__h2">Wat je zelf doet</h2>
            <ul class="cf__list">
              <li v-for="item in todos" :key="item" class="t-body">{{ item }}</li>
            </ul>
          </section>
        </div>

        <!-- ── 5. Je account (bestaat al) + delen / tips ───────────────────── -->
        <section class="cf__account">
          <div class="cf__account-text">
            <p class="t-caption c-mgrey">Je account</p>
            <h2 class="cf__h2">Je boeking staat in je ViaLuxury-account</h2>
            <p class="t-body c-grey">Als klant heb je nu een account op {{ email }}, en je ontvangt onze nieuwsbrief met de nieuwe vakanties. Inloggen doe je zonder wachtwoord: je krijgt een inloglink per mail.</p>
          </div>
          <div class="cf__account-actions">
            <a class="btn-primary cf__cta" href="#" @click.prevent>Bekijk je boeking in je account</a>
            <a class="cf__link cf__secondary" :href="shareHref">Deel met je reisgenoot</a>
            <NuxtLink class="cf__link cf__secondary" :to="pdpHref">Bekijk de tips per hotel</NuxtLink>
          </div>
        </section>

        <!-- ── 6. Veelgestelde vragen ──────────────────────────────────────── -->
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

        <!-- ── 7. Contact ──────────────────────────────────────────────────── -->
        <section class="cf__support">
          <p class="t-body">Vragen over je boeking? Bel <a class="cf__link" href="tel:+31207052222">+31 20 705 2222</a> (ma–vr 9–17 uur) of mail <a class="cf__link" href="mailto:service@vialuxury.com">service@vialuxury.com</a>. Noem je boekingsnummer <b>{{ bookingRef }}</b>, dan helpen we je direct.</p>
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
.cf__body { padding-top: 32px; display: flex; flex-direction: column; gap: 24px; }
.cf__h2 { margin: 0 0 12px; font-size: var(--t-h2); font-weight: var(--w-black); line-height: 1.25; }
.cf__h2--icon { display: flex; align-items: center; gap: 10px; }
.cf__link { color: var(--c-via-orange); text-decoration: underline; text-underline-offset: 2px; font-weight: var(--w-medium); }
.card { border: 1px solid var(--c-light-grey); border-radius: var(--radius); padding: var(--card-pad, 24px); background: var(--c-white); }
.cf__chev { flex-shrink: 0; transition: transform 200ms ease; }
.cf__chev--open { transform: rotate(180deg); }

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

/* 1. Hoofdfoto als kop */
.cf__hero {
  position: relative; overflow: hidden; min-height: 340px; display: flex; align-items: flex-end;
  background-size: cover; background-position: center; color: #fff;
}
.cf__hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.6) 100%); }
.cf__hero-inner { position: relative; padding-top: 48px; padding-bottom: 36px; max-width: 760px; }
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

/* 2. Productblok ⅔ + Goed om te weten ⅓; 4. twee blokken naast elkaar */
.cf__row { display: grid; gap: 24px; align-items: start; }
.cf__row--product { grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); }
.cf__row--next { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }

.cf__product-head { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; }
.cf__product-title { margin: 2px 0 6px; font-size: var(--t-h2); font-weight: var(--w-black); line-height: 1.25; }
.cf__ref { margin: 0; flex-shrink: 0; text-align: right; font-size: var(--t-caption); color: var(--c-medium-grey); line-height: 1.4; }
.cf__ref b { display: inline-block; margin-top: 2px; font-size: var(--t-body); color: var(--c-via-black); letter-spacing: 0.02em; }

.cf__hotels-wrap { margin-top: 18px; padding: 14px 16px; border-radius: var(--radius-sm); background: var(--c-surface); }
.cf__hotels-toggle {
  display: flex; justify-content: space-between; align-items: center; gap: 16px; width: 100%;
  padding: 0; background: none; border: 0; cursor: pointer; text-align: left; font-family: inherit; color: var(--c-via-black);
}
.cf__hotels-names { font-size: var(--t-body); line-height: 1.4; }
.cf__hotels-more { display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0; font-size: var(--t-body); font-weight: var(--w-medium); color: var(--c-via-orange); text-decoration: underline; text-underline-offset: 2px; }
.cf__hotels { list-style: none; margin: 16px 0 0; padding: 16px 0 0; border-top: 1px solid var(--c-light-grey); display: flex; flex-direction: column; gap: 14px; }
.cf__hotel { display: flex; gap: 14px; align-items: flex-start; }
.cf__hotel-img { flex-shrink: 0; width: 112px; height: 80px; object-fit: cover; border-radius: var(--radius-sm); }
.cf__hotel-body { min-width: 0; }
.cf__stars { color: #e3a008; font-size: 12px; letter-spacing: 1px; }

.cf__flex { display: flex; gap: 10px; align-items: flex-start; margin: 16px 0 0; color: var(--c-via-black); }
.cf__flex-icon { flex-shrink: 0; width: 22px; height: 22px; margin-top: 1px; color: var(--c-via-green); }

.cf__price { margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--c-light-grey); }
.cf__price-row { display: flex; justify-content: space-between; gap: 12px; padding: 3px 0; }
.cf__price-row--total { margin-top: 4px; padding-top: 10px; border-top: 1px solid var(--c-light-grey); font-size: var(--t-body-lg); }

/* Goed om te weten */
.cf__gtk { background: #fff7f0; border-color: #f6dcc6; }
.cf__gtk-icon { flex-shrink: 0; width: 26px; height: 26px; color: var(--c-via-orange); }
.cf__list { margin: 0; padding-left: 20px; list-style: disc outside; display: flex; flex-direction: column; gap: 8px; }
.cf__list li { display: list-item; }

/* 3. Goede keuze als banner */
.cf__value {
  display: flex; gap: 14px; align-items: flex-start; padding: 18px 22px;
  border-radius: var(--radius); background: var(--c-green-pale); color: var(--c-via-black);
}
.cf__value p { margin: 0; }
.cf__value-icon { flex-shrink: 0; width: 26px; height: 26px; margin-top: 2px; color: var(--c-via-green); }

/* 4. Wat er nu gebeurt */
.cf__timeline { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.cf__step { position: relative; display: flex; gap: 12px; }
.cf__step-dot { flex-shrink: 0; width: 12px; height: 12px; margin-top: 5px; border-radius: 50%; background: var(--c-via-green); box-shadow: 0 0 0 3px var(--c-green-pale); }
.cf__step:not(:last-child)::before { content: ''; position: absolute; left: 5px; top: 20px; bottom: -14px; width: 2px; background: var(--c-light-grey); }

/* 5. Account */
.cf__account {
  display: flex; align-items: center; justify-content: space-between; gap: 32px;
  padding: 28px 32px; border-radius: var(--radius); background: var(--c-via-black); color: #fff;
}
.cf__account .cf__h2 { color: #fff; }
.cf__account .c-mgrey { color: rgba(255, 255, 255, 0.65); }
.cf__account .c-grey { color: rgba(255, 255, 255, 0.85); }
.cf__account-text { max-width: 620px; }
.cf__account-actions { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; flex-shrink: 0; }
.cf__cta { display: inline-flex; align-items: center; justify-content: center; width: auto; min-width: 254px; text-decoration: none; }
.cf__secondary { color: #fff; font-size: var(--t-body); }

/* 6. FAQ */
.cf__faq { max-width: 760px; }
.cf__faq-item { border-bottom: 1px solid var(--c-light-grey); }
.cf__faq-q {
  display: flex; justify-content: space-between; align-items: center; gap: 16px; width: 100%; padding: 14px 0;
  background: none; border: 0; cursor: pointer; text-align: left; font-family: inherit; font-size: var(--t-body-lg); font-weight: var(--w-medium); color: var(--c-via-black);
}
.cf__faq-a { margin: 0 0 16px; max-width: 680px; }

/* 7. Contact */
.cf__support { color: var(--c-dark-grey); }

/* Mobiel: één kolom */
@media (max-width: 800px) {
  .cf__body { padding-top: 20px; gap: 16px; }
  .cf__hero { min-height: 280px; }
  .cf__hero-inner { padding-top: 36px; padding-bottom: 24px; }
  .cf__title { font-size: var(--t-h1); }
  .cf__row--product, .cf__row--next { grid-template-columns: 1fr; gap: 16px; }
  .cf__product-head { flex-direction: column; gap: 10px; }
  .cf__ref { text-align: left; }
  .cf__hotels-toggle { flex-direction: column; align-items: flex-start; gap: 6px; }
  .cf__hotel-img { width: 88px; height: 64px; }
  .cf__account { flex-direction: column; align-items: stretch; padding: 22px 20px; gap: 18px; }
  .cf__cta { width: 100%; }
  .cf__account-actions { align-items: stretch; text-align: center; }
}
</style>
