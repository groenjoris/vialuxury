import { Body, Column, Container, Head, Heading, Html, Img, Link, Preview, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { crmCss, DealRow, s, site } from "../components/crm";
import { baseUrl, font, newsletter } from "../components/theme";

// CRM: reviewmail, 1 dag na thuiskomst. Gebaseerd op de reviewmail van Jesse
// (origin/redesign-jesse, crm-review.tsx). Eén doel: de review. Kop, één zin en vijf
// klikbare Trustpilot-sterren boven de vouw; elke ster is een eigen link (?rating=1..5),
// zodat de score op de landingspagina al is ingevuld. Daaronder "Jouw verblijf": het
// arrangement in een zwart omlijnd blok (foto links; hotelnaam, plaats, dealtitel,
// datums en een oranje link). Geen deals of thema's; de serviceregel is het vangnet.
// Onderwerp: "Hoe was je verblijf?" Alles links uitgelijnd.

type Props = {
  recipientEmail: string;
  /** Leeg → kop zonder naam. */
  firstName?: string;
  /** Leeg → "je verblijf" zonder hotelnaam. */
  hotelName?: string;
  stars?: number;
  place?: string;
  packageTitle?: string;
  /** "31 oktober tot 2 november 2026" */
  stayDates?: string;
  image: string;
  dealUrl: string;
  reviewUrl: string;
};

export default function CrmReview({ recipientEmail, firstName, hotelName, stars, place, packageTitle, stayDates, image, dealUrl, reviewUrl }: Props) {
  const c = newsletter.light;
  const sep = reviewUrl.includes("?") ? "&" : "?";
  const underline = { color: c.text, textDecoration: "underline" };

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>We horen graag hoe je het vond. Het kost je een minuut.</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader />
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Boven de vouw: kop, één zin, vijf sterren */}
          <Section className="m-pad" style={{ padding: "36px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>
              {firstName ? `Welkom thuis, ${firstName}` : "Welkom thuis"}
            </Heading>
            <Text style={s.body}>Jouw review helpt andere gasten bij hun keuze, en ons om nog beter te worden.</Text>
          </Section>

          <Section className="m-pad" style={{ padding: "28px 32px 0" }}>
            <Text style={s.kop}>
              Hoe beoordeel je {hotelName ? `je verblijf in ${hotelName}` : "je verblijf"}?
            </Text>
            <Text style={{ ...s.title, color: c.muted, margin: "4px 0 10px" }}>Selecteer het gewenste aantal sterren</Text>
            {/* Vijf losse ster-links; elk tapvlak is 48 × 48 px */}
            <Row style={{ width: "auto" }} align="left">
              {[1, 2, 3, 4, 5].map((n) => (
                <Column key={n} style={{ padding: "0 4px 0 0" }}>
                  <Link href={`${reviewUrl}${sep}rating=${n}`} style={{ display: "block", width: "48px", height: "48px" }}>
                    <Img src={`${baseUrl}/images/mail/crm/trustpilot-ster-groen.png`} alt={`${n} ${n === 1 ? "ster" : "sterren"}`} width="40" height="40" style={{ display: "block", margin: "4px 0 0" }} />
                  </Link>
                </Column>
              ))}
            </Row>
          </Section>

          {/* Jouw verblijf: dealrij met grijze rand, hotelnaam bovenaan */}
          <Section className="m-pad" style={{ padding: "44px 32px 0" }}>
            <Text style={s.kop}>Jouw verblijf</Text>
            <DealRow deal={{ hotelName, stars, place, packageTitle, line: stayDates, image, url: dealUrl }} />
          </Section>

          {/* Service als vangnet */}
          <Section className="m-pad" style={{ padding: "28px 32px 40px" }}>
            <Text style={{ ...s.title, margin: 0, color: c.muted }}>
              Heb je nog vragen, of ging er iets niet zoals je had gehoopt? Laat het ons weten, we helpen je graag.{" "}
              <Link href={`${site}/veelgestelde-vragen`} style={underline}>Veelgestelde vragen</Link>
              {" · "}
              <Link href={`${site}/klantenservice`} style={underline}>Klantenservice</Link>
            </Text>
          </Section>
        </Container>
        <CrmFooter recipientEmail={recipientEmail} reason="omdat je bij ons boekte" />
      </Body>
    </Html>
  );
}

CrmReview.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  hotelName: "Landgoed Lauswolt",
  stars: 5,
  place: "Beetsterzwaag",
  packageTitle: "Culinair verblijf in een luxe 5*-hotel in het prachtige Friesland, incl. MICHELIN-diner",
  stayDates: "31 oktober tot 2 november 2026",
  image: "https://asset.vialuxury.com/assets/57455675-0f6e-4334-aaa2-bc3d1747f31f?key=card",
  dealUrl: `${site}/first-release/deal/landgoed-lauswolt-geniet-van-5-sterren-luxe-in-de-bosrijke-omgeving-van-friesland-incl-culinair-diner`,
  reviewUrl: "https://www.vialuxury.com/nl-NL/review?utm_source=email&utm_medium=crm&utm_campaign=post_booking_review",
} satisfies Props;
