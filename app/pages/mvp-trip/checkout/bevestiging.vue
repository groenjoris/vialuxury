<script setup lang="ts">
// MVP 12-11-2026 — kopie van de bevestigingspagina van Multi Hotel Trip, uitgekleed naar de
// MVP-definitie (wijzigingen alleen hier, de volledige versie blijft ongewijzigd):
// - simpele preloader: alleen het cirkeltje, zonder de checklist (en korter);
// - geen route en geen confetti op de hoofdfoto;
// - geen blok "Tips voor je reis" (de MVP heeft geen tipspagina).
// Stikkertje "MVP" linksboven (MvpTripFlowLink).
//
// Multi Hotel Trip checkout — bevestigingspagina na het boeken van een vakantie
// (prototype: "Boek nu" op de gegevenspagina = betaald, geen validatie).
// Versie 3 (briefing 2026-10-15): hoofdfoto van de reis met de bevestiging en de
// route "op de foto" (witte lijn, genummerde bolletjes, plaatsnamen); daaronder
// links (⅔) eerst één wit, omlijnd blok met "Wat er nu gebeurt" (groter: de helft van
// de boodschap) en "Wat je zelf doet", dan de kassabon — grijs kader met wit vlak:
// eyebrow met rechts het boekingsnummer, reisnaam, datums, verticale tijdlijn met per
// hotel foto, naam, plaats · nachten · datums en wat je krijgt, dan flexibel annuleren
// (en bagagetransfer), de prijs en "Betaald". Rechts (⅓) "Boeking terugvinden", "Tips
// voor je reis" en de cadeaukaart als banner. Onderaan de veelgestelde vragen.
// Koppen in Recoleta (zoals op de site), bodytekst in Basis Grotesque. Vooraf een
// preloader van 6 seconden (alleen via "Boek nu" / de flow).
import { tripCheckoutBySlug } from '~/data/mvp-checkout/trip'
import { tripPdpBySlug } from '~/data/mvp-trip-pdp'
import { pricing } from '~/data/mvp-checkout/deal'
import { CHECKOUT_BOOKING_FEE } from '~/data/mvp-checkout/pricing'
import { useMvpTripCheckoutTrip } from '~/composables-mvp-trip/useMvpTripCheckoutTrip'
import { useMvpTripMobileUa } from '~/composables-mvp-trip/useMvpTripMobileUa'
import { bookingRefFor } from '~/utils-mvp-trip/bookingRef'
import { useDemoBookingFromQuery } from '~/composables-mvp-trip/useMvpTripDemoBooking'

const isMobileUa = useMvpTripMobileUa()
// Vanuit de flow: `?demo=auto|fiets&load=1` zet de demo-boeking (en de preloader) klaar bij het laden.
useDemoBookingFromQuery()

/* ── Boekingsgegevens (gedeelde checkout-state; zonder checkout de Opaalkust-demo) ── */
const DEMO_SLUG = 'ontdek-noord-frankrijk-en-de-opaalkust-in-7-dagen'
const { trip: checkoutTrip, day: checkoutDay } = useMvpTripCheckoutTrip()
const trip = computed(() => checkoutTrip.value ?? tripCheckoutBySlug(DEMO_SLUG)!)
/** De reisdata (inclusies per hotel, inchecktijd) voor de tijdlijn. */
const detail = computed(() => tripPdpBySlug(trip.value.slug)?.trip ?? null)

interface SelRow { baseId: string; rateKey: 'nonrefundable' | 'flexible'; price: number; priceWas: number; quantity: number }
const selection = useState<SelRow[]>('mvp-checkout-selection', () => [])
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
 *  inclusies, anders 11:00) en als "wat je krijgt" alleen "Inclusief arrangement" (kamernaam en
 *  inclusies staan niet op de kassabon; die staan in de mail en op de dealpagina). */
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
      items: ['Inclusief arrangement'],
    }
  })
})

/* Gast: voornaam + e-mail uit het formulier ("Boek nu"); anders de demo-gast. */
const guest = useState<{ firstName: string; email: string } | null>('mvp-checkout-guest', () => null)
const firstName = computed(() => guest.value?.firstName || 'Rijo')
const email = computed(() => guest.value?.email || 'rijo.verburg@gmail.com')

/** Boekingsnummer: vast per reis (demo), overal in dezelfde vorm (MvpTripBookingRef). */
const bookingRef = computed(() => bookingRefFor(trip.value.slug))

