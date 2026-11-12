<script setup lang="ts">
// Multi Hotel Trip — Mijn ViaLuxury › Boekingen › detail. Bovenaan twee blokken naast elkaar:
// "Praktische informatie" (de speciale reispagina) en "Boeking beheren" (wijzigen / annuleren),
// telkens de tekst over de hele breedte met de link(s) eronder. Daaronder de boeking over de hele breedte: per hotel foto, naam,
// plaats, datums · nachten, check-in en check-out met tijd, "Inbegrepen" (kamer + alle inclusies met
// dezelfde groene vinkjes als op de PDP), en adres + telefoon; onderaan de prijs. "Boeking beheren"
// volgt de annuleringskeuze: flex = annuleren t/m 30 dagen voor aankomst 23:59 uur met de knop
// "Boeking annuleren" (placeholder-link naar het annuleringsformulier), non-flex = alleen via de klantenservice.
import { useMultiHotelTripAccountBooking, money, fmtLong } from '~/composables-multi-hotel-trip/useMultiHotelTripAccountBooking'
import { demoQuery, navigateAfterPaint, useDemoBookingFromQuery, useDemoSwitches } from '~/composables-multi-hotel-trip/useMultiHotelTripDemoBooking'

useDemoBookingFromQuery()
const route = useRoute()
const id = computed(() => String(route.params.id ?? ''))
const { checkout, stays, dateRangeLong, nights, persons, roomsPerHotel, bookingRef, tripTotal, total, bookingFee, checkInYmd, isBike, isFlex } = useMultiHotelTripAccountBooking(id.value)
/** Annuleren kan t/m 30 dagen voor aankomst, 23:59 uur (voluit, zoals de datums in de kop). */
const cancelDeadline = computed(() => { const y = checkInYmd.value; return `${fmtLong(new Date(y.year, y.month, y.day - 30))}, 23:59 uur` })
/** Placeholder voor het bestaande annuleringsformulier (zelfde link als de knop in de bevestigingsmail). */
const CANCEL_FORM_URL = 'https://vialuxury.nl/annuleren'
/* Prototype-schakelaars (DemoSwitches): Auto | Fiets en Flex | Non-flex uit de URL; de annuleringstekst en de prijs volgen. */
const { variant: demoVariant, rate: demoRate } = useDemoSwitches(() => isBike.value ? 'fiets' : 'auto')
/* Prototype: bij flex ook "op tijd" (vóór de annuleringsdeadline) of "te laat" (erna); subtiele schakelaar in het blok
   Boeking beheren, stand in de URL (?late=1) zodat hij deelbaar is en de mails hem later ook kunnen volgen. */
const late = computed(() => isFlex.value && route.query.late === '1')
const lateHref = (on: boolean) => { const q = new URLSearchParams(demoQuery(demoVariant.value, demoRate.value)); if (on) q.set('late', '1'); return `${route.path}?${q.toString()}` }

useHead({ title: () => `${checkout.value.name} — Mijn ViaLuxury` })
</script>

