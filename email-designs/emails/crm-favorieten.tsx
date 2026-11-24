import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { CouponPair, crmCss, CrmHelp, DealGroup, DealRow, FeaturedDeal, groupGap, Letter, type RowDeal, s, SecondaryButton, site } from "../components/crm";
import { font, newsletter } from "../components/theme";
import { desIndes, lauswolt, steenenburg, vanOys, villaRuimzicht } from "../lib/crmDeals";

// CRM A7: favorieten €10 en €15, 3 dagen na de eerste favorietenmail (heette eerder "verlanglijst").
// Oorspronkelijk van Jesse (origin/redesign-jesse, crm-verlanglijst.tsx), omgezet naar onze
// bouwstenen en regels. Wie iets aan zijn favorieten toevoegt, krijgt een code met korting daarop.
// (De code is in werkelijkheid algemeen geldig; dat benadrukken we niet.)
// De mail begint als brief (Letter): aanhef, het bericht (leuk dat je dit favoriet opsloeg, daarom
// extra korting als je binnen 24 uur boekt, en nog meer op de tweede boeking) en de ondertekening.
// Twee coupons naast elkaar (CouponPair): €10 op de eerste boeking (code direct te gebruiken, 24
// uur geldig) en €15 op de tweede. Eén boeking kan alleen een veelvoud van hetzelfde arrangement
// bevatten, dus de tweede boeking heeft een eigen code nodig: daarvan staat alleen het vaste begin
// in de mail ("WENS2-#####"); de volledige code komt in een nieuwe mail zodra de eerste is gebruikt.
// Daaronder de grote titel "Hier geldt je code" en twee blokken op een beige vlak (DealGroup, kleine
// subtitel erin, zoals in de terugkomactie): "Jouw favorieten" (de eerste groot, de rest als rij,
// met een zwarte knop naar de favorieten) en "Vergelijkbaar met je favorieten" met de regel "Ook
// hier is je korting geldig!".
// Onderwerp: "Alsjeblieft [voornaam], €10 korting op [hotelnaam]" (geen haast in het onderwerp: de
// ontvanger krijgt de coupon hier voor het eerst). Preheader: tot wanneer de code geldig is.

type Props = {
  recipientEmail: string;
  /** Leeg → "Beste gast,". */
  firstName?: string;
  /** Code voor de eerste boeking: direct te gebruiken, kort geldig. */
  first: { value: string; code: string; hoursLeft: number; /** "12 november 2026 10:24 uur", voor de preheader en de regel onder de titel. */ deadline: string };
  /** Code voor de tweede boeking: alleen het vaste begin is bekend ("WENS2"); de rest volgt in een
   *  nieuwe mail zodra de eerste code is gebruikt. */
  second: { value: string; prefix: string };
  /** Favorieten; de eerste is het item waarop de code geldt. */
  favorites: RowDeal[];
  similar: RowDeal[];
  favoritesUrl: string;
};

export default function CrmFavorieten({ recipientEmail, firstName, first: code1, second: code2, favorites, similar, favoritesUrl }: Props) {
  const c = newsletter.light;
  const [first, ...others] = favorites;
  const name = first?.hotelName ?? "je favoriet";

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>Je code is geldig tot {code1.deadline}.</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader />
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Briefopening: aanhef, het bericht (leuk dat je dit favoriet opsloeg, daarom extra korting) en
              de ondertekening */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Letter firstName={firstName}>
              Leuk dat je {name} als favoriet hebt opgeslagen! Nu snappen we beter wat jouw hartje bekoort en daarom bieden we een extra korting als je in de komende {code1.hoursLeft} uur boekt. En op je tweede boeking krijg je nog meer korting!
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

          {/* Hulplijn: direct na de hoofdboodschap, niet als onderste blok */}
          <CrmHelp top="32px" bottom="0" />

          {/* Grote titel boven de blokken, zoals "Tips voor je kortingscode" in de terugkomactie */}
          <Section className="m-pad" style={{ padding: "44px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>Hier geldt je code</Heading>
            <Text style={{ ...s.body, color: c.muted, margin: "2px 0 0" }}>Boek uiterlijk {code1.deadline}</Text>
          </Section>

        </Container>

        {/* Twee blokken, elk op een band over de hele breedte (de eerste beige, de tweede wit, zonder
            ruimte ertussen) met een kleine subtitel erin: de
            favorieten (de eerste groot, de rest als rij, met de knop naar de favorieten) en
            vergelijkbare deals */}
        {first && (
          <DealGroup title={others.length ? "Jouw favorieten" : "Jouw favoriet"} top="24px">
            <FeaturedDeal deal={first} />
            {others.map((d) => (
              <DealRow key={d.url} deal={d} top={groupGap} />
            ))}
            <Section style={{ marginTop: "16px" }}>
              <SecondaryButton href={favoritesUrl} dark>Bekijk je favorieten</SecondaryButton>
            </Section>
          </DealGroup>
        )}
        <DealGroup title="Vergelijkbaar met je favorieten" subtitle="Ook hier is je korting geldig!" white={!!first}>
          {similar.map((d, i) => (
            <DealRow key={d.url} deal={d} top={i ? groupGap : undefined} />
          ))}
        </DealGroup>

        <CrmFooter recipientEmail={recipientEmail} reason="omdat je een account hebt bij ViaLuxury" />
      </Body>
    </Html>
  );
}

CrmFavorieten.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  first: { value: "€10", code: "WENS1-387KW", hoursLeft: 24, deadline: "12 november 2026 10:24 uur" },
  second: { value: "€15", prefix: "WENS2" },
  favorites: [steenenburg, villaRuimzicht, desIndes],
  similar: [vanOys, lauswolt],
  favoritesUrl: `${site}/first-release/leden?utm_source=email&utm_medium=crm&utm_campaign=retargeting_addedtowishlist_2`,
} satisfies Props;
