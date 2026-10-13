# ViaLuxury e-mailontwerpen

E-maildesigns gebouwd met [react-email](https://react.email). Ze worden als statische HTML
gehost in het prototype onder `/multi-hotel-trip/emails` (gallery met licht/donker,
desktop/mobiel, Kopieer HTML en Download).

## Structuur

- `emails/` — de ontwerpen (één `.tsx` per e-mail, met `PreviewProps` als voorbeelddata)
- `components/` — `NewsletterHeader`/`NewsletterFooter` (nieuwsbrief-template), `EmailLayout`, `theme.ts`
- `lib/registry.ts` — lijst van alle e-mails (slug, titel, omschrijving, sectie)
- `scripts/export.ts` — rendert alle e-mails naar `../public/emails/<slug>[.dark].html` en `../app/data/mht-emails.json`
- `dc-templates/` — de bestaande mailtemplates (bron); het statische overzicht staat in `../public/emails/mail-overzicht`

Afbeeldingen voor de mails staan in de hoofdapp: `../public/images/mail/` (en het logo-PNG in `../public/images/`).

## Commando's

```bash
npm install          # eenmalig
npm run email        # react-email editor met hot reload op http://localhost:3300
npm run export       # HTML + lijst exporteren naar de hoofdapp (na elke wijziging; commit het resultaat)
```

`npm run export` gebruikt relatieve afbeeldings-URL's; de gallery maakt ze bij Kopieer/Download absoluut.
Met `EMAIL_BASE_URL=https://vialuxury.vercel.app npm run export` exporteer je direct met absolute URL's.

## Nieuwe e-mail toevoegen

1. Maak `emails/mijn-email.tsx` (kopieer een bestaande; gebruik `NewsletterHeader`/`NewsletterFooter` en `theme.ts`)
2. Zet `MijnEmail.PreviewProps = { ... }` met representatieve voorbeelddata
3. Registreer hem in `lib/registry.ts` en draai `npm run export`
4. Zet een link op het startscherm (`app/pages/index.vue`, box "E-mails")

## Huisstijl

Kleuren en typografie komen uit `components/theme.ts`. E-mailclients laden zelden custom fonts,
daarom font-stacks met systeemterugval.
