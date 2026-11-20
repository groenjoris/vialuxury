<script setup lang="ts">
defineEmits<{ zoomIn: []; zoomOut: [] }>()
</script>

<template>
  <div class="map-zoom-controls">
    <button type="button" class="map-zoom-controls__btn" aria-label="Inzoomen" @click="$emit('zoomIn')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
    <div class="map-zoom-controls__divider" />
    <button type="button" class="map-zoom-controls__btn" aria-label="Uitzoomen" @click="$emit('zoomOut')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <path d="M5 12h14" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.map-zoom-controls {
  position: absolute;
  bottom: var(--space-lg);
  right: var(--space-lg);
  z-index: 500;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.map-zoom-controls__btn {
  background: var(--color-surface);
  border: 0;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-primary);
  transition: background var(--transition-fast);
}

.map-zoom-controls__btn:hover {
  background: var(--color-background-secondary);
}

.map-zoom-controls__divider {
  height: 1px;
  background: var(--color-border-light);
}
</style>
