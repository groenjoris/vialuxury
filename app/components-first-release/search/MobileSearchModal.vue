<template>
  <!-- Slide-in mobile search modal. Dark surround, white form fields.
       Waarheen is a real input with live suggestions; the other fields
       are tap-to-expand inline pickers styled as form fields. -->
  <Teleport to="body">
    <Transition name="msm-slide">
      <div v-if="open" class="msm" role="dialog" aria-label="Zoeken">
        <header class="msm__header">
          <h2 class="msm__title">Doorzoek {{ totalArrangements }} arrangementen</h2>
          <button
            type="button"
            class="msm__close"
            :aria-label="t('common.close') || 'Sluit'"
            @click="$emit('close')"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div class="msm__body">
          <!-- Waarheen — the field itself is the typing surface. Tapping
               focuses the input, suggestions appear below. The
               DestinationPopup's own input is hidden via CSS; its
               filter is driven by `destinationQuery`. -->
          <section class="msm-field">
            <div class="msm-field__heading">
              <svg class="msm-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span class="msm-field__label">{{ t('header.destination') }}</span>
            </div>
            <div
              class="msm-field__card msm-field__card--input"
              :class="{ 'msm-field__card--active': active === 'where' }"
            >
              <input
                ref="destinationInputRef"
                v-model="destinationQuery"
                type="text"
                class="msm-field__input"
                :placeholder="destinationPlaceholder"
                autocomplete="off"
                @focus="active = 'where'"
              />
              <button
                v-if="destinationQuery.length > 0 || hasDestinationPick"
                type="button"
                class="msm-field__clear"
                aria-label="Wissen"
                @click.stop="clearDestinationField"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <Transition name="msm-fade">
              <div v-if="active === 'where'" class="msm-field__panel msm-field__panel--dest">
                <FirstReleaseDestinationPopup
                  inline
                  single-select
                  v-model:query="destinationQuery"
                  :destinations="destinations"
                  :themes="themes"
                  :selected-destinations="selectedDestinations"
                  :selected-themes="selectedThemes"
                  :selected-cities="selectedCities"
                  :selection-order="selectionOrder"
                  @toggle-destination="onPickDestination"
                  @toggle-theme="onPickTheme"
                  @select-hotel="onPickHotel"
                  @select-city="onPickCity"
                  @remove-city="$emit('remove-city', $event)"
                  @save="active = null"
                  @clear="$emit('clear-destinations')"
                />
              </div>
            </Transition>
          </section>

          <!-- Wanneer — white form field; tap reveals calendar below.
               When opened, the section auto-scrolls into view so the
               full calendar lands inside the modal body's viewport. -->
          <section class="msm-field" ref="whenSectionRef">
            <div class="msm-field__heading">
              <svg class="msm-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              <span class="msm-field__label">{{ t('header.when') }}</span>
            </div>
            <div
              class="msm-field__card msm-field__card--button"
              :class="{ 'msm-field__card--active': active === 'when' }"
              role="button"
              tabindex="0"
              :aria-expanded="active === 'when'"
              @click="toggle('when')"
              @keydown.enter.prevent="toggle('when')"
              @keydown.space.prevent="toggle('when')"
            >
              <span class="msm-field__value" :class="{ 'msm-field__value--placeholder': !selectedDate && !whenFlexible }">
                {{ whenSummary }}
              </span>
              <button
                v-if="selectedDate || whenFlexible"
                type="button"
                class="msm-field__clear"
                aria-label="Wissen"
                @click.stop="onClearWhen"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <Transition name="msm-fade">
              <div v-if="active === 'when'" class="msm-field__panel">
                <FirstReleaseDateAndDurationPopup
                  mode="date"
                  hide-footer
                  :cal-month="calMonth"
                  :selected-date="selectedDate"
                  :flexible="whenFlexible"
                  :nights="selectedDurations"
                  @update:cal-month="$emit('update:calMonth', $event)"
                  @update:selected-date="onPickDate"
                  @update:flexible="onPickFlexible"
                  @save="active = null"
                  @clear="onClearWhen"
                />
              </div>
            </Transition>
          </section>

          <!-- Hoelang — white form field; tap reveals duration picker.
               Auto-scrolls into view + own Klaar button at the top-right
               (multi-select needs an explicit confirm). -->
          <section class="msm-field" ref="howLongSectionRef">
            <div class="msm-field__heading">
              <svg class="msm-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9"/>
                <polyline points="12 7 12 12 15 14"/>
              </svg>
              <span class="msm-field__label">{{ t('header.howLong') }}</span>
            </div>
            <div
              class="msm-field__card msm-field__card--button"
              :class="{ 'msm-field__card--active': active === 'howlong' }"
              role="button"
              tabindex="0"
              :aria-expanded="active === 'howlong'"
              @click="toggle('howlong')"
              @keydown.enter.prevent="toggle('howlong')"
              @keydown.space.prevent="toggle('howlong')"
            >
              <span class="msm-field__value">
                {{ howLongSummary }}
              </span>
              <button
                v-if="selectedDurations.length > 0"
                type="button"
                class="msm-field__clear"
                aria-label="Wissen"
                @click.stop="onClearHowLong"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <Transition name="msm-fade">
              <div v-if="active === 'howlong'" class="msm-field__panel msm-field__panel--howlong">
                <!-- "Kies reisduur" title only — the explicit Klaar
                     button was removed; tapping the field header again
                     (or any other field) collapses this panel. -->
                <div class="msm-field__panel-toolbar">
                  <h4 class="msm-field__panel-title">Kies reisduur</h4>
                </div>
                <FirstReleaseDateAndDurationPopup
                  mode="duration"
                  hide-footer
                  :cal-month="calMonth"
                  :selected-date="selectedDate"
                  :nights="selectedDurations"
                  :any-duration="selectedDurations.length === 0"
                  @toggle-night="onToggleNight"
                  @set-any-duration="onSetAnyDuration"
                  @save="active = null"
                  @clear="onClearHowLong"
                />
              </div>
            </Transition>
          </section>

          <!-- Wie gaat er mee — white form field with MVP list.
               Auto-scrolls into view on open. -->
          <section class="msm-field" ref="whoSectionRef">
            <div class="msm-field__heading">
              <svg class="msm-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span class="msm-field__label">{{ t('header.whosComing') }}</span>
            </div>
            <button
              type="button"
              class="msm-field__card msm-field__card--button"
              :class="{ 'msm-field__card--active': active === 'who' }"
              @click="toggle('who')"
              :aria-expanded="active === 'who'"
            >
              <span class="msm-field__value">{{ whoSummary }}</span>
            </button>
            <Transition name="msm-fade">
              <div v-if="active === 'who'" class="msm-field__panel msm-field__panel--list">
                <ul class="msm-who__list" role="listbox" :aria-label="t('header.whosComing')">
                  <li
                    v-for="opt in whoMvpOptions"
                    :key="`${opt.adults}-${opt.rooms}`"
                    role="option"
                    :aria-selected="whoMvpSelectedKey === `${opt.adults}-${opt.rooms}`"
                    class="msm-who__item"
                    :class="{ 'msm-who__item--selected': whoMvpSelectedKey === `${opt.adults}-${opt.rooms}` }"
                    @click="pickWho(opt)"
                  >
                    <span>{{ opt.adults }} personen / {{ opt.rooms }} {{ opt.rooms === 1 ? 'kamer' : 'kamers' }}</span>
                    <svg
                      v-if="whoMvpSelectedKey === `${opt.adults}-${opt.rooms}`"
                      width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="3"
                      stroke-linecap="round" stroke-linejoin="round"
                    >
                      <polyline points="5 12 10 17 19 7" />
                    </svg>
                  </li>
                </ul>
              </div>
            </Transition>
          </section>
        </div>

        <footer class="msm__footer">
          <!-- Submit — same wording as the desktop searchbar CTA.
               The `search` emit is wired to `handleMobileSearch` in
               SiteHeader which commits drafts and navigates to
               `/first-release/search`. -->
          <button type="button" class="msm__submit" @click="$emit('search')">
            Vind deals
          </button>
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { t } = useFirstReleaseI18n()

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
  /** Live total of all arrangements — shown in the modal title. */
  totalArrangements?: number
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

