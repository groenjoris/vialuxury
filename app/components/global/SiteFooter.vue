<template>
  <footer class="site-footer">
    <div class="site-footer__inner container">
      <!-- Brand column -->
      <div class="footer-col footer-col--brand">
        <NuxtLink :to="homeHref" class="footer-logo">
          <img src="/images/logo-vialuxury.svg" alt="ViaLuxury" class="footer-logo__img" />
        </NuxtLink>

        <!-- Trustpilot -->
        <div class="footer-trustpilot">
          <div class="footer-trustpilot__stars">
            <svg v-for="n in 5" :key="n" width="20" height="20" viewBox="0 0 24 24" :fill="n <= 4 ? '#00B67A' : '#DCE3DF'" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
            </svg>
          </div>
          <span class="footer-trustpilot__score">{{ t('footer.trustpilotScore') }}</span>
          <span class="footer-trustpilot__label">{{ t('footer.trustpilotLabel') }}</span>
        </div>
      </div>

      <!-- Hulp nodig? -->
      <div class="footer-col">
        <h4 class="footer-heading">{{ t('footer.needHelp') }}</h4>
        <ul class="footer-links">
          <li>
            <a href="tel:+31857773222" class="footer-links__item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.11 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              {{ t('footer.phone') }}
            </a>
          </li>
          <li class="footer-links__sub">{{ t('footer.phoneHours') }}</li>
          <li>
            <a href="https://wa.me/31857773222" target="_blank" class="footer-links__item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785c-1.886 0-3.734-.506-5.344-1.462l-.383-.228-3.976 1.043 1.062-3.882-.25-.398A9.89 9.89 0 011.775 12.1c0-5.478 4.46-9.935 9.94-9.935a9.87 9.87 0 017.022 2.91 9.86 9.86 0 012.908 7.024c-.004 5.478-4.462 9.935-9.94 9.935h-.004zm0-21.785C5.495 0 .11 5.382.11 12.05a11.93 11.93 0 001.597 5.974L0 24l6.154-1.614A11.95 11.95 0 0012.05 24c6.568 0 11.89-5.382 11.89-12S18.618 0 12.05 0z"/></svg>
              {{ t('footer.whatsapp') }}
            </a>
          </li>
          <li class="footer-links__divider"></li>
          <li><NuxtLink to="/faq">{{ t('footer.faqLink') }}</NuxtLink></li>
          <li><NuxtLink to="/contact">{{ t('footer.contactForm') }}</NuxtLink></li>
        </ul>
      </div>

      <!-- Inspiratie / Best geboekt -->
      <div class="footer-col">
        <h4 class="footer-heading">{{ t('footer.inspiration') }}</h4>
        <ul class="footer-links">
          <li><NuxtLink to="/search?city=amsterdam">Amsterdam</NuxtLink></li>
          <li><NuxtLink to="/search?city=antwerpen">Antwerpen</NuxtLink></li>
          <li><NuxtLink to="/search?city=maastricht">Maastricht</NuxtLink></li>
          <li><NuxtLink to="/search?city=rotterdam">Rotterdam</NuxtLink></li>
          <li><NuxtLink to="/search?city=utrecht">Utrecht</NuxtLink></li>
          <li class="footer-links__divider"></li>
          <li><NuxtLink to="/shopping">{{ t('footer.shopping') }}</NuxtLink></li>
        </ul>
      </div>

      <!-- ViaLuxury -->
      <div class="footer-col">
        <h4 class="footer-heading">ViaLuxury</h4>
        <ul class="footer-links">
          <li><a href="#">{{ t('footer.aboutUs') }}</a></li>
          <li><NuxtLink to="/faq">{{ t('footer.faq') }}</NuxtLink></li>
          <li><NuxtLink to="/contact">{{ t('footer.contact') }}</NuxtLink></li>
          <li><a href="#">{{ t('footer.terms') }}</a></li>
          <li><a href="#">{{ t('footer.privacy') }}</a></li>
        </ul>
      </div>
    </div>

    <div class="site-footer__bottom">
      <div class="container site-footer__bottom-inner">
        <p>&copy; {{ new Date().getFullYear() }} ViaLuxury. {{ t('footer.allRightsReserved') }}</p>
        <NuxtLink to="/" class="site-footer__usertest-btn">Start scherm</NuxtLink>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useHomeVariant } from '~/composables/useHomeVariant'
const { t } = useI18n()
const { homeHref } = useHomeVariant()
</script>

<style scoped>
.site-footer {
  background-color: #1A1A1A;
  color: white;
  /* Sits flush against the last page section — its own internal padding
     provides enough breathing room. */
  margin-top: 0;
}

.site-footer__inner {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 1fr;
  gap: var(--space-2xl);
  padding: var(--space-2xl) var(--space-lg);
}

/* ── Brand column ── */
.footer-logo {
  display: inline-block;
  margin-bottom: var(--space-lg);
}

.footer-logo__img {
  height: 56px;
  width: auto;
  filter: brightness(0) invert(1);
}

/* ── Trustpilot ── */
.footer-trustpilot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.footer-trustpilot__stars {
  display: flex;
  gap: 2px;
}

.footer-trustpilot__score {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 700;
  color: white;
  margin-left: 4px;
}

.footer-trustpilot__label {
  font-family: var(--font-body);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  width: 100%;
}

/* ── Headings ── */
.footer-heading {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--space-md);
}

/* ── Links ── */
.footer-links {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.footer-links a {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-links a:hover {
  color: white;
}

.footer-links__item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.footer-links__item svg {
  flex-shrink: 0;
  opacity: 0.7;
}

.footer-links__sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: -4px;
  padding-left: 24px;
}

.footer-links__divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
  margin: var(--space-xs) 0;
}

/* ── Bottom bar ── */
.site-footer__bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  padding: var(--space-md) 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.site-footer__bottom-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.site-footer__usertest-btn {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 12px;
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast), color var(--transition-fast);
}
.site-footer__usertest-btn:hover {
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .site-footer__inner {
    grid-template-columns: 1fr;
    gap: var(--space-xl);
  }
}
</style>
