import { Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import { cardGap, CodeBlock, crmCss, CrmHelp, DealRow, Letter, PrimaryButton, type RowDeal, s, site } from "../components/crm";
import CrmFooter, { type FooterHelp } from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { font, newsletter } from "../components/theme";

// CRM mail 2: precies een jaar geleden (vervangt A2 1 jaar). Trigger: 1 jaar na
// aankomstdatum. "On this day"-herinnering: grote foto, daaronder "Vorig jaar op [datum]".
// Twee varianten (schakelaar in de preview):
// - Social proof (crm-jaar-geleden): hotelnaam, "Nog een keer beleven?" en één knop naar het
//   arrangement met dezelfde periode +1 jaar en hetzelfde aantal personen; boven de suggesties
//   "Anderen boekten ook" met "Gasten die in [hotel] verbleven, kozen daarna vaak deze arrangementen".
// - Persoonlijk (crm-jaar-geleden-persoonlijk): onder de titel een brief (aanhef, het verblijf van
//   vorig jaar, een link naar de beschikbare datums, de selectie); boven de
//   suggesties "Geselecteerd voor [voornaam]".
// Kortingscode als coupon, alleen als er een actieve code is. Daaronder drie deals onder elkaar.
// Onderwerp: "Vandaag een jaar geleden 🎉" (feest-emoji achter de zin)

type Props = {
  recipientEmail: string;
  /** Alleen in de variant "persoonlijk": leeg → "Beste gast," en "Geselecteerd voor jou". */
  firstName?: string;
  /** "social" (standaard): social proof boven de suggesties ("Anderen boekten ook"). "persoonlijk":
   *  brief onder de titel en "Geselecteerd voor [voornaam]" boven de suggesties. */
  variant?: "social" | "persoonlijk";
  hotelName: string;
  packageTitle: string;
  /** "2 november" */
  arrivalDayLastYear: string;
  image: string;
  /** Arrangement met dezelfde datums +1 jaar en hetzelfde aantal personen. */
  availabilityUrl: string;
  /** Leeg → geen coupon. */
  code?: { code: string; value: string; deadline: string };
  deals: RowDeal[];
  /** Gastquote “Dit moeten we vaker doen!” in de footer (voorbeeldmail "Dit moeten we vaker doen"). */
  quote?: boolean;
  /** Hulpblok als band boven de footer (variant 0 t/m 3, zie CrmFooter); het losse blok "Hulp nodig?"
   *  in de mail vervalt dan. Alleen in de voorbeeldmail "Dit moeten we vaker doen". */
  footerHelp?: FooterHelp;
};

export default function CrmJaarGeleden({ recipientEmail, firstName, variant = "social", hotelName, packageTitle, arrivalDayLastYear, image, availabilityUrl, code, deals, quote, footerHelp }: Props) {
  const c = newsletter.light;
  const personal = variant === "persoonlijk";

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>{code ? `Je verblijf in ${hotelName}, en een code voor ${code.value} korting.` : `Je verblijf in ${hotelName}.`}</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader />
        {/* Grote arrangementfoto direct onder de header, over de hele breedte van de mail (buiten de
            <Container>, net als de header); geen intro */}
        <Img src={image} alt={packageTitle} width="700" height="400" style={{ display: "block", width: "100%", height: "400px", objectFit: "cover" }} />
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          <Section className="m-pad" style={{ padding: "28px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>Vorig jaar op {arrivalDayLastYear}</Heading>
            {personal ? (
              // Variant "Persoonlijk": brief onder de titel; de link naar de beschikbare datums staat in de tekst
              <Section style={{ marginTop: "20px" }}>
                <Letter firstName={firstName}>
                  Vorig jaar op {arrivalDayLastYear} verbleef je in {hotelName}. Nog een keer beleven?{" "}
                  <Link href={availabilityUrl} style={{ color: c.link, fontWeight: 700, textDecoration: "underline" }}>Klik hier voor beschikbare datums</Link>
                  . Wil je wat anders? Dan hebben we speciaal voor jou vergelijkbare arrangementen geselecteerd.
                </Letter>
              </Section>
            ) : (
              <>
                <Text style={{ ...s.kop, margin: "6px 0 0" }}>{hotelName}</Text>
                <Text style={{ ...s.body, margin: "24px 0 0" }}>Nog een keer beleven?</Text>
                <Section style={{ marginTop: "14px" }}>
                  <PrimaryButton href={availabilityUrl}>Check beschikbaarheid</PrimaryButton>
                </Section>
              </>
            )}
          </Section>

          {code && (
            <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
              <Text style={{ ...s.body, margin: "0 0 10px" }}>Je code is nog steeds geldig:</Text>
              <CodeBlock title={`${code.value} korting`} code={code.code} deadline={code.deadline} />
            </Section>
          )}

          {/* Hulplijn: direct na de hoofdboodschap, niet als onderste blok */}
          {footerHelp === undefined && <CrmHelp top="32px" bottom="0" />}

          {/* Deals met frame-titel, onder elkaar */}
          <Section className="m-pad" style={{ padding: "48px 32px 40px" }}>
            {/* Eén groep suggesties, dus geen beige band: grote titel met de regel eronder */}
            {personal ? (
              <Heading as="h2" className="m-h1" style={s.h1}>{firstName ? `Geselecteerd voor ${firstName}` : "Geselecteerd voor jou"}</Heading>
            ) : (
              <>
                <Heading as="h2" className="m-h1" style={s.h1}>Anderen boekten ook</Heading>
                <Text style={{ ...s.body, color: c.muted, margin: "2px 0 0" }}>Gasten die in {hotelName} verbleven, kozen daarna vaak deze arrangementen</Text>
              </>
            )}
            {deals.map((d, i) => (
              <DealRow key={d.url} deal={d} top={i ? cardGap : undefined} />
            ))}
          </Section>
        </Container>
        <CrmFooter recipientEmail={recipientEmail} reason="omdat je vorig jaar bij ons boekte" help={footerHelp} quote={quote} />
      </Body>
    </Html>
  );
}

const deal = (permalink: string) => `${site}/first-release/deal/${permalink}`;

CrmJaarGeleden.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  hotelName: "Hotel Des Indes",
  packageTitle: "Verblijf 3 dagen in een luxe 5*-hotel in hartje Den Haag",
  arrivalDayLastYear: "2 november",
  image: "https://asset.vialuxury.com/assets/910163b4-1308-4f1f-989c-66e6d9202593?key=card",
  availabilityUrl: `${deal("hotel-des-indes-verblijf-3-dagen-in-luxe-5-hotel-in-hartje-centrum")}?checkin=2026-11-02&adults=2`,
  code: { code: "WEERWEG25", value: "€25", deadline: "30 november 2026" },
  deals: [
    {
      hotelName: "voco® The Hague",
      stars: 4,
      place: "Den Haag",
      packageTitle: "Verblijf in het mooiste hotel van Nederland",
      line: "Vanaf €319 voor 2 personen",
      image: "https://asset.vialuxury.com/assets/37e3155c-a965-4518-b38e-b9e93483766f?key=card",
      url: deal("voco-the-hague-1-1-gratis-verblijf-in-het-mooiste-hotel-van-nederland"),
      includes: ["Dagelijks ontbijtbuffet", "3-Gangendiner in Ultramarijn", "Welkomstattentie", "Late check-out"],
      discount: "-47%",
      price: "€319",
      original: "€601",
      priceFor: "2 personen, 2 nachten",
    },
    {
      hotelName: "Hotel De Plesman",
      stars: 4,
      place: "Den Haag",
      packageTitle: "Gloednieuw hotel in het voormalige KLM-hoofdkantoor",
      line: "Vanaf €309 voor 2 personen",
      image: "https://asset.vialuxury.com/assets/e14b892d-4bfd-423d-9789-4e36ca5599af?key=card",
      url: deal("de-plesman-openingsactie-beleef-den-haag-in-stijl-vanuit-een-nieuw-5-hotel-incl-3-gangendiner"),
      includes: ["Dagelijks ontbijtbuffet", "3-Gangendiner", "Gratis parkeren", "Voormalig kantoor van KLM"],
      discount: "-41%",
      price: "€309",
      original: "€526",
      priceFor: "2 personen, 2 nachten",
    },
    {
      hotelName: "Grand Hotel Amrâth Kurhaus",
      stars: 5,
      place: "Scheveningen",
      packageTitle: "Luxe overnachten aan het strand van Scheveningen",
      line: "Vanaf €399 voor 2 personen",
      image: "https://asset.vialuxury.com/assets/96624129-9f31-44d0-9d7a-c9e4ec027ecd?key=card",
      url: deal("grand-hotel-amrath-kurhaus-luxe-overnachting-aan-het-strand-van-scheveningen"),
      includes: ["Dagelijks ontbijtbuffet", "3-Gangendiner", "Aan het strand", "Late check-out"],
      discount: "-41%",
      price: "€399",
      original: "€681",
      priceFor: "2 personen, 2 nachten",
    },
  ],
} satisfies Props;

/** Variant "Persoonlijk": brief onder de titel en "Geselecteerd voor Sanne" boven de suggesties. */
export const persoonlijkProps = { ...CrmJaarGeleden.PreviewProps, variant: "persoonlijk" as const };

/** Voorbeeldmail "Dit moeten we vaker doen": dezelfde mail met de gastquote in de footer en het
 *  hulpblok als band erboven (footervariant 0 t/m 3); één schakelaar in de preview. */
export const vakerDoenProps = (footerHelp: FooterHelp = 1) => ({ ...CrmJaarGeleden.PreviewProps, quote: true, footerHelp });
