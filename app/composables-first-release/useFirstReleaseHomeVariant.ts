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

/**
 * Variant values:
 *  - '1' / '2' / '3' / '4' / '5'  — experimental "nieuwe huisstijl" homepages
 *    that share the right-edge carousel switcher
 *  - 'hf'                         — first-release "Hotel First" page
 *    (production-bound, no switcher)
 */
type HomeVariant = '1' | '2' | '3' | '4' | '5' | 'hf'

const STORAGE_KEY = 'vl_home_variant'
const homeVariant = ref<HomeVariant>('1')

/**
 * Independent nav-bar variant for the First Release tree. Picks one of
 * three SiteHeader layouts that the homepage carousel toggles between.
 * Persisted separately from the (legacy) `homeVariant` above so the two
 * don't collide.
 *
 * - '1' → today's 2-row dark nav (logo + payoff+stroke + verticals + phone).
 * - '2' → single-row centred-logo nav (slimmer).
 * - '3' → 2-row reorganised (logo+verticals on top, payoff+phone below).
 */
type FrNavVariant = '1' | '2' | '3' | '4' | '5'

const STORAGE_KEY_NAV = 'vl_fr_nav_variant'
const frNavVariant = ref<FrNavVariant>('1')

/* ─────────── Hero photo carousel ───────────
 *  Independent of the nav-variant carousel — switches the background
 *  image of the home page's hero section. The four starter photos
 *  come from `assets/images/hero/` (copied to `public/images/hero/`). */
const HERO_PHOTOS: readonly string[] = [
  '/images/home-hero.jpg',                            // 1 — original hero
  '/images/hero/hotelexperiencepackages.jpeg',        // 2
  '/images/hero/seapackages.png',                     // 3
  '/images/hero/Haarlem%201.jpg',                     // 4
  '/images/hero/Wellness.png',                        // 5
  '/images/hero/iStock-1302699365.jpg',               // 6
  '/images/hero/prd.lil.the.big.%C2%A9..jpg',         // 7  (© URL-encoded)
  '/images/hero/spa-van-oys.jpg',                     // 8
] as const

const STORAGE_KEY_HERO = 'vl_fr_hero_photo'
const heroPhotoIndex = ref(0)

export function useFirstReleaseHomeVariant() {
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
    if (routePath && routePath.startsWith('/hotel-first')) { setHomeVariant('hf'); return }
    if (routePath && routePath.startsWith('/home-v5'))     { setHomeVariant('5'); return }
    if (routePath && routePath.startsWith('/home-v4'))     { setHomeVariant('4'); return }
    if (routePath && routePath.startsWith('/home-v3'))     { setHomeVariant('3'); return }
    if (routePath && routePath.startsWith('/home-v2'))     { setHomeVariant('2'); return }
    if (routePath === '/home')                             { setHomeVariant('1'); return }
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as HomeVariant | null
      if (stored === '1' || stored === '2' || stored === '3' || stored === '4' || stored === '5' || stored === 'hf') homeVariant.value = stored
    } catch { /* ignore */ }
  }

  /** Computed href that points at the user's active home variant.
   *  Tracks the new `frNavVariant` carousel so the SiteHeader logo
   *  routes to the matching home from any FR page. */
  const homeHref = computed(() => {
    if (frNavVariant.value === '5') return '/first-release/home-v5'
    if (frNavVariant.value === '4') return '/first-release/home-v4'
    if (frNavVariant.value === '3') return '/first-release/home-v3'
    if (frNavVariant.value === '2') return '/first-release/home-v2'
    return '/first-release/home'
  })

  /* ─────────── Nav-variant API (carousel) ─────────── */

  function setFrNavVariant(v: FrNavVariant) {
    frNavVariant.value = v
    if (import.meta.client) {
      try { localStorage.setItem(STORAGE_KEY_NAV, v) } catch { /* ignore */ }
    }
  }

  /**
   * Restore the nav variant on mount. URL wins → localStorage falls
   * back → default '1'. Pass `route.path` from any FR page; pages that
   * don't match a `/home`, `/home-v2`, `/home-v3` route simply pick up
   * whatever was previously stored.
   */
  function restoreFrNavVariant(routePath?: string) {
    if (!import.meta.client) return
    if (routePath && routePath.startsWith('/first-release/home-v5')) { setFrNavVariant('5'); return }
    if (routePath && routePath.startsWith('/first-release/home-v4')) { setFrNavVariant('4'); return }
    if (routePath && routePath.startsWith('/first-release/home-v3')) { setFrNavVariant('3'); return }
    if (routePath && routePath.startsWith('/first-release/home-v2')) { setFrNavVariant('2'); return }
    if (routePath === '/first-release/home')                         { setFrNavVariant('1'); return }
    try {
      const stored = localStorage.getItem(STORAGE_KEY_NAV) as FrNavVariant | null
      if (stored === '1' || stored === '2' || stored === '3' || stored === '4' || stored === '5') frNavVariant.value = stored
    } catch { /* ignore */ }
  }

  /* ─────────── Hero photo carousel API ─────────── */

  const heroPhotos = HERO_PHOTOS
  const heroPhotoUrl = computed(() => HERO_PHOTOS[heroPhotoIndex.value] ?? HERO_PHOTOS[0])

  function setHeroPhotoIndex(idx: number) {
    const clamped = ((idx % HERO_PHOTOS.length) + HERO_PHOTOS.length) % HERO_PHOTOS.length
    heroPhotoIndex.value = clamped
    if (import.meta.client) {
      try { localStorage.setItem(STORAGE_KEY_HERO, String(clamped)) } catch { /* ignore */ }
    }
  }

  function restoreHeroPhotoIndex() {
    if (!import.meta.client) return
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HERO)
      const n = stored == null ? NaN : parseInt(stored, 10)
      if (Number.isFinite(n) && n >= 0 && n < HERO_PHOTOS.length) heroPhotoIndex.value = n
    } catch { /* ignore */ }
  }

  return {
    homeVariant,
    setHomeVariant,
    restoreHomeVariant,
    homeHref,
    // Nav-variant carousel
    frNavVariant,
    setFrNavVariant,
    restoreFrNavVariant,
    // Hero photo carousel
    heroPhotos,
    heroPhotoIndex,
    heroPhotoUrl,
    setHeroPhotoIndex,
    restoreHeroPhotoIndex,
  }
}
