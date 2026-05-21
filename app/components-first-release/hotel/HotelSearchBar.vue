<template>
  <div class="hotel-search-bar" ref="barRef">
    <div class="search-bar">
      <!-- 1. Wanneer -->
      <button
        ref="whenFieldRef"
        class="search-bar__field search-bar__field--when"
        :class="{ 'search-bar__field--active': activePopup === 'when' }"
        @click="togglePopup('when')"
      >
        <span class="search-bar__field-body">
          <span class="search-bar__field-row">
            <span class="search-bar__field-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            </span>
            <span class="search-bar__label">{{ t('header.when') }}</span>
          </span>
          <span class="search-bar__value" :class="{ 'search-bar__value--placeholder': whenIsPlaceholder }">{{ whenOnlyLabel }}</span>
        </span>
        <span
          v-if="!whenIsPlaceholder"
          class="search-bar__clear"
          role="button"
          tabindex="0"
          :aria-label="t('header.clear')"
          @click.stop="clearWhen"
          @keydown.enter.stop.prevent="clearWhen"
          @keydown.space.stop.prevent="clearWhen"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </span>
      </button>

      <div class="search-bar__divider"></div>

      <!-- 2. Hoelang -->
      <button
        ref="howlongFieldRef"
        class="search-bar__field search-bar__field--howlong"
        :class="{ 'search-bar__field--active': activePopup === 'howlong' }"
        @click="togglePopup('howlong')"
      >
        <span class="search-bar__field-body">
          <span class="search-bar__field-row">
            <span class="search-bar__field-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>
            </span>
            <span class="search-bar__label">{{ t('header.howLong') }}</span>
          </span>
          <span class="search-bar__value" :class="{ 'search-bar__value--placeholder': howLongIsPlaceholder }">{{ howLongLabel }}</span>
        </span>
        <span
          v-if="!howLongIsPlaceholder"
          class="search-bar__clear"
          role="button"
          tabindex="0"
          :aria-label="t('header.clear')"
          @click.stop="clearHowLong"
          @keydown.enter.stop.prevent="clearHowLong"
          @keydown.space.stop.prevent="clearHowLong"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </span>
      </button>

      <div class="search-bar__divider"></div>

      <!-- 3. Wie gaat er mee -->
      <button
        ref="whoFieldRef"
        class="search-bar__field search-bar__field--who"
        :class="{ 'search-bar__field--active': activePopup === 'who' }"
        @click="togglePopup('who')"
      >
        <span class="search-bar__field-body">
          <span class="search-bar__field-row">
            <span class="search-bar__field-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <span class="search-bar__label">{{ t('header.whosComing') }}</span>
          </span>
          <span class="search-bar__value">{{ whoLabel }}</span>
        </span>
      </button>

      <!-- Submit button — two-line copy so the fields can be wider. -->
      <button
        class="search-bar__btn search-bar__btn--find-deals"
        @click="handleChangeSearch"
      >
        <span class="search-bar__btn-text">Toon beschikbare<br />arrangementen</span>
      </button>
    </div>

    <!-- Popups — positioned relative to bar -->
    <div v-if="activePopup" class="hsb-overlay" @click.self="closePopup">
      <!-- WHEN POPUP — calendar half of the combined search-bar popup -->
      <div v-if="activePopup === 'when'" class="popup popup--when" :style="popupStyle">
        <FirstReleaseDateAndDurationPopup
          mode="date"
          v-model:cal-month="calMonth"
          v-model:selected-date="selectedDate"
          :nights="selectedDurations"
          :any-duration="anyDuration"
          :flexible="localFlexible"
          @toggle-night="onToggleNight"
          @set-any-duration="setAnyDuration"
          @update:flexible="setLocalFlexible"
          @save="closePopup()"
          @clear="clearWhen"
        />
      </div>

      <!-- HOWLONG POPUP — duration half of the combined search-bar popup -->
      <div v-if="activePopup === 'howlong'" class="popup popup--howlong" :style="popupStyle">
        <FirstReleaseDateAndDurationPopup
          mode="duration"
          v-model:cal-month="calMonth"
          v-model:selected-date="selectedDate"
          :nights="selectedDurations"
          :any-duration="anyDuration"
          :flexible="localFlexible"
          @toggle-night="onToggleNight"
          @set-any-duration="setAnyDuration"
          @update:flexible="setLocalFlexible"
          @save="closePopup()"
          @clear="clearHowLong"
        />
      </div>

      <!-- WHO POPUP — MVP list. Same UI as SiteHeader. -->
      <div v-if="activePopup === 'who'" class="popup popup--who popup--who-mvp" :style="popupStyle">
        <ul class="who-mvp__list" role="listbox" aria-label="Aantal personen">
          <li
            v-for="opt in whoMvpOptions"
            :key="`${opt.adults}-${opt.rooms}`"
            role="option"
            :aria-selected="whoMvpSelectedKey === `${opt.adults}-${opt.rooms}`"
            class="who-mvp__item"
            :class="{ 'who-mvp__item--selected': whoMvpSelectedKey === `${opt.adults}-${opt.rooms}` }"
            @click="pickWhoMvp(opt)"
          >
            <span>{{ opt.adults }} personen / {{ opt.rooms }} {{ opt.rooms === 1 ? 'kamer' : 'kamers' }}</span>
            <svg
              v-if="whoMvpSelectedKey === `${opt.adults}-${opt.rooms}`"
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
            >
              <polyline points="5 12 10 17 19 7" />
            </svg>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { minRoomsFor, maxRoomsFor } from '~/utils-first-release/priceFormula'

