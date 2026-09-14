<template>
  <!-- Multi Hotel Trip — dagprogramma op de vakantie-PDP. Per dag een sectie
       ("Dag 1", met datum zodra er een aankomstdatum is) met 2–3 blokken
       onder elkaar: altijd foto links, tekst rechts. Inchecken toont het
       hotel met een link naar de hotel-pop-up; uitcheckdagen beginnen met
       wat je onderweg kunt doen. `stacked` (mobiel) zet foto boven tekst. -->
  <div class="itin" :class="{ 'itin--stacked': stacked }">
    <section v-for="day in days" :key="day.day" class="itin-day">
      <header class="itin-day__head">
        <h3 class="itin-day__title">
          {{ day.label }}
          <span v-if="day.date" class="itin-day__date">{{ day.date }}</span>
        </h3>
        <p v-if="day.subtitle" class="itin-day__subtitle">{{ day.subtitle }}</p>
      </header>

      <div class="itin-day__blocks">
        <article
          v-for="(block, i) in day.blocks"
          :key="`${day.day}-${i}`"
          class="itin-block"
          :class="`itin-block--${block.kind}`"
        >
          <div class="itin-block__media">
            <img v-if="block.image" :src="block.image" :alt="block.title" loading="lazy" />
            <span class="itin-block__tag">{{ block.tag }}</span>
          </div>
          <div class="itin-block__body">
            <h4 class="itin-block__title">
              {{ block.title }}
              <span v-if="block.starRating" class="itin-block__stars" aria-hidden="true">
                <span v-for="n in block.starRating" :key="n" class="itin-block__star"><svg viewBox="0 0 18 18" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M16.963,6.786c-.088-.271-.323-.469-.605-.51l-4.62-.671L9.672,1.418c-.252-.512-1.093-.512-1.345,0l-2.066,4.186-4.62,.671c-.282,.041-.517,.239-.605,.51-.088,.271-.015,.57,.19,.769l3.343,3.258-.79,4.601c-.048,.282,.067,.566,.298,.734,.231,.167,.538,.189,.79,.057l4.132-2.173,4.132,2.173c.11,.058,.229,.086,.349,.086,.155,0,.31-.048,.441-.143,.231-.168,.347-.452,.298-.734l-.79-4.601,3.343-3.258c.205-.199,.278-.498,.19-.769Z"/></svg></span>
              </span>
            </h4>
            <p v-if="block.meta" class="itin-block__meta">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4.5 9.75768C4.5 15.5 12 22 12 22C12 22 19.5 15.5 19.5 9.75768C19.5 4.81181 15.6559 2 12 2C8.34409 2 4.5 4.81181 4.5 9.75768Z" /><path d="M12 12C13.3807 12 14.5 10.8807 14.5 9.5C14.5 8.11929 13.3807 7 12 7C10.6193 7 9.5 8.11929 9.5 9.5C9.5 10.8807 10.6193 12 12 12Z" />
              </svg>
              {{ block.meta }}
            </p>
            <p class="itin-block__text">{{ block.text }}</p>
            <button
              v-if="block.stopIndex != null && block.kind === 'checkin'"
              type="button"
              class="itin-block__link"
              @click="$emit('open-hotel', block.stopIndex)"
            >{{ t('trip.moreAboutHotel') }}</button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
export type TripBlockKind = 'checkin' | 'checkout' | 'activity' | 'dinner' | 'homeward'

/** Eén blok in het dagprogramma, al vertaald door de dealpagina. */
export interface TripBlockView {
  kind: TripBlockKind
  /** Korte label linksboven op de foto: "Inchecken", "Onderweg", "Diner", … */
  tag: string
  title: string
  text: string
  image?: string
  /** Hotelblok: sterren en plaats/streek. */
  starRating?: number
  meta?: string
  /** Index van het hotel (voor de hotel-pop-up). */
  stopIndex?: number
}

export interface TripDayView {
  day: number
  /** "Dag 1" */
  label: string
  /** "do 18 sep" — alleen met gekozen aankomstdatum. */
  date?: string
  /** "Béthune" of "Béthune → Tilques" */
  subtitle?: string
  blocks: TripBlockView[]
}

withDefaults(defineProps<{
  days: TripDayView[]
  /** Mobiel: foto boven de tekst. */
  stacked?: boolean
}>(), { stacked: false })

defineEmits<{ 'open-hotel': [stopIndex: number] }>()

const { t } = useMultiHotelTripI18n()
</script>

<style scoped>
.itin {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}
.itin-day + .itin-day {
  padding-top: var(--space-xl);
  border-top: 1px solid var(--color-border-light);
}
.itin-day__head { margin-bottom: var(--space-md); }
.itin-day__title {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--color-text-primary);
}
.itin-day__date {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
}
.itin-day__subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}
.itin-day__blocks {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

/* Blok: foto links (vaste breedte), tekst rechts. */
.itin-block {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: var(--space-lg);
  align-items: start;
}
.itin-block__media {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-background-secondary);
}
.itin-block__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
/* Soortlabel linksboven op de foto ("Inchecken", "Onderweg", "Diner"). */
.itin-block__tag {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.94);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
.itin-block--checkin .itin-block__tag,
.itin-block--checkout .itin-block__tag,
.itin-block--homeward .itin-block__tag {
  background: var(--color-primary, #ff7e00);
  color: #fff;
}
.itin-block__body { min-width: 0; padding-top: 2px; }
.itin-block__title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 4px;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-text-primary);
}
.itin-block__stars { display: inline-flex; align-items: center; gap: 1px; }
.itin-block__star { font-size: 15px; line-height: 1; color: #141414; display: inline-flex; }
.itin-block__meta {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0 0 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.itin-block__text {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: var(--color-text-secondary);
}
/* Dezelfde oranje onderstreepte link als "Lees meer" op de dealpagina. */
.itin-block__link {
  display: inline-block;
  margin-top: 8px;
  padding: 0;
  background: none;
  border: none;
  color: var(--color-primary);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}
.itin-block__link:hover { color: var(--color-primary-hover); }

.itin--stacked .itin-block { grid-template-columns: 1fr; gap: var(--space-sm); }
@media (max-width: 767px) {
  .itin-block { grid-template-columns: 1fr; gap: var(--space-sm); }
  .itin-day__title { font-size: 18px; }
}
</style>
