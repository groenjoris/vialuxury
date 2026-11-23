import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { cardGap, CouponPair, crmCss, CrmHelp, DealRow, FeaturedDeal, Letter, type RowDeal, s, SecondaryButton, site } from "../components/crm";
import { font, newsletter } from "../components/theme";
import { desIndes, lauswolt, steenenburg, vanOys, villaRuimzicht } from "../lib/crmDeals";

// CRM A7: favorieten €10 en €15, 3 dagen na de eerste favorietenmail (heette eerder "verlanglijst").
// Oorspronkelijk van Jesse (origin/redesign-jesse, crm-verlanglijst.tsx), omgezet naar onze
// bouwstenen en regels. Wie iets aan zijn favorieten toevoegt, krijgt een code met korting daarop.
// (De code is in werkelijkheid algemeen geldig; dat benadrukken we niet.)
// De mail begint als brief (Letter): aanhef, het bericht op haast (je favoriet staat klaar, de code
// verloopt, populaire datums zijn snel vol) en de ondertekening. Twee coupons naast elkaar
// (CouponPair): €10 op de eerste boeking (code direct te gebruiken, 24 uur geldig) en €15 op de
// tweede. Eén boeking kan alleen een veelvoud van hetzelfde arrangement bevatten, dus de tweede
// boeking heeft een eigen code nodig: daarvan staat alleen het vaste begin in de mail
// ("WENS2-#####"); de volledige code komt in een nieuwe mail zodra de eerste is gebruikt. De
// coupons staan boven de vouw, direct boven het favoriet. De titels
// "Hier geldt je code" en "Ook bij je favorieten" staan in het grote formaat (32) direct boven hun
// blok, net als "Vergelijkbare deals" met de subtitel "Die lijken op [hotel]". Onder de andere
// favorieten (0, 1 of 2) een zwarte knop naar de favorieten.
// Onderwerp: "Alsjeblieft [voornaam], €10 korting op [hotelnaam]" (geen haast in het onderwerp: de
// ontvanger krijgt de coupon hier voor het eerst). Preheader: tot wanneer de code geldig is.

type Props = {
  recipientEmail: string;
  /** Leeg → "Beste gast,". */
  firstName?: string;
  /** Code voor de eerste boeking: direct te gebruiken, kort geldig. */
  first: { value: string; code: string; hoursLeft: number; /** "12 november 10:24 uur", voor de preheader. */ deadline: string };
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
          {/* Briefopening: aanhef, het bericht op haast en de ondertekening */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Letter firstName={firstName}>
              {name} staat bij je favorieten. Boek je nu, dan krijg je {code1.value} cadeau, en {code2.value} op je tweede boeking. Wees er snel bij: je eerste code is nog maar {code1.hoursLeft} uur geldig en populaire datums zijn snel vol.
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
              <Heading as="h2" className="m-h1" style={s.h1}>Ook bij je favorieten</Heading>
              <Text style={{ ...s.body, color: c.muted, margin: "8px 0 0" }}>Gebruik je code voor een van je favorieten</Text>
              {others.map((d, i) => (
                <DealRow key={d.url} deal={d} top={i ? cardGap : undefined} />
              ))}
              <Section style={{ marginTop: "20px" }}>
                <SecondaryButton href={favoritesUrl} dark>Bekijk je favorieten</SecondaryButton>
              </Section>
            </Section>
          )}

          <Section className="m-pad" style={{ padding: "44px 32px 40px" }}>
            {/* Korte titel in het grote formaat, de hotelnaam als subtitel eronder (zoals de themamail) */}
            <Heading as="h2" className="m-h1" style={s.h1}>Vergelijkbare deals</Heading>
            <Text style={{ ...s.body, color: c.muted, margin: "8px 0 0" }}>Die lijken op {name}</Text>
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

CrmFavorieten.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  first: { value: "€10", code: "WENS1-387KW", hoursLeft: 24, deadline: "12 november 10:24 uur" },
  second: { value: "€15", prefix: "WENS2" },
  favorites: [steenenburg, villaRuimzicht, desIndes],
  similar: [vanOys, lauswolt],
  favoritesUrl: `${site}/first-release/leden?utm_source=email&utm_medium=crm&utm_campaign=retargeting_addedtowishlist_2`,
} satisfies Props;
