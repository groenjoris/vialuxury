import { Body, Column, Container, Head, Heading, Html, Img, Link, Preview, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { crmCss, PrimaryButton, s, site } from "../components/crm";
import NewsletterFooter from "../components/NewsletterFooter";
import NewsletterHeader from "../components/NewsletterHeader";
import { font, newsletter } from "../components/theme";

// CRM mail 3: winkelmandje, 2 dagen na verlaten (vervangt A4 cart 2 dagen).
// Eén doel: de boeking afronden. Concrete datums en beschikbaarheid, één knop naar de
// checkout met alles vooringevuld. Gastenoordeel alleen als er een score is.
// Geen alternatieve deals.
// Onderwerp: "[hotelnaam] op [aankomstdatum kort]: nog beschikbaar"

type Props = {
  recipientEmail: string;
  hotelName: string;
  packageTitle: string;
  place: string;
  /** "20 november" */
  arrivalDate: string;
  /** "22 november 2026" */
  departureDate: string;
  nights: number;
  persons: number;
  price: string;
  availability: "available" | "almost-full";
  roomsLeft?: number;
  /** Leeg → geen gastenoordeel. */
  review?: { score: string; text: string; author: string };
  image: string;
  checkoutUrl: string;
};

export default function CrmWinkelmandje({ recipientEmail, hotelName, packageTitle, place, arrivalDate, departureDate, nights, persons, price, availability, roomsLeft, review, image, checkoutUrl }: Props) {
  const c = newsletter.light;
  const availabilityLine =
    availability === "almost-full"
      ? `Nog ${roomsLeft} kamers beschikbaar op ${arrivalDate}.`
      : `${arrivalDate[0].toUpperCase()}${arrivalDate.slice(1)} is gewild bij onze bezoekers. Nog beschikbaar voor ${persons} personen.`;

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>Je boeking staat klaar. Rond af wanneer het jou uitkomt.</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          <NewsletterHeader trustpilot={false} />

          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>Nog steeds interesse in {hotelName}?</Heading>
            <Text style={s.body}>We hebben 'm voor je bewaard.</Text>
          </Section>

          {/* Winkelmandkaart */}
          <Section className="m-pad" style={{ padding: "24px 32px 0" }}>
            <Section style={{ border: `1px solid ${c.border}`, borderRadius: "8px", overflow: "hidden" }}>
              <Img src={image} alt={packageTitle} width="560" height="240" style={{ display: "block", width: "100%", height: "240px", objectFit: "cover" }} />
              <Section style={{ padding: "20px 20px 24px" }}>
                <Text style={{ ...s.name, fontSize: "18px" }}>{hotelName}</Text>
                <Text style={s.title}>{packageTitle}</Text>
                <Text style={{ ...s.muted, margin: "4px 0 0" }}>{place}</Text>

                <Row style={{ marginTop: "16px", borderTop: `1px solid ${c.border}` }}>
                  <Column style={{ paddingTop: "14px", verticalAlign: "top" }}>
                    <Text style={{ ...s.title, margin: 0, fontWeight: 700 }}>{arrivalDate} tot {departureDate}</Text>
                    <Text style={{ ...s.muted, margin: "2px 0 0" }}>{nights} nachten · {persons} personen</Text>
                  </Column>
                  <Column align="right" style={{ paddingTop: "14px", verticalAlign: "top" }}>
                    <Text style={{ fontFamily: font.body, fontSize: "22px", fontWeight: 700, color: c.text, margin: 0, textAlign: "right" }}>{price}</Text>
                    <Text style={{ ...s.muted, margin: "2px 0 0", textAlign: "right" }}>totaal</Text>
                  </Column>
                </Row>

                <Text style={{ ...s.title, margin: "16px 0 0" }}>{availabilityLine}</Text>
                <Section style={{ marginTop: "20px" }}>
                  <PrimaryButton href={checkoutUrl}>Rond je boeking af</PrimaryButton>
                </Section>
              </Section>
            </Section>
          </Section>

          {/* Gastenoordeel, alleen als er een score is */}
          {review && (
            <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
              <Row>
                <Column style={{ width: "64px", verticalAlign: "top" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "6px", backgroundColor: c.text, color: "#FFFFFF", textAlign: "center", lineHeight: "52px", fontFamily: font.body, fontSize: "20px", fontWeight: 700 }}>
                    {review.score}
                  </div>
                </Column>
                <Column style={{ verticalAlign: "top" }}>
                  <Text style={{ fontFamily: font.heading, fontSize: "18px", lineHeight: "1.4", color: c.text, margin: 0 }}>"{review.text}"</Text>
                  <Text style={{ ...s.muted, margin: "6px 0 0" }}>{review.author}</Text>
                </Column>
              </Row>
            </Section>
          )}

          {/* Service */}
          <Section className="m-pad" style={{ padding: "32px 32px 40px" }}>
            <Text style={{ ...s.title, margin: 0, color: c.muted }}>
              Vragen over je boeking?{" "}
              <Link href={`${site}/klantenservice`} style={{ color: c.text, textDecoration: "underline" }}>Onze klantenservice</Link>{" "}
              helpt je graag.
            </Text>
          </Section>

          <NewsletterFooter recipientEmail={recipientEmail} reason="omdat je een boeking bij ons startte" />
        </Container>
      </Body>
    </Html>
  );
}

CrmWinkelmandje.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
  hotelName: "Hotel Winselerhof",
  packageTitle: "Ervaar luxe en rust in een 16e-eeuwse herenboerderij in Zuid-Limburg, incl. culinair 3-gangendiner",
  place: "Landgraaf",
  arrivalDate: "20 november",
  departureDate: "22 november 2026",
  nights: 2,
  persons: 2,
  price: "€558",
  availability: "almost-full",
  roomsLeft: 3,
  review: { score: "9,1", text: "Prachtige kamer, het diner was een feestje en het personeel is ontzettend gastvrij.", author: "Marieke, oktober 2026" },
  image: "https://asset.vialuxury.com/assets/91f33df7-dfbc-454d-9ebc-8b6e8708a18c?key=card",
  checkoutUrl: `${site}/first-release/deal/winselerhof-een-oase-van-luxe-en-rust-in-het-hart-van-limburg-incl-culinair-4-gangendiner?checkin=2026-11-20&adults=2`,
} satisfies Props;
