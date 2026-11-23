import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { cardGap, CodeBlock, crmCss, CrmHelp, DealRow, FeaturedDeal, Letter, type RowDeal, s, SecondaryButton, site } from "../components/crm";
import { font, newsletter } from "../components/theme";
import { desIndes, lauswolt, steenenburg, vanOys, villaRuimzicht } from "../lib/crmDeals";

// CRM A7: verlanglijst €10, 3 dagen na de eerste verlanglijstmail. Overgenomen van Jesse
// (origin/redesign-jesse, crm-verlanglijst.tsx) en omgezet naar onze bouwstenen en regels.
// De mail begint als brief (Letter): aanhef, "Fijn dat je een verlanglijst maakte" met het bedankje
// als gewone tekst, en de ondertekening. De code is gekoppeld aan één item: het eerste favoriet. De
// coupon staat boven de vouw, direct boven dat favoriet, zodat de koppeling code → arrangement
// meteen zichtbaar is. De titels "Hier geldt je code" en "Ook op je lijst" staan in het grote
// formaat (32) direct boven hun blok; "Vergelijkbaar met [hotel]" blijft klein omdat die titel
// groot zou afbreken. Onder de andere favorieten (0, 1 of 2) een zwarte knop naar de verlanglijst.
// Onderwerp: "€10 cadeau op [hotelnaam] van je verlanglijst"

type Props = {
  recipientEmail: string;
  /** Leeg → "Beste gast,". */
  firstName?: string;
  code: { code: string; value: string; deadline: string };
  daysLeft?: number;
  /** Favorieten; de eerste is het item waarop de code geldt. */
  favorites: RowDeal[];
  similar: RowDeal[];
  wishlistUrl: string;
};

export default function CrmVerlanglijst({ recipientEmail, firstName, code, daysLeft, favorites, similar, wishlistUrl }: Props) {
  const c = newsletter.light;
  const [first, ...others] = favorites;
  const name = first?.hotelName ?? "je favoriet";

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>Jouw unieke code, geldig tot en met {code.deadline}.</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader />
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Briefopening: aanhef, het bericht (de verlanglijst en het bedankje) en de ondertekening */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Letter firstName={firstName}>
              Fijn dat je een verlanglijst maakte. Als bedankje krijg je {code.value} cadeau op {name}, met jouw persoonlijke code.
            </Letter>
          </Section>

          <Section className="m-pad" style={{ padding: "24px 32px 0" }}>
            <CodeBlock title={`${code.value} cadeau`} code={code.code} deadline={code.deadline} daysLeft={daysLeft} />
          </Section>

          {/* Het favoriet waarop de code geldt, met de ene oranje knop */}
          {first && (
            <Section className="m-pad" style={{ padding: "36px 32px 0" }}>
              <Heading as="h1" className="m-h1" style={s.h1}>Hier geldt je code</Heading>
              <FeaturedDeal deal={first} />
            </Section>
          )}

          {others.length > 0 && (
            <Section className="m-pad" style={{ padding: "44px 32px 0" }}>
              <Heading as="h2" className="m-h1" style={s.h1}>Ook op je lijst</Heading>
              {others.map((d, i) => (
                <DealRow key={d.url} deal={d} top={i ? cardGap : undefined} />
              ))}
              <Section style={{ marginTop: "20px" }}>
                <SecondaryButton href={wishlistUrl} dark>Bekijk je verlanglijst</SecondaryButton>
              </Section>
            </Section>
          )}

          <Section className="m-pad" style={{ padding: "44px 32px 40px" }}>
            {/* Bewust de kleine kop: in het grote formaat breekt deze titel met de hotelnaam af */}
            <Text style={s.kop}>Vergelijkbaar met {name}</Text>
            {similar.map((d, i) => (
              <DealRow key={d.url} deal={d} top={i ? cardGap : undefined} />
            ))}
          </Section>
          {/* Hulplijn */}
          <CrmHelp />
        </Container>
        <CrmFooter recipientEmail={recipientEmail} reason="omdat je een account hebt bij ViaLuxury" />
      </Body>
    </Html>
  );
}

CrmVerlanglijst.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  code: { code: "LIJST10-5TQ9", value: "€10", deadline: "12 november 2026" },
  daysLeft: 7,
  favorites: [steenenburg, villaRuimzicht, desIndes],
  similar: [vanOys, lauswolt],
  wishlistUrl: `${site}/first-release/leden?utm_source=email&utm_medium=crm&utm_campaign=retargeting_addedtowishlist_2`,
} satisfies Props;
