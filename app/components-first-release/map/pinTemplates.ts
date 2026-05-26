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
  if (state === 'focused') return teardropHtml('focused', '#0e0e0c')
  if (state === 'focusedHover') return teardropHtml('focused-hover', '#ee7126')
  return `<img class="hotel-pin-img hotel-pin-img--${state}" src="${URLS[state]}" alt="" />`
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
