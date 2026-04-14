<template>
  <header class="site-header">
    <!-- Main nav bar -->
    <div class="site-header__nav">
      <div class="site-header__nav-inner container">
        <!-- Logo -->
        <NuxtLink to="/" class="site-header__logo">
          <img src="/images/logo-vialuxury.svg" alt="ViaLuxury" class="site-header__logo-img" />
        </NuxtLink>

        <!-- Verticals switcher -->
        <nav class="verticals" aria-label="Verticals">
          <NuxtLink
            v-for="v in verticals"
            :key="v.id"
            :to="v.href"
            class="verticals__item"
            :class="{ 'verticals__item--active': v.id === activeVertical }"
          >
            {{ v.label }}
          </NuxtLink>
        </nav>

        <!-- Right actions -->
        <div class="site-header__nav-actions">
          <button type="button" class="vip-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 2 15 8l6 .9-4.5 4.4L17.5 20 12 16.9 6.5 20 8 13.3 3.5 8.9 9.5 8z" />
            </svg>
            <span>VIP Login</span>
          </button>
          <button type="button" class="hamburger-btn" aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </div>

    <!-- Search bar dock: overlaps nav + page -->
    <div class="site-header__search-dock">
      <div class="container site-header__search-container">
        <div class="search-bar">
        <!-- 1. Waarheen -->
        <button
          class="search-bar__field search-bar__field--destination"
          :class="{ 'search-bar__field--active': activePopup === 'destination' }"
          @click="togglePopup('destination')"
        >
          <span class="search-bar__label">Waarheen</span>
          <span class="search-bar__value">{{ destinationLabel }}</span>
        </button>

        <div class="search-bar__divider"></div>

        <!-- 2. Wanneer en hoelang -->
        <button
          class="search-bar__field search-bar__field--when"
          :class="{ 'search-bar__field--active': activePopup === 'when' }"
          @click="togglePopup('when')"
        >
          <span class="search-bar__label">Wanneer & hoelang</span>
          <span class="search-bar__value">{{ whenLabel }}</span>
        </button>

        <div class="search-bar__divider"></div>

        <!-- 3. Wie gaat er mee -->
        <button
          class="search-bar__field search-bar__field--who"
          :class="{ 'search-bar__field--active': activePopup === 'who' }"
          @click="togglePopup('who')"
        >
          <span class="search-bar__label">Wie gaat er mee</span>
          <span class="search-bar__value">{{ whoLabel }}</span>
        </button>

          <!-- Search button -->
          <button class="search-bar__btn" @click="handleSearch" aria-label="Zoeken">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Popups -->
    <Transition name="popup">
      <div v-if="activePopup" class="popup-overlay" @click.self="closePopup">
        <!-- DESTINATION POPUP -->
        <div v-if="activePopup === 'destination'" class="popup popup--destination">
          <div class="popup__section">
            <h4 class="popup__section-title">Populaire bestemmingen</h4>
            <div class="popup__grid">
              <button
                v-for="dest in destinations"
                :key="dest.id"
                class="dest-chip"
                :class="{ 'dest-chip--selected': selectedDestinations.includes(dest.id) }"
                @click="toggleDestination(dest.id)"
              >
                <span class="dest-chip__emoji">{{ dest.emoji }}</span>
                <span class="dest-chip__name">{{ dest.name }}</span>
                <span v-if="dest.country" class="dest-chip__country">{{ dest.country }}</span>
              </button>
            </div>
          </div>
          <div class="popup__section">
            <h4 class="popup__section-title">Thema's</h4>
            <div class="popup__grid">
              <button
                v-for="theme in themes"
                :key="theme.id"
                class="dest-chip dest-chip--theme"
                :class="{ 'dest-chip--selected': selectedThemes.includes(theme.id) }"
                @click="toggleTheme(theme.id)"
              >
                <span class="dest-chip__emoji">{{ theme.emoji }}</span>
                <span class="dest-chip__name">{{ theme.name }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- WHEN POPUP -->
        <div v-if="activePopup === 'when'" class="popup popup--when">
          <div class="popup__row">
            <!-- Mini calendar -->
            <div class="popup__section popup__section--calendar">
              <h4 class="popup__section-title">Datum</h4>
              <div class="mini-cal">
                <div class="mini-cal__header">
                  <button class="mini-cal__nav" @click="calPrev">‹</button>
                  <span class="mini-cal__month">{{ calMonthLabel }}</span>
                  <button class="mini-cal__nav" @click="calNext">›</button>
                </div>
                <div class="mini-cal__days-header">
                  <span v-for="d in ['Ma','Di','Wo','Do','Vr','Za','Zo']" :key="d">{{ d }}</span>
                </div>
                <div class="mini-cal__grid">
                  <span
                    v-for="(cell, i) in calCells"
                    :key="i"
                    class="mini-cal__cell"
                    :class="{
                      'mini-cal__cell--empty': !cell.day,
                      'mini-cal__cell--selected': cell.date === selectedDate,
                      'mini-cal__cell--past': cell.past,
                    }"
                    @click="cell.day && !cell.past ? selectDate(cell.date!) : null"
                  >
                    {{ cell.day || '' }}
                  </span>
                </div>
              </div>
              <div class="flex-row">
                <h4 class="popup__section-title">Flexibiliteit</h4>
                <div class="flex-chips">
                  <button
                    v-for="f in flexOptions"
                    :key="f.value"
                    class="flex-chip"
                    :class="{ 'flex-chip--selected': flexibility === f.value }"
                    @click="flexibility = f.value"
                  >
                    {{ f.label }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Duration -->
            <div class="popup__section popup__section--duration">
              <h4 class="popup__section-title">Hoelang</h4>
              <div class="duration-options">
                <button
                  v-for="dur in durationOptions"
                  :key="dur.id"
                  class="dur-chip"
                  :class="{ 'dur-chip--selected': selectedDuration === dur.id }"
                  @click="selectedDuration = dur.id"
                >
                  <span class="dur-chip__label">{{ dur.label }}</span>
                  <span v-if="dur.sub" class="dur-chip__sub">{{ dur.sub }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- WHO POPUP -->
        <div v-if="activePopup === 'who'" class="popup popup--who">
          <!-- Adults -->
          <div class="who-row">
            <div class="who-row__info">
              <span class="who-row__label">Volwassenen</span>
              <span class="who-row__sub">18 jaar of ouder</span>
            </div>
            <div class="stepper">
              <button class="stepper__btn" :disabled="searchGroup.adults <= 1" @click="searchGroup.adults--">−</button>
              <span class="stepper__val">{{ searchGroup.adults }}</span>
              <button class="stepper__btn" :disabled="searchGroup.adults >= 8" @click="searchGroup.adults++">+</button>
            </div>
          </div>

          <!-- Children -->
          <div class="who-row">
            <div class="who-row__info">
              <span class="who-row__label">Kinderen</span>
              <span class="who-row__sub">0–17 jaar</span>
            </div>
            <div class="stepper">
              <button class="stepper__btn" :disabled="searchGroup.children.length <= 0" @click="removeSearchChild">−</button>
              <span class="stepper__val">{{ searchGroup.children.length }}</span>
              <button class="stepper__btn" :disabled="searchGroup.children.length >= 4" @click="addSearchChild">+</button>
            </div>
          </div>

          <!-- Child ages -->
          <div v-if="searchGroup.children.length > 0" class="who-children-ages">
            <div v-for="(child, idx) in searchGroup.children" :key="idx" class="who-child-age">
              <label>Leeftijd kind {{ idx + 1 }}</label>
              <select v-model.number="child.age">
                <option v-for="a in 18" :key="a - 1" :value="a - 1">{{ a - 1 }} jaar</option>
              </select>
            </div>
          </div>

          <!-- Dog -->
          <div class="who-row who-row--dog">
            <div class="who-row__info">
              <span class="who-row__label">Hond meenemen</span>
              <span class="who-row__sub">Check beschikbaarheid per hotel</span>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="searchGroup.dog" />
              <span class="toggle__slider"></span>
            </label>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
// --- Verticals ---
const verticals = [
  { id: 'hotels', label: 'Hotels', href: '/' },
  { id: 'vakantieparken', label: 'Vakantieparken', href: '/vakantieparken' },
  { id: 'huisjes', label: 'Huisjes', href: '/huisjes' },
  { id: 'restaurants', label: 'Restaurants', href: '/restaurants' },
]
const activeVertical = ref('hotels')

const activePopup = ref<'destination' | 'when' | 'who' | null>(null)

function togglePopup(popup: 'destination' | 'when' | 'who') {
  activePopup.value = activePopup.value === popup ? null : popup
}

function closePopup() {
  activePopup.value = null
}

// --- DESTINATION ---
const destinations = [
  { id: 'zeeland', name: 'Zeeland', country: 'NL', emoji: '🏖️' },
  { id: 'brabant', name: 'Noord-Brabant', country: 'NL', emoji: '🌳' },
  { id: 'limburg', name: 'Limburg', country: 'NL', emoji: '⛰️' },
  { id: 'gelderland', name: 'Gelderland', country: 'NL', emoji: '🌲' },
  { id: 'drenthe', name: 'Drenthe', country: 'NL', emoji: '🌾' },
  { id: 'friesland', name: 'Friesland', country: 'NL', emoji: '⛵' },
  { id: 'overijssel', name: 'Overijssel', country: 'NL', emoji: '🏡' },
  { id: 'flevoland', name: 'Flevoland', country: 'NL', emoji: '🌅' },
  { id: 'noord-holland', name: 'Noord-Holland', country: 'NL', emoji: '🌷' },
  { id: 'zuid-holland', name: 'Zuid-Holland', country: 'NL', emoji: '🏙️' },
  { id: 'ardennen', name: 'Ardennen', country: 'BE', emoji: '🏔️' },
  { id: 'vlaanderen', name: 'Vlaanderen', country: 'BE', emoji: '🏰' },
  { id: 'belgische-kust', name: 'Belgische Kust', country: 'BE', emoji: '🐚' },
  { id: 'wallonie', name: 'Wallonië', country: 'BE', emoji: '🍺' },
]

const themes = [
  { id: 'aan-zee', name: 'Aan zee', emoji: '🌊' },
  { id: 'natuur', name: 'Natuur', emoji: '🌿' },
  { id: 'wellness', name: 'Wellness & Spa', emoji: '🧖' },
  { id: 'romantisch', name: 'Romantisch', emoji: '❤️' },
  { id: 'culinair', name: 'Culinair', emoji: '🍽️' },
  { id: 'actief', name: 'Actief & Sport', emoji: '🚴' },
  { id: 'steden', name: 'Stedentrip', emoji: '🏛️' },
  { id: 'kasteel', name: 'Kasteel & Landgoed', emoji: '🏰' },
]

const selectedDestinations = ref<string[]>([])
const selectedThemes = ref<string[]>([])

function toggleDestination(id: string) {
  const idx = selectedDestinations.value.indexOf(id)
  if (idx === -1) selectedDestinations.value.push(id)
  else selectedDestinations.value.splice(idx, 1)
}

function toggleTheme(id: string) {
  const idx = selectedThemes.value.indexOf(id)
  if (idx === -1) selectedThemes.value.push(id)
  else selectedThemes.value.splice(idx, 1)
}

const destinationLabel = computed(() => {
  const count = selectedDestinations.value.length + selectedThemes.value.length
  if (count === 0) return 'Kies bestemming'
  if (count === 1) {
    const d = destinations.find(d => d.id === selectedDestinations.value[0])
    const t = themes.find(t => t.id === selectedThemes.value[0])
    return d?.name || t?.name || `${count} gekozen`
  }
  return `${count} gekozen`
})

// --- WHEN ---
const calMonth = ref({ year: new Date().getFullYear(), month: new Date().getMonth() })
const selectedDate = ref<string | null>(null)
const flexibility = ref(0)
const selectedDuration = ref('2')

const flexOptions = [
  { label: 'Exact', value: 0 },
  { label: '± 1 dag', value: 1 },
  { label: '± 2 dagen', value: 2 },
  { label: '± 3 dagen', value: 3 },
]

const durationOptions = [
  { id: '1', label: '1 nacht', sub: null },
  { id: '2', label: '2 nachten', sub: null },
  { id: '3', label: '3 nachten', sub: null },
  { id: '4', label: '4 nachten', sub: null },
  { id: '5+', label: '5+ nachten', sub: null },
  { id: 'weekend-short', label: 'Weekend', sub: 'za – zo' },
  { id: 'weekend-long', label: 'Weekend', sub: 'vr – zo' },
  { id: 'long-weekend', label: 'Lang weekend', sub: 'vr – ma' },
]

const monthNames = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December']

const calMonthLabel = computed(() => `${monthNames[calMonth.value.month]} ${calMonth.value.year}`)

function calPrev() {
  if (calMonth.value.month === 0) {
    calMonth.value = { year: calMonth.value.year - 1, month: 11 }
  } else {
    calMonth.value = { ...calMonth.value, month: calMonth.value.month - 1 }
  }
}

function calNext() {
  if (calMonth.value.month === 11) {
    calMonth.value = { year: calMonth.value.year + 1, month: 0 }
  } else {
    calMonth.value = { ...calMonth.value, month: calMonth.value.month + 1 }
  }
}

const calCells = computed(() => {
  const { year, month } = calMonth.value
  const firstDay = new Date(year, month, 1).getDay()
  const offset = firstDay === 0 ? 6 : firstDay - 1 // Monday start
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const cells: { day: number | null; date: string | null; past: boolean }[] = []
  for (let i = 0; i < offset; i++) cells.push({ day: null, date: null, past: false })
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, date: dateStr, past: date < today })
  }
  return cells
})

