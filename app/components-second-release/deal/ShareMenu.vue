<template>
  <!-- Backdrop catches outside clicks to dismiss. -->
  <Teleport to="body">
    <div v-if="open" class="share-menu-backdrop" @click="$emit('close')" />
  </Teleport>

  <Transition name="share-menu-fade">
    <div v-if="open" class="share-menu" @click.stop>
      <span class="share-menu__arrow" />

      <div class="share-menu__header">
        <span class="share-menu__doc">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d6fe0" stroke-width="1.6" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M15.5 8.5l-2 5-5 2 2-5z" fill="#1d6fe0" stroke="none" />
          </svg>
        </span>
        <p class="share-menu__title">{{ title }}</p>
      </div>

      <div class="share-menu__sep" />

      <button
        v-for="item in apps"
        :key="item.label"
        type="button"
        class="share-menu__row"
        @click="$emit('close')"
      >
        <span class="share-menu__icon" :style="{ background: item.bg }">{{ item.glyph }}</span>
        <span class="share-menu__label">{{ item.label }}</span>
      </button>

      <div class="share-menu__sep" />

      <button
        v-for="item in extras"
        :key="item.label"
        type="button"
        class="share-menu__row"
        @click="$emit('close')"
      >
        <span class="share-menu__icon share-menu__icon--plain">{{ item.glyph }}</span>
        <span class="share-menu__label">{{ item.label }}</span>
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  open: boolean
  title?: string
}>(), {
  title: 'Ik heb een mooi luxe hotel gevonden',
})

defineEmits<{ close: [] }>()

/** Static, non-functional share targets (prototype only). */
const apps = [
  { label: 'AirDrop', glyph: '📡', bg: 'linear-gradient(160deg,#3aa0ff,#1d6fe0)' },
  { label: 'Mail', glyph: '✉️', bg: 'linear-gradient(160deg,#5ac8fa,#1f8cf0)' },
  { label: 'Messages', glyph: '💬', bg: 'linear-gradient(160deg,#5be35b,#21c04a)' },
  { label: 'Notes', glyph: '🗒️', bg: 'linear-gradient(160deg,#fff0a8,#ffd84d)' },
  { label: 'Reminders', glyph: '📋', bg: '#fff' },
  { label: 'Shortcuts', glyph: '🔀', bg: 'linear-gradient(160deg,#7a5cff,#e0489a)' },
]
const extras = [
  { label: 'Copy', glyph: '⧉' },
  { label: 'Edit Extensions…', glyph: '⮞' },
]
</script>

<style scoped>
.share-menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1190;
}

.share-menu {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  z-index: 1200;
  width: 300px;
  padding: 6px;
  background: rgba(250, 250, 250, 0.98);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.22);
  font-family: var(--font-body);
}

/* Little upward pointer toward the share button. */
.share-menu__arrow {
  position: absolute;
  top: -7px;
  left: 18px;
  width: 14px;
  height: 14px;
  background: rgba(250, 250, 250, 0.98);
  border-left: 1px solid rgba(0, 0, 0, 0.08);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  transform: rotate(45deg);
}

.share-menu__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 10px 12px;
}

.share-menu__doc {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-menu__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.25;
  color: #1a1a1a;
}

.share-menu__sep {
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
  margin: 4px 6px;
}

.share-menu__row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 7px 8px;
  border: none;
  background: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}
.share-menu__row:hover {
  background: rgba(0, 0, 0, 0.06);
}

.share-menu__icon {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
}
.share-menu__icon--plain {
  background: none;
  box-shadow: none;
  font-size: 17px;
  color: #444;
}

.share-menu__label {
  font-size: 15px;
  color: #1a1a1a;
}

.share-menu-fade-enter-active,
.share-menu-fade-leave-active {
  transition: opacity 120ms ease, transform 120ms ease;
}
.share-menu-fade-enter-from,
.share-menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
