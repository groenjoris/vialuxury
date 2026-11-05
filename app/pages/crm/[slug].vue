<script setup lang="ts">
// Preview van een CRM-conceptmail (alleen desktop + light mode), in één frame zoals de
// ontvanger hem ziet: bovenaan afzender, onderwerp en preheader, daaronder de
// geëxporteerde HTML (public/emails/<slug>.html).
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
    <div class="crm__stage">
      <div class="crm__mail">
        <div class="crm__inbox">
          <span class="crm__avatar" aria-hidden="true">V</span>
          <div class="crm__meta">
            <p class="crm__from"><strong>ViaLuxury</strong> <span>&lt;info@vialuxury.nl&gt;</span><span class="crm__time">10:24</span></p>
            <p class="crm__subject">{{ entry?.subject }}</p>
            <p class="crm__preheader">{{ entry?.preheader }}</p>
          </div>
        </div>
        <iframe :key="slug" class="crm__frame" :src="`/emails/${slug}.html`" :title="entry?.title" />
      </div>
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
.crm__stage { display: flex; justify-content: center; padding: 20px 24px 48px; }
.crm__mail { width: 700px; max-width: 100%; background: #fff; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; }
.crm__inbox { display: flex; gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--color-border); }
.crm__avatar { flex-shrink: 0; width: 40px; height: 40px; border-radius: 50%; background: #141414; color: #fff; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.crm__meta { min-width: 0; flex: 1; }
.crm__from { display: flex; gap: 6px; margin: 0; font-size: 14px; }
.crm__from span { color: var(--color-text-secondary); }
.crm__from .crm__time { margin-left: auto; font-size: 13px; }
.crm__subject { margin: 4px 0 0; font-size: 17px; font-weight: 700; }
.crm__preheader { margin: 2px 0 0; font-size: 14px; color: var(--color-text-secondary); }
.crm__frame { display: block; width: 100%; height: calc(100vh - 200px); min-height: 640px; border: 0; }
</style>
