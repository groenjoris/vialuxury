<template>
  <section class="booking-controls">
    <div class="booking-controls__row">
      <!-- ── Aankomstdatum ──
           Collapsed ONLY when arriving with a date already chosen (global
           search state, e.g. from a search-result card). Clicking the
           field opens the inline calendar — and once open it stays open;
           selecting a date does NOT collapse it. -->
      <div class="booking-controls__field-block booking-controls__field-block--date">
        <template v-if="!calendarOpen">
          <h3 class="booking-controls__label">Aankomstdatum</h3>
          <button type="button" class="booking-controls__field" @click="calendarOpen = true">
            <span>{{ formattedArrival }}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
        </template>
        <template v-else>
          <h3 class="booking-controls__label">Kies aankomstdatum</h3>
          <div class="booking-controls__calendar">
            <SecondReleaseCalendarMonth
              :year="calMonth.year" :month="calMonth.month"
              :availability="calAvailability"
              :selected-check-in="store.checkInDate" :selected-check-out="store.checkOutDate"
              :cheapest-price="calCheapestPrice"
              :show-prev-button="true" :show-next-button="true"
              :show-legend="true"
              @select-date="onSelectDate" @prev-month="calPrev" @next-month="calNext"
            />
          </div>
        </template>

        <!-- ── Reisduur + CTA — grey box. When the calendar is COLLAPSED it
             sits here, below the (collapsed) date field. -->
        <div v-if="!calendarOpen" class="booking-controls__meta-box">
          <h3 class="booking-controls__duration-title">
            {{ t('deal.thisArrangementIsFor') }} {{ nightsWord(dealNights, false) }}
          </h3>
          <template v-if="hasOtherArrangements">
            <p class="booking-controls__shorter">{{ t('deal.shorterOrLongerStay') }}</p>
            <a href="#" class="booking-controls__link" @click.prevent="$emit('open-arrangements')">
              {{ t('deal.viewOtherArrangements') }}
            </a>
          </template>
        </div>
      </div>

      <!-- ── Right half: reisgezelschap + reisduur/CTA box ── -->
      <div class="booking-controls__side">
      <div class="booking-controls__field-block" ref="groupBlockRef">
        <h3 class="booking-controls__label">Reisgezelschap</h3>
        <button type="button" class="booking-controls__field" @click="groupOpen = !groupOpen">
          <span>{{ groupLabel }}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
        </button>
        <div v-if="groupOpen" class="booking-controls__group-popup">
          <div class="group-popup__row">
            <span class="group-popup__label-block">
              <span class="group-popup__label">Personen</span>
              <span class="group-popup__sub">vanaf 12 jaar</span>
            </span>
            <div class="group-popup__stepper">
              <button type="button" class="group-popup__step-btn" :disabled="draftAdults <= 1" @click="changeAdults(-1)">−</button>
              <span class="group-popup__step-val">{{ draftAdults }}</span>
              <button type="button" class="group-popup__step-btn" :disabled="draftAdults >= 16" @click="changeAdults(1)">+</button>
            </div>
          </div>
          <div class="group-popup__row">
            <span class="group-popup__label">Kamers</span>
            <div class="group-popup__stepper">
              <button type="button" class="group-popup__step-btn" :disabled="draftRooms <= minDraftRooms" @click="changeRooms(-1)">−</button>
              <span class="group-popup__step-val">{{ draftRooms }}</span>
              <button type="button" class="group-popup__step-btn" :disabled="draftRooms >= maxDraftRooms" @click="changeRooms(1)">+</button>
            </div>
          </div>
          <button type="button" class="group-popup__done" @click="applyGroup">Klaar</button>
          <p class="group-popup__note">
            Dit arrangement is alleen voor volwassenen. Kinderen mee?
            <NuxtLink to="/second-release/search" class="group-popup__note-link">Toon kindvriendelijke arrangementen</NuxtLink>
          </p>
        </div>
      </div>

      <!-- ── Reisduur + CTA — grey box. When the calendar is EXPANDED it
           sits here, below the reisgezelschap selector. -->
      <div v-if="calendarOpen" class="booking-controls__meta-box">
        <h3 class="booking-controls__duration-title">
          {{ t('deal.thisArrangementIsFor') }} {{ nightsWord(dealNights, false) }}
        </h3>
        <template v-if="hasOtherArrangements">
          <p class="booking-controls__shorter">{{ t('deal.shorterOrLongerStay') }}</p>
          <a href="#" class="booking-controls__link" @click.prevent="$emit('open-arrangements')">
            {{ t('deal.viewOtherArrangements') }}
          </a>
        </template>
      </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useSecondReleaseDealStore } from '~/stores-second-release/deal'
