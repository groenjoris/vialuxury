<template>
  <div class="top-bar">
    <div class="top-bar__inner container">
      <div class="top-bar__item">
        <span class="top-bar__icon">★</span>
        <span>Gasten beoordelen ons met een 4.5/5 op Trustpilot</span>
      </div>
      <div class="top-bar__item">
        <span class="top-bar__icon">✓</span>
        <span>Altijd de beste deal</span>
      </div>
      <div class="top-bar__item">
        <span class="top-bar__icon">✓</span>
        <span>Gemakkelijk annuleren</span>
      </div>
      <div class="top-bar__item">
        <span class="top-bar__icon">✓</span>
        <span>Uitgebreid aanbod hotel experiences</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.top-bar {
  background-color: #3A3A3A;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  height: 34px;
  display: flex;
  align-items: center;
}

.top-bar__inner {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.top-bar__item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.top-bar__icon {
  font-size: 12px;
  color: var(--color-primary);
}
</style>
