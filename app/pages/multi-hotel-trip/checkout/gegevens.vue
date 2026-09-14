<script setup lang="ts">
// Multi Hotel Trip checkout — stap 3 (laatste): gegevens en betaalwijze.
// Overgenomen uit het flexibel-annuleren prototype (variant "Flexibel
// annuleren A — Room table"). De annuleringskeuze is al in de room table
// gemaakt; het formulier toont het "Flexibel annuleren"-blok als bevestiging
// (flexibel) of als upsell (niet-terugbetaalbaar). De kamer-selectie komt via
// gedeelde state uit de room table ('mht-checkout-selection').
import { hotel, rooms as roomsData, dealName, pricing } from '~/data/mht-checkout/deal'
import { CHECKOUT_BOOKING_FEE } from '~/data/mht-checkout/pricing'
import { useStickyFit } from '~/composables-multi-hotel-trip/useStickyFit'

interface SelRow {
  baseId: string
  rateKey: 'nonrefundable' | 'flexible'
  price: number
  priceWas: number
  quantity: number
}

const BOOKING_FEE = CHECKOUT_BOOKING_FEE
const selection = useState<SelRow[]>('mht-checkout-selection', () => [])
const checkoutDay = useState<{ price: number; checkIn?: string; checkOut?: string } | null>(
  'mht-checkout-day',
  () => null,
)

const roomsSel = computed(() => selection.value.reduce((s, r) => s + r.quantity, 0))
const roomsPrice = computed(() => selection.value.reduce((s, r) => s + r.quantity * r.price, 0))
const roomsWas = computed(() => selection.value.reduce((s, r) => s + r.quantity * r.priceWas, 0))
const totalPrice = computed(() => roomsPrice.value + BOOKING_FEE)
const wasTotal = computed(() => roomsWas.value + BOOKING_FEE)
const saved = computed(() => roomsWas.value - roomsPrice.value)
const savedPct = computed(() => (roomsWas.value ? Math.round((saved.value / roomsWas.value) * 100) : 0))
function roomNameFor(baseId: string) {
  return roomsData.find((r) => r.id === baseId)?.roomName ?? ''
}

const checkInLabel = computed(() => checkoutDay.value?.checkIn || hotel.checkInDate)
const checkOutLabel = computed(() => checkoutDay.value?.checkOut || hotel.checkOutDate)

// "Flexibel annuleren"-blok in het formulier, met een variatie op basis van
// de gekozen flexibiliteit. De link/knop wisselt de keuze (± €15 per kamer
// in de rijprijs).
const FLEX_FEE = pricing.flexibilityPerRoom
const cancelBlock = computed<'flexible' | 'nonrefundable' | null>(() => {
  if (selection.value.length === 0) return null
  return selection.value.some((r) => r.rateKey === 'flexible') ? 'flexible' : 'nonrefundable'
})
// Switchen kan hier alleen van niet-flex naar flex; terug naar
// niet-terugbetaalbaar alleen als 'undo' nadat de switch op deze
// pagina is gebruikt (wie al flexibel binnenkwam kan niet wisselen).
const flexAddedHere = ref(false)
function toggleFlex() {
  const toFlex = cancelBlock.value === 'nonrefundable'
  if (!toFlex && !flexAddedHere.value) return
  flexAddedHere.value = toFlex
  const delta = toFlex ? FLEX_FEE : -FLEX_FEE
  selection.value = selection.value.map((r) => ({
    ...r,
    rateKey: toFlex ? 'flexible' : 'nonrefundable',
    price: r.price + delta,
    priceWas: r.priceWas + delta,
  }))
}

const arrangementIncludes = [
  '2 x Overnachting',
  'Dagelijks ontbijtbuffet',
  '3-Gangendiner (dag van aankomst)',
  'Tasting uurtje 17:00 - 18:00',
]

// Sidebar groeit met de inhoud mee; CTA onderin zichtbaar houden.
const sideEl = ref<HTMLElement | null>(null)
const sideTop = useStickyFit(sideEl, 16)

useHead({ title: 'Gegevens en betaalwijze — ViaLuxury' })
</script>

