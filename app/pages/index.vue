<template>
  <div class="start-screen">
    <div class="start-screen__inner">
      <img src="/images/logo-vialuxury.svg" alt="ViaLuxury" class="start-screen__logo" />
      <h1 class="start-screen__title">User test</h1>
      <p class="start-screen__intro">
        Kies waar je deze sessie wilt starten.
      </p>
      <div class="start-screen__buttons">
        <a href="/advertisement/" class="start-btn start-btn--primary">
          Start met advertentie
        </a>
        <button type="button" class="start-btn start-btn--outline" @click="startFromHome">
          Start vanaf homepage
        </button>
      </div>
      <p class="start-screen__note">
        Hiermee start een test-sessie. De partnerschap met nu.nl is alleen
        actief wanneer je via de advertentie binnenkomt.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { clear } = usePartner()
const {
  clearArrivalDate,
  setSearchGroup,
  clearDuration,
  setFlexibility,
  resetBudget,
  clearFilterTags,
  clearDestinations,
} = useSearchState()

// Landing on the start screen always resets any leftover partner flag, so
// each user-test run starts clean.
onMounted(() => {
  clear()
})

/** "Start vanaf homepage" wipes every search/filter selection so the next
 *  test run starts with a fresh navbar — no leftover destination, date,
 *  persons-rooms, nights, themes, budget, etc. Then navigates to /home. */
function startFromHome() {
  clear()
  clearArrivalDate()
  setSearchGroup(2, 1)
  clearDuration()
  setFlexibility(0)
  resetBudget()
  clearFilterTags()
  clearDestinations()
  navigateTo('/home')
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
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 var(--space-sm);
  color: var(--color-text-primary);
}

.start-screen__intro {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-xl);
}

.start-screen__buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.start-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: filter var(--transition-fast), background var(--transition-fast),
    color var(--transition-fast);
}

.start-btn--primary {
  background: var(--color-primary);
  color: #fff;
}
.start-btn--primary:hover { filter: brightness(0.95); }

.start-btn--outline {
  background: #fff;
  color: var(--color-text-primary);
  border: 1.5px solid var(--color-border);
}
.start-btn--outline:hover { border-color: var(--color-primary); color: var(--color-primary); }

.start-screen__note {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin: 0;
}
</style>
