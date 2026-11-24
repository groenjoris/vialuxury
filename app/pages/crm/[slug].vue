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

// Alle mails in het paneel links, in de volgorde van de klantreis: winkelmandje, zoekopdracht
// (en favorieten), review, de repeat-bookingflow (nagenieten, terugkomactie, herinnering, een
// jaar geleden) en als laatste de themamail. De titel
// "Winkelmandje (2 uur na verlaten)" wordt gesplitst in naam en moment.
const navOrder = ['crm-winkelmandje', 'crm-winkelmandje-2-dagen', 'crm-zoekopdracht', 'crm-favorieten', 'crm-review', 'crm-nagenieten', 'crm-terugkomactie', 'crm-terugkomactie-herinnering', 'crm-jaar-geleden', 'crm-thema-stedentrips', 'crm-vaker-doen', 'crm-dealkaart-vaste-hoogte']
const nav = navOrder
  .map(s => emails.find(e => e.slug === s))
  .filter((e): e is (typeof emails)[number] => !!e)
  .map((e) => {
    const m = e.title.match(/^(.*?)\s*\((.*)\)$/)
    return { slug: e.slug, label: m ? m[1] : e.title, when: m ? m[2] : '' }
  })

// Varianten van één mail (registry: variantOf) staan niet in het paneel maar als schakelaar in de
// kop, rechts van de naam van de mail. In het paneel blijft de hoofdmail actief.
const baseSlug = computed(() => (entry.value as { variantOf?: string } | undefined)?.variantOf ?? slug.value)
const variantLabels: Record<string, string> = {
  'crm-winkelmandje': 'Naam bekend',
  'crm-winkelmandje-naam-onbekend': 'Naam onbekend',
  'crm-jaar-geleden': 'Social proof',
  'crm-jaar-geleden-persoonlijk': 'Persoonlijk',
  'crm-nagenieten': 'Bericht',
  'crm-nagenieten-titel': 'Titel',
  'crm-review': 'Knop',
  'crm-review-sterren': 'Lege ster',
  'crm-favorieten': 'Eén coupon',
  'crm-favorieten-twee-coupons': 'Twee coupons',
  'crm-winkelmandje-2-dagen': 'Naam bekend',
  'crm-winkelmandje-2-dagen-naam-onbekend': 'Naam onbekend',
}
// Een label met " / " ("Caveat / Footer 2", uit `variantLabel` in de registry) staat voor meerdere, los
// te combineren schakelaars: per deel één schakelaar; een knop gaat naar de variant die alleen op dat
// deel verschilt.
type CrmEntry = (typeof emails)[number] & { variantOf?: string; variantLabel?: string }
const parts = (e: CrmEntry) => (e.variantLabel ?? variantLabels[e.slug] ?? e.slug).split(' / ')
const variantGroups = computed(() => {
  const list = (emails as CrmEntry[]).filter(e => e.slug === baseSlug.value || e.variantOf === baseSlug.value)
  if (list.length < 2 || !entry.value) return []
  const cur = parts(entry.value as CrmEntry)
  return cur.map((_, axis) => {
    const labels = [...new Set(list.map(e => parts(e)[axis] ?? ''))]
    return labels.map((label) => {
      const want = cur.map((p, i) => (i === axis ? label : p)).join(' / ')
      const target = list.find(e => parts(e).join(' / ') === want) ?? list.find(e => parts(e)[axis] === label)
      return { slug: target?.slug ?? slug.value, label, on: cur[axis] === label }
    })
  }).filter(g => g.length > 1)
})

// Voorbeeldbladen (geen mail): zonder inboxframe, op hun eigen ontwerpmaat en in de breedte passend
// geschaald. Maten in px van de geëxporteerde HTML (zie email-designs/emails/<slug>.tsx).
const sheets: Record<string, { w: number; h: number }> = {
  'crm-dealkaart-vaste-hoogte': { w: 1782, h: 500 },
}
const sheet = computed(() => sheets[slug.value])
const sheetBox = ref<HTMLElement | null>(null)
const sheetScale = ref(1)
let sheetObserver: ResizeObserver | undefined
function fitSheet() {
  if (!sheet.value || !sheetBox.value) return
  sheetScale.value = Math.min(1, sheetBox.value.clientWidth / sheet.value.w)
}
onMounted(() => {
  sheetObserver = new ResizeObserver(fitSheet)
  watch(sheetBox, (el, old) => {
    if (old) sheetObserver?.unobserve(old)
    if (el) { sheetObserver?.observe(el); fitSheet() }
  }, { immediate: true })
})
onBeforeUnmount(() => sheetObserver?.disconnect())

