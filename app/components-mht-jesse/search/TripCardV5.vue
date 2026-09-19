<template>
  <article class="trip-card" :class="{ 'trip-card--list': listMode }" @click="onCardClick">
    <!-- Foto, verhouding 3:2, met rechts een strook van drie kleine foto's. -->
    <div class="trip-card__media">
      <NuxtLink
        :to="dealHref"
        :target="linkTarget"
        rel="noopener"
        class="trip-card__media-link"
        :aria-label="title"
        @click.stop
      />
      <img class="trip-card__photo" :src="mainPhoto" :alt="title" loading="lazy" />
      <div v-if="stripPhotos.length > 0" class="trip-card__strip" aria-hidden="true">
        <img v-for="(src, i) in stripPhotos" :key="i" :src="src" alt="" loading="lazy" />
      </div>
      <button
        type="button"
        class="trip-card__favorite"
        :class="{ 'trip-card__favorite--active': isFavorite }"
        :aria-label="isFavorite ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'"
        :aria-pressed="isFavorite"
        @click.stop="toggleFav(favKey)"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </div>

    <div class="trip-card__body">
      <!-- Titel: de omschrijving van het arrangement, maximaal twee regels. -->
      <h3 class="trip-card__title">{{ title }}</h3>

      <!-- Routelijn: de reisopbouw. De stippen, de stippellijn en het icoon
           liggen allemaal op --axis, gerekend vanaf de bovenkant van de regel.
           Plaatsnaam erboven, aantal nachten eronder, allebei even hoog, zodat
           de lijn verticaal in het midden ligt. -->
      <div class="trip-card__route" aria-label="Reisopbouw">
        <ol class="trip-card__route-line">
          <template v-for="(item, i) in routeItems" :key="i">
            <li v-if="item.kind === 'stop'" class="trip-card__stop">
              <b>{{ item.city }}</b>
              <i></i>
              <span v-if="item.nights">{{ nightsLabel(item.nights) }}</span>
            </li>
            <!-- Etappe tussen twee plaatsen. -->
            <li v-else-if="item.kind === 'leg'" class="trip-card__leg">
              <span class="trip-card__leg-icon" v-html="routeIcon"></span>
            </li>
            <!-- Heen en terug: elke avond terug in hetzelfde hotel. -->
            <li v-else class="trip-card__ob">
              <span class="trip-card__ob-arrows">
                <svg viewBox="0 0 8 12" aria-hidden="true"><path d="M6 1L2 6l4 5" /></svg>
                <svg viewBox="0 0 8 12" aria-hidden="true"><path d="M2 1l4 5-4 5" /></svg>
              </span>
              <span class="trip-card__leg-icon" v-html="routeIcon"></span>
            </li>
          </template>
        </ol>
      </div>

      <!-- Arrangementregel: het woord Arrangement in oranje, gevolgd door
           "N nachten voor 2 personen inclusief:". -->
      <p class="trip-card__package">
        <span class="trip-card__package-label">Arrangement</span>
        <span class="trip-card__package-meta">
          {{ nightsLabel(deal.nights) }} voor {{ PRICED_PERSONS }}
          {{ PRICED_PERSONS === 1 ? 'persoon' : 'personen' }} inclusief:
        </span>
      </p>

      <!-- Inclusief: vier punten met vinkjes, in twee kolommen zolang de
           breedte van de kaart dat toelaat (container query). -->
      <ul v-if="includes.length > 0" class="trip-card__includes">
        <li v-for="(line, i) in includes" :key="i">
          <svg class="trip-card__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{{ line }}</span>
        </li>
      </ul>

      <!-- Prijsregel: kortingsbadge, Vanaf, doorgestreepte oude prijs,
           nieuwe prijs, en de oranje knop Bekijk. -->
      <div class="trip-card__price-row">
        <span v-if="deal.discountPercentage" class="trip-card__discount">-{{ deal.discountPercentage }}%</span>
        <span class="trip-card__price-prefix">Vanaf</span>
        <span v-if="originalPrice > price" class="trip-card__original">{{ formatPrice(originalPrice) }}</span>
        <span class="trip-card__price">{{ formatPrice(price) }}</span>
        <NuxtLink
          :to="dealHref"
          :target="linkTarget"
          rel="noopener"
          class="trip-card__cta"
          @click.stop
        >
          <span class="trip-card__cta-label">Bekijk</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
