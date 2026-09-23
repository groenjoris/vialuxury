<script setup lang="ts">
// Multi Hotel Trip checkout — stap 2: kamertype kiezen met de room table.
// Overgenomen uit het flexibel-annuleren prototype (variant "Flexibel
// annuleren A — Room table": tabel zonder rechterkolom + sticky kassabon).
// Bereikt via "Ik ga boeken" op de dealpagina (met datum) of via de
// kalenderstap; "Opslaan en doorgaan" leidt naar de gegevenspagina.
import { hotel, rooms as roomsData, dealName } from '~/data/mht-checkout/deal'
import { CHECKOUT_BOOKING_FEE } from '~/data/mht-checkout/pricing'
import { useStickyFit } from '~/composables-multi-hotel-trip/useStickyFit'
import { useMultiHotelTripCheckoutTrip } from '~/composables-multi-hotel-trip/useMultiHotelTripCheckoutTrip'

// Vakantie (meerdere hotels) of gewone hotel-deal? Bepaalt de room table
// (arrangementen-cluster met hotel-carrousel) en de teksten in de kassabon.
const { trip: checkoutTrip } = useMultiHotelTripCheckoutTrip()
const tripPopupOpen = ref(false)
const nights = computed(() => checkoutTrip.value?.nights ?? 2)
function unit(n: number) {
  if (checkoutTrip.value) return n === 1 ? 'arrangement' : 'arrangementen'
  return n === 1 ? 'kamer' : 'kamers'
}

// Kamer-selectie uit de tabel drijft de kassabon-prijzen.
interface SelRow {
  baseId: string
  rateKey: 'nonrefundable' | 'flexible'
  price: number
  priceWas: number
  quantity: number
}
const BOOKING_FEE = CHECKOUT_BOOKING_FEE
const tableSelection = ref<SelRow[]>([])
// De kassabon-knop werkt als de knop onder de tabel — bij een lege selectie
// de room table laten valideren (rode kolom + toast + autoscroll).
const roomTableRef = ref<{ promptSelection: () => void } | null>(null)
function onSidebarBook() {
  if (tableSelection.value.reduce((s, r) => s + r.quantity, 0) === 0) {
    roomTableRef.value?.promptSelection()
    return
  }
  navigateTo('/multi-hotel-trip/checkout/gegevens')
}
const roomsSel = computed(() => tableSelection.value.reduce((s, r) => s + r.quantity, 0))
const roomsPrice = computed(() => tableSelection.value.reduce((s, r) => s + r.quantity * r.price, 0))
const roomsWas = computed(() => tableSelection.value.reduce((s, r) => s + r.quantity * r.priceWas, 0))
const totalPrice = computed(() => roomsPrice.value + BOOKING_FEE)
const wasTotal = computed(() => roomsWas.value + BOOKING_FEE)
const saved = computed(() => roomsWas.value - roomsPrice.value)
const savedPct = computed(() => (roomsWas.value ? Math.round((saved.value / roomsWas.value) * 100) : 0))
function roomNameFor(baseId: string) {
  return roomsData.find((r) => r.id === baseId)?.roomName ?? ''
}

const arrangementIncludes = computed(() => checkoutTrip.value?.includes ?? [
  '2 x Overnachting',
  'Dagelijks ontbijtbuffet',
  '3-Gangendiner (dag van aankomst)',
  'Tasting uurtje 17:00 - 18:00',
])

// Sidebar groeit na een kamerselectie: laat de sticky-offset meeschuiven
// zodat de CTA onderin zichtbaar blijft op lagere schermen.
const sideEl = ref<HTMLElement | null>(null)
const sideTop = useStickyFit(sideEl, 16)

// Kassabon volgt de gekozen kalenderdatums (gedeelde state met de kalenderstap).
const checkoutDay = useState<{ price: number; checkIn?: string; checkOut?: string } | null>(
  'mht-checkout-day',
  () => null,
)
const summaryHotel = computed(() => ({
  ...hotel,
  checkInDate: checkoutDay.value?.checkIn || hotel.checkInDate,
  checkOutDate: checkoutDay.value?.checkOut || hotel.checkOutDate,
}))

useHead({ title: computed(() => (checkoutTrip.value ? 'Kies je opties — ViaLuxury' : 'Kies je kamertype — ViaLuxury')) })
</script>

