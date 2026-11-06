<script setup lang="ts">
// Prototype-schakelaars (niet voor de gast) linksboven op alle schermen en mailpreviews van de
// post-bookingflow: Auto | Fiets en Flex | Non-flex, dezelfde stand als op de flowpagina. De keuze
// staat in de URL (`?demo=` en `?rate=nonflex`), dus elke stand is een deelbare link. Gewone links
// (volledige paginalading, ná de eerstvolgende paint): de pagina zet de demo-boeking dan opnieuw
// klaar (useDemoBookingFromQuery). De mailpreview geeft eigen links mee (de reis zit daar in de
// slug) en `null` voor een stand die er niet is. Een pagina kan extra aan/uit-schakelaars meegeven
// (Vandaag op de routespagina). Op mobiel verborgen, net als de prototype-navigatie.
import { demoQuery, navigateAfterPaint, type DemoRate, type DemoVariant } from '~/composables-mvp-trip/useMvpTripDemoBooking'

type Opt = 'auto' | 'fiets' | 'flex' | 'nonflex'
const props = defineProps<{
  variant: DemoVariant
  rate: DemoRate
  /** Eigen link per stand; `null` = niet beschikbaar. Zonder: deze pagina met ?demo= en ?rate=. */
  links?: Partial<Record<Opt, string | null>>
  /** Extra aan/uit-schakelaars van de pagina. */
  toggles?: { id: string; label: string; on: boolean }[]
}>()
const emit = defineEmits<{ toggle: [id: string] }>()
const route = useRoute()
const pageHref = (variant: DemoVariant, rate: DemoRate) => `${route.path}?${new URLSearchParams(demoQuery(variant, rate)).toString()}`
const hrefOf = (opt: Opt): string | null => {
  if (props.links && opt in props.links) return props.links[opt] ?? null
  return opt === 'auto' || opt === 'fiets' ? pageHref(opt, props.rate) : pageHref(props.variant, opt)
}
const groups = computed(() => [
  { id: 'variant', label: 'Reis', options: [
    { id: 'auto' as Opt, label: 'Auto', on: props.variant === 'auto' },
    { id: 'fiets' as Opt, label: 'Fiets', on: props.variant === 'fiets' },
  ] },
  { id: 'rate', label: 'Annuleren', options: [
    { id: 'flex' as Opt, label: 'Flex', on: props.rate === 'flex' },
    { id: 'nonflex' as Opt, label: 'Non-flex', on: props.rate === 'nonflex' },
  ] },
].map(g => ({ ...g, options: g.options.map(o => ({ ...o, href: o.on ? null : hrefOf(o.id) })) })))
</script>

<template>
  <div class="demo-sw" title="Prototype: welke demo-boeking je ziet">
    <div v-for="g in groups" :key="g.id" class="demo-sw__group" role="group" :aria-label="g.label">
      <template v-for="o in g.options" :key="o.id">
        <span v-if="o.on" class="demo-sw__opt demo-sw__opt--on" aria-current="true">{{ o.label }}</span>
        <span v-else-if="!o.href" class="demo-sw__opt demo-sw__opt--na" title="Niet beschikbaar">{{ o.label }}</span>
        <a v-else class="demo-sw__opt" :href="o.href" @click="navigateAfterPaint(o.href!, $event)">{{ o.label }}</a>
      </template>
    </div>
    <div v-for="t in toggles" :key="t.id" class="demo-sw__group" role="group" :aria-label="t.label">
      <button type="button" class="demo-sw__opt demo-sw__btn" :class="{ 'demo-sw__opt--on': t.on }" :aria-pressed="t.on" @click="emit('toggle', t.id)">{{ t.label }}</button>
    </div>
  </div>
</template>

<style scoped>
/* Linksboven onder de donkere balk, als één rij (past in de sitekop tussen het label en de zoekbalk);
   de pagina zet `--demo-sw-top` als de kop hoger is, bijv. 70px in de sitekop. */
.demo-sw { position: absolute; top: var(--demo-sw-top, 80px); left: 8px; z-index: 700; display: flex; flex-wrap: wrap; gap: 4px; padding: 4px; border-radius: 6px; background: rgba(20, 20, 20, 0.6); }
.demo-sw__group { display: inline-flex; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 3px; overflow: hidden; }
.demo-sw__opt { display: inline-block; padding: 3px 6px; font-family: var(--font-body, inherit); font-size: 9px; line-height: 1; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; white-space: nowrap; color: rgba(255, 255, 255, 0.6); text-decoration: none; }
.demo-sw__opt + .demo-sw__opt { border-left: 1px solid rgba(255, 255, 255, 0.3); }
a.demo-sw__opt:hover { color: #fff; }
.demo-sw__opt--on { background: #fff; color: #141414; }
.demo-sw__opt--na { color: rgba(255, 255, 255, 0.28); cursor: default; }
.demo-sw__btn { appearance: none; border: 0; background: transparent; cursor: pointer; }
.demo-sw__btn:hover { color: #fff; }
.demo-sw__btn.demo-sw__opt--on:hover { color: #141414; }
@media (max-width: 800px) { .demo-sw { display: none; } }
</style>
