import { Body, Container, Head, Heading, Html, Img, Preview, Section } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader, { type HeaderVariant } from "../components/CrmHeader";
import { BeigeBand, QuickSearch, cardGap, crmCss, DealRow, Letter, type RowDeal, s, site } from "../components/crm";
import { baseUrl, font, newsletter } from "../components/theme";

// Commerciële mail 1: Content (Multi-deal). Meerdere deals rond één thema of selectie, hier
// kerstmarkten. Lijkt op de themamail uit het CRM (die volgt op gedrag op de site), maar is
// commerciëler: de mail opent met een sfeerfoto over de hele breedte, daaronder de campagnetitel
// ("Winter Wonderweken") en een korte brief (aanhef, één alinea). Dan de titel van
// de lijst ("Hotels bij de mooiste kerstmarkten") direct boven vier dealrijen. De arrangementen
// zijn de gewone arrangementen; alleen de dealtitel en de foto zijn geladen met de kerstmarkt in
// de buurt. Zelfde regels als de CRM-mails (zie components/crm.tsx).
// Onderwerp: "Winter Wonderweken: slapen bij de mooiste kerstmarkten"

type Props = {
  /** Headervariant (schakelaar in de preview, zie CrmHeader); in variant 3 staat de titel in de header. */
  header?: HeaderVariant;
  recipientEmail: string;
  /** Leeg → "Beste gast,". */
  firstName?: string;
  /** Sfeerfoto van het thema, over de hele breedte. */
  hero: string;
  heroAlt: string;
  /** Campagnetitel onder de foto. */
  title: string;
  /** Alinea van de brief. */
  intro: string;
  /** Titel direct boven de lijst. */
  listTitle: string;
  deals: RowDeal[];
};

export default function CommercieelContentMultiDeal({ header, recipientEmail, firstName, hero, heroAlt, title, intro, listTitle, deals }: Props) {
  const c = newsletter.light;
  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>Glühwein, lichtjes en een hotel om de hoek.</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader variant={header} title={header === 3 ? title : undefined} />
        {/* Sfeerfoto van het thema direct onder de header, over de hele breedte van de mail (buiten de <Container>) */}
        <Img src={hero} alt={heroAlt} width="700" height="394" style={{ display: "block", width: "100%", height: "394px", objectFit: "cover" }} />
        <Container style={{ width: "100%", maxWidth: "626px" }}>

          {/* Campagnetitel en de brief: aanhef, één alinea */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            {header !== 3 && <Heading as="h1" className="m-h1" style={s.h1}>{title}</Heading>}
            <Section style={{ marginTop: header === 3 ? 0 : "16px" }}>
              <Letter firstName={firstName}>{intro}</Letter>
            </Section>
          </Section>

          {/* De titel van de lijst staat er direct boven; vier dealrijen onder elkaar */}
          <Section className="m-pad" style={{ padding: "40px 32px 0" }}>
            <Heading as="h2" className="m-h1" style={s.h1}>{listTitle}</Heading>
            {deals.map((d, i) => (
              <DealRow key={d.url + i} deal={d} top={i ? cardGap : "12px"} />
            ))}
          </Section>

        </Container>

        {/* Snel zoeken op een beige band over de hele breedte */}
        <BeigeBand top="40px">
          <QuickSearch />
        </BeigeBand>

        <CrmFooter recipientEmail={recipientEmail} reason="omdat je je hebt aangemeld voor onze nieuwsbrief" help={2} quote />
      </Body>
    </Html>
  );
}

const photo = (name: string) => `${baseUrl}/images/mail/commercieel/${name}.jpg`;

// Voorbeelddata. voco® The Hague is een echt arrangement uit deals.json (link naar de R1-dealpagina);
// de andere drie staan niet in het prototype: prijzen en inclusies zijn voorbeelden en de knop gaat
// naar de R1-zoekpagina. Alleen de dealtitel en de foto verwijzen naar de kerstmarkt.
CommercieelContentMultiDeal.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  hero: photo("kerstmarkt-hero"),
  heroAlt: "Vrienden proosten met glühwein op een verlichte kerstmarkt",
  title: "Winter Wonderweken",
  intro:
    "De dagen worden korter en de lichtjes gaan aan. Tijd voor glühwein, de geur van gebrande amandelen en slenteren langs de kraampjes tot je wangen rood zijn. En daarna niet meer naar huis rijden, maar een paar straten verderop je hotelkamer in. We zochten vier hotels uit bij de mooiste kerstmarkten van dit jaar.",
  listTitle: "Hotels bij de mooiste kerstmarkten",
  deals: [
    {
      hotelName: "voco® The Hague",
      stars: 4,
      place: "Den Haag",
      packageTitle: "3 dagen Den Haag, op loopafstand van de Royal Christmas Fair",
      image: photo("kerstmarkt-den-haag"),
      // Twee foto's onder elkaar: de kerstmarkt en het hotel
      image2: "https://asset.vialuxury.com/assets/04007e67-62ca-4ffc-9ecf-a7b932695586?key=card",
      url: `${site}/first-release/deal/voco-the-hague-1-1-gratis-verblijf-in-het-mooiste-hotel-van-nederland`,
      includes: ["Dagelijks ontbijtbuffet", "3-Gangendiner in Ultramarijn", "Welkomstattentie", "Late check-out"],
      discount: "-47%",
      price: "€319",
      original: "€601",
      priceFor: "2 personen, 2 nachten",
    },
    {
      hotelName: "voco® Düsseldorf Seestern",
      stars: 4,
      place: "Düsseldorf",
      packageTitle: "3 dagen Düsseldorf, met de kerstmarkten van de Altstadt en de Kö",
      image: photo("kerstmarkt-dusseldorf"),
      url: `${site}/first-release/search`,
      includes: ["Dagelijks ontbijtbuffet", "Welkomstdrankje", "Gratis parkeren", "Late check-out"],
      discount: "-41%",
      price: "€239",
      original: "€405",
      priceFor: "2 personen, 2 nachten",
    },
    {
      hotelName: "Hotel Valkenburg by Mercure",
      stars: 4,
      place: "Valkenburg",
      packageTitle: "3 dagen Kerststad Valkenburg, met de kerstmarkten in de grotten",
      image: photo("kerstmarkt-valkenburg"),
      url: `${site}/first-release/search`,
      includes: ["Dagelijks ontbijtbuffet", "3-Gangendiner", "Welkomstdrankje", "Gratis parkeren"],
      discount: "-44%",
      price: "€269",
      original: "€480",
      priceFor: "2 personen, 2 nachten",
    },
    {
      hotelName: "Hotel Royal Beaulaincourt",
      stars: 4,
      place: "Béthune, Frankrijk",
      packageTitle: "3 dagen Béthune, bij de Cité de Noël rond het oude belfort",
      image: photo("kerstmarkt-bethune"),
      image2: `${baseUrl}/images/vakanties/001/beaulaincourt-b1.jpg`,
      url: `${site}/first-release/search`,
      includes: ["Dagelijks ontbijt", "3-Gangendiner (dag van aankomst)", "Welkomstbubbels", "Late check-out tot 15:00 uur"],
      discount: "-39%",
      price: "€289",
      original: "€474",
      priceFor: "2 personen, 2 nachten",
    },
  ],
} satisfies Props;
