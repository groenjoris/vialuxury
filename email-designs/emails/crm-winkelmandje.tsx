import { Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import { crmCss, PrimaryButton, s, site } from "../components/crm";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { baseUrl, font, newsletter } from "../components/theme";

// CRM mail 3: winkelmandje, 2 uur na het verlaten van de checkout. Overgenomen van de
// winkelmandjemail van Jesse (origin/redesign-jesse, crm-winkelmandje.tsx), met de plaats
// boven de dealtitel en zonder de beschikbaarheidsregel ("Nog x kamers beschikbaar").
// Eén doel: de boeking afronden. Concrete datums en de totaalprijs, één knop naar de
// boeking met alles vooringevuld. Gastenoordeel: gemiddelde met Trustpilot-sterren en drie
// korte reviews, alleen als die er zijn. Geen alternatieve deals.
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
  /** Totaalprijs voor alle personen. */
  price: string;
  /** Wat er in de totaalprijs zit of nog bijkomt, bijv. "Inclusief btw en servicekosten". Alleen invullen als het klopt. */
  priceNote?: string;
  /** Gemiddelde en aantal reviews van het hotel (schaal tot 5), boven de losse reviews. */
  reviewSummary?: { average: 3 | 3.5 | 4 | 4.5 | 5; label: string };
  /** Drie gastenoordelen; leeg → geen gastenoordeel. */
  reviews?: { text: string; author: string }[];
  image: string;
  checkoutUrl: string;
};

export default function CrmWinkelmandje({ recipientEmail, hotelName, packageTitle, place, arrivalDate, departureDate, nights, persons, price, priceNote, reviewSummary, reviews, image, checkoutUrl }: Props) {
  const c = newsletter.light;
  const line = s.title;
  const muted = s.muted;

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>Je boeking staat klaar. Rond af wanneer het jou uitkomt.</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader />
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>Nog steeds interesse in {hotelName}?</Heading>
            <Text style={s.body}>We hebben 'm voor je bewaard.</Text>
          </Section>

          {/* Winkelmandkaart */}
          <Section className="m-pad" style={{ padding: "24px 32px 0" }}>
            <Section style={{ border: `1px solid #E5E5E5`, borderRadius: "8px", overflow: "hidden" }}>
              <Img src={image} alt={packageTitle} width="560" height="240" style={{ display: "block", width: "100%", height: "240px", objectFit: "cover" }} />
              <Section style={{ padding: "20px 20px 24px" }}>
                <Text style={s.kop}>{hotelName}</Text>
                <Text style={{ ...muted, margin: "2px 0 0" }}>{place}</Text>
                <Text style={{ ...line, margin: "6px 0 0" }}>{packageTitle}</Text>

                <Section style={{ marginTop: "16px", borderTop: `1px solid ${c.border}`, paddingTop: "14px" }}>
                  <Text style={{ ...line, margin: 0, fontWeight: 700 }}>{arrivalDate} tot {departureDate}</Text>
                  <Text style={{ ...muted, margin: "2px 0 0" }}>{nights} nachten · {persons} personen</Text>
                  <Text style={{ ...s.name, margin: "10px 0 0" }}>Totaal {price} voor {persons} personen</Text>
                  {priceNote && <Text style={{ ...muted, margin: "2px 0 0" }}>{priceNote}</Text>}
                </Section>

                <Section style={{ marginTop: "20px" }}>
                  <PrimaryButton href={checkoutUrl}>Rond je boeking af</PrimaryButton>
                </Section>
              </Section>
            </Section>
          </Section>

          {/* Gastenoordeel: zonder vlak; één keer sterren met het gemiddelde, drie reviews in 20 px serif */}
          {reviews && reviews.length > 0 && (
            <Section className="m-pad" style={{ padding: "36px 32px 0" }}>
              <Text style={s.kop}>Dit vinden gasten van {hotelName}</Text>
              <Section style={{ marginTop: "14px" }}>
                {reviewSummary && (
                  <>
                    <Img
                      src={`${baseUrl}/images/mail/crm/trustpilot-sterren-${String(reviewSummary.average).replace(".", "-")}.png`}
                      alt={`${String(reviewSummary.average).replace(".", ",")} van 5 sterren op Trustpilot`}
                      width="152"
                      height="28"
                      style={{ display: "block", width: "152px", height: "28px" }}
                    />
                    <Text style={{ ...s.body, margin: "6px 0 0" }}>{reviewSummary.label}</Text>
                  </>
                )}
                {reviews.slice(0, 3).map((r, i) => (
                  <Section key={r.author} style={{ marginTop: i || reviewSummary ? "22px" : 0 }}>
                    <Text style={{ fontFamily: font.heading, fontSize: "20px", lineHeight: "1.35", color: c.text, margin: 0 }}>&ldquo;{r.text}&rdquo;</Text>
                    <Text style={{ ...muted, margin: "4px 0 0" }}>{r.author}</Text>
                  </Section>
                ))}
              </Section>
            </Section>
          )}

          {/* Service */}
          <Section className="m-pad" style={{ padding: "32px 32px 40px" }}>
            <Text style={{ ...line, margin: 0, color: c.muted }}>
              Vragen over je boeking?{" "}
              <Link href={`${site}/klantenservice`} style={{ color: c.text, textDecoration: "underline" }}>Onze klantenservice</Link>{" "}
              helpt je graag.
            </Text>
          </Section>
        </Container>
        <CrmFooter recipientEmail={recipientEmail} reason="omdat je een boeking bij ons startte" />
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
  // deals.json: €499 is het totaal voor 2 personen en 2 nachten (Jesse had €998).
  price: "€499",
  priceNote: "Inclusief btw en servicekosten",
  reviewSummary: { average: 4.5, label: "4,5 uit 312 reviews" },
  reviews: [
    { text: "Prachtige kamer en een feestelijk diner.", author: "Marieke" },
    { text: "Stijlvol hotel en een heerlijk rustige kamer.", author: "Jeroen" },
    { text: "Fijne locatie, alles op loopafstand.", author: "Annelies" },
  ],
  image: "https://asset.vialuxury.com/assets/ec2bfd91-fc7d-4fa4-91b9-9fc61298b804?key=card",
  checkoutUrl: `${site}/first-release/deal/hotel-des-indes-verken-en-beleef-den-haag-vanuit-luxe-5-hotel-incl-3-gangendiner?checkin=2026-11-20&adults=2`,
} satisfies Props;
