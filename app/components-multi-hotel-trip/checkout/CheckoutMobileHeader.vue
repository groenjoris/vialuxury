<script setup lang="ts">
// Multi Hotel Trip checkout — mobiele site: donkere balk (gestapeld logo, "Veilig uitchecken", hamburger)
// met daaronder de voortgangsbalkjes (terug-pijl, 3 segmenten, koffertje).
withDefaults(defineProps<{ step?: number }>(), { step: 1 })

function goBack() {
  if (import.meta.client) window.history.back()
}
</script>

<template>
  <div>
    <header class="mnav">
      <NuxtLink to="/multi-hotel-trip/home" aria-label="Naar de homepage">
        <img class="mnav__logo" src="/images/logo-vialuxury.svg" alt="ViaLuxury" />
      </NuxtLink>
      <div class="mnav__right">
        <span class="mnav__safe">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" stroke-width="2" />
            <path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          Veilig uitchecken
        </span>
        <button class="mnav__menu" type="button" aria-label="Menu">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" /></svg>
        </button>
      </div>
    </header>

    <div class="mprogress">
      <button class="mprogress__back" type="button" aria-label="Terug" @click="goBack">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
      <span
        v-for="n in 3"
        :key="n"
        class="mprogress__bar"
        :class="{ 'mprogress__bar--active': n <= step }"
      />
      <svg class="mprogress__icon" width="26" height="26" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="8" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.8" />
        <path d="M9 8V6a2 2 0 012-2h2a2 2 0 012 2v2" stroke="currentColor" stroke-width="1.8" />
        <path d="M9 8v12M15 8v12" stroke="currentColor" stroke-width="1.8" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.mnav {
  background: var(--c-via-black);
  color: var(--c-white);
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.mnav__logo {
  height: 44px;
  width: auto;
  display: block;
  /* Zwart woordmerk -> wit op de donkere balk */
  filter: brightness(0) invert(1);
}
.mnav__right {
  display: flex;
  align-items: center;
  gap: 18px;
}
.mnav__safe {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
}
.mnav__menu {
  color: var(--c-white);
  display: inline-flex;
}

.mprogress {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
}
.mprogress__back {
  color: var(--c-via-black);
  display: inline-flex;
  margin-right: 4px;
}
.mprogress__bar {
  flex: 1;
  height: 8px;
  border-radius: 100px;
  background: var(--c-light-grey);
}
.mprogress__bar--active {
  background: var(--c-via-green);
}
.mprogress__icon {
  color: var(--c-via-black);
  margin-left: 4px;
}
</style>
