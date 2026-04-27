<template>
  <header class="site-header" :class="{ 'site-header--overlay': variant === 'overlay' }">
    <!-- Main nav bar -->
    <div class="site-header__nav">
      <div class="site-header__nav-inner container">
        <!-- Logo -->
        <NuxtLink to="/" class="site-header__logo">
          <img
            src="/images/logo-vialuxury-horizontal.svg"
            alt="ViaLuxury"
            class="site-header__logo-img site-header__logo-img--horizontal"
          />
        </NuxtLink>

        <!-- Verticals switcher (desktop only) -->
        <nav v-if="!isMobile" class="verticals" aria-label="Verticals">
          <NuxtLink
            v-for="v in verticals"
            :key="v.id"
            :to="v.href"
            class="verticals__item"
            :class="{ 'verticals__item--active': v.id === activeVertical }"
          >
            <template v-if="v.id === 'hotels'">
              <span>Hotels <span class="verticals__item-accent">+ <span class="verticals__item-more">more</span></span></span>
            </template>
            <template v-else>{{ v.label }}</template>
          </NuxtLink>
        </nav>

        <!-- Right actions -->
        <div class="site-header__nav-actions">
          <!-- Contact dropdown removed from main bar — accessible via hamburger. -->
          <div v-if="false" class="contact-dropdown" ref="contactDropdownRef">
            <button
              type="button"
              class="contact-trigger"
              @click.stop="contactDropdownOpen = !contactDropdownOpen"
              :aria-expanded="contactDropdownOpen"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>{{ t('header.contact') }}</span>
            </button>
            <Teleport to="body">
            <Transition name="dropdown">
              <div v-if="contactDropdownOpen" class="contact-dropdown__menu" :style="contactMenuStyle">
                <span class="contact-dropdown__heading">{{ t('header.contactNeedHelp') }}</span>

                <a href="tel:+31857773222" class="contact-dropdown__item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <div class="contact-dropdown__item-text">
                    <span class="contact-dropdown__item-label">+31 85 777 3222</span>
                    <span class="contact-dropdown__item-sub">{{ t('header.contactPhoneHours') }}</span>
                  </div>
                </a>

                <a href="https://wa.me/31857773222" target="_blank" class="contact-dropdown__item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <div class="contact-dropdown__item-text">
                    <span class="contact-dropdown__item-label">WhatsApp</span>
                    <span class="contact-dropdown__item-sub">{{ t('header.contactWhatsappSub') }}</span>
                  </div>
                </a>

                <div class="contact-dropdown__divider"></div>

                <NuxtLink to="/contact" class="contact-dropdown__link" @click="contactDropdownOpen = false">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  {{ t('header.contactForm') }}
                </NuxtLink>

                <NuxtLink to="/veelgestelde-vragen" class="contact-dropdown__link" @click="contactDropdownOpen = false">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  {{ t('header.faq') }}
                </NuxtLink>

                <div class="contact-dropdown__divider"></div>

                <a href="tel:+31857773333" class="contact-dropdown__item contact-dropdown__item--urgent">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <div class="contact-dropdown__item-text">
                    <span class="contact-dropdown__item-label">{{ t('header.contactUrgent') }}</span>
                    <span class="contact-dropdown__item-sub">+31 85 777 3333</span>
                  </div>
                </a>
              </div>
            </Transition>
            </Teleport>
          </div>

          <!-- Language switcher (desktop only) -->
          <div v-if="!isMobile" class="lang-switcher" ref="langSwitcherRef">
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

          <!-- Leden ingang (desktop only) -->
          <NuxtLink v-if="!isMobile" to="/leden" class="vip-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 2 15 8l6 .9-4.5 4.4L17.5 20 12 16.9 6.5 20 8 13.3 3.5 8.9 9.5 8z" />
            </svg>
            <span>{{ t('header.membersEntrance') }}</span>
          </NuxtLink>

          <div class="hamburger-wrap" ref="hamburgerWrapRef">
            <button type="button" class="hamburger-btn" aria-label="Menu" @click.stop="onHamburgerClick" :aria-expanded="hamburgerDropdownOpen">
              <span></span>
              <span></span>
              <span></span>
            </button>

            <!-- Desktop / iPad: compact dropdown (same style as contact dropdown) -->
            <Teleport to="body">
              <div v-if="hamburgerDropdownOpen && !isMobile" class="hamburger-dropdown__menu" :style="hamburgerMenuStyle">
                  <span class="hamburger-dropdown__heading">Menu</span>

                  <NuxtLink v-for="v in verticals" :key="v.id" :to="v.href" class="hamburger-dropdown__link" @click="hamburgerDropdownOpen = false">
                    <template v-if="v.id === 'hotels'"><span>Hotels <span class="verticals__item-accent">+ <span class="verticals__item-more">more</span></span></span></template>
                    <template v-else>{{ v.label }}</template>
                  </NuxtLink>

                  <div class="contact-dropdown__divider"></div>

                  <NuxtLink to="/leden" class="hamburger-dropdown__link" @click="hamburgerDropdownOpen = false">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    {{ t('header.membersEntrance') }}
                  </NuxtLink>
                  <NuxtLink to="/contact" class="hamburger-dropdown__link" @click="hamburgerDropdownOpen = false">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    {{ t('header.contact') }}
                  </NuxtLink>
                  <NuxtLink to="/veelgestelde-vragen" class="hamburger-dropdown__link" @click="hamburgerDropdownOpen = false">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    {{ t('header.faq') }}
                  </NuxtLink>

                  <div class="contact-dropdown__divider"></div>

                <div class="hamburger-dropdown__lang">
                  <button v-for="lang in languages" :key="lang.label" type="button" class="hamburger-dropdown__lang-btn" :class="{ 'hamburger-dropdown__lang-btn--active': lang.label === selectedLanguage.label }" @click="selectLanguage(lang); hamburgerDropdownOpen = false">
                    {{ lang.code }}
                  </button>
                </div>
              </div>
            </Teleport>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile search trigger: single full-width button under nav (visible <768px) -->
    <div class="site-header__mobile-search">
      <button type="button" class="mobile-search-trigger" @click="mobileSearchOpen = true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <span class="mobile-search-trigger__label">{{ mobileSearchLabel }}</span>
      </button>
    </div>

    <!-- Hero content slot (overlay mode only) -->
    <slot v-if="variant === 'overlay'" name="hero" />

    <!-- Search bar dock: overlaps nav + page (desktop only) -->
    <div class="site-header__search-dock">
      <div class="container site-header__search-container">
        <div class="search-bar">
        <!-- 1. Waarheen -->
        <button
          ref="destField"
          class="search-bar__field search-bar__field--destination"
          :class="{ 'search-bar__field--active': activePopup === 'destination' }"
          @click="togglePopup('destination')"
        >
          <span v-if="variant === 'overlay'" class="search-bar__field-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </span>
          <span class="search-bar__field-text">
            <span class="search-bar__label">{{ t('header.destination') }}</span>
            <span class="search-bar__value">{{ destinationLabel }}</span>
          </span>
        </button>

        <div class="search-bar__divider"></div>

        <!-- 2. Wanneer en hoelang -->
        <button
          ref="whenField"
          class="search-bar__field search-bar__field--when"
          :class="{ 'search-bar__field--active': activePopup === 'when' }"
          @click="togglePopup('when')"
        >
          <span v-if="variant === 'overlay'" class="search-bar__field-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          </span>
          <span class="search-bar__field-text">
            <span class="search-bar__label">{{ t('header.whenAndHowLong') }}</span>
            <span class="search-bar__value">{{ whenLabel }}</span>
          </span>
        </button>

        <div class="search-bar__divider"></div>

        <!-- 3. Wie gaat er mee -->
        <button
          ref="whoField"
          class="search-bar__field search-bar__field--who"
          :class="{ 'search-bar__field--active': activePopup === 'who' }"
          @click="togglePopup('who')"
        >
          <span v-if="variant === 'overlay'" class="search-bar__field-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </span>
          <span class="search-bar__field-text">
            <span class="search-bar__label">{{ t('header.whosComing') }}</span>
            <span class="search-bar__value">{{ whoLabel }}</span>
          </span>
        </button>

          <!-- Search button: Find Deals (overlay) or compact icon (default) -->
          <button v-if="variant === 'overlay'" class="search-bar__btn search-bar__btn--find-deals" @click="handleSearch">
            <span>Vind deals</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
          </button>
          <button v-else class="search-bar__btn" @click="handleSearch" :aria-label="t('header.search')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Popups: teleported to body so they escape parent overflow/stacking
         contexts. Positioned via JS so they align with the clicked field
         and flip above/below depending on viewport space. -->
    <Teleport to="body">
    <Transition name="popup">
      <div v-if="activePopup" class="popup-backdrop" @click.self="closePopup">
        <div class="popup-anchor" :style="popupStyle">
        <!-- DESTINATION POPUP -->
        <div v-if="activePopup === 'destination'" class="popup popup--destination">
          <DestinationPopup
            :destinations="destinations"
            :themes="themes"
            :selected-destinations="selectedDestinations"
            :selected-themes="selectedThemes"
            :selected-cities="selectedCities"
            :selection-order="selectionOrder"
            @toggle-destination="toggleDestination"
            @toggle-theme="toggleTheme"
            @select-hotel="handleSelectHotel"
            @select-city="handleSelectCity"
            @remove-city="handleRemoveCity"
            @save="closePopup()"
            @clear="clearDestination"
          />
        </div>

        <!-- WHEN POPUP -->
        <div v-if="activePopup === 'when'" class="popup popup--when">
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
          <div class="popup__footer">
            <a href="#" class="popup__clear-link" @click.prevent="clearWho">{{ t('header.clear') }}</a>
            <button class="popup__done-btn" @click="closePopup()">{{ t('header.done') }}</button>
          </div>
        </div>
        </div>
      </div>
    </Transition>
    </Teleport>

    <!-- Mobile hamburger menu drawer -->
    <MobileFullscreen :open="mobileMenuOpen" :title="'Menu'" @close="mobileMenuOpen = false">
      <nav class="mobile-menu">
        <!-- Verticals -->
        <div class="mobile-menu__section">
          <NuxtLink v-for="v in verticals" :key="v.id" :to="v.href" class="mobile-menu__item" @click="mobileMenuOpen = false">
            {{ v.label }}
          </NuxtLink>
        </div>
        <div class="mobile-menu__divider"></div>
        <div class="mobile-menu__section">
          <NuxtLink to="/leden" class="mobile-menu__item" @click="mobileMenuOpen = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" /></svg>
            {{ t('header.membersEntrance') }}
          </NuxtLink>
          <NuxtLink to="/veelgestelde-vragen" class="mobile-menu__item" @click="mobileMenuOpen = false">
            {{ t('header.faq') }}
          </NuxtLink>
          <NuxtLink to="/contact" class="mobile-menu__item" @click="mobileMenuOpen = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            {{ t('header.contact') }}
          </NuxtLink>
        </div>
        <div class="mobile-menu__divider"></div>
        <!-- Language toggle -->
        <div class="mobile-menu__section">
          <div class="mobile-menu__label">{{ selectedLanguage.label }}</div>
          <button v-for="lang in languages" :key="lang.label" type="button" class="mobile-menu__item" @click="selectLanguage(lang); mobileMenuOpen = false">
            {{ lang.label }}
          </button>
        </div>
      </nav>
    </MobileFullscreen>

    <!-- Mobile full-screen search modal -->
    <MobileSearchModal
      :open="mobileSearchOpen"
      :destinations="destinations"
      :themes="themes"
      :selected-destinations="selectedDestinations"
      :selected-themes="selectedThemes"
      :selected-cities="selectedCities"
      :selection-order="selectionOrder"
      :cal-month="calMonth"
      :selected-date="selectedDate"
      :flexibility="flexibility"
      :selected-durations="selectedDurations"
      :search-group="searchGroup"
      :destination-label="destinationLabel"
      :when-label="whenLabel"
      :who-label="whoLabel"
      @close="mobileSearchOpen = false"
      @toggle-destination="toggleDestination"
      @toggle-theme="toggleTheme"
      @select-hotel="handleSelectHotel"
      @select-city="handleSelectCity"
      @remove-city="handleRemoveCity"
      @clear-destinations="clearDestination"
      @update:cal-month="calMonth = $event"
      @update:selected-date="selectedDate = $event"
      @update:flexibility="flexibility = $event"
      @update:selected-durations="selectedDurations = $event"
      @update:flex-state="handleFlexState"
      @update:search-group="searchGroup = $event"
      @search="handleMobileSearch"
    />

  </header>
