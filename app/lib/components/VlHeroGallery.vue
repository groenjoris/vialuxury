<template>
  <!-- Mobile: single-image swipe carousel (scroll-snap) with a photo
       counter pill + prev/next arrows. Desktop keeps the hero + 4-thumbnail
       grid. Variant is chosen by the `mobile` prop when set, otherwise by a
       CSS media query at 800px (both layouts are rendered; CSS hides one). -->
  <div class="vl-hero-gallery-wrap" :class="rootClass">
    <!-- ───────── Mobile carousel ───────── -->
    <div class="vl-hero-gallery vl-hero-gallery--mobile">
      <div ref="trackRef" class="vl-hero-gallery__track" @scroll.passive="onScroll">
        <div
          v-for="(image, i) in images"
          :key="i"
          class="vl-hero-gallery__slide"
          @click="$emit('openPhoto', i)"
        >
          <img :src="image.url" :alt="image.alt || ''" class="vl-hero-gallery__slide-img" />
        </div>
      </div>

      <button
        v-if="images.length > 1"
        type="button"
        class="vl-hero-gallery__nav vl-hero-gallery__nav--prev"
        aria-label="Vorige foto"
        @click="prevSlide"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <button
        v-if="images.length > 1"
        type="button"
        class="vl-hero-gallery__nav vl-hero-gallery__nav--next"
        aria-label="Volgende foto"
        @click="nextSlide"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
      </button>

      <span v-if="images.length > 1" class="vl-hero-gallery__counter">
        {{ activeIndex + 1 }} / {{ images.length }}
      </span>

      <button
        type="button"
        class="vl-hero-gallery__all-btn vl-hero-gallery__all-btn--mobile"
        @click="$emit('openGallery')"
      >
        <span class="vl-hero-gallery__all-icon">⊞</span>
        Alle foto's
      </button>
    </div>

    <!-- ───────── Desktop grid ───────── -->
    <div class="vl-hero-gallery vl-hero-gallery--desktop">
      <div class="vl-hero-gallery__main" @click="$emit('openPhoto', 0)">
        <img
          :src="heroImage?.url || ''"
          :alt="heroImage?.alt || ''"
          class="vl-hero-gallery__hero-img"
        />
      </div>
      <div class="vl-hero-gallery__grid">
        <div
          v-for="(image, index) in thumbnailImages"
          :key="index"
          class="vl-hero-gallery__cell"
          @click="$emit('openPhoto', index + 1)"
        >
          <img :src="image.url" :alt="image.alt || ''" class="vl-hero-gallery__img" />
          <button
            v-if="index === thumbnailImages.length - 1"
            type="button"
            class="vl-hero-gallery__all-btn"
            @click.stop="$emit('openGallery')"
          >
            <span class="vl-hero-gallery__all-icon">⊞</span>
            Alle foto's
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface GalleryImage {
  url: string
  alt?: string
}

const props = withDefaults(
  defineProps<{
    /** Ordered photos. First is the hero (large, left); the next 4 fill the thumbnail grid. */
    images: GalleryImage[]
    /** Force the mobile carousel layout. When omitted, a CSS media query at 800px decides. */
    mobile?: boolean
  }>(),
  {
    mobile: undefined,
  },
)

defineEmits<{
  openGallery: []
  /** Open the full-photo viewer at this index (hero is index 0). */
  openPhoto: [index: number]
}>()

/** When `mobile` is explicitly set, force one layout via a class. Otherwise
 *  leave both rendered and let the media query show/hide. */
const rootClass = computed(() => {
  if (props.mobile === true) return 'vl-hero-gallery-wrap--force-mobile'
  if (props.mobile === false) return 'vl-hero-gallery-wrap--force-desktop'
  return ''
})

const heroImage = computed(() => props.images[0])
const thumbnailImages = computed(() => props.images.slice(1, 5))

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
  if (activeIndex.value <= 0) {
    const last = props.images.length - 1
    el.scrollTo({ left: last * el.clientWidth, behavior: 'auto' })
    activeIndex.value = last
  } else {
    el.scrollBy({ left: -el.clientWidth, behavior: 'smooth' })
  }
}
function nextSlide() {
  const el = trackRef.value
  if (!el) return
  if (activeIndex.value >= props.images.length - 1) {
    el.scrollTo({ left: 0, behavior: 'auto' })
    activeIndex.value = 0
  } else {
    el.scrollBy({ left: el.clientWidth, behavior: 'smooth' })
  }
}
</script>

<style scoped>
/* ───────── Layout switching ─────────
   Default (no `mobile` prop): media query at 800px decides which child
   renders. `--force-*` classes override that for an explicit prop. */
.vl-hero-gallery--mobile { display: none; }
.vl-hero-gallery--desktop { display: grid; }

@media (max-width: 800px) {
  .vl-hero-gallery--mobile { display: block; }
  .vl-hero-gallery--desktop { display: none; }
}

.vl-hero-gallery-wrap--force-mobile .vl-hero-gallery--mobile { display: block; }
.vl-hero-gallery-wrap--force-mobile .vl-hero-gallery--desktop { display: none; }
.vl-hero-gallery-wrap--force-desktop .vl-hero-gallery--mobile { display: none; }
.vl-hero-gallery-wrap--force-desktop .vl-hero-gallery--desktop { display: grid; }

/* ───────── Desktop grid ───────── */
.vl-hero-gallery--desktop {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 6px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  height: 420px;
}

.vl-hero-gallery__main {
  grid-row: 1 / -1;
  position: relative;
  cursor: pointer;
  overflow: hidden;
}

.vl-hero-gallery__hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}
.vl-hero-gallery__main:hover .vl-hero-gallery__hero-img {
  transform: scale(1.05);
}

.vl-hero-gallery__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-row: 1 / -1;
  gap: 6px;
}

.vl-hero-gallery__cell {
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.vl-hero-gallery__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}
.vl-hero-gallery__cell:hover .vl-hero-gallery__img {
  transform: scale(1.05);
}

.vl-hero-gallery__all-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  border: none;
  background: rgba(0, 0, 0, 0.55);
  color: white;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: background var(--transition-fast);
}
.vl-hero-gallery__all-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}
.vl-hero-gallery__all-icon {
  font-size: 20px;
}

/* ───────── Mobile carousel ───────── */
.vl-hero-gallery--mobile {
  position: relative;
  height: auto;
  overflow: hidden;
  border-radius: var(--radius-lg);
}

.vl-hero-gallery__track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.vl-hero-gallery__track::-webkit-scrollbar {
  display: none;
}

.vl-hero-gallery__slide {
  flex: 0 0 100%;
  width: 100%;
  scroll-snap-align: center;
  aspect-ratio: 4 / 3;
  cursor: pointer;
}

.vl-hero-gallery__slide-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.vl-hero-gallery__counter {
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

.vl-hero-gallery__nav {
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
.vl-hero-gallery__nav--prev { left: 10px; }
.vl-hero-gallery__nav--next { right: 10px; }

.vl-hero-gallery__all-btn--mobile {
  position: absolute;
  bottom: 12px;
  right: 12px;
  left: auto;
  z-index: 2;
}
</style>
