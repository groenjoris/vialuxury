import { Body, Container, Head, Heading, Html, Preview, Section } from "@react-email/components";
import * as React from "react";
import CrmHeader from "../components/CrmHeader";
import { type Pill, PrimaryButton, s, site, TextLink } from "../components/crm";
import { AutomationBand, AutomationDealList, AutomationLetter, automationCss, automationDarkCss, automationDarkMedia, automationOutlookDarkCss, SearchSection, ThemeSection, type ThemeTile, AutomationFooter } from "../components/automation";
import { type AutomationDeal } from "../lib/automationDeals";
import { carltonBeach, dePlesman, desIndes, kurhaus, lauswolt, steenenburg, vanOys, villaRuimzicht, voco } from "../lib/automationDeals";
import { font, newsletter } from "../components/theme";

// Automationflow fl013 "abandoned search" — vier mails uit één component.
// Bron: "Automations in kaart.xlsx", tabblad Automation per variant, kolommen T, U, V en W.
// Secties in de volgorde van de sheet:
//   S1 Header (logo) → Kop → Intro → S18 Zoekopdracht (zoekterm, datum en personen, met de knop
//   naar alle resultaten) → S4 Hoteldeals (drie zoekresultaten) → S7 Themasectie (alleen mail 4) →
//   S13 Footer.
// Opbouw zoals de winkelmandjemails en crm-zoekopdracht: de intro uit de sheet is de brief
// (Letter), daaronder het zoekblok, dan de kop uit de sheet direct boven de resultaten, en elke
// mail eindigt met de hulplijn. De themasectie staat als keuzeblok op een beige band.
// Mergevelden: [voornaam], [zoekterm], [aankomstdatum] en [personen], hier met voorbeelddata.

type Props = {
  /** Deze mail heeft een donkere versie: de mail blijft licht en zet zichzelf om zodra de client
   *  donker staat (`true`). Zonder vlag blijft de mail altijd licht. De preview rendert de twee
   *  standen apart: "forced" zet de donkere regels vast aan, `false` laat ze helemaal weg. */
  darkMode?: boolean | "forced";
  recipientEmail: string;
  preheader: string;
  /** Leeg → "Beste gast,". */
  firstName?: string;
  /** Kop boven de zoekresultaten. */
  heading?: string;
  /** Kop bovenaan de mail, boven de brief (mail 2 en 4). */
  topHeading?: string;
  /** Leeg → geen aanhef en geen introtekst (mail 2). */
  intro?: string;
  /** S18 Zoekopdracht. Leeg → "jouw zoekopdracht". */
  searchTerm?: string;
  arrivalDate?: string;
  persons?: number;
  resultsUrl: string;
  /** S4: drie zoekresultaten die passen bij de zoekopdracht. Mail 4 toont er geen. */
  results?: AutomationDeal[];
  /** S7 Themasectie (mail 4): kop, de thema's van de verzendmaand en de onderregel. */
  themeSection?: { title: string; note: string; items: ThemeTile[] };
  /** Tekstlink onder de resultaten. */
  footerLink?: { href: string; label: string };
  /** Knop onder de resultaten. */
  footerCta?: { href: string; label: string };
};

