import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmHeader from "../components/CrmHeader";
import { s } from "../components/crm";
import { AutomationDealRow, AutomationFeaturedDeal, AutomationLetter, automationCss, BrandSection, cardGap, AutomationFooter } from "../components/automation";
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
  headingAt?: "top" | "viewed" | "alternatives";
  /** "direct": kop en intro bovenaan (mail 1 en 2). "brief": aanhef, intro en de ondertekening
   *  van Yvette (mail 3, alternatieven). */
  opening?: "direct" | "brief";
  /** S17: het bekeken arrangement, met prijs en inclusies. */
  viewed: AutomationDeal & { hotelName: string };
  /** S4: twee vergelijkbare arrangementen in dezelfde sfeer. */
  alternatives: AutomationDeal[];
  /** Titel boven de alternatieven. */
  alternativesTitle?: string;
  /** Subtitel boven het bekeken arrangement. */
  viewedTitle?: string;
  /** Zet het bekeken arrangement onderaan als dealrij, in de opzet van crm-winkelmandje-2-dagen.
   *  De alternatieven staan dan bovenaan, de eerste als grote kaart. */
  viewedAtBottom?: boolean;
  /** Algemene groet onderin het merkblok. */
  brandGreeting?: string;
  /** Tekstlink onder het merkblok. */
  footerLink?: { href: string; label: string };
  /** S6: waarom ViaLuxury (mail 2). */
  brand?: string;
};

export default function AutomationBrowse({ recipientEmail, preheader, firstName, heading, intro, headingAt = "viewed", opening = "direct", viewed, viewedTitle, viewedAtBottom, alternatives, alternativesTitle, brand, brandGreeting, footerLink }: Props) {
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
            {(headingAt === "top" || opening !== "brief") && (
              <Heading as="h1" className="m-h1" style={{ ...s.h1, marginBottom: headingAt === "top" ? "16px" : undefined }}>{heading}</Heading>
            )}
            {opening === "brief" ? (
              <AutomationLetter firstName={firstName}>{intro}</AutomationLetter>
            ) : (
              <Text style={{ ...s.body, margin: headingAt === "top" ? 0 : "12px 0 0" }}>{intro}</Text>
            )}
          </Section>

          {/* S17 Achtergelaten arrangement: het bekeken arrangement */}
          {!viewedAtBottom && (
            <Section className="m-pad" style={{ padding: opening === "brief" ? "40px 32px 0" : "24px 32px 0" }}>
              {viewedTitle && <Text style={{ ...s.kop, marginBottom: "12px" }}>{viewedTitle}</Text>}
              <AutomationFeaturedDeal deal={viewed} cta="Bekijk arrangement" />
            </Section>
          )}

          {/* S4 Hoteldeals: vergelijkbare arrangementen als alternatief. Staat het bekeken
              arrangement onderaan, dan is de eerste alternatief de grote kaart. */}
          <Section className="m-pad" style={{ padding: viewedAtBottom ? (opening === "brief" ? "40px 32px 0" : "24px 32px 0") : "44px 32px 0" }}>
            {opening === "brief" && headingAt === "alternatives" && <Heading as="h1" className="m-h1" style={s.h1}>{heading}</Heading>}
            {alternativesTitle && <Heading as="h2" className="m-h1" style={s.h1}>{alternativesTitle}</Heading>}
            {viewedAtBottom ? (
              <>
                <AutomationFeaturedDeal deal={alternatives[0]!} cta="Bekijk arrangement" />
                {alternatives.slice(1).map((d) => (
                  <AutomationDealRow key={d.url} deal={d} top={cardGap} />
                ))}
              </>
            ) : (
              alternatives.map((d, i) => (
                <AutomationDealRow key={d.url} deal={d} top={i ? cardGap : undefined} />
              ))
            )}
          </Section>

          {/* Het bekeken arrangement onderaan, als kleiner hotelblok */}
          {viewedAtBottom && (
            <Section className="m-pad" style={{ padding: "44px 32px 0" }}>
              {viewedTitle && <Text style={{ ...s.kop, marginBottom: "12px" }}>{viewedTitle}</Text>}
              <AutomationDealRow deal={viewed} />
            </Section>
          )}

        </Container>

        {/* S6 Merksectie: een merkblok op een beige band, met de groet erin */}
        {brand && <BrandSection greeting={brandGreeting} link={footerLink}>{brand}</BrandSection>}

        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Witruimte tussen de inhoud en de footer */}
          <Section style={{ height: "44px", lineHeight: "44px", fontSize: 0 }}>&nbsp;</Section>
        </Container>
        <AutomationFooter recipientEmail={recipientEmail} reason="omdat je je hebt aangemeld voor de nieuwsbrief van ViaLuxury" />
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
  // Feedback 24-11-2026: kop met de voornaam bovenaan, daaronder de brief. Twee varianten,
  // zie browse1ZonderNaamProps.
  heading: `${base.firstName}, dit vonden we voor jou`,
  headingAt: "top" as const,
  // De voornaam staat in de kop, dus geen aanhef eronder.
  opening: "direct" as const,
  intro: `Je bekeek net ${HOTEL}. Een mooie keuze! We hebben het voor je klaargezet.`,
  alternativesTitle: "Anderen bekeken ook",
} satisfies Props;