/* Wat er nu gebeurt — chronologisch (verticale tijdlijn). */
const nextSteps = computed(() => [
  { when: 'Nu', title: 'Bevestiging in je mailbox', text: `Binnen een paar minuten staat deze bevestiging op ${email.value}, met je boekingsnummer en alles wat je hier ziet.` },
  { when: `Rond ${docsDate.value}`, title: 'Een mail vol tips', text: 'Twee weken voor vertrek mailen we je tips zodat je je perfect kan voorbereiden op je reis.' },
  { when: checkIn.value, title: `Inchecken bij ${trip.value.hotels[0]?.name}`, text: `Vanaf ${stays.value[0]?.checkInTime} uur. Je hoeft niets te printen, je naam en identiteitsbewijs zijn genoeg.` },
  { when: checkOut.value, title: 'Weer thuis', text: 'Na je vakantie ontvang je een mail met de vraag hoe het was. Daar helpen we andere reizigers mee.' },
])

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

function money(v: number) {
  return `€${v.toLocaleString('nl-NL', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 })}`
}

/* Preloader (MVP: simpel — alleen het cirkeltje, geen checklist): de betaling/boeking wordt
   "bevestigd", gesimuleerd 3 seconden. Alleen bij binnenkomst via "Boek nu" of de flow (die
   zetten de vlag `mvp-checkout-confirm-load`); bij een refresh verschijnt de pagina direct. */
const LOAD_MS = 3000
const loadFlag = useState<boolean>('mvp-checkout-confirm-load', () => false)
const loading = ref(loadFlag.value)
onMounted(() => {
  if (!loading.value) return
  loadFlag.value = false
  // `load=1` uit de URL halen: de preloader hoort bij de binnenkomst, niet bij een refresh.
  const route = useRoute()
  if (route.query.load) useRouter().replace({ query: { ...route.query, load: undefined } })
  setTimeout(() => { loading.value = false; window.scrollTo(0, 0) }, LOAD_MS)
})

useHead({ title: 'Je vakantie is geboekt — ViaLuxury' })
</script>

