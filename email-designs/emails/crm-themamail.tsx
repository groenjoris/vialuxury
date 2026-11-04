import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import { CompactDeal, crmCss, FeaturedDeal, s, ThemeTiles } from "../components/crm";
import NewsletterFooter from "../components/NewsletterFooter";
import NewsletterHeader from "../components/NewsletterHeader";
import { font, newsletter } from "../components/theme";
import { lauswolt, vanOys, villaRuimzicht, type CrmDeal } from "../lib/crmDeals";

// CRM A6 Themamail (retargeting_abandonedtheme_best deals). Trigger: 2 uur na het bekijken van
// een themapagina, alleen als er de afgelopen 2 dagen geen andere retargetingmail is gestuurd.
// Herbruikbaar thema-template: wellness, diner, bubbelbad en citytrip wisselen later alleen
// onderwerp, preheader, kop, intro, beeld en deals (props), de opbouw blijft gelijk.
// Opbouw: kop + intro, 1 uitgelichte deal (groot), 2 compacte deals, themasectie (S7) met zes
// vierkante knoppen. Geen code.
// Onderwerp: "Onze beste deals van dit moment" (per thema geschreven, niet "Nog meer [thema] voor jou").
// Kop en intro herhalen het onderwerp niet: de kop zet het frame, de intro geeft de reden.
//
// Terugvallen (tab Mergevelden):
//   [thema]      leeg → "een weekendje weg" (alleen in thema's met [thema] in de copy; best deals heeft dat niet)
//   [hotelnaam]  leeg → "Naam van deal 1"

export type ThemaMailProps = {
  recipientEmail: string;
  preheader: string;
  heading: string;
  intro: string;
  deals: CrmDeal[];
  themesTitle?: string;
};

export default function CrmThemamail({ recipientEmail, preheader, heading, intro, deals, themesTitle = "Niet jouw ding? Kies je thema." }: ThemaMailProps) {
  const c = newsletter.light;
  const [featured, ...rest] = deals;

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>{preheader}</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          <NewsletterHeader trustpilot={false} />

          <Section className="m-pad" style={{ padding: "36px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>{heading}</Heading>
            <Text style={s.body}>{intro}</Text>
          </Section>

          {/* 1 uitgelicht + 2 compact */}
          <Section className="m-pad" style={{ padding: "24px 32px 0" }}>
            {featured && <FeaturedDeal d={featured} primary />}
            {rest.map((d) => (
              <Section key={d.url} style={{ marginTop: "20px" }}>
                <CompactDeal d={d} />
              </Section>
            ))}
          </Section>

          <Section className="m-pad" style={{ padding: "48px 32px 44px" }}>
            <ThemeTiles title={themesTitle} note="Eén klik is genoeg, dan sturen we je voortaan wat je zoekt." />
          </Section>

          <NewsletterFooter recipientEmail={recipientEmail} reason="omdat je een account hebt bij ViaLuxury" />
        </Container>
      </Body>
    </Html>
  );
}

CrmThemamail.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
  preheader: "Een selectie die bij je past.",
  heading: "De drie die er nu uitspringen",
  intro: "Op basis van wat gasten de afgelopen tijd het vaakst boeken.",
  deals: [{ ...vanOys, label: "Populair" }, { ...lauswolt, label: "Aanbevolen" }, { ...villaRuimzicht, label: undefined }],
} satisfies ThemaMailProps;
