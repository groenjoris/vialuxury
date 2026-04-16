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
          <!-- Language switcher -->
          <div class="lang-switcher" ref="langSwitcherRef">
            <button
              type="button"
              class="lang-switcher__trigger"
              @click.stop="langDropdownOpen = !langDropdownOpen"
              aria-haspopup="listbox"
              :aria-expanded="langDropdownOpen"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span>{{ selectedLanguage.code }}</span>
            </button>
            <Transition name="dropdown">
              <ul v-if="langDropdownOpen" class="lang-switcher__menu" role="listbox">
                <li
                  v-for="lang in languages"
                  :key="lang.label"
                  class="lang-switcher__option"
                  :class="{ 'lang-switcher__option--active': lang.label === selectedLanguage.label }"
                  role="option"
                  @click="selectLanguage(lang)"
                >
                  <span class="lang-switcher__flag">{{ lang.flag }}</span>
                  <span class="lang-switcher__label">{{ lang.label }}</span>
                  <span class="lang-switcher__code">{{ lang.code }}</span>
                </li>
              </ul>
            </Transition>
          </div>

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
          <span class="search-bar__label">{{ t('header.destination') }}</span>
          <span class="search-bar__value">{{ destinationLabel }}</span>
        </button>

        <div class="search-bar__divider"></div>

        <!-- 2. Wanneer en hoelang -->
        <button
          class="search-bar__field search-bar__field--when"
          :class="{ 'search-bar__field--active': activePopup === 'when' }"
          @click="togglePopup('when')"
        >
          <span class="search-bar__label">{{ t('header.whenAndHowLong') }}</span>
          <span class="search-bar__value">{{ whenLabel }}</span>
        </button>

        <div class="search-bar__divider"></div>

        <!-- 3. Wie gaat er mee -->
        <button
          class="search-bar__field search-bar__field--who"
          :class="{ 'search-bar__field--active': activePopup === 'who' }"
          @click="togglePopup('who')"
        >
          <span class="search-bar__label">{{ t('header.whosComing') }}</span>
          <span class="search-bar__value">{{ whoLabel }}</span>
        </button>

          <!-- Search button -->
          <button class="search-bar__btn" @click="handleSearch" :aria-label="t('header.search')">
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
          <DestinationPopup
            :destinations="destinations"
            :themes="themes"
            :selected-destinations="selectedDestinations"
            :selected-themes="selectedThemes"
            @toggle-destination="toggleDestination"
            @toggle-theme="toggleTheme"
            @select-hotel="handleSelectHotel"
            @select-city="handleSelectCity"
          />
        </div>

        <!-- WHEN POPUP -->
        <div v-if="activePopup === 'when'" class="popup popup--when">
          <DatePopup
            v-model:cal-month="calMonth"
            v-model:selected-date="selectedDate"
            v-model:flexibility="flexibility"
            v-model:selected-duration="selectedDuration"
            @update:flex-state="handleFlexState"
          />
        </div>

        <!-- WHO POPUP -->
        <div v-if="activePopup === 'who'" class="popup popup--who">
          <!-- Adults -->
          <div class="who-row">
            <div class="who-row__info">
              <span class="who-row__label">{{ t('header.adults') }}</span>
              <span class="who-row__sub">{{ t('header.adultsAge') }}</span>
            </div>
            <div class="stepper">
              <button class="stepper__btn" :disabled="searchGroup.adults <= 1" @click="searchGroup.adults--">&#8722;</button>
              <span class="stepper__val">{{ searchGroup.adults }}</span>
              <button class="stepper__btn" :disabled="searchGroup.adults >= 8" @click="searchGroup.adults++">+</button>
            </div>
          </div>

          <!-- Children -->
          <div class="who-row">
            <div class="who-row__info">
              <span class="who-row__label">{{ t('header.children') }}</span>
              <span class="who-row__sub">{{ t('header.childrenAge') }}</span>
            </div>
            <div class="stepper">
              <button class="stepper__btn" :disabled="searchGroup.children.length <= 0" @click="removeSearchChild">&#8722;</button>
              <span class="stepper__val">{{ searchGroup.children.length }}</span>
              <button class="stepper__btn" :disabled="searchGroup.children.length >= 4" @click="addSearchChild">+</button>
            </div>
          </div>

          <!-- Child ages -->
          <div v-if="searchGroup.children.length > 0" class="who-children-ages">
            <div v-for="(child, idx) in searchGroup.children" :key="idx" class="who-child-age">
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
              <button class="stepper__btn" :disabled="searchGroup.rooms <= 1" @click="searchGroup.rooms--">&#8722;</button>
              <span class="stepper__val">{{ searchGroup.rooms }}</span>
              <button class="stepper__btn" :disabled="searchGroup.rooms >= 4" @click="searchGroup.rooms++">+</button>
            </div>
          </div>

          <!-- Dog -->
          <div class="who-row who-row--dog">
            <div class="who-row__info">
              <span class="who-row__label">{{ t('header.dog') }}</span>
              <span class="who-row__sub">{{ t('header.dogSub') }}</span>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="searchGroup.dog" />
              <span class="toggle__slider"></span>
            </label>
          </div>

          <!-- Done button -->
          <button class="popup__done-btn" @click="closePopup()">{{ t('header.done') }}</button>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { useLocaleStore } from '~/stores/locale'

