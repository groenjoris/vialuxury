<script setup lang="ts">
// Prototype-navigatie (niet voor de gast): klein linkje "‹ startscherm" helemaal linksboven op
// elke desktoppagina, in dezelfde subtiele stijl als het variant-label onder het logo. Op mobiel
// verborgen: daar staat de link alleen in de footer. Bewust een gewone <a> (volledige
// paginalading): dat houdt de klik licht op zware pagina's en reset meteen de demo-state, net als
// een terugkeer naar het startscherm via de footer. De header is de positioneringscontext.
// Op de post-bookingschermen (bevestiging, account, mails) staat er "‹ flow" boven: terug naar het
// flowschema (de MVP-flow staat op dezelfde flowpagina als de volledige versie).
const route = useRoute()
const flow = computed(() => /^\/mvp-trip\/(checkout\/bevestiging|account|emails)(\/|$)/.test(route.path))
</script>

<template>
  <nav class="proto-nav" aria-label="Prototype-navigatie">
    <a v-if="flow" class="proto-nav__link" href="/multi-hotel-trip/flow" title="Terug naar de post-bookingflow">‹ flow</a>
    <a class="proto-nav__link" href="/" title="Terug naar het startscherm">‹ startscherm</a>
  </nav>
</template>

<style scoped>
.proto-nav {
  position: absolute; top: 3px; left: 8px; z-index: 700;
  display: flex; flex-direction: column; align-items: flex-start; gap: 3px;
}
.proto-nav__link {
  display: inline-block; padding: 1px 0;
  font-family: var(--font-body, inherit); font-size: 9px; line-height: 1; font-weight: 600;
  letter-spacing: 0.14em; text-transform: uppercase; white-space: nowrap;
  color: rgba(255, 255, 255, 0.6); text-decoration: none;
  transition: color var(--transition-fast);
}
.proto-nav__link:hover { color: #fff; text-decoration: underline; text-underline-offset: 2px; }
@media (max-width: 800px) { .proto-nav { display: none; } }
</style>
