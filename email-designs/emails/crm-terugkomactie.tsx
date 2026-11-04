import { Body, Column, Container, Head, Heading, Html, Img, Preview, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { CodeBlock, CompactDeal, crmCss, FeaturedDeal, PrimaryButton, s, site, ThemeTiles, CrmHeader } from "../components/crm";
import NewsletterFooter from "../components/NewsletterFooter";
import { font, newsletter } from "../components/theme";
import { lauswolt, steenenburg, vanOys, villaRuimzicht, type CrmDeal } from "../lib/crmDeals";

// CRM A3 Terugkomactie (repeatbooking_1booking_14days_20euro). Trigger: 14 dagen na vertrek.
// De code (S10) is de held: een eigen blok met een korte actietitel, de code als selecteerbare tekst
// en de deadline direct eronder. Het bedrag staat alleen in de intro, niet nog eens in de titel. Het vorige verblijf (S14) staat als korte herinnering direct
// onder het codeblok, zodat de code een reden heeft ("omdat je met ons op pad ging").
// Daaronder drie deals in de sfeer van het vorige verblijf (1 uitgelicht, 2 compact) onder
// een frame-titel, en onderaan de themasectie (S7) met zes vierkante knoppen.
// Onderwerp: "[voornaam], €20 cadeau voor je volgende verblijf"
//
// Geldigheid is nu 30 dagen (sheet). 60–90 dagen wordt nog getest (check bij Sven).
// De code kan niet in de link en er is geen afgeprijsde prijs; copy blijft "Vul hem in bij het boeken".
//
// Terugvallen (tab Mergevelden):
//   [voornaam]  leeg → onderwerp "€20 cadeau voor je volgende verblijf"
//   [hotelnaam] leeg → "Op naar de volgende keer" zonder hotelregel, frame "Ook in de sfeer van je vorige verblijf"
//   [plaats]    leeg → plaats valt weg
//   [code], [waarde], [deadline] zijn verplicht

type Props = {
  recipientEmail: string;
  firstName?: string;
  hotelName?: string;
  place?: string;
  packageTitle?: string;
  stayDates?: string;
  previousImage?: string;
  code: { code: string; value: string; deadline: string };
  /** Eerste = uitgelicht, tweede en derde = compact. */
  deals: CrmDeal[];
  ctaUrl: string;
};

export default function CrmTerugkomactie({ recipientEmail, hotelName, place, packageTitle, stayDates, previousImage, code, deals, ctaUrl }: Props) {
  const c = newsletter.light;
  const [featured, ...rest] = deals;
  const meta = [place, stayDates].filter(Boolean).join(" · ");

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>Omdat je met ons op pad ging. Geldig tot en met {code.deadline}.</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          <CrmHeader />

          <Section className="m-pad" style={{ padding: "36px 32px 0", textAlign: "center" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>Op naar de volgende keer</Heading>
            <Text style={s.body}>
              {hotelName ? `We vonden het fijn dat je met ons naar ${hotelName} ging.` : "We vonden het fijn dat je met ons op pad ging."}{" "}
              Daarom krijg je {code.value} cadeau op je volgende verblijf.
            </Text>
          </Section>

          {/* De held: het codeblok */}
          <Section className="m-pad" style={{ padding: "28px 32px 0", textAlign: "center" }}>
            <CodeBlock title="Gebruik je code bij het boeken" code={code.code} deadline={code.deadline} />
            <Section style={{ marginTop: "24px" }}>
              <PrimaryButton href={ctaUrl}>Kies je volgende verblijf</PrimaryButton>
            </Section>
          </Section>

          {/* Herinnering aan het vorige verblijf, compact en zonder knop */}
          {hotelName && previousImage && (
            <Section className="m-pad" style={{ padding: "36px 32px 0", textAlign: "center" }}>
              <Row style={{ width: "auto" }}>
                <Column style={{ width: "120px", verticalAlign: "middle" }}>
                  <Img src={previousImage} alt={hotelName} width="120" height="75" style={{ display: "block", width: "120px", height: "75px", objectFit: "cover", borderRadius: "6px" }} />
                </Column>
                <Column style={{ verticalAlign: "middle", paddingLeft: "16px", textAlign: "left" }}>
                  <Text style={{ ...s.muted, margin: 0, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Jouw vorige verblijf</Text>
                  <Text style={{ ...s.name, margin: "4px 0 0" }}>{hotelName}</Text>
                  {meta && <Text style={{ ...s.title, color: c.muted, margin: "2px 0 0" }}>{meta}</Text>}
                </Column>
              </Row>
            </Section>
          )}

          {/* Drie deals in de sfeer van het vorige verblijf: 1 uitgelicht, 2 compact */}
          <Section className="m-pad" style={{ padding: "48px 32px 0", textAlign: "center" }}>
            <Text style={s.kop}>Ook in de sfeer van je vorige verblijf</Text>
            {featured && (
              <Section style={{ marginTop: "16px" }}>
                <FeaturedDeal d={featured} />
              </Section>
            )}
            {rest.map((d) => (
              <Section key={d.url} style={{ marginTop: "20px" }}>
                <CompactDeal d={d} />
              </Section>
            ))}
          </Section>

          {/* Themasectie: onderaan, zes vierkante knoppen */}
          <Section className="m-pad" style={{ padding: "48px 32px 44px", textAlign: "center" }}>
            <ThemeTiles title="Niet jouw ding? Kies je thema." note="Eén klik is genoeg, dan sturen we je voortaan wat je zoekt." />
          </Section>

          <NewsletterFooter recipientEmail={recipientEmail} reason="omdat je een verblijf boekte bij ViaLuxury" />
        </Container>
      </Body>
    </Html>
  );
}

CrmTerugkomactie.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  hotelName: "Landgoed Lauswolt",
  place: "Beetsterzwaag",
  packageTitle: lauswolt.packageTitle,
  stayDates: "31 oktober – 2 november 2026",
  previousImage: lauswolt.image,
  code: { code: "TERUG20-8KQ3", value: "€20", deadline: "16 december 2026" },
  deals: [vanOys, villaRuimzicht, steenenburg],
  ctaUrl: `${site}/first-release/search?utm_source=email&utm_medium=crm&utm_campaign=repeatbooking_1booking_14days_20euro`,
} satisfies Props;
