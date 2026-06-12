<template>
  <ul class="payment-logos" aria-label="Geaccepteerde betaalmethodes">
    <li v-for="p in logos" :key="p.name" class="payment-logos__item">
      <img :src="p.src" :alt="p.name" loading="lazy" />
    </li>
  </ul>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  locale?: 'nl' | 'de'
}>(), {
  locale: 'nl',
})

const DUTCH = ['ideal', 'maestro', 'mastercard', 'visa', 'vpay']
const GERMAN = ['bancontact', 'giro', 'cb', 'ideal', 'mastercard', 'paypal']

const logos = computed(() => {
  const folder = props.locale === 'de' ? 'german' : 'dutch'
  const set = props.locale === 'de' ? GERMAN : DUTCH
  return set.map(name => ({
    name,
    src: `/images/payment-providers/${folder}/${name}.svg`,
  }))
})
</script>

<style scoped>
/* Spread the logos evenly across the full width: first logo flush-left,
   last flush-right, equal gaps between. */
.payment-logos {
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
.payment-logos__item {
  display: inline-flex;
  flex: 0 0 auto;
  min-width: 0;
}
.payment-logos__item img {
  height: 22px;
  width: auto;
  max-width: 100%;
  display: block;
  object-fit: contain;
}
</style>