<template>
  <!-- Prototype-schakelaars (niet voor de gast) rechts naast het logo in de zwarte balk. -->
  <MultiHotelTripAccountShell active="boekingen">
    <template #proto><MultiHotelTripDemoSwitches :variant="demoVariant" :rate="demoRate" /></template>
    <NuxtLink class="ad__back" to="/multi-hotel-trip/account/boekingen">‹ Alle boekingen</NuxtLink>

    <header class="ad__head">
      <div>
        <p class="ad__eyebrow">{{ checkout.typeLabel }} met {{ checkout.hotels.length }} hotels</p>
        <h1 class="ad__title">{{ checkout.name }}</h1>
        <p class="ad__meta">{{ dateRangeLong }} · {{ nights }} nachten · {{ persons }} personen · {{ roomsPerHotel }} {{ roomsPerHotel === 1 ? 'kamer' : 'kamers' }} per hotel</p>
        <p class="ad__ref"><MultiHotelTripBookingRef :value="bookingRef" /></p>
      </div>
      <span class="ad__status">Actief</span>
    </header>

    <!-- Twee blokken boven de boeking: tekst over de hele breedte, link(s) eronder -->
    <div class="ad__top">
      <section class="ad__card">
        <h2 class="ad__h2">Praktische informatie</h2>
        <p class="ad__text">Alles over je hotels, de omgeving en wat je onderweg nodig hebt staat op één handige pagina: inchecken, adres en parkeren per hotel, het reisschema met de kaart, het weer en onze tips voor in de buurt.</p>
        <p class="ad__actions"><NuxtLink class="ad__link" to="/multi-hotel-trip/checkout/routes">Bekijk hier</NuxtLink></p>
      </section>
      <div class="ad__top-col">
        <!-- Prototype-schakelaar (geen onderdeel van de uiteindelijke UX, daarom buiten het blok): bij flex vóór of ná de annuleringsdeadline -->
        <div v-if="isFlex" class="ad__late" role="group" aria-label="Prototype: vóór of na de annuleringsdeadline" title="Prototype: vóór of na de annuleringsdeadline">
          <span v-if="!late" class="ad__late-opt ad__late-opt--on" aria-current="true">Op tijd</span>
          <a v-else class="ad__late-opt" :href="lateHref(false)" @click="navigateAfterPaint(lateHref(false), $event)">Op tijd</a>
          <span v-if="late" class="ad__late-opt ad__late-opt--on" aria-current="true">Te laat</span>
          <a v-else class="ad__late-opt" :href="lateHref(true)" @click="navigateAfterPaint(lateHref(true), $event)">Te laat</a>
        </div>
      <section class="ad__card">
        <h2 class="ad__h2">Boeking beheren</h2>
        <template v-if="isFlex && !late">
          <p class="ad__text">Omdat je flexibel annuleren hebt aangezet, kun je je boeking annuleren t/m {{ cancelDeadline }}. Het is niet mogelijk individuele onderdelen van je boeking aan te passen. Wil je de datum van vertrek aanpassen, dan dien je de gehele boeking te annuleren en opnieuw te boeken. Let op: voor de boekingskosten ontvang je een voucher die je weer kunt gebruiken bij je nieuwe boeking.</p>
          <p class="ad__actions"><a class="ad__btn" :href="CANCEL_FORM_URL">Boeking annuleren</a></p>
        </template>
        <p v-else-if="isFlex && late" class="ad__text">Je hebt gekozen voor flexibel annuleren, maar de deadline ({{ cancelDeadline }}) is al verstreken. Kosteloos annuleren is daardoor niet meer mogelijk, en wijzigen van je boeking ook niet. Het kan zijn dat de klantenservice je wel bepaalde opties kan geven; neem daarom tijdens openingstijden contact met hen op via <a class="ad__link ad__link--plain" href="mailto:info@vialuxury.com">info@vialuxury.com</a>, <a class="ad__link ad__link--plain" href="tel:+31207052222">+31 20 705 2222</a> of een WhatsApp-bericht naar <a class="ad__link ad__link--plain" href="https://wa.me/31208088809" target="_blank" rel="noopener">+31 20 808 8809</a>.</p>
        <p v-else class="ad__text">Tijdens het boeken heb je ervoor gekozen om niet-terugbetaalbaar te boeken. Daardoor is het niet mogelijk om zelf je boeking te annuleren. Het kan zijn dat de klantenservice je wel bepaalde opties kan geven; neem daarom tijdens openingstijden contact met hen op via <a class="ad__link ad__link--plain" href="mailto:info@vialuxury.com">info@vialuxury.com</a>, <a class="ad__link ad__link--plain" href="tel:+31207052222">+31 20 705 2222</a> of een WhatsApp-bericht naar <a class="ad__link ad__link--plain" href="https://wa.me/31208088809" target="_blank" rel="noopener">+31 20 808 8809</a>.</p>
      </section>
      </div>
    </div>

    <!-- De boeking: per hotel, over de hele breedte -->
    <div class="ad__main">
      <article v-for="(h, i) in stays" :key="h.name" class="ad__hotel">
        <img v-if="h.image" class="ad__hotel-img" :src="h.image" :alt="h.name" />
        <div class="ad__hotel-body">
          <p class="ad__hotel-name"><span class="ad__num">{{ i + 1 }}</span><span>{{ h.name }}</span></p>
          <p class="ad__hotel-place">{{ h.city }}</p>
          <p class="ad__hotel-dates">{{ h.dateLine }} · {{ h.nights }} {{ h.nights === 1 ? 'nacht' : 'nachten' }}</p>

          <div class="ad__checks">
            <div class="ad__check-tile">
              <span class="ad__label">Check-in</span>
              <span class="ad__check-date">{{ h.from }}</span>
              <span class="ad__check-time">vanaf {{ h.checkInTime }} uur</span>
            </div>
            <div class="ad__check-tile">
              <span class="ad__label">Check-out</span>
              <span class="ad__check-date">{{ h.to }}</span>
              <span class="ad__check-time">tot {{ h.checkOutTime }} uur</span>
            </div>
          </div>

          <!-- Inbegrepen: dezelfde groene vinkjes als op de PDP (TripHotelDetails) -->
          <p class="ad__label">Inbegrepen</p>
          <ul class="ad__includes">
            <li>
              <span class="ad__check" aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-miterlimit="10"><path d="M3 13L8 19L21 5"/></svg></span>
              <span>{{ roomsPerHotel }}× {{ h.roomName }}</span>
            </li>
            <li v-for="inc in h.includes" :key="inc">
              <span class="ad__check" aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-miterlimit="10"><path d="M3 13L8 19L21 5"/></svg></span>
              <span>{{ inc }}</span>
            </li>
          </ul>


          <ul class="ad__contact">
            <li>
              <svg class="ad__contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></svg>
              <div><span class="ad__label">Adres</span>{{ h.address }} · <a class="ad__link ad__link--plain" :href="h.mapsHref" target="_blank" rel="noopener">Routebeschrijving</a></div>
            </li>
            <li>
              <svg class="ad__contact-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.58 1 1 0 01-.24 1.01l-2.21 2.21z" /></svg>
              <div><span class="ad__label">Telefoon</span><a class="ad__link ad__link--plain" :href="`tel:${h.phone.replace(/\s/g, '')}`">{{ h.phone }}</a></div>
            </li>
          </ul>

          <!-- Hotelboekingsnummer: eigen regel onder het contactblok (hoort niet bij het adres), helemaal links, met een lijn erboven;
               hetzelfde kleine vlakje als op de bevestigingspagina. -->
          <div class="ad__hotel-ref"><MultiHotelTripBookingRef small label="Hotelboekingsnummer" :value="h.bookingRef" /></div>
        </div>
      </article>

      <!-- Prijs -->
      <section class="ad__price" aria-label="Prijs">
        <div class="ad__price-row"><span>{{ checkout.typeLabel }}, {{ persons }} personen{{ isFlex ? ', incl. flexibel annuleren' : '' }}</span><span>{{ money(tripTotal) }}</span></div>
        <div class="ad__price-row"><span>Boekingskosten</span><span>{{ money(bookingFee) }}</span></div>
        <div class="ad__price-row ad__price-row--total"><span>Totaal</span><span>{{ money(total) }}</span></div>
        <div class="ad__price-row"><span>Betaald</span><span>{{ money(total) }}</span></div>
        <div class="ad__price-row ad__price-row--due"><span>Te betalen</span><span>{{ money(0) }}</span></div>
        <p class="ad__price-note">In de hotels betaal je nog wel de lokale toeristenbelasting.</p>
      </section>
    </div>
  </MultiHotelTripAccountShell>
