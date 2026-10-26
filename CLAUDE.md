# ViaLuxury prototype (Nuxt 4)

Eén Nuxt-app met meerdere, volledig losstaande prototypes naast elkaar. Elk
prototype heeft zijn eigen namespace (map-suffix, component-prefix, composable-
prefix, localStorage-keys, CSS-bestanden) zodat ze elkaar nooit raken:

| Prototype | Mappen | Prefix | Routes | CSS |
|---|---|---|---|---|
| Release 1 (R1, "Redesign") | `*-first-release` | `FirstRelease*` / `useFirstRelease*` | `/first-release/...` | `fr-*.css` |
| Release 2 (R2, "Variable Travel Group") | `*-second-release` | `SecondRelease*` / `useSecondRelease*` | `/second-release/...` | `sr-*.css` |
| Multi Hotel Trip (MHT) | `*-multi-hotel-trip` | `MultiHotelTrip*` / `useMultiHotelTrip*` | `/multi-hotel-trip/...` | `mht-*.css` |
| MVP 12-11-2026 (MVP) | `*-mvp-trip` | `MvpTrip*` / `useMvpTrip*` | `/mvp-trip/...` | `mvp-*.css` |
| Huisstijl / Northstar | bevroren oude prototypes | `Huisstijl*` / `Northstar*` | | |

Startscherm: `app/pages/index.vue`. Gedeeld: `app/data`, `app/types`,
`app/i18n`, `app/assets/css/{variables,base,typography,fonts}.css`.

R1 heeft sinds 2026-09-29 ook de checkout met room table (`app/pages/first-release/checkout/*`,
mobiele site `app/pages/first-release/m/checkout/*`, `components-first-release/checkout/*`,
`app/data/fr-checkout/`, `fr-checkout.css` gescoped onder `.fr-checkout`, middleware
`fr-mobile.global.ts`). Het is een poort van de MHT-checkout zónder vakantielogica; de
MHT-checkout wijkt daardoor sterk af, dus R1-checkoutwijzigingen leveren bij de automatische
sync (zie hieronder) vaak conflicten op — die in de MHT-bestanden oplossen.

## MVP 12-11-2026 = losstaande kopie van MHT (niet gesynchroniseerd)

Gemaakt met `scripts/copy-mht-to-mvp.sh` (eenmalig) en daarna teruggeschaald naar de
MVP-definitie in `vakanties voorbeeld content/MVP-scope multi-hotel vakanties.md`: geen
hoofdlink/speciale Vakanties-pagina (thema "Auto- en fietsvakanties" op de gewone
zoekpagina), nachten 1–4, geen reviewscores/gastbeoordelingen, routekaartjes als PNG
(`public/images/vakanties/maps/<tripId>-card.png` en `-pdp.png`), samengevat reisschema
als vrije tekst (`summaryText`) + sidepanel als één tekstblok, includes classic, geen
POI's op de grote kaart, room table met één standaardkamer, geen
prototype-schakelaars. Data in `app/data/mvp-*`. MVP-wijzigingen alleen in de
`*-mvp-trip`-bestanden; MHT blijft ongewijzigd.

Post-bookingflow van de MVP (sinds 2026-10-26): alleen de bevestigingspagina
(`app/pages/mvp-trip/checkout/bevestiging.vue`), de boekingsbevestigingsmail
(`email-designs/emails/mvp-vakantie-bevestiging.tsx`, slug `mvp-vakantie-bevestiging`, preview
`/mvp-trip/emails/<slug>`) en de accountomgeving (`app/pages/mvp-trip/account/*`) — eenmalige
kopieën van de MHT-versies die los van MHT worden uitgekleed (MVP-bevestigingspagina: alleen
het cirkeltje als preloader, geen route/confetti op de foto, geen tipsblok; MVP-mail: geen
tipsblok; MVP-account: alleen het boekingenoverzicht, kaart niet klikbaar, geen detailpagina —
annuleren/wijzigen volgt nog). De
MVP-pagina's en -mail dragen linksboven een oranje stikkertje "MVP" (`MvpTripFlowLink`). Het
MVP-schema staat op dezelfde flowpagina als de volledige versie (`/multi-hotel-trip/flow`, boven
de lijn); de flow-pil op de MVP-pagina's verwijst daar ook naartoe. Er is geen MVP-tipspagina.

