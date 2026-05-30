# Mobile sticky behaviour — definitive spec (First Release)

Two independent sticky elements keep regressing because fixes for
one get applied to the other. This is the single source of truth.
**Do not "fix" one by changing the other. Do not swap the chosen
mechanism without re-reading this file.**

There are TWO separate problems with TWO different correct
solutions. They must never be unified or cross-edited.

---

## 1. `/first-release/search` — mobile toolbar (Filter / Kaart / Sorteren)

### Requirements (from user)
- Always visible: sits in normal flow under the page title at the
  start.
- Pins to the TOP of the viewport once scrolled past, and STAYS
  pinned the whole time you're scrolled down — visible on
  scroll-DOWN and scroll-UP (the recurring bug = "only shows on
  scroll up / doesn't show on scroll down").
- Left edge aligns with the page title (16px) and must NOT jump
  horizontally when it pins.
- Grey divider (`--color-border`) directly under the button row.
- Small gap below the title (not a big margin); modest gap to the
  first result card.
- When pinned/scrolled, a re-open-search magnifier button appears
  at the right of the row.

### Correct mechanism — CSS `position: sticky` (NOT fixed)
- `.search-page__mobile-toolbar { position: sticky; top: 0; z-index: 50 }`.
- It MUST be a direct child of `.search-page__results` (the tall
  block that spans the whole result list). If it lives in the
  short `.search-page__above-cards`, sticky un-sticks immediately —
  WRONG.
- `padding: 8px 0` (no horizontal padding) → buttons sit at the
  grid container's 16px inset = aligned with the title. Sticky
  never leaves horizontal flow, so it CANNOT jump. No `--stuck`
  class, no JS toggle, no spacer, no sentinel for the PIN.
- Negative `margin-top` (`calc(var(--space-sm) - var(--space-lg))`)
  tightens the gap below the header.

### Why NOT `position: fixed`
`position: fixed` is NOT repainted by iOS during momentum
scrolling → the bar "doesn't show on scroll down" until the scroll
settles. Toggling fixed on/off + inserting a spacer mid-scroll
makes it worse. `position: sticky` is GPU-composited, repaints
during scroll, and never changes the horizontal position. This is
the ONLY approved mechanism here.

### Hard constraints that silently break `position: sticky`
Keep the ancestor chain (`.search-page__results` →
`.search-page__grid.container` → `.search-page__main` →
`.search-page`) FREE of: `overflow: hidden/auto/scroll/clip` (any
axis — `overflow-x: hidden` computes `overflow-y: auto`!),
`transform`, `filter`, `perspective`, `contain: paint/layout/strict`,
and any fixed `height` shorter than the content. Any of these
turns an ancestor into the sticky scroll-root and the pin fails.

### The only JS allowed here
A `scrolledPast` boolean (`window.scrollY > 150`) that ONLY toggles
the re-open-search button's visibility. It must NOT touch the
toolbar's position/layout.

---

## 2. `/first-release/deal` + `/first-release/hotel` — mobile CTA footer

### Requirements (from user)
- Sticky footer pinned to the BOTTOM of the screen.
- Must stick to the VISIBLE viewport bottom even when the mobile
  browser chrome (iOS Chrome bottom toolbar / Safari URL bar)
  collapses or expands — no "bridge" gap where page content shows
  between the bar and the screen edge.
- Desktop: the SAME element is a TOP sticky header — the mobile
  pin must never affect desktop layout.

### Correct mechanism — `position: fixed` + `usePinToViewportBottom` (top-based)
- CSS: `.deal-page__cta-bar--mobile { position: fixed; bottom: 0;
  padding-bottom: env(safe-area-inset-bottom) }`.
- `usePinToViewportBottom(barRef, isMobile)` positions the bar via
  inline **`top`** (`bottom: auto`) so its BOTTOM edge lands exactly
  on the live visible bottom: `top = vv.offsetTop + vv.height −
  barHeight`. The bar stays glued to the bottom toolbar when chrome
  shows and drops to the screen bottom when chrome hides.
- Do NOT compute a "full / chrome-hidden viewport height" and
  subtract it (the old approach): `window.innerHeight` is
  inconsistent across iOS Safari/Chrome and a momentum/overscroll
  bounce inflated the running max → the bar floated ~⅓ up the
  screen on scroll-up. Pin to the visible bottom DIRECTLY instead.
- Gated by `isMobile`: when false it CLEARS the inline `top`/`bottom`
  so the desktop top-sticky header is untouched. Recomputes on
  `visualViewport` resize/scroll AND `window` scroll.

### Why NOT `position: sticky` here
A bottom-pinned footer that must follow the *visual* viewport
bottom across chrome animation needs the `visualViewport` API.
`position: sticky` can't track the collapsing chrome.

---

## Rule of thumb
- TOP pin that follows scroll → **`position: sticky`** (search toolbar).
- BOTTOM pin that follows the collapsing browser chrome →
  **`position: fixed` + `usePinToViewportBottom`** (deal/hotel footer).
- They are independent. Changing one must not touch the other.
