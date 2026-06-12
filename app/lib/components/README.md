# ViaLuxury component library

Self-contained, prop-driven Vue 3 components. Auto-imported by Nuxt with the
`Vl` prefix (e.g. `<VlDealCard />`), registered via `nuxt.config.ts`. All use
`<script setup lang="ts">`, the global design tokens (`var(--color-*)` etc.),
and import shared helpers from `~/lib/{utils,composables,types}`.

Brand: orange `#e97132` (`--color-primary`), green discount `#00B67A`
(`--color-discount`), Recoleta headings (`--font-heading`), rounded
`var(--radius-lg)` cards with soft shadows.

---

## Card & media components

### VlCarousel

Generic image/content carousel with prev/next arrows + dot indicators and
wrap-around navigation. Autoplay rotation is driven by the `useCarousel`
composable.

**Props**

| Prop         | Type        | Default | Description |
|--------------|-------------|---------|-------------|
| `items`      | `unknown[]` | —       | Items to cycle through. Plain strings render as `<img>` via the default slot. |
| `autoplay`   | `boolean`   | `false` | Auto-advance through items. |
| `interval`   | `number`    | `5000`  | Milliseconds between auto-advances. |
| `showArrows` | `boolean`   | `true`  | Show the prev/next arrow buttons. |
| `showDots`   | `boolean`   | `true`  | Show the dot indicators. |

**Slots**

- default — scoped `#item="{ item, index }"`. When omitted, string items
  render as cover images.

**Events** — none.

---

### VlHeroGallery

Photo grid: one large hero (left) + a 2×2 thumbnail grid (right) on desktop;
a swipe carousel with counter pill + arrows on mobile. Layout is chosen by the
`mobile` prop when set, otherwise by a CSS media query at 800px. Images zoom on
hover (scale 1.05, overflow hidden). The "Alle foto's" button sits bottom-right.

**Props**

| Prop     | Type                          | Default     | Description |
|----------|-------------------------------|-------------|-------------|
| `images` | `{ url: string; alt?: string }[]` | —       | Ordered photos. First is the hero; the next 4 fill the thumbnail grid. |
| `mobile` | `boolean \| undefined`        | `undefined` | Force the mobile (`true`) or desktop (`false`) layout. Omit to use the 800px media query. |

**Events**

- `openGallery` — the "Alle foto's" button was clicked.
- `openPhoto(index: number)` — a photo was clicked (hero is index 0).

---

### VlPhotoModal

Lightbox gallery modal, teleported to `<body>` with body scroll lock
(`useScrollLock`). Two views: `grid` (masonry thumbnails, hover zoom) and
`photo` (single large photo with prev/next, counter, and thumb-strip). Desktop
renders an 80vw right slide-in panel; mobile a full-screen overlay. Switches at
800px. Esc closes; ←/→ navigate in photo view.

**Props**

| Prop          | Type                              | Default  | Description |
|---------------|-----------------------------------|----------|-------------|
| `modelValue`  | `boolean`                         | —        | Open state (`v-model`). |
| `images`      | `{ url: string; alt?: string }[]` | —        | Photos to display. |
| `index`       | `number`                          | —        | Active photo index (`v-model:index`). |
| `title`       | `string`                          | `''`     | Optional header title. |
| `view`        | `'grid' \| 'photo'`               | `'grid'` | Active view (`v-model:view`). |

**Events**

- `update:modelValue(open: boolean)` — open state changed.
- `update:index(i: number)` — active photo changed.
- `update:view(v: 'grid' | 'photo')` — view changed.
- `close` — modal was dismissed (also emits `update:modelValue(false)`).

---

### VlHotelCard

Compact map hover/preview card: 4px coloured top band, photo on the left,
hotel name + stars, location line, and a "Vanaf €X" footer with persons icon.

**Props**

| Prop         | Type     | Default | Description |
|--------------|----------|---------|-------------|
| `name`       | `string` | —       | Hotel display name (2-line clamp). |
| `image`      | `string` | —       | Hero image URL. |
| `starRating` | `number` | `0`     | Number of ★ glyphs. |
| `city`       | `string` | —       | City line. |
| `region`     | `string` | `''`    | Region appended after the city. |
| `price`      | `number` | —       | Cheapest price (shown after "Vanaf"). |
| `nights`     | `number` | `0`     | Nights for the "/ N nachten" suffix. |

**Events**

- `click` — the card was clicked or activated via Enter.

---

### VlDealCard

Flagship hotel-deal card supporting grid and list layouts. Features a photo
carousel (grid mode, multiple gallery images, arrows fade in on hover) unless
in panel mode; a discount badge; a favourite heart (top-right); an inclusion
checkmark list; a "X personen, Y nachten" meta line; a "Vanaf €price" line with
struck original price; and a CTA button ("Bekijk", or a two-line "Beschikbare
datums" when `dateMismatch`). Title clamps to 4 lines. The whole card navigates
to `dealHref`; clicks on interactive children (links, buttons) are ignored.
Greyed out when `nightsMismatch || dateMismatch`. Prices use `formatPrice`;
labels use `nightsLabel` / `personsLabel`.

**Props**

| Prop               | Type        | Default | Description |
|--------------------|-------------|---------|-------------|
| `deal`             | `{ id, title, nights, basePrice, originalPrice, discountPercentage?, inclusions }` | — | The deal (`title` + `inclusions` are plain strings). |
| `hotel`            | `{ name, slug, city, region?, starRating?, heroImage?, galleryImages? }` | — | Optional hotel header. |
| `gridMode`         | `boolean`   | `false` | Grid (photo on top) vs list (photo on left) layout. |
| `panelMode`        | `boolean`   | `false` | Sidepanel variant: single deterministic photo, no carousel arrows, hidden discount chip. |
| `fullInclusions`   | `string[]`  | —       | Show every inclusion line (2-line wrap) instead of capping at 5. |
| `hideHotelInfo`    | `boolean`   | `false` | Hide the hotel header even when a `hotel` is supplied. |
| `hideLabels`       | `boolean`   | `false` | Hide label overlays (reserved). |
| `nightsMismatch`   | `boolean`   | `false` | Deal's nights don't match the filter → greyed-out state. |
| `dateMismatch`     | `boolean`   | `false` | Deal unavailable on the date → greyed out, two-line CTA. |
| `mismatchMessages` | `string[]`  | —       | Red stacked messages above the meta line. |
| `dealHref`         | `string`    | `'#'`   | Link target for whole-card / CTA navigation. |
| `pricedPersons`    | `number`    | `2`     | Party size in the "X personen, Y nachten" line. |
| `isFavorite`       | `boolean`   | `false` | Favourite heart filled state. |

**Events**

- `click` — whole-card click (only when not on an interactive child).
- `favorite` — favourite heart toggled.
