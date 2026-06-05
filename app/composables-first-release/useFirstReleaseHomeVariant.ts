/**
 * First Release home variant + hero-photo carousel state.
 *
 * The variant-switcher carousel (variants 2-7) has been removed.
 * The prototype now ships a single homepage at `/first-release/home`
 * that always renders as "variant 1". `frNavVariant` is kept as a
 * read-only ref locked to '1' so existing CSS selectors
 * (`.site-header--nav-v1`, `.site-header--nav-v6`, etc.) and any
 * legacy call-sites continue to work without changes.
 *
 * The hero-photo switcher (cycles 8 background photos behind the
 * homepage hero) is preserved — that's a different control.
 */

type HomeVariant = '1' | 'hf'
type FrNavVariant = '1' | '2' | '3' | '4' | '5' | '6' | '7'

const homeVariant = ref<HomeVariant>('1')
const frNavVariant = ref<FrNavVariant>('1')

/* ─────────── Hero photo carousel ─────────── */
const HERO_PHOTOS: readonly string[] = [
  '/images/hero/spa-van-oys.jpg',                     // 1 — default hero (swapped from 8)
  '/images/hero/hotelexperiencepackages.jpeg',        // 2
  '/images/hero/seapackages.png',                     // 3
  '/images/hero/Haarlem%201.jpg',                     // 4
  '/images/hero/Wellness.png',                        // 5
  '/images/hero/iStock-1302699365.jpg',               // 6
  '/images/hero/prd.lil.the.big.%C2%A9..jpg',         // 7  (© URL-encoded)
  '/images/home-hero.jpg',                            // 8 — original hero (swapped from 1)
] as const

const STORAGE_KEY_HERO = 'vl_fr_hero_photo'
const heroPhotoIndex = ref(0)

/* ─────────── Mobile home/nav LAYOUT variant (1–4) ───────────
 * Independent of the legacy frNavVariant / data-fr-variant=6. Drives the
 * mobile-only home-hero + header layouts via `data-fr-home-variant` on
 * <html>; all variant CSS lives in app/assets/css/fr-home-variants.css. */
type HomeLayoutVariant = '1' | '2' | '3' | '4'
const STORAGE_KEY_HOME_VARIANT = 'vl_fr_home_variant'
const homeLayoutVariant = ref<HomeLayoutVariant>('1')

if (import.meta.client) {
  watch(homeLayoutVariant, (v) => {
    if (typeof document === 'undefined') return
    document.documentElement.dataset.frHomeVariant = v
  }, { immediate: true })
}

/* All FR pages share the v6 design (1200 px grid + refreshed
 * search / deal pages). Apply the data attribute unconditionally so
 * the relevant CSS overrides fire on every FR page. */
if (import.meta.client) {
  watch(frNavVariant, () => {
    if (typeof document === 'undefined') return
    document.documentElement.dataset.frVariant = '6'
  }, { immediate: true })
}

export function useFirstReleaseHomeVariant() {
  /* ─────────── Home variant (legacy; locked to '1' / 'hf') ─────────── */
  function setHomeVariant(v: HomeVariant) {
    homeVariant.value = v
  }

  function restoreHomeVariant(routePath?: string) {
    if (!import.meta.client) return
    if (routePath && routePath.startsWith('/hotel-first')) { setHomeVariant('hf'); return }
    setHomeVariant('1')
  }

  /** Logo / nav home link — single canonical home page. */
  const homeHref = computed(() => '/first-release/home')

  /* ─────────── Nav-variant API (no-op; locked to '1') ─────────── */
  function setFrNavVariant(_v: FrNavVariant) {
    // Variant switcher removed — value is permanently '1'. Kept as a
    // no-op so existing call-sites (`setFrNavVariant('1')` in
    // onMounted hooks) compile without changes.
  }

  function restoreFrNavVariant(_routePath?: string) {
    // No-op — see setFrNavVariant.
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

  /* ─────────── Mobile home/nav layout variant API ─────────── */
  function setHomeLayoutVariant(v: HomeLayoutVariant) {
    homeLayoutVariant.value = v
    if (import.meta.client) {
      try { localStorage.setItem(STORAGE_KEY_HOME_VARIANT, v) } catch { /* ignore */ }
    }
  }

  function restoreHomeLayoutVariant() {
    if (!import.meta.client) return
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HOME_VARIANT)
      if (stored === '1' || stored === '2' || stored === '3' || stored === '4') {
        homeLayoutVariant.value = stored
      }
    } catch { /* ignore */ }
  }

  return {
    homeLayoutVariant,
    setHomeLayoutVariant,
    restoreHomeLayoutVariant,
    homeVariant,
    setHomeVariant,
    restoreHomeVariant,
    homeHref,
    // Nav-variant (no-op stubs)
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
