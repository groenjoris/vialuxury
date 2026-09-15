<template>
  <!-- Multi Hotel Trip — de Vakanties-zoekpagina is dezelfde pagina als
       /mht-jesse/search (search.vue leest aan `route.path` af dat het
       de landing is: hero, quick filters, geen zijfilter). Eigen route-record
       in plaats van een alias: vue-router ziet pad ↔ alias als dezelfde
       locatie en breekt navigatie tussen de twee af (NAVIGATION_DUPLICATED),
       waardoor "Vind deals" zonder bestemming Vakanties nooit op de gewone
       resultatenpagina uitkwam. -->
  <MhtJesseSearchResultsPage />
</template>

<script setup lang="ts">
import MhtJesseSearchResultsPage from './search.vue'
</script>
