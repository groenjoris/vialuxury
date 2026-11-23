import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { BeigeBand, crmCss, CrmHelp, DealList, Letter, type RowDeal, s, site, ThemePicker } from "../components/crm";
import { font, newsletter } from "../components/theme";

// CRM: themamail stedentrips (A6). De mail begint als brief (Letter): aanhef, de reden ("Omdat je
// zocht op stedentrips, hierbij …") en de ondertekening. Daarna de titel "De populairste
// stedentrips" direct boven de lijst: drie deals onder elkaar (de eerste groot over de hele
// breedte, de andere twee als dealrij), zonder beige band want het is één groep. Onderaan de
// themakiezer op een beige band: zes witte snelfilterknoppen met icoon, zoals "Snel zoeken" op de
// homepage, in een raster van twee even brede kolommen. Elke keuze gaat naar /crm/thema?keuze=<id>.
// De twee dealrijen in deze mail tonen twee foto's onder elkaar in de fotokolom: het hoofdbeeld
// boven en het tweede beeld van het arrangement eronder (veld `secondImage`).
// De deals staan op de uitgebreide kaart (zoals de zoekkaart op de website).
// Onderwerp: "Dit zijn de populairste stedentrips van dit moment"

type Props = {
  recipientEmail: string;
  /** Leeg → "Beste gast,". */
  firstName?: string;
  /** Zoekterm of thema waarop de ontvanger zocht; leeg → de intro zonder reden. */
  searchedFor?: string;
  deals: RowDeal[];
};

export default function CrmThemaStedentrips({ recipientEmail, firstName, searchedFor, deals }: Props) {
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
          {/* Briefopening: aanhef, de reden (waar je op zocht) en de ondertekening */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Letter firstName={firstName}>
              {searchedFor ? `Omdat je zocht op ${searchedFor}, hierbij de meest populaire stedentrips van dit moment.` : "Hierbij de meest populaire stedentrips van dit moment."}
            </Letter>
          </Section>

          {/* De titel hoort bij de lijst en staat er direct boven (geen subtitel: de reden staat al in
              de aanhef; geen beige band: het is één groep). Drie deals: de eerste groot, de rest als rij */}
          <Section className="m-pad" style={{ padding: "40px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>De populairste stedentrips</Heading>
            <DealList deals={deals} />
          </Section>

        </Container>

        {/* Themakiezer op een beige band over de hele breedte: raster van even brede snelfilterknoppen */}
        <BeigeBand top="48px">
          <ThemePicker />
        </BeigeBand>

        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Hulplijn */}
          <CrmHelp top="36px" />
        </Container>
        <CrmFooter recipientEmail={recipientEmail} reason="omdat je je hebt aangemeld voor onze nieuwsbrief" />
      </Body>
    </Html>
  );
}

const deal = (permalink: string) => `${site}/first-release/deal/${permalink}`;

CrmThemaStedentrips.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
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
      includes: ["Dagelijks ontbijtbuffet", "Franse kaasplank", "Seine cruise tickets voor 2 personen", "Glas champagne p.p."],
      discount: "-37%",
      price: "€409",
      original: "€645",
      priceFor: "2 personen, 2 nachten",
    },
    {
      hotelName: "Hotel Des Indes",
      stars: 5,
      place: "Den Haag",
      packageTitle: "Verblijf 3 dagen in een luxe 5*-hotel in hartje Den Haag",
      line: "Vanaf €379 voor 2 personen",
      image: "https://asset.vialuxury.com/assets/910163b4-1308-4f1f-989c-66e6d9202593?key=card",
      // Tweede foto van het arrangement uit deals.json; de dealrij toont ze onder elkaar.
      secondImage: "https://asset.vialuxury.com/assets/ec2bfd91-fc7d-4fa4-91b9-9fc61298b804?key=card",
      url: deal("hotel-des-indes-verblijf-3-dagen-in-luxe-5-hotel-in-hartje-centrum"),
      includes: ["Kamerupgrade", "Dagelijks luxe ontbijtbuffet", "Welkomstdrankje", "Late check-out"],
      discount: "-54%",
      price: "€379",
      original: "€830",
      priceFor: "2 personen, 2 nachten",
    },
    {
      hotelName: "WestCord Fashion Hotel Amsterdam",
      stars: 4,
      place: "Amsterdam",
      packageTitle: "3-daags verblijf in een 4*-hotel met skybar",
      line: "Vanaf €279 voor 2 personen",
      image: "https://asset.vialuxury.com/assets/a0943077-0b0f-4022-96ec-eda45927e263?key=card",
      secondImage: "https://asset.vialuxury.com/assets/cdb4a7a3-078c-4c90-ac4b-cbec6e7452b6?key=card",
      url: deal("fashion-hotel-amsterdam-3-daags-verblijf-in-een-4-hotel-met-wellness-en-sky-bar-met-panoramisch-uitzicht"),
      includes: ["Dagelijks ontbijtbuffet", "Gebruik zwembad", "Wellness & Fitness", "Late check-out"],
      discount: "-49%",
      price: "€279",
      original: "€543",
      priceFor: "2 personen, 2 nachten",
    },
  ],
} satisfies Props;
