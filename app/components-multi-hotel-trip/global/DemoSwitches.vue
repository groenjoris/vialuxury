<script setup lang="ts">
// Prototype-schakelaars (niet voor de gast) linksboven, in één rij:
//  - Post-bookingflow (props `variant` en `rate`): Auto | Fiets en Flex | Non-flex, dezelfde stand als
//    op de flowpagina. De keuze staat in de URL (`?demo=` en `?rate=nonflex`), dus elke stand is een
//    deelbare link. Gewone links (volledige paginalading, ná de eerstvolgende paint): de pagina zet de
//    demo-boeking dan opnieuw klaar (useDemoBookingFromQuery). De mailpreview geeft eigen links mee (de
//    reis zit daar in de slug) en `null` voor een stand die er niet is.
//  - Prijsweergave van de vakanties (prop `price`): PRIJS: TOTAAL | PP (useMultiHotelTripPriceVariant,
//    localStorage, werkt direct zonder herladen) op elke pagina waar vakantieprijzen staan: homepage,
//    zoekpagina's, kaart, vakantie-PDP en de checkout t/m de gegevensstap. Ná de kamerkeuze toont de
//    kassabon altijd de totaalprijs, dus op de post-bookingschermen staat deze schakelaar niet.
// Een pagina kan extra aan/uit-schakelaars meegeven (Vandaag op de routespagina). Op mobiel verborgen,
// net als de prototype-navigatie.
// Plaatsing: het paneel staat gewoon in de flow; de kop zet het via de slot `proto` op zijn plek
// (SiteHeader: onder het logo en het label, of met proto-placement="right" rechts naast het logo
// in de zwarte balk; CheckoutTopNav: onder het logo; mailpreview: in de balk naast de titel).
import { demoQuery, navigateAfterPaint, type DemoRate, type DemoVariant } from '~/composables-multi-hotel-trip/useMultiHotelTripDemoBooking'
import { useMultiHotelTripPriceVariant, type PriceVariant } from '~/composables-multi-hotel-trip/useMultiHotelTripPriceVariant'

type Opt = 'auto' | 'fiets' | 'flex' | 'nonflex'
const props = defineProps<{
  /** Demo-boeking: reis (Auto | Fiets); zonder deze prop geen reisgroep. */
  variant?: DemoVariant
  /** Demo-boeking: annuleringskeuze (Flex | Non-flex); zonder deze prop geen annuleergroep. */
  rate?: DemoRate
  /** Eigen link per stand; `null` = niet beschikbaar. Zonder: deze pagina met ?demo= en ?rate=. */
  links?: Partial<Record<Opt, string | null>>
  /** Extra aan/uit-schakelaars van de pagina. */
  toggles?: { id: string; label: string; on: boolean }[]
  /** Prijsweergave van de vakanties: PRIJS: TOTAAL | PP. */
  price?: boolean
}>()
const emit = defineEmits<{ toggle: [id: string] }>()
const route = useRoute()
const curVariant = computed<DemoVariant>(() => props.variant ?? 'auto')
const curRate = computed<DemoRate>(() => props.rate ?? 'flex')
const pageHref = (variant: DemoVariant, rate: DemoRate) => `${route.path}?${new URLSearchParams(demoQuery(variant, rate)).toString()}`
const hrefOf = (opt: Opt): string | null => {
  if (props.links && opt in props.links) return props.links[opt] ?? null
  return opt === 'auto' || opt === 'fiets' ? pageHref(opt, curRate.value) : pageHref(curVariant.value, opt)
}
const groups = computed(() => {
  const g: { id: string; label: string; options: { id: Opt; label: string; on: boolean }[] }[] = []
  if (props.variant) g.push({ id: 'variant', label: 'Reis', options: [
    { id: 'auto', label: 'Auto', on: props.variant === 'auto' },
    { id: 'fiets', label: 'Fiets', on: props.variant === 'fiets' },
  ] })
  if (props.rate) g.push({ id: 'rate', label: 'Annuleren', options: [
    { id: 'flex', label: 'Flex', on: props.rate === 'flex' },
    { id: 'nonflex', label: 'Non-flex', on: props.rate === 'nonflex' },
  ] })
  return g.map(gr => ({ ...gr, options: gr.options.map(o => ({ ...o, href: o.on ? null : hrefOf(o.id) })) }))
})

