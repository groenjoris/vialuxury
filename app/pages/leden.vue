<template>
  <div class="members">
    <TopBar />
    <SiteHeader />

    <!-- Hero / Login Section -->
    <section class="members-hero">
      <div class="container">
        <!-- Login form -->
        <div class="members-login">
          <h2 class="members-login__heading">{{ t('members.loginHeading') }}</h2>
          <form class="members-login__form" @submit.prevent>
            <input
              type="email"
              class="members-login__input"
              :placeholder="t('members.emailPlaceholder')"
            />
            <button type="submit" class="members-login__button">
              {{ t('members.continueWithEmail') }}
            </button>
          </form>

          <div class="members-login__divider">
            <span class="members-login__divider-text">{{ t('members.orUseSocial') }}</span>
          </div>

          <div class="members-login__socials">
            <button class="members-login__social" aria-label="Google">
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09A6.97 6.97 0 015.46 12c0-.72.13-1.43.38-2.09V7.07H2.18A11.96 11.96 0 001 12c0 1.94.46 3.77 1.18 5.07l3.66-2.98z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </button>
            <button class="members-login__social" aria-label="Apple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#000">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.51-3.23 0-1.44.64-2.2.45-3.06-.4C3.79 16.17 4.36 9.43 8.9 9.16c1.28.07 2.17.74 2.92.8.93-.19 1.82-.9 3.06-.82 1.47.12 2.57.7 3.29 1.76-3.01 1.82-2.3 5.83.56 6.96-.65 1.72-1.49 3.42-2.99 4.78l.31-.36zM12.07 9.1c-.14-2.73 2.14-5.04 4.82-5.1.39 3.13-2.84 5.46-4.82 5.1z"/>
              </svg>
            </button>
            <button class="members-login__social" aria-label="Facebook">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Hero copy -->
        <div class="members-hero__content">
          <h1 class="members-hero__heading">{{ t('members.heroHeading') }}</h1>
          <p class="members-hero__intro">{{ t('members.heroIntro') }}</p>
        </div>
      </div>
    </section>

    <!-- USP 1: Loyalty points (text left, visual right) -->
    <section class="members-usp">
      <div class="container members-usp__row">
        <div class="members-usp__text">
          <h2 class="members-usp__heading">{{ t('members.usp1Heading') }}</h2>
          <p class="members-usp__body">{{ t('members.usp1Text') }}</p>
        </div>
        <div class="members-usp__visual">
          <div class="members-usp__icon-block">
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="members-usp__icon">
              <circle cx="40" cy="40" r="38" stroke="#FB862D" stroke-width="2.5" fill="none"/>
              <path d="M40 18l5.5 11.2 12.3 1.8-8.9 8.7 2.1 12.3L40 46.3l-11 5.7 2.1-12.3-8.9-8.7 12.3-1.8z" fill="#FB862D" opacity="0.15"/>
              <path d="M40 22l4.2 8.5 9.4 1.4-6.8 6.6 1.6 9.4L40 43.5l-8.4 4.4 1.6-9.4-6.8-6.6 9.4-1.4z" fill="#FB862D"/>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- USP 2: Early access (visual left, text right) -->
    <section class="members-usp members-usp--beige">
      <div class="container members-usp__row members-usp__row--reverse">
        <div class="members-usp__text">
          <h2 class="members-usp__heading">{{ t('members.usp2Heading') }}</h2>
          <p class="members-usp__body">{{ t('members.usp2Text') }}</p>
        </div>
        <div class="members-usp__visual">
          <div class="members-usp__icon-block">
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="members-usp__icon">
              <circle cx="40" cy="40" r="38" stroke="#004E4A" stroke-width="2.5" fill="none"/>
              <rect x="26" y="24" width="28" height="32" rx="3" fill="#004E4A" opacity="0.12"/>
              <rect x="29" y="27" width="22" height="26" rx="2" fill="none" stroke="#004E4A" stroke-width="2"/>
              <path d="M34 36h12M34 41h8" stroke="#004E4A" stroke-width="2" stroke-linecap="round"/>
              <circle cx="54" cy="28" r="8" fill="#FB862D"/>
              <path d="M51.5 28l2 2 3.5-3.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- USP 3: Exclusive deals (text left, visual right) -->
    <section class="members-usp">
      <div class="container members-usp__row">
        <div class="members-usp__text">
          <h2 class="members-usp__heading">{{ t('members.usp3Heading') }}</h2>
          <p class="members-usp__body">{{ t('members.usp3Text') }}</p>
        </div>
        <div class="members-usp__visual">
          <div class="members-usp__icon-block">
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="members-usp__icon">
              <circle cx="40" cy="40" r="38" stroke="#004E4A" stroke-width="2.5" fill="none"/>
              <path d="M28 34a12 12 0 0124 0v4H28v-4z" fill="#004E4A" opacity="0.12"/>
              <rect x="26" y="38" width="28" height="18" rx="2" fill="#004E4A" opacity="0.15"/>
              <rect x="28" y="40" width="24" height="14" rx="1.5" fill="none" stroke="#004E4A" stroke-width="2"/>
              <circle cx="40" cy="47" r="3" fill="#FB862D"/>
              <path d="M36 38v-4a4 4 0 018 0v4" stroke="#004E4A" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="members-steps members-steps--beige">
      <div class="container">
        <h2 class="members-steps__heading">{{ t('members.howItWorksHeading') }}</h2>
        <div class="members-steps__row">
          <div v-for="step in 3" :key="step" class="members-steps__card">
            <span class="members-steps__number">{{ t(`members.step${step}Number`) }}</span>
            <h3 class="members-steps__title">{{ t(`members.step${step}Title`) }}</h3>
            <p class="members-steps__text">{{ t(`members.step${step}Text`) }}</p>
          </div>
        </div>
        <p class="members-steps__disclaimer">{{ t('members.disclaimer') }}</p>
      </div>
    </section>

    <!-- CTA -->
    <section class="members-cta">
      <div class="container members-cta__inner">
        <h2 class="members-cta__heading">{{ t('members.ctaHeading') }}</h2>
        <p class="members-cta__text">{{ t('members.ctaText') }}</p>
        <NuxtLink to="/search" class="members-cta__button">
          {{ t('members.ctaButton') }}
        </NuxtLink>
      </div>
    </section>

    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

