/**
 * Body scroll lock with refcounting.
 *
 * Multiple modals / sidepanels can call `acquire()` concurrently;
 * the body stays locked until every caller has released. On iOS
 * we use the `position: fixed; top: -scrollY` trick (with
 * restoration on release) so the rubber-band scroll behind the
 * modal is fully suppressed — `overflow: hidden` alone doesn't
 * prevent touch-scrolling on iOS Safari.
 */
import { ref, watch } from 'vue'

const lockCount = ref(0)
let savedScrollY = 0
let active = false

function applyLock() {
  if (active || typeof document === 'undefined') return
  active = true
  savedScrollY = window.scrollY
  const body = document.body
  body.style.position = 'fixed'
  body.style.top = `-${savedScrollY}px`
  body.style.left = '0'
  body.style.right = '0'
  body.style.width = '100%'
  body.style.overflow = 'hidden'
  // touchmove no-op listener as belt-and-suspenders on iOS.
  document.addEventListener('touchmove', preventTouch, { passive: false })
}

function releaseLock() {
  if (!active || typeof document === 'undefined') return
  active = false
  const body = document.body
  body.style.position = ''
  body.style.top = ''
  body.style.left = ''
  body.style.right = ''
  body.style.width = ''
  body.style.overflow = ''
  window.scrollTo(0, savedScrollY)
  document.removeEventListener('touchmove', preventTouch)
}

function preventTouch(e: TouchEvent) {
  // Allow touchmove inside scrollable modal/panel surfaces (they
  // opt in via `data-scroll-lock-allow="true"` on any ancestor).
  let el = e.target as HTMLElement | null
  while (el && el !== document.body) {
    if (el.dataset && el.dataset.scrollLockAllow === 'true') return
    el = el.parentElement
  }
  e.preventDefault()
}

watch(lockCount, (n) => {
  if (n > 0) applyLock()
  else releaseLock()
})

/**
 * Refcounted, iOS-safe body scroll lock.
 *
 * Returns an API to lock/unlock page scrolling. The lock is shared
 * across all callers via an internal refcount, so concurrent modals
 * coexist safely — the body unlocks only once every caller releases.
 *
 * @returns An object with `acquire()`, `release()` and `bindTo()`.
 *
 * @example
 *   const scrollLock = useScrollLock()
 *   scrollLock.acquire()   // lock
 *   scrollLock.release()   // unlock when refcount hits zero
 *
 * @example
 *   // Track an `open` ref automatically:
 *   const stop = useScrollLock().bindTo(isOpen)
 */
export function useScrollLock() {
  return {
    /** Bump the refcount; lock applies on the first acquire. */
    acquire() { lockCount.value++ },
    /** Drop the refcount; lock releases when it hits zero. */
    release() { lockCount.value = Math.max(0, lockCount.value - 1) },
    /**
     * Watcher helper — pass a reactive `open` ref and the lock
     * tracks it automatically. Returns a stop fn (rarely needed
     * since most callers want page-lifetime tracking).
     */
    bindTo(openRef: { value: boolean }) {
      return watch(
        () => openRef.value,
        (open) => {
          if (open) lockCount.value++
          else lockCount.value = Math.max(0, lockCount.value - 1)
        },
        { immediate: true },
      )
    },
  }
}
