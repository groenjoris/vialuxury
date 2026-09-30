<template>
  <article class="original-card" :data-collection="collection" @click="onCardClick">
    <div class="original-card__media">
      <NuxtLink
        :to="dealHref"
        :target="linkTarget"
        rel="noopener"
        class="original-card__media-link"
        :aria-label="hotel?.name || title"
        @click.stop
      />
      <img :src="image" :alt="hotel?.name || title" loading="lazy" />

      <span v-if="deal.discountPercentage" class="original-card__discount">-{{ deal.discountPercentage }}%</span>

      <button
        type="button"
        class="original-card__heart"
        :aria-pressed="isFavorite"
        :aria-label="isFavorite ? 'Verwijder uit favorieten' : 'Bewaar als favoriet'"
        @click.stop="toggleFav(favKey)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" /></svg>
      </button>

      <!-- De band in de collectiekleur, met het volgnummer en het collectie-
           icoon. De bovenrand loopt schuin op naar rechts. -->
      <div class="original-card__band">
        <span class="original-card__band-label">Original NO. {{ number }}</span>
        <span class="original-card__band-icon" aria-hidden="true"></span>
      </div>
    </div>

    <div class="original-card__body">
      <h3 class="original-card__name">
        <span>{{ hotel?.name || title }}</span>
        <span v-if="hotel?.starRating" class="original-card__stars" aria-hidden="true">
          <span v-for="n in hotel.starRating" :key="n">★</span>
        </span>
      </h3>

      <p v-if="hotel" class="original-card__place">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>
        <span>{{ hotel.city }}, {{ hotel.region }}</span>
      </p>

      <hr class="original-card__rule" />

      <h4 class="original-card__title">{{ title }}</h4>

      <p class="original-card__package">Arrangement</p>

      <ul v-if="includes.length > 0" class="original-card__incl">
        <li v-for="(line, i) in includes" :key="i">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5 9.5 18 20 6.5" /></svg>
          <span>{{ line }}</span>
        </li>
      </ul>

      <p class="original-card__people">
        {{ PRICED_PERSONS }} {{ PRICED_PERSONS === 1 ? 'persoon' : 'personen' }}, {{ nightsLabel(deal.nights) }}
      </p>

      <div class="original-card__price">
        <div class="original-card__amounts">
          <span class="original-card__from">Vanaf</span>
          <span class="original-card__now">{{ formatPrice(price) }}</span>
          <span v-if="originalPrice > price" class="original-card__was">{{ formatPrice(originalPrice) }}</span>
          <MhtJessePriceInfoTooltip variant="card" />
        </div>
        <NuxtLink
          :to="dealHref"
          :target="linkTarget"
          rel="noopener"
          class="original-card__cta"
          @click.stop
        >Bekijk</NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
/**
 * Multi Hotel Trip - Jesse — ViaLuxury Original-kaart.
 *
 * De kaart uit het aangeleverde ontwerp: foto met kortingsbadge, favorieten-
 * hart en onderin een schuine band in de collectiekleur met het volgnummer
 * ("Original NO. 004") en het collectie-icoon. Daaronder hotelnaam met
 * sterren, plaats, titel, arrangementregel, vinkjes en de prijsregel.
 *
 * De collectiekleur komt via `data-collection` uit mhtj-originals.css; de
 * kaart leest hem als `--c` en hoeft zelf geen kleur te kennen.
 *
 * Alleen in gebruik op /mht-jesse/originals.
 */
import type { SearchHotel, SearchHotelDeal } from '~/types/searchHotel'
import type { CollectionId } from '~/utils-mht-jesse/originals'
import { formatPrice } from '~/utils-mht-jesse/formatPrice'
import { priceForArrival, PRICED_PERSONS } from '~/utils-mht-jesse/priceFormula'
import { nightsLabel } from '~/utils-mht-jesse/plural'
import { pickSmartInclusions } from '~/utils-mht-jesse/smartInclusions'

const props = defineProps<{
  deal: SearchHotelDeal
  hotel?: SearchHotel
  /** Volgnummer in de band, al opgemaakt als "004". */
  number: string
  collection: CollectionId
}>()

const { localized, locale } = useMhtJesseI18n()
const isMobile = useMhtJesseIsMobile()
const { persons, rooms, arrivalDate } = useMhtJesseSearchState()
const { isFavorite: isFav, toggle: toggleFav } = useMhtJesseFavorites()

const title = computed(() => localized(props.deal.title))
const image = computed(() =>
  props.deal.heroImage || props.hotel?.heroImage || props.deal.inclusionImage || '',
)

const favKey = computed(() => props.hotel?.slug || props.deal.slug)
const isFavorite = computed(() => isFav(favKey.value))

/** Vier regels, net als op het aangeleverde ontwerp. */
const includes = computed(() => {
  const all = props.hotel?.deals.map(d => d.inclusions) ?? [props.deal.inclusions]
  const picks = pickSmartInclusions(props.deal.inclusions, all, locale.value as 'nl' | 'en', 4)
  const seen = new Set<string>()
  const out: string[] = []
  for (const p of picks) {
    const text = localized(p).trim()
    if (!text) continue
    const key = text.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(text)
  }
  return out.slice(0, 4)
})

