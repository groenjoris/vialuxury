<template>
  <!-- Mobile: single-image swipe carousel (scroll-snap) with a photo
       counter pill. Desktop keeps the hero + 4-thumbnail grid. -->
  <div v-if="isMobile" class="hero-gallery hero-gallery--mobile">
    <div ref="trackRef" class="hero-gallery__track" @scroll.passive="onScroll">
      <div
        v-for="image in carouselImages"
        :key="image.id"
        class="hero-gallery__slide"
      >
        <img :src="image.url" :alt="localized(image.alt)" class="hero-gallery__slide-img" />
      </div>
    </div>
    <span v-if="carouselImages.length > 1" class="hero-gallery__counter">
      {{ activeIndex + 1 }} / {{ carouselImages.length }}
    </span>
  </div>

  <div v-else class="hero-gallery">
    <div class="hero-gallery__main">
      <img
        :src="heroImage?.url || '/images/placeholder.jpg'"
        :alt="heroImage?.alt ? localized(heroImage.alt) : t('common.hotelPhoto')"
        class="hero-gallery__hero-img"
      />
    </div>
    <div class="hero-gallery__grid">
      <div
        v-for="(image, index) in galleryImages"
        :key="image.id"
        class="hero-gallery__cell"
      >
        <img :src="image.url" :alt="localized(image.alt)" class="hero-gallery__img" />
        <button
          v-if="index === galleryImages.length - 1"
          class="hero-gallery__all-btn"
          @click="$emit('openGallery')"
        >
          <span class="all-btn-icon">⊞</span>
          {{ t('common.allPhotos') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HotelImage } from '~/types/hotel'
import { useFirstReleaseIsMobile } from '~/composables-first-release/useFirstReleaseIsMobile'

const { t, localized } = useFirstReleaseI18n()
const isMobile = useFirstReleaseIsMobile()

const props = defineProps<{
  images: HotelImage[]
}>()

defineEmits<{
  openGallery: []
}>()

const heroImage = computed(() => props.images.find((img) => img.position === 'hero'))
const galleryImages = computed(() => props.images.filter((img) => img.position === 'gallery').slice(0, 4))

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
}

.hero-gallery__hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
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

.hero-gallery__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.hero-gallery__all-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(4px);
}

.hero-gallery__all-btn:hover {
  background: rgba(0, 0, 0, 0.85);
}

.all-btn-icon {
  font-size: 16px;
}

/* ===== Mobile carousel ===== */
.hero-gallery--mobile {
  display: block;
  position: relative;
  height: auto;
  border-radius: var(--radius-lg);
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

/* "1 / 8" photo counter pill, bottom-right. */
.hero-gallery__counter {
  position: absolute;
  bottom: 12px;
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
</style>
