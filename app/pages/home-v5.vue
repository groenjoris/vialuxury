<template>
  <div class="home home-v3">
    <!-- Top navigation: solid (dark) SiteHeader, the inline search-bar
         dock is hidden because variant 3 renders its own search bar below
         the hero. No USP top-bar above the navbar in this variant. -->
    <SiteHeader ref="siteHeaderRef" variant="solid" hide-search-dock />

    <!-- Handwritten pay-off rendered directly under the ViaLuxury logo.
         Absolutely positioned so it doesn't disturb the navbar's flex
         layout; `.container` matches the navbar's own horizontal padding
         so the text starts at the logo's left edge. -->
    <div class="home-v3__tagline">
      <div class="container">
        <span class="home-v3__tagline-text">Personally Curated Experiences</span>
      </div>
    </div>

    <!-- Phone / help block: sits directly under the navbar's right-aligned
         action buttons (taalswitch / Leden / Menu) per design. -->
    <div class="home-v3__phone-row">
      <div class="container home-v3__phone-row-inner">
        <svg class="home-v3__phone-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.58 1 1 0 01-.24 1.01l-2.21 2.21z" />
        </svg>
        <span class="home-v3__phone-label">Hulp nodig?</span>
        <a class="home-v3__phone-number" href="tel:+31207052222">+31 20 705 2222</a>
      </div>
    </div>

    <!-- Variant 5: full-bleed hero photo with all content overlaid on
         top. The navbar (above) stays solid black; the photo starts
         immediately below the phone row and fills the entire hero
         section width. -->
    <section class="home-v5__hero">
      <div class="home-v5__hero-bg" />
      <div class="container home-v3__hero-inner home-v5__hero-inner">
        <div class="home-v5__hero-content">
          <h1 class="home-v3__title home-v5__title">
            Experience <span class="home-v3__title-em">more</span>
          </h1>
          <p class="home-v3__pitch home-v5__pitch">
            Onze experience creators stellen complete verblijven samen met luxe extra's en exclusieve voordelen, zodat jij meer beleeft voor een scherpere prijs.
          </p>
          <div class="home-v4__trust home-v5__trust">
            <img src="/images/trustpilot.svg" alt="Trustpilot" class="home-v4__trust-logo" />
            <p class="home-v4__trust-text home-v5__trust-text">15.294 gasten beoordelen ons met een 9 uit 10</p>
          </div>
        </div>

        <!-- SEARCH BAR (4 horizontal fields + Find-deals CTA) -->
        <div class="home-v3__searchbar">
          <button
            type="button"
            class="home-v3__searchfield"
            ref="v3DestField"
            @click="v3TogglePopup('destination')"
          >
            <span class="home-v3__searchfield-label">Waarheen</span>
            <span class="home-v3__searchfield-value" :class="{ 'home-v3__searchfield-value--placeholder': v3DestIsPlaceholder }">{{ v3DestLabel }}</span>
          </button>
          <button
            type="button"
            class="home-v3__searchfield"
            ref="v3WhenField"
            @click="v3TogglePopup('when')"
          >
            <span class="home-v3__searchfield-label">Wanneer en hoelang</span>
            <span class="home-v3__searchfield-value" :class="{ 'home-v3__searchfield-value--placeholder': v3WhenIsPlaceholder }">{{ v3WhenLabel }}</span>
          </button>
          <button
            type="button"
            class="home-v3__searchfield home-v3__searchfield--last"
            ref="v3WhoField"
            @click="v3TogglePopup('who')"
          >
            <span class="home-v3__searchfield-label">Wie gaat er mee</span>
            <span class="home-v3__searchfield-value">{{ v3WhoLabel }}</span>
          </button>
          <button type="button" class="home-v3__searchcta" @click="v3Search">
            <span>Vind deals</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
        </div>

        <!-- Variant 4: single reassurance checkmark under the search bar,
             right-aligned with the bar's right edge. -->
        <div class="home-v4__assurance">
          <span class="home-v4__assurance-item home-v4__assurance-item--end">
            <svg class="home-v4__check" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span class="home-v4__assurance-text">
              Achteraf betalen met
              <img src="/images/logos/klarna.webp" alt="Klarna" class="home-v4__klarna-logo" />
            </span>
          </span>
        </div>
      </div>
    </section>

    <!-- "Uitgelicht" featured deal + "Snel zoeken" filter pills -->
    <section class="home-popular">
      <div class="container home-popular__inner">
        <div class="home-popular__col home-popular__col--press">
          <h3 class="home-popular__heading">Uitgelicht</h3>
          <div v-if="featuredDesIndes && featuredDesIndesDeal" class="home-popular__featured-wrap">
            <DealCard
              class="home-popular__featured"
              :hotel="featuredDesIndes"
              :deal="featuredDesIndesDeal"
              :grid-mode="true"
              :hide-bar="true"
              cta-label="Bekijk arrangement"
            />
            <div class="home-popular__featured-press">
              <span class="home-popular__featured-press-label">Gezien in:</span>
              <img src="/images/logos/nrc.png" alt="NRC" class="home-popular__logo" />
              <img src="/images/logos/telegraaf.png" alt="De Telegraaf" class="home-popular__logo" />
              <img src="/images/logos/nushoplogo.svg" alt="NU shop" class="home-popular__logo" />
            </div>
          </div>
        </div>
        <div class="home-popular__col home-popular__col--quick">
          <h3 class="home-popular__heading">Snel zoeken</h3>
          <div class="home-popular__pills">
            <button
              v-for="f in homeFilters"
              :key="f.id"
              type="button"
              class="home-pill"
              @click="pickFilter(f.id)"
            >
              <span class="home-pill__icon" v-html="POPULAR_FILTER_ICONS[ICON_FOR[f.id]] || POPULAR_FILTER_ICONS.star" />
              <span class="home-pill__label">{{ f.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="home-deals">
      <div class="container">
        <h2 class="home-deals__title">Hoogste ViaLuxury-score</h2>
        <div class="home-deals__grid home-deals__grid--3">
          <DealCard
            v-for="hotel in superDeals"
            :key="hotel.id"
            :hotel="hotel"
            :deal="pickPrimaryDeal(hotel.deals)"
            :grid-mode="true"
            :hide-bar="true"
          />
        </div>
      </div>
    </section>

    <section class="home-deals home-deals--alt">
      <div class="container">
        <h2 class="home-deals__title">Laatste beschikbaarheid</h2>
        <div class="home-deals__grid home-deals__grid--3">
          <DealCard
            v-for="hotel in actueleDeals"
            :key="hotel.id"
            :hotel="hotel"
            :deal="pickPrimaryDeal(hotel.deals)"
            :grid-mode="true"
            :hide-bar="true"
          />
        </div>
      </div>
    </section>

    <SiteFooter />

    <!-- Subtle right-edge carousel control for variant-hopping. -->
    <HomeVariantSwitcher current="5" />
  </div>
</template>

<script setup lang="ts">
import { POPULAR_FILTER_ICONS } from '~/utils/popularFilterIcons'
import { mappedHotels } from '~/data/deals-mapper'
import type { SearchHotel } from '~/types/searchHotel'
import { pickPrimaryDeal } from '~/utils/primaryDeal'
import { FILTER_TAGS, getFilterTag } from '~/utils/filterTags'

// Super deals: top 3 by stars + discount.
const superDeals: SearchHotel[] = [...mappedHotels]
  .sort((a, b) => {
    if (b.starRating !== a.starRating) return b.starRating - a.starRating
    const da = Math.max(...a.deals.map(d => d.discountPercentage))
    const db = Math.max(...b.deals.map(d => d.discountPercentage))
    return db - da
  })
  .slice(0, 3)

const superIds = new Set(superDeals.map(h => h.id))
const actueleDeals: SearchHotel[] = mappedHotels.filter(h => !superIds.has(h.id)).slice(0, 9)

const homeFilters = FILTER_TAGS

const featuredDesIndes = mappedHotels.find(h => /des.indes/i.test(h.name)) ?? null
const featuredDesIndesDeal = featuredDesIndes
  ? featuredDesIndes.deals.find(d => /culinair-verblijf/.test(d.slug)) ?? pickPrimaryDeal(featuredDesIndes.deals)
  : null

const ICON_FOR: Record<string, string> = {
  wellness: 'bath',
  'jacuzzi-room': 'bath',
  pool: 'waves',
  'with-dinner': 'utensils',
  'dog-friendly': 'dog',
  'mini-trip': 'backpack',
  'aan-zee': 'waves',
  natuur: 'leaf',
  romantisch: 'sparkles',
  culinair: 'wine',
  fiets: 'bike',
  steden: 'building',
  kasteel: 'castle',
  'unique-stay': 'sparkles',
  'five-star': 'crown',
  exclusive: 'crown',
  'best-price': 'euro',
  'new-hotels': 'star',
}

const {
  toggleFilterTag,
  selectedFilterTags,
  arrivalDate,
  selectedNights,
  persons,
  rooms,
  selectedDestinations,
  selectedCities,
  selectedHotels: v3SelectedHotels,
} = useSearchState()

const selectedThemes = computed(() =>
  selectedFilterTags.value.filter(id => getFilterTag(id)?.category === 'thema'),
)

function pickFilter(tagId: string) {
  if (!selectedFilterTags.value.includes(tagId)) toggleFilterTag(tagId)
  navigateTo('/search')
}

// --- Variant 3 search bar ---
// Each field opens the matching popup via SiteHeader's exposed
// openPopupAt API (same machinery variant-1 and variant-2 already use).
const v3DestField = ref<HTMLElement | null>(null)
const v3WhenField = ref<HTMLElement | null>(null)
const v3WhoField = ref<HTMLElement | null>(null)
const siteHeaderRef = ref<{ openPopupAt: (which: 'destination' | 'when' | 'who', el: HTMLElement | null) => void } | null>(null)

const v3DestIsPlaceholder = computed(() => (
  selectedDestinations.value.length === 0
  && selectedThemes.value.length === 0
  && selectedCities.value.length === 0
  && v3SelectedHotels.value.length === 0
))

const v3DestLabel = computed(() => {
  if (v3DestIsPlaceholder.value) return 'Alle bestemmingen'
  if (selectedCities.value.length) return selectedCities.value[0].name
  if (v3SelectedHotels.value.length) return v3SelectedHotels.value[0].name
  if (selectedThemes.value.length) return selectedThemes.value[0]
  return selectedDestinations.value[0]
})

const v3WhenIsPlaceholder = computed(() => (
  !arrivalDate.value && selectedNights.value.length === 0
))

const v3WhenLabel = computed(() => {
  if (v3WhenIsPlaceholder.value) return 'Flexibel — elke duur'
  const parts: string[] = []
  if (arrivalDate.value) {
    const [, m, d] = arrivalDate.value.split('-')
    parts.push(`${d}/${m}`)
  }
  if (selectedNights.value.length) {
    const ns = [...selectedNights.value]
    parts.push(`${ns.join(' of ')} ${ns.length === 1 && ns[0] === '1' ? 'nacht' : 'nachten'}`)
  }
  return parts.join(' · ')
})

const v3WhoLabel = computed(() => {
  const p = persons.value
  const r = rooms.value
  return `${p} ${p === 1 ? 'persoon' : 'personen'}, ${r} ${r === 1 ? 'kamer' : 'kamers'}`
})

function v3TogglePopup(field: 'destination' | 'when' | 'who') {
  const el = field === 'destination'
    ? v3DestField.value
    : field === 'when'
      ? v3WhenField.value
      : v3WhoField.value
  siteHeaderRef.value?.openPopupAt(field, el as HTMLElement | null)
}

function v3Search() {
  navigateTo('/search')
}

useHead({ title: 'ViaLuxury — Variant 5' })
</script>

<style scoped>
/* Variant 3 page bg per Figma (cream/off-white). */
.home-v3 {
  background: #fafaf7;
  position: relative;
}

/* Pay-off below the logo: handwritten "Biro" feel, white on the dark
   navbar. Absolutely positioned so it overlays the navbar without
   disrupting its flex layout; the `.container` inside takes care of the
   horizontal padding so the text starts at the logo's left edge. */
.home-v3__tagline {
  position: absolute;
  /* Logo bottom sits at ~y=56 (23px logo centred in 88px nav). +10px gap
     per design → tagline anchor at y=66. */
  top: 66px;
  left: 0;
  right: 0;
  /* SiteHeader root sets z-index:500 — bump above it so the tagline
     isn't painted behind the navbar's dark background. */
  z-index: 600;
  pointer-events: none;
}

.home-v3__tagline-text {
  font-family: 'Biro Script', cursive;
  font-size: 22px;
  font-weight: 400;
  color: #fff;
  letter-spacing: 0.2px;
  line-height: 1;
  white-space: nowrap;
}

/* SiteHeader reserves padding-bottom + margin-bottom for the search dock
   that hangs below the nav. Variant 3 hides the dock and renders the
   phone row in the dark area instead, so we strip those reservations —
   otherwise a 92 px cream gap separates the navbar from the phone row
   and the two read as distinct strips. */
.home-v3 :deep(.site-header) {
  padding-bottom: 0;
  margin-bottom: 0;
}

/* ===== PHONE / HELP ROW =====
   Renders inside the navbar's dark area, directly under the action
   buttons. Same #111 bg as the navbar so the two blocks read as one
   continuous extended navigation header. The `:deep(.site-header)`
   override above strips the SiteHeader's bottom reservations so there
   is no cream gap between this row and the nav. */
.home-v3__phone-row {
  background: #111111;
  padding: 0 0 14px;
}

.home-v3__phone-row-inner {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
}

.home-v3__phone-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.home-v3__phone-label {
  font-weight: 700;
  color: #fff;
}

.home-v3__phone-number {
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  transition: color 150ms ease;
}

.home-v3__phone-number:hover,
.home-v3__phone-number:focus-visible {
  color: var(--color-primary);
  text-decoration: underline;
}

/* ===== HERO + SEARCH SECTION =====
   Variant 5: full-bleed photo background. Title / pitch / Trustpilot
   on the left, search bar + Klarna assurance below — all overlaid on
   the photo. The navbar above stays solid black. */
.home-v5__hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  /* +50 px extra height vs. the previous 48/132 padding (so +150 vs.
     the original 48/32). The content drops 150 px from the top
     (top:48 → 198) while the bottom shrinks 100 px (132 → 32) so the
     overall section is only 50 px taller. */
  padding: 198px 0 32px;
}

.home-v5__hero-bg {
  position: absolute;
  inset: 0;
  z-index: -2;
  /* Photo anchored 150 px below the bottom-anchored position — i.e.
     the image's bottom edge sits 150 px below the viewport bottom, so
     the bottom 150 px of the image is cropped off and the top portion
     of the photo slides into view. */
  background: url('/images/home-hero-v2.jpg') no-repeat;
  background-position: center calc(100% + 150px);
  background-size: cover;
}

/* Subtle dark gradient so the white text + Trustpilot logo + search-
   card chrome stay readable on the photo. */
.home-v5__hero-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.2) 35%, rgba(0, 0, 0, 0.55) 100%);
}

