<template>
  <div class="room-info-card">
    <!-- Upgrade ribbon — shown on all room cards (free or paid upgrade) -->
    <div class="room-info-card__ribbon">
      <span>{{ t('common.upgrade') }}</span>
    </div>

    <div class="room-info-card__body">
      <span class="room-info-card__eyebrow">{{ count > 1 ? t('room.yourRooms') : t('room.yourRoom') }}</span>
      <h3 class="room-info-card__name">
        <template v-if="count > 1">{{ count }}x </template>{{ localized(room.name) }}
      </h3>
      <p class="room-info-card__desc">{{ localized(room.description) }}</p>
      <ul v-if="room.features.length" class="room-info-card__amenities">
        <li v-for="feature in displayFeatures" :key="localized(feature)">{{ localized(feature) }}</li>
      </ul>
    </div>

    <!-- CTA: "Meer luxe?" only on first card when no paid upgrades selected globally -->
    <div v-if="isFirst && !isPaidRoom && !hasAnyPaidUpgrade" class="room-info-card__cta-group">
      <div class="room-info-card__cta">
        <!-- State A: no date selected -->
        <template v-if="!store.checkInDate">
          <h4 class="room-info-card__cta-heading">{{ t('room.moreLuxury') }}</h4>
          <p class="room-info-card__cta-text">
            {{ t('room.enterDate') }}
          </p>
        </template>

        <!-- State B: date selected, only default rooms -->
        <template v-else-if="!hasAnyPaidUpgrade">
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
      </div>
    </div>

    <!-- CTA: "Betaalde upgrade geselecteerd" on each paid room card -->
    <div v-if="isPaidRoom" class="room-info-card__cta-group">
      <div class="room-info-card__cta">
        <h4 class="room-info-card__cta-heading">
          {{ t('room.paidUpgradesSelected') }}
        </h4>
        <button
          type="button"
          class="room-info-card__cta-action"
          @click="emit('open-upgrades')"
        >
          {{ t('room.changeRoomChoice') }}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Deal, RoomOption } from '~/types/deal'
import { useNorthstarDealStore } from '~/stores-northstar/deal'

const { t, localized } = useNorthstarI18n()

const props = defineProps<{
  room: RoomOption
  count: number
  isFirst: boolean
  deal: Deal
}>()

const emit = defineEmits<{
  'open-upgrades': []
}>()

const store = useNorthstarDealStore()

/** Whether THIS specific room is a paid upgrade */
const isPaidRoom = computed(() => props.room.priceExtra > 0)

const displayFeatures = computed(() => {
  const features = props.room.features
  if (props.count > 1 && features.length > 4) {
    return features.slice(0, 4)
  }
  return features
})

/** Whether ANY paid upgrade is selected (across all room types) */
const hasAnyPaidUpgrade = computed(() => {
  if (store.isRoomAllocationActive) {
    for (const [roomId, count] of Object.entries(store.effectiveAllocation)) {
      if (count <= 0) continue
      const room = store.allRoomTypes.find(r => r.id === roomId)
      if (room && room.priceExtra > 0) return true
    }
    return false
  }
  return !props.room.isDefault
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
  top: 12px;
  right: 12px;
  z-index: 1;
}

.room-info-card__ribbon span {
  display: inline-block;
  padding: 4px 14px;
  background: var(--color-discount);
  color: #fff;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-radius: 999px;
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
  color: var(--color-discount);
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
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 6px;
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
</style>
