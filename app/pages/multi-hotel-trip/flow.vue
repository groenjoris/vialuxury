<script setup lang="ts">
// Multi Hotel Trip — flow van de klantreis na het boeken, als klikbaar schema (naar het
// aangeleverde diagram): tijdlijn met Online booking → 14 dagen voor vertrek → inchecken bij
// hotel 1, 2 en 3; eronder de mails (boekingsbevestiging, pre-travel, incheckmails per hotel),
// erboven de pagina's (bevestigingspagina, Tips en Routes bij deze vakantie, accountomgeving).
// Vakjes met een pagina of mail in het prototype zijn klikbaar; de rest staat er grijs bij.
useHead({ title: 'Post-bookingflow — ViaLuxury' })

import { useMultiHotelTripCheckoutTrip } from '~/composables-multi-hotel-trip/useMultiHotelTripCheckoutTrip'

const go = (to: string) => navigateTo(to)

/** Demo-boeking (Opaalkust, Rijo) klaarzetten zodat de bevestigingspagina en de reispagina
 *  zonder checkout werken; de bevestigingspagina krijgt daarbij de preloader. */
function openWithBooking(to: string, preload = false) {
  const { isTrip, slug, day } = useMultiHotelTripCheckoutTrip()
  isTrip.value = true
  slug.value = 'ontdek-noord-frankrijk-en-de-opaalkust-in-7-dagen'
  day.value = { price: 919, checkIn: 'di 18 mei', checkOut: 'ma 24 mei', checkInYmd: { year: 2027, month: 4, day: 18 } }
  useState<{ baseId: string; rateKey: 'nonrefundable' | 'flexible'; price: number; priceWas: number; quantity: number }[]>('mht-checkout-selection', () => []).value =
    [{ baseId: 'trip', rateKey: 'flexible', price: 964, priceWas: 1535, quantity: 1 }]
  useState<{ firstName: string; email: string } | null>('mht-checkout-guest', () => null).value = { firstName: 'Rijo', email: 'rijo.verburg@gmail.com' }
  if (preload) useState<boolean>('mht-checkout-confirm-load', () => false).value = true
  navigateTo(to)
}