/**
 * Multi Hotel Trip - Jesse — vakantiekaart versie 5.
 *
 * De kaartopbouw uit het losgetrokken v5-prototype (foto met fotostrook,
 * titel, routelijn, arrangementregel, inclusief-vinkjes, prijsregel), maar
 * opgebouwd met de tokens van de redesign in plaats van de oude sitestijl:
 * `--font-heading` / `--font-body`, `--color-*`, `--radius-*`, `--space-*`.
 *
 * Alleen in gebruik op de resultatenlijst van /mht-jesse/vakanties; alle
 * andere plekken (home, hotelpagina, sidepanel) houden MhtJesseDealCard.
 */
import type { SearchHotel, SearchHotelDeal } from '~/types/searchHotel'
import { formatPrice } from '~/utils-mht-jesse/formatPrice'
import { priceForArrival, PRICED_PERSONS } from '~/utils-mht-jesse/priceFormula'
import { nightsLabel } from '~/utils-mht-jesse/plural'

const props = defineProps<{
  deal: SearchHotelDeal
  hotel?: SearchHotel
  /** Lijstweergave: foto links, tekst rechts. De kaart is zelf de container
   *  voor zijn eigen container queries en kan die dus niet op zichzelf
   *  toepassen — vandaar een prop in plaats van een `@container`-regel. */
  listMode?: boolean
}>()

const { localized } = useMhtJesseI18n()
const isMobile = useMhtJesseIsMobile()
const { persons, rooms, arrivalDate } = useMhtJesseSearchState()
const { isFavorite: isFav, toggle: toggleFav } = useMhtJesseFavorites()

const title = computed(() => localized(props.deal.title))
const trip = computed(() => props.hotel?.trip ?? null)
const stops = computed(() => trip.value?.stops ?? [])

const favKey = computed(() => props.hotel?.slug || props.deal.slug)
const isFavorite = computed(() => isFav(favKey.value))

/** Foto's: de hotelfoto's van de stops voorop, daarna de galerij van het
 *  record. De eerste is de grote foto, de volgende drie de strook. */
const photos = computed<string[]>(() => {
  const out: string[] = []
  const push = (src?: string) => {
    if (src && !out.includes(src)) out.push(src)
  }
  for (const s of stops.value) push(s.image)
  push(props.deal.heroImage)
  for (const g of props.hotel?.galleryImages ?? []) push(g)
  push(props.hotel?.heroImage)
  push(props.deal.inclusionImage)
  return out
})
const mainPhoto = computed(() => photos.value[0] ?? '')
const stripPhotos = computed(() => photos.value.slice(1, 4))

/** De routelijn: bij één hotel een stip met een heen-en-terug-etappe,
 *  bij meerdere hotels een stip per plaats met een etappe ertussen. */
type RouteItem =
  | { kind: 'stop'; city: string; nights?: number }
  | { kind: 'leg' }
  | { kind: 'ob' }

const routeItems = computed<RouteItem[]>(() => {
  const list = stops.value
  if (list.length === 0) return []
  if (list.length === 1) {
    return [{ kind: 'stop', city: list[0]!.city, nights: list[0]!.nights }, { kind: 'ob' }]
  }
  const out: RouteItem[] = []
  list.forEach((s, i) => {
    if (i > 0) out.push({ kind: 'leg' })
    out.push({ kind: 'stop', city: s.city, nights: s.nights })
  })
  return out
})

/** Fiets of auto, hetzelfde icoon als de snelfilters gebruiken. */
const BIKE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>'
const CAR = '<span class="trip-card__car" aria-hidden="true"></span>'
const routeIcon = computed(() => (trip.value?.type === 'fiets' ? BIKE : CAR))

