<template>
  <div class="destination-popup">
    <!-- Top bar: grey row with white input field -->
    <div class="destination-popup__topbar">
      <div class="destination-popup__search">
        <svg
          class="destination-popup__search-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          class="destination-popup__input"
          :placeholder="t('header.searchDestinationPlaceholder')"
          autocomplete="off"
        />
        <button
          v-if="searchQuery.length > 0"
          class="destination-popup__clear"
          @click="clearSearch"
          aria-label="Clear"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Selected items row: minimal pills + Klaar button — only when something is selected -->
    <div v-if="!isSearching && totalSelectedChips.length > 0" class="destination-popup__selected-row">
      <div class="destination-popup__selected-pills">
        <span
          v-for="item in totalSelectedChips"
          :key="`${item.type}-${item.key}`"
          class="selected-pill"
        >
          <span class="selected-pill__name">{{ item.name }}</span>
          <button
            type="button"
            class="selected-pill__remove"
            :aria-label="`Remove ${item.name}`"
            @click.stop="handleChipRemove(item)"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </span>
      </div>
      <div class="destination-popup__actions">
        <button
          type="button"
          class="destination-popup__done"
          @click="$emit('save')"
        >
          {{ t('header.done') }}
        </button>
        <a
          href="#"
          class="destination-popup__clear-link"
          @click.prevent="handleClear"
        >
          {{ t('header.clear') }}
        </a>
      </div>
    </div>

    <!-- Content area: fixed height -->
    <div class="destination-popup__content">
      <!-- Browse mode: provincies (no label) on top, themes below. -->
      <div v-if="!isSearching" class="destination-popup__browse">
        <!-- Provincies / regio's — first section, deliberately no heading. -->
        <div class="destination-popup__section destination-popup__section--destinations">
          <div class="destination-popup__chips">
            <button
              v-for="dest in destinations"
              :key="dest.id"
              class="dest-chip dest-chip--destination"
              :class="{ 'dest-chip--selected': selectedDestinations.includes(dest.id) }"
              @click="$emit('toggle-destination', dest.id)"
            >
              <span class="dest-chip__emoji">{{ dest.emoji }}</span>
              <span class="dest-chip__name">{{ dest.name }}</span>
              <span class="dest-chip__country">{{ dest.country }}</span>
            </button>
          </div>
        </div>

        <div class="destination-popup__section">
          <h4 class="destination-popup__section-title">{{ t('header.themes') }}</h4>
          <div class="destination-popup__chips">
            <button
              v-for="theme in themes"
              :key="theme.id"
              class="dest-chip dest-chip--theme"
              :class="{ 'dest-chip--selected': selectedThemes.includes(theme.id) }"
              @click="$emit('toggle-theme', theme.id)"
            >
              <span class="dest-chip__emoji">{{ theme.emoji }}</span>
              <span class="dest-chip__name">{{ theme.name }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Autosuggest mode: vertical list -->
      <div v-else class="destination-popup__results">
        <ul v-if="filteredSuggestions.length > 0" class="destination-popup__list">
          <li
            v-for="item in filteredSuggestions"
            :key="item.name"
            class="destination-popup__list-item"
            @click="selectSuggestion(item)"
          >
            <svg class="destination-popup__list-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <div class="destination-popup__list-text">
              <span class="destination-popup__list-name">{{ item.name }}</span>
              <span class="destination-popup__list-province">{{ item.province }}</span>
            </div>
          </li>
        </ul>

        <!-- Filtered hotels -->
        <template v-if="filteredHotels.length > 0">
          <div v-if="filteredSuggestions.length > 0" class="destination-popup__separator"></div>
          <h4 class="destination-popup__section-title destination-popup__section-title--results">Hotels</h4>
          <ul class="destination-popup__list">
            <li
              v-for="hotel in filteredHotels"
              :key="hotel.id"
              class="destination-popup__list-item destination-popup__list-item--hotel"
              @click="selectHotel(hotel)"
            >
              <svg class="destination-popup__list-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 21V7a2 2 0 012-2h14a2 2 0 012 2v14" />
                <path d="M3 11h18" />
                <path d="M9 21V11" />
              </svg>
              <div class="destination-popup__list-text">
                <span class="destination-popup__list-name">{{ hotel.name }}</span>
                <span class="destination-popup__list-stars">
                  <template v-for="n in hotel.starRating" :key="n">&#9733;</template>
                </span>
              </div>
            </li>
          </ul>
        </template>

        <!-- No results -->
        <div
          v-if="filteredSuggestions.length === 0 && filteredHotels.length === 0"
          class="destination-popup__empty"
        >
          {{ t('header.noResults') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { searchHotels } from '~/data/mock/search-hotels'
import { dutchCities, dutchProvinces } from '~/data/mock/dutch-cities'

const props = defineProps<{
  destinations: Array<{ id: string; name: string; country: string; emoji: string }>
  themes: Array<{ id: string; name: string; emoji: string }>
  selectedDestinations: string[]
  selectedThemes: string[]
  selectedCities?: Array<{ name: string; province: string }>
  selectionOrder?: Array<{ type: 'destination' | 'theme' | 'city'; key: string }>
}>()

const emit = defineEmits<{
  'toggle-destination': [id: string]
  'toggle-theme': [id: string]
  'select-hotel': [slug: string]
  'select-city': [city: { name: string; province: string }]
  'remove-city': [cityName: string]
  'save': []
  'clear': []
}>()

type ChipKind = 'destination' | 'theme' | 'city' | 'history'
type ChipItem = {
  key: string
  type: ChipKind
  name: string
  emoji?: string
  historyRef?: { name: string; type: string; id?: string; province?: string }
}

// Unified top row: iterate selectionOrder so chips appear chronologically (newest on the right).
// Falls back to grouped iteration if selectionOrder prop isn't provided.
const totalSelectedChips = computed<ChipItem[]>(() => {
  const out: ChipItem[] = []

  if (props.selectionOrder && props.selectionOrder.length > 0) {
    for (const entry of props.selectionOrder) {
      if (entry.type === 'destination') {
        const dest = props.destinations.find(d => d.id === entry.key)
        if (dest) out.push({ key: `dest-${entry.key}`, type: 'destination', name: dest.name, emoji: dest.emoji })
      } else if (entry.type === 'theme') {
        const theme = props.themes.find(th => th.id === entry.key)
        if (theme) out.push({ key: `theme-${entry.key}`, type: 'theme', name: theme.name, emoji: theme.emoji })
      } else if (entry.type === 'city') {
        out.push({ key: `city-${entry.key}`, type: 'city', name: entry.key })
      }
    }
  } else {
    // Fallback grouped order
    for (const id of props.selectedDestinations) {
      const dest = props.destinations.find(d => d.id === id)
      if (dest) out.push({ key: `dest-${id}`, type: 'destination', name: dest.name, emoji: dest.emoji })
    }
    for (const id of props.selectedThemes) {
      const theme = props.themes.find(th => th.id === id)
      if (theme) out.push({ key: `theme-${id}`, type: 'theme', name: theme.name, emoji: theme.emoji })
    }
    for (const city of (props.selectedCities || [])) {
      out.push({ key: `city-${city.name}`, type: 'city', name: city.name })
    }
  }

  // History items that aren't already represented above
  const takenNames = new Set(out.map(i => i.name))
  for (const h of searchHistory.value) {
    if (takenNames.has(h.name)) continue
    out.push({ key: `hist-${h.name}`, type: 'history', name: h.name, historyRef: h })
  }
  return out
})

function handleChipClick(item: ChipItem) {
  if (item.type === 'history' && item.historyRef) reSelectHistory(item.historyRef)
  // Destinations / themes / cities already active — click does nothing (remove via X)
}

function handleChipRemove(item: ChipItem) {
  if (item.type === 'destination') emit('toggle-destination', item.key.replace('dest-', ''))
  else if (item.type === 'theme') emit('toggle-theme', item.key.replace('theme-', ''))
  else if (item.type === 'city') emit('remove-city', item.name)
  else if (item.type === 'history' && item.historyRef) removeHistory(item.historyRef)
}

function handleClear() {
  searchQuery.value = ''            // Clear typed text
  searchHistory.value = []          // Clear recent-search chips
  try { sessionStorage.removeItem('vl-search-history') } catch { /* ignore */ }
  emit('clear')                     // Parent clears destinations/themes/cities
}

const { t } = useNorthstarI18n()

// Persistent search history (module-level would reset on HMR, so use provide/inject pattern)
// Keep it simple: store in component, persists as long as popup is alive via parent keep-alive
const searchHistory = ref<{ name: string; type: 'city' | 'destination' | 'hotel'; id?: string; province?: string }[]>([])

// Load from sessionStorage on mount
onMounted(() => {
  try {
    const stored = sessionStorage.getItem('vl-search-history')
    if (stored) searchHistory.value = JSON.parse(stored)
  } catch { /* ignore */ }
})

function addToHistory(item: { name: string; type: 'city' | 'destination' | 'hotel'; id?: string; province?: string }) {
  // Remove duplicate if exists
  searchHistory.value = searchHistory.value.filter(h => h.name !== item.name)
  // Prepend
  searchHistory.value.unshift(item)
  // Keep max 3
  if (searchHistory.value.length > 3) searchHistory.value.pop()
  // Persist
  try { sessionStorage.setItem('vl-search-history', JSON.stringify(searchHistory.value)) } catch { /* ignore */ }
}

function removeHistory(item: { name: string }) {
  searchHistory.value = searchHistory.value.filter(h => h.name !== item.name)
  try { sessionStorage.setItem('vl-search-history', JSON.stringify(searchHistory.value)) } catch { /* ignore */ }
}

function reSelectHistory(item: { name: string; type: string; id?: string; province?: string }) {
  if (item.type === 'destination' && item.id) {
    emit('toggle-destination', item.id)
  } else if (item.type === 'hotel' && item.id) {
    emit('select-hotel', item.id)
  } else if (item.type === 'city' && item.province) {
    emit('select-city', { name: item.name, province: item.province })
  }
}

const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)

const isSearching = computed(() => searchQuery.value.trim().length > 0)

// Autofocus on mount
onMounted(() => {
  nextTick(() => {
    searchInputRef.value?.focus()
  })
})

function clearSearch() {
  searchQuery.value = ''
  nextTick(() => {
    searchInputRef.value?.focus()
  })
}

// Build combined suggestions list: provinces + cities
const allSuggestions = computed(() => {
  const suggestions: { name: string; province: string; isProvince: boolean }[] = []

  // Add provinces
  for (const prov of dutchProvinces) {
    suggestions.push({ name: prov, province: 'Nederland', isProvince: true })
  }

  // Add cities
  for (const city of dutchCities) {
    suggestions.push({ name: city.name, province: city.province, isProvince: false })
  }

  return suggestions
})

// Filter suggestions by query
const filteredSuggestions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return allSuggestions.value
    .filter(s => s.name.toLowerCase().includes(q) || s.province.toLowerCase().includes(q))
    .slice(0, 10) // limit to 10 results
})

