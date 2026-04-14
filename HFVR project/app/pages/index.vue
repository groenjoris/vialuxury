<template>
  <div class="home">
    <TopBar />
    <SiteHeader />
    <div class="container home__content">
      <h1>Via Luxury</h1>
      <p>Ontdek exclusieve hotelarrangementen</p>
      <NuxtLink to="/deal/ter-zand" class="btn btn-primary home__cta">
        Bekijk Hotel Ter Zand deal →
      </NuxtLink>
      <NuxtLink to="/hotel/ter-zand" class="home__link">
        Of bekijk de configurator-versie →
      </NuxtLink>
    </div>
    <SiteFooter />
  </div>
</template>

<style scoped>
.home__content {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: var(--space-lg);
}

.home__cta {
  max-width: 400px;
  text-decoration: none;
}
</style>
