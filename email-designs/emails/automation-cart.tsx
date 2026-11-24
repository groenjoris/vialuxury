import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { CodeBlock, CrmHelp, PrimaryButton, s } from "../components/crm";
import { AutomationDealRow, AutomationFeaturedDeal, AutomationLetter, automationCss, cardGap, type GuestRating, GuestRatingSection, ServiceSection } from "../components/automation";
import { type AutomationDeal } from "../lib/automationDeals";
import { desIndes, dePlesman, voco } from "../lib/automationDeals";
import { font, newsletter } from "../components/theme";

// Automationflow fl011 "abandoned cart" — drie mails uit één component.
// Bron: "Automations in kaart.xlsx", tabblad Automation per variant, kolommen P, Q en R.
// Secties in de volgorde van de sheet:
//   S1 Header (logo) → Kop → Intro → S17 Achtergelaten arrangement (het winkelmandje) →
//   S21 Gastenoordeel (alleen mail 3) → S4 Hoteldeals (mail 2 en 3, twee alternatieven) →
//   S10 Codesectie met de adviesregel (alleen mail 4) → S15 Servicesectie (alleen mail 1) →
//   S13 Footer.
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
  /** Waar de kop staat: boven het winkelmandje, het gastenoordeel of de codesectie. */
  headingAt?: "cart" | "rating" | "code";
  /** "direct": kop en intro bovenaan (mail 2, één ding te doen). "brief": aanhef, intro en de
   *  ondertekening van Yvette (mail 3, het oordeel van anderen en alternatieven).
   *  "winkelmandje": de opzet van crm-winkelmandje — kop, intro, wat er klaarstaat als losse
   *  regels, de knop en daaronder de kaart zonder prijsrij (mail 1). */
  opening?: "direct" | "brief" | "winkelmandje";
  /** S17: het achtergelaten winkelmandje, met datums, nachten, personen en de prijs. */
  cart: AutomationDeal & { hotelName: string };
  /** S21: de score met de Trustpilot-sterren en één korte review (mail 3). */
  guestRating?: GuestRating;
  /** S4: twee vergelijkbare arrangementen (mail 2 en 3). */
  alternatives?: AutomationDeal[];
  /** S10: de kortingscode met de adviesregel eronder (mail 4). Opbouw als in crm-terugkomactie:
   *  het bedrag als kop van de coupon, de code, de geldigheid en "Vul de code in bij het boeken". */
  code?: { code: string; value: string; deadline: string; advice: string };
  /** S15: de serviceregel (alleen mail 1). */
  service?: boolean;
};

export default function AutomationCart({ recipientEmail, preheader, firstName, heading, intro, headingAt = "cart", opening = "direct", cart, guestRating, alternatives, code, service }: Props) {
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

          {/* S17 Achtergelaten arrangement. In de opzet van crm-winkelmandje staat eerst wat er
              klaarstaat als losse regels met de knop eronder, en daarna de kaart zonder prijsrij. */}
          {opening === "winkelmandje" ? (
            <>
              <Section className="m-pad" style={{ padding: "20px 32px 0" }}>
                <Text style={{ ...s.name, margin: 0 }}>
                  {cart.hotelName}
                  {cart.stars ? <span style={{ letterSpacing: "1px", marginLeft: "8px" }}>{"★".repeat(cart.stars)}</span> : null}
                </Text>
                {cart.place && <Text style={{ ...s.muted, margin: "2px 0 0" }}>{cart.place}</Text>}
                {cart.lines?.map((l) => (
                  <Text key={l} style={{ ...s.title, margin: "2px 0 0" }}>{l}</Text>
                ))}
                <Section style={{ marginTop: "20px" }}>
                  <PrimaryButton href={cart.url}>Rond je boeking af</PrimaryButton>
                </Section>
              </Section>
              <Section className="m-pad" style={{ padding: "12px 32px 0" }}>
                <AutomationFeaturedDeal deal={{ ...cart, hotelName: undefined, stars: undefined, place: undefined }} priceRow={false} />
              </Section>
            </>
          ) : (
            <Section className="m-pad" style={{ padding: opening === "brief" ? "40px 32px 0" : "24px 32px 0" }}>
              {opening === "brief" && headingAt === "cart" && <Heading as="h1" className="m-h1" style={s.h1}>{heading}</Heading>}
              <AutomationFeaturedDeal deal={cart} cta="Rond je boeking af" />
            </Section>
          )}

          {/* S21 Gastenoordeel */}
          {guestRating && (
            <Section className="m-pad" style={{ padding: "44px 32px 0" }}>
              {opening === "brief" && headingAt === "rating" && <Heading as="h1" className="m-h1" style={{ ...s.h1, marginBottom: "18px" }}>{heading}</Heading>}
              <GuestRatingSection rating={guestRating} />
            </Section>
          )}

          {/* S4 Hoteldeals: vergelijkbare arrangementen als alternatief */}
          {alternatives && alternatives.length > 0 && (
            <Section className="m-pad" style={{ padding: "44px 32px 0" }}>
              {alternatives.map((d, i) => (
                <AutomationDealRow key={d.url} deal={d} top={i ? cardGap : undefined} />
              ))}
            </Section>
          )}

          {/* S10 Codesectie: de coupon met de adviesregel eronder */}
          {code && (
            <Section className="m-pad" style={{ padding: "44px 32px 0" }}>
              {headingAt === "code" && <Heading as="h1" className="m-h1" style={{ ...s.h1, marginBottom: "20px" }}>{heading}</Heading>}
              <CodeBlock title={`${code.value} cadeau`} code={code.code} label="Jouw unieke code" deadline={code.deadline} />
              <Text style={{ ...s.body, margin: "14px 0 0" }}>{code.advice}</Text>
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
const cart: AutomationDeal & { hotelName: string } = {
  ...desIndes,
  hotelName: HOTEL,
  // De sheet noemt voor het winkelmandje: foto, hotelnaam, aankomstdatum, nachten, personen en
  // de prijs — dus zonder de inclusies en zonder de regel "voor wie de prijs geldt". In mail 1
  // blijft de prijs helemaal weg (feedback 2026-11-24); mail 2, 3 en 4 tonen hem in de prijsrij.
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
  opening: "winkelmandje" as const,
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

/** v01_tf024_fl011_nl-NL_4_abandoned_cart_discount_10euro — 4 dagen na het verlaten van het
 *  winkelmandje, met een unieke code van €10. Code en deadline zijn voorbeelddata. */
export const cart4Props = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  preheader: "Jouw unieke code, geldig tot en met 7 december 2026.",
  heading: "Een extraatje om je te helpen kiezen",
  headingAt: "code" as const,
  opening: "brief" as const,
  intro: `Je verblijf in ${HOTEL} staat nog in je winkelmandje. Om je op weg te helpen krijg je €10 cadeau met jouw unieke code.`,
  cart,
  code: {
    code: "MANDJE10-4XQ7",
    value: "€10",
    deadline: "7 december 2026 23:59 uur",
    advice: `Je code staat klaar voor ${HOTEL}.`,
  },
} satisfies Props;

AutomationCart.PreviewProps = cart1Props;
