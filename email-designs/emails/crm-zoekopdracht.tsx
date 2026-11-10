import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { crmCss, DealList, IconLine, PrimaryButton, type RowDeal, s, site } from "../components/crm";
import { font, newsletter } from "../components/theme";
import { dePlesman, desIndes, voco } from "../lib/crmDeals";

// CRM A5: zoekopdracht, 1 minuut na het verlaten van de site. Overgenomen van Jesse
// (origin/redesign-jesse, crm-zoekopdracht.tsx) en omgezet naar onze bouwstenen en regels.
// De zoekopdracht staat bovenaan als herkenbare samenvatting in een omlijnd blok (zoekterm,
// datum en personen met icoontjes) met "Bekijk alle resultaten" als de ene oranje knop.
// Daaronder de drie best passende arrangementen (1 groot, 2 als rij). Geen themakiezer.
// Onderwerp: "Jouw zoekopdracht: [zoekterm]"

type Props = {
  recipientEmail: string;
  /** Leeg → "jouw zoekopdracht". */
  searchTerm?: string;
  /** "20 november"; leeg → regel valt weg. */
  arrivalDate?: string;
  /** Leeg → regel valt weg. */
  persons?: number;
  resultsUrl: string;
  results: RowDeal[];
};

export default function CrmZoekopdracht({ recipientEmail, searchTerm, arrivalDate, persons, resultsUrl, results }: Props) {
  const c = newsletter.light;

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>{arrivalDate ? `De beste arrangementen voor ${arrivalDate}.` : "De beste arrangementen voor jouw zoekopdracht."}</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader />
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          <Section className="m-pad" style={{ padding: "36px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>Dit vonden we voor je</Heading>
          </Section>

          {/* De zoekopdracht als samenvatting, met de ene knop */}
          <Section className="m-pad" style={{ padding: "28px 32px 0" }}>
            <Text style={s.kop}>Jouw zoekopdracht</Text>
            <Section style={{ border: `1px solid #E5E5E5`, borderRadius: "8px", padding: "14px 20px 22px", marginTop: "12px" }}>
              <IconLine icon="magnifier-donker" bold>{searchTerm ?? "Jouw zoekopdracht"}</IconLine>
              {arrivalDate && <IconLine icon="calendar-donker">{arrivalDate}</IconLine>}
              {persons && <IconLine icon="users-donker">{persons} personen</IconLine>}
              <Section style={{ marginTop: "18px" }}>
                <PrimaryButton href={resultsUrl}>Bekijk alle resultaten</PrimaryButton>
              </Section>
            </Section>
          </Section>

          <Section className="m-pad" style={{ padding: "44px 32px 40px" }}>
            <Text style={s.kop}>De arrangementen die het best passen bij wat je zoekt</Text>
            <DealList deals={results} primary={false} />
          </Section>
        </Container>
        <CrmFooter recipientEmail={recipientEmail} reason="omdat je een account hebt bij ViaLuxury" />
      </Body>
    </Html>
  );
}

CrmZoekopdracht.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
  searchTerm: "Den Haag",
  arrivalDate: "20 november",
  persons: 2,
  resultsUrl: `${site}/first-release/search?utm_source=email&utm_medium=crm&utm_campaign=retargeting_abandonedsearch_1`,
  results: [desIndes, dePlesman, voco],
} satisfies Props;
