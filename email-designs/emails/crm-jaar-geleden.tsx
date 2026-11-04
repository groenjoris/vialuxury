import { Body, Column, Container, Head, Heading, Html, Img, Link, Preview, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { crmCss, DealLabel, PrimaryButton, s, SecondaryButton, site, CrmHeader } from "../components/crm";
import NewsletterFooter from "../components/NewsletterFooter";
import { font, newsletter } from "../components/theme";

// CRM mail 2: precies een jaar geleden (vervangt A2 1 jaar). Trigger: 1 jaar na
// aankomstdatum. "On this day"-herinnering: grote foto, datum en hotel, één kop, één
// knop naar het arrangement met dezelfde periode +1 jaar en hetzelfde aantal personen.
// Kortingsregel alleen als er een actieve code is. Daaronder drie deals met frame-titel.
// Onderwerp: "Vandaag een jaar geleden"

type Deal = {
  hotelName: string;
  packageTitle: string;
  label: "Populair" | "Nieuw" | "Aanbevolen" | "Samengesteld door ViaLuxury";
  fromPrice: string;
  image: string;
  url: string;
};

type Props = {
  recipientEmail: string;
  hotelName: string;
  packageTitle: string;
  place: string;
  /** "2 november 2025" */
  arrivalDateLastYear: string;
  image: string;
  /** Arrangement met dezelfde datums +1 jaar en hetzelfde aantal personen. */
  availabilityUrl: string;
  /** Leeg → geen kortingsregel. */
  code?: { code: string; value: string; deadline: string };
  deals: Deal[];
};

export default function CrmJaarGeleden({ recipientEmail, hotelName, packageTitle, place, arrivalDateLastYear, image, availabilityUrl, code, deals }: Props) {
  const c = newsletter.light;
  const cta = code ? `${availabilityUrl}&code=${code.code}` : availabilityUrl;

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>{hotelName}, {place}. Nog een keer?</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          <CrmHeader />

          {/* Grote arrangementfoto, datum en hotel direct eronder; geen intro */}
          <Img src={image} alt={packageTitle} width="626" height="380" style={{ display: "block", width: "100%", height: "380px", objectFit: "cover" }} />
          <Section className="m-pad" style={{ padding: "20px 32px 0" }}>
            <Text style={{ fontFamily: font.body, fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: c.muted, margin: 0 }}>
              {arrivalDateLastYear}
            </Text>
            <Text style={{ ...s.name, margin: "4px 0 0" }}>{hotelName}, {place}</Text>
          </Section>

          <Section className="m-pad" style={{ padding: "28px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>Nog een keer beleven?</Heading>
            <Section style={{ marginTop: "24px" }}>
              <PrimaryButton href={cta}>Check beschikbaarheid</PrimaryButton>
            </Section>
            {code && (
              <Text style={{ ...s.title, margin: "14px 0 0" }}>
                Je code{" "}
                <Link href={cta} style={{ color: c.text, fontWeight: 700, textDecoration: "underline" }}>{code.code}</Link>{" "}
                ({code.value} korting) is nog geldig tot {code.deadline}.
              </Text>
            )}
          </Section>

          {/* Deals met frame-titel */}
          <Section className="m-pad" style={{ padding: "48px 32px 40px" }}>
            <Text style={s.kop}>Anderen die {hotelName} boekten, boekten ook</Text>
            <Row style={{ marginTop: "16px" }}>
              {deals.map((d, i) => (
                <Column key={d.url} className="stack" style={{ width: "33.33%", verticalAlign: "top", paddingLeft: i ? "8px" : 0, paddingRight: i < deals.length - 1 ? "8px" : 0 }}>
                  <Link href={d.url}>
                    <Img src={d.image} alt={d.packageTitle} width="178" height="120" style={{ display: "block", width: "100%", height: "120px", objectFit: "cover", borderRadius: "6px" }} />
                  </Link>
                  <DealLabel>{d.label}</DealLabel>
                  <Text style={{ ...s.name, fontSize: "15px", margin: "8px 0 0" }}>{d.hotelName}</Text>
                  <Text style={{ ...s.title, fontSize: "13px", minHeight: "54px" }}>{d.packageTitle}</Text>
                  <Text style={{ ...s.title, margin: "8px 0 12px" }}>
                    <span style={{ color: c.muted }}>vanaf </span><strong>{d.fromPrice}</strong><span style={{ color: c.muted }}> p.p.</span>
                  </Text>
                  <SecondaryButton href={d.url} block>Bekijk</SecondaryButton>
                </Column>
              ))}
            </Row>
          </Section>

          <NewsletterFooter recipientEmail={recipientEmail} reason="omdat je vorig jaar bij ons boekte" />
        </Container>
      </Body>
    </Html>
  );
}

const deal = (permalink: string) => `${site}/first-release/deal/${permalink}`;

CrmJaarGeleden.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
  hotelName: "Landgoed Lauswolt",
  packageTitle: "Culinair verblijf in een luxe 5*-hotel in het prachtige Friesland, incl. MICHELIN-diner",
  place: "Beetsterzwaag",
  arrivalDateLastYear: "2 november 2025",
  image: "https://asset.vialuxury.com/assets/57455675-0f6e-4334-aaa2-bc3d1747f31f?key=card",
  availabilityUrl: `${deal("landgoed-lauswolt-geniet-van-5-sterren-luxe-in-de-bosrijke-omgeving-van-friesland-incl-culinair-diner")}?checkin=2026-11-02&adults=2`,
  code: { code: "WEERWEG25", value: "€25", deadline: "30 november" },
  deals: [
    {
      hotelName: "Van Oys Maastricht Retreat",
      packageTitle: "Ervaar wereldklasse comfort in een 5* Superior hotel",
      label: "Aanbevolen",
      fromPrice: "€519",
      image: "https://asset.vialuxury.com/assets/57faa15d-2992-49ef-87b4-1ae26418a12f?key=card",
      url: deal("van-oys-maastricht-retreat-ervaar-wereldklasse-comfort-in-een-5-sterren-superior-hotel"),
    },
    {
      hotelName: "Hotel Villa Ruimzicht",
      packageTitle: "Culinair verblijf in een monumentale villa, incl. 4-gangendiner",
      label: "Populair",
      fromPrice: "€229",
      image: "https://asset.vialuxury.com/assets/8e9e4c45-ae41-49a5-be41-3ec8d6fc915c?key=card",
      url: deal("hotel-villa-ruimzicht-2-daags-verblijf-in-een-monumentale-villa-incl-4-gangendiner"),
    },
    {
      hotelName: "Kasteel Steenenburg",
      packageTitle: "Culinair verblijf in een 4* kasteelhotel op een prachtig landgoed",
      label: "Nieuw",
      fromPrice: "€249",
      image: "https://asset.vialuxury.com/assets/c090e6d0-3705-42e1-bf8a-b1e8a3f90db8?key=card",
      url: deal("kasteel-steenenburg-culinair-verblijf-in-middeleeuws-4-kasteelhotel-op-prachtig-landgoed"),
    },
  ],
} satisfies Props;
