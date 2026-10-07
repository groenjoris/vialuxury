<template>
  <article class="photo-card" :data-collection="collection" @click="onCardClick">
    <div class="photo-card__media">
      <NuxtLink
        :to="dealHref"
        :target="linkTarget"
        rel="noopener"
        class="photo-card__link"
        :aria-label="hotel?.name || title"
        @click.stop
      />

      <img class="photo-card__img" :src="image" :alt="hotel?.name || title" loading="lazy" />

      <!-- De vlag linksboven: volgnummer, collectie-icoon en collectienaam.
           De rechterkant loopt schuin naar binnen. -->
      <div class="photo-card__band">
        <span class="photo-card__no">Original NO. {{ number }}</span>
        <span class="photo-card__collection">
          <span class="photo-card__collection-icon" aria-hidden="true"></span>
          <span class="photo-card__collection-text">
            <span class="photo-card__collection-name">{{ collectionLabel }}</span>
            <span class="photo-card__collection-word">Collection</span>
          </span>
        </span>
      </div>

      <button
        type="button"
        class="photo-card__heart"
        :aria-pressed="isFavorite"
        :aria-label="isFavorite ? 'Verwijder uit favorieten' : 'Bewaar als favoriet'"
        @click.stop="toggleFav(favKey)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" /></svg>
      </button>
    </div>

    <div class="photo-card__text">
      <h3 class="photo-card__title">{{ title }}</h3>
      <p v-if="hotel?.name" class="photo-card__hotel">{{ hotel.name }}</p>

      <ul class="photo-card__facts">
        <li v-for="(f, i) in facts" :key="i">
          <span class="photo-card__fact-icon" :style="{ '--i': f.icon }" aria-hidden="true"></span>
          <span>{{ f.label }}</span>
        </li>
      </ul>

      <div class="photo-card__price">
        <span v-if="deal.discountPercentage" class="photo-card__discount">-{{ deal.discountPercentage }}%</span>
        <span class="photo-card__amounts">
          <span class="photo-card__from">Vanaf</span>
          <span class="photo-card__now">{{ formatPrice(price) }}</span>
          <span v-if="originalPrice > price" class="photo-card__was">{{ formatPrice(originalPrice) }}</span>
        </span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
/**
 * Multi Hotel Trip - Jesse — Original-kaart, versie "foto".
 *
 * De foto in zijn eigen verhouding, met daaronder een wit tekstblok; niets
 * van de tekst ligt over het beeld. Alleen de vlag in de collectiekleur
 * (linksboven, met volgnummer en collectienaam) en het favorietenhart
 * (rechtsboven) staan op de foto.
 *
 * Twee dingen wijken bewust af van het aangeleverde ontwerp, omdat de
 * dealdata anders is dan de voorbeelden daarin:
 *  - Het ontwerp heeft twee even grote titelregels (arrangement + hotel).
 *    Onze arrangementtitels zijn veel langer, dus de hotelnaam staat er
 *    kleiner onder in plaats van ernaast.
 *  - De kenmerken onderin komen uit de inclusies van de deal; het ontwerp
 *    had geredigeerde regels. Past er niet alles op één rij, dan loopt de
 *    rij door op een tweede.
 *
 * De collectiekleur komt via `data-collection` uit mhtj-originals.css.
 *
 * Alleen in gebruik op /mht-jesse/originals.
 */
import type { SearchHotel, SearchHotelDeal } from '~/types/searchHotel'
import { COLLECTIONS, type CollectionId } from '~/utils-mht-jesse/originals'
import { formatPrice } from '~/utils-mht-jesse/formatPrice'
import { priceForArrival, PRICED_PERSONS } from '~/utils-mht-jesse/priceFormula'
import { nightsLabel } from '~/utils-mht-jesse/plural'
import { pickSmartInclusions } from '~/utils-mht-jesse/smartInclusions'
import { matchIcon } from '~/utils-mht-jesse/iconMatcher'

