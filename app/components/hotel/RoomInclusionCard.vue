<template>
  <div class="content-block room-inclusion">
    <!-- Single room: static image -->
    <div v-if="!isMultiRoomType && roomImage" class="content-block__image">
      <img :src="roomImage" :alt="localized(roomName)" loading="lazy" />
    </div>

    <!-- Multiple room types: carousel -->
    <div v-if="isMultiRoomType" class="content-block__carousel">
      <div class="content-block__carousel-track">
        <img
          v-for="(img, idx) in carouselImages"
          :key="idx"
          :src="img.src"
          :alt="img.alt"
          class="content-block__carousel-img"
          :class="{ 'content-block__carousel-img--active': idx === activeSlide }"
        />
      </div>
      <div v-if="carouselImages.length > 1" class="content-block__carousel-dots">
        <button
          v-for="(img, idx) in carouselImages"
          :key="idx"
          class="content-block__carousel-dot"
          :class="{ 'content-block__carousel-dot--active': idx === activeSlide }"
          @click="goToSlide(idx)"
          :aria-label="`Slide ${idx + 1}`"
        />
      </div>
    </div>

    <div class="content-block__body">
      <h3 class="content-block__title">
        <span class="content-block__check">✓</span>
        {{ overnightTitleDisplay }}
      </h3>
      <p v-if="isMultiRoomType" class="content-block__desc content-block__desc--multi">
        {{ t('room.multiRoomTypesSelected') }}
      </p>
      <p v-else-if="upgradeDescriptionText" class="content-block__desc content-block__desc--upgrade">
        {{ upgradeDescriptionText }}
      </p>
      <p v-else class="content-block__desc">{{ overnightDescDisplay }}</p>
    </div>
    <div class="room-inclusion__footer">
      <h4 class="room-inclusion__footer-heading">
        {{ t('room.youBook') }} {{ store.travelGroup.rooms }} {{ store.travelGroup.rooms === 1 ? t('room.roomFor') : t('room.roomsFor') }} {{ store.totalPersons }} {{ store.totalPersons === 1 ? t('common.personSingular') : t('common.personPlural') }}.
      </h4>
      <button
        type="button"
        class="room-inclusion__footer-action"
        @click="store.openTravelGroupModal()"
      >
        {{ t('room.editTravelGroup') }}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Deal } from '~/types/deal'
import { useDealStore } from '~/stores/deal'

const { t, localized } = useI18n()

const props = defineProps<{
  deal: Deal
}>()

const store = useDealStore()

const selectedRoom = computed(() => store.selectedRoom ?? props.deal.baseRoomType)
const roomImage = computed(() => selectedRoom.value.image)
const roomName = computed(() => selectedRoom.value.name)

/** Check if multiple different room types are allocated */
const isMultiRoomType = computed(() => {
  if (!store.isRoomAllocationActive) return false
  const activeTypes = Object.entries(store.effectiveAllocation).filter(([, count]) => count > 0)
  return activeTypes.length > 1
})

/** Collect all room images for carousel */
const carouselImages = computed(() => {
  if (!isMultiRoomType.value) return []
  const images: { src: string; alt: string }[] = []
  for (const [roomId, count] of Object.entries(store.effectiveAllocation)) {
    if (count <= 0) continue
    const room = store.allRoomTypes.find(r => r.id === roomId)
    if (room?.image) {
      images.push({ src: room.image, alt: localized(room.name) })
    }
  }
  return images
})

// Carousel auto-rotation
const activeSlide = ref(0)
let carouselTimer: ReturnType<typeof setInterval> | null = null

function goToSlide(idx: number) {
  activeSlide.value = idx
  resetTimer()
}

function resetTimer() {
  if (carouselTimer) clearInterval(carouselTimer)
  if (carouselImages.value.length > 1) {
    carouselTimer = setInterval(() => {
      activeSlide.value = (activeSlide.value + 1) % carouselImages.value.length
    }, 3000)
  }
}

watch(isMultiRoomType, (val) => {
  if (val) {
    activeSlide.value = 0
    resetTimer()
  } else {
    if (carouselTimer) clearInterval(carouselTimer)
  }
}, { immediate: true })

onMounted(() => {
  if (isMultiRoomType.value) resetTimer()
})

onUnmounted(() => {
  if (carouselTimer) clearInterval(carouselTimer)
})

const overnightTitleDisplay = computed(() => {
  const inc = props.deal.inclusions.find((i) => i.id.startsWith('inc-overnight'))
  return inc ? localized(inc.title) : `${props.deal.nights}x Overnachting`
})

const overnightDescDisplay = computed(() => {
  const inc = props.deal.inclusions.find((i) => i.id.startsWith('inc-overnight'))
  return inc ? localized(inc.description) : localized(selectedRoom.value.description)
})

/** Show upgrade description when a paid upgrade is selected */
const upgradeDescriptionText = computed(() => {
  if (isMultiRoomType.value) return null
  if (selectedRoom.value.isDefault) return null
  if (!selectedRoom.value.upgradeDescription) return null
  return localized(selectedRoom.value.upgradeDescription)
})
</script>

<style scoped>
.room-inclusion {
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border-light);
  display: flex;
  flex-direction: column;
}

.content-block__image {
  aspect-ratio: 16/10;
  overflow: hidden;
  background: var(--color-background-secondary);
}

.content-block__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Carousel */
.content-block__carousel {
  position: relative;
  aspect-ratio: 16/10;
  overflow: hidden;
  background: var(--color-background-secondary);
}

.content-block__carousel-track {
  position: relative;
  width: 100%;
  height: 100%;
}

.content-block__carousel-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.6s ease;
}

.content-block__carousel-img--active {
  opacity: 1;
}

.content-block__carousel-dots {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 2;
}

.content-block__carousel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 0;
  transition: background 0.2s ease;
}

.content-block__carousel-dot--active {
  background: #fff;
}

.content-block__carousel-dot:hover {
  background: rgba(255, 255, 255, 0.8);
}

.content-block__body {
  padding: var(--space-md) var(--space-lg) var(--space-lg);
  flex: 1;
}

.content-block__title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--space-sm);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.content-block__check {
  color: var(--color-discount);
  font-weight: 700;
}

.content-block__desc {
  font-size: 14px;
  line-height: 1.65;
  color: var(--color-text-secondary);
}

.content-block__desc--upgrade {
  color: var(--color-text-primary);
}

.content-block__desc--multi {
  color: var(--color-text-primary);
}

.room-inclusion__footer {
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-border-light);
  background: var(--color-background-secondary);
}

.room-inclusion__footer-heading {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

.room-inclusion__footer-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.room-inclusion__footer-action:hover {
  opacity: 0.85;
}

.room-inclusion__footer-action svg {
  flex-shrink: 0;
}
</style>
