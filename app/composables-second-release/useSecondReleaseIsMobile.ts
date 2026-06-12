/**
 * SSR-safe reactive media query for mobile viewport (< 800px).
 * Starts at `false` on SSR and hydrates to the actual match on mount.
 * The 800 px breakpoint (bumped from the earlier 768 px) keeps the
 * desktop dock visible right up to small-tablet width, then swaps it
 * for the compact mobile search trigger.
 */
export function useSecondReleaseIsMobile(query = '(max-width: 800px)') {
  const isMobile = ref(false)

  const update = () => {
    if (typeof window === 'undefined') return
    isMobile.value = window.matchMedia(query).matches
  }

  onMounted(() => {
    update()
    const mql = window.matchMedia(query)
    if (mql.addEventListener) mql.addEventListener('change', update)
    else mql.addListener(update) // legacy
    onBeforeUnmount(() => {
      if (mql.removeEventListener) mql.removeEventListener('change', update)
      else mql.removeListener(update)
    })
  })

  return isMobile
}
