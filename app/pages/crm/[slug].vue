<script setup lang="ts">
// Preview van een CRM-conceptmail (alleen desktop + light mode), in één frame zoals de
// ontvanger hem ziet: bovenaan afzender, onderwerp en preheader, daaronder de
// geëxporteerde HTML (public/emails/<slug>.html).
// De themamail heeft twee varianten; links van de mail staan alle mails als tekstlinkjes.
import emails from '~/data/crm-emails.json'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const entry = computed(() => emails.find(e => e.slug === slug.value))
if (!entry.value) throw createError({ statusCode: 404, statusMessage: 'E-mail niet gevonden' })

// Mails met varianten: schakelaar rechtsboven.
const variantGroups = [
  [
    { slug: 'crm-thema-stedentrips', label: 'Knoppen' },
    { slug: 'crm-thema-stedentrips-plaatjes', label: 'Plaatjes' },
  ],
]
const variants = computed(() => variantGroups.find(g => g.some(v => v.slug === slug.value)))

// Alle mails als tekstlinkjes links van de mail, in de volgorde van het startscherm
// (varianten staan er niet los in; de actieve mail blijft ook bij een variant gemarkeerd).
const navOrder = ['crm-jaar-geleden', 'crm-winkelmandje', 'crm-winkelmandje-2-dagen', 'crm-thema-stedentrips', 'crm-review', 'crm-nagenieten']
const nav = navOrder.map(s => emails.find(e => e.slug === s)).filter((e): e is (typeof emails)[number] => !!e)
const activeSlug = computed(() => variants.value?.[0]?.slug ?? slug.value)

useHead({ title: `${entry.value?.title ?? 'E-mail'} — ViaLuxury CRM` })
</script>

<template>
  <div class="crm">
    <header class="crm__bar">
      <div class="crm__left">
        <a class="crm__back" href="/">‹ Startscherm</a>
        <h1 class="crm__title">{{ entry?.title }}</h1>
      </div>
      <div v-if="variants" class="crm__group" role="group" aria-label="Variant">
        <NuxtLink
          v-for="v in variants"
          :key="v.slug"
          :to="`/crm/${v.slug}`"
          class="crm__btn"
          :class="{ 'crm__btn--on': v.slug === slug }"
        >{{ v.label }}</NuxtLink>
      </div>
    </header>
    <div class="crm__stage">
      <nav class="crm__nav" aria-label="CRM-mails">
        <NuxtLink
          v-for="e in nav"
          :key="e.slug"
          :to="`/crm/${e.slug}`"
          class="crm__nav-link"
          :class="{ 'crm__nav-link--on': e.slug === activeSlug }"
        >{{ e.title }}</NuxtLink>
      </nav>
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
.crm__stage { display: flex; justify-content: center; align-items: flex-start; gap: 24px; padding: 20px 24px 48px; }
/* Even breed als de ruimte rechts van de mail, zodat de mail in het midden blijft. */
.crm__nav { position: sticky; top: 20px; display: flex; flex-direction: column; gap: 8px; width: 200px; flex-shrink: 0; margin-right: 0; }
.crm__stage::after { content: ''; width: 200px; flex-shrink: 1; }
.crm__nav-link { color: var(--color-text-secondary); text-decoration: none; font-size: 13px; line-height: 1.35; }
.crm__nav-link:hover { color: var(--color-primary); }
.crm__nav-link--on { color: var(--color-text-primary); font-weight: 700; }
@media (max-width: 900px) { .crm__nav, .crm__stage::after { display: none; } }
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
