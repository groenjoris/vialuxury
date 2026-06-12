<template>
  <section class="arr-detail">
    <h2 v-if="only !== 'banners'" class="arr-detail__heading">Jouw arrangement in detail</h2>

    <!-- ── Hotel card ── -->
    <article v-if="only !== 'banners'" class="arr-card arr-card--fixed">
      <div class="arr-card__image">
        <span class="arr-card__chip">Je hotel</span>
        <img :src="hotelImage" :alt="hotel.name" loading="lazy" />
      </div>
      <div class="arr-card__body">
        <h3 class="arr-card__title">{{ hotel.name }}</h3>
        <p class="arr-card__desc">{{ hotelExcerpt }}</p>
        <a href="#" class="arr-card__more" @click.prevent="$emit('open-description')">Lees meer</a>
      </div>
    </article>

    <!-- ── Room cards — one per allocated room type ── -->
    <template v-if="only !== 'banners'">
    <article v-for="(card, i) in roomCards" :key="card.room.id" class="arr-card arr-card--fixed">
      <div class="arr-card__image">
        <span class="arr-card__chip">{{ i === 0 ? (card.count === 1 ? 'Je kamer' : 'Je kamers') : 'Nog een kamer' }}</span>
        <span
          v-if="card.sticker"
          class="arr-card__sticker"
          :class="`arr-card__sticker--${card.sticker.tone}`"
        >{{ card.sticker.text }}</span>
        <img :src="card.image" :alt="localized(card.room.name)" loading="lazy" />
      </div>
      <div class="arr-card__body">
        <h3 class="arr-card__title">{{ card.count }} x&nbsp; {{ localized(card.room.name) }}</h3>
        <p class="arr-card__desc">{{ localized(card.room.description) }}</p>
        <div class="arr-card__footer">
          <div class="arr-card__meta-block">
            <span class="arr-card__meta">{{ card.count }} {{ card.count === 1 ? 'kamer' : 'kamers' }}, max {{ card.count * (card.room.capacity ?? 2) }} personen</span>
            <span v-if="card.guests" class="arr-card__guests">{{ card.guests }}</span>
          </div>
          <button
            v-if="upgradeButtonLabel(card)"
            type="button"
            class="arr-card__change-btn"
            @click="openRoomPanel(card)"
          >{{ upgradeButtonLabel(card) }}</button>
        </div>
      </div>
    </article>
    </template>

    <!-- ── Inclusion banners — same horizontal card styling as the hotel
         and room cards above. Only inclusions with a photo render here
         (the chips grid at the top already lists every title). -->
    <template v-if="only !== 'cards'">
    <article v-for="inc in inclusionsWithImage" :key="inc.id" class="arr-card arr-card--fixed">
      <div class="arr-card__image">
        <span v-if="isUpgradeInclusion(inc)" class="arr-card__sticker arr-card__sticker--free">UPGRADE</span>
        <img :src="inc.image" :alt="localized(inc.title)" loading="lazy" />
      </div>
      <div class="arr-card__body">
        <h3 class="arr-card__title">
          <span class="arr-card__check">✓</span>
          {{ localized(inc.title) }}
        </h3>
        <p class="arr-card__desc">{{ localized(inc.description) }}</p>
      </div>
    </article>
    </template>

    <!-- Room-type side panel — select-only switch per card (no steppers) -->
    <SecondReleaseRoomTypePanel
      v-if="only !== 'banners' && store.currentDeal"
      :is-open="!!panelCard"
      :rooms="panelCard ? selectableRoomsFor(panelCard) : []"
      :current-room-id="panelCard?.room.id ?? ''"
      :current-price-extra="panelCard?.room.priceExtra ?? 0"
      :guests-label="panelGuestsLabel"
      @select="onPanelSelect"
      @close="panelCard = null"
    />
  </section>
</template>

<script setup lang="ts">
import type { Hotel } from '~/types/hotel'
import type { RoomOption, DealInclusion } from '~/types/deal'
import { useSecondReleaseDealStore } from '~/stores-second-release/deal'
import { formatPrice } from '~/utils-second-release/formatPrice'
import SecondReleaseRoomTypePanel from '~/components-second-release/deal/RoomTypePanel.vue'

