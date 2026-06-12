<template>
  <article
    class="deal-card-v2"
    :class="{
      'deal-card-v2--grid': gridMode,
      'deal-card-v2--has-bar': hasBar,
      'deal-card-v2--wide': wide,
      'deal-card-v2--unavailable-on-date': dateMismatch || nightsMismatch,
    }"
    @click="onCardClick"
  >
    <!-- Image area (top in grid, left in list). Grid mode renders a small
         carousel (up to 5 hotel photos) with prev/next arrows that fade
         in on hover. List mode keeps the single static image. -->
    <div class="deal-card-v2__image">
      <!-- Anti rage-click: the whole photo opens the deal page. Sits ABOVE the
           image (z-index 1) but BELOW the carousel arrows (z-index 2) and the
           favourite heart (z-index 3) so those still work. -->
      <NuxtLink
        :to="dealHref"
        :target="linkTarget"
        rel="noopener"
        class="deal-card-v2__image-link"
        :aria-label="hotel?.name || localized(deal.title)"
        @click.stop
      />
      <img :src="displayedImage" :alt="hotel?.name || localized(deal.title)" loading="lazy" />
      <!-- Sidepanel cards (deal-page and map) lock to a single
           deterministic photo and suppress the carousel arrows. -->
      <template v-if="gridMode && carouselImages.length > 1 && !panelMode">
        <button
          type="button"
          class="deal-card-v2__carousel-nav deal-card-v2__carousel-nav--prev"
          aria-label="Vorige foto"
          @click.stop.prevent="prevImage"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button
          type="button"
          class="deal-card-v2__carousel-nav deal-card-v2__carousel-nav--next"
          aria-label="Volgende foto"
          @click.stop.prevent="nextImage"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </template>
      <!-- Deal-page sidepanel: drop the discount % chip to free up
           room for the overlay stickers below. Every other context
           still shows the chip. -->
      <span
        v-if="deal.discountPercentage && !panelMode"
        class="deal-card-v2__discount-badge"
      >
        -{{ deal.discountPercentage }}%
      </span>
      <!-- Sidepanel overlay: photo gets the nights label + up to 3
           amenity stickers (entreekaarten / diner / bubbelbad /
           fiets / wellness / zwembad — priority order, lowercase).
           Recoleta on transparent-black tile, smaller than the
           search-card action-sticker chips. Renders on BOTH the
           deal-page sidepanel AND the map-page sidepanel (same
           rules — discount badge is hidden in both contexts to
           keep room for the stickers). -->
      <div
        v-if="panelMode"
        class="deal-card-v2__panel-stickers"
      >
        <span class="deal-card-v2__panel-sticker">{{ nightsStickerLabel }}</span>
        <span
          v-for="s in panelAmenityStickers"
          :key="s"
          class="deal-card-v2__panel-sticker"
        >{{ s }}</span>
      </div>
      <div v-if="hotel?.labels && hotel.labels.length && !hideLabels" class="deal-card-v2__labels">
        <SecondReleaseDealLabel
          v-for="label in hotel.labels"
          :key="label"
          :key-name="label"
          class="deal-card-v2__label"
        />
      </div>
      <button
        type="button"
        class="deal-card-v2__favorite"
        :class="{ 'deal-card-v2__favorite--active': isFavorite }"
        :aria-label="isFavorite ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'"
        :aria-pressed="isFavorite"
        @click.stop="toggleFav(favKey)"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
      <!-- GRID ONLY: scarcity sticker in the photo's lower-RIGHT corner
           (lower-left is reserved for the special-deal labels).
           (List view shows it below the checkmarks instead — see below.) -->
      <span
        v-if="gridMode && roomsLeft < 4 && !isMismatch && !unavailable"
        class="deal-card-v2__rooms-sticker deal-card-v2__rooms-sticker--photo"
      >Nog {{ roomsLeft }} beschikbaar</span>
    </div>

    <!-- Content (single column in grid, two columns in list) -->
    <!-- Content: column flex with top hotel-row + full-width divider + body-row -->
    <div class="deal-card-v2__content">
      <!-- TOP ROW — full content width: hotel name + stars on line 1,
           location on line 2 -->
      <div v-if="showHotelInfo && hotel" class="deal-card-v2__hotel-info">
        <NuxtLink :to="`/second-release/hotel/${hotel.slug}`" :target="linkTarget" class="deal-card-v2__name-link" @click.stop>
          <h3 class="deal-card-v2__name-row">
            <span class="deal-card-v2__name">{{ hotel.name }}</span>
            <span class="deal-card-v2__stars" aria-hidden="true">
              <span v-for="n in hotel.starRating" :key="n">★</span>
            </span>
          </h3>
        </NuxtLink>
        <div ref="metaEl" class="deal-card-v2__meta">
          <svg class="deal-card-v2__loc-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span class="deal-card-v2__location">
            <span>{{ hotel.city }}</span>
            <span v-if="!hideRegion" class="deal-card-v2__location-region">, {{ hotel.region }}</span>
          </span>
        </div>
      </div>

      <!-- Full-width divider (spans both cols in list view) -->
      <hr v-if="showHotelInfo && hotel" class="deal-card-v2__divider" />

      <!-- Deal pitch (full content width — spans both cols in list).
           v6 panel mode swaps the localised title for the compact
           "[Twee nachten] [type]arrangement" format (item 13). -->
      <h2 class="deal-card-v2__pitch">{{ panelTitle }}</h2>

      <!-- BODY ROW — column in grid; main-col + right-col in list -->
      <div class="deal-card-v2__body-row">
        <div class="deal-card-v2__main-col">
          <div class="deal-card-v2__includes" :class="{ 'deal-card-v2__includes--full': fullInclusions && fullInclusions.length }">
            <div class="deal-card-v2__includes-list">
              <span v-for="item in includesBullets" :key="item" class="deal-card-v2__include">
                <span class="deal-card-v2__check">✓</span>
                <span class="deal-card-v2__include-text">{{ item }}</span>
              </span>
            </div>
            <!-- LIST ONLY: scarcity sticker below the checkmarks, left-aligned
                 with them. (Grid view shows it on the photo instead — above.) -->
            <span v-if="!gridMode && roomsLeft < 4 && !isMismatch && !unavailable" class="deal-card-v2__rooms-sticker">Nog {{ roomsLeft }} beschikbaar</span>
          </div>

          <!-- GRID ONLY: meta + price-row inline below includes -->
          <div v-if="gridMode" class="deal-card-v2__grid-bottom">
            <template v-if="unavailable">
              <p class="deal-card-v2__unavailable">Niet beschikbaar voor jouw zoekopdracht</p>
            </template>
            <template v-else>
              <p
                v-if="dateMismatch && !(mismatchMessages && mismatchMessages.length)"
                class="deal-card-v2__date-line deal-card-v2__date-line--unavailable"
              >{{ unavailableDateLabel }}</p>
              <p
                v-else-if="dateRangeLabel"
                class="deal-card-v2__date-line"
              >{{ dateRangeLabel }}</p>

              <div v-if="mismatchMessages && mismatchMessages.length" class="deal-card-v2__mismatch-messages">
                <p v-for="msg in mismatchMessages" :key="msg" class="deal-card-v2__mismatch-msg">{{ msg }}</p>
              </div>

              <div class="deal-card-v2__grid-price-row">
                <p
                  class="deal-card-v2__meta-line"
                >{{ cardPersons }} {{ cardPersons === 1 ? 'persoon' : 'personen' }}, {{ deal.nights }} {{ deal.nights === 1 ? 'nacht' : 'nachten' }}</p>
                <p class="deal-card-v2__price-line">
                  <span class="deal-card-v2__price-prefix">Vanaf</span>
                  <span class="deal-card-v2__price">{{ formatPrice(price) }}</span>
                  <span v-if="originalPrice > price" class="deal-card-v2__original">{{ formatPrice(originalPrice) }}</span>
                  <SecondReleasePriceInfoTooltip variant="card" />
                </p>
                <NuxtLink
                  :to="dateMismatch ? mismatchHref : dealHref"
                  :target="linkTarget"
                  rel="noopener"
                  class="deal-card-v2__cta"
                  :class="{ 'deal-card-v2__cta--two-line': dateMismatch }"
                >
                  <template v-if="dateMismatch">
                    <span>Beschikbare</span>
                    <span>datums</span>
                  </template>
                  <template v-else>{{ ctaLabel || 'Bekijk' }}</template>
                </NuxtLink>
              </div>
              <!-- German-only microcopy below the price + button row.
                   Card grows ~16 px taller when the locale is `de`. -->
              <p v-if="isGerman" class="deal-card-v2__max-discount">
                {{ t('deal.cardMaxDiscount') }}
              </p>
            </template>
          </div>
        </div>

        <!-- LIST ONLY: virtual right column with meta + price + CTA -->
        <div v-if="!gridMode" class="deal-card-v2__right-col">
          <template v-if="unavailable">
            <p class="deal-card-v2__unavailable">Niet beschikbaar voor jouw zoekopdracht</p>
          </template>
          <template v-else>
            <p class="deal-card-v2__meta-line deal-card-v2__meta-line--small deal-card-v2__meta-line--right">
              {{ cardPersons }} {{ cardPersons === 1 ? 'persoon' : 'personen' }}, {{ deal.nights }} {{ deal.nights === 1 ? 'nacht' : 'nachten' }}
            </p>
            <p class="deal-card-v2__price-line deal-card-v2__price-line--right">
              <span class="deal-card-v2__price-prefix">Vanaf</span>
              <span v-if="originalPrice > price" class="deal-card-v2__original">{{ formatPrice(originalPrice) }}</span>
              <span class="deal-card-v2__price">{{ formatPrice(price) }}</span>
              <SecondReleasePriceInfoTooltip variant="card" />
            </p>
            <NuxtLink :to="dealHref" :target="linkTarget" rel="noopener" class="deal-card-v2__cta deal-card-v2__cta--full">
              Bekijk
            </NuxtLink>
          </template>
        </div>
      </div>

      <!-- German-only microcopy — list view shows it full-width across the
           bottom of the white content area (below both columns). -->
      <p v-if="!gridMode && isGerman" class="deal-card-v2__max-discount deal-card-v2__max-discount--list">
        {{ t('deal.cardMaxDiscount') }}
      </p>
    </div>

    <!-- Sibling-deals bar — light grey, single underlined link.
         Mirrors the deal page's room-info CTA footer styling. -->
    <div v-if="hasBar" class="deal-card-v2__siblings-bar">
      <button
        v-if="hasSiblings"
        type="button"
        class="deal-card-v2__siblings-link"
        @click="$emit('view-siblings')"
      >Bekijk alle {{ (siblingCount ?? 0) + 1 }} arrangementen, al vanaf <span class="deal-card-v2__siblings-price">{{ formatPrice(cheapestSiblingPrice) }}</span></button>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { SearchHotel, SearchHotelDeal } from '~/types/searchHotel'
