import { Body, Container, Head, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { crmCss, DealRow, FeaturedDeal, type RowDeal, s, site } from "../components/crm";
import { font, newsletter } from "../components/theme";

// CRM mail 4: winkelmandje, 2 dagen na het verlaten van de checkout. Na de mail van
// 2 uur (zelfde deal, afronden) nu alternatieven. "Door jou bekeken": de deal uit het
// winkelmandje als omlijnde dealrij (zoals "Jouw verblijf" in de reviewmail). Daaronder drie
// vergelijkbare deals onder elkaar: de eerste groot over de hele breedte met een oranje knop
// (naar Jesse's terugkomactie), de andere twee als dealrij (zoals "Precies een jaar geleden").
// Geen labels. Klaviyo: nooit twee lettertypen op één regel, daarom staat alles onder elkaar.
// Onderwerp: "Dit zijn 3 deals die lijken op [hotelnaam]"

type Props = {
  recipientEmail: string;
  /** Deal uit het winkelmandje; url met datum en personen vooringevuld. */
  cart: RowDeal & { hotelName: string };
  deals: RowDeal[];
};

export default function CrmWinkelmandje2Dagen({ recipientEmail, cart, deals }: Props) {
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
          {/* Door jou bekeken: de deal uit het winkelmandje */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Text style={s.kop}>Door jou bekeken</Text>
            <DealRow deal={cart} cta="Ga verder met boeken" />
          </Section>

          {/* Drie vergelijkbare deals: de eerste groot, de rest als rij */}
          <Section className="m-pad" style={{ padding: "44px 32px 40px" }}>
            <Text style={s.kop}>Geboekt door anderen die {cart.hotelName} bekeken</Text>
            {first && <FeaturedDeal deal={first} />}
            {rest.map((d) => (
              <DealRow key={d.url} deal={d} />
            ))}
          </Section>
        </Container>
        <CrmFooter recipientEmail={recipientEmail} reason="omdat je een boeking bij ons startte" />
      </Body>
    </Html>
  );
}

const deal = (permalink: string) => `${site}/first-release/deal/${permalink}`;

CrmWinkelmandje2Dagen.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
  cart: {
    hotelName: "Hotel Des Indes",
    place: "Den Haag",
    packageTitle: "Verblijf 3 dagen in een luxe 5*-hotel in hartje Den Haag",
    line: "Vanaf €379 voor 2 personen",
    image: "https://asset.vialuxury.com/assets/910163b4-1308-4f1f-989c-66e6d9202593?key=card",
    url: `${deal("hotel-des-indes-verblijf-3-dagen-in-luxe-5-hotel-in-hartje-centrum")}?checkin=2026-11-20&adults=2`,
  },
  deals: [
    {
      hotelName: "voco® The Hague",
      place: "Den Haag",
      packageTitle: "Verblijf in het mooiste hotel van Nederland",
      line: "Vanaf €319 voor 2 personen",
      image: "https://asset.vialuxury.com/assets/37e3155c-a965-4518-b38e-b9e93483766f?key=card",
      url: deal("voco-the-hague-1-1-gratis-verblijf-in-het-mooiste-hotel-van-nederland"),
    },
    {
      hotelName: "Hotel De Plesman",
      place: "Den Haag",
      packageTitle: "Gloednieuw hotel in het voormalige KLM-hoofdkantoor",
      line: "Vanaf €309 voor 2 personen",
      image: "https://asset.vialuxury.com/assets/e14b892d-4bfd-423d-9789-4e36ca5599af?key=card",
      url: deal("de-plesman-openingsactie-beleef-den-haag-in-stijl-vanuit-een-nieuw-5-hotel-incl-3-gangendiner"),
    },
    {
      hotelName: "Grand Hotel Amrâth Kurhaus",
      place: "Scheveningen",
      packageTitle: "Luxe overnachten aan het strand van Scheveningen",
      line: "Vanaf €399 voor 2 personen",
      image: "https://asset.vialuxury.com/assets/96624129-9f31-44d0-9d7a-c9e4ec027ecd?key=card",
      url: deal("grand-hotel-amrath-kurhaus-luxe-overnachting-aan-het-strand-van-scheveningen"),
    },
  ],
} satisfies Props;
