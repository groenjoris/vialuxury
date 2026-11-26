<script setup lang="ts">
// Menu van de commerciële mails voor mobiel (bereikbaar via de knop "Menu" boven de mail): alle mails
// onder elkaar met per mail de variantschakelaars. Eén tik op een mail of op een variant opent die
// direct (selecteren is sluiten); de mail en variant die open stonden zijn gemarkeerd en niet
// klikbaar. De schakelaar "Desktop | Mobiel" staat hier niet: op een telefoon toont de preview
// vanzelf de mobiele versie. ?from=<slug> is de mail waar je vandaan komt.
import data from '~/data/commercieel-emails.json'

type Entry = { slug: string; title: string; variantOf?: string; variantLabel?: string }
const emails = data as Entry[]
const route = useRoute()

const from = computed(() => emails.find(e => e.slug === String(route.query.from || '')))
const fromBase = computed(() => from.value?.variantOf ?? from.value?.slug ?? '')
const devices = ['Desktop', 'Mobiel']
// Delen van het variantLabel zonder het apparaat ("Native 1 / Mobiel" → ["Native 1"])
const parts = (e: Entry) => (e.variantLabel ?? '').split(' / ').filter(p => p && !devices.includes(p))
const device = (e?: Entry) => (e?.slug.endsWith('-mobiel') ? 'Mobiel' : 'Desktop')

const mails = computed(() => emails.filter(e => !e.variantOf).map((main) => {
  const m = main.title.match(/^(.*?)\s*\((.*)\)$/)
  const current = fromBase.value === main.slug
  // Varianten van deze mail op hetzelfde apparaat als waar je vandaan komt
  const list = emails.filter(e => (e.slug === main.slug || e.variantOf === main.slug) && device(e) === device(from.value))
  const cur = current && from.value ? parts(from.value) : parts(list[0] ?? main)
  const groups = cur.map((_, axis) => {
    const labels = [...new Set(list.map(e => parts(e)[axis] ?? ''))]
    return labels.map((label) => {
      const want = cur.map((p, i) => (i === axis ? label : p)).join(' / ')
      const target = list.find(e => parts(e).join(' / ') === want) ?? list.find(e => parts(e)[axis] === label)
      return { label, slug: target?.slug ?? main.slug, on: current && cur[axis] === label }
    })
  }).filter(g => g.length > 1)
  return { slug: current && from.value ? from.value.slug : (list[0]?.slug ?? main.slug), label: m ? m[1] : main.title, sub: m ? m[2] : '', current, groups }
}))

const back = computed(() => `/commercieel/${from.value?.slug ?? ''}`)
useHead({ title: 'Menu commerciële mails — ViaLuxury' })
</script>

<template>
  <div class="menu">
    <header class="menu__bar">
      <h1 class="menu__title">Commerciële mails</h1>
      <NuxtLink class="menu__close" :to="back" aria-label="Sluit het menu">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
      </NuxtLink>
    </header>

    <ul class="menu__list">
      <li v-for="m in mails" :key="m.slug" class="menu__item" :class="{ 'menu__item--current': m.current }">
        <NuxtLink class="menu__mail" :to="`/commercieel/${m.slug}`" :aria-current="m.current ? 'page' : undefined">
          <span class="menu__text">
            <span class="menu__label">{{ m.label }}</span>
            <span v-if="m.sub" class="menu__sub">{{ m.sub }}</span>
          </span>
          <span v-if="m.current" class="menu__now">Nu open</span>
          <svg v-else class="menu__chev" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </NuxtLink>
        <!-- Varianten: alleen als er iets te kiezen valt. Eén tik opent de mail in die variant. -->
        <div v-for="(group, gi) in m.groups" :key="gi" class="menu__variants" role="group" :aria-label="`Variant van ${m.label}`">
          <template v-for="v in group" :key="v.label">
            <span v-if="v.on" class="menu__chip menu__chip--on" aria-current="true">{{ v.label }}</span>
            <NuxtLink v-else class="menu__chip" :to="`/commercieel/${v.slug}`">{{ v.label }}</NuxtLink>
          </template>
        </div>
      </li>
    </ul>

    <a class="menu__home" href="/">‹ Startscherm</a>
  </div>
</template>

<style scoped>
.menu { min-height: 100vh; min-height: 100dvh; background: #f5f5f5; font-family: var(--font-body); color: var(--color-text-primary); padding-bottom: 40px; }
.menu__bar { position: sticky; top: 0; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 8px 12px 20px; background: #fff; border-bottom: 1px solid var(--color-border); }
.menu__title { margin: 0; font-family: var(--font-heading); font-size: 20px; font-weight: 700; }
.menu__close { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 22px; color: var(--color-text-primary); }
.menu__close:active { background: var(--color-border-light); }
.menu__list { list-style: none; margin: 0 auto; padding: 16px 16px 0; max-width: 560px; display: flex; flex-direction: column; gap: 10px; }
.menu__item { background: #fff; border: 1px solid var(--color-border); border-radius: 12px; overflow: hidden; }
.menu__item--current { border-color: #141414; }
.menu__mail { display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 12px 16px; text-decoration: none; color: inherit; }
.menu__mail:active { background: var(--color-border-light); }
.menu__text { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
.menu__label { font-size: 17px; font-weight: 700; line-height: 1.3; }
.menu__sub { font-size: 14px; line-height: 1.3; color: var(--color-text-secondary); }
.menu__now { flex-shrink: 0; font-size: 12px; line-height: 1; padding: 6px 8px; border-radius: 6px; background: #F4F1EC; color: var(--color-text-primary); }
.menu__chev { flex-shrink: 0; color: var(--color-text-secondary); }
/* Varianten als knoppen onder de mail, twee naast elkaar zodat ze allemaal in beeld staan */
.menu__variants { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 0 16px 14px; }
.menu__chip { min-height: 44px; display: flex; align-items: center; justify-content: center; padding: 8px 12px; font-size: 14px; line-height: 1.2; white-space: nowrap; border: 1px solid var(--color-border); border-radius: 8px; background: #fff; color: var(--color-text-primary); text-decoration: none; }
.menu__chip:active { background: var(--color-border-light); }
.menu__chip--on { background: #141414; border-color: #141414; color: #fff; }
.menu__home { display: block; max-width: 560px; margin: 20px auto 0; padding: 0 20px; font-size: 14px; color: var(--color-text-secondary); text-decoration: none; }
</style>
