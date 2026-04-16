<template>
  <div class="hero-gallery">
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

const { t, localized } = useI18n()

const props = defineProps<{
  images: HotelImage[]
}>()

defineEmits<{
  openGallery: []
}>()

const heroImage = computed(() => props.images.find((img) => img.position === 'hero'))
const galleryImages = computed(() => props.images.filter((img) => img.position === 'gallery').slice(0, 4))
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
</style>
