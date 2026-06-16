<template>
  <!-- Mobile: single-image swipe carousel (scroll-snap) with a photo
       counter pill. Desktop keeps the hero + 4-thumbnail grid. -->
  <div v-if="isMobile" class="hero-gallery hero-gallery--mobile">
    <div ref="trackRef" class="hero-gallery__track" @scroll.passive="onScroll">
      <div
        v-for="(image, i) in carouselImages"
        :key="image.id"
        class="hero-gallery__slide"
        @click="$emit('openPhoto', i)"
      >
        <img :src="image.url" :alt="localized(image.alt)" class="hero-gallery__slide-img" />
      </div>
    </div>

    <!-- Prev / next arrows -->
    <button
      v-if="carouselImages.length > 1"
      type="button"
      class="hero-gallery__nav hero-gallery__nav--prev"
      aria-label="Vorige foto"
      @click="prevSlide"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
    </button>
    <button
      v-if="carouselImages.length > 1"
      type="button"
      class="hero-gallery__nav hero-gallery__nav--next"
      aria-label="Volgende foto"
      @click="nextSlide"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
    </button>

    <!-- Counter, top-right -->
    <span v-if="carouselImages.length > 1" class="hero-gallery__counter">
      {{ activeIndex + 1 }} / {{ carouselImages.length }}
    </span>

    <!-- All-photos button, lower-left -->
    <button type="button" class="hero-gallery__all-btn hero-gallery__all-btn--mobile" @click="$emit('openGallery')">
      <span class="all-btn-icon">⊞</span>
      {{ t('common.allPhotos') }}
    </button>
  </div>

  <div v-else class="hero-gallery">
    <div class="hero-gallery__main" @click="$emit('openPhoto', 0)">
      <img
        :src="heroImage?.url || '/images/placeholder.jpg'"
        :alt="heroImage?.alt ? localized(heroImage.alt) : t('common.hotelPhoto')"
        class="hero-gallery__hero-img"
      />
      <!-- Same stickers as the search card: special labels bottom-left,
           limited-supply bottom-right. Desktop hero only. -->
      <div v-if="labels && labels.length" class="hero-gallery__labels">
        <SecondReleaseDealLabel
          v-for="label in labels"
          :key="label"
          :key-name="label"
          class="hero-gallery__label"
        />
      </div>
      <span v-if="roomsLeft != null && roomsLeft < 4" class="hero-gallery__rooms-sticker">
        Nog {{ roomsLeft }} beschikbaar
      </span>
    </div>
    <div class="hero-gallery__grid">
      <div
        v-for="(image, index) in photoCells"
        :key="image.id"
        class="hero-gallery__cell"
        @click="$emit('openPhoto', index + 1)"
      >
        <img :src="image.url" :alt="localized(image.alt)" class="hero-gallery__img" />
        <button
          v-if="index === allPhotosCellIndex"
          class="hero-gallery__all-btn"
          @click.stop="$emit('openGallery')"
        >
          <span class="all-btn-icon">⊞</span>
          {{ t('common.allPhotos') }}
        </button>
      </div>
      <!-- Deal page: the lower-right photo is replaced by the location map. -->
      <NuxtLink
        v-if="hasMap"
        :to="mapSlug ? `/second-release/kaart?focus=${mapSlug}` : '/second-release/kaart'"
        class="hero-gallery__cell hero-gallery__cell--map"
        :aria-label="t('common.viewMap')"
      >
        <SecondReleaseStaticMiniMap :lat="mapLat!" :lng="mapLng!" :zoom="11" />
        <span class="hero-gallery__map-pin"><SecondReleaseMapPin /></span>
        <span class="hero-gallery__map-link">{{ t('common.viewMap') || 'Bekijk op kaart' }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HotelImage } from '~/types/hotel'
import { useSecondReleaseIsMobile } from '~/composables-second-release/useSecondReleaseIsMobile'

const { t, localized } = useSecondReleaseI18n()
const isMobile = useSecondReleaseIsMobile()

const props = defineProps<{
  images: HotelImage[]
  /** Special-deal label keys (same as the search card). Desktop hero only. */
  labels?: string[]
  /** Rooms-left count; the limited-supply sticker shows when < 4. */
  roomsLeft?: number | null
  /** When lat+lng are given (deal page), the lower-right gallery photo is
   *  replaced by a static location map that links through to /kaart. */
  mapLat?: number | null
  mapLng?: number | null
  mapSlug?: string
}>()

defineEmits<{
  openGallery: []
  /** Open the full-photo viewer at this index in the ordered list
   *  (hero first, then gallery). */
  openPhoto: [index: number]
}>()

const heroImage = computed(() => props.images.find((img) => img.position === 'hero'))
const galleryImages = computed(() => props.images.filter((img) => img.position === 'gallery').slice(0, 4))

/** When the map occupies the lower-right cell, only 3 photo thumbnails are
 *  shown (the map takes the 4th slot). */
const hasMap = computed(() => props.mapLat != null && props.mapLng != null)
const photoCells = computed(() => (hasMap.value ? galleryImages.value.slice(0, 3) : galleryImages.value))
const lastPhotoCellIndex = computed(() => photoCells.value.length - 1)
/** With the map in the lower-right slot, the "Alle foto's" button sits on
 *  the photo directly ABOVE it (top-right cell, index 1). Without a map it
 *  stays on the last gallery photo. */
const allPhotosCellIndex = computed(() => (hasMap.value ? 1 : lastPhotoCellIndex.value))

