<script setup lang="ts">
// Bevestigingspagina achter de vier knoppen van de CRM-nagenietmail
// (/crm/volgende-vakantie?keuze=<keuze>): echoot de keuze, verder niets te doen.
const route = useRoute()
const answers: Record<string, { title: string; text: string }> = {
  'weet-ik-nog-niet': { title: 'Helemaal goed', text: 'We sturen je af en toe iets moois, zonder haast.' },
  'zomer': { title: 'Genoteerd: zomer', text: 'In het voorjaar sturen we je de mooiste zomerarrangementen.' },
  'nazomer': { title: 'Genoteerd: nazomer', text: 'Begin zomer sturen we je de mooiste arrangementen voor september en oktober.' },
  'zelfde-periode': { title: 'Genoteerd: weer eind oktober', text: 'Na de zomer sturen we je de mooiste arrangementen voor eind oktober.' },
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