import { formatPrice } from '~/utils-second-release/formatPrice'
import { formatDateShort } from '~/utils-second-release/formatDate'
import dayjs from 'dayjs'
import { pickSmartInclusions } from '~/utils-second-release/smartInclusions'
import { priceForArrival, cheapestConfigSurcharge } from '~/utils-second-release/priceFormula'
import { nightsLabel } from '~/utils-second-release/plural'
import { arrangementSuffixFromHighlights } from '~/utils-second-release/arrangementType'
import { dealHash, roomsLeftForDeal } from '~/utils-second-release/scarcity'
import { useSecondReleaseHomeVariant } from '~/composables-second-release/useSecondReleaseHomeVariant'

const { t, localized, locale } = useSecondReleaseI18n()
const isMobile = useSecondReleaseIsMobile()
/** Open deal / hotel pages in a new tab on desktop (so the search
 *  result list stays put), but in the SAME tab on mobile — mobile
 *  browsers handle multi-tab badly and a same-tab nav matches the
 *  user's mental model of "tap card → see deal". */
const linkTarget = computed(() => (isMobile.value ? '_self' : '_blank'))
/** German-only extra microcopy row sits below the CTA. */
const isGerman = computed(() => locale.value === 'de')

const { persons, rooms, arrivalDate } = useSecondReleaseSearchState()
// Session-wide favourites (no login popup). Keyed by hotel slug when
// present, else the deal slug.
const { isFavorite: isFav, toggle: toggleFav } = useSecondReleaseFavorites()
const favKey = computed(() => props.hotel?.slug || props.deal.slug)
const isFavorite = computed(() => isFav(favKey.value))

