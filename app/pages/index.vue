<template>
  <div class="start-screen">
    <div class="start-screen__inner">
      <img src="/images/logo-vialuxury.svg" alt="ViaLuxury" class="start-screen__logo" />

      <h1 class="start-screen__title">ViaLuxury Prototype</h1>

      <!-- First release — the production-bound "Hotel First" build the
           client has picked to pursue. No homepage-variant switcher. -->
      <section class="start-section">
        <h2 class="start-section__title">Redesign (first release)</h2>
        <p class="start-section__lead">
          <a
            href="https://docs.google.com/spreadsheets/d/1II0u8mkbtFpg16CWzlYGMD2yO4QR9dtOI6bDxPRREqo/edit?gid=379133869#gid=379133869"
            target="_blank"
            rel="noopener"
            class="start-section__link"
          >Scope sheet (Google Spreadsheets) ↗</a>
        </p>
        <div class="start-section__buttons">
          <button
            type="button"
            class="start-btn start-btn--primary"
            @click="startHotelFirstFromHome"
          >Homepage</button>
          <button
            type="button"
            class="start-btn"
            @click="startHotelFirstFromAd"
          >Start met advertentie</button>
        </div>
      </section>

      <!-- Second release — full independent copy of First Release, the
           next iteration the client will build on. -->
      <section class="start-section">
        <h2 class="start-section__title">Variable Travel Group (second release)</h2>
        <div class="start-section__buttons">
          <button
            type="button"
            class="start-btn start-btn--primary"
            @click="startSecondReleaseFromHome"
          >Homepage</button>
          <button
            type="button"
            class="start-btn"
            @click="startSecondReleaseFromNushop"
          >Start via NUshop</button>
          <button
            type="button"
            class="start-btn"
            @click="startSecondReleaseSolo"
          >Solo reizen</button>
        </div>
      </section>

      <!-- Huisstijl varianten — experimental homepage-variant prototypes
           frozen on 13 May. Five homepage variants live next to each
           other; the chosen variant persists in localStorage so
           navigating back to "home" returns to the same layout. -->
      <section class="start-section">
        <h2 class="start-section__title">Huisstijl varianten (afgerond 13 mei)</h2>
        <div class="start-section__buttons">
          <button
            type="button"
            class="start-btn"
            @click="startFirstReleaseFromHome('1')"
          >Variant 1</button>
          <button
            type="button"
            class="start-btn"
            @click="startFirstReleaseFromHome('2')"
          >Variant 2</button>
          <button
            type="button"
            class="start-btn"
            @click="startFirstReleaseFromHome('3')"
          >Variant 3</button>
          <button
            type="button"
            class="start-btn"
            @click="startFirstReleaseFromHome('4')"
          >Variant 4</button>
          <button
            type="button"
            class="start-btn"
            @click="startFirstReleaseFromHome('5')"
          >Variant 5</button>
          <button
            type="button"
            class="start-btn"
            @click="startVariantFromAd"
          >Start met advertentie</button>
        </div>
      </section>

      <!-- Component library — reusable Vue components extracted from the
           first-release prototype, showcased on a dedicated page. -->
      <section class="start-section">
        <h2 class="start-section__title">Component library</h2>
        <p class="start-section__lead">
          Herbruikbare Vue-componenten op basis van het First Release prototype.
        </p>
        <div class="start-section__buttons">
          <button
            type="button"
            class="start-btn start-btn--primary"
            @click="navigateTo('/library')"
          >Open component library</button>
        </div>
      </section>

      <!-- Northstar — old prototype, afgerond/bevroren op 8 mei. -->
      <section class="start-section">
        <h2 class="start-section__title">Northstar concept (afgerond op 8 mei)</h2>
        <div class="start-section__buttons">
          <button
            type="button"
            class="start-btn"
            @click="startNorthstarFromHome"
          >Homepage</button>
          <button
            type="button"
            class="start-btn"
            @click="startNorthstarFromAd"
          >Start met advertentie</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHomeVariant } from '~/composables/useHomeVariant'
