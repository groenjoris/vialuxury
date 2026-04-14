/**
 * Plain-HTML templates for Leaflet divIcon markers used on the /kaart map.
 *
 * These return strings (not Vue components) because Leaflet builds 50+
 * markers and rendering each through Vue would be wasteful. The matching
 * `.hotel-pin` styles live in `app/assets/css/leaflet-overrides.css` …
 * actually no, they live unscoped at the bottom of `kaart.vue` so the
 * markup pulls them in alongside the page.
 */

const STAR_SVG_DEFAULT = `<svg viewBox="0 0 24 24" width="14" height="14" fill="white" aria-hidden="true"><path d="M12 2 15 8l6 .9-4.5 4.4L17.5 20 12 16.9 6.5 20 8 13.3 3.5 8.9 9.5 8z"/></svg>`
const STAR_SVG_SELECTED = `<svg viewBox="0 0 24 24" width="22" height="22" fill="white" aria-hidden="true"><path d="M12 2 15 8l6 .9-4.5 4.4L17.5 20 12 16.9 6.5 20 8 13.3 3.5 8.9 9.5 8z"/></svg>`

export type PinState = 'default' | 'selected' | 'soldOut'

/** HTML for a single hotel pin in a given state. */
export function pinHtml(state: PinState): string {
  if (state === 'selected') {
    return `<div class="hotel-pin hotel-pin--selected">${STAR_SVG_SELECTED}</div>`
  }
  if (state === 'soldOut') {
    return `<div class="hotel-pin hotel-pin--soldOut">${STAR_SVG_DEFAULT}</div>`
  }
  return `<div class="hotel-pin hotel-pin--default">${STAR_SVG_DEFAULT}</div>`
}

/** [width, height] for L.divIcon iconSize. */
export function pinSize(state: PinState): [number, number] {
  return state === 'selected' ? [50, 50] : [32, 32]
}

/** HTML for a numbered cluster pin. */
export function clusterHtml(count: number): string {
  return `<div class="hotel-pin hotel-pin--cluster">${count}</div>`
}