const { t } = useFirstReleaseI18n()
const {
  persons, rooms,
  arrivalDate: globalArrivalDate,
  setArrivalDate,
  setSearchGroup,
  selectedNights: globalNights,
  setSelectedNights,
} = useFirstReleaseSearchState()

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
  // Calendar half is ~404 px (356 calendar + 24 + 24 padding); nights half
  // is ~272 px; who is ~360 px.
  const popupW = popup === 'when' ? 420 : popup === 'howlong' ? 320 : 360

  const fieldCenter = fieldRect.left + fieldRect.width / 2
  let left = fieldCenter - popupW / 2
  left = Math.max(8, Math.min(left, window.innerWidth - popupW - 8))

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

  nextTick(() => {
    const bar = barRef.value
    if (!bar) return
    const barRect = bar.getBoundingClientRect()
    const NAV_H = 120
    const POPUP_H = popup === 'when' ? 480 : popup === 'howlong' ? 380 : 480
    const popupTop = barRect.bottom + 8
    const popupBottom = popupTop + POPUP_H
    const overflowBottom = popupBottom - (window.innerHeight - 8)
    if (overflowBottom > 0) {
      const maxScroll = barRect.top - NAV_H - 16
      const wanted = Math.min(overflowBottom, Math.max(0, maxScroll))
      if (wanted > 0) {
        window.scrollBy({ top: wanted, behavior: 'smooth' })
        setTimeout(() => {
          popupStyle.value = calcPopupPosition(popup)
        }, 320)
      }
    }
  })
}

function closePopup() {
  if (activePopup.value === 'who') {
    setSearchGroup(group.value.adults + group.value.children.length, group.value.rooms)
  }
  activePopup.value = null
}

function clearWhen() {
  selectedDate.value = null
  localFlexible.value = false
}

function clearHowLong() {
  selectedDurations.value = []
  anyDuration.value = false
  setSelectedNights([])
}

// --- WHEN / DURATION state ---
const calMonth = ref({ year: new Date().getFullYear(), month: new Date().getMonth() })
const selectedDate = ref<string | null>(globalArrivalDate.value)
watch(selectedDate, (v) => { if (v !== globalArrivalDate.value) setArrivalDate(v) })
watch(globalArrivalDate, (v) => { if (v !== selectedDate.value) selectedDate.value = v })
const selectedDurations = ref<string[]>([...globalNights.value])
/** "Ik ben flexibel" tickbox inside the date popup. Local-only here —
 *  the hotel page doesn't push flexibility back into shared state. */
