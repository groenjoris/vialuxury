<template>
  <div class="calendar-month">
    <div class="calendar-month__header">
      <button v-if="showPrevButton" class="nav-btn" @click="$emit('prevMonth')">←</button>
      <h4 class="calendar-month__title">{{ monthName }} {{ year }}</h4>
      <button v-if="showNextButton" class="nav-btn" @click="$emit('nextMonth')">→</button>
    </div>

    <div class="calendar-month__day-headers">
      <span v-for="day in dayHeaders" :key="day" class="day-header">{{ day }}</span>
    </div>

    <div class="calendar-month__grid">
      <!-- Empty cells for offset -->
      <div v-for="n in startOffset" :key="'offset-' + n" class="day-placeholder"></div>

      <CalendarDayCell
        v-for="day in days"
        :key="day.date"
        :date="day.date"
        :day-of-month="day.dayOfMonth"
        :is-current-month="true"
        :availability="day.availability"
        :selected-check-in="selectedCheckIn"
        :selected-check-out="selectedCheckOut"
        :is-cheapest="cheapestPrice != null && day.availability?.available === true && day.availability.totalPrice === cheapestPrice"
        @select-date="$emit('selectDate', $event)"
      />
    </div>

    <div v-if="showLegend" class="calendar-month__legend">
      <span class="legend-swatch legend-swatch--gold"></span>
      <span class="legend-label">{{ t('room.upgradeAvailable') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DateAvailability } from '~/types/calendar'
import { getDutchDayHeaders, getDutchMonthName } from '~/utils/formatDate'
import dayjs from 'dayjs'

const { t } = useI18n()

const props = defineProps<{
  year: number
  month: number
  availability: DateAvailability[]
  selectedCheckIn: string | null
  selectedCheckOut: string | null
  cheapestPrice?: number | null
  showPrevButton?: boolean
  showNextButton?: boolean
  showLegend?: boolean
}>()

defineEmits<{
  selectDate: [date: string]
  prevMonth: []
  nextMonth: []
}>()

const dayHeaders = computed(() => [
  t('header.days.0'), t('header.days.1'), t('header.days.2'), t('header.days.3'),
  t('header.days.4'), t('header.days.5'), t('header.days.6'),
])

const monthName = computed(() => {
  return t(`header.months.${props.month - 1}`)
})

const startOffset = computed(() => {
  // Day of week for first day of month (0=Sunday in dayjs)
  // Convert to Monday-based (0=Monday)
  const firstDay = dayjs(`${props.year}-${String(props.month).padStart(2, '0')}-01`).day()
  return firstDay === 0 ? 6 : firstDay - 1
})

const days = computed(() => {
  const daysInMonth = dayjs(`${props.year}-${String(props.month).padStart(2, '0')}-01`).daysInMonth()
  const result = []

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${props.year}-${String(props.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const avail = props.availability.find((a) => a.date === dateStr) ?? null

    result.push({
      date: dateStr,
      dayOfMonth: d,
      availability: avail,
    })
  }

  return result
})
</script>

<style scoped>
.calendar-month {
  min-width: 300px;
}

.calendar-month__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
  min-height: 40px;
}

.calendar-month__title {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  flex: 1;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all var(--transition-fast);
}

.nav-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.calendar-month__day-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: var(--space-sm);
}

.day-header {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  padding: var(--space-sm) 0;
}

.calendar-month__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.day-placeholder {
  min-height: 52px;
}

.calendar-month__legend {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border-light);
  font-size: 13px;
  color: var(--color-text-secondary);
}

.legend-swatch {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: var(--radius-sm);
}

.legend-swatch--gold {
  box-shadow: inset 0 0 0 2px var(--color-gold);
}

.legend-label {
  line-height: 1;
}
</style>