/** Single active picker. Modal opens with everything collapsed. */
const active = ref<'where' | 'when' | 'howlong' | 'who' | null>(null)

const whenSectionRef = ref<HTMLElement | null>(null)
const howLongSectionRef = ref<HTMLElement | null>(null)
const whoSectionRef = ref<HTMLElement | null>(null)

function toggle(name: 'where' | 'when' | 'howlong' | 'who') {
  active.value = active.value === name ? null : name
  // Auto-scroll the field's section into view so the inline panel
  // lands inside the modal body's viewport instead of being clipped.
  let target: HTMLElement | null = null
  if (active.value === 'when') target = whenSectionRef.value
  else if (active.value === 'howlong') target = howLongSectionRef.value
  else if (active.value === 'who') target = whoSectionRef.value
  if (target) {
    nextTick(() => {
      target!.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }
}

// Reset section state whenever the modal opens / closes.
watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    active.value = null
    destinationQuery.value = ''
    whenFlexible.value = false
  }
})

// ─── Waarheen typing surface ────────────────────────────────────────────────
// `destinationQuery` is the v-model:query for the DestinationPopup — its
// own input is hidden via CSS in the mobile modal scope.
const destinationQuery = ref('')
const destinationInputRef = ref<HTMLInputElement | null>(null)

