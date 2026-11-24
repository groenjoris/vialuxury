import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { CrmHelp, s } from "../components/crm";
import { AutomationDealRow, AutomationFeaturedDeal, AutomationLetter, automationCss, BrandSection, cardGap } from "../components/automation";
import { type AutomationDeal } from "../lib/automationDeals";
import { lauswolt, steenenburg, vanOys } from "../lib/automationDeals";
import { font, newsletter } from "../components/theme";

// Automationflow fl012 "abandoned browse" — drie mails uit één component.
// Bron: "Automations in kaart.xlsx", tabblad Automation per variant, kolommen M, N en O.
// Secties in de volgorde van de sheet:
//   S1 Header (logo) → Kop → Intro → S17 Achtergelaten arrangement (het bekeken arrangement:
//   foto, hotelnaam, plaats, prijs en wat er inbegrepen is) → S4 Hoteldeals (twee alternatieven) →
//   S6 Merksectie (alleen mail 2) → S13 Footer.
// Opening per soort mail, zoals bij de twee winkelmandjemails van het CRM. Mail 1 en 2 gaan over
// het arrangement dat de ontvanger zelf bekeek en hebben één ding te doen: die beginnen direct met
// de kop en de intro. Mail 3 gaat over alternatieven en is een brief van Yvette. De kop uit de
// sheet staat direct boven het blok waar hij bij hoort en elke mail eindigt met de hulplijn.
// Mergevelden: [voornaam], [hotelnaam] en [plaats], hier ingevuld met voorbeelddata.

type Props = {
  recipientEmail: string;
  preheader: string;
  /** Leeg → "Beste gast,". */
  firstName?: string;
  heading: string;
  intro: string;
  /** Waar de kop staat: boven het bekeken arrangement of boven de alternatieven. */
  headingAt?: "viewed" | "alternatives";
  /** "direct": kop en intro bovenaan (mail 1 en 2). "brief": aanhef, intro en de ondertekening
   *  van Yvette (mail 3, alternatieven). */
  opening?: "direct" | "brief";
  /** S17: het bekeken arrangement, met prijs en inclusies. */
  viewed: AutomationDeal & { hotelName: string };
  /** S4: twee vergelijkbare arrangementen in dezelfde sfeer. */
  alternatives: AutomationDeal[];
  /** S6: waarom ViaLuxury (mail 2). */
  brand?: string;
};

export default function AutomationBrowse({ recipientEmail, preheader, firstName, heading, intro, headingAt = "viewed", opening = "direct", viewed, alternatives, brand }: Props) {
  const c = newsletter.light;

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{automationCss}</style>
      </Head>
      <Preview>{preheader}</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader />
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Opening: direct de kop met de intro, of de brief met de ondertekening */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            {opening === "brief" ? (
              <AutomationLetter firstName={firstName}>{intro}</AutomationLetter>
            ) : (
              <>
                <Heading as="h1" className="m-h1" style={s.h1}>{heading}</Heading>
                <Text style={{ ...s.body, margin: "12px 0 0" }}>{intro}</Text>
              </>
            )}
          </Section>

          {/* S17 Achtergelaten arrangement: het bekeken arrangement */}
          <Section className="m-pad" style={{ padding: opening === "brief" ? "40px 32px 0" : "24px 32px 0" }}>
            <AutomationFeaturedDeal deal={viewed} cta="Bekijk arrangement" />
          </Section>

          {/* S4 Hoteldeals: vergelijkbare arrangementen als alternatief */}
          <Section className="m-pad" style={{ padding: "44px 32px 0" }}>
            {opening === "brief" && headingAt === "alternatives" && <Heading as="h1" className="m-h1" style={s.h1}>{heading}</Heading>}
            {alternatives.map((d, i) => (
              <AutomationDealRow key={d.url} deal={d} top={i ? cardGap : undefined} />
            ))}
          </Section>

          {/* S6 Merksectie */}
          {brand && (
            <Section className="m-pad" style={{ padding: "40px 32px 0" }}>
              <BrandSection>{brand}</BrandSection>
            </Section>
          )}

          {/* Hulplijn */}
          <CrmHelp top="36px" />
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
const viewed: AutomationDeal & { hotelName: string } = { ...lauswolt, hotelName: HOTEL, line: undefined };
const alternatives = [vanOys, steenenburg];
const base = { recipientEmail: "sanne.devries@example.com", firstName: "Sanne", viewed, alternatives };

/** v01_tf025_fl012_nl-NL_1_abandoned_browse — 2 uur na het bekijken. */
export const browse1Props = {
  ...base,
  preheader: "Nog steeds zin in dit verblijf?",
  heading: "Nog aan het twijfelen?",
  intro: `Je bekeek net ${HOTEL} in ${PLAATS}. Een mooie keuze. Het arrangement staat hieronder nog even voor je klaar.`,
} satisfies Props;

/** v01_tf026_fl012_nl-NL_2_abandoned_browse — 1 dag na het bekijken. */
export const browse2Props = {
  ...base,
  preheader: "Dit maakt het verblijf bijzonder.",
  heading: `Dit maakt ${HOTEL} bijzonder`,
  intro: `Gisteren bekeek je ${HOTEL}. Bij dit arrangement is al veel inbegrepen, zodat jij alleen nog hoeft te genieten.`,
  brand: "Bij ViaLuxury selecteren we elk hotel zelf en stellen we arrangementen samen waarin alles al geregeld is. Jij boekt één keer en hoeft daarna alleen nog te genieten.",
} satisfies Props;

/** v01_tf027_fl012_nl-NL_3_abandoned_browse — 2 dagen na het bekijken. */
export const browse3Props = {
  ...base,
  // Letterlijk uit de sheet. Let op: de sheet zegt drie, maar deze template heeft twee
  // dealplekken (rij 20 Hoteldeal 3 is leeg voor deze flow).
  preheader: "Drie alternatieven in dezelfde sfeer.",
  heading: "Nog niet het juiste?",
  headingAt: "alternatives" as const,
  opening: "brief" as const,
  intro: `Twijfel je nog over ${HOTEL}? Dit zijn arrangementen in dezelfde sfeer, misschien zit jouw verblijf ertussen.`,
} satisfies Props;

AutomationBrowse.PreviewProps = browse1Props;