<template>
  <div class="mvp-checkout page page--white cf" :class="{ 'page--m': isMobileUa }">
    <MvpTripCheckoutMobileHeader v-if="isMobileUa" :step="3" />
    <MvpTripCheckoutTopNav v-else />
    <MvpTripFlowLink />

    <!-- Preloader (MVP): alleen het cirkeltje, 3 seconden, dan de bevestiging. -->
    <Transition name="cf-load">
      <div v-if="loading" class="cf__loader" role="status" aria-live="polite" aria-label="Je boeking wordt bevestigd">
        <span class="cf__spinner" aria-hidden="true" />
      </div>
    </Transition>

    <main v-show="!loading" class="cf__main">
      <!-- ── 1. Hoofdfoto: vinkje + kop (MVP: zonder route op de foto) ──────── -->
      <section class="cf__hero" :style="{ backgroundImage: `url(${trip.thumb})` }">
        <div class="cf__hero-inner container">
          <div class="cf__hero-text">
            <span class="cf__check" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path class="cf__check-path" d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </span>
            <h1 class="cf__title">Je {{ trip.typeWord }} is geboekt, {{ firstName }}!</h1>
          </div>
        </div>
      </section>

      <div class="container cf__body">
        <div class="cf__cols">
          <!-- ── 2. Eerste blok (⅔): wat er nu gebeurt + wat je zelf doet, samen in één wit omlijnd blok ── -->
          <section class="cf__now card" aria-label="Wat er nu gebeurt">
            <h2 class="cf__h2 cf__h2--lg">Wat er nu gebeurt</h2>
            <ol class="cf__timeline">
              <li v-for="s in nextSteps" :key="s.title" class="cf__step">
                <span class="cf__step-dot" aria-hidden="true" />
                <div>
                  <p class="cf__step-when">{{ s.when }}</p>
                  <p class="cf__step-title">{{ s.title }}</p>
                  <p class="t-body c-grey cf__step-text">{{ s.text }}</p>
                </div>
              </li>
            </ol>

            <h2 class="cf__h2 cf__h2--todo">Wat je zelf doet</h2>
            <ul class="cf__todos">
              <li class="cf__todo">
                <svg class="cf__todo-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" /><path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                <span class="t-body">Je hoeft nu niks te doen: je boeking is rond.</span>
              </li>
              <li class="cf__todo">
                <svg class="cf__todo-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" stroke-width="2" /><circle cx="12" cy="10" r="2.6" stroke="currentColor" stroke-width="2" /><path d="M9 16.5h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
                <span class="t-body">Zorg dat je op vakantie een geldig identiteitsbewijs bij je hebt (paspoort, rijbewijs of ID-kaart); de hotels vragen daar bij het inchecken om.</span>
              </li>
            </ul>
          </section>

          <!-- ── 3. Kassabon (⅔): grijs kader, wit vlak; boekingsnummer rechtsboven ── -->
          <section class="cf__receipt-wrap" aria-label="Jouw boeking">
            <div class="cf__receipt-titlerow">
              <h2 class="cf__h2 cf__h2--lg cf__receipt-title">Jouw boeking</h2>
              <MvpTripBookingRef :value="bookingRef" />
            </div>
            <div class="cf__receipt">
              <p class="cf__eyebrow">{{ trip.typeLabel }} met {{ trip.hotels.length }} hotels</p>
              <h2 class="cf__trip-title">{{ trip.name }}</h2>
              <p class="cf__trip-meta t-body">{{ checkInLong }} t/m {{ checkOutLong }} · {{ trip.nights }} nachten · {{ persons }} personen · {{ roomsPerHotel }} {{ roomsPerHotel === 1 ? 'kamer' : 'kamers' }} per hotel</p>

              <!-- Tijdlijn: per hotel bolletje (gecentreerd op de kamerfoto), naam + sterren,
                   plaats · nachten · datums, wat je krijgt. -->
              <ol class="cf__stays">
                <li v-for="(h, i) in stays" :key="h.name" class="cf__stay">
                  <span class="cf__stay-dot" aria-hidden="true"><span class="cf__num">{{ i + 1 }}</span></span>
                  <img v-if="h.image" class="cf__stay-img" :src="h.image" :alt="`${h.roomName} — ${h.name}`" />
                  <span v-else class="cf__stay-img cf__stay-img--empty" aria-hidden="true" />
                  <div class="cf__stay-body">
                    <p class="cf__stay-name">{{ h.name }} <span v-if="h.starRating" class="cf__stars" aria-hidden="true"><span v-for="n in h.starRating" :key="n"><svg class="icon-star" viewBox="0 0 18 18" width="1em" height="1em" fill="currentColor" style="vertical-align:-0.125em" aria-hidden="true"><path d="M16.963,6.786c-.088-.271-.323-.469-.605-.51l-4.62-.671L9.672,1.418c-.252-.512-1.093-.512-1.345,0l-2.066,4.186-4.62,.671c-.282,.041-.517,.239-.605,.51-.088,.271-.015,.57,.19,.769l3.343,3.258-.79,4.601c-.048,.282,.067,.566,.298,.734,.231,.167,.538,.189,.79,.057l4.132-2.173,4.132,2.173c.11,.058,.229,.086,.349,.086,.155,0,.31-.048,.441-.143,.231-.168,.347-.452,.298-.734l-.79-4.601,3.343-3.258c.205-.199,.278-.498,.19-.769Z"/></svg></span></span></p>
                    <p class="t-caption c-mgrey cf__stay-meta">{{ h.city }} · {{ h.nights }} {{ h.nights === 1 ? 'nacht' : 'nachten' }} · {{ h.from }} t/m {{ h.to }}</p>
                    <ul class="cf__stay-items">
                      <li v-for="item in h.items" :key="item" class="t-caption c-grey">{{ item }}</li>
                    </ul>
                  </div>
                </li>
              </ol>

              <!-- Flexibel annuleren (en bagagetransfer): uitgelijnd met de hotelnamen, icoon vooraan. -->
              <ul class="cf__extras">
                <li class="cf__extra">
                  <svg class="cf__extra-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                  <div>
                    <p class="cf__stay-name">Flexibel annuleren</p>
                    <p class="t-caption c-grey">Tot {{ cancelDate }} (30 dagen voor aankomst) kosteloos annuleren van de gehele vakantie.</p>
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
                <div class="cf__price-row cf__price-row--total"><span class="t-body t-bold">Totaal</span><span class="t-body t-bold">{{ money(total) }}</span></div>
                <div class="cf__price-row"><span class="t-body">Betaald</span><span class="t-body">{{ money(total) }}</span></div>
                <div class="cf__price-row cf__price-row--due"><span class="t-body t-bold">Te betalen</span><span class="t-body t-bold">{{ money(0) }}</span></div>
                <p class="t-caption c-mgrey cf__price-note">In de hotels betaal je alleen<br>de lokale toeristenbelasting.</p>
              </div>
            </div>
          </section>

          <!-- ── 4. Rechterkolom (⅓): boeking terugvinden en de cadeaukaart als banner (MVP: geen tipsblok) ── -->
          <aside class="cf__side">
            <section class="card">
              <h2 class="cf__h2">Boeking terugvinden</h2>
              <p class="t-body c-grey">Je boeking staat in je ViaLuxury-account op <b>{{ email }}</b>. Inloggen doe je zonder wachtwoord: je krijgt een inloglink per mail.</p>
              <!-- MVP: geen detailpagina per boeking, de link gaat naar het boekingenoverzicht. -->
              <NuxtLink class="cf__link cf__cta-link" to="/mvp-trip/account/boekingen">Bekijk je boeking</NuxtLink>
            </section>

            <section class="cf__gift" aria-label="Cadeautip">
              <img class="cf__gift-img" src="/images/checkout/giftcard.jpg" alt="ViaLuxury cadeaukaart met envelop" />
              <div class="cf__gift-text">
                <p class="cf__eyebrow">Cadeautip</p>
                <h2 class="cf__gift-title">Maak iemand anders blij met een ViaLuxury-experience</h2>
                <p class="t-body c-grey">Met een ViaLuxury-cadeaukaart geef je een verblijf in een van onze handgekozen hotels. De ontvanger kiest zelf het hotel, de datum en het arrangement.</p>
                <a class="btn-primary cf__cta cf__gift-cta" href="https://cadeaukaart.vialuxury.com/Product/Products" target="_blank" rel="noopener">Bekijk onze cadeaukaarten</a>
              </div>
            </section>
          </aside>
        </div>

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

    <!-- Uitgebreide sitefooter (zoals op de homepage en de dealpagina), niet de compacte checkout-footer. -->
    <MvpTripSiteFooter />
  </div>
