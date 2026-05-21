<template>
  <header
    class="site-header"
    :class="[
      { 'site-header--overlay': variant === 'overlay' },
      `site-header--nav-v${effectiveNavVariant}`,
      // v3 and v4 share v2's nav layout (with one small tweak each).
      // Adding the v2 class alongside their own lets every v2 rule
      // apply automatically; small `.site-header--nav-v3 …` /
      // `.site-header--nav-v4 …` override blocks adjust only what
      // each variant changes.
      ['3', '4', '5'].includes(effectiveNavVariant) ? 'site-header--nav-v2' : null,
    ]"
  >
    <!-- Main nav bar — laid out across TWO rows via CSS grid:
           row 1: logo (left)              | _                | actions (right)
           row 2: pay-off (under logo)     | verticals (mid)  | phone (right)
         The HTML order is logo → tagline → verticals → phone → actions;
         `.site-header__nav-inner` (a 3-col / 2-row grid) places each. -->
    <div class="site-header__nav">
      <div class="site-header__nav-inner container">
        <!-- Logo (grid row 1, col 1) -->
        <NuxtLink :to="homeHref" class="site-header__logo">
          <img
            src="/images/logo-vialuxury-horizontal.svg"
            alt="ViaLuxury"
            class="site-header__logo-img site-header__logo-img--horizontal"
          />
        </NuxtLink>

        <!-- Pay-off block (grid row 2, col 1) — payoff on top, handwritten
             underline-stroke on the bottom. The wrapper stretches to the
             full row height so the stroke bottom-aligns with the
             verticals button row's bottom. -->
        <div v-if="!isMobile" class="site-header__tagline-block">
          <span class="site-header__tagline">Personally Curated Experiences</span>
          <svg
            class="site-header__tagline-stroke"
            viewBox="0 0 320 12"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M2 7 C 50 2, 110 11, 170 5 S 280 9, 318 4"
              fill="none"
              stroke="currentColor"
              stroke-width="0.5"
              stroke-linecap="round"
            />
          </svg>
        </div>

        <!-- Verticals switcher (grid row 2, col 2 — desktop only) -->
        <nav v-if="!isMobile" class="verticals" aria-label="Verticals">
          <template v-for="v in verticals" :key="v.id">
            <span
              v-if="v.id === activeVertical"
              class="verticals__item verticals__item--active verticals__item--inactive-link"
              aria-current="page"
            >
              <template v-if="v.id === 'hotels'">
                <span>{{ t('header.hotels') }} <span class="verticals__item-accent">+ <span class="verticals__item-more">more</span></span></span>
              </template>
              <template v-else>{{ v.label }}</template>
            </span>
            <a
              v-else-if="v.external"
              :href="v.href"
              target="_blank"
              rel="noopener"
              class="verticals__item"
            >{{ v.label }}</a>
            <NuxtLink
              v-else
              :to="v.href"
              class="verticals__item"
            >
              <template v-if="v.id === 'hotels'">
                <span>{{ t('header.hotels') }} <span class="verticals__item-accent">+ <span class="verticals__item-more">more</span></span></span>
              </template>
              <template v-else>{{ v.label }}</template>
            </NuxtLink>
          </template>
        </nav>

        <!-- Phone (grid row 2, col 3 — desktop only) -->
        <a v-if="!isMobile" href="tel:+31207052222" class="site-header__phone">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.58 1 1 0 01-.24 1.01l-2.21 2.21z"/>
          </svg>
          <span class="site-header__phone-label">Hulp nodig?</span>
          <span class="site-header__phone-number">+31 20 705 2222</span>
        </a>

        <!-- Right actions (grid row 1, col 3 — desktop only positioned via grid) -->
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
          <NuxtLink v-if="!isMobile" to="/first-release/leden" class="vip-btn">
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
                    <template v-if="v.id === 'hotels'"><span>{{ t('header.hotels') }} <span class="verticals__item-accent">+ <span class="verticals__item-more">more</span></span></span></template>
                    <template v-else>{{ v.label }}</template>
                  </NuxtLink>

                  <!-- Vakantieparken moved out of the top-bar verticals; it
                       still gets a dedicated entry in the hamburger menu. -->
                  <NuxtLink to="/first-release/vakantieparken" class="hamburger-dropdown__link" @click="hamburgerDropdownOpen = false">
                    {{ t('header.holidayParks') }}
                  </NuxtLink>

                  <div class="contact-dropdown__divider"></div>

                  <NuxtLink to="/first-release/leden" class="hamburger-dropdown__link" @click="hamburgerDropdownOpen = false">
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

    <!-- Search bar dock: overlaps nav + page (desktop only). Hidden by
         homepage variant 2 which renders its own vertical search card. -->
    <div v-if="!props.hideSearchDock" class="site-header__search-dock">
      <div class="container site-header__search-container">
        <div class="search-bar">
        <!-- 1. Waarheen -->
        <button
          ref="destField"
          class="search-bar__field search-bar__field--destination"
          :class="{ 'search-bar__field--active': activePopup === 'destination' }"
          @click="togglePopup('destination')"
        >
          <span class="search-bar__field-body">
            <span class="search-bar__field-row">
              <span class="search-bar__field-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </span>
              <span class="search-bar__label">{{ t('header.destination') }}</span>
            </span>
            <span class="search-bar__value" :class="{ 'search-bar__value--placeholder': destinationIsPlaceholder }">{{ destinationLabel }}</span>
          </span>
          <span
            v-if="!destinationIsPlaceholder"
            class="search-bar__clear"
            role="button"
            tabindex="0"
            :aria-label="t('header.clear')"
            @click.stop="clearDestination"
            @keydown.enter.stop.prevent="clearDestination"
            @keydown.space.stop.prevent="clearDestination"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
          </span>
        </button>

        <div class="search-bar__divider"></div>

        <!-- 2. Wanneer + Hoelang (combined) -->
        <button
          ref="whenField"
          class="search-bar__field search-bar__field--when"
          :class="{ 'search-bar__field--active': activePopup === 'when' }"
          @click="togglePopup('when')"
        >
          <span class="search-bar__field-body">
            <span class="search-bar__field-row">
              <span class="search-bar__field-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              </span>
              <span class="search-bar__label">{{ t('header.whenAndHowLong') }}</span>
            </span>
            <span class="search-bar__value" :class="{ 'search-bar__value--placeholder': whenCombinedIsPlaceholder }">{{ whenCombinedLabel }}</span>
          </span>
          <span
            v-if="!whenCombinedIsPlaceholder"
            class="search-bar__clear"
            role="button"
            tabindex="0"
            :aria-label="t('header.clear')"
            @click.stop="clearWhenAndDuration"
            @keydown.enter.stop.prevent="clearWhenAndDuration"
            @keydown.space.stop.prevent="clearWhenAndDuration"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
          </span>
        </button>

        <div class="search-bar__divider"></div>

        <!-- 4. Wie gaat er mee -->
        <button
          ref="whoField"
          class="search-bar__field search-bar__field--who"
          :class="{ 'search-bar__field--active': activePopup === 'who' }"
          @click="togglePopup('who')"
        >
          <span class="search-bar__field-body">
            <span class="search-bar__field-row">
              <span class="search-bar__field-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <span class="search-bar__label">{{ t('header.whosComing') }}</span>
            </span>
            <!-- "who" always has a value (default 2 volwassenen, 1 kamer), so
                 it never renders in placeholder style. -->
            <span class="search-bar__value">{{ whoLabel }}</span>
          </span>
          <span
            v-if="!whoIsPlaceholder"
            class="search-bar__clear"
            role="button"
            tabindex="0"
            :aria-label="t('header.clear')"
            @click.stop="clearWho"
            @keydown.enter.stop.prevent="clearWho"
            @keydown.space.stop.prevent="clearWho"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
          </span>
        </button>

          <!-- "Vind deals" find-deals button — used on home AND internal pages.
               The arrow only renders on home, where the click navigates AWAY
               to /search. On internal pages you stay on the current page
               (results re-render in place), so the arrow is hidden. -->
          <button class="search-bar__btn search-bar__btn--find-deals" :class="{ 'search-bar__btn--pulsing': pulseActive }" @click="handleSearch">
            <span>Vind deals</span>
            <svg v-if="variant === 'overlay'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
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
          <FirstReleaseDestinationPopup
            :destinations="destinations"
            :themes="themes"
            :selected-destinations="localDestDestinations"
            :selected-themes="localDestThemes"
            :selected-cities="localDestCities"
            :selection-order="localDestSelectionOrder"
            single-select
            @toggle-destination="onSingleDestination"
            @toggle-theme="onSingleTheme"
            @select-hotel="onSingleHotel"
            @select-city="onSingleCity"
            @remove-city="handleRemoveCityLocal"
            @save="closePopup()"
            @clear="clearDestination"
          />
        </div>

        <!-- WHEN + HOELANG (combined popup — calendar + nights checkboxes,
             no tabs / flex chips / weekend pills). Inline width-style
             guarantees the popup hits 1200 px even if scoped CSS is
             swallowed by Teleport / HMR caching. -->
        <div
          v-if="activePopup === 'when'"
          class="popup popup--when"
          style="width: 100%;"
        >
          <FirstReleaseDateAndDurationPopup
            v-model:cal-month="calMonth"
            v-model:selected-date="selectedDate"
            :nights="localNights"
            :any-duration="localAnyDuration"
            :flexible="localFlexible"
            @toggle-night="toggleLocalNight"
            @set-any-duration="setAnyDuration"
            @update:flexible="setLocalFlexible"
            @save="closePopup()"
            @clear="clearWhenAndDuration"
          />
        </div>

        <!-- WHO POPUP — MVP single-select list. Picks one preset (N personen
             + N kamers), closes the popup, fills the field. The full
             adults/children/rooms/dog stepper UI below is kept (gated on
             `false`) so it can be revived when the MVP is done. -->
        <div v-if="activePopup === 'who'" class="popup popup--who popup--who-mvp">
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

        <!-- LEGACY WHO POPUP — adults/children/rooms/dog steppers. Hidden
             behind v-if="false" while the MVP version above is live. -->
        <div v-if="false" class="popup popup--who">
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
              <button class="stepper__btn" :disabled="searchGroup.rooms >= (searchGroup.adults + searchGroup.children.length)" @click="searchGroup.rooms++">+</button>
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
    <FirstReleaseMobileFullscreen :open="mobileMenuOpen" :title="'Menu'" @close="mobileMenuOpen = false">
      <nav class="mobile-menu">
        <!-- Verticals -->
        <div class="mobile-menu__section">
          <NuxtLink v-for="v in verticals" :key="v.id" :to="v.href" class="mobile-menu__item" @click="mobileMenuOpen = false">
            {{ v.label }}
          </NuxtLink>
          <NuxtLink to="/first-release/vakantieparken" class="mobile-menu__item" @click="mobileMenuOpen = false">
            {{ t('header.holidayParks') }}
          </NuxtLink>
        </div>
        <div class="mobile-menu__divider"></div>
        <div class="mobile-menu__section">
          <NuxtLink to="/first-release/leden" class="mobile-menu__item" @click="mobileMenuOpen = false">
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
    </FirstReleaseMobileFullscreen>

    <!-- Mobile full-screen search modal -->
    <FirstReleaseMobileSearchModal
      :open="mobileSearchOpen"
      :destinations="destinations"
      :themes="themes"
      :selected-destinations="localDestDestinations"
      :selected-themes="localDestThemes"
      :selected-cities="localDestCities"
      :selection-order="localDestSelectionOrder"
      :cal-month="calMonth"
      :selected-date="selectedDate"
      :flexibility="flexibility"
      :selected-durations="selectedDurations"
      :search-group="searchGroup"
      :destination-label="destinationLabel"
      :when-label="whenLabel"
      :who-label="whoLabel"
      @close="mobileSearchOpen = false"
      @toggle-destination="toggleDestinationLocal"
      @toggle-theme="toggleThemeLocal"
      @select-hotel="handleSelectHotelInPopupLocal"
      @select-city="handleSelectCityLocal"
      @remove-city="handleRemoveCityLocal"
      @clear-destinations="clearDestination"
      @update:cal-month="calMonth = $event"
      @update:selected-date="selectedDate = $event"
      @update:flexibility="flexibility = $event"
      @update:selected-durations="selectedDurations = $event"
      @update:flex-state="handleFlexState"
      @update:search-group="searchGroup = $event"
      @search="handleMobileSearch"
    />

    <!-- Right-edge floating variant switcher — reads `frNavVariant`
         from the composable so it can be mounted globally without any
         per-page prop wiring. Renders on every FR page that uses the
         SiteHeader (home + all internal pages). -->
    <FirstReleaseHomeVariantSwitcher />

    <!-- Bottom-right floating hero-photo switcher. Only on the home
         page (overlay variant) since internal pages don't render a
         photo hero. -->
    <FirstReleaseHeroPhotoSwitcher v-if="variant === 'overlay'" />
  </header>
