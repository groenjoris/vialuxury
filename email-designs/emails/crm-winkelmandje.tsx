import { Body, Column, Container, Head, Heading, Html, Img, Link, Preview, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { crmCss, PrimaryButton, s, site, CrmHeader, TrustpilotStars } from "../components/crm";
import NewsletterFooter from "../components/NewsletterFooter";
import { font, newsletter } from "../components/theme";

// CRM mail 3: winkelmandje, 2 dagen na verlaten (vervangt A4 cart 2 dagen).
// Eén doel: de boeking afronden. Concrete datums en beschikbaarheid, één knop naar de
// checkout met alles vooringevuld. Gastenoordeel: altijd drie Trustpilot-reviews (1 tot en met 5 sterren), alleen als die er zijn.
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
  /** Drie gastenoordelen; leeg → geen gastenoordeel. */
  /** Gemiddelde en aantal reviews van het hotel (schaal tot 5), boven de losse reviews. */
  reviewSummary?: { average: 3 | 3.5 | 4 | 4.5 | 5; label: string };
  reviews?: { stars: 3 | 3.5 | 4 | 4.5 | 5; text: string; author: string }[];
  image: string;
  checkoutUrl: string;
};

export default function CrmWinkelmandje({ recipientEmail, hotelName, packageTitle, place, arrivalDate, departureDate, nights, persons, price, availability, roomsLeft, reviewSummary, reviews, image, checkoutUrl }: Props) {
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
          <CrmHeader />

          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>Nog steeds interesse in {hotelName}?</Heading>
            <Text style={s.body}>We hebben 'm voor je bewaard.</Text>
          </Section>

          {/* Winkelmandkaart */}
          <Section className="m-pad" style={{ padding: "24px 32px 0" }}>
            <Section style={{ border: `1px solid ${c.border}`, borderRadius: "8px", overflow: "hidden" }}>
              <Img src={image} alt={packageTitle} width="560" height="240" style={{ display: "block", width: "100%", height: "240px", objectFit: "cover" }} />
              <Section style={{ padding: "20px 20px 24px" }}>
                <Text style={{ ...s.name, fontSize: "20px" }}>{hotelName}</Text>
                <Text style={s.title}>{packageTitle}</Text>
                <Text style={{ ...s.muted, margin: "4px 0 0" }}>{place}</Text>

                <Section style={{ marginTop: "16px", borderTop: `1px solid ${c.border}`, paddingTop: "14px" }}>
                  <Text style={{ ...s.title, margin: 0, fontWeight: 700 }}>{arrivalDate} tot {departureDate}</Text>
                  <Text style={{ ...s.muted, margin: "2px 0 0" }}>{nights} nachten · {persons} personen</Text>
                  <Text style={{ fontFamily: font.body, fontSize: "16px", fontWeight: 700, color: c.text, margin: "10px 0 0" }}>Totaal {price}</Text>
                </Section>

                <Text style={{ ...s.title, margin: "16px 0 0" }}>{availabilityLine}</Text>
                <Section style={{ marginTop: "20px" }}>
                  <PrimaryButton href={checkoutUrl}>Rond je boeking af</PrimaryButton>
                </Section>
              </Section>
            </Section>
          </Section>

          {/* Gastenoordeel: drie reviews onder elkaar, alleen als er scores zijn */}
          {reviews && reviews.length > 0 && (
            <Section className="m-pad" style={{ padding: "36px 32px 0" }}>
              <Text style={s.kop}>Dit vinden gasten van {hotelName}</Text>
              {reviewSummary && (
                <>
                  <Section style={{ marginTop: "12px" }}>
                    <TrustpilotStars rating={reviewSummary.average} />
                  </Section>
                  <Text style={{ ...s.body, margin: "6px 0 0" }}>{reviewSummary.label}</Text>
                </>
              )}
              {reviews.slice(0, 3).map((r, i) => (
                <Section key={r.author} style={{ marginTop: "20px", paddingTop: i ? "20px" : 0, borderTop: i ? `1px solid ${c.border}` : "none" }}>
                  <TrustpilotStars rating={r.stars} />
                  <Text style={{ fontFamily: font.heading, fontSize: "16px", lineHeight: "1.5", color: c.text, margin: "6px 0 0" }}>&ldquo;{r.text}&rdquo;</Text>
                  <Text style={{ ...s.muted, margin: "6px 0 0" }}>{r.author}</Text>
                </Section>
              ))}
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
  hotelName: "Hotel Des Indes",
  packageTitle: "Verken en beleef Den Haag vanuit een luxe 5*-hotel, incl. 3-gangendiner",
  place: "Den Haag",
  arrivalDate: "20 november",
  departureDate: "22 november 2026",
  nights: 2,
  persons: 2,
  price: "€998",
  availability: "almost-full",
  roomsLeft: 3,
  reviewSummary: { average: 4.5, label: "4,5 uit 312 reviews op Trustpilot" },
  reviews: [
    { stars: 5, text: "Prachtige kamer, het diner was een feestje en het personeel is ontzettend gastvrij.", author: "Marieke, oktober 2026" },
    { stars: 5, text: "Een stijlvol hotel midden in Den Haag. Het ontbijt was uitgebreid en de kamer heerlijk rustig.", author: "Jeroen, september 2026" },
    { stars: 4, text: "Fijne locatie, alles op loopafstand. De lobby en de bar zijn echt bijzonder.", author: "Annelies, augustus 2026" },
  ],
  image: "https://asset.vialuxury.com/assets/ec2bfd91-fc7d-4fa4-91b9-9fc61298b804?key=card",
  checkoutUrl: `${site}/first-release/deal/hotel-des-indes-verken-en-beleef-den-haag-vanuit-luxe-5-hotel-incl-3-gangendiner?checkin=2026-11-20&adults=2`,
} satisfies Props;
