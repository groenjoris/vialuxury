<template>
  <article
    ref="cardEl"
    class="fiets-card"
    :class="{ 'fiets-card--playing': isPlaying }"
    @click="onCardClick"
  >
    <!-- Beeldvlak: video, stilstaand beeld, verloop, badge, hart, routelijn. -->
    <div class="fiets-card__media">
      <NuxtLink
        :to="dealHref"
        :target="linkTarget"
        rel="noopener"
        class="fiets-card__media-link"
        :aria-label="title"
        @click.stop
      />
      <video
        v-if="media"
        ref="videoEl"
        class="fiets-card__video"
        muted
        loop
        playsinline
        preload="metadata"
        :poster="media.poster"
      >
        <source :src="media.video" type="video/mp4" />
      </video>
      <img v-if="thumbSrc" class="fiets-card__thumb" :src="thumbSrc" alt="" />
      <div class="fiets-card__scrim"></div>

      <span v-if="deal.discountPercentage" class="fiets-card__discount">-{{ deal.discountPercentage }}%</span>

      <button
        type="button"
        class="fiets-card__heart"
        :aria-pressed="isFavorite"
        :aria-label="isFavorite ? 'Verwijder uit favorieten' : 'Bewaar als favoriet'"
        @click.stop="toggleFav(favKey)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" /></svg>
      </button>

      <!-- Routelijn. In rust een gewone stippellijn; tijdens het afspelen
           lichten de bereikte plaatsen op en lopen de etappes vol. -->
      <ol class="fiets-card__route" :class="{ 'is-running': isRunning }" aria-label="Reisopbouw">
        <template v-for="(stop, i) in stops" :key="stop.city + i">
          <li v-if="i > 0" ref="legEls" class="fiets-card__leg">
            <span class="fiets-card__bike" v-html="routeIcon"></span>
          </li>
          <li class="fiets-card__stop" :class="{ 'is-done': isRunning && i <= sceneIndex }">
            <b>{{ stop.city }}</b>
            <i></i>
            <span v-if="stop.nights">{{ nightsLabel(stop.nights) }}</span>
          </li>
        </template>
      </ol>
    </div>

    <div class="fiets-card__body">
      <div class="fiets-card__kind">{{ hotel?.name }}</div>

      <div class="fiets-card__places">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>
        <span>{{ placesLabel }}</span>
      </div>

      <h3 class="fiets-card__title">{{ title }}</h3>

      <div class="fiets-card__label">{{ typeLabel }}</div>

      <ul v-if="includes.length > 0" class="fiets-card__incl">
        <li v-for="(line, i) in includes" :key="i">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5 9.5 18 20 6.5" /></svg>
          <span>{{ line }}</span>
        </li>
      </ul>

      <div class="fiets-card__people">
        {{ PRICED_PERSONS }} {{ PRICED_PERSONS === 1 ? 'persoon' : 'personen' }}, {{ nightsLabel(deal.nights) }}
      </div>

      <div class="fiets-card__price">
        <div class="fiets-card__amounts">
          <span class="fiets-card__from">Vanaf</span>
          <span class="fiets-card__now">{{ formatPrice(price) }}</span>
          <span v-if="originalPrice > price" class="fiets-card__was">{{ formatPrice(originalPrice) }}</span>
          <MhtJessePriceInfoTooltip variant="card" />
        </div>
        <NuxtLink
          :to="dealHref"
          :target="linkTarget"
          rel="noopener"
          class="fiets-card__cta"
          @click.stop
        >{{ ctaLabel || 'Bekijk' }}</NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
/**
 * Multi Hotel Trip - Jesse — fietsvakantiekaart.
 *
 * Overgenomen uit het losse pakket `fietskaart/` (markup, maten en gedrag uit
 * IMPLEMENTATIE.md), maar opgebouwd op de tokens van het project in plaats van
 * losse hexwaarden, en met de klassenamen op de conventie hier (`fiets-card__`
 * in plaats van `vlc__`). De structuur is ongewijzigd, dus de opbouw uit dat
 * document blijft te volgen.
 *
 * Alleen in gebruik als uitgelichte kaart op /mht-jesse/home. Alle andere
 * plekken houden MhtJesseDealCard.
 *
 * Zonder video werkt de kaart gewoon: dan alleen het stilstaande beeld (of de
 * hotelfoto), de routelijn in rusttoestand en geen voortgangsbalk.
 */
