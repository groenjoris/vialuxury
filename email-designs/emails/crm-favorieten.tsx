import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { cardGap, CodeBlock, crmCss, CrmHelp, DealRow, FeaturedDeal, Letter, type RowDeal, s, SecondaryButton, site } from "../components/crm";
import { font, newsletter } from "../components/theme";
import { desIndes, lauswolt, steenenburg, vanOys, villaRuimzicht } from "../lib/crmDeals";

// CRM A7: favorieten €10, 3 dagen na de eerste favorietenmail (heette eerder "verlanglijst").
// Oorspronkelijk van Jesse (origin/redesign-jesse, crm-verlanglijst.tsx), omgezet naar onze
// bouwstenen en regels. Wie iets aan zijn favorieten toevoegt, krijgt een code met korting daarop.
// (De code is in werkelijkheid algemeen geldig; dat benadrukken we niet.)
// De mail begint als brief (Letter): aanhef, het bericht op haast (je favoriet staat klaar, de code
// verloopt, populaire datums zijn snel vol) en de ondertekening. De coupon staat boven de vouw,
// direct boven het favoriet, zodat de koppeling code → arrangement meteen zichtbaar is. De titels
// "Hier geldt je code" en "Ook bij je favorieten" staan in het grote formaat (32) direct boven hun
// blok, net als "Vergelijkbare deals" met de subtitel "Die lijken op [hotel]". Onder de andere
// favorieten (0, 1 of 2) een zwarte knop naar de favorieten.
// Onderwerp: "Je €10 cadeau op [hotelnaam] verloopt over 7 dagen"

type Props = {
  recipientEmail: string;
  /** Leeg → "Beste gast,". */
  firstName?: string;
  code: { code: string; value: string; deadline: string };
  daysLeft?: number;
  /** Favorieten; de eerste is het item waarop de code geldt. */
  favorites: RowDeal[];
  similar: RowDeal[];
  favoritesUrl: string;
};

export default function CrmFavorieten({ recipientEmail, firstName, code, daysLeft, favorites, similar, favoritesUrl }: Props) {
  const c = newsletter.light;
  const [first, ...others] = favorites;
  const name = first?.hotelName ?? "je favoriet";

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>Boek je favoriet voordat je code verloopt.</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader />
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Briefopening: aanhef, het bericht op haast en de ondertekening */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Letter firstName={firstName}>
              {name} staat bij je favorieten. Boek je nu, dan krijg je {code.value} cadeau met jouw persoonlijke code. Wacht niet te lang: je code is {daysLeft ? `nog maar ${daysLeft} dagen` : `tot en met ${code.deadline}`} geldig en populaire datums zijn snel vol.
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
              <Heading as="h2" className="m-h1" style={s.h1}>Ook bij je favorieten</Heading>
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
  code: { code: "FAVORIET10-5TQ9", value: "€10", deadline: "12 november 2026" },
  daysLeft: 7,
  favorites: [steenenburg, villaRuimzicht, desIndes],
  similar: [vanOys, lauswolt],
  favoritesUrl: `${site}/first-release/leden?utm_source=email&utm_medium=crm&utm_campaign=retargeting_addedtowishlist_2`,
} satisfies Props;