.home-v5__hero-inner {
  position: relative;
  z-index: 1;
}

/* Left content stack (title + pitch + Trustpilot) — white text for
   contrast against the photo backdrop. Title is "Experience more" on
   one line per design; the pitch keeps its own max-width below to
   stay readable. */
.home-v5__hero-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
}

.home-v3__pitch.home-v5__pitch,
.home-v4__trust.home-v5__trust {
  max-width: 600px;
}

/* Chained selectors so the white colour wins the cascade over the
   base `.home-v3__title` / `.home-v3__pitch` / `.home-v4__trust-text`
   rules that live LATER in this same file (same specificity, later
   declaration wins — chaining bumps specificity from (0,1,0) →
   (0,2,0)). */
.home-v3__title.home-v5__title,
.home-v3__title.home-v5__title .home-v3__title-em {
  color: #fff;
}
.home-v3__pitch.home-v5__pitch {
  color: #fff;
  font-size: 22px;
  line-height: 1.4;
}
.home-v4__trust-text.home-v5__trust-text {
  color: #fff;
}

/* Original variant-3/4 hero-section (cream bg + 480px contained photo)
   is replaced by the rules above for /home-v5. */
.home-v3__hero-section {
  background: #fafaf7;
  padding: 32px 0 16px;
}

.home-v3__hero-inner {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Hero block: title column (~409px) left, photo flex-1 right, 480px tall,
   rounded corners on the photo. */
.home-v3__hero {
  display: flex;
  gap: 48px;
  height: 480px;
  align-items: stretch;
}

.home-v3__hero-left {
  flex: 0 0 409px;
  display: flex;
  flex-direction: column;
  /* Variant 4: hero text (title + pitch + Trustpilot) bottom-aligns with
     the photo's bottom edge. */
  justify-content: flex-end;
  gap: 24px;
}

/* ===== Trustpilot block (under elevator pitch) =====
   Logo on top at variant-3's persuasion-strip size (56px), descriptive
   line below at the same 16px as the elevator pitch. */
.home-v4__trust {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.home-v4__trust-logo {
  height: 56px;
  width: auto;
  flex-shrink: 0;
  display: block;
}

.home-v4__trust-text {
  margin: 0;
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.5;
  color: #3d3d38;
}

/* ===== Assurance row (under search bar) =====
   Three short checkmark items spread across the bar's full width:
   one left-aligned, one centred, one right-aligned. */
.home-v4__assurance {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  /* Hero-inner uses gap:32 between every child. Pull this row up by 16
     so the search-bar→assurance gap reads as 16 (half of the other
     gaps). */
  margin-top: -16px;
  padding-top: 0;
  font-family: var(--font-body);
  font-size: 14px;
  /* White on v5 because the row sits over the dark hero photo. */
  color: #fff;
}

.home-v4__assurance-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.home-v4__assurance-item--start {
  justify-self: start;
}

.home-v4__assurance-item--center {
  justify-self: center;
}

.home-v4__assurance-item--end {
  justify-self: end;
}

.home-v4__assurance-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.home-v4__check {
  color: #00B67A;
  flex-shrink: 0;
}

/* Klarna logo at ~1/3 of the previous 56px size (~19px). */
.home-v4__klarna-logo {
  height: 19px;
  width: auto;
  display: inline-block;
  vertical-align: middle;
}

.home-v3__title {
  font-family: var(--font-heading);
  font-size: 88px;
  line-height: 0.95;
  letter-spacing: -2.07px;
  font-weight: 400;
  color: #0e0e0c;
  margin: 0;
}

.home-v3__title-em {
  color: #f07a2a;
  font-weight: 700;
}

.home-v3__pitch {
  max-width: 460px;
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.5;
  color: #3d3d38;
  margin: 0;
}

/* Photo column — rounded card with badge (top-right) and caption
   (bottom-left) overlays. */
.home-v3__hero-photo {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  border-radius: 16px;
  overflow: hidden;
  background: #1a1a1a url('/images/home-hero-v2.jpg') center/cover no-repeat;
}

.home-v3__hero-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px 12px;
  background: #0e0e0c;
  color: #fff;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.32px;
  text-transform: uppercase;
}

.home-v3__hero-badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #f07a2a;
  display: inline-block;
}

