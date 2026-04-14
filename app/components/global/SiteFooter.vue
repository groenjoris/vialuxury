<template>
  <footer class="site-footer">
    <div class="site-footer__inner container">
      <div class="footer-col footer-col--brand">
        <div class="footer-logo">
          <span class="logo-text">VIA<br />LUXU<br />RY</span>
        </div>
        <div class="footer-rating">★★★★☆</div>
      </div>

      <div class="footer-col">
        <h4 class="footer-heading">Hulp nodig?</h4>
        <ul class="footer-links">
          <li><a href="tel:+31857773222">☎ +31 85 777 3222</a></li>
          <li><a href="mailto:info@vialuxury.nl">✉ info@vialuxury.nl</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4 class="footer-heading">Inspiratie</h4>
        <ul class="footer-links">
          <li><a href="#">Populaire bestemmingen</a></li>
          <li><a href="#">Last minutes</a></li>
          <li><a href="#">Gift Cards</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4 class="footer-heading">ViaLuxury</h4>
        <ul class="footer-links">
          <li><a href="#">Over ons</a></li>
          <li><a href="#">Veelgestelde vragen</a></li>
          <li><a href="#">Contact</a></li>
          <li><a href="#">Algemene voorwaarden</a></li>
          <li><a href="#">Privacybeleid</a></li>
        </ul>
      </div>
    </div>

    <div class="site-footer__bottom">
      <div class="container">
        <p>&copy; {{ new Date().getFullYear() }} ViaLuxury. Alle rechten voorbehouden.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background-color: #1B4D4A;
  color: white;
  margin-top: var(--space-3xl);
}

.site-footer__inner {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: var(--space-2xl);
  padding: var(--space-2xl) var(--space-lg);
}

.footer-logo .logo-text {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 14px;
  line-height: 1.1;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: white;
}

.footer-rating {
  color: var(--color-primary);
  margin-top: var(--space-sm);
}

.footer-heading {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--space-md);
}

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

.site-footer__bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  padding: var(--space-md) 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}
</style>