useHead({ title: 'Leden ingang | ViaLuxury' })
</script>

<style scoped>
/* ── Hero Section ─────────────────────────── */
.members-hero {
  background-color: #F8F2E6;
  padding: 64px 0 80px;
}

.members-login {
  max-width: 480px;
  margin: 0 auto 64px;
  text-align: center;
}

.members-login__heading {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 24px;
}

.members-login__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.members-login__input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 15px;
  background: var(--color-surface);
  color: var(--color-text-primary);
  transition: border-color 0.2s;
}

.members-login__input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.members-login__button {
  width: 100%;
  padding: 14px;
  background-color: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.members-login__button:hover {
  background-color: var(--color-primary-hover);
}

.members-login__divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}

.members-login__divider::before,
.members-login__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.members-login__divider-text {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.members-login__socials {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

.members-login__social {
  width: 56px;
  height: 56px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.members-login__social:hover {
  border-color: var(--color-text-muted);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.members-hero__content {
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
}

.members-hero__heading {
  font-family: var(--font-heading);
  font-size: 40px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-text-primary);
  margin-bottom: 20px;
}

.members-hero__intro {
  font-family: var(--font-body);
  font-size: 17px;
  line-height: 1.7;
  color: var(--color-text-secondary);
}

/* ── USP Sections ─────────────────────────── */
.members-usp {
  padding: 80px 0;
}

.members-usp--beige {
  background-color: #F8F2E6;
}

.members-usp__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}

.members-usp__row--reverse {
  direction: rtl;
}

.members-usp__row--reverse > * {
  direction: ltr;
}

.members-usp__heading {
  font-family: var(--font-heading);
  font-size: 30px;
  font-weight: 700;
  line-height: 1.25;
  color: var(--color-text-primary);
  margin-bottom: 16px;
}

.members-usp__body {
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.7;
  color: var(--color-text-secondary);
}

.members-usp__visual {
  display: flex;
  align-items: center;
  justify-content: center;
}

.members-usp__icon-block {
  width: 200px;
  height: 200px;
  background: var(--color-background-secondary);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.members-usp__icon {
  width: 100px;
  height: 100px;
}

/* ── How It Works ─────────────────────────── */
.members-steps {
  padding: 80px 0;
}

.members-steps--beige {
  background-color: #F8F2E6;
}

.members-steps__heading {
  font-family: var(--font-heading);
  font-size: 34px;
  font-weight: 700;
  text-align: center;
  color: var(--color-text-primary);
  margin-bottom: 48px;
}

.members-steps__row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.members-steps__card {
  background: var(--color-surface);
  border-radius: 16px;
  padding: 36px 28px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.members-steps__number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: #fff;
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
}

.members-steps__title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.members-steps__text {
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.65;
  color: var(--color-text-secondary);
}

.members-steps__disclaimer {
  text-align: center;
  margin-top: 36px;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-muted);
  font-style: italic;
}

/* ── CTA Section ──────────────────────────── */
.members-cta {
  padding: 80px 0;
  background-color: var(--color-discount);
}

.members-cta__inner {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.members-cta__heading {
  font-family: var(--font-heading);
  font-size: 34px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
}

.members-cta__text {
  font-family: var(--font-body);
  font-size: 17px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 32px;
}

.members-cta__button {
  display: inline-block;
  padding: 16px 48px;
  background-color: var(--color-primary);
  color: #fff;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 17px;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s;
}

.members-cta__button:hover {
  background-color: var(--color-primary-hover);
}

/* ── Responsive ───────────────────────────── */
@media (max-width: 768px) {
  .members-hero {
    padding: 40px 0 56px;
  }

  .members-login {
    margin-bottom: 48px;
  }

  .members-hero__heading {
    font-size: 28px;
  }

  .members-hero__intro {
    font-size: 15px;
  }

  .members-usp {
    padding: 56px 0;
  }

  .members-usp__row,
  .members-usp__row--reverse {
    grid-template-columns: 1fr;
    gap: 32px;
    direction: ltr;
  }

  .members-usp__heading {
    font-size: 24px;
  }

  .members-usp__visual {
    order: -1;
  }

  .members-usp__icon-block {
    width: 140px;
    height: 140px;
  }

  .members-usp__icon {
    width: 70px;
    height: 70px;
  }

  .members-steps {
    padding: 56px 0;
  }

  .members-steps__heading {
    font-size: 26px;
    margin-bottom: 32px;
  }

  .members-steps__row {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .members-cta {
    padding: 56px 0;
  }

  .members-cta__heading {
    font-size: 26px;
  }
}
</style>