const localFlexible = ref(false)
/** "Maakt niet uit" tickbox inside the duration popup. */
const anyDuration = ref(globalNights.value.length === 0 ? false : false)

function setLocalFlexible(next: boolean) {
  localFlexible.value = next
  if (next) selectedDate.value = null
}

function onToggleNight(value: string) {
  const i = selectedDurations.value.indexOf(value)
  if (i === -1) selectedDurations.value.push(value)
  else selectedDurations.value.splice(i, 1)
  if (selectedDurations.value.length > 0) anyDuration.value = false
  setSelectedNights([...selectedDurations.value])
}

function setAnyDuration(next: boolean) {
  anyDuration.value = next
  if (next) {
    selectedDurations.value = []
    setSelectedNights([])
  }
}

watch(globalNights, (g) => {
  const next = [...g]
  if (JSON.stringify(next) !== JSON.stringify(selectedDurations.value)) {
    selectedDurations.value = next
  }
})

const durationOptions = computed(() => [
  { id: '1', label: t('header.duration.1night') },
  { id: '2', label: t('header.duration.2nights') },
  { id: '3', label: t('header.duration.3nights') },
  { id: '4', label: t('header.duration.4nights') },
  { id: '5+', label: t('header.duration.5nights') },
])

const monthNames = computed(() => Array.from({ length: 12 }, (_, i) => t(`header.months.${i}`)))

const whenOnlyLabel = computed(() => {
  if (selectedDate.value) {
    const [, m, d] = selectedDate.value.split('-')
    const monthName = monthNames.value[parseInt(m, 10) - 1]
    return `${parseInt(d, 10)} ${monthName}`
  }
  if (localFlexible.value) return 'Ik ben flexibel'
  return 'Kies datum'
})

const whenIsPlaceholder = computed(
  () => !selectedDate.value && !localFlexible.value,
)

const howLongLabel = computed(() => {
  if (anyDuration.value) return 'Maakt niet uit'
  const calDurs = selectedDurations.value
  if (calDurs.length > 0) {
    const labels = calDurs
      .map(id => durationOptions.value.find(o => o.id === id)?.label)
      .filter(Boolean) as string[]
    return labels.join(' of ')
  }
  return 'Kies reisduur'
})

const howLongIsPlaceholder = computed(
  () => selectedDurations.value.length === 0 && !anyDuration.value,
)

// --- WHO state ---
const group = ref({
  adults: persons.value || 2,
  children: [] as { age: number }[],
  rooms: rooms.value || 1,
})
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

watch(
  () => group.value.adults + group.value.children.length,
  (total) => {
    if (activePopup.value !== 'who') return
    const min = minRoomsFor(total)
    const max = maxRoomsFor(total)
    if (group.value.rooms < min) {
      group.value = { ...group.value, rooms: min }
    } else if (group.value.rooms > max) {
      group.value = { ...group.value, rooms: max }
    }
  },
)

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

const whoMvpOptions = computed(() => {
  const out: { adults: number; rooms: number }[] = []
  for (let r = 1; r <= 8; r++) {
    out.push({ adults: r * 2, rooms: r })
  }
  return out
})

const whoMvpSelectedKey = computed(() => {
  if (group.value.children.length > 0) return null
  return `${group.value.adults}-${group.value.rooms}`
})

function pickWhoMvp(opt: { adults: number; rooms: number }) {
  group.value = { adults: opt.adults, children: [], rooms: opt.rooms }
  closePopup()
}

defineExpose({ totalPersons })

function handleChangeSearch() {
  closePopup()
  const dur = selectedDurations.value[0] || ''
  emit('search', {
    persons: totalPersons.value,
    rooms: group.value.rooms,
    duration: dur,
    flexibility: 0,
    date: selectedDate.value,
  })
}
</script>

<style scoped>
/* ===== HOTEL MID-PAGE SEARCH BAR =====
   Mirrors SiteHeader's internal-page `.search-bar` (white background, grey
   inset stroke, light-grey dividers, uppercase 12 px labels, orange
   find-deals pill). Self-contained — no `.site-header` parent selector
   here, so the same look works inside the deals section. */
