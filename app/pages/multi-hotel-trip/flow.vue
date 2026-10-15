<script setup lang="ts">
// Multi Hotel Trip — Post-bookingflow: de klantreis na het boeken als strak schema in de
// huisstijl. Drie fases op een horizontale tijdlijn (Boeken, Voorbereiden, Onderweg — Onderweg
// begint bij Incheck hotel 1) met mijlpalen; erboven de pagina's (alle even groot, ook de
// accountomgeving), eronder de e-mails. De incheckmails gaan de dag vóór het inchecken: een
// oranje bolletje vlak voor elk hotelbolletje. Kaartjes zijn wit met icoon en titel; de
// reispagina heeft de varianten Auto en Fiets (chips). Nog te maken onderdelen staan gestippeld.
// Klikken opent de pagina of mail; de pagina's krijgen daarbij een demo-boeking (Opaalkust of
// de fietsvakantie). Desktop-first (vaste tekenruimte van 1120px), schaalt mee tot een minimum
// en scrolt daarna horizontaal.
import { tripCheckoutBySlug } from '~/data/mht-checkout/trip'
import { pricing } from '~/data/mht-checkout/deal'
import { useMultiHotelTripCheckoutTrip } from '~/composables-multi-hotel-trip/useMultiHotelTripCheckoutTrip'

useHead({ title: 'Post-bookingflow — ViaLuxury' })

/* ── Demo-boekingen per variant ── */
type VariantId = 'auto' | 'fiets'
const DEMOS: Record<VariantId, { slug: string; checkIn: string; checkOut: string; checkInYmd: { year: number; month: number; day: number } }> = {
  auto: { slug: 'ontdek-noord-frankrijk-en-de-opaalkust-in-7-dagen', checkIn: 'di 18 mei', checkOut: 'ma 24 mei', checkInYmd: { year: 2027, month: 4, day: 18 } },
  fiets: { slug: 'fietsvakantie-twente-en-salland-delden-raalte-markelo', checkIn: 'ma 7 jun', checkOut: 'zo 13 jun', checkInYmd: { year: 2027, month: 5, day: 7 } },
}
/** Boeking klaarzetten (reis, datums, kamerkeuze met flexibel annuleren, gast) en navigeren;
 *  de bevestigingspagina krijgt optioneel de preloader. */
function openWithBooking(to: string, variant: VariantId = 'auto', preload = false) {
  const demo = DEMOS[variant]
  const checkout = tripCheckoutBySlug(demo.slug)
  const { isTrip, slug, day } = useMultiHotelTripCheckoutTrip()
  isTrip.value = true
  slug.value = demo.slug
  day.value = { price: checkout?.price ?? 0, checkIn: demo.checkIn, checkOut: demo.checkOut, checkInYmd: demo.checkInYmd }
  const flex = pricing.flexibilityPerRoom * (checkout?.hotels.length ?? 3)
  useState<{ baseId: string; rateKey: 'nonrefundable' | 'flexible'; price: number; priceWas: number; quantity: number }[]>('mht-checkout-selection', () => []).value =
    [{ baseId: 'trip', rateKey: 'flexible', price: (checkout?.price ?? 0) + flex, priceWas: (checkout?.priceWas ?? 0) + flex, quantity: 1 }]
  useState<{ firstName: string; email: string } | null>('mht-checkout-guest', () => null).value = { firstName: 'Rijo', email: 'rijo.verburg@gmail.com' }
  if (preload) useState<boolean>('mht-checkout-confirm-load', () => false).value = true
  navigateTo(to)
}
const go = (to: string) => navigateTo(to)

/* ── Tekenruimte ── */
const W = 1120
const H = 392
const MIN_SCALE = 0.55
/** Kolommen (x-midden) van de mijlpalen op de tijdlijn. */
const COL = { booking: 150, prep: 440, h1: 700, h2: 870, h3: 1040 }
/** De incheckmail gaat de dag vóór het inchecken: oranje bolletje vlak voor het hotelbolletje. */
const MAIL_BEFORE = 36
const PAGES_BOTTOM = 150
const TIMELINE_Y = 218
const MAILS_Y = 292
const CARD_W = 232
const CARD_W_SM = 158
const PAGE_H = 116
const MAIL_H = 76

