<template>
  <!-- Multi Hotel Trip — "In deze vakantie zijn deze hotels inbegrepen":
       per hotel een blok over de volle breedte van de linkerkolom.
       Kop: Dag x en y (+ check-in/check-out zodra een datum gekozen is),
       hotelnaam + sterren, locatie. Daaronder twee kolommen: foto links,
       "Inclusief"-vinkjes rechts. `stacked` (mobiel) zet de kolommen onder
       elkaar. -->
  <div class="trip-stops" :class="{ 'trip-stops--stacked': stacked }">
    <article v-for="(stop, i) in stops" :key="`${stop.hotelName}-${i}`" class="trip-stop">
      <header class="trip-stop__head">
        <div class="trip-stop__days-row">
          <span class="trip-stop__days">{{ stop.dayLabel }}</span>
          <span v-if="stop.checkIn && stop.checkOut" class="trip-stop__dates">
            <span class="trip-stop__date">
              <span class="trip-stop__date-label">{{ t('trip.checkIn') }}</span> {{ stop.checkIn }}
            </span>
            <span class="trip-stop__date-sep" aria-hidden="true">·</span>
            <span class="trip-stop__date">
              <span class="trip-stop__date-label">{{ t('trip.checkOut') }}</span> {{ stop.checkOut }}
            </span>
          </span>
        </div>
        <h3 class="trip-stop__name">
          <NuxtLink v-if="stop.hotelSlug" :to="`/multi-hotel-trip/hotel/${stop.hotelSlug}`" class="trip-stop__name-link">{{ stop.hotelName }}</NuxtLink>
          <span v-else>{{ stop.hotelName }}</span>
          <span v-if="stop.starRating" class="trip-stop__stars" aria-hidden="true">
            <span v-for="n in stop.starRating" :key="n" class="trip-stop__star"><svg viewBox="0 0 18 18" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M16.963,6.786c-.088-.271-.323-.469-.605-.51l-4.62-.671L9.672,1.418c-.252-.512-1.093-.512-1.345,0l-2.066,4.186-4.62,.671c-.282,.041-.517,.239-.605,.51-.088,.271-.015,.57,.19,.769l3.343,3.258-.79,4.601c-.048,.282,.067,.566,.298,.734,.231,.167,.538,.189,.79,.057l4.132-2.173,4.132,2.173c.11,.058,.229,.086,.349,.086,.155,0,.31-.048,.441-.143,.231-.168,.347-.452,.298-.734l-.79-4.601,3.343-3.258c.205-.199,.278-.498,.19-.769Z"/></svg></span>
          </span>
        </h3>
        <div class="trip-stop__location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4.5 9.75768C4.5 15.5 12 22 12 22C12 22 19.5 15.5 19.5 9.75768C19.5 4.81181 15.6559 2 12 2C8.34409 2 4.5 4.81181 4.5 9.75768Z" /><path d="M12 12C13.3807 12 14.5 10.8807 14.5 9.5C14.5 8.11929 13.3807 7 12 7C10.6193 7 9.5 8.11929 9.5 9.5C9.5 10.8807 10.6193 12 12 12Z" />
          </svg>
          <span>{{ stop.city }}<template v-if="stop.region">, {{ stop.region }}</template></span>
        </div>
      </header>
      <div class="trip-stop__cols">
        <div class="trip-stop__photo">
          <img v-if="stop.image" :src="stop.image" :alt="stop.hotelName" loading="lazy" />
          <span class="trip-stop__num" aria-hidden="true">{{ i + 1 }}</span>
        </div>
        <div class="trip-stop__includes">
          <h4 class="trip-stop__includes-title">{{ t('trip.inclusive') }}</h4>
          <ul class="trip-stop__inc-list">
            <li v-for="(inc, j) in stop.includes" :key="j">
              <span class="trip-stop__inc-check"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-miterlimit="10" aria-hidden="true"><path d="M3 13L8 19L21 5"/></svg></span>
              <span>{{ localized(inc) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import type { LocalizedString } from '~/i18n/types'

/** Eén hotelblok, al voorbewerkt door de dealpagina (daglabel + datums). */
export interface TripStopView {
  hotelName: string
  hotelSlug?: string
  starRating?: number
  city: string
  region: string
  image?: string
  includes: LocalizedString[]
  /** "Dag 1 en 2" / "Dag 3" / "Dag 1 t/m 3" */
  dayLabel: string
  /** "do 15 mrt" — alleen gevuld wanneer een aankomstdatum gekozen is. */
  checkIn?: string
  checkOut?: string
}

withDefaults(defineProps<{
  stops: TripStopView[]
  /** Mobiel: foto boven de vinkjes in plaats van ernaast. */
  stacked?: boolean
}>(), { stacked: false })

const { t, localized } = useMultiHotelTripI18n()
</script>

<style scoped>
.trip-stops {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}
.trip-stop + .trip-stop {
  padding-top: var(--space-xl);
  border-top: 1px solid var(--color-border-light);
}
.trip-stop__head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: var(--space-md);
}
.trip-stop__days-row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px 14px;
}
/* "Dag 1 en 2" — kleine oranje eyebrow boven de hotelnaam. */
.trip-stop__days {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-primary, #ff7e00);
}
.trip-stop__dates {
  display: inline-flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.trip-stop__date-label { font-weight: 600; color: var(--color-text-primary); }
.trip-stop__date-sep { color: var(--color-text-muted, #9a958c); }
.trip-stop__name {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
  margin: 0;
  color: var(--color-text-primary);
}
.trip-stop__name-link { color: inherit; text-decoration: none; }
.trip-stop__name-link:hover { text-decoration: underline; text-underline-offset: 2px; }
.trip-stop__stars { display: inline-flex; align-items: center; gap: 1px; }
.trip-stop__star {
  font-size: 16px;
  line-height: 1;
  color: #141414;
  display: inline-flex;
}
.trip-stop__location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--color-text-secondary);
}
.trip-stop__location svg { flex-shrink: 0; }

.trip-stop__cols {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--space-xl);
  align-items: start;
}
.trip-stops--stacked .trip-stop__cols {
  grid-template-columns: 1fr;
  gap: var(--space-md);
}
.trip-stop__photo {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-background-secondary);
}
.trip-stop__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
/* Nummer linksboven op de foto — koppelt het blok aan marker 1/2/3 op de
   routekaart en het dealcard-kaartje. */
.trip-stop__num {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-primary, #ff7e00);
  color: #fff;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.trip-stop__includes-title {
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 10px;
  color: var(--color-text-primary);
}
.trip-stop__inc-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.trip-stop__inc-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-secondary);
}
.trip-stop__inc-check {
  color: var(--color-discount, #27C88D);
  font-weight: 700;
  flex-shrink: 0;
  display: inline-flex;
  margin-top: 2px;
}

@media (max-width: 767px) {
  .trip-stop__cols { grid-template-columns: 1fr; gap: var(--space-md); }
  .trip-stop__name { font-size: 17px; }
}
</style>
