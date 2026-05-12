<template>
  <div class="deal-page">
    <NorthstarTopBar />
    <NorthstarSiteHeader />

    <!-- Search refresh overlay -->
    <Transition name="fade-fast">
      <div v-if="isRefreshing" class="deal-page__refresh-overlay">
        <div class="deal-page__refresh-spinner"></div>
        <span class="deal-page__refresh-text">{{ t('deal.refreshing') }}</span>
      </div>
    </Transition>

    <main v-if="hotel && currentDeal" class="deal-page__main">
      <!-- Back link + Breadcrumbs -->
      <section class="deal-page__breadcrumbs container">
        <NorthstarBreadcrumbNav :items="breadcrumbs" />
      </section>

      <!-- Anchor tabs -->
      <nav class="deal-page__tabs container">
        <a href="#intro" class="deal-page__tab">{{ t('deal.tabIntro') }}</a>
        <a href="#arrangement" class="deal-page__tab">{{ t('deal.tabArrangement') }}</a>
        <a href="#beoordelingen" class="deal-page__tab">{{ t('hotel.tabReviews') }}</a>
        <a v-if="hotel && hotel.houseRules && hotel.houseRules.length" href="#huisregels" class="deal-page__tab">{{ t('hotel.tabHouseRules') }}</a>
        <a href="#veelgestelde-vragen" class="deal-page__tab">{{ t('hotel.tabFaq') }}</a>
        <a href="#tips" class="deal-page__tab">{{ t('hotel.tabNearby') }}</a>
        <!-- Co-branded NU shop logo — only on the Hotel des Indes deal page
             when the user-test partner flag is set. Right-aligned, with
             "In samenwerking met" caption above. -->
        <div v-if="showPartnerLogo" class="deal-page__partner-block">
          <span class="deal-page__partner-caption">In samenwerking met</span>
          <img src="/images/logos/nushoplogo.svg" alt="NUshop" class="deal-page__partner-logo" />
        </div>
      </nav>

      <!-- Title ABOVE gallery -->
      <section class="deal-page__title-section container">
        <div class="deal-page__title-left">
          <h1 class="deal-page__package-title">{{ localized(currentDeal.title) }}</h1>
          <div class="deal-page__hotel-name-wrap">
            <NuxtLink :to="`/hotel/${hotel.slug}`" class="deal-page__hotel-link">
              <p class="deal-page__hotel-subtitle">{{ hotel.name }}</p>
            </NuxtLink>
            <div class="deal-page__stars-adjacent" aria-hidden="true">
              <span v-for="n in hotel.starRating" :key="n" class="star-adj">★</span>
            </div>
          </div>
          <div class="deal-page__meta">
            <div class="deal-page__score-wrap">
              <span class="deal-page__score">{{ hotel.reviews.overallScore.toFixed(1) }}</span>
              <span class="deal-page__score-label">{{ t(getReviewLabelKey(hotel.reviews.overallScore)) }}</span>
            </div>
            <span class="deal-page__divider">|</span>
            <span>{{ hotel.reviews.totalReviews }} {{ t('common.reviews') }}</span>
            <span class="deal-page__divider">·</span>
            <span>{{ hotel.location.city }}, {{ hotel.location.region }}</span>
            <template v-if="chosenReisduurLabel">
              <span class="deal-page__divider">·</span>
              <span>Reisduur: {{ chosenReisduurLabel }}</span>
            </template>
          </div>
        </div>
        <div class="deal-page__title-actions">
          <button class="icon-action" :class="{ 'icon-action--favorited': isFavorited }" :aria-label="t('common.save')" @click="handleFavoriteClick">{{ isFavorited ? '♥' : '♡' }}</button>
          <button class="icon-action" :aria-label="t('common.share')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></button>
        </div>
      </section>

      <!-- Hero Gallery -->
      <section class="container deal-page__gallery">
        <NorthstarHeroGallery :images="hotel.images" @open-gallery="openGallery" />
        <span v-if="savingsAmount > 0" class="deal-page__savings-badge deal-page__savings-badge--gallery">Bespaar €{{ savingsAmount }}</span>
      </section>

      <!-- Two-column layout: Content | Booking Sidebar -->
      <div class="deal-page__grid container">
        <div class="deal-page__col-left">
          <!-- Description + Mini map row -->
          <div id="intro" class="deal-page__intro">
            <div class="deal-page__description">
              <div v-html="firstParagraph"></div>
              <button v-if="hasMoreDescription" type="button" class="deal-page__read-more" @click="descriptionOpen = true">{{ t('common.readMore') }}</button>
            </div>
            <div class="mini-map">
              <div class="mini-map__placeholder">
                <img
                  :src="mapTileUrl"
                  :alt="t('deal.mapArea')"
                  class="mini-map__img mini-map__img--map"
                  @error="($event.target as HTMLImageElement).src = '/images/kasteel/fietsenzuidlimburg.jpg'"
                />
                <div class="mini-map__pin">
                  <svg width="32" height="42" viewBox="0 0 32 42" fill="none">
                    <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z" fill="#00B67A"/>
                    <circle cx="16" cy="16" r="6" fill="#fff"/>
                  </svg>
                </div>
                <div class="mini-map__bottom">
                  <span class="mini-map__label">{{ hotel.location.city }}</span>
                  <a href="#location" class="mini-map__link">{{ t('common.viewMap') }}</a>
                </div>
              </div>
            </div>
          </div>

          <!-- Highlights -->
          <section class="deal-page__highlights">
            <h2 class="section-title">{{ t('deal.highlights') }}</h2>
            <div class="highlights__grid">
              <div v-for="hl in highlights" :key="hl.text" class="highlight-item">
                <span class="highlight-item__icon">
                  <img :src="hl.icon || '/icons/highlights/special.svg'" :alt="hl.text" width="22" height="22" />
                </span>
                <span class="highlight-item__text">{{ hl.text }}</span>
              </div>
            </div>
          </section>

          <!-- Content blocks: What's included -->
          <section id="arrangement" class="deal-page__content-blocks">
            <h2 class="section-title">
              {{ t('deal.inclusionsHeading') }}
              <button class="inline-edit-link" @click="store.openTravelGroupModal()">
                {{ store.totalPersons }} {{ store.totalPersons === 1 ? t('common.personSingular') : t('common.personPlural') }}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              {{ t('deal.inclusionsEndAlt') }}
            </h2>
            <div class="content-blocks__grid">
              <!-- All inclusion content blocks (overnight + upgrade get extra CTAs / sticker) -->
              <div
                v-for="inc in displayedInclusions"
                :key="inc.id"
                class="content-block"
              >
                <div v-if="inc.image" class="content-block__image">
                  <img :src="inc.image" :alt="localized(inc.title)" loading="lazy" />
                  <span v-if="isUpgradeInclusion(inc)" class="content-block__upgrade-sticker">UPGRADE</span>
                </div>
                <div class="content-block__body">
                  <h3 class="content-block__title">
                    <span class="content-block__check">✓</span>
                    {{ localized(inc.title) }}
                  </h3>
                  <p class="content-block__desc">{{ localized(inc.description) }}</p>
                </div>

                <!-- Overnight block: 1) reisgezelschap CTA, 2) upgrade hint (only if no upgrade-block in deal) -->
                <template v-if="isOvernightInclusion(inc)">
                  <div class="content-block__cta">
                    <h4 class="content-block__cta-heading">
                      Je boekt {{ store.travelGroup.rooms }} {{ store.travelGroup.rooms === 1 ? 'kamer' : 'kamers' }} voor {{ store.totalPersons }} {{ store.totalPersons === 1 ? 'persoon' : 'personen' }}
                    </h4>
                    <button type="button" class="content-block__cta-action" @click="store.openTravelGroupModal()">
                      Wijzig aantal kamers of personen
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </div>
                  <div v-if="!hasUpgradeInclusion" class="content-block__cta">
                    <template v-if="!dateSelected">
                      <h4 class="content-block__cta-heading">Nog meer luxe?</h4>
                      <p class="content-block__cta-text">Voer hiernaast je aankomstdatum in om beschikbare kamerupgrades te zien.</p>
                    </template>
                    <template v-else-if="!paidUpgradeSelected">
                      <h4 class="content-block__cta-heading">Nog meer luxe?</h4>
                      <button type="button" class="content-block__cta-action" @click="isUpgradePanelOpen = true">
                        Bekijk beschikbare kamerupgrades
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    </template>
                    <template v-else>
                      <h4 class="content-block__cta-heading">U heeft een betaalde kamerupgrade</h4>
                      <button type="button" class="content-block__cta-action" @click="isUpgradePanelOpen = true">
                        Selecteer andere kamer
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    </template>
                  </div>
                </template>
              </div>
            </div>
          </section>

          <!-- Facilities (mobile only here; desktop renders full-width below) -->
          <button v-if="isMobile" type="button" class="deal-page__mobile-row" @click="activeMobileSection = 'facilities'">
            <div class="deal-page__mobile-row-text">
              <span class="deal-page__mobile-row-title">{{ t('hotel.facilities') }}</span>
              <span class="deal-page__mobile-row-meta">{{ hotel.facilities.length }} {{ t('common.facilities') || 'faciliteiten' }}</span>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>

          <!-- Mobile reviews mini: score bar + slider of 5 + more button (desktop renders full-width below) -->
          <section v-if="isMobile" class="deal-page__mobile-reviews">
            <div class="deal-page__mobile-reviews-head">
              <h2 class="section-title">{{ t('hotel.reviews') }}</h2>
              <div class="reviews__score-bar reviews__score-bar--compact">
                <span class="reviews__score-big">{{ hotel.reviews.overallScore.toFixed(1) }}</span>
                <div class="reviews__score-meta">
                  <span class="reviews__score-verdict">{{ t(getReviewLabelKey(hotel.reviews.overallScore)) }}</span>
                  <span class="reviews__score-count">{{ hotel.reviews.totalReviews }} {{ t('common.reviews') }}</span>
                </div>
              </div>
            </div>
            <div class="deal-page__mobile-reviews-slider">
              <div v-for="rev in hotel.individualReviews.slice(0, 5)" :key="rev.id" class="review-card review-card--mobile">
                <div class="review-card__header">
                  <span class="review-card__author">{{ rev.author }}</span>
                  <span class="review-card__review-score">{{ Number(rev.score).toFixed(1) }}/10</span>
                </div>
                <p class="review-card__text">{{ localized(rev.text) }}</p>
              </div>
            </div>
            <button type="button" class="deal-page__mobile-more" @click="activeMobileSection = 'reviews'">
              {{ t('deal.allReviews') }}
            </button>
          </section>

          <!-- FAQ (mobile here; desktop renders full-width below) -->
          <section v-if="isMobile" class="deal-page__mobile-faq">
            <h2 class="section-title">{{ t('hotel.faq') || t('hotel.faqHeading') || 'Veelgestelde vragen' }}</h2>
            <NorthstarFaqSection :faq-items="hotel.faq.slice(0, 3)" />
            <button type="button" class="deal-page__mobile-more" @click="activeMobileSection = 'faq'">
              {{ t('deal.moreQuestions') }}
            </button>
          </section>

          <!-- Mobile calendar (last content section) -->
          <section v-if="isMobile" class="deal-page__mobile-calendar">
            <h2 class="section-title">{{ t('calendar.chooseArrivalDate') }}</h2>
            <NorthstarCalendarMonth
              :year="calMonth.year" :month="calMonth.month"
              :availability="calAvailability"
              :selected-check-in="store.checkInDate" :selected-check-out="store.checkOutDate"
              :cheapest-price="calCheapestPrice"
              :show-prev-button="true" :show-next-button="true"
              :show-legend="true"
              @select-date="handleDateSelect" @prev-month="calPrev" @next-month="calNext"
            />
          </section>
        </div>

        <!-- Right column wrapper: sidebar card + Yvette banner stacked -->
        <div v-if="!isMobile" class="deal-page__col-right-stack">
        <div class="deal-page__col-right">
          <!-- Inclusions -->
          <h3 class="sidebar__title">
            {{ t('sidebar.arrangementFor') }}
            <button
              type="button"
              class="sidebar__title-link"
              @click="store.openTravelGroupModal()"
            >{{ store.totalPersons }} {{ store.totalPersons === 1 ? t('common.personSingular') : t('common.personPlural') }}</button>
          </h3>
          <ul class="sidebar__inc-list">
            <li v-for="inc in currentDeal.inclusions" :key="inc.id">
              <span class="sidebar__inc-check">✓</span>
              <span>{{ localized(inc.title) }}</span>
            </li>
          </ul>

          <!-- Variant CTA -->
          <div class="sidebar__variant-cta">
            <h4 class="sidebar__variant-heading">{{ t('deal.shorterOrLonger') }}</h4>
            <button class="sidebar__variant-btn" @click="isPanelOpen = true">
              {{ t('deal.viewOptions') }}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <!-- Calendar -->
          <div class="sidebar__calendar" ref="calendarRef">
            <h4 class="sidebar__cal-title">{{ t('calendar.chooseArrivalDate') }}</h4>
            <NorthstarCalendarMonth
              :year="calMonth.year" :month="calMonth.month"
              :availability="calAvailability"
              :selected-check-in="store.checkInDate" :selected-check-out="store.checkOutDate"
              :cheapest-price="calCheapestPrice"
              :show-prev-button="true" :show-next-button="true"
              :show-legend="true"
              @select-date="handleDateSelect" @prev-month="calPrev" @next-month="calNext"
            />
          </div>

          <!-- Before date selection: disabled button -->
          <button v-if="!store.checkInDate" class="btn btn-primary sidebar__book" disabled>{{ t('deal.bookNow') }}</button>

          <!-- After date selection: price summary + active button -->
          <div v-if="store.checkInDate" class="sidebar__summary">
            <div class="sidebar__dates">
              <div class="sidebar__date">
                <span class="sidebar__date-label">Check-in</span>
                <span class="sidebar__date-val">{{ store.formattedCheckIn }}</span>
              </div>
              <span class="sidebar__date-arrow">→</span>
              <div class="sidebar__date">
                <span class="sidebar__date-label">Check-out</span>
                <span class="sidebar__date-val">{{ store.formattedCheckOut }}</span>
              </div>
              <button class="sidebar__date-clear" @click="store.clearDates()">{{ t('calendar.clearDates') }}</button>
            </div>

            <!-- Price breakdown -->
            <div v-if="store.pricing.breakdown.length > 1" class="sidebar__breakdown">
              <div v-for="(item, idx) in store.pricing.breakdown" :key="idx" class="sidebar__breakdown-row" :class="{ 'sidebar__breakdown-row--upgrade': item.amount > 0 && idx > 0, 'sidebar__breakdown-row--discount': item.amount < 0 }">
                <span>{{ item.label }}</span>
                <span>{{ item.amount < 0 ? '- ' : '' }}{{ formatPrice(Math.abs(item.amount)) }}</span>
              </div>
            </div>

            <div class="sidebar__price">
              <span class="sidebar__discount">-{{ currentDeal.discountPercentage }}%</span>
              <span class="sidebar__amount">{{ formatPrice(store.pricing.totalPrice) }}</span>
              <span class="sidebar__original">{{ formatPrice(store.pricing.originalPrice) }}</span>
            </div>
            <p class="sidebar__price-meta">{{ priceForLabel }}</p>

            <p class="sidebar__disclaimer">{{ t('deal.disclaimer') }}</p>

            <button class="btn btn-primary sidebar__book" @click="() => {}">{{ t('deal.bookNow') }}</button>
          </div>

          <!-- Trust USPs + Trustpilot logo -->
          <div class="sidebar__trust">
            <ul class="sidebar__trust-list">
              <li><span class="sidebar__trust-check">✓</span> {{ t('deal.trust2min') }}</li>
              <li><span class="sidebar__trust-check">✓</span> {{ t('deal.trustCancel') }}</li>
              <li><span class="sidebar__trust-check">✓</span> {{ t('deal.trustTrustpilot') }}</li>
            </ul>
            <img src="/images/trustpilot.svg" alt="Trustpilot" class="sidebar__trust-logo" />
          </div>

        </div>

        <!-- Yvette banner — separate block below the booking sidebar -->
        <NorthstarYvetteBanner />
        </div>
      </div>

      <!-- Hotel-level full-width sections (desktop) — facilities / reviews / faq -->
      <section v-if="!isMobile" class="deal-page__facilities container">
        <h2 class="section-title">{{ t('hotel.facilities') }}</h2>
        <div class="facilities__grid">
          <div v-for="fac in hotel.facilities" :key="localized(fac.label)" class="facility-item">
            <img v-if="fac.icon && fac.icon.startsWith('http')" :src="fac.icon" :alt="localized(fac.label)" class="facility-item__icon" width="20" height="20" loading="lazy" />
            <span v-else class="facility-item__check">✓</span>
            <span>{{ localized(fac.label) }}</span>
          </div>
        </div>
      </section>

      <section v-if="!isMobile" id="beoordelingen" class="deal-page__reviews container">
        <h2 class="section-title">{{ t('hotel.reviews') }}</h2>
        <div class="reviews__score-bar">
          <span class="reviews__score-big">{{ hotel.reviews.overallScore.toFixed(1) }}</span>
          <div class="reviews__score-meta">
            <span class="reviews__score-verdict">{{ t(getReviewLabelKey(hotel.reviews.overallScore)) }}</span>
            <span class="reviews__score-count">{{ hotel.reviews.totalReviews }} {{ t('common.reviews') }}</span>
          </div>
        </div>
        <div class="reviews__categories">
          <div v-for="cat in hotel.reviews.categories" :key="localized(cat.name)" class="reviews__cat">
            <span class="reviews__cat-name">{{ localized(cat.name) }}</span>
            <div class="reviews__cat-bar"><div class="reviews__cat-fill" :style="{ width: (cat.score / 10 * 100) + '%' }"></div></div>
            <span class="reviews__cat-score">{{ cat.score.toFixed(1) }}</span>
          </div>
        </div>
        <div class="reviews__grid">
          <div v-for="rev in hotel.individualReviews" :key="rev.id" class="review-card">
            <div class="review-card__header">
              <span class="review-card__author">{{ rev.author }}</span>
              <span class="review-card__review-score">{{ Number(rev.score).toFixed(1) }}/10</span>
            </div>
            <p class="review-card__text">{{ localized(rev.text) }}</p>
            <div v-if="rev.arrangement" class="review-card__arrangement">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 7h-3V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM9 5h6v2H9V5z" />
              </svg>
              <span>{{ t('hotel.bookedAs') }} {{ localized(rev.arrangement) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- House Rules (desktop, full-width) -->
      <section v-if="!isMobile && hotel.houseRules && hotel.houseRules.length" id="huisregels" class="deal-page__house-rules container">
        <div class="house-rules__layout">
          <div class="house-rules__left">
            <h2 class="section-title">{{ t('hotel.houseRules') }}</h2>
            <p class="house-rules__intro">{{ t('deal.houseRulesIntro') }}</p>
          </div>
          <div class="house-rules__right">
            <div
              v-for="rule in hotel.houseRules"
              :key="rule.id"
              class="house-rule"
              :class="{ 'house-rule--open': openRuleId === rule.id }"
            >
              <button class="house-rule__title" @click="toggleRule(rule.id)">
                <span>{{ localized(rule.title) }}</span>
                <span class="house-rule__arrow">{{ openRuleId === rule.id ? '−' : '+' }}</span>
              </button>
              <div v-if="openRuleId === rule.id" class="house-rule__body">
                <p>{{ localized(rule.description) }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-if="!isMobile" id="veelgestelde-vragen" class="deal-page__faq container">
        <div class="faq__layout">
          <div class="faq__left">
            <h2 class="section-title">{{ t('hotel.faqHeading') }}</h2>
          </div>
          <div class="faq__right">
            <div
              v-for="item in hotel.faq"
              :key="item.id"
              class="house-rule"
              :class="{ 'house-rule--open': openFaqId === item.id }"
            >
              <button class="house-rule__title" @click="toggleFaq(item.id)">
                <span>{{ localized(item.question) }}</span>
                <span class="house-rule__arrow">{{ openFaqId === item.id ? '−' : '+' }}</span>
              </button>
              <div v-if="openFaqId === item.id" class="house-rule__body">
                <p>{{ localized(item.answer) }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Tips in de buurt — full-width carousel (desktop only on mobile it's a link row) -->
      <div v-if="!isMobile" id="tips">
        <NorthstarHotelNearbyTips :tips="hotel.nearbyTips" :hotel-name="hotel.name" />
      </div>
      <button v-else type="button" class="deal-page__mobile-row deal-page__mobile-row--standalone container" @click="activeMobileSection = 'tips'">
        <div class="deal-page__mobile-row-text">
          <span class="deal-page__mobile-row-title">{{ t('hotel.nearbyTips') || t('deal.nearbyTips') || 'Tips in de buurt' }}</span>
          <span class="deal-page__mobile-row-meta">{{ hotel.nearbyTips.length }} {{ t('common.tips') || 'tips' }}</span>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </main>

    <NorthstarTravelGroupModal />
    <NorthstarPackageSidePanel
      :is-open="isPanelOpen" :variants="dealVariants"
      :current-deal-id="currentDeal?.id || ''" :hotel-name="hotel?.name || ''"
      :discount-percentage="currentDeal?.discountPercentage || 0"
      :inclusions-map="inclusionsMap"
      :titles-map="titlesMap"
      @close="isPanelOpen = false" @select="handlePanelSelect"
    />
    <NorthstarRoomUpgradeSidePanel
      v-if="currentDeal"
      :is-open="isUpgradePanelOpen"
      :deal="currentDeal"
      :hotel-name="hotel?.name || ''"
      @close="isUpgradePanelOpen = false"
    />
    <!-- Room unavailable popup -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="store.roomUnavailableMessage" class="room-unavailable-overlay" @click.self="store.cancelRoomUnavailable()">
          <div class="room-unavailable-popup">
            <p class="room-unavailable-popup__text">{{ store.roomUnavailableMessage }}</p>
            <button class="room-unavailable-popup__btn" @click="store.confirmRoomUnavailable()">Oké</button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast notification -->
    <NorthstarToastNotification :message="toastMessage" type="success" />

    <!-- Auth popup -->
    <NorthstarAuthPopup :is-open="isAuthPopupOpen" @close="isAuthPopupOpen = false" @login="handleLogin" />

    <!-- Sticky booking bar — top on desktop (after scroll), bottom on mobile -->
    <div v-if="hotel && currentDeal && (isMobile || ctaBarVisible)" class="deal-page__cta-bar" :class="{ 'deal-page__cta-bar--mobile': isMobile }">
      <div class="deal-page__cta-bar-inner container">
        <!-- Page nav (desktop only) -->
        <nav v-if="!isMobile" class="deal-page__tabs deal-page__tabs--in-bar">
          <a href="#intro" class="deal-page__tab">{{ t('deal.tabIntro') }}</a>
          <a href="#arrangement" class="deal-page__tab">{{ t('deal.tabArrangement') }}</a>
          <a href="#beoordelingen" class="deal-page__tab">{{ t('hotel.tabReviews') }}</a>
          <a v-if="hotel.houseRules && hotel.houseRules.length" href="#huisregels" class="deal-page__tab">{{ t('hotel.tabHouseRules') }}</a>
          <a href="#veelgestelde-vragen" class="deal-page__tab">{{ t('hotel.tabFaq') }}</a>
          <a href="#tips" class="deal-page__tab">{{ t('hotel.tabNearby') }}</a>
        </nav>
        <!-- Right-aligned price + button cluster -->
        <div class="deal-page__cta-bar-cluster">
          <div class="deal-page__cta-bar-price-block">
            <div class="deal-page__cta-bar-price-row">
              <span class="deal-page__cta-bar-discount">-{{ currentDeal.discountPercentage }}%</span>
              <span class="deal-page__cta-bar-original">{{ formatPrice(store.pricing.originalPrice) }}</span>
              <span class="deal-page__cta-bar-amount">{{ formatPrice(store.pricing.totalPrice) }}</span>
            </div>
            <span class="deal-page__cta-bar-meta">{{ priceForLabel }}</span>
          </div>
          <button type="button" class="deal-page__cta-bar-btn" @click="handleMobileBook">
            {{ t('deal.bookNow') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile subpage modals -->
    <NorthstarMobileFullscreen :open="activeMobileSection === 'facilities'" :title="t('hotel.facilities')" @close="activeMobileSection = null">
      <div class="mobile-subpage">
        <div class="facilities__grid facilities__grid--mobile">
          <div v-for="fac in hotel?.facilities || []" :key="localized(fac.label)" class="facility-item">
            <img v-if="fac.icon && fac.icon.startsWith('http')" :src="fac.icon" :alt="localized(fac.label)" class="facility-item__icon" width="20" height="20" loading="lazy" />
            <span v-else class="facility-item__check">✓</span>
            <span>{{ localized(fac.label) }}</span>
          </div>
        </div>
      </div>
    </NorthstarMobileFullscreen>

    <NorthstarMobileFullscreen :open="activeMobileSection === 'reviews'" :title="t('hotel.reviews')" @close="activeMobileSection = null">
      <div v-if="hotel" class="mobile-subpage">
        <div class="reviews__score-bar">
          <span class="reviews__score-big">{{ hotel.reviews.overallScore.toFixed(1) }}</span>
          <div class="reviews__score-meta">
            <span class="reviews__score-verdict">{{ t(getReviewLabelKey(hotel.reviews.overallScore)) }}</span>
            <span class="reviews__score-count">{{ hotel.reviews.totalReviews }} {{ t('common.reviews') }}</span>
          </div>
        </div>
        <div class="reviews__categories">
          <div v-for="cat in hotel.reviews.categories" :key="localized(cat.name)" class="reviews__cat">
            <span class="reviews__cat-name">{{ localized(cat.name) }}</span>
            <div class="reviews__cat-bar"><div class="reviews__cat-fill" :style="{ width: (cat.score / 10 * 100) + '%' }"></div></div>
            <span class="reviews__cat-score">{{ cat.score.toFixed(1) }}</span>
          </div>
        </div>
        <div class="reviews__grid reviews__grid--mobile">
          <div v-for="rev in hotel.individualReviews" :key="rev.id" class="review-card">
            <div class="review-card__header">
              <span class="review-card__author">{{ rev.author }}</span>
              <span class="review-card__review-score">{{ Number(rev.score).toFixed(1) }}/10</span>
            </div>
            <p class="review-card__text">{{ localized(rev.text) }}</p>
          </div>
        </div>
      </div>
    </NorthstarMobileFullscreen>

    <NorthstarMobileFullscreen :open="activeMobileSection === 'tips'" :title="t('hotel.nearbyTips') || 'Tips in de buurt'" @close="activeMobileSection = null">
      <div v-if="hotel" class="mobile-subpage mobile-subpage--no-padding">
        <NorthstarHotelNearbyTips :tips="hotel.nearbyTips" :hotel-name="hotel.name" />
      </div>
    </NorthstarMobileFullscreen>

    <NorthstarMobileFullscreen :open="activeMobileSection === 'faq'" :title="t('hotel.faq') || 'Veelgestelde vragen'" @close="activeMobileSection = null">
      <div v-if="hotel" class="mobile-subpage">
        <NorthstarFaqSection :faq-items="hotel.faq" />
      </div>
    </NorthstarMobileFullscreen>

    <!-- Full description popup -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="descriptionOpen && hotel" class="desc-modal" @click.self="descriptionOpen = false">
          <div class="desc-modal__card">
            <button type="button" class="desc-modal__close" @click="descriptionOpen = false" :aria-label="t('common.close')">×</button>
            <h2 class="desc-modal__title">{{ hotel.name }}</h2>
            <div class="desc-modal__body" v-html="fullDescription"></div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <NorthstarSiteFooter />
  </div>
</template>

<script setup lang="ts">
import { useNorthstarDealStore } from '~/stores-northstar/deal'
import { formatPrice } from '~/utils-northstar/formatPrice'
import { getReviewLabelKey } from '~/utils-northstar/reviewLabel'
import { generateDealAvailability } from '~/data/mock/deal-pricing'
import { matchIcon } from '~/utils-northstar/iconMatcher'
import { nightsLabel, personsLabel, roomsLabel } from '~/utils-northstar/plural'
import {
  mappedPackagesByPermalink,
  mappedHotelsByPackagePermalink,
  dealVariantsByPermalink,
  dealsMapByPermalink,
  defaultDealPermalink,
  curatedHighlightsByPermalink,
} from '~/data/deals-mapper'

const { t, localized, locale } = useNorthstarI18n()
const lang = computed<'nl' | 'en'>(() => (locale.value === 'en' ? 'en' : 'nl'))

/** Reisduur the user picked on /search (persisted via sessionStorage in
 *  useNorthstarSearchState). Shown in the deal-page meta line so the choice is
 *  visible after navigating in from the search results. Returns null when
 *  no reisduur was selected (don't show anything). */
const { selectedNights } = useNorthstarSearchState()
const chosenReisduurLabel = computed(() => {
  const ns = selectedNights.value
  if (!ns || ns.length === 0) return null
  const parts = ns.map(n => n === '5+' ? '5+' : n)
  // "1, 2 of 3 nachten" / "1 nacht" / "5+ nachten"
  let head: string
  if (parts.length === 1) head = parts[0]
  else head = `${parts.slice(0, -1).join(', ')} of ${parts[parts.length - 1]}`
  const onlyOne = parts.length === 1 && parts[0] === '1'
  return `${head} ${onlyOne ? 'nacht' : 'nachten'}`
})

/** Plural-aware "Voor X nacht(en), Y persoon/personen" used both under the
 *  calendar (sidebar) and in the sticky CTA bar. */
const priceForLabel = computed(() => {
  const deal = currentDeal.value
  if (!deal) return ''
  return t('deal.priceFor')
    .replace('{nightsLabel}', nightsLabel(deal.nights, lang.value))
    .replace('{personsLabel}', personsLabel(store.totalPersons, lang.value))
    .replace('{roomsLabel}', roomsLabel(store.travelGroup.rooms, lang.value))
})

// Mobile detection + active sub-modal
const isMobile = useNorthstarIsMobile()
const activeMobileSection = ref<'facilities' | 'reviews' | 'tips' | 'faq' | null>(null)

// Sticky CTA bar visibility on desktop — only show after scrolling past the nav
const ctaBarVisible = ref(false)
function handleScroll() {
  ctaBarVisible.value = window.scrollY > 200
}
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
const route = useRoute()
const router = useRouter()
const store = useNorthstarDealStore()
const calendarRef = ref<HTMLElement | null>(null)
const isFavorited = ref(false)
const descriptionOpen = ref(false)
const openRuleId = ref<string | null>(null)
function toggleRule(id: string) {
  openRuleId.value = openRuleId.value === id ? null : id
}
const openFaqId = ref<string | null>(null)
function toggleFaq(id: string) {
  openFaqId.value = openFaqId.value === id ? null : id
}
const fullDescription = computed(() => hotel.value ? localized(hotel.value.description) : '')
const firstParagraph = computed(() => {
  const html = fullDescription.value
  if (!html) return ''
  const m = html.match(/<p[^>]*>[\s\S]*?<\/p>/i)
  return m ? m[0] : html.split(/\n\n+/)[0]
})
const hasMoreDescription = computed(() => fullDescription.value.length > firstParagraph.value.length + 4)
const savingsAmount = computed(() => {
  if (!currentDeal.value) return 0
  return Math.max(0, Math.round(currentDeal.value.originalPrice - currentDeal.value.basePrice))
})

// Watch for search bar changes → fake refresh
const { searchVersion } = useNorthstarSearchState()
const isRefreshing = ref(false)
watch(searchVersion, () => {
  isRefreshing.value = true
  setTimeout(() => {
    isRefreshing.value = false
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 800)
})
const isLoggedIn = ref(false)
const isPanelOpen = ref(false)
const isUpgradePanelOpen = ref(false)
const isAuthPopupOpen = ref(false)
const toastMessage = ref('')

function handleFavoriteClick() {
  if (!isLoggedIn.value) {
    isAuthPopupOpen.value = true
    return
  }
  isFavorited.value = !isFavorited.value
  // Reset toast to re-trigger the watcher
  toastMessage.value = ''
  nextTick(() => {
    toastMessage.value = isFavorited.value
      ? t('toast.addedToFavorites')
      : t('toast.removedFromFavorites')
  })
}

function handleMobileBook() {
  // Scroll to top of page / open booking flow (same as sidebar book button)
  // For now: no-op, mirrors desktop Boek nu behavior
}

function handleLogin() {
  isLoggedIn.value = true
  isAuthPopupOpen.value = false
  // Auto-favorite after login
  isFavorited.value = true
  toastMessage.value = ''
  nextTick(() => {
    toastMessage.value = t('toast.addedToFavorites')
  })
}

// Resolve permalink from route — fallback to first available if invalid
const routeSlug = computed(() => (route.params.slug as string) || defaultDealPermalink)
const initialDeal = mappedPackagesByPermalink[routeSlug.value] || mappedPackagesByPermalink[defaultDealPermalink]
const initialHotel = mappedHotelsByPackagePermalink[routeSlug.value] || mappedHotelsByPackagePermalink[defaultDealPermalink]

/** Show the NU.shop co-branding block in the anchor-tab row only when the
 *  user-test partner flag is active AND the deal belongs to Hotel Des Indes
 *  (the only hotel currently in the user-test partner flow). */
const { partner } = useNorthstarPartner()
const showPartnerLogo = computed(
  () => partner.value === 'nu' && initialHotel?.slug === 'hotel-des-indes',
)

const hotel = ref(initialHotel)
const currentDeal = computed(() => store.currentDeal)
const filteredInclusions = computed(() => {
  if (!currentDeal.value) return []
  return currentDeal.value.inclusions
})

// Detect the overnight + kamerupgrade inclusion blocks by their (NL) title.
const OVERNIGHT_RE = /\bovernachting\b/i
const UPGRADE_RE = /(kamerupgrade|upgrade\s+naar)/i

function inclusionTitle(inc: { title: { nl: string; en: string } }): string {
  return localized(inc.title)
}
function isOvernightInclusion(inc: { title: { nl: string; en: string } }): boolean {
  return OVERNIGHT_RE.test(inclusionTitle(inc))
}
function isUpgradeInclusion(inc: { title: { nl: string; en: string } }): boolean {
  return UPGRADE_RE.test(inclusionTitle(inc))
}
const hasUpgradeInclusion = computed(() =>
  filteredInclusions.value.some(inc => isUpgradeInclusion(inc)),
)

// Reactive state for the overnight CTA branch + synthetic upgrade block injection
const dateSelected = computed(() => !!store.checkInDate)
const paidUpgradeSelected = computed(() => (store.selectedRoom?.priceExtra ?? 0) > 0)

/** filteredInclusions plus a synthetic kamerupgrade block when the user
 *  picked a paid upgrade via RoomUpgradeSidePanel (only when the deal
 *  doesn't already ship one). The synthetic block reuses the same
 *  content-block markup + UPGRADE sticker via isUpgradeInclusion(). */
const displayedInclusions = computed(() => {
  const list = [...filteredInclusions.value]
  if (paidUpgradeSelected.value && !hasUpgradeInclusion.value && store.selectedRoom) {
    const r = store.selectedRoom
    const synthetic = {
      id: 'synthetic-upgrade',
      icon: '',
      title: { nl: `Kamerupgrade naar ${localized(r.name)}`, en: `Room upgrade: ${localized(r.name)}` },
      description: r.upgradeDescription ?? r.description,
      image: r.image,
      highlight: false,
    }
    const idx = list.findIndex(isOvernightInclusion)
    if (idx !== -1) list.splice(idx + 1, 0, synthetic)
    else list.unshift(synthetic)
  }
  return list
})

/** Room allocation entries for rendering separate room cards */
const roomAllocationEntries = computed(() => {
  if (!store.isRoomAllocationActive) {
    const room = store.selectedRoom ?? currentDeal.value?.baseRoomType
    if (!room) return []
    return [{ room, count: store.travelGroup.rooms }]
  }
  const entries: { room: any; count: number }[] = []
  for (const [roomId, count] of Object.entries(store.effectiveAllocation)) {
    if (count <= 0) continue
    const room = store.allRoomTypes.find(r => r.id === roomId)
    if (room) entries.push({ room, count })
  }
  return entries
})
const dealVariants = dealVariantsByPermalink[routeSlug.value] || []
const dealsMap = dealsMapByPermalink[routeSlug.value] || {}

store.initializeDeal(initialDeal, dealVariants)

const query = route.query as Record<string, string>
if (Object.keys(query).length > 0) {
  store.applyFromQuery(query, dealsMap)
}

watch(() => store.queryParams, (params) => { router.replace({ query: params }) }, { deep: true })

// Calendar
/** When a global arrival date is set, open the calendar on that month so the
 *  selected day is immediately visible. Otherwise default to the current
 *  month. */
const calMonth = ref(
  store.checkInDate
    ? { year: Number(store.checkInDate.slice(0, 4)), month: Number(store.checkInDate.slice(5, 7)) }
    : { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
)
// Keep the calendar following the global arrival date if it changes while
// the deal page is open (e.g. user picks a date in the navbar popup).
watch(() => store.checkInDate, (val) => {
  if (val) {
    const y = Number(val.slice(0, 4))
    const m = Number(val.slice(5, 7))
    if (y !== calMonth.value.year || m !== calMonth.value.month) {
      calMonth.value = { year: y, month: m }
    }
  }
})
const calAvailability = computed(() => {
  if (!store.currentDeal) return []
  return generateDealAvailability(calMonth.value.year, calMonth.value.month, store.currentDeal, store.totalPersons)
})
const calCheapestPrice = computed(() => {
  const prices = calAvailability.value.filter(a => a.available && a.totalPrice > 0).map(a => a.totalPrice)
  return prices.length > 0 ? Math.min(...prices) : null
})
function calPrev() { let m = calMonth.value.month - 1, y = calMonth.value.year; if (m < 1) { m = 12; y-- }; calMonth.value = { year: y, month: m } }
function calNext() { let m = calMonth.value.month + 1, y = calMonth.value.year; if (m > 12) { m = 1; y++ }; calMonth.value = { year: y, month: m } }
function handleDateSelect(date: string) { store.setCheckIn(date) }

// Room allocation helpers
const allocatedCount = computed(() => {
  return Object.values(store.effectiveAllocation).reduce((s, n) => s + n, 0)
})

function incrementRoom(roomId: string) {
  const current = store.effectiveAllocation[roomId] || 0
  const roomType = store.allRoomTypes.find(r => r.id === roomId)
  const max = roomType?.maxAvailable ?? 5
  if (current >= max || allocatedCount.value >= store.travelGroup.rooms) return
  store.setRoomAllocationCount(roomId, current + 1)
}

function decrementRoom(roomId: string) {
  const current = store.effectiveAllocation[roomId] || 0
  if (current <= 0) return
  store.setRoomAllocationCount(roomId, current - 1)
}

function handlePanelSelect(dealId: string) {
  const deal = dealsMap[dealId]
  if (deal) { store.switchDeal(deal); isPanelOpen.value = false }
}

// Static map tile URL (OpenStreetMap)
const mapTileUrl = computed(() => {
  const { lat, lng } = hotel.value.location.coordinates
  const zoom = 13
  const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom))
  const latRad = (lat * Math.PI) / 180
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * Math.pow(2, zoom))
  return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`
})

// Highlights are derived from the package's CURATED short list (`pkg.includes[]`,
// 4-6 items), with a matching icon or emoji fallback. Drops overnight items.
const highlights = computed(() => {
  const titles = (curatedHighlightsByPermalink[routeSlug.value] || [])
    .map(t => localized(t).trim())
    .filter(Boolean)
    .filter(t => !/overnachting|night/i.test(t))
  const seen = new Set<string>()
  const out: { icon: string | null; emoji: string; text: string }[] = []
  for (const text of titles) {
    const key = text.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    const m = matchIcon(text)
    out.push({ icon: m.iconUrl, emoji: m.emoji, text })
    if (out.length >= 6) break
  }
  return out
})

// Old static highlights (unused — kept commented for reference)
const _legacyHighlights = computed(() => [
  { icon: '/icons/highlights/castle.svg', text: t('deal.highlight.castle') },
  { icon: '/icons/highlights/restaurant.svg', text: t('deal.highlight.restaurant') },
  { icon: '/icons/highlights/spa.svg', text: t('deal.highlight.wellness') },
  { icon: '/icons/highlights/nature.svg', text: t('deal.highlight.estate') },
  { icon: '/icons/highlights/bike.svg', text: t('deal.highlight.cycling') },
  { icon: '/icons/highlights/special.svg', text: t('deal.highlight.exclusive') },
])

// Build maps from the deal variants (sibling packages) for quick lookup
const inclusionsMap = computed(() => {
  const out: Record<string, string[]> = {}
  for (const id in dealsMap) {
    const d = dealsMap[id]
    if (d) out[id] = d.inclusions.map(i => localized(i.title))
  }
  return out
})

const titlesMap = computed(() => {
  const out: Record<string, string> = {}
  for (const id in dealsMap) {
    const d = dealsMap[id]
    if (d) out[id] = localized(d.title)
  }
  return out
})

useHead({ title: `${currentDeal.value?.title ? localized(currentDeal.value.title) : 'Deal'} | ViaLuxury` })

const breadcrumbs = computed(() => [
  { label: t('search.home'), href: '/' },
  { label: t('search.arrangements'), href: '/search' },
  { label: currentDeal.value ? localized(currentDeal.value.title) : hotel.value.name },
])

function openGallery() { }
</script>

<style scoped>
/* ===== TITLE (above gallery) ===== */
.deal-page__title-section {
  padding-top: var(--space-lg); padding-bottom: var(--space-md);
  position: relative;
}
.deal-page__title-left { min-width: 0; position: relative; }
.deal-page__package-title { font-size: 26px; font-weight: 700; line-height: 1.3; margin-bottom: 4px; position: relative; z-index: 1; }

/* Hotel name with stars adjacent on the right */
.deal-page__hotel-name-wrap {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: var(--space-sm);
}
.deal-page__stars-adjacent {
  display: inline-flex;
  align-items: center;
  gap: 1px;
}
.deal-page__stars-adjacent .star-adj {
  font-size: 24px;
  line-height: 1;
  color: #111111;
  -webkit-font-smoothing: none;
  text-rendering: geometricPrecision;
}
.deal-page__hotel-subtitle {
  font-size: 17px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0;
}
.deal-page__hotel-link { color: inherit; text-decoration: none; }
.deal-page__hotel-link:hover .deal-page__hotel-subtitle { text-decoration: underline; text-underline-offset: 2px; }
.deal-page__meta { display: flex; align-items: center; gap: var(--space-sm); font-size: 14px; color: var(--color-text-secondary); padding-right: 110px; }
.deal-page__score-wrap { display: flex; align-items: center; gap: 6px; }
.deal-page__score { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: var(--radius-sm); background: #00B67A; color: #fff; font-size: 13px; font-weight: 700; flex-shrink: 0; }
.deal-page__score-label { font-size: 13px; font-weight: 600; color: var(--color-text-primary); }
.deal-page__divider { color: var(--color-text-muted); }
.deal-page__title-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-shrink: 0;
  position: absolute;
  right: var(--space-lg);
  bottom: var(--space-md);
}
.deal-page__savings-badge {
  display: inline-flex;
  align-items: center;
  height: 40px;
  padding: 5px;
  background: #70BEB2;
  color: #fff;
  font-family: 'ResotYc', var(--font-heading);
  font-weight: 400;
  font-size: 22px;
  letter-spacing: 0.01em;
  border-radius: 6px;
  white-space: nowrap;
}

/* Gallery wrapper hosts an absolutely-positioned savings badge in the
   bottom-left corner of the hero gallery. */
.deal-page__gallery { position: relative; }

.deal-page__savings-badge--gallery {
  position: absolute;
  left: calc(var(--space-lg) + 16px);
  bottom: 16px;
  z-index: 3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}
.icon-action { width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--color-border); display: flex; align-items: center; justify-content: center; font-size: 18px; background: var(--color-surface); cursor: pointer; }
.icon-action:hover { border-color: var(--color-primary); }
.icon-action--favorited { color: #e74c3c; border-color: #e74c3c; }
.deal-page__breadcrumbs { padding-top: var(--space-md); }

/* ===== 2-COLUMN GRID ===== */
.deal-page__grid { display: grid; grid-template-columns: 1fr 340px; gap: var(--space-xl); padding-top: var(--space-lg); align-items: start; }
.deal-page__col-left { min-width: 0; }
.deal-page__description { font-size: 15px; line-height: 1.75; color: var(--color-text-secondary); }
.deal-page__read-more {
  display: inline-block;
  margin-top: var(--space-xs);
  padding: 0;
  background: none;
  border: none;
  color: var(--color-primary);
  font: inherit;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}
.deal-page__read-more:hover { opacity: 0.8; }

/* Full description modal */
.desc-modal {
  position: fixed; inset: 0; z-index: 1100;
  background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  padding: var(--space-lg);
}
.desc-modal__card {
  position: relative;
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  width: 100%;
  max-width: 720px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}
.desc-modal__close {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface, #fff);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.desc-modal__close:hover { border-color: var(--color-primary); }
.desc-modal__title {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 var(--space-md);
  padding-right: 48px;
  color: var(--color-text-primary);
}
.desc-modal__body { font-size: 15px; line-height: 1.75; color: var(--color-text-secondary); }
.desc-modal__body :deep(p) { margin: 0 0 var(--space-md); }
.fade-enter-active, .fade-leave-active { transition: opacity 180ms ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Intro row: description + mini map side by side */
.deal-page__intro { display: grid; grid-template-columns: 1fr 220px; gap: var(--space-xl); margin-bottom: var(--space-xl); align-items: start; }

/* Mini map */
.mini-map { border-radius: var(--radius-lg); overflow: hidden; aspect-ratio: 1 / 1; }
.mini-map__placeholder { position: relative; width: 100%; height: 100%; border-radius: var(--radius-lg); overflow: hidden; }
.mini-map__img { width: 100%; height: 100%; object-fit: cover; }
.mini-map__img--map { filter: saturate(0.85) contrast(1.05); }
.mini-map__pin { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -100%); filter: drop-shadow(0 3px 6px rgba(0,0,0,0.25)); z-index: 2; pointer-events: none; }
.mini-map__bottom { position: absolute; bottom: 0; left: 0; right: 0; padding: 10px 14px; background: linear-gradient(transparent, rgba(0,0,0,0.6)); display: flex; align-items: center; justify-content: space-between; z-index: 2; }
.mini-map__label { font-size: 14px; font-weight: 600; color: #fff; }
.mini-map__link { font-size: 13px; color: #fff; text-decoration: underline; text-underline-offset: 2px; opacity: 0.85; }
.mini-map__link:hover { opacity: 1; }

/* ===== SIDEBAR ===== */
.deal-page__col-right-stack { display: flex; flex-direction: column; gap: var(--space-lg); min-width: 0; }
.deal-page__col-right { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-lg); }

/* Inclusions */
.sidebar__title { font-size: 16px; font-weight: 700; line-height: 1.4; margin-bottom: var(--space-md); color: var(--color-text-primary); }
.sidebar__title-link {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: var(--color-primary);
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}
.sidebar__title-link:hover { color: var(--color-primary); }
.sidebar__inc-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: var(--space-lg); padding-bottom: var(--space-lg); border-bottom: 1px solid var(--color-border-light); }
.sidebar__inc-list li { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--color-text-secondary); }
.sidebar__inc-check { color: var(--color-discount); font-weight: 700; flex-shrink: 0; }

/* Variant CTA */
.sidebar__variant-cta { display: flex; flex-direction: column; align-items: flex-start; padding: var(--space-md) var(--space-lg); background: var(--color-background-secondary); border-radius: var(--radius-md); margin-bottom: var(--space-lg); }
.sidebar__variant-heading { font-family: var(--font-body); font-size: 14px; font-weight: 500; color: var(--color-text-primary); margin-bottom: 6px; }
.sidebar__variant-btn { display: inline-flex; align-items: center; gap: 6px; font: inherit; font-size: 14px; font-weight: 600; color: var(--color-primary); background: none; border: none; padding: 0; cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }
.sidebar__variant-btn:hover { opacity: 0.85; }
.sidebar__variant-btn svg { flex-shrink: 0; }

/* Calendar */
.sidebar__calendar { margin-bottom: var(--space-md); }
.sidebar__cal-title { font-family: var(--font-heading); font-size: 16px; font-weight: 700; color: var(--color-text-primary); margin-bottom: var(--space-sm); }

/* Book button */
.sidebar__book { width: 100%; padding: 14px; font-size: 16px; }
.sidebar__book:disabled { opacity: 0.5; cursor: not-allowed; }

/* Summary (after date selection) */
.sidebar__summary { border-top: 1px solid var(--color-border-light); padding-top: var(--space-md); }
.sidebar__dates { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md); }
.sidebar__date { display: flex; flex-direction: column; gap: 1px; }
.sidebar__date-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-text-muted); letter-spacing: 0.3px; }
.sidebar__date-val { font-size: 14px; font-weight: 500; }
.sidebar__date-arrow { color: var(--color-text-muted); margin: 0 var(--space-xs); }
.sidebar__date-clear { margin-left: auto; font-size: 14px; color: var(--color-text-muted); text-decoration: underline; cursor: pointer; background: none; border: none; }
/* Price breakdown */
.sidebar__breakdown { margin-bottom: var(--space-md); display: flex; flex-direction: column; gap: 6px; }
.sidebar__breakdown-row { display: flex; justify-content: space-between; align-items: baseline; font-size: 13px; color: var(--color-text-secondary); }
.sidebar__breakdown-row span:last-child { font-weight: 600; white-space: nowrap; }
.sidebar__breakdown-row--upgrade { color: var(--color-primary); }

.sidebar__price { display: flex; align-items: baseline; gap: 6px; margin-bottom: 2px; }
.sidebar__discount { background: var(--color-discount); color: #fff; font-family: var(--font-heading); font-weight: 700; font-size: 14px; padding: 4px 8px; border-radius: var(--radius-sm); }
.sidebar__amount { font-size: 26px; font-weight: 700; font-family: var(--font-heading); }
.sidebar__original { font-size: 15px; color: var(--color-error); text-decoration: line-through; }
.sidebar__price-meta { font-size: 13px; color: var(--color-text-secondary); margin-bottom: var(--space-md); }
.sidebar__disclaimer { font-size: 12px; line-height: 1.5; color: var(--color-text-muted); margin-bottom: var(--space-md); }
.sidebar__summary .sidebar__book { margin-top: 0; }

/* Trust section below sidebar */
.sidebar__trust {
  margin-top: var(--space-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.sidebar__trust-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: var(--space-lg);
}
.sidebar__trust-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}
.sidebar__trust-check {
  color: #00B67A;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}
.sidebar__trust-logo {
  height: 72px;
}

/* Room allocation */
.sidebar__room-allocation { margin-bottom: var(--space-md); padding: var(--space-md); background: var(--color-background-secondary); border-radius: var(--radius-md); }
.sidebar__room-alloc-header { margin-bottom: var(--space-sm); }
.sidebar__room-alloc-title { font-size: 14px; font-weight: 700; color: var(--color-text-primary); margin-bottom: 2px; }
.sidebar__room-alloc-counter { font-size: 12px; color: var(--color-text-muted); }
.sidebar__room-alloc-row { display: flex; align-items: center; justify-content: space-between; padding: var(--space-sm) 0; border-top: 1px solid var(--color-border-light); }
.sidebar__room-alloc-row:first-of-type { border-top: none; }
.sidebar__room-alloc-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.sidebar__room-alloc-name { font-size: 13px; font-weight: 600; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sidebar__room-alloc-price { font-size: 12px; color: var(--color-primary); font-weight: 600; }
.sidebar__room-alloc-max { font-size: 11px; color: var(--color-text-muted); font-style: italic; }
.sidebar__room-alloc-stepper { display: flex; align-items: center; gap: var(--space-sm); flex-shrink: 0; }
.sidebar__room-alloc-btn { width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--color-border); background: var(--color-surface); font-size: 16px; font-weight: 500; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all var(--transition-fast); color: var(--color-text-primary); line-height: 1; }
.sidebar__room-alloc-btn:hover:not(:disabled) { border-color: var(--color-primary); color: var(--color-primary); }
.sidebar__room-alloc-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.sidebar__room-alloc-val { min-width: 18px; text-align: center; font-size: 14px; font-weight: 600; }

/* ===== SECTION TITLES ===== */
.section-title { font-size: 22px; font-weight: 600; margin-bottom: var(--space-lg); }

/* ===== HIGHLIGHTS ===== */
.deal-page__highlights { padding: var(--space-xl) 0; border-top: 1px solid var(--color-border-light); }
.highlights__grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md) var(--space-xl); }
.highlight-item { display: flex; align-items: center; gap: var(--space-md); }
.highlight-item__icon { width: 40px; height: 40px; border-radius: var(--radius-md); background: #FFFFFF; border: 1px solid #E5E5E5; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.highlight-item__text { font-size: 14px; font-weight: 500; color: var(--color-text-primary); }
.highlight-item__check { font-size: 18px; line-height: 1; font-weight: 700; color: var(--color-discount, #00B67A); }

/* ===== CONTENT BLOCKS ===== */
.deal-page__content-blocks { padding: var(--space-xl) 0; border-top: 1px solid var(--color-border-light); }
.inline-edit-link { display: inline-flex; align-items: center; gap: 3px; padding: 0; border: none; background: none; cursor: pointer; font-size: inherit; font-weight: 700; font-family: inherit; color: var(--color-text-primary); text-decoration: underline; text-decoration-color: var(--color-primary); text-underline-offset: 2px; }
.inline-edit-link:hover { color: var(--color-primary); }
.inline-edit-link svg { color: var(--color-primary); }
.content-blocks__grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xl); }
.content-block { border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--color-border-light); display: flex; flex-direction: column; }
.content-block__image { aspect-ratio: 16/10; overflow: hidden; background: var(--color-background-secondary); position: relative; }
.content-block__image img { width: 100%; height: 100%; object-fit: cover; }
.content-block__body { padding: var(--space-md) var(--space-lg) var(--space-lg); flex: 1; }
.content-block__title { font-size: 16px; font-weight: 600; margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm); }
.content-block__check { color: var(--color-discount); font-weight: 700; }
.content-block__desc { font-size: 14px; line-height: 1.65; color: var(--color-text-secondary); }

/* "UPGRADE" sticker — overlaid top-left on a kamerupgrade block image */
.content-block__upgrade-sticker {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #ECB4CE;
  color: #fff;
  font-family: 'ResotYc', var(--font-heading);
  font-size: 18px;
  font-weight: 400;
  letter-spacing: 0.04em;
  padding: 5px;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

/* Footer CTA blocks under overnight inclusion (reisgezelschap + upgrade-hint) */
.content-block__cta {
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-border-light);
  background: var(--color-background-secondary);
}
.content-block__cta-heading {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}
.content-block__cta-text {
  font-size: 14px;
  line-height: 1.55;
  color: var(--color-text-secondary);
}
.content-block__cta-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.content-block__cta-action:hover { opacity: 0.85; }
.content-block__cta-action svg { flex-shrink: 0; }

/* ===== ANCHOR TABS ===== */
.deal-page__tabs {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding-top: var(--space-md);
  padding-bottom: var(--space-md);
}

/* NU shop co-branding block — right-aligned in the anchor-tab row, only
   visible on the Hotel Des Indes deal page when the partner flag is set. */
.deal-page__partner-block {
  margin-left: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}
.deal-page__partner-caption {
  font-size: 11px;
  color: var(--color-text-muted);
  letter-spacing: 0.02em;
}
.deal-page__partner-logo {
  height: 80px;
  width: auto;
  display: block;
}
/* Inset divider — spans inner content width, not container edge-to-edge */
.deal-page__tabs::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: var(--space-lg);
  right: var(--space-lg);
  height: 1px;
  background: var(--color-border-light);
}
.deal-page__tab {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: none;
  padding-bottom: var(--space-sm);
  border-bottom: 2px solid transparent;
  transition: border-color var(--transition-fast), color var(--transition-fast);
}
/* Anchor scroll offset so the sticky CTA bar doesn't cover section titles */
#intro,
#arrangement,
#beoordelingen,
#huisregels,
#veelgestelde-vragen,
#tips {
  scroll-margin-top: 88px;
}
.deal-page__tab:hover {
  /* Color-only hover — no underline (the 2 px border stays transparent). */
  color: var(--color-primary);
}
/* In-bar variant: drop the section padding/border so it fits inside the slim CTA bar */
.deal-page__tabs--in-bar {
  padding: 0;
  border-bottom: none;
}
/* Suppress the inset bottom-divider pseudo — the CTA bar already has its
   own border-bottom, no need for a second hairline below the tabs. */
.deal-page__tabs--in-bar::after {
  display: none;
}
.deal-page__tabs--in-bar .deal-page__tab {
  padding-bottom: 0;
  border-bottom: none;
}
.deal-page__tabs--in-bar .deal-page__tab:hover {
  border-bottom: none;
  color: var(--color-primary);
}

/* ===== HOUSE RULES ===== */
.deal-page__house-rules { padding: var(--space-xl) var(--space-lg); position: relative; }
.house-rules__layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: var(--space-2xl);
}
.house-rules__left .section-title { margin-bottom: var(--space-sm); }
.house-rules__intro {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}
.house-rules__right { max-width: 700px; }
.house-rule { border-top: 1px solid var(--color-border-light); }
.house-rule:first-child { border-top: none; }
.house-rule:last-child { border-bottom: 1px solid var(--color-border-light); }
.house-rule__title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: var(--space-md) 0;
  font-size: 15px;
  font-weight: 600;
  text-align: left;
  color: var(--color-text-primary);
  background: none;
  border: none;
  cursor: pointer;
}
.house-rule__title:hover { color: var(--color-primary); }
.house-rule__arrow {
  font-size: 20px;
  font-weight: 300;
  flex-shrink: 0;
  margin-left: var(--space-md);
}
.house-rule__body {
  padding-bottom: var(--space-md);
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

/* ===== FACILITIES ===== */
.deal-page__facilities { padding: var(--space-xl) var(--space-lg); position: relative; }
.facilities__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: var(--space-2xl);
  row-gap: var(--space-md);
  margin-top: var(--space-md);
}
.facility-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  font-size: 15px;
  line-height: 1.4;
  color: var(--color-text-primary);
}
.facility-item__check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: var(--color-primary);
  font-weight: 700;
}
.facility-item__icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  object-fit: contain;
}

/* ===== TIPS ===== */

/* ===== REVIEWS ===== */
.deal-page__reviews { padding: var(--space-xl) var(--space-lg); position: relative; }
.reviews__score-bar { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md); }
.reviews__score-big { font-size: 24px; font-weight: 700; font-family: var(--font-heading); background: #00B67A; color: #fff; padding: 8px 12px; border-radius: var(--radius-sm); }
.reviews__score-meta { display: flex; flex-direction: column; gap: 1px; }
.reviews__score-verdict { font-size: 15px; font-weight: 600; color: var(--color-text-primary); }
.reviews__score-count { font-size: 13px; color: var(--color-text-muted); }
.reviews__categories { display: grid; grid-template-columns: 1fr 1fr; gap: 6px var(--space-xl); margin-bottom: var(--space-lg); max-width: 720px; }
.reviews__cat { display: grid; grid-template-columns: 110px 1fr 32px; align-items: center; gap: var(--space-sm); font-size: 13px; }
.reviews__cat-name { color: var(--color-text-secondary); }
.reviews__cat-bar { height: 6px; background: var(--color-border-light); border-radius: 3px; overflow: hidden; }
.reviews__cat-fill { height: 100%; background: #00B67A; border-radius: 3px; }
.reviews__cat-score { font-weight: 600; text-align: right; }
.reviews__grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
.review-card { padding: var(--space-md); background: var(--color-background-secondary); border-radius: var(--radius-md); display: flex; flex-direction: column; }
.review-card__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-sm); }
.review-card__author { font-size: 14px; font-weight: 600; }
.review-card__review-score { font-size: 13px; font-weight: 700; color: var(--color-text-primary); }
.review-card__text { font-size: 13px; line-height: 1.6; color: var(--color-text-secondary); }
.review-card__arrangement {
  margin-top: var(--space-sm);
  padding-top: var(--space-sm);
  border-top: 1px dashed var(--color-border);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
}
.review-card__arrangement svg { color: #00B67A; flex-shrink: 0; }

/* ===== FAQ ===== */
.deal-page__faq { padding: var(--space-xl) var(--space-lg); position: relative; }
.faq__layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: var(--space-2xl);
}
.faq__right { max-width: 700px; }
/* Inset top divider for the lower full-width sections */
.deal-page__facilities::before,
.deal-page__reviews::before,
.deal-page__house-rules::before,
.deal-page__faq::before {
  content: '';
  position: absolute;
  top: 0;
  left: var(--space-lg);
  right: var(--space-lg);
  height: 1px;
  background: var(--color-border-light);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1100px) {
  .deal-page__grid { grid-template-columns: 1fr; }
  .deal-page__col-right { position: static; }
  .deal-page__intro { grid-template-columns: 1fr; }
  .mini-map__placeholder { max-height: 200px; }
  .content-blocks__grid { grid-template-columns: 1fr; }
  .reviews__grid { grid-template-columns: 1fr; }
  .reviews__categories { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .deal-page__package-title { font-size: 22px; }
  .facilities__grid { grid-template-columns: 1fr 1fr; }
}

/* ===== ROOM UNAVAILABLE POPUP ===== */
.room-unavailable-overlay {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); z-index: 1100;
  display: flex; align-items: center; justify-content: center;
}
.room-unavailable-popup {
  background: #fff; border: 2px solid var(--color-discount); border-radius: 12px;
  width: 450px; max-width: 90vw; min-height: 300px;
  padding: var(--space-2xl);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.14);
}
.room-unavailable-popup__text {
  font-size: 16px; line-height: 1.5; color: #1a1a1a;
  margin-bottom: var(--space-xl);
}
.room-unavailable-popup__btn {
  display: inline-block; padding: 12px 40px; border-radius: 8px;
  background: var(--color-discount); color: #fff; font-size: 14px; font-weight: 600;
  border: none; cursor: pointer; transition: background 150ms ease-out;
}
.room-unavailable-popup__btn:hover { background: #009e6a; }
.fade-enter-active, .fade-leave-active { transition: opacity 200ms ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Search refresh overlay */
.deal-page__refresh-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
}

.deal-page__refresh-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: refresh-spin 0.7s linear infinite;
}

@keyframes refresh-spin {
  to { transform: rotate(360deg); }
}

.deal-page__refresh-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.fade-fast-enter-active, .fade-fast-leave-active { transition: opacity 300ms ease; }
.fade-fast-enter-from, .fade-fast-leave-to { opacity: 0; }

/* ==================== */
/* MOBILE DEAL PAGE     */
/* ==================== */
.deal-page__mobile-row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  width: 100%;
  padding: 16px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  margin-top: var(--space-lg);
  margin-bottom: var(--space-md);
  color: var(--color-text-primary);
}
.deal-page__mobile-row:hover {
  border-color: var(--color-primary);
}
.deal-page__mobile-row-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.deal-page__mobile-row-title {
  font-size: 16px;
  font-weight: 600;
}
.deal-page__mobile-row-meta {
  font-size: 13px;
  color: var(--color-text-muted);
}
.deal-page__mobile-row--standalone {
  margin-top: var(--space-xl);
  margin-bottom: var(--space-xl);
}

/* Mobile reviews mini section */
.deal-page__mobile-reviews {
  padding: var(--space-xl) 0;
  border-top: 1px solid var(--color-border-light);
}
.deal-page__mobile-reviews-head {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}
.reviews__score-bar--compact {
  gap: var(--space-sm);
}
.deal-page__mobile-reviews-slider {
  display: flex;
  gap: var(--space-md);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  padding-bottom: var(--space-sm);
  margin: 0 calc(var(--space-md) * -1);
  padding-left: var(--space-md);
  padding-right: var(--space-md);
}
.review-card--mobile {
  flex-shrink: 0;
  width: 280px;
  scroll-snap-align: start;
}

.deal-page__mobile-faq {
  padding: var(--space-xl) 0;
  border-top: 1px solid var(--color-border-light);
}

.deal-page__mobile-more {
  margin-top: var(--space-md);
  padding: 10px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  font-weight: 600;
  color: var(--color-text-primary);
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
}
.deal-page__mobile-more:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* ==================== */
/* STICKY CTA BAR       */
/* Desktop: top         */
/* Mobile: bottom       */
/* ==================== */
.deal-page__cta-bar {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;  /* Desktop default: top */
  z-index: 100;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.deal-page__cta-bar--mobile {
  top: auto;
  bottom: 0;
  border-bottom: none;
  border-top: 1px solid var(--color-border);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
}
.deal-page__cta-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: 10px var(--space-lg);
}
.deal-page__cta-bar-cluster {
  display: flex;
  align-items: center;
  gap: 16px;
}
.deal-page__cta-bar-price-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.deal-page__cta-bar-price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.deal-page__cta-bar-discount {
  flex-shrink: 0;
  align-self: center;
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  background: var(--color-discount);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}
.deal-page__cta-bar-original {
  font-size: 13px;
  color: var(--color-error);
  text-decoration: line-through;
}
.deal-page__cta-bar-amount {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.1;
}
.deal-page__cta-bar-meta {
  font-size: 11px;
  color: var(--color-text-muted);
  white-space: nowrap;
}
.deal-page__cta-bar-btn {
  flex: 0 0 auto;
  width: auto;
  height: 44px;
  padding: 0 24px;
  font-size: 15px;
  font-weight: 600;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: background var(--transition-fast);
}
.deal-page__cta-bar-btn:hover {
  background: var(--color-primary-hover);
}

/* Mobile calendar section */
.deal-page__mobile-calendar {
  padding: var(--space-xl) 0 var(--space-lg);
  border-top: 1px solid var(--color-border-light);
}

.mobile-subpage {
  padding: var(--space-lg);
}
.mobile-subpage--no-padding {
  padding: 0;
}
.facilities__grid--mobile {
  grid-template-columns: 1fr;
  gap: var(--space-sm);
}
.reviews__grid--mobile {
  grid-template-columns: 1fr;
  gap: var(--space-md);
}

@media (max-width: 768px) {
  /* Collapse grid to single column (sidebar is already hidden via v-if) */
  .deal-page__grid {
    grid-template-columns: 1fr;
  }
  /* Reserve space for the bottom-fixed bar */
  .deal-page__main {
    padding-bottom: 96px;
  }
  /* Tighter padding */
  .deal-page__breadcrumbs.container,
  .deal-page__title-section.container,
  .deal-page__grid.container {
    padding-left: 16px;
    padding-right: 16px;
  }
  .deal-page__title-actions { right: 16px; }
}
</style>
