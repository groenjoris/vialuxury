<template>
  <section class="date-picker-section">
    <div class="date-picker-section__header">
      <h2>{{ t('calendar.chooseArrivalDate') }}</h2>
      <p class="date-picker-section__subtitle">
        {{ t('calendar.priceShownFor') }}
        <strong>{{ store.configuration.persons }} {{ store.configuration.persons === 1 ? t('common.personSingular') : t('common.personPlural') }}</strong>
      </p>
    </div>

    <!-- Date inputs -->
    <div class="date-picker-section__inputs">
      <div class="date-input">
        <span class="date-input__value" :class="{ 'date-input__value--active': store.configuration.checkInDate }">
          {{ store.formattedCheckIn || t('calendar.startDate') }}
        </span>
        <div v-if="store.configuration.checkInDate" class="date-input__underline"></div>
      </div>
      <span class="date-input__arrow">→</span>
      <div class="date-input">
        <span class="date-input__value" :class="{ 'date-input__value--active': store.configuration.checkOutDate }">
          {{ store.formattedCheckOut || t('calendar.endDate') }}
        </span>
      </div>
    </div>

    <!-- Two-month calendar -->
    <div class="date-picker-section__calendars">
      <CalendarMonth
        :year="currentMonth.year"
        :month="currentMonth.month"
        :availability="leftAvailability"
        :selected-check-in="store.configuration.checkInDate"
        :selected-check-out="store.configuration.checkOutDate"
        :show-prev-button="true"
        @select-date="handleDateSelect"
        @prev-month="goToPrevMonth"
      />
      <CalendarMonth
        :year="nextMonthData.year"
        :month="nextMonthData.month"
        :availability="rightAvailability"
        :selected-check-in="store.configuration.checkInDate"
        :selected-check-out="store.configuration.checkOutDate"
        :show-next-button="true"
        @select-date="handleDateSelect"
        @next-month="goToNextMonth"
      />
    </div>

    <!-- Clear dates -->
    <div v-if="store.configuration.checkInDate" class="date-picker-section__clear">
      <button class="clear-btn" @click="store.clearDates()">{{ t('calendar.clearDates') }}</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'
import { generateAvailability } from '~/data/mock/pricing-matrix'

const { t } = useI18n()
const store = useBookingStore()

const currentMonth = ref({
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
})

const nextMonthData = computed(() => {
  let month = currentMonth.value.month + 1
  let year = currentMonth.value.year
  if (month > 12) {
    month = 1
    year++
  }
  return { year, month }
})

const leftAvailability = computed(() => {
  if (!store.arrangement) return []
  return generateAvailability(
    currentMonth.value.year,
    currentMonth.value.month,
    store.configuration,
    store.arrangement,
  )
})

const rightAvailability = computed(() => {
  if (!store.arrangement) return []
  return generateAvailability(
    nextMonthData.value.year,
    nextMonthData.value.month,
    store.configuration,
    store.arrangement,
  )
})

function goToPrevMonth() {
  let month = currentMonth.value.month - 1
  let year = currentMonth.value.year
  if (month < 1) {
    month = 12
    year--
  }
  currentMonth.value = { year, month }
}

function goToNextMonth() {
  let month = currentMonth.value.month + 1
  let year = currentMonth.value.year
  if (month > 12) {
    month = 1
    year++
  }
  currentMonth.value = { year, month }
}

function handleDateSelect(date: string) {
  store.setCheckInDate(date)
}
</script>

<style scoped>
.date-picker-section {
  padding: var(--space-xl) 0;
  border-top: 1px solid var(--color-border);
}

.date-picker-section__header h2 {
  font-size: 22px;
  margin-bottom: var(--space-xs);
}

.date-picker-section__subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
}

.date-picker-section__inputs {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.date-input {
  display: flex;
  flex-direction: column;
}

.date-input__value {
  font-size: 16px;
  color: var(--color-text-muted);
  padding-bottom: var(--space-sm);
}

.date-input__value--active {
  color: var(--color-text-primary);
  font-weight: 500;
}

.date-input__underline {
  height: 2px;
  background: var(--color-text-primary);
}

.date-input__arrow {
  font-size: 18px;
  color: var(--color-text-muted);
}

.date-picker-section__calendars {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2xl);
}

.date-picker-section__clear {
  text-align: right;
  margin-top: var(--space-md);
}

.clear-btn {
  color: var(--color-text-secondary);
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
}

.clear-btn:hover {
  color: var(--color-text-primary);
}
</style>
