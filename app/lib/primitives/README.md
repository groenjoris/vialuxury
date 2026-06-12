# ViaLuxury UI Primitives

Atomic, prop-driven Vue 3 components. They are self-contained — no global
state, no prototype imports (except `VlModal`, which uses the shared
`useScrollLock` composable) — and styled entirely with the design tokens in
`~/lib/tokens/tokens.css`.

## Auto-import

Nuxt auto-imports everything in this folder with a `Vl` prefix, so
`VlButton.vue` is available as `<VlButton>` anywhere in the app without an
explicit import. Make sure the tokens stylesheet is loaded once at the app
root:

```ts
import '~/lib/tokens/tokens.css'
```

---

## VlButton

A button with three visual variants and three sizes.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` | Primary = orange/white. Ghost = transparent + border. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | |
| `disabled` | `boolean` | `false` | |
| `type` | `'button' \| 'submit'` | `'button'` | |
| `fullWidth` | `boolean` | `false` | Stretches to 100% width. |

**Events:** `click` (`MouseEvent`) — not emitted while disabled.
**Slots:** default — button label/content.

```vue
<VlButton variant="primary" size="lg" full-width @click="onSubmit">
  Boek nu
</VlButton>
```

---

## VlInput

A v-model-compatible text input with a token-based focus ring.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `modelValue` | `string` | `''` | v-model value. |
| `type` | `string` | `'text'` | Any native input type. |
| `placeholder` | `string` | `''` | |
| `disabled` | `boolean` | `false` | |
| `ariaLabel` | `string` | `undefined` | Sets `aria-label`. |

**Events:** `update:modelValue` (`string`), `focus` (`FocusEvent`), `blur` (`FocusEvent`).

```vue
<VlInput v-model="query" placeholder="Zoek een hotel" aria-label="Zoekterm" />
```

---

## VlBadge

A small pill label in three colour variants.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `'score' \| 'discount' \| 'neutral'` | `'neutral'` | Score = solid green/white. Discount = light green bg, green text. Neutral = grey. |
| `label` | `string` | `''` | Text shown when no slot is provided. |

**Slots:** default — overrides `label`.

```vue
<VlBadge variant="score" label="9.2" />
<VlBadge variant="discount">-35%</VlBadge>
```

---

## VlBreadcrumb

A single-line breadcrumb trail. The final item without an `href` is rendered
as the current page (muted, `aria-current="page"`) and truncates with an
ellipsis when the row overflows.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `items` | `Array<{ label: string; href?: string }>` | — | Items with an `href` become links; the rest are plain text. |

```vue
<VlBreadcrumb
  :items="[
    { label: 'Home', href: '/' },
    { label: 'Italië', href: '/italie' },
    { label: 'Hotel Bellagio' },
  ]"
/>
```

---

## VlIcon

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
<VlIcon name="heart" :size="24" style="color: var(--color-primary)" />
```

---

## VlTooltip

Wraps a trigger element and shows a teleported tooltip on hover/focus. The
bubble is positioned in fixed coordinates relative to the trigger and points
at it with a small caret.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `text` | `string` | — | Tooltip content. |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Side the bubble appears on. |

**Slots:** default — the trigger element.

```vue
<VlTooltip text="Inclusief ontbijt" position="top">
  <VlIcon name="info" />
</VlTooltip>
```

---

## VlToast

A teleported toast notification anchored to the bottom-centre of the viewport.
Auto-dismisses after `duration`; controlled via `v-model`.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `modelValue` | `boolean` | — | Visibility (v-model). |
| `message` | `string` | `''` | Text shown. |
| `duration` | `number` | `3000` | Auto-dismiss delay in ms. `0` = sticky (no auto-dismiss). |

**Events:** `update:modelValue` (`boolean`) — emitted `false` when it auto-dismisses.

```vue
<VlToast v-model="showToast" message="Opgeslagen in je favorieten" />
```

---

## VlModal

A teleported, accessible modal dialog with a dark overlay. Closes on overlay
click-outside and on Escape, and locks body scroll while open via the shared
`useScrollLock` composable.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `modelValue` | `boolean` | — | Open state (v-model). |
| `title` | `string` | `''` | Optional heading rendered in the default header. |
| `maxWidth` | `string` | `'480px'` | CSS max-width of the dialog. |

**Events:** `update:modelValue` (`boolean`), `close` — both fire on any close
action (overlay click, Escape, close button).
**Slots:** default — body; `#header` — replaces the title area (the close
button is always rendered); `#footer` — footer actions (only rendered when
provided).

```vue
<VlModal v-model="open" title="Bevestig je boeking" max-width="560px">
  <p>Weet je zeker dat je wilt doorgaan?</p>

  <template #footer>
    <VlButton variant="ghost" @click="open = false">Annuleer</VlButton>
    <VlButton variant="primary" @click="confirm">Bevestig</VlButton>
  </template>
</VlModal>
```