const props = defineProps<{
  deal: SearchHotelDeal
  hotel?: SearchHotel
  /** Volgnummer in de vlag, al opgemaakt als "004". */
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
const collectionLabel = computed(
  () => COLLECTIONS.find(c => c.id === props.collection)?.label ?? '',
)

const favKey = computed(() => props.hotel?.slug || props.deal.slug)
const isFavorite = computed(() => isFav(favKey.value))

/** Een bed voor het aantal nachten, en een vinkje voor een inclusie die
 *  de iconenlijst niet herkent. Als data-URI zodat ze net als de andere
 *  iconen via een masker de tekstkleur aannemen. */
const BED = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 19v-6h18v6'/%3E%3Cpath d='M3 13V6'/%3E%3Cpath d='M21 19v-6'/%3E%3Cpath d='M7 13v-2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2'/%3E%3C/svg%3E"
const CHECK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 12.5 9.5 18 20 6.5'/%3E%3C/svg%3E"

/** Het aantal nachten plus de twee sterkste inclusies, zoals de drie
 *  kenmerken onderin het ontwerp. */
const facts = computed(() => {
  const all = props.hotel?.deals.map(d => d.inclusions) ?? [props.deal.inclusions]
  const picks = pickSmartInclusions(props.deal.inclusions, all, locale.value as 'nl' | 'en', 4)
  const css = (url: string) => `url("${url}")`
  const out = [{ icon: css(BED), label: nightsLabel(props.deal.nights) }]
  const seen = new Set<string>()
  for (const p of picks) {
    if (out.length >= 3) break
    const text = localized(p).trim()
    if (!text) continue
    const key = text.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ icon: css(matchIcon(text).iconUrl ?? CHECK), label: text })
  }
  return out
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
.photo-card {
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
.photo-card:hover { box-shadow: var(--shadow-hover); }

/* ── beeldvlak ──
   De foto staat in zijn eigen verhouding en wordt niet opgerekt naar de
   hoogte van de kaart; daar werd hij onscherp van. */
.photo-card__media {
  position: relative;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  background: var(--color-background-secondary);
}
.photo-card__link { position: absolute; inset: 0; z-index: 1; }
.photo-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ── de vlag linksboven ──
   `--c` en `--on` komen via data-collection uit mhtj-originals.css. De
   schuine rechterkant is een clip-path: de onderrand is smaller dan de
   bovenrand, in dezelfde verhouding als het ontwerp (37% om 56% van de
   kaartbreedte). */
.photo-card__band {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  width: 62%;
  min-height: 78px;
  box-sizing: border-box;
  padding: 11px 0 12px 18px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 9px;
  background: var(--c, var(--color-dark));
  color: var(--on, #fff);
  clip-path: polygon(0 0, 100% 0, 68% 100%, 0 100%);
}
.photo-card__no {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}
.photo-card__collection { display: flex; align-items: center; gap: 10px; }
.photo-card__collection-icon {
  width: 23px;
  height: 23px;
  flex: none;
  background: currentColor;
  /* `--icon` komt via data-collection uit mhtj-originals.css. */
  -webkit-mask: var(--icon) center/contain no-repeat;
  mask: var(--icon) center/contain no-repeat;
}
.photo-card__collection-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 11px;
  line-height: 1.1;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}
.photo-card__collection-name { font-weight: 700; }
.photo-card__collection-word { font-weight: 400; opacity: 0.82; }

.photo-card__heart {
  position: absolute;
  top: 12px;
  right: 12px;
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
.photo-card__heart svg {
  width: 28px;
  height: 28px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.45));
}
.photo-card__heart[aria-pressed="true"] svg { fill: currentColor; }

/* ── tekstblok, op wit onder de foto ── */
.photo-card__text {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 18px 20px 20px;
}
.photo-card__title {
  margin: 0;
  color: var(--color-text-primary);
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 22px;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.photo-card__hotel {
  margin: 5px 0 0;
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 16px;
  line-height: 1.25;
  color: var(--color-text-secondary);
}
.photo-card__facts {
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}
.photo-card__facts li {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  font-size: 13px;
  line-height: 1.25;
  color: var(--color-text-secondary);
}
.photo-card__fact-icon {
  width: 16px;
  height: 16px;
  flex: none;
  background: currentColor;
  -webkit-mask: var(--i) center/contain no-repeat;
  mask: var(--i) center/contain no-repeat;
}

/* ── prijsregel, met de kortingsbanner ernaast ──
   De banner is weer zwart: wit op het witte tekstblok zou verdwijnen. De
   witte versie hoorde bij het donkere verloop, dat er niet meer is. */
.photo-card__price {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  padding-top: 16px;
}
.photo-card__discount {
  flex: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 145 104'%3E%3Cpath d='M123.24 100.853L144.909 4.88359C145.524 2.16058 143.231 -0.33886 140.466 0.0394912L3.4576 18.7817C1.47641 19.0527 -0.000259399 20.7451 -0.000259399 22.7448V90.5564C-0.000259399 92.6393 1.59824 94.3736 3.67427 94.5431L119.013 103.959C120.999 104.121 122.801 102.797 123.24 100.853Z' fill='%23141414'/%3E%3C/svg%3E");
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 60px;
  height: 43px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 700;
  padding: 0 13px 0 6px;
  letter-spacing: 0.5px;
}
.photo-card__amounts {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}
.photo-card__from {
  font-family: var(--font-heading);
  font-style: italic;
  font-size: 14px;
  color: var(--color-text-secondary);
}
.photo-card__now {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 30px;
  line-height: 1;
}
.photo-card__was {
  font-size: 15px;
  color: var(--color-error);
  text-decoration: line-through;
}

@media (max-width: 767px) {
  .photo-card__band { width: 56%; }
}
</style>
