<template>
  <aside class="sidebar">
    <div class="sidebar__card">
      <!-- Price Section -->
      <div class="sidebar__price-section">
        <div class="sidebar__price-line">
          <span class="discount-badge">-{{ store.currentDeal?.discountPercentage }}%</span>
          <span class="price-current">{{ formatPrice(store.pricing.totalPrice) }}</span>
          <span class="price-original">{{ formatPrice(store.pricing.originalPrice) }}</span>
        </div>
        <div class="sidebar__price-per-person">
          {{ formatPrice(store.pricing.pricePerPerson) }} {{ t('common.perPerson') }}
        </div>
      </div>

      <!-- Travel Group Trigger -->
      <div class="sidebar__travel-group">
        <button class="sidebar__travel-btn" @click="store.openTravelGroupModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          <span>{{ store.travelGroupSummary }}</span>
          <span class="sidebar__travel-edit">{{ t('common.edit') }}</span>
        </button>
      </div>

      <!-- Dates -->
      <div class="sidebar__dates">
        <div class="sidebar__date-col">
          <span class="date-label">{{ t('common.checkIn') }}</span>
          <span class="date-value">{{ store.formattedCheckIn || t('common.chooseDate') }}</span>
        </div>
        <div class="sidebar__date-divider"></div>
        <div class="sidebar__date-col">
          <span class="date-label">{{ t('common.checkOut') }}</span>
          <span class="date-value">{{ store.formattedCheckOut || t('common.chooseDate') }}</span>
        </div>
      </div>

      <!-- Room allocation (multi-room with date) -->
      <div v-if="store.isRoomAllocationActive" class="sidebar__room-allocation">
        <div class="sidebar__room-alloc-header">
          <h4 class="sidebar__room-alloc-title">{{ t('room.allocateRooms') }}</h4>
          <span class="sidebar__room-alloc-counter">
            {{ allocatedCount }} / {{ store.travelGroup.rooms }} {{ t('room.roomsAllocated') }}
          </span>
        </div>
        <div
          v-for="roomType in store.allRoomTypes"
          :key="roomType.id"
          class="sidebar__room-alloc-row"
        >
          <div class="sidebar__room-alloc-info">
            <span class="sidebar__room-alloc-name">{{ localized(roomType.name) }}</span>
            <span class="sidebar__room-alloc-price">
              <template v-if="roomType.priceExtra > 0">+{{ formatPrice(roomType.priceExtra) }} {{ t('room.perRoom') }}</template>
              <template v-else>{{ t('room.included') }}</template>
            </span>
            <span v-if="roomType.maxAvailable" class="sidebar__room-alloc-max">
              {{ t('room.maxAvailable').replace('{n}', String(roomType.maxAvailable)) }}
            </span>
          </div>
          <div class="stepper stepper--small">
            <button
              class="stepper__btn"
              :disabled="(store.effectiveAllocation[roomType.id] || 0) <= 0"
              @click="decrementRoom(roomType.id)"
            >−</button>
            <span class="stepper__val">{{ store.effectiveAllocation[roomType.id] || 0 }}</span>
            <button
              class="stepper__btn"
              :disabled="allocatedCount >= store.travelGroup.rooms || (store.effectiveAllocation[roomType.id] || 0) >= (roomType.maxAvailable ?? 5)"
              @click="incrementRoom(roomType.id)"
            >+</button>
          </div>
        </div>
      </div>

      <!-- Room upgrade indicator (single room mode) -->
      <div v-else-if="store.selectedRoom && !store.selectedRoom.isDefault" class="sidebar__room-upgrade">
        <span class="sidebar__room-icon">🏨</span>
        <span>{{ localized(store.selectedRoom.name) }}</span>
        <span class="sidebar__room-price">+ {{ formatPrice(store.roomUpgradeCost) }}</span>
      </div>

      <!-- Cancellation -->
      <div class="sidebar__cancel">
        {{ t('common.freeCancel') }}
      </div>

      <!-- CTA -->
      <button class="btn btn-primary sidebar__cta" :disabled="!store.isBookingReady">
        {{ t('common.bookNow') }}
      </button>

      <!-- Trust -->
      <div class="sidebar__trust">
        <div class="trust-badge">
          <div class="trust-logo">★★★★★</div>
          <span class="trust-text">{{ t('trust.reviews') }}</span>
        </div>
        <ul class="trust-list">
          <li class="trust-item">
            <span class="trust-check">✓</span>
            {{ t('trust.flexibleCancel') }}
          </li>
          <li class="trust-item">
            <span class="trust-check">✓</span>
            {{ t('trust.directDiscount') }}
          </li>
          <li class="trust-item">
            <span class="trust-check">✓</span>
            {{ t('trust.memberDeals') }}
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useDealStore } from '~/stores/deal'
import { formatPrice } from '~/utils/formatPrice'

