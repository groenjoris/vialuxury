<script setup lang="ts">
// Prototype-schakelaars (niet voor de gast) linksboven op de post-bookingschermen: Auto | Fiets en
// Flex | Non-flex. Dezelfde stand als op de flowpagina; de keuze staat in de URL (`?demo=` en
// `?rate=nonflex`), dus elke stand is een deelbare link. Gewone links (volledige paginalading, ná
// de eerstvolgende paint): de pagina zet de demo-boeking dan opnieuw klaar (useDemoBookingFromQuery). Op mobiel verborgen,
// net als de prototype-navigatie. De pagina geeft de huidige stand mee.
import { demoQuery, navigateAfterPaint, type DemoRate, type DemoVariant } from '~/composables-multi-hotel-trip/useMultiHotelTripDemoBooking'

const props = defineProps<{ variant: DemoVariant; rate: DemoRate }>()
const route = useRoute()
const href = (variant: DemoVariant, rate: DemoRate) => `${route.path}?${new URLSearchParams(demoQuery(variant, rate)).toString()}`
const groups = computed(() => [
  { id: 'variant', label: 'Reis', options: [
    { label: 'Auto', on: props.variant === 'auto', href: href('auto', props.rate) },
    { label: 'Fiets', on: props.variant === 'fiets', href: href('fiets', props.rate) },
  ] },
  { id: 'rate', label: 'Annuleren', options: [
    { label: 'Flex', on: props.rate === 'flex', href: href(props.variant, 'flex') },
    { label: 'Non-flex', on: props.rate === 'nonflex', href: href(props.variant, 'nonflex') },
  ] },
])
</script>

<template>
  <div class="demo-sw" title="Prototype: welke demo-boeking je ziet">
    <div v-for="g in groups" :key="g.id" class="demo-sw__group" role="group" :aria-label="g.label">
      <template v-for="o in g.options" :key="o.label">
        <span v-if="o.on" class="demo-sw__opt demo-sw__opt--on" aria-current="true">{{ o.label }}</span>
        <a v-else class="demo-sw__opt" :href="o.href" @click="navigateAfterPaint(o.href, $event)">{{ o.label }}</a>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Linksboven onder de donkere balk (de pagina kan `--demo-sw-top` zetten als de kop hoger is). */
.demo-sw { position: absolute; top: var(--demo-sw-top, 80px); left: 8px; z-index: 700; display: flex; flex-direction: column; gap: 4px; padding: 4px; border-radius: 6px; background: rgba(20, 20, 20, 0.6); }
.demo-sw__group { display: inline-flex; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 3px; overflow: hidden; }
.demo-sw__opt { display: inline-block; padding: 3px 6px; font-family: var(--font-body, inherit); font-size: 9px; line-height: 1; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; white-space: nowrap; color: rgba(255, 255, 255, 0.6); text-decoration: none; }
.demo-sw__opt + .demo-sw__opt { border-left: 1px solid rgba(255, 255, 255, 0.3); }
a.demo-sw__opt:hover { color: #fff; }
.demo-sw__opt--on { background: #fff; color: #141414; }
@media (max-width: 800px) { .demo-sw { display: none; } }
</style>
