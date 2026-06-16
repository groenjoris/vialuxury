<!--
  DurationPicker — Night-count selector.

  A vertical list of checkbox-style night options plus a "Maakt niet uit"
  (any duration) option at the top. A subtitle under the title hints that
  multiple durations can be selected ("Je kunt er meerdere kiezen", copied
  from the prototype's DateAndDurationPopup). Toggling a specific night
  clears "any duration"; toggling "any duration" clears the specific nights.

  Props:
    - modelValue: string[]   — currently selected night ids, e.g. ['2','3'].
    - options?: { id: string; label: string }[]
                             — selectable nights. Default 1–5+ nachten.
    - anyDuration?: boolean  — when true, "Maakt niet uit" is checked.

  Events:
    - update:modelValue   — new array of selected night ids.
    - update:anyDuration  — new "Maakt niet uit" state.

  Fully decoupled: emits changes, owns no shared state. The consumer
  decides how selecting one clears the other (the component emits both
  events so a parent that mirrors the prototype gets matching behaviour).
-->
<template>
  <div class="dur-pop">
    <h4 class="dur-pop__title">Kies reisduur</h4>
    <p class="dur-pop__hint">Je kunt er meerdere kiezen</p>

    <div class="dur-pop__list">
      <!-- "Maakt niet uit" — clears every specific night. -->
      <label class="dur-check" :class="{ 'dur-check--selected': anyDuration }">
        <input
          type="checkbox"
          class="dur-check__input"
          :checked="anyDuration"
          @change="onAnyDurationChange(($event.target as HTMLInputElement).checked)"
        />
        <span class="dur-check__box" aria-hidden="true">
          <svg
            v-if="anyDuration"
            width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="3"
            stroke-linecap="round" stroke-linejoin="round"
          >
            <polyline points="5 12 10 17 19 7" />
          </svg>
        </span>
        <span class="dur-check__label">Maakt niet uit</span>
      </label>

      <label
        v-for="opt in options"
        :key="opt.id"
        class="dur-check"
        :class="{ 'dur-check--selected': modelValue.includes(opt.id) }"
      >
        <input
          type="checkbox"
          class="dur-check__input"
          :checked="modelValue.includes(opt.id)"
          @change="toggleNight(opt.id)"
        />
        <span class="dur-check__box" aria-hidden="true">
          <svg
            v-if="modelValue.includes(opt.id)"
            width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="3"
            stroke-linecap="round" stroke-linejoin="round"
          >
            <polyline points="5 12 10 17 19 7" />
          </svg>
        </span>
        <span class="dur-check__label">{{ opt.label }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DurationOption { id: string; label: string }

const props = withDefaults(defineProps<{
  modelValue: string[]
  options?: DurationOption[]
  anyDuration?: boolean
}>(), {
  options: () => [
    { id: '1', label: '1 nacht' },
    { id: '2', label: '2 nachten' },
    { id: '3', label: '3 nachten' },
    { id: '4', label: '4 nachten' },
    { id: '5+', label: '5+ nachten' },
  ],
  anyDuration: false,
})

const emit = defineEmits<{
  'update:modelValue': [val: string[]]
  'update:anyDuration': [val: boolean]
}>()

function toggleNight(id: string) {
  const next = [...props.modelValue]
  const i = next.indexOf(id)
  if (i === -1) next.push(id)
  else next.splice(i, 1)
  emit('update:modelValue', next)
  // Selecting a specific night cancels "any duration".
  if (next.length > 0 && props.anyDuration) emit('update:anyDuration', false)
}

function onAnyDurationChange(next: boolean) {
  emit('update:anyDuration', next)
  // "Maakt niet uit" wipes the specific-night selection.
  if (next && props.modelValue.length > 0) emit('update:modelValue', [])
}
</script>

<style scoped>
.dur-pop {
  display: flex;
  flex-direction: column;
  padding: 24px;
  min-width: 0;
}

.dur-pop__title {
  margin: 0;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
  color: #1a1a1a;
}

/* Subtitle hint — "Je kunt er meerdere kiezen", matching the prototype's
   when-pop__hint (14px, grey, sits under the title). */
.dur-pop__hint {
  margin: 4px 0 16px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 400;
  color: #999999;
  line-height: 1;
}

.dur-pop__list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Night-count checkboxes. */
.dur-check {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 400;
  color: #1a1a1a;
  line-height: 1.2;
  transition: color 150ms ease;
}

.dur-check__input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.dur-check__box {
  width: 18px;
  height: 18px;
  border: 1.5px solid #c7c7c7;
  border-radius: 4px;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
  transition: background 150ms ease, border-color 150ms ease;
}

.dur-check:hover .dur-check__box { border-color: var(--color-primary); }

.dur-check--selected .dur-check__box {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.dur-check--selected .dur-check__label { color: var(--color-primary); }
</style>
