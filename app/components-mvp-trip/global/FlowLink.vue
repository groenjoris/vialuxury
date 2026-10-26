<template>
  <!-- Prototype-navigatie: klein linkje linksboven op elk scherm en elke mail van de
       post-bookingflow, terug naar het flowschema (niet naar het startscherm).
       Bewust een gewone <a> (volledige paginalading) en geen NuxtLink: bij een client-side
       navigatie wordt de zware pagina (kaarten, reisschema, header) in de klik-handler
       afgebroken en de flow opgebouwd vóór de volgende paint — dat gaf een INP van 600 ms+
       op de live site. Een echte navigatie houdt de klik licht en reset meteen de demo-state,
       zoals een terugkeer naar het startscherm ook doet.
       MVP: de MVP-flow staat op dezelfde flowpagina als de volledige versie (boven de lijn).
       Naast de pil een klein oranje stikkertje "MVP", zodat developers altijd zien dat dit de
       MVP-variant is en niet de volledige versie. -->
  <div class="flow-nav">
    <a class="flow-link" href="/multi-hotel-trip/flow" title="Terug naar de post-bookingflow">‹ flow</a>
    <span class="flow-mvp" title="MVP-variant">MVP</span>
  </div>
</template>

<style scoped>
.flow-nav { position: absolute; top: 6px; left: 8px; z-index: 700; display: flex; align-items: center; gap: 6px; }
.flow-link {
  display: inline-block; padding: 3px 9px 3px 7px; border-radius: 999px;
  background: rgba(20, 20, 20, 0.72); color: #fff; font-family: var(--font-body);
  font-size: 11px; line-height: 1.5; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none;
  backdrop-filter: blur(4px); transition: background var(--transition-fast);
}
.flow-link:hover { background: var(--color-primary); }
.flow-mvp {
  display: inline-block; padding: 3px 8px; border-radius: 999px; background: var(--color-primary); color: #fff;
  font-family: var(--font-body); font-size: 11px; line-height: 1.5; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
</style>
