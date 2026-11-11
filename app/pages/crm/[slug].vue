<script setup lang="ts">
// Preview van een CRM-conceptmail (alleen desktop + light mode), in één frame zoals de
// ontvanger hem ziet: bovenaan afzender, onderwerp en preheader, daaronder de
// geëxporteerde HTML (public/emails/<slug>.html).
// Links, tegen de rand van het venster, staat een paneel met alle mails: naam en daaronder
// het moment van versturen. Pijltjes omhoog/omlaag bladeren naar de vorige/volgende mail.
import emails from '~/data/crm-emails.json'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const entry = computed(() => emails.find(e => e.slug === slug.value))
if (!entry.value) throw createError({ statusCode: 404, statusMessage: 'E-mail niet gevonden' })

// Alle mails in het paneel links, in de volgorde van het startscherm. De titel
// "Winkelmandje (2 uur na verlaten)" wordt gesplitst in naam en moment.
const navOrder = ['crm-jaar-geleden', 'crm-winkelmandje', 'crm-winkelmandje-2-dagen', 'crm-thema-stedentrips', 'crm-zoekopdracht', 'crm-verlanglijst', 'crm-review', 'crm-terugkomactie', 'crm-terugkomactie-herinnering', 'crm-nagenieten']
const nav = navOrder
  .map(s => emails.find(e => e.slug === s))
  .filter((e): e is (typeof emails)[number] => !!e)
  .map((e) => {
    const m = e.title.match(/^(.*?)\s*\((.*)\)$/)
    return { slug: e.slug, label: m ? m[1] : e.title, when: m ? m[2] : '' }
  })

// Pijltjes omhoog/omlaag: vorige/volgende mail
function onKey(ev: KeyboardEvent) {
  if (ev.key !== 'ArrowDown' && ev.key !== 'ArrowUp') return
  const i = nav.findIndex(e => e.slug === slug.value)
  const next = nav[i + (ev.key === 'ArrowDown' ? 1 : -1)]
  if (!next) return
  ev.preventDefault()
  navigateTo(`/crm/${next.slug}`)
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

useHead({ title: `${entry.value?.title ?? 'E-mail'} — ViaLuxury CRM` })
</script>

<template>
  <div class="crm">
    <header class="crm__bar">
      <div class="crm__left">
        <a class="crm__back" href="/">‹ Startscherm</a>
        <h1 class="crm__title">{{ entry?.title }}</h1>
      </div>
    </header>
    <div class="crm__stage">
      <nav class="crm__nav" aria-label="CRM-mails">
        <p class="crm__nav-title">CRM-mails</p>
        <NuxtLink
          v-for="e in nav"
          :key="e.slug"
          :to="`/crm/${e.slug}`"
          class="crm__nav-link"
          :class="{ 'crm__nav-link--on': e.slug === slug }"
          :aria-current="e.slug === slug ? 'page' : undefined"
        >
          <span class="crm__nav-label">{{ e.label }}</span>
          <span v-if="e.when" class="crm__nav-when">{{ e.when }}</span>
        </NuxtLink>
        <p class="crm__nav-hint">↑ ↓ om te bladeren</p>
      </nav>
      <div class="crm__center">
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
  </div>
</template>

<style scoped>
.crm { min-height: 100vh; background: #f5f5f5; font-family: var(--font-body); color: var(--color-text-primary); }
.crm__bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 24px; padding: 16px 24px; background: #fff; border-bottom: 1px solid var(--color-border); }
.crm__left { display: flex; align-items: center; gap: 16px; min-width: 0; }
.crm__back { color: var(--color-text-secondary); text-decoration: none; font-size: 13px; }
.crm__back:hover { color: var(--color-primary); }
.crm__title { margin: 0; font-family: var(--font-heading); font-size: 20px; font-weight: 700; }
.crm__stage { display: flex; align-items: flex-start; gap: 24px; padding: 20px 24px 48px; }
/* Paneel links tegen de rand; de mail staat gecentreerd in de ruimte ernaast. */
.crm__nav { position: sticky; top: 20px; display: flex; flex-direction: column; gap: 2px; width: 264px; flex-shrink: 0; padding: 12px 8px; background: #fff; border: 1px solid var(--color-border); border-radius: 8px; }
.crm__nav-title { margin: 0 0 6px; padding: 0 12px; font-size: 12px; font-weight: 700; color: var(--color-text-secondary); }
.crm__nav-link { display: flex; flex-direction: column; gap: 1px; padding: 8px 12px; border-radius: 6px; text-decoration: none; text-align: left; }
.crm__nav-link:hover { background: var(--color-border-light); }
.crm__nav-label { font-size: 15px; line-height: 1.3; color: var(--color-text-primary); }
.crm__nav-when { font-size: 13px; line-height: 1.3; color: var(--color-text-secondary); }
.crm__nav-link--on, .crm__nav-link--on:hover { background: #F4F1EC; }
.crm__nav-link--on .crm__nav-label { font-weight: 700; }
.crm__nav-hint { margin: 8px 0 0; padding: 0 12px; font-size: 12px; color: var(--color-text-secondary); }
.crm__center { flex: 1; min-width: 0; display: flex; justify-content: center; }
@media (max-width: 900px) { .crm__nav { display: none; } }
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