<template>
  <div class="mht-checkout page page--white">
    <MultiHotelTripCheckoutTopNav />

    <div class="page__stepper">
      <MultiHotelTripCheckoutStepper :active="2" />
    </div>

    <main class="page__main container">
      <!-- Room table zonder rechterkolom + sticky kassabon -->
      <div class="page__grid">
        <div class="col-form">
          <h1 class="t-display">{{ checkoutTrip ? 'Kies je opties' : 'Kies je kamertype' }}</h1>
          <MultiHotelTripCheckoutRoomTable
            ref="roomTableRef"
            :trip="checkoutTrip"
            :show-reserve="false"
            bottom-cta
            book-to="/multi-hotel-trip/checkout/gegevens"
            @update:selection="tableSelection = $event"
          />
        </div>

        <div class="col-summary">
          <aside ref="sideEl" class="card side" :style="{ top: `${sideTop}px` }">
            <!-- Vakantie: reisnaam (geen hotel-/plaatsnamen — die staan in de
                 pop-up "Bekijk je volledige reis") -->
            <div class="side__hotel">
              <img class="side__thumb" :src="checkoutTrip ? checkoutTrip.thumb : hotel.thumb" :alt="checkoutTrip ? checkoutTrip.name : hotel.name" />
              <div>
                <p class="t-body t-bold">{{ checkoutTrip ? checkoutTrip.name : dealName }}</p>
                <p v-if="checkoutTrip" class="t-body c-mgrey">{{ checkoutTrip.typeLabel }} · {{ checkoutTrip.hotels.length }} hotels</p>
                <p v-else class="t-body c-mgrey">{{ hotel.name }}</p>
              </div>
            </div>

            <div class="side__dates">
              <div class="side__datecell">
                <p class="t-caption c-mgrey">{{ checkoutTrip ? 'Aankomst' : 'Inchecken' }}</p>
                <p class="t-body t-bold">{{ summaryHotel.checkInDate }}</p>
              </div>
              <div class="side__datecell">
                <p class="t-caption c-mgrey">{{ checkoutTrip ? 'Vertrek' : 'Uitchecken' }}</p>
                <p class="t-body t-bold">{{ summaryHotel.checkOutDate }}</p>
              </div>
            </div>
            <NuxtLink class="side__link side__link--center t-body" to="/multi-hotel-trip/checkout/datum">
              Verander data
            </NuxtLink>

            <div class="side__includes">
              <p class="t-body t-bold">{{ checkoutTrip ? `Jouw ${checkoutTrip.typeWord} bevat` : roomsSel > 1 ? 'Elk arrangement bevat' : 'Jouw arrangement bevat' }}</p>
              <p v-for="item in arrangementIncludes" :key="item" class="side__inc t-body">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                {{ item }}
              </p>
              <button v-if="checkoutTrip" class="side__link side__link--left t-body" type="button" @click="tripPopupOpen = true">Bekijk je volledige reis</button>
              <a v-else class="side__link side__link--left t-body" href="#">Bekijk je volledige arrangement</a>
            </div>

            <template v-if="roomsSel > 0">
              <hr class="side__hr" />

              <div class="side__details">
                <p class="t-body t-bold">Details</p>
                <div v-for="row in tableSelection" :key="`${row.baseId}-${row.rateKey}`" class="side__row side__row--room">
                  <span class="side__qty">{{ row.quantity }}x</span>
                  <div class="side__rowmain">
                    <p class="t-body t-bold">{{ checkoutTrip ? checkoutTrip.typeLabel : 'Arrangement' }}</p>
                    <p class="t-caption c-mgrey">{{ checkoutTrip ? `${checkoutTrip.hotels.length} hotels · 1 kamer per hotel` : roomNameFor(row.baseId) }}</p>
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
                <p class="t-caption c-mgrey">{{ roomsSel }} {{ unit(roomsSel) }} voor {{ nights }} nachten voor {{ roomsSel * 2 }} personen</p>
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

            <button class="btn-primary" type="button" @click="onSidebarBook">
              Opslaan en doorgaan
            </button>

            <div class="side__trust">
              <img src="/images/trustpilot.svg" alt="Trustpilot" />
            </div>
          </aside>
        </div>
      </div>
    </main>

    <MultiHotelTripCheckoutFooter />

    <MultiHotelTripCheckoutTripPopup v-if="tripPopupOpen && checkoutTrip" :trip="checkoutTrip" @close="tripPopupOpen = false" />
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

/* Sticky kassabon (zelfde patroon als de kalenderstap) */
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
  background: none;
  border: 0;
  padding: 0;
  font-family: inherit;
  cursor: pointer;
}
.side__link--center {
  align-self: center;
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
  gap: 8px;
}
.side__inc {
  display: flex;
  align-items: center;
  gap: 8px;
}
.side__inc svg {
  color: var(--c-via-green);
  flex-shrink: 0;
}
.side__details {
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  width: 24px;
  font-size: var(--t-body);
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
  gap: 8px;
}
.side__totalprices {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.side__saved {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  color: var(--c-via-black);
}
.side__smallprint {
  font-size: 11px;
  line-height: 15px;
  color: var(--c-medium-grey);
}
.side__trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.side__trust img {
  height: 64px;
}
</style>
