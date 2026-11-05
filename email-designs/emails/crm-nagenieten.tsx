import { Body, Column, Container, Head, Heading, Html, Img, Preview, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { crmCss, s, SecondaryButton, site } from "../components/crm";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { baseUrl, font, newsletter } from "../components/theme";

// CRM mail 1: nagenietmail, 3 dagen na vertrek (vervangt A2 3 dagen).
// Eén doel: ophalen wanneer de volgende vakantie is, om latere mails te timen.
// Grote hotelfoto met "We hopen dat je genoten hebt van …", daarna de vraag in een eigen vlak.
// Geen deals, geen code. Vier gelijkwaardige knoppen; elke knop gaat naar een
// bevestigingspagina met de keuze als parameter.
// Onderwerp: "Wanneer ga je weer?"

type Props = {
  /** Leeg → kop zonder naam. */
  firstName?: string;
  recipientEmail: string;
  hotelName: string;
  /** Periode van dit verblijf, voor de knop "Zelfde periode als nu". */
  samePeriod: string;
  image: string;
};

export default function CrmNagenieten({ firstName, recipientEmail, hotelName, samePeriod, image }: Props) {
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
        <CrmHeader />
        <Container style={{ width: "100%", maxWidth: "626px" }}>

          {/* Grote foto van het hotel met het nagenietframe; geen datums of arrangement, dat weet de gast al */}
          <Img src={image} alt={hotelName} width="626" height="380" style={{ display: "block", width: "100%", height: "380px", objectFit: "cover" }} />
          <Section className="m-pad" style={{ padding: "28px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>
              {firstName ? `${firstName}, we hopen dat je genoten hebt van ${hotelName}` : `We hopen dat je genoten hebt van ${hotelName}`}
            </Heading>
          </Section>

          {/* De vraag, in een eigen vlak */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Section style={{ backgroundColor: "#F4F1EC", borderRadius: "8px", padding: "24px 24px 4px" }}>
              <Text style={{ fontFamily: font.body, fontSize: "13px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: c.muted, margin: 0 }}>
                Om je nog beter te kunnen helpen, één vraag
              </Text>
              <Text style={{ ...s.kop, fontSize: "26px", margin: "8px 0 0" }}>Wanneer is je volgende vakantie?</Text>
              {/* Vier gelijkwaardige knoppen: 2×2 op desktop, onder elkaar op mobiel */}
              <Section style={{ padding: "20px 0" }}>
                {[0, 2].map((i) => (
                  <Row key={i} style={{ marginTop: i ? "16px" : 0 }}>
                    <Column className="stack" style={{ width: "50%", paddingRight: "8px", verticalAlign: "top" }}>{cell(choices[i])}</Column>
                    <Column className="stack" style={{ width: "50%", paddingLeft: "8px", verticalAlign: "top" }}>{cell(choices[i + 1])}</Column>
                  </Row>
                ))}
              </Section>
            </Section>
          </Section>
          <Section style={{ height: "40px" }} />

        </Container>
        <CrmFooter recipientEmail={recipientEmail} reason="omdat je bij ons boekte" />
      </Body>
    </Html>
  );
}

CrmNagenieten.PreviewProps = {
  firstName: "Sanne",
  recipientEmail: "sanne.devries@example.com",
  hotelName: "Hotel Ter Zand",
  samePeriod: "Eind oktober",
  image: `${baseUrl}/images/hotel-ter-zand-tower.jpg`,
} satisfies Props;