import { useSecondReleaseClickOutside } from '~/composables-second-release/useSecondReleaseClickOutside'
import { generateDealAvailability } from '~/data/mock/deal-pricing'
import { minRoomsFor, maxRoomsFor, priceForArrival } from '~/utils-second-release/priceFormula'
import { nightsWord } from '~/utils-second-release/plural'

const { t } = useSecondReleaseI18n()

defineProps<{
  hasOtherArrangements?: boolean
}>()

defineEmits<{
  (e: 'open-arrangements'): void
}>()

const store = useSecondReleaseDealStore()

/* ── Calendar open/collapse ──
   Collapsed ONLY when the page is entered with a date already chosen
   (global arrival date from search). Once opened — by the user clicking
   the field, or because no date was set — it never collapses again;
   selecting a date keeps it open. Clearing the date force-opens it. */
const calendarOpen = ref(!store.checkInDate)
watch(() => store.checkInDate, (v) => { if (!v) calendarOpen.value = true })

function onSelectDate(date: string) {
  store.setCheckIn(date)
}

/** "Maandag 26 juni 2026" — full Dutch weekday + date, capitalised. */
const formattedArrival = computed(() => {
  if (!store.checkInDate) return 'Kies datum'
  const d = new Date(store.checkInDate)
  const s = new Intl.DateTimeFormat('nl-NL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(d)
  return s.charAt(0).toUpperCase() + s.slice(1)
})

/* ── Calendar month state (mirrors the old sidebar calendar) ── */
const calMonth = ref(
  store.checkInDate
    ? { year: Number(store.checkInDate.slice(0, 4)), month: Number(store.checkInDate.slice(5, 7)) }
    : { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
)
watch(() => store.checkInDate, (val) => {
  if (val) {
    const y = Number(val.slice(0, 4))
    const m = Number(val.slice(5, 7))
    if (y !== calMonth.value.year || m !== calMonth.value.month) {
      calMonth.value = { year: y, month: m }
    }
  }
})
const calAvailability = computed(() => {
  const deal = store.currentDeal
  if (!deal) return []
  const persons = store.totalPersons
  const rooms = store.travelGroup.rooms
  const triples = store.tripleRoomCount
  // Availability/sold-out structure from the shared generator, then override
  // each day's price with the SECOND-RELEASE formula (priceForArrival —
  // exactly what the sidebar uses) so the calendar follows the selected
  // travel group (persons + rooms + 3-person-room saving).
  return generateDealAvailability(calMonth.value.year, calMonth.value.month, deal, persons).map((d) => {
    if (!d.available) return d
    const totalPrice = priceForArrival(deal.basePrice, deal.id, d.date, persons, rooms, triples)
    const originalPrice = d.discountPercentage
      ? Math.round(totalPrice / (1 - d.discountPercentage / 100))
      : totalPrice
    return { ...d, totalPrice, originalPrice }
  })
})
const calCheapestPrice = computed(() => {
  const prices = calAvailability.value.filter(a => a.available && a.totalPrice > 0).map(a => a.totalPrice)
  return prices.length > 0 ? Math.min(...prices) : null
})
function calPrev() { let m = calMonth.value.month - 1, y = calMonth.value.year; if (m < 1) { m = 12; y-- }; calMonth.value = { year: y, month: m } }
function calNext() { let m = calMonth.value.month + 1, y = calMonth.value.year; if (m > 12) { m = 1; y++ }; calMonth.value = { year: y, month: m } }

/* ── Reisgezelschap popup — adults + rooms steppers (adults-only
   arrangement: no children). Drafted locally, applied on Klaar /
   click-outside so the page only updates when the popup closes. ── */
const groupOpen = ref(false)
const groupBlockRef = ref<HTMLElement | null>(null)
useSecondReleaseClickOutside(groupBlockRef, () => { if (groupOpen.value) applyGroup() })

const draftAdults = ref(store.totalPersons)
const draftRooms = ref(store.travelGroup.rooms)
watch(groupOpen, (open) => {
  if (open) {
    draftAdults.value = store.totalPersons
    draftRooms.value = store.travelGroup.rooms
  }
})

const minDraftRooms = computed(() => minRoomsFor(draftAdults.value))
const maxDraftRooms = computed(() => maxRoomsFor(draftAdults.value))

function changeAdults(delta: number) {
  draftAdults.value = Math.min(16, Math.max(1, draftAdults.value + delta))
  // Re-clamp rooms to the new party size.
  draftRooms.value = Math.min(maxDraftRooms.value, Math.max(minDraftRooms.value, draftRooms.value))
}

function changeRooms(delta: number) {
  draftRooms.value = Math.min(maxDraftRooms.value, Math.max(minDraftRooms.value, draftRooms.value + delta))
}

function applyGroup() {
  store.setTravelGroup({ adults: draftAdults.value, children: [], rooms: draftRooms.value })
  groupOpen.value = false
}

const groupLabel = computed(() =>
  `${store.totalPersons} ${store.totalPersons === 1 ? 'persoon' : 'personen'}, ${store.travelGroup.rooms} ${store.travelGroup.rooms === 1 ? 'kamer' : 'kamers'}`,
)

/** "2 nachten, 3 dagen" */
const dealNights = computed(() => store.currentDeal?.nights ?? 1)
</script>

<style scoped>
/* Card chrome — matches the sidebar card (.deal-page__col-right). */
.booking-controls {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
}

.booking-controls__row {
  display: grid;
  /* Date column carries the calendar — give it more room so the month
     grid matches the first-release sidebar calendar width (~350px). */
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
  gap: var(--space-lg);
  align-items: start;
}

/* Right half: reisgezelschap field + grey reisduur/CTA box stacked. */
.booking-controls__side {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  min-width: 0;
}

/* Reisduur block — grey rounded box around the whole thing. */
.booking-controls__meta-box {
  margin-top: var(--space-md);
  padding: var(--space-md);
  background: var(--color-background-secondary);
  border-radius: var(--radius-md);
}

/* "Dit arrangement is voor x nachten" — Basis Grotesque (body font),
   sidebar-title size. */
.booking-controls__duration-title {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}

/* "Korter of langer verblijf?" — plain body text. */
.booking-controls__shorter {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 400;
  line-height: 1.4;
  color: var(--color-text-secondary);
  margin: 0 0 4px;
}

.booking-controls__field-block {
  position: relative;
  min-width: 0;
}

/* When the calendar is open it spans wider than the half column. */
.booking-controls__field-block--date {
  min-width: 0;
}

.booking-controls__label {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 10px;
}

.booking-controls__label--plain {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
}

/* Dropdown-style field (Aankomstdatum collapsed + Reisgezelschap) */
.booking-controls__field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  padding: 12px 14px;
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--color-text-primary);
  cursor: pointer;
  text-align: left;
  transition: border-color var(--transition-fast);
}

