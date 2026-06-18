import { onMounted, onUnmounted, type Ref } from 'vue'

/**
 * Calls `handler` to DISMISS a popup when the user either:
 *   - presses the mouse down outside the referenced element(s), or
 *   - presses Escape (keyboard-only users need a way out — WCAG 2.1.1).
 *
 * Pass a single ref or an array of refs (any inside-the-set click counts as
 * inside). The listeners are attached on mount and detached on unmount.
 *
 * Example:
 *   const dropdownEl = ref<HTMLElement | null>(null)
 *   useFirstReleaseClickOutside(dropdownEl, () => isOpen.value = false)
 */
export function useFirstReleaseClickOutside(
  target: Ref<HTMLElement | null> | Array<Ref<HTMLElement | null>>,
  handler: (e: MouseEvent | KeyboardEvent) => void,
) {
  const refs = Array.isArray(target) ? target : [target]

  function onDocClick(e: MouseEvent) {
    const t = e.target as Node | null
    if (!t) return
    for (const r of refs) {
      const el = r.value
      if (el && el.contains(t)) return
    }
    handler(e)
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') handler(e)
  }

  onMounted(() => {
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKeydown)
  })
  onUnmounted(() => {
    document.removeEventListener('mousedown', onDocClick)
    document.removeEventListener('keydown', onKeydown)
  })
}
