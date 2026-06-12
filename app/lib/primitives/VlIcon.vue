<template>
  <svg
    class="vl-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    role="img"
  >
    <path
      v-for="(d, i) in paths"
      :key="i"
      :d="d"
    />
  </svg>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  name: string
  size?: number
}>(), {
  size: 20,
})

/**
 * Built-in stroke-based icon set. Each entry is one or more SVG path
 * `d` strings drawn on a 24×24 grid, rendered with currentColor.
 */
const ICONS: Record<string, string[]> = {
  'search': [
    'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z',
    'm21 21-4.35-4.35',
  ],
  'close': [
    'M18 6 6 18',
    'm6 6 12 12',
  ],
  'chevron-left': [
    'm15 18-6-6 6-6',
  ],
  'chevron-right': [
    'm9 18 6-6-6-6',
  ],
  'heart': [
    'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z',
  ],
  'share': [
    'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    'M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    'M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    'm8.59 13.51 6.83 3.98',
    'm15.41 6.51-6.82 3.98',
  ],
  'map-pin': [
    'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z',
    'M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  ],
  'calendar': [
    'M8 2v4',
    'M16 2v4',
    'M3 10h18',
    'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
  ],
  'clock': [
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
    'M12 6v6l4 2',
  ],
  'users': [
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
    'M22 21v-2a4 4 0 0 0-3-3.87',
    'M16 3.13a4 4 0 0 1 0 7.75',
  ],
  'check': [
    'M20 6 9 17l-5-5',
  ],
  'phone': [
    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z',
  ],
  'info': [
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
    'M12 16v-4',
    'M12 8h.01',
  ],
  'star': [
    'M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2Z',
  ],
  'plus': [
    'M12 5v14',
    'M5 12h14',
  ],
  'minus': [
    'M5 12h14',
  ],
}

const paths = computed(() => ICONS[props.name] ?? [])
</script>

<style scoped>
.vl-icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
}
</style>