// Filter hotels by query
const filteredHotels = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return searchHotels
    .filter(h => h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q))
    .slice(0, 5) // limit to 5 hotel results
})

function selectSuggestion(item: { name: string; province: string; isProvince: boolean }) {
  // If it's a province that matches one of our destination chips, toggle that
  if (item.isProvince) {
    const dest = props.destinations.find(d => d.name === item.name)
    if (dest) {
      emit('toggle-destination', dest.id)
      addToHistory({ name: item.name, type: 'destination', id: dest.id })
      searchQuery.value = ''
      return
    }
  }

  // Otherwise emit as city selection
  emit('select-city', { name: item.name, province: item.province })
  addToHistory({ name: item.name, type: 'city', province: item.province })
  searchQuery.value = ''
}

function selectHotel(hotel: { name: string; slug: string }) {
  emit('select-hotel', hotel.slug)
  addToHistory({ name: hotel.name, type: 'hotel', id: hotel.slug })
  searchQuery.value = ''
}
</script>

<style scoped>
.destination-popup {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  /* Lock the popup at the browse-mode height so typing into the search field
     swaps the inner content without resizing the dropdown. */
  min-height: 540px;
}

/* ==================== */
/* TOP BAR              */
/* ==================== */
.destination-popup__topbar {
  flex-shrink: 0;
  background: var(--color-background-secondary);
  padding: 12px var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

/* ==================== */
/* SELECTED ROW         */
/* (chips + done button)*/
/* ==================== */
.destination-popup__selected-row {
  flex-shrink: 0;
  background: var(--color-surface);
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: 12px var(--space-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.destination-popup__chips--flex {
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
  display: flex;
  gap: var(--space-sm);
}

.destination-popup__actions {
  flex-shrink: 0;
  margin-left: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.destination-popup__done {
  padding: 8px 20px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background var(--transition-fast);
  font-family: inherit;
  white-space: nowrap;
}

.destination-popup__done:hover {
  background: var(--color-primary-hover);
}

.destination-popup__clear-link {
  font-size: 12px;
  color: var(--color-text-muted);
  text-decoration: underline;
  cursor: pointer;
  font-family: inherit;
}

.destination-popup__clear-link:hover {
  color: var(--color-text-primary);
}

/* ==================== */
/* SEARCH INPUT         */
/* ==================== */
.destination-popup__search {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 4px 10px;
  flex: 1;
  min-width: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.destination-popup__search-icon {
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.destination-popup__input {
  flex: 1;
  height: 32px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  font-family: inherit;
  color: var(--color-text-primary);
  caret-color: var(--color-primary);
}

.destination-popup__input::placeholder {
  color: var(--color-text-muted);
}

.destination-popup__clear {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: var(--color-background-secondary);
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 150ms ease, color 150ms ease;
}

.destination-popup__clear:hover {
  background: var(--color-border);
  color: var(--color-text-primary);
}

/* ==================== */
/* CONTENT (SCROLLABLE) */
/* ==================== */
.destination-popup__content {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

/* ==================== */
/* BROWSE MODE          */
/* ==================== */
.destination-popup__browse {
  padding: var(--space-md) var(--space-lg) var(--space-lg);
}

.destination-popup__section {
  margin-bottom: var(--space-md);
}

.destination-popup__section:last-child {
  margin-bottom: 0;
}

/* Divider between destinations and themes sections */
.destination-popup__section--destinations {
  padding-bottom: var(--space-md);
  margin-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border-light);
}

.destination-popup__section-title {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 700;
  text-transform: none;
  letter-spacing: 0;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm);
}

.destination-popup__section-title--results {
  padding: 0 var(--space-md);
  margin-bottom: var(--space-xs);
}

.destination-popup__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

/* ==================== */
/* DESTINATION CHIPS    */
/* ==================== */
.dest-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: pointer;
  transition: border-color 150ms ease, background-color 150ms ease;
  font-size: 13px;
  font-family: inherit;
  line-height: 1;
}

.dest-chip:hover {
  border-color: var(--color-primary);
  background: rgba(251, 134, 45, 0.06);
}

.dest-chip--selected {
  border-color: var(--color-primary);
  background: rgba(251, 134, 45, 0.1);
  font-weight: 600;
}

.dest-chip__emoji {
  font-size: 15px;
  line-height: 1;
}

.dest-chip__name {
  color: var(--color-text-primary);
}

.dest-chip__country {
  font-size: 11px;
  color: var(--color-text-muted);
  font-weight: 500;
}

/* History chip variant */
.dest-chip--history {
  background: var(--color-background-secondary, #f5f5f5);
  border-color: transparent;
  gap: 8px;
  padding-right: 8px;
}

.dest-chip--history:hover {
  background: var(--color-border-light, #eee);
  border-color: transparent;
}

/* ==================== */
/* SELECTED PILLS       */
/* (minimal, no icons)  */
/* ==================== */
.destination-popup__selected-pills {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.selected-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 4px 3px 10px;
  background: rgba(251, 134, 45, 0.08);
  border-radius: 999px;
  font-size: 12px;
  line-height: 1.2;
  color: var(--color-text-primary);
  font-weight: 500;
  white-space: nowrap;
}

.selected-pill__name {
  font-family: inherit;
}

.selected-pill__remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.selected-pill__remove:hover {
  background: rgba(0, 0, 0, 0.08);
  color: var(--color-text-primary);
}

.dest-chip__history-icon {
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.dest-chip__remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  color: var(--color-text-muted);
  transition: background 150ms ease, color 150ms ease;
  margin-left: 2px;
}

.dest-chip__remove:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--color-text-primary);
}

/* ==================== */
/* AUTOSUGGEST RESULTS  */
/* ==================== */
.destination-popup__results {
  padding: var(--space-sm) 0;
}

.destination-popup__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.destination-popup__list-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 10px var(--space-md);
  cursor: pointer;
  transition: background-color 150ms ease;
}

.destination-popup__list-item:hover {
  background: var(--color-background-secondary);
}

.destination-popup__list-icon {
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.destination-popup__list-text {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  min-width: 0;
}

.destination-popup__list-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.destination-popup__list-province {
  font-size: 13px;
  color: var(--color-text-muted);
}

.destination-popup__list-province::before {
  content: '\00B7';
  margin-right: var(--space-sm);
}

/* Hotels */
.destination-popup__list-stars {
  font-size: 12px;
  color: var(--color-primary);
  letter-spacing: 1px;
  flex-shrink: 0;
}

/* Separator */
.destination-popup__separator {
  height: 1px;
  background: var(--color-border-light);
  margin: var(--space-sm) var(--space-md);
}

/* Empty state */
.destination-popup__empty {
  padding: var(--space-xl) var(--space-md);
  text-align: center;
  font-size: 14px;
  color: var(--color-text-muted);
}
</style>
