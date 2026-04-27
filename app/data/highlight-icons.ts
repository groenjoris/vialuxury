/**
 * Curated concept → icon-URL mapping for deal highlights.
 *
 * URLs come from ViaLuxury's amenity icon set (see docs/facility-icons.md),
 * which gives us a small visually consistent palette. Only ~10 of the 19
 * available amenity icons are useful for highlights — the rest (lift,
 * cashless, geen-lift, mindervalide, laadpalen, bowling) are domain-specific
 * facility info, not stuff you'd surface as a "highlight".
 *
 * Anything that doesn't fit one of these concepts falls back to a CSS
 * checkmark in the template (see iconMatcher.ts → null URL).
 */

const CDN = 'https://asset.vialuxury.com/assets/'

export const HIGHLIGHT_ICONS = {
  dining:   CDN + '570a86fa-444a-4ad7-bcb1-555433c37860', // restaurant / bar / bistro
  wellness: CDN + '8f1c4344-bbb5-48e9-aa4a-943723a5e7dd', // sauna / spa / massage
  pool:     CDN + '897e5044-1e22-4208-8907-19cba90cd239', // indoor pool
  fitness:  CDN + '9c7c05f1-3ebf-48e4-950d-8e88722eef33', // fitness
  bike:     CDN + '8f7cca6a-04dc-4a74-b410-903dec095e47', // bike rental
  wifi:     CDN + '68011d0e-16f9-40d3-bb59-ec6792d364ae', // free wifi
  parking:  CDN + 'b6097c6d-ee8f-4c77-9c3e-8f181e2b1ce9', // parking
  kids:     CDN + '3170c002-2d68-4e4b-a411-a25f487293e7', // kids / extra bed
  pets:     CDN + '79e438d2-3fcd-4509-a967-242ebf10e4a2', // pets allowed
  service:  CDN + 'fd2f3345-8a40-489f-b16d-79676f5b800e', // reception / shuttle / luggage
} as const

export type HighlightConcept = keyof typeof HIGHLIGHT_ICONS
