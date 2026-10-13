<script setup lang="ts">
// E-mailontwerpen (react-email, bron in email-designs/) — gehost onder de prototype-URL.
// De lijst komt uit app/data/mht-emails.json en de HTML uit public/emails/, beide
// gegenereerd met `npm run export` in email-designs/.
import emails from '~/data/mht-emails.json'

const designs = emails.filter(e => e.section === 'designs')
const inspiration = emails.filter(e => e.section === 'inspiration')

useHead({ title: 'E-maildesigns — ViaLuxury' })
</script>

<template>
  <div class="em">
    <div class="em__wrap">
      <NuxtLink class="em__back" to="/">‹ Startscherm</NuxtLink>
      <h1 class="em__title">E-maildesigns</h1>
      <p class="em__lead">Ontwerpen voor de ViaLuxury-mails. Klik op een mail voor de preview (licht/donker, desktop/mobiel) en de HTML.</p>

      <h2 class="em__h2">Ontwerpen</h2>
      <ul class="em__list">
        <li v-for="e in designs" :key="e.slug" class="em__item">
          <NuxtLink class="em__link" :to="`/multi-hotel-trip/emails/${e.slug}`">{{ e.title }}</NuxtLink>
          <p class="em__desc">{{ e.description }}</p>
        </li>
      </ul>

      <h2 class="em__h2">Inspiratie</h2>
      <ul class="em__list">
        <li v-for="e in inspiration" :key="e.slug" class="em__item">
          <NuxtLink class="em__link" :to="`/multi-hotel-trip/emails/${e.slug}`">{{ e.title }}</NuxtLink>
          <p class="em__desc">{{ e.description }}</p>
        </li>
      </ul>

      <h2 class="em__h2">Overig</h2>
      <ul class="em__list">
        <li class="em__item">
          <a class="em__link" href="/emails/mail-overzicht/index.html" target="_blank" rel="noopener">Mail-overzicht (statische templates)</a>
          <p class="em__desc">De bestaande mailtemplates als statisch overzicht, opent in een nieuw tabblad.</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.em { min-height: 100vh; background: #f5f5f5; padding: 40px 20px 64px; font-family: var(--font-body); color: var(--color-text-primary); }
.em__wrap { max-width: 720px; margin: 0 auto; }
.em__back { display: inline-block; margin-bottom: 20px; color: var(--color-text-secondary); text-decoration: none; font-size: 14px; }
.em__back:hover { color: var(--color-primary); }
.em__title { margin: 0 0 8px; font-family: var(--font-heading); font-size: 32px; font-weight: 700; }
.em__lead { margin: 0 0 28px; font-size: 15px; color: var(--color-text-secondary); }
.em__h2 { margin: 28px 0 12px; font-family: var(--font-heading); font-size: 20px; font-weight: 700; }
.em__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.em__item { padding: 16px 20px; background: #fff; border: 1px solid var(--color-border); border-radius: var(--radius-md); }
.em__link { font-size: 16px; font-weight: 600; color: var(--color-primary); text-decoration: none; }
.em__link:hover { text-decoration: underline; }
.em__desc { margin: 4px 0 0; font-size: 14px; color: var(--color-text-secondary); }
</style>
