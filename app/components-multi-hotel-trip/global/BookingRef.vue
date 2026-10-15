<script setup lang="ts">
// Boekingsnummer, overal in dezelfde vorm als in de pre-travelmail: op een beige vlakje,
// label + vet nummer. Gebruikt op de bevestigingspagina, de tipspagina en in Mijn ViaLuxury.
defineProps<{ value: string }>()
</script>

<template>
  <span class="bref"><span class="bref__label">Boekingsnummer</span><b class="bref__num">{{ value }}</b></span>
</template>

<style scoped>
.bref { display: inline-flex; align-items: baseline; gap: 8px; padding: 8px 12px; border-radius: 8px; background: #f4f1ec; font-family: var(--font-body); font-size: 14px; line-height: 1.3; color: var(--color-text-primary, #141414); white-space: nowrap; }
.bref__label { color: var(--color-text-secondary, #555); }
.bref__num { font-weight: 700; letter-spacing: 0.04em; }
</style>