const props = defineProps<{
  deal: SearchHotelDeal
  hotel?: SearchHotel
  /** Number of OTHER deals on the same hotel; >0 → bottom bar shown. */
  siblingCount?: number
  gridMode?: boolean
  /** Pinned-from-deal whose deal doesn't match filters → replace price/CTA. */
  unavailable?: boolean
  /** Forced-hide hotel header (used in side panel). */
  hideHotelInfo?: boolean
  /** Hide the special-deal sticker overlays (used in side panel). */
  hideLabels?: boolean
  /** Suppress the grey bottom bar entirely (used on the home grids where
   *  there are no sibling-deal links to follow). */
  hideBar?: boolean
  /** Wider card variant (filter sidebar collapsed): list image scales to 560 px. */
  wide?: boolean
  /** When set, render every line in this list (no smartInclusions cap, no
   *  dedupe-by-popularity). Wrapping is allowed so long items take 2 lines. */
  fullInclusions?: string[]
  /** Side-panel "Beschikbaar op andere data" group: ignore the global
   *  arrival date so prices show the deal's lowest (base) price instead of
   *  a date-adjusted price the user can't actually book on that date. */
  ignoreArrival?: boolean
  /** Override the deal pool used for the bottom-bar siblings link
   *  ("Bekijk alle X arrangementen, al vanaf €Y"). Defaults to
   *  `hotel.deals`. The /search page passes the AVAILABLE deals here so
   *  the count + "vanaf" price match what the side panel groups under
   *  the first heading; the unavailable group is still shown in the
   *  panel but doesn't count towards the link. */
  siblingPool?: SearchHotelDeal[]
  /** Card is rendered inside the HotelDealsSidePanel — enables per-card
   *  date-range / availability lines + the side-panel CTA wording. */
  panelMode?: boolean
  /** Card is rendered inside the /kaart map sidepanel. When true the v6
   *  deal-page tweaks (special "X nachten met Y" title, full-inclusion list)
   *  are skipped so the map shows full original titles. */
  mapMode?: boolean
  /** Side-panel only: this deal can't be booked on the active arrival
   *  date (the deal's nights may still match the duration filter). */
  dateMismatch?: boolean
  /** Side-panel only: this deal's nights don't match the active duration
   *  filter (the date may still be available). */
  nightsMismatch?: boolean
  /** Override the default "Bekijk" CTA copy. Used for the featured card
   *  on /home which says "Bekijk arrangement" instead. */
  ctaLabel?: string
  /** Red mismatch messages stacked above the meta line (hotel page). */
  mismatchMessages?: string[]
}>()

defineEmits<{ 'view-siblings': [] }>()

/** Card title — every context (search card, deal-page sidepanel, map
 *  sidepanel) renders the full localised deal title, identical to
 *  what shows up in the page header. The compact "X nachten met Y"
 *  format used in earlier iterations has been replaced by the
 *  overlay-stickers below (deal-page sidepanel only). */
const panelTitle = computed(() => localized(props.deal.title))

/** "1 nacht" / "2 nachten" overlay sticker. Locale-aware via the
 *  shared plural helper. */
const nightsStickerLabel = computed<string>(() =>
  nightsLabel(props.deal.nights, (locale.value as 'nl' | 'en' | 'de'))
)

/** Up to 3 amenity-sticker labels (in priority order) detected by
 *  scanning the deal's inclusion titles for keywords. Renders only
 *  on the deal-page sidepanel via `panelMode && !mapMode`. */