const { clear } = usePartner()
const { setHomeVariant } = useHomeVariant()
// First Release hero-photo carousel — reset to picture 1 on every fresh
// start-screen launch so the home always opens on the default photo.
const { setHeroPhotoIndex } = useFirstReleaseHomeVariant()
const {
  clearArrivalDate,
  setSearchGroup,
  clearDuration,
  setFlexibility,
  resetBudget,
  clearFilterTags,
  clearDestinations,
} = useSearchState()

// Second Release mirror — full independent copy with its own composables.
const { setHeroPhotoIndex: setHeroPhotoIndexSr } = useSecondReleaseHomeVariant()
const { set: setPartnerSr, clear: clearSr } = useSecondReleasePartner()
const {
  clearArrivalDate: clearArrivalDateSr,
  setSearchGroup: setSearchGroupSr,
  clearDuration: clearDurationSr,
  setFlexibility: setFlexibilitySr,
  resetBudget: resetBudgetSr,
  clearFilterTags: clearFilterTagsSr,
  clearDestinations: clearDestinationsSr,
} = useSecondReleaseSearchState()

// Northstar mirror — separate state lives in its own composables.
const { clear: clearNs } = useNorthstarPartner()
const {
  clearArrivalDate: clearArrivalDateNs,
  setSearchGroup: setSearchGroupNs,
  clearDuration: clearDurationNs,
  setFlexibility: setFlexibilityNs,
  resetBudget: resetBudgetNs,
  clearFilterTags: clearFilterTagsNs,
  clearDestinations: clearDestinationsNs,
} = useNorthstarSearchState()

// Landing on the start screen always resets any leftover partner flag (both
// versions) so each user-test run starts clean.
onMounted(() => {
  clear()
  clearNs()
  clearSr()
})

function resetAll() {
  clear()
  clearArrivalDate()
  setSearchGroup(2, 1)
  clearDuration()
  setFlexibility(0)
  resetBudget()
  clearFilterTags()
  clearDestinations()
}

function resetAllNorthstar() {
  clearNs()
  clearArrivalDateNs()
  setSearchGroupNs(2, 1)
  clearDurationNs()
  setFlexibilityNs(0)
  resetBudgetNs()
  clearFilterTagsNs()
  clearDestinationsNs()
}

function startFirstReleaseFromHome(variant: '1' | '2' | '3' | '4' | '5' = '1') {
  resetAll()
  setHomeVariant(variant)
  const path = variant === '5' ? '/huisstijl/home-v5'
    : variant === '4' ? '/huisstijl/home-v4'
    : variant === '3' ? '/huisstijl/home-v3'
    : variant === '2' ? '/huisstijl/home-v2'
    : '/huisstijl/home'
  navigateTo(path)
}

/** First-release "Hotel First" — start on the dedicated
 *  /first-release/home page. Sets the variant flag to 'hf' so any
 *  in-app "home" link returns to first-release/home while the
 *  prototype is active. */
function startHotelFirstFromHome() {
  resetAll()
  setHomeVariant('hf')
  setHeroPhotoIndex(0)   // always open on picture 1 (the default hero)
  navigateTo('/first-release/home')
}

/** First-release "Hotel First" — start on the partner advertisement
 *  flow. Same /advertisement page as the variant flow, but with the
 *  home variant pre-set to 'hf' so subsequent navigation returns to
 *  /hotel-first rather than /home.
 *
 *  Uses `window.location.href` rather than `navigateTo()` because the
 *  advertisement is a static HTML file at `public/advertisement/index.html`
 *  served by Nitro — Vue Router doesn't know about it and would 404. */
function startHotelFirstFromAd() {
  resetAll()
  setHomeVariant('hf')
  setHeroPhotoIndex(0)   // always open on picture 1 (the default hero)
  if (import.meta.client) {
    window.location.href = '/advertisement/'
  }
}