</template>

<style scoped>
.page { position: relative; min-height: 100vh; display: flex; flex-direction: column; }
/* Ruimte linksboven voor het flow-linkje (prototype-navigatie), zodat het niet over het logo valt. */
/* Ruimte linksboven voor de flow-pil + het MVP-stikkertje. */
.cf :deep(.nav__inner) { padding-left: 128px; }
.cf :deep(.mnav) { padding-left: 124px; }
.page--white { background: var(--c-white); }
.cf__main { flex: 1; padding-bottom: 56px; }
.cf__body { padding-top: 32px; display: flex; flex-direction: column; gap: 32px; }
/* Koppen in Recoleta zoals op de site (de checkout-scope zet h1–h6 standaard op de bodyfont). */
.cf__title, .cf__trip-title, .cf__h2, .cf__gift-title { font-family: var(--font-heading); font-weight: 700; }
.cf__h2 { margin: 0 0 12px; font-size: var(--t-h2); line-height: 1.25; }
.cf__h2--lg { margin-bottom: 18px; font-size: var(--t-h1); }
.cf__h2--todo { margin: 26px 0 12px; padding-top: 22px; border-top: 1px solid var(--c-light-grey); }
.cf__eyebrow { margin: 0 0 4px; font-size: var(--t-caption); font-weight: var(--w-medium); letter-spacing: 0.06em; text-transform: uppercase; color: var(--c-medium-grey); }
.cf__link { color: var(--c-via-orange); text-decoration: underline; text-underline-offset: 2px; font-weight: var(--w-medium); }
.card { border: 1px solid var(--c-light-grey); border-radius: var(--radius); padding: var(--card-pad, 20px); background: var(--c-white); }
.cf__chev { flex-shrink: 0; transition: transform 200ms ease; }
.cf__chev--open { transform: rotate(180deg); }
.cf__cta { display: inline-flex; align-items: center; justify-content: center; width: 100%; margin-top: 14px; text-decoration: none; }
.cf__cta-link { display: inline-block; margin-top: 10px; font-size: var(--t-body); }

/* Preloader */
.cf__loader {
  position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center;
  background: var(--c-white); padding: 24px; text-align: center;
}
.cf__spinner {
  display: inline-block; width: 56px; height: 56px; border-radius: 50%;
  border: 4px solid var(--c-light-grey); border-top-color: var(--c-via-orange);
  animation: cf-spin 900ms linear infinite;
}
@keyframes cf-spin { to { transform: rotate(360deg); } }
.cf-load-leave-active { transition: opacity 350ms ease; }
.cf-load-leave-to { opacity: 0; }