const props = defineProps<{
  hotel: Hotel
  /** Deal inclusions to render as horizontal banners below the room
   *  cards (only entries with an image are shown). */
  inclusions?: DealInclusion[]
  /** Render only part of the section: 'cards' = heading + hotel + rooms,
   *  'banners' = the inclusion banners. Omit for everything (mobile). */
  only?: 'cards' | 'banners'
}>()

defineEmits<{
  (e: 'open-description'): void
}>()

const { localized } = useSecondReleaseI18n()
const store = useSecondReleaseDealStore()

/* ── Room-type panel — opened per CARD, switches that card's type ── */
const panelCard = ref<RoomCard | null>(null)

function openRoomPanel(card: RoomCard) {
  panelCard.value = card
}

/** Required per-room capacity for a card's guests. */
function requiredCapacity(card: RoomCard): number {
  return Math.max(1, Math.ceil(card.guestCount / card.count))
}

/** Panel photo per room type — the base room and its 3-person duplicate
 *  show the ROOM photo (overnight inclusion) instead of the mapper's
 *  hotel-photo fallback; paid upgrades keep their own photo. */
function panelImageFor(r: RoomOption): string {
  if (r.isDefault || r.id === store.tripleRoom?.id) {
    return overnightInc.value?.image || r.image
  }
  return r.image
}

/** Room types this card can switch to (current one included): enough
 *  capacity for its guests AND enough inventory for its room count. */
function selectableRoomsFor(card: RoomCard): RoomOption[] {
  const need = requiredCapacity(card)
  return store.allRoomTypes
    .filter(r =>
      (r.capacity ?? 2) >= need
      && (r.maxAvailable ?? 5) >= card.count,
    )
    .map(r => ({ ...r, image: panelImageFor(r) }))
}

/** "Upgrade vanaf €xx" — xx is the cheapest POSITIVE surcharge among the
 *  other suitable room types. No suitable alternatives at all → no
 *  button (e.g. a 3-person card when no other type sleeps 3). */
function upgradeButtonLabel(card: RoomCard): string | null {
  const others = selectableRoomsFor(card).filter(r => r.id !== card.room.id)
  if (others.length === 0) return null
  const diffs = others
    .map(r => r.priceExtra - card.room.priceExtra)
    .filter(d => d > 0)
  if (diffs.length > 0) return `Upgrade vanaf ${formatPrice(Math.min(...diffs))}`
  return 'Wijzig kamertype'
}

/** "Voor gast 1 en gast 2" — only when guest labels are shown. */
const panelGuestsLabel = computed(() => {
  const g = panelCard.value?.guests
  if (!g) return null
  const lower = g.charAt(0).toLowerCase() + g.slice(1)
  const i = lower.lastIndexOf(', ')
  return 'Voor ' + (i === -1 ? lower : lower.slice(0, i) + ' en ' + lower.slice(i + 2))
})

/** Selecting closes the panel and switches the card's room type. */
function onPanelSelect(newRoomId: string) {
  const card = panelCard.value
  if (!card || newRoomId === card.room.id) { panelCard.value = null; return }

  if (store.travelGroup.rooms <= 1) {
    store.selectRoom(newRoomId)
  } else {
    const alloc = { ...store.effectiveAllocation }
    const moved = card.count
    const remaining = (alloc[card.room.id] ?? 0) - moved
    store.setRoomAllocationCount(card.room.id, Math.max(0, remaining))
    store.setRoomAllocationCount(newRoomId, (alloc[newRoomId] ?? 0) + moved)
  }
  panelCard.value = null
}

const hotelImage = computed(() => props.hotel.images[0]?.url || '')

/** First paragraph of the hotel description, plain text. */
const hotelExcerpt = computed(() => {
  const full = localized(props.hotel.description)
  const text = full.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const firstPara = full.split('\n').map(p => p.replace(/<[^>]+>/g, ' ').trim()).filter(Boolean)[0]
  return firstPara || text
})

interface RoomCard {
  room: RoomOption
  count: number
  image: string
  sticker: { text: string; tone: 'free' | 'paid' } | null
  /** "Gast 1, gast 2" — which guests sleep in this room TYPE. Only
   *  filled when there is more than one room-type card. */
  guests: string | null
  /** Number of guests assigned to this room type. */
  guestCount: number
}