function selectDate(date: string) {
  selectedDate.value = selectedDate.value === date ? null : date
}

const whenLabel = computed(() => {
  const parts: string[] = []
  if (selectedDate.value) {
    const [y, m, d] = selectedDate.value.split('-')
    parts.push(`${d}/${m}`)
    if (flexibility.value > 0) parts[0] += ` ±${flexibility.value}`
  }
  const dur = durationOptions.find(o => o.id === selectedDuration.value)
  if (dur) parts.push(dur.label)
  if (parts.length === 0) return 'Kies datum'
  return parts.join(', ')
})

// --- WHO ---
const searchGroup = ref({
  adults: 2,
  children: [] as { age: number }[],
  dog: false,
})

function addSearchChild() {
  searchGroup.value.children.push({ age: 4 })
}

function removeSearchChild() {
  searchGroup.value.children.pop()
}

const whoLabel = computed(() => {
  const parts: string[] = []
  parts.push(`${searchGroup.value.adults} volw.`)
  if (searchGroup.value.children.length > 0) {
    parts.push(`${searchGroup.value.children.length} kind.`)
  }
  if (searchGroup.value.dog) parts.push('🐕')
  return parts.join(', ')
})

function handleSearch() {
  closePopup()
}
</script>

<style scoped>
.site-header {
  position: relative;
  z-index: 500;
  /* Reserve space for the search bar that hangs below the nav */
  padding-bottom: 36px;
  background: #111111;
  /* Extra clearance below so following content (breadcrumbs) isn't obscured
     by the search bar that extends half outside the header */
  margin-bottom: 56px;
}