.booking-controls__field:hover {
  border-color: var(--color-dark);
}

.booking-controls__field svg {
  flex-shrink: 0;
  color: var(--color-text-secondary);
}

/* Inline calendar fills its (wider) column. */
.booking-controls__calendar {
  max-width: none;
}

/* Reisgezelschap popup — adults/rooms steppers + adults-only note */
.booking-controls__group-popup {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 50;
  padding: var(--space-md);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0, 0, 0, 0.08);
}

.group-popup__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
}

.group-popup__label-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.group-popup__label {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.group-popup__sub {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.group-popup__stepper {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.group-popup__step-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  font-size: 18px;
  line-height: 1;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: border-color var(--transition-fast), color var(--transition-fast);
}

.group-popup__step-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.group-popup__step-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.group-popup__step-val {
  min-width: 22px;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
}

.group-popup__done {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.group-popup__done:hover {
  background: var(--color-primary-hover);
}

.group-popup__note {
  margin: 12px 0 0;
  padding-top: 12px;
  border-top: 1px solid var(--color-border-light);
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.group-popup__note-link {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.group-popup__note-link:hover {
  color: var(--color-primary-hover);
}

.booking-controls__static {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0;
}

.booking-controls__link {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.booking-controls__link:hover {
  color: var(--color-primary-hover);
}

@media (max-width: 800px) {
  /* Mobile sits inside the sidebar card already — swap the card chrome
     for the old divider so we don't nest two bordered cards. */
  .booking-controls {
    background: none;
    border: none;
    border-top: 1px solid var(--color-border-light);
    border-radius: 0;
    padding: var(--space-lg) 0 0;
    margin-top: var(--space-lg);
  }
  .booking-controls__row {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
  .booking-controls__calendar {
    max-width: none;
  }
}
</style>