const price = computed(() =>
  priceForArrival(props.deal.basePrice, props.deal.id, arrivalDate.value, PRICED_PERSONS),
)
const originalPrice = computed(() =>
  priceForArrival(props.deal.originalPrice, props.deal.id, arrivalDate.value, PRICED_PERSONS),
)

const linkTarget = computed(() => (isMobile.value ? '_self' : '_blank'))

const dealHref = computed(() => {
  if (props.hotel?.trip?.pdpHref) return props.hotel.trip.pdpHref
  const params = new URLSearchParams()
  if (arrivalDate.value) params.set('checkin', arrivalDate.value)
  if (persons.value !== 2) params.set('persons', String(persons.value))
  if (rooms.value !== 1) params.set('rooms', String(rooms.value))
  const q = params.toString()
  return `/mht-jesse/deal/${props.deal.slug}${q ? '?' + q : ''}`
})

const router = useRouter()
function onCardClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target.closest('a, button, [role="button"]')) return
  if (linkTarget.value === '_blank') window.open(dealHref.value, '_blank', 'noopener')
  else router.push(dealHref.value)
}
</script>

<style scoped>
.original-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow var(--transition-fast);
  color: var(--color-text-primary);
}
.original-card:hover { box-shadow: var(--shadow-hover); }

/* ── beeldvlak ── */
.original-card__media {
  position: relative;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  background: var(--color-background-secondary);
}
.original-card__media-link { position: absolute; inset: 0; z-index: 1; }
.original-card__media img {
  width: 100%;
  height: 100%;
  max-width: 100%;
  object-fit: cover;
  display: block;
}

/* Dezelfde schuine badge als de rest van het prototype. */
.original-card__discount {
  position: absolute;
  top: var(--space-md);
  left: 0;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 78px;
  height: 46px;
  padding: 0 16px 2px 14px;
  background: var(--color-dark);
  color: #fff;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 17px;
  line-height: 1;
  letter-spacing: 0.3px;
  clip-path: polygon(0% 14%, 100% 0%, 88% 100%, 0% 88%);
}

.original-card__heart {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  z-index: 3;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 0;
  background: none;
  padding: 0;
  cursor: pointer;
  color: #fff;
}
.original-card__heart svg {
  width: 30px;
  height: 30px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.35));
}
.original-card__heart[aria-pressed="true"] svg { fill: currentColor; }

/* ── de band met het volgnummer ──
   `--c` komt van data-collection, `--on` is de tekstkleur die daarop
   leesbaar is (donker bij Heritage, wit bij de rest). */
.original-card__band {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  height: 64px;
  padding: 10px 20px 0;
  background: var(--c, var(--color-dark));
  color: var(--on, #fff);
  clip-path: polygon(0% 34%, 100% 0%, 100% 100%, 0% 100%);
}
.original-card__band-label {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 400;
  line-height: 1;
}
.original-card__band-icon {
  width: 26px;
  height: 26px;
  flex: none;
  background: currentColor;
  -webkit-mask: url(/icons/mhtj-originals/champagne-glass.svg) center/contain no-repeat;
  mask: url(/icons/mhtj-originals/champagne-glass.svg) center/contain no-repeat;
}

/* ── tekstblok ── */
.original-card__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 18px 20px 20px;
}
.original-card__name {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 19px;
  line-height: 1.25;
}
.original-card__stars {
  font-size: 15px;
  letter-spacing: 1px;
  color: var(--color-text-primary);
}
.original-card__place {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 1.4;
  color: var(--color-text-secondary);
}
.original-card__place svg { width: 15px; height: 15px; flex: none; }
.original-card__rule {
  height: 1px;
  border: 0;
  background: var(--color-border-light);
  margin: 14px 0;
}
.original-card__title {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 19px;
  line-height: 1.3;
}
.original-card__package {
  margin: 20px 0 0;
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 15px;
  color: var(--color-primary);
}
.original-card__incl {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.original-card__incl li {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  font-size: 15px;
  line-height: 1.4;
}
.original-card__incl svg {
  width: 16px;
  height: 16px;
  margin-top: 3px;
  flex: none;
  color: var(--color-discount);
}
.original-card__people {
  margin: 18px 0 0;
  font-weight: 700;
  font-size: 15px;
}

.original-card__price {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 8px;
}
.original-card__amounts { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
.original-card__from {
  font-family: var(--font-heading);
  font-style: italic;
  font-size: 15px;
  color: var(--color-text-secondary);
}
.original-card__now {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 26px;
  line-height: 1;
}
.original-card__was {
  font-size: 15px;
  color: var(--color-error);
  text-decoration: line-through;
}
.original-card__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 13px 26px;
  border-radius: var(--radius-lg);
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  text-decoration: none;
  white-space: nowrap;
  transition: background var(--transition-fast);
}
.original-card__cta:hover { background: var(--color-primary-hover); }
</style>
