<script setup lang="ts">
// Multi Hotel Trip — Mijn ViaLuxury › Boekingen › detail: de boeking per hotel (foto, naam,
// plaats · nachten · datums, alle inclusies met groene vinkjes, check-in en check-out met tijd),
// daaronder de prijs; rechts "Tips voor je reis" en "Boeking beheren" (wijzigen / annuleren).
import { useMultiHotelTripAccountBooking, money } from '~/composables-multi-hotel-trip/useMultiHotelTripAccountBooking'

const route = useRoute()
const id = computed(() => String(route.params.id ?? ''))
const { checkout, stays, dateRangeLong, nights, persons, roomsPerHotel, bookingRef, tripTotal, total, bookingFee, cancelDate, email, isBike } = useMultiHotelTripAccountBooking(id.value)

useHead({ title: () => `${checkout.value.name} — Mijn ViaLuxury` })
</script>

<template>
  <MultiHotelTripAccountShell active="boekingen">
    <NuxtLink class="ad__back" to="/multi-hotel-trip/account/boekingen">‹ Alle boekingen</NuxtLink>

    <header class="ad__head">
      <div>
        <p class="ad__eyebrow">{{ checkout.typeLabel }} met {{ checkout.hotels.length }} hotels · Boekingsnummer <b>{{ bookingRef }}</b></p>
        <h1 class="ad__title">{{ checkout.name }}</h1>
        <p class="ad__meta">{{ dateRangeLong }} · {{ nights }} nachten · {{ persons }} personen · {{ roomsPerHotel }} {{ roomsPerHotel === 1 ? 'kamer' : 'kamers' }} per hotel</p>
      </div>
      <span class="ad__status">Actief</span>
    </header>

    <div class="ad__cols">
      <!-- Per hotel: alle informatie onder elkaar -->
      <div class="ad__main">
        <article v-for="(h, i) in stays" :key="h.name" class="ad__hotel">
          <img v-if="h.image" class="ad__hotel-img" :src="h.image" :alt="h.name" />
          <div class="ad__hotel-body">
            <p class="ad__hotel-name">
              <span class="ad__num">{{ i + 1 }}</span>
              <span>{{ h.name }} <span v-if="h.starRating" class="ad__stars" aria-hidden="true"><svg v-for="n in h.starRating" :key="n" viewBox="0 0 18 18" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M16.963,6.786c-.088-.271-.323-.469-.605-.51l-4.62-.671L9.672,1.418c-.252-.512-1.093-.512-1.345,0l-2.066,4.186-4.62,.671c-.282,.041-.517,.239-.605,.51-.088,.271-.015,.57,.19,.769l3.343,3.258-.79,4.601c-.048,.282,.067,.566,.298,.734,.231,.167,.538,.189,.79,.057l4.132-2.173,4.132,2.173c.11,.058,.229,.086,.349,.086,.155,0,.31-.048,.441-.143,.231-.168,.347-.452,.298-.734l-.79-4.601,3.343-3.258c.205-.199,.278-.498,.19-.769Z"/></svg></span></span>
            </p>
            <p class="ad__hotel-sub">{{ h.city }} · {{ h.nights }} {{ h.nights === 1 ? 'nacht' : 'nachten' }} · {{ h.from }} t/m {{ h.to }} · {{ roomsPerHotel }}× {{ h.roomName }}</p>

            <p class="ad__label">Inbegrepen</p>
            <ul class="ad__includes">
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

      <!-- Rechterkolom -->
      <aside class="ad__side">
        <section class="ad__card">
          <h2 class="ad__h2">Tips voor je reis</h2>
          <p class="ad__text">We hebben de tips en {{ isBike ? 'fietsroutes' : 'routes' }} voor je vakantie op een speciale pagina voor je klaargezet: per hotel de praktische informatie, het reisschema met de kaart en onze tips voor in de buurt.</p>
          <NuxtLink class="ad__link" to="/multi-hotel-trip/checkout/routes">Bekijk de tips</NuxtLink>
        </section>

        <section class="ad__card">
          <h2 class="ad__h2">Boeking beheren</h2>
          <p class="ad__text">Tot {{ cancelDate }} (30 dagen voor aankomst) kun je de hele vakantie kosteloos annuleren. Je bevestiging staat op <b>{{ email }}</b>.</p>
          <ul class="ad__actions">
            <li><a class="ad__link" href="#" @click.prevent>Deze boeking wijzigen</a></li>
            <li><a class="ad__link" href="#" @click.prevent>Deze boeking annuleren</a></li>
          </ul>
        </section>
      </aside>
    </div>
  </MultiHotelTripAccountShell>