const destinationPlaceholder = computed(() => {
  if (props.destinationLabel && props.destinationLabel.trim()) return props.destinationLabel
  return 'Bestemming, stad of hotel'
})

function clearDestinationField() {
  destinationQuery.value = ''
  emit('clear-destinations')
  // Clearing also collapses the dropdown.
  active.value = null
  destinationInputRef.value?.blur()
}

// ─── Destination single-select handlers ─────────────────────────────────────
// Every pick wipes the previous destinations / themes / cities / hotels
// and applies the new one, then auto-collapses the field.

const hasDestinationPick = computed(() =>
  props.selectedDestinations.length
    + props.selectedThemes.length
    + (props.selectedCities?.length || 0) > 0,
)

/** After any pick: clear previous selections, emit the new one, then
 *  close the Waarheen field + drop input focus so the dropdown
 *  doesn't reopen on the next render. */
function finishDestinationPick() {
  active.value = null
  destinationInputRef.value?.blur()
}
function onPickDestination(id: string) {
  emit('clear-destinations')
  emit('toggle-destination', id)
  finishDestinationPick()
}
function onPickTheme(id: string) {
  emit('clear-destinations')
  emit('toggle-theme', id)
  finishDestinationPick()
}
function onPickCity(city: { name: string; province: string }) {
  emit('clear-destinations')
  emit('select-city', city)
  finishDestinationPick()
}
function onPickHotel(slug: string) {
  emit('clear-destinations')
  emit('select-hotel', slug)
  finishDestinationPick()
}

// ─── Summaries shown inside each form field's value slot ────────────────────

const destinationSummary = computed(() => {
  if (props.destinationLabel && props.destinationLabel.trim()) return props.destinationLabel
  return 'Kies bestemming of hotel'
})

const whenSummary = computed(() => {
  if (props.selectedDate) return props.selectedDate
  if (whenFlexible.value) return 'Ik ben flexibel qua aankomstdatum'
  if (props.whenLabel && props.whenLabel.trim()) return props.whenLabel
  return 'Kies datum'
})

const howLongSummary = computed(() => {
  // Empty selection = "any duration" default → mirror that in the
  // collapsed field so the box visibly reads "Maakt niet uit" when
  // the user hasn't picked specific nights yet.
  if (props.selectedDurations.length === 0) return 'Maakt niet uit'
  return props.selectedDurations.join(' of ') + ' nachten'
})

const whoSummary = computed(() => {
  if (props.whoLabel) return props.whoLabel
  return `${props.searchGroup.adults} personen / ${props.searchGroup.rooms} ${props.searchGroup.rooms === 1 ? 'kamer' : 'kamers'}`
})

// ─── Hoelang multi-select handler ──────────────────────────────────────────

function onToggleNight(value: string) {
  const next = [...props.selectedDurations]
  const i = next.indexOf(value)
  if (i === -1) next.push(value)
  else next.splice(i, 1)
  emit('update:selectedDurations', next)
}

function onPickDate(val: string | null) {
  emit('update:selectedDate', val)
  // Picking a specific date trumps the "flexibel" choice.
  if (val) whenFlexible.value = false
  // Date pick is self-confirming — auto-collapse the section.
  if (val) active.value = null
}

/** "Ik ben flexibel" tick — locally tracked so the Wanneer field can
 *  surface the "Ik ben flexibel qua aankomstdatum" summary even
 *  though there's no shared state for it. Picking a specific date
 *  later clears the flag (see `onPickDate`). */
const whenFlexible = ref(false)
function onPickFlexible(flex: boolean) {
  whenFlexible.value = flex
  if (flex) {
    // Mutually exclusive with a specific date.
    emit('update:selectedDate', null)
    active.value = null
  }
}

