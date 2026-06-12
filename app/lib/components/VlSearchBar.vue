<!--
  VlSearchBar — Desktop horizontal search bar.

  Three fields — "Wanneer" (arrival date) | "Hoelang" (duration) |
  "Wie gaat er mee" (persons / rooms) — each opening a popup below it.
  Composes VlDatePicker, VlDurationPicker and VlPersonsPicker. Values apply
  live (no submit button); every change is emitted immediately. White
  fields, grey inset border, no drop shadow. Clicking outside an open
  popup closes it (via useClickOutside).

  Props:
    - arrivalDate: string | null
        Selected arrival date 'YYYY-MM-DD'.
    - nights: string[]
        Selected night ids (e.g. ['2','3']).
    - persons: number
        Selected persons count.
    - rooms: number
        Selected rooms count.
    - availability?: Record<string, { available: boolean; price?: number; premium?: boolean }>
        Optional availability map forwarded to VlDatePicker.

  Events:
    - update:arrivalDate  — new arrival date (or null).
    - update:nights       — new array of night ids.
    - update:persons      — new persons count.
    - update:rooms        — new rooms count.

  Fully decoupled: holds only transient UI state (which popup is open and
  the visible calendar month). All search values come from props.
-->
<template>
  <div class="vl-search-bar" ref="barRef">
    <div class="search-bar">
      <!-- 1. Wanneer -->
      <button
        class="search-bar__field search-bar__field--when"
        :class="{ 'search-bar__field--active': activePopup === 'when' }"
        @click="togglePopup('when')"
      >
        <span class="search-bar__field-body">
          <span class="search-bar__field-row">
            <span class="search-bar__field-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            </span>
            <span class="search-bar__label">Wanneer</span>
          </span>
          <span class="search-bar__value" :class="{ 'search-bar__value--placeholder': whenIsPlaceholder }">{{ whenLabel }}</span>
        </span>
        <span
          v-if="!whenIsPlaceholder"
          class="search-bar__clear"
          role="button"
          tabindex="0"
          aria-label="Wissen"
          @click.stop="clearWhen"
          @keydown.enter.stop.prevent="clearWhen"
          @keydown.space.stop.prevent="clearWhen"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </span>
      </button>

      <div class="search-bar__divider"></div>

      <!-- 2. Hoelang -->
      <button
        class="search-bar__field search-bar__field--howlong"
        :class="{ 'search-bar__field--active': activePopup === 'howlong' }"
        @click="togglePopup('howlong')"
      >
        <span class="search-bar__field-body">
          <span class="search-bar__field-row">
            <span class="search-bar__field-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>
            </span>
            <span class="search-bar__label">Hoelang</span>
          </span>
          <span class="search-bar__value" :class="{ 'search-bar__value--placeholder': howLongIsPlaceholder }">{{ howLongLabel }}</span>
        </span>
        <span
          v-if="!howLongIsPlaceholder"
          class="search-bar__clear"
          role="button"
          tabindex="0"
          aria-label="Wissen"
          @click.stop="clearHowLong"
          @keydown.enter.stop.prevent="clearHowLong"
          @keydown.space.stop.prevent="clearHowLong"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </span>
      </button>

      <div class="search-bar__divider"></div>

      <!-- 3. Wie gaat er mee -->
      <button
        class="search-bar__field search-bar__field--who"
        :class="{ 'search-bar__field--active': activePopup === 'who' }"
        @click="togglePopup('who')"
      >
        <span class="search-bar__field-body">
          <span class="search-bar__field-row">
            <span class="search-bar__field-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <span class="search-bar__label">Wie gaat er mee</span>
          </span>
          <span class="search-bar__value">{{ whoLabel }}</span>
        </span>
      </button>
    </div>

    <!-- WANNEER popup — calendar. Picking a date auto-closes. -->
    <div v-if="activePopup === 'when'" class="vl-popup vl-popup--when" :style="popupStyle">
      <VlDatePicker
        :model-value="arrivalDate"
        :month="calMonth"
        :availability="availability"
        :flexible="flexible"
        @update:model-value="onDatePicked"
        @update:month="calMonth = $event"
        @update:flexible="flexible = $event"
      />
    </div>

    <!-- HOELANG popup — duration list. -->
    <div v-if="activePopup === 'howlong'" class="vl-popup vl-popup--howlong" :style="popupStyle">
      <VlDurationPicker
        :model-value="nights"
        :any-duration="anyDuration"
        @update:model-value="$emit('update:nights', $event)"
        @update:any-duration="anyDuration = $event"
      />
    </div>

    <!-- WIE popup — persons / rooms list. Picking closes. -->
    <div v-if="activePopup === 'who'" class="vl-popup vl-popup--who" :style="popupStyle">
      <VlPersonsPicker
        :persons="persons"
        :rooms="rooms"
        @update:persons="onPersons"
        @update:rooms="onRooms"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useClickOutside } from '~/lib/composables/useClickOutside'

interface DayAvailability { available: boolean; price?: number; premium?: boolean }

const props = withDefaults(defineProps<{
  arrivalDate: string | null
  nights: string[]
  persons: number
  rooms: number
  availability?: Record<string, DayAvailability>
}>(), {})

