import { Body, Column, Container, Head, Heading, Html, Img, Link, Preview, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { crmCss, CrmHelp, Letter, PrimaryButton, s } from "../components/crm";
import { baseUrl, font, newsletter } from "../components/theme";

// Commerciële mail 5: Cadeaukaart. Puur om cadeaukaarten te verkopen: wie er één bestelt, krijgt
// zelf een persoonlijke korting (staffel, tot €120). Opbouw: sfeerbeeld in twee helften over de
// hele breedte (links de experience, rechts de productfoto van de kaart), de titel, een brief die
// uitlegt hoe het werkt, de staffel als tabel met twee kolommen ("Waarde cadeaukaart" en "Jouw
// persoonlijke korting"), een slotzin en de knop. Daaronder alleen de hulplijn (geen Snel zoeken).
// Zelfde bouwstenen en regels als de CRM-mails (zie components/crm.tsx).
// Onderwerp: "Geef een cadeaukaart, krijg zelf tot €120 korting"

/** Eén trede van de staffel; `url` is de productpagina van die cadeaukaart in de cadeaukaartshop. */
type Tier = { value: string; bonus: string; note?: string; url: string };

type Props = {
  recipientEmail: string;
  /** Leeg → "Beste gast,". */
  firstName?: string;
  hero: string;
  heroAlt: string;
  title: string;
  intro: React.ReactNode;
  /** De staffel, van laag naar hoog. */
  tiers: Tier[];
  closing: string;
  orderUrl: string;
};

export default function CommercieelCadeaukaart({ recipientEmail, firstName, hero, heroAlt, title, intro, tiers, closing, orderUrl }: Props) {
  const c = newsletter.light;
  const line = "1px solid #E5E5E5";
  const cell = { padding: "12px 16px", verticalAlign: "top" as const };
  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>Het cadeau waar ze nog jaren over vertellen.</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader />
        {/* Sfeerbeeld in twee helften, direct onder de header over de hele breedte van de mail */}
        <Img src={hero} alt={heroAlt} width="700" style={{ display: "block", width: "100%", height: "auto" }} />
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Titel en de brief met de uitleg */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>{title}</Heading>
            <Section style={{ marginTop: "16px" }}>
              <Letter firstName={firstName}>{intro}</Letter>
            </Section>
          </Section>

          {/* De staffel: twee kolommen, wit met grijze rand */}
          <Section className="m-pad" style={{ padding: "28px 32px 0" }}>
            <Section style={{ border: line, borderRadius: "8px", overflow: "hidden" }}>
              <Row>
                <Column style={{ ...cell, width: "50%" }}><Text style={{ ...s.name, margin: 0 }}>Waarde cadeaukaart</Text></Column>
                <Column style={{ ...cell, width: "50%" }}><Text style={{ ...s.name, margin: 0 }}>Jouw persoonlijke korting</Text></Column>
              </Row>
              {tiers.map((t) => (
                <Row key={t.value}>
                  <Column style={{ ...cell, width: "50%", borderTop: line }}><Text style={{ ...s.title, margin: 0 }}><Link href={t.url} style={{ color: c.text, textDecoration: "underline" }}>{t.value}</Link></Text></Column>
                  <Column style={{ ...cell, width: "50%", borderTop: line }}>
                    <Text style={{ ...s.name, margin: 0 }}><Link href={t.url} style={{ color: c.cta, textDecoration: "none" }}>{t.bonus}</Link></Text>
                    {t.note && <Text style={{ ...s.muted, margin: "2px 0 0" }}><Link href={t.url} style={{ color: c.muted, textDecoration: "none" }}>{t.note}</Link></Text>}
                  </Column>
                </Row>
              ))}
            </Section>

            <Text style={{ ...s.body, margin: "20px 0 0" }}>{closing}</Text>
            <Section style={{ marginTop: "20px" }}>
              <PrimaryButton href={orderUrl}>Bestel een cadeaukaart</PrimaryButton>
            </Section>
          </Section>

          {/* Hulplijn */}
          <CrmHelp top="36px" />
        </Container>
        <CrmFooter recipientEmail={recipientEmail} reason="omdat je je hebt aangemeld voor onze nieuwsbrief" />
      </Body>
    </Html>
  );
}

// Staffel uit de aangeleverde bonusbeelden (€50 → €15, €100 → €25, €200 → 2 x €30, €300 → 3 x €40).
// Elke rij linkt naar de productpagina van die kaart in de echte cadeaukaartshop
// (cadeaukaart.vialuxury.com, productId 11 t/m 14); de knop gaat naar het productoverzicht daar.
const product = (id: number) => `https://cadeaukaart.vialuxury.com/Product/ProductDetails?productId=${id}`;
CommercieelCadeaukaart.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  hero: `${baseUrl}/images/mail/commercieel/cadeaukaart-hero.jpg`,
  heroAlt: "Een stel geniet van ontbijt op bed; daarnaast de ViaLuxury-cadeaukaart",
  title: "Maak iemand blij met een cadeaukaart en ontvang zelf tot €120 korting",
  intro: (
    <>
      Met een ViaLuxury-cadeaukaart geef je een hotelovernachting cadeau, vrij te besteden bij meer dan 600 arrangementen. En jij krijgt er zelf ook iets voor terug: bij elke cadeaukaart die je bestelt, sturen we jou een <strong>persoonlijke kortingscode</strong>. Hoe hoger de waarde, hoe hoger je korting. Bij een cadeaukaart van €300 is dat <strong>€120</strong>.
    </>
  ),
  tiers: [
    { value: "€50", bonus: "€15 korting", url: product(11) },
    { value: "€100", bonus: "€25 korting", url: product(12) },
    { value: "€200", bonus: "€60 korting", note: "2 codes van €30", url: product(13) },
    { value: "€300", bonus: "€120 korting", note: "3 codes van €40", url: product(14) },
  ],
  closing: "Of je die korting zelf gebruikt of ook cadeau geeft, bepaal je helemaal zelf. Wat een feest!",
  orderUrl: "https://cadeaukaart.vialuxury.com/Product/Products",
} satisfies Props;
