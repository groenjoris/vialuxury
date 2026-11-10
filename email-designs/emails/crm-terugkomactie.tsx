import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { CodeBlock, crmCss, DealList, DealRow, PrimaryButton, type RowDeal, s, site, ThemePicker } from "../components/crm";
import { font, newsletter } from "../components/theme";
import { lauswolt, steenenburg, vanOys, villaRuimzicht } from "../lib/crmDeals";

// CRM A3: terugkomactie €20, 14 dagen na vertrek. Overgenomen van Jesse (origin/redesign-jesse,
// crm-terugkomactie.tsx) en omgezet naar onze bouwstenen en regels. Met `daysLeft` is het de
// herinnering van 30 dagen na vertrek: zelfde code, "Nog x dagen geldig", zonder het verblijf
// en de themakiezer.
// Opbouw, in de volgorde waarin de lezer het wil weten:
//   1. briefhoofd: "Beste [voornaam]," en waarom je dit krijgt (we zijn dankbaar dat je boekte),
//   2. de coupon: bedrag, code, geldigheid en "Vul de code in bij het boeken" in één blok,
//   3. waar je heen kunt (de ene oranje knop: Bekijk arrangementen),
//   4. context: jouw verblijf als dealrij,
//   5. inspiratie: drie deals in de sfeer van dat hotel (1 groot, 2 als rij) en de themakiezer.
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
  deals: RowDeal[];
};

export default function CrmTerugkomactie({ recipientEmail, firstName, stay, code, daysLeft, ctaUrl, deals }: Props) {
  const c = newsletter.light;
  const reminder = daysLeft !== undefined;

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>
        {reminder ? `Je persoonlijke cadeau ligt nog klaar. Nog ${daysLeft} dagen geldig.` : `Een persoonlijk bedankje, alleen voor jou. Geldig tot en met ${code.deadline}.`}
      </Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader />
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Briefhoofd: aanhef en waarom je dit krijgt (dankbaarheid voorop) */}
          <Section className="m-pad" style={{ padding: "36px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>{firstName ? `Beste ${firstName},` : "Beste gast,"}</Heading>
            <Text style={{ ...s.body, margin: "12px 0 0" }}>
              {reminder
                ? `We zijn nog steeds dankbaar dat je bij ons hebt geboekt. Je ${code.value} cadeau ligt nog voor je klaar.`
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

          {/* Inspiratie: één groot, twee als rij; omlijnde knop, want de oranje knop staat boven */}
          <Section className="m-pad" style={{ padding: reminder ? "44px 32px 40px" : "44px 32px 0" }}>
            <Text style={s.kop}>{stay?.hotelName ? `Ook in de sfeer van ${stay.hotelName}` : "Ook in de sfeer van je vorige verblijf"}</Text>
            <DealList deals={deals} primary={false} />
          </Section>

          {!reminder && (
            <Section className="m-pad" style={{ padding: "48px 32px 40px" }}>
              <ThemePicker />
            </Section>
          )}
        </Container>
        <CrmFooter recipientEmail={recipientEmail} reason="omdat je bij ons boekte" />
      </Body>
    </Html>
  );
}

const base = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  stay: { ...lauswolt, line: "31 oktober tot 2 november 2026" },
  code: { code: "TERUG20-8KQ3", value: "€20", deadline: "16 december 2026" },
  deals: [vanOys, villaRuimzicht, steenenburg],
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
