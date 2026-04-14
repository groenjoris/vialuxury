<template>
  <section class="configurator">
    <h3 class="configurator__title">Stel je verblijf samen</h3>

    <!-- Nights -->
    <div class="config-row">
      <label class="config-label">Aantal nachten</label>
      <div class="stepper">
        <button
          class="stepper__btn"
          :disabled="store.configuration.nights <= arrangement.minNights"
          @click="store.setNights(store.configuration.nights - 1)"
        >
          −
        </button>
        <span class="stepper__value">{{ store.configuration.nights }}</span>
        <button
          class="stepper__btn"
          :disabled="store.configuration.nights >= arrangement.maxNights"
          @click="store.setNights(store.configuration.nights + 1)"
        >
          +
        </button>
      </div>
    </div>

    <!-- Persons -->
    <div class="config-row">
      <label class="config-label">Aantal personen</label>
      <div class="stepper">
        <button
          class="stepper__btn"
          :disabled="store.configuration.persons <= arrangement.minPersons"
          @click="store.setPersons(store.configuration.persons - 1)"
        >
          −
        </button>
        <span class="stepper__value">{{ store.configuration.persons }}</span>
        <button
          class="stepper__btn"
          :disabled="store.configuration.persons >= arrangement.maxPersons"
          @click="store.setPersons(store.configuration.persons + 1)"
        >
          +
        </button>
      </div>
    </div>

    <!-- Room Type -->
    <div class="config-section">
      <label class="config-label">Kamertype</label>
      <div class="room-options">
        <label
          v-for="room in arrangement.roomTypes"
          :key="room.id"
          class="room-option"
          :class="{ 'room-option--selected': store.configuration.roomTypeId === room.id }"
        >
          <input
            type="radio"
            :value="room.id"
            :checked="store.configuration.roomTypeId === room.id"
            name="room-type"
            class="sr-only"
            @change="store.setRoomType(room.id)"
          />
          <div class="room-option__content">
            <span class="room-option__name">{{ room.name }}</span>
            <span class="room-option__price">
              {{ room.pricePerNight === 0 ? 'Inbegrepen' : `+${formatPrice(room.pricePerNight)}/nacht` }}
            </span>
          </div>
          <span class="room-option__desc">{{ room.description }}</span>
        </label>
      </div>
    </div>

    <!-- Extras -->
    <div v-if="arrangement.configurableExtras.length > 0" class="config-section">
      <label class="config-label">Extra's toevoegen</label>
      <div class="extras-list">
        <label
          v-for="extra in arrangement.configurableExtras"
          :key="extra.id"
          class="extra-option"
          :class="{ 'extra-option--selected': store.configuration.selectedExtras.includes(extra.id) }"
        >
          <input
            type="checkbox"
            :checked="store.configuration.selectedExtras.includes(extra.id)"
            class="sr-only"
            @change="store.toggleExtra(extra.id)"
          />
          <div class="extra-option__check">
            <span v-if="store.configuration.selectedExtras.includes(extra.id)">✓</span>
          </div>
          <div class="extra-option__content">
            <span class="extra-option__name">{{ extra.title }}</span>
            <span class="extra-option__desc">{{ extra.description }}</span>
          </div>
          <span class="extra-option__price">
            +{{ formatPrice(extra.pricePerUnit) }}
            <span class="extra-option__basis">{{ pricingBasisLabel(extra.pricingBasis) }}</span>
          </span>
        </label>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Arrangement } from '~/types/booking'
import { useBookingStore } from '~/stores/booking'
import { formatPrice } from '~/utils/formatPrice'

defineProps<{
  arrangement: Arrangement
}>()

const store = useBookingStore()

function pricingBasisLabel(basis: string): string {
  switch (basis) {
    case 'per_night': return '/nacht'
    case 'per_person': return '/p.p.'
    case 'per_person_per_night': return '/p.p./nacht'
    case 'flat': return ''
    default: return ''
  }
}
</script>

<style scoped>
.configurator {
  background: var(--color-background-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin: var(--space-lg) 0;
}

.configurator__title {
  font-size: 20px;
  margin-bottom: var(--space-lg);
}

.config-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.config-label {
  font-weight: 600;
  font-size: 15px;
}

.config-section {
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.config-section:last-child {
  border-bottom: none;
}

.config-section .config-label {
  display: block;
  margin-bottom: var(--space-md);
}

/* Stepper */
.stepper {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.stepper__btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
}

.stepper__btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.stepper__btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.stepper__value {
  font-size: 18px;
  font-weight: 700;
  min-width: 30px;
  text-align: center;
}

/* Room Options */
.room-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.room-option {
  display: flex;
  flex-direction: column;
  padding: var(--space-md);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.room-option:hover {
  border-color: var(--color-primary);
}

.room-option--selected {
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.room-option__content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-option__name {
  font-weight: 600;
  font-size: 15px;
}

.room-option__price {
  font-size: 14px;
  color: var(--color-primary);
  font-weight: 600;
}

.room-option__desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: var(--space-xs);
}

/* Extras */
.extras-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.extra-option {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-md);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.extra-option:hover {
  border-color: var(--color-primary);
}

.extra-option--selected {
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.extra-option__check {
  width: 22px;
  height: 22px;
  border-radius: var(--radius-xs);
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
  color: white;
  margin-top: 1px;
}

.extra-option--selected .extra-option__check {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.extra-option__content {
  flex: 1;
}

.extra-option__name {
  font-weight: 600;
  font-size: 15px;
  display: block;
}

.extra-option__desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 2px;
  display: block;
}

.extra-option__price {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-primary);
  white-space: nowrap;
}

.extra-option__basis {
  font-weight: 400;
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
