import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmHeader from "../components/CrmHeader";
import { PrimaryButton, s } from "../components/crm";
import { AutomationCodeBlock, AutomationDealRow, AutomationFeaturedDeal, AutomationLetter, automationCss, automationDarkCss, automationDarkMedia, cardGap, type GuestRating, GuestRatingSection, ServiceSection, AutomationFooter } from "../components/automation";
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
  /** Deze mail heeft een donkere versie: de mail blijft licht en zet zichzelf om zodra de client
   *  donker staat (`true`). Zonder vlag blijft de mail altijd licht. De preview rendert de twee
   *  standen apart: "forced" zet de donkere regels vast aan, `false` laat ze helemaal weg. */
  darkMode?: boolean | "forced";
  recipientEmail: string;
  preheader: string;
  /** Leeg → "Beste gast,". */
  firstName?: string;
  /** Kop (rij 5) en intro (rij 6) van de sheet. */
  heading: string;
  /** Leeg → geen introtekst onder de kop (mail 1). */
  intro?: string;
  /** Waar de kop staat: bovenaan de mail, of boven het winkelmandje, het gastenoordeel of de
   *  codesectie. */
  headingAt?: "top" | "cart" | "rating" | "code";
  /** "direct": kop en intro bovenaan (mail 2, één ding te doen). "brief": aanhef, intro en de
   *  ondertekening van Yvette (mail 3, het oordeel van anderen en alternatieven).
   *  "winkelmandje": de opzet van crm-winkelmandje — kop, intro, wat er klaarstaat als losse
   *  regels, de knop en daaronder de kaart zonder prijsrij (mail 1). */
  opening?: "direct" | "brief" | "winkelmandje";
  /** S17: het achtergelaten winkelmandje, met datums, nachten, personen en de prijs. */
  cart: AutomationDeal & { hotelName: string };
  /** S21: de score met de Trustpilot-sterren en één korte review (mail 3). */
  guestRating?: GuestRating;
  /** Subtitel boven de hotelgegevens in de winkelmandje-opzet (mail 1). */
  cartTitle?: string;
  /** S15: de serviceregel onder het hotelblok (alleen mail 1). */
  service?: boolean;
  /** Zet de codesectie direct onder de introtekst, boven het hotelblok (mail 4). */
  codeFirst?: boolean;
  /** S4: twee vergelijkbare arrangementen (mail 2 en 3), met een eigen titel erboven. */
  alternatives?: AutomationDeal[];
  alternativesTitle?: string;
  /** S10: de kortingscode met de adviesregel eronder (mail 4). Opbouw als in crm-terugkomactie:
   *  het bedrag als kop van de coupon, de code, de geldigheid en "Vul de code in bij het boeken". */
  code?: { code: string; value: string; deadline: string; advice: string };
};

