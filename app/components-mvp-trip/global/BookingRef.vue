<script setup lang="ts">
// ViaLuxury Ordernummer, overal in dezelfde vorm als in de pre-travelmail: op een beige vlakje,
// label + vet nummer. Gebruikt op de bevestigingspagina, de tipspagina en in Mijn ViaLuxury.
// Met `small` en een eigen `label` ook voor het hotelboekingsnummer onder de inclusies per hotel.
withDefaults(defineProps<{ value: string; label?: string; small?: boolean }>(), { label: 'ViaLuxury Ordernummer', small: false })
</script>

<template>
  <span class="bref" :class="{ 'bref--sm': small }"><span class="bref__label">{{ label }}</span><b class="bref__num">{{ value }}</b></span>
</template>

<style scoped>
.bref { display: inline-flex; align-items: baseline; gap: 8px; padding: 8px 12px; border-radius: 8px; background: #f4f1ec; font-family: var(--font-body); font-size: 15px; line-height: 1.3; color: var(--color-text-primary, #141414); white-space: nowrap; }
.bref__label { color: var(--color-text-secondary, #555); }
.bref__num { font-weight: 700; letter-spacing: 0.04em; }
/* Kleine variant (hotelboekingsnummer): zelfde letter als de lopende tekst, alleen minder ruimte eromheen; past zich aan de inhoud aan. */
.bref--sm { padding: 5px 14px 5px 10px; gap: 6px; border-radius: 6px; }
</style>