</template>

<script setup lang="ts">
import { useLocaleStore } from '~/stores/locale'

withDefaults(defineProps<{
  /** 'solid' = default dark bar; 'overlay' = transparent over a background image (e.g. home hero) */
  variant?: 'solid' | 'overlay'
}>(), { variant: 'solid' })

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

// --- Contact dropdown ---
const contactDropdownOpen = ref(false)
const contactDropdownRef = ref<HTMLElement | null>(null)
const contactMenuStyle = ref<Record<string, string>>({})

// Hamburger: dropdown on desktop/iPad, full-screen drawer on mobile.
const hamburgerDropdownOpen = ref(false)
const hamburgerWrapRef = ref<HTMLElement | null>(null)
const hamburgerMenuStyle = ref<Record<string, string>>({})

function onHamburgerClick() {
  if (isMobile.value) {
    mobileMenuOpen.value = true
    return
  }
  hamburgerDropdownOpen.value = !hamburgerDropdownOpen.value
  if (hamburgerDropdownOpen.value && hamburgerWrapRef.value) {
    const rect = hamburgerWrapRef.value.getBoundingClientRect()
    hamburgerMenuStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 8}px`,
      right: `${window.innerWidth - rect.right}px`,
    }
  }
}

watch(contactDropdownOpen, (open) => {
  if (open && contactDropdownRef.value) {
    const trigger = contactDropdownRef.value.querySelector('.contact-trigger')
    if (trigger) {
      const rect = trigger.getBoundingClientRect()
      contactMenuStyle.value = {
        position: 'fixed',
        top: `${rect.bottom + 8}px`,
        right: `${window.innerWidth - rect.right}px`,
      }
    }
  }
})

// Click-outside handlers (one per dropdown) — automatically detached on unmount
useClickOutside(langSwitcherRef, () => { langDropdownOpen.value = false })
useClickOutside(contactDropdownRef, () => { contactDropdownOpen.value = false })
useClickOutside(hamburgerWrapRef, () => { hamburgerDropdownOpen.value = false })

const activePopup = ref<'destination' | 'when' | 'who' | null>(null)

// Refs to each search-bar field button → used to position popups
const destField = ref<HTMLElement | null>(null)
const whenField = ref<HTMLElement | null>(null)
const whoField = ref<HTMLElement | null>(null)

// Approximate popup heights (used to decide above/below flip)
const POPUP_HEIGHTS: Record<'destination' | 'when' | 'who', number> = {
  destination: 540,
  when: 620,
  who: 380,
}

const popupStyle = ref<Record<string, string>>({})

function fieldRect() {
  switch (activePopup.value) {
    case 'destination': return destField.value?.getBoundingClientRect()
    case 'when':        return whenField.value?.getBoundingClientRect()
    case 'who':         return whoField.value?.getBoundingClientRect()
    default:            return undefined
  }
}

function computePopupPosition() {
  const which = activePopup.value
  if (!which) return
  const rect = fieldRect()
  if (!rect) return
  const margin = 12
  popupStyle.value = {
    position: 'fixed',
    top: (rect.bottom + margin) + 'px',
    left: Math.max(8, rect.left) + 'px',
  }
}

/** If the popup wouldn't fit below the field, scroll the page down so it
 * does — runs simultaneously with the popup opening so they animate as one.
 * The popup itself is `position: fixed` and follows the field via the
 * scroll listener that calls computePopupPosition(). */
function scrollToFitPopup() {
  const which = activePopup.value
  if (!which) return
  const rect = fieldRect()
  if (!rect) return
  const margin = 12
  const popupHeight = POPUP_HEIGHTS[which]
  const overflow = (rect.bottom + margin + popupHeight) - window.innerHeight
  if (overflow > 0) {
    window.scrollBy({ top: overflow, behavior: 'smooth' })
  }
}

// Mobile: single full-screen search modal + hamburger menu
const isMobile = useIsMobile()
const mobileSearchOpen = ref(false)
const mobileMenuOpen = ref(false)
const mobileSearchLabel = computed(() => {
  // Compact summary: "Alle bestemmingen · Flexibel · 2 volwassenen"
  const parts: string[] = []
  parts.push(destinationLabel.value)
  parts.push(whenLabel.value)
  parts.push(whoLabel.value)
  return parts.join(' · ')
})

function togglePopup(popup: 'destination' | 'when' | 'who') {
  activePopup.value = activePopup.value === popup ? null : popup
}

watch(activePopup, (val) => {
  if (val) {
    nextTick(() => {
      computePopupPosition()
      scrollToFitPopup()
    })
  }
})

onMounted(() => {
  window.addEventListener('resize', computePopupPosition)
  window.addEventListener('scroll', computePopupPosition, { passive: true, capture: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', computePopupPosition)
  window.removeEventListener('scroll', computePopupPosition, true as unknown as EventListenerOptions)
})

function closePopup() {
  // Sync search state when popup closes (for deal page reactivity)
  const totalPersons = searchGroup.value.adults + searchGroup.value.children.length
  setSearchGroup(totalPersons, searchGroup.value.rooms)
  triggerSearchUpdate()
  activePopup.value = null
}

function clearDestination() {
  selectedDestinations.value = []
  selectedThemes.value = []
  selectedCities.value = []
  selectionOrder.value = []
  closePopup()
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
  searchGroup.value = { adults: 2, children: [], rooms: 1, dog: false }
  closePopup()
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

// Track insertion order across all types so chips render chronologically (new on the right)
type SelectionEntry = { type: 'destination' | 'theme' | 'city'; key: string }
const selectionOrder = ref<SelectionEntry[]>([])

function toggleDestination(id: string) {
  const idx = selectedDestinations.value.indexOf(id)
  if (idx === -1) {
    selectedDestinations.value.push(id)
    selectionOrder.value.push({ type: 'destination', key: id })
  } else {
    selectedDestinations.value.splice(idx, 1)
    selectionOrder.value = selectionOrder.value.filter(e => !(e.type === 'destination' && e.key === id))
  }
}

function toggleTheme(id: string) {
  const idx = selectedThemes.value.indexOf(id)
  if (idx === -1) {
    selectedThemes.value.push(id)
    selectionOrder.value.push({ type: 'theme', key: id })
  } else {
    selectedThemes.value.splice(idx, 1)
    selectionOrder.value = selectionOrder.value.filter(e => !(e.type === 'theme' && e.key === id))
  }
}

function handleSelectCity(city: { name: string; province: string }) {
  // Avoid duplicates
  if (!selectedCities.value.find(c => c.name === city.name)) {
    selectedCities.value.push(city)
    selectionOrder.value.push({ type: 'city', key: city.name })
  }
}

function handleRemoveCity(cityName: string) {
  selectedCities.value = selectedCities.value.filter(c => c.name !== cityName)
  selectionOrder.value = selectionOrder.value.filter(e => !(e.type === 'city' && e.key === cityName))
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

  // Show as many names as fit within MAX_CHARS, then "+ n" for the rest
  const MAX_CHARS = 32
  let shown = 1
  let result = names[0]
  for (let i = 1; i < names.length; i++) {
    const next = `${result}, ${names[i]}`
    if (next.length > MAX_CHARS) break
    result = next
    shown++
  }
  const hidden = names.length - shown
  if (hidden > 0) result += ` + ${hidden}`
  return result
})

// --- WHEN ---
const calMonth = ref({ year: new Date().getFullYear(), month: new Date().getMonth() })
const selectedDate = ref<string | null>(null)
const flexibility = ref(0)
const selectedDurations = ref<string[]>([])
const flexState = ref<{ durations: string[]; months: string[] }>({ durations: [], months: [] })

// Sync arrival date + nights to shared composable so /search filter can read them
const { setArrivalDate, setSearchGroup, setLoading, setSelectedNights, selectedNights: globalNights, triggerSearchUpdate } = useSearchState()

// Pre-fill local picker from shared state (e.g. on /search page reload)
if (globalNights.value.length && selectedDurations.value.length === 0) {
  selectedDurations.value = [...globalNights.value]
}

watch(selectedDate, (val) => {
  setArrivalDate(val)
  // Selecting an arrival date clears flex months
  if (val && flexState.value.months.length > 0) {
    flexState.value = { ...flexState.value, months: [] }
  }
})
// Calendar duration clears flex duration. Nights → shared state happens on Search button.
watch(selectedDurations, (val) => {
  if (val.length > 0 && flexState.value.durations.length > 0) {
    flexState.value = { ...flexState.value, durations: [] }
  }
}, { deep: true })

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

function handleFlexState(state: { durations: string[]; months: string[] }) {
  flexState.value = state
  // Selecting months replaces the arrival date
  if (state.months.length > 0 && selectedDate.value) {
    selectedDate.value = null
  }
  // Flex durations replace calendar durations
  if (state.durations.length > 0) {
    selectedDurations.value = []
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
  const calDurs = selectedDurations.value
  const flexDurs = flexState.value.durations
  if (calDurs.length > 0) {
    const labels = calDurs.map(id => durationOptions.value.find(o => o.id === id)?.label).filter(Boolean) as string[]
    durationPart = labels.join(' of ')
  } else if (flexDurs.length > 0) {
    const typeLabels: Record<string, string> = {
      'weekend-fri-sun': t('header.flex.weekendFriSun'),
      'weekend-sat-sun': t('header.flex.weekendSatSun'),
      'long-weekend': t('header.flex.longWeekend'),
      'midweek': t('header.flex.midweek'),
    }
    const labels = flexDurs.map(id => {
      const nightsOpt = durationOptions.value.find(o => o.id === id)
      return nightsOpt ? nightsOpt.label : (typeLabels[id] || '')
    }).filter(Boolean)
    durationPart = labels.join(' of ')
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
  parts.push(`${searchGroup.value.adults} ${searchGroup.value.adults === 1 ? t('common.adultSingular') : t('common.adultPlural')}`)
  if (searchGroup.value.children.length > 0) {
    parts.push(`${searchGroup.value.children.length} ${searchGroup.value.children.length === 1 ? t('common.childSingular') : t('common.childPlural')}`)
  }
  parts.push(`${searchGroup.value.rooms} ${searchGroup.value.rooms === 1 ? t('common.roomSingular') : t('common.roomPlural')}`)
  if (searchGroup.value.dog) parts.push('\u{1F415}')
  return parts.join(', ')
})

function commitSearch() {
  const totalPersons = searchGroup.value.adults + searchGroup.value.children.length
  setSearchGroup(totalPersons, searchGroup.value.rooms)
  const numericNights = selectedDurations.value.filter(v => ['1', '2', '3', '4', '5+'].includes(v))
  setSelectedNights(numericNights)
  setLoading(true)
  navigateTo('/search')
}

function handleSearch() {
  closePopup()
  commitSearch()
}

function handleMobileSearch() {
  mobileSearchOpen.value = false
  commitSearch()
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

/* Overlay variant: transparent header on top of a hero background.
   Container provides its own image; we just lift the bar off it. */
.site-header--overlay {
  background: transparent;
  padding-bottom: 0;
  margin-bottom: 0;
}

.site-header--overlay .site-header__nav {
  background: transparent;
}

/* Search dock anchored at the bottom of the hero section in overlay mode */
.site-header--overlay .site-header__search-dock {
  bottom: 0;
  transform: none;
  position: relative;
  padding-bottom: 32px;
}

.site-header--overlay .search-bar {
  max-width: none;
  height: auto;
  margin: 0;
  border-radius: 6px;
  border: none;
  padding: 8px;
  box-shadow: 0 1px 0 0 rgba(0, 0, 0, 0.04), 0 24px 60px -16px rgba(0, 0, 0, 0.45);
}

.site-header--overlay .search-bar__field {
  flex: 1 0 0;
  min-width: 0;
  margin: 0;
  padding: 10px 22px;
  border-radius: 4px;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.site-header--overlay .search-bar__divider {
  background: #e6e3dc;
  width: 1px;
  align-self: stretch;
  margin: 0;
}

.site-header--overlay .search-bar__field-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #1a1411;
  flex-shrink: 0;
}

.search-bar__field-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.site-header--overlay .search-bar__label {
  font-size: 9.5px;
  letter-spacing: 0.95px;
  text-transform: uppercase;
  color: #5a5a5a;
}

.site-header--overlay .search-bar__value {
  font-size: 14px;
  font-weight: 500;
  color: #0a0a0a;
}

.site-header--overlay .search-bar__btn--find-deals {
  background: #e97132;
  color: #fff;
  height: auto;
  width: auto;
  padding: 22px 38px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.07px;
  margin-left: 16px;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--transition-fast);
}

.site-header--overlay .search-bar__btn--find-deals:hover {
  background: #d4621f;
}

/* Hotel+more accent (active vertical) */
.verticals__item-accent {
  font-family: var(--font-heading);
  font-weight: 700;
  color: #e97132;
}

/* "more" word styled one pt bigger than the rest of the nav item */
.verticals__item-more {
  font-size: 15px;
}

/* Hamburger dropdown (desktop / iPad) — same dark style as contact dropdown */
.hamburger-wrap { position: relative; display: inline-flex; }

.hamburger-dropdown__menu {
  min-width: 240px;
  background: #1A1A1A;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  padding: 12px 8px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
}

.hamburger-dropdown__heading {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.55);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 4px 8px 8px;
}

.hamburger-dropdown__link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.92);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: background 150ms, color 150ms;
}

.hamburger-dropdown__link:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #FB862D;
}

.hamburger-dropdown__link svg {
  color: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
  transition: color 150ms;
}

.hamburger-dropdown__link:hover svg {
  color: #FB862D;
}

.hamburger-dropdown__lang {
  display: flex;
  gap: 4px;
  padding: 4px;
}

.hamburger-dropdown__lang-btn {
  flex: 1;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background 150ms, color 150ms, border-color 150ms;
}

.hamburger-dropdown__lang-btn--active {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.3);
}

.hamburger-dropdown__lang-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}

/* Nav bar */
.site-header__nav {
  background: #111111;
  height: 88px;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 10;
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

/* Horizontal logo (overlay variant): shorter height, white art */
.site-header__logo-img--horizontal {
  height: 23px;
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

/* VIP button — ghost / outline */
.vip-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.85);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.4px;
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.vip-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
}

.vip-btn svg {
  color: rgba(255, 255, 255, 0.85);
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

/* Contact dropdown */
.contact-dropdown {
  position: relative;
  z-index: 20;
}

.contact-trigger {
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

.contact-trigger:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
}

.contact-trigger svg {
  opacity: 0.75;
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
  border-radius: 16px;
  height: 72px;
  padding: 0 6px 0 0;
  position: relative;
  border: 2px solid var(--color-border);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.22), 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-bar__field {
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
  border-radius: 12px;
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
/* Full-screen backdrop captures clicks-outside; popup-anchor is positioned
   in fixed coordinates by JS so it sits next to the clicked search field. */
.popup-backdrop {
  position: fixed;
  inset: 0;
  z-index: 600;
  background: transparent;
}

.popup-anchor {
  /* position/top/left/bottom set inline via :style */
  z-index: 601;
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
  max-width: 560px;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.popup--when {
  padding: 0;
  max-width: 660px;
  width: 100%;
  max-height: none;
  overflow: visible;
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

/* Popup footer: clear link + done button */
.popup__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-md);
  margin-top: var(--space-md);
}

.popup__footer--padded {
  padding: var(--space-sm) var(--space-lg) var(--space-lg);
}

.popup__clear-link {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-muted);
  text-decoration: underline;
  cursor: pointer;
  font-family: inherit;
  transition: color var(--transition-fast);
}

.popup__clear-link:hover {
  color: var(--color-text-primary);
}

.popup__done-btn {
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

.popup__done-btn:hover {
  background: var(--color-primary-hover);
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

<style>
/* Teleported contact dropdown — not scoped */
.contact-dropdown__menu {
  min-width: 300px;
  background: #1A1A1A;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  padding: 16px;
  z-index: 9999;
}

.contact-dropdown__heading {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
}

.contact-dropdown__item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  transition: color 150ms;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.contact-dropdown__item:hover {
  color: #FB862D;
}

.contact-dropdown__item svg {
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
  margin-top: 2px;
}

.contact-dropdown__item:hover svg {
  color: #FB862D;
}

.contact-dropdown__item--urgent {
  border-bottom: none;
}

.contact-dropdown__item--urgent svg {
  color: #E6A033;
}

.contact-dropdown__item-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.contact-dropdown__item-label {
  font-weight: 600;
}

.contact-dropdown__item-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.contact-dropdown__divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 6px 0;
}

.contact-dropdown__link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 0;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  transition: color 150ms;
}

.contact-dropdown__link svg {
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

.contact-dropdown__link:hover {
  color: white;
}

.contact-dropdown__link:hover svg {
  color: rgba(255, 255, 255, 0.7);
}

/* ==================== */
/* MOBILE SEARCH TRIGGER */
/* ==================== */
.site-header__mobile-search {
  display: none;
}

.mobile-search-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 44px;
  padding: 0 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.mobile-search-trigger__label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* ==================== */
/* MOBILE MENU DRAWER   */
/* ==================== */
.mobile-menu {
  padding: var(--space-md) var(--space-lg);
}

.mobile-menu__section {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: var(--space-sm) 0;
}

.mobile-menu__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 4px;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  text-decoration: none;
  background: none;
  border: none;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background 150ms ease;
}
.mobile-menu__item:hover {
  background: var(--color-background-secondary);
}

.mobile-menu__divider {
  height: 1px;
  background: var(--color-border-light);
  margin: var(--space-sm) 0;
}

.mobile-menu__label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-muted);
  letter-spacing: 0.5px;
  padding: 8px 4px 4px;
}

/* ==================== */
/* MOBILE (< 768px)     */
/* ==================== */
@media (max-width: 768px) {
  /* Site-header: remove padding/margin reserved for floating dock */
  .site-header {
    padding-bottom: 0;
    margin-bottom: 0;
  }
  /* Compact nav: smaller height, smaller logo */
  .site-header__nav {
    height: 56px;
  }
  .site-header__logo-img {
    height: 36px;
  }
  /* Hide verticals + most right actions except hamburger */
  .verticals,
  .contact-dropdown,
  .lang-switcher,
  .vip-btn {
    display: none;
  }
  /* Hide desktop search dock */
  .site-header__search-dock {
    display: none;
  }
  /* Show mobile search trigger */
  .site-header__mobile-search {
    display: block;
    padding: 12px 16px;
    background: #111111;
  }
  /* Hamburger visible */
  .hamburger-btn {
    display: flex;
  }
  /* Container: less horizontal padding */
  .site-header__nav-inner.container {
    padding-left: 16px;
    padding-right: 16px;
  }
  /* Nav actions: tighter gap */
  .site-header__nav-actions {
    gap: 0;
  }
}
</style>
