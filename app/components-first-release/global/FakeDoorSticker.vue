<script setup lang="ts">
// Stikkertje "Fake door flex reisgezelschap" linksboven op elke R1-pagina zolang de fake door-vlag
// aanstaat (zie useFirstReleaseFakeDoor): dezelfde vorm als het MVP-stikkertje (oranje pil in de
// hoek), zodat niemand in de war raakt over welke variant hij bekijkt. Staat in de drie R1-headers
// (SiteHeader, CheckoutTopNav, CheckoutMobileHeader); de header zelf is de positioneringscontext.
import { useFirstReleaseFakeDoor } from '~/composables-first-release/useFirstReleaseFakeDoor'

const { enabled } = useFirstReleaseFakeDoor()
</script>

<template>
  <span v-if="enabled" class="fd-sticker" aria-hidden="true">Fake door flex reisgezelschap</span>
</template>

<style scoped>
.fd-sticker {
  position: absolute; top: 4px; left: 8px; z-index: 700; pointer-events: none;
  display: inline-block; padding: 2px 7px; border-radius: 999px; background: var(--color-primary); color: #fff;
  font-family: var(--font-body); font-size: 9px; line-height: 1.3; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; white-space: nowrap; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
</style>