const { t, localized } = useI18n()
const store = useDealStore()

const allocatedCount = computed(() => {
  return Object.values(store.effectiveAllocation).reduce((s, n) => s + n, 0)
})

function incrementRoom(roomId: string) {
  const current = store.effectiveAllocation[roomId] || 0
  const roomType = store.allRoomTypes.find(r => r.id === roomId)
  const max = roomType?.maxAvailable ?? 5
  if (current >= max) return
  if (allocatedCount.value >= store.travelGroup.rooms) return
  store.setRoomAllocationCount(roomId, current + 1)
}

function decrementRoom(roomId: string) {
  const current = store.effectiveAllocation[roomId] || 0
  if (current <= 0) return
  store.setRoomAllocationCount(roomId, current - 1)
}
</script>

<style scoped>
.sidebar {
  position: sticky;
  top: 20px;
  align-self: start;
}

.sidebar__card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sidebar);
  overflow: hidden;
}

/* Price */
.sidebar__price-section {
  padding: var(--space-lg);
  padding-bottom: var(--space-sm);
}

.sidebar__price-line {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
}

.discount-badge {
  background: var(--color-discount-light);
  color: var(--color-discount);
  font-weight: 700;
  font-size: 14px;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.price-current {
  font-size: 28px;
  font-weight: 700;
  font-family: var(--font-heading);
}

.price-original {
  font-size: 16px;
  color: var(--color-text-muted);
  text-decoration: line-through;
}

.sidebar__price-per-person {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

/* Travel group */
.sidebar__travel-group {
  padding: var(--space-sm) var(--space-lg);
}

.sidebar__travel-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text-primary);
  width: 100%;
  transition: all var(--transition-fast);
}

.sidebar__travel-btn:hover {
  border-color: var(--color-primary);
}

.sidebar__travel-btn svg {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.sidebar__travel-edit {
  margin-left: auto;
  color: var(--color-primary);
  font-weight: 600;
  font-size: 13px;
}

/* Dates */
.sidebar__dates {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin: var(--space-sm) var(--space-lg) var(--space-md);
}

.sidebar__date-col {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar__date-divider {
  width: 1px;
  background: var(--color-border);
}

.date-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.date-value {
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* Room allocation (multi-room) */
.sidebar__room-allocation {
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-border-light);
}

.sidebar__room-alloc-header {
  margin-bottom: var(--space-md);
}

.sidebar__room-alloc-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.sidebar__room-alloc-counter {
  font-size: 12px;
  color: var(--color-text-muted);
}

.sidebar__room-alloc-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) 0;
  border-top: 1px solid var(--color-border-light);
}

.sidebar__room-alloc-row:first-of-type {
  border-top: none;
}

.sidebar__room-alloc-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.sidebar__room-alloc-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__room-alloc-price {
  font-size: 12px;
  color: var(--color-primary);
  font-weight: 600;
}

.sidebar__room-alloc-max {
  font-size: 11px;
  color: var(--color-text-muted);
  font-style: italic;
}

/* Small stepper for sidebar */
.stepper--small {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.stepper--small .stepper__btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-text-primary);
  line-height: 1;
}

.stepper--small .stepper__btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.stepper--small .stepper__btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.stepper--small .stepper__val {
  min-width: 18px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
}

/* Room upgrade */
.sidebar__room-upgrade {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  font-size: 13px;
  color: var(--color-text-secondary);
}

.sidebar__room-icon {
  font-size: 14px;
}

.sidebar__room-price {
  margin-left: auto;
  font-weight: 600;
  color: var(--color-primary);
}

/* Cancellation */
.sidebar__cancel {
  text-align: center;
  font-size: 14px;
  color: var(--color-text-secondary);
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-background-secondary);
}

/* CTA */
.sidebar__cta {
  margin: var(--space-md) var(--space-lg);
  width: calc(100% - var(--space-lg) * 2);
  padding: 14px;
  font-size: 17px;
}

.sidebar__cta:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Trust */
.sidebar__trust {
  padding: var(--space-lg);
  border-top: 1px solid var(--color-border-light);
}

.trust-badge {
  text-align: center;
  margin-bottom: var(--space-md);
}

.trust-logo {
  color: var(--color-primary);
  font-size: 16px;
}

.trust-text {
  font-size: 13px;
  color: var(--color-text-muted);
}

.trust-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.trust-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 13px;
  color: var(--color-text-secondary);
}

.trust-check {
  color: var(--color-discount);
  font-weight: 700;
  flex-shrink: 0;
}
</style>