const { t } = useI18n()
const localeStore = useLocaleStore()

// --- Verticals (computed for reactivity on locale change) ---
const verticals = computed(() => [
  { id: 'hotels', label: t('header.hotels'), href: '/' },
  { id: 'vakantieparken', label: t('header.holidayParks'), href: '/vakantieparken' },
  { id: 'restaurants', label: t('header.restaurants'), href: '/restaurants' },
])
const activeVertical = ref('hotels')

// --- Language switcher ---
const languages = [
  { code: 'EN', label: 'English', flag: '\u{1F1EC}\u{1F1E7}' },
  { code: 'NL', label: 'Nederlands', flag: '\u{1F1F3}\u{1F1F1}' },
]

const selectedLanguage = ref(
  localeStore.locale === 'en' ? languages[0] : languages[1]
)
const langDropdownOpen = ref(false)
const langSwitcherRef = ref<HTMLElement | null>(null)

function selectLanguage(lang: typeof languages[number]) {
  selectedLanguage.value = lang
  langDropdownOpen.value = false
  if (lang.code === 'EN') {
    localeStore.setLocale('en')
  } else {
    localeStore.setLocale('nl')
  }
}

function onLangClickOutside(e: MouseEvent) {
  if (langSwitcherRef.value && !langSwitcherRef.value.contains(e.target as Node)) {
    langDropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onLangClickOutside))
onUnmounted(() => document.removeEventListener('click', onLangClickOutside))

const activePopup = ref<'destination' | 'when' | 'who' | null>(null)

function togglePopup(popup: 'destination' | 'when' | 'who') {
  activePopup.value = activePopup.value === popup ? null : popup
}

function closePopup() {
  activePopup.value = null
}

// --- DESTINATION ---
const destinations = [
  { id: 'zeeland', name: 'Zeeland', country: 'NL', emoji: '\u{1F3D6}\u{FE0F}' },
  { id: 'brabant', name: 'Noord-Brabant', country: 'NL', emoji: '\u{1F333}' },
  { id: 'limburg', name: 'Limburg', country: 'NL', emoji: '\u26F0\u{FE0F}' },
  { id: 'gelderland', name: 'Gelderland', country: 'NL', emoji: '\u{1F332}' },
  { id: 'drenthe', name: 'Drenthe', country: 'NL', emoji: '\u{1F33E}' },
  { id: 'friesland', name: 'Friesland', country: 'NL', emoji: '\u26F5' },
  { id: 'overijssel', name: 'Overijssel', country: 'NL', emoji: '\u{1F3E1}' },
  { id: 'flevoland', name: 'Flevoland', country: 'NL', emoji: '\u{1F305}' },
  { id: 'noord-holland', name: 'Noord-Holland', country: 'NL', emoji: '\u{1F337}' },
  { id: 'zuid-holland', name: 'Zuid-Holland', country: 'NL', emoji: '\u{1F3D9}\u{FE0F}' },
  { id: 'ardennen', name: 'Ardennen', country: 'BE', emoji: '\u{1F3D4}\u{FE0F}' },
  { id: 'vlaanderen', name: 'Vlaanderen', country: 'BE', emoji: '\u{1F3F0}' },
  { id: 'belgische-kust', name: 'Belgische Kust', country: 'BE', emoji: '\u{1F41A}' },
  { id: 'wallonie', name: 'Walloni\u00EB', country: 'BE', emoji: '\u{1F37A}' },
]

