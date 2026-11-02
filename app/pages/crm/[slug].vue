<script setup lang="ts">
// Preview van een CRM-conceptmail (alleen desktop + light mode): onderwerp en preheader
// zoals in de inbox, daaronder de geëxporteerde HTML (public/emails/<slug>.html).
// Het winkelmandje heeft twee varianten van de beschikbaarheidsregel.
import emails from '~/data/crm-emails.json'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const entry = computed(() => emails.find(e => e.slug === slug.value))
if (!entry.value) throw createError({ statusCode: 404, statusMessage: 'E-mail niet gevonden' })

const cartVariants = [
  { slug: 'crm-winkelmandje', label: 'Bijna vol' },
  { slug: 'crm-winkelmandje-beschikbaar', label: 'Beschikbaar' },
]
const isCart = computed(() => slug.value.startsWith('crm-winkelmandje'))

useHead({ title: `${entry.value?.title ?? 'E-mail'} — ViaLuxury CRM` })
</script>

<template>
  <div class="crm">
    <header class="crm__bar">
      <div class="crm__left">
        <a class="crm__back" href="/">‹ Startscherm</a>
        <h1 class="crm__title">{{ entry?.title }}</h1>
      </div>
      <div v-if="isCart" class="crm__group" role="group" aria-label="Beschikbaarheid">
        <NuxtLink
          v-for="v in cartVariants"
          :key="v.slug"
          :to="`/crm/${v.slug}`"
          class="crm__btn"
          :class="{ 'crm__btn--on': v.slug === slug }"
        >{{ v.label }}</NuxtLink>
      </div>
    </header>
    <div class="crm__inbox">
      <p class="crm__subject">{{ entry?.subject }}</p>
      <p class="crm__preheader">{{ entry?.preheader }}</p>
      <p class="crm__desc">{{ entry?.description }}</p>
    </div>
    <div class="crm__stage">
      <iframe :key="slug" class="crm__frame" :src="`/emails/${slug}.html`" :title="entry?.title" />
    </div>
  </div>
</template>

<style scoped>
.crm { min-height: 100vh; background: #f5f5f5; font-family: var(--font-body); color: var(--color-text-primary); }
.crm__bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 24px; padding: 16px 24px; background: #fff; border-bottom: 1px solid var(--color-border); }
.crm__left { display: flex; align-items: center; gap: 16px; min-width: 0; }
.crm__back { color: var(--color-text-secondary); text-decoration: none; font-size: 13px; }
.crm__back:hover { color: var(--color-primary); }
.crm__title { margin: 0; font-family: var(--font-heading); font-size: 20px; font-weight: 700; }
.crm__group { display: inline-flex; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; }
.crm__btn { display: inline-flex; align-items: center; height: 36px; padding: 0 14px; background: #fff; color: var(--color-text-primary); font-size: 14px; font-weight: 600; text-decoration: none; }
.crm__btn + .crm__btn { border-left: 1.5px solid var(--color-border); }
.crm__btn--on { background: var(--color-text-primary); color: #fff; }
.crm__inbox { width: 700px; max-width: calc(100% - 48px); margin: 20px auto 0; padding: 14px 18px; background: #fff; border: 1px solid var(--color-border); border-radius: 8px; }
.crm__subject { margin: 0; font-size: 15px; font-weight: 700; }
.crm__preheader { margin: 2px 0 0; font-size: 14px; color: var(--color-text-secondary); }
.crm__desc { margin: 10px 0 0; padding-top: 10px; border-top: 1px solid var(--color-border); font-size: 13px; color: var(--color-text-secondary); }
.crm__stage { display: flex; justify-content: center; padding: 16px 24px 48px; }
.crm__frame { width: 700px; max-width: 100%; height: calc(100vh - 220px); min-height: 640px; border: 1px solid var(--color-border); border-radius: 8px; background: #fff; }
</style>