.home-v3__hero-caption {
  position: absolute;
  bottom: 16px;
  left: 16px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(1px);
  -webkit-backdrop-filter: blur(1px);
  font-family: var(--font-body);
  font-size: 10px;
  color: rgba(20, 20, 18, 0.55);
  letter-spacing: 0.8px;
  text-transform: uppercase;
  border-radius: 2px;
}

/* ===== SEARCH BAR (under hero block) =====
   Four equal columns split by vertical hairlines + an orange CTA cell. */
.home-v3__searchbar {
  display: flex;
  align-items: stretch;
  background: #fff;
  /* Variant 5: no border — the search bar sits on the dark hero photo
     so the 1px hairline reads as a distracting stroke. Shadow stays
     to lift the card off the photo. */
  border: none;
  border-radius: 16px;
  box-shadow: 0 8px 28px -10px rgba(14, 14, 12, 0.08);
  overflow: hidden;
}

.home-v3__searchfield {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 20px 24px;
  border: 0;
  border-right: 1px solid #e5e2da;
  background: #fff;
  font-family: var(--font-body);
  text-align: left;
  cursor: pointer;
  transition: background 150ms ease;
}

.home-v3__searchfield:hover {
  background: #faf9f6;
}

.home-v3__searchfield--last {
  border-right: 0;
}