</template>

<script setup lang="ts">
import { useFirstReleaseLocaleStore } from '~/stores-first-release/locale'
import { searchHotels } from '~/data/mock/search-hotels'
import { tagsByCategory } from '~/utils-first-release/filterTags'
import { minRoomsFor, maxRoomsFor } from '~/utils-first-release/priceFormula'
import { useFirstReleaseHomeVariant } from '~/composables-first-release/useFirstReleaseHomeVariant'

const props = withDefaults(defineProps<{
  /** 'solid' = default dark bar; 'overlay' = transparent over a background image (e.g. home hero) */
  variant?: 'solid' | 'overlay'
  /** Hide the inline horizontal search bar — used by homepage variant 2
   *  which renders its own vertical search card instead. */
  hideSearchDock?: boolean
  /** Which of the three FR nav-bar layouts to render. Defaults to the
   *  variant that's currently stored in the composable so internal
   *  pages don't have to pass anything. */
  navVariant?: '1' | '2' | '3'
}>(), { variant: 'solid', hideSearchDock: false })

const { t } = useFirstReleaseI18n()
const localeStore = useFirstReleaseLocaleStore()
const { homeHref, frNavVariant } = useFirstReleaseHomeVariant()

/** Effective nav-bar layout — prop wins, otherwise read from the
 *  composable (which is restored from URL/localStorage on mount). */
const effectiveNavVariant = computed(() => props.navVariant ?? frNavVariant.value)

// --- Verticals (computed for reactivity on locale change) ---
const verticals = computed(() => [
  { id: 'hotels', label: t('header.hotels'), href: homeHref.value, external: false },
  { id: 'restaurants', label: t('header.restaurants'), href: 'https://restaurants.vialuxury.com/', external: true },
  { id: 'cadeaubon', label: t('header.giftCard'), href: '/cadeaubon', external: false },
])
// Route-aware: 'vakantieparken' on /vakantieparken*, otherwise 'hotels' (home/search/deal/hotel)
const _route = useRoute()
const activeVertical = computed(() => {
  if (_route.path.startsWith('/vakantieparken')) return 'vakantieparken'
  return 'hotels'
})

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
useFirstReleaseClickOutside(langSwitcherRef, () => { langDropdownOpen.value = false })
useFirstReleaseClickOutside(contactDropdownRef, () => { contactDropdownOpen.value = false })
useFirstReleaseClickOutside(hamburgerWrapRef, () => { hamburgerDropdownOpen.value = false })

const activePopup = ref<'destination' | 'when' | 'who' | null>(null)

// Refs to each search-bar field button → used to position popups
const destField = ref<HTMLElement | null>(null)
const whenField = ref<HTMLElement | null>(null)
const whoField = ref<HTMLElement | null>(null)

// External anchor (variant-2 hero): when set, popup position is computed
// relative to this element rather than the internal search-dock buttons.
// Reset on closePopup.
const externalAnchor = ref<HTMLElement | null>(null)

// Approximate popup heights (used to decide auto-scroll on open)
const POPUP_HEIGHTS: Record<'destination' | 'when' | 'who', number> = {
  destination: 540,
  // Wanneer-popup with a ~400 px square calendar — header (~30) + calendar
  // (~400) + footer / Verder-button (~60) + padding (~40) = ~580 px.
  when: 580,
  // MVP list: 8 rows × ~44 px + 8 px top/bottom = ~368.
  who: 380,
}

const popupStyle = ref<Record<string, string>>({})

