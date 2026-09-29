/**
 * Asset-driven pin templates for Leaflet markers on /kaart.
 *
 * Six visual variants come from `assets/images/map/`:
 *   Type=Active   × State={Idle, Hover, Selected}   — available hotels
 *   Type=Disabled × State={Idle, Hover, Selected}   — sold-out hotels
 *
 * Vite-imports resolve at build time to fingerprinted public URLs.
 */

// Active = at least one matching deal is available
import activeIdle from '~/assets/images/map/active-idle.svg'
import activeHover from '~/assets/images/map/active-hover.svg'
import activeSelected from '~/assets/images/map/active-selected.svg'

// Disabled = sold-out (no available deals for the chosen filter)
import disabledIdle from '~/assets/images/map/disabled-idle.svg'
import disabledHover from '~/assets/images/map/disabled-hover.svg'
import disabledSelected from '~/assets/images/map/disabled-selected.svg'

export type PinState =
  | 'default'        // Active idle
  | 'hover'          // Active hover (desktop only)
  | 'selected'       // Active selected (panel open)
  | 'soldOut'        // Disabled idle
  | 'soldOutHover'   // Disabled hover
  | 'soldOutSelected'// Disabled selected
  | 'focused'        // Hotel the user came from via /deal — always a teardrop
  | 'focusedHover'   // Same teardrop in ViaLuxury orange

const URLS: Record<Exclude<PinState, 'focused' | 'focusedHover'>, string> = {
  default: activeIdle,
  hover: activeHover,
  // `selected` reverts to the bigger ORANGE STAR asset — used by the
  // search-results map. The teardrop "location icon" is reserved for
  // the focused-from-deal hotel and lives behind `'focused'` /
  // `'focusedHover'` states below.
  selected: activeSelected,
  soldOut: disabledIdle,
  soldOutHover: disabledHover,
  soldOutSelected: disabledSelected,
}

/** Inline teardrop pins — match the mini-map pin on the deal page.
 *  Used for `selected`, `focused` and `focusedHover` states so the
 *  hotel the user came from (and any newly-selected one) reads as a
 *  bigger anchor on top of the smaller circular pins. */
const teardropHtml = (cls: string, fill: string) => `
  <svg class="hotel-pin-img hotel-pin-img--${cls}" viewBox="0 0 32 42" width="48" height="64" fill="none" aria-hidden="true">
    <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z" fill="${fill}"/>
    <circle cx="16" cy="16" r="6" fill="#fff"/>
  </svg>
`

/** HTML for a single hotel pin in a given state. Only the focused /
 *  focused-hover (orange) variants use the inline teardrop SVG; every
 *  other state uses the corresponding star asset. */
export function pinHtml(state: PinState): string {
  if (state === 'focused') return teardropHtml('focused', '#141414')
  if (state === 'focusedHover') return teardropHtml('focused-hover', '#FB862C')
  return `<img class="hotel-pin-img hotel-pin-img--${state}" src="${URLS[state]}" alt="" />`
}

/* Vakantie-pins (Multi Hotel Trip): zelfde cirkels en kleuren als de sterpins
   (32-cirkel op een 40-canvas met schaduwruimte eronder; hover oranje; selected
   50-cirkel op 58), maar met een auto (autovakantie) of fiets (fietsvakantie)
   als glyph. Glyphs = /icons/mht/car-side.svg en bike.svg (24×24, lijn-iconen). */
const TRIP_GLYPHS: Record<'auto' | 'fiets', string> = {
  auto: '<path d="M21.6436 13H18C18 14.1046 18.8954 15 20 15H22.01L21.6436 13Z" fill="#fff" stroke="none"/><path d="M3 19H11"/><path d="M3 4H7.03875C7.64632 4 8.22094 4.27618 8.60049 4.75061L12 9L18.5852 10.3864C20.315 10.7505 21.6006 12.2068 21.7474 13.9684L22 17L22.6382 18.2764C22.8044 18.6088 22.5627 19 22.191 19H17"/><path d="M14 22C12.3431 22 11 20.6569 11 19C11 17.3431 12.3431 16 14 16C15.6569 16 17 17.3431 17 19C17 20.6569 15.6569 22 14 22Z"/>',
  fiets: '<path d="M19 20C21.2091 20 23 18.2091 23 16C23 13.7909 21.2091 12 19 12C16.7909 12 15 13.7909 15 16C15 18.2091 16.7909 20 19 20Z"/><path d="M5 20C7.20914 20 9 18.2091 9 16C9 13.7909 7.20914 12 5 12C2.79086 12 1 13.7909 1 16C1 18.2091 2.79086 20 5 20Z"/><path d="M5 15.5L6.5 9H17.5H16.5"/><path d="M19 15.5L16.7039 5.55028C16.4945 4.64282 15.6864 4 14.7551 4H14"/><path d="M9 6H5"/>',
}

/** HTML voor een vakantie-pin (auto/fiets) in een gegeven staat. De focus-
 *  staten (teardrop) gelden alleen voor hotels en vallen terug op pinHtml. */
export function tripPinHtml(kind: 'auto' | 'fiets', state: PinState): string {
  if (state === 'focused' || state === 'focusedHover') return pinHtml(state)
  const big = state === 'selected' || state === 'soldOutSelected'
  const r = big ? 25 : 16
  const S = 2 * r + 8
  const disabled = state.startsWith('soldOut')
  const fill = disabled ? '#B3B3B3' : state === 'default' ? '#1A1E1E' : '#FB862C'
  const g = Math.round(r * 1.2)
  const tx = S / 2 - g / 2
  const ty = r - g / 2
  return `<svg class="hotel-pin-img hotel-pin-img--trip hotel-pin-img--${state}" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}" fill="none" aria-hidden="true"><circle cx="${S / 2}" cy="${r}" r="${r}" fill="${fill}"/><g transform="translate(${tx} ${ty}) scale(${(g / 24).toFixed(3)})" stroke="#fff" stroke-width="2.4" stroke-linecap="square" stroke-miterlimit="10">${TRIP_GLYPHS[kind]}</g></svg>`
}

/** [width, height] in CSS pixels for L.divIcon iconSize. Focused
 *  teardrops are 48 × 64; the rest use the legacy star sizes. */
export function pinSize(state: PinState): [number, number] {
  if (state === 'focused' || state === 'focusedHover') return [48, 64]
  if (state === 'selected' || state === 'soldOutSelected') return [48, 48]
  if (state === 'hover' || state === 'soldOutHover') return [40, 40]
  return [32, 32]
}

/** Anchor (px from top-left) so the pin's centre sits on the coordinate.
 *  Focused teardrops anchor at the TIP (bottom-centre); every other
 *  state stays centre-anchored on its icon. */
export function pinAnchor(state: PinState): [number, number] {
  const [w, h] = pinSize(state)
  if (state === 'focused' || state === 'focusedHover') return [w / 2, h]
  return [w / 2, h / 2]
}

/** HTML for a numbered cluster pin. When `disabled` is true (every hotel
 *  inside the cluster is unmatched / sold-out) the cluster renders in the
 *  same disabled palette as a single grey pin. */
export function clusterHtml(count: number, disabled = false): string {
  const cls = disabled
    ? 'hotel-pin hotel-pin--cluster hotel-pin--cluster-disabled'
    : 'hotel-pin hotel-pin--cluster'
  return `<div class="${cls}">${count}</div>`
}
