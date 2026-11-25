import { Body, Button, Container, Head, Heading, Html, Img, Preview, Section } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { BeigeBand, QuickSearch, cardGap, crmCss, DealRow, Letter, PrimaryButton, type RowDeal, s, SecondaryButton, site } from "../components/crm";
import { baseUrl, font, newsletter } from "../components/theme";

// Commerciële mail 1: Content (Multi-deal). Meerdere deals rond één thema of selectie, hier
// kerstmarkten. Lijkt op de themamail uit het CRM (die volgt op gedrag op de site), maar is
// commerciëler. De mail opent met een sfeerfoto binnen de marges van de header (links gelijk met het
// logo, rechts met het einde van Trustpilot). Vier varianten van die opening (schakelaar in de preview):
// - Native 1: onder de foto een donkergroen vlak (ronde hoeken onderaan) met de campagnetitel in wit
//   ("Winter Wonderweken") en de zwarte knop "Bekijk aanbiedingen".
// - Native 2: dezelfde opzet in een andere kleurstelling: beige vlak, zwarte titel, oranje knop.
// - Header-titel: de titel staat gecentreerd in de header (vierkant logo links); onder de foto alleen
//   een grote, gecentreerde knop.
// - Titel op foto: gewone header; de titel staat groot linksboven op de foto en de zwarte knop linksonder.
// Daarna een korte brief (aanhef, één alinea) en de titel van de lijst ("Hotels bij de mooiste
// kerstmarkten") direct boven vier dealrijen. De arrangementen zijn de gewone arrangementen; alleen
// de dealtitel en de foto zijn geladen met de kerstmarkt in de buurt. Zelfde regels als de CRM-mails.
// Onderwerp: "Winter Wonderweken: slapen bij de mooiste kerstmarkten"

/** Donkergroen uit de huisstijl (--color-green-dark op de website). */
const GREEN = "#00675F";
const BEIGE = "#F4F1EC";

export type ContentVariant = "native-1" | "native-2" | "header-titel" | "foto-titel";

type Props = {
  /** Opzet van de opening (schakelaar in de preview), zie de toelichting bovenaan. */
  variant?: ContentVariant;
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

export default function CommercieelContentMultiDeal({ variant = "native-1", recipientEmail, firstName, hero, heroAlt, title, intro, listTitle, deals }: Props) {
  const c = newsletter.light;
  const inHeader = variant === "header-titel";
  const native2 = variant === "native-2";
  const bigButton = { backgroundColor: c.cta, color: "#FFFFFF", fontFamily: font.body, fontWeight: 700, borderRadius: "6px", textDecoration: "none" };
  const ctaUrl = `${site}/first-release/search`;
  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>Glühwein, lichtjes en een hotel om de hoek.</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader title={inHeader ? title : undefined} />
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Sfeerfoto binnen de marges van de header: links gelijk met het logo, rechts met het einde van
              het Trustpilot-logo (Header-titel: het logo staat tegen de linkerrand) */}
          <Section style={{ padding: inHeader ? "0 24px 0 0" : "0 24px" }}>
            {variant === "foto-titel" ? (
              // Titel op foto: de titel linksboven op de foto, de knop linksonder; een verloop maakt de
              // foto boven en onder iets donkerder zodat de witte tekst leesbaar blijft
              <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={{ width: "100%", height: "325px", borderCollapse: "collapse", backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.45) 100%), url(${hero})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                <tbody>
                  <tr>
                    <td valign="top" style={{ padding: "24px 28px 0", verticalAlign: "top" }}>
                      <Heading as="h1" style={{ ...s.h1, fontSize: "44px", lineHeight: "1.1", color: "#FFFFFF", textShadow: "0 1px 12px rgba(0,0,0,0.45)" }}>{title}</Heading>
                    </td>
                  </tr>
                  <tr>
                    <td valign="bottom" style={{ padding: "0 28px 24px", verticalAlign: "bottom" }}>
                      <SecondaryButton href={ctaUrl} dark>Bekijk aanbiedingen</SecondaryButton>
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <Img src={hero} alt={heroAlt} width={inHeader ? 602 : 578} height="325" style={{ display: "block", width: "100%", height: "325px", objectFit: "cover" }} />
            )}
            {inHeader && (
              // Titel staat al in de header: alleen een grote knop, gecentreerd onder de foto
              <Section style={{ marginTop: "24px", textAlign: "center" }}>
                <Button href={ctaUrl} style={{ ...bigButton, fontSize: "20px", padding: "18px 48px" }}>Bekijk aanbiedingen</Button>
              </Section>
            )}
            {(variant === "native-1" || native2) && (
              // Vlak onder de foto met ronde hoeken aan de onderkant: de campagnetitel en de knop.
              // Native 1: donkergroen (huisstijl), witte titel, zwarte knop. Native 2: beige, zwarte titel, oranje knop.
              <Section style={{ backgroundColor: native2 ? BEIGE : GREEN, padding: "22px 28px 26px", borderRadius: "0 0 14px 14px" }}>
                <Heading as="h1" className="m-h1" style={{ ...s.h1, color: native2 ? c.heading : "#FFFFFF" }}>{title}</Heading>
                <Section style={{ marginTop: "16px" }}>
                  {native2 ? <PrimaryButton href={ctaUrl}>Bekijk aanbiedingen</PrimaryButton> : <SecondaryButton href={ctaUrl} dark>Bekijk aanbiedingen</SecondaryButton>}
                </Section>
              </Section>
            )}
          </Section>

          {/* De brief: aanhef, één alinea */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Letter firstName={firstName}>{intro}</Letter>
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

/** De andere drie openingen van de mail (zie bovenaan). */
export const contentVariantProps = (variant: ContentVariant) => ({ ...CommercieelContentMultiDeal.PreviewProps, variant });