.home-v3__searchfield-label {
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 1.4px;
  color: #9a9a93;
  text-transform: uppercase;
}

.home-v3__searchfield-value {
  font-size: 16px;
  font-weight: 500;
  color: #0e0e0c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.home-v3__searchfield-value--placeholder {
  color: #0e0e0c;
  font-weight: 400;
}

.home-v3__searchcta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 200px;
  padding: 28px 24px;
  background: #f07a2a;
  color: #fff;
  border: 0;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 150ms ease;
}

.home-v3__searchcta:hover {
  background: #d4691f;
}

/* ===== Responsive ===== */
@media (max-width: 1024px) {
  .home-v3__hero {
    flex-direction: column;
    height: auto;
  }
  .home-v3__hero-left {
    flex: 0 0 auto;
  }
  .home-v3__hero-photo {
    height: 320px;
  }
  .home-v3__searchbar {
    flex-direction: column;
  }
  .home-v3__searchfield {
    border-right: 0;
    border-bottom: 1px solid #e5e2da;
  }
  .home-v3__searchcta {
    width: 100%;
    padding: 18px 24px;
  }
}

@media (max-width: 640px) {
  .home-v3__title {
    font-size: 64px;
  }
}

/* ===== Sections below the hero — mirror of variant 1's styling so the
   persuasion strip, popular band, and deal grids render identically on
   /home-v3. Scoped CSS doesn't bleed between pages, so we restate the
   rules here. ===== */