/** A deal contains a FREE room upgrade when it carries a kamerupgrade
 *  inclusion (not every deal does). The included room is then an upgrade
 *  as part of the arrangement. */
const hasFreeUpgrade = computed(() => !!upgradeInc.value)

/** Sticker copy per room type:
 *  - deal includes a free upgrade → green "DIT IS EEN GRATIS UPGRADE"
 *  - paid upgrade picked by the user → BLACK sticker (replaces the
 *    green one, same size + position): "Door jouw gekozen upgrade + €X" */
function stickerFor(room: RoomOption): RoomCard['sticker'] {
  if (room.priceExtra > 0) {
    return { text: `Door jouw gekozen upgrade + ${formatPrice(room.priceExtra)}`, tone: 'paid' }
  }
  if (hasFreeUpgrade.value || room.isUpgrade) {
    return { text: 'DIT IS EEN GRATIS UPGRADE', tone: 'free' }
  }
  return null
}

/** Room-card photo, per design:
 *  - paid upgrade → the upgraded room's own photo
 *  - free included upgrade → the free-upgrade inclusion's photo
 *  - base room → the "x Overnachting" inclusion's photo */
function imageFor(room: RoomOption): string {
  if (room.priceExtra > 0) return room.image
  if (hasFreeUpgrade.value || room.isUpgrade) {
    return upgradeInc.value?.image || room.image
  }
  return overnightInc.value?.image || room.image
}

/** The "x Overnachting" inclusion — its photo doubles as the BASE room
 *  card image (per design: the room card uses the overnight photo). */
const overnightInc = computed(() =>
  (props.inclusions ?? []).find(inc => /overnachting/i.test(localized(inc.title))) ?? null,
)

/** The free room-upgrade inclusion (not present on every deal) — its
 *  photo is used on the room card when the room is a free upgrade. */
const upgradeInc = computed(() =>
  (props.inclusions ?? []).find(inc => isUpgradeInclusion(inc)) ?? null,
)

/** Remaining inclusions as banners — the overnight + upgrade inclusions
 *  are excluded (they're represented by the hotel/room cards above). */
const inclusionsWithImage = computed(() =>
  (props.inclusions ?? []).filter(inc =>
    !!inc.image
    && inc !== overnightInc.value
    && inc !== upgradeInc.value,
  ),
)

/** UPGRADE sticker on inclusion banners (e.g. "Kamerupgrade naar …"). */
function isUpgradeInclusion(inc: DealInclusion): boolean {
  const title = localized(inc.title)
  return /kamerupgrade|upgrade\s+naar/i.test(title)
}

/** One card per room type. Single-room mode shows the selected room;
 *  multi-room mode shows the effective allocation (count per type). */
const roomCards = computed<RoomCard[]>(() => {
  const deal = store.currentDeal
  if (!deal) return []

  if (store.travelGroup.rooms <= 1) {
    const room = store.selectedRoom ?? deal.baseRoomType
    const names: string[] = []
    for (let g = 1; g <= store.totalPersons; g++) names.push(`gast ${g}`)
    const guests = names.join(', ')
    return [{
      room,
      count: 1,
      image: imageFor(room),
      sticker: stickerFor(room),
      guests: guests.charAt(0).toUpperCase() + guests.slice(1),
      guestCount: store.totalPersons,
    }]
  }

  const cards: RoomCard[] = []
  for (const [roomId, count] of Object.entries(store.effectiveAllocation)) {
    if (count <= 0) continue
    const room = store.allRoomTypes.find(r => r.id === roomId)
    if (room) cards.push({ room, count, image: imageFor(room), sticker: stickerFor(room), guests: null, guestCount: 0 })
  }
  // Base room first, upgrades after — stable, readable order.
  cards.sort((a, b) => (a.room.isDefault ? -1 : 1) - (b.room.isDefault ? -1 : 1))

  // ── Guest assignment — every individual room gets at least 1 guest;
  //    the remaining guests fill rooms up to capacity, in card order.
  //    The labels show which guests sleep in which room type.
  const totalRooms = cards.reduce((s, c) => s + c.count, 0)
  let remaining = Math.max(0, store.totalPersons - totalRooms)
  let guestNr = 1
  for (const card of cards) {
    const cap = card.room.capacity ?? 2
    let guestsInType = card.count // 1 guest per room to start with
    const extra = Math.min((cap - 1) * card.count, remaining)
    guestsInType += extra
    remaining -= extra
    card.guestCount = guestsInType
    const names: string[] = []
    for (let g = 0; g < guestsInType; g++) names.push(`gast ${guestNr++}`)
    card.guests = names.join(', ')
    card.guests = card.guests.charAt(0).toUpperCase() + card.guests.slice(1)
  }
  return cards
})
</script>

