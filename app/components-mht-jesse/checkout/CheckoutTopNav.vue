<!-- Multi Hotel Trip checkout — donkere afrekenbalk (uit het
     flexibel-annuleren prototype: TopNav). -->
<template>
  <header class="nav">
    <div class="nav__inner">
      <div class="nav__brand">
        <NuxtLink to="/mht-jesse/home" aria-label="Naar de homepage">
          <img
            class="nav__logo"
            src="/images/logos/logo-vialuxury-horizontal-black.svg"
            alt="ViaLuxury"
          />
        </NuxtLink>
      </div>

      <button class="nav__service" type="button">
        <span>Klantenservice</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <div class="nav__safe">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" stroke-width="2" />
          <path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <span>Veilig afrekenen</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav {
  background: var(--c-via-black);
  color: var(--c-white);
  height: 72px;
  display: flex;
  align-items: center;
}
.nav__inner {
  width: 100%;
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 0 40px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
}
.nav__brand {
  display: flex;
  align-items: center;
  gap: 14px;
  justify-self: start;
}
.nav__logo {
  height: 15px;
  width: auto;
  /* Black wordmark -> white for the dark bar */
  filter: brightness(0) invert(1);
}
.nav__service {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--c-white);
  font-size: var(--t-body);
  font-weight: 500;
  justify-self: center;
}
.nav__safe {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: var(--t-body);
  font-weight: 500;
  justify-self: end;
}
</style>
