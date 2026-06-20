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

    <!-- ── Room cards — ONE card per room TYPE. Multiple rooms of the same
         type list as rows inside the card (Kamer 1, Kamer 2, …) — the card
         grows taller — each row with its own guest assignment + upgrade
         link. Upgrading one room adds a new card for the new type. ── -->
    <template v-if="only !== 'banners'">
    <article v-for="card in roomCards" :key="card.room.id" class="arr-card arr-card--fixed">
      <div class="arr-card__image">
        <span class="arr-card__chip">{{ totalTypes === 1 ? 'Je kamer' : 'Kamertype ' + (card.typeIndex + 1) }}</span>
        <span
          v-if="card.sticker"
          class="arr-card__sticker"
          :class="`arr-card__sticker--${card.sticker.tone}`"
        >{{ card.sticker.text }}</span>
        <img :src="card.image" :alt="localized(card.room.name)" loading="lazy" />
      </div>
      <div class="arr-card__body">
        <h3 class="arr-card__title"><template v-if="card.rows.length > 1">{{ card.rows.length }}x&nbsp;</template>{{ localized(card.room.name) }}</h3>
        <p class="arr-card__desc">{{ localized(card.room.description) }}</p>
        <ul v-if="card.room.features && card.room.features.length" class="arr-card__features">
          <li v-for="(feature, i) in card.room.features" :key="i">
            <span class="arr-card__feature-check">✓</span>
            <span>{{ localized(feature) }}</span>
          </li>
        </ul>
        <div class="arr-card__rooms">
          <div v-for="row in card.rows" :key="row.key" class="arr-card__room-row">
            <span class="arr-card__room-info">
              <span v-if="totalRooms > 1" class="arr-card__room-label">Kamer {{ row.roomNumber }}:</span>
              <span class="arr-card__guests">maximaal {{ row.room.capacity ?? 2 }} {{ (row.room.capacity ?? 2) === 1 ? 'persoon' : 'personen' }}</span>
            </span>
            <button
              v-if="upgradeLabelForRow(row)"
              type="button"
              class="arr-card__change-btn"
              @click="openRoomPanel(row)"
            >{{ upgradeLabelForRow(row) }}</button>
          </div>
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
      :is-open="!!panelRow"
      :rooms="panelRow ? selectableRoomsForRow(panelRow) : []"
      :current-room-id="panelRow?.room.id ?? ''"
      :current-price-extra="panelRow?.room.priceExtra ?? 0"
      :guests-label="panelGuestsLabel"
      @select="onPanelSelect"
      @close="panelKey = null"
    />

    <!-- Capacity confirmation — a downgrade left too few beds for the party -->
    <Teleport to="body">
      <div
        v-if="pendingDowngrade"
        class="cap-dialog__backdrop"
        @click.self="cancelAddRoom"
      >
        <div
          class="cap-dialog"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="cap-dialog-title"
          aria-describedby="cap-dialog-body"
        >
          <h3 id="cap-dialog-title" class="cap-dialog__title">Niet alle reizigers passen</h3>
          <p id="cap-dialog-body" class="cap-dialog__body">
            Met deze kamerkeuze is er plek voor {{ pendingDowngrade.seats }}
            van de {{ store.totalPersons }} reizigers. Voeg een extra 2-persoonskamer
            toe zodat iedereen mee kan.
          </p>
          <p v-if="pendingDowngrade.extraCost > 0" class="cap-dialog__price">
            Extra kamer: + {{ formatPrice(pendingDowngrade.extraCost) }}
          </p>
          <div class="cap-dialog__actions">
            <button type="button" class="cap-dialog__btn cap-dialog__btn--ghost" @click="cancelAddRoom">
              Annuleren
            </button>
            <button type="button" class="cap-dialog__btn cap-dialog__btn--primary" @click="confirmAddRoom">
              Extra kamer toevoegen
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import type { Hotel } from '~/types/hotel'
import type { RoomOption, DealInclusion } from '~/types/deal'
import { useSecondReleaseDealStore } from '~/stores-second-release/deal'
import { formatPrice } from '~/utils-second-release/formatPrice'
import { priceForArrival } from '~/utils-second-release/priceFormula'
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

/* ── Room-type panel — opened per ROOM ROW, switches that single room's
   type. Tracks the row key and resolves the row LIVE, so the panel always
   mirrors the current assignment (and closes itself when the row
   disappears after a group change). ── */
