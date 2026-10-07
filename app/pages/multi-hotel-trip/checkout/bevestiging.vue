<script setup lang="ts">
// Multi Hotel Trip checkout — bevestigingspagina na het boeken van een vakantie
// (prototype: "Boek nu" op de gegevenspagina = betaald, geen validatie).
// Opbouw volgens skills/How_to_design_thank_you_pages.md, in deze volgorde:
// 1 bevestiging + dank, 2 samenvatting met boekingsnummer, 3 e-mailbevestiging,
// 4 waarde van de keuze, 5 wat gebeurt er nu, 6 wat je zelf doet (met de
// "Goed om te weten"-disclaimer van het dagprogramma), 7 vervolgstap, 8 contact.
// Drie varianten (schakelaar linksboven): Rustig / Beeld / Reis — zie
// useMultiHotelTripConfirmationVariant.
import { tripCheckoutBySlug } from '~/data/mht-checkout/trip'
import { pricing } from '~/data/mht-checkout/deal'
import { CHECKOUT_BOOKING_FEE } from '~/data/mht-checkout/pricing'
import { useMultiHotelTripCheckoutTrip } from '~/composables-multi-hotel-trip/useMultiHotelTripCheckoutTrip'
import { useMultiHotelTripConfirmationVariant } from '~/composables-multi-hotel-trip/useMultiHotelTripConfirmationVariant'
import { useMultiHotelTripMobileUa } from '~/composables-multi-hotel-trip/useMultiHotelTripMobileUa'

const { t } = useMultiHotelTripI18n()
const isMobileUa = useMultiHotelTripMobileUa()
const { variant } = useMultiHotelTripConfirmationVariant()

/* ── Boekingsgegevens (gedeelde checkout-state; zonder checkout de Opaalkust-demo) ── */
const DEMO_SLUG = 'ontdek-noord-frankrijk-en-de-opaalkust-in-7-dagen'
const { trip: checkoutTrip, day: checkoutDay } = useMultiHotelTripCheckoutTrip()
const trip = computed(() => checkoutTrip.value ?? tripCheckoutBySlug(DEMO_SLUG)!)

interface SelRow { baseId: string; rateKey: 'nonrefundable' | 'flexible'; price: number; priceWas: number; quantity: number }
const selection = useState<SelRow[]>('mht-checkout-selection', () => [])
const row = computed<SelRow>(() => {
  const r = selection.value[0]
  if (r) return r
  const flex = pricing.flexibilityPerRoom * trip.value.hotels.length
  return { baseId: 'trip', rateKey: 'flexible', price: trip.value.price + flex, priceWas: trip.value.priceWas + flex, quantity: 1 }
})
const persons = computed(() => row.value.quantity * 2)
const roomsPerHotel = computed(() => row.value.quantity)
const flexible = computed(() => row.value.rateKey === 'flexible')
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
/** Per hotel "di 20 – do 22 mei" op basis van de aankomstdatum en de nachten per hotel. */
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
/** Datum 14 dagen voor vertrek (reisdocument). */
const docsDate = computed(() => { const y = checkInYmd.value; return fmt(new Date(y.year, y.month, y.day - 14)) })

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

/* "Goed om te weten" (dezelfde vier punten als bovenaan het dagprogramma). */
const GTK = ['trip.itin.gtk1', 'trip.itin.gtk2', 'trip.itin.gtk3', 'trip.itin.gtk4']

