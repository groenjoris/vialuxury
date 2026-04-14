<template>
  <aside class="sidebar">
    <div class="sidebar__card">
      <!-- Price Summary -->
      <div class="sidebar__price-section">
        <div class="sidebar__price-line">
          <span v-if="store.priceBreakdown.discountPercentage > 0" class="discount-badge">
            -{{ store.priceBreakdown.discountPercentage }}%
          </span>
          <span class="price-current">{{ formatPrice(store.priceBreakdown.finalPrice) }}</span>
          <span v-if="store.priceBreakdown.discountPercentage > 0" class="price-original">
            {{ formatPrice(store.priceBreakdown.totalBeforeDiscount) }}
          </span>
        </div>
      </div>

      <!-- Dates -->
      <div class="sidebar__dates">
        <div class="sidebar__date-col">
          <span class="date-label">Check-in</span>
          <span class="date-value">{{ store.formattedCheckIn || 'Kies datum' }}</span>
        </div>
        <div class="sidebar__date-divider"></div>
        <div class="sidebar__date-col">
          <span class="date-label">Check-out</span>
          <span class="date-value">{{ store.formattedCheckOut || 'Kies datum' }}</span>
        </div>
      </div>

      <!-- Cancellation -->
      <div class="sidebar__cancel">
        {{ store.arrangement?.cancellationPolicy || 'Flexibele annulering' }}
      </div>

      <!-- CTA -->
      <button class="btn btn-primary sidebar__cta" :disabled="!store.isBookingReady">
        Boek nu
      </button>

      <!-- Trust -->
      <div class="sidebar__trust">
        <div class="trust-badge">
          <div class="trust-logo">★★★★★</div>
          <span class="trust-text">15.000+ reviews</span>
        </div>
        <ul class="trust-list">
          <li class="trust-item">
            <span class="trust-check">✓</span>
            Zeer flexibele annuleringsvoorwaarden
          </li>
          <li class="trust-item">
            <span class="trust-check">✓</span>
            Profiteer direct van hoge kortingen
          </li>
          <li class="trust-item">
            <span class="trust-check">✓</span>
            Members profiteren van speciale aanbiedingen
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'
import { formatPrice } from '~/utils/formatPrice'

const store = useBookingStore()
</script>

<style scoped>
.sidebar {
  position: sticky;
  top: 20px;
  align-self: start;
}

.sidebar__card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sidebar);
  overflow: hidden;
}

.sidebar__price-section {
  padding: var(--space-lg);
  padding-bottom: 0;
}

.sidebar__price-line {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
}

.discount-badge {
  background: var(--color-discount-light);
  color: var(--color-discount);
  font-weight: 700;
  font-size: 14px;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.price-current {
  font-size: 28px;
  font-weight: 700;
  font-family: var(--font-heading);
}

.price-original {
  font-size: 16px;
  color: var(--color-text-muted);
  text-decoration: line-through;
}

.sidebar__dates {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin: var(--space-lg);
  margin-bottom: var(--space-md);
}

.sidebar__date-col {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar__date-divider {
  width: 1px;
  background: var(--color-border);
}

.date-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.date-value {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.sidebar__cancel {
  text-align: center;
  font-size: 14px;
  color: var(--color-text-secondary);
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-background-secondary);
}

.sidebar__cta {
  margin: var(--space-md) var(--space-lg);
  width: calc(100% - var(--space-lg) * 2);
  padding: 12px;
  font-size: 17px;
}

.sidebar__cta:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.sidebar__trust {
  padding: var(--space-lg);
  border-top: 1px solid var(--color-border-light);
}

.trust-badge {
  text-align: center;
  margin-bottom: var(--space-md);
}

.trust-logo {
  color: var(--color-primary);
  font-size: 16px;
}

.trust-text {
  font-size: 13px;
  color: var(--color-text-muted);
}

.trust-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.trust-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 13px;
  color: var(--color-text-secondary);
}

.trust-check {
  color: var(--color-discount);
  font-weight: 700;
  flex-shrink: 0;
}
</style>