<template>
  <div class="mht-checkout page page--white">
    <MultiHotelTripCheckoutTopNav />

    <div class="page__stepper">
      <MultiHotelTripCheckoutStepper :active="3" />
    </div>

    <main class="page__main container">
      <div class="page__grid">
        <div class="col-form">
          <h1 class="t-display">Gegevens en betaalwijze</h1>
          <!-- Nummering start op 1; het Flexibel annuleren-blok volgt na Jouw gegevens -->
          <MultiHotelTripCheckoutGegevensForm :start-at="1" :cancel-block="cancelBlock" :can-undo-flex="flexAddedHere" @toggle-flex="toggleFlex" />

          <div class="col-form__cta col-form__cta--split">
            <NuxtLink class="btn-back t-body" to="/multi-hotel-trip/checkout/kamers">← Terug naar kamers</NuxtLink>
            <button class="btn-primary btn-primary--auto" type="button" :disabled="roomsSel === 0">
              {{ roomsSel === 0 ? 'Selecteer een kamer' : 'Boek nu' }}
            </button>
          </div>
        </div>

        <div class="col-summary">
          <aside ref="sideEl" class="card side" :style="{ top: `${sideTop}px` }">
            <div class="side__hotel">
              <img class="side__thumb" :src="hotel.thumb" :alt="hotel.name" />
              <div>
                <p class="t-body t-bold">{{ dealName }}</p>
                <p class="t-body c-mgrey">{{ hotel.name }}</p>
              </div>
            </div>

            <div class="side__dates">
              <div class="side__datecell">
                <p class="t-caption c-mgrey">Inchecken</p>
                <p class="t-body t-bold">{{ checkInLabel }}</p>
              </div>
              <div class="side__datecell">
                <p class="t-caption c-mgrey">Uitchecken</p>
                <p class="t-body t-bold">{{ checkOutLabel }}</p>
              </div>
            </div>

            <div class="side__includes">
              <p class="t-body t-bold">{{ roomsSel > 1 ? 'Elk arrangement bevat' : 'Jouw arrangement bevat' }}</p>
              <p v-for="item in arrangementIncludes" :key="item" class="side__inc t-body">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                {{ item }}
              </p>
              <a class="side__link side__link--left t-body" href="#">Bekijk je volledige arrangement</a>
            </div>

            <template v-if="roomsSel > 0">
              <hr class="side__hr" />

              <div class="side__details">
                <p class="t-body t-bold">Details</p>
                <div v-for="row in selection" :key="`${row.baseId}-${row.rateKey}`" class="side__row side__row--room">
                  <span class="side__qty">{{ row.quantity }}x</span>
                  <div class="side__rowmain">
                    <p class="t-body t-bold">Arrangement</p>
                    <p class="t-caption c-mgrey">{{ roomNameFor(row.baseId) }}</p>
                    <p v-if="row.rateKey === 'flexible'" class="t-caption c-green">Flexibel annuleren</p>
                    <p v-else class="t-caption c-grey">Niet-terugbetaalbaar</p>
                  </div>
                  <MultiHotelTripCheckoutPriceTag :value="row.quantity * row.price" :show-cents="false" size="sm" />
                </div>
                <div class="side__row">
                  <span class="t-body">Boekingskosten</span>
                  <MultiHotelTripCheckoutPriceTag :value="BOOKING_FEE" size="sm" />
                </div>
              </div>

              <hr class="side__hr" />

              <div class="side__total">
                <div class="side__totalrow">
                  <span class="t-h2">Totaalprijs</span>
                  <div class="side__totalprices">
                    <MultiHotelTripCheckoutPriceTag :value="wasTotal" size="sm" strike color="var(--c-medium-grey)" />
                    <MultiHotelTripCheckoutPriceTag :value="totalPrice" size="lg" bold color="var(--c-via-green)" />
                  </div>
                </div>
                <p class="t-caption c-mgrey">{{ roomsSel }} {{ roomsSel === 1 ? 'kamer' : 'kamers' }} voor 2 nachten voor {{ roomsSel * 2 }} personen</p>
              </div>

              <p class="side__saved">
                <MultiHotelTripCheckoutSmileyIcon />
                <span class="t-body">Je hebt al</span>
                <MultiHotelTripCheckoutPriceTag :value="saved" :show-cents="false" size="sm" bold color="var(--c-via-orange)" />
                <span class="t-caption c-grey">({{ savedPct }}%)</span>
                <span class="t-body">bespaard.</span>
              </p>

              <p class="side__smallprint">
                Je dient ter plaatse alleen de lokale belastingen, eventuele
                service-/administratiekosten van het hotel en parkeerkosten te betalen
                (indien dit niet is inbegrepen in het arrangement).
              </p>
            </template>

            <button class="btn-primary" type="button" :disabled="roomsSel === 0">
              {{ roomsSel === 0 ? 'Selecteer een kamer' : 'Boek nu' }}
            </button>

            <div class="side__trust">
              <img src="/images/trustpilot.svg" alt="Trustpilot" />
            </div>
          </aside>
        </div>
      </div>
    </main>

    <MultiHotelTripCheckoutFooter />
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.page--white {
  background: var(--c-white);
}
.page__stepper {
  padding: 32px 24px;
}
.page__main {
  flex: 1;
}
.page__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 350px;
  gap: 48px;
  align-items: start;
}
.col-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.col-summary {
  padding-top: 72px;
  align-self: stretch;
}
.col-form__cta {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}
.col-form__cta--split {
  justify-content: space-between;
  align-items: center;
}
.btn-back {
  color: var(--c-via-black);
  text-decoration: underline;
}
.btn-primary--auto {
  width: auto;
  min-width: 254px;
}

/* Sticky kassabon (zelfde patroon als de andere checkout-stappen) */
.side {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: sticky;
  top: 16px;
  box-shadow: none;
}
.side__hotel {
  display: flex;
  gap: 12px;
  align-items: center;
}
.side__thumb {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}
.side__dates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid var(--c-light-grey);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.side__datecell {
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.side__datecell + .side__datecell {
  border-left: 1px solid var(--c-light-grey);
}
.side__link {
  color: var(--c-via-black);
  text-decoration: underline;
  text-align: center;
}
/* Arrangement- en voorwaardenlinks: links uitgelijnd in de kassabon */
.side__link--left {
  text-align: left;
  align-self: flex-start;
}
.side__hr {
  border: none;
  border-top: 1px solid var(--c-light-grey);
  margin: 0;
}
.side__includes {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.side__inc {
  display: flex;
  align-items: center;
  gap: 10px;
}
.side__inc svg {
  color: var(--c-via-green);
  flex-shrink: 0;
}
.side__details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.side__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.side__row--room {
  align-items: flex-start;
}
.side__qty {
  font-weight: 500;
  flex-shrink: 0;
}
.side__rowmain {
  flex: 1;
}
.side__total {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.side__totalrow {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.side__totalprices {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.side__saved {
  display: flex;
  align-items: center;
  gap: 6px;
}
.side__smallprint {
  font-size: 13px;
  line-height: 19px;
  color: var(--c-medium-grey);
}
.side__trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.side__trust img {
  height: 80px;
}
</style>
