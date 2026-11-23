import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { cardGap, CouponPair, crmCss, CrmHelp, DealRow, FeaturedDeal, Letter, type RowDeal, s, SecondaryButton, site } from "../components/crm";
import { font, newsletter } from "../components/theme";
import { desIndes, lauswolt, steenenburg, vanOys, villaRuimzicht } from "../lib/crmDeals";

// CRM A7: verlanglijst, 3 dagen na de eerste verlanglijstmail. Oorspronkelijk van Jesse
// (origin/redesign-jesse, crm-verlanglijst.tsx), omgezet naar onze bouwstenen en regels.
// De mail begint als brief (Letter): aanhef, "Fijn dat je een verlanglijst maakte" met het bedankje
// en de haast (de eerste code is maar 24 uur geldig), en de ondertekening.
// Twee coupons naast elkaar (CouponPair): €10 op de eerste boeking (code direct te gebruiken, 24
// uur geldig) en €15 op de tweede. Eén boeking kan alleen een veelvoud van hetzelfde arrangement
// bevatten, dus de tweede boeking heeft een eigen code nodig: daarvan staat alleen het vaste begin
// in de mail ("WENS2-#####"); de volledige code komt in een nieuwe mail zodra de eerste is gebruikt.
// Daaronder de favorieten: "Hier geldt je code" (de eerste, groot) en "Ook op je lijst" in het
// grote titelformaat (32) direct boven hun blok, met een zwarte knop naar de verlanglijst;
// "Vergelijkbaar met [hotel]" blijft klein omdat die titel groot zou afbreken.
// Onderwerp: "Nog 24 uur: €10 cadeau op je verlanglijst"

type Props = {
  recipientEmail: string;
  /** Leeg → "Beste gast,". */
  firstName?: string;
  /** Code voor de eerste boeking: direct te gebruiken, kort geldig. */
  first: { value: string; code: string; hoursLeft: number };
  /** Code voor de tweede boeking: alleen het vaste begin is bekend ("WENS2"); de rest volgt in een
   *  nieuwe mail zodra de eerste code is gebruikt. */
  second: { value: string; prefix: string };
  /** Favorieten; de eerste staat groot bovenaan. */
  favorites: RowDeal[];
  similar: RowDeal[];
  wishlistUrl: string;
};

export default function CrmVerlanglijst({ recipientEmail, firstName, first: code1, second: code2, favorites, similar, wishlistUrl }: Props) {
  const c = newsletter.light;
  const [first, ...others] = favorites;
  const name = first?.hotelName ?? "je favoriet";

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>En {code2.value} op je tweede boeking.</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader />
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Briefopening: aanhef, het bericht (de verlanglijst en het bedankje) en de ondertekening */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Letter firstName={firstName}>
              Fijn dat je een verlanglijst maakte. Als bedankje krijg je {code1.value} cadeau op je eerste boeking en {code2.value} op je tweede. Wees er snel bij: je eerste code is nog maar {code1.hoursLeft} uur geldig.
            </Letter>
          </Section>

          <Section className="m-pad" style={{ padding: "24px 32px 0" }}>
            {/* Twee coupons: de eerste is nu te gebruiken, de tweede komt vrij na de eerste boeking */}
            <CouponPair
              coupons={[
                { title: `${code1.value} cadeau`, label: "Op je 1e boeking", code: code1.code, validity: `Nog ${code1.hoursLeft} uur geldig`, note: "Vul de code in bij het boeken." },
                { title: `${code2.value} cadeau`, label: "Op je 2e boeking", code: `${code2.prefix}-#####`, note: "Je krijgt deze code per mail zodra je de eerste hebt gebruikt.", locked: true },
              ]}
            />
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
  first: { value: "€10", code: "WENS1-387KW", hoursLeft: 24 },
  second: { value: "€15", prefix: "WENS2" },
  favorites: [steenenburg, villaRuimzicht, desIndes],
  similar: [vanOys, lauswolt],
  wishlistUrl: `${site}/first-release/leden?utm_source=email&utm_medium=crm&utm_campaign=retargeting_addedtowishlist_2`,
} satisfies Props;
