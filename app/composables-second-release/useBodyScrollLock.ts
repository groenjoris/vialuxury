/**
 * Body scroll lock with refcounting.
 *
 * Multiple modals / sidepanels can call `acquire()` concurrently;
 * the body stays locked until every caller has released. Desktop/Android:
 * `overflow: hidden` (+ scrollbar-compensatie) — de pagina beweegt niet.
 * Alleen op iOS de `position: fixed; top: -scrollY` trick (with
 * restoration on release) so the rubber-band scroll behind the
 * modal is fully suppressed — `overflow: hidden` alone doesn't
 * prevent touch-scrolling on iOS Safari.
 */
import { ref, watch } from 'vue'

const lockCount = ref(0)
let savedScrollY = 0
let active = false

/** iOS Safari negeert `overflow: hidden` op de body voor touch-scrollen; alleen
 *  daar is de `position: fixed`-truc nodig. Elders volstaat overflow: hidden —
 *  de scrollpositie blijft dan gewoon staan en de pagina beweegt niet bij het
 *  openen of sluiten van een panel/pop-up. */
function needsFixedBody(): boolean {
  const ua = navigator.userAgent
  return /iP(hone|ad|od)/.test(ua) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform))
}
let usedFixed = false

function applyLock() {
  if (active || typeof document === 'undefined') return
  active = true
  savedScrollY = window.scrollY
  const body = document.body
  usedFixed = needsFixedBody()
  if (usedFixed) {
    body.style.position = 'fixed'
    body.style.top = `-${savedScrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
  } else {
    // Compenseer de verdwijnende scrollbalk zodat de inhoud niet verspringt.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`
  }
  body.style.overflow = 'hidden'
  // touchmove no-op listener as belt-and-suspenders on iOS.
  document.addEventListener('touchmove', preventTouch, { passive: false })
}

function releaseLock() {
  if (!active || typeof document === 'undefined') return
  active = false
  const body = document.body
  body.style.overflow = ''
  body.style.paddingRight = ''
  if (usedFixed) {
    body.style.position = ''
    body.style.top = ''
    body.style.left = ''
    body.style.right = ''
    body.style.width = ''
    // Direct terug naar de bewaarde positie — zonder de smooth scroll van
    // `html { scroll-behavior: smooth }`, anders scrolt de pagina zichtbaar
    // naar boven en weer omlaag.
    const root = document.documentElement
    const prev = root.style.scrollBehavior
    root.style.scrollBehavior = 'auto'
    window.scrollTo({ top: savedScrollY, left: 0, behavior: 'instant' as ScrollBehavior })
    root.style.scrollBehavior = prev
  }
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

export function useBodyScrollLock() {
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