.home-persuasion {
  background: #fff;
  padding: 40px 0;
}

.home-persuasion__inner {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  gap: var(--space-lg);
}

.home-persuasion__col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 0 var(--space-md);
  text-align: center;
  position: relative;
}

.home-persuasion__col:first-child {
  align-items: flex-start;
  text-align: left;
  padding-left: 0;
}

.home-persuasion__col:last-child {
  align-items: flex-end;
  text-align: right;
  padding-right: 0;
}

.home-persuasion__col + .home-persuasion__col::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12%;
  bottom: 12%;
  width: 1px;
  background: var(--color-border-light);
}

.home-persuasion__trustpilot,
.home-persuasion__klarna {
  height: 56px;
  width: auto;
  display: block;
  object-fit: contain;
}

.home-persuasion__award {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  color: #00B67A;
}

.home-persuasion__award svg {
  height: 56px;
  width: auto;
}

.home-persuasion__text {
  margin: 0;
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.35;
  color: var(--color-text-primary);
  max-width: 320px;
}

@media (max-width: 768px) {
  .home-persuasion__inner {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
  .home-persuasion__col + .home-persuasion__col::before { display: none; }
}

/* ===== POPULAR FILTERS BAND ===== */
.home-popular {
  background: #fff;
  padding: 28px 0;
}

.home-popular__inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2xl);
  align-items: start;
}

