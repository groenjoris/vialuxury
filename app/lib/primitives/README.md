# ViaLuxury UI Primitives

Atomic, prop-driven Vue 3 components. They are self-contained — no global
state, no prototype imports — and styled entirely with the design tokens in
`~/lib/tokens/tokens.css`.

## Auto-import

Nuxt auto-imports everything in this folder, so `Button.vue` is available as
`<Button>` anywhere in the app without an explicit import. Make sure the tokens
stylesheet is loaded once at the app root:

```ts
import '~/lib/tokens/tokens.css'
```

---

## Button

A button with three visual variants and three sizes.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `'primary' \| 'secondary' \| 'dark'` | `'primary'` | Primary = orange/white. Secondary = white bg + border. Dark = black bg (`--color-dark`) / white text, hover `#2b2b2b` (e.g. "Alle foto's", "Wijzig kamertype", map close). |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | |
| `disabled` | `boolean` | `false` | |
| `type` | `'button' \| 'submit'` | `'button'` | |
| `fullWidth` | `boolean` | `false` | Stretches to 100% width. |

**Events:** `click` (`MouseEvent`) — not emitted while disabled.
**Slots:** default — button label/content.

```vue
<Button variant="dark" size="lg" full-width @click="onSubmit">
  Wijzig kamertype
</Button>
```

---

## Input

A v-model-compatible text input. Mirrors the footer newsletter field: white
fill, transparent border, and a neutral (non-orange) focus border.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `modelValue` | `string` | `''` | v-model value. |
| `type` | `string` | `'text'` | Any native input type. |
| `placeholder` | `string` | `''` | |
| `disabled` | `boolean` | `false` | |
| `ariaLabel` | `string` | `undefined` | Sets `aria-label`. |

**Events:** `update:modelValue` (`string`), `focus` (`FocusEvent`), `blur` (`FocusEvent`).

```vue
<Input v-model="email" type="email" placeholder="Je e-mailadres" aria-label="E-mailadres" />
```

---

## Badge

A small pill label in two colour variants.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `'score' \| 'dark'` | `'score'` | Score = solid green (`--color-discount`) / white text (review score). Dark = solid black (`--color-dark`) / white text (photo stickers "2 nachten" / "Nog 1 beschikbaar"). |
| `label` | `string` | `''` | Text shown when no slot is provided. |

**Slots:** default — overrides `label`.

```vue
<Badge variant="score" label="9.2" />
<Badge variant="dark">2 nachten</Badge>
```

---

## Breadcrumb

A single-line breadcrumb trail. The final item without an `href` is rendered
as the current page (muted, `aria-current="page"`) and truncates with an
ellipsis when the row overflows.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `items` | `Array<{ label: string; href?: string }>` | — | Items with an `href` become links; the rest are plain text. |

```vue
<Breadcrumb
  :items="[
    { label: 'Home', href: '/' },
    { label: 'Italië', href: '/italie' },
    { label: 'Hotel Bellagio' },
  ]"
/>
```

---

## Icon

A lightweight inline-SVG icon. Stroke-based, uses `currentColor` so it inherits
the surrounding text colour.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `name` | `string` | — | One of the built-in icon names (below). Unknown names render an empty `<svg>`. |
| `size` | `number` | `20` | Width and height in px. |

**Built-in icons:** `search`, `close`, `chevron-left`, `chevron-right`,
`heart`, `share`, `map-pin`, `calendar`, `clock`, `users`, `check`, `phone`,
`info`, `star`, `plus`, `minus`.

```vue
<Icon name="heart" :size="24" style="color: var(--color-primary)" />
```

---

## Tooltip

The small circular ⓘ price-info icon (grey, italic "i", 14px circle). On
hover/tap/keyboard focus it shows a teleported dark bubble with a caret that
flips above ↔ below based on viewport space. Port of `PriceInfoTooltip`.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `'card' \| 'deal'` | `'card'` | `card` = long strike-through-price disclaimer (deal cards). `deal` = short booking-fee disclaimer (deal-page sidebar / sticky CTA). |

No slots — the icon and disclaimer text are built in.

```vue
<Tooltip variant="deal" />
```
