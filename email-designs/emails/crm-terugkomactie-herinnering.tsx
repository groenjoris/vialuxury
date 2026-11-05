import { Body, Container, Head, Heading, Html, Img, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import { CodeBlock, crmCss, crmIcon, dealMeta, FeaturedDeal, PrimaryButton, s, site, CrmHeader } from "../components/crm";
import NewsletterFooter from "../components/NewsletterFooter";
import { font, newsletter } from "../components/theme";
import { lauswolt, steenenburg, vanOys, villaRuimzicht, type CrmDeal } from "../lib/crmDeals";

// CRM A3 Terugkomactie, herinnering (repeatbooking_1month_1). Trigger: 30 dagen na vertrek, voor
// wie de code uit de eerste mail (14 dagen na vertrek) nog niet heeft gebruikt.
// Bewust rustig, met één doel: de code gebruiken voor de einddatum. De deadline is echt (verzenddatum
// plus geldigheid) en staat als aantal dagen en als datum onder de code. Daarna één knop en drie
// grote arrangementen onder elkaar in de sfeer van het vorige verblijf; geen reviews of themaknoppen.
// Onderwerp: "Je €20 cadeau verloopt op [deadline]"
//
// Geldigheid is nu 30 dagen (sheet). 60–90 dagen wordt nog getest (check bij Sven).
// De code kan niet in de link; daarom "Vul de code in bij het boeken".
//
// Terugvallen (tab Mergevelden):
//   [hotelnaam] leeg → frame "Ook in de sfeer van je vorige verblijf"
//   [code], [waarde], [deadline] zijn verplicht; het aantal dagen volgt uit de verzenddatum

type Props = {
  recipientEmail: string;
  firstName?: string;
  hotelName?: string;
  code: { code: string; value: string; deadline: string };
  /** Aantal dagen tot de deadline, op de verzenddatum. */
  daysLeft: number;
  /** Drie grote arrangementen onder elkaar. */
  deals: CrmDeal[];
  ctaUrl: string;
};

export default function CrmTerugkomactieHerinnering({ recipientEmail, firstName, hotelName, code, daysLeft, deals, ctaUrl }: Props) {
  const c = newsletter.light;

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>{`Je persoonlijke cadeau ligt nog klaar. Nog ${daysLeft} dagen geldig.`}</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          <CrmHeader />

          {/* Wat het is: eigenaarschap in de kop, met één regel erboven */}
          <Section className="m-pad" style={{ padding: "36px 32px 0", textAlign: "center" }}>
            <Text style={{ ...dealMeta, fontSize: "16px", textAlign: "center" }}>{firstName ? `Nog steeds speciaal voor jou, ${firstName}` : "Nog steeds speciaal voor jou"}</Text>
            <table role="presentation" align="center" cellPadding={0} cellSpacing={0} style={{ margin: "10px auto 0" }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: "middle", paddingRight: "14px" }}>
                    <Img src={crmIcon("tag-plus-oranje")} alt="" width="44" height="44" style={{ display: "block" }} />
                  </td>
                  <td style={{ verticalAlign: "middle", textAlign: "left" }}>
                    <Heading as="h1" className="m-h1" style={s.h1}>Jouw {code.value} cadeau</Heading>
                  </td>
                </tr>
              </tbody>
            </table>
            <Text style={{ ...s.body, margin: "8px 0 0" }}>je persoonlijke bedankje ligt nog voor je klaar</Text>
          </Section>

          {/* Hoe en tot wanneer, en waar je heen kunt */}
          <Section className="m-pad" style={{ padding: "24px 32px 0", textAlign: "center" }}>
            <CodeBlock code={code.code} deadline={code.deadline} daysLeft={daysLeft} label="Jouw persoonlijke code" />
            <Section style={{ marginTop: "24px" }}>
              <PrimaryButton href={ctaUrl}>Bekijk arrangementen</PrimaryButton>
            </Section>
          </Section>

          {/* Drie grote deals onder elkaar */}
          <Section className="m-pad" style={{ padding: "44px 32px 44px", textAlign: "center" }}>
            <Section style={{ borderTop: `1px solid ${c.border}`, paddingTop: "32px" }}>
              <Text style={s.kop}>{hotelName ? `Ook in de sfeer van ${hotelName}` : "Ook in de sfeer van je vorige verblijf"}</Text>
              {deals.map((d, i) => (
                <Section key={d.url} style={{ marginTop: i ? "28px" : "16px" }}>
                  <FeaturedDeal d={d} />
                </Section>
              ))}
            </Section>
          </Section>

          <NewsletterFooter recipientEmail={recipientEmail} reason="omdat je een verblijf boekte bij ViaLuxury" />
        </Container>
      </Body>
    </Html>
  );
}

CrmTerugkomactieHerinnering.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  hotelName: lauswolt.hotelName,
  code: { code: "TERUG20-8KQ3", value: "€20", deadline: "16 december 2026" },
  daysLeft: 14,
  deals: [vanOys, villaRuimzicht, steenenburg],
  ctaUrl: `${site}/first-release/search?utm_source=email&utm_medium=crm&utm_campaign=repeatbooking_1month_1`,
} satisfies Props;