/* Nav bar */
.site-header__nav {
  background: #111111;
  height: 88px;
  display: flex;
  align-items: center;
}

.site-header__nav-inner {
  display: flex;
  align-items: center;
  gap: var(--space-xl);
  width: 100%;
}

/* Logo */
.site-header__logo {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.site-header__logo-img {
  height: 68px;
  width: auto;
  display: block;
}

/* Verticals switcher */
.verticals {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  justify-content: center;
}

.verticals__item {
  display: inline-flex;
  align-items: center;
  padding: 8px 18px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.72);
  text-decoration: none;
  border-radius: 999px;
  transition: background var(--transition-fast), color var(--transition-fast);
  white-space: nowrap;
}

.verticals__item:hover {
  color: white;
  background: rgba(255, 255, 255, 0.08);
}

.verticals__item--active {
  color: white;
  background: rgba(255, 255, 255, 0.12);
  font-weight: 600;
}

/* Right actions */
.site-header__nav-actions {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-shrink: 0;
}

/* VIP button — gold gradient */
.vip-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border: 1px solid rgba(212, 168, 67, 0.7);
  border-radius: 999px;
  background: linear-gradient(135deg, #E6C56B 0%, #D4A843 45%, #B8862A 100%);
  color: #1A1A1A;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.4px;
  cursor: pointer;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08) inset, 0 4px 12px rgba(180, 130, 30, 0.25);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), filter var(--transition-fast);
}