import type { SearchHotel, SearchHotelDeal } from '~/types/searchHotel'
import { formatPrice } from '~/utils-mht-jesse/formatPrice'
import { priceForArrival, PRICED_PERSONS } from '~/utils-mht-jesse/priceFormula'
import { nightsLabel } from '~/utils-mht-jesse/plural'
import { tripMediaFor } from '~/data/mhtj-trip-media'

const props = defineProps<{
  deal: SearchHotelDeal
  hotel?: SearchHotel
  /** Knoptekst; standaard "Bekijk". */
  ctaLabel?: string
}>()

const { localized } = useMhtJesseI18n()
const isMobile = useMhtJesseIsMobile()
const { persons, rooms, arrivalDate } = useMhtJesseSearchState()
const { isFavorite: isFav, toggle: toggleFav } = useMhtJesseFavorites()

const trip = computed(() => props.hotel?.trip ?? null)
const stops = computed(() => trip.value?.stops ?? [])
const title = computed(() => localized(props.deal.title))
const placesLabel = computed(() => stops.value.map(s => s.city).join(' · '))
const typeLabel = computed(() => (trip.value?.type === 'fiets' ? 'Fietsvakantie' : 'Autovakantie'))

const favKey = computed(() => props.hotel?.slug || props.deal.slug)
const isFavorite = computed(() => isFav(favKey.value))

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

const media = computed(() => tripMediaFor(props.hotel?.slug))
/** Ligt over de video tot die speelt; zonder video is dit gewoon de kaartfoto. */
const thumbSrc = computed(() =>
  media.value?.thumbnail || stops.value[0]?.image || props.hotel?.heroImage || props.deal.heroImage || '',
)

const BIKE = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="17" r="3.5"/><circle cx="18" cy="17" r="3.5"/><path d="M6 17l3.5-8h4.5l4 8M9.5 9l2.5 8M14 9l-1.2-3.2h2.7"/></svg>'
const CAR = '<span class="fiets-card__car" aria-hidden="true"></span>'
const routeIcon = computed(() => (trip.value?.type === 'fiets' ? BIKE : CAR))

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
  if (linkTarget.value === '_blank') window.open(dealHref.value, '_blank', 'noopener')
  else router.push(dealHref.value)
}

/* ── Gedrag: video, voortgangsbalk, oplichtende plaatsen ────────────────── */

const cardEl = ref<HTMLElement | null>(null)
const videoEl = ref<HTMLVideoElement | null>(null)
const legEls = ref<HTMLElement[]>([])

const isPlaying = ref(false)
const isRunning = ref(false)
const sceneIndex = ref(0)

let raf = 0
const cleanups: Array<() => void> = []

const clamp = (x: number) => Math.max(0, Math.min(1, x))

/** Per beeld bijwerken, niet op `timeupdate`: dat vuurt vier keer per seconde
 *  en loopt zichtbaar in schokjes. */
function draw() {
  const video = videoEl.value
  const scenes = media.value?.scenes
  if (!video || !scenes || scenes.length < 2) return
  // Het `pause`-event komt asynchroon, dus na een mouseleave kan deze lus nog
  // één beeld draaien ná reset() en de routelijn opnieuw aanzetten. Vandaar
  // deze controle en de cancelAnimationFrame in reset() hieronder.
  if (video.paused) return
  const t = video.currentTime

  let scene = 0
  for (let i = 1; i < scenes.length - 1; i++) if (t >= scenes[i]!) scene = i
  isRunning.value = true
  sceneIndex.value = scene

  legEls.value.forEach((leg, i) => {
    const start = scenes[i]!
    const end = scenes[i + 1]!
    const p = end > start ? clamp((t - start) / (end - start)) : 0
    // De etappe bestaat uit twee helften, links en rechts van het icoon.
    leg.style.setProperty('--f1', String(clamp(p * 2)))
    leg.style.setProperty('--f2', String(clamp(p * 2 - 1)))
  })
}

function reset() {
  cancelAnimationFrame(raf)
  isRunning.value = false
  sceneIndex.value = 0
  legEls.value.forEach(leg => {
    leg.style.setProperty('--f1', '0')
    leg.style.setProperty('--f2', '0')
  })
}

function loop() {
  draw()
  raf = requestAnimationFrame(loop)
}

function on(el: EventTarget, type: string, fn: EventListener) {
  el.addEventListener(type, fn)
  cleanups.push(() => el.removeEventListener(type, fn))
}