const themes = computed(() => [
  { id: 'aan-zee', name: t('header.theme.beach'), emoji: '\u{1F30A}' },
  { id: 'natuur', name: t('header.theme.nature'), emoji: '\u{1F33F}' },
  { id: 'wellness', name: t('header.theme.wellness'), emoji: '\u{1F9D6}' },
  { id: 'romantisch', name: t('header.theme.romantic'), emoji: '\u2764\u{FE0F}' },
  { id: 'culinair', name: t('header.theme.culinary'), emoji: '\u{1F37D}\u{FE0F}' },
  { id: 'actief', name: t('header.theme.active'), emoji: '\u{1F6B4}' },
  { id: 'steden', name: t('header.theme.city'), emoji: '\u{1F3DB}\u{FE0F}' },
  { id: 'kasteel', name: t('header.theme.castle'), emoji: '\u{1F3F0}' },
])

const selectedDestinations = ref<string[]>([])
const selectedThemes = ref<string[]>([])
const selectedCities = ref<{ name: string; province: string }[]>([])

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

function handleSelectCity(city: { name: string; province: string }) {
  // Avoid duplicates
  if (!selectedCities.value.find(c => c.name === city.name)) {
    selectedCities.value.push(city)
  }
}

const destinationLabel = computed(() => {
  // Collect all selected names in order
  const names: string[] = []

  for (const id of selectedDestinations.value) {
    const d = destinations.find(d => d.id === id)
    if (d) names.push(d.name)
  }
  for (const id of selectedThemes.value) {
    const th = themes.value.find(th => th.id === id)
    if (th) names.push(th.name)
  }
  for (const city of selectedCities.value) {
    names.push(city.name)
  }

  if (names.length === 0) return t('header.chooseDestination')
  if (names.length === 1) return names[0]
  return `${names[0]} + ${names.length - 1}`
})

// --- WHEN ---
const calMonth = ref({ year: new Date().getFullYear(), month: new Date().getMonth() })
const selectedDate = ref<string | null>(null)
const flexibility = ref(0)
const selectedDuration = ref('')
const flexState = ref<{ duration: string; months: string[] }>({ duration: '', months: [] })

// Sync arrival date to shared composable so sidebar can read it
const { setArrivalDate, setSearchGroup, setLoading } = useSearchState()
watch(selectedDate, (val) => {
  setArrivalDate(val)
  // Selecting an arrival date clears flex months
  if (val && flexState.value.months.length > 0) {
    flexState.value = { ...flexState.value, months: [] }
  }
})
// Calendar duration clears flex duration
watch(selectedDuration, (val) => {
  if (val && flexState.value.duration) {
    flexState.value = { ...flexState.value, duration: '' }
  }
})

const durationOptions = computed(() => [
  { id: '1', label: t('header.duration.1night'), sub: null },
  { id: '2', label: t('header.duration.2nights'), sub: null },
  { id: '3', label: t('header.duration.3nights'), sub: null },
  { id: '4', label: t('header.duration.4nights'), sub: null },
  { id: '5+', label: t('header.duration.5nights'), sub: null },
  { id: 'weekend-short', label: t('header.duration.weekendShort'), sub: t('header.duration.weekendShortSub') },
  { id: 'weekend-long', label: t('header.duration.weekendLong'), sub: t('header.duration.weekendLongSub') },
  { id: 'long-weekend', label: t('header.duration.longWeekend'), sub: t('header.duration.longWeekendSub') },
])

const monthNames = computed(() => Array.from({ length: 12 }, (_, i) => t(`header.months.${i}`)))

