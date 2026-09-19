# Styleguide — vakantiepagina (Multi Hotel Trip)

De stijl zoals die daadwerkelijk op `/multi-hotel-trip/vakanties` staat. Alle waarden zijn
uitgelezen uit de draaiende dev-server en uit de CSS-bronnen, niet uit een ontwerpbestand.

| | |
|---|---|
| Route | `/multi-hotel-trip/vakanties` (rendert `pages/multi-hotel-trip/search.vue`) |
| Scope | `body.vl-release-mht` + `data-mht-variant="6"` |
| Gemeten bij | venster 1320px breed, zonder filterbalk |
| Gelezen op | 15 september 2026 |

Bronnen: `app/assets/css/{variables,typography,fonts}.css`, `mht-variant-6.css`,
`components-multi-hotel-trip/{search/TripQuickFilters,hotel/HotelSearchBar,search/DealCard,global/SiteFooter,global/LandingHero}.vue`.

---

## 1. Tokenlagen

De pagina draait op twee lagen. `:root` draagt de basiswaarden die het hele project deelt;
`body.vl-release-mht` (gezet in `app.vue`) schrijft daar een deel van over voor dit prototype.

### Overschreven in deze scope

| Token | Basis | Op deze pagina |
|---|---|---|
| `--color-primary` | `#E97132` | **`#FB862C`** |
| `--color-primary-hover` | `#D4621F` | **`#F56800`** |
| `--color-text-primary` | `#1A1A1A` | **`#141414`** |
| `--color-dark` | `#1A1E1E` | **`#141414`** |
| `--color-discount` | `#00B67A` | **`#27C88D`** |
| `--color-review` | `#00B67A` | **`#27C88D`** |
| `--radius-xs` … `--radius-xl` | 2 / 4 / 8 / 12 / 16px | **6px** (alle vijf) |
| `--container-max` | `1137px` | **`1200px`** (via variant 6) |

Eén zwart voor alles: elke bijna-zwarte waarde in het prototype (`#1A1A1A`, `#1A1E1E`,
`#0E0E0C`, `#111`, `#000`) valt samen op `#141414`. Doorzichtige schaduwen en fotoscrims
houden bewust puur zwart — dat is schaduw, geen vulling.

---

## 2. Kleur

### Merk en accent

| Token | Waarde | Waar |
|---|---|---|
| `--color-primary` | `#FB862C` | Knoppen, links, het woord Arrangement |
| `--color-primary-hover` | `#F56800` | Hover op knoppen |
| `--color-star` | `#FB862D` | Sterren bij hotels |
| `--color-dark` | `#141414` | Footer, actieve pil, kortingsbadge |

### Tekst

| Token | Waarde | Waar |
|---|---|---|
| `--color-text-primary` | `#141414` | Koppen en lopende tekst |
| `--color-text-secondary` | `#555555` | Plaatsnamen, bijschriften |
| `--color-text-muted` | `#999999` | Niet-beschikbaar, uitgegrijsd |
| `--color-text-link` | `#4A4A4A` | Tekstlinks buiten het accent |

### Vlakken en lijnen

| Token | Waarde | Waar |
|---|---|---|
| `--color-surface` | `#FFFFFF` | Kaarten, zoekbalk, pillen |
| `--color-background-secondary` | `#FBFAF8` | Rustvlak achter fotoblokken |
| `--color-border-light` | `#F0F0F0` | Kaartrand en kaartscheiding |
| `--color-border` | `#E5E5E5` | Hover-vulling van pillen |
| _(hardgecodeerd)_ | `#E5E2DA` | Rand van pillen en toolbar — zie §7 |

### Status

| Token | Waarde | Waar |
|---|---|---|
| `--color-discount` / `--color-review` | `#27C88D` | Vinkjes, beoordelingen |
| `--color-error` | `#D32F2F` | Foutmeldingen **en** de doorgestreepte oude prijs |

---

## 3. Typografie

### Stacks

