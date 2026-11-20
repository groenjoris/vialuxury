<script setup lang="ts">
const props = withDefaults(defineProps<{
  value: number
  size?: 'sm' | 'md' | 'lg'
  showCents?: boolean
  bold?: boolean
  strike?: boolean
  color?: string
}>(), {
  size: 'md',
  showCents: true,
  bold: false,
  strike: false,
  color: 'inherit',
})

const euros = computed(() => Math.floor(Math.abs(props.value)))
const cents = computed(() => {
  const c = Math.round((Math.abs(props.value) - euros.value) * 100)
  return String(c).padStart(2, '0')
})
</script>

<template>
  <span class="price" :class="[`price--${size}`, { 'price--bold': bold, 'price--strike': strike }]" :style="{ color }">
    <span class="price__cur">€</span>
    <span class="price__int">{{ euros }}</span>
    <span v-if="showCents" class="price__cents">,{{ cents }}</span>
  </span>
</template>

<style scoped>
.price {
  display: inline-flex;
  align-items: baseline;
  font-weight: 500;
  white-space: nowrap;
  line-height: 1;
}
.price--bold {
  font-weight: var(--w-black);
}
.price--strike {
  text-decoration: line-through;
}
.price__cents {
  font-size: 0.75em;
  margin-left: 1px;
}
.price--sm { font-size: 14px; }
.price--md { font-size: 16px; }
.price--lg { font-size: 20px; }
</style>