/** Een vakantie toont precies zijn vier highlights. */
const includes = computed(() =>
  props.deal.highlights.slice(0, 4).map(h => localized(h).trim()).filter(Boolean),
)

const price = computed(() =>
  priceForArrival(props.deal.basePrice, props.deal.id, arrivalDate.value, PRICED_PERSONS),
)
const originalPrice = computed(() =>
  priceForArrival(props.deal.originalPrice, props.deal.id, arrivalDate.value, PRICED_PERSONS),
)

const linkTarget = computed(() => (isMobile.value ? '_self' : '_blank'))

const dealHref = computed(() => {
  if (trip.value?.pdpHref) return trip.value.pdpHref
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
  if (linkTarget.value === '_blank') {
    window.open(dealHref.value, '_blank', 'noopener')
  } else {
    router.push(dealHref.value)
  }
}
</script>

<style scoped>
/* De kaart is zijn eigen container: de inclusief-lijst en de knop reageren
   op de kolombreedte van de kaart, niet op die van het scherm. */
.trip-card {
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: box-shadow var(--transition-fast);
}
.trip-card:hover {
  box-shadow: var(--shadow-hover);
}

/* Lijstweergave: dezelfde blokken in dezelfde volgorde, maar naast elkaar.
   Zonder dit rekt de kaart in één kolom uit tot een paginabrede foto. */
.trip-card--list {
  flex-direction: row;
}
.trip-card--list .trip-card__media {
  width: 44%;
  max-width: 460px;
  flex: none;
  align-self: stretch;
  aspect-ratio: auto;
}
.trip-card--list .trip-card__body {
  flex: 1;
  min-width: 0;
}

/* ---- foto met fotostrook ---- */
.trip-card__media {
  position: relative;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2px;
  aspect-ratio: 3 / 2;
  background: var(--color-background-secondary);
  overflow: hidden;
}
.trip-card__media-link {
  position: absolute;
  inset: 0;
  z-index: 1;
}
.trip-card__photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
/* De strook verdeelt zich over het aantal foto's dat er daadwerkelijk is:
   drie hotels geeft drie stroken, twee geeft er twee. Met een vaste
   `repeat(3, 1fr)` bleef er anders een wit vlak over onder de laatste foto. */
.trip-card__strip {
  display: grid;
  grid-auto-rows: 1fr;
  gap: 2px;
  min-height: 0;
}
.trip-card__strip img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  min-height: 0;
}

.trip-card__favorite {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  z-index: 2;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: var(--color-dark);
  cursor: pointer;
  transition: background var(--transition-fast);
}
.trip-card__favorite:hover {
  background: #fff;
}
.trip-card__favorite--active {
  color: var(--color-error);
}
.trip-card__favorite--active svg {
  fill: currentColor;
}

/* ---- tekstdeel: 16px tussen de blokken ---- */
.trip-card__body {
  --ruimte: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--ruimte);
  flex: 1;
  padding: var(--ruimte) 20px;
  min-width: 0;
}

.trip-card__title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
  color: var(--color-text-primary);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

/* ---- routelijn ----
   --axis is de hoogte waarop de stippen, de stippellijn en het icoon liggen:
   regelhoogte plaatsnaam (14) + marge (6) + halve stip (5) = 25. */
.trip-card__route {
  --axis: 25px;
  margin: 0 -20px;
  padding: 0 20px var(--ruimte);
  border-bottom: 1px solid var(--color-border);
}
.trip-card__route-line {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: stretch;
  justify-content: center;
}
.trip-card__stop {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  flex: 0 0 auto;
  max-width: 36%;
  min-width: 0;
}
.trip-card__stop b {
  font-size: 12.5px;
  font-weight: 700;
  line-height: 14px;
  margin-bottom: 6px;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 2px;
  color: var(--color-text-primary);
}
.trip-card__stop i {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-dark);
  border: 2px solid var(--color-surface);
  box-shadow: 0 0 0 1.5px var(--color-dark);
}
.trip-card__stop span {
  font-size: 11px;
  line-height: 13px;
  margin-top: 6px;
  color: var(--color-text-secondary);
}

