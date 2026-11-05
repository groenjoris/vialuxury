import { Body, Column, Container, Head, Heading, Html, Img, Link, Preview, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { crmCss, DealListCard, type ListDeal, s, site } from "../components/crm";
import { font, newsletter } from "../components/theme";

// CRM mail 4: winkelmandje, 2 dagen na het verlaten van de checkout. Na de mail van
// 2 uur (zelfde deal, afronden) nu alternatieven: bovenaan klein de deal uit het
// winkelmandje, daaronder drie vergelijkbare deals in de list view van de zoekkaarten
// (foto links; hotelnaam, dealtitel, 4 inclusies, vanafprijs en knop rechts).
// Onderwerp: "Dit zijn 3 deals die lijken op [hotelnaam]"


type Props = {
  recipientEmail: string;
  cart: { hotelName: string; packageTitle: string; image: string; url: string };
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
      <Preview>Ook met ontbijt en diner, vanaf €249 voor 2 personen.</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader />
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Klein blok: de deal uit het winkelmandje */}
          <Section className="m-pad" style={{ padding: "28px 32px 0" }}>
            <Section style={{ backgroundColor: "#F4F1EC", borderRadius: "8px", padding: "16px" }}>
              <Text style={s.name}>{cart.hotelName}</Text>
              <Row style={{ marginTop: "10px" }}>
                <Column style={{ width: "88px", verticalAlign: "middle" }}>
                  <Link href={cart.url}>
                    <Img src={cart.image} alt={cart.packageTitle} width="88" height="60" style={{ display: "block", borderRadius: "4px", objectFit: "cover" }} />
                  </Link>
                </Column>
                <Column style={{ paddingLeft: "14px", verticalAlign: "middle" }}>
                  <Link href={cart.url} style={{ ...s.title, margin: 0, textDecoration: "none" }}>{cart.packageTitle}</Link>
                </Column>
              </Row>
            </Section>
          </Section>

          <Section className="m-pad" style={{ padding: "36px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>Geboekt door anderen die deze deal bekeken</Heading>
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
    hotelName: "Hotel Winselerhof",
    packageTitle: "Ervaar luxe en rust in een 16e-eeuwse herenboerderij in Zuid-Limburg, incl. culinair 3-gangendiner",
    image: "https://asset.vialuxury.com/assets/91f33df7-dfbc-454d-9ebc-8b6e8708a18c?key=card",
    url: `${deal("winselerhof-een-oase-van-luxe-en-rust-in-het-hart-van-limburg-incl-culinair-4-gangendiner")}?checkin=2026-11-20&adults=2`,
  },
  deals: [
    {
      hotelName: "Van Oys Maastricht Retreat",
      packageTitle: "Ervaar wereldklasse comfort in een 5* Superior hotel",
      label: "Aanbevolen",
      includes: ["Kamerupgrade", "Uitgebreid ontbijtbuffet", "4-gangendiner in Restaurant MAES (MICHELIN Gids)", "10 minuten rijden van Maastricht"],
      priceMeta: "2 personen, 1 nacht",
      fromPrice: "€519",
      originalPrice: "€808",
      image: "https://asset.vialuxury.com/assets/57faa15d-2992-49ef-87b4-1ae26418a12f?key=card",
      url: deal("van-oys-maastricht-retreat-ervaar-wereldklasse-comfort-in-een-5-sterren-superior-hotel"),
    },
    {
      hotelName: "Kasteel Steenenburg",
      packageTitle: "Culinair verblijf in een 4* kasteelhotel op een prachtig landgoed",
      label: "Populair",
      includes: ["Uitgebreid ontbijtbuffet", "3-gangendiner in Orangerie Steenenburg", "Gratis parkeren", "Onbeperkt toegang tot Safaripark Beekse Bergen"],
      priceMeta: "2 personen, 1 nacht",
      fromPrice: "€249",
      originalPrice: "€489",
      image: "https://asset.vialuxury.com/assets/c090e6d0-3705-42e1-bf8a-b1e8a3f90db8?key=card",
      url: deal("kasteel-steenenburg-culinair-verblijf-in-middeleeuws-4-kasteelhotel-op-prachtig-landgoed"),
    },
    {
      hotelName: "Landgoed Parc Broekhuizen",
      packageTitle: "Ervaar pure luxe in een 19e-eeuws kasteelhotel",
      label: "Samengesteld door ViaLuxury",
      includes: ["Uitgebreid à-la-carte-ontbijt", "3-gangendiner", "Early check-in", "Gratis parkeren"],
      priceMeta: "2 personen, 1 nacht",
      fromPrice: "€389",
      originalPrice: "€551",
      image: "https://asset.vialuxury.com/assets/010a445c-4d7f-443f-931e-0e825097bb28?key=card",
      url: deal("parc-broekhuizen-luxe-overnachting-op-5-sterren-landgoed-op-de-utrechtse-heuvelrug-incl-3-gangendiner"),
    },
  ],
} satisfies Props;