/* Wat gebeurt er nu — chronologisch. */
const nextSteps = computed(() => [
  { when: 'Nu', title: 'Bevestiging in je mailbox', text: `Binnen een paar minuten staat deze bevestiging op ${email.value}, met je boekingsnummer en alles wat je hier ziet.` },
  { when: 'Binnen 1 werkdag', title: 'De hotels bevestigen je kamers', text: `Wij reserveren ${roomsPerHotel.value === 1 ? 'je kamer' : `je ${roomsPerHotel.value} kamers`} bij alle ${trip.value.hotels.length} hotels. Je ontvangt per hotel een bevestiging met de kamer en de inbegrepen onderdelen.` },
  { when: `Rond ${docsDate.value}`, title: 'Je reisdocument', text: 'Twee weken voor vertrek mailen we je reisdocument: adressen, parkeren, inchecktijden en het dagprogramma met de tips van Yvette.' },
  { when: checkIn.value, title: `Inchecken bij ${trip.value.hotels[0]?.name}`, text: `Vanaf 15:00 uur staat je eerste kamer klaar. Je hoeft niets te printen; je naam en boekingsnummer zijn genoeg.` },
  { when: checkOut.value, title: 'Weer thuis', text: 'Na je vakantie ontvang je een mail met de vraag hoe het was. Daar helpen we andere reizigers mee.' },
])

/* Wat je zelf doet. */
const todos = computed(() => [
  `Nu: niets. Je boeking is rond en je ${flexible.value ? 'kunt tot 72 uur voor vertrek kosteloos annuleren of wijzigen' : 'bent verzekerd van je kamers'}.`,
  'Zet de aankomst- en vertrekdatum in je agenda en check de inchecktijd per hotel in je reisdocument.',
  'Neem een geldig identiteitsbewijs mee; de hotels vragen daar bij het inchecken om.',
  `Betaal ter plaatse alleen lokale belastingen en eventuele parkeerkosten, als die niet zijn inbegrepen.`,
])

/* Vervolgstap (één primaire): lidmaatschap, per variant een andere invalshoek uit het
   ontwerpdocument — Rustig: concreet voordeel; Beeld: nieuwsgierigheid + sociaal bewijs;
   Reis: "nog één stap". Secundair: delen met je reisgenoot en het reisschema bekijken. */
const followUp = computed(() => ({
  calm: { title: 'Volgende keer in 2 minuten geboekt', text: 'Sla je gegevens op in een gratis ViaLuxury-account. Je vult nooit meer een formulier in en ziet als eerste de nieuwe vakanties.', cta: 'Maak mijn account aan' },
  photo: { title: 'Reizigers die deze vakantie boekten, bekijken ook …', text: 'Als lid zie je de vakanties en arrangementen die niet op de website staan — alleen voor leden, met tot 40% korting.', cta: 'Laat zien wat ik mis' },
  journey: { title: 'Nog één stap om je reis compleet te maken', text: 'Zet je gegevens om in een gratis account, dan staan je reisdocumenten en vouchers straks op één plek, ook op je telefoon.', cta: 'Rond het af' },
})[variant.value])
const pdpHref = computed(() => `/multi-hotel-trip/deal/${trip.value.slug}`)
const shareHref = computed(() => `mailto:?subject=${encodeURIComponent(`Onze vakantie: ${trip.value.name}`)}&body=${encodeURIComponent(`We gaan! ${trip.value.name}, ${checkIn.value} t/m ${checkOut.value}. Boekingsnummer ${bookingRef.value}.`)}`)

function money(v: number) {
  return `€${v.toLocaleString('nl-NL', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 })}`
}

useHead({ title: 'Je vakantie is geboekt — ViaLuxury' })
</script>