const panelAmenityStickers = computed<string[]>(() => {
  const inclusionsSource = [
    ...(props.deal.detailedInclusions || []),
    ...(props.deal.inclusions || []),
  ]
  // Lowercased blob of every inclusion title, in any locale we have
  // — covers NL primary copy + EN/DE translations when present.
  const haystack = inclusionsSource
    .map(i => {
      const v = i as { nl?: string; en?: string; de?: string }
      return [v.nl, v.en, v.de].filter(Boolean).join(' ').toLowerCase()
    })
    .join(' ')

  // Priority order matches the user spec. Each entry: visible label
  // + keyword list. First match wins per row; we cap at 3 stickers.
  const candidates: Array<{ label: string; keys: string[] }> = [
    { label: 'entreekaarten', keys: ['entreekaart', 'entree-kaart', 'tickets', 'eintritt', 'entrance ticket'] },
    { label: 'diner', keys: ['diner', 'dinner', 'abendessen', '3-gangen', '4-gangen', '5-gangen', 'gangen menu'] },
    { label: 'bubbelbad', keys: ['bubbelbad', 'jacuzzi', 'whirlpool', 'hot tub', 'spabad'] },
    { label: 'fiets', keys: ['fiets', 'bicycle', 'bike', 'fahrrad'] },
    { label: 'wellness', keys: ['wellness', 'spa-toegang', 'spa toegang', 'spa entry'] },
    { label: 'zwembad', keys: ['zwembad', 'pool', 'schwimmbad'] },
  ]
  const out: string[] = []
  for (const c of candidates) {
    if (out.length >= 3) break
    if (c.keys.some(k => haystack.includes(k))) out.push(c.label)
  }
  return out
})

/** Scarcity count for the "Nog X beschikbaar" sticker — shared with the
 *  map hover card via the scarcity util (single source of truth). */
const roomsLeft = computed<number>(() => roomsLeftForDeal(props.deal.id))

/** Displayed image — defaults to the carousel's current frame; on v6
 *  panel mode each card picks a deterministic starting frame from the
 *  hotel's gallery so adjacent cards don't share the same photo. */
const displayedImage = computed(() => {
  // Sidepanel (deal-page + map): deterministic single photo per deal.
  if (props.panelMode && carouselImages.value.length > 1) {
    const i = dealHash(props.deal.id) % carouselImages.value.length
    return carouselImages.value[i] || imageSrc.value
  }
  return carouselImages.value[carouselIndex.value] || imageSrc.value
})

const metaEl = ref<HTMLElement | null>(null)
const hideRegion = ref(false)

/** When the meta line (stars + city - region) would wrap to a 2nd line in
 *  grid mode, drop the region (e.g. "Netherlands") so it stays single-line. */
function checkRegionFit() {
  if (!props.gridMode) {
    hideRegion.value = false
    return
  }
  const el = metaEl.value
  if (!el) return
  // Step 1: try with region visible.
  hideRegion.value = false
  nextTick(() => {
    const node = metaEl.value
    if (!node) return
    if (node.scrollWidth > node.clientWidth + 1) {
      hideRegion.value = true
    }
  })
}

let ro: ResizeObserver | null = null
onMounted(() => {
  checkRegionFit()
  if (typeof ResizeObserver !== 'undefined' && metaEl.value) {
    ro = new ResizeObserver(() => checkRegionFit())
    ro.observe(metaEl.value)
  }
})
onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
})

const showHotelInfo = computed(() => !!props.hotel && !props.hideHotelInfo)
const hasSiblings = computed(() => !!props.siblingCount && props.siblingCount > 0)
/** Whether to render the grey bottom bar — only when there are
 *  sibling deals to link to. Bundling is currently disabled on the
 *  search page so this resolves to `false` in practice, hiding the
 *  empty grey strip the grid mode used to render for visual parity. */
const hasBar = computed(() => {
  if (props.hideBar) return false
  return hasSiblings.value
})

const imageSrc = computed(() => {
  return props.deal.heroImage || props.deal.inclusionImage || props.hotel?.heroImage || ''
})

/** Up to 5 photos for the grid carousel — uses the hotel's `galleryImages`
 *  when present, otherwise falls back to a single `imageSrc`. */
const carouselImages = computed<string[]>(() => {
  const list = props.hotel?.galleryImages
  if (list && list.length > 0) return list.slice(0, 5)
  return imageSrc.value ? [imageSrc.value] : []
})

const carouselIndex = ref(0)
function prevImage() {
  const n = carouselImages.value.length
  if (n < 2) return
  carouselIndex.value = (carouselIndex.value - 1 + n) % n
}
function nextImage() {
  const n = carouselImages.value.length
  if (n < 2) return
  carouselIndex.value = (carouselIndex.value + 1) % n
}

const router = useRouter()
function onCardClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target.closest('a, button, [role="button"]')) return
  const href = props.dateMismatch ? mismatchHref.value : dealHref.value
  if (linkTarget.value === '_blank') {
    window.open(href, '_blank', 'noopener')
  } else {
    router.push(href)
  }
}

/** Carry the arrival date AND persons/rooms through the URL so a new-tab
 *  navigation (target=_blank with rel=noopener) lands on the right month
 *  with the right group size — even if Chrome doesn't clone sessionStorage
 *  to the new tab. */
const dealHref = computed(() => {
  const params = new URLSearchParams()
  if (arrivalDate.value) params.set('checkin', arrivalDate.value)
  if (persons.value !== 2) params.set('persons', String(persons.value))
  if (rooms.value !== 1) params.set('rooms', String(rooms.value))
  const q = params.toString()
  return `/second-release/deal/${props.deal.slug}${q ? '?' + q : ''}`
})