onMounted(() => {
  const video = videoEl.value
  const card = cardEl.value
  reset()
  if (!video || !card) return

  video.muted = true

  on(video, 'play', () => {
    isPlaying.value = true
    cancelAnimationFrame(raf)
    loop()
  })
  on(video, 'pause', () => {
    isPlaying.value = false
    cancelAnimationFrame(raf)
  })
  on(video, 'ended', reset)

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const pointer = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches

  if (reduced) return // niets afspelen, het stilstaande beeld blijft staan

  if (!pointer) {
    // Touchscreen: speelt vanzelf.
    video.autoplay = true
    video.play().catch(() => {})
    return
  }

  on(card, 'mouseenter', () => { video.play().catch(() => {}) })
  on(card, 'mouseleave', () => {
    video.pause()
    video.currentTime = 0
    reset()
  })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  cleanups.forEach(fn => fn())
  cleanups.length = 0
})
</script>

<style scoped>
.fiets-card {
  /* --ruimte is de enige witruimtemaat tussen de blokken.
     --as is de hoogte waarop de stippen, de stippellijn en het icoon liggen,
     gerekend vanaf de bovenkant van de rij: regelhoogte plaatsnaam (14) +
     marge (6) + halve stip (5). */
  --ruimte: var(--space-md);
  --beeld: 240px;
  --as: 25px;

  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: box-shadow var(--transition-base);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  cursor: pointer;
}
.fiets-card:hover { box-shadow: var(--shadow-hover); }

/* ── beeldvlak ── */
.fiets-card__media {
  position: relative;
  height: var(--beeld);
  flex: none;
  overflow: hidden;
  background: var(--color-dark);
}
.fiets-card__media-link { position: absolute; inset: 0; z-index: 1; }
.fiets-card__video,
.fiets-card__thumb {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  max-width: 100%;
}
.fiets-card__thumb { opacity: 1; transition: opacity var(--transition-base); }
.fiets-card--playing .fiets-card__thumb { opacity: 0; }

/* Verloop achter de routelijn, anders zakt wit weg in een licht beeld. */
.fiets-card__scrim {
  position: absolute;
  inset: auto 0 0 0;
  height: 46%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.55) 42%, rgba(0, 0, 0, 0) 100%);
}

/* ── kortingsbadge ── */
.fiets-card__discount {
  position: absolute;
  top: var(--space-md);
  left: var(--space-md);
  z-index: 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 68px;
  height: 50px;
  padding: 2px 12px 4px 10px;
  background: var(--color-dark);
  color: #fff;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 17px;
  line-height: 24px;
  letter-spacing: 0.5px;
  clip-path: polygon(0% 18%, 100% 0%, 85% 100%, 0% 90%);
}

