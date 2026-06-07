<template>
  <div class="calendar-month">
    <div class="calendar-month__header">
      <button v-if="showPrevButton" class="nav-btn" aria-label="Vorige maand" @click="$emit('prevMonth')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg></button>
      <h4 class="calendar-month__title">{{ monthName }} {{ year }}</h4>
      <button v-if="showNextButton" class="nav-btn" aria-label="Volgende maand" @click="$emit('nextMonth')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg></button>
    </div>

    <div class="calendar-month__day-headers">
      <span v-for="day in dayHeaders" :key="day" class="day-header">{{ day }}</span>
    </div>

    <div class="calendar-month__grid">
      <!-- Empty cells for offset -->
      <div v-for="n in startOffset" :key="'offset-' + n" class="day-placeholder"></div>

      <FirstReleaseCalendarDayCell
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
      <span v-if="cheapestPrice != null" class="legend-cheapest">
        <span class="legend-star" aria-hidden="true">★</span>
        <span class="legend-label">{{ t('calendar.cheapestPrice') }}</span>
      </span>
      <span class="legend-unavailable">
        <span class="legend-swatch legend-swatch--unavailable" aria-hidden="true"></span>
        <span class="legend-label">{{ t('calendar.unavailable') }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DateAvailability } from '~/types/calendar'
import { getDutchDayHeaders, getDutchMonthName } from '~/utils-first-release/formatDate'
import dayjs from 'dayjs'

const { t } = useFirstReleaseI18n()

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

/* Mobile: drop the min-width so the calendar shrinks to fit the screen
   instead of overflowing the page margins on small viewports. */
@media (max-width: 800px) {
  .calendar-month {
    min-width: 0;
  }
}

.calendar-month__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
  min-height: 40px;
}

.calendar-month__title {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  flex: 1;
}

/* Month-switch arrows match the white-modal close buttons: 36px, no stroke,
   light-grey fill, greyer on hover. */
.nav-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.nav-btn:hover {
  background: var(--color-border);
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
  /* Fixed row tracks so a selected cell can't grow its row ("wobble"). */
  grid-auto-rows: 52px;
}

.day-placeholder {
  height: 52px;
}

.calendar-month__legend {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-md);
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
  box-shadow: inset 0 0 0 2px var(--color-discount);
}

.legend-swatch--green {
  background: var(--color-discount);
}

.legend-cheapest,
.legend-unavailable {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.legend-star {
  font-size: 14px;
  line-height: 1;
  color: var(--color-primary);
}

.legend-swatch--unavailable {
  width: 14px;
  height: 14px;
  background: #dbdbdb;
  opacity: 0.7;
}

.legend-label {
  line-height: 1;
}
</style>
