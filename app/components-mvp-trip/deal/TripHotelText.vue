<template>
  <!-- Multi Hotel Trip — tekst waarin de hotelnamen van de vakantie klikbaar
       zijn (subtiele onderstreping, oranje bij hover) en het hotel-sidepanel
       openen. Gebruikt in het dagprogramma (koppen, ondertitels) en de
       inclusielijst in de zijbalk. -->
  <span class="tht">
    <template v-for="(part, i) in parts" :key="i">
      <button
        v-if="part.stopIndex != null"
        type="button"
        class="tht__link"
        @click.stop="$emit('open-hotel', part.stopIndex)"
      >{{ part.text }}</button>
      <template v-else>{{ part.text }}</template>
    </template>
  </span>
</template>

<script setup lang="ts">
export interface TripHotelLink { name: string; stopIndex: number }

const props = defineProps<{
  text: string
  hotels: TripHotelLink[]
}>()

defineEmits<{ 'open-hotel': [stopIndex: number] }>()

/** Splits de tekst op de hotelnamen (langste eerst, zodat "Hotel de Zwaan"
 *  niet halverwege door een kortere naam wordt geknipt). */
const parts = computed(() => {
  const names = [...props.hotels].sort((a, b) => b.name.length - a.name.length).filter(h => h.name)
  const out: { text: string; stopIndex?: number }[] = []
  let rest = props.text
  while (rest.length) {
    let best: { idx: number; hotel: TripHotelLink } | null = null
    for (const h of names) {
      const idx = rest.indexOf(h.name)
      if (idx !== -1 && (!best || idx < best.idx)) best = { idx, hotel: h }
    }
    if (!best) { out.push({ text: rest }); break }
    if (best.idx > 0) out.push({ text: rest.slice(0, best.idx) })
    out.push({ text: best.hotel.name, stopIndex: best.hotel.stopIndex })
    rest = rest.slice(best.idx + best.hotel.name.length)
  }
  return out
})
</script>

<style scoped>
.tht__link {
  display: inline;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: var(--color-border, #c7c2b8);
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  transition: color 150ms ease, text-decoration-color 150ms ease;
}
.tht__link:hover,
.tht__link:focus-visible {
  color: var(--color-primary, #ff7e00);
  text-decoration-color: currentColor;
  outline: none;
}
</style>
