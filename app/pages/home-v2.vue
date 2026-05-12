<template>
  <div class="home">
    <!-- Hero with full-bleed background image -->
    <section class="home-hero">
      <div class="home-hero__bg" />
      <div class="home-hero__help container">
        <svg class="home-hero__help-icon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.58 1 1 0 01-.24 1.01l-2.21 2.21z" />
        </svg>
        <span class="home-hero__help-label">Hulp nodig?</span>
        <button
          type="button"
          ref="helpPhoneRef"
          class="home-hero__help-phone"
          @click.stop="helpOpen = !helpOpen"
        >+31 20 705 2222</button>
        <Teleport to="body">
          <div
            v-if="helpOpen"
            class="home-hero__help-popover"
            :style="helpPopoverStyle"
            @click.stop
          >
            <p class="home-hero__help-popover-title">Openingstijden</p>
            <p class="home-hero__help-popover-row">Ma t/m vr</p>
            <p class="home-hero__help-popover-row home-hero__help-popover-row--bold">8:00 — 18:00</p>
          </div>
        </Teleport>
      </div>

      <!-- Handwritten "Personally Curated Experiences" pay-off, in the
           same position as on /home-v3 (under the logo, 10px gap). The
           overlay-variant SiteHeader reserves a 34px padding-top above
           the nav row, so the tagline sits ~34px lower than on v3
           which uses the solid (no-padding) variant. -->
      <div class="home-v2__tagline">
        <div class="container">
          <span class="home-v2__tagline-text">Personally Curated Experiences</span>
        </div>
      </div>

      <SiteHeader ref="siteHeaderRef" variant="overlay" hide-search-dock>
        <template #hero>
          <div class="home-hero__v2 container">
            <div class="home-hero__v2-left">
              <div class="home-hero__eyebrow">
                <span class="home-hero__eyebrow-dot" aria-hidden="true" />
                <span>SPRING 2026</span>
              </div>
              <h1 class="home-hero__title home-hero__title--stacked">
                Experience<br><span class="home-hero__title-em">more</span>
              </h1>
              <p class="home-hero__tagline home-hero__tagline--v2">
                Onze experience creators stellen complete verblijven samen met luxe extra's en exclusieve voordelen, zodat jij meer beleeft voor een scherpere prijs.
              </p>
            </div>
            <aside class="home-hero__v2-search">
              <div class="search-card">
                <div class="search-card__row">
                  <span class="search-card__label">Waarheen?</span>
                  <button
                    type="button"
                    class="search-card__field"
                    ref="v2DestField"
                    @click="v2TogglePopup('destination')"
                  >
                    <span class="search-card__value" :class="{ 'search-card__value--placeholder': v2DestIsPlaceholder }">{{ v2DestLabel }}</span>
                  </button>
                </div>
                <div class="search-card__row">
                  <span class="search-card__label">Wanneer en hoelang?</span>
                  <button
                    type="button"
                    class="search-card__field"
                    ref="v2WhenField"
                    @click="v2TogglePopup('when')"
                  >
                    <span class="search-card__value" :class="{ 'search-card__value--placeholder': v2WhenIsPlaceholder }">{{ v2WhenLabel }}</span>
                  </button>
                </div>
                <div class="search-card__row">
                  <span class="search-card__label">Wie gaat er mee?</span>
                  <button
                    type="button"
                    class="search-card__field"
                    ref="v2WhoField"
                    @click="v2TogglePopup('who')"
                  >
                    <span class="search-card__value">{{ v2WhoLabel }}</span>
                  </button>
                </div>
                <button type="button" class="search-card__cta" @click="v2Search">Vind deals</button>
              </div>
            </aside>
          </div>
        </template>
      </SiteHeader>

    </section>

    <!-- Two-column band: Snel zoeken pill grid on the LEFT, stacked
         USP block on the RIGHT. (The standalone persuasion strip that
         used to sit above this band has been folded into the USP block.) -->
    <section class="home-popular">
      <div class="container home-popular__inner">
        <div class="home-popular__col home-popular__col--quick home-popular__col--span2">
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
        <div class="home-popular__col home-popular__col--usp">
          <div class="home-v2-usp">
            <img src="/images/trustpilot.svg" alt="Trustpilot" class="home-v2-usp__heading-logo" />
            <span class="home-v2-usp__item">
              <svg class="home-v2-usp__check" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>15.294 gasten geven ons een 9 uit 10 op Trustpilot</span>
            </span>
            <span class="home-v2-usp__item">
              <svg class="home-v2-usp__check" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Al meer dan 1 miljoen arrangementen geboekt</span>
            </span>
            <span class="home-v2-usp__item">
              <svg class="home-v2-usp__check" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span class="home-v2-usp__klarna-row">
                Achteraf betalen met
                <img src="/images/logos/klarna.webp" alt="Klarna" class="home-v2-usp__klarna" />
              </span>
            </span>
            <span class="home-v2-usp__item">
              <svg class="home-v2-usp__check" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Flexibel annuleren</span>
            </span>
          </div>

          <!-- Press band: same card chrome as the USP card above, with
               "Bekend van:" label on row 1 and three press logos on
               row 2 (slightly larger so they read clearly). -->
          <div class="home-v2-press">
            <span class="home-v2-press__label">Bekend van:</span>
            <div class="home-v2-press__logos">
              <img src="/images/logos/telegraaf.png" alt="De Telegraaf" class="home-v2-press__logo" />
              <img src="/images/logos/nrc.png" alt="NRC" class="home-v2-press__logo" />
              <img src="/images/logos/nushoplogo.svg" alt="NU shop" class="home-v2-press__logo" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Super Hotel Deals: 3 hand-picked luxury hotels -->
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

    <!-- Actuele Deals: 3x3 grid of current hotel cards -->
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
    <HomeVariantSwitcher current="2" />
  </div>
