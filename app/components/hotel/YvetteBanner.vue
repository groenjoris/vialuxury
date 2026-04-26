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
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: #F5F5F5;
  border: 1px solid #E5E5E5;
  border-radius: var(--radius-lg);
}

.yvette-banner__photo {
  width: 96px;
  height: 96px;
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
  width: 100%;
}

.yvette-banner__heading {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm);
}

.yvette-banner__quote {
  font-size: 14px;
  line-height: 1.55;
  color: var(--color-text-secondary);
  font-style: italic;
  margin: 0;
}
</style>
