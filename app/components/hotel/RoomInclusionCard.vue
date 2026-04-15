<template>
  <div class="content-block room-inclusion">
    <div v-if="roomImage" class="content-block__image">
      <img :src="roomImage" :alt="localized(roomName)" loading="lazy" />
    </div>
    <div class="content-block__body">
      <h3 class="content-block__title">
        <span class="content-block__check">✓</span>
        {{ overnightTitleDisplay }}
      </h3>
      <p v-if="upgradeDescriptionText" class="content-block__desc content-block__desc--upgrade">
        {{ upgradeDescriptionText }}
      </p>
      <p v-else class="content-block__desc">{{ overnightDescDisplay }}</p>
    </div>
    <div class="room-inclusion__footer">
      <p class="room-inclusion__footer-text">
        {{ t('room.youBook') }} {{ store.travelGroup.rooms }} {{ store.travelGroup.rooms === 1 ? t('room.roomFor') : t('room.roomsFor') }} {{ store.totalPersons }} {{ store.totalPersons === 1 ? t('common.personSingular') : t('common.personPlural') }}.
      </p>
      <button
        type="button"
        class="room-inclusion__footer-link"
        @click="store.openTravelGroupModal()"
      >
        {{ t('room.editTravelGroup') }}
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
  font-style: italic;
}

.room-inclusion__footer {
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-border-light);
}

.room-inclusion__footer-text {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.room-inclusion__footer-link {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-size: 14px;
  color: var(--color-text-secondary);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.room-inclusion__footer-link:hover {
  color: var(--color-primary);
}
</style>
