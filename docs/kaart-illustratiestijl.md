# Getekende routekaart — prompt en iconen

Bewaard voor later. De code is teruggezet naar de vlakke kaart; dit document
houdt vast wát er gebouwd was en hoe je het terughaalt.

De uitvoering staat in commit `fe87e65` op de tak `map-visualisatie`:

```bash
git show fe87e65 --stat
git cherry-pick fe87e65
```

## De prompt

> Maak van de routekaart een illustratie in plaats van een atlas.
>
> **Ondergrond.** Water wit. Al het land van Europa in rustig grijs
> (`#e9e9e9`), met de provincie- en landsgrenzen als een dunne witte snee
> erdoorheen — geen donkere lijnen, geen streepjes. De provincie waar de reis
> doorheen gaat krijgt een vlakke vulling in `#5fc4b5` met een contour in
> `#1f6f66` van 2 px. Geen kaarttegels: geen wegen, geen plaatsnamen, geen
> terrein.
>
> **Namen.** De omliggende provincies en landen krijgen hun naam in het gebied
> zelf, in Recoleta bold 22 px, kleur `#2b7a70` — geen marker, geen punt. De
> naam staat op het punt dat het verst van elke rand ligt, want een zwaartepunt
> valt bij een vorm als Zeeland of Noord-Holland in het water. De provincie van
> de reis krijgt géén naam: die ruimte is voor de illustraties.
>
> **Illustraties.** Zwarte silhouetten, geen lijnwerk, geen kleur. Twee soorten:
>
> 1. De echte highlights van de reis, op hun eigen coördinaat, met een icoon dat
>    bij het onderwerp past (landgoed, molen, museum, uitkijktoren, veerpont,
>    kasteel). 52 px.
> 2. Sfeericonen in de ruimte die overblijft: bomen, struiken, koeien, een
>    akker, een bankje, een kerkje, een brug, een wegwijzer. 30–44 px, bomen en
>    struiken het vaakst.
>
> Alles blijft binnen de provincie van de reis — buiten de reis is de kaart leeg
> grijs, dat is juist wat de provincie laat opvallen. Iconen staan op hun voet
> en steken dus naar boven uit hun punt: blijf minstens 3 km van de
> provinciegrens, anders groeit een boom over de rand. Hou 17 km vrij rond elk
> hotel (daar komt het gebouw en de plaatsnaam) en 6,5 km rond elk ander icoon.
> Plaats op een raster met speling, en laat de keuze en de speling afhangen van
> een hash van de coördinaten — dan geeft dezelfde kaart steeds dezelfde
> tekening.
>
> **Route en hotels.** De route is een stippellijn in zwart: weight 5,
> `dash-array: 1 13`, ronde uiteinden. Elk hotel is een zwarte stip van 14 px
> met de plaatsnaam ernaast in Recoleta bold 19 px, met een groene gloed als
> tekstschaduw zodat hij leesbaar blijft over een illustratie. Het gebouw staat
> ernaast op 68 px — kasteel of landhuis, afhankelijk van de hotelnaam — om en
> om links/rechts en hoog/laag, zodat hotels die dicht bij elkaar liggen elkaar
> niet overlappen.
>
> **Kader.** Zoom op de provincie, niet op de route: de tekening is het
> onderwerp.

## De iconen

Zeventien silhouetten in `public/icons/mhtj-kaart/`, viewBox 64×64, `fill:#111`,
`fill-rule: evenodd` (witte vensters zijn uitsparingen). Ze staan op hun voet,
dus het ankerpunt is midden-onder.

`akker` · `bank` · `boerderij` · `boom` · `boot` · `brug` · `cipres` · `fiets` ·
`kasteel` · `kerk` · `koe` · `landhuis` · `molen` · `museum` · `struik` ·
`toren` · `wegwijzer`

Ze zijn met de hand getekend. De bestaande set in `public/icons/highlights/` is
24×24 UI-iconen; die lezen als knopjes, niet als kaartillustratie.

## Onderwerp → icoon

Op trefwoord in de naam en de tekst van de highlight, eerste treffer wint; wat
nergens op past wordt `museum`.

| trefwoord | icoon |
|---|---|
| kastel, château, burcht, slot | `kasteel` |
| landgoed, estate, havezate, buitenplaats | `landhuis` |
| molen, mill | `molen` |
| kerk, kathedraal, abdij, klooster, belfort | `kerk` |
| museum | `museum` |
| uitkijktoren, toren, heuvelrug, berg, duin | `toren` |
| veer, pont, haven, boot, rivier, meer | `boot` |
| brug | `brug` |
| fiets, cycl, route | `fiets` |
| boerderij, hoeve, farm | `boerderij` |
| bos, natuur, park, heide | `boom` |
| markt, stad, dorp, hanzestad, centrum | `museum` |

Let op de spelling `kastel` en niet `kasteel`: anders valt "Kastelen rond
Diepenheim" erbuiten.

## Wat er nog niet goed was

- **Hotels klitten samen.** Delden en Markelo liggen tien kilometer uit elkaar;
  op een kaart die de hele provincie toont vallen de gebouwen en de namen over
  elkaar. Inzoomen op het routegebied lost dat op, maar dan verlies je de
  provincievorm.
- **Een naam van een buurprovincie kan over het groen vallen.** De plaatsing
  houdt geen rekening met de uitgelichte provincie.
- **De iconen zijn mijn hand, niet die van een illustrator.** Is er een echte
  set, dan is de tabel hierboven de enige plek die aangepast hoeft te worden.