function handleFlexState(state: { duration: string; months: string[] }) {
  flexState.value = state
  // Selecting months replaces the arrival date
  if (state.months.length > 0 && selectedDate.value) {
    selectedDate.value = null
  }
  // Flex duration replaces calendar duration
  if (state.duration) {
    selectedDuration.value = ''
  }
}

const whenLabel = computed(() => {
  // Format: [when], [duration]
  // When = arrival date OR flex months OR "Flexibel"
  // Duration = calendar duration OR flex type/nights OR "elke duur"/"any duration"

  let whenPart = ''
  let durationPart = ''

  // When part
  if (selectedDate.value) {
    const [y, m, d] = selectedDate.value.split('-')
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

  // Duration part
  if (selectedDuration.value) {
    const dur = durationOptions.value.find(o => o.id === selectedDuration.value)
    if (dur) durationPart = dur.label
  } else if (flexState.value.duration) {
    const flexDur = flexState.value.duration
    const nightsOpt = durationOptions.value.find(o => o.id === flexDur)
    if (nightsOpt) {
      durationPart = nightsOpt.label
    } else {
      const typeLabels: Record<string, string> = {
        'weekend-fri-sun': t('header.flex.weekendFriSun'),
        'weekend-sat-sun': t('header.flex.weekendSatSun'),
        'long-weekend': t('header.flex.longWeekend'),
        'midweek': t('header.flex.midweek'),
      }
      durationPart = typeLabels[flexDur] || ''
    }
  } else {
    durationPart = t('header.anyDuration')
  }

  const label = `${whenPart}, ${durationPart}`
  return label.length > 32 ? label.substring(0, 30) + '...' : label
})

// --- WHO ---
const searchGroup = ref({
  adults: 2,
  children: [] as { age: number }[],
  rooms: 1,
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
  parts.push(`${searchGroup.value.adults} ${t('common.adultsShort')}`)
  if (searchGroup.value.children.length > 0) {
    parts.push(`${searchGroup.value.children.length} ${t('common.childrenShort')}`)
  }
  if (searchGroup.value.rooms > 1) {
    parts.push(`${searchGroup.value.rooms} ${searchGroup.value.rooms === 1 ? t('common.roomSingular') : t('common.roomPlural')}`)
  }
  if (searchGroup.value.dog) parts.push('\u{1F415}')
  return parts.join(', ')
})

function handleSearch() {
  closePopup()
  const totalPersons = searchGroup.value.adults + searchGroup.value.children.length
  setSearchGroup(totalPersons, searchGroup.value.rooms)
  setLoading(true)
  navigateTo('/search')
}

function handleSelectHotel(slug: string) {
  closePopup()
  navigateTo(`/deal/${slug}`)
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
  gap: 28px;
  margin-left: 24px;
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
  margin-left: auto;
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

/* Language switcher */
.lang-switcher {
  position: relative;
}

.lang-switcher__trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.85);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.lang-switcher__trigger:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
}

.lang-switcher__trigger svg {
  opacity: 0.75;
}

.lang-switcher__menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 210px;
  background: #1A1A1A;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  list-style: none;
  padding: 6px 0;
  margin: 0;
  z-index: 100;
}

.lang-switcher__option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
  transition: background var(--transition-fast);
}

.lang-switcher__option:hover {
  background: rgba(255, 255, 255, 0.08);
}

.lang-switcher__option--active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.06);
}

.lang-switcher__flag {
  font-size: 18px;
  line-height: 1;
}

.lang-switcher__label {
  flex: 1;
  font-weight: 500;
}

.lang-switcher__code {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
}

/* Language dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 150ms ease, transform 150ms ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
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
  max-height: 70vh;
  overflow-y: auto;
}

.popup--destination {
  padding: 0;
  max-width: 680px;
  width: 100%;
}

.popup--when {
  padding: 0;
  max-width: 660px;
  width: 100%;
}

.popup--who {
  padding: var(--space-lg);
  max-width: 420px;
  width: 100%;
}

/* ==================== */
/* WHO POPUP            */
/* ==================== */
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

/* Done button in who popup */
.popup__done-btn {
  width: 100%;
  margin-top: var(--space-md);
  padding: 12px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: white;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.popup__done-btn:hover {
  background: var(--color-primary-dark);
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