</template>

<script setup lang="ts">
import { POPULAR_FILTER_ICONS } from '~/utils/popularFilterIcons'
import { mappedHotels } from '~/data/deals-mapper'
import type { SearchHotel } from '~/types/searchHotel'
import { pickPrimaryDeal } from '~/utils/primaryDeal'


// Super deals: top 3 hotels by star rating (then highest discount within the same tier)
const superDeals: SearchHotel[] = [...mappedHotels]
  .sort((a, b) => {
    if (b.starRating !== a.starRating) return b.starRating - a.starRating
    const da = Math.max(...a.deals.map(d => d.discountPercentage))
    const db = Math.max(...b.deals.map(d => d.discountPercentage))
    return db - da
  })
  .slice(0, 3)

// Actuele deals: next 9 hotels after the super-three
const superIds = new Set(superDeals.map(h => h.id))
const actueleDeals: SearchHotel[] = mappedHotels.filter(h => !superIds.has(h.id)).slice(0, 9)


// Home filter pills come from the unified FILTER_TAGS config so they stay
// in sync with the filter sidebar everywhere else.
import { FILTER_TAGS, getFilterTag } from '~/utils/filterTags'

const homeFilters = FILTER_TAGS

// Hero "Hulp nodig?" phone-number popover with opening hours.
const helpOpen = ref(false)
const helpPhoneRef = ref<HTMLElement | null>(null)
const helpPopoverStyle = ref<Record<string, string>>({})

function placeHelpPopover() {
  const el = helpPhoneRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  helpPopoverStyle.value = {
    position: 'fixed',
    top: (rect.bottom + 8) + 'px',
    // Right-anchor so it doesn't fall off the screen edge.
    right: Math.max(8, window.innerWidth - rect.right) + 'px',
    zIndex: '1500',
  }
}

watch(helpOpen, (open) => {
  if (open) nextTick(placeHelpPopover)
})

function closeHelpOnOutside(e: MouseEvent) {
  if (!helpOpen.value) return
  const target = e.target as Node
  if (helpPhoneRef.value && helpPhoneRef.value.contains(target)) return
  helpOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', closeHelpOnOutside)
  window.addEventListener('resize', placeHelpPopover)
  window.addEventListener('scroll', placeHelpPopover, { passive: true })
})
onBeforeUnmount(() => {
  document.removeEventListener('click', closeHelpOnOutside)
  window.removeEventListener('resize', placeHelpPopover)
  window.removeEventListener('scroll', placeHelpPopover)
})

// Featured Hotel Des Indes "culinair verblijf" card for the "Gezien in"
// column on /home. Pick the specific culinair deal so the hero pic + price
// match the right arrangement.
const featuredDesIndes = mappedHotels.find(h => /des.indes/i.test(h.name)) ?? null
const featuredDesIndesDeal = featuredDesIndes
  ? featuredDesIndes.deals.find(d => /culinair-verblijf/.test(d.slug)) ?? pickPrimaryDeal(featuredDesIndes.deals)
  : null

