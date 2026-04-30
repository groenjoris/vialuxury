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

    <!-- In / Out badge for selected check-in / check-out days -->
    <span v-if="isCheckIn" class="day-cell__badge" aria-label="Check-in">In</span>
    <span v-else-if="isCheckOut" class="day-cell__badge" aria-label="Check-out">Out</span>

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
const isCheckOut = computed(() =>
  !!props.selectedCheckOut && props.date === props.selectedCheckOut,
)

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
  /* Two reserved rows: top = day number, bottom = price (or empty space).
     Pinning rows keeps the day number at the same y across cells whether or
     not a price is rendered. */
  display: grid;
  grid-template-rows: 22px 16px;
  align-items: center;
  justify-items: center;
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

/* Selected check-in / check-out dates: green; ALL inner text forced white */
.day-cell--selected {
  background: #00CB8B !important;
  color: #fff;
}
.day-cell--selected .day-cell__number,
.day-cell--selected .day-cell__price,
.day-cell--selected .day-cell__sold {
  color: #fff !important;
}

/* In-between range dates: light green; ALL inner text forced white */
.day-cell--in-range {
  background: #9AE3C7;
  color: #fff;
}
.day-cell--in-range .day-cell__number,
.day-cell--in-range .day-cell__price,
.day-cell--in-range .day-cell__sold {
  color: #fff !important;
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
  box-shadow: inset 0 0 0 2px var(--color-discount);
}

.day-cell--has-upgrades.day-cell--selected {
  box-shadow: inset 0 0 0 2px var(--color-discount);
}

.day-cell__number {
  grid-row: 1;
  font-size: 15px;
  font-weight: 500;
  line-height: 1;
}

/* "In" / "Out" badge flush in the upper-right corner of selected check-in /
   check-out cells. 14×14 px, white-on-black, square (no rounded corners),
   no padding around it — sits tight against the cell edge. */
.day-cell__badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 14px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #000;
  color: #fff;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;
  pointer-events: none;
}

/* Sold out dash */
.day-cell__sold {
  grid-row: 2;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-muted);
  line-height: 1;
}

/* Sold out dash within a selected range: white */
.day-cell__sold--in-range {
  color: white;
}

/* Default price color: green */
.day-cell__price {
  grid-row: 2;
  font-size: 12px;
  color: #00CB8B;
  font-weight: 600;
  line-height: 1;
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
