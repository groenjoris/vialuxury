import { Body, Column, Container, Head, Heading, Html, Img, Preview, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { crmCss, s, SecondaryButton, site } from "../components/crm";
import NewsletterFooter from "../components/NewsletterFooter";
import NewsletterHeader from "../components/NewsletterHeader";
import { font, newsletter } from "../components/theme";

// CRM mail 1: nagenietmail, 3 dagen na vertrek (vervangt A2 3 dagen).
// Eén doel: ophalen wanneer de volgende vakantie is, om latere mails te timen.
// Geen deals, geen code. Vier gelijkwaardige knoppen; elke knop gaat naar een
// bevestigingspagina met de keuze als parameter.
// Onderwerp: "Wanneer ga je weer?"

type Props = {
  /** Leeg → kop zonder naam. */
  firstName?: string;
  recipientEmail: string;
  hotelName: string;
  packageTitle: string;
  place: string;
  /** "28 oktober" */
  arrivalDate: string;
  /** "30 oktober 2026" */
  departureDate: string;
  /** Periode van dit verblijf, voor de knop "Zelfde periode als nu". */
  samePeriod: string;
  image: string;
};

export default function CrmNagenieten({ firstName, recipientEmail, hotelName, packageTitle, place, arrivalDate, departureDate, samePeriod, image }: Props) {
  const c = newsletter.light;
  const choices = [
    { key: "weet-ik-nog-niet", label: "Weet ik nog niet", sub: "Prima, we houden het rustig" },
    { key: "zomer", label: "Zomer", sub: "Juni t/m augustus" },
    { key: "nazomer", label: "Nazomer", sub: "September en oktober" },
    { key: "zelfde-periode", label: "Zelfde periode als nu", sub: samePeriod },
  ];
  const href = (key: string) => `${site}/crm/volgende-vakantie?keuze=${key}`;
  const cell = (ch: (typeof choices)[number]) => (
    <>
      <SecondaryButton href={href(ch.key)} block>{ch.label}</SecondaryButton>
      <Text style={{ ...s.muted, textAlign: "center", margin: "6px 0 0" }}>{ch.sub}</Text>
    </>
  );

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>Eén klik, dan sturen we je op het juiste moment inspiratie.</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          <NewsletterHeader trustpilot={false} />

          {/* Compacte herinnering, geen knop */}
          <Section className="m-pad" style={{ padding: "28px 32px 0" }}>
            <Section style={{ backgroundColor: "#F4F1EC", borderRadius: "8px", padding: "14px" }}>
              <Row>
                <Column style={{ width: "112px", verticalAlign: "middle" }}>
                  <Img src={image} alt={packageTitle} width="112" height="76" style={{ display: "block", borderRadius: "4px", objectFit: "cover" }} />
                </Column>
                <Column style={{ paddingLeft: "16px", verticalAlign: "middle" }}>
                  <Text style={s.name}>{hotelName}</Text>
                  <Text style={s.title}>{packageTitle}</Text>
                  <Text style={{ ...s.muted, margin: "4px 0 0" }}>{place} · {arrivalDate} tot {departureDate}</Text>
                </Column>
              </Row>
            </Section>
          </Section>

          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>
              {firstName ? `${firstName}, wanneer is je volgende vakantie?` : "Wanneer is je volgende vakantie?"}
            </Heading>
            <Text style={s.body}>Dan weten we wanneer we je iets moois kunnen laten zien.</Text>
          </Section>

          {/* Vier gelijkwaardige knoppen: 2×2 op desktop, onder elkaar op mobiel */}
          <Section className="m-pad" style={{ padding: "24px 32px 40px" }}>
            {[0, 2].map((i) => (
              <Row key={i} style={{ marginTop: i ? "16px" : 0 }}>
                <Column className="stack" style={{ width: "50%", paddingRight: "8px", verticalAlign: "top" }}>{cell(choices[i])}</Column>
                <Column className="stack" style={{ width: "50%", paddingLeft: "8px", verticalAlign: "top" }}>{cell(choices[i + 1])}</Column>
              </Row>
            ))}
          </Section>

          <NewsletterFooter recipientEmail={recipientEmail} reason="omdat je bij ons boekte" />
        </Container>
      </Body>
    </Html>
  );
}

CrmNagenieten.PreviewProps = {
  firstName: "Sanne",
  recipientEmail: "sanne.devries@example.com",
  hotelName: "Hotel Ter Zand",
  packageTitle: "3-daags luxe verblijf in prachtig Zeeland, incl. 3-gangendiner",
  place: "Burgh-Haamstede",
  arrivalDate: "28 oktober",
  departureDate: "30 oktober 2026",
  samePeriod: "Eind oktober",
  image: "https://asset.vialuxury.com/assets/2d92ea4c-8fe1-4c69-b6fe-4fa1037931f6?key=card",
} satisfies Props;