const emit = defineEmits<{
  'update:arrivalDate': [val: string | null]
  'update:nights': [val: string[]]
  'update:persons': [val: number]
  'update:rooms': [val: number]
}>()

const MONTH_NAMES = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
]

const DURATION_LABELS: Record<string, string> = {
  '1': '1 nacht',
  '2': '2 nachten',
  '3': '3 nachten',
  '4': '4 nachten',
  '5+': '5+ nachten',
}

type PopupName = 'when' | 'howlong' | 'who'
const barRef = ref<HTMLElement | null>(null)
const activePopup = ref<PopupName | null>(null)
const popupStyle = ref<Record<string, string>>({})

// Transient UI-only state — never pushed to the consumer.
const calMonth = ref({ year: new Date().getFullYear(), month: new Date().getMonth() })
const flexible = ref(false)
// "Maakt niet uit" mirrors an empty nights selection chosen explicitly.
const anyDuration = ref(false)

// Close the open popup on any click outside the bar.
useClickOutside(barRef, () => { activePopup.value = null })

function fieldSelector(popup: PopupName) {
  return `.search-bar__field--${popup}`
}

function calcPopupPosition(popup: PopupName) {
  const bar = barRef.value
  if (!bar) return {}
  const field = bar.querySelector<HTMLElement>(fieldSelector(popup))
  if (!field) return {}
  const barRect = bar.getBoundingClientRect()
  const fieldRect = field.getBoundingClientRect()
  const popupW = popup === 'when' ? 420 : popup === 'howlong' ? 320 : 360
  const fieldCenter = fieldRect.left - barRect.left + fieldRect.width / 2
  let left = fieldCenter - popupW / 2
  const maxLeft = barRect.width - popupW
  left = Math.max(0, Math.min(left, maxLeft))
  return {
    position: 'absolute',
    left: `${left}px`,
    top: `${barRect.height + 8}px`,
    width: `${popupW}px`,
    zIndex: '501',
  }
}

function togglePopup(popup: PopupName) {
  if (activePopup.value === popup) {
    activePopup.value = null
    return
  }
  popupStyle.value = calcPopupPosition(popup)
  activePopup.value = popup
}

function clearWhen() {
  flexible.value = false
  emit('update:arrivalDate', null)
}

function clearHowLong() {
  anyDuration.value = false
  emit('update:nights', [])
}

// Date selection is self-confirming — apply and close.
function onDatePicked(val: string | null) {
  emit('update:arrivalDate', val)
  if (val) activePopup.value = null
}

function onPersons(val: number) {
  emit('update:persons', val)
}
function onRooms(val: number) {
  emit('update:rooms', val)
  // Picking a persons/rooms preset is self-confirming — close.
  activePopup.value = null
}

const whenLabel = computed(() => {
  if (props.arrivalDate) {
    const [, m, d] = props.arrivalDate.split('-')
    return `${parseInt(d, 10)} ${MONTH_NAMES[parseInt(m, 10) - 1]}`
  }
  if (flexible.value) return 'Ik ben flexibel'
  return 'Kies datum'
})
const whenIsPlaceholder = computed(() => !props.arrivalDate && !flexible.value)

const howLongLabel = computed(() => {
  if (anyDuration.value) return 'Maakt niet uit'
  if (props.nights.length > 0) {
    return props.nights.map(id => DURATION_LABELS[id] ?? id).join(' of ')
  }
  return 'Kies reisduur'
})
const howLongIsPlaceholder = computed(() => props.nights.length === 0 && !anyDuration.value)

const whoLabel = computed(() => {
  const personWord = props.persons === 1 ? 'persoon' : 'personen'
  const roomWord = props.rooms === 1 ? 'kamer' : 'kamers'
  return `${props.persons} ${personWord} / ${props.rooms} ${roomWord}`
})
</script>

<style scoped>
/* Mirrors the prototype's internal-page search bar: white background, grey
   inset stroke, light-grey dividers, uppercase 12px labels. No drop shadow,
   no submit button. */
.vl-search-bar {
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
  box-shadow: inset 0 0 0 2px var(--color-border, #d4d4d4);
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

.search-bar__field--when { border-radius: 4px 0 0 4px; }
.search-bar__field--who { border-radius: 0 4px 4px 0; }

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
  align-self: flex-end;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 21px;
  height: 21px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
  margin-right: -9px;
  margin-bottom: 7px;
}
.search-bar__clear:hover,
.search-bar__clear:focus-visible {
  background: var(--color-border-light, #ececec);
  color: var(--color-text-primary);
  outline: none;
}

/* Popups — anchored to the bar (absolute) so they scroll with it. */
.vl-popup {
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 501;
  overflow: visible;
}

.vl-popup--who {
  padding: 0;
  max-width: 420px;
}

@media (max-width: 768px) {
  .search-bar { flex-direction: column; height: auto; padding: 6px; }
  .search-bar__field { width: 100%; height: 56px; padding: 0 14px; }
  .search-bar__divider { width: 100%; height: 1px; }
}
</style>
