import { Body, Container, Head, Heading, Html, Img, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import { crmCss, PillGrid, s, site } from "../components/crm";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { baseUrl, font, newsletter } from "../components/theme";

// CRM mail 1: nagenietmail, 3 dagen na vertrek (vervangt A2 3 dagen).
// Eén doel: ophalen wanneer de volgende vakantie is, om latere mails te timen.
// Grote hotelfoto met "We hopen dat je genoten hebt van …", daarna de vraag met vier witte
// snelfilterknoppen (zelfde stijl als de themakiezer).
// Geen deals, geen code. Vier gelijkwaardige knoppen; elke knop gaat naar een
// bevestigingspagina met de keuze als parameter.
// Onderwerp: "Wanneer ga je weer?"

type Props = {
  /** Leeg → kop zonder naam. */
  firstName?: string;
  recipientEmail: string;
  hotelName: string;
  image: string;
};

export default function CrmNagenieten({ firstName, recipientEmail, hotelName, image }: Props) {
  const c = newsletter.light;
  // Vier gelijkwaardige antwoorden; elk gaat naar de bevestigingspagina met de keuze als parameter.
  const choices = [
    { key: "weet-ik-nog-niet", label: "Weet ik nog niet" },
    { key: "zomer", label: "Zomer" },
    { key: "nazomer", label: "Nazomer" },
    { key: "zelfde-periode", label: "Zelfde periode als nu" },
  ].map((ch) => ({ label: ch.label, href: `${site}/crm/volgende-vakantie?keuze=${ch.key}` }));

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

          {/* De vraag: zelfde opbouw en knoppen als de themakiezer in de andere mails */}
          <Section className="m-pad" style={{ padding: "36px 32px 40px" }}>
            <Text style={{ ...s.muted, margin: 0 }}>Om je nog beter te kunnen helpen, één vraag</Text>
            <Text style={{ ...s.kop, margin: "4px 0 0" }}>Wanneer is je volgende vakantie?</Text>
            <PillGrid items={choices} />
          </Section>
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
  image: `${baseUrl}/images/hotel-ter-zand-tower.jpg`,
} satisfies Props;
