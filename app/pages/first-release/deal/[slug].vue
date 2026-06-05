<template>
  <div class="deal-page">
    <FirstReleaseSiteHeader />

    <!-- Search refresh overlay -->
    <Transition name="fade-fast">
      <div v-if="isRefreshing" class="deal-page__refresh-overlay">
        <div class="deal-page__refresh-spinner"></div>
        <span class="deal-page__refresh-text">{{ t('deal.refreshing') }}</span>
      </div>
    </Transition>

    <main v-if="hotel && currentDeal" class="deal-page__main">
      <!-- ============================================================
           MOBILE BRANCH — content ordered to spec § 1..16
           ============================================================ -->
      <template v-if="isMobile">
        <!-- 2. Breadcrumb -->
        <section class="deal-page__breadcrumbs container">
          <FirstReleaseBreadcrumbNav :items="breadcrumbs" />
        </section>

        <!-- 3. Deal intro: title + hotel + location + "Bekijk op kaart" -->
        <section class="deal-page__title-section deal-page__title-section--mobile container">
          <h1 class="deal-page__package-title">{{ localized(currentDeal.title) }}</h1>
          <div class="deal-page__hotel-name-wrap">
            <NuxtLink :to="`/first-release/hotel/${hotel.slug}`" class="deal-page__hotel-link">
              <span class="deal-page__hotel-subtitle">{{ hotel.name }}</span>
            </NuxtLink>
            <div class="deal-page__stars-adjacent" aria-hidden="true">
              <span v-for="n in hotel.starRating" :key="n" class="star-adj">★</span>
            </div>
          </div>
          <div class="deal-page__meta">
            <svg class="deal-page__meta-pin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{{ hotel.location.city }}, {{ hotel.location.region }}</span>
            <a href="#mini-map" class="deal-page__view-map-link" @click.prevent="scrollToMiniMap">{{ t('common.viewMap') || 'Bekijk op kaart' }}</a>
          </div>
        </section>

        <!-- 5. Photo carousel -->
        <section class="container deal-page__gallery">
          <FirstReleaseHeroGallery
            :images="hotel.images"
            :labels="galleryLabels"
            :rooms-left="dealRoomsLeft"
            @open-gallery="openGallery"
          />
        </section>

        <!-- 6a. Partner co-brand card — only on the advertisement flow.
             Sits as its own row BETWEEN the gallery and the creator
             card on mobile. -->
        <section v-if="showPartnerLogo" class="container deal-page__partner-mobile">
          <div class="deal-page__partner-card deal-page__partner-card--mobile">
            <span class="deal-page__partner-card-caption">In samenwerking met:</span>
            <img src="/images/logos/nushoplogo.svg" alt="NUshop" class="deal-page__partner-card-logo" />
          </div>
        </section>

        <!-- 6b. Samengesteld door — always shown if a creator is set. -->
        <section v-if="creator" class="container deal-page__creator-mobile">
          <FirstReleaseExperienceCreatorCard :creator="creator" />
        </section>

        <!-- 7. Arrangement / sidebar content. Anchor `#arrangement`
             lives on the include-cards section below, not here (so
             "Bekijk details" actually scrolls past this block). -->
        <section class="deal-page__sidebar-mobile container">
          <div class="deal-page__col-right deal-page__col-right--mobile">
            <!-- Inclusions -->
            <h3 class="sidebar__title">{{ t('sidebar.arrangementFullTitle') }}</h3>
            <ul class="sidebar__inc-list">
              <li v-for="inc in currentDeal.inclusions" :key="inc.id">
                <span class="sidebar__inc-check">✓</span>
                <span>{{ localized(inc.title) }}</span>
              </li>
            </ul>
            <!-- Anchor link → scrolls to the full include-cards section. -->
            <a href="#arrangement" class="sidebar__details-link" @click.prevent="scrollToArrangement">
              {{ t('sidebar.viewDetails') }}
            </a>

            <!-- Calendar -->
            <div class="sidebar__calendar">
              <h4 class="sidebar__cal-title sidebar__cal-title--big">{{ t('calendar.chooseArrivalDateLong') }}</h4>
              <p v-if="currentDeal" class="sidebar__nights-line">
                {{ t('deal.thisArrangementIsFor') }} {{ nightsWord(currentDeal.nights, false) }}
              </p>
              <template v-if="hasOtherArrangements">
                <h4 class="sidebar__variant-heading sidebar__variant-heading--v6">{{ t('deal.shorterOrLongerStay') }}</h4>
                <a href="#" class="sidebar__other-arrangements" @click.prevent="arrangementsPanelOpen = true">{{ t('deal.viewOtherArrangements') }}</a>
              </template>
              <FirstReleaseCalendarMonth
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
            <template v-if="!store.checkInDate">
              <button class="btn btn-primary sidebar__book" disabled>{{ t('deal.bookNow') }}</button>
              <FirstReleaseSidebarPaymentLogos />
            </template>

            <!-- After date selection: price summary + active button -->
            <div v-if="store.checkInDate" class="sidebar__summary">
              <div class="sidebar__dates">
                <div class="sidebar__date">
                  <span class="sidebar__date-label">{{ t('calendar.checkInLabel') }}</span>
                  <span class="sidebar__date-val">{{ store.formattedCheckIn }}</span>
                </div>
                <span class="sidebar__date-arrow">→</span>
                <div class="sidebar__date">
                  <span class="sidebar__date-label">{{ t('calendar.checkOutLabel') }}</span>
                  <span class="sidebar__date-val">{{ store.formattedCheckOut }}</span>
                </div>
                <button class="sidebar__date-clear" @click="store.clearDates()">{{ t('calendar.clearDates') }}</button>
              </div>
              <div v-if="store.pricing.breakdown.length > 1" class="sidebar__breakdown">
                <div v-for="(item, idx) in store.pricing.breakdown" :key="idx" class="sidebar__breakdown-row" :class="{ 'sidebar__breakdown-row--upgrade': item.amount > 0 && idx > 0, 'sidebar__breakdown-row--discount': item.amount < 0 }">
                  <span>{{ item.label }}</span>
                  <span>{{ item.amount < 0 ? '- ' : '' }}{{ formatPrice(Math.abs(item.amount)) }}</span>
                </div>
              </div>
              <FirstReleaseStickyPriceRow
                class="sidebar__price-row"
                :lead="`-${currentDeal.discountPercentage}%`"
                :lead-is-chip="true"
                :original="formatPrice(store.pricing.originalPrice)"
                :amount="formatPrice(store.pricing.totalPrice)"
                :show-info="!isGerman"
                info-variant="deal"
              />
              <p class="sidebar__price-meta">{{ priceForLabel }}</p>
              <!-- German: structured extra-costs block replaces the long
                   NL/EN disclaimer. All other locales render the disclaimer. -->
              <div v-if="isGerman" class="sidebar__extra-costs">
                <p class="sidebar__extra-costs-title">{{ t('deal.extraCostsTitle') }}</p>
                <p class="sidebar__extra-costs-line">{{ t('deal.extraCostsKurtaxe') }}</p>
                <p class="sidebar__extra-costs-line">{{ t('deal.extraCostsVerwaltung') }}</p>
              </div>
              <p v-else class="sidebar__disclaimer">{{ t('deal.disclaimer') }}</p>
              <button class="btn btn-primary sidebar__book" @click="() => {}">{{ t('deal.bookNow') }}</button>
              <FirstReleaseSidebarPaymentLogos />
            </div>

            <!-- Trust + Trustpilot -->
            <div class="sidebar__trust">
              <ul class="sidebar__trust-list">
                <li><span class="sidebar__trust-check">✓</span> {{ t('deal.trust2min') }}</li>
                <li><span class="sidebar__trust-check">✓</span> {{ t('deal.trustCancel') }}</li>
                <li><span class="sidebar__trust-check">✓</span> {{ t('deal.trustTrustpilot') }}</li>
              </ul>
              <div class="sidebar__trust-block">
                <img src="/images/trustpilot.svg" alt="Trustpilot" class="sidebar__trust-logo" />
                <span class="sidebar__trust-caption">15.294 beoordelingen</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 8. Description + Lees meer -->
        <section id="intro" class="container deal-page__description-mobile">
          <h2 class="section-title">{{ t('deal.descriptionHeading') }}</h2>
          <div class="deal-page__description">
            <div v-html="firstParagraph"></div>
            <button v-if="hasMoreDescription" type="button" class="deal-page__read-more" @click="descriptionOpen = true">{{ t('common.readMore') }}</button>
          </div>
        </section>

        <!-- 9. Highlights -->
        <section class="container deal-page__highlights deal-page__highlights--mobile">
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

        <!-- 10. Mini map -->
        <section id="mini-map" class="container deal-page__mini-map-mobile">
          <FirstReleaseMiniMapCard
            class="deal-page__minimap"
            :slug="hotel.slug"
            :lat="hotel.location.coordinates.lat"
            :lng="hotel.location.coordinates.lng"
            :address="hotelStreetCity"
          />
        </section>

        <!-- 11. Included cards (repeat full include section). Anchor
             target for the "Bekijk details" link in the sidebar. -->
        <section id="arrangement" class="container deal-page__content-blocks deal-page__content-blocks--mobile">
          <h2 class="section-title">
            {{ t('deal.inclusionsHeading') }}
            <span>2 personen</span>
            {{ t('deal.inclusionsEndAlt') }}
          </h2>
          <div class="content-blocks__grid content-blocks__grid--mobile">
            <div v-for="inc in displayedInclusions" :key="inc.id" class="content-block">
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
            </div>
          </div>
        </section>

        <!-- 12. Hotel facilities — stacked -->
        <section class="container deal-page__facilities deal-page__facilities--mobile">
          <h2 class="section-title">{{ t('hotel.facilities') }}</h2>
          <div class="facilities__grid facilities__grid--mobile">
            <div v-for="fac in hotel.facilities" :key="localized(fac.label)" class="facility-item">
              <img v-if="fac.icon && fac.icon.startsWith('http')" :src="fac.icon" :alt="localized(fac.label)" class="facility-item__icon" width="20" height="20" loading="lazy" />
              <span v-else class="facility-item__check">✓</span>
              <span>{{ localized(fac.label) }}</span>
            </div>
          </div>
        </section>

        <!-- Tips in de buurt — directly below Hotel faciliteiten. -->
        <div id="tips" class="deal-page__nearby-mobile">
          <FirstReleaseHotelNearbyTips :tips="hotel.nearbyTips" :hotel-name="hotel.name" />
        </div>

        <section v-if="hotel.houseRules && hotel.houseRules.length" id="huisregels" class="container deal-page__house-rules deal-page__house-rules--mobile">
          <h2 class="section-title">{{ t('hotel.houseRules') }}</h2>
          <p class="house-rules__intro">{{ t('deal.houseRulesIntro') }}</p>
          <div class="house-rules__right">
            <div v-for="rule in hotel.houseRules" :key="rule.id" class="house-rule" :class="{ 'house-rule--open': openRuleId === rule.id }">
              <button class="house-rule__title" @click="toggleRule(rule.id)">
                <span>{{ localized(rule.title) }}</span>
                <span class="house-rule__arrow">{{ openRuleId === rule.id ? '−' : '+' }}</span>
              </button>
              <div v-if="openRuleId === rule.id" class="house-rule__body">
                <p>{{ localized(rule.description) }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 14. FAQ — heading lives inside FaqSection; the outer
             wrapper used to render its own duplicate <h2>, removed. -->
        <section id="veelgestelde-vragen" class="container deal-page__faq deal-page__faq--mobile">
          <FirstReleaseFaqSection :faq-items="hotel.faq" />
        </section>

        <!-- "Waarom ViaLuxury" (Tips moved up under Hotel faciliteiten). -->
        <FirstReleaseWhyViaLuxury class="deal-page__why-mobile" />

        <!-- 17. Anderen bekeken ook -->
        <FirstReleaseOthersAlsoViewed
          :current-hotel="searchHotelForBadge"
          :current-deal-id="currentDeal?.id || ''"
          class="deal-page__others-mobile"
        />
      </template>

      <!-- ============================================================
           DESKTOP BRANCH — original layout, unchanged
           ============================================================ -->
      <template v-else>
      <!-- Back link + Breadcrumbs -->
      <section class="deal-page__breadcrumbs container">
        <FirstReleaseBreadcrumbNav :items="breadcrumbs" />
      </section>

      <!-- Anchor tabs -->
      <nav class="deal-page__tabs container">
        <a href="#intro" class="deal-page__tab">{{ t('deal.tabIntro') }}</a>
        <a href="#arrangement" class="deal-page__tab">{{ t('deal.tabArrangement') }}</a>
        <a href="#tips" class="deal-page__tab">{{ t('hotel.tabNearby') }}</a>
        <a v-if="hotel && hotel.houseRules && hotel.houseRules.length" href="#huisregels" class="deal-page__tab">{{ t('hotel.tabHouseRules') }}</a>
        <a href="#veelgestelde-vragen" class="deal-page__tab">{{ t('hotel.tabFaq') }}</a>
        <!-- Heart + share live in the anchor-nav row, right-aligned, so
             they sit at the same height as the tabs and above the grey
             divider between this row and the title section. -->
        <div class="deal-page__tabs-actions">
          <div class="deal-page__share-wrap">
            <button class="deal-page__action" :aria-label="t('common.share')" @click.stop="handleShare">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              <span class="deal-page__action-label">Delen</span>
            </button>
            <FirstReleaseShareMenu :open="shareMenuOpen" @close="shareMenuOpen = false" />
          </div>
          <button class="deal-page__action" :class="{ 'deal-page__action--favorited': isFavorited }" :aria-label="t('common.save')" @click="handleFavoriteClick">
            <span class="deal-page__action-heart">{{ isFavorited ? '♥' : '♡' }}</span>
            <span class="deal-page__action-label">Opslaan</span>
          </button>
        </div>
      </nav>

      <!-- Title ABOVE gallery -->
      <section class="deal-page__title-section container">
        <div
          class="deal-page__title-left"
          :class="{ 'deal-page__title-left--with-partner': showPartnerLogo }"
        >
          <h1 class="deal-page__package-title">{{ localized(currentDeal.title) }}</h1>
          <div class="deal-page__hotel-name-wrap">
            <NuxtLink :to="`/first-release/hotel/${hotel.slug}`" class="deal-page__hotel-link">
              <span class="deal-page__hotel-subtitle">{{ hotel.name }}</span>
            </NuxtLink>
            <div class="deal-page__stars-adjacent" aria-hidden="true">
              <span v-for="n in hotel.starRating" :key="n" class="star-adj">★</span>
            </div>
          </div>
          <div class="deal-page__meta">
            <svg class="deal-page__meta-pin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{{ hotel.location.city }}, {{ hotel.location.region }}</span>
            <template v-if="chosenReisduurLabel">
              <span class="deal-page__divider">·</span>
              <span>Reisduur: {{ chosenReisduurLabel }}</span>
            </template>
            <a href="#mini-map" class="deal-page__view-map-link" @click.prevent="scrollToMiniMap">{{ t('common.viewMap') || 'Bekijk op kaart' }}</a>
          </div>
        </div>
        <!-- Right column: Experience Creator business card on every
             deal. When the user arrives via the advertisement flow
             (`?partner=nu` on Hotel des Indes), an extra NuShop
             partner card sits to the LEFT of the creator card. -->
        <div
          class="deal-page__title-right"
          :class="{ 'deal-page__title-right--with-partner': showPartnerLogo }"
        >
          <div v-if="showPartnerLogo" class="deal-page__partner-card">
            <span class="deal-page__partner-card-caption">In samenwerking met:</span>
            <img src="/images/logos/nushoplogo.svg" alt="NUshop" class="deal-page__partner-card-logo" />
          </div>
          <FirstReleaseExperienceCreatorCard :creator="creator" />
        </div>
      </section>

      <!-- Hero Gallery -->
      <section class="container deal-page__gallery">
        <FirstReleaseHeroGallery
          :images="hotel.images"
          :labels="galleryLabels"
          :rooms-left="dealRoomsLeft"
          @open-gallery="openGallery"
        />
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
            <FirstReleaseMiniMapCard
              class="deal-page__minimap"
              :slug="hotel.slug"
              :lat="hotel.location.coordinates.lat"
              :lng="hotel.location.coordinates.lng"
              :address="hotelStreetCity"
            />
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
              <!-- Persons fixed at 2 — plain text, no popup trigger. -->
              <span>2 personen</span>
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
            <FirstReleaseFaqSection :faq-items="hotel.faq.slice(0, 3)" />
            <button type="button" class="deal-page__mobile-more" @click="activeMobileSection = 'faq'">
              {{ t('deal.moreQuestions') }}
            </button>
          </section>

          <!-- Mobile calendar (last content section) -->
          <section v-if="isMobile" class="deal-page__mobile-calendar">
            <h2 class="section-title">{{ t('calendar.chooseArrivalDate') }}</h2>
            <FirstReleaseCalendarMonth
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
            {{ t('sidebar.arrangementFullTitle') }}
          </h3>
          <ul class="sidebar__inc-list">
            <li v-for="inc in currentDeal.inclusions" :key="inc.id">
              <span class="sidebar__inc-check">✓</span>
              <span>{{ localized(inc.title) }}</span>
            </li>
          </ul>
          <!-- Anchor link → scrolls to the full include-cards section. -->
          <a href="#arrangement" class="sidebar__details-link" @click.prevent="scrollToArrangement">
            {{ t('sidebar.viewDetails') }}
          </a>

          <!-- Calendar -->
          <div class="sidebar__calendar" ref="calendarRef">
            <h4 class="sidebar__cal-title sidebar__cal-title--big">{{ t('calendar.chooseArrivalDateLong') }}</h4>
            <p v-if="currentDeal" class="sidebar__nights-line">
              {{ t('deal.thisArrangementIsFor') }} {{ nightsWord(currentDeal.nights, false) }}
            </p>
            <template v-if="hasOtherArrangements">
              <h4 class="sidebar__variant-heading sidebar__variant-heading--v6">{{ t('deal.shorterOrLongerStay') }}</h4>
              <a
                href="#"
                class="sidebar__other-arrangements"
                @click.prevent="arrangementsPanelOpen = true"
              >
                {{ t('deal.viewOtherArrangements') }}
              </a>
            </template>
            <FirstReleaseCalendarMonth
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
          <template v-if="!store.checkInDate">
            <button class="btn btn-primary sidebar__book" disabled>{{ t('deal.bookNow') }}</button>
            <FirstReleaseSidebarPaymentLogos />
          </template>

          <!-- After date selection: price summary + active button -->
          <div v-if="store.checkInDate" class="sidebar__summary">
            <div class="sidebar__dates">
              <div class="sidebar__date">
                <span class="sidebar__date-label">{{ t('calendar.checkInLabel') }}</span>
                <span class="sidebar__date-val">{{ store.formattedCheckIn }}</span>
              </div>
              <span class="sidebar__date-arrow">→</span>
              <div class="sidebar__date">
                <span class="sidebar__date-label">{{ t('calendar.checkOutLabel') }}</span>
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

            <FirstReleaseStickyPriceRow
              class="sidebar__price-row"
              :lead="`-${currentDeal.discountPercentage}%`"
              :lead-is-chip="true"
              :original="formatPrice(store.pricing.originalPrice)"
              :amount="formatPrice(store.pricing.totalPrice)"
              :show-info="!isGerman"
              info-variant="deal"
            />
            <p class="sidebar__price-meta">{{ priceForLabel }}</p>

            <!-- German: structured extra-costs block replaces the long
                 NL/EN disclaimer. All other locales render the disclaimer. -->
            <div v-if="isGerman" class="sidebar__extra-costs">
              <p class="sidebar__extra-costs-title">{{ t('deal.extraCostsTitle') }}</p>
              <p class="sidebar__extra-costs-line">{{ t('deal.extraCostsKurtaxe') }}</p>
              <p class="sidebar__extra-costs-line">{{ t('deal.extraCostsVerwaltung') }}</p>
            </div>
            <p v-else class="sidebar__disclaimer">{{ t('deal.disclaimer') }}</p>

            <button class="btn btn-primary sidebar__book" @click="() => {}">{{ t('deal.bookNow') }}</button>
            <FirstReleaseSidebarPaymentLogos />
          </div>

          <!-- Trust USPs + Trustpilot logo -->
          <div class="sidebar__trust">
            <ul class="sidebar__trust-list">
              <li><span class="sidebar__trust-check">✓</span> {{ t('deal.trust2min') }}</li>
              <li><span class="sidebar__trust-check">✓</span> {{ t('deal.trustCancel') }}</li>
              <li><span class="sidebar__trust-check">✓</span> {{ t('deal.trustTrustpilot') }}</li>
            </ul>
            <!-- Trustpilot block — the "Flexibel annuleren" companion
                 was removed at the user's request; the homepage
                 persuasion band still carries that message. -->
            <div class="sidebar__trust-block">
              <img src="/images/trustpilot.svg" alt="Trustpilot" class="sidebar__trust-logo" />
              <span class="sidebar__trust-caption">15.294 beoordelingen</span>
            </div>
          </div>

        </div>
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

      <!-- Tips in de buurt — directly below Hotel faciliteiten. -->
      <div v-if="!isMobile" id="tips">
        <FirstReleaseHotelNearbyTips :tips="hotel.nearbyTips" :hotel-name="hotel.name" />
      </div>

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

      <!-- "Waarom ViaLuxury" (Tips moved up under Hotel faciliteiten). -->
      <FirstReleaseWhyViaLuxury class="deal-page__why-desktop" />

      <!-- "Anderen bekeken ook" at the bottom of the deal page.
           Fills 3 cards: same hotel first, then nearby. -->
      <FirstReleaseOthersAlsoViewed
        :current-hotel="searchHotelForBadge"
        :current-deal-id="currentDeal?.id || ''"
      />
      </template>
    </main>

    <!-- "Andere arrangementen bij dit hotel" side panel. Reuses the same
         component the /search results page uses, with a custom sticky
         title + filter that hides the current deal. -->
    <FirstReleaseHotelDealsSidePanel
      :is-open="arrangementsPanelOpen"
      :hotel="searchHotelForBadge"
      :panel-title="t('deal.otherArrangements')"
      :current-deal-id="currentDeal?.id || ''"
      @close="arrangementsPanelOpen = false"
    />
    <FirstReleasePackageSidePanel
      :is-open="isPanelOpen" :variants="dealVariants"
      :current-deal-id="currentDeal?.id || ''" :hotel-name="hotel?.name || ''"
      :discount-percentage="currentDeal?.discountPercentage || 0"
      :inclusions-map="inclusionsMap"
      :titles-map="titlesMap"
      @close="isPanelOpen = false" @select="handlePanelSelect"
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
    <FirstReleaseToastNotification :message="toastMessage" type="success" />

    <!-- Auth popup -->

    <!-- Sticky booking bar — TWO SEPARATE BRANCHES.
         MOBILE: bottom sticky footer, gets `ref="ctaBarRef"` so the
                 visualViewport-pin composable can keep it flush
                 with the visible bottom.
         DESKTOP: top sticky header, appears after scrolling past
                  200 px (ctaBarVisible). NO ref, NO composable —
                  pure CSS `position: fixed; top: 0`. Splitting the
                  template guarantees the composable can never
                  write an inline `bottom` on the desktop element
                  (which would stretch it top↔bottom = "white-out").
    -->
    <div
      v-if="hotel && currentDeal && isMobile"
      ref="ctaBarRef"
      class="deal-page__cta-bar deal-page__cta-bar--mobile"
    >
      <div class="deal-page__cta-bar-inner container">
        <div class="deal-page__cta-bar-cluster">
          <div class="deal-page__cta-bar-price-block">
            <FirstReleaseStickyPriceRow
              :lead="dateSelected ? `-${currentDeal.discountPercentage}%` : (isGerman ? t('deal.stickyFromPrefix') : 'Vanaf')"
              :lead-is-chip="dateSelected"
              :original="formatPrice(store.pricing.originalPrice)"
              :amount="formatPrice(store.pricing.totalPrice)"
              :show-info="!isGerman"
              info-variant="deal"
            />
            <span v-if="isGerman" class="deal-page__cta-bar-meta deal-page__cta-bar-meta--de">
              <span>{{ stickyDeLine1 }}</span>
              <span>{{ stickyDeLine2 }}</span>
            </span>
            <span v-else class="deal-page__cta-bar-meta">{{ priceForLabel }}</span>
          </div>
          <button type="button" class="deal-page__cta-bar-btn" @click="handleMobileBook">
            {{ t('deal.bookNow') }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-else-if="hotel && currentDeal && ctaBarVisible"
      class="deal-page__cta-bar"
    >
      <div class="deal-page__cta-bar-inner container">
        <nav class="deal-page__tabs deal-page__tabs--in-bar">
          <a href="#intro" class="deal-page__tab" :class="{ 'deal-page__tab--active': activeAnchor === 'intro' }">{{ t('deal.tabIntro') }}</a>
          <a href="#arrangement" class="deal-page__tab" :class="{ 'deal-page__tab--active': activeAnchor === 'arrangement' }">{{ t('deal.tabArrangement') }}</a>
          <a href="#tips" class="deal-page__tab" :class="{ 'deal-page__tab--active': activeAnchor === 'tips' }">{{ t('hotel.tabNearby') }}</a>
          <a v-if="hotel.houseRules && hotel.houseRules.length" href="#huisregels" class="deal-page__tab" :class="{ 'deal-page__tab--active': activeAnchor === 'huisregels' }">{{ t('hotel.tabHouseRules') }}</a>
          <a href="#veelgestelde-vragen" class="deal-page__tab" :class="{ 'deal-page__tab--active': activeAnchor === 'veelgestelde-vragen' }">{{ t('hotel.tabFaq') }}</a>
        </nav>
        <div class="deal-page__cta-bar-cluster">
          <div class="deal-page__cta-bar-price-block">
            <FirstReleaseStickyPriceRow
              :lead="dateSelected ? `-${currentDeal.discountPercentage}%` : (isGerman ? t('deal.stickyFromPrefix') : 'Vanaf')"
              :lead-is-chip="dateSelected"
              :original="formatPrice(store.pricing.originalPrice)"
              :amount="formatPrice(store.pricing.totalPrice)"
              :show-info="!isGerman"
              info-variant="deal"
            />
            <span v-if="isGerman" class="deal-page__cta-bar-meta deal-page__cta-bar-meta--de">
              <span>{{ stickyDeLine1 }}</span>
              <span>{{ stickyDeLine2 }}</span>
            </span>
            <span v-else class="deal-page__cta-bar-meta">{{ priceForLabel }}</span>
          </div>
          <button type="button" class="deal-page__cta-bar-btn" @click="handleMobileBook">
            {{ t('deal.bookNow') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile subpage modals -->
    <FirstReleaseMobileFullscreen :open="activeMobileSection === 'facilities'" :title="t('hotel.facilities')" @close="activeMobileSection = null">
      <div class="mobile-subpage">
        <div class="facilities__grid facilities__grid--mobile">
          <div v-for="fac in hotel?.facilities || []" :key="localized(fac.label)" class="facility-item">
            <img v-if="fac.icon && fac.icon.startsWith('http')" :src="fac.icon" :alt="localized(fac.label)" class="facility-item__icon" width="20" height="20" loading="lazy" />
            <span v-else class="facility-item__check">✓</span>
            <span>{{ localized(fac.label) }}</span>
          </div>
        </div>
      </div>
    </FirstReleaseMobileFullscreen>

    <FirstReleaseMobileFullscreen :open="activeMobileSection === 'reviews'" :title="t('hotel.reviews')" @close="activeMobileSection = null">
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
    </FirstReleaseMobileFullscreen>

    <FirstReleaseMobileFullscreen :open="activeMobileSection === 'tips'" :title="t('hotel.nearbyTips') || 'Tips in de buurt'" @close="activeMobileSection = null">
      <div v-if="hotel" class="mobile-subpage mobile-subpage--no-padding">
        <FirstReleaseHotelNearbyTips :tips="hotel.nearbyTips" :hotel-name="hotel.name" />
      </div>
    </FirstReleaseMobileFullscreen>

    <FirstReleaseMobileFullscreen :open="activeMobileSection === 'faq'" :title="t('hotel.faq') || 'Veelgestelde vragen'" @close="activeMobileSection = null">
      <div v-if="hotel" class="mobile-subpage">
        <FirstReleaseFaqSection :faq-items="hotel.faq" />
      </div>
    </FirstReleaseMobileFullscreen>

    <!-- Full description popup -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="descriptionOpen && hotel" class="desc-modal" @click.self="descriptionOpen = false">
          <div class="desc-modal__card" data-scroll-lock-allow="true">
            <!-- Sticky header (hotel name + close). Stays pinned while the
                 photo + body scroll underneath it. -->
            <div class="desc-modal__header">
              <h2 class="desc-modal__title">{{ hotel.name }}</h2>
              <button type="button" class="desc-modal__close" @click="descriptionOpen = false" :aria-label="t('common.close')">×</button>
            </div>
            <div v-if="hotel.images && hotel.images.length" class="desc-modal__photo">
              <img :src="hotel.images[0].url" :alt="hotel.name" />
            </div>
            <div class="desc-modal__body" v-html="fullDescription"></div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <FirstReleaseSiteFooter />
  </div>
</template>

<script setup lang="ts">
import { useFirstReleaseDealStore } from '~/stores-first-release/deal'
import { useSearchNavLock } from '~/composables-first-release/useMobileSearchModalControl'
import { useBodyScrollLock } from '~/composables-first-release/useBodyScrollLock'
import { usePinToViewportBottom } from '~/composables-first-release/usePinToViewportBottom'
import { creatorForSlug } from '~/data/team-members'
import FirstReleaseExperienceCreatorCard from '~/components-first-release/deal/ExperienceCreatorCard.vue'
import FirstReleaseWhyViaLuxury from '~/components-first-release/deal/WhyViaLuxury.vue'
import FirstReleaseOthersAlsoViewed from '~/components-first-release/deal/OthersAlsoViewed.vue'
import { formatPrice } from '~/utils-first-release/formatPrice'
import { getReviewLabelKey } from '~/utils-first-release/reviewLabel'
import { generateDealAvailability } from '~/data/mock/deal-pricing'
import { matchIcon } from '~/utils-first-release/iconMatcher'
import { roomsLeftForDeal } from '~/utils-first-release/scarcity'
import { nightsLabel, nightsWord, personsLabel, roomsLabel } from '~/utils-first-release/plural'
import {
  mappedPackagesByPermalink,
  mappedHotelsByPackagePermalink,
  dealVariantsByPermalink,
  dealsMapByPermalink,
  defaultDealPermalink,
  curatedHighlightsByPermalink,
  mappedHotels,
} from '~/data/deals-mapper'

const { t, localized, locale } = useFirstReleaseI18n()
const lang = computed<'nl' | 'en' | 'de'>(() => {
  if (locale.value === 'en') return 'en'
  if (locale.value === 'de') return 'de'
  return 'nl'
})

/** Reisduur the user picked on /search (persisted via sessionStorage in
 *  useFirstReleaseSearchState). Shown in the deal-page meta line so the choice is
 *  visible after navigating in from the search results. Returns null when
 *  no reisduur was selected (don't show anything). */
const { selectedNights } = useFirstReleaseSearchState()
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

// ---------------------------------------------------------------------------
// German-only price-area copy (sticky CTA bar + sidebar). When the active
// locale is `de`, the page swaps the existing one-line priceForLabel for a
// two-line tax block, and replaces the NL/EN sidebar disclaimer with a
// "Zusätzliche Kosten" block. All other locales use the original layout.
// ---------------------------------------------------------------------------
const isGerman = computed(() => locale.value === 'de')

/** First line of the sticky CTA bar in German.
 *  No date:   "Preis für 2 Personen, pro Zimmer/Suite"
 *  Date set:  "17 Juni - 19 Juni, Preis für 2 Nächte" */
const stickyDeLine1 = computed(() => {
  const deal = currentDeal.value
  if (!deal) return ''
  if (!dateSelected.value) {
    return t('deal.stickyNoDatePrice').replace('{persons}', String(store.totalPersons || 2))
  }
  return t('deal.stickyDatePrice')
    .replace('{startDate}', formatDeDayMonth(store.checkInDate))
    .replace('{endDate}', formatDeDayMonth(store.checkOutDate))
    .replace('{nights}', String(deal.nights))
    .replace('{persons}', String(store.totalPersons || 2))
    .replace('{rooms}', String(store.travelGroup.rooms || 1))
})

/** Second line of the sticky CTA bar in German — the tax/admin note. */
const stickyDeLine2 = computed(() =>
  dateSelected.value
    ? t('deal.stickyTaxWithDate')
    : t('deal.stickyTaxNoDate'),
)

/** Sidebar "Bekijk details" link → smooth-scrolls to the full
 *  inclusion-cards section. The target carries `scroll-margin-top:
 *  88px` (same offset the other anchor targets use) so the section
 *  lands just below the sticky CTA bar. */
function scrollToArrangement() {
  if (!import.meta.client) return
  const el = document.getElementById('arrangement')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** "Bekijk kaart" link in the meta line under the hotel name → smooth-
 *  scrolls to the mini-map block (mobile + desktop both have one). */
function scrollToMiniMap() {
  if (!import.meta.client) return
  const el = document.getElementById('mini-map')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** German date formatter — "17 Juni". Uses the browser's Intl so the
 *  month names stay correct without expanding `formatDate.ts`. */
function formatDeDayMonth(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long' }).format(d)
}

// Mobile detection + active sub-modal
const isMobile = useFirstReleaseIsMobile()
const activeMobileSection = ref<'facilities' | 'reviews' | 'tips' | 'faq' | null>(null)

// Sticky CTA bar — `ctaBarRef` is the bar element; the pin
// composable only writes `style.bottom` when `isMobile` is true,
// so the DESKTOP variant (which is a top sticky header with
// `top: 0` in CSS) stays untouched. Mobile gets the
// visualViewport-based bottom pin to avoid the "bridge" gap when
// the browser chrome animates.
const ctaBarRef = ref<HTMLElement | null>(null)
usePinToViewportBottom(ctaBarRef, isMobile)

// Sticky CTA bar visibility on desktop — only show after scrolling past the nav
const ctaBarVisible = ref(false)
function handleScroll() {
  ctaBarVisible.value = window.scrollY > 200
}
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
  // Arriving via an unavailable deal's "beschikbare datums" CTA: scroll to the
  // calendar (the date was already cleared in setup, so it opens empty for the
  // user to pick an available date). `cameFromCalCta` is captured in setup
  // because the URL-sync watcher strips the `cal` query param by mount time.
  if (import.meta.client && cameFromCalCta) {
    // Clear here (after the global arrival date has been restored from
    // localStorage) so the unavailable date isn't re-seeded into the calendar.
    store.clearDates()
    const scrollToCal = () => {
      store.clearDates()
      const cals = [...document.querySelectorAll('.sidebar__calendar')] as HTMLElement[]
      const target = cals.find(el => el.offsetParent !== null) || cals[0]
      // Mirror scrollToArrangement()'s proven pattern on this page.
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    // Retry as layout/images settle (the deal page reflows on mount).
    setTimeout(scrollToCal, 400)
    setTimeout(scrollToCal, 900)
  }
  // Autoscroll: on a fresh entry (Y=0), land just past the 200 px
  // sticky-CTA threshold so the bar is visible from the first paint.
  // Skip when scroll-restoration already placed the user somewhere
  // (e.g. browser back from a sub-page) or when we're scrolling to the calendar.
  else if (import.meta.client && window.scrollY === 0) {
    nextTick(() => window.scrollTo({ top: 220, behavior: 'auto' }))
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

// ---------------------------------------------------------------------------
// Anchor scroll-spy — tracks which section is currently scrolled into
// view, drives the `.--active` modifier on the sticky-bar's anchor
// tabs (so the current section's tab loses its underline).
// ---------------------------------------------------------------------------
const ANCHOR_IDS = ['intro', 'arrangement', 'tips', 'huisregels', 'veelgestelde-vragen'] as const
const activeAnchor = ref<typeof ANCHOR_IDS[number] | null>(null)
let anchorObserver: IntersectionObserver | null = null

onMounted(() => {
  if (!import.meta.client) return
  // Sticky CTA bar sits ~88 px from the top — use that as the
  // "intersection line" so the section in view at the top of the
  // visible content is the one marked active.
  anchorObserver = new IntersectionObserver(
    (entries) => {
      // Pick the entry closest to the top-of-content line that is
      // currently intersecting.
      let pick: { id: string; top: number } | null = null
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const top = e.boundingClientRect.top
        if (!pick || Math.abs(top - 88) < Math.abs(pick.top - 88)) {
          pick = { id: (e.target as HTMLElement).id, top }
        }
      }
      if (pick) activeAnchor.value = pick.id as typeof ANCHOR_IDS[number]
    },
    // Bias the observer so a section is "intersecting" when its top
    // edge is in the upper third of the viewport — feels natural.
    { rootMargin: '-88px 0px -60% 0px', threshold: 0 },
  )
  for (const id of ANCHOR_IDS) {
    const el = document.getElementById(id)
    if (el) anchorObserver.observe(el)
  }
})
onBeforeUnmount(() => {
  anchorObserver?.disconnect()
  anchorObserver = null
})
const route = useRoute()
const router = useRouter()
const store = useFirstReleaseDealStore()
const calendarRef = ref<HTMLElement | null>(null)
// Session-wide favourites (no login popup), keyed by hotel slug.
const { isFavorite: isFav, toggle: toggleFav } = useFirstReleaseFavorites()
const isFavorited = computed(() => isFav(hotel.value?.slug))
const descriptionOpen = ref(false)
// Lock the underlying page while the description modal is open.
useBodyScrollLock().bindTo(descriptionOpen)
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

// Watch for search bar changes → fake refresh
const { searchVersion } = useFirstReleaseSearchState()
const isRefreshing = ref(false)
watch(searchVersion, () => {
  isRefreshing.value = true
  setTimeout(() => {
    isRefreshing.value = false
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 800)
})
const isPanelOpen = ref(false)
const isUpgradePanelOpen = ref(false)
/** v6 only — opens the "Andere arrangementen bij dit hotel" sidepanel. */
const arrangementsPanelOpen = ref(false)
/** Native OS share sheet (Web Share API). Falls back to the custom
 *  popover when the browser doesn't support navigator.share. */
const shareMenuOpen = ref(false)
function handleShare() {
  const data = {
    title: 'Ik heb een mooi luxe hotel gevonden',
    text: hotel.value ? `Ik heb een mooi luxe hotel gevonden: ${hotel.value.name}` : 'Ik heb een mooi luxe hotel gevonden',
    url: import.meta.client ? window.location.href : '',
  }
  if (import.meta.client && navigator.share) {
    navigator.share(data).catch(() => { /* user cancelled — ignore */ })
  } else {
    shareMenuOpen.value = true
  }
}

/** True when the current hotel has ≥ 1 deal OTHER than the active one
 *  — drives whether the "Korter of langer verblijf?" link is rendered
 *  on v6. */
const hasOtherArrangements = computed(() => {
  const sh = searchHotelForBadge.value
  if (!sh || !currentDeal.value) return false
  return sh.deals.some(d => d.id !== currentDeal.value!.id)
})
const toastMessage = ref('')

function handleFavoriteClick() {
  // No login popup — just toggle the session favourite and confirm via toast.
  toggleFav(hotel.value?.slug)
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

// Resolve permalink from route — fallback to first available if invalid
const routeSlug = computed(() => (route.params.slug as string) || defaultDealPermalink)

/** Deterministic Experience Creator pick — same slug always returns the
 *  same team member, so the v6 business card stays stable across reloads
 *  while different deals show different creators. */
const creator = computed(() => creatorForSlug(routeSlug.value))
const initialDeal = mappedPackagesByPermalink[routeSlug.value] || mappedPackagesByPermalink[defaultDealPermalink]
const initialHotel = mappedHotelsByPackagePermalink[routeSlug.value] || mappedHotelsByPackagePermalink[defaultDealPermalink]

/** Show the NU.shop co-branding block in the anchor-tab row only when the
 *  user-test partner flag is active AND the deal belongs to Hotel Des Indes
 *  (the only hotel currently in the user-test partner flow). */
const { partner } = useFirstReleasePartner()
/** True when the user arrived via the NuShop advertisement flow on
 *  the Hotel Des Indes deal. Reads two sources:
 *   1. the shared `partner` state (written by `app.vue` from
 *      `?partner=nu` on every navigation), and
 *   2. the route's own `?partner=` query — defensive fallback for
 *      the first paint, before `app.vue`'s `onMounted` has run. */
const showPartnerLogo = computed(() => {
  const isNuPartner = partner.value === 'nu' || route.query.partner === 'nu'
  return isNuPartner && initialHotel?.slug === 'hotel-des-indes'
})

const hotel = ref(initialHotel)
const currentDeal = computed(() => store.currentDeal)
// The SearchHotel + SearchHotelDeal that back this deal page — looked up
// by the route's deal permalink, i.e. the exact card the user came from.
// Drives the gallery stickers so they match the search card.
const dealSearchHotel = computed(() =>
  mappedHotels.find(h => h.deals.some(d => d.slug === routeSlug.value)) ?? null,
)
const dealSearchDeal = computed(() =>
  dealSearchHotel.value?.deals.find(d => d.slug === routeSlug.value) ?? null,
)
// Special-deal labels (same as the search card).
const galleryLabels = computed(() => dealSearchHotel.value?.labels ?? [])
// Limited-supply sticker count (same id → same number as the search card).
const dealRoomsLeft = computed<number | null>(() =>
  dealSearchDeal.value ? roomsLeftForDeal(dealSearchDeal.value.id) : null,
)

// SearchHotel companion for the ViaLuxury score badge — look it up by
// slug (the hotel page slug) so the badge has access to deals + price
// data the helper needs.
const searchHotelForBadge = computed(() => {
  const h = hotel.value
  if (!h) return null
  return mappedHotels.find(sh => sh.slug === h.slug || sh.name === h.name) ?? null
})
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
// Captured here (setup) because the URL-sync watcher below strips `cal` from
// the URL by the time onMounted runs. `cal=1` means we arrived from an
// unavailable deal's "beschikbare datums" CTA → open the calendar empty.
const cameFromCalCta = query.cal === '1'
if (Object.keys(query).length > 0) {
  store.applyFromQuery(query, dealsMap)
}

// Capture the deal route path at setup so the watcher below can
// reliably tell when we've navigated away. The dealStore's
// `queryParams` keeps reacting to global state changes after a
// navigateTo() in the navbar's "Vind deals" handler; without this
// guard the watcher would race the navigation and call
// router.replace({ query }) which (lacking an explicit `path`)
// re-asserts the deal page URL, cancelling the navigation. See
// SiteHeader.vue → commitSearch().
const dealRoutePath = route.path
const { searchNavInProgress } = useSearchNavLock()
watch(() => store.queryParams, (params) => {
  // Don't fire while SiteHeader.commitSearch() is navigating us
  // away — otherwise this `router.replace` re-asserts the deal
  // URL and cancels the search-results navigation.
  if (searchNavInProgress.value) return
  // Defence-in-depth: also skip if we've already left the deal
  // path for any other reason.
  if (route.path !== dealRoutePath) return
  router.replace({ path: dealRoutePath, query: params })
}, { deep: true })

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

/** Street + city only — no postcode / country — shown under the
 *  mini map. `hotel.location.address` is already street-level in the
 *  type. */
const hotelStreetCity = computed(() => {
  const loc = hotel.value.location
  return loc.address ? `${loc.address}, ${loc.city}` : loc.city
})

// Static map tile URL (OpenStreetMap) — zoom 11 gives a more
// zoomed-out, region-context view (the previous 13 was too tight
// for a glanceable "where is this" preview).

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
  { label: t('search.arrangements'), href: '/first-release/search' },
  { label: currentDeal.value ? localized(currentDeal.value.title) : hotel.value.name },
])

function openGallery() { }

// Sync FR nav-bar variant with the user's last homepage pick so the
// SiteHeader on this internal page matches the chosen variant. Reads
// localStorage (or the URL if it matches a known variant path).
// `restoreFrNavVariant` runs on mount so localStorage drives the nav
// chrome variant for direct-link visits.
const { restoreFrNavVariant } = useFirstReleaseHomeVariant()
onMounted(() => {
  restoreFrNavVariant(window.location.pathname)
})
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
/* `display: inline-block` makes the whole hotel-name span a real
   click target (a bare inline `<a>` wrapping text can be flaky on
   mobile when nested inside flex containers). */
.deal-page__hotel-link { display: inline-block; color: inherit; text-decoration: none; }
.deal-page__hotel-link:hover .deal-page__hotel-subtitle { text-decoration: underline; text-underline-offset: 2px; }
.deal-page__meta { display: flex; align-items: center; gap: var(--space-sm); font-size: 14px; color: var(--color-text-secondary); padding-right: 110px; flex-wrap: wrap; }
.deal-page__meta-pin { flex-shrink: 0; color: var(--color-text-secondary); }
.deal-page__meta .deal-page__view-map-link { margin-left: 8px; color: var(--color-primary, #c9a85c); font-weight: 600; text-decoration: underline; }
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
.deal-page__gallery { position: relative; }

.icon-action { width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--color-border); display: flex; align-items: center; justify-content: center; font-size: 18px; background: var(--color-surface); cursor: pointer; }
.icon-action:hover { border-color: var(--color-primary); }
.icon-action--favorited { color: #e74c3c; border-color: #e74c3c; }

/* Icon + label actions (Delen / Opslaan) in the anchor-nav row. */
.deal-page__share-wrap { position: relative; }
.deal-page__action {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 4px;
  border: none;
  background: none;
  cursor: pointer;
  font-family: var(--font-body);
  /* Match the anchor-navigation tabs (.deal-page__tab = 14px). */
  font-size: 14px;
  color: var(--color-text-primary);
}
.deal-page__action:hover { color: var(--color-primary); }
.deal-page__action-heart { font-size: 17px; line-height: 1; }
.deal-page__action--favorited .deal-page__action-heart { color: #e74c3c; }
.deal-page__action-label { font-size: 14px; }
.deal-page__breadcrumbs { padding-top: var(--space-md); }

/* ===== 2-COLUMN GRID ===== */
.deal-page__grid { display: grid; grid-template-columns: 1fr var(--fr-deal-sidebar-width, 340px); gap: var(--space-xl); padding-top: var(--space-lg); align-items: start; }
.deal-page__col-left { min-width: 0; }
.deal-page__description { font-size: 15px; line-height: 1.75; color: var(--color-text-secondary); }
/* Shared "orange underlined link" style — used by Lees meer / Bekijk
   details / Bekijk kaart / Bekijk andere arrangementen so they all
   read as the same kind of CTA.  Underline stays on hover; only the
   colour brightens. */
.deal-page__read-more {
  display: inline-block;
  margin-top: var(--space-xs);
  padding: 0;
  background: none;
  border: none;
  color: var(--color-primary);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}
.deal-page__read-more:hover {
  color: var(--color-primary-hover);
  text-decoration: underline;
}

/* Full description modal */
.desc-modal {
  position: fixed; inset: 0; z-index: 1100;
  background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  padding: var(--space-lg);
}
.desc-modal__card {
  position: relative;
  /* Explicit solid white — was `var(--color-surface, #fff)`, which on some
     mobile browsers rendered transparent for the teleported (scoped) modal,
     leaving the popup with no background. */
  background: #fff;
  border-radius: var(--radius-lg);
  /* No card padding — the sticky header + photo go edge-to-edge; the body
     supplies its own padding. */
  padding: 0;
  /* Wider + square: side = the smaller of 92 vw / 92 vh so the card
     always fits both axes; aspect-ratio locks the result to 1 : 1. */
  width: min(92vh, 92vw);
  aspect-ratio: 1 / 1;
  max-width: none;
  max-height: none;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}
/* Sticky header: hotel name + close. Pinned to the top of the scrolling
   card so the photo + body scroll underneath it. */
.desc-modal__header {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: 14px var(--space-lg);
  background: #fff;
  border-bottom: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}
.desc-modal__close {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: #fff;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.desc-modal__close:hover { border-color: var(--color-primary); }
.desc-modal__title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  min-width: 0;
  color: var(--color-text-primary);
}
.desc-modal__photo img { display: block; width: 100%; height: auto; }
.desc-modal__body { font-size: 15px; line-height: 1.75; color: var(--color-text-secondary); padding: var(--space-lg); }
.desc-modal__body :deep(p) { margin: 0 0 var(--space-md); }
.fade-enter-active, .fade-leave-active { transition: opacity 180ms ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Intro row: description + mini map side by side */
.deal-page__intro { display: grid; grid-template-columns: 1fr 220px; gap: var(--space-xl); margin-bottom: var(--space-xl); align-items: start; }

/* Mini map */
/* Map preview + below-the-map footer (address left, "Bekijk kaart"
   right) — no more gradient overlay on the photo. */
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
.sidebar__inc-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
  /* Border-bottom moved to .sidebar__details-link below so the link
     sits ABOVE the divider (inside the inclusion block). */
}
.sidebar__inc-list li { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--color-text-secondary); }
.sidebar__inc-check { color: var(--color-discount); font-weight: 700; flex-shrink: 0; }

/* "Bekijk details" — plain orange-underlined text link beneath the
   inclusions list. The link's box owns the bottom border so the
   divider sits BELOW the link, completing the inclusions section. */
.sidebar__details-link {
  display: block;
  width: 100%;
  margin: 0 0 var(--space-lg);
  padding: 0 0 var(--space-lg);
  border: 0;
  border-bottom: 1px solid var(--color-border-light);
  background: none;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
  transition: color var(--transition-fast);
}
.sidebar__details-link:hover {
  color: var(--color-primary-hover);
  text-decoration: underline;
}

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

/* Sidebar price ROW uses the shared FirstReleaseStickyPriceRow
   component (single source of truth — identical to the sticky
   header). Only the small bottom spacing before the meta line is
   set here; the row's order / sizing / alignment all live in the
   component. */
.sidebar__price-row { margin-bottom: 2px; }
.sidebar__price-meta { font-size: 13px; color: var(--color-text-secondary); margin-bottom: var(--space-md); }
.sidebar__disclaimer { font-size: 12px; line-height: 1.5; color: var(--color-text-muted); margin-bottom: var(--space-md); }
/* German "Zusätzliche Kosten" block — replaces the long NL/EN
   disclaimer in the sidebar. Bold title + two indented lines. */
.sidebar__extra-costs { margin-bottom: var(--space-md); }
.sidebar__extra-costs-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}
.sidebar__extra-costs-line {
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  margin: 0;
}
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
/* "Flexibel annuleren" Lucide-style icon (calendar with X). Sized to
   sit alongside the Trustpilot block at a similar visual weight, and
   coloured ViaLuxury-green to match the medal icon used on the
   homepage persuasion band. */
.sidebar__trust-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #00B67A;
}
.sidebar__trust-icon svg {
  width: 30px;
  height: 30px;
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
/* Match the menu side-panel icon tile — warmer-grey homepage surface,
   8 px rounded corners, no border. */
.highlight-item__icon { width: 40px; height: 40px; border-radius: 8px; background: var(--color-background-secondary, #faf9f6); border: 0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.highlight-item__text { font-size: 14px; font-weight: 500; color: var(--color-text-primary); }
.highlight-item__check { font-size: 18px; line-height: 1; font-weight: 700; color: var(--color-discount, #00B67A); }

/* ===== CONTENT BLOCKS ===== */
.deal-page__content-blocks { padding: var(--space-xl) 0; border-top: 1px solid var(--color-border-light); scroll-margin-top: 88px; }
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
  /* Match the "Bespaar €X" gallery badge green — NOT the
     discount-percentage Trustpilot green. */
  background: #70BEB2;
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
  /* Read as links — underlined by default. Not orange (the spec
     reserves orange for the "Lees meer / Bekijk details / Bekijk
     kaart / Bekijk andere arrangementen" CTA set). */
  text-decoration: underline;
  text-underline-offset: 3px;
  padding-bottom: var(--space-sm);
  border-bottom: none;
  transition: color var(--transition-fast);
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
  /* Hover deepens the text colour, keeps the underline. No orange
     (per spec) so anchor links stay visually distinct from the CTA
     links. */
  color: var(--color-text-primary);
  text-decoration: underline;
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
  text-decoration: underline;
}
.deal-page__tabs--in-bar .deal-page__tab:hover {
  border-bottom: none;
  color: var(--color-text-primary);
  text-decoration: underline;
}
/* Sticky bar: the tab matching the section currently in view drops
   its underline + bumps weight, so users can see where they are. */
.deal-page__tabs--in-bar .deal-page__tab--active {
  text-decoration: none;
  color: var(--color-text-primary);
  font-weight: 700;
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
/* No trailing border on the last rule — the next section
   below (FAQ on mobile, others on desktop) supplies its own
   divider, so leaving one here renders two adjacent lines. */
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
.deal-page__faq::before,
.deal-page__why-desktop::before {
  content: '';
  position: absolute;
  top: 0;
  left: var(--space-lg);
  right: var(--space-lg);
  height: 1px;
  background: var(--color-border-light);
}
/* The class lands on the WhyViaLuxury component root; it needs a positioning
   context for the ::before divider (the section above uses position:relative). */
.deal-page__why-desktop {
  position: relative;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1100px) {
  .deal-page__grid { grid-template-columns: 1fr; }
  .deal-page__col-right { position: static; }
  .deal-page__intro { grid-template-columns: 1fr; }
  .deal-page__minimap { --vl-minimap-max-h: 200px; }
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
  /* Extend the bar's white bg INTO the safe-area inset at the
     bottom (iPhone home-indicator strip, Chrome dynamic bottom
     bar). Without this the bar sits flush with the viewport's
     visible bottom and shows a thin white strip below when the
     browser chrome hides on scroll. */
  padding-bottom: env(safe-area-inset-bottom, 0);
}
/* Mobile-only: bump the sticky footer's vertical padding by 20 %
   so price + button get more breathing room above safe-area. */
.deal-page__cta-bar--mobile .deal-page__cta-bar-inner {
  padding-top: 12px;
  padding-bottom: 12px;
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
/* NOTE: the price ROW (vanaf/chip · original · amount · icon) and
   its bottom-alignment live in the shared
   `FirstReleaseStickyPriceRow` component — single source of truth,
   do NOT re-add price-row CSS here. */
.deal-page__cta-bar-meta {
  font-size: 11px;
  color: var(--color-text-muted);
  white-space: nowrap;
}
/* German: stack the two tax-info lines vertically, right-aligned so
   the first ("17 Juni - 19 Juni, für 2 Nächte, 2 Pers, 1 Zimmer")
   aligns with the tax line beneath it. */
.deal-page__cta-bar-meta--de {
  display: flex;
  flex-direction: column;
  gap: 2px;
  white-space: normal;
  line-height: 1.3;
  text-align: right;
  align-items: flex-end;
}
.deal-page__cta-bar-btn {
  flex: 0 0 auto;
  width: auto;
  /* 1.25 × the previous 44 px = 55 px for a taller tap target;
     applies on both the desktop sticky header and the mobile
     sticky footer. */
  height: 55px;
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
  /* Reserve space for the bottom-fixed bar (bar = 12 + 55 + 12
     padding/button/padding = 79 px after the 1.25× height bump). */
  .deal-page__main {
    /* Was 112px, which left a big empty gap before the footer. The sticky
       CTA bar still floats over the footer (it's fixed); the footer below
       gives enough scroll room for the last content to clear the bar. */
    padding-bottom: 24px;
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

/* ====================================================================
   MOBILE BRANCH styles — only the bits that aren't covered by the
   existing classes already reused above.
   ==================================================================== */
@media (max-width: 800px) {
  /* Defensive: no top border / shadow between the SiteHeader's
     mobile search trigger and the breadcrumb section on the deal
     page (mirror of the rule on /search). */
  .deal-page__breadcrumbs {
    border-top: 0;
    box-shadow: none;
  }
  /* "In dit arrangement is het volgende inbegrepen" heading +1 pt,
     individual inclusion titles + body copy each +1 pt. */
  .deal-page__content-blocks--mobile .section-title { font-size: 23px; }
  .deal-page__content-blocks--mobile .content-block__title { font-size: 17px; }
  .deal-page__content-blocks--mobile .content-block__desc  { font-size: 15px; }

  /* Mobile sidebar: bump every text element BEFORE the calendar by
     1 pt — sidebar title, inclusion list, "Bekijk details" link,
     "Kies je aankomstdatum" heading, "Dit arrangement is voor X
     nachten" line, and the other-arrangements heading + link. */
  .deal-page__sidebar-mobile .sidebar__title { font-size: 17px; }
  .deal-page__sidebar-mobile .sidebar__inc-list li { font-size: 15px; }
  .deal-page__sidebar-mobile .sidebar__details-link { font-size: 16px; }
  .deal-page__sidebar-mobile .sidebar__cal-title,
  .deal-page__sidebar-mobile .sidebar__cal-title--big { font-size: 19px; }
  .deal-page__sidebar-mobile .sidebar__nights-line { font-size: 15px; }
  .deal-page__sidebar-mobile .sidebar__variant-heading { font-size: 15px; }
  .deal-page__sidebar-mobile .sidebar__other-arrangements { font-size: 16px; }
  /* Stack title block on its own (no right-column on mobile). */
  .deal-page__title-section--mobile {
    display: block;
    padding-top: 12px;
  }
  /* Hotel name + stars: flow inline so the stars sit right after the name's
     last word. The base `inline-flex` made a wrapped (2-line) name take the
     full row width, shoving the stars to the right browser edge. */
  .deal-page__title-section--mobile .deal-page__hotel-name-wrap {
    display: block;
  }
  .deal-page__title-section--mobile .deal-page__hotel-link {
    display: inline;
  }
  .deal-page__title-section--mobile .deal-page__stars-adjacent {
    display: inline-flex;
    vertical-align: middle;
    margin-left: 8px;
    position: relative;
    top: -2px;   /* nudge the 24px stars onto the text's optical centre */
  }
  /* "Bekijk op kaart" link sits inline next to the city/region meta. */
  .deal-page__view-map-link {
    display: inline-block;
    color: var(--color-primary, #c9a85c);
    font-size: 16px;   /* +2 */
    font-weight: 600;
    text-decoration: underline;
  }
  /* Samengesteld-door card sits below the gallery; small breathing room. */
  .deal-page__creator-mobile {
    margin-top: 16px;
    margin-bottom: 8px;
  }
  /* Sidebar block inline on mobile — drop the desktop sticky/width
     constraints, let it flow with the page body. */
  .deal-page__sidebar-mobile {
    margin-top: 16px;
    margin-bottom: 24px;
  }
  .deal-page__col-right--mobile {
    position: static;
    width: 100%;
    max-width: 100%;
    /* Drop the grey box (border + inner padding) so the includes /
       calendar / price / trustpilot use the full container width. */
    border: none;
    border-radius: 0;
    padding: 0;
    background: transparent;
  }
  /* Description appears AFTER the sidebar on mobile (not paired with
     the mini-map like on desktop). */
  .deal-page__description-mobile {
    margin-top: 16px;
    /* 24px so the gap above the Highlights title matches the other sections
       (24px below content + 24px above title = a consistent 48px). */
    margin-bottom: 24px;
  }
  /* "Lees meer" link +2pt on mobile. */
  .deal-page__description-mobile .deal-page__read-more {
    font-size: 16px;
  }
  /* Mini-map gets its own section; offset the anchor target so the
     sticky CTA bar doesn't cover it on jump. */
  .deal-page__mini-map-mobile {
    scroll-margin-top: 88px;
    margin-top: 16px;
  }
  /* Stack include cards as a single column on mobile + give them
     a 16 px vertical gap so they don't sit flush against each other. */
  .content-blocks__grid--mobile {
    grid-template-columns: 1fr !important;
    gap: 16px !important;
  }
  /* Highlights grid keeps 2 columns on most phones, gets 12 px gap
     between cards on mobile (was using the desktop space-md/space-xl). */
  .deal-page__highlights--mobile .highlights__grid {
    gap: 12px;
  }
  /* Sticky footer on mobile: price-block sits LEFT, "Ik ga boeken"
     button sits RIGHT, meta-line below the price reads left-aligned. */
  .deal-page__cta-bar--mobile .deal-page__cta-bar-cluster {
    flex: 1 1 auto;
    justify-content: space-between;
    width: 100%;
  }
  .deal-page__cta-bar--mobile .deal-page__cta-bar-price-block {
    align-items: flex-start;
    flex: 1 1 auto;
    min-width: 0;
  }
  .deal-page__cta-bar--mobile .deal-page__cta-bar-btn {
    margin-left: auto;
    flex: 0 0 auto;
  }
  .deal-page__cta-bar--mobile .deal-page__cta-bar-meta {
    text-align: left;
  }
  .deal-page__cta-bar--mobile .deal-page__cta-bar-meta--de {
    align-items: flex-start;
    text-align: left;
  }
  /* Tighter section padding throughout the mobile branch. Restore
     16 px horizontal padding too — the desktop base rule on
     `.deal-page__highlights` / `.deal-page__content-blocks` sets
     `padding: var(--space-xl) 0`, nuking the inherited
     `.container` horizontal padding on small viewports. */
  .deal-page__highlights--mobile,
  .deal-page__content-blocks--mobile,
  .deal-page__facilities--mobile,
  .deal-page__house-rules--mobile,
  .deal-page__faq--mobile {
    padding-top: 24px;
    padding-bottom: 24px;
    padding-left: 16px;
    padding-right: 16px;
  }
  /* Anderen-bekeken-ook on mobile: let card slides peek the next
     item (~85 % of viewport width with snap-scroll). The component's
     own horizontal carousel respects child widths. */
  .deal-page__others-mobile :deep(.others-also-viewed__slide),
  .deal-page__others-mobile :deep(.others-also-viewed__card) {
    flex: 0 0 85% !important;
    max-width: 85% !important;
  }

  /* Divider below the Trustpilot block in the mobile sidebar. */
  .deal-page__sidebar-mobile .sidebar__trust {
    border-bottom: 1px solid var(--color-border-light);
    padding-bottom: 24px;
  }
  /* No divider between the huisregels block and the FAQ block — the section's
     own pseudo-divider AND the FaqSection component's own border-top. */
  .deal-page__faq--mobile::before {
    display: none;
  }
  .deal-page__faq--mobile :deep(.faq-section) {
    border-top: 0 !important;
  }
  /* Equal margin above every section title (~48px = 24px below the previous
     section's content + 24px above the title). The nested tips-section and
     faq-section components add their OWN 32px vertical padding on top of the
     wrapper's 24px, which inflated the gaps above Tips / Huisregels / FAQ /
     Waarom — normalise them here so every title sits the same distance below
     the element above it. */
  .deal-page__nearby-mobile :deep(.tips-section) {
    padding-top: 24px !important;
    padding-bottom: 24px !important;
  }
  .deal-page__nearby-mobile :deep(.tips-row) {
    padding-bottom: 0 !important;
  }
  .deal-page__faq--mobile :deep(.faq-section) {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }
  /* "Waarom boeken bij ViaLuxury" — the class IS the component root, so target
     it directly. 24px top so its gap matches the rest (was 0, which combined
     with the faq-section's old 32px padding read as too big). */
  .deal-page__why-mobile {
    padding-top: 24px !important;
  }

  /* Partner (NUshop) co-brand card: breathing room above it so it doesn't
     touch the gallery on the advertisement flow. */
  .deal-page__partner-mobile {
    margin-top: 16px;
  }

  /* "Bekijk kaart" under the mini-map +1pt to match the header link (16px). */
  .deal-page__mini-map-mobile :deep(.mini-map__view-link) {
    font-size: 16px;
  }

  /* Beschrijving→Highlights and Mini-map→Arrangement dividers were full-width
     (a top border). Replace them with the SAME inset divider used by the other
     sections (facilities / huisregels / faq) so all dividers match. */
  .deal-page__highlights--mobile,
  .deal-page__content-blocks--mobile {
    position: relative;
    border-top: 0;
  }
  .deal-page__highlights--mobile::before,
  .deal-page__content-blocks--mobile::before {
    content: '';
    position: absolute;
    top: 0;
    left: var(--space-lg);
    right: var(--space-lg);
    height: 1px;
    background: var(--color-border-light);
  }
  /* Extra space above the arrangement divider (between the mini-map's
     "Bekijk kaart" and the divider). */
  .deal-page__content-blocks--mobile {
    margin-top: 16px;
  }

  /* No divider between the last include block and Hotelfaciliteiten. */
  .deal-page__facilities--mobile::before {
    display: none;
  }

  /* Close off the huisregels list with a divider below the last rule
     ("Kinderen"). */
  .deal-page__house-rules--mobile .house-rule:last-child {
    border-bottom: 1px solid var(--color-border-light);
  }

  /* "Anderen bekeken ook" → footer: match the section spacing. The class is
     on the component root (which IS .others), so target it directly; the
     24px clearance to the footer comes from .deal-page__main's padding. */
  .deal-page__others-mobile {
    padding-bottom: 0 !important;
  }

  /* The sticky bottom CTA bar (≈80px) floats over the page, so when scrolled
     all the way down it would cover the footer's bottom rows. Add bottom
     padding to the footer (its own dark bg) so all footer content clears the
     bar. */
  :deep(.site-footer) {
    padding-bottom: 96px;
  }
}
</style>
