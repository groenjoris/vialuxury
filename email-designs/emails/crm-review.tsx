import { Body, Column, Container, Head, Heading, Html, Img, Link, Preview, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { crmCss, faqUrl, PrimaryButton, s, ServiceLine, serviceUrl, StarRating, CrmHeader } from "../components/crm";
import NewsletterFooter from "../components/NewsletterFooter";
import { font, newsletter } from "../components/theme";

// CRM A1 Reviewmail (post_booking_review). Trigger: 1 dag na vertrek.
// Eén doel: de review. De vijf sterren staan boven de vouw, direct na kop en intro; elke ster
// is een eigen link (?rating=1..5), zodat de score op de landingspagina al is ingevuld.
// Vorig verblijf (S14) is compact en zonder knop; geen deals, thema's of andere commerciële
// links. De servicesectie (S15) blijft als vangnet voor klachten.
// Onderwerp: "Hoe was je verblijf in [hotelnaam]?"
//
// Terugvallen (tab Mergevelden):
//   [voornaam]  leeg → kop "Welkom thuis"
//   [hotelnaam] leeg → "je verblijf" (zin zonder hotelnaam)
//   [plaats]    leeg → plaats valt weg uit de regel onder de foto
//   [verblijfsdata] leeg → datumregel valt weg

type Props = {
  recipientEmail: string;
  firstName?: string;
  hotelName?: string;
  place?: string;
  /** "31 oktober – 2 november 2026" */
  stayDates?: string;
  image: string;
  reviewUrl: string;
};

export default function CrmReview({ recipientEmail, firstName, hotelName, place, stayDates, image, reviewUrl }: Props) {
  const c = newsletter.light;
  const where = hotelName ? `je verblijf in ${hotelName}` : "je verblijf";
  const meta = [place, stayDates].filter(Boolean).join(" · ");

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>We horen graag hoe je het vond. Het kost je een minuut.</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          <CrmHeader />

          {/* Boven de vouw: kop, één zin, vijf sterren, knop */}
          <Section className="m-pad" style={{ padding: "36px 32px 0", textAlign: "center" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>
              {firstName ? `Welkom thuis, ${firstName}` : "Welkom thuis"}
            </Heading>
            <Text style={s.body}>
              Jouw review helpt andere gasten bij hun keuze, en ons om nog beter te worden.
            </Text>
          </Section>

          <Section className="m-pad" style={{ padding: "28px 32px 0", textAlign: "center" }}>
            <Text style={{ fontFamily: font.heading, fontWeight: 600, fontSize: "20px", color: c.heading, margin: "0 0 10px" }}>
              Hoe beoordeel je {where}?
            </Text>
            <StarRating baseHref={reviewUrl} />
            <Section style={{ marginTop: "24px" }}>
              <PrimaryButton href={reviewUrl}>Schrijf je review</PrimaryButton>
            </Section>
          </Section>

          {/* Vorig verblijf, compact en zonder knop */}
          <Section className="m-pad" style={{ padding: "44px 32px 0", textAlign: "center" }}>
            <Section style={{ borderTop: `1px solid ${c.border}`, paddingTop: "24px" }}>
              <Row style={{ width: "auto" }}>
                <Column style={{ width: "150px", verticalAlign: "middle" }}>
                  <Img src={image} alt={hotelName ?? "Jouw verblijf"} width="150" height="94" style={{ display: "block", width: "150px", height: "94px", objectFit: "cover", borderRadius: "6px" }} />
                </Column>
                <Column style={{ verticalAlign: "middle", paddingLeft: "16px", textAlign: "left" }}>
                  <Text style={{ ...s.muted, margin: 0, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Jouw verblijf</Text>
                  {hotelName && <Text style={{ ...s.name, margin: "4px 0 0" }}>{hotelName}</Text>}
                  {meta && <Text style={{ ...s.title, color: c.muted, margin: "2px 0 0" }}>{meta}</Text>}
                </Column>
              </Row>
            </Section>
          </Section>

          {/* Service als vangnet */}
          <Section className="m-pad" style={{ padding: "28px 32px 40px", textAlign: "center" }}>
            <ServiceLine>
              Heb je nog vragen, of ging er iets niet zoals je had gehoopt? Laat het ons weten, we helpen je graag.{" "}
              <Link href={faqUrl} style={{ color: c.text, textDecoration: "underline" }}>Veelgestelde vragen</Link>
              {" · "}
              <Link href={serviceUrl} style={{ color: c.text, textDecoration: "underline" }}>Klantenservice</Link>
            </ServiceLine>
          </Section>

          <NewsletterFooter recipientEmail={recipientEmail} reason="omdat je een verblijf boekte bij ViaLuxury" />
        </Container>
      </Body>
    </Html>
  );
}

CrmReview.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  hotelName: "Landgoed Lauswolt",
  place: "Beetsterzwaag",
  stayDates: "31 oktober – 2 november 2026",
  image: "https://asset.vialuxury.com/assets/57455675-0f6e-4334-aaa2-bc3d1747f31f?key=card",
  reviewUrl: "https://www.vialuxury.com/nl-NL/review?utm_source=email&utm_medium=crm&utm_campaign=post_booking_review",
} satisfies Props;
