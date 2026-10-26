<script setup lang="ts">
// MVP 12-11-2026 — kopie van de accountomgeving van Multi Hotel Trip (nog uit te kleden).
// Multi Hotel Trip — Mijn ViaLuxury › Boekingen › detail. Bovenaan twee blokken naast elkaar:
// "Praktische informatie" (de speciale reispagina) en "Boeking beheren" (wijzigen / annuleren),
// telkens de tekst over de hele breedte met de link(s) eronder. Daaronder de boeking over de hele breedte: per hotel foto, naam,
// plaats, datums · nachten, "Inbegrepen" (kamer + alle inclusies met groene vinkjes), check-in en
// check-out met tijd, en adres + telefoon; onderaan de prijs.
import { useMvpTripAccountBooking, money } from '~/composables-mvp-trip/useMvpTripAccountBooking'
import { useDemoBookingFromQuery } from '~/composables-mvp-trip/useMvpTripDemoBooking'

useDemoBookingFromQuery()
const route = useRoute()
const id = computed(() => String(route.params.id ?? ''))
const { checkout, stays, dateRangeLong, nights, persons, roomsPerHotel, bookingRef, tripTotal, total, bookingFee, cancelDate } = useMvpTripAccountBooking(id.value)

useHead({ title: () => `${checkout.value.name} — Mijn ViaLuxury` })
</script>

<template>
  <MvpTripAccountShell active="boekingen">
    <NuxtLink class="ad__back" to="/mvp-trip/account/boekingen">‹ Alle boekingen</NuxtLink>

    <header class="ad__head">
      <div>
        <p class="ad__eyebrow">{{ checkout.typeLabel }} met {{ checkout.hotels.length }} hotels</p>
        <h1 class="ad__title">{{ checkout.name }}</h1>
        <p class="ad__meta">{{ dateRangeLong }} · {{ nights }} nachten · {{ persons }} personen · {{ roomsPerHotel }} {{ roomsPerHotel === 1 ? 'kamer' : 'kamers' }} per hotel</p>
        <p class="ad__ref"><MvpTripBookingRef :value="bookingRef" /></p>
      </div>
      <span class="ad__status">Actief</span>
    </header>

    <!-- Twee blokken boven de boeking: tekst over de hele breedte, link(s) eronder -->
    <div class="ad__top">
      <section class="ad__card">
        <h2 class="ad__h2">Praktische informatie</h2>
        <p class="ad__text">Alles over je hotels, de omgeving en wat je onderweg nodig hebt staat op één handige pagina: inchecken, adres en parkeren per hotel, het reisschema met de kaart, het weer en onze tips voor in de buurt.</p>
        <!-- MVP heeft (nog) geen tipspagina: tot het uitkleden verwijst de link naar de volledige versie. -->
        <p class="ad__actions"><NuxtLink class="ad__link" to="/multi-hotel-trip/checkout/routes">Bekijk hier</NuxtLink></p>
      </section>
      <section class="ad__card">
        <h2 class="ad__h2">Boeking beheren</h2>
        <p class="ad__text">Tot {{ cancelDate }} (30 dagen voor aankomst) kun je de hele vakantie kosteloos annuleren.</p>
        <p class="ad__actions">
          <a class="ad__link" href="#" @click.prevent>Deze boeking wijzigen</a>
          <a class="ad__link" href="#" @click.prevent>Deze boeking annuleren</a>
        </p>
      </section>
    </div>

    <!-- De boeking: per hotel, over de hele breedte -->
    <div class="ad__main">
      <article v-for="(h, i) in stays" :key="h.name" class="ad__hotel">
        <img v-if="h.image" class="ad__hotel-img" :src="h.image" :alt="h.name" />
        <div class="ad__hotel-body">
          <p class="ad__hotel-name"><span class="ad__num">{{ i + 1 }}</span><span>{{ h.name }}</span></p>
          <p class="ad__hotel-place">{{ h.city }}</p>
          <p class="ad__hotel-dates">{{ h.dateLine }} · {{ h.nights }} {{ h.nights === 1 ? 'nacht' : 'nachten' }}</p>

          <p class="ad__label">Inbegrepen</p>
          <ul class="ad__includes">
            <li>
              <svg class="ad__check" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#e4f5ec" /><path d="M7.5 12.5l3 3 6-6.5" stroke="#1f7a4d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
              <span>{{ roomsPerHotel }}× {{ h.roomName }}</span>
            </li>
            <li v-for="inc in h.includes" :key="inc">
              <svg class="ad__check" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#e4f5ec" /><path d="M7.5 12.5l3 3 6-6.5" stroke="#1f7a4d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
              <span>{{ inc }}</span>
            </li>
          </ul>

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
        </div>
      </article>

      <!-- Prijs -->
      <section class="ad__price" aria-label="Prijs">
        <div class="ad__price-row"><span>{{ checkout.typeLabel }}, {{ persons }} personen, incl. flexibel annuleren</span><span>{{ money(tripTotal) }}</span></div>
        <div class="ad__price-row"><span>Boekingskosten</span><span>{{ money(bookingFee) }}</span></div>
        <div class="ad__price-row ad__price-row--total"><span>Totaal</span><span>{{ money(total) }}</span></div>
        <div class="ad__price-row"><span>Betaald</span><span>{{ money(total) }}</span></div>
        <div class="ad__price-row ad__price-row--due"><span>Te betalen</span><span>{{ money(0) }}</span></div>
        <p class="ad__price-note">In de hotels betaal je alleen de lokale toeristenbelasting.</p>
      </section>
    </div>
  </MvpTripAccountShell>
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
.ad__card { padding: 18px 20px 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: #fff; }
.ad__h2 { margin: 0 0 6px; font-family: var(--font-heading); font-size: 21px; font-weight: 700; line-height: 1.25; }
.ad__text { margin: 0; font-size: 15px; line-height: 1.5; color: var(--color-text-secondary); }
.ad__link { color: var(--color-primary); font-weight: 600; text-decoration: underline; text-underline-offset: 2px; white-space: nowrap; }
.ad__link:hover { color: var(--color-primary-hover); }
.ad__link--plain { color: var(--color-text-primary); white-space: normal; }
.ad__link--plain:hover { color: var(--color-text-secondary); }
/* Link(s) onder de tekst, naast elkaar */
.ad__actions { margin: 12px 0 0; display: flex; flex-wrap: wrap; gap: 8px 20px; font-size: 15px; }

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
.ad__check { flex-shrink: 0; width: 20px; height: 20px; margin-top: 1px; }
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
