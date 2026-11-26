<script setup lang="ts">
// Preview van de commerciële mails (nieuwsbrieven en acties; alleen desktop + light mode), dezelfde
// opzet als de CRM-preview (/crm/<slug>): één frame zoals de ontvanger de mail ziet (afzender,
// onderwerp, preheader, daaronder de geëxporteerde HTML uit public/emails/<slug>.html) en links
// een paneel met alle mails (alleen mails die er al zijn, geen lege plekken). Mails komen uit de registry-sectie "commercieel" (email-designs/lib/registry.ts); de
// export schrijft de lijst naar app/data/commercieel-emails.json, in de volgorde van de registry.
// /commercieel opent de eerste mail; zolang er nog geen mails zijn, een lege staat.
import data from '~/data/commercieel-emails.json'

type Entry = { slug: string; title: string; description: string; subject?: string; preheader?: string; variantOf?: string; variantLabel?: string }
const emails = data as Entry[]

const route = useRoute()
// Hoofdmails (geen varianten), in de volgorde van de registry
const mains = emails.filter(e => !e.variantOf)
const slug = computed(() => String(route.params.slug || mains[0]?.slug || ''))
const entry = computed(() => emails.find(e => e.slug === slug.value))
if (route.params.slug && !entry.value) throw createError({ statusCode: 404, statusMessage: 'E-mail niet gevonden' })

// Paneel: alleen de mails die er zijn. "Naam (toelichting)" wordt gesplitst in naam en toelichting.
const nav = Array.from({ length: mains.length }, (_, i) => {
  const e = mains[i]
  if (!e) return { slug: '', label: `Voorbeeld ${i + 1}`, when: 'volgt' }
  const m = e.title.match(/^(.*?)\s*\((.*)\)$/)
  return { slug: e.slug, label: m ? m[1] : e.title, when: m ? m[2] : '' }
})

// Varianten van één mail (registry: variantOf) als schakelaar in de kop, rechts van de naam
const baseSlug = computed(() => entry.value?.variantOf ?? slug.value)
// Een variantLabel met " / " ("Met prijs / Zonder titel") staat voor meerdere, los te combineren
// schakelaars: per deel één schakelaar; een knop gaat naar de variant die alleen op dat deel verschilt.
const parts = (e: Entry) => (e.variantLabel ?? e.slug).split(' / ')
const variantGroups = computed(() => {
  const list = emails.filter(e => e.slug === baseSlug.value || e.variantOf === baseSlug.value)
  if (list.length < 2 || !entry.value) return []
  const cur = parts(entry.value)
  return cur.map((_, axis) => {
    const labels = [...new Set(list.map(e => parts(e)[axis] ?? ''))]
    return labels.map((label) => {
      const want = cur.map((p, i) => (i === axis ? label : p)).join(' / ')
      const target = list.find(e => parts(e).join(' / ') === want) ?? list.find(e => parts(e)[axis] === label)
      return { slug: target?.slug ?? slug.value, label, on: cur[axis] === label }
    })
  }).filter(g => g.length > 1)
})

