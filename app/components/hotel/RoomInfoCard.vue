<template>
  <div class="room-info-card">
    <!-- Upgrade ribbon -->
    <div v-if="showUpgradeLabel" class="room-info-card__ribbon">
      <span>{{ t('common.upgrade') }}</span>
    </div>

    <div class="room-info-card__body">
      <span class="room-info-card__eyebrow">{{ store.travelGroup.rooms > 1 ? t('room.yourRooms') : t('room.yourRoom') }}</span>
      <h3 class="room-info-card__name">{{ localized(selectedRoom.name) }}</h3>
      <p class="room-info-card__desc">{{ localized(selectedRoom.description) }}</p>
      <ul v-if="selectedRoom.features.length" class="room-info-card__amenities">
        <li v-for="feature in selectedRoom.features" :key="localized(feature)">{{ localized(feature) }}</li>
      </ul>
    </div>

    <div class="room-info-card__cta-group">
      <div class="room-info-card__cta">
        <!-- State A: no date selected -->
        <template v-if="!store.checkInDate">
          <h4 class="room-info-card__cta-heading">{{ t('room.moreLuxury') }}</h4>
          <p class="room-info-card__cta-text">
            {{ t('room.enterDate') }}
          </p>
        </template>

        <!-- State B: date selected, base/default room -->
        <template v-else-if="selectedRoom.isDefault">
          <h4 class="room-info-card__cta-heading">{{ t('room.moreLuxury') }}</h4>
          <button
            type="button"
            class="room-info-card__cta-action"
            @click="emit('open-upgrades')"
          >
            {{ t('room.viewUpgrades') }} {{ deal.roomUpgrades.length }} {{ t('room.availableUpgrades') }}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </template>

        <!-- State C: paid upgrade selected -->
        <template v-else>
          <h4 class="room-info-card__cta-heading">
            {{ t('room.paidUpgradeSelected') }}
            <span class="room-info-card__cta-price">(+{{ formatPrice(selectedRoom.priceExtra) }})</span>
          </h4>
          <button
            type="button"
            class="room-info-card__cta-undo"
            @click="store.selectRoom(deal.baseRoomType.id)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {{ t('room.undo') }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Deal } from '~/types/deal'
import { useDealStore } from '~/stores/deal'
import { formatPrice } from '~/utils/formatPrice'

const { t, localized } = useI18n()

const props = defineProps<{
  deal: Deal
}>()

const emit = defineEmits<{
  'open-upgrades': []
}>()

const store = useDealStore()

const selectedRoom = computed(() => store.selectedRoom ?? props.deal.baseRoomType)

/** Show upgrade label when base room is an upgrade OR a paid upgrade is selected */
const showUpgradeLabel = computed(() => {
  return selectedRoom.value.isUpgrade || !selectedRoom.value.isDefault
})
</script>

<style scoped>
.room-info-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.room-info-card__ribbon {
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

.room-info-card__ribbon span {
  position: absolute;
  display: block;
  width: 150px;
  padding: 6px 0;
  background: linear-gradient(135deg, #c5a254, #e4c777);
  color: #3a2e0f;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-align: center;
  transform: rotate(45deg);
  top: 22px;
  right: -38px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.room-info-card__body {
  padding: var(--space-lg);
  flex: 1;
}

.room-info-card__eyebrow {
  display: block;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.room-info-card__name {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.25;
  color: var(--color-text-primary);
  margin-bottom: var(--space-sm);
}

.room-info-card__desc {
  font-size: 14px;
  line-height: 1.65;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
}

.room-info-card__amenities {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.room-info-card__amenities li {
  font-size: 13px;
  color: var(--color-text-secondary);
  padding-left: 16px;
  position: relative;
}

.room-info-card__amenities li::before {
  content: '✓';
  position: absolute;
  left: 2px;
  color: var(--color-primary);
  font-weight: 700;
  font-size: 13px;
}

/* CTA group */
.room-info-card__cta-group {
  border-top: 1px solid var(--color-border-light);
  background: var(--color-background-secondary);
}

.room-info-card__cta {
  padding: var(--space-md) var(--space-lg);
}

.room-info-card__cta-heading {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

.room-info-card__cta-price {
  color: var(--color-primary);
  font-weight: 700;
}

.room-info-card__cta-text {
  font-size: 14px;
  line-height: 1.55;
  color: var(--color-text-secondary);
}

.room-info-card__cta-action {
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

.room-info-card__cta-action:hover {
  opacity: 0.85;
}

.room-info-card__cta-action svg {
  flex-shrink: 0;
}

.room-info-card__cta-undo {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.room-info-card__cta-undo:hover {
  color: var(--color-text-primary);
}

.room-info-card__cta-undo svg {
  flex-shrink: 0;
}
</style>
