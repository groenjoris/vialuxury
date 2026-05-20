<template>
  <span
    class="deal-label"
    :class="`deal-label--${variant}`"
  >{{ text }}</span>
</template>

<script setup lang="ts">
/**
 * Software-rendered deal-label pill. Replaces the per-key PNG/SVG images
 * formerly served from /images/labels/. Two visual variants only:
 *   - black: urgency / exclusivity (SUPER DEAL, NIEUW!, LAST MINUTE, EXCLUSIEF)
 *   - green: comfort / category (WELLNESS, Spa kamer)
 * Unknown keys fall back to black.
 */

const props = defineProps<{
  keyName: string
}>()

type Variant = 'black' | 'green'

const LABEL_TEXT: Record<string, string> = {
  'wellness': 'WELLNESS',
  'spa-kamer': 'SPA KAMER',
  'super-deal': 'SUPER DEAL',
  'exclusief': 'EXCLUSIEF',
  'last-minute': 'LAST MINUTE',
  'nieuw': 'NIEUW!',
}

const VARIANT: Record<string, Variant> = {
  'wellness': 'green',
  'spa-kamer': 'green',
  'super-deal': 'black',
  'exclusief': 'black',
  'last-minute': 'black',
  'nieuw': 'black',
}

const text = computed(() => LABEL_TEXT[props.keyName] || props.keyName.replace(/-/g, ' ').toUpperCase())
const variant = computed<Variant>(() => VARIANT[props.keyName] || 'black')
</script>

<style scoped>
.deal-label {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 6px;
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.5px;
  line-height: 1.2;
  color: #fff;
  white-space: nowrap;
}

.deal-label--black {
  background: #1A1A1A;
}

.deal-label--green {
  background: #6EC5B6;
}
</style>
