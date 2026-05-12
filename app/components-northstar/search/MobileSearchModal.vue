<template>
  <!-- Main search overview modal -->
  <NorthstarMobileFullscreen :open="open" :title="t('header.search')" @close="$emit('close')">
    <div class="mobile-search">
      <!-- Row 1: Waarheen -->
      <button type="button" class="mobile-search__row" @click="activePicker = 'destination'">
        <div class="mobile-search__row-text">
          <span class="mobile-search__row-label">{{ t('header.destination') }}</span>
          <span class="mobile-search__row-value">{{ destinationSummary }}</span>
        </div>
        <svg class="mobile-search__row-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <!-- Row 2: Wanneer & hoelang -->
      <button type="button" class="mobile-search__row" @click="activePicker = 'when'">
        <div class="mobile-search__row-text">
          <span class="mobile-search__row-label">{{ t('header.whenAndHowLong') }}</span>
          <span class="mobile-search__row-value">{{ whenSummary }}</span>
        </div>
        <svg class="mobile-search__row-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <!-- Row 3: Wie gaat er mee -->
      <button type="button" class="mobile-search__row" @click="activePicker = 'who'">
        <div class="mobile-search__row-text">
          <span class="mobile-search__row-label">{{ t('header.whosComing') }}</span>
          <span class="mobile-search__row-value">{{ whoSummary }}</span>
        </div>
        <svg class="mobile-search__row-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>

    <template #footer>
      <button type="button" class="mobile-search__submit" @click="$emit('search')">
        {{ t('header.search') }}
      </button>
    </template>
  </NorthstarMobileFullscreen>

  <!-- Sub-modal: Waarheen picker -->
  <NorthstarMobileFullscreen
    :open="open && activePicker === 'destination'"
    :title="t('header.destination')"
    @close="activePicker = null"
  >
    <NorthstarDestinationPopup
      :destinations="destinations"
      :themes="themes"
      :selected-destinations="selectedDestinations"
      :selected-themes="selectedThemes"
      :selected-cities="selectedCities"
      :selection-order="selectionOrder"
      @toggle-destination="$emit('toggle-destination', $event)"
      @toggle-theme="$emit('toggle-theme', $event)"
      @select-hotel="$emit('select-hotel', $event)"
      @select-city="$emit('select-city', $event)"
      @remove-city="$emit('remove-city', $event)"
      @save="activePicker = null"
      @clear="$emit('clear-destinations')"
    />
  </NorthstarMobileFullscreen>

  <!-- Sub-modal: Wanneer & hoelang picker -->
  <NorthstarMobileFullscreen
    :open="open && activePicker === 'when'"
    :title="t('header.whenAndHowLong')"
    @close="activePicker = null"
  >
    <NorthstarDatePopup
      :cal-month="calMonth"
      :selected-date="selectedDate"
      :flexibility="flexibility"
      :selected-durations="selectedDurations"
      @update:cal-month="$emit('update:calMonth', $event)"
      @update:selected-date="$emit('update:selectedDate', $event)"
      @update:flexibility="$emit('update:flexibility', $event)"
      @update:selected-durations="$emit('update:selectedDurations', $event)"
      @update:flex-state="$emit('update:flexState', $event)"
      @save="activePicker = null"
      @clear="() => {}"
    />
  </NorthstarMobileFullscreen>

  <!-- Sub-modal: Wie gaat er mee picker -->
  <NorthstarMobileFullscreen
    :open="open && activePicker === 'who'"
    :title="t('header.whosComing')"
    @close="activePicker = null"
  >
    <div class="mobile-search__who-body">
      <!-- Adults -->
      <div class="who-row">
        <div class="who-row__info">
          <span class="who-row__label">{{ t('header.adults') }}</span>
          <span class="who-row__sub">{{ t('header.adultsAge') }}</span>
        </div>
        <div class="stepper">
          <button class="stepper__btn" :disabled="localGroup.adults <= 1" @click="update({ adults: localGroup.adults - 1 })">&minus;</button>
          <span class="stepper__val">{{ localGroup.adults }}</span>
          <button class="stepper__btn" :disabled="localGroup.adults >= 8" @click="update({ adults: localGroup.adults + 1 })">+</button>
        </div>
      </div>

      <!-- Children -->
      <div class="who-row">
        <div class="who-row__info">
          <span class="who-row__label">{{ t('header.children') }}</span>
          <span class="who-row__sub">{{ t('header.childrenAge') }}</span>
        </div>
        <div class="stepper">
          <button class="stepper__btn" :disabled="localGroup.children.length <= 0" @click="removeChild">&minus;</button>
          <span class="stepper__val">{{ localGroup.children.length }}</span>
          <button class="stepper__btn" :disabled="localGroup.children.length >= 6" @click="addChild">+</button>
        </div>
      </div>

      <!-- Child ages -->
      <div v-if="localGroup.children.length > 0" class="who-ages">
        <div v-for="(child, idx) in localGroup.children" :key="idx" class="who-ages__row">
          <span class="who-ages__label">{{ t('travelGroup.childAge') }} {{ idx + 1 }}</span>
          <select class="who-ages__select" :value="child.age" @change="setChildAge(idx, Number(($event.target as HTMLSelectElement).value))">
            <option v-for="n in 18" :key="n - 1" :value="n - 1">{{ n - 1 }} {{ t('travelGroup.years') }}</option>
          </select>
        </div>
      </div>

      <!-- Rooms -->
      <div class="who-row">
        <div class="who-row__info">
          <span class="who-row__label">{{ t('travelGroup.rooms') }}</span>
        </div>
        <div class="stepper">
          <button class="stepper__btn" :disabled="localGroup.rooms <= 1" @click="update({ rooms: localGroup.rooms - 1 })">&minus;</button>
          <span class="stepper__val">{{ localGroup.rooms }}</span>
          <button class="stepper__btn" :disabled="localGroup.rooms >= (localGroup.adults + localGroup.children.length)" @click="update({ rooms: localGroup.rooms + 1 })">+</button>
        </div>
      </div>
    </div>

    <template #footer>
      <button type="button" class="mobile-search__submit" @click="activePicker = null">{{ t('header.done') }}</button>
    </template>
  </NorthstarMobileFullscreen>