// Filter id → POPULAR_FILTER_ICONS key. Renders a black Lucide-style SVG
// in place of the previous emoji glyph.
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
  selectedHotels: v2SelectedHotels,
} = useSearchState()

// `useSearchState` exposes the raw selected filter-tag IDs, not a themes-only
// view. Derive themes here (same pattern as SiteHeader.vue line ~829) so the
// placeholder check below can read `.value.length` without crashing on SSR.
const selectedThemes = computed(() =>
  selectedFilterTags.value.filter(id => getFilterTag(id)?.category === 'thema'),
)

function pickFilter(tagId: string) {
  if (!selectedFilterTags.value.includes(tagId)) toggleFilterTag(tagId)
  navigateTo('/search')
}

// --- Variant 2 vertical search card ---
// The card's three buttons + Vind deals each route to /search (which
// owns all the real popup UI for destination, date, persons). Field
// labels mirror what the user has already picked so the card reads as
// stateful even though the editing happens elsewhere.

const v2DestField = ref<HTMLElement | null>(null)
const v2WhenField = ref<HTMLElement | null>(null)
const v2WhoField = ref<HTMLElement | null>(null)
const siteHeaderRef = ref<{ openPopupAt: (which: 'destination' | 'when' | 'who', el: HTMLElement | null) => void } | null>(null)

const v2DestIsPlaceholder = computed(() => (
  selectedDestinations.value.length === 0
  && selectedThemes.value.length === 0
  && selectedCities.value.length === 0
  && v2SelectedHotels.value.length === 0
))

const v2DestLabel = computed(() => {
  if (v2DestIsPlaceholder.value) return 'Kies bestemming'
  // Show the first picked label; the popups elsewhere display the full list.
  if (selectedCities.value.length) return selectedCities.value[0].name
  if (v2SelectedHotels.value.length) return v2SelectedHotels.value[0].name
  if (selectedThemes.value.length) return selectedThemes.value[0]
  return selectedDestinations.value[0]
})

const v2WhenIsPlaceholder = computed(() => (
  !arrivalDate.value && selectedNights.value.length === 0
))

const v2WhenLabel = computed(() => {
  if (v2WhenIsPlaceholder.value) return 'Kies datum en reisduur'
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

const v2WhoLabel = computed(() => {
  const p = persons.value
  const r = rooms.value
  return `${p} ${p === 1 ? 'persoon' : 'personen'}, ${r} ${r === 1 ? 'kamer' : 'kamers'}`
})

function v2TogglePopup(field: 'destination' | 'when' | 'who') {
  // Delegate to SiteHeader's popup machinery — it teleports to body, owns
  // all the popup state, and clamps horizontal position to viewport.
  const el = field === 'destination'
    ? v2DestField.value
    : field === 'when'
      ? v2WhenField.value
      : v2WhoField.value
  siteHeaderRef.value?.openPopupAt(field, el as HTMLElement | null)
}

function v2Search() {
  navigateTo('/search')
}
</script>

<style scoped>
.home {
  background: #fff;
}

/* Pay-off below the logo (matches /home-v3). Absolutely positioned
   inside .home-hero so it overlays the navbar without disrupting the
   flex flow. top:100 = 34 (overlay padding-top) + 56 (logo bottom
   centred in 88px nav) + 10 gap. */
.home-v2__tagline {
  position: absolute;
  top: 100px;
  left: 0;
  right: 0;
  z-index: 600;
  pointer-events: none;
}

.home-v2__tagline-text {
  font-family: 'Biro Script', cursive;
  font-size: 22px;
  font-weight: 400;
  color: #fff;
  letter-spacing: 0.2px;
  line-height: 1;
  white-space: nowrap;
}

/* ===== HERO ===== */
.home-hero {
  position: relative;
  isolation: isolate;
  min-height: 800px;
  height: 800px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.home-hero__bg {
  position: absolute;
  inset: 0;
  z-index: -2;
  /* Anchor the image to the top of the container so the extra height (was
     768 → now 800) shows MORE of the bottom of the photo instead of being
     re-cropped equally. */
  background: url('/images/home-hero-v2.jpg') center top / cover no-repeat;
}

.home-hero__bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.15) 40%, rgba(0, 0, 0, 0.7) 100%);
}

/* Hero credit line — right-aligned with the hamburger / nav-actions */
.home-hero__location {
  position: absolute;
  top: 184px;
  left: 0;
  right: 0;
  z-index: 5;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
  pointer-events: none;
}

