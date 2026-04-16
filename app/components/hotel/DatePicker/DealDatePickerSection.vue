<template>
  <section class="date-picker-section">
    <div class="date-picker-section__header">
      <h2>{{ t('calendar.chooseArrivalDate') }}</h2>
      <p class="date-picker-section__subtitle">
        {{ t('calendar.priceShownFor') }}
        <button class="date-picker-section__persons-link" @click="store.openTravelGroupModal()">
          {{ store.travelGroupSummary }}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </p>
    </div>

    <!-- Night variant switcher -->
    <div class="date-picker-section__switcher">
      <DealNightSwitcher @switch="handleDealSwitch" />
    </div>

    <!-- Date inputs -->
    <div class="date-picker-section__inputs">
      <div class="date-input">
        <span class="date-input__value" :class="{ 'date-input__value--active': store.checkInDate }">
          {{ store.formattedCheckIn || t('calendar.startDate') }}
        </span>
        <div v-if="store.checkInDate" class="date-input__underline"></div>
      </div>
      <span class="date-input__arrow">→</span>
      <div class="date-input">
        <span class="date-input__value" :class="{ 'date-input__value--active': store.checkOutDate }">
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
        :selected-check-in="store.checkInDate"
        :selected-check-out="store.checkOutDate"
        :cheapest-price="cheapestPrice"
        :show-prev-button="true"
        @select-date="handleDateSelect"
        @prev-month="goToPrevMonth"
      />
      <CalendarMonth
        :year="nextMonthData.year"
        :month="nextMonthData.month"
        :availability="rightAvailability"
        :selected-check-in="store.checkInDate"
        :selected-check-out="store.checkOutDate"
        :cheapest-price="cheapestPrice"
        :show-next-button="true"
        @select-date="handleDateSelect"
        @next-month="goToNextMonth"
      />
    </div>

    <!-- Clear dates -->
    <div v-if="store.checkInDate" class="date-picker-section__clear">
      <button class="clear-btn" @click="store.clearDates()">{{ t('calendar.clearDates') }}</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useDealStore } from '~/stores/deal'
import { generateDealAvailability } from '~/data/mock/deal-pricing'

const { t } = useI18n()
const store = useDealStore()

const emit = defineEmits<{
  (e: 'switchDeal', dealId: string): void
}>()

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
  if (!store.currentDeal) return []
  return generateDealAvailability(
    currentMonth.value.year,
    currentMonth.value.month,
    store.currentDeal,
    store.totalPersons,
  )
})

const rightAvailability = computed(() => {
  if (!store.currentDeal) return []
  return generateDealAvailability(
    nextMonthData.value.year,
    nextMonthData.value.month,
    store.currentDeal,
    store.totalPersons,
  )
})

/** Cheapest available price across both visible months */
const cheapestPrice = computed(() => {
  const all = [...leftAvailability.value, ...rightAvailability.value]
  const prices = all
    .filter(a => a.available && a.totalPrice > 0)
    .map(a => a.totalPrice)
  return prices.length > 0 ? Math.min(...prices) : null
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
  store.setCheckIn(date)
}

function handleDealSwitch(dealId: string) {
  emit('switchDeal', dealId)
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

.date-picker-section__persons-link {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  font-size: inherit;
  font-weight: 600;
  color: var(--color-text-primary);
  text-decoration: underline;
  text-decoration-color: var(--color-primary);
  text-underline-offset: 2px;
}

.date-picker-section__persons-link:hover {
  color: var(--color-primary);
}

.date-picker-section__persons-link svg {
  color: var(--color-primary);
}

.date-picker-section__switcher {
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

@media (max-width: 768px) {
  .date-picker-section__calendars {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }
}
</style>