// Prijsweergave (alleen vakanties): totaalprijs voor 2 personen of prijs per persoon. Geen link maar
// directe state: alle prijzen op de pagina rekenen meteen om.
const { variant: priceVariant, setVariant: setPriceVariant } = useMultiHotelTripPriceVariant()
const priceOptions = computed(() => ([
  { id: 'total' as PriceVariant, label: 'Totaal' },
  { id: 'pp' as PriceVariant, label: 'Pp' },
] as const).map(o => ({ ...o, on: priceVariant.value === o.id })))
</script>

<template>
  <div class="demo-sw" title="Prototype-schakelaars (niet voor de gast)">
    <div v-for="g in groups" :key="g.id" class="demo-sw__group" role="group" :aria-label="g.label">
      <template v-for="o in g.options" :key="o.id">
        <span v-if="o.on" class="demo-sw__opt demo-sw__opt--on" aria-current="true">{{ o.label }}</span>
        <span v-else-if="!o.href" class="demo-sw__opt demo-sw__opt--na" title="Niet beschikbaar">{{ o.label }}</span>
        <a v-else class="demo-sw__opt" :href="o.href" @click="navigateAfterPaint(o.href!, $event)">{{ o.label }}</a>
      </template>
    </div>
    <!-- Prijsweergave vakanties: PRIJS: TOTAAL | PP (label ervoor, huidige stand niet klikbaar). -->
    <template v-if="price">
      <span class="demo-sw__label" aria-hidden="true">Prijs:</span>
      <div class="demo-sw__group" role="group" aria-label="Prijsweergave vakanties">
        <template v-for="o in priceOptions" :key="o.id">
          <span v-if="o.on" class="demo-sw__opt demo-sw__opt--on" aria-current="true">{{ o.label }}</span>
          <button v-else type="button" class="demo-sw__opt demo-sw__btn" @click="setPriceVariant(o.id)">{{ o.label }}</button>
        </template>
      </div>
    </template>
    <div v-for="t in toggles" :key="t.id" class="demo-sw__group" role="group" :aria-label="t.label">
      <button type="button" class="demo-sw__opt demo-sw__btn" :class="{ 'demo-sw__opt--on': t.on }" :aria-pressed="t.on" @click="emit('toggle', t.id)">{{ t.label }}</button>
    </div>
  </div>
</template>

<style scoped>
/* Eén rij; de plek bepaalt de kop (slot `proto`). */
.demo-sw { position: relative; z-index: 700; display: flex; flex-wrap: nowrap; width: max-content; gap: 4px; padding: 4px; border-radius: 6px; background: rgba(20, 20, 20, 0.6); }
.demo-sw__group { display: inline-flex; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 3px; overflow: hidden; }
.demo-sw__opt { display: inline-block; padding: 3px 6px; font-family: var(--font-body, inherit); font-size: 9px; line-height: 1; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; white-space: nowrap; color: rgba(255, 255, 255, 0.6); text-decoration: none; }
.demo-sw__opt + .demo-sw__opt { border-left: 1px solid rgba(255, 255, 255, 0.3); }
/* Label vóór een groep ("PRIJS:"): zelfde letter, geen kader. */
.demo-sw__label { align-self: center; padding: 3px 2px 3px 4px; font-family: var(--font-body, inherit); font-size: 9px; line-height: 1; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; white-space: nowrap; color: rgba(255, 255, 255, 0.6); }
a.demo-sw__opt:hover { color: #fff; }
.demo-sw__opt--on { background: #fff; color: #141414; }
.demo-sw__opt--na { color: rgba(255, 255, 255, 0.28); cursor: default; }
.demo-sw__btn { appearance: none; border: 0; background: transparent; cursor: pointer; }
.demo-sw__btn:hover { color: #fff; }
.demo-sw__btn.demo-sw__opt--on:hover { color: #141414; }
@media (max-width: 800px) { .demo-sw { display: none; } }
</style>
