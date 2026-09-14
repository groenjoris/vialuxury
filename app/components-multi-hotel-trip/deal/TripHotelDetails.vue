<template>
  <!-- Multi Hotel Trip — de hotelinformatie van een vakantiehotel, getoond
       in het hotel-sidepanel (TripHotelPanel) op de dealpagina en op de
       fullscreen kaart. Volgorde: fotocarrousel, beschrijving, inbegrepen,
       kamer (foto over de volle breedte, beschrijving eronder),
       faciliteiten, huisregels. -->
  <div class="thd">
    <!-- Eén foto bovenin, rouleerbaar met pijlen. -->
    <div v-if="hotel.images.length" class="thd__carousel">
      <img :src="hotel.images[photoIndex]" :alt="hotel.name" class="thd__photo" />
      <template v-if="hotel.images.length > 1">
        <button type="button" class="thd__nav thd__nav--prev" aria-label="Vorige foto" @click="prevPhoto">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <button type="button" class="thd__nav thd__nav--next" aria-label="Volgende foto" @click="nextPhoto">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
        <span class="thd__counter">{{ photoIndex + 1 }} / {{ hotel.images.length }}</span>
      </template>
    </div>

    <p class="thd__description">{{ hotel.description }}</p>

    <section v-if="hotel.includes.length" class="thd__section">
      <h3 class="thd__section-title">{{ t('trip.includedAtHotel') }}</h3>
      <ul class="thd__includes">
        <li v-for="(inc, i) in hotel.includes" :key="i">
          <span class="thd__check"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-miterlimit="10" aria-hidden="true"><path d="M3 13L8 19L21 5"/></svg></span>
          <span>{{ inc }}</span>
        </li>
      </ul>
    </section>

    <section v-if="hotel.room" class="thd__section">
      <h3 class="thd__section-title">{{ t('trip.roomHeading') }}</h3>
      <div v-if="hotel.room.image" class="thd__room-photo">
        <img :src="hotel.room.image" :alt="hotel.room.name" />
      </div>
      <p class="thd__room-name">{{ hotel.room.name }}</p>
      <p class="thd__room-text">{{ hotel.room.description }}</p>
    </section>

    <section v-if="hotel.facilities.length" class="thd__section">
      <h3 class="thd__section-title">{{ t('hotel.facilities') }}</h3>
      <ul class="thd__facilities">
        <li v-for="fac in hotel.facilities" :key="fac.label" class="thd__facility">
          <span class="thd__facility-icon"><img :src="fac.icon" :alt="''" width="18" height="18" /></span>
          <span>{{ fac.label }}</span>
        </li>
      </ul>
    </section>

    <section v-if="hotel.houseRules && hotel.houseRules.length" class="thd__section">
      <h3 class="thd__section-title">{{ t('hotel.houseRules') }}</h3>
      <dl class="thd__rules">
        <template v-for="(rule, i) in hotel.houseRules" :key="i">
          <dt class="thd__rule-title">{{ rule.title }}</dt>
          <dd class="thd__rule-text">{{ rule.description }}</dd>
        </template>
      </dl>
    </section>
  </div>
</template>

<script setup lang="ts">
export interface TripHotelModalData {
  name: string
  starRating?: number
  /** "Béthune, Noord-Frankrijk" */
  location: string
  images: string[]
  description: string
  facilities: { icon: string; label: string }[]
  includes: string[]
  houseRules?: { title: string; description: string }[]
  room?: { name: string; description: string; image?: string }
  /** "15:00" */
  checkIn?: string
  /** Met een gekozen aankomstdatum: in-/uitcheckdatum van dít hotel ("ma 5 okt"). */
  checkInDate?: string
  checkOutDate?: string
}

const props = defineProps<{ hotel: TripHotelModalData }>()

const { t } = useMultiHotelTripI18n()

/* Fotocarrousel: één foto, pijlen roteren (met wrap), teller rechtsboven.
   Bij een ander hotel begint hij bij de eerste foto. */
const photoIndex = ref(0)
watch(() => props.hotel.name, () => { photoIndex.value = 0 })
function prevPhoto() {
  const n = props.hotel.images.length
  if (n) photoIndex.value = (photoIndex.value - 1 + n) % n
}
function nextPhoto() {
  const n = props.hotel.images.length
  if (n) photoIndex.value = (photoIndex.value + 1) % n
}
</script>

<style scoped>
.thd { padding: var(--space-lg); }
.thd__carousel {
  position: relative;
  height: 260px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: var(--space-lg);
  background: var(--color-background-secondary);
}
.thd__photo { width: 100%; height: 100%; object-fit: cover; display: block; }
/* Pijlen zoals op de dealcard: ronde witte knoppen links/rechts midden. */
.thd__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: #141414;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}
.thd__nav:hover { background: #fff; }
.thd__nav--prev { left: 12px; }
.thd__nav--next { right: 12px; }
.thd__counter {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
}
.thd__description {
  margin: 0 0 var(--space-lg);
  font-size: 15px;
  line-height: 1.7;
  color: var(--color-text-secondary);
}
.thd__section + .thd__section { margin-top: var(--space-lg); }
.thd__section-title {
  margin: 0 0 var(--space-sm);
  font-size: 16px;
  font-weight: 700;
}
.thd__includes {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.thd__includes li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-secondary);
}
.thd__check { color: var(--color-discount, #27C88D); flex-shrink: 0; display: inline-flex; margin-top: 2px; }
/* Kamer: foto over de volle breedte, naam en beschrijving eronder. */
.thd__room-photo {
  aspect-ratio: 16 / 10;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-background-secondary);
  margin-bottom: var(--space-sm);
}
.thd__room-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.thd__room-name { margin: 0 0 4px; font-size: 15px; font-weight: 600; color: var(--color-text-primary); }
.thd__room-text { margin: 0; font-size: 14px; line-height: 1.6; color: var(--color-text-secondary); }
.thd__facilities {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 16px;
}
.thd__facility {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--color-text-primary);
}
.thd__facility-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--color-background-secondary, #FBFAF8);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.thd__rules { margin: 0; display: grid; grid-template-columns: 1fr; gap: 10px; }
.thd__rule-title { font-size: 14px; font-weight: 600; color: var(--color-text-primary); }
.thd__rule-text { margin: 2px 0 0; font-size: 14px; line-height: 1.55; color: var(--color-text-secondary); }

@media (max-width: 767px) {
  .thd__carousel { height: 200px; }
  .thd__facilities { grid-template-columns: 1fr; }
}
</style>