</template>

<script setup lang="ts">
const { t } = useNorthstarI18n()

const props = defineProps<{
  open: boolean
  destinations: Array<{ id: string; name: string; country: string; emoji: string }>
  themes: Array<{ id: string; name: string; emoji: string }>
  selectedDestinations: string[]
  selectedThemes: string[]
  selectedCities?: Array<{ name: string; province: string }>
  selectionOrder?: Array<{ type: 'destination' | 'theme' | 'city'; key: string }>
  calMonth: { year: number; month: number }
  selectedDate: string | null
  flexibility: number
  selectedDurations: string[]
  searchGroup: { adults: number; children: { age: number }[]; rooms: number; dog?: boolean }
  destinationLabel?: string
  whenLabel?: string
  whoLabel?: string
}>()

const emit = defineEmits<{
  close: []
  'toggle-destination': [id: string]
  'toggle-theme': [id: string]
  'select-hotel': [slug: string]
  'select-city': [city: { name: string; province: string }]
  'remove-city': [cityName: string]
  'clear-destinations': []
  'update:calMonth': [val: { year: number; month: number }]
  'update:selectedDate': [val: string | null]
  'update:flexibility': [val: number]
  'update:selectedDurations': [val: string[]]
  'update:flexState': [val: { durations: string[]; months: string[] }]
  'update:searchGroup': [val: { adults: number; children: { age: number }[]; rooms: number; dog?: boolean }]
  search: []
}>()

const activePicker = ref<'destination' | 'when' | 'who' | null>(null)

// Reset sub-picker when main modal closes
watch(() => props.open, (isOpen) => { if (!isOpen) activePicker.value = null })

const destinationSummary = computed(() => {
  if (props.destinationLabel) return props.destinationLabel
  if (props.selectedDestinations.length + props.selectedThemes.length + (props.selectedCities?.length || 0) > 0) return '—'
  return t('header.chooseDestination')
})

const whenSummary = computed(() => {
  if (props.whenLabel) return props.whenLabel
  if (props.selectedDate) return props.selectedDate
  return t('header.flexibleLabel') + ', ' + t('header.anyDuration')
})

const whoSummary = computed(() => {
  if (props.whoLabel) return props.whoLabel
  const parts: string[] = []
  parts.push(`${props.searchGroup.adults} ${t('header.adults').toLowerCase()}`)
  if (props.searchGroup.children.length > 0) {
    parts.push(`${props.searchGroup.children.length} ${t('header.children').toLowerCase()}`)
  }
  return parts.join(', ')
})

// --- WHO local copy ---
const localGroup = ref({ ...props.searchGroup, children: [...props.searchGroup.children] })

watch(() => props.searchGroup, (val) => {
  localGroup.value = { ...val, children: [...val.children] }
}, { deep: true })

/** Clamp rooms ≤ total guests after any group change (no empty rooms). */
function clampRooms() {
  const total = localGroup.value.adults + localGroup.value.children.length
  if (localGroup.value.rooms > total) localGroup.value.rooms = Math.max(1, total)
}

function update(partial: Partial<typeof localGroup.value>) {
  localGroup.value = { ...localGroup.value, ...partial }
  clampRooms()
  emit('update:searchGroup', { ...localGroup.value })
}
function addChild() {
  localGroup.value.children.push({ age: 4 })
  emit('update:searchGroup', { ...localGroup.value })
}
function removeChild() {
  localGroup.value.children.pop()
  clampRooms()
  emit('update:searchGroup', { ...localGroup.value })
}
function setChildAge(idx: number, age: number) {
  localGroup.value.children[idx].age = age
  emit('update:searchGroup', { ...localGroup.value })
}
</script>

<style scoped>
.mobile-search {
  padding: var(--space-md) var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.mobile-search__row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: border-color 150ms ease, background 150ms ease;
}

.mobile-search__row:hover,
.mobile-search__row:active {
  border-color: var(--color-primary);
  background: rgba(251, 134, 45, 0.04);
}

.mobile-search__row-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mobile-search__row-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mobile-search__row-value {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-search__row-chevron {
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.mobile-search__submit {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  font-family: inherit;
}

.mobile-search__submit:hover {
  background: var(--color-primary-hover);
}

/* --- WHO body (sub-picker) --- */
.mobile-search__who-body {
  padding: var(--space-md) var(--space-lg);
}

.who-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) 0;
  border-top: 1px solid var(--color-border-light);
}

.who-row:first-of-type {
  border-top: none;
}

.who-row__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.who-row__label {
  font-size: 15px;
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
  gap: 12px;
}

.stepper__btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.stepper__btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.stepper__val {
  min-width: 24px;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.who-ages {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-sm) 0;
}

.who-ages__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px var(--space-sm);
  background: var(--color-background-secondary);
  border-radius: var(--radius-sm);
}

.who-ages__label {
  font-size: 13px;
  color: var(--color-text-primary);
}

.who-ages__select {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 6px 8px;
  background: #fff;
  font-size: 13px;
  font-family: inherit;
}
</style>
