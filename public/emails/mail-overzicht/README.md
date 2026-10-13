# E-maildesigns — overzicht

Geïmplementeerd uit het Claude Design-project *Folder uitwerken en formulier*, bestand
`Mail Overzicht.dc.html`. Statische pagina, geen build-stap en geen dependencies.

## Draaien

Deze map staat in `public/`, dus de Next.js-app serveert hem mee. Start de gallery en
open `/mail-overzicht`:

```bash
npm run dev
```

Daarna: <http://localhost:3200/mail-overzicht> — op Vercel dus `<domein>/mail-overzicht`.

Open de pagina niet via `file://`: dan blokkeert de browser `fetch`, waardoor "Kopieer HTML"
en "Download .html" niet werken.

Twee dingen maken die URL mogelijk:

- `next.config.ts` bevat een rewrite van `/mail-overzicht` naar `/mail-overzicht/index.html`.
  Zonder die rewrite geeft de URL zonder `index.html` een 404.
- `index.html` heeft `<base href="/mail-overzicht/">`. Zonder die base zouden de relatieve
  paden naar `./emails/` en `./assets/` op de URL zonder slash naar de site-root wijzen.

## Wat de pagina doet

- **Index** — kaartenraster met een levende preview van elk design (664 px breed, op 0,5
  geschaald in een venster van 300 px), plus filterchips voor *Welkom inschrijving*,
  *Reminder welkom code* en *Reminder bestaande klant*. Eén filter tegelijk actief;
  nog een klik op dezelfde chip of op *Wis filter* zet hem uit. De sectie
  *Inspiration examples* staat buiten het filter.
- **Detail** — grote preview met versie-, licht/donker- en desktop/mobiel-toggles
  (stage 700 px resp. 375 px), plus *Kopieer HTML* en *Download .html* voor de
  productie-HTML. `Esc` gaat terug naar het overzicht.

## De losse e-maildesigns (`emails/`)

De overzichtspagina rendert elk design in een `<iframe>` uit deze map. Verwachte
bestandsnaam is de componentnaam uit het designproject plus `.html`:

| Design | Versies → bestand |
| --- | --- |
| Welkom (Mail 1A) | `Mail1A.html`, `Mail1Av2.html`, `Mail1Av3.html`, `Mail1Av4.html`, `Mail1Av5.html` |
| Welkom (Mail 1B) | `Mail1B.html`, `Mail1Bv2.html` |
| Welkom (Mail 1A FAN) | `Mail1AFan.html`, `Mail1AFanv2.html` |
| Reminder welkom code (Mail 2) | `Mail2Reminder.html` |
| Reminder welkom code (Mail 3) | `Mail3Reminder.html`, `Mail3Reminderv2.html` |
| Reminder welkom code (Mail 4) | `Mail4Reminder.html` |
| Reminder welkom code (Mail 5) | `Mail5Reminder.html`, `Mail5Reminderv2.html` |
| Klant geboekt & uitgeschreven | `KlantGeboektUitgeschreven.html`, `KlantGeboektUitgeschrevenv2.html` |
| Klant geboekt & inactief | `KlantGeboektInactief.html`, `KlantGeboektInactiefv2.html` |
| Boekingsbevestiging | `Boekingsbevestiging.html` |
| Deal van de week | `DealVanDeWeek.html` |

Contract per bestand:

- Compleet HTML-document (dat is ook precies wat *Kopieer HTML* / *Download .html* teruggeeft).
- Leest `?mode=light|dark` en `?layout=desktop|mobile` uit de query string en stelt zichzelf
  daarop in. De overzichtspagina geeft die parameters mee bij elke toggle.
- Rendert op 100% breedte van de iframe, zonder eigen horizontale marges.

Ontbreekt een bestand, dan zet de overzichtspagina er automatisch een placeholder met het
verwachte pad neer; zodra het bestand er staat verschijnt de echte preview zonder
codewijziging. Nieuw design toevoegen? Eén entry in de `DESIGNS`-array in `index.html`.

### Waar deze bestanden vandaan komen

Het zijn kopieën van de `.dc.html`-designbestanden uit `dc-templates/Folder uitwerken en
formulier/`, met `.dc` uit de naam gehaald (`Mail1Av5.dc.html` → `emails/Mail1Av5.html`).
Ze zijn dus geen uitgeklede productie-HTML maar het volledige designdocument: ze renderen
via `emails/support.js` (de designruntime) en halen hun afbeeldingen uit `emails/assets/`.
Beide staan daarom naast de designs in deze map.

Werk je een design bij in het designproject? Kopieer het bestand opnieuw en haal `.dc` uit
de naam. Bij een nieuwe `support.js` moet de patch hieronder opnieuw worden toegepast.

### Patch in `emails/support.js`

De originele `support.js` leest props alleen uit de `data-props`-defaults van het design,
niet uit de query string — daardoor deden de licht/donker- en desktop/mobiel-toggles niets.
Er staat nu één toevoeging in (gemarkeerd met `PATCH (mail-overzicht)`) die props die het
design zelf declareert ook uit de query string leest, met de defaults als terugval.

### Bekende ruis in de console

Elk design bevat markup als `<img src="{{ bellSrc }}">`. De browser vraagt die letterlijke
URL op vóórdat `support.js` de DOM herschrijft, dus je ziet een paar 404's op
`{{ bellSrc }}`, `{{ gripSrc }}`, `{{ helpSrc }}` en `{{ checkSrc }}` langskomen. Daarna
wordt de echte afbeelding wél geladen; de previews zijn compleet.

## Merkfonts

`Recoleta-SemiBold.ttf`, `basisgrotesque-regular.ttf` en `basisgrotesque-bold.ttf` staan in
`assets/fonts/`, waar de `@font-face`-regels in `index.html` naar verwijzen. De designs zelf
laden hun fonts uit `emails/assets/`. Ontbreken die bestanden, dan valt de pagina terug op
Georgia (display) en Helvetica (body).