export default function AutomationCart({ recipientEmail, preheader, firstName, heading, intro, headingAt = "cart", opening = "direct", cart, cartTitle, guestRating, alternatives, alternativesTitle, code, codeFirst, service, darkMode }: Props) {
  const c = newsletter.light;

  // De codesectie staat normaal onderaan, in mail 4 direct onder de introtekst.
  const codeSection = code ? (
    <Section className="m-pad" style={{ padding: codeFirst ? "28px 32px 0" : "44px 32px 0" }}>
      {headingAt === "code" && <Heading as="h1" className="m-h1 d-head" style={{ ...s.h1, marginBottom: "20px" }}>{heading}</Heading>}
      <AutomationCodeBlock title={`${code.value} cadeau`} code={code.code} label="Jouw unieke code" deadline={code.deadline} />
      <Text className="d-text" style={{ ...s.body, margin: "14px 0 0" }}>{code.advice}</Text>
    </Section>
  ) : null;

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Heeft de mail een donkere versie, dan zegt dit de client dat de mail het zelf regelt
            en hij er niet zijn eigen kleuren overheen moet gooien. */}
        {darkMode && <meta name="color-scheme" content="light dark" />}
        {darkMode && <meta name="supported-color-schemes" content="light dark" />}
        <style>{automationCss}</style>
        {darkMode === true && <style>{automationDarkMedia}</style>}
        {darkMode === "forced" && <style>{automationDarkCss}</style>}
      </Head>
      <Preview>{preheader}</Preview>
      <Body className="d-bg" style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader />
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Opening: direct de kop met de intro, of de brief met de ondertekening */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            {(headingAt === "top" || opening !== "brief") && (
              <Heading as="h1" className="m-h1 d-head" style={{ ...s.h1, marginBottom: headingAt === "top" ? "16px" : undefined }}>{heading}</Heading>
            )}
            {opening === "brief" ? (
              <AutomationLetter firstName={firstName}>{intro}</AutomationLetter>
            ) : (
              intro && <Text className="d-text" style={{ ...s.body, margin: "12px 0 0" }}>{intro}</Text>
            )}
          </Section>

          {/* S10 Codesectie boven het hotelblok (mail 4) */}
          {codeFirst && codeSection}

          {/* S17 Achtergelaten arrangement. In de opzet van crm-winkelmandje staat eerst wat er
              klaarstaat als losse regels met de knop eronder, en daarna de kaart zonder prijsrij. */}
          {opening === "winkelmandje" ? (
            <>
              <Section className="m-pad" style={{ padding: "20px 32px 0" }}>
                {cartTitle && <Text className="d-head" style={{ ...s.kop, margin: "0 0 10px" }}>{cartTitle}</Text>}
                <Text className="d-text" style={{ ...s.name, margin: 0 }}>
                  {cart.hotelName}
                  {cart.stars ? <span style={{ letterSpacing: "1px", marginLeft: "8px" }}>{"★".repeat(cart.stars)}</span> : null}
                </Text>
                {cart.place && <Text className="d-muted" style={{ ...s.muted, margin: "2px 0 0" }}>{cart.place}</Text>}
                {cart.lines?.map((l) => (
                  <Text key={l} className="d-text" style={{ ...s.title, margin: "2px 0 0" }}>{l}</Text>
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
              {opening === "brief" && headingAt === "cart" && <Heading as="h1" className="m-h1 d-head" style={s.h1}>{heading}</Heading>}
              {/* Het standaard hotelblok: de datumregel hoort bij de winkelmandje-opzet, niet hier. */}
              <AutomationFeaturedDeal deal={{ ...cart, lines: undefined }} cta="Rond je boeking af" />
            </Section>
          )}

          {/* S21 Gastenoordeel */}
          {guestRating && (
            <Section className="m-pad" style={{ padding: "44px 32px 0" }}>
              {opening === "brief" && headingAt === "rating" && <Heading as="h1" className="m-h1 d-head" style={{ ...s.h1, marginBottom: "18px" }}>{heading}</Heading>}
              <GuestRatingSection rating={guestRating} />
            </Section>
          )}

          {/* S4 Hoteldeals: vergelijkbare arrangementen als alternatief */}
          {alternatives && alternatives.length > 0 && (
            <Section className="m-pad" style={{ padding: "44px 32px 0" }}>
              {alternativesTitle && <Heading as="h2" className="m-h1 d-head" style={s.h1}>{alternativesTitle}</Heading>}
              {alternatives.map((d, i) => (
                <AutomationDealRow key={d.url} deal={d} top={i ? cardGap : undefined} />
              ))}
            </Section>
          )}

          {/* S10 Codesectie: de coupon met de adviesregel eronder */}
          {!codeFirst && codeSection}

          {/* S15 Serviceregel, onder het hotelblok */}
          {service && (
            <Section className="m-pad" style={{ padding: "28px 32px 0" }}>
              <ServiceSection />
            </Section>
          )}

          {/* Witruimte tussen de inhoud en de footer */}
          <Section style={{ height: "44px", lineHeight: "44px", fontSize: 0 }}>&nbsp;</Section>
        </Container>
        <AutomationFooter recipientEmail={recipientEmail} reason="omdat je je hebt aangemeld voor de nieuwsbrief van ViaLuxury" />
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
  // Feedback 24-11-2026: het standaard hotelblok, dus met de inclusies. In mail 1 staat de
  // prijsrij uit, daar vervallen de prijs en de korting vanzelf.
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
  // Feedback 24-11-2026, tweede ronde: kortere kop, de zin "Nog steeds interesse in:" als subtitel
  // boven de hotelgegevens en de serviceregel onder het hotelblok.
  heading: "Sanne, we hebben het even voor je bewaard",
  opening: "winkelmandje" as const,
  cart,
  cartTitle: "Nog steeds interesse in:",
  service: true,
  // Als enige mail ook een donkere versie (verzoek 25-11-2026).
  darkMode: true,
} satisfies Props;

/** Zelfde mail met een onbekende voornaam: de kop begint dan zonder naam. */
export const cart1ZonderNaamProps = {
  ...cart1Props,
  firstName: undefined,
  heading: "We hebben het even voor je bewaard",
} satisfies Props;

/** v01_tf022_fl011_nl-NL_2_abandoned_cart — 2 dagen na het verlaten van het winkelmandje. */
export const cart2Props = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  preheader: `Rond je boeking voor ${HOTEL} af.`,
  // Feedback 24-11-2026: kop bovenaan, daaronder de brief met de aanhef.
  heading: "We helpen je graag",
  headingAt: "top" as const,
  opening: "brief" as const,
  intro: `Je verblijf in ${HOTEL} staat voor je klaar. Twijfel je over je data of heb je een vraag? Laat het ons weten, we helpen je graag.`,
  cart,
  alternatives,
  alternativesTitle: "Anderen boekten ook",
} satisfies Props;


/** v01_tf023_fl011_nl-NL_3_abandoned_cart — 3 dagen na het verlaten van het winkelmandje. */
export const cart3Props = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  preheader: "Dit vonden andere gasten.",
  // Feedback 24-11-2026: kop bovenaan, daaronder de brief. Drie reviews, zoals in de eerste
  // winkelmandjemail van het CRM.
  heading: "Dit vonden andere gasten",
  headingAt: "top" as const,
  opening: "brief" as const,
  intro: "Twijfel je nog? Lees wat andere gasten vinden, of bekijk onze tips die we speciaal voor jou uitkozen.",
  cart,
  guestRating: {
    average: 4.5,
    label: "4,5 uit 312 reviews",
    reviews: [
      { text: "Prachtige kamer en een feestelijk diner.", author: "Marieke" },
      { text: "Stijlvol hotel en een heerlijk rustige kamer.", author: "Jeroen" },
      { text: "Fijne locatie, alles op loopafstand.", author: "Annelies" },
    ],
  },
  alternatives,
  alternativesTitle: "Anderen boekten ook",
} satisfies Props;

/** v01_tf024_fl011_nl-NL_4_abandoned_cart_discount_10euro — 4 dagen na het verlaten van het
 *  winkelmandje, met een unieke code van €10. Code en deadline zijn voorbeelddata. */
export const cart4Props = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  preheader: "Jouw unieke code, geldig tot en met 7 december 2026.",
  // Feedback 24-11-2026: titel bovenaan, dan de intro, dan de code en pas daarna het hotelblok.
  heading: "Een extraatje om je te helpen kiezen",
  headingAt: "top" as const,
  codeFirst: true,
  opening: "brief" as const,
  intro: `We zien je graag binnenkort genieten als gast in ${HOTEL}. Daarom krijg je €10 cadeau met jouw unieke code.`,
  cart,
  code: {
    code: "MANDJE10-4XQ7",
    value: "€10",
    deadline: "7 december 2026 23:59 uur",
    advice: `Je code staat klaar voor ${HOTEL}. Toch liever een ander arrangement? Ook dan kun je je code gewoon gebruiken.`,
  },
} satisfies Props;

AutomationCart.PreviewProps = cart1Props;