interface Variant { id: VariantId; label: string; icon: 'car' | 'bike' }
interface Card {
  id: string
  kind: 'pagina' | 'email'
  title: string
  /** Kleine toelichting (alleen de accountomgeving: altijd beschikbaar). */
  sub?: string
  /** Nog te maken: gestippeld en gedempt. */
  volgt?: boolean
  x: number
  y: number
  w: number
  h: number
  /** Klik: pagina (met demo-boeking) of mailpreview. */
  to?: string
  seeded?: boolean
  preload?: boolean
  variants?: Variant[]
}
const pages: Card[] = [
  { id: 'bevestiging', kind: 'pagina', title: 'Bevestigingspagina', x: COL.booking - CARD_W / 2, y: PAGES_BOTTOM - PAGE_H, w: CARD_W, h: PAGE_H, to: '/multi-hotel-trip/checkout/bevestiging', seeded: true, preload: true },
  { id: 'routes', kind: 'pagina', title: 'Tips & routes', x: COL.prep - CARD_W / 2, y: PAGES_BOTTOM - PAGE_H, w: CARD_W, h: PAGE_H, to: '/multi-hotel-trip/checkout/routes', seeded: true, variants: [{ id: 'auto', label: 'Auto', icon: 'car' }, { id: 'fiets', label: 'Fiets', icon: 'bike' }] },
  { id: 'account', kind: 'pagina', title: 'Accountomgeving', sub: 'De hele reis beschikbaar', volgt: true, x: W - 20 - CARD_W, y: PAGES_BOTTOM - PAGE_H, w: CARD_W, h: PAGE_H },
]
const mails: Card[] = [
  { id: 'mail-bevestiging', kind: 'email', title: 'Boekingsbevestiging', x: COL.booking - CARD_W / 2, y: MAILS_Y, w: CARD_W, h: MAIL_H, to: '/multi-hotel-trip/emails/vakantie-bevestiging' },
  { id: 'mail-pretravel', kind: 'email', title: 'Pre-travel', x: COL.prep - CARD_W / 2, y: MAILS_Y, w: CARD_W, h: MAIL_H, to: '/multi-hotel-trip/emails/vakantie-pre-travel' },
  { id: 'mail-h1', kind: 'email', title: 'Incheck hotel 1', volgt: true, x: COL.h1 - MAIL_BEFORE - CARD_W_SM / 2, y: MAILS_Y, w: CARD_W_SM, h: MAIL_H },
  { id: 'mail-h2', kind: 'email', title: 'Incheck hotel 2', volgt: true, x: COL.h2 - MAIL_BEFORE - CARD_W_SM / 2, y: MAILS_Y, w: CARD_W_SM, h: MAIL_H },
  { id: 'mail-h3', kind: 'email', title: 'Incheck hotel 3', volgt: true, x: COL.h3 - MAIL_BEFORE - CARD_W_SM / 2, y: MAILS_Y, w: CARD_W_SM, h: MAIL_H },
]
const cards = [...pages, ...mails]
/** Mijlpalen: oranje = moment van een pagina/mail, zwart met hotelicoon = inchecken. */
const milestones = [
  { x: COL.booking, label: 'Online booking', hotel: false },
  { x: COL.prep, label: '14 dagen voor vertrek', hotel: false },
  { x: COL.h1 - MAIL_BEFORE, hotel: false },
  { x: COL.h1, label: 'Incheck hotel 1', hotel: true },
  { x: COL.h2 - MAIL_BEFORE, hotel: false },
  { x: COL.h2, label: 'Incheck hotel 2', hotel: true },
  { x: COL.h3 - MAIL_BEFORE, hotel: false },
  { x: COL.h3, label: 'Incheck hotel 3', hotel: true },
]
/** Fases boven de tijdlijn (label links, lijn tot de volgende fase): Onderweg begint bij Incheck hotel 1. */
const phases = [
  { label: 'Boeken', from: 20, to: 290 },
  { label: 'Voorbereiden', from: 290, to: COL.h1 },
  { label: 'Onderweg', from: COL.h1, to: W - 20 },
]
const bevestiging = pages[0]!
const routes = pages[1]!
const arrowY = bevestiging.y + PAGE_H / 2
/** Verbindingen (gestippeld, SVG-laag achter de kaartjes): bevestiging en mails leiden naar Tips & routes. */
const connectors = [
  // Bevestigingspagina → Tips & routes
  { d: `M${bevestiging.x + CARD_W} ${arrowY} H${routes.x - 2}`, arrow: true },
  // Boekingsbevestiging (mail) → sluit aan op de pijl hierboven
  { d: `M${bevestiging.x + CARD_W} ${MAILS_Y + 30} H${bevestiging.x + CARD_W + 19} V${arrowY + 2}`, arrow: false },
  // Pre-travel (mail) → Tips & routes
  { d: `M${COL.prep + 80} ${MAILS_Y - 2} V${PAGES_BOTTOM + 2}`, arrow: true },
]
/** Mijlpaal → mail (en voor Online booking ook → bevestigingspagina): dunne doorgetrokken lijn. */
const ticks = [
  ...milestones.filter(m => !m.hotel).map(m => ({ x: m.x, y1: TIMELINE_Y + 16, y2: MAILS_Y - 2 })),
  { x: COL.booking, y1: PAGES_BOTTOM + 2, y2: TIMELINE_Y - 16 },
]

