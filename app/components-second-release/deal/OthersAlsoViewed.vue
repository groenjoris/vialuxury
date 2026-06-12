<template>
  <section v-if="cards.length > 0" class="others container">
    <header class="others__head">
      <h2 class="others__title">Anderen bekeken ook</h2>
      <p v-if="arrivalDate" class="others__sub">
        Beschikbaar op {{ formattedArrival }}
      </p>
    </header>

    <div class="others__grid">
      <SecondReleaseDealCard
        v-for="entry in cards"
        :key="entry.deal.id"
        :deal="entry.deal"
        :hotel="entry.hotel"
        grid-mode
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { SearchHotel, SearchHotelDeal } from '~/types/searchHotel'
import { mappedHotels } from '~/data/deals-mapper'

const props = defineProps<{
  /** The hotel currently displayed on the deal page (so we can pull
   *  sibling deals from it). */
  currentHotel: SearchHotel | null
  /** Id of the active deal — excluded from the recommendations. */
  currentDealId: string
}>()

const { arrivalDate } = useSecondReleaseSearchState()

interface CardEntry {
  hotel: SearchHotel
  deal: SearchHotelDeal
}

/** Three recommended deals.
 *  Step 1 — deals at the SAME hotel (excluding the current one),
 *  cheapest first.
 *  Step 2 — if fewer than 3, append deals from NEARBY hotels: same
 *  city first, then same region, then any other hotel. */
const cards = computed<CardEntry[]>(() => {
  const target = 3
  const list: CardEntry[] = []
  const seen = new Set<string>()
  seen.add(props.currentDealId)

  function push(hotel: SearchHotel, deal: SearchHotelDeal) {
    if (seen.has(deal.id)) return
    seen.add(deal.id)
    list.push({ hotel, deal })
  }

  if (props.currentHotel) {
    const sameHotelDeals = [...props.currentHotel.deals].sort(
      (a, b) => a.basePrice - b.basePrice,
    )
    for (const d of sameHotelDeals) {
      if (list.length >= target) break
      push(props.currentHotel, d)
    }
  }

  if (list.length < target) {
    // Bucket other hotels by proximity to currentHotel.
    const others = mappedHotels.filter(h => h.id !== props.currentHotel?.id)
    const sameCity = others.filter(h => h.city === props.currentHotel?.city)
    const sameRegion = others.filter(
      h => h.region === props.currentHotel?.region && h.city !== props.currentHotel?.city,
    )
    const rest = others.filter(
      h => h.city !== props.currentHotel?.city && h.region !== props.currentHotel?.region,
    )

    const ordered = [...sameCity, ...sameRegion, ...rest]
    for (const h of ordered) {
      if (list.length >= target) break
      // Pick the cheapest deal at that hotel.
      const cheapest = [...h.deals].sort((a, b) => a.basePrice - b.basePrice)[0]
      if (cheapest) push(h, cheapest)
    }
  }

  return list.slice(0, target)
})

/** "Vr 13 mrt 2026" style — locale-aware via Intl. */
const formattedArrival = computed(() => {
  const iso = arrivalDate.value
  if (!iso) return ''
  return new Intl.DateTimeFormat('nl-NL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
})
</script>

<style scoped>
.others {
  /* Match the lower full-width sections on the deal page (facilities /
     reviews / house-rules / FAQ): the same XL vertical padding plus
     an inset 1 px top divider in `--color-border-light`. */
  position: relative;
  padding: var(--space-xl) var(--space-lg);
}

.others::before {
  content: '';
  position: absolute;
  top: 0;
  left: var(--space-lg);
  right: var(--space-lg);
  height: 1px;
  background: var(--color-border-light);
}

.others__head {
  margin-bottom: var(--space-lg);
}

.others__title {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.2;
}

.others__sub {
  margin: 4px 0 0;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.others__grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--space-lg);
}

@media (max-width: 1023px) {
  .others__grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .others__grid {
    grid-template-columns: 1fr;
  }
}
</style>
