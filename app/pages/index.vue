<template>
  <div class="start-screen">
    <div class="start-screen__inner">
      <img src="/images/logo-vialuxury.svg" alt="ViaLuxury" class="start-screen__logo" />

      <h1 class="start-screen__title">Hotel First &amp; Variabel Reisgezelschap</h1>

      <!-- First release — the production-bound "Hotel First" build the
           client has picked to pursue. No homepage-variant switcher. -->
      <section class="start-section">
        <h2 class="start-section__title">First release: hotel first</h2>
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
const {
  clearArrivalDate,
  setSearchGroup,
  clearDuration,
  setFlexibility,
  resetBudget,
  clearFilterTags,
  clearDestinations,
} = useSearchState()

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
  const path = variant === '5' ? '/home-v5'
    : variant === '4' ? '/home-v4'
    : variant === '3' ? '/home-v3'
    : variant === '2' ? '/home-v2'
    : '/home'
  navigateTo(path)
}

/** First-release "Hotel First" — start on the dedicated /hotel-first
 *  page (copy of variant 1 without the variant carousel). Sets the
 *  home variant to 'hf' so any in-app "home" link (logo, footer,
 *  /kaart close button) returns to /hotel-first. */
function startHotelFirstFromHome() {
  resetAll()
  setHomeVariant('hf')
  navigateTo('/hotel-first')
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
  if (import.meta.client) {
    window.location.href = '/advertisement/'
  }
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
  title: 'User test | ViaLuxury',
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
