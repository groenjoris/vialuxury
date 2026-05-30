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
 * Gated by an `enabled` ref. When `enabled.value === false`, the
 * composable detaches listeners AND CLEARS the inline
 * `style.bottom` it previously wrote, so the element falls back
 * to whatever its CSS dictates. This is critical because the
 * deal/hotel CTA bars share one element across desktop (top
 * sticky header) and mobile (bottom sticky footer) — leaving an
 * inline `bottom: 0` on desktop would stretch the bar full-height.
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
  // Largest visible-viewport height we've observed = the
  // chrome-HIDDEN (full) height. Tracked because `window.innerHeight`
  // is unreliable across mobile browsers (iOS Safari keeps it at the
  // full height; iOS Chrome shrinks it with the toolbar). We never
  // need it to shrink, so a running max is the safe reference.
  let maxVVH = 0

  function clearInline() {
    const el = target.value
    if (el) el.style.bottom = ''
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
    if (vv.height > maxVVH) maxVVH = vv.height
    // "Full" height = the tallest the viewport can be (chrome hidden).
    // Take the MAX of every metric so we get the right reference no
    // matter which value a given browser ties to the chrome.
    const fullH = Math.max(
      maxVVH,
      window.innerHeight || 0,
      document.documentElement.clientHeight || 0,
    )
    // How far the VISIBLE bottom sits above a `position: fixed;
    // bottom: 0` line (the layout-viewport bottom). When the chrome
    // is showing this is positive → lift the bar to sit on the
    // visible bottom; when the chrome is gone it's 0 → bar drops to
    // the real bottom (CSS `bottom: 0`).
    const offset = Math.max(0, Math.round(fullH - (vv.offsetTop + vv.height)))
    if (offset === 0) {
      clearInline()
    } else {
      el.style.bottom = `${offset}px`
    }
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
