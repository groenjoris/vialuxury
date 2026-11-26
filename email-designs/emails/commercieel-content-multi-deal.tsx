import { Body, Container, Head, Heading, Html, Preview, Section } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { BeigeBand, CampaignOpening, QuickSearch, commercieelCss, crmCss, FeaturedDeal, Letter, type OpeningVariant, PrimaryButton, type RowDeal, s, SecondaryButton, site } from "../components/crm";
import { baseUrl, font, newsletter } from "../components/theme";

// Commerciële mail 1: Content (Multi-deal). Meerdere deals rond één thema of selectie, hier
// kerstmarkten. Lijkt op de themamail uit het CRM (die volgt op gedrag op de site), maar is
// commerciëler. De mail opent met een sfeerfoto met de campagnetitel ("Winter Wonderweken") en een
// knop, in vier varianten (`CampaignOpening`: Native 1, Native 2, Header-titel, Titel op foto; die
// laatste met een ronde sticker met de vanafprijs). Daarna een korte brief (aanhef, één alinea) met de
// knop "Bekijk aanbiedingen" eronder, de titel van de lijst ("Hotels bij de mooiste kerstmarkten")
// direct boven vier deals als gridview-kaart (foto boven, tekst eronder; geen listview), en onder de lijst de knop naar alle arrangementen van het thema. De
// arrangementen zijn de gewone arrangementen; alleen de dealtitel en de foto zijn geladen met de
// kerstmarkt in de buurt.
// Onderwerp: "Winter Wonderweken: slapen bij de mooiste kerstmarkten"

type Props = {
  /** Opzet van de opening (schakelaar in de preview). */
  variant?: OpeningVariant;
  recipientEmail: string;
  /** Leeg → "Beste gast,". */
  firstName?: string;
  /** Sfeerfoto van het thema. */
  hero: string;
  heroAlt: string;
  /** Campagnetitel. */
  title: string;
  /** Alinea van de brief. */
  intro: string;
  /** Titel direct boven de lijst. */
  listTitle: string;
  /** Laagste vanafprijs van de lijst, op de sticker van de variant "Titel op foto". */
  fromPrice: string;
  /** Knop onder de lijst, naar alle arrangementen van het thema. */
  allLabel: string;
  deals: RowDeal[];
};

export default function CommercieelContentMultiDeal({ variant = "native-1", recipientEmail, firstName, hero, heroAlt, title, intro, listTitle, fromPrice, allLabel, deals }: Props) {
  const c = newsletter.light;
  const ctaUrl = `${site}/first-release/search`;
  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss + commercieelCss}</style>
      </Head>
      <Preview>Glühwein, lichtjes en een hotel om de hoek.</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader pad={32} title={variant === "header-titel" ? title : undefined} />
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          <CampaignOpening variant={variant} hero={hero} heroAlt={heroAlt} title={title} cta="Bekijk aanbiedingen" href={ctaUrl} sticker={{ small: "vanaf", big: fromPrice }} />

          {/* De brief: aanhef, één alinea, en direct eronder een knop naar het thema */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Letter firstName={firstName}>{intro}</Letter>
            <Section style={{ marginTop: "20px" }}>
              <PrimaryButton href={ctaUrl}>Bekijk aanbiedingen</PrimaryButton>
            </Section>
          </Section>

          {/* De titel van de lijst staat er direct boven; vier deals onder elkaar */}
          <Section className="m-pad" style={{ padding: "40px 32px 0" }}>
            <Heading as="h2" className="m-h1" style={s.h1}>{listTitle}</Heading>
            {/* Gridview-kaarten onder elkaar (foto boven, tekst eronder), op desktop en mobiel */}
            {deals.map((d, i) => (
              <Section key={d.url + i} style={{ marginTop: i ? "12px" : 0 }}><FeaturedDeal deal={d} /></Section>
            ))}
            {/* Onder de lijst: naar alle arrangementen van het thema */}
            <Section style={{ marginTop: "24px" }}>
              <SecondaryButton href={ctaUrl} dark>{allLabel}</SecondaryButton>
            </Section>
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
  fromPrice: "€239",
  allLabel: "Bekijk alle winterarrangementen",
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
      // Plaatshouder: van dit hotel is geen foto in het prototype
      image2: "https://asset.vialuxury.com/assets/bba340c3-3e92-44be-befd-0023753156cf?key=card",
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
      // Plaatshouder: van dit hotel is geen foto in het prototype
      image2: "https://asset.vialuxury.com/assets/04699185-f5de-473c-8e48-baf4fbb9e703?key=card",
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
