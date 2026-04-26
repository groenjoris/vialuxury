/**
 * SSR-safe reactive media query for mobile viewport (< 768px).
 * Starts at `false` on SSR and hydrates to the actual match on mount.
 */
export function useIsMobile(query = '(max-width: 768px)') {
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