/** Href for the "beschikbare datums" CTA on an unavailable deal. Tells the
 *  deal page to scroll to the calendar on arrival (`cal=1`) and deliberately
 *  OMITS `checkin` — the deal page applies `?checkin` to the booking store, so
 *  carrying the unavailable date would pre-select it. The calendar opens empty
 *  so the user picks an available date. */
const mismatchHref = computed(() => {
  const params = new URLSearchParams()
  if (persons.value !== 2) params.set('persons', String(persons.value))
  if (rooms.value !== 1) params.set('rooms', String(rooms.value))
  params.set('cal', '1')
  return `/second-release/deal/${props.deal.slug}?${params.toString()}`
})

/** Card price reflects the global arrival date when set — same surcharge
 *  rule as the deal-page calendar, so the headline price on the card lines
 *  up with what the user sees in the calendar after clicking through.
 *  When `ignoreArrival` is set (side-panel "andere data" group), price is
 *  computed without the date so the card shows the deal's lowest price. */
const effectiveArrival = computed(() => (props.ignoreArrival ? null : arrivalDate.value))
// Second release: card prices follow the selected party — base (2p/1k)
// + €50 per extra person + €150 per extra room + €50 per 3-person room
// in the cheapest fitting configuration (only at hotels that have one).
const cardPersons = computed(() => persons.value || 2)
const cardRooms = computed(() => rooms.value || 1)
const tripleSurcharge = computed(() =>
  cheapestConfigSurcharge(props.deal.slug, cardPersons.value, cardRooms.value),
)
const price = computed(() =>
  priceForArrival(props.deal.basePrice, props.deal.id, effectiveArrival.value, cardPersons.value, cardRooms.value)
  + tripleSurcharge.value,
)
const originalPrice = computed(() =>
  priceForArrival(props.deal.originalPrice, props.deal.id, effectiveArrival.value, cardPersons.value, cardRooms.value)
  + tripleSurcharge.value,
)

/** Cheapest deal across all sibling arrangements at this hotel — used by
 *  the "Bekijk alle X arrangementen" footer link as the "vanaf" price.
 *  Also returns the original (pre-discount) cheapest so the strikethrough
 *  price line up with the current price. */
const cheapestSibling = computed(() => {
  const deals = props.siblingPool ?? props.hotel?.deals
  if (!deals || deals.length === 0) return null
  return deals.reduce((min, d) => {
    const dPrice = priceForArrival(d.basePrice, d.id, arrivalDate.value, cardPersons.value, cardRooms.value)
    const minPrice = priceForArrival(min.basePrice, min.id, arrivalDate.value, cardPersons.value, cardRooms.value)
    return dPrice < minPrice ? d : min
  })
})
const cheapestSiblingPrice = computed(() => {
  const d = cheapestSibling.value
  return d ? priceForArrival(d.basePrice, d.id, arrivalDate.value, cardPersons.value, cardRooms.value) : 0
})

/** Any kind of mismatch greys out the card; CTA wording differs per case. */
const isMismatch = computed(() => !!(props.dateMismatch || props.nightsMismatch))

/** Side-panel only: "12 jun - 13 jun" range based on the deal's nights.
 *  Only shown for fully-available cards (no mismatch). */
const dateRangeLabel = computed(() => {
  if (!props.panelMode || !arrivalDate.value || isMismatch.value) return ''
  const start = arrivalDate.value
  const end = dayjs(start).add(props.deal.nights, 'day').format('YYYY-MM-DD')
  return `${formatDateShort(start)} - ${formatDateShort(end)}`
})

/** "Niet beschikbaar op 12 juni" — drops the year for compact display. */
const unavailableDateLabel = computed(() => {
  if (!arrivalDate.value) return 'Niet beschikbaar'
  const [, m, d] = arrivalDate.value.split('-')
  const monthsLong = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']
  const monthName = monthsLong[parseInt(m, 10) - 1] || m
  return `Niet beschikbaar op ${parseInt(d, 10)} ${monthName}`
})

const includesBullets = computed<string[]>(() => {
  // Caller-supplied full list wins (used on /hotel/<slug>): show everything,
  // de-duped, with no smartInclusions trimming.
  if (props.fullInclusions && props.fullInclusions.length > 0) {
    const seen = new Set<string>()
    const out: string[] = []
    for (const t of props.fullInclusions) {
      const text = (t || '').trim()
      if (!text) continue
      const key = text.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      out.push(text)
    }
    return out
  }
  // Deal-page sidepanel only: bypass the smart-picker / 5-cap and
  // show every inclusion. Map sidepanel keeps the legacy 5-pick.
  if (props.panelMode && !props.mapMode) {
    const source = (props.deal.detailedInclusions && props.deal.detailedInclusions.length > 0)
      ? props.deal.detailedInclusions
      : props.deal.inclusions
    const seen = new Set<string>()
    const out: string[] = []
    for (const inc of source) {
      const text = localized(inc).trim()
      if (!text) continue
      const key = text.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      out.push(text)
    }
    return out
  }
  const dealInc = props.deal.inclusions
  const allInc = props.hotel?.deals.map(d => d.inclusions) ?? [dealInc]
  // Up to 5 unique inclusions. The picker cycles to pad when fewer unique
  // items exist; we dedupe afterwards so we never repeat the same text.
  const picks = pickSmartInclusions(dealInc, allInc, locale.value as 'nl' | 'en', 5)
  const seen = new Set<string>()
  const out: string[] = []
  for (const p of picks) {
    const text = localized(p).trim()
    if (!text) continue
    const key = text.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(text)
    if (out.length >= 5) break
  }
  return out
})