/* 1. Hoofdfoto: kop links onder (MVP: geen route) */
.cf__hero {
  position: relative; overflow: hidden; min-height: 480px; display: flex; align-items: stretch;
  background-size: cover; background-position: center; color: #fff;
}
.cf__hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0, 0, 0, 0.12) 0%, rgba(0, 0, 0, 0.62) 100%); }
.cf__hero-inner {
  position: relative; display: grid; grid-template-columns: minmax(0, 1fr); align-items: end;
  padding-top: 48px; padding-bottom: 40px; width: 100%;
}
.cf__hero-text { max-width: 640px; }
.cf__check {
  display: inline-flex; align-items: center; justify-content: center;
  width: 64px; height: 64px; margin-bottom: 16px; border-radius: 50%;
  background: var(--c-white); color: var(--c-via-green);
  animation: cf-pop 500ms cubic-bezier(0.2, 1.4, 0.4, 1) both;
}
.cf__check svg { width: 34px; height: 34px; }
.cf__check-path { stroke-dasharray: 24; stroke-dashoffset: 24; animation: cf-draw 450ms 250ms ease-out forwards; }
.cf__title { margin: 0; font-size: var(--t-display); line-height: 1.15; color: #fff; }
@keyframes cf-pop { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes cf-draw { to { stroke-dashoffset: 0; } }

/* 2 + 3. Kolommen ⅔ / ⅓ */
.cf__cols { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 24px; align-items: start; }
/* Expliciete plaatsing: "Wat er nu gebeurt" en de kassabon links (⅔), de rechterkolom loopt over beide rijen. */
.cf__now { grid-column: 1; grid-row: 1; }
.cf__receipt-wrap { grid-column: 1; grid-row: 2; }
.cf__side { grid-column: 2; grid-row: 1 / span 2; }

/* Eerste blok: wat er nu gebeurt (groter) + wat je zelf doet, één wit omlijnd blok */
.cf__now { padding: 28px; }
.cf__timeline { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 18px; }
.cf__step { position: relative; display: flex; gap: 16px; }
.cf__step p { margin: 0; }
.cf__step-when { font-size: var(--t-body); color: var(--c-medium-grey); }
.cf__step-title { font-size: var(--t-body-lg); font-weight: 700; line-height: 1.3; }
.cf__step-text { margin-top: 2px; max-width: 560px; }
.cf__step-dot { flex-shrink: 0; width: 14px; height: 14px; margin-top: 6px; border-radius: 50%; background: var(--c-via-black); box-shadow: 0 0 0 3px #f0f0f0; }
.cf__step:not(:last-child)::before { content: ''; position: absolute; left: 6px; top: 24px; bottom: -18px; width: 2px; background: var(--c-light-grey); }
.cf__todos { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.cf__todo { display: flex; gap: 12px; align-items: flex-start; }
.cf__todo-icon { flex-shrink: 0; width: 22px; height: 22px; color: var(--c-via-black); }

/* Kassabon: grijs kader met wit vlak erin */
.cf__receipt-wrap { padding: 16px; border-radius: var(--radius); background: var(--c-surface); }
/* Titel boven de kassabon, in het grijze kader; het boekingsnummer rechts op dezelfde hoogte. */
.cf__receipt-titlerow { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin: 4px 12px 16px; }
.cf__receipt-title { margin: 0; }
.cf__receipt { padding: 28px 28px 24px; border-radius: var(--radius-sm); background: var(--c-white); box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06); }
.cf__trip-title { margin: 0 0 6px; font-size: var(--t-h1); line-height: 1.2; }
.cf__trip-meta { margin: 0 0 20px; color: var(--c-dark-grey); }

/* Tijdlijn per hotel: bolletje | kamerfoto | tekst */
.cf__stays { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 18px; }
.cf__stay { position: relative; display: grid; grid-template-columns: 32px 112px minmax(0, 1fr); column-gap: 16px; align-items: start; }
/* Verbindingslijn van bolletje naar bolletje (midden van de foto's). */
.cf__stay:not(:last-child)::before { content: ''; position: absolute; left: 12px; top: 40px; bottom: -58px; width: 2px; background: var(--c-light-grey); }
.cf__stay-dot { position: relative; z-index: 1; display: flex; align-items: center; height: 80px; }
.cf__num {
  display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%;
  background: var(--c-via-black); color: #fff; font-size: 13px; font-weight: 700; box-shadow: 0 0 0 4px #fff;
}
.cf__stay-img { display: block; width: 112px; height: 80px; object-fit: cover; border-radius: var(--radius-sm); }
.cf__stay-img--empty { background: var(--c-surface); }
.cf__stay-body { min-width: 0; }
.cf__stay-name { margin: 0; font-size: var(--t-body-lg); font-weight: 700; line-height: 1.3; }
/* Sterren als op de dealcards: zwart, 13px, letterspatiëring 1px. */
.cf__stars { color: #141414; font-size: 13px; letter-spacing: 1px; margin-left: 4px; font-weight: 400; }
.cf__stars svg { display: inline-block; }
.cf__stay-meta { margin: 2px 0 6px; }
/* Kamer · ontbijt · diner: doorlopend, met een bulletje ertussen (geen vinkjes). */
.cf__stay-items { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 2px 0; }
.cf__stay-items li { display: inline; }
.cf__stay-items li + li::before { content: '·'; margin: 0 6px; color: var(--c-medium-grey); }

/* Flexibel annuleren / bagagetransfer: het icoon staat in de kolom van de nummerbolletjes (zelfde raster als de hotels). */
.cf__extras { list-style: none; margin: 20px 0 0; padding: 18px 0 0; border-top: 1px solid var(--c-light-grey); display: flex; flex-direction: column; gap: 14px; }
.cf__extra { display: grid; grid-template-columns: 32px minmax(0, 1fr); column-gap: 16px; align-items: start; }
.cf__extra p { margin: 0; }
.cf__extra-icon { width: 26px; height: 26px; color: var(--c-via-green); }

.cf__price { margin-top: 20px; padding-top: 14px; border-top: 1px solid var(--c-light-grey); }
.cf__price-row { display: flex; justify-content: space-between; gap: 12px; padding: 3px 0; }
.cf__price-row--total { margin-top: 4px; padding-top: 10px; border-top: 1px solid var(--c-light-grey); font-size: var(--t-body-lg); }
.cf__price-row--due { padding-top: 6px; }
.cf__price-note { margin: 2px 0 0; text-align: right; line-height: 1.4; }

/* Rechterkolom */
.cf__side { display: flex; flex-direction: column; gap: 16px; }
.cf__side .card { padding: 16px 20px 20px; }
.cf__side .cf__h2 { margin-bottom: 8px; }

/* 4. Cadeaukaart als banner in de rechterkolom: productfoto (witte achtergrond) bovenin, tekst + knop eronder. */
.cf__gift { overflow: hidden; border-radius: var(--radius); background: var(--c-white); border: 1px solid var(--c-light-grey); }
.cf__gift-img { display: block; width: 100%; height: auto; padding: 12px 24px 0; box-sizing: border-box; }
.cf__gift-text { padding: 12px 20px 20px; }
.cf__gift-title { margin: 0 0 8px; font-size: var(--t-h2); line-height: 1.2; }
.cf__gift-text p { margin: 0 0 10px; }
.cf__gift-cta { margin-top: 4px; }

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
  .cf__hero-inner { padding-top: 28px; padding-bottom: 24px; }
  .cf__title { font-size: var(--t-h1); }
  .cf__cols { grid-template-columns: 1fr; gap: 20px; }
  .cf__now, .cf__receipt-wrap, .cf__side { grid-column: auto; grid-row: auto; }
  .cf__now { padding: 20px 16px; }
  .cf__receipt-wrap { padding: 10px; }
  .cf__receipt-titlerow { flex-wrap: wrap; gap: 8px 16px; margin: 4px 6px 12px; }
  .cf__receipt { padding: 20px 16px; }
  .cf__trip-title { font-size: var(--t-h2); }
  .cf__stay { grid-template-columns: 28px 96px minmax(0, 1fr); column-gap: 12px; }
  .cf__stay:not(:last-child)::before { left: 12px; top: 35px; bottom: -53px; }
  .cf__stay-dot { height: 70px; }
  .cf__stay-img { width: 96px; height: 70px; }
  .cf__extras { padding-left: 0; }
  .cf__gift-img { max-width: 300px; margin: 0 auto; }
}
</style>