.home-hero__location-line {
  display: inline-block;
  width: 18px;
  height: 1px;
  background: rgba(255, 255, 255, 0.5);
}

/* Right-aligned help / phone block — sits a few px under the location
   credit line, on top of the hero photo. Stays clickable (pointer
   events on) so calling the number works in-place. */
.home-hero__help {
  position: absolute;
  top: 124px;
  left: 0;
  right: 0;
  /* Sit ABOVE the SiteHeader (z-index 500) so clicks reach the button. */
  z-index: 600;
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  gap: 6px;
  /* Container itself shouldn't capture clicks — only the phone button
     does — otherwise the whole row would intercept events that should
     reach SiteHeader controls (hamburger, etc.). */
  pointer-events: none;
  color: #fff;
  text-decoration: none;
  font-family: var(--font-body);
}

.home-hero__help-phone {
  pointer-events: auto;
}

.home-hero__help-icon {
  color: var(--color-primary);
  flex-shrink: 0;
  align-self: center;
}

.home-hero__help-label {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.2px;
}

.home-hero__help-phone {
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  letter-spacing: 0.2px;
  transition: color 150ms ease;
}

.home-hero__help-phone:hover,
.home-hero__help-phone:focus-visible {
  color: var(--color-primary);
  text-decoration: underline;
}

.home-hero__help-popover {
  background: #fff;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  padding: 14px 18px;
  min-width: 200px;
  color: var(--color-text-primary);
}

.home-hero__help-popover-title {
  margin: 0 0 6px;
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 700;
}

.home-hero__help-popover-row {
  margin: 0;
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.4;
  color: var(--color-text-secondary);
}

.home-hero__help-popover-row--bold {
  color: var(--color-text-primary);
  font-weight: 700;
}

/* Slot content (eyebrow + heading + tagline) — left-aligned, pushed toward
   the bottom of the hero so the photo gets more breathing room above. */
.home-hero__content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 28px;
  /* Tagline is now 1.5× larger so the whole content block needs to start
     a bit higher in the hero to keep enough breathing room around the
     search-bar dock at the bottom. */
  padding-top: 200px;
  padding-bottom: 32px;
  margin-top: auto;
}

.home-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  letter-spacing: 1.54px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
}

.home-hero__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #e97132;
}

.home-hero__title {
  font-family: var(--font-heading);
  font-size: clamp(64px, 10vw, 128px);
  line-height: 0.9;
  font-weight: 400;
  letter-spacing: -3.24px;
  color: #fff;
  margin: 0;
}

.home-hero__title-em {
  font-style: normal;
  font-weight: 600;
}

.home-hero__tagline {
  max-width: 640px;
  font-size: 22px;
  line-height: 30px;
  letter-spacing: -0.1px;
  color: #fff;
  margin: 0;
}

/* === Variant 2 hero ===
   Search card is 360×360 vertically centred in the 800px photo, right-
   aligned with the hamburger column. Left column is 360px tall so the
   title can top-align with the card and the tagline can bottom-align
   with the card via flex space-between. */
.home-hero__v2 {
  position: absolute;
  /* Block starts 320px from the top of the 800px photo (220 + 100 shift). */
  top: 320px;
  left: 0;
  right: 0;
  /* 3-column grid mirroring the popular band: title col spans 2/3,
     search card occupies the remaining 1/3 (right). */
  height: 360px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--space-2xl);
  align-items: stretch;
}

.home-hero__v2-left {
  grid-column: span 2;
}

.home-hero__v2-left {
  display: flex;
  flex-direction: column;
  /* Title at the top of the 360px column, tagline at the bottom — so they
     line up with the search-card's top and bottom edges respectively. */
  justify-content: space-between;
  align-items: flex-start;
  height: 360px;
}

.home-hero__title--stacked {
  line-height: 0.85;
  margin: 0;
}

.home-hero__tagline--v2 {
  /* 2pt smaller than the variant-1 tagline (22 → 20) per design. */
  font-size: 20px;
  line-height: 28px;
  margin: 0;
}

.home-hero__v2-search {
  align-self: stretch;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
}

/* Search card: fills the third grid column so its left edge aligns
   with the deal cards below it. */
.search-card {
  width: 100%;
  height: 360px;
  background: var(--color-background-secondary);
  border-radius: var(--radius-lg);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.22);
  padding: 18px;
  display: flex;
  flex-direction: column;
  /* More room between each label+field combo so the rows breathe. */
  gap: 18px;
}

