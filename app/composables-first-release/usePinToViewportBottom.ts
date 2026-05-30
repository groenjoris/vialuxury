/**
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
    // Distance between layout-viewport bottom and visual-viewport
    // bottom. When the browser chrome is showing, this is positive
    // and we lift the bar by that many px to sit at the visible
    // bottom. When chrome is collapsed, offset == 0 → no override.
    const offset = Math.max(
      0,
      window.innerHeight - (vv.offsetTop + vv.height),
    )
    if (offset === 0) {
      // CSS already pins to bottom: 0 on mobile; don't write an
      // identical inline style (avoids any layout thrash).
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