const panelKey = ref<string | null>(null)
const panelRow = computed<RoomRow | null>(() =>
  physicalRooms.value.find(r => r.key === panelKey.value) ?? null,
)

function openRoomPanel(row: RoomRow) {
  panelKey.value = row.key
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

/** Room types a single room can switch to (current one included): ALL
 *  available room types, regardless of capacity — so a 2-person room can be
 *  swapped for a 3-person room (and vice versa). */
function selectableRoomsForRow(_row: RoomRow): RoomOption[] {
  return store.allRoomTypes
    .filter(r => (r.maxAvailable ?? 5) >= 1)
    .map(r => ({ ...r, image: panelImageFor(r) }))
}

/** "Upgrade vanaf €xx" — xx is the cheapest POSITIVE surcharge among the
 *  other suitable room types. No real upgrade (only lateral changes) →
 *  "Wijzig kamertype". No suitable alternatives at all → no link. */
function upgradeLabelForRow(row: RoomRow): string | null {
  const others = selectableRoomsForRow(row).filter(r => r.id !== row.room.id)
  if (others.length === 0) return null
  // When this room is itself an upgrade — paid OR a free included upgrade —
  // you don't "upgrade" it, you change its type.
  const roomIsUpgrade = (row.room.priceExtra ?? 0) > 0 || row.room.isUpgrade || hasFreeUpgrade.value
  if (roomIsUpgrade) return 'Wijzig kamertype'
  // "Upgrade vanaf €xx" only when a PRICIER room of the SAME capacity exists —
  // i.e. a real comfort upgrade for the same number of people. A 3-person
  // room with no other 3-person rooms has no such option → "Wijzig kamertype".
  const diffs = others
    .filter(r => (r.capacity ?? 2) === (row.room.capacity ?? 2))
    .map(r => r.priceExtra - row.room.priceExtra)
    .filter(d => d > 0)
  if (diffs.length > 0) return `Upgrade vanaf ${formatPrice(Math.min(...diffs))}`
  return 'Wijzig kamertype'
}

/** "Voor kamer 2" — tells the panel which room the switch applies to.
 *  Only shown when there is more than one room. */
const panelGuestsLabel = computed(() => {
  const row = panelRow.value
  if (!row || totalRooms.value <= 1) return null
  return `Voor kamer ${row.roomNumber}`
})

/* ── Capacity guard ─────────────────────────────────────────────────────
   Now that the panel offers EVERY room type, a downgrade (only possible from
   the 3-person room → a 2-person room) can leave fewer beds than travellers.
   Before applying such a swap we pause and ask the user whether to add a
   room; only the 3→2 case can ever under-serve, and a single extra room
   always covers the 1-bed shortfall it creates. ── */

/** Total beds across the current physical rooms. */
const totalCapacity = computed(() =>
  physicalRooms.value.reduce((s, r) => s + (r.room.capacity ?? 2), 0),
)

/** A deferred under-capacity swap awaiting the user's confirmation. */
const pendingDowngrade = ref<{
  newRoomId: string
  /** Beds the booking would have AFTER the swap (before adding a room). */
  seats: number
  targetAlloc: Record<string, number>
  extraCost: number
} | null>(null)

/** Apply a straightforward (capacity-safe) swap of one room's type. */
function applyRoomSwap(row: RoomRow, newRoomId: string) {
  if (store.travelGroup.rooms <= 1) {
    store.selectRoom(newRoomId)
    return
  }
  // Swap THIS slot's type in place, then mirror it into the store's per-type
  // counts (kept matched, so the watcher won't re-seed / reshuffle the order).
  const slots = [...roomSlots.value]
  slots[row.slotIndex] = newRoomId
  roomSlots.value = slots
  const alloc = { ...store.effectiveAllocation }
  store.setRoomAllocationCount(row.room.id, Math.max(0, (alloc[row.room.id] ?? 0) - 1))
  store.setRoomAllocationCount(newRoomId, (alloc[newRoomId] ?? 0) + 1)
}

/** The room-type allocation AFTER swapping `row` to `newRoomId` and adding
 *  one extra base room — the config we'd commit if the user confirms. */
function targetAllocForAddRoom(row: RoomRow, newRoomId: string): Record<string, number> {
  const baseId = store.currentDeal!.baseRoomType.id
  const slots = store.travelGroup.rooms <= 1
    ? [newRoomId]
    : roomSlots.value.map((id, i) => (i === row.slotIndex ? newRoomId : id))
  slots.push(baseId)
  const alloc: Record<string, number> = {}
  for (const id of slots) alloc[id] = (alloc[id] ?? 0) + 1
  return alloc
}

/** Price difference of committing `targetAlloc` (rooms = its sum) vs. now. */
function addRoomExtraCost(targetAlloc: Record<string, number>): number {
  const deal = store.currentDeal
  if (!deal) return 0
  const persons = store.totalPersons
  const newRooms = Object.values(targetAlloc).reduce((s, n) => s + n, 0)
  const tid = store.tripleRoom?.id
  const triples = tid ? (targetAlloc[tid] ?? 0) : 0
  const arrangement = priceForArrival(deal.basePrice, deal.id, store.checkInDate, persons, newRooms, triples)
  let upgrade = 0
  for (const [id, c] of Object.entries(targetAlloc)) {
    const r = store.allRoomTypes.find(x => x.id === id)
    if (r && r.priceExtra > 0) upgrade += r.priceExtra * c
  }
  return Math.max(0, (arrangement + upgrade) - store.pricing.totalPrice)
}

/** Selecting closes the panel and switches THIS room's type — unless the
 *  switch would leave too few beds, in which case we ask first. */
function onPanelSelect(newRoomId: string) {
  const row = panelRow.value
  if (!row || newRoomId === row.room.id) { panelKey.value = null; return }

  const newRoom = store.allRoomTypes.find(r => r.id === newRoomId)
  const newCapacity = newRoom?.capacity ?? 2
  const projectedCapacity = totalCapacity.value - (row.room.capacity ?? 2) + newCapacity

  if (projectedCapacity < store.totalPersons) {
    // Under-capacity: defer the swap and confirm adding a room.
    const targetAlloc = targetAllocForAddRoom(row, newRoomId)
    pendingDowngrade.value = {
      newRoomId,
      seats: projectedCapacity,
      targetAlloc,
      extraCost: addRoomExtraCost(targetAlloc),
    }
    panelKey.value = null
    return
  }

  applyRoomSwap(row, newRoomId)
  panelKey.value = null
}

/** User confirms: commit the swap together with the extra room. */
function confirmAddRoom() {
  if (pendingDowngrade.value) store.setAllocationWithRooms(pendingDowngrade.value.targetAlloc)
  pendingDowngrade.value = null
}

/** User cancels: keep the original configuration unchanged. */
function cancelAddRoom() {
  pendingDowngrade.value = null
}

const hotelImage = computed(() => props.hotel.images[0]?.url || '')

/** First paragraph of the hotel description, plain text. */
const hotelExcerpt = computed(() => {
  const full = localized(props.hotel.description)
  const text = full.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const firstPara = full.split('\n').map(p => p.replace(/<[^>]+>/g, ' ').trim()).filter(Boolean)[0]
  return firstPara || text
})

/** One physical room (a single bookable unit). */
interface RoomRow {
  /** Stable identity for ONE physical room (its slot position). */
  key: string
  /** Index into `roomSlots` — which ordered slot this room occupies. */
  slotIndex: number
  /** 1-based number of this physical room across the whole booking. */
  roomNumber: number
  room: RoomOption
  /** "Gast 1 en gast 2" — which guests sleep in THIS room. Only filled
   *  when there is more than one physical room. */
  guests: string | null
  /** Number of guests assigned to this room. */
  guestCount: number
}

/** One card per room TYPE; its rooms list as rows inside the card. */
interface RoomCard {
  room: RoomOption
  /** 0-based card order — drives the "Kamertype N" chip. */
  typeIndex: number
  image: string
  sticker: { text: string; tone: 'free' | 'paid' } | null
  rows: RoomRow[]
}

/** A deal contains a FREE room upgrade when it carries a kamerupgrade
 *  inclusion (not every deal does). The included room is then an upgrade
 *  as part of the arrangement. */
const hasFreeUpgrade = computed(() => !!upgradeInc.value)

/** The 3-person room is a CAPACITY variant of the base room (auto-assigned
 *  when the party needs it), not a user-chosen paid upgrade — even though it
 *  carries a +€50 surcharge. It must be treated like the 2-person base. */
function isTripleRoom(room: RoomOption): boolean {
  return !!store.tripleRoom && room.id === store.tripleRoom.id
}

/** Sticker copy per room type:
 *  - deal includes a free upgrade → green "DIT IS EEN GRATIS UPGRADE"
 *  - paid upgrade picked by the user → BLACK sticker (replaces the
 *    green one, same size + position): "Door jouw gekozen upgrade + €X"
 *  The 3-person room is never the BLACK "chosen upgrade" sticker. */
function stickerFor(room: RoomOption): RoomCard['sticker'] {
  if (room.priceExtra > 0 && !isTripleRoom(room)) {
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
  if (room.priceExtra > 0 && !isTripleRoom(room)) return room.image
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

/* ── Ordered "room slots" overlay ──────────────────────────────────────
   The store tracks room counts PER TYPE (no per-room identity), which would
   reshuffle guest numbers whenever the allocation recomputes. We keep an
   ordered array of one room-type-id per physical room so guest assignment
   stays STABLE: upgrading a single room swaps that slot's type in place, so
   its guests (e.g. "Gast 1 en gast 2") move WITH it to the new card. The
   overlay is re-seeded from the store whenever the group changes (so the
   counts per type no longer match the slots). */
const roomSlots = ref<string[]>([])

/** Default-order seed: largest capacity first (3-person room gets guests
 *  1-3), base room before upgrades. */
function seedRoomSlots() {
  const types: { room: RoomOption; count: number }[] = []
  for (const [roomId, count] of Object.entries(store.effectiveAllocation)) {
    if (count <= 0) continue
    const room = store.allRoomTypes.find(r => r.id === roomId)
    if (room) types.push({ room, count })
  }
  types.sort((a, b) =>
    ((b.room.capacity ?? 2) - (a.room.capacity ?? 2))
    || ((a.room.isDefault ? 0 : 1) - (b.room.isDefault ? 0 : 1)),
  )
  const slots: string[] = []
  for (const t of types) for (let k = 0; k < t.count; k++) slots.push(t.room.id)
  roomSlots.value = slots
}

/** True when the slot overlay still matches the store's per-type counts. */
function slotsMatchAllocation(): boolean {
  const slotCounts: Record<string, number> = {}
  for (const id of roomSlots.value) slotCounts[id] = (slotCounts[id] || 0) + 1
  const allocCounts: Record<string, number> = {}
  for (const [id, c] of Object.entries(store.effectiveAllocation)) if (c > 0) allocCounts[id] = c
  const keys = new Set([...Object.keys(slotCounts), ...Object.keys(allocCounts)])
  for (const k of keys) if ((slotCounts[k] || 0) !== (allocCounts[k] || 0)) return false
  return true
}

// Re-seed only when the allocation no longer matches the overlay (a group
// change), NOT when we ourselves swapped a slot during an upgrade.
watch(() => store.effectiveAllocation, () => {
  if (!slotsMatchAllocation()) seedRoomSlots()
}, { deep: true, immediate: true })

/** Flat list of PHYSICAL rooms with global numbering + guest assignment.
 *  Single-room mode → one room, no guest line. Multi-room mode walks the
 *  ordered slots and fills each room up to its capacity in order:
 *    5p/3k same type → kamer 1: gast 1-2, kamer 2: gast 3-4, kamer 3: gast 5
 *    5p/2k (3-pers + 2-pers) → kamer 1: gast 1-3, kamer 2: gast 4-5 */
const physicalRooms = computed<RoomRow[]>(() => {
  const deal = store.currentDeal
  if (!deal) return []

  if (store.travelGroup.rooms <= 1) {
    const room = store.selectedRoom ?? deal.baseRoomType
    return [{ key: 'single', slotIndex: 0, roomNumber: 1, room, guests: null, guestCount: store.totalPersons }]
  }

  const slots = roomSlots.value
  const totalRooms = slots.length
  const roomsResolved = slots.map(id => store.allRoomTypes.find(r => r.id === id) ?? deal.baseRoomType)

  // Guest counts per room — NO empty rooms: give every room 1 guest first,
  // then fill the earlier rooms up to capacity with the remainder.
  //   4p/3k → [2,1,1];  5p/2k (3-pers + 2-pers) → [3,2]
  const counts = roomsResolved.map(() => 0)
  let toAssign = store.totalPersons
  for (let i = 0; i < roomsResolved.length && toAssign > 0; i++) { counts[i] = 1; toAssign-- }
  for (let i = 0; i < roomsResolved.length && toAssign > 0; i++) {
    const cap = roomsResolved[i].capacity ?? 2
    const add = Math.min(cap - counts[i], toAssign)
    counts[i] += add
    toAssign -= add
  }

  let guestNr = 1
  return roomsResolved.map((room, idx) => {
    const guestsHere = counts[idx]
    const start = guestNr
    guestNr += guestsHere
    return {
      key: `slot-${idx}`,
      slotIndex: idx,
      roomNumber: idx + 1,
      room,
      guests: totalRooms > 1 ? formatGuestList(start, guestsHere) : null,
      guestCount: guestsHere,
    }
  })
})

/** Total physical rooms — drives "Je kamer" vs the "Kamer N" row labels. */
const totalRooms = computed(() => physicalRooms.value.length)

/** One card per room TYPE (grouped from the physical rooms, first-seen
 *  order). Each card lists its rooms as rows. */
const roomCards = computed<RoomCard[]>(() => {
  const cards: RoomCard[] = []
  const byType = new Map<string, RoomCard>()
  for (const row of physicalRooms.value) {
    let card = byType.get(row.room.id)
    if (!card) {
      card = { room: row.room, typeIndex: byType.size, image: imageFor(row.room), sticker: stickerFor(row.room), rows: [] }
      byType.set(row.room.id, card)
      cards.push(card)
    }
    card.rows.push(row)
  }
  return cards
})

/** Number of distinct room TYPES — drives "Je kamer" vs "Kamertype N". */
const totalTypes = computed(() => roomCards.value.length)

/** "Gast 1, gast 2 en gast 3" — comma-separated with "en" before the
 *  last guest, starting from guest number `start`. */
function formatGuestList(start: number, count: number): string | null {
  if (count <= 0) return null
  const names: string[] = []
  for (let g = 0; g < count; g++) names.push(`gast ${start + g}`)
  // Lowercase "gast …" (it follows the "Kamer N:" label).
  if (names.length === 1) return names[0]
  return `${names.slice(0, -1).join(', ')} en ${names[names.length - 1]}`
}
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
  /* Hover zoom — same effect as the gallery photos. */
  transition: transform 0.4s ease;
}
.arr-card:hover .arr-card__image img {
  transform: scale(1.05);
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
  margin: 0 0 2px;
}

/* Max occupancy — small line directly under the room name. */
.arr-card__capacity {
  font-size: 13px;
  color: var(--color-text-secondary);
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
  margin: 0 0 8px;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Room amenities — checkmark list. Same font size + colour as the
   description (incl. the checkmarks). */
.arr-card__features {
  list-style: none;
  margin: 0 0 14px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.arr-card__features li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.65;
}
.arr-card__feature-check {
  color: var(--color-text-secondary);
  flex-shrink: 0;
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

/* Room rows — one line per physical room of this type; the card grows
   taller with more rooms. Each row: "Kamer N: Gast …" + upgrade link. */
.arr-card__rooms {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.arr-card__room-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-md);
}

.arr-card__room-info {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
}

.arr-card__room-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* Which guests sleep in this room ("Gast 1 en gast 2"). */
.arr-card__guests {
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* Upgrade control — a text link (one per room row), not a solid button. */
.arr-card__change-btn {
  background: none;
  border: none;
  padding: 0;
  color: var(--color-primary);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
  flex-shrink: 0;
  transition: color var(--transition-fast);
}

.arr-card__change-btn:hover {
  color: var(--color-primary-hover);
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

/* ── Capacity confirmation dialog ─────────────────────────────────────── */
.cap-dialog__backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
}

.cap-dialog {
  background: #fff;
  border-radius: var(--radius-lg);
  max-width: 420px;
  width: 100%;
  padding: var(--space-xl);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

.cap-dialog__title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm);
}

.cap-dialog__body {
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin: 0;
}

.cap-dialog__price {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: var(--space-md) 0 0;
}

.cap-dialog__actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
  margin-top: var(--space-lg);
}

.cap-dialog__btn {
  padding: 10px 18px;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
}

.cap-dialog__btn--ghost {
  background: #fff;
  border-color: var(--color-border);
  color: var(--color-text-primary);
}
.cap-dialog__btn--ghost:hover { background: var(--color-bg-subtle, #f5f5f5); }

.cap-dialog__btn--primary {
  background: var(--color-primary);
  color: #fff;
}
.cap-dialog__btn--primary:hover { background: var(--color-primary-hover); }

@media (max-width: 600px) {
  .cap-dialog { padding: var(--space-lg); }
  .cap-dialog__actions { flex-direction: column-reverse; }
  .cap-dialog__btn { width: 100%; }
}
</style>
