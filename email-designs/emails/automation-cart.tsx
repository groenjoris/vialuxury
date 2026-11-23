import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { crmCss, CrmHelp, DealList, FeaturedDeal, type GuestRating, GuestRatingSection, type RowDeal, s } from "../components/crm";
import { desIndes, dePlesman, voco } from "../lib/crmDeals";
import { font, newsletter } from "../components/theme";

// Automationflow fl011 "abandoned cart" — drie mails uit één component.
// Bron: "Automations in kaart.xlsx", tabblad Automation per variant, kolommen P, Q en R.
// Secties in de volgorde van de sheet:
//   S1 Header (logo) → Kop → Intro → S17 Achtergelaten arrangement (het winkelmandje) →
//   S21 Gastenoordeel (alleen mail 3) → S4 Hoteldeals (mail 2 en 3, twee alternatieven) →
//   S15 Servicesectie (de vaste hulplijn onderaan elke mail) → S13 Footer.
// Mergevelden in de teksten: [hotelnaam], [aankomstdatum], [nachten], [personen]. Hier ingevuld
// met voorbeelddata uit deals.json, zodat het ontwerp leesbaar is; in Klaviyo worden het merge tags.

type Props = {
  recipientEmail: string;
  preheader: string;
  /** Kop (rij 5) en intro (rij 6) van de sheet. */
  heading: string;
  intro: string;
  /** S17: het achtergelaten winkelmandje, met datums, nachten, personen en de prijs. */
  cart: RowDeal & { hotelName: string };
  /** S21: gemiddelde score en één korte review (mail 3). */
  guestRating?: GuestRating;
  /** S4: twee vergelijkbare arrangementen (mail 2 en 3). */
  alternatives?: RowDeal[];
};

export default function AutomationCart({ recipientEmail, preheader, heading, intro, cart, guestRating, alternatives }: Props) {
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

          {/* S17 Achtergelaten arrangement: het winkelmandje met de knop om af te ronden */}
          <Section className="m-pad" style={{ padding: "24px 32px 0" }}>
            <Text style={s.kop}>Je winkelmandje</Text>
            <FeaturedDeal deal={cart} cta="Rond je boeking af" />
          </Section>

          {/* S21 Gastenoordeel */}
          {guestRating && (
            <Section className="m-pad" style={{ padding: "40px 32px 0" }}>
              <GuestRatingSection hotelName={cart.hotelName} rating={guestRating} />
            </Section>
          )}

          {/* S4 Hoteldeals: vergelijkbare arrangementen als alternatief */}
          {alternatives && alternatives.length > 0 && (
            <Section className="m-pad" style={{ padding: "40px 32px 0" }}>
              <Text style={s.kop}>Vergelijkbare arrangementen</Text>
              <DealList deals={alternatives} />
            </Section>
          )}

          {/* S15 Servicesectie: de vaste hulplijn */}
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
  line: undefined,
  lines: ["20 november · 2 nachten · 2 personen"],
  url: `${desIndes.url}?checkin=2026-11-20&adults=2`,
};
const alternatives = [voco, dePlesman];

/** v01_tf021_fl011_nl-NL_1_abandoned_cart — 1 uur na het verlaten van het winkelmandje. */
export const cart1Props = {
  recipientEmail: "sanne.devries@example.com",
  preheader: "Rond je boeking af wanneer het jou uitkomt.",
  heading: "Je bent er bijna",
  intro: `Je was bijna klaar met je boeking voor ${HOTEL}. We hebben alles voor je bewaard, zodat je zo verder kunt.`,
  cart,
} satisfies Props;

/** v01_tf022_fl011_nl-NL_2_abandoned_cart — 2 dagen na het verlaten van het winkelmandje. */
export const cart2Props = {
  recipientEmail: "sanne.devries@example.com",
  preheader: `Rond je boeking voor ${HOTEL} af.`,
  heading: "Kijk of je data nog vrij zijn",
  intro: `Populaire data raken sneller vol. Rond je boeking af, dan weet je zeker dat je verblijf in ${HOTEL} geregeld is.`,
  cart,
  alternatives,
} satisfies Props;

/** v01_tf023_fl011_nl-NL_3_abandoned_cart — 3 dagen na het verlaten van het winkelmandje. */
export const cart3Props = {
  recipientEmail: "sanne.devries@example.com",
  preheader: "Dit vonden andere gasten.",
  heading: "Dit vonden andere gasten",
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
