<template>
  <!-- Mobile-only "summary card" that takes the homepage search-pill's
       spot on the search results page. Whole card is one click target.
       Visual spec from Figma 5120:10486:
         - 4 px orange (#fb862d) border, 6 px radius
         - Row 1: destination, bold 14 px
         - Row 2: arrival · nights · group, bold 12 px, separated by
                  4 px round ORANGE dots (gap 4 px between items + dots)
         - Pencil icon top-right, 20 × 20, orange stroke. -->
  <button
    type="button"
    class="mss"
    :aria-label="'Wijzig je zoekopdracht'"
    @click="$emit('open')"
  >
    <div class="mss__rows">
      <div class="mss__name">
        <span class="mss__destination">{{ destinationLine }}</span>
        <span class="mss__pencil" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
        </span>
      </div>
      <div class="mss__detail">
        <span class="mss__chunk">{{ whenCombinedLabel }}</span>
        <span class="mss__dot" aria-hidden="true"></span>
        <span class="mss__chunk">{{ whoLabel }}</span>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
defineEmits<{ open: [] }>()

const search = useSecondReleaseSearchState()

/** Row 1: destination summary. Mirrors the homepage hint text logic —
 *  destinations, cities and hotels are joined with " · ", fallback to
 *  "Heel Nederland" when the user hasn't picked anything. */
const destinationLine = computed<string>(() => {
  const parts: string[] = []
  for (const id of search.selectedDestinations.value) {
    parts.push(prettyDestinationName(id))
  }
  for (const city of search.selectedCities.value) {
    parts.push(city.name)
  }
  for (const slug of search.selectedHotels.value) {
    parts.push(prettyHotelSlug(slug))
  }
  return parts.length ? parts.join(' · ') : 'Alle bestemmingen'
})

/** Row 2 — mirrors the desktop search-bar's "when" + "who" field
 *  placeholders so the summary reads exactly the same regardless of
 *  the platform.  Logic ported from SiteHeader.vue:
 *   - When = date (`dd/mm` + optional `±flex`) joined with nights
 *     count via " · "; empty fallback "Kies datum + duur".
 *   - Who = "<persons> personen / <rooms> kamer(s)". */
const whenCombinedLabel = computed<string>(() => {
  // Date part — empty fallback "Alle datums" per spec (was
  // "Flexibel"). When a date is picked we show dd/mm + optional ±flex.
  let datePart = 'Alle datums'
  const iso = search.committedArrivalDate.value
  if (iso) {
    const [, m, d] = iso.split('-')
    let label = `${d}/${m}`
    if (search.committedFlexibility.value > 0) label += ` ±${search.committedFlexibility.value}`
    datePart = label
  }
  // Duration part — per-field fallback "Elke reisduur"
  let durPart = 'Elke reisduur'
  const nights = search.selectedNights.value
  if (nights.length) {
    const sorted = [...nights].sort()
    if (sorted.length === 1) {
      const v = sorted[0]
      if (v === '1') durPart = '1 nacht'
      else if (v === '5+') durPart = '5+ nachten'
      else durPart = `${v} nachten`
    } else {
      durPart = `${sorted.join(' of ')} nachten`
    }
  }
  return `${datePart} · ${durPart}`
})

const whoLabel = computed<string>(() => {
  // Abbreviated form ("12 pers. / 6 kamers") so the row stays on
  // one line even at large group sizes on a narrow mobile viewport.
  const persons = search.persons.value
  const rooms = search.rooms.value
  const roomWord = rooms === 1 ? 'kamer' : 'kamers'
  return `${persons} pers. / ${rooms} ${roomWord}`
})

/** Cosmetic: destination IDs like "noord-holland" → "Noord-Holland". */
function prettyDestinationName(id: string): string {
  return id
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('-')
}
function prettyHotelSlug(slug: string): string {
  return slug
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}
</script>

<style scoped>
/* Card chrome — 4 px orange border, 6 px radius, 16 px inner padding,
   8 px gap between rows. Matches Figma 5120:10486. */
.mss {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 16px;
  background: #fff;
  border: 4px solid var(--color-primary, #e97132);
  /* 14 − 4 px border = 10 px inner curve, so the white interior
     reads as rounded too (not just the orange outer). */
  border-radius: 14px;
  text-align: left;
  cursor: pointer;
}
.mss:active {
  transform: translateY(1px);
}
.mss__rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}
/* Row 1: destination (left, flex grows + truncates) + pencil (right). */
.mss__name {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
}
.mss__destination {
  flex: 1 1 0;
  min-width: 0;
  font-family: var(--font-body, 'Basis Grotesque', sans-serif);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  color: #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mss__pencil {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary, #e97132);
}
/* Row 2: bold 12 px chunks separated by 4 px orange round dots, gap 4 px. */
.mss__detail {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  flex-wrap: wrap;
}
.mss__chunk {
  font-family: var(--font-body, 'Basis Grotesque', sans-serif);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  color: #000;
  white-space: nowrap;
}
.mss__dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--color-primary, #e97132);
  flex-shrink: 0;
}
</style>
