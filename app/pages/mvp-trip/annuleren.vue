<script setup lang="ts">
// MVP 12-11-2026 — annuleringsformulier (kopie van de MHT-pagina): mockup van het echte formulier op
// vialuxury.com/nl-NL/cancel?bookingId=… (zelfde opbouw en teksten: waarschuwing over kosten,
// voorwaarden nalezen, geen deelannulering, Boekings-ID en e-mailadres, knop Annuleer boeking).
// Alle links "Boeking annuleren" / "Mijn boeking annuleren" in de post-bookingflow (bevestigingspagina,
// account, mails) komen hier uit met het ViaLuxury Ordernummer in de URL (?bookingId=…). Prototype:
// het e-mailadres van de demo-gast staat al ingevuld en "Annuleer boeking" toont direct de
// bevestiging (geen validatie, er wordt niets echt geannuleerd).
import { useMvpTripMobileUa } from '~/composables-mvp-trip/useMvpTripMobileUa'
import { bookingRefFor } from '~/utils-mvp-trip/bookingRef'

const isMobileUa = useMvpTripMobileUa()
const route = useRoute()
const guest = useState<{ firstName: string; email: string } | null>('mvp-checkout-guest', () => null)
const bookingId = ref(String(route.query.bookingId ?? '') || bookingRefFor('ontdek-noord-frankrijk-en-de-opaalkust-in-7-dagen'))
const email = ref(guest.value?.email || 'rijo.verburg@gmail.com')
const done = ref(false)
function submit() {
  done.value = true
  window.scrollTo(0, 0)
}

useHead({ title: 'Annuleer je boeking — ViaLuxury' })
</script>

<template>
  <div class="mvp-checkout page page--white cx" :class="{ 'page--m': isMobileUa }">
    <MvpTripCheckoutMobileHeader v-if="isMobileUa" />
    <MvpTripCheckoutTopNav v-else />

    <main class="cx__main">
      <!-- Formulier: dezelfde teksten als het echte annuleringsformulier -->
      <form v-if="!done" class="cx__form" @submit.prevent="submit">
        <h1 class="cx__title">Annuleer je boeking</h1>
        <p class="t-body cx__lead">Let op: gemaakte kosten worden mogelijk niet terugbetaald bij annulering. Dit hangt af van het gekozen annuleringstarief en het moment van annuleren.</p>
        <p class="t-body">Controleer altijd je boekingsbevestiging wat de annuleringsvoorwaarden zijn, om zo onverwachte verrassingen te voorkomen.</p>
        <p class="t-body">Deelannuleringen zijn niet mogelijk. Wil je een deel van je boeking annuleren, annuleer dan de gehele boeking en boek het gewenste arrangement opnieuw.</p>
        <p class="t-body">Als je zeker bent van de annulering, vul dan onderstaande gegevens in ter bevestiging.</p>

        <div class="cx__field">
          <label class="cx__label" for="cx-id">Boekings-ID</label>
          <input id="cx-id" v-model="bookingId" class="cx__input" type="text" autocomplete="off" />
          <p class="cx__help">Deze vind je in de bevestigingsmail van de boeking.</p>
        </div>
        <div class="cx__field">
          <label class="cx__label" for="cx-email">E-mailadres</label>
          <input id="cx-email" v-model="email" class="cx__input" type="email" placeholder="E-mailadres" />
          <p class="cx__help">Dezelfde als gebruikt bij het plaatsen van de boeking.</p>
        </div>

        <button type="submit" class="cx__btn">Annuleer boeking</button>
      </form>

      <!-- Na "Annuleer boeking": bevestiging (prototype; het echte formulier stuurt een mail) -->
      <section v-else class="cx__form" aria-live="polite">
        <h1 class="cx__title">Je boeking is geannuleerd</h1>
        <p class="t-body">We hebben de annulering van boeking <b>{{ bookingId }}</b> ontvangen. Binnen een paar minuten staat de annuleringsbevestiging op <b>{{ email }}</b>, met daarin wat je terugkrijgt en wanneer.</p>
        <p class="t-body">Wil je toch op reis? Je kunt de vakantie gewoon opnieuw boeken.</p>
        <p class="t-body"><NuxtLink class="cx__link" to="/mvp-trip/account/boekingen">Naar je boekingen</NuxtLink></p>
      </section>
    </main>

    <MvpTripCheckoutFooter />
  </div>
</template>

<style scoped>
.page { min-height: 100vh; display: flex; flex-direction: column; }
.page--white { background: var(--c-white); }
/* Eén kolom, zo breed als de linkerkolom van de checkout; begint waar het logo begint (40px zijmarge). */
.cx__main { flex: 1; width: 100%; max-width: 760px; margin: 0 auto; padding: 40px 40px 72px; box-sizing: content-box; align-self: flex-start; }
.cx__main { margin-left: max(0px, calc((100% - var(--page-max)) / 2)); }
.cx__form { display: flex; flex-direction: column; gap: 12px; }
.cx__form p { margin: 0; }
.cx__title { margin: 0 0 8px; font-family: var(--font-heading); font-size: var(--t-h1); line-height: 1.2; font-weight: 700; }
.cx__lead { font-weight: var(--w-black); }
.cx__field { display: flex; flex-direction: column; gap: 6px; margin-top: 12px; }
.cx__label { font-size: var(--t-body); color: var(--c-via-black); }
.cx__input { width: 100%; box-sizing: border-box; border: 1px solid var(--c-light-grey); border-radius: var(--radius-sm); padding: 10px 12px; font-family: inherit; font-size: var(--t-body-lg); color: var(--c-via-black); background: var(--c-white); }
.cx__input:focus { outline: none; border-color: var(--c-via-black); }
.cx__help { font-size: var(--t-caption); color: var(--c-medium-grey); }
/* Zwarte knop, zoals op het echte formulier en in het account; geen chevron (huisstijl). */
.cx__btn { align-self: flex-start; margin-top: 20px; display: inline-flex; align-items: center; height: 48px; padding: 0 28px; border: 0; border-radius: var(--radius); background: var(--c-via-black); color: var(--c-white); font-family: inherit; font-size: var(--t-body-lg); font-weight: 700; cursor: pointer; transition: background 0.15s ease; }
.cx__btn:hover { background: #333; }
.cx__link { color: var(--c-via-orange); text-decoration: underline; text-underline-offset: 2px; font-weight: var(--w-medium); }
@media (max-width: 800px) {
  .cx__main { padding: 24px 16px 48px; margin-left: 0; }
}
</style>
