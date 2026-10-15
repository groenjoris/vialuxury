<script setup lang="ts">
// Multi Hotel Trip — Mijn ViaLuxury › Boekingen: overzicht van je boekingen (prototype: één
// actieve vakantieboeking) met statusfilters; de kaart linkt naar de detailpagina van de boeking.
import { useMultiHotelTripAccountBooking } from '~/composables-multi-hotel-trip/useMultiHotelTripAccountBooking'

const { checkout, dateRange, nights, persons, roomsPerHotel } = useMultiHotelTripAccountBooking()

type Filter = 'actief' | 'aankomend' | 'afgerond' | 'geannuleerd' | 'alle'
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'actief', label: 'Actief' },
  { id: 'aankomend', label: 'Aankomend' },
  { id: 'afgerond', label: 'Afgerond' },
  { id: 'geannuleerd', label: 'Geannuleerd' },
  { id: 'alle', label: 'Alle' },
]
const filter = ref<Filter>('actief')
/** De demo-boeking is actief (en aankomend): zichtbaar bij Actief, Aankomend en Alle. */
const visible = computed(() => ['actief', 'aankomend', 'alle'].includes(filter.value))
const detailHref = computed(() => `/multi-hotel-trip/account/boekingen/${checkout.value.slug}`)

useHead({ title: 'Boekingen — Mijn ViaLuxury' })
</script>

<template>
  <MultiHotelTripAccountShell active="boekingen">
    <h1 class="ab__title">Boekingen</h1>
    <p class="ab__lead">Bekijk al je boekingen overzichtelijk op één plek.</p>

    <div class="ab__filters" role="group" aria-label="Filter boekingen">
      <button
        v-for="f in FILTERS"
        :key="f.id"
        type="button"
        class="ab__chip"
        :class="{ 'ab__chip--on': filter === f.id }"
        :aria-pressed="filter === f.id"
        @click="filter = f.id"
      >{{ f.label }}</button>
    </div>

    <NuxtLink v-if="visible" class="ab__card" :to="detailHref">
      <img class="ab__img" :src="checkout.thumb" :alt="checkout.name" />
      <div class="ab__body">
        <p class="ab__eyebrow">{{ checkout.typeLabel }} met {{ checkout.hotels.length }} hotels</p>
        <h2 class="ab__name">{{ checkout.name }}</h2>
        <p class="ab__dates">{{ dateRange }} · {{ nights }} nachten</p>
        <p class="ab__meta">{{ checkout.hotels.map(h => h.name).join(' · ') }}</p>
        <p class="ab__meta">{{ persons }} personen · {{ roomsPerHotel }} {{ roomsPerHotel === 1 ? 'kamer' : 'kamers' }} per hotel</p>
      </div>
      <span class="ab__status ab__status--actief">Actief</span>
      <svg class="ab__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
    </NuxtLink>
    <p v-else class="ab__empty">Geen boekingen in deze categorie.</p>
  </MultiHotelTripAccountShell>
</template>

<style scoped>
.ab__title { margin: 0 0 8px; font-family: var(--font-heading); font-size: 34px; font-weight: 700; line-height: 1.15; }
.ab__lead { margin: 0 0 24px; font-size: 16px; color: var(--color-text-secondary); }
.ab__filters { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 24px; }
.ab__chip { padding: 10px 20px; border-radius: 999px; border: 1.5px solid var(--color-border); background: #fff; font-family: var(--font-body); font-size: 15px; font-weight: 500; color: var(--color-text-primary); cursor: pointer; transition: border-color var(--transition-fast), background var(--transition-fast); }
.ab__chip:hover { border-color: #c4c4c4; }
.ab__chip--on, .ab__chip--on:hover { border-color: var(--color-primary); background: #fff4ec; color: var(--color-text-primary); }

/* Boekingskaart: foto | tekst | status + chevron */
.ab__card { display: grid; grid-template-columns: 232px minmax(0, 1fr) auto auto; gap: 20px; align-items: center; padding: 16px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: #fff; color: inherit; text-decoration: none; transition: box-shadow var(--transition-fast), border-color var(--transition-fast); }
.ab__card:hover { border-color: #c4c4c4; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); }
.ab__img { display: block; width: 232px; height: 128px; object-fit: cover; border-radius: 8px; }
.ab__body p { margin: 0; }
.ab__eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-text-secondary); margin-bottom: 4px !important; }
.ab__name { margin: 0 0 6px; font-family: var(--font-heading); font-size: 21px; font-weight: 700; line-height: 1.25; }
.ab__dates { font-size: 15px; font-weight: 600; margin-bottom: 4px !important; }
.ab__meta { font-size: 14px; color: var(--color-text-secondary); line-height: 1.5; }
.ab__status { padding: 6px 12px; border-radius: 999px; font-size: 14px; font-weight: 600; white-space: nowrap; }
.ab__status--actief { background: #e4f5ec; color: #1f7a4d; }
.ab__chev { width: 20px; height: 20px; color: var(--color-text-secondary); }
.ab__empty { margin: 0; padding: 32px; border: 1px dashed var(--color-border); border-radius: var(--radius-md); text-align: center; color: var(--color-text-secondary); }

@media (max-width: 900px) {
  .ab__title { font-size: 28px; }
  .ab__chip { padding: 8px 14px; font-size: 14px; }
  .ab__card { grid-template-columns: 1fr; gap: 12px; }
  .ab__img { width: 100%; height: 160px; }
  .ab__status { justify-self: start; }
  .ab__chev { display: none; }
}
</style>