```css
--font-heading: 'Recoleta', 'Playfair Display', Georgia, serif;
--font-body:    'Basis Grotesque', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

Beide zijn licentiefonts, lokaal geladen uit `public/fonts/` (`fonts.css`, `font-display: swap`).
Recoleta in 400 / 500 / 600 / 700.

### Zoals ze op deze pagina staan

| Klasse | Font | Grootte / regelafstand | Bijzonderheden |
|---|---|---|---|
| `.home-hero__title` | Recoleta 400 | `clamp(64px, 10vw, 128px)` / `0.9` | letterafstand `-3.24px`, wit op foto |
| `.home-hero__tagline` | Basis Grotesque 400 | 20px / 28px | letterafstand `-0.1px`, wit |
| `.search-page__title` | Recoleta 700 | 28px / 36.4px | "7 vakanties" |
| `.deal-card-v2__pitch` | Recoleta 700 | 18px / 23.4px | arrangementstitel op de kaart |
| `.deal-card-v2__name-row` | Recoleta 700 | 16px / 20.8px | "Autovakantie met 3 hotels" |
| `.deal-card-v2__package-label` | Recoleta 600 | 13px / 20.8px | in `#FB862C` |
| `.deal-card-v2__price` | Recoleta 700 | 22px / 22px | |
| `.deal-card-v2__discount-badge` | Recoleta 700 | 15px / 24px | letterafstand `0.5px`, wit |
| `.deal-card-v2__cta` | Basis Grotesque 600 | 14px / 22.4px | |
| `.search-bar__btn` | Basis Grotesque 700 | 14px | |
| `.tqf__pill` | Basis Grotesque 400 | 14px / 1 | filters en toolbar |
| `body` | Basis Grotesque 400 | 16px / 1.6 | |

### Globale schaal (`typography.css`)

Alle koppen: `--font-heading`, gewicht 600, regelafstand 1.3.

| | h1 | h2 | h3 | h4 | h5 | h6 |
|---|---|---|---|---|---|---|
| Grootte | 32px | 24px | 20px | 18px | 16px | 14px |

De vakantiepagina gebruikt deze schaal nauwelijks — zie §7.

---

## 4. Ruimte, vorm en beweging

### Ruimteschaal

| Token | `xs` | `sm` | `md` | `lg` | `xl` | `2xl` | `3xl` |
|---|---|---|---|---|---|---|---|
| px | 4 | 8 | 16 | 24 | 32 | 48 | 64 |

### Radius

Eén hoek voor alles: **6px**. De vijfdelige schaal bestaat nog in de code maar draagt in deze
scope geen betekenis meer. Ronde vormen (favorietenhart, 50%) liggen per component vast en
lopen niet via een token.

### Schaduw

| Token | Waarde | Waar |
|---|---|---|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,.06)` | |
| `--shadow-card` | `0 2px 8px rgba(0,0,0,.08)` | rust-stand van de kaart |
| `--shadow-hover` | `0 4px 12px rgba(0,0,0,.12)` | kaart onder de muis |
| `--shadow-sidebar` | `0 4px 16px rgba(0,0,0,.10)` | filterpaneel en zijpanelen |

### Beweging

| Token | Waarde | Waar |
|---|---|---|
| `--transition-fast` | `150ms ease` | randkleur, vulling, schaduw |
| `--transition-base` | `250ms ease` | |
| `--transition-slow` | `400ms ease` | |

---

## 5. Layout

| Maat | Waarde |
|---|---|
| Maximale containerbreedte | 1200px |
| Zijmarge van de container | 24px |
| Kaartkolommen zonder filterbalk | 3 |
| Kaart in de grid | 315 × 608px |
| Hoogte zoekbalk | 76px (velden 60px) |
| Hoogte pillen en toolbar | 44px |

---

## 6. Componenten

### Quick-filter pil — `TripQuickFilters.vue`

```css
height: 44px;
padding: 0 17px;
background: #fff;
border: 1px solid #e5e2da;
border-radius: var(--radius-sm);   /* 6px */
color: #141414;
font-size: 14px;
font-weight: 400;
line-height: 1;
gap: 6px;                          /* icoon 14 × 14 */
```

| Stand | Vulling | Tekst | Rand |
|---|---|---|---|
| Rust | `#FFFFFF` | `#141414` | `#E5E2DA` |
| Hover | `#E5E5E5` | `#141414` | `#E5E2DA` |
| Aan | `#141414` | `#FFFFFF` | `#141414`, met kruisje rechts |
| Uitgeschakeld | `#FFFFFF` | uitgegrijsd | `#E5E2DA` |

