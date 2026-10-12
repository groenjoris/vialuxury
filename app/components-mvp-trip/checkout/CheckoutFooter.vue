<!-- Multi Hotel Trip checkout — compacte footer met betaallogo's (uit het
     flexibel-annuleren prototype: SiteFooter). -->
<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__payments">
        <img src="/images/payment/ideal.svg" alt="iDEAL" />
        <img src="/images/payment/visa.svg" alt="VISA" />
        <img src="/images/payment/mastercard.svg" alt="Mastercard" />
        <img src="/images/payment/maestro.svg" alt="Maestro" />
        <img class="footer__klarna" src="/images/payment/klarna.webp" alt="Klarna" />
      </div>

      <div class="footer__meta">
        <span>© 2025 · ViaLuxury</span>
        <a href="#">Privacyverklaring</a>
        <a href="#">Cookiebeleid</a>
        <a href="#">Algemene voorwaarden</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--c-via-black);
  color: var(--c-white);
  padding: 40px 0;
  margin-top: 64px;
}
.footer__inner {
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}
.footer__payments {
  display: flex;
  align-items: center;
  gap: 12px;
}
.footer__payments img {
  height: 28px;
  width: auto;
  background: var(--c-white);
  border-radius: 4px;
  padding: 3px 6px;
}
.footer__klarna {
  padding: 3px 8px;
}
.footer__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 20px;
  font-size: var(--t-body);
  color: var(--c-light-grey);
}
.footer__meta a:hover {
  color: var(--c-white);
}
</style>