/** Reset Second Release session state so each run starts clean. */
function resetAllSecondRelease() {
  clearSr()
  clearArrivalDateSr()
  setSearchGroupSr(2, 1)
  clearDurationSr()
  setFlexibilitySr(0)
  resetBudgetSr()
  clearFilterTagsSr()
  clearDestinationsSr()
}

/** Second Release — start on the dedicated /second-release/home page. */
function startSecondReleaseFromHome() {
  resetAllSecondRelease()
  setHeroPhotoIndexSr(0)
  navigateTo('/second-release/home')
}

/** Second Release solo-travel landing page — the homepage hero over the
 *  search results, defaulted to 1 persoon / 1 kamer. */
function startSecondReleaseSolo() {
  resetAllSecondRelease()
  setSearchGroupSr(1, 1)
  navigateTo('/second-release/search?landing=solo')
}

/** Second Release NUshop entry — skip the intermediate advertisement page
 *  and land straight on the co-branded Hotel des Indes deal page with the
 *  NUshop partner logo (partner flag set + `?partner=nu` query). */
function startSecondReleaseFromNushop() {
  resetAllSecondRelease()
  setPartnerSr('nu')
  navigateTo('/second-release/deal/ervaar-pure-luxe-in-het-chique-5-hotel-des-indes?partner=nu')
}

/** "Start with ad" for the experimental homepage variants. Same static
 *  HTML page, but doesn't touch homeVariant so subsequent "home" links
 *  go back to whichever variant was active before. */
function startVariantFromAd() {
  resetAll()
  if (import.meta.client) {
    window.location.href = '/advertisement/'
  }
}

function startNorthstarFromHome() {
  resetAllNorthstar()
  navigateTo('/northstar/home')
}

/** "Start with ad" for Northstar — skip the static partner ad page and
 *  drop the user straight on the Northstar deal page that the ad would
 *  link to (with the partner=nu flag for co-branding). */
function startNorthstarFromAd() {
  resetAllNorthstar()
  navigateTo('/northstar/deal/ervaar-pure-luxe-in-het-chique-5-hotel-des-indes?partner=nu')
}

useHead({
  title: 'ViaLuxury Prototype',
})
definePageMeta({ layout: false })
</script>

<style scoped>
.start-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background, #fafafa);
  padding: var(--space-xl);
}

.start-screen__inner {
  width: 100%;
  max-width: 480px;
  text-align: center;
}

.start-screen__logo {
  width: 200px;
  height: auto;
  margin: 0 auto var(--space-xl);
  display: block;
}

.start-screen__title {
  font-family: var(--font-heading);
  font-size: 40px;
  font-weight: 700;
  margin: 0 0 var(--space-xs);
  color: var(--color-text-primary);
  line-height: 1.1;
}

.start-screen__subtitle {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 var(--space-lg);
  color: var(--color-text-primary);
}

.start-screen__contact {
  margin: 0 0 var(--space-xl);
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.start-screen__contact-line {
  margin: 0;
}

.start-screen__contact-line strong {
  color: var(--color-text-primary);
  font-weight: 600;
}

.start-section {
  margin-bottom: var(--space-xl);
  padding: var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: #fff;
}

.start-section__title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 var(--space-md);
  color: var(--color-text-primary);
}

/* Lead line under the section title — used by the "First release"
   block to surface the Google Sheets scope link. */
.start-section__lead {
  margin: 0 0 var(--space-md);
  font-size: 14px;
  color: var(--color-text-secondary);
  text-align: left;
}

.start-section__link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}

.start-section__link:hover,
.start-section__link:focus-visible {
  text-decoration: underline;
}

.start-section__buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.start-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  background: #fff;
  color: var(--color-text-primary);
  border: 1.5px solid var(--color-border);
  transition: border-color var(--transition-fast), color var(--transition-fast);
  cursor: pointer;
}

.start-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Orange primary variant — used on the "Hotel First" homepage button
   to signal it as the production-bound CTA. */
.start-btn--primary {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
  font-weight: 700;
}

.start-btn--primary:hover {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  color: #fff;
}

</style>
