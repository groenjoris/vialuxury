<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { mockMapHotels } from '~/data/mock/hotels-nl'
import { useHotelMap } from '~/composables/useHotelMap'
import HotelBrowseMap from '~/components/map/HotelBrowseMap.vue'
import HotelMapHoverCard from '~/components/map/HotelMapHoverCard.vue'
import HotelMapSidebar from '~/components/map/HotelMapSidebar.vue'
import HotelMapZoomControls from '~/components/map/HotelMapZoomControls.vue'
import HotelMapFilterBar from '~/components/map/HotelMapFilterBar.vue'

useHead({ title: 'Kaart — Via Luxury' })

const router = useRouter()
const hotels = mockMapHotels

const {
  selectedHotelId,
  hoveredHotelId,
  hoverPosition,
  clearSelection,
} = useHotelMap()

const selectedHotel = computed(() =>
  hotels.find((h) => h.id === selectedHotelId.value) ?? null,
)

const hoveredHotel = computed(() =>
  hotels.find((h) => h.id === hoveredHotelId.value) ?? null,
)

const mapRef = ref<InstanceType<typeof HotelBrowseMap> | null>(null)

function closeMap() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}
</script>

<template>
  <div class="kaart-page">
    <!-- USP top bar (matches Figma) -->
    <div class="kaart-topbar">
      <span><span class="kaart-topbar__check">✓</span> Gasten beoordelen ons met een <strong>4.5/5</strong> op Trustpilot</span>
      <span><span class="kaart-topbar__check">✓</span> Altijd de beste deal</span>
      <span><span class="kaart-topbar__check">✓</span> Gratis annuleren</span>
      <span><span class="kaart-topbar__check">✓</span> 100% geld-terug-garantie</span>
    </div>

    <!-- Map-specific simplified header (matches Figma; differs from
         the global SiteHeader which is for the main site flow) -->
    <header class="kaart-header">
      <NuxtLink to="/" class="kaart-header__logo" aria-label="Via Luxury">
        <span>via</span>
        <span class="kaart-header__logo-mid">LUXU</span>
        <span>RY</span>
      </NuxtLink>

      <button type="button" class="kaart-header__help">
        <span class="kaart-header__help-icon" aria-hidden="true">🎧</span>
        Hulp nodig? <a href="tel:+31207052222">+31 20 705 2222</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9" /></svg>
      </button>

      <nav class="kaart-header__nav">
        <a href="#" class="kaart-header__nav-item">
          <svg width="14" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18" /></svg>
          Klantenservice
        </a>
        <a href="#" class="kaart-header__nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
          Favorieten
        </a>
        <a href="#" class="kaart-header__nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></svg>
          Account
        </a>
        <button type="button" class="kaart-header__hamburger" aria-label="Menu">
          <span /><span /><span />
        </button>
      </nav>
    </header>

    <HotelMapFilterBar />

    <main class="kaart-stage">
      <ClientOnly>
        <HotelBrowseMap ref="mapRef" :hotels="hotels" />
      </ClientOnly>

      <HotelMapSidebar
        v-if="selectedHotel"
        :hotel="selectedHotel"
        @close="clearSelection"
      />

      <HotelMapHoverCard
        v-if="hoveredHotel"
        :hotel="hoveredHotel"
        :position="hoverPosition"
      />

      <button
        type="button"
        class="kaart-close"
        aria-label="Sluit kaart"
        @click="closeMap"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <HotelMapZoomControls
        @zoom-in="mapRef?.zoomIn()"
        @zoom-out="mapRef?.zoomOut()"
      />
    </main>

    <!-- Mobile fallback (locked-in scope: desktop-only) -->
    <div class="kaart-mobile-fallback">
      <p>Open de kaart op een desktop voor de beste ervaring.</p>
      <NuxtLink to="/">Terug naar home</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.kaart-page {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  overflow: hidden;
}

/* ---------- Top USP bar ---------- */
.kaart-topbar {
  flex-shrink: 0;
  background: #2A2A2A;
  color: rgba(255, 255, 255, 0.92);
  font-size: 12px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 var(--space-2xl);
}

.kaart-topbar__check {
  color: white;
  margin-right: 6px;
}

/* ---------- Header ---------- */
.kaart-header {
  flex-shrink: 0;
  background: #1A1A1A;
  color: white;
  height: 70px;
  display: flex;
  align-items: center;
  padding: 0 var(--space-lg);
  gap: var(--space-lg);
}

.kaart-header__logo {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 18px;
  color: white;
  text-decoration: none;
  background: var(--color-primary);
  padding: 6px 10px;
  border-radius: var(--radius-xs);
  letter-spacing: 0.5px;
}

.kaart-header__logo-mid {
  margin: 0 1px;
}

.kaart-header__help {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #2E2E2E;
  border: 0;
  border-radius: 999px;
  color: white;
  font-family: var(--font-body);
  font-size: 13px;
  padding: 8px 16px;
  cursor: pointer;
}

.kaart-header__help a {
  color: white;
  text-decoration: underline;
}

.kaart-header__help-icon {
  font-size: 14px;
}

.kaart-header__nav {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.kaart-header__nav-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: white;
  text-decoration: none;
  font-size: 13px;
  font-family: var(--font-body);
}

.kaart-header__hamburger {
  background: transparent;
  border: 0;
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  cursor: pointer;
}

.kaart-header__hamburger span {
  display: block;
  width: 20px;
  height: 2px;
  background: white;
}

/* ---------- Stage (map area) ---------- */
.kaart-stage {
  position: relative;
  flex: 1;
  min-height: 0;
}

.kaart-close {
  position: absolute;
  top: var(--space-lg);
  right: var(--space-lg);
  z-index: 600;
  width: 40px;
  height: 40px;
  background: var(--color-surface);
  border: 0;
  border-radius: 50%;
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-primary);
}

.kaart-close:hover {
  background: var(--color-background-secondary);
}

/* ---------- Mobile fallback ---------- */
.kaart-mobile-fallback {
  display: none;
}

@media (max-width: 1023px) {
  .kaart-topbar,
  .kaart-header,
  .kaart-stage,
  :deep(.map-filter-bar) {
    display: none;
  }
  .kaart-mobile-fallback {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    padding: var(--space-2xl);
    gap: var(--space-md);
    color: var(--color-text-primary);
  }
}
</style>
