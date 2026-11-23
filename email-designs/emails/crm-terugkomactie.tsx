import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { BeigeBand, CodeBlock, crmCss, CrmHelp, DealGroup, DealRow, groupGap, Letter, priceWithCode, PrimaryButton, type RowDeal, s, site, ThemePicker } from "../components/crm";
import { font, newsletter } from "../components/theme";
import { carltonBeach, desIndes, fashionHotel, steenenburg, vanOys, villaRuimzicht } from "../lib/crmDeals";

// CRM A3: terugkomactie €20, 14 dagen na vertrek. Oorspronkelijk van Jesse (origin/redesign-jesse,
// crm-terugkomactie.tsx), omgezet naar onze bouwstenen en regels. Met `daysLeft` is het de
// herinnering van 30 dagen na vertrek: zelfde code, op haast: verliesframe in de intro ("ligt er
// nog, maar niet lang meer"), de termijn als held van de coupon ("Nog 14 dagen"), knop "Verzilver
// je €20" en de termijn in de titel boven de deals; zonder de themakiezer.
// In beide mails staat in elke dealkaart de prijs na aftrek van de code ("Met jouw code: €499").
// Opbouw, in de volgorde waarin de lezer het wil weten:
//   1. briefopening (Letter): "Beste [voornaam]," als gewone tekst, waarom je dit krijgt (we zijn
//      dankbaar dat je boekte) en de ondertekening "Groetjes Yvette",
//   2. de coupon: bedrag, code, geldigheid en "Vul de code in bij het boeken" in één blok,
//   3. waar je heen kunt (de ene oranje knop: Bekijk arrangementen),
//   4. "Tips voor je kortingscode" (grote titel) met "Boek uiterlijk [vervaldatum] 23:59 uur" en drie groepjes van
//      twee suggesties, elk op een eigen beige vlak met de subtitel erin: in de sfeer van het vorige
//      hotel, populair deze maand, deals met wellness,
//   5. de themakiezer.
// Onderwerp: "[voornaam], €20 cadeau voor je volgende verblijf"

type Props = {
  recipientEmail: string;
  /** Leeg → "Beste gast,". */
  firstName?: string;
  code: { code: string; value: string; deadline: string };
  /** Alleen in de herinnering: aantal dagen dat de code nog geldig is. */
  daysLeft?: number;
  ctaUrl: string;
  /** Groepjes suggesties, elk met een subtitel en twee deals. */
  groups: { title: string; deals: RowDeal[] }[];
};

export default function CrmTerugkomactie({ recipientEmail, firstName, code, daysLeft, ctaUrl, groups }: Props) {
  const c = newsletter.light;
  const reminder = daysLeft !== undefined;
  // Bedrag van de code als getal ("€20" → 20), voor "Met jouw code: €…" in de dealkaarten
  const codeAmount = Number(code.value.replace(/[^0-9]/g, ""));

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>
        {reminder ? `Na ${code.deadline} vervalt je code.` : `Een persoonlijk bedankje, alleen voor jou. Geldig tot en met ${code.deadline}.`}
      </Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader />
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Briefopening: aanhef, waarom je dit krijgt (dankbaarheid voorop, in de herinnering haast)
              en de ondertekening */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Letter firstName={firstName}>
              {reminder
                ? `Je ${code.value} cadeau ligt er nog, maar niet lang meer. Na ${code.deadline} is hij weg.`
                : `Omdat we dankbaar zijn dat je bij ons hebt geboekt, krijg je van ons een ${code.value} cadeau.`}
            </Letter>
          </Section>

          {/* De coupon (bedrag, code en geldigheid in één blok) en de ene knop */}
          <Section className="m-pad" style={{ padding: "24px 32px 0" }}>
            {/* In de herinnering is de termijn de held van de coupon ("Nog 14 dagen") */}
            <CodeBlock title={`${code.value} cadeau`} code={code.code} deadline={`${code.deadline} 23:59 uur`} daysLeft={daysLeft} urgent={reminder} />
            <Section style={{ marginTop: "24px" }}>
              <PrimaryButton href={ctaUrl}>{reminder ? `Verzilver je ${code.value}` : "Bekijk arrangementen"}</PrimaryButton>
            </Section>
          </Section>

          {/* Waar je de korting kunt gebruiken: grote titel. In de eerste mail met de uiterste datum
              eronder; in de herinnering staat de termijn in de titel zelf (de datum staat al in de coupon) */}
          <Section className="m-pad" style={{ padding: "44px 32px 0" }}>
            {reminder ? (
              <Heading as="h2" className="m-h1" style={s.h1}>Nog {daysLeft} dagen: hier gebruik je je {code.value}</Heading>
            ) : (
              <>
                <Heading as="h2" className="m-h1" style={s.h1}>Tips voor je kortingscode</Heading>
                <Text style={{ ...s.body, color: c.muted, margin: "2px 0 0" }}>Boek uiterlijk {code.deadline} 23:59 uur</Text>
              </>
            )}
          </Section>

        </Container>

        {/* Groepjes van twee suggesties, elk op een eigen band over de hele breedte met de subtitel erin.
            De banden sluiten op elkaar aan en wisselen af: beige, wit, beige; daarna (niet in de
            herinnering) de themakiezer als volgende band in die reeks */}
        {groups.map((g, gi) => (
          <DealGroup key={g.title} title={g.title} top={gi ? undefined : "24px"} white={gi % 2 === 1}>
            {g.deals.map((d, i) => (
              <DealRow key={d.url} deal={{ ...d, withCode: priceWithCode(d.price, codeAmount) }} top={i ? groupGap : undefined} />
            ))}
          </DealGroup>
        ))}
        {!reminder && (
          <BeigeBand white={groups.length % 2 === 1}>
            <ThemePicker />
          </BeigeBand>
        )}

        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Hulplijn */}
          <CrmHelp top="36px" />
        </Container>
        <CrmFooter recipientEmail={recipientEmail} reason="omdat je bij ons boekte" />
      </Body>
    </Html>
  );
}

const base = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  code: { code: "TERUG20-8KQ3", value: "€20", deadline: "16 december 2026" },
  groups: [
    { title: "In de sfeer van Landgoed Lauswolt", deals: [vanOys, villaRuimzicht] },
    { title: "Populair deze maand", deals: [desIndes, steenenburg] },
    { title: "Deals met wellness", deals: [carltonBeach, fashionHotel] },
  ],
} satisfies Partial<Props>;

CrmTerugkomactie.PreviewProps = {
  ...base,
  ctaUrl: `${site}/first-release/search?utm_source=email&utm_medium=crm&utm_campaign=repeatbooking_1booking_14days_20euro`,
} satisfies Props;

/** Herinnering, 30 dagen na vertrek (A3, repeatbooking_1month_1). */
export const herinneringProps = {
  ...base,
  daysLeft: 14,
  ctaUrl: `${site}/first-release/search?utm_source=email&utm_medium=crm&utm_campaign=repeatbooking_1month_1`,
} satisfies Props;
