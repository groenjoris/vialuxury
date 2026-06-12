/**
 * SSR-safe reactive media query.
 * Starts at `false` on SSR and hydrates to the actual match on mount,
 * then stays in sync with viewport changes.
 *
 * @param query A CSS media query string, e.g. `'(max-width: 800px)'`.
 * @returns A reactive boolean ref that is `true` while the query matches.
 *
 * @example
 *   const isWide = useMediaQuery('(min-width: 1200px)')
 */
export function useMediaQuery(query: string) {
  const matches = ref(false)

  const update = () => {
    if (typeof window === 'undefined') return
    matches.value = window.matchMedia(query).matches
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

  return matches
}

/**
 * SSR-safe reactive flag for a mobile viewport.
 * Convenience wrapper around {@link useMediaQuery} using a max-width
 * breakpoint.
 *
 * @param breakpoint Max viewport width (px) considered "mobile". Defaults to 800.
 * @returns A reactive boolean ref that is `true` on mobile-width viewports.
 *
 * @example
 *   const isMobile = useIsMobile()       // < 800px
 *   const isMobile = useIsMobile(768)    // custom breakpoint
 */
export function useIsMobile(breakpoint = 800) {
  return useMediaQuery(`(max-width: ${breakpoint}px)`)
}
