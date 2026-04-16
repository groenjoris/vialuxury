<template>
  <div class="vakantieparken">
    <TopBar />
    <SiteHeader />

    <!-- Consumer section -->
    <section class="vp-hero">
      <div class="container vp-hero__inner">
        <div class="vp-hero__icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#00B67A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <h1 class="vp-hero__heading">{{ t('vakantieparken.heading') }}</h1>
        <p class="vp-hero__text">{{ t('vakantieparken.intro') }}</p>
        <form class="vp-hero__form" @submit.prevent>
          <input
            type="email"
            class="vp-hero__input"
            :placeholder="t('vakantieparken.emailPlaceholder')"
          />
          <button type="submit" class="vp-hero__button">
            {{ t('vakantieparken.submit') }}
          </button>
        </form>
      </div>
    </section>

    <!-- B2B section -->
    <section class="vp-b2b">
      <div class="container vp-b2b__inner">
        <h2 class="vp-b2b__heading">{{ t('vakantieparken.b2bHeading') }}</h2>
        <p class="vp-b2b__text">{{ t('vakantieparken.b2bText') }}</p>
        <a href="mailto:vakantieparken@vialuxury.com" class="vp-b2b__button">
          {{ t('vakantieparken.b2bButton') }}
        </a>
      </div>
    </section>

    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

useHead({ title: 'Vakantieparken | ViaLuxury' })
</script>

<style scoped>
/* ── Hero / Consumer section ── */
.vp-hero {
  background-color: #F5F5F5;
  padding: 100px 0 80px;
}

.vp-hero__inner {
  max-width: 580px;
  margin: 0 auto;
  text-align: center;
}

.vp-hero__icon {
  margin-bottom: 24px;
}

.vp-hero__heading {
  font-family: var(--font-heading);
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-text-primary);
  margin-bottom: 16px;
}

.vp-hero__text {
  font-family: var(--font-body);
  font-size: 17px;
  line-height: 1.7;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
}

.vp-hero__form {
  display: flex;
  gap: 12px;
  max-width: 480px;
  margin: 0 auto;
}

.vp-hero__input {
  flex: 1;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 15px;
  background: var(--color-surface);
  color: var(--color-text-primary);
  transition: border-color 0.2s;
}

.vp-hero__input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.vp-hero__button {
  padding: 14px 28px;
  background-color: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s;
}

.vp-hero__button:hover {
  background-color: var(--color-primary-hover);
}

/* ── B2B section ── */
.vp-b2b {
  padding: 80px 0;
}

.vp-b2b__inner {
  max-width: 620px;
  margin: 0 auto;
  text-align: center;
}

.vp-b2b__heading {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 16px;
}

.vp-b2b__text {
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.7;
  color: var(--color-text-secondary);
  margin-bottom: 28px;
}

.vp-b2b__button {
  display: inline-block;
  padding: 14px 36px;
  background-color: var(--color-discount);
  color: #fff;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.2s;
}

.vp-b2b__button:hover {
  opacity: 0.9;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .vp-hero {
    padding: 64px 0 56px;
  }

  .vp-hero__heading {
    font-size: 28px;
  }

  .vp-hero__form {
    flex-direction: column;
  }

  .vp-b2b {
    padding: 56px 0;
  }

  .vp-b2b__heading {
    font-size: 24px;
  }
}
</style>
