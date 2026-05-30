/**
 * SPEC: docs/MOBILE-STICKY-SPEC.md §2 — the deal/hotel BOTTOM
 * footer pin. This is NOT for the /search top toolbar (that's
 * position: sticky; see §1). Keep the two separate.
 *
 * Pin an element to the BOTTOM of the VISUAL viewport (not the
 * layout viewport). On mobile browsers, `position: fixed; bottom: 0`
 * can desync from the visual viewport bottom when the browser
 * chrome (URL bar, bottom toolbar) animates — leaving a "bridge"
 * gap below the element where page content scrolls through.
 *
 * Mechanism: position the bar via inline `top` (with `bottom:auto`)
 * so its BOTTOM edge lands exactly on `visualViewport.offsetTop +
 * visualViewport.height` — the live visible bottom. It therefore
 * stays glued to the bottom toolbar when the chrome is shown and
 * drops to the screen bottom when the chrome hides. No "full
 * viewport height" guess (that over-lifted the bar on momentum /
 * overscroll, leaving it floating up the screen).
 *
 * Gated by an `enabled` ref. When `enabled.value === false`, the
 * composable detaches listeners AND CLEARS the inline `top`/`bottom`
 * it wrote, so the element falls back to its CSS. This matters
 * because the deal/hotel CTA bars share one element across desktop
 * (top sticky header) and mobile (bottom sticky footer).
 *
 * Use:
 *   const isMobile = useFirstReleaseIsMobile()
 *   const barRef = ref<HTMLElement | null>(null)
 *   usePinToViewportBottom(barRef, isMobile)
 *
 * Falls back silently to CSS on browsers without `visualViewport`.
 */
import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'

export function usePinToViewportBottom(
  target: Ref<HTMLElement | null | undefined>,
  enabled: Ref<boolean>,
) {
  let attached = false

  function clearInline() {
    const el = target.value
    if (el) { el.style.top = ''; el.style.bottom = '' }
  }

  function update() {
    if (typeof window === 'undefined') return
    if (!enabled.value) {
      clearInline()
      return
    }
    const el = target.value
    if (!el) return
    const vv = window.visualViewport
    if (!vv) {
      // No visualViewport API — leave the CSS rule alone.
      clearInline()
      return
    }
    // Pin the bar's BOTTOM directly to the visible-viewport bottom.
    // `vv.offsetTop + vv.height` is the visible bottom expressed in
    // the fixed element's coordinate space (the layout viewport).
    // Position via `top` (bottom:auto) so the bar's bottom edge lands
    // exactly there — glued to the bottom toolbar when chrome shows,
    // dropping to the screen bottom when chrome hides. No "full
    // height" guess (which over-lifted on momentum/overscroll).
    const barH = el.getBoundingClientRect().height
    const topPx = Math.round(vv.offsetTop + vv.height - barH)
    el.style.bottom = 'auto'
    el.style.top = `${topPx}px`
  }

  function attach() {
    if (attached || typeof window === 'undefined') return
    attached = true
    const vv = window.visualViewport
    if (vv) {
      vv.addEventListener('resize', update)
      vv.addEventListener('scroll', update)
    }
    // The chrome collapses DURING a page scroll, so listen to that
    // too (belt-and-suspenders alongside the visualViewport events).
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('orientationchange', update)
    requestAnimationFrame(update)
  }

  function detach() {
    if (!attached || typeof window === 'undefined') return
    attached = false
    const vv = window.visualViewport
    if (vv) {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
    window.removeEventListener('scroll', update)
    window.removeEventListener('orientationchange', update)
    clearInline()
  }

  onMounted(() => {
    if (enabled.value) attach()
  })
  onBeforeUnmount(detach)

  // React to enable/disable flips (e.g. user resizes browser
  // across the mobile breakpoint).
  watch(enabled, (on) => {
    if (on) attach()
    else detach()
  })

  // Re-sync when the target ref changes (v-if mount).
  watch(target, () => requestAnimationFrame(update), { flush: 'post' })
}
