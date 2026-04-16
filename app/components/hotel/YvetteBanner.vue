<template>
  <div class="yvette-banner">
    <div class="yvette-banner__photo">
      <img src="/images/yvette.jpeg" :alt="t('yvette.heading')" />
    </div>
    <div class="yvette-banner__content">
      <h3 class="yvette-banner__heading">
        {{ t('yvette.heading') }}
      </h3>
      <p class="yvette-banner__quote">{{ t('yvette.text') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<style scoped>
.yvette-banner {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: var(--space-xl);
  padding: var(--space-lg) var(--space-xl);
  background: #F5F5F5;
  border: 1px solid #E5E5E5;
  border-radius: var(--radius-lg);
}

.yvette-banner__photo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 3px solid var(--color-discount);
  box-shadow: 0 4px 12px rgba(0, 182, 122, 0.2);
}

.yvette-banner__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.yvette-banner__content {
  flex: 1;
  min-width: 0;
}

.yvette-banner__heading {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 6px;
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.yvette-banner__sub {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-primary);
}

.yvette-banner__quote {
  font-size: 14px;
  line-height: 1.65;
  color: var(--color-text-secondary);
  font-style: italic;
}

@media (max-width: 768px) {
  .yvette-banner {
    flex-direction: column;
    text-align: center;
    gap: var(--space-md);
    padding: var(--space-lg);
  }

  .yvette-banner__heading {
    justify-content: center;
  }
}
</style>