function onClearWhen() {
  emit('update:selectedDate', null)
  emit('update:flexibility', 0)
  whenFlexible.value = false
  active.value = null
}

function onClearHowLong() {
  emit('update:selectedDurations', [])
  active.value = null
}

/** "Maakt niet uit" tick — clears all specific-night picks. The
 *  derived prop above re-checks the box automatically once
 *  selectedDurations is empty, so no extra state needed locally. */
function onSetAnyDuration(next: boolean) {
  if (next) emit('update:selectedDurations', [])
}

// ─── Wie gaat er mee — MVP options (mirrors SiteHeader) ────────────────────

const whoMvpOptions = computed(() => {
  const out: { adults: number; rooms: number }[] = []
  for (let rooms = 1; rooms <= 8; rooms++) out.push({ adults: rooms * 2, rooms })
  return out
})

const whoMvpSelectedKey = computed(() => {
  if (props.searchGroup.children.length > 0) return null
  if (props.searchGroup.dog) return null
  return `${props.searchGroup.adults}-${props.searchGroup.rooms}`
})

function pickWho(opt: { adults: number; rooms: number }) {
  emit('update:searchGroup', {
    adults: opt.adults,
    children: [],
    rooms: opt.rooms,
    dog: false,
  })
  active.value = null
}
</script>

<style scoped>
/* ============================================================
   MOBILE SEARCH MODAL — dark surround, white form-field cards
   ============================================================ */
.msm {
  position: fixed;
  inset: 0;
  /* Warm off-white grey — same surface as the homepage persuasion /
     popular bands so the modal feels like part of the same chrome.
     Field cards stay white for contrast. */
  background: var(--color-background-secondary, #faf9f6);
  color: var(--color-text-primary);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.msm__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border-light, #ececec);
}
.msm__title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
}
.msm__close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--color-border-light, #ececec);
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-primary);
}
.msm__close:hover { background: rgba(0, 0, 0, 0.04); }

/* Scrollable body holds the four field-cards. Larger vertical gap so
   each field reads as its own section with clear breathing room
   before the next label. */
