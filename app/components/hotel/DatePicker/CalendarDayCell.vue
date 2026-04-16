<template>
  <button
    class="day-cell"
    :class="{
      'day-cell--sold-out': isSoldOut && !isPast,
      'day-cell--selected': isSelected,
      'day-cell--in-range': isInRange,
      'day-cell--other-month': !isCurrentMonth,
      'day-cell--past': isPast,
      'day-cell--has-upgrades': availability?.hasRoomUpgrades && availability?.available && !isPast,
    }"
    :disabled="!availability?.available || isPast"
    @click="handleClick"
  >
    <span class="day-cell__number">{{ dayOfMonth }}</span>

    <!-- Sold out: show dash -->
    <span v-if="isSoldOut && !isPast" class="day-cell__sold" :class="{ 'day-cell__sold--in-range': isInRange }">-</span>

    <!-- Check-in date: show price -->
    <span
      v-else-if="isCheckIn && availability?.available && !isPast && availability.totalPrice > 0"
      class="day-cell__price day-cell__price--selected"
    >
      {{ formatPrice(availability.totalPrice) }}
    </span>

    <!-- Normal available date (not selected, not check-out): show price -->
    <span
      v-else-if="!isSelected && !isInRange && availability?.available && !isPast && availability.totalPrice > 0"
      class="day-cell__price"
      :class="{ 'day-cell__price--cheapest': isCheapest }"
    >
      {{ formatPrice(availability.totalPrice) }}
    </span>
  </button>
</template>

<script setup lang="ts">
import type { DateAvailability } from '~/types/calendar'
import { formatPrice } from '~/utils/formatPrice'
import dayjs from 'dayjs'

const props = defineProps<{
  date: string
  dayOfMonth: number
  isCurrentMonth: boolean
  availability: DateAvailability | null
  selectedCheckIn: string | null
  selectedCheckOut: string | null
  isCheapest?: boolean
}>()

const emit = defineEmits<{
  selectDate: [date: string]
}>()

const isPast = computed(() => dayjs(props.date).isBefore(dayjs(), 'day'))

const isSoldOut = computed(() => props.availability?.soldOut === true)

const isSelected = computed(() => {
  return props.date === props.selectedCheckIn || props.date === props.selectedCheckOut
})

const isCheckIn = computed(() => props.date === props.selectedCheckIn)

const isInRange = computed(() => {
  if (!props.selectedCheckIn || !props.selectedCheckOut) return false
  const d = dayjs(props.date)
  return d.isAfter(dayjs(props.selectedCheckIn)) && d.isBefore(dayjs(props.selectedCheckOut))
})

function handleClick() {
  if (props.availability?.available && !isPast.value) {
    emit('selectDate', props.date)
  }
}
</script>

<style scoped>
.day-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 4px;
  min-height: 52px;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  background: none;
  cursor: pointer;
  position: relative;
}

.day-cell:hover:not(:disabled) {
  background: #d4f5e6;
}

/* Selected check-in / check-out dates: green */
.day-cell--selected {
  background: #00CB8B !important;
  color: white;
}

/* In-between range dates: light green */
.day-cell--in-range {
  background: #9AE3C7;
}

/* Sold out dates */
.day-cell--sold-out {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Sold out within range gets the range background */
.day-cell--sold-out.day-cell--in-range {
  opacity: 1;
}

.day-cell--past:not(.day-cell--sold-out) {
  opacity: 0.3;
  cursor: not-allowed;
}

.day-cell--other-month {
  visibility: hidden;
}

.day-cell--has-upgrades {
  box-shadow: inset 0 0 0 2px var(--color-gold);
}

.day-cell--has-upgrades.day-cell--selected {
  box-shadow: inset 0 0 0 2px var(--color-gold);
}

.day-cell__number {
  font-size: 15px;
  font-weight: 500;
}

/* Sold out dash */
.day-cell__sold {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-muted);
}

/* Sold out dash within a selected range: white */
.day-cell__sold--in-range {
  color: white;
}

/* Default price color: green */
.day-cell__price {
  font-size: 12px;
  color: #00CB8B;
  font-weight: 600;
}

/* Cheapest price: orange */
.day-cell__price--cheapest {
  color: var(--color-primary);
}

/* Selected (check-in) price: white */
.day-cell__price--selected {
  color: rgba(255, 255, 255, 0.9);
}
</style>
