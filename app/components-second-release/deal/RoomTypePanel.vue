<template>
  <Teleport to="body">
    <Transition name="panel">
      <div v-if="isOpen" class="panel-overlay" @click.self="$emit('close')">
        <aside class="panel" @wheel.stop @touchmove.stop>
          <div class="panel__header">
            <h2 class="panel__title">Kies kamertype</h2>
            <p v-if="guestsLabel" class="panel__subtitle">{{ guestsLabel }}</p>
            <button class="panel__close" @click="$emit('close')" aria-label="Sluiten">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="panel__body">
            <div
              v-for="room in rooms"
              :key="room.id"
              class="room-card"
              :class="{ 'room-card--current': room.id === currentRoomId }"
            >
              <div v-if="room.image" class="room-card__image">
                <img :src="room.image" :alt="localized(room.name)" loading="lazy" />
                <!-- Availability — on the photo, lower right -->
                <span class="room-card__avail">Nog {{ room.maxAvailable ?? 5 }} beschikbaar</span>
              </div>
              <div class="room-card__body">
                <h3 class="room-card__name">{{ localized(room.name) }}</h3>
                <p class="room-card__desc">{{ localized(room.description) }}</p>
                <ul v-if="room.features.length" class="room-card__features">
                  <li v-for="f in room.features" :key="localized(f)">{{ localized(f) }}</li>
                </ul>
                <!-- Footer: price lower-left, button right -->
                <div class="room-card__footer">
                  <span class="room-card__price">{{ priceLabel(room) }}</span>
                  <span v-if="room.id === currentRoomId" class="room-card__selected">Geselecteerd</span>
                  <button
                    v-else
                    type="button"
                    class="room-card__select-btn"
                    @click="$emit('select', room.id)"
                  >Selecteer</button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { RoomOption } from '~/types/deal'
import { formatPrice } from '~/utils-second-release/formatPrice'
import { useBodyScrollLock } from '~/composables-second-release/useBodyScrollLock'

const props = defineProps<{
  isOpen: boolean
  /** Selectable room types (current one included, suitable ones only). */
  rooms: RoomOption[]
  /** The card's current room-type id — shown as the active selection. */
  currentRoomId: string
  /** Price baseline: the current room's priceExtra. */
  currentPriceExtra: number
  /** "Voor gast 1 en gast 2" — only when multiple room-type cards exist. */
  guestsLabel?: string | null
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'select', roomId: string): void
}>()

const { localized } = useSecondReleaseI18n()

/** "Upgrade voor €75" relative to the card's current room; the base room
 *  reads "Inbegrepen". */
function priceLabel(room: RoomOption): string {
  if (room.isDefault) return 'Inbegrepen'
  const diff = room.priceExtra - props.currentPriceExtra
  if (diff > 0) return `Upgrade voor ${formatPrice(diff)}`
  if (diff === 0) return 'Geen meerprijs'
  return 'Inbegrepen'
}

// Lock the page behind the panel while open.
const scrollLock = useBodyScrollLock()
let acquired = false
watch(() => props.isOpen, (open) => {
  if (open && !acquired) { scrollLock.acquire(); acquired = true }
  else if (!open && acquired) { scrollLock.release(); acquired = false }
}, { immediate: true })
onBeforeUnmount(() => { if (acquired) { scrollLock.release(); acquired = false } })
</script>

<style scoped>
.panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.panel {
  width: 420px;
  max-width: 95vw;
  background: var(--color-surface);
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 30px rgba(0, 0, 0, 0.15);
}

.panel__header {
  position: relative;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.panel__title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  padding-right: 44px;
}

.panel__subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 4px 0 0;
}

.panel__close {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--color-background-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-primary);
}

.panel__close:hover {
  background: var(--color-border);
}

.panel__body {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: var(--space-md) var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

/* Room option card — no orange stroke; the current selection gets a
   subtle dark border instead. flex-shrink: 0 is essential: the cards
   live in a flex-column scroll body and would otherwise be squashed
   to fit the viewport, clipping everything but the photo. */
.room-card {
  flex-shrink: 0;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-surface);
}

.room-card--current {
  border-color: var(--color-dark);
}

.room-card__image {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.room-card__image img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Availability sticker — photo, lower right */
.room-card__avail {
  position: absolute;
  right: 10px;
  bottom: 10px;
  background: var(--color-dark);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  pointer-events: none;
}

.room-card__body {
  padding: var(--space-md);
}

.room-card__name {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 6px;
}

.room-card__desc {
  font-size: 13px;
  line-height: 1.55;
  color: var(--color-text-secondary);
  margin: 0 0 8px;
}

.room-card__features {
  list-style: none;
  margin: 0 0 10px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.room-card__features li {
  font-size: 13px;
  color: var(--color-text-secondary);
  padding-left: 16px;
  position: relative;
}

.room-card__features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--color-discount);
  font-weight: 700;
}

/* Footer: price lower-left, select button right */
.room-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.room-card__price {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.room-card__select-btn {
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  padding: 9px 18px;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.room-card__select-btn:hover {
  background: var(--color-primary-hover);
}

.room-card__selected {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.room-card__selected::before {
  content: '✓';
  color: var(--color-discount);
}

/* Slide-in transition (matches the other side panels) */
.panel-enter-active,
.panel-leave-active {
  transition: opacity 300ms ease;
}

.panel-enter-active .panel,
.panel-leave-active .panel {
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
}

.panel-enter-from .panel,
.panel-leave-to .panel {
  transform: translateX(100%);
}
</style>
