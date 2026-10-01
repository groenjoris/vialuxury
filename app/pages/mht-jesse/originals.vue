<template>
  <div class="mhtj-originals" :data-variant="variant">
    <MhtJesseSiteHeader />

    <main class="originals">
      <div class="container">
        <header class="originals__head">
          <p class="originals__eyebrow">ViaLuxury</p>
          <h1 class="originals__title">Originals</h1>
          <p class="originals__lead">
            Arrangementen die je alleen bij ons vindt, genummerd en ingedeeld in zes collecties.
          </p>
        </header>

        <!-- Versie 1 (vol) of versie 2 (licht) uit de kleurnota, zodat beide
             naast elkaar te beoordelen zijn. De keuze blijft bewaard. -->
        <div class="originals__switch" role="group" aria-label="Labelversie">
          <span class="originals__switch-label">Labelversie</span>
          <div class="originals__switch-track">
            <button
              type="button"
              class="originals__switch-btn"
              :class="{ 'originals__switch-btn--on': variant === 'vol' }"
              :aria-pressed="variant === 'vol'"
              @click="variant = 'vol'"
            >Vol</button>
            <button
              type="button"
              class="originals__switch-btn"
              :class="{ 'originals__switch-btn--on': variant === 'licht' }"
              :aria-pressed="variant === 'licht'"
              @click="variant = 'licht'"
            >Licht</button>
          </div>
        </div>

        <!-- De zes collecties. Klikken filtert; nog een keer klikken zet hem uit. -->
        <div class="originals__collections" role="group" aria-label="Collecties">
          <button
            v-for="c in COLLECTIONS_IN_ORDER"
            :key="c.id"
            type="button"
            class="col-label originals__collection"
            :class="{ 'originals__collection--off': activeCollection !== null && activeCollection !== c.id }"
            :data-collection="c.id"
            :aria-pressed="activeCollection === c.id"
            @click="toggleCollection(c.id)"
          >
            <span class="originals__collection-icon" aria-hidden="true"></span>
            <span class="originals__collection-text">{{ c.label }}</span>
          </button>
        </div>

        <p class="originals__count">
          {{ shown.length }} {{ shown.length === 1 ? 'original' : 'originals' }}
        </p>

        <div v-if="shown.length > 0" class="originals__grid">
          <MhtJesseOriginalCard
            v-for="row in shown"
            :key="row.deal.id"
            :hotel="row.hotel"
            :deal="row.deal"
            :number="row.number"
            :collection="row.collection"
          />
        </div>
        <p v-else class="originals__empty">
          Geen originals met deze filters. <button type="button" class="originals__empty-link" @click="resetFilters">Wis de filters</button>
        </p>
      </div>
    </main>

    <MhtJesseSiteFooter />
  </div>
</template>

<script setup lang="ts">
/**
 * Multi Hotel Trip - Jesse — ViaLuxury Originals.
 *
 * Zoekpagina met alle arrangementen als genummerde "Originals". Elke kaart
 * hoort bij één van de zes collecties uit de kleurnota; die collectie bepaalt
 * de kleur van de band en is tevens het enige filter op deze pagina.
 *
 * `data-variant="vol"` op de wrapper kiest labelversie 1 (vlak in de
 * collectiekleur). Zet hem op "licht" voor versie 2 uit de nota.
 */
import { mappedHotels } from '~/data/deals-mapper'
import { tripSearchHotels } from '~/data/mhtj-trips'
import type { SearchHotel, SearchHotelDeal } from '~/types/searchHotel'
import { pickPrimaryDeal } from '~/utils-mht-jesse/primaryDeal'
import { COLLECTIONS_IN_ORDER, assignCollections, originalNumber, type CollectionId } from '~/utils-mht-jesse/originals'

useHead({ title: 'Originals — ViaLuxury' })

interface OriginalRow {
  hotel: SearchHotel
  deal: SearchHotelDeal
  number: string
  collection: CollectionId
}

/** Alle hotels plus de vakanties, elk met hun voornaamste arrangement. */
const pairs = [...mappedHotels, ...tripSearchHotels]
  .map(hotel => ({ hotel, deal: pickPrimaryDeal(hotel.deals) }))
  .filter((r): r is { hotel: SearchHotel; deal: SearchHotelDeal } => !!r.deal)

const assigned = assignCollections(pairs)

const allRows: OriginalRow[] = pairs.map((r, i) => ({
  ...r,
  number: originalNumber(i),
  collection: assigned.get(r.deal.id)!,
}))

/** 'vol' = versie 1 uit de nota, 'licht' = versie 2. Bewaard in
 *  localStorage zodat de keuze een herlaadbeurt overleeft. */
const VARIANT_KEY = 'vl_mhtj_originals_variant'
const variant = ref<'vol' | 'licht'>('vol')

onMounted(() => {
  const saved = localStorage.getItem(VARIANT_KEY)
  if (saved === 'vol' || saved === 'licht') variant.value = saved
})
watch(variant, v => {
  if (import.meta.client) localStorage.setItem(VARIANT_KEY, v)
})

const activeCollection = ref<CollectionId | null>(null)

function toggleCollection(id: CollectionId) {
  activeCollection.value = activeCollection.value === id ? null : id
}
function resetFilters() {
  activeCollection.value = null
}

const shown = computed(() =>
  activeCollection.value
    ? allRows.filter(r => r.collection === activeCollection.value)
    : allRows,
)
</script>

<style scoped>
.originals {
  padding-block: 40px 72px;
  background: var(--color-background-secondary);
  min-height: 60vh;
}

.originals__head { margin-bottom: 28px; }
.originals__eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.originals__title {
  margin: 0 0 8px;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 40px;
  line-height: 1.15;
}
.originals__lead {
  margin: 0;
  max-width: 60ch;
  font-size: 16px;
  color: var(--color-text-secondary);
}

.originals__switch {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.originals__switch-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.originals__switch-track {
  display: inline-flex;
  padding: 3px;
  background: var(--color-surface);
  border: 1px solid #e5e2da;
  border-radius: var(--radius-lg);
}
.originals__switch-btn {
  border: 0;
  background: none;
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 14px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.originals__switch-btn--on {
  background: var(--color-dark);
  color: #fff;
}

.originals__collections {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}
.originals__collection {
  border: 0;
  cursor: pointer;
  gap: 9px;
  padding: 7px 16px;
  border-radius: var(--radius-lg);
  transition: opacity var(--transition-fast);
}
/* Eén collectie aan: de andere vijf blijven zichtbaar maar treden terug. */
.originals__collection--off { opacity: 0.32; }
.originals__collection-icon {
  width: 22px;
  height: 22px;
  flex: none;
  background: currentColor;
  /* `--icon` komt via data-collection uit mhtj-originals.css. */
  -webkit-mask: var(--icon) center/contain no-repeat;
  mask: var(--icon) center/contain no-repeat;
}
/* Eén regel: alleen de naam van de collectie, zonder het woord Collection. */
.originals__collection-text {
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.originals__count {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.originals__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.originals__empty { font-size: 15px; color: var(--color-text-secondary); }
.originals__empty-link {
  border: 0;
  background: none;
  padding: 0;
  font: inherit;
  color: var(--color-primary);
  text-decoration: underline;
  cursor: pointer;
}

@media (max-width: 767px) {
  .originals { padding-block: 24px 48px; }
  .originals__title { font-size: 30px; }
  .originals__grid { grid-template-columns: 1fr; gap: 20px; }
}
</style>