/* Tijdlijn: mijlpalen (x in de viewBox van 1000 breed). */
const milestones = [
  { x: 95, label: ['Online', 'booking'], star: false },
  { x: 435, label: ['14 dagen', 'voor vertrek'], star: false },
  { x: 568, label: ['Incheck', 'hotel 1'], star: true },
  { x: 730, label: ['Incheck', 'hotel 2'], star: true },
  { x: 875, label: ['Incheck', 'hotel 3'], star: true },
]
/* Incheckmails per hotel (volgen nog). */
const checkinMails = [
  { x: 523, dot: 568, label: 'Incheck hotel 1' },
  { x: 685, dot: 730, label: 'Incheck hotel 2' },
  { x: 830, dot: 875, label: 'Incheck hotel 3' },
]
/** Ster (5 punten) rond een middelpunt. */
function star(cx: number, cy: number, r = 26): string {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 === 0 ? r : r * 0.45
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`)
  }
  return pts.join(' ')
}
</script>

<template>
  <div class="fl">
    <div class="fl__wrap">
      <NuxtLink class="fl__back" to="/">‹ Startscherm</NuxtLink>
      <h1 class="fl__title">Post-bookingflow</h1>
      <p class="fl__lead">Van online boeking tot het laatste hotel: welke pagina's en mails de gast wanneer ziet. Klik op een vakje om die pagina of mail te openen; grijze vakjes volgen nog.</p>

      <svg class="fl__svg" viewBox="0 0 1000 860" role="img" aria-label="Flow van de klantreis: pagina's, mails en tijdlijn">
        <defs>
          <marker id="fl-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" fill="#1a1e1e" />
          </marker>
        </defs>

        <!-- Pagina's -->
        <g class="fl__box fl__box--static">
          <rect x="20" y="12" width="160" height="190" />
          <text x="100" y="112" text-anchor="middle">Account omgeving</text>
        </g>
        <g class="fl__box fl__box--link" role="link" tabindex="0" @click="openWithBooking('/multi-hotel-trip/checkout/bevestiging', true)" @keydown.enter="openWithBooking('/multi-hotel-trip/checkout/bevestiging', true)">
          <rect x="20" y="258" width="160" height="190" />
          <text x="100" y="358" text-anchor="middle">Bevestigingspagina</text>
        </g>
        <g class="fl__box fl__box--link" role="link" tabindex="0" @click="openWithBooking('/multi-hotel-trip/checkout/routes')" @keydown.enter="openWithBooking('/multi-hotel-trip/checkout/routes')">
          <rect x="222" y="258" width="160" height="190" />
          <text x="302" y="346" text-anchor="middle">Tips en Routes bij</text>
          <text x="302" y="370" text-anchor="middle">deze vakantie</text>
        </g>
        <!-- Pijlen naar Tips en Routes: vanuit de accountomgeving, de bevestigingspagina en de boekingsbevestiging -->
        <line class="fl__arrow" x1="180" y1="110" x2="296" y2="256" marker-end="url(#fl-arrow)" />
        <line class="fl__arrow" x1="180" y1="353" x2="220" y2="353" marker-end="url(#fl-arrow)" />
        <path class="fl__arrow" d="M180 735 H302 V450" marker-end="url(#fl-arrow)" fill="none" />

        <!-- Tijdlijn -->
        <line class="fl__timeline" x1="70" y1="560" x2="985" y2="560" />
        <g v-for="m in milestones" :key="m.x">
          <line class="fl__tick" :x1="m.x" y1="505" :x2="m.x" y2="540" />
          <text class="fl__label" :x="m.star ? m.x + 52 : m.x" y="462" text-anchor="middle">{{ m.label[0] }}</text>
          <text class="fl__label" :x="m.star ? m.x + 52 : m.x" y="488" text-anchor="middle">{{ m.label[1] }}</text>
          <polygon v-if="m.star" class="fl__star" :points="star(m.x + 52, 560)" />
          <circle class="fl__dot" :cx="m.x" cy="560" r="18" />
        </g>

        <!-- Mails onder de tijdlijn -->
        <line class="fl__tick" x1="95" y1="578" x2="95" y2="638" />
        <g class="fl__box fl__box--link" role="link" tabindex="0" @click="go('/multi-hotel-trip/emails/vakantie-bevestiging')" @keydown.enter="go('/multi-hotel-trip/emails/vakantie-bevestiging')">
          <rect x="20" y="640" width="160" height="190" />
          <text x="100" y="735" text-anchor="middle">Boekingsbevestiging</text>
          <g transform="translate(70 760)">
            <rect class="fl__env" width="60" height="42" rx="3" />
            <path class="fl__env-flap" d="M0 0l30 24L60 0" />
          </g>
        </g>
        <line class="fl__tick" x1="435" y1="578" x2="435" y2="638" />
        <g class="fl__box fl__box--link" role="link" tabindex="0" @click="go('/multi-hotel-trip/emails/vakantie-pre-travel')" @keydown.enter="go('/multi-hotel-trip/emails/vakantie-pre-travel')">
          <rect x="355" y="640" width="160" height="190" />
          <text x="435" y="735" text-anchor="middle">Pre-travel</text>
          <g transform="translate(405 760)">
            <rect class="fl__env" width="60" height="42" rx="3" />
            <path class="fl__env-flap" d="M0 0l30 24L60 0" />
          </g>
        </g>
        <g v-for="cm in checkinMails" :key="cm.label" class="fl__box fl__box--static">
          <path class="fl__tick" :d="`M${cm.dot} 578 V600 H${cm.x + 45} V638`" fill="none" marker-end="url(#fl-arrow)" />
          <rect :x="cm.x" y="640" width="90" height="110" />
          <text class="fl__small" :x="cm.x + 45" y="686" text-anchor="middle">{{ cm.label }}</text>
          <text class="fl__small fl__small--muted" :x="cm.x + 45" y="702" text-anchor="middle">volgt</text>
          <g :transform="`translate(${cm.x + 27} 712)`">
            <rect class="fl__env" width="36" height="25" rx="2" />
            <path class="fl__env-flap" d="M0 0l18 14L36 0" />
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.fl { min-height: 100vh; background: #fff; padding: 32px 20px 64px; font-family: var(--font-body); color: var(--color-text-primary); }
.fl__wrap { max-width: 1100px; margin: 0 auto; }
.fl__back { display: inline-block; margin-bottom: 20px; color: var(--color-text-secondary); text-decoration: none; font-size: 14px; }
.fl__back:hover { color: var(--color-primary); }
.fl__title { margin: 0 0 8px; font-family: var(--font-heading); font-size: 32px; font-weight: 700; }
.fl__lead { margin: 0 0 24px; max-width: 720px; font-size: 15px; color: var(--color-text-secondary); }
.fl__svg { display: block; width: 100%; height: auto; font-family: var(--font-body); }

.fl__box rect { fill: #fff; stroke: #1a1e1e; stroke-width: 1.5; }
.fl__box text { font-size: 17px; fill: #1a1e1e; }
.fl__box .fl__small { font-size: 11px; }
.fl__small--muted { fill: #8a8a8a; }
.fl__box--static rect { stroke: #b5b5b5; }
.fl__box--static text { fill: #6b6b6b; }
.fl__box--link { cursor: pointer; }
.fl__box--link rect { transition: stroke var(--transition-fast), fill var(--transition-fast); }
.fl__box--link:hover rect, .fl__box--link:focus-visible rect { stroke: var(--color-primary); stroke-width: 2.5; fill: #fff7f0; }
.fl__box--link:hover text { fill: var(--color-primary); }
.fl__box--link:focus-visible { outline: none; }
.fl__env { fill: #f2f2f2; stroke: #9a9a9a; stroke-width: 1.2; }
.fl__env-flap { fill: none; stroke: #9a9a9a; stroke-width: 1.2; }
.fl__arrow { stroke: #1a1e1e; stroke-width: 1.5; }
.fl__timeline { stroke: #1a1e1e; stroke-width: 7; stroke-linecap: round; }
.fl__tick { stroke: #5a5a5a; stroke-width: 1.5; }
.fl__dot { fill: var(--color-primary, #ff7e00); stroke: #1a1e1e; stroke-width: 1.5; }
.fl__star { fill: #1a1e1e; }
.fl__label { font-size: 18px; fill: #1a1e1e; }
@media (max-width: 800px) {
  .fl { padding: 20px 12px 40px; }
  .fl__title { font-size: 24px; }
}
</style>