.vip-btn:hover {
  filter: brightness(1.06);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12) inset, 0 6px 18px rgba(180, 130, 30, 0.35);
  transform: translateY(-1px);
}

.vip-btn svg {
  color: #1A1A1A;
}

/* Hamburger button */
.hamburger-btn {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.hamburger-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
}

.hamburger-btn span {
  display: block;
  width: 18px;
  height: 2px;
  background: #ffffff;
  border-radius: 1px;
}

/* Search dock: overlaps nav & page below */
.site-header__search-dock {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  transform: translateY(50%);
  z-index: 2;
  pointer-events: none;
}

.site-header__search-container {
  pointer-events: none;
}

.site-header__search-container > .search-bar {
  pointer-events: auto;
}

/* Search bar */
.search-bar {
  width: 100%;
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 999px;
  height: 72px;
  padding: 0 6px 0 0;
  position: relative;
  border: 2px solid var(--color-gold);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.22), 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-bar__field {
  flex: 1;
  padding: 12px 24px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;
  border: none;
  background: none;
  text-align: left;
  border-radius: 999px;
  transition: background var(--transition-fast);
  min-width: 0;
}

.search-bar__field:hover {
  background: #f5f5f5;
}

.search-bar__field--active {
  background: #eeeeee;
}

.search-bar__field--destination {
  flex: 1.2;
}

