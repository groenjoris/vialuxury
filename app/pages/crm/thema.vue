<script setup lang="ts">
// Bevestigingspagina achter de themaknoppen van de CRM-themamail
// (/crm/thema?keuze=<id>): echoot het gekozen thema, verder niets te doen.
const route = useRoute()
const themes: Record<string, string> = {
  'wellness': 'Wellness',
  'aan-zee': 'Aan zee',
  'natuur': 'In de natuur',
  'culinair': 'Culinair genieten',
  'kasteel': 'Kasteelhotels',
  'romantisch': 'Romantisch',
}
const theme = computed(() => themes[String(route.query.keuze)])
useHead({ title: 'Bedankt — ViaLuxury' })
</script>

<template>
  <main class="nv">
    <img src="/images/logo-vialuxury.svg" alt="ViaLuxury" class="nv__logo" />
    <h1 class="nv__title">{{ theme ? `Genoteerd: ${theme.toLowerCase()}` : 'Genoteerd' }}</h1>
    <p class="nv__text">Voortaan sturen we je de mooiste aanbiedingen{{ theme ? ` voor ${theme.toLowerCase()}` : '' }}.</p>
    <NuxtLink class="nv__link" to="/first-release/home">Naar ViaLuxury</NuxtLink>
  </main>
</template>

<style scoped>
.nv { max-width: 520px; margin: 0 auto; padding: 96px 24px; text-align: center; font-family: var(--font-body); color: var(--color-text-primary); }
.nv__logo { width: 160px; margin-bottom: 48px; }
.nv__title { margin: 0; font-family: var(--font-heading); font-size: 34px; font-weight: 600; }
.nv__text { margin: 12px 0 32px; font-size: 16px; line-height: 1.5; color: var(--color-text-secondary); }
.nv__link { color: var(--color-text-primary); font-weight: 600; text-decoration: underline; }
</style>
