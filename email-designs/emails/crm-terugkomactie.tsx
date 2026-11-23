import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { cardGap, CodeBlock, crmCss, CrmHelp, DealRow, PrimaryButton, type RowDeal, s, site, ThemePicker } from "../components/crm";
import { font, newsletter } from "../components/theme";
import { asStay, carltonBeach, desIndes, fashionHotel, lauswolt, steenenburg, vanOys, villaRuimzicht } from "../lib/crmDeals";

// CRM A3: terugkomactie €20, 14 dagen na vertrek. Oorspronkelijk van Jesse (origin/redesign-jesse,
// crm-terugkomactie.tsx), omgezet naar onze bouwstenen en regels. Met `daysLeft` is het de
// herinnering van 30 dagen na vertrek: zelfde code, copy op haast ("verloopt over x dagen"),
// zonder het verblijf en de themakiezer.
// Opbouw, in de volgorde waarin de lezer het wil weten:
//   1. briefhoofd: "Beste [voornaam]," en waarom je dit krijgt (we zijn dankbaar dat je boekte),
//   2. de coupon: bedrag, code, geldigheid en "Vul de code in bij het boeken" in één blok,
//   3. waar je heen kunt (de ene oranje knop: Bekijk arrangementen),
//   4. context: jouw verblijf als dealrij,
//   5. "Tips voor je kortingscode" (grote titel) met "Boek uiterlijk [vervaldatum] 23:59 uur" en drie groepjes van
//      twee suggesties: in de sfeer van het vorige hotel, populair deze maand, deals met wellness,
//   6. de themakiezer.
// Onderwerp: "[voornaam], €20 cadeau voor je volgende verblijf"

type Props = {
  recipientEmail: string;
  /** Leeg → "Beste gast,". */
  firstName?: string;
  /** Vorig verblijf; leeg → blok valt weg en het frame wordt "Ook in de sfeer van je vorige verblijf". */
  stay?: RowDeal;
  code: { code: string; value: string; deadline: string };
  /** Alleen in de herinnering: aantal dagen dat de code nog geldig is. */
  daysLeft?: number;
  ctaUrl: string;
  /** Groepjes suggesties, elk met een subtitel en twee deals. */
  groups: { title: string; deals: RowDeal[] }[];
};

export default function CrmTerugkomactie({ recipientEmail, firstName, stay, code, daysLeft, ctaUrl, groups }: Props) {
  const c = newsletter.light;
  const reminder = daysLeft !== undefined;

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
          {/* Briefhoofd: aanhef en waarom je dit krijgt (dankbaarheid voorop) */}
          <Section className="m-pad" style={{ padding: "36px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>{firstName ? `Beste ${firstName},` : "Beste gast,"}</Heading>
            <Text style={{ ...s.body, margin: "12px 0 0" }}>
              {reminder
                ? `Je ${code.value} cadeau verloopt over ${daysLeft} dagen. Daarna vervalt je code, dus wacht niet te lang met boeken.`
                : `Omdat we dankbaar zijn dat je bij ons hebt geboekt, krijg je van ons een ${code.value} cadeau.`}
            </Text>
          </Section>

          {/* De coupon (bedrag, code en geldigheid in één blok) en de ene knop */}
          <Section className="m-pad" style={{ padding: "24px 32px 0" }}>
            <CodeBlock title={`${code.value} cadeau`} code={code.code} deadline={code.deadline} daysLeft={daysLeft} />
            <Section style={{ marginTop: "24px" }}>
              <PrimaryButton href={ctaUrl}>Bekijk arrangementen</PrimaryButton>
            </Section>
          </Section>

          {/* Context: jouw verblijf (niet in de herinnering) */}
          {stay && !reminder && (
            <Section className="m-pad" style={{ padding: "44px 32px 0" }}>
              <Text style={s.kop}>Jouw verblijf</Text>
              <DealRow deal={stay} />
            </Section>
          )}

          {/* Waar je de korting kunt gebruiken: grote titel met de uiterste datum, daaronder groepjes
              van twee suggesties, elk met een subtitel */}
          <Section className="m-pad" style={{ padding: reminder ? "44px 32px 40px" : "44px 32px 0" }}>
            <Heading as="h2" className="m-h1" style={s.h1}>Tips voor je kortingscode</Heading>
            <Text style={{ ...s.body, color: c.muted, margin: "8px 0 0" }}>Boek uiterlijk {code.deadline} 23:59 uur</Text>
            {groups.map((g, gi) => (
              <Section key={g.title} style={{ marginTop: gi ? "36px" : "24px" }}>
                <Text style={s.kop}>{g.title}</Text>
                {g.deals.map((d, i) => (
                  <DealRow key={d.url} deal={d} top={i ? cardGap : undefined} />
                ))}
              </Section>
            ))}
          </Section>

          {!reminder && (
            <Section className="m-pad" style={{ padding: "48px 32px 40px" }}>
              <ThemePicker />
            </Section>
          )}
          {/* Hulplijn */}
          <CrmHelp />
        </Container>
        <CrmFooter recipientEmail={recipientEmail} reason="omdat je bij ons boekte" />
      </Body>
    </Html>
  );
}

const base = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  stay: asStay(lauswolt, "31 oktober tot 2 november 2026"),
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
