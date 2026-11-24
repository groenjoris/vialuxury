import { Body, Column, Container, Head, Heading, Html, Img, Link, Preview, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { BeigeBand, crmCss, CrmHelp, DealRow, s, site } from "../components/crm";
import { baseUrl, font, newsletter } from "../components/theme";

// CRM: reviewmail, 1 dag na thuiskomst. Gebaseerd op de reviewmail van Jesse
// (origin/redesign-jesse, crm-review.tsx). Eén doel: de review. Kop, één zin en het keuzeblok
// boven de vouw: op het beige vlak vijf lege, omlijnde sterren (leeg leest als "vul mij in",
// gevuld als een score die er al staat) met "Slecht" en "Uitstekend" eronder; elke ster is een
// eigen link (?rating=1..5), zodat de score op de landingspagina al is ingevuld. Variant "Knop"
// (crm-review-knoppen, schakelaar in de preview): vijf witte tegels met cijfer en ster. Daaronder "Jouw verblijf": het
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
  /** Vorm van de vijf keuzes: lege sterren (standaard) of knoppen met cijfer en ster. */
  starStyle?: "leeg" | "knop";
};

export default function CrmReview({ recipientEmail, firstName, hotelName, stars, place, packageTitle, stayDates, image, dealUrl, reviewUrl, starStyle = "knop" }: Props) {
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

          {/* De vraag als keuzeblok op een beige band over de hele breedte. Vijf lege sterren ("vul mij in", geen score die er
              al staat) met de uiteinden van de schaal eronder; elke ster is een eigen link, tapvlak 48 × 48 px */}
        </Container>

        <BeigeBand top="28px">
          <Text style={s.kop}>
            Hoe beoordeel je {hotelName ? `je verblijf in ${hotelName}` : "je verblijf"}?
          </Text>
          <Text style={{ ...s.title, color: c.muted, margin: "2px 0 12px" }}>Selecteer het gewenste aantal sterren</Text>
          {starStyle === "knop" ? (
            // Variant "Knop": vijf witte tegels met een dun randje (zoals de snelfilterknoppen), in
            // elke tegel het cijfer met een ster; de uiteinden van de schaal eronder
            <>
              <Row>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Column key={n} style={{ width: "20%", paddingRight: n < 5 ? "8px" : 0 }}>
                    <Link
                      href={`${reviewUrl}${sep}rating=${n}`}
                      aria-label={`${n} ${n === 1 ? "ster" : "sterren"}`}
                      style={{ display: "block", backgroundColor: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: "4px", padding: "13px 0", fontFamily: font.body, fontSize: "16px", fontWeight: 700, lineHeight: "20px", color: c.text, textAlign: "center", textDecoration: "none" }}
                    >
                      {n} ★
                    </Link>
                  </Column>
                ))}
              </Row>
              <Row style={{ marginTop: "6px" }}>
                <Column style={{ width: "50%" }}>
                  <Text style={{ ...s.muted, margin: 0 }}>Slecht</Text>
                </Column>
                <Column style={{ width: "50%", textAlign: "right" }}>
                  <Text style={{ ...s.muted, margin: 0, textAlign: "right" }}>Uitstekend</Text>
                </Column>
              </Row>
            </>
          ) : (
            <>
              {/* Eén tabel: de vijf sterren en eronder de uiteinden van de schaal, even breed */}
              <table role="presentation" cellPadding={0} cellSpacing={0} border={0} style={{ width: "256px", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <td key={n} style={{ width: "48px", padding: n < 5 ? "0 4px 0 0" : 0 }}>
                        <Link href={`${reviewUrl}${sep}rating=${n}`} style={{ display: "block", width: "48px", height: "48px" }}>
                          <Img src={`${baseUrl}/images/mail/crm/ster-leeg.png`} alt={`${n} ${n === 1 ? "ster" : "sterren"}`} width="48" height="48" style={{ display: "block" }} />
                        </Link>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td colSpan={2} style={{ paddingTop: "4px" }}>
                      <Text style={{ ...s.muted, margin: 0 }}>Slecht</Text>
                    </td>
                    <td colSpan={3} style={{ paddingTop: "4px", textAlign: "right" }}>
                      <Text style={{ ...s.muted, margin: 0, textAlign: "right" }}>Uitstekend</Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          )}
        </BeigeBand>

        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Vangnet voor wie iets te melden heeft, direct onder de sterren; de hulplijn eronder zegt hoe */}
          <Section className="m-pad" style={{ padding: "32px 32px 20px" }}>
            <Text style={{ ...s.title, margin: 0, color: c.muted }}>
              Heb je nog vragen, of ging er iets niet zoals je had gehoopt? Laat het ons weten, we helpen je graag.
            </Text>
          </Section>
          {/* Hulplijn */}
          <CrmHelp bottom="0" />

          {/* Jouw verblijf: dealrij met grijze rand, hotelnaam bovenaan */}
          <Section className="m-pad" style={{ padding: "44px 32px 40px" }}>
            <Text style={s.kop}>Jouw verblijf</Text>
            <DealRow deal={{ hotelName, stars, place, packageTitle, line: stayDates, image, url: dealUrl }} />
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

/** Variant met knoppen in plaats van lege sterren. */
/** Variant "Lege ster": vijf lege, omlijnde sterren in plaats van de knoppen (de knopversie is de gekozen standaard). */
export const sterrenProps = { ...CrmReview.PreviewProps, starStyle: "leeg" as const };
