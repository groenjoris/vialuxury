import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { crmCss, CrmHelp, DealRow, FeaturedDeal, Letter, type RowDeal, s, site } from "../components/crm";
import { font, newsletter } from "../components/theme";

// CRM mail 4: winkelmandje, 2 dagen na het verlaten van de checkout. Na de mail van
// 2 uur (zelfde deal, afronden) nu alternatieven. De mail begint als brief (bouwsteen Letter):
// aanhef ("Beste Sanne," of zonder naam "Beste gast,"), een korte intro en de ondertekening
// "Groetjes Yvette" als afbeelding. Daarna de titel "Anderen boekten ook" direct boven de lijst
// waar hij bij hoort: drie vergelijkbare deals, de eerste groot, de andere twee als dealrij. Daaronder
// "Door jou bekeken": de deal uit het winkelmandje op dezelfde kaart, zonder prijsrij (aankomst
// met nachten en personen, de besparing en de link "Ga verder met boeken").
// Twee varianten (schakelaar in de preview): naam bekend en naam onbekend
// (crm-winkelmandje-2-dagen-naam-onbekend).
// Geen labels. Klaviyo: nooit twee lettertypen op één regel, daarom staat alles onder elkaar.
// Onderwerp: "Dit zijn 3 deals die lijken op [hotelnaam]"

type Props = {
  recipientEmail: string;
  /** Leeg → "Beste gast,". */
  firstName?: string;
  /** Deal uit het winkelmandje; url met datum en personen vooringevuld. */
  cart: RowDeal & { hotelName: string };
  deals: RowDeal[];
};

export default function CrmWinkelmandje2Dagen({ recipientEmail, firstName, cart, deals }: Props) {
  const c = newsletter.light;
  const [first, ...rest] = deals;

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>Ook in Den Haag en aan de kust, vanaf €309 voor 2 personen.</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader />
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Briefopening: aanhef, korte intro en de ondertekening */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Letter firstName={firstName}>
              Klanten die interesse hadden in {cart.hotelName}, boekten vaak ook de volgende deals. Misschien interessant voor jou!
            </Letter>
          </Section>

          {/* De titel hoort bij de lijst en staat er direct boven: drie vergelijkbare deals, de
              eerste groot, de rest als rij */}
          <Section className="m-pad" style={{ padding: "40px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>Anderen boekten ook</Heading>
            {first && <FeaturedDeal deal={first} />}
            {rest.map((d) => (
              <DealRow key={d.url} deal={d} />
            ))}
          </Section>

          {/* Daaronder "Door jou bekeken": de deal uit het winkelmandje */}
          <Section className="m-pad" style={{ padding: "44px 32px 0" }}>
            <Text style={s.kop}>Door jou bekeken</Text>
            <DealRow deal={cart} cta="Ga verder met boeken" />
          </Section>

          {/* Hulplijn */}
          <CrmHelp top="36px" />
        </Container>
        <CrmFooter recipientEmail={recipientEmail} reason="omdat je een boeking bij ons startte" />
      </Body>
    </Html>
  );
}

const deal = (permalink: string) => `${site}/first-release/deal/${permalink}`;

CrmWinkelmandje2Dagen.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  cart: {
    hotelName: "Hotel Des Indes",
    stars: 5,
    place: "Den Haag",
    packageTitle: "Verblijf 3 dagen in een luxe 5*-hotel in hartje Den Haag",
    // Geen prijs: aankomst met nachten en personen, en de besparing (deals.json: €379 in plaats van €830).
    lines: ["20 november · 2 nachten · 2 personen", "Bespaar €451 (54%)"],
    includes: ["Kamerupgrade", "Dagelijks luxe ontbijtbuffet", "Welkomstdrankje", "Late check-out"],
    image: "https://asset.vialuxury.com/assets/910163b4-1308-4f1f-989c-66e6d9202593?key=card",
    url: `${deal("hotel-des-indes-verblijf-3-dagen-in-luxe-5-hotel-in-hartje-centrum")}?checkin=2026-11-20&adults=2`,
  },
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

/** Variant zonder voornaam (naam onbekend): "Beste gast,". */
export const naamOnbekendProps = { ...CrmWinkelmandje2Dagen.PreviewProps, firstName: undefined };
