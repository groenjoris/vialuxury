<script setup lang="ts">
// Bevestigingspagina achter de zes knoppen van de CRM-nagenietmail
// (/crm/volgende-vakantie?keuze=<keuze>): echoot de keuze, verder niets te doen.
const route = useRoute()
const answers: Record<string, { title: string; text: string }> = {
  'binnen-1-maand': { title: 'Genoteerd: binnen een maand', text: 'We sturen je deze week de mooiste arrangementen waar nog plek is.' },
  '1-3-maanden': { title: 'Genoteerd: over 1 tot 3 maanden', text: 'Over een paar weken sturen we je de mooiste arrangementen voor die periode.' },
  '3-6-maanden': { title: 'Genoteerd: over 3 tot 6 maanden', text: 'Over twee maanden sturen we je de mooiste arrangementen voor die periode.' },
  '6-12-maanden': { title: 'Genoteerd: over 6 tot 12 maanden', text: 'Over een half jaar sturen we je de mooiste arrangementen voor die periode.' },
  'over-een-jaar': { title: 'Genoteerd: over een jaar of later', text: 'Tot die tijd sturen we je af en toe iets moois, zonder haast.' },
  'weet-ik-nog-niet': { title: 'Helemaal goed', text: 'We sturen je af en toe iets moois, zonder haast.' },
}
const answer = computed(() => answers[String(route.query.keuze)] ?? answers['weet-ik-nog-niet'])
useHead({ title: 'Bedankt — ViaLuxury' })
</script>

<template>
  <main class="nv">
    <img src="/images/logo-vialuxury.svg" alt="ViaLuxury" class="nv__logo" />
    <h1 class="nv__title">{{ answer.title }}</h1>
    <p class="nv__text">{{ answer.text }}</p>
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