.search-card__row {
  display: flex;
  flex-direction: column;
  /* Tightened from 4px → 1px so the label sits visually attached to
     its field, matching variant-1's overlay search bar. */
  gap: 1px;
}

/* Label sits ABOVE / OUTSIDE the field button per design. Uppercase
   to match variant-1's overlay search-bar labels. */
.search-card__label {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-secondary);
  letter-spacing: 1.4px;
  text-transform: uppercase;
  padding-left: 2px;
}

.search-card__field {
  display: flex;
  align-items: center;
  width: 100%;
  height: 44px;
  padding: 0 14px;
  background: #fff;
  /* Thicker outline so the field reads as a solid, tappable
     input — bumped from 1px to 2px. */
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  text-align: left;
  font-family: var(--font-body);
  cursor: pointer;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.search-card__field:hover {
  border-color: var(--color-primary);
}

.search-card__value {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.search-card__value--placeholder {
  color: #9a9a93;
  font-weight: 400;
}

.search-card__cta {
  margin-top: auto;
  padding: 14px;
  border: 0;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: #fff;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 150ms ease;
}

.search-card__cta:hover {
  background: var(--color-primary-hover);
}

@media (max-width: 1024px) {
  .home-hero__v2 {
    position: static;
    transform: none;
    height: auto;
    grid-template-columns: 1fr;
    padding-top: 200px;
    padding-bottom: 32px;
    margin-top: auto;
  }
  .home-hero__v2-left {
    height: auto;
    gap: 24px;
  }
  .home-hero__v2-search {
    justify-self: stretch;
    justify-content: stretch;
  }
  .search-card {
    width: 100%;
  }
}

/* Trust row under the search bar — flex-row inside its own .container wrap.
   The flex row itself is width:100% so the first/last items pin to the
   container content edges = the search bar's visible white-card edges. */
.home-hero__trust-wrap {
  /* Explicit positioning identical to the search bar's .container wrapper —
     don't rely on .container alone in case any rule overrides it. */
  width: 100%;
  max-width: var(--container-max);
  margin: 16px auto 0;
  padding: 0 var(--space-lg) 32px;
  box-sizing: border-box;
}

.home-hero__trust {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px 16px;
  width: 100%;
  font-size: 14px;
  letter-spacing: 0.12px;
}

.home-hero__trust-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #fff;
}

.home-hero__trust-item--soft {
  color: #fff;
}

.home-hero__trust-star {
  color: #00b57e;
  font-size: 13px;
}

.home-hero__trust-check {
  color: #00b57e;
  font-size: 13px;
}

.home-hero__trust-link {
  color: #fff;
}

/* ===== PERSUASION BAND (directly under the hero) ===== */
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

/* First column hugs the left edge of the container; last column hugs
   the right edge so they line up with the search-bar's outer margins. */
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

/* Vertical divider between columns (skip first). */
.home-persuasion__col + .home-persuasion__col::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12%;
  bottom: 12%;
  width: 1px;
  background: var(--color-border-light);
}

/* All three logos in the USP bar share the same visual height so the
   row reads as a tidy band. */
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
  background: var(--color-background-secondary, #faf9f6);
  padding: 28px 0;
}

.home-popular__inner {
  /* 3-column grid: Snel zoeken spans 2 columns, "Waarom ViaLuxury"
     takes the 3rd. */
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--space-2xl);
  align-items: start;
}

.home-popular__col--span2 {
  grid-column: span 2;
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

/* ===== USP stack (right column of popular band) =====
   Trustpilot logo + four green-check USP rows wrapped in a white
   card that mirrors the DealCard treatment (same surface colour,
   border-radius, and shadow) so it visually pairs with the deal
   cards in the row below.

   `margin-top` matches the height of the "Snel zoeken" heading in
   the sibling column (24px font × 1.1 line-height ≈ 26.4px + the
   --space-xl bottom margin = 32px) → ~58px. That keeps the card's
   top edge aligned with the top of the first row of pill buttons on
   the left, instead of with the heading itself. */
.home-v2-usp {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--space-md);
  margin-top: calc(24px * 1.1 + var(--space-xl));
}

/* Trustpilot logo at the top of the USP card. `align-self: flex-start`
   pins it to the card's left edge so the parent's default
   `align-items: stretch` doesn't stretch the img. Bottom margin is
   zero — vertical breathing room comes from the parent's `gap: 20px`,
   same as between the checkmarks. */
