<!--
  VlPersonsPicker — Travel-group selector.

  A single-select list of "X personen / Y kamers" presets, mirroring the
  prototype's HotelSearchBar "who" MVP popup. Eight rows: 2 personen / 1
  kamer up to 16 personen / 8 kamers (persons = rooms × 2). Picking a row
  emits both the new persons and rooms counts.

  Props:
    - persons?: number  — currently selected persons. Default 2.
    - rooms?: number    — currently selected rooms. Default 1.

  Events:
    - update:persons  — new persons count.
    - update:rooms    — new rooms count.

  Fully decoupled: owns no shared state.
-->
<template>
  <ul class="who-mvp__list" role="listbox" aria-label="Aantal personen">
    <li
      v-for="opt in options"
      :key="`${opt.persons}-${opt.rooms}`"
      role="option"
      :aria-selected="isSelected(opt)"
      class="who-mvp__item"
      :class="{ 'who-mvp__item--selected': isSelected(opt) }"
      @click="pick(opt)"
    >
      <span>{{ opt.persons }} personen / {{ opt.rooms }} {{ roomsLabel(opt.rooms) }}</span>
      <svg
        v-if="isSelected(opt)"
        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
      >
        <polyline points="5 12 10 17 19 7" />
      </svg>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { roomsLabel } from '~/lib/utils/plural'

interface PersonsOption { persons: number; rooms: number }

const props = withDefaults(defineProps<{
  persons?: number
  rooms?: number
}>(), {
  persons: 2,
  rooms: 1,
})

const emit = defineEmits<{
  'update:persons': [val: number]
  'update:rooms': [val: number]
}>()

// 2 personen / 1 kamer … 16 personen / 8 kamers.
const options = computed<PersonsOption[]>(() => {
  const out: PersonsOption[] = []
  for (let r = 1; r <= 8; r++) out.push({ persons: r * 2, rooms: r })
  return out
})

function isSelected(opt: PersonsOption) {
  return opt.persons === props.persons && opt.rooms === props.rooms
}

function pick(opt: PersonsOption) {
  emit('update:persons', opt.persons)
  emit('update:rooms', opt.rooms)
}
</script>

<style scoped>
.who-mvp__list {
  list-style: none;
  margin: 0;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
}

.who-mvp__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 400;
  color: #0e0e0c;
  line-height: 1.2;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
}

.who-mvp__item:hover {
  background: rgba(233, 113, 50, 0.08);
  color: var(--color-primary);
}

.who-mvp__item--selected {
  font-weight: 600;
  color: var(--color-primary);
  background: rgba(233, 113, 50, 0.08);
}
</style>
