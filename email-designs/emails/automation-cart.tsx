import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { cardGap, crmCss, CrmHelp, DealRow, FeaturedDeal, type GuestRating, GuestRatingSection, Letter, type RowDeal, s, ServiceSection } from "../components/crm";
import { desIndes, dePlesman, voco } from "../lib/crmDeals";
import { font, newsletter } from "../components/theme";

// Automationflow fl011 "abandoned cart" — drie mails uit één component.
// Bron: "Automations in kaart.xlsx", tabblad Automation per variant, kolommen P, Q en R.
// Secties in de volgorde van de sheet:
//   S1 Header (logo) → Kop → Intro → S17 Achtergelaten arrangement (het winkelmandje) →
//   S21 Gastenoordeel (alleen mail 3) → S4 Hoteldeals (mail 2 en 3, twee alternatieven) →
//   S15 Servicesectie (alleen mail 1) → S13 Footer.
// Opening per soort mail, zoals bij de twee winkelmandjemails van het CRM. Gaat de mail over iets
// wat de ontvanger zelf heeft laten liggen en is er één ding te doen, dan begint hij direct met de
// kop en de intro (zoals crm-winkelmandje). Gaat de mail over suggesties of een oordeel van
// anderen, dan is het een brief van Yvette (zoals crm-winkelmandje-2-dagen).
// De kop uit de sheet staat als titel direct boven het blok waar hij bij hoort, en elke mail
// eindigt met de hulplijn.
// De bovenste kaart is de grote kaart (foto boven de tekst), alles daaronder een dealrij.
// Mergevelden in de teksten: [voornaam], [hotelnaam], [aankomstdatum], [nachten], [personen].
// Hier ingevuld met voorbeelddata; in Klaviyo worden het merge tags.

type Props = {
  recipientEmail: string;
  preheader: string;
  /** Leeg → "Beste gast,". */
  firstName?: string;
  /** Kop (rij 5) en intro (rij 6) van de sheet. */
  heading: string;
  intro: string;
  /** Waar de kop staat: boven het winkelmandje of boven het gastenoordeel. */
  headingAt?: "cart" | "rating";
  /** "direct": kop en intro bovenaan (mail 1 en 2, één ding te doen). "brief": aanhef, intro en
   *  de ondertekening van Yvette (mail 3, het oordeel van anderen en alternatieven). */
  opening?: "direct" | "brief";
  /** S17: het achtergelaten winkelmandje, met datums, nachten, personen en de prijs. */
  cart: RowDeal & { hotelName: string };
  /** S21: de score met de Trustpilot-sterren en één korte review (mail 3). */
  guestRating?: GuestRating;
  /** S4: twee vergelijkbare arrangementen (mail 2 en 3). */
  alternatives?: RowDeal[];
  /** S15: de serviceregel (alleen mail 1). */
  service?: boolean;
};

export default function AutomationCart({ recipientEmail, preheader, firstName, heading, intro, headingAt = "cart", opening = "direct", cart, guestRating, alternatives, service }: Props) {
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
          {/* Opening: direct de kop met de intro, of de brief met de ondertekening */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            {opening === "brief" ? (
              <Letter firstName={firstName}>{intro}</Letter>
            ) : (
              <>
                <Heading as="h1" className="m-h1" style={s.h1}>{heading}</Heading>
                <Text style={{ ...s.body, margin: "12px 0 0" }}>{intro}</Text>
              </>
            )}
          </Section>

          {/* S17 Achtergelaten arrangement: het winkelmandje met de knop om af te ronden */}
          <Section className="m-pad" style={{ padding: opening === "brief" ? "40px 32px 0" : "24px 32px 0" }}>
            {opening === "brief" && headingAt === "cart" && <Heading as="h1" className="m-h1" style={s.h1}>{heading}</Heading>}
            <FeaturedDeal deal={cart} cta="Rond je boeking af" />
          </Section>

          {/* S21 Gastenoordeel */}
          {guestRating && (
            <Section className="m-pad" style={{ padding: "44px 32px 0" }}>
              {opening === "brief" && headingAt === "rating" && <Heading as="h1" className="m-h1" style={{ ...s.h1, marginBottom: "18px" }}>{heading}</Heading>}
              <GuestRatingSection hotelName={cart.hotelName} rating={guestRating} />
            </Section>
          )}

          {/* S4 Hoteldeals: vergelijkbare arrangementen als alternatief */}
          {alternatives && alternatives.length > 0 && (
            <Section className="m-pad" style={{ padding: "44px 32px 0" }}>
              {alternatives.map((d, i) => (
                <DealRow key={d.url} deal={d} top={i ? cardGap : undefined} />
              ))}
            </Section>
          )}

          {/* S15 Servicesectie */}
          {service && (
            <Section className="m-pad" style={{ padding: "36px 32px 0" }}>
              <ServiceSection />
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
// Het winkelmandje: Hotel Des Indes, 20 november, 2 nachten, 2 personen. De knop en de foto's
// gaan naar de dealpagina met datum en personen vooringevuld (zachte landing).
const HOTEL = "Hotel Des Indes";
const cart: RowDeal & { hotelName: string } = {
  ...desIndes,
  hotelName: HOTEL,
  // De sheet noemt voor het winkelmandje: foto, hotelnaam, aankomstdatum, nachten, personen en
  // de prijs — dus zonder de inclusies en zonder de regel "voor wie de prijs geldt".
  includes: undefined,
  priceFor: undefined,
  line: undefined,
  lines: ["20 november · 2 nachten · 2 personen"],
  url: `${desIndes.url}?checkin=2026-11-20&adults=2`,
};
const alternatives = [voco, dePlesman];

/** v01_tf021_fl011_nl-NL_1_abandoned_cart — 1 uur na het verlaten van het winkelmandje. */
export const cart1Props = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  preheader: "Rond je boeking af wanneer het jou uitkomt.",
  heading: "Je bent er bijna",
  intro: `Je was bijna klaar met je boeking voor ${HOTEL}. We hebben alles voor je bewaard, zodat je zo verder kunt.`,
  cart,
  service: true,
} satisfies Props;

/** v01_tf022_fl011_nl-NL_2_abandoned_cart — 2 dagen na het verlaten van het winkelmandje. */
export const cart2Props = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  preheader: `Rond je boeking voor ${HOTEL} af.`,
  heading: "Kijk of je data nog vrij zijn",
  intro: `Populaire data raken sneller vol. Rond je boeking af, dan weet je zeker dat je verblijf in ${HOTEL} geregeld is.`,
  cart,
  alternatives,
} satisfies Props;

/** v01_tf023_fl011_nl-NL_3_abandoned_cart — 3 dagen na het verlaten van het winkelmandje. */
export const cart3Props = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  preheader: "Dit vonden andere gasten.",
  heading: "Dit vonden andere gasten",
  headingAt: "rating" as const,
  opening: "brief" as const,
  intro: `Twijfel je nog? Lees wat andere gasten van ${HOTEL} vonden, of kies een van de alternatieven.`,
  cart,
  guestRating: {
    average: 4.5,
    label: "4,5 uit 312 reviews",
    review: { text: "Prachtige kamer en een feestelijk diner.", author: "Marieke" },
  },
  alternatives,
} satisfies Props;

AutomationCart.PreviewProps = cart1Props;