/* ── Schaal op smallere schermen ── */
const wrapRef = ref<HTMLElement | null>(null)
const scale = ref(1)
let ro: ResizeObserver | null = null
onMounted(() => {
  const update = () => { scale.value = Math.max(MIN_SCALE, Math.min(1, (wrapRef.value?.clientWidth ?? W) / W)) }
  update()
  ro = new ResizeObserver(update)
  if (wrapRef.value) ro.observe(wrapRef.value)
})
onBeforeUnmount(() => ro?.disconnect())

function onCard(c: Card, variant: VariantId = 'auto') {
  if (!c.to) return
  if (c.seeded) openWithBooking(c.to, variant, !!c.preload)
  else go(c.to)
}
</script>

<template>
  <div class="fl">
    <div class="fl__wrap">
      <header class="fl__head">
        <NuxtLink class="fl__back" to="/">‹ Startscherm</NuxtLink>
        <p class="fl__eyebrow">Multi Hotel Trip</p>
        <h1 class="fl__title">Post-bookingflow</h1>
        <p class="fl__lead">De klantreis na het boeken: welke pagina's en mails de gast wanneer ziet. Klik op een kaartje om die pagina of mail te openen.</p>
      </header>

      <div ref="wrapRef" class="fl__canvas-wrap">
        <div class="fl__stage" :style="{ width: `${W * scale}px`, height: `${H * scale}px` }">
          <div class="fl__canvas" :style="{ width: `${W}px`, height: `${H}px`, transform: `scale(${scale})` }">
            <!-- Lijnen -->
            <svg class="fl__lines" :viewBox="`0 0 ${W} ${H}`" :width="W" :height="H" aria-hidden="true">
              <defs>
                <marker id="fl-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0 0L10 5L0 10z" fill="#8a8a8a" />
                </marker>
              </defs>
              <line v-for="(t, i) in ticks" :key="`tick-${i}`" class="fl__tick" :x1="t.x" :y1="t.y1" :x2="t.x" :y2="t.y2" />
              <path v-for="(c, i) in connectors" :key="`conn-${i}`" class="fl__line" :d="c.d" :marker-end="c.arrow ? 'url(#fl-arrow)' : undefined" />
            </svg>

            <!-- Fases + tijdlijn + mijlpalen -->
            <div v-for="p in phases" :key="p.label" class="fl__phase" :style="{ left: `${p.from}px`, width: `${p.to - p.from}px`, top: `${TIMELINE_Y - 44}px` }">
              <span class="fl__phase-label">{{ p.label }}</span>
            </div>
            <div class="fl__timeline" :style="{ top: `${TIMELINE_Y - 3}px` }" />
            <div v-for="m in milestones" :key="m.x" class="fl__milestone" :class="{ 'fl__milestone--hotel': m.hotel }" :style="{ left: `${m.x}px`, top: `${TIMELINE_Y}px` }">
              <span class="fl__dot" aria-hidden="true">
                <svg v-if="m.hotel" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3" /></svg>
              </span>
              <span v-if="m.label" class="fl__milestone-label">{{ m.label }}</span>
            </div>

            <!-- Kaartjes: pagina's boven, mails onder -->
            <article
              v-for="c in cards"
              :key="c.id"
              class="fl__card"
              :class="[`fl__card--${c.kind}`, { 'fl__card--volgt': c.volgt, 'fl__card--link': !!c.to, 'fl__card--sm': c.w < 200 }]"
              :style="{ left: `${c.x}px`, top: `${c.y}px`, width: `${c.w}px`, height: `${c.h}px` }"
              :role="c.to ? 'link' : undefined"
              :tabindex="c.to ? 0 : undefined"
              @click="onCard(c)"
              @keydown.enter="onCard(c)"
            >
              <div class="fl__card-head">
                <span class="fl__icon" :class="c.kind === 'email' ? 'fl__icon--mail' : 'fl__icon--page'" aria-hidden="true">
                  <svg v-if="c.kind === 'email'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
                  <svg v-else-if="c.id === 'account'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M7 6.5h.01M10 6.5h.01" /></svg>
                </span>
                <div class="fl__card-text">
                  <h2 class="fl__card-title">{{ c.title }}</h2>
                  <p v-if="c.sub" class="fl__card-sub">{{ c.sub }}</p>
                </div>
              </div>
              <div v-if="c.variants" class="fl__variants" role="group" aria-label="Varianten">
                <button
                  v-for="v in c.variants"
                  :key="v.id"
                  type="button"
                  class="fl__variant"
                  @click.stop="onCard(c, v.id)"
                >
                  <svg v-if="v.icon === 'car'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 13l1.6-4.3A2 2 0 0 1 7.5 7.5h9a2 2 0 0 1 1.9 1.2L20 13" /><rect x="2.5" y="13" width="19" height="5.5" rx="1.5" /><path d="M6 18.5V20M18 18.5V20M6.5 15.5h.01M17.5 15.5h.01" /></svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="5.5" cy="17" r="3.5" /><circle cx="18.5" cy="17" r="3.5" /><path d="M5.5 17l3.5-8h5l4.5 8M9 9H6.5M13.5 9l-3 8M14 6h2.5l2 11" /></svg>
                  {{ v.label }}
                </button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fl { min-height: 100vh; background: #f5f5f5; padding: 32px 24px 64px; font-family: var(--font-body); color: var(--color-text-primary); }
.fl__wrap { max-width: 1120px; margin: 0 auto; }
.fl__head { margin-bottom: 20px; }
.fl__back { display: inline-block; margin-bottom: 14px; color: var(--color-text-secondary); text-decoration: none; font-size: 14px; }
.fl__back:hover { color: var(--color-primary); }
.fl__eyebrow { margin: 0 0 4px; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-text-secondary); }
.fl__title { margin: 0 0 8px; font-family: var(--font-heading); font-size: 34px; font-weight: 700; line-height: 1.1; }
.fl__lead { margin: 0; max-width: 640px; font-size: 15px; color: var(--color-text-secondary); }

