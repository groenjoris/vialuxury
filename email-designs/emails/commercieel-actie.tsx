import { Body, Container, Head, Heading, Html, Img, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { cardGap, CodeBlock, commercieelCss, crmCss, DealRow, FeaturedDeal, Letter, type RowDeal, s, SecondaryButton, site } from "../components/crm";
import { baseUrl, font, newsletter } from "../components/theme";
import { lauswolt, steenenburg, vanOys, villaRuimzicht } from "../lib/crmDeals";

// Commerciële mail 3: Actie. Een cadeau of extra bij een boeking, hier de Goodiebox t.w.v. €150
// (plus een voucher van €25 voor de volgende boeking). Opbouw: de actiefoto over de hele breedte,
// de titel met de deadline, een korte brief, de actiecode als coupon (CodeBlock) met daaronder de
// zwarte knop "Bekijk ons aanbod" (zoekpagina) en dan de lijst:
// titel "Voor jou geselecteerde deals" met een subtitel en vier dealrijen. Het cadeau geldt bij
// elke boeking; daarom onder de lijst één regel en de zwarte knop "Bekijk alle aanbiedingen" naar
// de zoekpagina. Zelfde bouwstenen en regels als de CRM-mails (zie components/crm.tsx).
// Onderwerp: "Sanne, je Goodiebox t.w.v. €150 staat klaar"

type Props = {
  /** Mobiele versie: de deals als gridview-kaart (één foto boven, tekst eronder). */
  mobile?: boolean;
  recipientEmail: string;
  /** Leeg → "Beste gast,". */
  firstName?: string;
  hero: string;
  heroAlt: string;
  title: string;
  /** Alinea van de brief. */
  intro: React.ReactNode;
  /** Wat je krijgt, groot in de coupon. */
  gift: string;
  code: string;
  /** Laatste moment van de actie, bijv. "6 december 2026 23:59 uur". */
  deadline: string;
  listTitle: string;
  listSubtitle: string;
  deals: RowDeal[];
  /** Zoekpagina met alle aanbiedingen. */
  allDealsUrl: string;
};

export default function CommercieelActie({ mobile, recipientEmail, firstName, hero, heroAlt, title, intro, gift, code, deadline, listTitle, listSubtitle, deals, allDealsUrl }: Props) {
  const c = newsletter.light;
  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss + commercieelCss}</style>
      </Head>
      <Preview>Boek voor 7 december en hij is van jou.</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader />
        {/* Actiegraphic direct onder de header, over de hele breedte van de mail (net als de zwarte
            header buiten de <Container>) */}
        <Img src={hero} alt={heroAlt} width="700" style={{ display: "block", width: "100%", height: "auto" }} />
        <Container style={{ width: "100%", maxWidth: "626px" }}>

          {/* Titel met de deadline, de brief en de actiecode als coupon */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>{title}</Heading>
            <Section style={{ marginTop: "16px" }}>
              <Letter firstName={firstName}>{intro}</Letter>
            </Section>
            <Section style={{ marginTop: "24px" }}>
              <CodeBlock title={gift} code={code} label="Jouw actiecode" deadline={deadline} />
            </Section>
            {/* Knop onder de code: naar alle aanbiedingen */}
            <Section style={{ marginTop: "20px" }}>
              <SecondaryButton href={allDealsUrl} dark>Bekijk ons aanbod</SecondaryButton>
            </Section>
          </Section>


          {/* De lijst: titel en subtitel direct erboven, vier dealrijen */}
          <Section className="m-pad" style={{ padding: "40px 32px 48px" }}>
            <Heading as="h2" className="m-h1" style={s.h1}>{listTitle}</Heading>
            <Text style={{ ...s.body, margin: "2px 0 0" }}>{listSubtitle}</Text>
            {deals.map((d, i) =>
              mobile ? (
                <Section key={d.url} style={{ marginTop: i ? "4px" : 0 }}><FeaturedDeal deal={d} /></Section>
              ) : (
                <DealRow key={d.url} deal={d} top={i ? cardGap : "12px"} />
              ),
            )}

            {/* Het cadeau geldt bij elke boeking: naar alle aanbiedingen */}
            <Text style={{ ...s.body, margin: "28px 0 0" }}>Liever iets anders? De Goodiebox krijg je bij elk arrangement.</Text>
            <Section style={{ marginTop: "14px" }}>
              <SecondaryButton href={allDealsUrl} dark>Bekijk alle aanbiedingen</SecondaryButton>
            </Section>
          </Section>
        </Container>

        <CrmFooter recipientEmail={recipientEmail} reason="omdat je je hebt aangemeld voor onze nieuwsbrief" help={2} quote
          terms={{ text: `Actiecode ${code} is geldig bij een boeking tot en met ${deadline}.`, url: "https://vialuxury.nl" }} />
      </Body>
    </Html>
  );
}

CommercieelActie.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  hero: `${baseUrl}/images/mail/commercieel/goodiebox-hero.jpg`,
  heroAlt: "Nieuwe Goodiebox t.w.v. €150 plus een ViaLuxury-bonus van €25, met code HERFSTGB372",
  title: "Boek voor 7 december en ontvang onze Goodiebox",
  intro: (
    <>
      Onze nieuwe Goodiebox is er, en hij is <strong>€150 waard</strong>. Boek voor 7 december een arrangement met de code hieronder en wij zetten er één voor je apart. Direct na je boeking krijg je ook nog <strong>€25 korting</strong> op je volgende verblijf.
    </>
  ),
  gift: "Goodiebox t.w.v. €150",
  code: "HERFSTGB372",
  deadline: "6 december 2026 23:59 uur",
  listTitle: "Voor jou geselecteerde deals",
  listSubtitle: "Boek één van deze parels en ontvang onze Goodiebox ter waarde van €150.",
  // De helft van de dealrijen heeft twee foto's onder elkaar (tweede foto van het arrangement uit deals.json)
  deals: [
    lauswolt,
    { ...vanOys, image2: "https://asset.vialuxury.com/assets/04699185-f5de-473c-8e48-baf4fbb9e703?key=card" },
    { ...steenenburg, image2: "https://asset.vialuxury.com/assets/da12201c-0b8f-47d6-8298-29931cc91d37?key=card" },
    villaRuimzicht,
  ],
  allDealsUrl: `${site}/first-release/search`,
} satisfies Props;
