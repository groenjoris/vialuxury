<template>
  <button
    class="day-cell"
    :class="{
      'day-cell--unavailable': !availability?.available,
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
    <span v-if="availability?.available && !isPast && availability.totalPrice > 0" class="day-cell__price">
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
}>()

const emit = defineEmits<{
  selectDate: [date: string]
}>()

const isPast = computed(() => dayjs(props.date).isBefore(dayjs(), 'day'))

const isSelected = computed(() => {
  return props.date === props.selectedCheckIn || props.date === props.selectedCheckOut
})

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
}

.day-cell:hover:not(:disabled) {
  background: var(--color-primary-light);
}

.day-cell--selected {
  background: var(--color-primary) !important;
  color: white;
}

.day-cell--selected .day-cell__price {
  color: rgba(255, 255, 255, 0.9);
}

.day-cell--in-range {
  background: var(--color-primary-light);
}

.day-cell--unavailable,
.day-cell--past {
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

.day-cell__price {
  font-size: 12px;
  color: var(--color-primary);
  font-weight: 600;
}
</style>
