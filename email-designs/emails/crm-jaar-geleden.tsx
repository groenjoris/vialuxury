import { Body, Container, Head, Heading, Html, Img, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import { CodeBlock, crmCss, DealRow, PrimaryButton, type RowDeal, s, site } from "../components/crm";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { font, newsletter } from "../components/theme";

// CRM mail 2: precies een jaar geleden (vervangt A2 1 jaar). Trigger: 1 jaar na
// aankomstdatum. "On this day"-herinnering: grote foto, daaronder "Vorig jaar op [datum]",
// de hotelnaam, "Nog een keer beleven?" en één knop naar het arrangement met dezelfde
// periode +1 jaar en hetzelfde aantal personen. Kortingscode als coupon (stijl van Jesse's
// terugkomactie), alleen als er een actieve code is. Daaronder drie deals onder elkaar in
// de omlijnde dealrij van de reviewmail, met vanafprijs en zonder labels.
// Onderwerp: "Vandaag een jaar geleden"

type Props = {
  recipientEmail: string;
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
};

export default function CrmJaarGeleden({ recipientEmail, hotelName, packageTitle, arrivalDayLastYear, image, availabilityUrl, code, deals }: Props) {
  const c = newsletter.light;

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>{code ? `Je verblijf in ${hotelName}, en een code voor ${code.value} korting.` : `Je verblijf in ${hotelName}.`}</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader />
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Grote arrangementfoto; geen intro */}
          <Img src={image} alt={packageTitle} width="626" height="380" style={{ display: "block", width: "100%", height: "380px", objectFit: "cover" }} />

          <Section className="m-pad" style={{ padding: "28px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>Vorig jaar op {arrivalDayLastYear}</Heading>
            <Text style={{ ...s.kop, margin: "6px 0 0" }}>{hotelName}</Text>
            <Text style={{ ...s.body, margin: "24px 0 0" }}>Nog een keer beleven?</Text>
            <Section style={{ marginTop: "14px" }}>
              <PrimaryButton href={availabilityUrl}>Check beschikbaarheid</PrimaryButton>
            </Section>
          </Section>

          {code && (
            <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
              <CodeBlock code={code.code} label={`Jouw persoonlijke code voor ${code.value} korting`} deadline={code.deadline} />
            </Section>
          )}

          {/* Deals met frame-titel, onder elkaar */}
          <Section className="m-pad" style={{ padding: "48px 32px 40px" }}>
            <Text style={s.kop}>Anderen die {hotelName} boekten, boekten ook</Text>
            {deals.map((d) => (
              <DealRow key={d.url} deal={d} />
            ))}
          </Section>
        </Container>
        <CrmFooter recipientEmail={recipientEmail} reason="omdat je vorig jaar bij ons boekte" />
      </Body>
    </Html>
  );
}

const deal = (permalink: string) => `${site}/first-release/deal/${permalink}`;

CrmJaarGeleden.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
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
    },
    {
      hotelName: "Hotel De Plesman",
      stars: 4,
      place: "Den Haag",
      packageTitle: "Gloednieuw hotel in het voormalige KLM-hoofdkantoor",
      line: "Vanaf €309 voor 2 personen",
      image: "https://asset.vialuxury.com/assets/e14b892d-4bfd-423d-9789-4e36ca5599af?key=card",
      url: deal("de-plesman-openingsactie-beleef-den-haag-in-stijl-vanuit-een-nieuw-5-hotel-incl-3-gangendiner"),
    },
    {
      hotelName: "Grand Hotel Amrâth Kurhaus",
      stars: 5,
      place: "Scheveningen",
      packageTitle: "Luxe overnachten aan het strand van Scheveningen",
      line: "Vanaf €399 voor 2 personen",
      image: "https://asset.vialuxury.com/assets/96624129-9f31-44d0-9d7a-c9e4ec027ecd?key=card",
      url: deal("grand-hotel-amrath-kurhaus-luxe-overnachting-aan-het-strand-van-scheveningen"),
    },
  ],
} satisfies Props;
