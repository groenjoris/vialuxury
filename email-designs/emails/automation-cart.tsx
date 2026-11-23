import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { BeigeBand, cardGap, crmCss, DealRow, FeaturedDeal, type GuestRating, GuestRatingSection, groupGap, type RowDeal, s, ServiceSection } from "../components/crm";
import { desIndes, dePlesman, voco } from "../lib/crmDeals";
import { font, newsletter } from "../components/theme";

// Automationflow fl011 "abandoned cart" — drie mails uit één component.
// Bron: "Automations in kaart.xlsx", tabblad Automation per variant, kolommen P, Q en R.
// Secties in de volgorde van de sheet:
//   S1 Header (logo) → Kop → Intro → S17 Achtergelaten arrangement (het winkelmandje) →
//   S21 Gastenoordeel (alleen mail 3) → S4 Hoteldeals (mail 2 en 3, twee alternatieven) →
//   S15 Servicesectie (alleen mail 1) → S13 Footer.
// De secties staan op banden over de hele breedte. De banden met dealkaarten blijven wit; beige is
// voor de secties zonder kaarten, zodat die zich visueel onderscheiden.
// De bovenste kaart van een mail is altijd de grote kaart (foto boven de tekst), alle kaarten
// daaronder zijn dealrijen (foto links). Hier is dat het winkelmandje, dus de alternatieven zijn rijen.
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
  /** S15: de serviceregel (alleen mail 1). */
  service?: boolean;
};

export default function AutomationCart({ recipientEmail, preheader, heading, intro, cart, guestRating, alternatives, service }: Props) {
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
          <Section className="m-pad" style={{ padding: "36px 32px 28px" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>{heading}</Heading>
            <Text style={{ ...s.body, margin: "12px 0 0" }}>{intro}</Text>
          </Section>
        </Container>

        {/* S17 Achtergelaten arrangement: het winkelmandje met de knop om af te ronden */}
        <BeigeBand white>
          <FeaturedDeal deal={cart} cta="Rond je boeking af" />
        </BeigeBand>

        {/* S21 Gastenoordeel */}
        {guestRating && (
          <BeigeBand>
            <GuestRatingSection hotelName={cart.hotelName} rating={guestRating} />
          </BeigeBand>
        )}

        {/* S4 Hoteldeals: vergelijkbare arrangementen als alternatief */}
        {alternatives && alternatives.length > 0 && (
          <BeigeBand white>
            {alternatives.map((d, i) => (
              <DealRow key={d.url} deal={d} top={i ? groupGap : cardGap} />
            ))}
          </BeigeBand>
        )}

        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* S15 Servicesectie */}
          <Section className="m-pad" style={{ padding: service ? "36px 32px 40px" : "0 32px 40px" }}>
            {service && <ServiceSection />}
          </Section>
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
  preheader: "Rond je boeking af wanneer het jou uitkomt.",
  heading: "Je bent er bijna",
  intro: `Je was bijna klaar met je boeking voor ${HOTEL}. We hebben alles voor je bewaard, zodat je zo verder kunt.`,
  cart,
  service: true,
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
