import { Body, Column, Container, Head, Heading, Html, Img, Link, Preview, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { crmCss, DealListCard, type ListDeal, s, site } from "../components/crm";
import { baseUrl, font, newsletter } from "../components/theme";

// CRM: themamail stedentrips (A6). Kop, drie populaire stedentrips in de list view van de
// zoekkaarten, daarna een blok waarin je een ander thema kiest. Twee varianten:
// "knoppen" (vijf witte snelfilterknoppen met icoon, zoals "Snel zoeken" op de homepage)
// en "plaatjes" (per thema een foto, de themanaam en een oranje link "Meer van dit thema").
// Elke keuze gaat naar /crm/thema?keuze=<id>.
// Onderwerp: "Dit zijn de populairste stedentrips van dit moment"

type Theme = { id: string; label: string; icon: string; image: string };

type Props = {
  recipientEmail: string;
  variant: "knoppen" | "plaatjes";
  deals: ListDeal[];
  themes: Theme[];
};

export default function CrmThemaStedentrips({ recipientEmail, variant, deals, themes }: Props) {
  const c = newsletter.light;
  const href = (t: Theme) => `${site}/crm/thema?keuze=${t.id}`;

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>Parijs, Den Haag en Amsterdam, vanaf €279 voor 2 personen.</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader />
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>De populairste stedentrips</Heading>
          </Section>

          <Section className="m-pad" style={{ padding: "8px 32px 0" }}>
            {deals.map((d) => <DealListCard key={d.url} deal={d} />)}
          </Section>

          {/* Ander thema kiezen */}
          <Section className="m-pad" style={{ padding: "48px 32px 40px" }}>
            <Section style={{ backgroundColor: "#F4F1EC", borderRadius: "8px", padding: "28px 24px" }}>
              <Text style={{ ...s.kop, fontSize: "26px" }}>Waarover wil je aanbiedingen ontvangen?</Text>
              <Text style={{ ...s.body, margin: "8px 0 0" }}>Eén klik is genoeg, dan sturen we voortaan wat je zoekt.</Text>

              {variant === "knoppen" ? (
                // Snelfilterknoppen: wit, dun randje, icoon + label (zoals .home-pill)
                <Text style={{ margin: "20px 0 0", lineHeight: "54px" }}>
                  {themes.map((t) => (
                    <Link
                      key={t.id}
                      href={href(t)}
                      style={{
                        display: "inline-block",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E5E2DA",
                        borderRadius: "4px",
                        padding: "12px 17px",
                        marginRight: "8px",
                        lineHeight: "18px",
                        fontFamily: font.body,
                        fontSize: "14px",
                        color: c.text,
                        textDecoration: "none",
                        verticalAlign: "middle",
                      }}
                    >
                      <Img src={t.icon} alt="" width="14" height="14" style={{ display: "inline-block", verticalAlign: "-2px", marginRight: "8px" }} />
                      {t.label}
                    </Link>
                  ))}
                </Text>
              ) : (
                // Per thema: foto, themanaam en een oranje link
                <Section style={{ marginTop: "12px" }}>
                  {themes.map((t) => (
                    <Section key={t.id} style={{ backgroundColor: "#FFFFFF", borderRadius: "6px", marginTop: "10px", overflow: "hidden" }}>
                      <Row>
                        <Column style={{ width: "120px", verticalAlign: "middle" }}>
                          <Link href={href(t)}>
                            <Img src={t.image} alt={t.label} width="120" height="80" style={{ display: "block", width: "120px", height: "80px", objectFit: "cover" }} />
                          </Link>
                        </Column>
                        <Column style={{ verticalAlign: "middle", padding: "0 18px" }}>
                          <Text style={{ ...s.name, fontSize: "17px" }}>
                            <Img src={t.icon} alt="" width="14" height="14" style={{ display: "inline-block", verticalAlign: "0", marginRight: "8px" }} />
                            {t.label}
                          </Text>
                          <Link href={href(t)} style={{ display: "inline-block", marginTop: "6px", fontFamily: font.body, fontSize: "14px", fontWeight: 700, color: c.link, textDecoration: "underline" }}>
                            Meer van dit thema
                          </Link>
                        </Column>
                      </Row>
                    </Section>
                  ))}
                </Section>
              )}
            </Section>
          </Section>
        </Container>
        <CrmFooter recipientEmail={recipientEmail} reason="omdat je je hebt aangemeld voor onze nieuwsbrief" />
      </Body>
    </Html>
  );
}

