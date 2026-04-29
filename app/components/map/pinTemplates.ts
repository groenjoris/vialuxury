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

const URLS: Record<PinState, string> = {
  default: activeIdle,
  hover: activeHover,
  selected: activeSelected,
  soldOut: disabledIdle,
  soldOutHover: disabledHover,
  soldOutSelected: disabledSelected,
}

/** HTML for a single hotel pin in a given state. */
export function pinHtml(state: PinState): string {
  return `<img class="hotel-pin-img hotel-pin-img--${state}" src="${URLS[state]}" alt="" />`
}

/** [width, height] in CSS pixels for L.divIcon iconSize.
 *  Selected/hover pins are larger so they read as the focused element. */
export function pinSize(state: PinState): [number, number] {
  if (state === 'selected' || state === 'soldOutSelected') return [48, 48]
  if (state === 'hover' || state === 'soldOutHover') return [40, 40]
  return [32, 32]
}

/** Anchor (px from top-left) so the pin's centre sits on the coordinate. */
export function pinAnchor(state: PinState): [number, number] {
  const [w, h] = pinSize(state)
  return [w / 2, h / 2]
}

/** HTML for a numbered cluster pin. */
export function clusterHtml(count: number): string {
  return `<div class="hotel-pin hotel-pin--cluster">${count}</div>`
}
