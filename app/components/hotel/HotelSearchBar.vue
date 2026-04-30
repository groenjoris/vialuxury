<template>
  <div class="hotel-search-bar" ref="barRef">
    <div class="hotel-search-bar__fields">
      <!-- Wanneer -->
      <button
        ref="whenFieldRef"
        class="hsb-field"
        :class="{ 'hsb-field--active': activePopup === 'when' }"
        @click="togglePopup('when')"
      >
        <svg class="hsb-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <div class="hsb-field__text">
          <span class="hsb-field__label">{{ t('header.when') }}</span>
          <span class="hsb-field__value">{{ whenOnlyLabel }}</span>
        </div>
      </button>

      <div class="hotel-search-bar__divider"></div>

      <!-- Hoelang -->
      <button
        ref="howlongFieldRef"
        class="hsb-field"
        :class="{ 'hsb-field--active': activePopup === 'howlong' }"
        @click="togglePopup('howlong')"
      >
        <svg class="hsb-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" />
        </svg>
        <div class="hsb-field__text">
          <span class="hsb-field__label">{{ t('header.howLong') }}</span>
          <span class="hsb-field__value">{{ howLongLabel }}</span>
        </div>
      </button>

      <div class="hotel-search-bar__divider"></div>

      <!-- Wie gaat er mee -->
      <button
        ref="whoFieldRef"
        class="hsb-field"
        :class="{ 'hsb-field--active': activePopup === 'who' }"
        @click="togglePopup('who')"
      >
        <svg class="hsb-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
        <div class="hsb-field__text">
          <span class="hsb-field__label">{{ t('header.whosComing') }}</span>
          <span class="hsb-field__value">{{ whoLabel }}</span>
        </div>
      </button>

      <!-- Submit button — orange pill, two-line caption. Always enabled. -->
      <button
        class="hsb-submit"
        @click="handleChangeSearch"
      >
        Toon beschikbare<br />arrangementen
      </button>
    </div>

    <!-- Popups — positioned relative to bar -->
    <div v-if="activePopup" class="hsb-overlay" @click.self="closePopup">
      <!-- WHEN POPUP -->
      <div v-if="activePopup === 'when'" class="hsb-popup hsb-popup--when" :style="popupStyle">
        <DatePopup
          v-model:cal-month="calMonth"
          v-model:selected-date="selectedDate"
          v-model:flexibility="flexibility"
          v-model:selected-durations="selectedDurations"
          @update:flex-state="handleFlexState"
          @save="closePopup()"
          @clear="clearWhen"
        />
      </div>

      <!-- HOWLONG POPUP -->
      <div v-if="activePopup === 'howlong'" class="hsb-popup hsb-popup--howlong" :style="popupStyle">
        <DurationPopup
          :nights="selectedDurations"
          :flex-type="localFlexType"
          :arrival-date="selectedDate"
          :flex-months="flexState.months"
          @toggle-night="onToggleNight"
          @select-flex-type="onSelectFlexType"
        />
      </div>

      <!-- WHO POPUP -->
      <div v-if="activePopup === 'who'" class="hsb-popup hsb-popup--who" :style="popupStyle">
        <!-- Adults -->
        <div class="who-row">
          <div class="who-row__info">
            <span class="who-row__label">{{ t('header.adults') }}</span>
            <span class="who-row__sub">{{ t('header.adultsAge') }}</span>
          </div>
          <div class="stepper">
            <button class="stepper__btn" :disabled="group.adults <= 1" @click="group.adults--">&#8722;</button>
            <span class="stepper__val">{{ group.adults }}</span>
            <button class="stepper__btn" :disabled="group.adults >= 8" @click="group.adults++">+</button>
          </div>
        </div>

        <!-- Children -->
        <div class="who-row">
          <div class="who-row__info">
            <span class="who-row__label">{{ t('header.children') }}</span>
            <span class="who-row__sub">{{ t('header.childrenAge') }}</span>
          </div>
          <div class="stepper">
            <button class="stepper__btn" :disabled="group.children.length <= 0" @click="group.children.pop()">&#8722;</button>
            <span class="stepper__val">{{ group.children.length }}</span>
            <button class="stepper__btn" :disabled="group.children.length >= 4" @click="group.children.push({ age: 4 })">+</button>
          </div>
        </div>

        <!-- Child ages -->
        <div v-if="group.children.length > 0" class="who-children-ages">
          <div v-for="(child, idx) in group.children" :key="idx" class="who-child-age">
            <label>{{ t('travelGroup.childAge') }} {{ idx + 1 }}</label>
            <select v-model.number="child.age">
              <option v-for="a in 18" :key="a - 1" :value="a - 1">{{ a - 1 }} {{ t('travelGroup.years') }}</option>
            </select>
          </div>
        </div>

        <!-- Rooms -->
        <div class="who-row">
          <div class="who-row__info">
            <span class="who-row__label">{{ t('travelGroup.rooms') }}</span>
          </div>
          <div class="stepper">
            <button class="stepper__btn" :disabled="group.rooms <= 1" @click="group.rooms--">&#8722;</button>
            <span class="stepper__val">{{ group.rooms }}</span>
            <button class="stepper__btn" :disabled="group.rooms >= 4" @click="group.rooms++">+</button>
          </div>
        </div>

        <!-- Done button -->
        <div class="hsb-popup__footer">
          <a href="#" class="hsb-popup__clear" @click.prevent="clearWho">{{ t('header.clear') }}</a>
          <button class="hsb-done-btn" @click="closePopup()">{{ t('header.done') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { minRoomsFor } from '~/utils/priceFormula'

const { t } = useI18n()
const {
  persons, rooms,
  arrivalDate: globalArrivalDate,
  setArrivalDate,
  setSearchGroup,
} = useSearchState()

const emit = defineEmits<{
  search: [params: { persons: number; rooms: number; duration: string; flexibility: number; date: string | null }]
}>()

const barRef = ref<HTMLElement | null>(null)
const whenFieldRef = ref<HTMLElement | null>(null)
const howlongFieldRef = ref<HTMLElement | null>(null)
const whoFieldRef = ref<HTMLElement | null>(null)
type PopupName = 'when' | 'howlong' | 'who'
const activePopup = ref<PopupName | null>(null)
const popupStyle = ref<Record<string, string>>({})

function fieldRefFor(popup: PopupName): HTMLElement | null {
  if (popup === 'when') return whenFieldRef.value
  if (popup === 'howlong') return howlongFieldRef.value
  return whoFieldRef.value
}

function calcPopupPosition(popup: PopupName) {
  const bar = barRef.value
  const field = fieldRefFor(popup)
  if (!bar || !field) return {}

  const barRect = bar.getBoundingClientRect()
  const fieldRect = field.getBoundingClientRect()
  const popupW = popup === 'when' ? 528 : popup === 'howlong' ? 420 : 420

  // Anchor the popup's HORIZONTAL centre to the field's centre, so the
  // dropdown sits visually under the field it belongs to.
  const fieldCenter = fieldRect.left + fieldRect.width / 2
  let left = fieldCenter - popupW / 2
  left = Math.max(8, Math.min(left, window.innerWidth - popupW - 8))

  // Always open BELOW the bar (never flipped above). Auto-scroll fills any
  // bottom-overflow if the popup wouldn't fit otherwise.
  return {
    position: 'fixed',
    left: `${left}px`,
    top: `${barRect.bottom + 8}px`,
    width: `${popupW}px`,
  }
}

function togglePopup(popup: PopupName) {
  if (activePopup.value === popup) {
    activePopup.value = null
    return
  }
  popupStyle.value = calcPopupPosition(popup)
  activePopup.value = popup

  // Auto-scroll so the popup's full height fits below the bar without going
  // off the bottom of the viewport. If the popup would clip, scroll the page
  // down by exactly the missing amount (or, alternatively, scroll the bar
  // closer to the top so the popup gets max room below it).
  nextTick(() => {
    const bar = barRef.value
    if (!bar) return
    const barRect = bar.getBoundingClientRect()
    const NAV_H = 120
    const POPUP_H = popup === 'when' ? 520 : popup === 'howlong' ? 360 : 480
    const popupTop = barRect.bottom + 8
    const popupBottom = popupTop + POPUP_H
    const overflowBottom = popupBottom - (window.innerHeight - 8)
    if (overflowBottom > 0) {
      // Scroll the page so the bar moves up — but never higher than the
      // sticky navbar (NAV_H from top).
      const maxScroll = barRect.top - NAV_H - 16
      const wanted = Math.min(overflowBottom, Math.max(0, maxScroll))
      if (wanted > 0) {
        window.scrollBy({ top: wanted, behavior: 'smooth' })
        // Re-position the popup after the scroll settles so it tracks
        // the bar's new viewport position.
        setTimeout(() => {
          popupStyle.value = calcPopupPosition(popup)
        }, 320)
      }
    }
  })
}

function closePopup() {
  // When the Wie-popup closes (Klaar / outside-click) commit the draft
  // persons/rooms to the global state so prices update site-wide.
  if (activePopup.value === 'who') {
    setSearchGroup(group.value.adults + group.value.children.length, group.value.rooms)
  }
  activePopup.value = null
}

function clearWhen() {
  selectedDate.value = null
  flexibility.value = 0
  selectedDurations.value = []
  flexState.value = { durations: [], months: [] }
  calMonth.value = { year: new Date().getFullYear(), month: new Date().getMonth() }
  closePopup()
}

function clearWho() {
  group.value = { adults: 2, children: [], rooms: 1, dog: false }
  closePopup()
}

// --- WHEN state ---
const calMonth = ref({ year: new Date().getFullYear(), month: new Date().getMonth() })
/** Live-synced with the global arrival date so the navbar / deal-page calendar
 *  see the same selection. Search results are still gated by the search
 *  button (committedArrivalDate). */
const selectedDate = ref<string | null>(globalArrivalDate.value)
watch(selectedDate, (v) => { if (v !== globalArrivalDate.value) setArrivalDate(v) })
watch(globalArrivalDate, (v) => { if (v !== selectedDate.value) selectedDate.value = v })
const flexibility = ref(0)
const selectedDurations = ref<string[]>([])
const flexState = ref<{ durations: string[]; months: string[] }>({ durations: [], months: [] })
const localFlexType = ref<string | null>(null)

function onToggleNight(value: string) {
  const i = selectedDurations.value.indexOf(value)
  if (i === -1) selectedDurations.value.push(value)
  else selectedDurations.value.splice(i, 1)
  if (selectedDurations.value.length > 0) localFlexType.value = null
}

function onSelectFlexType(value: string | null) {
  localFlexType.value = value
  if (value) selectedDurations.value = []
}

function handleFlexState(state: { durations: string[]; months: string[] }) {
  flexState.value = state
  if (state.months.length > 0 && selectedDate.value) {
    selectedDate.value = null
  }
  if (state.durations.length > 0) {
    selectedDurations.value = []
  }
}

const durationOptions = computed(() => [
  { id: '1', label: t('header.duration.1night') },
  { id: '2', label: t('header.duration.2nights') },
  { id: '3', label: t('header.duration.3nights') },
  { id: '4', label: t('header.duration.4nights') },
  { id: '5+', label: t('header.duration.5nights') },
  { id: 'weekend-short', label: t('header.duration.weekendShort') },
  { id: 'weekend-long', label: t('header.duration.weekendLong') },
  { id: 'long-weekend', label: t('header.duration.longWeekend') },
])

const monthNames = computed(() => Array.from({ length: 12 }, (_, i) => t(`header.months.${i}`)))

/** Just the date / month part \u2014 shown in the Wanneer field. */
const whenOnlyLabel = computed(() => {
  if (selectedDate.value) {
    const [, m, d] = selectedDate.value.split('-')
    let s = `${d}/${m}`
    if (flexibility.value > 0) s += ` \u00B1${flexibility.value}`
    return s
  }
  if (flexState.value.months.length > 0) {
    return flexState.value.months
      .map(key => monthNames.value[parseInt(key.split('-')[1], 10) - 1])
      .join(', ')
  }
  return t('header.flexibleLabel')
})

/** Just the duration part \u2014 shown in the Hoelang field. */
const howLongLabel = computed(() => {
  const calDurs = selectedDurations.value
  if (calDurs.length > 0) {
    const labels = calDurs.map(id => durationOptions.value.find(o => o.id === id)?.label).filter(Boolean) as string[]
    return labels.join(' of ')
  }
  if (localFlexType.value) {
    const typeLabels: Record<string, string> = {
      'weekend-fri-sun': t('header.flex.weekendFriSun'),
      'weekend-sat-sun': t('header.flex.weekendSatSun'),
      'long-weekend': t('header.flex.longWeekend'),
      'midweek': t('header.flex.midweek'),
    }
    return typeLabels[localFlexType.value] || t('header.anyDuration')
  }
  return t('header.anyDuration')
})

// --- WHO state ---
const group = ref({
  adults: persons.value || 2,
  children: [] as { age: number }[],
  rooms: rooms.value || 1,
})
/** Mirror global persons/rooms back to the local draft when another component
 *  commits a change (e.g. navbar Wie-popup or deal-page Travel Group modal).
 *  Skip while this popup is open so we don't yank the user's in-progress draft. */
watch(persons, (p) => {
  if (activePopup.value === 'who') return
  if (p !== group.value.adults + group.value.children.length) {
    group.value = { ...group.value, adults: Math.max(1, p - group.value.children.length) }
  }
})
watch(rooms, (r) => {
  if (activePopup.value === 'who') return
  if (r !== group.value.rooms) {
    group.value = { ...group.value, rooms: r }
  }
})

/** Enforce minimum rooms (ceil(persons / 2)) while the user is in the popup.
 *  Only bumps rooms UP when persons exceed capacity; user-added extras stay. */
watch(
  () => group.value.adults + group.value.children.length,
  (total) => {
    if (activePopup.value !== 'who') return
    const min = minRoomsFor(total)
    if (group.value.rooms < min) {
      group.value = { ...group.value, rooms: min }
    }
  },
)

// Snapshot of the initial values — drives hasChanges so the submit button
// stays disabled until the user actually changes something.
const initialState = {
  date: null as string | null,
  flexibility: 0,
  durations: [] as string[],
  flexType: null as string | null,
  flexMonths: [] as string[],
  adults: persons.value || 2,
  children: 0,
  rooms: rooms.value || 1,
}

const hasChanges = computed(() => {
  if (selectedDate.value !== initialState.date) return true
  if (flexibility.value !== initialState.flexibility) return true
  if (selectedDurations.value.length !== initialState.durations.length) return true
  if (selectedDurations.value.some((v, i) => v !== initialState.durations[i])) return true
  if (localFlexType.value !== initialState.flexType) return true
  if (flexState.value.months.length !== initialState.flexMonths.length) return true
  if (group.value.adults !== initialState.adults) return true
  if (group.value.children.length !== initialState.children) return true
  if (group.value.rooms !== initialState.rooms) return true
  return false
})

const totalPersons = computed(() => group.value.adults + group.value.children.length)

const whoLabel = computed(() => {
  const parts: string[] = []
  parts.push(`${group.value.adults} ${t('common.adultsShort')}`)
  if (group.value.children.length > 0) {
    parts.push(`${group.value.children.length} ${t('common.childrenShort')}`)
  }
  if (group.value.rooms > 1) {
    parts.push(`${group.value.rooms} ${group.value.rooms === 1 ? t('common.roomSingular') : t('common.roomPlural')}`)
  }
  return parts.join(', ')
})

// Expose totalPersons so parent can use it
defineExpose({ totalPersons })

function handleChangeSearch() {
  closePopup()
  const dur = selectedDurations.value[0] || flexState.value.durations[0] || ''
  emit('search', {
    persons: totalPersons.value,
    rooms: group.value.rooms,
    duration: dur,
    flexibility: flexibility.value,
    date: selectedDate.value,
  })
}
</script>

<style scoped>
/* Same look as the home page's solid-variant search bar (.search-bar in
   SiteHeader.vue). Three fields + primary submit button — no Waarheen. */
.hotel-search-bar {
  position: relative;
  width: 100%;
  max-width: 1080px;
}

.hotel-search-bar__fields {
  width: 100%;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 16px;
  height: 72px;
  padding: 0 6px 0 0;
  border: 1px solid var(--color-border);
}

.hotel-search-bar__divider {
  width: 1px;
  height: 24px;
  background: #ddd;
  flex-shrink: 0;
}

.hsb-field {
  flex: 1;
  margin: 6px 4px;
  padding: 8px 18px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;
  border: none;
  background: none;
  text-align: left;
  border-radius: 10px;
  transition: background var(--transition-fast);
  min-width: 0;
}

.hsb-field:hover { background: #f5f5f5; }
.hsb-field--active { background: #eeeeee; }

.hsb-field__icon { display: none; }

.hsb-field__text {
  display: contents; /* lift label + value into the field's flex container */
}

.hsb-field__label {
  font-size: 11px;
  font-weight: 600;
  color: #999999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.hsb-field__value {
  font-size: 14px;
  color: #1A1A1A;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Primary submit button — orange pill, two-line caption. */
.hsb-submit {
  flex-shrink: 0;
  min-width: 160px;
  height: 56px;
  padding: 8px var(--space-md);
  background: var(--color-primary);
  color: #fff;
  border: 0;
  border-radius: 12px;
  margin-left: 4px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  white-space: normal;
  text-align: center;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.hsb-submit:hover:not(:disabled) { background: var(--color-primary-hover); }

.hsb-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ===== POPUPS ===== */
.hsb-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
}

.hsb-popup {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  padding: var(--space-lg);
  z-index: 501;
}

.hsb-popup--when {
  max-width: 95vw;
}

.hsb-popup--who {
  width: 420px;
  max-width: 95vw;
}

.hsb-popup__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-lg) var(--space-lg);
}

.hsb-popup__clear {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-muted);
  text-decoration: underline;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.hsb-popup__clear:hover {
  color: var(--color-text-primary);
}

.hsb-done-btn {
  padding: 10px 24px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: white;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background var(--transition-fast);
  white-space: nowrap;
}

.hsb-done-btn:hover {
  background: var(--color-primary-hover);
}

/* Who rows */
.who-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.who-row:last-of-type {
  border-bottom: none;
}

.who-row__info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.who-row__label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.who-row__sub {
  font-size: 12px;
  color: var(--color-text-muted);
}

.stepper {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.stepper__btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.stepper__btn:hover:not(:disabled) {
  border-color: var(--color-primary);
}

.stepper__btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.stepper__val {
  min-width: 20px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
}

.who-children-ages {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
  padding: var(--space-sm) 0 var(--space-md);
}

.who-child-age {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.who-child-age label {
  font-size: 11px;
  color: var(--color-text-muted);
}

.who-child-age select {
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 13px;
}

.hsb-popup__done {
  width: 100%;
  margin-top: var(--space-md);
  padding: 10px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.hsb-popup__done:hover {
  background: var(--color-primary-hover);
}

/* Responsive */
@media (max-width: 768px) {
  .hotel-search-bar__fields {
    flex-direction: column;
  }
  .hotel-search-bar__divider {
    width: 100%;
    height: 1px;
  }
  .hsb-btn {
    border-radius: 0;
  }
}
</style>