/* Etappe tussen twee plaatsen: stippellijn met het icoon in het midden. */
.trip-card__leg,
.trip-card__ob {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.trip-card__leg {
  flex: 1 1 0;
  min-width: 40px;
}
.trip-card__ob {
  flex: 0 0 132px;
  min-width: 132px;
}
.trip-card__leg::before,
.trip-card__ob::before {
  content: "";
  position: absolute;
  top: calc(var(--axis) - 1px);
  border-top: 2px dashed var(--color-text-muted);
}
.trip-card__leg::before {
  left: -6px;
  right: -6px;
}
.trip-card__ob::before {
  left: 9px;
  right: 9px;
}
.trip-card__leg-icon {
  position: absolute;
  top: var(--axis);
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--color-surface);
  padding: 0 5px;
  color: var(--color-dark);
  display: flex;
}
.trip-card__leg-icon :deep(svg) {
  width: 22px;
  height: 22px;
  display: block;
}
/* Het aangeleverde auto-icoon is een PNG; als masker meegekleurd met de lijn. */
.trip-card__leg-icon :deep(.trip-card__car) {
  display: block;
  width: 22px;
  height: 22px;
  background: currentColor;
  -webkit-mask: url(/images/icons/car.png) center/contain no-repeat;
  mask: url(/images/icons/car.png) center/contain no-repeat;
}
.trip-card__ob-arrows {
  position: absolute;
  top: calc(var(--axis) - 6px);
  left: 2px;
  right: 2px;
  height: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--color-text-muted);
  pointer-events: none;
}
.trip-card__ob-arrows svg {
  width: 7px;
  height: 11px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ---- arrangementregel ---- */
.trip-card__package {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: var(--color-text-secondary);
}
.trip-card__package-label {
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 600;
  color: var(--color-primary);
  margin-right: 4px;
}

/* ---- inclusief ---- */
.trip-card__includes {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px 16px;
}
/* Twee kolommen zodra de kaart breed genoeg is — op de kolombreedte van de
   kaart zelf, dus ook goed in een smalle resultatenkolom. */
@container (min-width: 340px) {
  .trip-card__includes {
    grid-template-columns: 1fr 1fr;
  }
}
.trip-card__includes li {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 13px;
  line-height: 1.4;
  color: var(--color-text-primary);
  min-width: 0;
}
.trip-card__check {
  flex: none;
  margin-top: 2px;
  color: var(--color-discount);
}

/* ---- prijsregel ---- */
.trip-card__price-row {
  margin-top: auto;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}
/* Dezelfde schuine badge als de rest van de redesign. */
.trip-card__discount {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 145 104'%3E%3Cpath d='M123.24 100.853L144.909 4.88359C145.524 2.16058 143.231 -0.33886 140.466 0.0394912L3.4576 18.7817C1.47641 19.0527 -0.000259399 20.7451 -0.000259399 22.7448V90.5564C-0.000259399 92.6393 1.59824 94.3736 3.67427 94.5431L119.013 103.959C120.999 104.121 122.801 102.797 123.24 100.853Z' fill='%23141414'/%3E%3C/svg%3E");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  padding: 7px 14px 7px 10px;
  margin-right: 2px;
}
.trip-card__price-prefix {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.trip-card__original {
  font-size: 13px;
  color: var(--color-text-muted);
  text-decoration: line-through;
}
.trip-card__price {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1;
}
.trip-card__cta {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 44px;
  padding: 10px 18px;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: #fff;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: background var(--transition-fast);
}
.trip-card__cta:hover {
  background: var(--color-primary-hover);
}
/* Smalle kaart: alleen de pijl, net als op de bestaande site. */
@container (max-width: 339px) {
  .trip-card__cta-label {
    display: none;
  }
}
</style>
