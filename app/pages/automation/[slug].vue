<script setup lang="ts">
// Preview van een automationmail (alleen desktop + light mode), in één frame zoals de ontvanger
// hem ziet: bovenaan afzender, onderwerp en preheader, daaronder de geëxporteerde HTML
// (public/emails/<slug>.html). De slug is de Klaviyo-naam uit de briefing; die staat onder de
// titel zodat Bart hem kan overnemen.
// Links, tegen de rand van het venster, staat een paneel met alle mails, gegroepeerd per flow.
// Pijltjes omhoog/omlaag bladeren naar de vorige/volgende mail.
import emails from '~/data/automation-emails.json'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const entry = computed(() => emails.find(e => e.slug === slug.value))
if (!entry.value) throw createError({ statusCode: 404, statusMessage: 'E-mail niet gevonden' })

// De drie flows uit de briefing, in volgorde van prioriteit. De titel
// "Winkelmandje 1 (1 uur na verlaten)" wordt gesplitst in naam en moment.
const groups = [
  { title: 'Achtergelaten winkelmandje', flow: 'fl011' },
  { title: 'Bekeken arrangement', flow: 'fl012' },
  { title: 'Zoekopdracht', flow: 'fl013' },
].map(g => ({
  ...g,
  // Varianten van een mail (registry: variantOf) staan niet in het paneel maar als schakelaar
  // in de kop; in het paneel blijft de hoofdmail actief.
  items: emails
    .filter(e => e.slug.includes(g.flow) && !(e as { variantOf?: string }).variantOf)
    .map((e) => {
      const m = e.title.match(/^(.*?)\s*\((.*)\)$/)
      return { slug: e.slug, label: m ? m[1] : e.title, when: m ? m[2] : '' }
    }),
}))

/** Licht of donker. De verstuurde mail is altijd de lichte: die zet zichzelf om met de
 *  mediaquery `prefers-color-scheme`. De donkere HTML is alleen om hier te bekijken. */
const dark = ref(false)

const baseSlug = computed(() => (entry.value as { variantOf?: string } | undefined)?.variantOf ?? slug.value)
const variants = computed(() => {
  const list = emails.filter(e => e.slug === baseSlug.value || (e as { variantOf?: string }).variantOf === baseSlug.value)
  return list.length > 1 ? list.map(e => ({ slug: e.slug, label: (e as { variantLabel?: string }).variantLabel ?? e.slug })) : []
})
const nav = groups.flatMap(g => g.items)

// Dropdown in de kop: alle tien de mails, gegroepeerd per flow.
function onPick(ev: Event) {
  navigateTo(`/automation/${(ev.target as HTMLSelectElement).value}`)
}