<style scoped>
.arr-detail {
  margin-top: var(--space-xl);
}

.arr-detail__heading {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-lg);
}

.arr-card {
  /* Container query root: the photo column doubles (300 → 600px) when
     the card itself renders full width (below the floated sidebar). */
  container-type: inline-size;
  display: flex;
  /* Text pane left, photo right. */
  flex-direction: row-reverse;
  gap: var(--space-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: var(--space-md);
  min-height: 240px;
}

.arr-card__image {
  position: relative;
  width: 300px;
  flex-shrink: 0;
  overflow: hidden;
}

/* Full-width card (wholly below the sidebar): double the image width,
   the text pane fills the remaining width. */
@container (min-width: 900px) {
  .arr-card__image {
    width: 600px;
  }
}

/* Hotel + room cards: always the narrow sidebar-fitting size with the
   small photo on the LEFT — they never go full width. */
@media (min-width: 801px) {
  .arr-card--fixed {
    flex-direction: row;
    width: calc(100% - 370px - var(--space-xl));
  }
  .arr-card--fixed .arr-card__image {
    width: 300px !important;
  }
  .arr-card--fixed .arr-card__body {
    padding: var(--space-lg) var(--space-lg) var(--space-lg) 0;
  }
}

.arr-card__image img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Black label chip top-left on the photo ("Je Hotel" / "Je Kamers") */
.arr-card__chip {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  background: var(--color-dark);
  color: #fff;
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
  pointer-events: none;
}

/* Upgrade sticker — lower-LEFT on the photo, so it never overlaps the
   "Je Hotel" / "Je Kamer(s)" chip in the upper-left corner. */
.arr-card__sticker {
  position: absolute;
  bottom: 12px;
  left: 12px;
  z-index: 2;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3px;
  padding: 5px 10px;
  border-radius: 4px;
  pointer-events: none;
  max-width: 80%;
  text-align: left;
}

.arr-card__sticker--free {
  background: var(--color-discount);
}

/* Paid upgrade replaces the green sticker — same size + position,
   black background instead of green. */
.arr-card__sticker--paid {
  background: var(--color-dark);
}

.arr-card__body {
  /* Text pane sits LEFT of the photo — pad the left edge, none on the
     right (the flex gap separates body and photo). */
  padding: var(--space-lg) 0 var(--space-lg) var(--space-lg);
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.arr-card__title {
  font-family: var(--font-heading);
  font-size: 19px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 10px;
}

.arr-card__check {
  color: var(--color-discount);
  margin-right: 4px;
}

.arr-card__desc {
  font-size: 14px;
  line-height: 1.65;
  color: var(--color-text-secondary);
  margin: 0 0 12px;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.arr-card__more {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  margin-top: auto;
  align-self: flex-start;
}

.arr-card__more:hover {
  color: var(--color-primary-hover);
}

.arr-card__footer {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.arr-card__meta-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.arr-card__meta {
  font-size: 14px;
  color: var(--color-text-primary);
}

/* Which guests sleep in this room type ("Gast 1, gast 2"). */
.arr-card__guests {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.arr-card__change-btn {
  background: var(--color-dark);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  padding: 10px 18px;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.arr-card__change-btn:hover {
  background: #2b2b2b;
}

@media (max-width: 800px) {
  .arr-card {
    flex-direction: column;
    gap: 0;
    min-height: 0;
  }
  .arr-card__image {
    width: 100%;
    min-height: 0;
    aspect-ratio: 16 / 9;
  }
  .arr-card__image img {
    position: absolute;
  }
  .arr-card__body {
    padding: var(--space-md);
  }
}
</style>
