<template>
  <div class="home">
    <TopBar />
    <SiteHeader />
    <div class="container home__content">
      <p class="home__message">Gebruik de zoekbalk om demo te starten.</p>
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
}

.home__message {
  font-size: 18px;
  color: var(--color-text-secondary);
  font-style: italic;
}
</style>