// Pijltjes omhoog/omlaag: vorige/volgende mail
function onKey(ev: KeyboardEvent) {
  if (ev.key !== 'ArrowDown' && ev.key !== 'ArrowUp') return
  const i = nav.findIndex(e => e.slug === baseSlug.value)
  const next = nav[i + (ev.key === 'ArrowDown' ? 1 : -1)]
  if (!next) return
  ev.preventDefault()
  navigateTo(`/automation/${next.slug}`)
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

useHead({ title: `${entry.value?.title ?? 'E-mail'} — ViaLuxury automations` })
</script>

<template>
  <div class="aut">
    <header class="aut__bar">
      <div class="aut__left">
        <a class="aut__back" href="/">‹ Startscherm</a>
        <div class="aut__heading">
          <h1 class="aut__title">{{ entry?.title }}</h1>
          <code class="aut__slug">{{ slug }}</code>
        </div>
        <div v-if="variants.length" class="aut__variants" role="group" aria-label="Variant">
          <NuxtLink
            v-for="v in variants"
            :key="v.slug"
            :to="`/automation/${v.slug}`"
            class="aut__variant"
            :class="{ 'aut__variant--on': v.slug === slug }"
            :aria-current="v.slug === slug ? 'true' : undefined"
          >{{ v.label }}</NuxtLink>
        </div>
        <div class="aut__variants" role="group" aria-label="Weergave">
          <button type="button" class="aut__variant" :class="{ 'aut__variant--on': !dark }" @click="dark = false">Light</button>
          <button type="button" class="aut__variant" :class="{ 'aut__variant--on': dark }" @click="dark = true">Dark</button>
        </div>
        <select class="aut__picker" :value="baseSlug" aria-label="Kies een mail" @change="onPick">
          <optgroup v-for="g in groups" :key="g.flow" :label="g.title">
            <option v-for="e in g.items" :key="e.slug" :value="e.slug" :selected="e.slug === baseSlug">
              {{ e.label }}{{ e.when ? ` — ${e.when}` : '' }}
            </option>
          </optgroup>
        </select>
      </div>
    </header>
    <div class="aut__stage">
      <nav class="aut__nav" aria-label="Automationmails">
        <template v-for="g in groups" :key="g.flow">
          <p class="aut__nav-title">{{ g.title }}</p>
          <NuxtLink
            v-for="e in g.items"
            :key="e.slug"
            :to="`/automation/${e.slug}`"
            class="aut__nav-link"
            :class="{ 'aut__nav-link--on': e.slug === baseSlug }"
            :aria-current="e.slug === baseSlug ? 'page' : undefined"
          >
            <span class="aut__nav-label">{{ e.label }}</span>
            <span v-if="e.when" class="aut__nav-when">{{ e.when }}</span>
          </NuxtLink>
        </template>
        <p class="aut__nav-hint">↑ ↓ om te bladeren</p>
      </nav>
      <div class="aut__center">
        <div class="aut__mail">
          <div class="aut__inbox">
            <span class="aut__avatar" aria-hidden="true">V</span>
            <div class="aut__meta">
              <p class="aut__from"><strong>ViaLuxury</strong> <span>&lt;info@vialuxury.nl&gt;</span><span class="aut__time">10:24</span></p>
              <p class="aut__subject">{{ entry?.subject }}</p>
              <p class="aut__preheader">{{ entry?.preheader }}</p>
            </div>
          </div>
          <iframe :key="`${slug}-${dark}`" class="aut__frame" :src="`/emails/${slug}${dark ? '.dark' : ''}.html`" :title="entry?.title" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.aut { min-height: 100vh; background: #f5f5f5; font-family: var(--font-body); color: var(--color-text-primary); }
.aut__bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 24px; padding: 16px 24px; background: #fff; border-bottom: 1px solid var(--color-border); }
.aut__left { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 16px; min-width: 0; }
.aut__back { flex-shrink: 0; color: var(--color-text-secondary); text-decoration: none; font-size: 13px; white-space: nowrap; }
.aut__back:hover { color: var(--color-primary); }
.aut__heading { min-width: 0; flex: 1 1 auto; }
.aut__title { margin: 0; font-family: var(--font-heading); font-size: 20px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
/* De Klaviyo-naam, zodat de template daar net zo kan heten */
.aut__slug { display: block; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; color: var(--color-text-secondary); }
/* Variantschakelaar naast de titel: twee segmenten, het actieve zwart */
.aut__variants { display: inline-flex; flex-shrink: 0; border: 1px solid var(--color-border); border-radius: 6px; overflow: hidden; background: #fff; }
.aut__variant { padding: 6px 12px; font-family: inherit; font-size: 13px; line-height: 1.3; color: var(--color-text-secondary); text-decoration: none; white-space: nowrap; background: none; border: 0; cursor: pointer; }
.aut__variant + .aut__variant { border-left: 1px solid var(--color-border); }
.aut__variant:hover { color: var(--color-text-primary); }
.aut__variant--on, .aut__variant--on:hover { background: #141414; color: #fff; }
/* Dropdown naar elke mail, voor als het paneel links niet past */
.aut__picker { flex: 0 0 auto; max-width: 320px; padding: 7px 10px; font-family: inherit; font-size: 13px; line-height: 1.3; color: var(--color-text-primary); background: #fff; border: 1px solid var(--color-border); border-radius: 6px; }
.aut__stage { display: flex; align-items: flex-start; gap: 24px; padding: 20px 24px 48px; }
.aut__nav { position: sticky; top: 20px; display: flex; flex-direction: column; gap: 2px; width: 264px; flex-shrink: 0; padding: 12px 8px; background: #fff; border: 1px solid var(--color-border); border-radius: 8px; }
.aut__nav-title { margin: 10px 0 6px; padding: 0 12px; font-size: 12px; font-weight: 700; color: var(--color-text-secondary); }
.aut__nav-title:first-child { margin-top: 0; }
.aut__nav-link { display: flex; flex-direction: column; gap: 1px; padding: 8px 12px; border-radius: 6px; text-decoration: none; text-align: left; }
.aut__nav-link:hover { background: var(--color-border-light); }
.aut__nav-label { font-size: 15px; line-height: 1.3; color: var(--color-text-primary); }
.aut__nav-when { font-size: 13px; line-height: 1.3; color: var(--color-text-secondary); }
.aut__nav-link--on, .aut__nav-link--on:hover { background: #F4F1EC; }
.aut__nav-link--on .aut__nav-label { font-weight: 700; }
.aut__nav-hint { margin: 10px 0 0; padding: 0 12px; font-size: 12px; color: var(--color-text-secondary); }
.aut__center { flex: 1; min-width: 0; display: flex; justify-content: center; }
@media (max-width: 900px) { .aut__nav { display: none; } }
.aut__mail { width: 700px; max-width: 100%; background: #fff; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; }
.aut__inbox { display: flex; gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--color-border); }
.aut__avatar { flex-shrink: 0; width: 40px; height: 40px; border-radius: 50%; background: #141414; color: #fff; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.aut__meta { min-width: 0; flex: 1; }
.aut__from { display: flex; gap: 6px; margin: 0; font-size: 14px; }
.aut__from span { color: var(--color-text-secondary); }
.aut__from .aut__time { margin-left: auto; font-size: 13px; }
.aut__subject { margin: 4px 0 0; font-size: 17px; font-weight: 700; }
.aut__preheader { margin: 2px 0 0; font-size: 14px; color: var(--color-text-secondary); }
.aut__frame { display: block; width: 100%; height: calc(100vh - 200px); min-height: 640px; border: 0; }
</style>