/** Variant voor als de voornaam niet bekend is: de kop en de aanhef zonder naam. */
export const browse1ZonderNaamProps = {
  ...browse1Props,
  firstName: undefined,
  heading: "Dit vonden we voor jou",
} satisfies Props;

/** v01_tf026_fl012_nl-NL_2_abandoned_browse — 1 dag na het bekijken. */
export const browse2Props = {
  ...base,
  preheader: "Dit maakt het verblijf bijzonder.",
  // Feedback 24-11-2026: kop bovenaan, daaronder de brief. Het bekeken arrangement krijgt een
  // subtitel, het merkblok staat op een beige band met een groet en daaronder een tekstlink.
  heading: `Dit maakt ${HOTEL} bijzonder`,
  headingAt: "top" as const,
  opening: "brief" as const,
  intro: "Er is al veel inbegrepen, dus jij hoeft alleen te genieten. Vragen? We denken graag mee.",
  viewedTitle: "Door jou bekeken:",
  alternativesTitle: "Anderen bekeken ook",
  brand: "Bij ViaLuxury selecteren we elk hotel zelf en stellen we arrangementen samen waarin alles al geregeld is. Jij boekt één keer en hoeft daarna alleen nog te genieten.",
  brandGreeting: "Groetjes, ViaLuxury team",
  footerLink: { href: "https://www.vialuxury.com/nl-NL/", label: "Bekijk al onze arrangementen" },
} satisfies Props;

/** v01_tf027_fl012_nl-NL_3_abandoned_browse — 2 dagen na het bekijken. */
export const browse3Props = {
  ...base,
  // Letterlijk uit de sheet. Let op: de sheet zegt drie, maar deze template heeft twee
  // dealplekken (rij 20 Hoteldeal 3 is leeg voor deze flow).
  preheader: "Drie alternatieven in dezelfde sfeer.",
  // Feedback 24-11-2026: kop met de voornaam bovenaan, daaronder de brief. De alternatieven staan
  // bovenaan (de eerste als grote kaart) en het bekeken arrangement onderaan als dealrij, de opzet
  // van crm-winkelmandje-2-dagen. Twee varianten, zie browse3ZonderNaamProps.
  heading: `${base.firstName}, misschien past deze jou nog beter`,
  headingAt: "top" as const,
  // De voornaam staat in de kop, dus geen aanhef eronder.
  opening: "direct" as const,
  intro: `Gasten die interesse hadden in ${HOTEL}, boekten vaak ook de volgende deals. Misschien interessant voor jou!`,
  viewedTitle: "Door jou bekeken",
  viewedAtBottom: true,
} satisfies Props;

/** Variant voor als de voornaam niet bekend is: de kop en de aanhef zonder naam. */
export const browse3ZonderNaamProps = {
  ...browse3Props,
  firstName: undefined,
  heading: "Misschien past deze jou nog beter",
} satisfies Props;

AutomationBrowse.PreviewProps = browse1Props;
