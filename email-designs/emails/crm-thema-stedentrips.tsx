import { Body, Column, Container, Head, Heading, Html, Img, Link, Preview, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { crmCss, DealRow, FeaturedDeal, type RowDeal, s, site } from "../components/crm";
import { baseUrl, font, newsletter } from "../components/theme";

// CRM: themamail stedentrips (A6). Kop met de reden ("Omdat je zocht op 'stedentrips'"),
// drie populaire stedentrips onder elkaar (de eerste groot over de hele breedte, de andere
// twee als omlijnde dealrij) en onderaan de themakiezer: zes witte snelfilterknoppen met
// icoon, zoals "Snel zoeken" op de homepage, in een raster van drie even brede kolommen.
// Elke keuze gaat naar /crm/thema?keuze=<id>.
// Onderwerp: "Dit zijn de populairste stedentrips van dit moment"

type Theme = { id: string; label: string; icon: string };

type Props = {
  recipientEmail: string;
  /** Zoekterm of thema waarop de ontvanger zocht; leeg → geen reden onder de kop. */
  searchedFor?: string;
  deals: RowDeal[];
  themes: Theme[];
};

const PER_ROW = 3;

export default function CrmThemaStedentrips({ recipientEmail, searchedFor, deals, themes }: Props) {
  const c = newsletter.light;
  const [first, ...rest] = deals;
  const rows = Array.from({ length: Math.ceil(themes.length / PER_ROW) }, (_, i) => themes.slice(i * PER_ROW, (i + 1) * PER_ROW));

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
            {searchedFor && <Text style={{ ...s.body, color: c.muted, margin: "8px 0 0" }}>Omdat je zocht op '{searchedFor}'.</Text>}
          </Section>

          {/* Drie deals: de eerste groot, de rest als rij */}
          <Section className="m-pad" style={{ padding: "12px 32px 0" }}>
            {first && <FeaturedDeal deal={first} />}
            {rest.map((d) => (
              <DealRow key={d.url} deal={d} />
            ))}
          </Section>

          {/* Themakiezer: raster van even brede snelfilterknoppen (wit, dun randje, icoon + label) */}
          <Section className="m-pad" style={{ padding: "48px 32px 40px" }}>
            <Text style={s.kop}>Waarover wil je aanbiedingen ontvangen?</Text>
            <Text style={{ ...s.body, margin: "6px 0 0" }}>Eén klik is genoeg, dan sturen we voortaan wat je zoekt.</Text>
            <Section style={{ marginTop: "8px" }}>
              {rows.map((row, ri) => (
                <Row key={ri} style={{ marginTop: "8px" }}>
                  {Array.from({ length: PER_ROW }, (_, i) => {
                    const t = row[i];
                    return (
                      <Column key={i} style={{ width: `${100 / PER_ROW}%`, verticalAlign: "top", paddingLeft: i ? "4px" : 0, paddingRight: i < PER_ROW - 1 ? "4px" : 0 }}>
                        {t && (
                          <Link
                            href={`${site}/crm/thema?keuze=${t.id}`}
                            style={{
                              display: "block",
                              backgroundColor: "#FFFFFF",
                              border: "1px solid #E5E2DA",
                              borderRadius: "4px",
                              padding: "13px 14px",
                              fontFamily: font.body,
                              fontSize: "14px",
                              lineHeight: "18px",
                              color: c.text,
                              textDecoration: "none",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Img src={t.icon} alt="" width="14" height="14" style={{ display: "inline-block", verticalAlign: "-2px", marginRight: "8px" }} />
                            {t.label}
                          </Link>
                        )}
                      </Column>
                    );
                  })}
                </Row>
              ))}
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
  searchedFor: "stedentrips",
  deals: [
    {
      hotelName: "Hotel Mademoiselle",
      stars: 4,
      place: "Parijs",
      packageTitle: "3 dagen Parijs met een riviercruise op de Seine",
      line: "Vanaf €409 voor 2 personen",
      image: "https://asset.vialuxury.com/assets/8b56b66e-8948-4731-b8a5-600b37337c16?key=card",
      url: deal("hotel-mademoiselle-geniet-3-dagen-van-parijs-vol-smaak-stijl-and-beleving"),
    },
    {
      hotelName: "Hotel Des Indes",
      stars: 5,
      place: "Den Haag",
      packageTitle: "Verblijf 3 dagen in een luxe 5*-hotel in hartje Den Haag",
      line: "Vanaf €379 voor 2 personen",
      image: "https://asset.vialuxury.com/assets/910163b4-1308-4f1f-989c-66e6d9202593?key=card",
      url: deal("hotel-des-indes-verblijf-3-dagen-in-luxe-5-hotel-in-hartje-centrum"),
    },
    {
      hotelName: "WestCord Fashion Hotel Amsterdam",
      stars: 4,
      place: "Amsterdam",
      packageTitle: "3-daags verblijf in een 4*-hotel met skybar",
      line: "Vanaf €279 voor 2 personen",
      image: "https://asset.vialuxury.com/assets/a0943077-0b0f-4022-96ec-eda45927e263?key=card",
      url: deal("fashion-hotel-amsterdam-3-daags-verblijf-in-een-4-hotel-met-wellness-en-sky-bar-met-panoramisch-uitzicht"),
    },
  ],
  themes: [
    { id: "wellness", label: "Wellness", icon: icon("bath") },
    { id: "aan-zee", label: "Aan zee", icon: icon("waves") },
    { id: "natuur", label: "In de natuur", icon: icon("leaf") },
    { id: "culinair", label: "Culinair genieten", icon: icon("wine") },
    { id: "kasteel", label: "Kasteelhotels", icon: icon("castle") },
    { id: "romantisch", label: "Romantisch", icon: icon("heart") },
  ],
} satisfies Props;
