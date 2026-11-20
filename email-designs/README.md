# E-mails van de multi-hotel vakanties

Alleen de e-mails die bij de multi-hotel vakanties horen (Multi Hotel Trip). De overige
ViaLuxury-mails (welkomstmails, reminders, Jesse's templates) staan in het losse project
`vialuxury-emails` (eigen git-repo, naast deze repo).

Gebouwd met [react-email](https://react.email) op het nieuwsbrief-template (header met logo en
Trustpilot, footer). Ze worden als statische HTML gehost in het prototype: preview onder
`/multi-hotel-trip/emails/<slug>` (licht/donker, desktop/mobiel, Kopieer HTML, Download), links
in het vakje "Multi Hotel Trip" op het startscherm.

## Structuur

- `emails/` — de ontwerpen (één `.tsx` per e-mail, met `PreviewProps` als voorbeelddata)
- `components/` — `NewsletterHeader`/`NewsletterFooter` en `theme.ts`
- `lib/registry.ts` — lijst van de e-mails (slug, titel, omschrijving)
- `scripts/export.ts` — rendert alle e-mails naar `../public/emails/<slug>[.dark].html` en `../app/data/mht-emails.json`

Afbeeldingen voor de mails staan in de hoofdapp: `../public/images/mail/`.

## Commando's

```bash
npm install          # eenmalig
npm run email        # react-email editor met hot reload op http://localhost:3300
npm run export       # HTML + lijst exporteren naar de hoofdapp (na elke wijziging; commit het resultaat)
```

`npm run export` gebruikt relatieve afbeeldings-URL's; de preview maakt ze bij Kopieer/Download absoluut.
Met `EMAIL_BASE_URL=https://vialuxury.vercel.app npm run export` exporteer je direct met absolute URL's.

## Nieuwe e-mail toevoegen

1. Maak `emails/mijn-email.tsx` (kopieer de bevestigingsmail als vertrekpunt)
2. Zet `MijnEmail.PreviewProps = { ... }` met representatieve voorbeelddata
3. Registreer hem in `lib/registry.ts` en draai `npm run export`
4. Vervang de grijze "volgt"-regel op het startscherm (`app/pages/index.vue`, vakje Multi Hotel Trip) door de link
