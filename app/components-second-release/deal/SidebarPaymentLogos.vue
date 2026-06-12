<template>
  <!-- Single strip of accepted-payment-method logos shown under
       every "Ik ga boeken" button on the deal-page sidebar.
       Locale-aware: NL → iDEAL + Maestro + Mastercard + Visa + V-Pay;
       DE → Bancontact + Giropay + CB + iDEAL + Mastercard + PayPal.
       Assets live in `public/images/payment-providers/<locale>/`. -->
  <ul class="sidebar-pay" aria-label="Geaccepteerde betaalmethodes">
    <li v-for="p in logos" :key="p.name" class="sidebar-pay__item">
      <img :src="p.src" :alt="p.name" loading="lazy" />
    </li>
  </ul>
</template>

<script setup lang="ts">
const { locale } = useSecondReleaseI18n()

const DUTCH = ['ideal', 'maestro', 'mastercard', 'visa', 'vpay']
const GERMAN = ['bancontact', 'giro', 'cb', 'ideal', 'mastercard', 'paypal']

const logos = computed(() => {
  const folder = locale.value === 'de' ? 'german' : 'dutch'
  const set = locale.value === 'de' ? GERMAN : DUTCH
  return set.map(name => ({
    name,
    src: `/images/payment-providers/${folder}/${name}.svg`,
  }))
})
</script>

<style scoped>
/* Spread the logos evenly across the full width of the sidebar
   (matches the book-button width above): first logo flush-left,
   last flush-right, equal gaps between. */
.sidebar-pay {
  list-style: none;
  margin: var(--space-md) 0 0;
  padding: 0;
  width: 100%;
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
}
.sidebar-pay__item {
  display: inline-flex;
  flex: 0 0 auto;
  min-width: 0;
}
.sidebar-pay__item img {
  height: 22px;
  width: auto;
  max-width: 100%;
  display: block;
  object-fit: contain;
}
</style>
