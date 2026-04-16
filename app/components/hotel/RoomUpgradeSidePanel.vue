<template>
  <Teleport to="body">
    <Transition name="panel">
      <div v-if="isOpen" class="panel-overlay" @click.self="$emit('close')">
        <aside class="panel" @wheel.stop @touchmove.stop>
          <div class="panel__header">
            <h2 class="panel__title">{{ isMultiRoom ? t('room.chooseRoomType') : t('room.availableUpgradesTitle') }}</h2>
            <p class="panel__subtitle">{{ hotelName }}</p>
            <button class="panel__close" @click="$emit('close')" :aria-label="t('common.close')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Check-in / Check-out bar -->
          <div v-if="store.checkInDate" class="panel__dates">
            <div class="panel__date-item">
              <span class="panel__date-label">{{ t('common.checkIn') }}</span>
              <span class="panel__date-value">{{ formatDate(store.checkInDate) }}</span>
            </div>
            <span class="panel__date-separator">→</span>
            <div class="panel__date-item">
              <span class="panel__date-label">{{ t('common.checkOut') }}</span>
              <span class="panel__date-value">{{ formatDate(checkOutDate) }}</span>
            </div>
            <span class="panel__date-nights">{{ deal.nights }} {{ t('common.nights') }}</span>
          </div>

          <!-- Multi-room counter bar -->
          <div v-if="isMultiRoom" class="panel__room-info-bar">
            <span class="panel__room-counter">{{ totalAllocated }} {{ t('room.roomsChosenForPersons').replace('{n}', String(store.totalPersons)) }}</span>
          </div>

          <div class="panel__body">
            <!-- Base room -->
            <div
              class="room-card"
              :class="{
                'room-card--active': isMultiRoom ? (localAllocation[deal.baseRoomType.id] || 0) > 0 : store.selectedRoomId === deal.baseRoomType.id
              }"
            >
              <div v-if="deal.baseRoomType.image" class="room-card__image">
                <img :src="deal.baseRoomType.image" :alt="localized(deal.baseRoomType.name)" loading="lazy" />
              </div>
              <div class="room-card__body">
                <div class="room-card__header">
                  <h3 class="room-card__name">{{ localized(deal.baseRoomType.name) }}</h3>
                  <span class="room-card__price room-card__price--included">{{ t('common.included') }}</span>
                </div>
                <p class="room-card__desc">{{ localized(deal.baseRoomType.description) }}</p>
                <ul v-if="deal.baseRoomType.features.length" class="room-card__features">
                  <li v-for="f in deal.baseRoomType.features" :key="localized(f)">{{ localized(f) }}</li>
                </ul>
                <div v-if="isMultiRoom" class="room-card__availability">
                  {{ t('room.stillAvailable').replace('{n}', String(deal.baseRoomType.maxAvailable ?? 5)) }}
                </div>
              </div>
              <div class="room-card__action">
                <!-- Multi-room: stepper -->
                <template v-if="isMultiRoom">
                  <div class="room-card__stepper">
                    <button
                      class="stepper__btn"
                      :disabled="(localAllocation[deal.baseRoomType.id] || 0) <= 0 || totalAllocated <= minRooms"
                      @click="decrementRoom(deal.baseRoomType.id)"
                    >−</button>
                    <span class="stepper__val">{{ localAllocation[deal.baseRoomType.id] || 0 }}</span>
                    <button
                      class="stepper__btn"
                      :disabled="(localAllocation[deal.baseRoomType.id] || 0) >= (deal.baseRoomType.maxAvailable ?? 5)"
                      @click="incrementRoom(deal.baseRoomType.id)"
                    >+</button>
                  </div>
                </template>
                <!-- Single-room: select button -->
                <template v-else>
                  <button
                    v-if="store.selectedRoomId !== deal.baseRoomType.id"
                    class="btn btn-primary room-card__btn"
                    @click="selectAndClose(deal.baseRoomType.id)"
                  >
                    {{ t('room.selectRoom') }}
                  </button>
                  <div v-else class="room-card__selected">
                    <span class="room-card__selected-badge">{{ t('room.currentSelection') }}</span>
                  </div>
                </template>
              </div>
            </div>

            <!-- Upgrade rooms -->
            <div
              v-for="room in deal.roomUpgrades"
              :key="room.id"
              class="room-card"
              :class="{
                'room-card--active': isMultiRoom ? (localAllocation[room.id] || 0) > 0 : store.selectedRoomId === room.id
              }"
            >
              <div v-if="room.image" class="room-card__image">
                <img :src="room.image" :alt="localized(room.name)" loading="lazy" />
              </div>
              <div class="room-card__body">
                <div class="room-card__header">
                  <h3 class="room-card__name">{{ localized(room.name) }}</h3>
                  <span class="room-card__price">+ {{ formatPrice(room.priceExtra) }} {{ t('room.perRoom') }}</span>
                </div>
                <p class="room-card__desc">{{ localized(room.description) }}</p>
                <ul v-if="room.features.length" class="room-card__features">
                  <li v-for="f in room.features" :key="localized(f)">{{ localized(f) }}</li>
                </ul>
                <div v-if="isMultiRoom" class="room-card__availability">
                  {{ t('room.stillAvailable').replace('{n}', String(room.maxAvailable ?? 5)) }}
                </div>
              </div>
              <div class="room-card__action">
                <!-- Multi-room: stepper -->
                <template v-if="isMultiRoom">
                  <div class="room-card__stepper">
                    <button
                      class="stepper__btn"
                      :disabled="(localAllocation[room.id] || 0) <= 0 || totalAllocated <= minRooms"
                      @click="decrementRoom(room.id)"
                    >−</button>
                    <span class="stepper__val">{{ localAllocation[room.id] || 0 }}</span>
                    <button
                      class="stepper__btn"
                      :disabled="(localAllocation[room.id] || 0) >= (room.maxAvailable ?? 5)"
                      @click="incrementRoom(room.id)"
                    >+</button>
                  </div>
                </template>
                <!-- Single-room: select button -->
                <template v-else>
                  <button
                    v-if="store.selectedRoomId !== room.id"
                    class="btn btn-primary room-card__btn"
                    @click="selectAndClose(room.id)"
                  >
                    {{ t('room.selectRoom') }}
                  </button>
                  <div v-else class="room-card__selected">
                    <span class="room-card__selected-badge">{{ t('room.currentSelection') }}</span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Deal } from '~/types/deal'