export default function AutomationSearch({ recipientEmail, preheader, firstName, heading, topHeading, intro, searchTerm, arrivalDate, persons, resultsUrl, results, themeSection, footerLink, footerCta, darkMode }: Props) {
  const c = newsletter.light;

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Heeft de mail een donkere versie, dan zegt dit de client dat de mail het zelf regelt
            en hij er niet zijn eigen kleuren overheen moet gooien. */}
        {darkMode && <meta name="color-scheme" content="light dark" />}
        {darkMode && <meta name="supported-color-schemes" content="light dark" />}
        <style>{automationCss}</style>
        {darkMode === true && <style>{automationDarkMedia}</style>}
        {darkMode === true && <style>{automationOutlookDarkCss}</style>}
        {darkMode === "forced" && <style>{automationDarkCss}</style>}
      </Head>
      <Preview>{preheader}</Preview>
      <Body className="d-bg" style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader />
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Opening: de kop en, als er een introtekst is, de brief met de aanhef */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            {topHeading && <Heading as="h1" className="m-h1 d-head" style={{ ...s.h1, marginBottom: intro ? "16px" : 0 }}>{topHeading}</Heading>}
            {intro && <AutomationLetter firstName={firstName}>{intro}</AutomationLetter>}
          </Section>

          {/* S18 Zoekopdracht, direct onder de ondertekening */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <SearchSection searchTerm={searchTerm} arrivalDate={arrivalDate} persons={persons} resultsUrl={resultsUrl} />
          </Section>

          {/* S4 Hoteldeals: de zoekresultaten, met de kop erboven */}
          {results && results.length > 0 && (
            <Section className="m-pad" style={{ padding: "44px 32px 0" }}>
              {heading && <Heading as={topHeading ? "h2" : "h1"} className="m-h1 d-head" style={s.h1}>{heading}</Heading>}
              <AutomationDealList deals={results} />
            </Section>
          )}

        </Container>

        {/* S7 Themasectie: keuzeblok op een beige band over de hele breedte */}
        {themeSection && (
          <AutomationBand top="44px">
            <ThemeSection title={themeSection.title} note={themeSection.note} items={themeSection.items} />
          </AutomationBand>
        )}

        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Knop onderaan */}
          {footerCta && (
            <Section className="m-pad" style={{ padding: "28px 32px 0" }}>
              <PrimaryButton href={footerCta.href}>{footerCta.label}</PrimaryButton>
            </Section>
          )}

          {/* Tekstlink onderaan */}
          {footerLink && (
            <Section className="m-pad" style={{ padding: "24px 32px 0" }}>
              <TextLink href={footerLink.href}>{footerLink.label}</TextLink>
            </Section>
          )}

          {/* Witruimte tussen de inhoud en de footer. Eindigt de mail op een band (de themategels),
              dan vervalt hij, zodat de band tegen het klantenserviceblok aan sluit. */}
          {(footerCta || footerLink || !themeSection) && (
            <Section style={{ height: "44px", lineHeight: "44px", fontSize: 0 }}>&nbsp;</Section>
          )}
        </Container>
        <AutomationFooter recipientEmail={recipientEmail} reason="omdat je je hebt aangemeld voor de nieuwsbrief van ViaLuxury" />
      </Body>
    </Html>
  );
}

// ── Voorbeelddata ──────────────────────────────────────────────────────────────────────────
// Zoekopdracht: Den Haag, 20 november, 2 personen.
const TERM = "Den Haag";
const DATUM = "20 november";
const resultsUrl = (campaign: string) => `${site}/first-release/search?utm_source=email&utm_medium=crm&utm_campaign=${campaign}`;
const base = { recipientEmail: "sanne.devries@example.com", firstName: "Sanne", searchTerm: TERM, arrivalDate: DATUM, persons: 2 };

/** De themategels van de verzendmaand, met naam en landingspagina uit het tabblad Themategels.
 *  November heeft volgens Seizoensthema's wellness, culinair wild en wijn, en experiences;
 *  "Hotels met experiences" heeft nog geen landingspagina en staat er daarom niet bij. */
const theme = (path: string) => `https://vialuxury.com/nl-NL/zoeken?theme=${path}`;
// De thema's van de verzendmaand als beeldende tegels. De foto's hieronder zijn arrangementfoto's
// als plaatsvervanger; de echte themafoto's volgen nog.
const novemberThemes: ThemeTile[] = [
  { label: "Wellness", href: theme("arrangementen-wellness-overnachting"), image: vanOys.image },
  { label: "Bubbelbad op kamer", href: theme("hotelkamer-jacuzzi"), image: villaRuimzicht.image },
  { label: "Hotels met zwembad", href: theme("hotelkamer-zwembad"), image: carltonBeach.image },
  { label: "Culinaire experiences", href: theme("arrangementen-culinair-genieten"), image: lauswolt.image },
  { label: "Overnachting met diner", href: theme("arrangementen-overnachting-met-diner"), image: steenenburg.image },
];