// Voorbeeldmail "Dit moeten we vaker doen": na een klik op een footervariant ("Footer 1 … 5") scrolt
// de mail vanzelf naar de footer, na een klik op een plek van de gastquote naar de quote, zodat je
// de varianten kunt vergelijken zonder zelf te scrollen. Een andere mail begint weer bovenaan.
const isFooterVariant = (label: string) => label.startsWith('Footer')
const scrollTarget = useState<'' | 'footer' | 'quote'>('crm-scroll-target', () => '')
function pickVariant(label: string) {
  scrollTarget.value = isFooterVariant(label) ? 'footer' : baseSlug.value === 'crm-vaker-doen' ? 'quote' : ''
}
function onMailLoad(ev: Event) {
  const target = scrollTarget.value
  if (!target) return
  const win = (ev.target as HTMLIFrameElement).contentWindow
  if (!win) return
  const go = () => {
    const quote = target === 'quote' ? win.document.getElementById('gastquote') : null
    // zelf rekenen in plaats van scrollIntoView: die scrolt ook de pagina eromheen mee
    if (quote) win.scrollTo(0, quote.getBoundingClientRect().top + win.scrollY - (win.innerHeight - quote.offsetHeight) / 2)
    else win.scrollTo(0, win.document.documentElement.scrollHeight)
  }
  go()
  // afbeeldingen laden na: nog een paar keer, tot de hoogte vaststaat
  ;[150, 500, 1200].forEach(ms => setTimeout(go, ms))
}

// Pijltjes omhoog/omlaag: vorige/volgende mail
function onKey(ev: KeyboardEvent) {
  if (ev.key !== 'ArrowDown' && ev.key !== 'ArrowUp') return
  const i = nav.findIndex(e => e.slug === baseSlug.value)
  const next = nav[i + (ev.key === 'ArrowDown' ? 1 : -1)]
  if (!next) return
  ev.preventDefault()
  scrollTarget.value = ''
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
        <div v-for="(variants, gi) in variantGroups" :key="gi" class="crm__variants" role="group" aria-label="Variant">
          <NuxtLink
            v-for="v in variants"
            :key="v.label"
            :to="`/crm/${v.slug}`"
            @click="pickVariant(v.label)"
            class="crm__variant"
            :class="{ 'crm__variant--on': v.on }"
            :aria-current="v.on ? 'true' : undefined"
          >{{ v.label }}</NuxtLink>
        </div>
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
          @click="scrollTarget = ''"
          :class="{ 'crm__nav-link--on': e.slug === baseSlug }"
          :aria-current="e.slug === baseSlug ? 'page' : undefined"
        >
          <span class="crm__nav-label">{{ e.label }}</span>
          <span v-if="e.when" class="crm__nav-when">{{ e.when }}</span>
        </NuxtLink>
        <p class="crm__nav-hint">↑ ↓ om te bladeren</p>
      </nav>
      <div v-if="sheet" ref="sheetBox" class="crm__sheet" :style="{ height: `${sheet.h * sheetScale}px` }">
        <iframe
          :key="slug"
          class="crm__sheet-frame"
          :src="`/emails/${slug}.html`"
          :title="entry?.title"
          :style="{ width: `${sheet.w}px`, height: `${sheet.h}px`, transform: `scale(${sheetScale})` }"
        />
      </div>
      <div v-else class="crm__center">
      <div class="crm__mail">
        <div class="crm__inbox">
          <span class="crm__avatar" aria-hidden="true">V</span>
          <div class="crm__meta">
            <p class="crm__from"><strong>ViaLuxury</strong> <span>&lt;info@vialuxury.nl&gt;</span><span class="crm__time">10:24</span></p>
            <p class="crm__subject">{{ entry?.subject }}</p>
            <p class="crm__preheader">{{ entry?.preheader }}</p>
          </div>
        </div>
        <iframe :key="slug" class="crm__frame" :src="`/emails/${slug}.html`" :title="entry?.title" @load="onMailLoad" />
      </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.crm { min-height: 100vh; background: #f5f5f5; font-family: var(--font-body); color: var(--color-text-primary); }
.crm__bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 24px; padding: 16px 24px; background: #fff; border-bottom: 1px solid var(--color-border); }
.crm__left { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; min-width: 0; }
.crm__back { color: var(--color-text-secondary); text-decoration: none; font-size: 13px; }
.crm__back:hover { color: var(--color-primary); }
.crm__title { margin: 0; font-family: var(--font-heading); font-size: 20px; font-weight: 700; }
/* Variantschakelaar rechts van de naam: twee segmenten, het actieve zwart */
.crm__variants { display: inline-flex; border: 1px solid var(--color-border); border-radius: 6px; overflow: hidden; background: #fff; }
.crm__variant { padding: 6px 12px; font-size: 13px; line-height: 1.3; white-space: nowrap; color: var(--color-text-secondary); text-decoration: none; }
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
/* Voorbeeldblad: de hele breedte naast het paneel, het blad geschaald vanaf linksboven */
.crm__sheet { flex: 1; min-width: 0; overflow: hidden; background: #fff; border: 1px solid var(--color-border); border-radius: 8px; }
.crm__sheet-frame { display: block; border: 0; transform-origin: top left; }
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
