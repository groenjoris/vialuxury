// Fake door-test "variabel reisgezelschap" heeft een eigen, deelbare URL: /first-release/fake-door
// is de homepage van het Redesign (alias van /first-release/home, zie nuxt.config.ts) mét de vlag
// aan. Wie de URL opent krijgt de vlag (cookie; ook server-side, zodat de eerste render al klopt),
// de rest van het prototype werkt daarna op die cookie. Zolang de vlag aanstaat wijst de gewone
// home-URL terug naar de fake door-URL, zodat de adresbalk op de homepage altijd de deelbare link
// toont. Uitzetten gaat via elke andere startknop op het startscherm.
import { useFirstReleaseFakeDoor } from '~/composables-first-release/useFirstReleaseFakeDoor'

export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/first-release/fake-door') {
    const { enabled, enable } = useFirstReleaseFakeDoor()
    if (!enabled.value) enable()
    return
  }
  if (to.path === '/first-release/home') {
    const { enabled } = useFirstReleaseFakeDoor()
    if (enabled.value) return navigateTo({ path: '/first-release/fake-door', query: to.query, hash: to.hash }, { replace: true })
  }
})
