# ViaLuxury prototype (Nuxt 4)

Eén Nuxt-app met meerdere, volledig losstaande prototypes naast elkaar. Elk
prototype heeft zijn eigen namespace (map-suffix, component-prefix, composable-
prefix, localStorage-keys, CSS-bestanden) zodat ze elkaar nooit raken:

| Prototype | Mappen | Prefix | Routes | CSS |
|---|---|---|---|---|
| Release 1 (R1, "Redesign") | `*-first-release` | `FirstRelease*` / `useFirstRelease*` | `/first-release/...` | `fr-*.css` |
| Release 2 (R2, "Variable Travel Group") | `*-second-release` | `SecondRelease*` / `useSecondRelease*` | `/second-release/...` | `sr-*.css` |
| Multi Hotel Trip (MHT) | `*-multi-hotel-trip` | `MultiHotelTrip*` / `useMultiHotelTrip*` | `/multi-hotel-trip/...` | `mht-*.css` |
| Huisstijl / Northstar | bevroren oude prototypes | `Huisstijl*` / `Northstar*` | | |

Startscherm: `app/pages/index.vue`. Gedeeld: `app/data`, `app/types`,
`app/i18n`, `app/assets/css/{variables,base,typography,fonts}.css`.

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

## Werkwijze

- Verifieer wijzigingen in de browser (dev server `npm run dev`, poort 3000,
  wachtwoordpagina: `dealfirst`), commit en push daarna direct naar `main`.
