import { Body, Column, Container, Head, Heading, Html, Img, Link, Preview, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { crmCss, DealListCard, type ListDeal, PrimaryButton, s, site } from "../components/crm";
import { baseUrl, font, newsletter } from "../components/theme";

// CRM mail 4: winkelmandje, 2 dagen na het verlaten van de checkout. Na de mail van
// 2 uur (zelfde deal, afronden) nu alternatieven: bovenaan "Door jou bekeken" met de deal
// uit het winkelmandje (hotel, sterren, plaats, thumb, dealtitel, vanafprijs en knop),
// daaronder drie vergelijkbare deals in de list view van de zoekkaarten, zonder labels.
// Onderwerp: "Dit zijn 3 deals die lijken op [hotelnaam]"

type Props = {
  recipientEmail: string;
  cart: {
    hotelName: string;
    stars: number;
    /** "Den Haag, Zuid-Holland" */
    place: string;
    packageTitle: string;
    image: string;
    /** "2 personen, 2 nachten" */
    priceMeta: string;
    fromPrice: string;
    originalPrice?: string;
    /** Deal met datum en personen vooringevuld. */
    url: string;
  };
  deals: ListDeal[];
};

export default function CrmWinkelmandje2Dagen({ recipientEmail, cart, deals }: Props) {
  const c = newsletter.light;

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
          <Section className="m-pad" style={{ padding: "28px 32px 0" }}>
            <Text style={{ fontFamily: font.body, fontSize: "13px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: c.muted, margin: "0 0 8px" }}>
              Door jou bekeken
            </Text>
            <Section style={{ border: `1px solid ${c.text}`, borderRadius: "8px", padding: "16px 18px" }}>
              <Text style={{ ...s.name, fontSize: "18px" }}>
                {cart.hotelName}
                <span style={{ fontSize: "13px", letterSpacing: "1px", marginLeft: "8px", verticalAlign: "1px" }}>{"★".repeat(cart.stars)}</span>
              </Text>
              <Text style={{ ...s.muted, margin: "2px 0 0" }}>{cart.place}</Text>
              <Row style={{ marginTop: "14px" }}>
                <Column style={{ width: "96px", verticalAlign: "middle" }}>
                  <Link href={cart.url}>
                    <Img src={cart.image} alt={cart.packageTitle} width="96" height="66" style={{ display: "block", borderRadius: "4px", objectFit: "cover" }} />
                  </Link>
                </Column>
                <Column style={{ paddingLeft: "14px", paddingRight: "14px", verticalAlign: "middle" }}>
                  <Link href={cart.url} style={{ ...s.title, margin: 0, textDecoration: "none" }}>{cart.packageTitle}</Link>
                </Column>
                <Column align="right" style={{ width: "190px", verticalAlign: "middle" }}>
                  <Text style={{ ...s.muted, fontSize: "12px", margin: 0, textAlign: "right" }}>{cart.priceMeta}</Text>
                  <Text style={{ fontFamily: font.body, fontSize: "14px", color: c.text, margin: "2px 0 10px", textAlign: "right" }}>
                    <span style={{ color: c.muted }}>Vanaf </span>
                    {cart.originalPrice && <span style={{ color: c.muted, textDecoration: "line-through", marginRight: "6px" }}>{cart.originalPrice}</span>}
                    <strong style={{ fontSize: "20px" }}>{cart.fromPrice}</strong>
                  </Text>
                  <PrimaryButton href={cart.url} small>Ga verder met boeken</PrimaryButton>
                </Column>
              </Row>
            </Section>
          </Section>

          <Section className="m-pad" style={{ padding: "40px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>Geboekt door anderen die {cart.hotelName} bekeken</Heading>
          </Section>

          {/* Drie deals in list view */}
          <Section className="m-pad" style={{ padding: "8px 32px 40px" }}>
            {deals.map((d) => (
              <DealListCard key={d.url} deal={d} />
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
    stars: 5,
    place: "Den Haag, Zuid-Holland",
    packageTitle: "Verblijf 3 dagen in een luxe 5*-hotel in hartje Den Haag",
    image: "https://asset.vialuxury.com/assets/910163b4-1308-4f1f-989c-66e6d9202593?key=card",
    priceMeta: "2 personen, 2 nachten",
    fromPrice: "€379",
    originalPrice: "€830",
    url: `${deal("hotel-des-indes-verblijf-3-dagen-in-luxe-5-hotel-in-hartje-centrum")}?checkin=2026-11-20&adults=2`,
  },
  deals: [
    {
      hotelName: "voco® The Hague",
      packageTitle: "Verblijf in het mooiste hotel van Nederland",
      includes: ["Dagelijks ontbijtbuffet", "3-gangendiner in Ultramarijn", "Welkomstattentie", "Late check-out"],
      priceMeta: "2 personen, 2 nachten",
      fromPrice: "€319",
      originalPrice: "€601",
      image: "https://asset.vialuxury.com/assets/37e3155c-a965-4518-b38e-b9e93483766f?key=card",
      url: deal("voco-the-hague-1-1-gratis-verblijf-in-het-mooiste-hotel-van-nederland"),
    },
    {
      hotelName: "Hotel De Plesman",
      packageTitle: "Gloednieuw hotel in het voormalige KLM-hoofdkantoor",
      includes: ["Dagelijks ontbijtbuffet", "3-gangendiner", "Gratis parkeren", "Voormalig kantoor van KLM"],
      curator: {
        name: "Esther",
        photo: `${baseUrl}/images/team/esther.jpeg`,
        role: "specialist culinaire stedentrips",
        story: "Ontbijten in de hal waar KLM ooit begon. Zo begint je dag in Den Haag.",
      },
      priceMeta: "2 personen, 2 nachten",
      fromPrice: "€309",
      originalPrice: "€526",
      image: "https://asset.vialuxury.com/assets/e14b892d-4bfd-423d-9789-4e36ca5599af?key=card",
      url: deal("de-plesman-openingsactie-beleef-den-haag-in-stijl-vanuit-een-nieuw-5-hotel-incl-3-gangendiner"),
    },
    {
      hotelName: "Grand Hotel Amrâth Kurhaus",
      packageTitle: "Luxe overnachten aan het strand van Scheveningen",
      includes: ["Dagelijks ontbijtbuffet", "3-gangendiner", "Aan het strand", "Late check-out"],
      priceMeta: "2 personen, 2 nachten",
      fromPrice: "€399",
      originalPrice: "€681",
      image: "https://asset.vialuxury.com/assets/96624129-9f31-44d0-9d7a-c9e4ec027ecd?key=card",
      url: deal("grand-hotel-amrath-kurhaus-luxe-overnachting-aan-het-strand-van-scheveningen"),
    },
  ],
} satisfies Props;
