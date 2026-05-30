<template>
  <div class="sticky-price-row">
    <span
      v-if="lead"
      class="sticky-price-row__lead"
      :class="leadIsChip ? 'sticky-price-row__lead--chip' : 'sticky-price-row__lead--text'"
    >{{ lead }}</span>
    <span v-if="original" class="sticky-price-row__original">{{ original }}</span>
    <span class="sticky-price-row__amount">{{ amount }}</span>
    <FirstReleasePriceInfoTooltip v-if="showInfo" :variant="infoVariant || 'deal'" />
  </div>
</template>

<script setup lang="ts">
/**
 * Shared sticky-bar price row used by BOTH the deal and hotel
 * pages (desktop top header + mobile bottom footer). This is the
 * SINGLE SOURCE OF TRUTH for the price-row bottom-alignment — do
 * NOT re-implement the row markup or its alignment CSS in the
 * pages, or it will drift apart again.
 *
 * Presentation-only: the page formats every value and passes
 * display strings in.
 */
defineProps<{
  /** Lead token: "-25%" | "Vanaf" | "Ab" | '' (empty hides it). */
  lead?: string
  /** true → green % chip; false → plain "Vanaf"/"Ab" text. */
  leadIsChip?: boolean
  /** Formatted strikethrough original price (optional). */
  original?: string
  /** Formatted final price. */
  amount: string
  /** Render the (i) tooltip (hidden in German per spec). */
  showInfo?: boolean
  /** Tooltip copy variant. */
  infoVariant?: 'deal' | 'card'
}>()
</script>

<style scoped>
/* ──────────────────────────────────────────────────────────
   STRUCTURAL RULE — DO NOT BREAK
   ALL four items (lead chip/text · original · amount · icon)
   bottom-align on ONE line. The mechanism is uniform
   BOX-BOTTOM alignment:
     • row: align-items: flex-end  (one reference = box bottom)
     • text children: line-height 1 + text-box-trim so their
       box bottom == glyph baseline (font-size independent)
     • chip + icon: plain boxes, bottoms land on the same line
   DO NOT introduce `align-items: baseline`, per-item
   `align-self`, or magic `margin-bottom` nudges — mixing
   baseline with box-bottom is what made this drift for months.
   ────────────────────────────────────────────────────────── */
.sticky-price-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.sticky-price-row__lead--text,
.sticky-price-row__original,
.sticky-price-row__amount {
  line-height: 1;
  text-box-trim: trim-both;
  text-box-edge: cap alphabetic;
}

.sticky-price-row__lead--text {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text-primary);
}

/* Green % chip — a padded box; its bottom edge sits on the line.
   `margin-bottom: -1px` nudges the chip 1 px DOWN so its box
   bottom lines up exactly with the price digits' visual bottom. */
.sticky-price-row__lead--chip {
  flex-shrink: 0;
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  color: #fff;
  background: var(--color-discount);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: -1px;
}

.sticky-price-row__original {
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 13px;
  color: var(--color-error);
  text-decoration: line-through;
}

.sticky-price-row__amount {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* Icon box bottom on the same line. `margin-left: -4px` pulls it
   closer to the price — the row gap is 8 px, so the visible gap
   becomes ~4 px. */
.sticky-price-row :deep(.price-info) {
  align-self: flex-end;
  margin-left: -4px;
}
</style>