import { useDealStore } from '~/stores/deal'
import { formatPrice } from '~/utils/formatPrice'

const { t, localized } = useI18n()

const props = defineProps<{
  isOpen: boolean
  deal: Deal
  hotelName: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const store = useDealStore()

// Capture mode when panel opens — don't react to live room changes
const openedAsMultiRoom = ref(false)
const isMultiRoom = computed(() => openedAsMultiRoom.value)

const checkOutDate = computed(() => {
  if (!store.checkInDate) return null
  const d = new Date(store.checkInDate)
  d.setDate(d.getDate() + props.deal.nights)
  return d.toISOString().split('T')[0]
})

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
}

// --- Single-room mode ---
function selectAndClose(roomId: string) {
  store.selectRoom(roomId)
  emit('close')
}

// --- Multi-room mode: local allocation with rebalancing ---
const localAllocation = ref<Record<string, number>>({})

const totalAllocated = computed(() => {
  return Object.values(localAllocation.value).reduce((s, n) => s + n, 0)
})

// Minimum rooms: 1 room per 1-2 persons, 2 rooms for 3-4, etc.
const minRooms = computed(() => Math.ceil(store.totalPersons / 2))

// Sync local allocation when panel opens
watch(() => props.isOpen, (open) => {
  if (open) {
    // Capture mode at open time — stays fixed for this session
    openedAsMultiRoom.value = store.travelGroup.rooms >= 2
    if (openedAsMultiRoom.value) {
      // Initialize from store or default (all base rooms)
      const alloc = { ...store.effectiveAllocation }
      localAllocation.value = alloc
    }
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Write back to store whenever local allocation changes (in multi-room mode)
watch(localAllocation, (alloc) => {
  if (!isMultiRoom.value) return
  for (const [roomId, count] of Object.entries(alloc)) {
    store.setRoomAllocationCount(roomId, count)
  }
  // Update travel group rooms if total changed
  const total = Object.values(alloc).reduce((s, n) => s + n, 0)
  if (total > 0 && total !== store.travelGroup.rooms) {
    store.setTravelGroup({ ...store.travelGroup, rooms: total })
  }
}, { deep: true })

function incrementRoom(roomId: string) {
  const current = localAllocation.value[roomId] || 0
  const roomType = store.allRoomTypes.find(r => r.id === roomId)
  const max = roomType?.maxAvailable ?? 5
  if (current >= max) return

  localAllocation.value = {
    ...localAllocation.value,
    [roomId]: current + 1,
  }
}

function decrementRoom(roomId: string) {
  const current = localAllocation.value[roomId] || 0
  if (current <= 0) return
  // Enforce minimum total rooms
  if (totalAllocated.value <= minRooms.value) return
  localAllocation.value = {
    ...localAllocation.value,
    [roomId]: current - 1,
  }
}

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* Overlay + panel */
.panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.panel {
  width: 600px;
  max-width: 95vw;
  background: var(--color-surface);
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 30px rgba(0, 0, 0, 0.15);
}

.panel__header {
  padding: var(--space-lg) var(--space-lg) var(--space-md);
  border-bottom: 1px solid var(--color-border-light);
  position: relative;
  flex-shrink: 0;
}

.panel__title {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 2px;
}

.panel__subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.panel__close {
  position: absolute;
  top: var(--space-lg);
  right: var(--space-lg);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--color-background-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-primary);
}

.panel__close:hover {
  background: var(--color-border);
}

/* Dates bar */
.panel__dates {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-background-secondary);
  flex-shrink: 0;
}

.panel__date-item {
  display: flex;
  flex-direction: column;
}

.panel__date-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.panel__date-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.panel__date-separator {
  font-size: 14px;
  color: var(--color-text-muted);
}

.panel__date-nights {
  margin-left: auto;
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* Multi-room info bar */
.panel__room-info-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-background-secondary);
  border-bottom: 1px solid var(--color-border-light);
  font-size: 13px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.panel__room-counter {
  font-weight: 600;
  color: var(--color-primary);
}

/* Scrollable body */
.panel__body {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

/* Room card */
.room-card {
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  transition: border-color var(--transition-fast);
  flex-shrink: 0;
}

.room-card:hover {
  border-color: var(--color-primary);
}

.room-card--active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.room-card__image {
  aspect-ratio: 16/9;
  overflow: hidden;
  background: var(--color-background-secondary);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.room-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.room-card__body {
  padding: var(--space-md) var(--space-lg);
}

.room-card__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}

.room-card__name {
  font-size: 16px;
  font-weight: 700;
  font-family: var(--font-heading);
}

.room-card__price {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primary);
  white-space: nowrap;
}

.room-card__price--included {
  color: var(--color-discount);
  font-size: 13px;
}

.room-card__desc {
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.room-card__features {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.room-card__features li {
  font-size: 12px;
  color: var(--color-text-muted);
  padding-left: 14px;
  position: relative;
}

.room-card__features li::before {
  content: '✓';
  position: absolute;
  left: 1px;
  font-weight: 700;
  color: var(--color-primary);
  font-size: 12px;
}

.room-card__availability {
  display: inline-block;
  margin-top: 8px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: #1a3a2a;
  border-radius: var(--radius-sm);
}

.room-card__action {
  padding: var(--space-sm) var(--space-lg) var(--space-lg);
}

.room-card__btn {
  width: 100%;
  padding: 10px;
  font-size: 14px;
}

.room-card__selected {
  text-align: center;
  padding-bottom: var(--space-sm);
}

.room-card__selected-badge {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
}

/* Multi-room stepper in room cards */
.room-card__stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
}

.room-card__stepper .stepper__btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-size: 18px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-text-primary);
  line-height: 1;
}

.room-card__stepper .stepper__btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.room-card__stepper .stepper__btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.room-card__stepper .stepper__val {
  min-width: 24px;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
}

/* Transitions */
.panel-enter-active,
.panel-leave-active {
  transition: opacity 300ms ease;
}

.panel-enter-active .panel,
.panel-leave-active .panel {
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
}

.panel-enter-from .panel,
.panel-leave-to .panel {
  transform: translateX(100%);
}
</style>
