<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="store.isTravelGroupModalOpen" class="modal-overlay" @click.self="store.closeTravelGroupModal()">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="travel-group-title">
          <div class="modal__header">
            <h2 id="travel-group-title" class="modal__title">{{ t('travelGroup.title') }}</h2>
            <button class="modal__close" @click="store.closeTravelGroupModal()" :aria-label="t('common.close')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="modal__body">
            <!-- Adults -->
            <div class="modal__row">
              <div class="modal__row-info">
                <span class="modal__row-label">{{ t('travelGroup.adults') }}</span>
                <span class="modal__row-sub">{{ t('header.adultsAge') }}</span>
              </div>
              <div class="stepper">
                <button
                  class="stepper__btn"
                  :disabled="localGroup.adults <= 1"
                  @click="localGroup.adults = Math.max(1, localGroup.adults - 1)"
                  :aria-label="`${t('travelGroup.adults')} -`"
                >−</button>
                <span class="stepper__value">{{ localGroup.adults }}</span>
                <button
                  class="stepper__btn"
                  :disabled="localGroup.adults >= 6"
                  @click="localGroup.adults = Math.min(6, localGroup.adults + 1)"
                  :aria-label="`${t('travelGroup.adults')} +`"
                >+</button>
              </div>
            </div>

            <!-- Children -->
            <div class="modal__row">
              <div class="modal__row-info">
                <span class="modal__row-label">{{ t('travelGroup.children') }}</span>
                <span class="modal__row-sub">{{ t('header.childrenAge') }}</span>
              </div>
              <div class="stepper">
                <button
                  class="stepper__btn"
                  :disabled="localGroup.children.length <= 0"
                  @click="removeChild()"
                  :aria-label="`${t('travelGroup.children')} -`"
                >−</button>
                <span class="stepper__value">{{ localGroup.children.length }}</span>
                <button
                  class="stepper__btn"
                  :disabled="localGroup.children.length >= 4"
                  @click="addChild()"
                  :aria-label="`${t('travelGroup.children')} +`"
                >+</button>
              </div>
            </div>

            <!-- Child ages -->
            <Transition name="slide">
              <div v-if="localGroup.children.length > 0" class="modal__children-ages">
                <div
                  v-for="(child, index) in localGroup.children"
                  :key="child.id"
                  class="modal__child-age"
                >
                  <label :for="`child-age-${index}`" class="modal__age-label">
                    {{ t('travelGroup.childAge') }} {{ index + 1 }}
                  </label>
                  <select
                    :id="`child-age-${index}`"
                    v-model.number="child.age"
                    class="modal__age-select"
                  >
                    <option v-for="age in 18" :key="age - 1" :value="age - 1">
                      {{ age - 1 }} {{ t('travelGroup.years') }}
                    </option>
                  </select>
                </div>
              </div>
            </Transition>

            <!-- Rooms -->
            <div class="modal__row">
              <div class="modal__row-info">
                <span class="modal__row-label">{{ t('travelGroup.rooms') }}</span>
              </div>
              <div class="stepper">
                <button
                  class="stepper__btn"
                  :disabled="localGroup.rooms <= 1"
                  @click="localGroup.rooms = Math.max(1, localGroup.rooms - 1)"
                  :aria-label="`${t('travelGroup.rooms')} -`"
                >−</button>
                <span class="stepper__value">{{ localGroup.rooms }}</span>
                <button
                  class="stepper__btn"
                  :disabled="localGroup.rooms >= 4"
                  @click="localGroup.rooms = Math.min(4, localGroup.rooms + 1)"
                  :aria-label="`${t('travelGroup.rooms')} +`"
                >+</button>
              </div>
            </div>
          </div>

          <div class="modal__footer">
            <button class="btn btn-primary modal__apply" @click="apply">
              {{ t('common.apply') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useDealStore } from '~/stores/deal'
import type { TravelGroup, ChildEntry } from '~/types/deal'

const { t } = useI18n()
const store = useDealStore()

// Local copy for editing (don't mutate store directly)
const localGroup = ref<TravelGroup>({
  adults: 2,
  children: [],
  rooms: 1,
})

// Sync local state when modal opens
watch(() => store.isTravelGroupModalOpen, (open) => {
  if (open) {
    localGroup.value = {
      adults: store.travelGroup.adults,
      children: store.travelGroup.children.map(c => ({ ...c })),
      rooms: store.travelGroup.rooms,
    }
  }
})

let childIdCounter = 0

function addChild() {
  localGroup.value.children.push({
    id: `child-${++childIdCounter}`,
    age: 4,
  })
}

function removeChild() {
  localGroup.value.children.pop()
}

function apply() {
  store.setTravelGroup(localGroup.value)
  store.closeTravelGroupModal()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-md);
}

.modal {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.modal__title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.modal__close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--color-background-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--transition-fast);
  color: var(--color-text-primary);
}

.modal__close:hover {
  background: var(--color-border);
}

.modal__body {
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: 0;
}

.modal__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.modal__row:last-child {
  border-bottom: none;
}

.modal__row-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.modal__row-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.modal__row-sub {
  font-size: 13px;
  color: var(--color-text-muted);
}

/* Stepper */
.stepper {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.stepper__btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-size: 18px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-text-primary);
  line-height: 1;
}

.stepper__btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.stepper__btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.stepper__value {
  min-width: 24px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
}

/* Children ages */
.modal__children-ages {
  padding: var(--space-md) 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  border-bottom: 1px solid var(--color-border-light);
}

.modal__child-age {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.modal__age-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.modal__age-select {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: var(--color-surface);
  min-width: 100px;
  cursor: pointer;
}

.modal__age-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(251, 134, 45, 0.15);
}

/* Footer */
.modal__footer {
  padding: var(--space-md) var(--space-lg) var(--space-lg);
}

.modal__apply {
  width: 100%;
  padding: 14px;
  font-size: 16px;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 250ms ease;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 250ms ease, opacity 250ms ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: translateY(16px);
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 200ms ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 300px;
}
</style>