.hotel-search-bar {
  position: relative;
  width: 100%;
}

.search-bar {
  width: 100%;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 6px;
  height: auto;
  padding: 8px;
  position: relative;
  /* Grey inset stroke + soft drop shadow, identical to SiteHeader's
     `.site-header:not(.site-header--overlay) .search-bar` rule. */
  box-shadow: inset 0 0 0 2px var(--color-border, #d4d4d4),
              0 10px 24px rgba(0, 0, 0, 0.18);
  gap: 0;
}

.search-bar__field {
  flex: 1 0 0;
  min-width: 0;
  margin: 0;
  padding: 0 18px;
  height: 60px;
  display: flex;
  align-items: stretch;
  gap: 12px;
  cursor: pointer;
  border: none;
  background: transparent;
  text-align: left;
  border-radius: 0;
  transition: background var(--transition-fast);
}

.search-bar__field--when {
  border-radius: 4px 0 0 4px;
}
.search-bar__field--who {
  border-radius: 0 4px 4px 0;
}

.search-bar__field:hover {
  background: var(--color-background-secondary, #faf9f6);
}

.search-bar__field--active {
  background: #eeeeee;
}

.search-bar__field-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  padding: 8px 0;
  min-width: 0;
  height: 100%;
}

.search-bar__field-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  line-height: 1;
}

.search-bar__field-icon {
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  color: var(--color-text-primary);
}

.search-bar__field-icon svg {
  display: block;
  width: 1em;
  height: 1em;
}

.search-bar__label {
  font-size: 12px;
  letter-spacing: 1.3px;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  font-weight: 400;
  line-height: 1;
}

.search-bar__value {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.search-bar__value--placeholder {
  color: var(--color-text-secondary);
  font-weight: 400;
}

.search-bar__divider {
  width: 1px;
  height: 60px;
  align-self: center;
  background: var(--color-border);
  flex-shrink: 0;
}

.search-bar__clear {
  flex-shrink: 0;
  align-self: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.search-bar__clear:hover,
.search-bar__clear:focus-visible {
  background: var(--color-border-light, #ececec);
  color: var(--color-text-primary);
  outline: none;
}

/* Two-line orange pill — narrower than the homepage's single-line button
   so the fields next to it can breathe. */
.search-bar__btn--find-deals {
  background: var(--color-primary);
  color: #fff;
  height: 60px;
  width: auto;
  padding: 0 20px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.07px;
  margin-left: 12px;
  border: none;
  cursor: pointer;
  text-align: center;
  transition: background var(--transition-fast);
}

.search-bar__btn-text { display: inline-block; }

.search-bar__btn--find-deals:hover {
  background: var(--color-primary-hover);
}

/* ===== POPUPS ===== */
.hsb-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
}

.popup {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0, 0, 0, 0.08);
  max-height: 70vh;
  overflow-y: auto;
  z-index: 501;
}

.popup--when,
.popup--howlong {
  padding: 0;
  max-height: none;
  overflow: visible;
}

.popup--who {
  padding: var(--space-lg);
  max-width: 420px;
}

.popup--who-mvp {
  padding: 8px 0;
}

.who-mvp__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.who-mvp__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 400;
  color: #0e0e0c;
  line-height: 1.2;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
}

.who-mvp__item:hover {
  background: rgba(233, 113, 50, 0.08);
  color: var(--color-primary);
}

.who-mvp__item--selected {
  font-weight: 600;
  color: var(--color-primary);
  background: rgba(233, 113, 50, 0.08);
}

/* Responsive */
@media (max-width: 768px) {
  .search-bar { flex-direction: column; height: auto; padding: 6px; }
  .search-bar__field { width: 100%; height: 56px; padding: 0 14px; }
  .search-bar__divider { width: 100%; height: 1px; }
  .search-bar__btn--find-deals { margin-left: 0; width: 100%; margin-top: 6px; }
}
</style>