<template>
  <div class="mht-checkout page page--white cf" :class="[`cf--${variant}`, { 'page--m': isMobileUa }]">
    <MultiHotelTripCheckoutMobileHeader v-if="isMobileUa" :step="3" />
    <MultiHotelTripCheckoutTopNav v-else />
    <MultiHotelTripCheckoutConfirmationVariantSwitch />

    <main class="cf__main">
      <!-- ── 1. Bevestiging + dank ─────────────────────────────────────── -->
      <!-- Beeld: hoofdfoto van de reis als kop, bevestiging erover. -->
      <section v-if="variant === 'photo'" class="cf__hero" :style="{ backgroundImage: `url(${trip.thumb})` }">
        <div class="cf__hero-inner container">
          <span class="cf__check cf__check--light" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><path class="cf__check-path" d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </span>
          <h1 class="cf__title">Je {{ trip.typeWord }} is geboekt, {{ firstName }}!</h1>
          <p class="cf__lead">{{ trip.name }} · {{ checkIn }} t/m {{ checkOut }} · {{ persons }} personen</p>
          <p class="cf__ref">Boekingsnummer <b>{{ bookingRef }}</b></p>
        </div>
        <span v-for="n in 14" :key="n" class="cf__confetti" :style="{ left: `${(n * 7.1) % 100}%`, animationDelay: `${(n % 5) * 0.18}s`, background: n % 3 === 0 ? 'var(--c-via-green)' : n % 3 === 1 ? 'var(--c-via-orange)' : '#fff' }" aria-hidden="true" />
      </section>
      <section v-else class="cf__head container">
        <span class="cf__check" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><path class="cf__check-path" d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </span>
        <h1 class="cf__title">Je {{ trip.typeWord }} is geboekt, {{ firstName }}!</h1>
        <p class="cf__lead">Bedankt voor je vertrouwen. Wij regelen nu de kamers bij alle {{ trip.hotels.length }} hotels, jij hoeft alleen nog af te tellen.</p>
        <p class="cf__ref">Boekingsnummer <b>{{ bookingRef }}</b></p>
      </section>

      <div class="cf__grid container">
        <div class="cf__col cf__col--main">
          <!-- ── 2. Samenvatting ───────────────────────────────────────── -->
          <section class="card cf__summary">
            <div class="cf__summary-head">
              <img v-if="variant !== 'photo'" class="cf__thumb" :src="trip.thumb" :alt="trip.name" />
              <div>
                <p class="t-caption c-mgrey">{{ trip.typeLabel }} · {{ trip.hotels.length }} hotels · {{ trip.nights }} nachten</p>
                <h2 class="cf__summary-title">{{ trip.name }}</h2>
                <p class="t-body">{{ checkIn }} t/m {{ checkOut }} · {{ persons }} personen</p>
              </div>
            </div>

            <!-- Per hotel: datums, kamer, aantal kamers (Beeld: met hotelfoto) -->
            <ol class="cf__hotels" :class="{ 'cf__hotels--photos': variant === 'photo' }">
              <li v-for="(h, i) in stays" :key="h.name" class="cf__hotel">
                <img v-if="variant === 'photo' && h.image" class="cf__hotel-img" :src="h.image" :alt="h.name" />
                <span v-else class="cf__num">{{ i + 1 }}</span>
                <div class="cf__hotel-body">
                  <p class="t-body t-bold">{{ h.name }} <span v-if="h.starRating" class="cf__stars" aria-hidden="true">{{ '★'.repeat(h.starRating) }}</span></p>
                  <p class="t-caption c-mgrey">{{ h.city }} · {{ h.from }} – {{ h.to }} · {{ h.nights }} {{ h.nights === 1 ? 'nacht' : 'nachten' }}</p>
                  <p class="t-caption c-grey">{{ roomsPerHotel }}× {{ h.roomName }}, ontbijt en 3-gangendiner op de dag van aankomst</p>
                </div>
              </li>
            </ol>

            <div class="cf__price">
              <div class="cf__price-row"><span class="t-body">{{ trip.typeLabel }}, {{ persons }} personen</span><span class="t-body">{{ money(tripTotal) }}</span></div>
              <div class="cf__price-row"><span class="t-body">Boekingskosten</span><span class="t-body">{{ money(BOOKING_FEE) }}</span></div>
              <div class="cf__price-row cf__price-row--total"><span class="t-body t-bold">Betaald</span><span class="t-body t-bold">{{ money(total) }}</span></div>
              <p class="t-caption" :class="flexible ? 'c-green' : 'c-grey'">
                <template v-if="flexible">Flexibel annuleren: tot 72 uur voor vertrek kosteloos wijzigen of annuleren.</template>
                <template v-else>Niet-terugbetaalbaar tarief.</template>
                <a class="cf__link" :href="`mailto:service@vialuxury.com?subject=Boeking ${bookingRef}`">Wijzigen of annuleren</a>
              </p>
            </div>
          </section>

          <!-- ── 3. E-mailbevestiging ──────────────────────────────────── -->
          <section class="cf__mail">
            <svg class="cf__mail-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2" /><path d="M3 7l9 6 9-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            <p class="t-body">Deze bevestiging staat ook in je mailbox: <b>{{ email }}</b>. Verkeerd adres? <a class="cf__link" :href="`mailto:service@vialuxury.com?subject=E-mailadres wijzigen ${bookingRef}`">Wijzig het hier</a>. Je hoeft niets op te schrijven.</p>
          </section>

          <!-- ── 4. Waarde van de keuze ────────────────────────────────── -->
          <section class="cf__value">
            <p class="t-body"><b>Goede keuze.</b> Je betaalde {{ money(saved) }} ({{ savedPct }}%) minder dan wanneer je de {{ trip.hotels.length }} hotels, de diners en de extra's los had geboekt. En Yvette heeft elk hotel zelf bezocht: je weet dus precies wat je krijgt.</p>
          </section>
        </div>

        <aside class="cf__col cf__col--side">
          <!-- ── 5. Wat gebeurt er nu ──────────────────────────────────── -->
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

          <!-- ── 6. Wat je zelf doet + Goed om te weten ────────────────── -->
          <section class="card cf__todo">
            <h2 class="cf__h2">Wat je zelf doet</h2>
            <ul class="cf__list">
              <li v-for="item in todos" :key="item" class="t-body">{{ item }}</li>
            </ul>
            <div class="cf__gtk">
              <h3 class="cf__h3">Goed om te weten</h3>
              <ul class="cf__list cf__list--gtk">
                <li v-for="k in GTK" :key="k" class="t-body">{{ t(k) }}</li>
              </ul>
            </div>
          </section>
        </aside>
      </div>

      <!-- ── 7. Vervolgstap ──────────────────────────────────────────────── -->
      <section class="cf__next container">
        <div class="cf__next-card">
          <div class="cf__next-text">
            <p class="t-caption c-mgrey">Voor straks</p>
            <h2 class="cf__h2">{{ followUp.title }}</h2>
            <p class="t-body c-grey">{{ followUp.text }}</p>
          </div>
          <div class="cf__next-actions">
            <NuxtLink class="btn-primary cf__cta" to="/multi-hotel-trip/leden">{{ followUp.cta }}</NuxtLink>
            <a class="cf__link cf__secondary" :href="shareHref">Deel met je reisgenoot</a>
            <NuxtLink class="cf__link cf__secondary" :to="pdpHref">Bekijk het dagprogramma</NuxtLink>
          </div>
        </div>
      </section>

      <!-- ── 8. Contact ──────────────────────────────────────────────────── -->
      <section class="cf__support container">
        <p class="t-body">Vragen over je boeking? Bel <a class="cf__link" href="tel:+31207052222">+31 20 705 2222</a> (ma–vr 9–17 uur) of mail <a class="cf__link" href="mailto:service@vialuxury.com">service@vialuxury.com</a>. Noem je boekingsnummer <b>{{ bookingRef }}</b>, dan helpen we je direct.</p>
      </section>
    </main>

    <MultiHotelTripCheckoutFooter />
  </div>