function fieldRect() {
  if (externalAnchor.value) return externalAnchor.value.getBoundingClientRect()
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
  // Force a known popup width per type. We pin the width directly on the
  // popup-anchor (not just the inner .popup) because some browsers fail
  // to honour `width: 1200px` on the inner element when its fixed-position
  // grandparent has no width set — the anchor collapses to ~0 and clips
  // the inner via overflow. Setting the anchor's width guarantees the
  // popup gets its full canvas.
  const WIDTHS: Record<string, number> = { destination: 560, when: 581, who: 420 }
  const popupWidth = Math.min(WIDTHS[which] ?? 600, window.innerWidth - 24)
  const desired = rect.left
  const maxLeft = window.innerWidth - popupWidth - 12
  const left = Math.max(8, Math.min(desired, maxLeft))
  popupStyle.value = {
    position: 'fixed',
    top: (rect.bottom + margin) + 'px',
    left: left + 'px',
    width: popupWidth + 'px',
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
  // Add an extra 24 px bottom breathing room so the popup doesn't kiss
  // the viewport edge after the scroll lands.
  const bottomBuffer = 24
  const popupHeight = POPUP_HEIGHTS[which]
  const overflow = (rect.bottom + margin + popupHeight + bottomBuffer) - window.innerHeight
  if (overflow > 0) {
    window.scrollBy({ top: overflow, behavior: 'smooth' })
  }
}

// Mobile: single full-screen search modal + hamburger menu
const isMobile = useFirstReleaseIsMobile()
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
      // Auto-scroll when:
      // - overlay variant (variant 1 / 2 home pages — popup opens
      //   anchored to the nav-bar dock).
      // - externalAnchor set (variant 2/3/4 home pages call
      //   openPopupAt with their own search-bar field — popup opens
      //   wherever the user scrolled to). Without this the popup
      //   could be partially below the fold on /home-v3 + /home-v4
      //   where the navbar is solid but the search bar lives below
      //   the hero photo.
      // The solid navbar dock (e.g. on /search) keeps its existing
      // no-scroll behaviour because the dock is fixed in the navbar
      // and the popup already fits below it.
      if (props.variant === 'overlay' || externalAnchor.value) {
        scrollToFitPopup()
      }
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
  // Persons/rooms commit on close (Klaar / outside-click / Esc) — they
  // affect prices site-wide via the per-person formula and the user expects
  // that to take effect right away. Search-result filters stay gated by the
  // search-button commit (committedArrivalDate / commitSearch).
  if (activePopup.value === 'who') {
    setSearchGroup(searchGroup.value.adults + searchGroup.value.children.length, searchGroup.value.rooms)
  }
  activePopup.value = null
  externalAnchor.value = null
  schedulePulse()
}

/** Public API: open one of the three popups anchored to an external element
 *  (used by the variant-2 hero on /home-v2 whose search card lives outside
 *  the SiteHeader subtree). Passing the same field twice toggles it closed. */
function openPopupAt(which: 'destination' | 'when' | 'who', el: HTMLElement | null) {
  if (activePopup.value === which) { closePopup(); return }
  externalAnchor.value = el
  activePopup.value = which
}

defineExpose({ openPopupAt })

function clearDestination() {
  // Rule #3: wipe the LOCAL drafts only. Shared state stays put until
  // the user presses Find Deals.
  resetLocalDestinationState()
  closePopup()
}

/** Single-select handlers (variant 1): clear existing draft picks first,
 *  apply the new one to the local draft, then close the popup. Shared
 *  state is untouched until `commitSearch()` runs. */
