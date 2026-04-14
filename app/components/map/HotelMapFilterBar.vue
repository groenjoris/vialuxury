<script setup lang="ts">
import { ref } from 'vue'

/**
 * HotelMapFilterBar — visual implementation only.
 * Inputs are wired to local refs but do not actually filter the dataset;
 * filtering logic is intentionally out of scope for this task (per the
 * approved plan).
 */

const search = ref('')
</script>

<template>
  <div class="map-filter-bar">
    <div class="map-filter-bar__search">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        v-model="search"
        type="text"
        placeholder="Zoek op stad, hotel of thema"
      />
    </div>

    <button type="button" class="map-filter-bar__select">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
      <span>Bestemming</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="map-filter-bar__chevron">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    <button type="button" class="map-filter-bar__select">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L15 8l6 .9-4.5 4.4L17.5 20 12 16.9 6.5 20 8 13.3 3.5 8.9 9.5 8z" />
      </svg>
      <span>Thema</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="map-filter-bar__chevron">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    <button type="button" class="map-filter-bar__select">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
      <span>Aankomst datum</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="map-filter-bar__chevron">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    <div class="map-filter-bar__spacer" />

    <button type="button" class="map-filter-bar__list-toggle">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <circle cx="4" cy="6" r="1" fill="currentColor" />
        <circle cx="4" cy="12" r="1" fill="currentColor" />
        <circle cx="4" cy="18" r="1" fill="currentColor" />
      </svg>
      Toon op lijst
    </button>

    <div class="map-filter-bar__trustpilot">
      <span class="map-filter-bar__trustpilot-label">Trustpilot</span>
      <span class="map-filter-bar__trustpilot-stars">★★★★★</span>
      <span class="map-filter-bar__trustpilot-score">4.5/5</span>
    </div>
  </div>
</template>

<style scoped>
.map-filter-bar {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-light);
}

.map-filter-bar__search {
  flex: 0 1 320px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  height: 44px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
}

.map-filter-bar__search input {
  flex: 1;
  border: 0;
  outline: none;
  background: transparent;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-primary);
}

.map-filter-bar__search input::placeholder {
  color: var(--color-text-muted);
}

.map-filter-bar__select {
  flex: 0 1 200px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  height: 44px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.map-filter-bar__select:hover {
  border-color: var(--color-text-muted);
}

.map-filter-bar__select span {
  flex: 1;
  text-align: left;
}

.map-filter-bar__chevron {
  color: var(--color-text-muted);
}

.map-filter-bar__spacer {
  flex: 1;
}

.map-filter-bar__list-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  height: 44px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  cursor: pointer;
}

.map-filter-bar__list-toggle:hover {
  border-color: var(--color-text-muted);
}

.map-filter-bar__trustpilot {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-family: var(--font-body);
  font-size: 11px;
  color: var(--color-text-secondary);
  line-height: 1.2;
}

.map-filter-bar__trustpilot-label {
  font-weight: 700;
  color: var(--color-text-primary);
}

.map-filter-bar__trustpilot-stars {
  color: #00b67a;
  font-size: 14px;
  letter-spacing: 1px;
}

.map-filter-bar__trustpilot-score {
  font-weight: 600;
}
</style>