</template>

<style scoped>
.ad__back { display: inline-block; margin-bottom: 16px; color: var(--color-text-secondary); text-decoration: none; font-size: 14px; }
.ad__back:hover { color: var(--color-primary); }
.ad__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin-bottom: 28px; }
.ad__eyebrow { margin: 0 0 6px; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-text-secondary); }
.ad__eyebrow b { color: var(--color-text-primary); letter-spacing: 0.04em; }
.ad__title { margin: 0 0 8px; font-family: var(--font-heading); font-size: 32px; font-weight: 700; line-height: 1.15; }
.ad__meta { margin: 0; font-size: 15px; color: var(--color-text-secondary); }
.ad__status { flex-shrink: 0; padding: 6px 12px; border-radius: 999px; background: #e4f5ec; color: #1f7a4d; font-size: 14px; font-weight: 600; }
.ad__cols { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 24px; align-items: start; }
.ad__main { display: flex; flex-direction: column; gap: 20px; }
.ad__label { display: block; margin: 0 0 8px; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--color-text-secondary); }

/* Hotelblok: foto links, informatie rechts */
.ad__hotel { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 22px; padding: 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: #fff; }
.ad__hotel-img { display: block; width: 100%; height: 160px; object-fit: cover; border-radius: 8px; }
.ad__hotel-name { margin: 0; display: flex; align-items: flex-start; gap: 10px; font-family: var(--font-heading); font-size: 21px; font-weight: 700; line-height: 1.25; }
.ad__num { flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; margin-top: 2px; border-radius: 50%; background: var(--color-text-primary); color: #fff; font-family: var(--font-body); font-size: 12px; font-weight: 700; }
.ad__stars { color: #141414; font-size: 13px; letter-spacing: 1px; margin-left: 2px; white-space: nowrap; }
.ad__stars svg { display: inline-block; vertical-align: -0.1em; }
.ad__hotel-sub { margin: 4px 0 16px 34px; font-size: 14px; color: var(--color-text-secondary); }
.ad__includes { list-style: none; margin: 0 0 16px; padding: 0; display: flex; flex-direction: column; gap: 6px; font-size: 15px; line-height: 1.4; }
.ad__includes li { display: flex; align-items: flex-start; gap: 10px; }
.ad__check { flex-shrink: 0; width: 20px; height: 20px; margin-top: 1px; }
.ad__checks { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; max-width: 420px; }
.ad__check-tile { display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; border-radius: 8px; background: #f7f7f7; }
.ad__check-tile .ad__label { margin-bottom: 2px; }
.ad__check-date { font-size: 16px; font-weight: 700; line-height: 1.25; }
.ad__check-time { font-size: 13px; color: var(--color-text-secondary); }

/* Prijs */
.ad__price { padding: 18px 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: #f7f7f7; font-size: 15px; }
.ad__price-row { display: flex; justify-content: space-between; gap: 12px; padding: 3px 0; }
.ad__price-row--total { margin-top: 6px; padding-top: 10px; border-top: 1px solid var(--color-border); font-size: 17px; font-weight: 700; }
.ad__price-row--due { padding-top: 6px; font-weight: 700; }
.ad__price-note { margin: 6px 0 0; text-align: right; font-size: 13px; color: var(--color-text-secondary); }

/* Rechterkolom */
.ad__side { display: flex; flex-direction: column; gap: 16px; }
.ad__card { padding: 18px 20px 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: #fff; }
.ad__h2 { margin: 0 0 8px; font-family: var(--font-heading); font-size: 21px; font-weight: 700; line-height: 1.25; }
.ad__text { margin: 0 0 10px; font-size: 15px; line-height: 1.5; color: var(--color-text-secondary); }
.ad__link { color: var(--color-primary); font-weight: 600; text-decoration: underline; text-underline-offset: 2px; }
.ad__link:hover { color: var(--color-primary-hover); }
.ad__actions { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }

@media (max-width: 900px) {
  .ad__head { flex-direction: column; gap: 12px; }
  .ad__title { font-size: 26px; }
  .ad__cols { grid-template-columns: 1fr; }
  .ad__hotel { grid-template-columns: 1fr; gap: 14px; padding: 16px; }
  .ad__hotel-img { height: 180px; }
  .ad__checks { max-width: none; }
}
</style>
