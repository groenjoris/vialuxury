/**
 * Pin an element to the BOTTOM of the VISUAL viewport (not the
 * layout viewport). On mobile browsers, `position: fixed; bottom: 0`
 * can desync from the visual viewport bottom when the browser
 * chrome (URL bar, bottom toolbar) animates: on Chrome Android the
 * fixed element follows the LAYOUT viewport, leaving the
 * page-scroll showing between the bar and the actual visible
 * bottom — the "bridge" effect.
 *
 * This composable uses `window.visualViewport` to compute the
 * dynamic offset between the layout-bottom and the visual-bottom,
 * then sets `bar.style.bottom = offset + 'px'` so the element
 * always sits flush with the visible bottom edge as the chrome
 * collapses / re-expands.
 *
 * Pass a template ref or a HTMLElement getter. The composable
 * attaches listeners on mount and tears them down on unmount.
 *
 * Use alongside `position: fixed; bottom: 0` in CSS — the JS
 * just overrides `bottom` when needed. If `visualViewport` is
 * unsupported (very old browsers), the element falls back to the
 * CSS `bottom: 0`.
 */
import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'

type ElGetter = () => HTMLElement | null | undefined

export function usePinToViewportBottom(
  target: Ref<HTMLElement | null | undefined> | ElGetter,
) {
  function resolveEl(): HTMLElement | null {
    if (typeof target === 'function') return target() ?? null
    return (target.value as HTMLElement | null) ?? null
  }

  function update() {
    if (typeof window === 'undefined') return
    const el = resolveEl()
    if (!el) return
    const vv = window.visualViewport
    if (!vv) {
      el.style.bottom = '0px'
      return
    }
    // Distance between the layout-viewport's bottom edge and the
    // VISUAL viewport's bottom edge. When the browser chrome is
    // showing, vv.offsetTop + vv.height < window.innerHeight, so
    // `offset` is positive — push the bar UP by that many px to
    // sit at the visible bottom. When chrome is hidden, offset
    // == 0 and the bar pins flush at bottom: 0.
    const offset = Math.max(
      0,
      window.innerHeight - (vv.offsetTop + vv.height),
    )
    el.style.bottom = `${offset}px`
  }

  function attach() {
    if (typeof window === 'undefined') return
    const vv = window.visualViewport
    if (vv) {
      vv.addEventListener('resize', update)
      vv.addEventListener('scroll', update)
    }
    window.addEventListener('orientationchange', update)
    window.addEventListener('scroll', update, { passive: true })
    // Initial sync after the layout settles.
    requestAnimationFrame(update)
  }

  function detach() {
    if (typeof window === 'undefined') return
    const vv = window.visualViewport
    if (vv) {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
    window.removeEventListener('orientationchange', update)
    window.removeEventListener('scroll', update)
  }

  onMounted(attach)
  onBeforeUnmount(detach)

  // Re-sync when the target ref changes (e.g. v-if mount).
  if (typeof target !== 'function') {
    watch(target, () => requestAnimationFrame(update), { flush: 'post' })
  }

  return { update }
}