</template>

<style scoped>
.page { min-height: 100vh; display: flex; flex-direction: column; }
.page--white { background: var(--c-white); }
.cf__main { flex: 1; padding-bottom: 56px; }
.cf__h2 { margin: 0 0 12px; font-size: var(--t-h2); font-weight: var(--w-black); line-height: 1.25; }
.cf__h3 { margin: 0 0 8px; font-size: var(--t-body-lg); font-weight: var(--w-black); }
.cf__link { color: var(--c-via-orange); text-decoration: underline; text-underline-offset: 2px; font-weight: var(--w-medium); }

/* 1. Kop */
.cf__head { padding-top: 40px; padding-bottom: 28px; text-align: center; max-width: 720px; }
.cf__check {
  display: inline-flex; align-items: center; justify-content: center;
  width: 64px; height: 64px; margin-bottom: 16px; border-radius: 50%;
  background: var(--c-green-pale); color: var(--c-via-green);
  animation: cf-pop 500ms cubic-bezier(0.2, 1.4, 0.4, 1) both;
}
.cf__check svg { width: 34px; height: 34px; }
.cf__check-path { stroke-dasharray: 24; stroke-dashoffset: 24; animation: cf-draw 450ms 250ms ease-out forwards; }
.cf__check--light { background: var(--c-white); }
.cf__title { margin: 0 0 10px; font-size: var(--t-display); font-weight: var(--w-black); line-height: 1.15; }
.cf__lead { margin: 0 0 10px; font-size: var(--t-body-lg); color: var(--c-dark-grey); }
.cf__ref { margin: 0; font-size: var(--t-body); color: var(--c-medium-grey); }
.cf__ref b { color: var(--c-via-black); letter-spacing: 0.02em; }
@keyframes cf-pop { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes cf-draw { to { stroke-dashoffset: 0; } }

/* 2–6. Twee kolommen (Rustig/Beeld), één kolom (Reis) */
.cf__grid { display: grid; grid-template-columns: minmax(0, 1fr) 392px; gap: 32px 48px; align-items: start; }
.cf__col { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
.card { border: 1px solid var(--c-light-grey); border-radius: var(--radius); padding: var(--card-pad, 24px); background: var(--c-white); }

/* Samenvatting */
.cf__summary-head { display: flex; gap: 16px; align-items: center; }
.cf__thumb { width: 96px; height: 72px; object-fit: cover; border-radius: var(--radius-sm); flex-shrink: 0; }
.cf__summary-title { margin: 2px 0 4px; font-size: var(--t-h2); font-weight: var(--w-black); line-height: 1.25; }
.cf__hotels { list-style: none; margin: 20px 0 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.cf__hotel { display: flex; gap: 12px; align-items: flex-start; }
.cf__num {
  flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%;
  background: var(--c-via-black); color: #fff; font-size: 13px; font-weight: var(--w-black);
  display: inline-flex; align-items: center; justify-content: center;
}
.cf__hotel-img { flex-shrink: 0; width: 112px; height: 80px; object-fit: cover; border-radius: var(--radius-sm); }
.cf__hotel-body { min-width: 0; }
.cf__stars { color: #e3a008; font-size: 12px; letter-spacing: 1px; }
.cf__price { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--c-light-grey); }
.cf__price-row { display: flex; justify-content: space-between; gap: 12px; padding: 3px 0; }
.cf__price-row--total { margin-top: 4px; padding-top: 10px; border-top: 1px solid var(--c-light-grey); font-size: var(--t-body-lg); }
.cf__price .t-caption { margin-top: 10px; }
.cf__price .cf__link { margin-left: 6px; }

/* E-mail en waarde */
.cf__mail { display: flex; gap: 12px; align-items: flex-start; padding: 14px 16px; border-radius: var(--radius-sm); background: var(--c-surface); }
.cf__mail-icon { flex-shrink: 0; width: 22px; height: 22px; margin-top: 2px; color: var(--c-via-black); }
.cf__value { padding: 0 4px; }

/* Wat er nu gebeurt */
.cf__timeline { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.cf__step { position: relative; display: flex; gap: 12px; }
.cf__step-dot { flex-shrink: 0; width: 12px; height: 12px; margin-top: 5px; border-radius: 50%; background: var(--c-via-green); box-shadow: 0 0 0 3px var(--c-green-pale); }
.cf__step:not(:last-child)::before { content: ''; position: absolute; left: 5px; top: 20px; bottom: -14px; width: 2px; background: var(--c-light-grey); }
.cf__step .t-caption + .t-body { margin-top: 1px; }

/* Wat je zelf doet + Goed om te weten */
.cf__list { margin: 0; padding-left: 20px; list-style: disc outside; display: flex; flex-direction: column; gap: 6px; }
.cf__list li { display: list-item; }
.cf__gtk { margin-top: 18px; padding: 14px 16px; border-radius: var(--radius-sm); background: var(--c-surface); }
.cf__list--gtk { gap: 4px; color: var(--c-dark-grey); font-size: var(--t-body); }

/* 7. Vervolgstap */
.cf__next { margin-top: 40px; }
.cf__next-card {
  display: flex; align-items: center; justify-content: space-between; gap: 32px;
  padding: 28px 32px; border-radius: var(--radius); background: var(--c-via-black); color: #fff;
}
.cf__next-card .c-mgrey { color: rgba(255, 255, 255, 0.65); }
.cf__next-card .c-grey { color: rgba(255, 255, 255, 0.85); }
.cf__next-text { max-width: 620px; }
.cf__next-actions { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; flex-shrink: 0; }
.cf__cta { display: inline-flex; align-items: center; justify-content: center; width: auto; min-width: 254px; text-decoration: none; }
.cf__secondary { color: #fff; font-size: var(--t-body); }

/* 8. Contact */
.cf__support { margin-top: 28px; color: var(--c-dark-grey); }

/* ── Variant Beeld: hoofdfoto als kop ── */
.cf__hero {
  position: relative; overflow: hidden; min-height: 380px; display: flex; align-items: flex-end;
  background-size: cover; background-position: center; color: #fff;
}
.cf__hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.65) 100%); }
.cf__hero-inner { position: relative; padding-top: 48px; padding-bottom: 36px; max-width: 760px; }
.cf__hero .cf__title { color: #fff; }
.cf__hero .cf__lead, .cf__hero .cf__ref { color: rgba(255, 255, 255, 0.9); }
.cf__hero .cf__ref b { color: #fff; }
.cf__confetti {
  position: absolute; top: -12px; width: 8px; height: 12px; border-radius: 2px; opacity: 0;
  animation: cf-fall 2.4s ease-in forwards;
}
@keyframes cf-fall { 0% { transform: translateY(0) rotate(0); opacity: 0.95; } 100% { transform: translateY(420px) rotate(260deg); opacity: 0; } }
.cf--photo .cf__grid { margin-top: 32px; }
.cf__hotels--photos { gap: 16px; }

/* ── Variant Reis: één kolom, kop links, alles als één verhaal ── */
.cf--journey .cf__head { text-align: left; max-width: none; padding-bottom: 20px; }
.cf--journey .cf__check { width: 48px; height: 48px; margin-bottom: 12px; }
.cf--journey .cf__check svg { width: 26px; height: 26px; }
.cf--journey .cf__grid { grid-template-columns: minmax(0, 760px); }
.cf--journey .cf__steps, .cf--journey .cf__todo { border: none; padding: 0; }
.cf--journey .cf__steps { padding-top: 8px; }
.cf--journey .cf__timeline { gap: 18px; }
.cf--journey .cf__step-dot { width: 14px; height: 14px; }
.cf--journey .cf__step:not(:last-child)::before { left: 6px; top: 22px; bottom: -18px; }
.cf--journey .cf__next-card { max-width: 760px; }

/* ── Mobiel (telefoon: één kolom, kaarten zonder rand) ── */
@media (max-width: 800px) {
  .cf__head { padding-top: 28px; padding-bottom: 20px; }
  .cf__title { font-size: var(--t-h1); }
  .cf__grid { grid-template-columns: 1fr; gap: 20px; }
  .cf__hero { min-height: 300px; }
  .cf__hero-inner { padding-top: 36px; padding-bottom: 24px; }
  .cf__summary-head { align-items: flex-start; }
  .cf__thumb { width: 72px; height: 56px; }
  .cf__hotel-img { width: 88px; height: 64px; }
  .cf__next { margin-top: 28px; }
  .cf__next-card { flex-direction: column; align-items: stretch; padding: 22px 20px; gap: 18px; }
  .cf__cta { width: 100%; }
  .cf__next-actions { align-items: stretch; text-align: center; }
}
</style>
