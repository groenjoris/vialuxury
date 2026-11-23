import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { crmCss, DealList, type Pill, type RowDeal, s, SearchSection, ThemeSection } from "../components/crm";
import { dePlesman, desIndes, kurhaus, voco } from "../lib/crmDeals";
import { site } from "../components/crm";
import { font, newsletter } from "../components/theme";

// Automationflow fl013 "abandoned search" — vier mails uit één component.
// Bron: "Automations in kaart.xlsx", tabblad Automation per variant, kolommen T, U, V en W.
// Secties in de volgorde van de sheet:
//   S1 Header (logo) → Kop → Intro → S18 Zoekopdracht (zoekterm, datum en personen, met de knop
//   naar alle resultaten) → S4 Hoteldeals (drie zoekresultaten) → S7 Themasectie (alleen mail 4) →
//   S13 Footer.
// Mergevelden in de teksten: [zoekterm], [aankomstdatum] en [personen], hier ingevuld met
// voorbeelddata.

type Props = {
  recipientEmail: string;
  preheader: string;
  heading: string;
  intro: string;
  /** S18 Zoekopdracht. Leeg → "jouw zoekopdracht". */
  searchTerm?: string;
  arrivalDate?: string;
  persons?: number;
  resultsUrl: string;
  /** S4: drie zoekresultaten die passen bij de zoekopdracht. */
  results: RowDeal[];
  /** S7 Themasectie (mail 4): kop, de thema's van de verzendmaand en de onderregel. */
  themeSection?: { title: string; note: string; items: Pill[] };
};

export default function AutomationSearch({ recipientEmail, preheader, heading, intro, searchTerm, arrivalDate, persons, resultsUrl, results, themeSection }: Props) {
  const c = newsletter.light;

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>{preheader}</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader />
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Kop en intro */}
          <Section className="m-pad" style={{ padding: "36px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>{heading}</Heading>
            <Text style={{ ...s.body, margin: "12px 0 0" }}>{intro}</Text>
          </Section>

          {/* S18 Zoekopdracht */}
          <Section className="m-pad" style={{ padding: "24px 32px 0" }}>
            <SearchSection searchTerm={searchTerm} arrivalDate={arrivalDate} persons={persons} resultsUrl={resultsUrl} />
          </Section>

          {/* S4 Hoteldeals: de zoekresultaten */}
          <Section className="m-pad" style={{ padding: "28px 32px 0" }}>
            <DealList deals={results} />
          </Section>

          {/* S7 Themasectie */}
          {themeSection && (
            <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
              <ThemeSection title={themeSection.title} note={themeSection.note} items={themeSection.items} />
            </Section>
          )}

          <Section className="m-pad" style={{ padding: "0 32px 40px" }} />
        </Container>
        <CrmFooter recipientEmail={recipientEmail} reason="omdat je je hebt aangemeld voor de nieuwsbrief van ViaLuxury" />
      </Body>
    </Html>
  );
}

// ── Voorbeelddata ──────────────────────────────────────────────────────────────────────────
// Zoekopdracht: Den Haag, 20 november, 2 personen.
const TERM = "Den Haag";
const DATUM = "20 november";
const resultsUrl = (campaign: string) => `${site}/first-release/search?utm_source=email&utm_medium=crm&utm_campaign=${campaign}`;
const base = { recipientEmail: "sanne.devries@example.com", searchTerm: TERM, arrivalDate: DATUM, persons: 2 };

/** De themategels van de verzendmaand, met naam en landingspagina uit het tabblad Themategels.
 *  November heeft volgens Seizoensthema's wellness, culinair wild en wijn, en experiences;
 *  "Hotels met experiences" heeft nog geen landingspagina en staat er daarom niet bij. */
const theme = (path: string) => `https://vialuxury.com/nl-NL/zoeken?theme=${path}`;
const novemberThemes: Pill[] = [
  { label: "Wellness", href: theme("arrangementen-wellness-overnachting") },
  { label: "Bubbelbad op kamer", href: theme("hotelkamer-jacuzzi") },
  { label: "Hotels met zwembad", href: theme("hotelkamer-zwembad") },
  { label: "Culinaire experiences", href: theme("arrangementen-culinair-genieten") },
  { label: "Overnachting met diner", href: theme("arrangementen-overnachting-met-diner") },
];

/** v01_tf028_fl013_nl-NL_1_abandoned_search — 1 minuut na het zoeken. */
export const search1Props = {
  ...base,
  preheader: `De beste arrangementen voor ${DATUM}.`,
  heading: "Dit vonden we voor je",
  intro: `Je zocht naar ${TERM} voor ${DATUM}. Dit zijn de arrangementen die het best passen bij wat je zoekt.`,
  resultsUrl: resultsUrl("retargeting_abandonedsearch_1"),
  results: [desIndes, dePlesman, voco],
} satisfies Props;

/** v01_tf029_fl013_nl-NL_2_abandoned_search — 1 dag na het zoeken. */
export const search2Props = {
  ...base,
  preheader: "Onze favorieten voor jouw data.",
  heading: "Onze favorieten voor jouw zoekopdracht",
  intro: `Gisteren zocht je naar ${TERM}. Dit zijn de arrangementen voor jouw data, met de populairste eerst.`,
  resultsUrl: resultsUrl("retargeting_abandonedsearch_2"),
  results: [voco, desIndes, dePlesman],
} satisfies Props;

/** v01_tf030_fl013_nl-NL_3_abandoned_search — 3 dagen na het zoeken. Ook net buiten het
 *  zoekgebied, vandaar Scheveningen erbij. */
export const search3Props = {
  ...base,
  preheader: "Misschien zit je verblijf ertussen.",
  heading: "Nog meer mogelijkheden",
  intro: `Je zocht naar ${TERM}. Deze arrangementen passen er goed bij, ook net buiten je zoekgebied.`,
  resultsUrl: resultsUrl("retargeting_abandonedsearch_3"),
  results: [kurhaus, dePlesman, voco],
} satisfies Props;

/** v01_tf031_fl013_nl-NL_4_abandoned_search — 7 dagen na het zoeken, met de themakiezer. */
export const search4Props = {
  ...base,
  preheader: "Kies je thema, dan sturen we je wat bij je past.",
  heading: "Waar heb jij zin in?",
  intro: `Een week geleden zocht je naar ${TERM}. Nog niet het juiste gevonden? Laat ons weten waar je zin in hebt.`,
  resultsUrl: resultsUrl("retargeting_abandonedsearch_4"),
  results: [dePlesman, kurhaus, desIndes],
  themeSection: {
    title: "Niet jouw ding? Kies je thema.",
    note: "Eén klik is genoeg, dan sturen we je voortaan wat je zoekt.",
    items: novemberThemes,
  },
} satisfies Props;

AutomationSearch.PreviewProps = search1Props;