// Pijltjes omhoog/omlaag: vorige/volgende mail
function onKey(ev: KeyboardEvent) {
  if (ev.key !== 'ArrowDown' && ev.key !== 'ArrowUp') return
  const live = nav.filter(e => e.slug)
  const i = live.findIndex(e => e.slug === baseSlug.value)
  const next = live[i + (ev.key === 'ArrowDown' ? 1 : -1)]
  if (!next) return
  ev.preventDefault()
  navigateTo(`/commercieel/${next.slug}`)
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

// Op een telefoon (smal scherm) toont de preview vanzelf de mobiele versie van de mail (<slug>-mobiel)
// en staat boven de mail alleen een balk met de knop "Menu" (naar /commercieel/menu: alle mails en
// hun varianten); het paneel links en de schakelaars in de kop zijn daar verborgen.
const isPhone = ref(false)
onMounted(() => {
  const mq = window.matchMedia('(max-width: 700px)')
  const set = () => { isPhone.value = mq.matches }
  set()
  mq.addEventListener('change', set)
  onBeforeUnmount(() => mq.removeEventListener('change', set))
})
const frameSlug = computed(() => {
  if (!isPhone.value || slug.value.endsWith('-mobiel')) return slug.value
  const mobile = `${slug.value}-mobiel`
  return emails.some(e => e.slug === mobile) ? mobile : slug.value
})
// Op een telefoon is het frame zo hoog als de mail, zodat de pagina zelf scrolt (geen scrollvak in een
// scrollende pagina); op desktop houdt het frame zijn vaste hoogte.
const frameHeight = ref(0)
function onFrameLoad(ev: Event) {
  const doc = (ev.target as HTMLIFrameElement).contentDocument
  frameHeight.value = isPhone.value && doc ? doc.documentElement.scrollHeight : 0
  // Afbeeldingen die later laden maken de mail nog hoger
  if (isPhone.value && doc) setTimeout(() => { frameHeight.value = doc.documentElement.scrollHeight }, 800)
}
watch(isPhone, (phone) => { if (!phone) frameHeight.value = 0 })
// Naam en gekozen variant voor in de mobiele balk ("Content" + "Titel op foto")
const phoneLabel = computed(() => nav.find(e => e.slug === baseSlug.value)?.label ?? entry.value?.title ?? 'Commerciële mails')
const phoneVariant = computed(() => (entry.value?.variantLabel ?? '').split(' / ').filter(p => p && p !== 'Desktop' && p !== 'Mobiel').join(' · '))

useHead({ title: `${entry.value?.title ?? 'Commerciële mails'} — ViaLuxury` })
</script>

<template>
  <div class="crm">
    <!-- Mobiel: één balk met de knop naar het menu en de naam van de mail met de gekozen variant -->
    <header class="crm__phonebar">
      <NuxtLink class="crm__menu" :to="{ path: '/commercieel/menu', query: { from: slug } }">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
        Menu
      </NuxtLink>
      <div class="crm__phone-title">
        <span class="crm__phone-name">{{ phoneLabel }}</span>
        <span v-if="phoneVariant" class="crm__phone-variant">{{ phoneVariant }}</span>
      </div>
    </header>
    <header class="crm__bar">
      <div class="crm__left">
        <a class="crm__back" href="/">‹ Startscherm</a>
        <h1 class="crm__title">{{ entry?.title ?? 'Commerciële mails' }}</h1>
        <div v-for="(variants, gi) in variantGroups" :key="gi" class="crm__variants" role="group" aria-label="Variant">
          <NuxtLink
            v-for="v in variants"
            :key="v.label"
            :to="`/commercieel/${v.slug}`"
            class="crm__variant"
            :class="{ 'crm__variant--on': v.on }"
            :aria-current="v.on ? 'true' : undefined"
          >{{ v.label }}</NuxtLink>
        </div>
      </div>
    </header>
    <div class="crm__stage">
      <nav class="crm__nav" aria-label="Commerciële mails">
        <p class="crm__nav-title">Commerciële mails</p>
        <template v-for="(e, i) in nav" :key="e.slug || i">
          <NuxtLink
            v-if="e.slug"
            :to="`/commercieel/${e.slug}`"
            class="crm__nav-link"
            :class="{ 'crm__nav-link--on': e.slug === baseSlug }"
            :aria-current="e.slug === baseSlug ? 'page' : undefined"
          >
            <span class="crm__nav-label">{{ e.label }}</span>
            <span v-if="e.when" class="crm__nav-when">{{ e.when }}</span>
          </NuxtLink>
          <span v-else class="crm__nav-link crm__nav-link--todo">
            <span class="crm__nav-label">{{ e.label }}</span>
            <span class="crm__nav-when">{{ e.when }}</span>
          </span>
        </template>
        <p v-if="mains.length > 1" class="crm__nav-hint">↑ ↓ om te bladeren</p>
      </nav>
      <div class="crm__center">
        <div class="crm__mail" :class="{ 'crm__mail--mobile': frameSlug.endsWith('-mobiel') }">
          <template v-if="entry">
            <div class="crm__inbox">
              <span class="crm__avatar" aria-hidden="true">V</span>
              <div class="crm__meta">
                <p class="crm__from"><strong>ViaLuxury</strong> <span>&lt;info@vialuxury.nl&gt;</span><span class="crm__time">10:24</span></p>
                <p class="crm__subject">{{ entry.subject }}</p>
                <p class="crm__preheader">{{ entry.preheader }}</p>
              </div>
            </div>
            <iframe :key="frameSlug" class="crm__frame" :src="`/emails/${frameSlug}.html`" :title="entry.title" :style="frameHeight ? { height: `${frameHeight}px` } : undefined" @load="onFrameLoad" />
          </template>
          <div v-else class="crm__empty">
            <p class="crm__empty-title">Nog geen voorbeelden</p>
            <p class="crm__empty-text">Hier komen tien commerciële mails. De eerste verschijnt zodra hij is uitgewerkt.</p>
          </div>
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
/* Variantschakelaar rechts van de naam: twee segmenten, het actieve zwart */
.crm__variants { display: inline-flex; border: 1px solid var(--color-border); border-radius: 6px; overflow: hidden; background: #fff; }
.crm__variant { padding: 6px 12px; font-size: 13px; line-height: 1.3; color: var(--color-text-secondary); text-decoration: none; }
.crm__variant + .crm__variant { border-left: 1px solid var(--color-border); }
.crm__variant:hover { color: var(--color-text-primary); }
.crm__variant--on, .crm__variant--on:hover { background: #141414; color: #fff; }
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
/* Mobiele versie (slug eindigt op -mobiel): het frame is zo breed als een telefoon */
.crm__mail--mobile { width: 390px; border-radius: 24px; }
.crm__inbox { display: flex; gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--color-border); }
.crm__avatar { flex-shrink: 0; width: 40px; height: 40px; border-radius: 50%; background: #141414; color: #fff; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.crm__meta { min-width: 0; flex: 1; }
.crm__from { display: flex; gap: 6px; margin: 0; font-size: 14px; }
.crm__from span { color: var(--color-text-secondary); }
.crm__from .crm__time { margin-left: auto; font-size: 13px; }
.crm__subject { margin: 4px 0 0; font-size: 17px; font-weight: 700; }
.crm__preheader { margin: 2px 0 0; font-size: 14px; color: var(--color-text-secondary); }
.crm__frame { display: block; width: 100%; height: calc(100vh - 200px); min-height: 640px; border: 0; }
/* Plekken die nog gebriefd moeten worden: grijs, niet klikbaar */
.crm__nav-link--todo { cursor: default; }
.crm__nav-link--todo:hover { background: none; }
.crm__nav-link--todo .crm__nav-label { color: var(--color-text-muted); }
.crm__empty { padding: 96px 32px; text-align: center; }
.crm__empty-title { margin: 0; font-family: var(--font-heading); font-size: 24px; font-weight: 700; }
.crm__empty-text { margin: 8px 0 0; font-size: 15px; color: var(--color-text-secondary); }
/* Telefoon: alleen de balk met "Menu", de mail over het hele scherm */
.crm__phonebar { display: none; }
@media (max-width: 700px) {
  .crm__bar { display: none; }
  .crm__phonebar { position: sticky; top: 0; z-index: 2; display: flex; align-items: center; gap: 12px; padding: 8px 12px; background: #fff; border-bottom: 1px solid var(--color-border); }
  .crm__menu { display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0; min-height: 44px; padding: 0 14px; border: 1px solid var(--color-border); border-radius: 8px; font-size: 15px; font-weight: 700; color: var(--color-text-primary); text-decoration: none; }
  .crm__menu:active { background: var(--color-border-light); }
  .crm__phone-title { display: flex; flex-direction: column; min-width: 0; }
  .crm__phone-name { font-family: var(--font-heading); font-size: 17px; font-weight: 700; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .crm__phone-variant { font-size: 13px; line-height: 1.3; color: var(--color-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .crm__stage { padding: 0; }
  .crm__mail, .crm__mail--mobile { width: 100%; border: 0; border-radius: 0; }
  .crm__inbox { padding: 12px 16px; }
  .crm__subject { font-size: 16px; }
  .crm__frame { height: calc(100vh - 61px); height: calc(100dvh - 61px); min-height: 0; }
}
</style>