.msm__body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 20px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* Each field — heading row (icon + label) above + white card below. */
.msm-field {
  display: flex;
  flex-direction: column;
  gap: 2px;                       /* tighter — label hugs its field */
}
/* Heading row: icon sits BEFORE the label, both above the field. */
.msm-field__heading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding-left: 4px;
  color: var(--color-text-secondary, #6a6a6a);
}
.msm-field__heading .msm-field__icon {
  width: 16px;
  height: 16px;
  color: inherit;
}
.msm-field__label {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
  /* Match the desktop search-bar's label tracking (1.3 px). */
  letter-spacing: 1.3px;
  text-transform: uppercase;
  /* Dark enough to remain legible on the light warm-grey modal bg. */
  color: var(--color-text-secondary, #6a6a6a);
}

.msm-field__card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  /* Darker 2 px stroke — was the muted `--color-border-light`,
     which read as a barely-there ghost on the warm-grey surface.
     Bump to `--color-border` so the form-field outline is clearly
     visible. */
  border: 2px solid var(--color-border, #c8c8c8);
  box-shadow: none;
  transition: border-color 120ms ease;
}
/* Active state keeps the same neutral stroke colour (no orange ring).
   The inline panel below the card provides the affordance instead. */
.msm-field__card--active {
  border-color: var(--color-border, #c8c8c8);
}

/* Button variant — used by Wanneer / Hoelang / Wie. Form-field look. */
.msm-field__card--button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: 56px;
  padding: 12px 18px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}
.msm-field__value {
  flex: 1;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.msm-field__value--placeholder {
  color: var(--color-text-secondary, #6a6a6a);
  font-weight: 400;
}
.msm-field__icon {
  flex-shrink: 0;
  color: var(--color-text-secondary, #6a6a6a);
}

/* Inline-card variant — Waarheen renders its picker inside; padding is
   handled by the picker itself. */
.msm-field__card--inline {
  padding: 0;
}

/* Input variant — Waarheen's typing surface. The field itself accepts
   keyboard input; suggestions appear below in the panel. */
.msm-field__card--input {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px 0 18px;
  min-height: 56px;
}
.msm-field__input {
  flex: 1;
  min-width: 0;
  height: 56px;
  border: none;
  background: transparent;
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--color-text-primary);
  outline: none;
}
.msm-field__input::placeholder {
  color: var(--color-text-secondary, #6a6a6a);
  font-weight: 400;
}
.msm-field__clear {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--color-text-secondary, #6a6a6a);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
}
.msm-field__clear:hover {
  background: rgba(0, 0, 0, 0.06);
  color: var(--color-text-primary);
}

/* In the destination panel, hide the popup's own topbar (search input)
   since the field above is the typing surface. */
.msm-field__panel--dest :deep(.destination-popup__topbar) {
  display: none;
}

/* Picker panel expands directly under the field card with no gap and
   a shared 2 px border, so the two read as a single connected
   element. The card's bottom corners flatten when active. */
.msm-field__panel {
  background: #fff;
  border-radius: 0 0 12px 12px;
  padding: 0;
  margin-top: -2px;             /* overlap the field card's 2 px border */
  border: 2px solid var(--color-border, #c8c8c8);
  border-top: none;
  overflow: hidden;
}
.msm-field__panel--list { padding: 4px 0; }

/* Square off the card's bottom when its panel is open below. */
.msm-field__card--active {
  border-radius: 12px 12px 0 0;
}

/* Top toolbar — used by the Reisduur panel: title (left) + Klaar
   button (right). */
.msm-field__panel-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 16px 8px;
}
.msm-field__panel-title {
  margin: 0;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}
.msm-field__done {
  height: 36px;
  padding: 0 18px;
  border: none;
  border-radius: 8px;
  background: var(--color-primary);
  color: #fff;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.msm-field__done:hover { background: var(--color-primary-hover); }

/* Reisduur panel: hide the popup's own header (h4 + hint) since we
   render our own title in the toolbar above. */
.msm-field__panel--howlong :deep(.when-pop__nights-section > .when-pop__title),
.msm-field__panel--howlong :deep(.when-pop__nights-section > .when-pop__hint) {
  display: none;
}
.msm-field__panel--howlong :deep(.when-pop__nights-section) {
  padding-top: 0;
}

/* Inline-rendered DateAndDurationPopup styling — no double border,
   and force every layer of the popup to stretch to the panel's full
   width so the calendar fills the field card. */
.msm-field__panel :deep(.when-pop) {
  border: none;
  box-shadow: none;
  width: 100%;
}
.msm-field__panel :deep(.when-pop__content) {
  grid-template-columns: 1fr;     /* fill the panel, not intrinsic */
  width: 100%;
  justify-content: stretch;
}
.msm-field__panel :deep(.when-pop__cal-section) {
  width: 100%;
  box-sizing: border-box;
  padding: 16px;                  /* trimmed from desktop's 24 px */
}
/* Calendar grid: stretches to fill the panel's width (no max cap),
   with the modal body's 16 px side padding providing the margin. */
.msm-field__panel :deep(.mini-cal__grid),
.msm-field__panel :deep(.mini-cal__days-header) {
  grid-template-columns: repeat(7, 1fr);
  width: 100%;
  justify-content: stretch;
}
.msm-field__panel :deep(.mini-cal__cell) {
  width: auto;
  height: 56px;
}
/* Left-align the duration list (multi-night checkboxes) so each row
   sits against the panel's left edge instead of being centred. */
.msm-field__panel :deep(.when-pop__nights-section) {
  align-items: flex-start;
}
.msm-field__panel :deep(.when-pop__nights-list) {
  align-items: flex-start;
}
.msm-field__panel :deep(.dur-check) {
  align-self: flex-start;
}

/* Who picker (MVP list) */
.msm-who__list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.msm-who__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
}
.msm-who__item:hover { background: rgba(0, 0, 0, 0.04); }
.msm-who__item--selected {
  font-weight: 600;
  color: var(--color-primary);
  background: rgba(233, 113, 50, 0.08);
}

/* Footer: full-width orange "Zoeken" CTA */
.msm__footer {
  flex-shrink: 0;
  padding: 12px 16px max(16px, env(safe-area-inset-bottom));
  border-top: 1px solid var(--color-border-light, #ececec);
  background: var(--color-background-secondary, #faf9f6);
}
.msm__submit {
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 12px;
  background: var(--color-primary);
  color: #fff;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}
.msm__submit:hover { background: var(--color-primary-hover); }

/* ───── Transitions ───── */
.msm-slide-enter-active,
.msm-slide-leave-active {
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
}
.msm-slide-enter-from,
.msm-slide-leave-to { transform: translateX(100%); }

.msm-fade-enter-active,
.msm-fade-leave-active { transition: opacity 160ms ease, transform 160ms ease; }
.msm-fade-enter-from,
.msm-fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