function onSingleDestination(id: string) {
  const isSame = localDestDestinations.value.length === 1 && localDestDestinations.value[0] === id
  resetLocalDestinationState()
  if (!isSame) {
    localDestDestinations.value = [id]
    localDestSelectionOrder.value = [{ type: 'destination', key: id }]
  }
  closePopup()
}
function onSingleTheme(id: string) {
  const isSame = localDestThemes.value.length === 1 && localDestThemes.value[0] === id
  resetLocalDestinationState()
  if (!isSame) {
    localDestThemes.value = [id]
    localDestSelectionOrder.value = [{ type: 'theme', key: id }]
  }
  closePopup()
}
function onSingleCity(city: { name: string; province: string }) {
  resetLocalDestinationState()
  localDestCities.value = [city]
  localDestSelectionOrder.value = [{ type: 'city', key: city.name }]
  closePopup()
}
function onSingleHotel(slug: string) {
  resetLocalDestinationState()
  const h = searchHotels.find(x => x.slug === slug)
  const name = h?.name || slug
  localDestHotels.value = [{ slug, name }]
  localDestSelectionOrder.value = [{ type: 'hotel', key: slug }]
  notePicker()
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

/** Combined wipe used by the merged Wanneer + Hoelang popup. Resets both
 *  the date side and the duration side. Stays open afterwards — the user
 *  can keep picking; "Verder" is what dismisses the popup. */
function clearWhenAndDuration() {
  selectedDate.value = null
  flexibility.value = 0
  selectedDurations.value = []
  flexState.value = { durations: [], months: [] }
  localNights.value = []
  localAnyDuration.value = false
  localFlexible.value = false
  setSelectedNights([])
  if (localFlexType.value) {
    localFlexType.value = null
    setFlexType(null)
  }
  calMonth.value = { year: new Date().getFullYear(), month: new Date().getMonth() }
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

// Themes shown in the destination popup come from the unified FILTER_TAGS
// config (category 'thema'). Only those 7 IDs appear here.
const themes = computed(() =>
  tagsByCategory('thema').map(t => ({ id: t.id, name: t.label, emoji: t.emoji })),
)

// Destination state lives in useFirstReleaseSearchState so /search and /kaart can read
// it as a filter. Locally we expose the shape the template expects.
const {
  selectedDestinations,
  selectedFilterTags,
  selectedCities,
  selectedHotels: sharedSelectedHotels,
  selectionOrder,
  toggleDestination,
  toggleFilterTag,
  addCity: handleSelectCity,
  removeCity: handleRemoveCity,
  addHotel,
  clearDestinations,
  clearFilterTags,
} = useFirstReleaseSearchState()
const selectedHotels = sharedSelectedHotels

/** The popup expects an array of theme IDs that are currently active.
 *  We filter the global filter-tag list down to the Thema category. */
const themeIds = ['aan-zee', 'natuur', 'romantisch', 'culinair', 'fiets', 'steden', 'kasteel']
const selectedThemes = computed(() =>
  selectedFilterTags.value.filter(id => themeIds.includes(id)),
)

/* ─── Local destination drafts (rule #3) ───
 * The destination popup writes to these local refs while the user is
 * editing the search bar. Only `commitSearch()` (Find Deals button)
 * pushes them to the shared composable — same draft pattern the When/
 * Who popups already use. Seeded from shared state at setup so
 * URL-param picks and the home theme-button reset both surface in the
 * search bar fields. */
type LocalSelectionEntry = { type: 'destination' | 'theme' | 'city' | 'hotel'; key: string }
const localDestDestinations = ref<string[]>([...selectedDestinations.value])
const localDestThemes = ref<string[]>([
  ...selectedFilterTags.value.filter(id => themeIds.includes(id)),
])
const localDestCities = ref<{ name: string; province: string }[]>([...selectedCities.value])
const localDestHotels = ref<{ slug: string; name: string }[]>(
  sharedSelectedHotels.value.map(h => ({ slug: h.slug, name: h.name })),
)
const localDestSelectionOrder = ref<LocalSelectionEntry[]>([...selectionOrder.value])

function resetLocalDestinationState() {
  localDestDestinations.value = []
  localDestThemes.value = []
  localDestCities.value = []
  localDestHotels.value = []
  localDestSelectionOrder.value = []
}

/** Re-seed locals from shared — call after `commitSearch()` so subsequent
 *  edits start from the just-committed snapshot. */
function syncLocalDestFromShared() {
  localDestDestinations.value = [...selectedDestinations.value]
  localDestThemes.value = [...selectedFilterTags.value.filter(id => themeIds.includes(id))]
  localDestCities.value = [...selectedCities.value]
  localDestHotels.value = sharedSelectedHotels.value.map(h => ({ slug: h.slug, name: h.name }))
  localDestSelectionOrder.value = [...selectionOrder.value]
}

/** Multi-select toggles used by the mobile search modal. They mutate
 *  ONLY the local drafts; nothing reaches shared state until commit. */
function toggleDestinationLocal(id: string) {
  const i = localDestDestinations.value.indexOf(id)
  if (i === -1) {
    localDestDestinations.value.push(id)
    localDestSelectionOrder.value.push({ type: 'destination', key: id })
  } else {
    localDestDestinations.value.splice(i, 1)
    localDestSelectionOrder.value = localDestSelectionOrder.value.filter(
      e => !(e.type === 'destination' && e.key === id),
    )
  }
}
function toggleThemeLocal(id: string) {
  const i = localDestThemes.value.indexOf(id)
  if (i === -1) {
    localDestThemes.value.push(id)
    localDestSelectionOrder.value.push({ type: 'theme', key: id })
  } else {
    localDestThemes.value.splice(i, 1)
    localDestSelectionOrder.value = localDestSelectionOrder.value.filter(
      e => !(e.type === 'theme' && e.key === id),
    )
  }
}
function handleSelectCityLocal(city: { name: string; province: string }) {
  if (localDestCities.value.some(c => c.name === city.name)) return
  localDestCities.value.push(city)
  localDestSelectionOrder.value.push({ type: 'city', key: city.name })
}
function handleRemoveCityLocal(name: string) {
  localDestCities.value = localDestCities.value.filter(c => c.name !== name)
  localDestSelectionOrder.value = localDestSelectionOrder.value.filter(
    e => !(e.type === 'city' && e.key === name),
  )
}
function handleSelectHotelInPopupLocal(slug: string) {
  if (localDestHotels.value.some(h => h.slug === slug)) return
  const h = searchHotels.find(x => x.slug === slug)
  const name = h?.name || slug
  localDestHotels.value.push({ slug, name })
  localDestSelectionOrder.value.push({ type: 'hotel', key: slug })
  notePicker()
}

function toggleTheme(id: string) {
  // Multi-select route — write to local draft only.
  toggleThemeLocal(id)
}

const destinationLabel = computed(() => {
  // Read from local drafts (rule #3) so the search-bar field reflects
  // what the user has currently picked in the popup, even before they
  // press Find Deals.
  const names: string[] = []

  for (const id of localDestDestinations.value) {
    const d = destinations.find(d => d.id === id)
    if (d) names.push(d.name)
  }
  for (const id of localDestThemes.value) {
    const th = themes.value.find(th => th.id === id)
    if (th) names.push(th.name)
  }
  for (const city of localDestCities.value) {
    names.push(city.name)
  }
  for (const hotel of localDestHotels.value) {
    names.push(hotel.name)
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

// Sync arrival date + nights to shared composable so /search filter can read them
const {
  arrivalDate: globalArrivalDate,
  setArrivalDate,
  commitArrivalDate,
  persons: globalPersons,
  rooms: globalRooms,
  setSearchGroup,
  setLoading,
  setSelectedNights,
  setFlexibility: setGlobalFlexibility,
  selectedNights: globalNights,
  selectedFlexType: globalFlexType,
  setFlexType,
  toggleNight: toggleGlobalNight,
  clearDuration,
  triggerSearchUpdate,
  // For Find Deals' full reset (rule #2).
  resetBudget,
  clearArrivalDate,
} = useFirstReleaseSearchState()

// --- WHEN ---
const calMonth = ref({ year: new Date().getFullYear(), month: new Date().getMonth() })
/** Arrival date picker — live-synced with the global useFirstReleaseSearchState.arrivalDate
 *  so every calendar on the site shows the same selection. */
const selectedDate = ref<string | null>(globalArrivalDate.value)
const flexibility = ref(0)
const selectedDurations = ref<string[]>([])
const flexState = ref<{ durations: string[]; months: string[] }>({ durations: [], months: [] })

// --- LOCAL DRAFT STATE for the search-bar pickers ---
// Pickers update only these refs; nothing is pushed to shared state until
// the user clicks the Vind deals / search button. This keeps the rest of
// the page (filters, results, deal cards) untouched while the user typesArrange.
const localNights = ref<string[]>([...globalNights.value])
const localFlexType = ref<string | null>(globalFlexType.value)
/** "Maakt niet uit" — user has explicitly opted out of picking a
 *  specific number of nights. Drives the "Elke reisduur" label on
 *  the search-bar field; cleared as soon as the user picks any
 *  specific night-count again. */
const localAnyDuration = ref(false)

/** "Ik ben flexibel" — user has opted out of picking a specific
 *  arrival date. Drives the "Flexibel" label on the search-bar
 *  field's date half and disables the calendar inside the popup. */
const localFlexible = ref(false)

function setLocalFlexible(next: boolean) {
  localFlexible.value = next
  if (next) {
    // Wipe any date/month picks so "Flexibel" stands alone.
    selectedDate.value = null
    flexibility.value = 0
    flexState.value = { durations: [], months: [] }
  }
  notePicker()
}

function toggleLocalNight(value: string) {
  const i = localNights.value.indexOf(value)
  if (i === -1) localNights.value.push(value)
  else localNights.value.splice(i, 1)
  if (localNights.value.length > 0) {
    localFlexType.value = null
    localAnyDuration.value = false
  }
  // Push to shared state so /search filter pills, deal-page heading and
  // any other open searchbar reflect the change immediately.
  setSelectedNights(localNights.value.filter(v => ['1', '2', '3', '4', '5+'].includes(v)))
  setFlexType(localFlexType.value)
  notePicker()
}

function setAnyDuration(next: boolean) {
  localAnyDuration.value = next
  if (next) {
    localNights.value = []
    localFlexType.value = null
    setSelectedNights([])
    setFlexType(null)
  }
  notePicker()
}

function setLocalFlexType(val: string | null) {
  localFlexType.value = val
  if (val) localNights.value = []
  setFlexType(val)
  setSelectedNights(localNights.value.filter(v => ['1', '2', '3', '4', '5+'].includes(v)))
  notePicker()
}

// External commits (e.g. filter pill removed on /search, the other
// searchbar popup, mobile modal) flow back into this popup so its UI
// stays in sync with the global selection.
watch(globalNights, (g) => {
  const next = [...g]
  if (JSON.stringify(next) !== JSON.stringify(localNights.value)) {
    localNights.value = next
  }
})
watch(globalFlexType, (g) => {
  if (g !== localFlexType.value) localFlexType.value = g
})

// --- Pulse animation logic on the search button ---
// When date or duration is changed and popups are closed, schedule a 2-pulse
// nudge after a 2-second pause; cancelled if the user clicks search first.
const pulseActive = ref(false)
let pulseTimer: ReturnType<typeof setTimeout> | null = null
let pulseChangedSinceClose = false

function notePicker() {
  pulseChangedSinceClose = true
}

function schedulePulse() {
  if (!pulseChangedSinceClose) return
  if (pulseTimer) clearTimeout(pulseTimer)
  pulseTimer = setTimeout(() => {
    pulseActive.value = true
    setTimeout(() => { pulseActive.value = false }, 5200) // 2 pulses, ~2s apart
  }, 2000)
}

function cancelPulse() {
  if (pulseTimer) { clearTimeout(pulseTimer); pulseTimer = null }
  pulseActive.value = false
  pulseChangedSinceClose = false
}

watch(localFlexType, () => notePicker())
watch(localNights, () => notePicker(), { deep: true })

// Pre-fill local picker from shared state (e.g. on /search page reload)
// Pre-fill local pickers from shared on mount (e.g. /search reload)
if (selectedDurations.value.length === 0 && globalNights.value.length) {
  selectedDurations.value = [...globalNights.value]
}

/** weekday → required start-day-of-week for each flex-type. */
const FLEX_TYPE_DOW: Record<string, number> = {
  'weekend-fri-sun': 5,
  'weekend-sat-sun': 6,
  'long-weekend': 5,
  'midweek': 1,
}

watch(selectedDate, (val) => {
  // Live-commit to global state so every other calendar on the site (deal
  // page, hotel page, /search filter pill) reflects the same selection.
  // Result-list filtering is gated by `committedArrivalDate`, so this does
  // NOT trigger a re-filter on /search or /kaart.
  if (val !== globalArrivalDate.value) setArrivalDate(val)
  if (val && flexState.value.months.length > 0) {
    flexState.value = { ...flexState.value, months: [] }
  }
  // Reset duration to "Elke reisduur" if the arrival weekday doesn't match
  // the currently chosen weekend/midweek option (operates on LOCAL state).
  if (val && localFlexType.value) {
    const required = FLEX_TYPE_DOW[localFlexType.value]
    const dow = new Date(val).getDay()
    if (required !== undefined && dow !== required) {
      localNights.value = []
      localFlexType.value = null
    }
  }
  notePicker()
})

/** Mirror global → local: when another calendar changes the arrival date
 *  (e.g. the deal page sidebar), keep the navbar popup in sync. */
watch(globalArrivalDate, (val) => {
  if (val !== selectedDate.value) selectedDate.value = val
})

/** Mirror global flexibility → local. */
watch(() => useFirstReleaseSearchState().selectedFlexibility.value, (val) => {
  if (val !== flexibility.value) flexibility.value = val
})

/** Push live flex changes to global so the pill clearance and other places
 *  see the matching window. Search filter still uses the committed snapshot. */
watch(flexibility, (val) => {
  setGlobalFlexibility(val)
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
  // "Ik ben flexibel" wins over any date / month state.
  if (localFlexible.value) return 'Flexibel'
  // Date / months only — duration moved to Hoelang field.
  if (selectedDate.value) {
    const [, m, d] = selectedDate.value.split('-')
    let whenPart = `${d}/${m}`
    if (flexibility.value > 0) whenPart += ` ±${flexibility.value}`
    return whenPart
  }
  if (flexState.value.months.length > 0) {
    const monthLabels = flexState.value.months.map((key) => {
      const monthIndex = parseInt(key.split('-')[1], 10) - 1
      return monthNames.value[monthIndex]
    })
    return monthLabels.join(', ')
  }
  return 'Kies datum'
})

/** Empty when the user hasn't chosen a date / month — drives the lighter
 *  grey "placeholder" styling on the search-bar value. */
const whenIsPlaceholder = computed(
  () => !localFlexible.value && !selectedDate.value && flexState.value.months.length === 0,
)

const hoelangLabel = computed(() => {
  if (localFlexType.value) {
    const typeLabels: Record<string, string> = {
      'weekend-fri-sun': 'Weekend (vr-zo)',
      'weekend-sat-sun': 'Weekend (za-zo)',
      'long-weekend': 'Lang weekend',
      'midweek': 'Midweek',
    }
    return typeLabels[localFlexType.value] || 'Kies aantal nachten'
  }
  if (localAnyDuration.value) return 'Elke reisduur'
  if (localNights.value.length === 0) return 'Kies aantal nachten'
  if (localNights.value.length === 1) {
    const v = localNights.value[0]
    if (v === '1') return '1 nacht'
    if (v === '5+') return '5+ nachten'
    return `${v} nachten`
  }
  const sorted = [...localNights.value].sort()
  return `${sorted.join(' of ')} nachten`
})

const hoelangIsPlaceholder = computed(
  () => !localFlexType.value && !localAnyDuration.value && localNights.value.length === 0,
)

/** Combined "Wanneer en hoelang" field label — joins the date and duration
 *  parts with a ` · ` separator. When neither is set we fall back to the
 *  placeholder copy and render in lighter grey. */
const whenCombinedLabel = computed(() => {
  const parts: string[] = []
  if (!whenIsPlaceholder.value) parts.push(whenLabel.value)
  if (!hoelangIsPlaceholder.value) parts.push(hoelangLabel.value)
  if (parts.length === 0) return t('header.pickDateAndDuration')
  return parts.join(' · ')
})

const whenCombinedIsPlaceholder = computed(
  () => whenIsPlaceholder.value && hoelangIsPlaceholder.value,
)

/** Destination is a placeholder when nothing is picked — same logic the
 *  destinationLabel already uses to fall back to the t('chooseDestination')
 *  string. */
const destinationIsPlaceholder = computed(() => (
  localDestDestinations.value.length === 0
  && localDestThemes.value.length === 0
  && localDestCities.value.length === 0
  && localDestHotels.value.length === 0
))

// --- WHO ---
/** Local draft for the Wie-popup — initialised from the global persons/rooms
 *  so a navbar opened on /deal or /search reflects the current group size. */
const searchGroup = ref({
  adults: globalPersons.value || 2,
  children: [] as { age: number }[],
  rooms: globalRooms.value || 1,
  dog: false,
})

/** Mirror global persons/rooms back to the local draft when another component
 *  (e.g. the deal-page Travel Group modal) commits a change. Skip if the
 *  popup is open so we don't yank the user's in-progress draft. */
watch(globalPersons, (p) => {
  if (activePopup.value === 'who') return
  if (p !== searchGroup.value.adults + searchGroup.value.children.length) {
    searchGroup.value = {
      ...searchGroup.value,
      adults: Math.max(1, p - searchGroup.value.children.length),
    }
  }
})
watch(globalRooms, (r) => {
  if (activePopup.value === 'who') return
  if (r !== searchGroup.value.rooms) {
    searchGroup.value = { ...searchGroup.value, rooms: r }
  }
})

/** Enforce minimum rooms (1p→1, 2p→1, 3p→2, 4p→2, 5p→3 …). Only bumps
 *  rooms UP when persons exceed the current capacity; manually-added extra
 *  rooms stick. Only fires while the popup is open so external commits
 *  (with their own room number) aren't overridden. */
watch(
  () => searchGroup.value.adults + searchGroup.value.children.length,
  (total) => {
    if (activePopup.value !== 'who') return
    const min = minRoomsFor(total)
    const max = maxRoomsFor(total)
    if (searchGroup.value.rooms < min) {
      searchGroup.value = { ...searchGroup.value, rooms: min }
    } else if (searchGroup.value.rooms > max) {
      // Clamp DOWN: rooms can never exceed total guests (no empty rooms).
      searchGroup.value = { ...searchGroup.value, rooms: max }
    }
  },
)

function addSearchChild() {
  searchGroup.value.children.push({ age: 4 })
}

function removeSearchChild() {
  searchGroup.value.children.pop()
}

// True when the "who" field is still on its default (2 adults / 0 children /
// 1 room / no dog) — used to dim the value as placeholder and hide the clear ✕.
const whoIsPlaceholder = computed(() => (
  searchGroup.value.adults === 2 &&
  searchGroup.value.children.length === 0 &&
  searchGroup.value.rooms === 1 &&
  !searchGroup.value.dog
))

/** MVP "wie reist er mee" presets — pairs (2N personen / N kamers) up to
 *  16 personen / 8 kamers. Clicking one option sets the search group and
 *  closes the popup; the full stepper UI is retained behind v-if="false". */
const whoMvpOptions = computed(() => {
  const out: { adults: number; rooms: number }[] = []
  for (let rooms = 1; rooms <= 8; rooms++) {
    out.push({ adults: rooms * 2, rooms })
  }
  return out
})

const whoMvpSelectedKey = computed(() => {
  if (searchGroup.value.children.length > 0) return null
  if (searchGroup.value.dog) return null
  return `${searchGroup.value.adults}-${searchGroup.value.rooms}`
})

function pickWhoMvp(opt: { adults: number; rooms: number }) {
  searchGroup.value = { adults: opt.adults, children: [], rooms: opt.rooms, dog: false }
  closePopup()
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
  // Rule #2: a fresh Find Deals starts from a clean slate — every
  // existing filter (panel side + previous search-bar commits) is
  // wiped first; only the current search-bar drafts are applied.
  clearFilterTags()
  resetBudget()
  setSelectedNights([])
  setFlexType(null)
  clearArrivalDate()
  clearDestinations()

  // Apply destination drafts.
  for (const id of localDestDestinations.value) toggleDestination(id)
  for (const id of localDestThemes.value) toggleFilterTag(id)
  for (const city of localDestCities.value) handleSelectCity(city)
  for (const hotel of localDestHotels.value) addHotel({ name: hotel.name, slug: hotel.slug })

  // Apply When + Who drafts.
  const totalPersons = searchGroup.value.adults + searchGroup.value.children.length
  setSearchGroup(totalPersons, searchGroup.value.rooms)
  setArrivalDate(selectedDate.value)
  setSelectedNights(localNights.value.filter(v => ['1', '2', '3', '4', '5+'].includes(v)))
  setFlexType(localFlexType.value)
  setGlobalFlexibility(flexibility.value)

  // Promote live arrival/flex into the snapshot used by /search and /kaart.
  commitArrivalDate()
  triggerSearchUpdate()
  setLoading(true)

  // After commit shared = drafts; resync the local drafts (no-op
  // semantically, but cleans up `selectionOrder` to match how shared
  // ordered the entries).
  syncLocalDestFromShared()

  // If the user picked a specific hotel from the destination popup, pin it.
  // Otherwise fall back to the deal-page slug (when changing search from /deal).
  const fromSlug = localDestHotels.value[0]?.slug || currentDealSlug()
  navigateTo(fromSlug ? `/first-release/search?from=${encodeURIComponent(fromSlug)}` : '/first-release/search')
}

function currentDealSlug(): string | null {
  const path = (useRoute().path || '')
  const m = path.match(/^\/deal\/([^/?#]+)/)
  return m ? decodeURIComponent(m[1]) : null
}

function handleSearch() {
  cancelPulse()
  activePopup.value = null
  commitSearch()
}

function handleMobileSearch() {
  cancelPulse()
  mobileSearchOpen.value = false
  commitSearch()
}

function handleSelectHotel(slug: string) {
  closePopup()
  navigateTo(`/first-release/deal/${slug}`)
}

/** Hotel chosen from the destination popup: store as a selected hotel chip
 *  (with both display name and slug) — wait for the user to hit the search
 *  button to navigate to /search?from=<slug>. */
function handleSelectHotelInPopup(slug: string) {
  const h = searchHotels.find(x => x.slug === slug)
  const name = h?.name || slug
  addHotel({ name, slug })
  notePicker()
}
</script>

<style scoped>
.site-header {
  position: relative;
  z-index: 500;
  background: #111111;
  /* Reserve space inside the black so the upper half of the search bar
     sits inside the dark header chrome (the lower half protrudes onto
     the page below — Northstar-style). Internal pages (/search, /deal,
     /hotel etc.) get the half-overlap. */
  padding-bottom: 38px;
  /* Clearance for the protruding lower half so following content isn't
     covered by the bar. 38 px of that is the protrusion itself; the
     remaining ~9 px is the visible gap to the next content (breadcrumb). */
  margin-bottom: 47px;
}

/* Solid (default) variant — search dock straddles the header's bottom
   edge: upper half lives on black, lower half pokes onto the page. */
.site-header .site-header__search-dock {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  transform: translateY(50%);
  z-index: 2;
  padding: 0;
  /* Dock box must be transparent — only the inner .search-bar paints a
     visible background. Without this the base rule `background: inherit`
     fills the dock with the header's black, so the black appears to
     extend past the half-way line. */
  background: transparent;
}

/* Overlay variant: transparent header on top of a hero background.
   The search bar is part of the hero composition (no half-overlap), so
   reset both the dark-header spacing and the absolute-positioned dock. */
.site-header--overlay {
  background: transparent;
  padding-bottom: 0;
  margin-bottom: 0;
}

.site-header--overlay .site-header__nav {
  background: transparent;
}

.site-header--overlay .site-header__search-dock {
  position: relative;
  transform: none;
  padding: 0 0 32px;
}

/* Search-bar treatment — same look on the home (overlay) and internal
   (solid) variants. Internal pages get the half-protrude positioning
   via the absolute-positioned `.site-header__search-dock` rule above. */
.site-header .search-bar {
  max-width: none;
  height: auto;
  margin: 0;
  border-radius: 6px;
  border: none;
  padding: 8px;
  background: #fff;
  /* No outline on the home (overlay) bar; internal pages add the inner
     stroke via the more-specific rule below. */
  box-shadow: none;
  gap: 0;
}

.site-header .search-bar__field {
  flex: 1 0 0;
  min-width: 0;
  background: transparent;
  border: none;
  margin: 0;
  /* Zero vertical padding — body owns its own internal padding so the
     hover background equals the full 60-px field box (matches button). */
  padding: 0 18px;
  height: 60px;                  /* same as the "Vind deals" button */
  border-radius: 0;              /* segmented per-position rules below */
  flex-direction: row;
  align-items: stretch;
  gap: 12px;
}

/* Segmented hover/active corners — round ONLY at the bar's outer edges
   so the hover background never touches the dividers with a rounded
   corner. Radius matches the search button's 4 px. */
.site-header .search-bar__field--destination {
  border-radius: 4px 0 0 4px;
}
.site-header .search-bar__field--who {
  border-radius: 0 4px 4px 0;
}

/* Body: top-aligned label-row, bottom-aligned value, full field height. */
.site-header .search-bar__field-body {
  height: 100%;
  justify-content: space-between;
  padding: 8px 0;
}

.site-header .search-bar__field:hover {
  background: #f5f5f5;
  border-color: transparent;
}

.site-header .search-bar__field--active {
  background: #eeeeee;
  border-color: transparent;
  box-shadow: none;
}

.site-header .search-bar__divider {
  /* Light-grey divider (`--color-border`). Same height as the button so
     hover boxes, dividers and button share the same vertical extent. */
  background: var(--color-border);
  width: 1px;
  height: 60px;
  align-self: center;
  margin: 0;
}

/* Internal-page (solid) bar — 2 px inner grey stroke + soft drop
   shadow underneath. The home (overlay) bar stays stroke-free. */
.site-header:not(.site-header--overlay) .search-bar {
  box-shadow: inset 0 0 0 2px var(--color-border, #d4d4d4),
              0 10px 24px rgba(0, 0, 0, 0.18);
}

/* Variant 4 opts out of the drop shadow (keeps the inner stroke). */
.site-header--nav-v4:not(.site-header--overlay) .search-bar {
  box-shadow: inset 0 0 0 2px var(--color-border, #d4d4d4);
}

.site-header .search-bar__label {
  /* Old-style label: ALL CAPS, lighter colour, regular weight at 12 px
     with 1.3 px tracking. */
  font-size: 12px;
  letter-spacing: 1.3px;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  font-weight: 400;
  line-height: 1;
}

.site-header .search-bar__value {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.site-header .search-bar__value--placeholder {
  color: var(--color-text-secondary);
  font-weight: 400;
}

/* Icon sized to match the label cap-height — uses currentColor + 1em so
   that any future label-size tweak keeps the icon in sync. */
.site-header .search-bar__field-icon {
  /* Anchor for the 1em icon below — matches the label's font-size so
     the icon visually scales with the label. */
  font-size: 12px;
}

.site-header .search-bar__field-icon svg {
  width: 1em;
  height: 1em;
}

.site-header .search-bar__btn--find-deals {
  background: var(--color-primary);
  color: #fff;
  height: 60px;                  /* explicit so divider/hover line up */
  width: auto;
  padding: 0 38px;
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

.site-header .search-bar__btn--find-deals:hover {
  background: var(--color-primary-hover);
}

/* Search-button pulse — used after picker change with no search click */
@keyframes search-btn-pulse {
  0%, 100%   { box-shadow: 0 0 0 0 rgba(233, 113, 50, 0.55); }
  18%        { box-shadow: 0 0 0 14px rgba(233, 113, 50, 0); }
  36%        { box-shadow: 0 0 0 0 rgba(233, 113, 50, 0); }
  54%        { box-shadow: 0 0 0 0 rgba(233, 113, 50, 0.55); }
  72%        { box-shadow: 0 0 0 14px rgba(233, 113, 50, 0); }
}

.search-bar__btn--pulsing {
  animation: search-btn-pulse 5.2s ease-out 0s 1;
}

.site-header .search-bar__field-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-primary);
  flex-shrink: 0;
}

/* .search-bar__field-text — legacy class, replaced by .search-bar__field-body. */

.site-header .search-bar__btn--find-deals {
  background: var(--color-primary);
  color: #fff;
  height: 60px;                  /* explicit so divider/hover line up */
  width: auto;
  padding: 0 38px;
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

.site-header .search-bar__btn--find-deals:hover {
  background: var(--color-primary-hover);
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

/* Nav bar — two-row layout via CSS grid.
   Row 1: logo (col 1)            …  (col 2 empty / spans verticals later) … actions (col 3)
   Row 2: pay-off (col 1)         …  verticals (col 2, centred)            … phone (col 3)
   20 px top margin per design; row gap of 20 px so the pay-off sits exactly
   20 px below the logo. */
.site-header__nav {
  background: #111111;
  display: flex;
  align-items: stretch;
  position: relative;
  z-index: 10;
  padding: 20px 0;
}

.site-header__nav-inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto auto;
  /* Row 2 sits 8 px below row 1 per design. */
  row-gap: 8px;
  column-gap: var(--space-xl);
  width: 100%;
  align-items: center;
}

/* ───────────────── NAV-BAR VARIANTS ─────────────────
 *  Default (variant 1) uses the rules above. Variants 2 and 3 override
 *  selected grid placements via modifier classes on the .site-header
 *  root (set by the navVariant prop / composable). */

/* ─── Variant 2 — 2-row layout:
 *  row 1: logo + payoff inline (left)             …  actions (right)
 *  row 2: verticals nav (left)                    …  phone (right)
 *  The payoff matches the logo's visual height (so its font-size is
 *  much larger than v1's). Stroke hidden. ─── */
.site-header--nav-v2 .site-header__nav-inner {
  /* 5 columns: logo · payoff · spacer · phone · actions
     The extra col lets phone sit on row 1 next to actions. */
  grid-template-columns: auto auto 1fr auto auto;
  grid-template-rows: auto auto;
  /* Match v1's row-gap so the total nav height — and the Y of the hero
     content (eyebrow / title / pitch / search bar) — matches v1. */
  row-gap: 8px;
  /* Halve the default column-gap (32 → 16) so the payoff hugs the logo. */
  column-gap: 16px;
}
.site-header--nav-v2 .site-header__logo {
  grid-row: 1;
  grid-column: 1;
  /* Top-align (same as v1) so the logo's top edge is flush with the nav
     padding-top — gives both variants identical logo top padding. */
  align-self: start;
}
.site-header--nav-v2 .site-header__tagline-block {
  display: flex;             /* override the legacy v2 hide rule */
  grid-row: 1;
  grid-column: 2;
  align-self: center;
  justify-self: start;
  flex-direction: row;
  align-items: center;
  gap: 0;
  margin-top: 0;
}
.site-header--nav-v2 .site-header__tagline {
  /* Halved from 40 px — smaller handwritten payoff next to the logo. */
  font-size: 20px;
  line-height: 1;
  white-space: nowrap;
}
.site-header--nav-v2 .site-header__tagline-stroke {
  display: none;
}
.site-header--nav-v2 .verticals {
  grid-row: 2;
  grid-column: 1 / span 5;   /* spans the whole width so it sits flush left */
  justify-self: start;
}
.site-header--nav-v2 .site-header__phone {
  /* Row 1, just LEFT of the actions cluster. */
  grid-row: 1;
  grid-column: 4;
  justify-self: end;
}
.site-header--nav-v2 .site-header__nav-actions {
  grid-row: 1;
  grid-column: 5;
  justify-self: end;
}

/* ─── Variant 1 — verticals move up to row 1 (top-aligned with logo);
 *  same layout as v4 but with four tweaks:
 *   • payoff sits TIGHT under the logo (top of row 2, not bottom)
 *   • payoff font is 5 % smaller (22 → 21 px)
 *   • the handwritten underline stroke is hidden
 *  Verticals / phone / actions placement stays identical to defaults. ─── */
.site-header--nav-v1 .site-header__tagline-block,
.site-header--nav-v6 .site-header__tagline-block {
  /* Stretch to fill row 2 so the orange balance-dash can bottom-align
     with the row bottom (= phone-number bottom). Payoff stays at the
     top via flex-start. Negative top-margin pulls it 8 px closer to
     the logo than the default row-gap allows. */
  align-self: stretch;
  justify-content: flex-start;
  gap: 0;
  margin-top: -22px;            /* 4 px tighter to the logo */
  position: relative;
}

/* Small orange dash under the payoff — left-aligned, bottom-aligned
   with the row-2 bottom edge. Shown ONLY on the home (overlay) bar,
   not on the internal nav-bar pages — another v1 home/internal
   differentiator. */
.site-header--nav-v1.site-header--overlay .site-header__tagline-block::after,
.site-header--nav-v6.site-header--overlay .site-header__tagline-block::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 4px;
  width: 18px;
  height: 1px;
  background: #fff;
}
.site-header--nav-v1 .site-header__tagline,
.site-header--nav-v6 .site-header__tagline {
  font-size: 20px;          /* original size restored */
}
.site-header--nav-v1 .site-header__tagline-stroke,
.site-header--nav-v6 .site-header__tagline-stroke {
  display: none;
}
/* Verticals nav (Verblijven / Vakantieparken / Restaurants / Geef cadeaubon)
   moves from row 2 to row 1 so it sits next to the logo. */
.site-header--nav-v1 .verticals,
.site-header--nav-v6 .verticals {
  grid-row: 1;
  grid-column: 2;
  align-self: center;
}

/* ─── Equal-height row for v1 / v6 and v2 ───
 *  Logo, verticals pill, members "vip-btn", language switcher trigger
 *  and hamburger button all snap to one shared height. Single source of
 *  truth lives in --fr-nav-row-h so it's tweakable from one line. */
.site-header--nav-v1,
.site-header--nav-v2,
.site-header--nav-v6 {
  --fr-nav-row-h: 44px;
}

/* Logo: keep its original 244-px width / ~25-px height in both
 *  variants. Only the buttons / pills / icon controls share
 *  --fr-nav-row-h. */

/* v1 verticals pills keep their natural sizing (the base
   `.verticals__item` rule — padding 8 18, font 16). The v2-only rule
   below scales them up. */
.site-header--nav-v2 .verticals__item {
  /* Slightly larger than the default 40-px pills — 48 px tall, 18 px
     font, default 18 px horizontal padding. */
  height: 48px;
  padding: 0 18px;
  font-size: 18px;
  display: inline-flex;
  align-items: center;
}
/* Keep "+ more" 1 px smaller than the base label (matches the
   default 15 vs 16 relationship). */
.site-header--nav-v2 .verticals__item-more {
  font-size: 17px;
}

.site-header--nav-v1 .vip-btn,
.site-header--nav-v2 .vip-btn,
.site-header--nav-v6 .vip-btn {
  height: var(--fr-nav-row-h);
  padding: 0 18px;
}

.site-header--nav-v1 .lang-switcher__trigger,
.site-header--nav-v2 .lang-switcher__trigger,
.site-header--nav-v6 .lang-switcher__trigger {
  height: var(--fr-nav-row-h);
  padding: 0 14px;
}

.site-header--nav-v1 .hamburger-btn,
.site-header--nav-v2 .hamburger-btn,
.site-header--nav-v6 .hamburger-btn {
  width: var(--fr-nav-row-h);
  height: var(--fr-nav-row-h);
}

/* ─── Variant 1 / 6 — top-align the logo with the row-1 buttons (which
 *  define row 1 height at --fr-nav-row-h). The logo is shorter than the
 *  buttons so without this it would centre. ─── */
.site-header--nav-v1 .site-header__logo,
.site-header--nav-v6 .site-header__logo {
  align-self: start;
}

/* The three actions (language / members / menu) span the same 256-px
 *  width as the phone-number block below them, evenly spaced. */
.site-header--nav-v1 .site-header__nav-actions,
.site-header--nav-v6 .site-header__nav-actions {
  width: 256px;
  justify-content: space-between;
  gap: 0;
}

/* ─── Variant 2 — middle-align row 1 ─── */
/* All row-1 items centre vertically inside the row (default grid
 *  alignment via `.site-header__nav-inner { align-items: center }`).
 *  Action-pill heights drop from 44 → 40 px so language / members /
 *  hamburger sit a little smaller than the verticals pill on row 2. */
.site-header--nav-v2 .vip-btn,
.site-header--nav-v2 .lang-switcher__trigger {
  height: 40px;
}
.site-header--nav-v2 .hamburger-btn {
  width: 40px;
  height: 40px;
}

/* ─── Variant 3 — same as variant 2, but the phone moves from row 1
 *  to row 2 and right-aligns there. Because the SiteHeader applies
 *  BOTH the `nav-v2` and `nav-v3` classes when navVariant is '3',
 *  every v2 rule above still applies; the two rules below override
 *  what v3 changes. ─── */
.site-header--nav-v3 .site-header__phone {
  grid-row: 2;
  grid-column: 5;          /* far-right column of v2's 5-col grid */
  justify-self: end;
  align-self: center;       /* line up vertically with verticals on row 2 */
}
/* Verticals span only cols 1-3 in v3 so they don't collide with the
   phone block that's now in col 5 on row 2. */
.site-header--nav-v3 .verticals {
  grid-column: 1 / span 3;
}

/* Variant 4 uses the base defaults (stroke visible, 22 px payoff,
 *  bottom-aligned with verticals). v4 specifically opts OUT of the
 *  drop-shadow that other variants now get on internal pages — that
 *  exception lives in the earlier "Internal-page bar" rule block. */

/* ─── Variant 5 — folder-tab verticals connected to the search bar.
 *  Inherits v2's nav layout via the dual `nav-v2 nav-v5` class on the
 *  header root. Only the verticals' visual treatment changes here;
 *  the home page (home-v5.vue) absolute-positions the strip so its
 *  bottom edge touches the search bar's top edge (0 px gap). ─── */
.site-header--nav-v5 .verticals {
  display: flex;
  gap: 0;
  z-index: 3;
}

.site-header--nav-v5 .verticals__item {
  height: 44px;
  padding: 0 18px;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  /* Folder shape: rounded top, flat bottom. */
  border-radius: 8px 8px 0 0;
  /* No outline — the tab silhouette comes from its fill alone. */
  border: none;
  /* Unselected default = no fill, mirroring v4's resting state. */
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

/* Hover only on INACTIVE tabs — mirrors v4's hover fill. */
.site-header--nav-v5 .verticals__item:not(.verticals__item--active):hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.site-header--nav-v5 .verticals__item--active {
  /* Active tab adopts the OLD unselected look — sits a little darker
     than the new inactive default so the active is subtly distinct
     without being a different colour. */
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-weight: 600;
  border: none;
}

/* v5 — global connection between tabs and search bar. Applies to BOTH
   home (overlay) and internal pages (solid). */
.site-header--nav-v5 .site-header__nav { padding-bottom: 0; }
.site-header--nav-v5 .search-bar { border-top-left-radius: 0; }

/* Tabs align with the search bar's outer left edge. The verticals live
   inside `.site-header__nav-inner.container`, which already applies
   the same max-width + `padding: 0 var(--space-lg)` as the search
   dock's container. So NO extra padding/max-width here — that would
   double the indent and push the tabs to the right of the bar. */
.site-header--nav-v5 .verticals {
  /* +20 px restores the vertical space that v5 removed by setting
     `nav { padding-bottom: 0 }`. Net effect: the search bar (which
     sits right after the nav) lands at the SAME Y on every page, so
     home, search, deal, hotel, kaart, etc. all line up. */
  margin-top: 20px;
  margin-bottom: -1px;          /* overlap the bar's top by 1 px */
  display: flex;
  justify-content: flex-start;
}

/* v5 internal pages keep the default half-protrude (`.site-header
   { padding-bottom: 38px }` + dock `position: absolute; bottom: 0;
   transform: translateY(50%)`) so the black background stops exactly
   half-way through the search bar. Because v5 also has
   `.site-header__nav { padding-bottom: 0 }`, the verticals' bottom
   edge lands at `nav_height = header_bottom - 38px = bar's top`,
   which is exactly where the tabs need to touch the bar. */

/* Logo (grid row 1, col 1) — width pinned to 244 px per design. */
.site-header__logo {
  grid-row: 1;
  grid-column: 1;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.site-header__logo-img {
  display: block;
}

.site-header__logo-img--horizontal {
  width: 244px;
  height: auto;
}

/* Pay-off block (grid row 2, col 1) — vertical stack: main tagline on
   top, secondary handwritten line on the bottom. The wrapper stretches
   to the full row height and uses space-between so the second line's
   baseline lines up with the verticals button row's bottom. */
.site-header__tagline-block {
  grid-row: 2;
  grid-column: 1;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  /* Both lines hugged to the bottom so the payoff sits just above the
     stroke; the stroke still bottom-aligns with the verticals row. */
  justify-content: flex-end;
  gap: 2px;
}

/* Pay-off — handwritten Oooh Baby, white. */
.site-header__tagline {
  font-family: 'Oooh Baby', cursive;
  font-size: 22px;
  font-weight: 400;
  color: #fff;
  letter-spacing: 0.2px;
  line-height: 1;
  white-space: nowrap;
}

/* Handwritten underline stroke — sits at the wrapper's bottom edge so
   it bottom-aligns with the verticals button row. The SVG stretches to
   match the tagline's text width (set via JS-free `width: max-content`
   inheritance — the path uses preserveAspectRatio="none" to keep its
   wavy shape regardless of width). */
.site-header__tagline-stroke {
  display: block;
  width: 100%;
  max-width: 320px;
  height: 12px;
  color: #fff;
  opacity: 0.9;
}

/* Phone (grid row 2, col 3) — right-aligned within its column so its
   right edge lines up with the hamburger above it. */
.site-header__phone {
  grid-row: 2;
  grid-column: 3;
  justify-self: end;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  text-decoration: none;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.2px;
  transition: color 150ms ease;
}

.site-header__phone svg {
  color: #fff;
  flex-shrink: 0;
  /* 150 % of the inline 14 px attribute → 21 px square. */
  width: 21px;
  height: 21px;
}

/* Keep the phone label + number on single lines — the icon-resize bumped
   the row's intrinsic width and the grid column was wrapping the text. */
.site-header__phone-label,
.site-header__phone-number {
  white-space: nowrap;
}

.site-header__phone-label {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.site-header__phone-number {
  font-weight: 700;
}

.site-header__phone:hover,
.site-header__phone:focus-visible {
  color: var(--color-primary);
}

/* Verticals switcher */
.verticals {
  grid-row: 2;
  grid-column: 2;
  justify-self: center;
  display: flex;
  align-items: center;
  gap: 28px;
  margin-left: 0;
}

.verticals__item {
  display: inline-flex;
  align-items: center;
  padding: 8px 18px;
  /* +2 from the previous 14 → 16 per design. */
  font-size: 16px;
  /* Non-selected verticals now read a touch heavier so Restaurants and
     Geef cadeaubon don't look like body text against the hero photo. */
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
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

/* Active vertical is rendered as <span> (no link). Disable hover/cursor. */
.verticals__item--inactive-link {
  cursor: default;
}
.verticals__item--inactive-link:hover {
  background: rgba(255, 255, 255, 0.12);
  color: white;
}

/* Right actions (grid row 1, col 3) — right-aligned inside its grid
   cell so the hamburger button's right edge lines up with the phone's
   right edge in row 2. Without `justify-self: end` the actions div
   stretches and the hamburger drifts to the left when the phone row
   below is wider. */
.site-header__nav-actions {
  grid-row: 1;
  grid-column: 3;
  justify-self: end;
  display: inline-flex;
  align-items: center;
  gap: var(--space-md);
  flex-shrink: 0;
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
/* Search dock — now sits below the two-row nav in regular flow (was
   absolutely positioned and overlapped the hero). Shown only on pages
   that don't pass `hide-search-dock` (i.e., /search, /deal, /hotel). */
.site-header__search-dock {
  position: relative;
  z-index: 2;
  padding: 24px 0 28px;
  background: inherit;
}

/* Search bar */
/* ===== SEARCH BAR =====
   Prominent treatment per design:
   - 2 px orange stroke around the bar
   - Warm grey background (the bar chrome) — so the white fields pop
   - White individual field buttons with subtle border
   - Darker labels + placeholder text so they read as real form copy
   - Strong shadow to lift the bar off the page */
.search-bar {
  width: 100%;
  max-width: 940px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  background: var(--color-background-secondary, #faf7f0);
  border-radius: 18px;
  height: 80px;
  padding: 8px;
  position: relative;
  border: 2px solid var(--color-primary);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.22), 0 2px 8px rgba(0, 0, 0, 0.08);
  gap: 8px;
}

.search-bar__field {
  flex: 1;
  margin: 0;
  /* Top-padding matches the gap between bar inner-top and search-button top
     (bar padding 8px + (64 − 56)/2 = 4px → 12px) so the label-row top-aligns
     with the upper border of the search button. Horizontal padding kept at
     18px for breathing room. */
  padding: 12px 18px;
  display: flex;
  align-items: flex-start;      /* top-align icon+label inside the field */
  gap: 8px;
  cursor: pointer;
  border: 1px solid transparent;
  background: #fff;
  text-align: left;
  border-radius: 12px;
  transition: background var(--transition-fast),
              border-color var(--transition-fast),
              box-shadow var(--transition-fast);
  min-width: 0;
  height: 100%;
}

/* HOVER — fill the entire field card (label + value rows). */
.search-bar__field:hover {
  background: var(--color-background-secondary-hover, #f3efe5);
  border-color: var(--color-primary);
}

.search-bar__field--active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(233, 113, 50, 0.18);
}

.search-bar__field--destination {
  flex: 1.2;
}

/* Two-row inner stack: icon+label on row 1, value/placeholder on row 2. */
.search-bar__field-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: 0;
}

.search-bar__field-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  line-height: 1;
  /* The icon SVGs (location pin, calendar, person) have ~2 px of empty
     space on the left of their 24 × 24 viewBox. Pulling the row 2 px
     to the left brings the icon's visible left edge in line with the
     placeholder / value text below it. */
  margin-left: -2px;
}

.search-bar__field-icon {
  display: inline-flex;
  align-items: center;
  color: var(--color-text-primary);
}

.search-bar__field-icon svg {
  display: block;
  width: 14px;
  height: 14px;
}

.search-bar__label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-transform: none;
  letter-spacing: 0;
  line-height: 1;
}

.search-bar__value {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.search-bar__value--placeholder {
  color: var(--color-text-secondary);
  font-weight: 400;
}

/* Visible darker-grey divider, same height as the search button so it
   matches the button's vertical extent rather than the field's outer
   card height. */
.search-bar__divider {
  width: 1px;
  height: 56px;
  align-self: center;
  background: var(--color-border-strong, #b8b8b8);
  flex-shrink: 0;
}

/* Right-aligned clear ✕ — appears only when the field has a non-default
   value. Positioned as the last flex child of the field so it floats to
   the right of the auto-growing body column. */
.search-bar__clear {
  flex-shrink: 0;
  /* Bottom-align with the field — the ✕ rides on the value-text row
     instead of floating between the label and value (which read as
     "too high" because the button was nearly the field's full height). */
  align-self: flex-end;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
  /* Halve the visible right margin between the ✕ and the field's right
     edge: the field has padding-right: 18 px, so a -9 px pull moves the
     button 9 px to the right (= 9 px gap instead of 18). */
  margin-right: -9px;
  /* Sit on the value-row baseline: body has padding-bottom: 8 px and
     the value text is ~16 px tall. A 28×28 button flush at the field
     bottom centres at y ≈ 46 — within a pixel of the value line. */
  margin-bottom: 4px;
}

.search-bar__clear:hover,
.search-bar__clear:focus-visible {
  background: var(--color-border-light, #ececec);
  color: var(--color-text-primary);
  outline: none;
}

.search-bar__btn {
  /* Width hugs contents ("Zoek" text) with horizontal padding;
     previously was a fixed 56px square icon button. */
  height: 56px;
  padding: 0 24px;
  border-radius: 12px;
  background: var(--color-primary);
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  margin-left: 4px;
  transition: background var(--transition-fast);
  color: white;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.2px;
  white-space: nowrap;
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
  width: 560px;          /* fixed: don't shrink while user types */
  max-width: 90vw;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.popup--when {
  padding: 0;
  /* Width is now pinned on the .popup-anchor parent (in computePopupPosition).
     The inner popup just fills that width. */
  width: 100%;
  max-height: none;
  overflow: visible;
}

.popup--who {
  padding: var(--space-lg);
  max-width: 420px;
  width: 100%;
}

/* MVP who popup — borderless padding so the list rows go edge-to-edge. */
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