/** Mobile carousel shows EVERY photo (hero first, then gallery) one at a
 *  time. */
const carouselImages = computed<HotelImage[]>(() => {
  const hero = props.images.find((img) => img.position === 'hero')
  const gallery = props.images.filter((img) => img.position === 'gallery')
  return hero ? [hero, ...gallery] : gallery
})

const trackRef = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
function onScroll() {
  const el = trackRef.value
  if (!el || el.clientWidth === 0) return
  activeIndex.value = Math.round(el.scrollLeft / el.clientWidth)
}
function prevSlide() {
  const el = trackRef.value
  if (!el) return
  // Wrap to the last photo when at the start, so you can browse backwards.
  // Use an instant jump (not 'smooth') so it doesn't animate all the way
  // across every photo to reach the end.
  if (activeIndex.value <= 0) {
    const last = carouselImages.value.length - 1
    el.scrollTo({ left: last * el.clientWidth, behavior: 'auto' })
    // An instant programmatic scroll doesn't reliably fire a `scroll`
    // event, so update the counter index ourselves.
    activeIndex.value = last
  } else {
    el.scrollBy({ left: -el.clientWidth, behavior: 'smooth' })
  }
}
function nextSlide() {
  const el = trackRef.value
  if (!el) return
  // Wrap to the first photo when at the end. Instant jump (not 'smooth')
  // so it doesn't animate back across every photo.
  if (activeIndex.value >= carouselImages.value.length - 1) {
    el.scrollTo({ left: 0, behavior: 'auto' })
    // Instant scroll → set the counter index ourselves (no scroll event).
    activeIndex.value = 0
  } else {
    el.scrollBy({ left: el.clientWidth, behavior: 'smooth' })
  }
}
</script>

<style scoped>
.hero-gallery {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 6px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  height: 420px;
}

.hero-gallery__main {
  grid-row: 1 / -1;
  position: relative;
  cursor: pointer;
  overflow: hidden;
}
.hero-gallery__cell { cursor: pointer; }
.hero-gallery__slide { cursor: pointer; }

.hero-gallery__hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}
.hero-gallery__main:hover .hero-gallery__hero-img {
  transform: scale(1.05);
}

/* Special-deal labels — bottom-left of the hero, matching the search card. */
.hero-gallery__labels {
  position: absolute;
  left: var(--space-md);
  bottom: var(--space-md);
  display: flex;
  gap: 6px;
  z-index: 2;
  pointer-events: none;
}
.hero-gallery__label {
  height: 36px;
  width: auto;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35));
}

/* Limited-supply sticker — bottom-right of the hero, matching the search
   card (solid black, Basis Grotesque, 13px). */
.hero-gallery__rooms-sticker {
  position: absolute;
  right: var(--space-md);
  bottom: var(--space-md);
  z-index: 2;
  pointer-events: none;
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

.hero-gallery__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-row: 1 / -1;
  gap: 6px;
}

.hero-gallery__cell {
  position: relative;
  overflow: hidden;
}

/* Map cell (deal page) — fills the lower-right grid slot, centred pin. */
.hero-gallery__cell--map {
  display: block;
  cursor: pointer;
}
.hero-gallery__map-pin {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.25));
  z-index: 2;
  pointer-events: none;
}

/* "Bekijk kaart" — solid black button, lower-right of the map tile. */
.hero-gallery__map-link {
  position: absolute;
  right: 12px;
  bottom: 12px;
  z-index: 2;
  background: var(--color-dark);
  color: #fff;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}
.hero-gallery__cell--map:hover .hero-gallery__map-link {
  background: #2b2b2b;
}

.hero-gallery__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}
.hero-gallery__cell:hover .hero-gallery__img {
  transform: scale(1.05);
}

/* Same size + style as the photo-viewer "Alle foto's" pill — but NO stroke,
   since it sits on a photo (the dark translucent fill + blur is enough). */
.hero-gallery__all-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.55);
  color: white;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(4px);
  transition: background var(--transition-fast);
}

.hero-gallery__all-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.all-btn-icon {
  font-size: 20px;
}

/* ===== Mobile carousel ===== */
.hero-gallery--mobile {
  display: block;
  position: relative;
  height: auto;
  /* Full-bleed: cancel the page container's horizontal padding
     (var(--space-lg)) so the carousel spans edge-to-edge. Negative
     margins (not 100vw) avoid the scrollbar-width horizontal overflow.
     Square corners. */
  margin-left: calc(-1 * var(--space-lg));
  margin-right: calc(-1 * var(--space-lg));
  border-radius: 0;
  overflow: hidden;
}

.hero-gallery__track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.hero-gallery__track::-webkit-scrollbar {
  display: none;
}

.hero-gallery__slide {
  flex: 0 0 100%;
  width: 100%;
  scroll-snap-align: center;
  aspect-ratio: 4 / 3;
}

.hero-gallery__slide-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* "1 / 8" photo counter pill, top-right. */
.hero-gallery__counter {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(4px);
  pointer-events: none;
}

/* Prev / next arrows — white circular buttons, vertically centred. */
.hero-gallery__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  color: #1a1a1a;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 2;
}
.hero-gallery__nav--prev { left: 10px; }
.hero-gallery__nav--next { right: 10px; }

/* All-photos button on the mobile carousel — lower-right. */
.hero-gallery__all-btn--mobile {
  position: absolute;
  bottom: 12px;
  right: 12px;
  left: auto;
  z-index: 2;
}
</style>