/* ── favorietenhart ── */
.fiets-card__heart {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  z-index: 3;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.92);
  color: var(--color-dark);
  padding: 0;
}
.fiets-card__heart svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; }
.fiets-card__heart[aria-pressed="true"] svg { fill: #E01F33; stroke: #E01F33; }

/* ── routelijn ── */
.fiets-card__route {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  list-style: none;
  margin: 0;
  padding: 0 16px 14px;
  display: flex;
  align-items: stretch;
  justify-content: center;
}
.fiets-card__stop {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 0 0 auto;
  max-width: 36%;
  min-width: 0;
}
.fiets-card__stop b {
  order: 1;
  color: #fff;
  font-size: 12.5px;
  font-weight: 700;
  line-height: 14px;
  margin-bottom: 6px;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 2px;
  transition: color 200ms ease;
}
.fiets-card__stop i {
  order: 2;
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  transition: background 200ms ease;
}
.fiets-card__stop span {
  order: 3;
  color: rgba(255, 255, 255, 0.75);
  font-size: 11px;
  line-height: 13px;
  margin-top: 6px;
  transition: color 200ms ease;
}

/* De etappe is de balk die volloopt: witte streepjes over grijze streepjes.
   --f1 en --f2 zijn de twee helften, links en rechts van het icoon; het
   gedrag zet ze per beeld. */
.fiets-card__leg {
  flex: 1 1 0;
  min-width: 40px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.fiets-card__leg::before,
.fiets-card__leg::after {
  content: "";
  position: absolute;
  top: calc(var(--as) - 1px);
  height: 2px;
  background-image:
    repeating-linear-gradient(to right, #fff 0 7px, transparent 7px 13px),
    repeating-linear-gradient(to right, rgba(255, 255, 255, 0.42) 0 7px, transparent 7px 13px);
  background-repeat: no-repeat, repeat-x;
  background-position: left center, left center;
}
.fiets-card__leg::before {
  left: -6px;
  right: calc(50% + 16px);
  background-size: calc(var(--f1, 0) * 100%) 2px, auto;
}
.fiets-card__leg::after {
  left: calc(50% + 16px);
  right: -6px;
  background-size: calc(var(--f2, 0) * 100%) 2px, auto;
}
.fiets-card__bike {
  position: absolute;
  top: var(--as);
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  display: flex;
}
.fiets-card__bike :deep(svg) {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
/* Het aangeleverde auto-icoon is een PNG; als masker meegekleurd met de lijn. */
.fiets-card__bike :deep(.fiets-card__car) {
  display: block;
  width: 22px;
  height: 22px;
  background: currentColor;
  -webkit-mask: url(/images/icons/car.png) center/contain no-repeat;
  mask: url(/images/icons/car.png) center/contain no-repeat;
}

/* Zolang de video loopt: bereikte plaatsen wit, de rest grijs. In rust licht
   er niets op en is het gewoon een stippellijn. */
.fiets-card__route.is-running .fiets-card__stop b { color: rgba(255, 255, 255, 0.45); }
.fiets-card__route.is-running .fiets-card__stop i { background: rgba(255, 255, 255, 0.45); }
.fiets-card__route.is-running .fiets-card__stop span { color: rgba(255, 255, 255, 0.4); }
.fiets-card__route.is-running .fiets-card__stop.is-done b { color: #fff; }
.fiets-card__route.is-running .fiets-card__stop.is-done i { background: #fff; }
.fiets-card__route.is-running .fiets-card__stop.is-done span { color: rgba(255, 255, 255, 0.8); }

/* ── tekstblok ── */
.fiets-card__body { padding: var(--ruimte); }
.fiets-card__kind {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 16px;
  line-height: 20.8px;
}
.fiets-card__places {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  font-size: 13px;
  line-height: 18px;
  color: var(--color-text-secondary);
}
.fiets-card__places svg { width: 14px; height: 14px; flex: none; }
.fiets-card__title {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 18px;
  line-height: 23.4px;
  margin: var(--ruimte) 0 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  overflow: hidden;
}
.fiets-card__label {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 13px;
  line-height: 20.8px;
  color: var(--color-primary);
  margin-top: var(--ruimte);
}
.fiets-card__incl { list-style: none; margin: 8px 0 0; padding: 0; }
.fiets-card__incl li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  line-height: 22.4px;
  margin-bottom: 6px;
}
.fiets-card__incl li:last-child { margin-bottom: 0; }
.fiets-card__incl svg {
  width: 14px;
  height: 14px;
  margin-top: 4px;
  color: var(--color-discount);
  flex: none;
}
.fiets-card__people {
  font-weight: 700;
  font-size: 14px;
  line-height: 22.4px;
  margin-top: var(--ruimte);
}

.fiets-card__price {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
}
.fiets-card__amounts { display: flex; align-items: baseline; gap: 8px; }
.fiets-card__from {
  font-family: var(--font-heading);
  font-style: italic;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.fiets-card__now {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 22px;
  line-height: 22px;
}
.fiets-card__was {
  font-family: var(--font-heading);
  font-size: 14px;
  color: var(--color-error);
  text-decoration: line-through;
}
.fiets-card__cta {
  display: inline-flex;
  align-items: center;
  height: 42px;
  padding: 10px 24px;
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--radius-lg);
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  line-height: 22.4px;
  transition: background var(--transition-fast);
  white-space: nowrap;
}
.fiets-card:hover .fiets-card__cta,
.fiets-card__cta:hover { background: var(--color-primary-hover); }

/* ── smal: meer lucht tussen de blokken ── */
@media (max-width: 767px) {
  .fiets-card { --ruimte: 20px; }
  .fiets-card__route { padding: 0 20px 16px; }
  .fiets-card__incl { margin-top: 10px; }
  .fiets-card__incl li { margin-bottom: 8px; }
  .fiets-card__price { margin-top: 12px; }
}

/* ── minder beweging: het stilstaande beeld blijft staan ── */
@media (prefers-reduced-motion: reduce) {
  .fiets-card--playing .fiets-card__thumb { opacity: 1; }
}
</style>
