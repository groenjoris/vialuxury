import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { BrandSection, cardGap, crmCss, DealRow, FeaturedDeal, type RowDeal, s } from "../components/crm";
import { lauswolt, steenenburg, vanOys } from "../lib/crmDeals";
import { font, newsletter } from "../components/theme";

// Automationflow fl012 "abandoned browse" — drie mails uit één component.
// Bron: "Automations in kaart.xlsx", tabblad Automation per variant, kolommen M, N en O.
// Secties in de volgorde van de sheet:
//   S1 Header (logo) → Kop → Intro → S17 Achtergelaten arrangement (het bekeken arrangement:
//   foto, hotelnaam, plaats, prijs en wat er inbegrepen is) → S4 Hoteldeals (twee alternatieven) →
//   S6 Merksectie (alleen mail 2) → S13 Footer.
// De bovenste kaart van een mail is altijd de grote kaart (foto boven de tekst), alle kaarten
// daaronder zijn dealrijen (foto links). Hier is dat het bekeken arrangement.
// Mergevelden in de teksten: [hotelnaam] en [plaats], hier ingevuld met voorbeelddata.

type Props = {
  recipientEmail: string;
  preheader: string;
  heading: string;
  intro: string;
  /** S17: het bekeken arrangement, met prijs en inclusies. */
  viewed: RowDeal & { hotelName: string };
  /** S4: twee vergelijkbare arrangementen in dezelfde sfeer. */
  alternatives: RowDeal[];
  /** S6: waarom ViaLuxury (mail 2). */
  brand?: string;
};

export default function AutomationBrowse({ recipientEmail, preheader, heading, intro, viewed, alternatives, brand }: Props) {
  const c = newsletter.light;

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>{preheader}</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader />
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Kop en intro */}
          <Section className="m-pad" style={{ padding: "36px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>{heading}</Heading>
            <Text style={{ ...s.body, margin: "12px 0 0" }}>{intro}</Text>
          </Section>

          {/* S17 Achtergelaten arrangement: het bekeken arrangement */}
          <Section className="m-pad" style={{ padding: "24px 32px 0" }}>
            <FeaturedDeal deal={viewed} cta="Bekijk arrangement" />
          </Section>

          {/* S4 Hoteldeals: vergelijkbare arrangementen als alternatief */}
          <Section className="m-pad" style={{ padding: "28px 32px 0" }}>
            {alternatives.map((d) => (
              <DealRow key={d.url} deal={d} top={cardGap} />
            ))}
          </Section>

          {/* S6 Merksectie */}
          {brand && (
            <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
              <BrandSection>{brand}</BrandSection>
            </Section>
          )}

          <Section className="m-pad" style={{ padding: "0 32px 40px" }} />
        </Container>
        <CrmFooter recipientEmail={recipientEmail} reason="omdat je je hebt aangemeld voor de nieuwsbrief van ViaLuxury" />
      </Body>
    </Html>
  );
}

// ── Voorbeelddata ──────────────────────────────────────────────────────────────────────────
// Het bekeken arrangement: Landgoed Lauswolt in Beetsterzwaag; de alternatieven zitten in
// dezelfde sfeer (culinair verblijf op een landgoed of kasteel).
const HOTEL = "Landgoed Lauswolt";
const PLAATS = "Beetsterzwaag";
const viewed: RowDeal & { hotelName: string } = { ...lauswolt, hotelName: HOTEL, line: undefined };
const alternatives = [vanOys, steenenburg];

/** v01_tf025_fl012_nl-NL_1_abandoned_browse — 2 uur na het bekijken. */
export const browse1Props = {
  recipientEmail: "sanne.devries@example.com",
  preheader: "Nog steeds zin in dit verblijf?",
  heading: "Nog aan het twijfelen?",
  intro: `Je bekeek net ${HOTEL} in ${PLAATS}. Een mooie keuze. Het arrangement staat hieronder nog even voor je klaar.`,
  viewed,
  alternatives,
} satisfies Props;

/** v01_tf026_fl012_nl-NL_2_abandoned_browse — 1 dag na het bekijken. */
export const browse2Props = {
  recipientEmail: "sanne.devries@example.com",
  preheader: "Dit maakt het verblijf bijzonder.",
  heading: `Dit maakt ${HOTEL} bijzonder`,
  intro: `Gisteren bekeek je ${HOTEL}. Bij dit arrangement is al veel inbegrepen, zodat jij alleen nog hoeft te genieten.`,
  viewed,
  alternatives,
  brand: "Bij ViaLuxury selecteren we elk hotel zelf en stellen we arrangementen samen waarin alles al geregeld is. Jij boekt één keer en hoeft daarna alleen nog te genieten.",
} satisfies Props;

/** v01_tf027_fl012_nl-NL_3_abandoned_browse — 2 dagen na het bekijken. */
export const browse3Props = {
  recipientEmail: "sanne.devries@example.com",
  // Letterlijk uit de sheet. Let op: de sheet zegt drie, maar deze template heeft twee
  // dealplekken (rij 20 Hoteldeal 3 is leeg voor deze flow).
  preheader: "Drie alternatieven in dezelfde sfeer.",
  heading: "Nog niet het juiste?",
  intro: `Twijfel je nog over ${HOTEL}? Dit zijn arrangementen in dezelfde sfeer, misschien zit jouw verblijf ertussen.`,
  viewed,
  alternatives,
} satisfies Props;

AutomationBrowse.PreviewProps = browse1Props;