## Multi Hotel Trip (MHT) = kopie van R1 — houd ze in sync

MHT is een namespaced kopie van R1 (gemaakt met `scripts/sync-r1-to-mht.sh init`)
waarin daarnaast de **checkout met room table** uit het flexibel-annuleren
prototype (`~/Code/vialuxury-checkout`, variant "Flexibel annuleren A — Room
table") is gemerged: `app/components-multi-hotel-trip/checkout/*`,
`app/pages/multi-hotel-trip/checkout/{datum,kamers,gegevens}.vue`, mobiele site
`app/pages/multi-hotel-trip/m/checkout/*`, tokens in `mht-checkout.css`
(gescoped onder `.mht-checkout`), data in `app/data/mht-checkout/`.

**Regel: elke wijziging aan R1 moet ook in MHT terechtkomen.** Dat gaat
automatisch:

- De post-commit hook (`scripts/git-hooks/post-commit`, installeren met
  `scripts/install-git-hooks.sh`) draait na elke commit die R1-bestanden raakt
  `scripts/sync-r1-to-mht.sh` en commit het resultaat als "MHT: sync met R1".
- Het script neemt de R1-diff sinds de marker (`scripts/mht-sync/last-synced-r1-commit`),
  hernoemt naar de MHT-namespace en merget 3-way (`git merge-file`) in de
  MHT-bestanden. MHT-eigen aanpassingen blijven staan.
- Bij conflicten: markers (`<<<<<<<`) in de MHT-bestanden oplossen en committen.
  Handmatig draaien: `scripts/sync-r1-to-mht.sh` (of `--dry-run`).
- Werk MHT-specifieke functionaliteit (multi-hotel navigatie/zoeken/PDP/checkout)
  alleen in de `*-multi-hotel-trip`-bestanden, nooit door R1 aan te passen.
- R2 wordt niet automatisch gesynchroniseerd; "R1&R2"-wijzigingen worden
  handmatig in beide doorgevoerd.

## E-mails van de vakanties (`email-designs/`)

Alleen de e-mails van de multi-hotel vakanties (react-email) staan in `email-designs/`; de
overige ViaLuxury-mails blijven in het losse, git-genegeerde project `vialuxury-emails/`
(eigen repo + eigen Vercel-URL). `npm run export` in `email-designs/` rendert elke e-mail (licht
+ donker) naar `public/emails/<slug>[.dark].html` en de lijst naar `app/data/mht-emails.json`;
de preview is `app/pages/multi-hotel-trip/emails/[slug].vue`. Afbeeldingen voor de mails in
`public/images/mail/`. Na elke wijziging aan een e-mail: exporteren én het resultaat committen.
Links naar de mails staan in het vakje "Multi Hotel Trip" op het startscherm (mails die nog
volgen staan er grijs bij). Links in e-mails naar het prototype gebruiken
`https://vialuxury.vercel.app/...`.

## Kaarten (Leaflet)

De kaartweergave van de zoekresultaten (`*/map/HotelBrowseMap.vue`) haalt
basiskaart-tegels via `app/utils/mapTiles.ts`: CARTO Voyager mét API-key
(`NUXT_PUBLIC_CARTO_API_KEY` in `.env`, zie `.env.example`; gratis via
carto.com/basemaps/api-key), zonder key OpenStreetMap-tegels. CARTO geeft
sinds sept. 2026 zonder key alleen "API KEY REQUIRED"-tegels terug.

## Werkwijze

- Verifieer wijzigingen in de browser (dev server `npm run dev`, poort 3000,
  wachtwoordpagina: `dealfirst`), commit en push daarna direct naar `main`.