.home-popular__col {
  display: flex;
  flex-direction: column;
}

.home-popular__heading {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 var(--space-xl);
  color: var(--color-text-primary);
  line-height: 1.1;
}

.home-popular__featured-wrap {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.home-popular__featured-wrap :deep(.deal-card-v2) {
  border-radius: 0;
  box-shadow: none;
}

.home-popular__featured-wrap :deep(.deal-card-v2__image) {
  min-height: 0;
  max-height: none;
  aspect-ratio: 12 / 7;
}

.home-popular__featured-press {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr 1fr 1fr;
  align-items: center;
  gap: var(--space-md);
  padding: 14px var(--space-md);
}

.home-popular__featured-press::before {
  content: '';
  position: absolute;
  top: 0;
  left: var(--space-md);
  right: var(--space-md);
  height: 1px;
  background: var(--color-border-light);
}

.home-popular__featured-press-label {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--color-text-primary);
}

.home-popular__logo {
  height: 22px;
  max-height: 22px;
  width: auto;
  object-fit: contain;
  display: block;
  justify-self: center;
}

.home-popular__featured {
  width: 100%;
}

.home-popular__pills {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

@media (max-width: 768px) {
  .home-popular__inner {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }
  .home-popular__pills {
    grid-template-columns: 1fr;
  }
}

.home-pill {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  padding: 13px 17px;
  width: 100%;
  background: #fff;
  border: 1px solid #e5e2da;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: #1a1411;
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.home-pill:hover {
  border-color: #1a1411;
  background: #fafaf6;
}

.home-pill__icon {
  display: inline-flex;
  width: 14px;
  height: 14px;
  color: #1a1411;
  margin-right: 2px;
}

.home-pill__icon :deep(svg) {
  width: 100%;
  height: 100%;
}

/* ===== HOTEL DEALS SECTIONS ===== */
.home-deals {
  background: #fff;
  padding: 56px 0;
}

.home-deals--alt {
  background: var(--color-background-secondary, #faf9f6);
}

.home-deals__title {
  font-family: var(--font-heading);
  font-size: clamp(32px, 4vw, 44px);
  line-height: 1;
  font-weight: 400;
  letter-spacing: -0.88px;
  color: #0e0e0c;
  margin: 0 0 32px;
}

.home-deals__grid {
  display: grid;
  gap: var(--space-lg);
}

/* Bottom-align the CTA with the price text in deal cards (default is
   baseline). Homepage-only — /search keeps its existing alignment.
   `line-height: 1` on price elements collapses the line-box padding
   below the glyphs so the button's bottom border lines up with the
   price text's bottom edge exactly. */
.home-deals :deep(.deal-card-v2__grid-price-row) {
  align-items: flex-end;
}
.home-deals :deep(.deal-card-v2__price-line),
.home-deals :deep(.deal-card-v2__price),
.home-deals :deep(.deal-card-v2__price-prefix),
.home-deals :deep(.deal-card-v2__original) {
  line-height: 1;
}

.home-deals__grid--3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

@media (max-width: 1024px) {
  .home-deals__grid--3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 600px) {
  .home-deals__grid--3 { grid-template-columns: 1fr; }
}
</style>
