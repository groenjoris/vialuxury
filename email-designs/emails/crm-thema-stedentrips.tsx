import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { crmCss, DealList, type RowDeal, s, site, ThemePicker } from "../components/crm";
import { font, newsletter } from "../components/theme";

// CRM: themamail stedentrips (A6). Kop met de reden ("Omdat je zocht op 'stedentrips'"),
// drie populaire stedentrips onder elkaar (de eerste groot over de hele breedte, de andere
// twee als omlijnde dealrij) en onderaan de themakiezer: zes witte snelfilterknoppen met
// icoon, zoals "Snel zoeken" op de homepage, in een raster van twee even brede kolommen.
// Elke keuze gaat naar /crm/thema?keuze=<id>.
// Onderwerp: "Dit zijn de populairste stedentrips van dit moment"

type Props = {
  recipientEmail: string;
  /** Zoekterm of thema waarop de ontvanger zocht; leeg → geen reden onder de kop. */
  searchedFor?: string;
  deals: RowDeal[];
};

export default function CrmThemaStedentrips({ recipientEmail, searchedFor, deals }: Props) {
  const c = newsletter.light;
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
            <DealList deals={deals} />
          </Section>

          {/* Themakiezer: raster van even brede snelfilterknoppen */}
          <Section className="m-pad" style={{ padding: "48px 32px 40px" }}>
            <ThemePicker />
          </Section>
        </Container>
        <CrmFooter recipientEmail={recipientEmail} reason="omdat je je hebt aangemeld voor onze nieuwsbrief" />
      </Body>
    </Html>
  );
}

const deal = (permalink: string) => `${site}/first-release/deal/${permalink}`;

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
} satisfies Props;
