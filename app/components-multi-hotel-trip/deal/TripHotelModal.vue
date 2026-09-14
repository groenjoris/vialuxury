<template>
  <!-- Multi Hotel Trip — pop-up met hotelinformatie vanuit het dagprogramma
       ("Meer over dit hotel"): foto, naam + sterren, ligging, korte
       beschrijving, faciliteiten en wat er bij dít hotel inbegrepen is.
       Zelfde kaart-in-overlay als de beschrijvings-pop-up van de dealpagina. -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open && hotel" class="thm" @click.self="$emit('close')">
        <div class="thm__card" data-scroll-lock-allow="true">
          <div class="thm__header">
            <div class="thm__heading">
              <h2 class="thm__title">
                {{ hotel.name }}
                <span v-if="hotel.starRating" class="thm__stars" aria-hidden="true">
                  <span v-for="n in hotel.starRating" :key="n" class="thm__star"><svg viewBox="0 0 18 18" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M16.963,6.786c-.088-.271-.323-.469-.605-.51l-4.62-.671L9.672,1.418c-.252-.512-1.093-.512-1.345,0l-2.066,4.186-4.62,.671c-.282,.041-.517,.239-.605,.51-.088,.271-.015,.57,.19,.769l3.343,3.258-.79,4.601c-.048,.282,.067,.566,.298,.734,.231,.167,.538,.189,.79,.057l4.132-2.173,4.132,2.173c.11,.058,.229,.086,.349,.086,.155,0,.31-.048,.441-.143,.231-.168,.347-.452,.298-.734l-.79-4.601,3.343-3.258c.205-.199,.278-.498,.19-.769Z"/></svg></span>
                </span>
              </h2>
              <p class="thm__meta">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M4.5 9.75768C4.5 15.5 12 22 12 22C12 22 19.5 15.5 19.5 9.75768C19.5 4.81181 15.6559 2 12 2C8.34409 2 4.5 4.81181 4.5 9.75768Z" /><path d="M12 12C13.3807 12 14.5 10.8807 14.5 9.5C14.5 8.11929 13.3807 7 12 7C10.6193 7 9.5 8.11929 9.5 9.5C9.5 10.8807 10.6193 12 12 12Z" />
                </svg>
                {{ hotel.location }}
                <span v-if="hotel.checkIn" class="thm__meta-sep" aria-hidden="true">·</span>
                <span v-if="hotel.checkIn">{{ t('trip.checkInFrom').replace('{time}', hotel.checkIn) }}</span>
              </p>
            </div>
            <button type="button" class="thm__close" :aria-label="t('common.close')" @click="$emit('close')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>

          <div class="thm__body">
            <!-- Eén foto bovenin, rouleerbaar met pijlen (zoals op de zoekresultaatkaart). -->
            <div v-if="hotel.images.length" class="thm__carousel">
              <img :src="hotel.images[photoIndex]" :alt="hotel.name" class="thm__photo" />
              <template v-if="hotel.images.length > 1">
                <button type="button" class="thm__nav thm__nav--prev" aria-label="Vorige foto" @click="prevPhoto">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <button type="button" class="thm__nav thm__nav--next" aria-label="Volgende foto" @click="nextPhoto">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
                <span class="thm__counter">{{ photoIndex + 1 }} / {{ hotel.images.length }}</span>
              </template>
            </div>

            <p class="thm__description">{{ hotel.description }}</p>

            <!-- Kamerblok: foto links, kamertype + beschrijving rechts. -->
            <section v-if="hotel.room" class="thm__section thm__room">
              <div v-if="hotel.room.image" class="thm__room-photo">
                <img :src="hotel.room.image" :alt="hotel.room.name" />
              </div>
              <div class="thm__room-body">
                <h3 class="thm__section-title">{{ t('trip.roomHeading') }}</h3>
                <p class="thm__room-name">{{ hotel.room.name }}</p>
                <p class="thm__room-text">{{ hotel.room.description }}</p>
              </div>
            </section>

            <section v-if="hotel.facilities.length" class="thm__section">
              <h3 class="thm__section-title">{{ t('hotel.facilities') }}</h3>
              <ul class="thm__facilities">
                <li v-for="fac in hotel.facilities" :key="fac.label" class="thm__facility">
                  <span class="thm__facility-icon"><img :src="fac.icon" :alt="''" width="18" height="18" /></span>
                  <span>{{ fac.label }}</span>
                </li>
              </ul>
            </section>

            <!-- Huisregels per hotel (de pop-up scrolt). -->
            <section v-if="hotel.houseRules && hotel.houseRules.length" class="thm__section">
              <h3 class="thm__section-title">{{ t('hotel.houseRules') }}</h3>
              <dl class="thm__rules">
                <template v-for="(rule, i) in hotel.houseRules" :key="i">
                  <dt class="thm__rule-title">{{ rule.title }}</dt>
                  <dd class="thm__rule-text">{{ rule.description }}</dd>
                </template>
              </dl>
            </section>

            <section v-if="hotel.includes.length" class="thm__section">
              <h3 class="thm__section-title">{{ t('trip.includedAtHotel') }}</h3>
              <ul class="thm__includes">
                <li v-for="(inc, i) in hotel.includes" :key="i">
                  <span class="thm__check"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-miterlimit="10" aria-hidden="true"><path d="M3 13L8 19L21 5"/></svg></span>
                  <span>{{ inc }}</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useBodyScrollLock } from '~/composables-multi-hotel-trip/useBodyScrollLock'

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
}

