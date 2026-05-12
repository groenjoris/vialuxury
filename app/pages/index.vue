<template>
  <div class="start-screen">
    <div class="start-screen__inner">
      <img src="/images/logo-vialuxury.svg" alt="ViaLuxury" class="start-screen__logo" />

      <h1 class="start-screen__title">Hotel First &amp; Variabel Reisgezelschap</h1>

      <!-- Nieuwe huisstijl — actively developed prototype. Four homepage
           variants live next to each other; the chosen variant persists
           in localStorage so navigating back to "home" returns to the
           same layout. -->
      <section class="start-section">
        <h2 class="start-section__title">Nieuwe huisstijl</h2>
        <div class="start-section__buttons">
          <button
            type="button"
            class="start-btn"
            @click="startFirstReleaseFromHome('1')"
          >Variant 1 (full-bleed hero, zoekbalk in foto)</button>
          <button
            type="button"
            class="start-btn"
            @click="startFirstReleaseFromHome('2')"
          >Variant 2 (verticale zoekkaart rechts, USP-kolom onder)</button>
          <button
            type="button"
            class="start-btn"
            @click="startFirstReleaseFromHome('3')"
          >Variant 3 (afgeronde foto, zoekbalk eronder)</button>
          <button
            type="button"
            class="start-btn"
            @click="startFirstReleaseFromHome('4')"
          >Variant 4 (variant 3 + Trustpilot &amp; Klarna)</button>
          <button
            type="button"
            class="start-btn"
            @click="startFirstReleaseFromHome('5')"
          >Variant 5 (variant 4 met full-bleed hero foto)</button>
          <a
            href="/advertisement/"
            class="start-btn"
            @click="resetAll"
          >Start met advertentie (partner-flow met co-branding)</a>
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
          >Homepage (start vanaf de Northstar homepage)</button>
          <button
            type="button"
            class="start-btn"
            @click="startNorthstarFromAd"
          >Start met advertentie (start direct op een Northstar deal-pagina)</button>
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

</style>
