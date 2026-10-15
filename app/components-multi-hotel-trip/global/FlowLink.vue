<template>
  <!-- Prototype-navigatie: klein linkje linksboven op elk scherm en elke mail van de
       post-bookingflow, terug naar het flowschema (niet naar het startscherm). -->
  <NuxtLink class="flow-link" to="/multi-hotel-trip/flow" title="Terug naar de post-bookingflow">‹ flow</NuxtLink>
</template>

<style scoped>
.flow-link {
  position: absolute; top: 6px; left: 8px; z-index: 700;
  display: inline-block; padding: 3px 9px 3px 7px; border-radius: 999px;
  background: rgba(20, 20, 20, 0.72); color: #fff; font-family: var(--font-body);
  font-size: 11px; line-height: 1.5; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none;
  backdrop-filter: blur(4px); transition: background var(--transition-fast);
}
.flow-link:hover { background: var(--color-primary); }
</style>