// Label rendering moved to <SecondReleaseDealLabel>; the old PNG/SVG lookup is gone.
</script>

<style scoped>
.deal-card-v2 {
  display: flex;
  width: 100%;
  min-width: 0;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: box-shadow var(--transition-fast);
  position: relative;
  cursor: pointer;
}

.deal-card-v2:hover {
  box-shadow: var(--shadow-hover);
}

/* ===== IMAGE ===== */
.deal-card-v2__image {
  width: 280px;
  min-height: 224px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  background: var(--color-background-secondary);
}
/* Full-photo click target → deal page (anti rage-click). Below the carousel
   arrows (z2) + favourite (z3); above the image. */
.deal-card-v2__image-link {
  position: absolute;
  inset: 0;
  z-index: 1;
}

/* List view, WIDE variant (filter sidebar hidden): image at double width
   (560 px) for both bar and no-bar cards. Default list keeps 280 px.
   Height follows the card (default flex stretch) so the image fills the
   full card height, no awkward gap below. */
.deal-card-v2--wide:not(.deal-card-v2--grid) .deal-card-v2__image {
  width: 560px;
}

/* List view: card height is driven by content. Each card may differ in
   height from its neighbours — that is fine. */

.deal-card-v2__image > img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Carousel arrows — fade in only on hover of the image area. White
   circular buttons matching the example, vertically centred. */
.deal-card-v2__carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  color: #1a1a1a;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
  opacity: 0;
  transition: opacity 150ms ease, background 150ms ease;
  z-index: 2;
}

.deal-card-v2__image:hover .deal-card-v2__carousel-nav {
  opacity: 1;
}

.deal-card-v2__carousel-nav:hover {
  background: #fff;
}

.deal-card-v2__carousel-nav--prev {
  left: 10px;
}

.deal-card-v2__carousel-nav--next {
  right: 10px;
}

.deal-card-v2__labels {
  position: absolute;
  left: var(--space-md);
  bottom: var(--space-md);
  display: flex;
  gap: 6px;
  z-index: 2;
  pointer-events: none;
}

.deal-card-v2__label {
  height: 36px; /* 80% of 45 */
  width: auto;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35));
}

.deal-card-v2__discount-badge {
  position: absolute;
  top: var(--space-md);
  left: var(--space-md);
  background: var(--color-dark);
  color: #fff;
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  letter-spacing: 0.5px;
}

/* Deal-page sidepanel overlay stickers. Sit on the photo (top-left),
   transparent-black chip + white Recoleta text. Up to 4 chips: 1×
   nights + ≤3 amenities; chips wrap to a second row when the row
   runs out of horizontal room. Roughly 2× the original size: font
   18 vs 11, padding 8×14 vs 3×8, radius 8 vs 4. */
.deal-card-v2__panel-stickers {
  position: absolute;
  top: var(--space-md);
  left: var(--space-md);
  /* Reserve room for the favourite heart (36px) at the top-right so the
     stickers wrap onto the next line instead of running under / over it. */
  right: calc(var(--space-md) + 44px);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  z-index: 2;
  pointer-events: none;
}
.deal-card-v2__panel-sticker {
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
  padding: 8px 14px;
  border-radius: 8px;
  letter-spacing: 0.2px;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

/* Scarcity sticker — bottom-right of the photo. Mirrors the amenity
   panel-sticker look (transparent-black tile, Recoleta white text) but
   ~2× smaller: font 11 vs 18, padding 4×8 vs 8×14, radius 5 vs 8. */
.deal-card-v2__rooms-sticker {
  /* Sits in the flow below the checkmarks, left-aligned with them (off the
     photo so it never collides with a label sticker). */
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  margin-top: 8px;
  background: var(--color-dark);
  color: #fff;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  padding: 4px 8px;
  border-radius: 5px;
  letter-spacing: 0.2px;
}

/* Grid view: lift the same chip onto the photo's lower-left corner. */
.deal-card-v2__rooms-sticker--photo {
  position: absolute;
  right: var(--space-md);
  bottom: var(--space-md);
  z-index: 2;
  margin-top: 0;
  pointer-events: none;
}

.deal-card-v2__favorite {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  /* Above the sticker overlays so it's never covered. */
  z-index: 3;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
}

.deal-card-v2__favorite:hover { background: rgba(0, 0, 0, 0.55); transform: scale(1.05); }
.deal-card-v2__favorite--active { background: rgba(255, 255, 255, 0.95); color: #E11D48; }
.deal-card-v2__favorite--active svg { fill: currentColor; }

/* ===== CONTENT ===== */
.deal-card-v2__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: var(--space-md);
}

/* Hotel info section: line 1 = name + stars, line 2 = score + label + loc */
.deal-card-v2__hotel-info {
  min-width: 0;
}

/* Body row: in grid → just main-col (full width).
   In list → main-col + right-col side-by-side. */
.deal-card-v2__body-row {
  display: flex;
  flex: 1;
  min-width: 0;
  gap: var(--space-md);
  margin-top: var(--space-sm);
}

.deal-card-v2__main-col {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* ===== HOTEL INFO ===== */
.deal-card-v2__name-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  display: block;
}

/* Line 1: hotel name + stars on the same line */
.deal-card-v2__name-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 0 0 4px;
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.3;
  min-width: 0;
}

