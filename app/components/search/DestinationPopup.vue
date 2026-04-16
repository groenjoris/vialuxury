<template>
  <div class="destination-popup">
    <!-- Search input -->
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

    <!-- Content area: fixed height -->
    <div class="destination-popup__content">
      <!-- Browse mode: destinations + themes (when not searching) -->
      <div v-if="!isSearching" class="destination-popup__browse">
        <div class="destination-popup__section">
          <h4 class="destination-popup__section-title">{{ t('header.popularDestinations') }}</h4>
          <div class="destination-popup__chips">
            <button
              v-for="dest in destinations"
              :key="dest.id"
              class="dest-chip"
              :class="{ 'dest-chip--selected': selectedDestinations.includes(dest.id) }"
              @click="$emit('toggle-destination', dest.id)"
            >
              <span class="dest-chip__emoji">{{ dest.emoji }}</span>
              <span class="dest-chip__name">{{ dest.name }}</span>
              <span v-if="dest.country" class="dest-chip__country">{{ dest.country }}</span>
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
              @click="$emit('select-hotel', hotel.slug)"
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
}>()

const emit = defineEmits<{
  'toggle-destination': [id: string]
  'toggle-theme': [id: string]
  'select-hotel': [slug: string]
  'select-city': [city: { name: string; province: string }]
}>()

const { t } = useI18n()

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
      searchQuery.value = ''
      return
    }
  }

  // Otherwise emit as city selection
  emit('select-city', { name: item.name, province: item.province })
  searchQuery.value = ''
}
</script>

<style scoped>
.destination-popup {
  width: 640px;
}

/* ==================== */
/* SEARCH INPUT         */
/* ==================== */
.destination-popup__search {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 0 var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.destination-popup__search-icon {
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.destination-popup__input {
  flex: 1;
  height: 48px;
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
/* CONTENT (FIXED SIZE) */
/* ==================== */
.destination-popup__content {
  overflow-y: auto;
}

/* ==================== */
/* BROWSE MODE          */
/* ==================== */
.destination-popup__browse {
  padding: var(--space-lg);
}

.destination-popup__section {
  margin-bottom: var(--space-lg);
}

.destination-popup__section:last-child {
  margin-bottom: 0;
}

.destination-popup__section-title {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-muted);
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
  border-radius: 24px;
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
