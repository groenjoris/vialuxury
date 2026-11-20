<script setup lang="ts">
defineProps<{ label: string; icon?: string }>()

// Minimal inline icon set for room amenities.
const paths: Record<string, string> = {
  bed: 'M3 18v-6a2 2 0 012-2h14a2 2 0 012 2v6M3 18h18M3 18v2M21 18v2M6 10V8a1 1 0 011-1h4v3',
  wifi: 'M5 12.5a10 10 0 0114 0M8 15.5a6 6 0 018 0M12 19h.01',
  shower: 'M4 20l2-6M10 20l1-4M17 4a3 3 0 00-3 3v4M14 11h7M4 11h6M12 14h.01M15 15h.01M13 17h.01',
  window: 'M4 4h16v16H4zM12 4v16M4 12h16',
  tv: 'M3 5h18v12H3zM8 21h8M12 17v4',
  sofa: 'M5 11V8a2 2 0 012-2h10a2 2 0 012 2v3M3 13a2 2 0 012-2 2 2 0 012 2v3h10v-3a2 2 0 014 0v5H3zM5 18v2M19 18v2',
  safe: 'M4 4h16v16H4zM8 8h8v8H8zM12 10v4M12 12h.01M18 4v16',
  lamp: 'M9 3h6l2 6H7zM12 9v9M8 21h8',
  ac: 'M3 5h18v8H3zM6 16v2M10 16v2M14 16v2M18 16v2M6 9h.01M9 9h6',
}
</script>

<template>
  <span class="facility">
    <svg class="facility__icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path :d="paths[icon ?? ''] ?? paths.bed" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <span>{{ label }}</span>
  </span>
</template>

<style scoped>
.facility {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  line-height: 16px;
  color: var(--c-via-black);
  background: var(--c-white);
  border: 1px solid var(--c-light-grey);
  border-radius: 6px;
  padding: 4px 10px;
}
.facility__icon {
  color: var(--c-via-black);
  flex-shrink: 0;
}
</style>