</template>

<style scoped>
.ad__back { display: inline-block; margin-bottom: 16px; color: var(--color-text-secondary); text-decoration: none; font-size: 14px; }
.ad__back:hover { color: var(--color-primary); }
.ad__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin-bottom: 24px; }
.ad__eyebrow { margin: 0 0 6px; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-text-secondary); }
.ad__title { margin: 0 0 8px; font-family: var(--font-heading); font-size: 32px; font-weight: 700; line-height: 1.15; }
.ad__meta { margin: 0; font-size: 15px; color: var(--color-text-secondary); }
.ad__ref { margin: 12px 0 0; }
.ad__status { flex-shrink: 0; padding: 6px 12px; border-radius: 999px; background: #e4f5ec; color: #1f7a4d; font-size: 14px; font-weight: 600; }
.ad__label { display: block; margin: 0 0 8px; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--color-text-secondary); }

/* Twee blokken bovenaan: tekst links, links rechts */
.ad__top { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; margin-bottom: 24px; }
.ad__top-col > .ad__card { height: 100%; }
.ad__card { padding: 18px 20px 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: #fff; }
.ad__h2 { margin: 0 0 6px; font-family: var(--font-heading); font-size: 21px; font-weight: 700; line-height: 1.25; }
/* Prototype-schakelaar "Op tijd | Te laat": buiten het blok, in de ruimte erboven, rechts uitgelijnd met de kaart (zelfde typografie als het schakelpaneel) */
.ad__top-col { position: relative; }
.ad__late { position: absolute; right: 0; top: -26px; display: inline-flex; border: 1px solid rgba(20, 20, 20, 0.3); border-radius: 3px; overflow: hidden; background: #fff; }
.ad__late-opt { display: inline-block; padding: 3px 6px; font-size: 9px; line-height: 1; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; white-space: nowrap; color: var(--color-text-secondary); text-decoration: none; }
.ad__late-opt + .ad__late-opt { border-left: 1px solid rgba(20, 20, 20, 0.3); }
a.ad__late-opt:hover { color: var(--color-text-primary); }
.ad__late-opt--on { background: var(--color-text-primary); color: #fff; }
.ad__text { margin: 0; font-size: 15px; line-height: 1.5; color: var(--color-text-secondary); }
.ad__link { color: var(--color-primary); font-weight: 600; text-decoration: underline; text-underline-offset: 2px; white-space: nowrap; }
.ad__link:hover { color: var(--color-primary-hover); }
.ad__link--plain { white-space: normal; } /* in lopende tekst; zelfde oranje als elke tekstlink (huisstijl) */
.ad__link--plain:hover { color: var(--color-text-secondary); }
/* Link(s) of knop onder de tekst */
.ad__actions { margin: 12px 0 0; display: flex; flex-wrap: wrap; gap: 8px 20px; font-size: 15px; }
.ad__btn { display: inline-flex; align-items: center; height: 40px; padding: 0 18px; border-radius: var(--radius-md); background: var(--color-text-primary); color: #fff; font-size: 14px; font-weight: 700; text-decoration: none; transition: background var(--transition-fast); }
.ad__btn:hover { background: #333; }

/* Hotelblok: foto links, informatie rechts, over de hele breedte */
.ad__main { display: flex; flex-direction: column; gap: 20px; }
.ad__hotel { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 24px; padding: 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: #fff; }
.ad__hotel-img { display: block; width: 100%; height: 190px; object-fit: cover; border-radius: 8px; }
.ad__hotel-name { margin: 0; display: flex; align-items: flex-start; gap: 10px; font-family: var(--font-heading); font-size: 22px; font-weight: 700; line-height: 1.25; }
.ad__num { flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; margin-top: 2px; border-radius: 50%; background: var(--color-text-primary); color: #fff; font-family: var(--font-body); font-size: 12px; font-weight: 700; }
.ad__hotel-place { margin: 4px 0 0 34px; font-size: 15px; color: var(--color-text-secondary); }
.ad__hotel-dates { margin: 2px 0 16px 34px; font-size: 15px; font-weight: 600; }
.ad__includes { list-style: none; margin: 0 0 18px; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 24px; font-size: 15px; line-height: 1.4; }
.ad__includes li { display: flex; align-items: flex-start; gap: 10px; }
.ad__check { color: var(--color-discount, #27C88D); flex-shrink: 0; display: inline-flex; font-size: 18px; margin-top: 2px; }
.ad__checks { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; max-width: 420px; margin-bottom: 18px; }
.ad__check-tile { display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; border-radius: 8px; background: #f7f7f7; }
.ad__check-tile .ad__label { margin-bottom: 2px; }
.ad__check-date { font-size: 16px; font-weight: 700; line-height: 1.25; }
.ad__check-time { font-size: 13px; color: var(--color-text-secondary); }
/* Adres en telefoon naast elkaar, met icoon */
.ad__contact { list-style: none; margin: 0; padding: 16px 0 0; border-top: 1px solid var(--color-border); display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 24px; font-size: 14px; line-height: 1.4; }
.ad__contact li { display: flex; align-items: flex-start; gap: 10px; }
.ad__contact .ad__label { margin-bottom: 3px; }
.ad__contact-icon { flex-shrink: 0; width: 18px; height: 18px; margin-top: 1px; }
.ad__hotel-ref { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--color-border); }

/* Prijs */
.ad__price { padding: 18px 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: #f7f7f7; font-size: 15px; }
.ad__price-row { display: flex; justify-content: space-between; gap: 12px; padding: 3px 0; }
.ad__price-row--total { margin-top: 6px; padding-top: 10px; border-top: 1px solid var(--color-border); font-size: 17px; font-weight: 700; }
.ad__price-row--due { padding-top: 6px; font-weight: 700; }
.ad__price-note { margin: 6px 0 0; text-align: right; font-size: 13px; color: var(--color-text-secondary); }

@media (max-width: 900px) {
  .ad__head { flex-direction: column; gap: 12px; }
  .ad__title { font-size: 26px; }
  .ad__top { grid-template-columns: 1fr; }
  .ad__hotel { grid-template-columns: 1fr; gap: 14px; padding: 16px; }
  .ad__hotel-img { height: 180px; }
  .ad__includes, .ad__contact { grid-template-columns: 1fr; }
  .ad__checks { max-width: none; }
}
</style>