const props = defineProps<{
  open: boolean
  hotel: TripHotelModalData | null
}>()

defineEmits<{ close: [] }>()

const { t } = useMultiHotelTripI18n()
useBodyScrollLock().bindTo(computed(() => props.open))

/* Fotocarrousel: één foto, pijlen roteren (met wrap), teller rechtsboven.
   Bij een ander hotel of opnieuw openen begint hij bij de eerste foto. */
const photoIndex = ref(0)
watch(() => [props.open, props.hotel?.name], () => { photoIndex.value = 0 })
function prevPhoto() {
  const n = props.hotel?.images.length ?? 0
  if (n) photoIndex.value = (photoIndex.value - 1 + n) % n
}
function nextPhoto() {
  const n = props.hotel?.images.length ?? 0
  if (n) photoIndex.value = (photoIndex.value + 1) % n
}
</script>

<style scoped>
.thm {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  background: rgba(20, 20, 20, 0.55);
}
.thm__card {
  width: min(760px, 100%);
  max-height: calc(100vh - 2 * var(--space-lg));
  overflow: auto;
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}
.thm__header {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-lg) var(--space-lg) var(--space-md);
  background: var(--color-surface, #fff);
  border-bottom: 1px solid var(--color-border-light);
}
.thm__title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.25;
}
.thm__stars { display: inline-flex; align-items: center; gap: 1px; }
.thm__star { font-size: 16px; line-height: 1; color: #141414; display: inline-flex; }
.thm__meta {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}
.thm__close {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.thm__close:hover { background: var(--color-border-light); }
.thm__body { padding: var(--space-lg); }
.thm__meta-sep { margin: 0 4px; color: var(--color-text-muted, #9a958c); }
.thm__carousel {
  position: relative;
  height: 300px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: var(--space-lg);
  background: var(--color-background-secondary);
}
.thm__photo { width: 100%; height: 100%; object-fit: cover; display: block; }
/* Pijlen zoals op de dealcard: ronde witte knoppen links/rechts midden. */
.thm__nav {
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
.thm__nav:hover { background: #fff; }
.thm__nav--prev { left: 12px; }
.thm__nav--next { right: 12px; }
.thm__counter {
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
/* Kamerblok */
.thm__room {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: var(--space-lg);
  align-items: start;
  margin-bottom: var(--space-lg);
}
.thm__room-photo {
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-background-secondary);
}
.thm__room-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.thm__room-name { margin: 0 0 4px; font-size: 15px; font-weight: 600; color: var(--color-text-primary); }
.thm__room-text { margin: 0; font-size: 14px; line-height: 1.6; color: var(--color-text-secondary); }
.thm__description {
  margin: 0 0 var(--space-lg);
  font-size: 15px;
  line-height: 1.7;
  color: var(--color-text-secondary);
}
.thm__section + .thm__section { margin-top: var(--space-lg); }
.thm__section-title {
  margin: 0 0 var(--space-sm);
  font-size: 16px;
  font-weight: 700;
}
.thm__facilities {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 16px;
}
.thm__facility {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--color-text-primary);
}
.thm__facility-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--color-background-secondary, #FBFAF8);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.thm__includes {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.thm__includes li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-secondary);
}
.thm__check { color: var(--color-discount, #27C88D); flex-shrink: 0; display: inline-flex; margin-top: 2px; }
.thm__rules { margin: 0; display: grid; grid-template-columns: 1fr; gap: 10px; }
.thm__rule-title { font-size: 14px; font-weight: 600; color: var(--color-text-primary); }
.thm__rule-text { margin: 2px 0 0; font-size: 14px; line-height: 1.55; color: var(--color-text-secondary); }

.fade-enter-active, .fade-leave-active { transition: opacity 180ms ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 767px) {
  .thm { padding: 0; align-items: flex-end; }
  .thm__card { max-height: 92vh; border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
  .thm__carousel { height: 220px; }
  .thm__room { grid-template-columns: 1fr; gap: var(--space-sm); }
  .thm__facilities { grid-template-columns: 1fr; }
}
</style>
