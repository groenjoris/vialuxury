import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { CrmHelp, CodeBlock, CouponPair, crmCss, DealList, DealRow, PrimaryButton, type RowDeal, s, site, ThemePicker } from "../components/crm";
import { font, newsletter } from "../components/theme";
import { asStay, lauswolt, steenenburg, vanOys, villaRuimzicht } from "../lib/crmDeals";

// CRM A3: terugkomactie, 14 dagen na vertrek. Oorspronkelijk van Jesse (origin/redesign-jesse,
// crm-terugkomactie.tsx), omgezet naar onze bouwstenen en regels.
// Twee coupons naast elkaar (CouponPair): €10 op de volgende boeking (code direct te gebruiken,
// 24 uur geldig) en €15 op de boeking daarna. Eén boeking kan alleen een veelvoud van hetzelfde
// arrangement bevatten, dus de tweede boeking heeft een eigen code nodig: daarvan staat alleen het
// vaste begin in de mail ("TERUG2-#####"); de volledige code komt in een nieuwe mail zodra de
// eerste is gebruikt. Copy op haast.
// Met `daysLeft` is het de herinnering van 30 dagen na vertrek: nog de oude opzet met één code
// (€20, "Nog x dagen geldig"), zonder het verblijf en de themakiezer.
// Opbouw, in de volgorde waarin de lezer het wil weten:
//   1. briefhoofd: "Beste [voornaam]," en waarom je dit krijgt (we zijn dankbaar dat je boekte),
//   2. de coupons: bedrag, code, geldigheid en hoe je de code gebruikt of krijgt,
//   3. waar je heen kunt (de ene oranje knop: Bekijk arrangementen),
//   4. context: jouw verblijf als dealrij,
//   5. inspiratie: drie deals in de sfeer van dat hotel (1 groot, 2 als rij) en de themakiezer.
// Onderwerp: "[voornaam], nog 24 uur: €10 cadeau op je volgende verblijf"

type Props = {
  recipientEmail: string;
  /** Leeg → "Beste gast,". */
  firstName?: string;
  /** Vorig verblijf; leeg → blok valt weg en het frame wordt "Ook in de sfeer van je vorige verblijf". */
  stay?: RowDeal;
  /** Twee coupons (de mail van 14 dagen): code voor de volgende boeking, direct te gebruiken en kort
   *  geldig, en een code voor de boeking daarna waarvan alleen het vaste begin bekend is ("TERUG2");
   *  de rest volgt in een nieuwe mail zodra de eerste code is gebruikt. */
  first?: { value: string; code: string; hoursLeft: number };
  second?: { value: string; prefix: string };
  /** Eén coupon (nu alleen nog de herinnering). */
  code?: { code: string; value: string; deadline: string };
  /** Alleen in de herinnering: aantal dagen dat de code nog geldig is. */
  daysLeft?: number;
  ctaUrl: string;
  deals: RowDeal[];
};

export default function CrmTerugkomactie({ recipientEmail, firstName, stay, first, second, code, daysLeft, ctaUrl, deals }: Props) {
  const c = newsletter.light;
  const reminder = daysLeft !== undefined;
  const pair = !reminder && first && second;

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>
        {pair ? `En ${second.value} op de boeking daarna.` : reminder ? `Je persoonlijke cadeau ligt nog klaar. Nog ${daysLeft} dagen geldig.` : `Een persoonlijk bedankje, alleen voor jou. Geldig tot en met ${code?.deadline}.`}
      </Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader />
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Briefhoofd: aanhef en waarom je dit krijgt (dankbaarheid voorop) */}
          <Section className="m-pad" style={{ padding: "36px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>{firstName ? `Beste ${firstName},` : "Beste gast,"}</Heading>
            <Text style={{ ...s.body, margin: "12px 0 0" }}>
              {pair
                ? `Omdat we dankbaar zijn dat je bij ons hebt geboekt, krijg je van ons ${first.value} cadeau op je volgende boeking en ${second.value} op de boeking daarna. Wees er snel bij: je eerste code is nog maar ${first.hoursLeft} uur geldig.`
                : reminder
                  ? `We zijn nog steeds dankbaar dat je bij ons hebt geboekt. Je ${code?.value} cadeau ligt nog voor je klaar.`
                  : `Omdat we dankbaar zijn dat je bij ons hebt geboekt, krijg je van ons een ${code?.value} cadeau.`}
            </Text>
          </Section>

          {/* De coupon (bedrag, code en geldigheid in één blok) en de ene knop */}
          <Section className="m-pad" style={{ padding: "24px 32px 0" }}>
            {pair ? (
              // Twee coupons: de eerste is nu te gebruiken, de tweede komt vrij na de volgende boeking
              <CouponPair
                coupons={[
                  { title: `${first.value} cadeau`, label: "Op je volgende boeking", code: first.code, validity: `Nog ${first.hoursLeft} uur geldig`, note: "Vul de code in bij het boeken." },
                  { title: `${second.value} cadeau`, label: "Op de boeking daarna", code: `${second.prefix}-#####`, note: "Je krijgt deze code per mail zodra je de eerste hebt gebruikt.", locked: true },
                ]}
              />
            ) : (
              code && <CodeBlock title={`${code.value} cadeau`} code={code.code} deadline={code.deadline} daysLeft={daysLeft} />
            )}
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

          {/* Inspiratie: één groot, twee als rij */}
          <Section className="m-pad" style={{ padding: reminder ? "44px 32px 40px" : "44px 32px 0" }}>
            <Text style={s.kop}>{stay?.hotelName ? `Ook in de sfeer van ${stay.hotelName}` : "Ook in de sfeer van je vorige verblijf"}</Text>
            <DealList deals={deals} />
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
  deals: [vanOys, villaRuimzicht, steenenburg],
} satisfies Partial<Props>;

CrmTerugkomactie.PreviewProps = {
  ...base,
  code: undefined,
  first: { value: "€10", code: "TERUG1-387KW", hoursLeft: 24 },
  second: { value: "€15", prefix: "TERUG2" },
  ctaUrl: `${site}/first-release/search?utm_source=email&utm_medium=crm&utm_campaign=repeatbooking_1booking_14days_20euro`,
} satisfies Props;

/** Herinnering, 30 dagen na vertrek (A3, repeatbooking_1month_1). */
export const herinneringProps = {
  ...base,
  daysLeft: 14,
  ctaUrl: `${site}/first-release/search?utm_source=email&utm_medium=crm&utm_campaign=repeatbooking_1month_1`,
} satisfies Props;
