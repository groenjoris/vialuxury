<template>
  <div class="mhtj-originals" data-variant="vol">
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
            <span class="originals__collection-text">
              <b>{{ c.label }}</b>
              <i>Collection</i>
            </span>
          </button>
        </div>

        <!-- Alle bestaande sitethema's. -->
        <div class="originals__themes" role="group" aria-label="Thema's">
          <button
            v-for="t in themeTags"
            :key="t.id"
            type="button"
            class="originals__theme"
            :class="{ 'originals__theme--on': activeThemes.includes(t.id) }"
            :aria-pressed="activeThemes.includes(t.id)"
            @click="toggleTheme(t.id)"
          >
            <span class="originals__theme-icon" v-html="iconFor(t.id)" />
            {{ t.label }}
          </button>
          <button
            v-if="activeThemes.length > 0 || activeCollection"
            type="button"
            class="originals__reset"
            @click="resetFilters"
          >Wis filters</button>
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
 * de kleur van de band. Daarnaast staan alle negentien bestaande sitethema's
 * als filterrij, zodat beide indelingen naast elkaar te zien zijn.
 *
 * `data-variant="vol"` op de wrapper kiest labelversie 1 (vlak in de
 * collectiekleur). Zet hem op "licht" voor versie 2 uit de nota.
 */
import { mappedHotels } from '~/data/deals-mapper'
import { tripSearchHotels } from '~/data/mhtj-trips'
import type { SearchHotel, SearchHotelDeal } from '~/types/searchHotel'
import { pickPrimaryDeal } from '~/utils-mht-jesse/primaryDeal'
import { FILTER_TAGS } from '~/utils-mht-jesse/filterTags'
import { POPULAR_FILTER_ICONS } from '~/utils-mht-jesse/popularFilterIcons'
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

const themeTags = FILTER_TAGS

const activeCollection = ref<CollectionId | null>(null)
const activeThemes = ref<string[]>([])

function toggleCollection(id: CollectionId) {
  activeCollection.value = activeCollection.value === id ? null : id
}
function toggleTheme(id: string) {
  const i = activeThemes.value.indexOf(id)
  if (i === -1) activeThemes.value.push(id)
  else activeThemes.value.splice(i, 1)
}
function resetFilters() {
  activeCollection.value = null
  activeThemes.value = []
}

/** Filters stapelen: eerst de collectie, daarna elk aangezet thema. */
const shown = computed(() => {
  let rows = allRows
  if (activeCollection.value) {
    rows = rows.filter(r => r.collection === activeCollection.value)
  }
  for (const id of activeThemes.value) {
    const tag = FILTER_TAGS.find(t => t.id === id)
    if (!tag) continue
    rows = rows.filter(r => tag.matches(r.deal, r.hotel))
  }
  return rows
})

function iconFor(id: string): string {
  return POPULAR_FILTER_ICONS[id] || POPULAR_FILTER_ICONS.star || ''
}
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
/* Twee regels, zoals op de aangeleverde collectiebanners. */
.originals__collection-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.1;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.originals__collection-text b { font-weight: 700; font-size: 13px; }
.originals__collection-text i { font-style: normal; font-weight: 400; font-size: 11px; }

.originals__themes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 22px;
}
.originals__theme {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 15px;
  background: var(--color-surface);
  border: 1px solid #e5e2da;
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 14px;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}
.originals__theme:hover { background: var(--color-border); }
.originals__theme--on {
  background: var(--color-dark);
  border-color: var(--color-dark);
  color: #fff;
}
.originals__theme-icon { display: inline-flex; width: 14px; height: 14px; flex: none; }
.originals__theme-icon :deep(svg) { width: 100%; height: 100%; }

.originals__reset {
  height: 40px;
  padding: 0 12px;
  border: 0;
  background: none;
  color: var(--color-text-link);
  font-family: inherit;
  font-size: 14px;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
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
