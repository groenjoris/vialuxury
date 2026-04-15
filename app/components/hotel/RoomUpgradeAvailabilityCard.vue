<template>
  <div
    ref="rootRef"
    class="room-upgrade-avail"
    :class="{
      'room-upgrade-avail--selected': !!store.checkInDate && !isCalendarOpen,
      'room-upgrade-avail--open': isCalendarOpen,
    }"
  >
    <!-- State A: CTA (no date selected yet) -->
    <div v-if="!isCalendarOpen && !store.checkInDate" class="room-upgrade-avail__body">
      <div class="room-upgrade-avail__icon" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2 15 8l6 .9-4.5 4.4L17.5 20 12 16.9 6.5 20 8 13.3 3.5 8.9 9.5 8z" />
        </svg>
      </div>
      <h3 class="room-upgrade-avail__title">{{ t('room.upgradeAvailable') }}</h3>
      <p class="room-upgrade-avail__desc">
        {{ t('room.chooseArrivalDate') }}
      </p>
      <button
        type="button"
        class="btn btn-secondary room-upgrade-avail__btn"
        @click="openCalendar"
      >
        {{ t('room.chooseArrivalDateBtn') }}
      </button>
    </div>

    <!-- State B: date selected (calendar closed) -->
    <div v-else-if="!isCalendarOpen && store.checkInDate" class="room-upgrade-avail__body">
      <div class="room-upgrade-avail__icon" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2 15 8l6 .9-4.5 4.4L17.5 20 12 16.9 6.5 20 8 13.3 3.5 8.9 9.5 8z" />
        </svg>
      </div>
      <h3 class="room-upgrade-avail__title">{{ t('room.upgradeAvailable') }}</h3>
      <p class="room-upgrade-avail__desc">
        {{ t('room.forArrivalOn') }} <strong>{{ store.formattedCheckIn }}</strong>. {{ t('room.viewUpgradesBelow') }}
      </p>
      <button
        type="button"
        class="room-upgrade-avail__link"
        @click="openCalendar"
      >
        {{ t('room.changeDate') }}
      </button>
    </div>

    <!-- State C: calendar open inline -->
    <div v-else class="room-upgrade-avail__calendar">
      <div class="room-upgrade-avail__cal-header">
        <h4 class="room-upgrade-avail__cal-title">{{ t('room.chooseArrivalDateBtn') }}</h4>
        <button
          type="button"
          class="room-upgrade-avail__close"
          :aria-label="t('common.close')"
          @click="closeCalendar"
        >
          ×
        </button>
      </div>
      <CalendarMonth
        :year="calMonth.year"
        :month="calMonth.month"
        :availability="upgradeAvailability"
        :selected-check-in="store.checkInDate"
        :selected-check-out="store.checkOutDate"
        :show-prev-button="true"
        :show-next-button="true"
        :show-legend="true"
        @select-date="onSelectDate"
        @prev-month="calPrev"
        @next-month="calNext"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Deal } from '~/types/deal'
import { useDealStore } from '~/stores/deal'
import { generateDealAvailability } from '~/data/mock/deal-pricing'

const { t } = useI18n()

const props = defineProps<{
  deal: Deal
}>()

const store = useDealStore()

const rootRef = ref<HTMLElement | null>(null)
const isCalendarOpen = ref(false)

// Initialize the calendar month: use current check-in month if set, else today's month
const initialMonth = (() => {
  if (store.checkInDate) {
    const d = new Date(store.checkInDate)
    return { year: d.getFullYear(), month: d.getMonth() + 1 }
  }
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
})()
const calMonth = ref(initialMonth)

const upgradeAvailability = computed(() => {
  const raw = generateDealAvailability(
    calMonth.value.year,
    calMonth.value.month,
    props.deal,
    store.totalPersons,
    true,
  )
  // Strip prices — calendar here should only communicate availability, not pricing.
  return raw.map((d) => ({ ...d, totalPrice: 0 }))
})

function calPrev() {
  let m = calMonth.value.month - 1
  let y = calMonth.value.year
  if (m < 1) {
    m = 12
    y--
  }
  calMonth.value = { year: y, month: m }
}

function calNext() {
  let m = calMonth.value.month + 1
  let y = calMonth.value.year
  if (m > 12) {
    m = 1
    y++
  }
  calMonth.value = { year: y, month: m }
}

function openCalendar() {
  isCalendarOpen.value = true
}

function closeCalendar() {
  isCalendarOpen.value = false
}

function onSelectDate(date: string) {
  store.setCheckIn(date)
  isCalendarOpen.value = false
}
</script>

<style scoped>
.room-upgrade-avail {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: visible;
  border: 1px solid var(--color-border-light);
  background: var(--color-gold-light);
}

.room-upgrade-avail--selected {
  background: var(--color-surface);
  border-color: var(--color-gold);
}

.room-upgrade-avail__body {
  padding: var(--space-xl) var(--space-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-sm);
  min-height: 260px;
  justify-content: center;
}

.room-upgrade-avail__icon {
  color: var(--color-gold);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 2px var(--color-gold);
  margin-bottom: var(--space-xs);
}

.room-upgrade-avail__title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 600;
  line-height: 1.25;
  color: var(--color-text-primary);
}

.room-upgrade-avail__desc {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  max-width: 320px;
}

.room-upgrade-avail__btn {
  margin-top: var(--space-sm);
}

.room-upgrade-avail__link {
  margin-top: var(--space-xs);
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  padding: 0;
}

.room-upgrade-avail--open {
  background: var(--color-surface);
  border-color: var(--color-gold);
}

.room-upgrade-avail__calendar {
  padding: var(--space-md) var(--space-lg) var(--space-lg);
  display: flex;
  flex-direction: column;
  min-height: 260px;
}

.room-upgrade-avail__cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.room-upgrade-avail__cal-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--color-text-muted);
  margin: 0;
}

.room-upgrade-avail__close {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-size: 22px;
  line-height: 1;
  color: var(--color-text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all var(--transition-fast);
}

.room-upgrade-avail__close:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