.deal-card-v2__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.deal-card-v2__name-link:hover .deal-card-v2__name {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.deal-card-v2__stars {
  color: #1A1A1A;
  font-size: 13px;
  letter-spacing: 1px;
  flex-shrink: 0;
  font-weight: 400;
}

/* Line 2: review badge + label | map-pin + location */
.deal-card-v2__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
  white-space: nowrap;
  overflow: hidden;
  min-width: 0;
  font-size: 13px;
}

.deal-card-v2__score {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: #00B67A;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.deal-card-v2__score-label {
  font-weight: 600;
  color: var(--color-text-primary);
}

.deal-card-v2__sep {
  color: var(--color-text-muted);
}

.deal-card-v2__loc-icon {
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.deal-card-v2__location {
  color: var(--color-text-secondary);
  white-space: nowrap;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Divider between hotel info and deal pitch */
.deal-card-v2__divider {
  border: none;
  border-top: 1px solid var(--color-border-light);
  margin: var(--space-sm) 0 0;
}

/* Divider spans the full content width — no extra right inset. */

/* ===== DEAL PITCH ===== */
.deal-card-v2__pitch {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--color-text-primary);
  margin: var(--space-sm) 0 var(--space-sm);
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ===== INCLUDES ===== */
.deal-card-v2__includes {
  flex: 1;
  min-width: 0;
}

.deal-card-v2__includes-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.deal-card-v2__include {
  font-size: 13px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.deal-card-v2__include-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

/* Full-list mode (hotel page): allow each include to wrap to 2 lines. */
.deal-card-v2__includes--full .deal-card-v2__include {
  align-items: flex-start;
}

.deal-card-v2__includes--full .deal-card-v2__include-text {
  white-space: normal;
  text-overflow: clip;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.35;
}

.deal-card-v2__check {
  color: var(--color-discount);
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}


/* ===== META + PRICE LINES ===== */
.deal-card-v2__meta-line {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.deal-card-v2__meta-line--small {
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

/* Second meta line in the side-panel "nights mismatch" variant — sits
   directly under the nights line, slightly lighter. */
.deal-card-v2__meta-line--secondary {
  margin-top: 2px;
  font-weight: 600;
}

.deal-card-v2__price-line {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 0;
  flex-wrap: wrap;
}

.deal-card-v2__price-prefix {
  font-size: 13px;
  color: var(--color-text-muted);
  font-style: italic;
}

.deal-card-v2__price {
  font-size: 22px;
  font-weight: 700;
  font-family: var(--font-heading);
  color: var(--color-text-primary);
}

.deal-card-v2__original {
  font-size: 13px;
  color: var(--color-error);
  text-decoration: line-through;
}

/* ===== MISMATCH MESSAGES ===== */
.deal-card-v2__mismatch-messages {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 4px;
}
.deal-card-v2__mismatch-msg {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-error, #d32f2f);
  line-height: 1.3;
  margin: 0;
}

/* ===== CTA ===== */
.deal-card-v2__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* 1.25 × the previous 8 px vertical padding — taller tap target. */
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-decoration: none;
  transition: background var(--transition-fast);
}

.deal-card-v2__cta:hover { background: var(--color-primary-hover); }

.deal-card-v2__cta--full {
  width: 100%;
}

/* Two-line CTA used by the side-panel "Check beschikbaarheid" button.
   Stacks "Check" / "beschikbaarheid" on top of each other so the button
   grows in height instead of pushing the price column. */
.deal-card-v2__cta--two-line {
  flex-direction: column;
  line-height: 1.15;
  padding: 10px 8px;
  font-size: 13px;
  white-space: normal;
}


/* ──────────────────────────────────────────────────────────────
   STRUCTURAL RULE — DO NOT BREAK
   The CTA button's BOX BOTTOM must always align with the
   price-line's BOX BOTTOM. The meta line ("X personen, Y
   nachten") sits ABOVE the price with a fixed ~4 px gap
   (≤ 8 px max per spec).

   Implemented with CSS Grid (2 cols × 2 rows). The CTA spans
   BOTH rows; `align-self: end` on the CTA + price-line pins
   their bottoms to the bottom row's bottom edge. The grid is
   immune to baseline / line-height drift because positions are
   determined by grid cells, not by intrinsic content baselines.
   Mobile and desktop use the SAME grid — no media-query
   override. Future changes to CTA padding / font / size do NOT
   break alignment because the grid cells pin BOX bottoms.
   ────────────────────────────────────────────────────────── */
.deal-card-v2__grid-price-row {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    "meta  cta"
    "price cta";
  grid-template-rows: auto auto;
  column-gap: var(--space-md);
  row-gap: 4px;
}

.deal-card-v2__grid-price-row > .deal-card-v2__meta-line {
  grid-area: meta;
  align-self: end;
  line-height: 1;
  margin: 0;
}

.deal-card-v2__grid-price-row > .deal-card-v2__price-line {
  grid-area: price;
  align-self: end;
  line-height: 1;
  margin: 0;
}

.deal-card-v2__grid-price-row > .deal-card-v2__cta {
  grid-area: cta;
  align-self: end;
}

.deal-card-v2__unavailable {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-muted, #999);
  margin: 0;
  line-height: 1.4;
}

/* Side-panel: "12 jun - 13 jun" / "Niet beschikbaar op 12 juni" line.
   Bottom margin gives the date a clear gap to the persons/nights line —
   matched to the persons↔price gap below it (the grid-price-row's −4px
   margin-top eats most of this, so 8px nets ~5px visible). */
.deal-card-v2__date-line {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 0 0 8px;
  line-height: 1.2;
}

.deal-card-v2__date-line--unavailable {
  color: var(--color-text-muted);
  font-style: italic;
}

/* Greyed-out card for unavailable-on-date deals. The image and favourite
   button keep full opacity; only the textual content fades. */
.deal-card-v2--unavailable-on-date .deal-card-v2__pitch,
.deal-card-v2--unavailable-on-date .deal-card-v2__meta-line,
.deal-card-v2--unavailable-on-date .deal-card-v2__price-line,
.deal-card-v2--unavailable-on-date .deal-card-v2__price,
.deal-card-v2--unavailable-on-date .deal-card-v2__price-prefix,
.deal-card-v2--unavailable-on-date .deal-card-v2__includes-list,
.deal-card-v2--unavailable-on-date .deal-card-v2__include {
  color: var(--color-text-muted);
}

.deal-card-v2--unavailable-on-date .deal-card-v2__check {
  color: var(--color-border);
}

/* ===== LIST: virtual 180 px right column ===== */
.deal-card-v2__right-col {
  width: 180px;
  flex-shrink: 0;
  /* Right edge sits flush with the content padding (16 px from card right);
     no extra padding inside this column. */
  padding: var(--space-md) 0 0 var(--space-md);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: stretch;
  /* Tight, uniform gap — meta↔price = price↔button */
  gap: 4px;
}

/* Right-col children: stacked and right-aligned at the bottom */
.deal-card-v2__right-col > * { align-self: flex-end; }
.deal-card-v2__right-col {
  align-items: stretch;
  justify-content: flex-end;
  gap: 4px;
}

.deal-card-v2__meta-line--right { width: 100%; text-align: right; }
.deal-card-v2__price-line--right { justify-content: flex-end; }
.deal-card-v2__original--right { display: block; }

/* ===== GRID-only stacked bottom =====
   `margin-top: auto` pushes the bottom block flush to the card's bottom so
   shorter content shows the slack between the includes and the persons line,
   not below the CTA. */
.deal-card-v2__grid-bottom {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: auto;
  padding-top: var(--space-md);
}

/* Pull the persons/nights line 4 px closer to the price row. */
.deal-card-v2__grid-bottom .deal-card-v2__grid-price-row {
  margin-top: -4px;
}

/* ===== GRID MODE ===== */
.deal-card-v2--grid {
  flex-direction: column;
}

.deal-card-v2--grid .deal-card-v2__image {
  width: 100%;
  min-height: 224px;
  max-height: 224px;
}

.deal-card-v2--grid .deal-card-v2__content {
  padding: var(--space-md);
  /* Default `.deal-card-v2__content { flex: 1 }` already lets the content
     stretch to fill the card height — we keep that on grid so the bottom
     block can dock at the bottom via `.grid-bottom { margin-top: auto }`. */
}


.deal-card-v2--grid .deal-card-v2__pitch {
  -webkit-line-clamp: 4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ===== SIBLINGS BAR ===== */
.deal-card-v2__siblings-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 36px;
  display: flex;
  align-items: center;
  padding: 0 var(--space-md);
  background: var(--color-background-secondary);
  border-top: 1px solid var(--color-border-light);
  font-size: 13px;
  z-index: 1;
}

/* List view: bar starts to the RIGHT of the image (image fills full card height) */
.deal-card-v2:not(.deal-card-v2--grid) .deal-card-v2__siblings-bar {
  left: 280px;
  justify-content: flex-end;
}

.deal-card-v2--wide:not(.deal-card-v2--grid) .deal-card-v2__siblings-bar {
  left: 560px;
}

.deal-card-v2--grid .deal-card-v2__siblings-bar {
  justify-content: flex-end;
}

.deal-card-v2--has-bar .deal-card-v2__content {
  padding-bottom: calc(var(--space-md) + 36px);
}

.deal-card-v2__siblings-link {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-weight: 600;
  color: var(--color-text-link);
  cursor: pointer;
  transition: color var(--transition-fast);
  /* Block-level so the entire bar's content area is one click target and
     the underline runs continuously through the prices (no flex gaps). */
  display: block;
  width: 100%;
  text-align: right;
  text-decoration: underline;
  text-underline-offset: 3px;
}
/* Hover: whole string (text + price) deepens to the brand hover orange. */
.deal-card-v2__siblings-link:hover,
.deal-card-v2__siblings-link:hover .deal-card-v2__siblings-price {
  color: var(--color-primary-hover);
}
.deal-card-v2__siblings-price {
  color: var(--color-text-primary);
  font-weight: 700;
  font-family: var(--font-heading);
}

/* German-only microcopy line below the price + CTA row. Full-width,
   left-aligned, small secondary-grey type. The card grows ~16 px
   taller when this line renders (German locale only). */
.deal-card-v2__max-discount {
  width: 100%;
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.4;
  color: var(--color-text-secondary);
  text-align: left;
}
/* List view: span the full width of the white content area, below both
   columns, separated by a hairline. */
.deal-card-v2__max-discount--list {
  margin-top: var(--space-sm);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--color-border-light);
}

/* Mobile: bump the deal title + includes copy, align price row
   on the BOTTOM edge of the CTA button, and grow the CTA ~10 %. */
@media (max-width: 800px) {
  .deal-card-v2__pitch { font-size: 19px; }
  .deal-card-v2__include { font-size: 15px; }
  /* NOTE: no .deal-card-v2__grid-price-row override here.
     The CSS Grid layout (see structural-rule note above)
     handles alignment identically on mobile and desktop. */
  .deal-card-v2__cta { padding: 11px 24px; }
}
</style>
