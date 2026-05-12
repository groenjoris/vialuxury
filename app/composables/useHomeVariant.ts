/**
 * Tracks which homepage variant is active for the current visitor.
 *
 * - Variant 1: `/home` (full-bleed hero + bottom search-dock).
 * - Variant 2: `/home-v2` (vertical search-card top-right).
 * - Variant 3: `/home-v3` (contained rounded hero + below-hero search bar).
 *
 * Persisted in localStorage under `vl_home_variant` so navigating back
 * to "home" from anywhere in the site lands the user on their chosen
 * variant. URL wins on direct page loads.
 */

type HomeVariant = '1' | '2' | '3' | '4' | '5'

const STORAGE_KEY = 'vl_home_variant'
const homeVariant = ref<HomeVariant>('1')

export function useHomeVariant() {
  function setHomeVariant(v: HomeVariant) {
    homeVariant.value = v
    if (import.meta.client) {
      try { localStorage.setItem(STORAGE_KEY, v) } catch { /* ignore */ }
    }
  }

  /**
   * Restore the variant on app mount. URL wins → localStorage falls
   * back → default '1'. Pass `route.path` from a page component.
   */
  function restoreHomeVariant(routePath?: string) {
    if (!import.meta.client) return
    if (routePath && routePath.startsWith('/home-v5')) { setHomeVariant('5'); return }
    if (routePath && routePath.startsWith('/home-v4')) { setHomeVariant('4'); return }
    if (routePath && routePath.startsWith('/home-v3')) { setHomeVariant('3'); return }
    if (routePath && routePath.startsWith('/home-v2')) { setHomeVariant('2'); return }
    if (routePath === '/home')                        { setHomeVariant('1'); return }
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as HomeVariant | null
      if (stored === '1' || stored === '2' || stored === '3' || stored === '4' || stored === '5') homeVariant.value = stored
    } catch { /* ignore */ }
  }

  /** Computed href that points at the user's active home variant. */
  const homeHref = computed(() => {
    if (homeVariant.value === '5') return '/home-v5'
    if (homeVariant.value === '4') return '/home-v4'
    if (homeVariant.value === '3') return '/home-v3'
    if (homeVariant.value === '2') return '/home-v2'
    return '/home'
  })

  return { homeVariant, setHomeVariant, restoreHomeVariant, homeHref }
}
