import { Body, Container, Head, Html, Img, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { BeigeBand, CodeBlock, crmCss, CrmHelp, Letter, PrimaryButton, QuickSearch, s, site } from "../components/crm";
import { baseUrl, font, newsletter } from "../components/theme";

// Commerciële mail 4: Tekst. Een mail zonder deals die het van de tekst moet hebben, hier de
// zaterdagkorting: op zaterdag krijgt de ontvanger een persoonlijke code van €15 die alleen die dag
// geldt. Opbouw: de actiegraphic over de hele breedte (feestelijke coupon, gemaakt met
// scripts/mail-graphics/zaterdag-coupon.py; een graphic, dus mét tekst), een korte brief, de code
// als coupon (CodeBlock), in drie stappen hoe je de code verzilvert en daaronder de ene knop
// "Bekijk onze arrangementen".
// Zelfde bouwstenen en regels als de CRM-mails (zie components/crm.tsx).
// Onderwerp: "Sanne, alleen vandaag: €15 korting voor jou"

type Props = {
  recipientEmail: string;
  /** Leeg → "Beste gast,". */
  firstName?: string;
  hero: string;
  heroAlt: string;
  intro: React.ReactNode;
  /** Wat je krijgt, groot in de coupon. */
  gift: string;
  code: string;
  /** Laatste moment, bijv. "vandaag 23:59 uur". */
  deadline: string;
  /** Zoekpagina met alle aanbiedingen. */
  allDealsUrl: string;
};

export default function CommercieelTekst({ recipientEmail, firstName, hero, heroAlt, intro, gift, code, deadline, allDealsUrl }: Props) {
  const c = newsletter.light;
  const steps = ["Kopieer je code.", "Kies het arrangement waar je zin in hebt.", "Vul de code in bij stap 3 van het boeken, onder Kortingscode."];
  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>Je persoonlijke code vervalt om middernacht.</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader />
        {/* Actiegraphic direct onder de header, over de hele breedte van de mail */}
        <Img src={hero} alt={heroAlt} width="700" style={{ display: "block", width: "100%", height: "auto" }} />
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Brief en de code als coupon */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Letter firstName={firstName}>{intro}</Letter>
            <Section style={{ marginTop: "24px" }}>
              <CodeBlock title={gift} code={code} deadline={deadline} />
            </Section>
          </Section>

          {/* In drie stappen */}
          <Section className="m-pad" style={{ padding: "40px 32px 0" }}>
            <Text style={s.kop}>Zo verzilver je je code</Text>
            {steps.map((step, i) => (
              <Text key={step} style={{ ...s.body, margin: i ? "4px 0 0" : "8px 0 0" }}>
                <strong>{i + 1}.</strong> {step}
              </Text>
            ))}
            {/* De ene knop, onder de stappen */}
            <Section style={{ marginTop: "24px" }}>
              <PrimaryButton href={allDealsUrl}>Bekijk onze arrangementen</PrimaryButton>
            </Section>
          </Section>
        </Container>

        {/* Snel zoeken op een beige band over de hele breedte */}
        <BeigeBand top="48px">
          <QuickSearch />
        </BeigeBand>

        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Hulplijn */}
          <CrmHelp top="36px" />
        </Container>
        <CrmFooter recipientEmail={recipientEmail} reason="omdat je je hebt aangemeld voor onze nieuwsbrief" />
      </Body>
    </Html>
  );
}

CommercieelTekst.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  hero: `${baseUrl}/images/mail/commercieel/zaterdag-kortingsdag.jpg`,
  heroAlt: "Zaterdag Kortingsdag: €15 persoonlijke korting, alleen vandaag",
  intro: (
    <>
      Het is zaterdag, dus je krijgt van ons <strong>€15 korting</strong>. De code is alleen van jou en werkt op elk arrangement. Wacht er niet te lang mee: <strong>om middernacht vervalt hij.</strong>
    </>
  ),
  gift: "€15 korting",
  code: "SV15V-2FHT",
  deadline: "vandaag 23:59 uur",
  allDealsUrl: `${site}/first-release/search`,
} satisfies Props;
