<template>
  <div class="hotel-search-bar" ref="barRef">
    <div class="hotel-search-bar__fields">
      <!-- When & How long -->
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
          <span class="hsb-field__label">{{ t('header.whenAndHowLong') }}</span>
          <span class="hsb-field__value">{{ whenLabel }}</span>
        </div>
      </button>

      <div class="hotel-search-bar__divider"></div>

      <!-- Who's coming -->
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

      <!-- Change search button -->
      <button class="hsb-btn" @click="handleChangeSearch">
        {{ t('hotel.changeSearch') }}
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
          v-model:selected-duration="selectedDuration"
          @update:flex-state="handleFlexState"
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
        <button class="hsb-popup__done" @click="closePopup()">{{ t('header.done') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { persons, rooms } = useSearchState()

const emit = defineEmits<{
  search: [params: { persons: number; rooms: number; duration: string; flexibility: number; date: string | null }]
}>()

const barRef = ref<HTMLElement | null>(null)
const whenFieldRef = ref<HTMLElement | null>(null)
const whoFieldRef = ref<HTMLElement | null>(null)
const activePopup = ref<'when' | 'who' | null>(null)
const popupStyle = ref<Record<string, string>>({})

function calcPopupPosition(popup: 'when' | 'who') {
  const bar = barRef.value
  if (!bar) return {}

  const barRect = bar.getBoundingClientRect()

  if (popup === 'when') {
    // Center horizontally relative to bar
    const barCenter = barRect.left + barRect.width / 2
    const popupW = 660
    let left = barCenter - popupW / 2
    // Clamp to viewport
    left = Math.max(8, Math.min(left, window.innerWidth - popupW - 8))
    return { position: 'fixed', top: `${barRect.bottom + 8}px`, left: `${left}px`, width: `${popupW}px` }
  } else {
    // Center horizontally relative to bar
    const barCenter = barRect.left + barRect.width / 2
    const popupW = 420
    let left = barCenter - popupW / 2
    left = Math.max(8, Math.min(left, window.innerWidth - popupW - 8))
    return { position: 'fixed', top: `${barRect.bottom + 8}px`, left: `${left}px` }
  }
}

function togglePopup(popup: 'when' | 'who') {
  if (activePopup.value === popup) {
    activePopup.value = null
    return
  }
  popupStyle.value = calcPopupPosition(popup)
  activePopup.value = popup
}

function closePopup() {
  activePopup.value = null
}

// --- WHEN state ---
const calMonth = ref({ year: new Date().getFullYear(), month: new Date().getMonth() })
const selectedDate = ref<string | null>(null)
const flexibility = ref(0)
const selectedDuration = ref('')
const flexState = ref<{ duration: string; months: string[] }>({ duration: '', months: [] })

function handleFlexState(state: { duration: string; months: string[] }) {
  flexState.value = state
  if (state.months.length > 0 && selectedDate.value) {
    selectedDate.value = null
  }
  if (state.duration) {
    selectedDuration.value = ''
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

const whenLabel = computed(() => {
  let whenPart = ''
  let durationPart = ''

  if (selectedDate.value) {
    const [, m, d] = selectedDate.value.split('-')
    whenPart = `${d}/${m}`
    if (flexibility.value > 0) whenPart += ` \u00B1${flexibility.value}`
  } else if (flexState.value.months.length > 0) {
    const monthLabels = flexState.value.months.map((key) => {
      const monthIndex = parseInt(key.split('-')[1], 10) - 1
      return monthNames.value[monthIndex]
    })
    whenPart = monthLabels.join(', ')
  } else {
    whenPart = t('header.flexibleLabel')
  }

  if (selectedDuration.value) {
    const dur = durationOptions.value.find(o => o.id === selectedDuration.value)
    if (dur) durationPart = dur.label
  } else if (flexState.value.duration) {
    const nightsOpt = durationOptions.value.find(o => o.id === flexState.value.duration)
    if (nightsOpt) {
      durationPart = nightsOpt.label
    } else {
      const typeLabels: Record<string, string> = {
        'weekend-fri-sun': t('header.flex.weekendFriSun'),
        'weekend-sat-sun': t('header.flex.weekendSatSun'),
        'long-weekend': t('header.flex.longWeekend'),
        'midweek': t('header.flex.midweek'),
      }
      durationPart = typeLabels[flexState.value.duration] || ''
    }
  } else {
    durationPart = t('header.anyDuration')
  }

  return `${whenPart}, ${durationPart}`
})

// --- WHO state ---
const group = ref({
  adults: persons.value || 2,
  children: [] as { age: number }[],
  rooms: rooms.value || 1,
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
  emit('search', {
    persons: totalPersons.value,
    rooms: group.value.rooms,
    duration: selectedDuration.value || flexState.value.duration || '',
    flexibility: flexibility.value,
    date: selectedDate.value,
  })
}
</script>

<style scoped>
.hotel-search-bar {
  position: relative;
}

.hotel-search-bar__fields {
  display: flex;
  align-items: stretch;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  overflow: hidden;
}

.hotel-search-bar__divider {
  width: 1px;
  background: var(--color-border);
  align-self: stretch;
}

.hsb-field {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background var(--transition-fast);
}

.hsb-field:hover {
  background: var(--color-background-secondary);
}

.hsb-field--active {
  background: var(--color-background-secondary);
}

.hsb-field__icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.hsb-field__text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.hsb-field__label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: var(--color-text-muted);
}

.hsb-field__value {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hsb-btn {
  flex-shrink: 0;
  padding: var(--space-md) var(--space-xl);
  background: var(--color-primary);
  color: #fff;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--transition-fast);
}

.hsb-btn:hover {
  background: var(--color-primary-hover);
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