/* Tekenruimte: schaalt mee, scrolt horizontaal onder de minimumschaal */
.fl__canvas-wrap { position: relative; width: 100%; overflow-x: auto; overflow-y: hidden; }
.fl__stage { position: relative; }
.fl__canvas { position: absolute; top: 0; left: 0; transform-origin: top left; }
.fl__lines { position: absolute; inset: 0; }
.fl__line { fill: none; stroke: #8a8a8a; stroke-width: 1.5; stroke-dasharray: 4 4; }
.fl__tick { stroke: #c4c4c4; stroke-width: 1.5; }

/* Fases (label links, hairline tot de volgende fase) + tijdlijn + mijlpalen */
.fl__timeline { position: absolute; left: 20px; right: 20px; height: 6px; border-radius: 3px; background: #141414; }
.fl__phase { position: absolute; height: 28px; display: flex; align-items: center; gap: 10px; padding: 0 10px 0 2px; }
.fl__phase::after { content: ''; flex: 1; height: 1px; background: #d4d4d4; }
.fl__phase-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-text-secondary); white-space: nowrap; }
.fl__milestone { position: absolute; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); }
.fl__dot { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: var(--color-primary); box-shadow: 0 0 0 4px #f5f5f5, 0 0 0 5px #141414; }
.fl__milestone--hotel .fl__dot { width: 30px; height: 30px; background: #141414; }
.fl__milestone--hotel .fl__dot svg { width: 16px; height: 16px; }
.fl__milestone-label { position: absolute; top: 22px; padding: 0 6px; background: #f5f5f5; white-space: nowrap; font-size: 12px; font-weight: 600; color: var(--color-text-primary); }
.fl__milestone--hotel .fl__milestone-label { top: 26px; }

/* Kaartjes: wit, icoon + titel; even groot per rij */
.fl__card { position: absolute; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; gap: 10px; padding: 14px 16px; border-radius: 12px; background: #fff; border: 1px solid #e3e3e3; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04); transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast); }
.fl__card--link { cursor: pointer; }
.fl__card--link:hover, .fl__card--link:focus-visible { transform: translateY(-2px); border-color: var(--color-primary); box-shadow: 0 10px 24px rgba(0, 0, 0, 0.1); outline: none; }
.fl__card--volgt { border-style: dashed; border-color: #c9c9c9; color: var(--color-text-secondary); }
.fl__card--volgt .fl__card-title { color: var(--color-text-secondary); }
.fl__card--sm { padding: 12px; }
.fl__card-head { display: flex; align-items: center; gap: 10px; }
.fl__card--sm .fl__card-head { gap: 8px; }
.fl__card-text { min-width: 0; }
.fl__icon { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0; }
.fl__icon svg { width: 17px; height: 17px; }
.fl__card--sm .fl__icon { width: 26px; height: 26px; border-radius: 7px; }
.fl__card--sm .fl__icon svg { width: 14px; height: 14px; }
.fl__icon--page { background: #141414; color: #fff; }
.fl__icon--mail { background: #f4f1ec; color: #141414; }
.fl__card--volgt .fl__icon { background: #ececec; color: #8a8a8a; }
.fl__card-title { margin: 0; font-family: var(--font-heading); font-size: 17px; font-weight: 700; line-height: 1.25; white-space: nowrap; }
.fl__card--sm .fl__card-title { font-size: 14px; }
.fl__card-sub { margin: 2px 0 0; font-size: 12px; color: var(--color-text-secondary); white-space: nowrap; }
.fl__variants { display: flex; align-items: center; gap: 6px; }
.fl__variant { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px 4px 8px; border-radius: 999px; border: 1.5px solid #141414; background: #fff; font-family: var(--font-body); font-size: 12px; font-weight: 700; color: #141414; cursor: pointer; transition: background var(--transition-fast), color var(--transition-fast); }
.fl__variant svg { width: 14px; height: 14px; }
.fl__variant:hover { background: #141414; color: #fff; }

@media (max-width: 800px) {
  .fl { padding: 20px 12px 40px; }
  .fl__title { font-size: 26px; }
}
</style>
