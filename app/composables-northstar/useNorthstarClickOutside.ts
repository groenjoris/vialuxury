import { onMounted, onUnmounted, type Ref } from 'vue'

/**
 * Calls `handler` when a mousedown occurs outside the referenced element(s).
 * Pass a single ref or an array of refs (any inside-the-set click counts as inside).
 * The listener is automatically attached on mount and detached on unmount.
 *
 * Example:
 *   const dropdownEl = ref<HTMLElement | null>(null)
 *   useNorthstarClickOutside(dropdownEl, () => isOpen.value = false)
 */
export function useNorthstarClickOutside(
  target: Ref<HTMLElement | null> | Array<Ref<HTMLElement | null>>,
  handler: (e: MouseEvent) => void,
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

  onMounted(() => document.addEventListener('mousedown', onDocClick))
  onUnmounted(() => document.removeEventListener('mousedown', onDocClick))
}