const deal = (permalink: string) => `${site}/first-release/deal/${permalink}`;
const icon = (key: string) => `${baseUrl}/images/mail/theme-${key}.png`;

CrmThemaStedentrips.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
  variant: "knoppen",
  deals: [
    {
      hotelName: "Hotel Mademoiselle",
      packageTitle: "3 dagen Parijs met een riviercruise op de Seine",
      includes: ["Dagelijks ontbijtbuffet", "Franse kaasplank", "Seine-cruisetickets voor 2 personen", "Glas champagne p.p."],
      priceMeta: "2 personen, 2 nachten",
      fromPrice: "€409",
      originalPrice: "€645",
      image: "https://asset.vialuxury.com/assets/8b56b66e-8948-4731-b8a5-600b37337c16?key=card",
      url: deal("hotel-mademoiselle-geniet-3-dagen-van-parijs-vol-smaak-stijl-and-beleving"),
    },
    {
      hotelName: "Hotel Des Indes",
      packageTitle: "Verblijf 3 dagen in een luxe 5*-hotel in hartje Den Haag",
      includes: ["Kamerupgrade", "Dagelijks luxe ontbijtbuffet", "Welkomstdrankje", "Late check-out"],
      priceMeta: "2 personen, 2 nachten",
      fromPrice: "€379",
      originalPrice: "€830",
      image: "https://asset.vialuxury.com/assets/910163b4-1308-4f1f-989c-66e6d9202593?key=card",
      url: deal("hotel-des-indes-verblijf-3-dagen-in-luxe-5-hotel-in-hartje-centrum"),
    },
    {
      hotelName: "WestCord Fashion Hotel Amsterdam",
      packageTitle: "3-daags verblijf in een 4*-hotel met skybar",
      includes: ["Dagelijks ontbijtbuffet", "Gebruik zwembad", "Wellness en fitness", "Late check-out"],
      priceMeta: "2 personen, 2 nachten",
      fromPrice: "€279",
      originalPrice: "€543",
      image: "https://asset.vialuxury.com/assets/a0943077-0b0f-4022-96ec-eda45927e263?key=card",
      url: deal("fashion-hotel-amsterdam-3-daags-verblijf-in-een-4-hotel-met-wellness-en-sky-bar-met-panoramisch-uitzicht"),
    },
  ],
  themes: [
    { id: "wellness", label: "Wellness", icon: icon("bath"), image: "https://asset.vialuxury.com/assets/4513dd11-7f07-48e5-9e69-ba1c4fd91c98?key=card" },
    { id: "aan-zee", label: "Aan zee", icon: icon("waves"), image: "https://asset.vialuxury.com/assets/d30a6e61-eacd-471a-9305-8e8aa2fef321?key=card" },
    { id: "natuur", label: "In de natuur", icon: icon("leaf"), image: "https://asset.vialuxury.com/assets/b0a1806e-5b1e-4628-bb90-a9fefd5822d4?key=card" },
    { id: "culinair", label: "Culinair genieten", icon: icon("wine"), image: "https://asset.vialuxury.com/assets/3d08bc63-30ef-4624-83e6-371eef514e92?key=card" },
    { id: "kasteel", label: "Kasteelhotels", icon: icon("castle"), image: "https://asset.vialuxury.com/assets/010a445c-4d7f-443f-931e-0e825097bb28?key=card" },
  ],
} satisfies Props;
