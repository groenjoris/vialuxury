<script setup lang="ts">
// Preview van één e-mailontwerp: de geëxporteerde HTML (public/emails/<slug>.html, of
// .dark.html) in een iframe, met licht/donker, desktop/mobiel, Kopieer HTML en Download.
// Bij kopiëren/downloaden worden de relatieve afbeeldings-URL's absoluut gemaakt, zodat
// de HTML ook in een e-mailclient of ESP werkt.
import emails from '~/data/mht-emails.json'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const entry = computed(() => emails.find(e => e.slug === slug.value))
if (!entry.value) throw createError({ statusCode: 404, statusMessage: 'E-mail niet gevonden' })

const mode = ref<'light' | 'dark'>('light')
const device = ref<'desktop' | 'mobile'>('desktop')
const src = computed(() => `/emails/${slug.value}${mode.value === 'dark' ? '.dark' : ''}.html`)
const copied = ref(false)

async function absoluteHtml(): Promise<string> {
  const html = await (await fetch(src.value)).text()
  const origin = window.location.origin
  return html.replace(/(src|href)="\/(images|emails)\//g, `$1="${origin}/$2/`)
}
async function copyHtml() {
  await navigator.clipboard.writeText(await absoluteHtml())
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
async function downloadHtml() {
  const blob = new Blob([await absoluteHtml()], { type: 'text/html' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${slug.value}${mode.value === 'dark' ? '-dark' : ''}.html`
  a.click()
  URL.revokeObjectURL(a.href)
}

useHead({ title: `${entry.value?.title ?? 'E-mail'} — ViaLuxury e-maildesigns` })
</script>

<template>
  <div class="ev">
    <header class="ev__bar">
      <div class="ev__bar-left">
        <NuxtLink class="ev__back" to="/multi-hotel-trip/emails">‹ Alle e-mails</NuxtLink>
        <h1 class="ev__title">{{ entry?.title }}</h1>
      </div>
      <div class="ev__controls">
        <div class="ev__group" role="group" aria-label="Kleurmodus">
          <button type="button" class="ev__btn" :class="{ 'ev__btn--on': mode === 'light' }" @click="mode = 'light'">Licht</button>
          <button type="button" class="ev__btn" :class="{ 'ev__btn--on': mode === 'dark' }" @click="mode = 'dark'">Donker</button>
        </div>
        <div class="ev__group" role="group" aria-label="Weergave">
          <button type="button" class="ev__btn" :class="{ 'ev__btn--on': device === 'desktop' }" @click="device = 'desktop'">Desktop</button>
          <button type="button" class="ev__btn" :class="{ 'ev__btn--on': device === 'mobile' }" @click="device = 'mobile'">Mobiel</button>
        </div>
        <button type="button" class="ev__btn ev__btn--primary" @click="copyHtml">{{ copied ? 'Gekopieerd ✓' : 'Kopieer HTML' }}</button>
        <button type="button" class="ev__btn" @click="downloadHtml">Download HTML</button>
      </div>
    </header>
    <p class="ev__desc">{{ entry?.description }}</p>
    <div class="ev__stage">
      <iframe
        :key="src"
        class="ev__frame"
        :class="{ 'ev__frame--mobile': device === 'mobile' }"
        :src="src"
        :title="entry?.title"
      />
    </div>
  </div>
</template>

<style scoped>
.ev { min-height: 100vh; background: #f5f5f5; font-family: var(--font-body); color: var(--color-text-primary); }
.ev__bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 24px; padding: 16px 24px; background: #fff; border-bottom: 1px solid var(--color-border); }
.ev__bar-left { display: flex; align-items: center; gap: 16px; min-width: 0; }
.ev__back { flex-shrink: 0; color: var(--color-text-secondary); text-decoration: none; font-size: 14px; }
.ev__back:hover { color: var(--color-primary); }
.ev__title { margin: 0; font-family: var(--font-heading); font-size: 20px; font-weight: 700; }
.ev__controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.ev__group { display: inline-flex; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; }
.ev__group .ev__btn { border: 0; border-radius: 0; }
.ev__group .ev__btn + .ev__btn { border-left: 1.5px solid var(--color-border); }
.ev__btn {
  height: 36px; padding: 0 14px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md);
  background: #fff; color: var(--color-text-primary); font-family: var(--font-body); font-size: 14px; font-weight: 600; cursor: pointer;
}
.ev__btn:hover { color: var(--color-primary); }
.ev__btn--on { background: var(--color-text-primary); color: #fff; }
.ev__btn--on:hover { color: #fff; }
.ev__btn--primary { background: var(--color-primary); border-color: var(--color-primary); color: #fff; }
.ev__btn--primary:hover { background: var(--color-primary-hover); border-color: var(--color-primary-hover); color: #fff; }
.ev__desc { max-width: 900px; margin: 0 auto; padding: 16px 24px 0; font-size: 14px; color: var(--color-text-secondary); }
.ev__stage { display: flex; justify-content: center; padding: 20px 24px 48px; }
.ev__frame { width: 700px; max-width: 100%; height: calc(100vh - 160px); min-height: 640px; border: 1px solid var(--color-border); border-radius: 8px; background: #fff; transition: width 200ms ease; }
.ev__frame--mobile { width: 375px; }
</style>
