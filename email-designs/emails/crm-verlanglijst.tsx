import { Body, Column, Container, Head, Heading, Html, Img, Link, Preview, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { CodeBlock, CompactDeal, crmCss, Icon, PrimaryButton, s, SecondaryButton, CrmHeader } from "../components/crm";
import NewsletterFooter from "../components/NewsletterFooter";
import { font, newsletter } from "../components/theme";
import { lauswolt, steenenburg, vanOys, villaRuimzicht, winselerhof, type CrmDeal } from "../lib/crmDeals";

// CRM A7 Verlanglijst (retargeting_addedtowishlist_2). Trigger: 3 dagen na de eerste
// verlanglijstmail. De code (€10) is gekoppeld aan één specifiek item: het eerste favoriet. Dat
// item staat bovenaan en is gemarkeerd; de andere favorieten (0, 1 of 2) staan eronder, dus de
// layout werkt met 1, 2 of 3 items. Daarna het codeblok met de primaire knop naar het eerste
// favoriet, en twee vergelijkbare arrangementen als alternatief.
// "Nu te boeken" en de coming-soon-variant zijn bewust niet gebouwd (kan nog niet).
// Onderwerp: "€10 cadeau op [hotelnaam] van je verlanglijst"
//
// De code kan niet in de link en er is geen afgeprijsde prijs; copy blijft "Vul hem in bij het boeken".
//
// Terugvallen (tab Mergevelden):
//   [hotelnaam]  leeg → "je favoriet" (kop-intro en adviesregel gaan over "het eerste favoriet" zonder naam)
//   [plaats]     leeg → plaats valt weg
//   [code], [waarde], [deadline] zijn verplicht

type Props = {
  recipientEmail: string;
  /** 1 tot 3 favorieten; de eerste krijgt de code. */
  favorites: CrmDeal[];
  code: { code: string; value: string; deadline: string };
  wishlistUrl: string;
  /** Twee vergelijkbare arrangementen. */
  alternatives: CrmDeal[];
};

export default function CrmVerlanglijst({ recipientEmail, favorites, code, wishlistUrl, alternatives }: Props) {
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
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          <CrmHeader />

          <Section className="m-pad" style={{ padding: "36px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>Van verlanglijst naar verblijf</Heading>
            <Text style={s.body}>
              {first ? `Voor ${name} krijg je ${code.value} cadeau, met jouw unieke code.` : `Voor je favoriet krijg je ${code.value} cadeau, met jouw unieke code.`}
            </Text>
          </Section>

          {/* S19: eerste favoriet, gemarkeerd als het item waar de code bij hoort */}
          {first && (
            <Section className="m-pad" style={{ padding: "24px 32px 0" }}>
              <Section style={{ border: `1px solid ${c.text}`, borderRadius: "8px", overflow: "hidden" }}>
                <Link href={first.url}>
                  <Img src={first.image} alt={first.packageTitle} width="558" height="260" style={{ display: "block", width: "100%", height: "260px", objectFit: "cover" }} />
                </Link>
                <Section style={{ padding: "16px 20px 20px" }}>
                  <Text style={{ ...s.muted, margin: 0, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                    <Icon name="heart-oranje" size={14} /> Hier geldt je code
                  </Text>
                  <Text style={{ ...s.name, fontFamily: font.heading, fontWeight: 600, fontSize: "20px", margin: "8px 0 0" }}>{first.hotelName}</Text>
                  {first.place && <Text style={{ ...s.muted, margin: "2px 0 0" }}>{first.place}</Text>}
                  <Text style={{ ...s.title, margin: "8px 0 0" }}>{first.packageTitle}</Text>
                  <Text style={{ ...s.title, margin: "8px 0 0" }}>
                    <span style={{ color: c.muted }}>vanaf </span><strong style={{ fontFamily: font.heading, fontSize: "18px", fontWeight: 600 }}>{first.fromPrice}</strong><span style={{ color: c.muted }}> p.p.</span>
                  </Text>
                </Section>
              </Section>
            </Section>
          )}

          {/* Overige favorieten (0, 1 of 2) */}
          {others.length > 0 && (
            <Section className="m-pad" style={{ padding: "28px 32px 0" }}>
              <Text style={{ ...s.kop, fontSize: "18px" }}>Ook op je lijst</Text>
              {others.map((d) => (
                <Section key={d.url} style={{ marginTop: "16px" }}>
                  <Row>
                    <Column className="stack" style={{ width: "110px", verticalAlign: "middle" }}>
                      <Link href={d.url}>
                        <Img src={d.image} alt={d.packageTitle} width="110" height="72" style={{ display: "block", width: "100%", height: "72px", objectFit: "cover", borderRadius: "6px" }} />
                      </Link>
                    </Column>
                    <Column className="stack" style={{ verticalAlign: "middle", paddingLeft: "14px" }}>
                      <Text style={{ ...s.name, margin: 0 }}>{d.hotelName}</Text>
                      <Text style={{ ...s.title, margin: "2px 0 0" }}>
                        <span style={{ color: c.muted }}>vanaf </span><strong>{d.fromPrice}</strong><span style={{ color: c.muted }}> p.p.</span>
                      </Text>
                    </Column>
                  </Row>
                </Section>
              ))}
              <Section style={{ marginTop: "16px" }}>
                <SecondaryButton href={wishlistUrl}>Bekijk je verlanglijst</SecondaryButton>
              </Section>
            </Section>
          )}

          {/* S10: de code, gekoppeld aan het eerste favoriet */}
          <Section className="m-pad" style={{ padding: "40px 32px 0" }}>
            <CodeBlock
              code={code.code}
              value={code.value}
              deadline={code.deadline}
              line="Vul hem in bij het boeken."
              advice={first ? `Je code staat klaar voor ${name}.` : "Je code staat klaar voor je favoriet."}
            />
            <Section style={{ marginTop: "24px", textAlign: "center" }}>
              <PrimaryButton href={first?.url ?? wishlistUrl}>{first ? `Boek ${name}` : "Bekijk je verlanglijst"}</PrimaryButton>
            </Section>
          </Section>

          {/* Twee alternatieven */}
          <Section className="m-pad" style={{ padding: "48px 32px 44px" }}>
            <Text style={s.kop}>Vergelijkbaar met {first ? name : "je favoriet"}</Text>
            {alternatives.map((d) => (
              <Section key={d.url} style={{ marginTop: "20px" }}>
                <CompactDeal d={d} cta="Bekijk arrangement" />
              </Section>
            ))}
          </Section>

          <NewsletterFooter recipientEmail={recipientEmail} reason="omdat je een account hebt bij ViaLuxury" />
        </Container>
      </Body>
    </Html>
  );
}

CrmVerlanglijst.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
  favorites: [steenenburg, villaRuimzicht, winselerhof],
  code: { code: "LIJST10-5TQ9", value: "€10", deadline: "11 november 2026" },
  wishlistUrl: "https://vialuxury.vercel.app/first-release/leden?utm_source=email&utm_medium=crm&utm_campaign=retargeting_addedtowishlist_2",
  alternatives: [vanOys, lauswolt],
} satisfies Props;
