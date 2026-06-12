# ViaLuxury Component Library

Production-ready, reusable Vue 3 components extracted from the ViaLuxury
first-release prototype. Live showcase: **`/library`** (linked from the start
screen).

## Structure

```
app/lib/
├── tokens/        Design tokens (CSS custom properties)
│   └── tokens.css
├── types/         TypeScript interfaces (Deal, Hotel, SearchHotel, …)
├── utils/         Pure functions (formatPrice, plural, priceFormula, …)
├── composables/   Reusable hooks (useScrollLock, useClickOutside, …)
├── primitives/    Atomic UI components → <Vl*> (Button, Input, Badge, …)
├── components/    Composite components → <Vl*> (DealCard, SearchBar, …)
└── index.ts       Barrel export for utils / types / composables
```

## Usage

Components auto-import with the `Vl` prefix (registered in `nuxt.config.ts`):

```vue
<template>
  <VlDealCard :deal="deal" :hotel="hotel" grid-mode deal-href="/deal/x" />
</template>
```

Utils, types and composables import from the barrel:

```ts
import { formatPrice, type Deal, useScrollLock } from '~/lib'
```

Design tokens are loaded globally via `variables.css`; for standalone use
import `~/lib/tokens/tokens.css`.

## Components (26)

**Primitives (8):** VlButton · VlInput · VlBadge · VlBreadcrumb · VlIcon ·
VlTooltip · VlToast · VlModal

**Cards (4):** VlDealCard · VlHotelCard · VlCreatorCard (+ VlDealCard date-mismatch variant)

**Search & filters (6):** VlSearchBar · VlMobileSearchTrigger · VlFilterPills ·
VlDurationPicker · VlPersonsPicker · VlDatePicker

**Media (3):** VlHeroGallery · VlCarousel · VlPhotoModal

**Content sections (5):** VlFaqSection · VlNearbyTips · VlWhySection ·
VlPaymentLogos · VlShareMenu

See `primitives/README.md` and `components/README.md` for per-component
props, events and slots.

## Design principles

- **Prop-driven** — no hidden global state. Values in via props, changes out
  via events (`v-model` where it makes sense).
- **Self-contained** — no imports from `~/components-first-release` or the
  prototype's singleton search/deal state.
- **Token-themed** — all styling references CSS custom properties so the
  library re-themes by swapping `tokens.css`.
- **SSR-safe** — timers/observers guarded to the browser.
