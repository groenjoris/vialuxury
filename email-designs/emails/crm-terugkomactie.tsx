import { Body, Column, Container, Head, Heading, Html, Img, Preview, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { CodeBlock, crmCss, DealList, DealRow, PrimaryButton, type RowDeal, s, site, ThemePicker } from "../components/crm";
import { baseUrl, font, newsletter } from "../components/theme";
import { lauswolt, steenenburg, vanOys, villaRuimzicht } from "../lib/crmDeals";

// CRM A3: terugkomactie €20, 14 dagen na vertrek. Overgenomen van Jesse (origin/redesign-jesse,
// crm-terugkomactie.tsx) en omgezet naar onze bouwstenen en regels. Met `daysLeft` is het de
// herinnering van 30 dagen na vertrek: zelfde code, "Nog x dagen geldig", zonder het verblijf
// en de themakiezer.
// Opbouw, in de volgorde waarin de lezer het wil weten:
//   1. wat je krijgt (bedrag als titel) en waarom (bedankje),
//   2. hoe en tot wanneer (coupon, deadline, "Vul de code in bij het boeken"),
//   3. waar je heen kunt (de ene oranje knop: Bekijk arrangementen),
//   4. context: jouw verblijf als dealrij,
//   5. inspiratie: drie deals in de sfeer van dat hotel (1 groot, 2 als rij) en de themakiezer.
// Het bedrag staat alleen in de titel, de deadline alleen onder de code.
// Onderwerp: "[voornaam], €20 cadeau voor je volgende verblijf"

type Props = {
  recipientEmail: string;
  /** Leeg → "Speciaal voor jou" zonder naam. */
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
  const lead = reminder ? "Nog steeds speciaal voor jou" : "Speciaal voor jou";

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
          {/* Wat je krijgt en waarom */}
          <Section className="m-pad" style={{ padding: "36px 32px 0" }}>
            <Text style={{ ...s.muted, margin: 0 }}>{firstName ? `${lead}, ${firstName}` : lead}</Text>
            <Row style={{ marginTop: "8px" }}>
              <Column style={{ width: "54px", verticalAlign: "middle" }}>
                <Img src={`${baseUrl}/images/mail/crm/tag-plus-oranje.png`} alt="" width="40" height="40" style={{ display: "block" }} />
              </Column>
              <Column style={{ verticalAlign: "middle" }}>
                <Heading as="h1" className="m-h1" style={s.h1}>Jouw {code.value} cadeau</Heading>
              </Column>
            </Row>
            <Text style={s.body}>
              {reminder ? "Je persoonlijke bedankje ligt nog voor je klaar." : "Als persoonlijk bedankje, op je volgende verblijf bij ViaLuxury."}
            </Text>
          </Section>

          {/* Hoe en tot wanneer, en de ene knop */}
          <Section className="m-pad" style={{ padding: "24px 32px 0" }}>
            <CodeBlock code={code.code} label="Jouw persoonlijke code" deadline={code.deadline} daysLeft={daysLeft} />
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