.search-bar__label {
  font-size: 11px;
  font-weight: 600;
  color: #999999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.search-bar__value {
  font-size: 14px;
  color: #1A1A1A;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-bar__divider {
  width: 1px;
  height: 24px;
  background: #ddd;
  flex-shrink: 0;
}

.search-bar__btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-primary);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  margin-left: 4px;
  transition: background var(--transition-fast);
  color: white;
}

.search-bar__btn:hover {
  background: var(--color-primary-hover);
}

/* ==================== */
/* POPUP OVERLAY        */
/* ==================== */
.popup-overlay {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: var(--space-md);
  z-index: 600;
}

.popup {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: var(--space-lg);
  max-width: 680px;
  width: 100%;
  max-height: 70vh;
  overflow-y: auto;
}

.popup__section {
  margin-bottom: var(--space-lg);
}

.popup__section:last-child {
  margin-bottom: 0;
}

.popup__section-title {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
}

.popup__grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.popup__row {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: var(--space-xl);
}

/* ==================== */
/* DESTINATION CHIPS    */
/* ==================== */
.dest-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid var(--color-border);
  border-radius: 24px;
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 13px;
}

.dest-chip:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.dest-chip--selected {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  font-weight: 600;
}

.dest-chip__emoji {
  font-size: 15px;
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
/* MINI CALENDAR        */
/* ==================== */
.mini-cal {
  margin-bottom: var(--space-lg);
}

.mini-cal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.mini-cal__month {
  font-size: 15px;
  font-weight: 600;
}

.mini-cal__nav {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: none;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  color: var(--color-text-primary);
}

.mini-cal__nav:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.mini-cal__days-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  margin-bottom: var(--space-xs);
}

.mini-cal__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.mini-cal__cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.mini-cal__cell:hover:not(.mini-cal__cell--empty):not(.mini-cal__cell--past) {
  background: var(--color-primary-light);
  color: var(--color-primary-hover);
}

.mini-cal__cell--empty {
  cursor: default;
}

.mini-cal__cell--past {
  color: var(--color-text-muted);
  opacity: 0.4;
  cursor: default;
}

.mini-cal__cell--selected {
  background: var(--color-primary) !important;
  color: white !important;
  font-weight: 600;
}

/* Flexibility */
.flex-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.flex-chips {
  display: flex;
  gap: 6px;
}

.flex-chip {
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: none;
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-text-primary);
}

.flex-chip:hover {
  border-color: var(--color-primary);
}

.flex-chip--selected {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  font-weight: 600;
  color: var(--color-primary-hover);
}

/* ==================== */
/* DURATION OPTIONS     */
/* ==================== */
.duration-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dur-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.dur-chip:hover {
  border-color: var(--color-primary);
}

.dur-chip--selected {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.dur-chip__label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.dur-chip__sub {
  font-size: 12px;
  color: var(--color-text-muted);
}

.dur-chip--selected .dur-chip__label {
  font-weight: 600;
  color: var(--color-primary-hover);
}

/* ==================== */
/* WHO POPUP            */
/* ==================== */
.popup--who {
  max-width: 420px;
}

.who-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.who-row:last-child {
  border-bottom: none;
}

.who-row__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.who-row__label {
  font-size: 15px;
  font-weight: 600;
}

.who-row__sub {
  font-size: 12px;
  color: var(--color-text-muted);
}

.stepper {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.stepper__btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: none;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  color: var(--color-text-primary);
  line-height: 1;
}

.stepper__btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.stepper__btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.stepper__val {
  min-width: 20px;
  text-align: center;
  font-weight: 600;
  font-size: 15px;
}

/* Child ages */
.who-children-ages {
  padding: var(--space-sm) 0 var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  border-bottom: 1px solid var(--color-border-light);
}

.who-child-age {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.who-child-age label {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.who-child-age select {
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 13px;
  min-width: 90px;
}

/* Toggle switch for dog */
.toggle {
  position: relative;
  width: 48px;
  height: 26px;
  display: inline-block;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle__slider {
  position: absolute;
  inset: 0;
  background: var(--color-border);
  border-radius: 26px;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.toggle__slider::before {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  transition: transform var(--transition-fast);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.toggle input:checked + .toggle__slider {
  background: var(--color-primary);
}

.toggle input:checked + .toggle__slider::before {
  transform: translateX(22px);
}

/* ==================== */
/* POPUP TRANSITIONS    */
/* ==================== */
.popup-enter-active,
.popup-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