/** v01_tf028_fl013_nl-NL_1_abandoned_search — 1 minuut na het zoeken. */
export const search1Props = {
  ...base,
  preheader: `De beste arrangementen voor ${DATUM}.`,
  heading: "Dit vonden we voor je",
  // Feedback 24-11-2026.
  intro: "We hebben nog een paar hele mooie arrangementen gevonden bij jouw zoekopdracht.",
  resultsUrl: resultsUrl("retargeting_abandonedsearch_1"),
  results: [desIndes, dePlesman, voco],
} satisfies Props;

/** v01_tf029_fl013_nl-NL_2_abandoned_search — 1 dag na het zoeken. */
export const search2Props = {
  ...base,
  preheader: "Onze favorieten voor jouw data.",
  // Feedback 24-11-2026: kop bovenaan, de kop boven de resultaten ingekort, en een tekstlink eronder.
  // Feedback 24-11-2026, tweede ronde: alleen de kop, geen aanhef en geen introtekst meer.
  topHeading: `${base.firstName}, onze favorieten voor jouw zoekopdracht`,
  resultsUrl: resultsUrl("retargeting_abandonedsearch_2"),
  results: [voco, desIndes, dePlesman],
  footerLink: { href: "https://www.vialuxury.com/nl-NL/", label: "Bekijk alle ViaLuxury arrangementen" },
} satisfies Props;

/** Variant voor als de voornaam niet bekend is: de kop zonder naam. */
export const search2ZonderNaamProps = {
  ...search2Props,
  firstName: undefined,
  topHeading: "Onze favorieten voor jouw zoekopdracht",
} satisfies Props;

/** v01_tf030_fl013_nl-NL_3_abandoned_search — 3 dagen na het zoeken. Ook net buiten het
 *  zoekgebied, vandaar Scheveningen erbij. */
export const search3Props = {
  ...base,
  preheader: "Misschien zit je verblijf ertussen.",
  // Feedback 24-11-2026: nieuwe kop boven de resultaten, nieuwe introtekst en een knop eronder.
  heading: "Onze verborgen parels voor jou",
  intro: `Je keek naar ${TERM}. We hebben er een paar verborgen parels bij gezocht, die je misschien nog niet kende.`,
  resultsUrl: resultsUrl("retargeting_abandonedsearch_3"),
  results: [kurhaus, dePlesman, voco],
  footerCta: { href: resultsUrl("retargeting_abandonedsearch_3"), label: "Vind jouw favoriet" },
} satisfies Props;

/** v01_tf031_fl013_nl-NL_4_abandoned_search — 7 dagen na het zoeken, met de themakiezer. */
export const search4Props = {
  ...base,
  preheader: "Kies je thema, dan sturen we je wat bij je past.",
  // Feedback 24-11-2026: kop bovenaan en onderaan een tekstlink. De zoekresultaten staan onder
  // de zoekopdracht, zonder eigen kop (die staat bovenaan).
  topHeading: "Waar heb jij zin in?",
  intro: `Een week geleden zocht je naar ${TERM}. Nog niet jouw optimale hotelverblijf gevonden? Laat ons weten waar je zin in hebt.`,
  resultsUrl: resultsUrl("retargeting_abandonedsearch_4"),
  themeSection: {
    title: "Niet jouw verblijf gevonden? Kies je thema.",
    note: "Eén klik is genoeg, dan sturen we je voortaan wat je zoekt.",
    items: novemberThemes,
  },
} satisfies Props;

AutomationSearch.PreviewProps = search1Props;
