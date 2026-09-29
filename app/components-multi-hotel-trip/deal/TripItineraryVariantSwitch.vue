<template>
  <!-- Multi Hotel Trip — prototype-schakelaars van de vakantie-PDP in het
       zwevende paneel linksboven (zelfde systeem als op de homepage, zie
       PrototypeSwitchPanel): de variant van het voorbeeld-reisschema en, alleen
       bij "Final", de sub-varianten voor het reviewsblok en de inclusies. Een
       klik scrolt meteen naar het betreffende blok zodat je het verschil ziet.
       Alleen voor testen/stakeholders. -->
  <PrototypeSwitchPanel title="Prototype" storage-key="vl_mht_itinerary_switch_open_v2">
    <div class="psw__section">
      <span class="psw__label">Reisschema</span>
      <div class="psw__group" role="group" aria-label="Variant voorbeeld reisschema">
        <button
          v-for="v in ITINERARY_VARIANTS"
          :key="v.id"
          type="button"
          class="psw__btn"
          :class="{ 'psw__btn--on': variant === v.id }"
          :aria-pressed="variant === v.id"
          @click="pick(v.id)"
        >{{ v.label }}</button>
      </div>
    </div>
    <!-- Alle varianten: opmaak van de dagsamenvatting "Voorbeeld reisschema". -->
    <div class="psw__section">
      <span class="psw__label">Voorbeeld reisschema</span>
      <div class="psw__group" role="group" aria-label="Opmaak voorbeeld reisschema">
        <button
          v-for="o in SUMMARY_STYLE_OPTIONS"
          :key="o.id"
          type="button"
          class="psw__btn"
          :class="{ 'psw__btn--on': summaryStyle === o.id }"
          :aria-pressed="summaryStyle === o.id"
          @click="pickSummary(o.id)"
        >{{ o.label }}</button>
      </div>
    </div>
    <!-- Alle varianten: kerngetallen boven de dagsamenvatting aan/uit. -->
    <div class="psw__section">
      <span class="psw__label">Stats</span>
      <div class="psw__group" role="group" aria-label="Kerngetallen boven het voorbeeld reisschema">
        <button
          v-for="o in STATS_OPTIONS"
          :key="o.id"
          type="button"
          class="psw__btn"
          :class="{ 'psw__btn--on': stats === o.id }"
          :aria-pressed="stats === o.id"
          @click="pickStats(o.id)"
        >{{ o.label }}</button>
      </div>
    </div>
    <!-- Alleen bij "Final": sub-varianten voor het reviewsblok en de inclusies. -->
    <template v-if="variant === 'city'">
      <div class="psw__section">
        <span class="psw__label">Reviews</span>
        <div class="psw__group" role="group" aria-label="Reviews">
          <button
            v-for="o in FINAL_REVIEWS_OPTIONS"
            :key="o.id"
            type="button"
            class="psw__btn"
            :class="{ 'psw__btn--on': finalReviews === o.id }"
            :aria-pressed="finalReviews === o.id"
            @click="pickFinal('reviews', o.id)"
          >{{ o.label }}</button>
        </div>
      </div>
      <div class="psw__section">
        <span class="psw__label">Includes</span>
        <div class="psw__group" role="group" aria-label="Includes">
          <button
            v-for="o in FINAL_INCLUDES_OPTIONS"
            :key="o.id"
            type="button"
            class="psw__btn"
            :class="{ 'psw__btn--on': finalIncludes === o.id }"
            :aria-pressed="finalIncludes === o.id"
            @click="pickFinal('includes', o.id)"
          >{{ o.label }}</button>
        </div>
      </div>
    </template>
  </PrototypeSwitchPanel>
</template>

<script setup lang="ts">
import PrototypeSwitchPanel from '../global/PrototypeSwitchPanel.vue'
import { ITINERARY_VARIANTS, useMultiHotelTripItineraryVariant, type ItineraryVariant } from '~/composables-multi-hotel-trip/useMultiHotelTripItineraryVariant'
import { FINAL_REVIEWS_OPTIONS, FINAL_INCLUDES_OPTIONS, SUMMARY_STYLE_OPTIONS, STATS_OPTIONS, useMultiHotelTripFinalOptions, type FinalReviewsStyle, type FinalIncludesStyle, type SummaryStyle, type StatsSetting } from '~/composables-multi-hotel-trip/useMultiHotelTripFinalOptions'

const props = defineProps<{ /** Element-id om naartoe te scrollen na wisselen. */ target?: string }>()
const { variant, setVariant, restore } = useMultiHotelTripItineraryVariant()
const { reviews: finalReviews, includes: finalIncludes, summaryStyle, stats, restore: restoreFinal, setReviews, setIncludes, setSummaryStyle, setStats } = useMultiHotelTripFinalOptions()

onMounted(() => {
  restore()
  restoreFinal()
})

function scrollToBlock(id: string) {
  const el = [...document.querySelectorAll<HTMLElement>(`#${id}`)].find(e => e.offsetParent !== null)
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' })
}

async function pick(v: ItineraryVariant) {
  setVariant(v)
  if (!props.target) return
  await nextTick()
  scrollToBlock(props.target)
}

async function pickStats(v: StatsSetting) {
  setStats(v)
  await nextTick()
  scrollToBlock('reisschema')
}

async function pickSummary(v: SummaryStyle) {
  setSummaryStyle(v)
  await nextTick()
  scrollToBlock('reisschema')
}

/** Sub-variant kiezen en naar het betreffende blok scrollen, zodat je het verschil direct ziet. */
async function pickFinal(kind: 'reviews' | 'includes', v: string) {
  if (kind === 'reviews') setReviews(v as FinalReviewsStyle)
  else setIncludes(v as FinalIncludesStyle)
  await nextTick()
  scrollToBlock(kind === 'reviews' ? 'beoordelingen-vakantie' : 'inbegrepen')
}
</script>