### Knoppen

| Knop | Hoogte | Padding | Font | Vulling |
|---|---|---|---|---|
| Zoekbalk ("Vind deals") | 60px | `0 38px` | Basis Grotesque 700 14px | `#FB862C` |
| Kaart ("Bekijk") | 42px | `10px 24px` | Basis Grotesque 600 14px | `#FB862C` |

Beide radius 6px, hover `#F56800`, witte tekst.

### Zoekbalk — `HotelSearchBar.vue`

Wit vlak, padding 8px, radius 6px, totale hoogte 76px. Velden 60px hoog met `0 18px`
zijpadding; het eerste veld heeft radius `6px 0 0 6px`, de knop staat rechts.

### Kortingsbadge — `DealCard.vue`

Vaste doos van **60 × 43px** in de verhouding 145:104 van de tekening zelf, als inline SVG in
`#141414`, `background-size: contain`. Staat op `top: 16px; left: 16px` over de foto.

Padding is expres asymmetrisch — `0 13px 0 6px`: het rechteruiteinde loopt schuin toe, dus
geometrisch centreren leest als "naar rechts geduwd". De extra rechterpadding herstelt het
optische midden.

### Vakantiekaart — `DealCard.vue`

```css
border: 1px solid var(--color-border-light);   /* #F0F0F0 */
border-radius: var(--radius-lg);               /* 6px */
box-shadow: var(--shadow-card);
background: var(--color-surface);
```

Inhoud op 16px padding. De scheidingslijn onder de hotelregel gebruikt dezelfde 1px en
dezelfde kleur als de buitenrand, zodat lijst en omlijsting als één lijndikte lezen.

Volgorde: foto (met kortingsbadge linksboven, favorietenhart rechtsboven) → soort vakantie
(Recoleta 700 16px) → plaatsnamen (13px `#555555`) → scheidingslijn → arrangementstitel
(Recoleta 700 18px) → label Arrangement (Recoleta 600 13px `#FB862C`) → inclusief-regels met
vinkjes in `#27C88D`, onderling 4px → prijsregel: oude prijs doorgestreept in `#D32F2F`,
nieuwe prijs Recoleta 700 22px, CTA rechts.

### Footer — `SiteFooter.vue`

Vlak `--color-dark` (`#141414`), witte tekst. Vier kolommen `1.2fr 1fr 1fr 1fr` met
`--space-2xl` (48px) tussenruimte, padding `48px 24px`. Sluit strak aan op de laatste sectie
(`margin-top: 0`) — de eigen binnenmarge doet het werk.

---

## 7. Afwijkingen

Geen fouten, wel plekken waar de pagina buiten het tokensysteem om werkt. Handig om te weten
voordat je een token aanpast en je wijziging niet doorkomt.

**De randkleur van pillen en toolbar is hardgecodeerd.**
`#E5E2DA` staat rechtstreeks in `TripQuickFilters.vue` en loopt niet via een token. Het is een
warm grijs, net iets anders dan `--color-border` (`#E5E5E5`) — dat wél in dezelfde component
zit, als hover-vulling. Twee bijna gelijke grijzen naast elkaar.

**De oude prijs staat in foutrood.**
De doorgestreepte vanafprijs gebruikt `--color-error` (`#D32F2F`). Wie dat token aanpast om
foutmeldingen te veranderen, verft ook elke prijs op de pagina.

**Twee tokens, één kleur.**
`--color-star` is `#FB862D` en `--color-primary` is `#FB862C`: één punt verschil in blauw, met
het blote oog niet te zien.

**De radius-schaal draagt geen informatie meer.**
Alle vijf de stappen staan op 6px. Componenten die `--radius-xs` tot `--radius-xl` netjes uit
elkaar houden, krijgen allemaal dezelfde hoek.

**Koppen volgen de globale schaal niet.**
`typography.css` gaat 32 / 24 / 20 / 18 / 16 / 14 op gewicht 600. De pagina zet haar koppen via
componentklassen op 28, 18 en 16 — en op gewicht 700. De hero staat daar helemaal los van, op
gewicht 400 met letterafstand `-3.24px`.
