import { onBeforeUnmount, watch, nextTick, type Ref } from 'vue'

/**
 * Keyboard focus management for a modal/dialog/side-panel.
 *
 * While `isOpen` is true:
 *   - focus moves into the container (first focusable element, or the
 *     container itself — give it `tabindex="-1"`),
 *   - Tab / Shift+Tab are trapped inside the container,
 *   - Escape calls `opts.onEscape` (if provided).
 * When it closes, focus is restored to the element that was focused before
 * opening. (WCAG 2.4.3 Focus Order / 2.1.2 No Keyboard Trap.)
 */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function useFocusTrap(
  containerRef: Ref<HTMLElement | null>,
  isOpen: Ref<boolean>,
  opts: { onEscape?: () => void } = {},
) {
  let previouslyFocused: HTMLElement | null = null

  function focusables(): HTMLElement[] {
    const el = containerRef.value
    if (!el) return []
    return Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (n) => n.offsetParent !== null || n === document.activeElement,
    )
  }

  function onKeydown(e: KeyboardEvent) {
    if (!isOpen.value) return
    if (e.key === 'Escape' && opts.onEscape) {
      e.stopPropagation()
      opts.onEscape()
      return
    }
    if (e.key !== 'Tab') return
    const items = focusables()
    const container = containerRef.value
    if (!container) return
    if (items.length === 0) {
      e.preventDefault()
      container.focus()
      return
    }
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement as HTMLElement | null
    if (e.shiftKey && (active === first || !container.contains(active))) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }

  watch(
    isOpen,
    (open) => {
      // Client-only: `document` is undefined during SSR.
      if (typeof document === 'undefined') return
      if (open) {
        previouslyFocused = (document.activeElement as HTMLElement) ?? null
        document.addEventListener('keydown', onKeydown, true)
        nextTick(() => {
          const items = focusables()
          ;(items[0] ?? containerRef.value)?.focus()
        })
      } else {
        document.removeEventListener('keydown', onKeydown, true)
        const toRestore = previouslyFocused
        previouslyFocused = null
        if (toRestore && typeof toRestore.focus === 'function') {
          nextTick(() => toRestore.focus())
        }
      }
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    if (typeof document !== 'undefined') document.removeEventListener('keydown', onKeydown, true)
  })
}
