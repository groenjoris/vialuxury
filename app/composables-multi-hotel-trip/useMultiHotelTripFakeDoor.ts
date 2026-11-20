/**
 * Fake door-test "variabel reisgezelschap" — een variant bínnen Release 1 (gestart vanaf het
 * startscherm, vak Variable Travel Group). Met de vlag aan:
 *  - telt de personenselector in de zoekbalk (desktop-popup en mobiel zoekscherm) volwassenen
 *    en kinderen (met leeftijd) in plaats van "N personen / N kamers";
 *  - tonen /search en /kaart bij een oneven aantal volwassenen of bij kinderen alleen de melding
 *    (nog geen arrangementen voor x personen / voor kinderen) met een e-mailveld.
 * Een arrangement is altijd voor 2 personen: een even aantal volwassenen zoekt gewoon
 * (volwassenen / 2 kamers). De vlag en het laatst gezochte gezelschap staan in een cookie, zodat
 * de server de zoekpagina meteen goed rendert (geen flits van resultaten vóór de melding).
 */
export interface FakeDoorChild { age: number }
export interface FakeDoorState { on: boolean; adults: number; children: FakeDoorChild[] }

const COOKIE = 'vl_mht_fakedoor'
export const FAKE_DOOR_MAX_ADULTS = 8
export const FAKE_DOOR_MAX_CHILDREN = 4

/** Oneven aantal volwassenen of kinderen erbij: daar is (nog) geen aanbod voor. */
export const isFakeDoorBlockedGroup = (adults: number, children: number) => adults % 2 === 1 || children > 0

export function useMultiHotelTripFakeDoor() {
  const cookie = useCookie<FakeDoorState | null>(COOKIE, { default: () => null, sameSite: 'lax' })
  const state = useState<FakeDoorState | null>('vl_mht_fakedoor', () => cookie.value ?? null)
  const save = (s: FakeDoorState | null) => { state.value = s; cookie.value = s }

  const enabled = computed(() => state.value?.on === true)
  const adults = computed(() => state.value?.adults ?? 2)
  const children = computed<FakeDoorChild[]>(() => state.value?.children ?? [])
  const blocked = computed(() => enabled.value && isFakeDoorBlockedGroup(adults.value, children.value.length))

  function enable() { save({ on: true, adults: 2, children: [] }) }
  function disable() { save(null) }
  /** Het gezelschap waarmee gezocht is (bij "Vind deals"). */
  function setGroup(a: number, kids: FakeDoorChild[]) {
    if (enabled.value) save({ on: true, adults: a, children: kids.map(c => ({ age: c.age })) })
  }

  return { enabled, adults, children, blocked, enable, disable, setGroup }
}
