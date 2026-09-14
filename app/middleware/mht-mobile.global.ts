// Multi Hotel Trip checkout — zoals in het echt: op een telefoon krijg je
// automatisch de mobiele checkout-site. Desktoproutes worden op mobiel
// omgeleid naar /multi-hotel-trip/m/checkout/...; de mobiele site blijft
// (net als een echte m-dot site) ook op desktop gewoon bereikbaar.
// Overgenomen uit het flexibel-annuleren prototype (mobile.global.ts), maar
// de UA-check draait hier óók server-side (request header) zodat de redirect
// al in de SSR-response zit — geen desktop-flash en geen hydration mismatch.
export default defineNuxtRouteMiddleware((to) => {
  // De dealpagina is responsive (eigen mobiele weergave) en blijft de start
  // van de checkout; alleen de vervolgstappen hebben een aparte mobiele site.
  const match = to.path.match(/^\/multi-hotel-trip\/checkout\/(datum|kamers)$/)
  if (!match) return

  const ua = import.meta.server
    ? (useRequestHeaders(['user-agent'])['user-agent'] ?? '')
    : navigator.userAgent
  const isMobile = /iPhone|iPod|Windows Phone|Android.*Mobile/i.test(ua)
  if (!isMobile) return
  return navigateTo(`/multi-hotel-trip/m/checkout/${match[1]}`, { replace: true })
})
