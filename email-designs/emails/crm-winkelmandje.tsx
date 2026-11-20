import { Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import { crmCss, FeaturedDeal, PrimaryButton, type RowDeal, s, site } from "../components/crm";
import { desIndes } from "../lib/crmDeals";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { baseUrl, font, newsletter } from "../components/theme";

// CRM mail 3: winkelmandje, 2 uur na het verlaten van de checkout.
// Eén doel: de boeking afronden. Bovenaan de titel (met voornaam als die bekend is), de vraag met
// de hotelnaam, de gekozen datums, nachten en personen, de besparing voor die datum (opmaak zoals
// "Je hebt al €441 (47%) bespaard" in de checkout: smiley, bedrag oranje en vet) en de ene knop
// naar de boeking met alles vooringevuld. Daaronder de deal op de uitgebreide kaart, zonder
// prijsrij. Gastenoordeel: gemiddelde met Trustpilot-sterren en drie korte reviews, alleen als die
// er zijn. Geen alternatieve deals.
// Twee varianten (schakelaar in de preview): naam bekend (crm-winkelmandje) en naam onbekend
// (crm-winkelmandje-naam-onbekend).
// Onderwerp: "[Voornaam], we hebben deze nog even voor je bewaard" / "We hebben deze nog even voor je bewaard"

type Props = {
  recipientEmail: string;
  /** Leeg → titel zonder naam. */
  firstName?: string;
  /** De deal uit het winkelmandje, op de uitgebreide kaart (zonder prijsrij). */
  deal: RowDeal & { hotelName: string };
  /** "20 november" */
  arrivalDate: string;
  /** "22 november 2026" */
  departureDate: string;
  nights: number;
  persons: number;
  /** Besparing voor de gekozen datum t.o.v. de kamerprijs; leeg → geen besparingsregel. */
  saving?: { amount: string; percentage?: string };
  /** Gemiddelde en aantal reviews van het hotel (schaal tot 5), boven de losse reviews. */
  reviewSummary?: { average: 3 | 3.5 | 4 | 4.5 | 5; label: string };
  /** Drie gastenoordelen; leeg → geen gastenoordeel. */
  reviews?: { text: string; author: string }[];
  checkoutUrl: string;
};

export default function CrmWinkelmandje({ recipientEmail, firstName, deal, arrivalDate, departureDate, nights, persons, saving, reviewSummary, reviews, checkoutUrl }: Props) {
  const hotelName = deal.hotelName;
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
            <Heading as="h1" className="m-h1" style={s.h1}>
              {firstName ? `${firstName}, we hebben 'm nog even voor je bewaard.` : "We hebben 'm nog even voor je bewaard."}
            </Heading>
            <Text style={s.body}>Nog steeds interesse in {hotelName}?</Text>

            {/* Wat er klaarstaat: datums, nachten en personen, en de besparing voor die datum */}
            <Text style={{ ...line, margin: "16px 0 0", fontWeight: 700 }}>{arrivalDate} tot {departureDate}</Text>
            <Text style={{ ...muted, margin: "2px 0 0" }}>{nights} nachten · {persons} personen</Text>
            {saving && (
              <Text style={{ ...line, margin: "10px 0 0" }}>
                <Img src={`${baseUrl}/images/mail/crm/smiley-donker.png`} alt="" width="18" height="18" style={{ display: "inline-block", verticalAlign: "-3px", marginRight: "6px" }} />
                Bespaar <span style={{ fontWeight: 700, color: c.cta }}>{saving.amount}</span>
                {saving.percentage && <span style={{ color: c.muted }}> ({saving.percentage})</span>}
              </Text>
            )}

            {/* De ene knop, buiten de kaart */}
            <Section style={{ marginTop: "20px" }}>
              <PrimaryButton href={checkoutUrl}>Rond je boeking af</PrimaryButton>
            </Section>
          </Section>

          {/* De deal op de uitgebreide kaart, zonder prijsrij; de foto linkt naar de boeking */}
          <Section className="m-pad" style={{ padding: "12px 32px 0" }}>
            <FeaturedDeal deal={{ ...deal, url: checkoutUrl }} priceRow={false} />
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

const checkoutUrl = `${desIndes.url}?checkin=2026-11-20&adults=2`;

CrmWinkelmandje.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  deal: { ...desIndes, hotelName: "Hotel Des Indes" },
  arrivalDate: "20 november",
  departureDate: "22 november 2026",
  nights: 2,
  persons: 2,
  // deals.json: €499 in plaats van €940 voor 2 personen en 2 nachten.
  saving: { amount: "€441", percentage: "47%" },
  reviewSummary: { average: 4.5, label: "4,5 uit 312 reviews" },
  reviews: [
    { text: "Prachtige kamer en een feestelijk diner.", author: "Marieke" },
    { text: "Stijlvol hotel en een heerlijk rustige kamer.", author: "Jeroen" },
    { text: "Fijne locatie, alles op loopafstand.", author: "Annelies" },
  ],
  checkoutUrl,
} satisfies Props;

/** Variant zonder voornaam (naam onbekend). */
export const naamOnbekendProps = { ...CrmWinkelmandje.PreviewProps, firstName: undefined };