.home-v2-usp__heading-logo {
  display: block;
  align-self: flex-start;
  height: 84px;
  width: auto;
  max-width: 100%;
  margin: 0;
  padding: 0;
}

.home-v2-usp__item {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.4;
  color: var(--color-text-primary);
}

.home-v2-usp__check {
  color: #00B67A;
  flex-shrink: 0;
}

.home-v2-usp__klarna-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.home-v2-usp__klarna {
  height: 19px;
  width: auto;
  display: inline-block;
  vertical-align: middle;
}

/* ===== Press card (under the USP card) =====
   Same white-card chrome as the USP card above. "Bekend van:" label on
   row 1; three press logos on row 2, distributed evenly across the
   card width. */
.home-v2-press {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--space-md);
  margin-top: var(--space-lg);
}

.home-v2-press__label {
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.home-v2-press__logos {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  gap: var(--space-md);
}

.home-v2-press__logo {
  height: 30px;
  max-height: 30px;
  width: auto;
  object-fit: contain;
  display: block;
  justify-self: center;
}

/* Featured card + "Gezien in" press footer are wrapped as one visual
   card: the wrap owns the shadow + rounded corners + clipping; the
   DealCard inside loses its own frame so it blends in. The press
   footer sits flush below the deal content, separated by a thin grey
   divider only. */
.home-popular__featured-wrap {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

/* Drop the inner DealCard's own frame so the wrap's frame wins. Uses
   :deep because DealCard is scoped to its own component. */
.home-popular__featured-wrap :deep(.deal-card-v2) {
  border-radius: 0;
  box-shadow: none;
}

/* Override the small-card image height (224px) so the featured photo
   keeps the same aspect ratio as the small cards (~12/7) when the
   featured card is rendered at the wider half-container width. */
.home-popular__featured-wrap :deep(.deal-card-v2__image) {
  min-height: 0;
  max-height: none;
  aspect-ratio: 12 / 7;
}

/* "Gezien in:" + three press logos. Label on the left, logos distributed
   evenly across the remaining width via a 1fr-per-logo grid track. */
.home-popular__featured-press {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr 1fr 1fr;
  align-items: center;
  gap: var(--space-md);
  padding: 14px var(--space-md);
}

/* Grey divider above the press footer, inset from the card edges so it
   doesn't run flush to the corners. */
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
  /* Match the deal-title typography (Recoleta, 18px/700) so the press
     label reads at the same visual weight as the card title above. */
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--color-text-primary);
}

.home-popular__logos {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
}

/* Logos as tall as the cap-height of the "G" in "Gezien in".
   At 24 px heading font-size, cap-height ≈ 18 px. */
.home-popular__logo {
  height: 22px;
  max-height: 22px;
  width: auto;
  object-fit: contain;
  display: block;
  /* Centre each logo inside its 1fr grid cell so the three press logos
     sit at evenly spaced positions across the press footer. */
  justify-self: center;
}

/* Featured Marriott deal under the heading row. Width is bounded by the
   left column so the card fills the available space. */
.home-popular__featured {
  width: 100%;
}

/* Quick-pick pills become a 2-column grid so the right block is ~half
   as wide and roughly twice as tall as the previous full-row layout. */
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

.home-pill__count {
  color: #9a9a93;
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

.home-deals__grid--3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

@media (max-width: 1024px) {
  .home-deals__grid--3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 600px) {
  .home-deals__grid--3 { grid-template-columns: 1fr; }
}

/* ===== Variant-2 deal-card extras (/home-v2 grid only) =====
   The visual style (no chrome, rounded-top image, edge-hugging content,
   bottom-aligned CTA) AND the vertical-stripe dividers between columns
   are global — see assets/css/variant-2.css. The homepage 3-col grid
   uses fractional columns (1fr) so the cards align with the container
   edges (no overflow / no centring gap). 40px gap → 20px stripe offset
   so the divider sits dead-centre between columns. */
.home-deals .home-deals__grid--3 {
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

/* Mobile tweaks */
@media (max-width: 768px) {
  .home-hero {
    min-height: 504px;
  }
  .home-hero__location {
    top: 60px;
    right: 16px;
  }
  .home-hero__title {
    letter-spacing: -1.5px;
  }
  .home-hero__trust {
    gap: 16px;
    padding-bottom: 24px;
  }
  .home-popular {
    padding: 40px 0;
  }
}
</style>
