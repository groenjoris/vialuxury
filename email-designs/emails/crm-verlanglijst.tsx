import { Body, Column, Container, Head, Heading, Html, Img, Link, Preview, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { CodeBlock, CompactDeal, crmCss, DarkButton, DealEyebrow, PrimaryButton, s, CrmHeader } from "../components/crm";
import NewsletterFooter from "../components/NewsletterFooter";
import { font, newsletter } from "../components/theme";
import { lauswolt, steenenburg, vanOys, villaRuimzicht, desIndes, type CrmDeal } from "../lib/crmDeals";

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

          <Section className="m-pad" style={{ padding: "36px 32px 0", textAlign: "center" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>Van verlanglijst naar verblijf</Heading>
            <Text style={s.body}>
              {first ? `Voor ${name} krijg je ${code.value} cadeau, met jouw unieke code.` : `Voor je favoriet krijg je ${code.value} cadeau, met jouw unieke code.`}
            </Text>
          </Section>

          {/* S19: eerste favoriet, gemarkeerd als het item waar de code bij hoort */}
          {first && (
            <Section className="m-pad" style={{ padding: "24px 32px 0", textAlign: "center" }}>
              <Section style={{ border: `1px solid ${c.border}`, borderRadius: "8px", overflow: "hidden", textAlign: "left", backgroundColor: "#FFFFFF" }}>
                <Link href={first.url}>
                  <Img src={first.image} alt={first.packageTitle} width="558" height="260" style={{ display: "block", width: "100%", height: "260px", objectFit: "cover" }} />
                </Link>
                <Section style={{ padding: "20px 20px 22px" }}>
                  <DealEyebrow label="Hier geldt je code" place={first.place} />
                  <Text style={{ fontFamily: font.heading, fontWeight: 600, fontSize: "22px", lineHeight: "1.2", color: c.heading, margin: "6px 0 0" }}>{first.hotelName}</Text>
                  <Text style={{ fontFamily: font.body, fontSize: "14px", lineHeight: "1.45", color: "#555555", margin: "6px 0 0" }}>{first.packageTitle}</Text>
                  <Text style={{ fontFamily: font.body, fontSize: "13px", color: c.muted, margin: "14px 0 0" }}>
                    vanaf <strong style={{ fontFamily: font.heading, fontSize: "22px", fontWeight: 600, color: c.heading }}>{first.fromPrice}</strong> p.p.
                  </Text>
                </Section>
              </Section>
            </Section>
          )}

          {/* Overige favorieten (0, 1 of 2) */}
          {others.length > 0 && (
            <Section className="m-pad" style={{ padding: "28px 32px 0", textAlign: "center" }}>
              <Text style={{ ...s.kop, fontSize: "18px" }}>Ook op je lijst</Text>
              <table role="presentation" align="center" cellPadding={0} cellSpacing={0} style={{ margin: "4px auto 0" }}>
                <tbody>
                  {others.map((d) => (
                    <tr key={d.url}>
                      <td style={{ width: "110px", verticalAlign: "middle", paddingTop: "12px" }}>
                        <Link href={d.url}>
                          <Img src={d.image} alt={d.packageTitle} width="110" height="72" style={{ display: "block", width: "110px", height: "72px", objectFit: "cover", borderRadius: "6px" }} />
                        </Link>
                      </td>
                      <td style={{ verticalAlign: "middle", paddingTop: "12px", paddingLeft: "14px", textAlign: "left" }}>
                        <Text style={{ ...s.name, margin: 0 }}>{d.hotelName}</Text>
                        <Text style={{ ...s.title, margin: "2px 0 0" }}>
                          <span style={{ color: c.muted }}>vanaf </span><strong>{d.fromPrice}</strong><span style={{ color: c.muted }}> p.p.</span>
                        </Text>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Section style={{ marginTop: "16px" }}>
                <DarkButton href={wishlistUrl}>Bekijk je verlanglijst</DarkButton>
              </Section>
            </Section>
          )}

          {/* S10: de code, gekoppeld aan het eerste favoriet */}
          <Section className="m-pad" style={{ padding: "40px 32px 0", textAlign: "center" }}>
            <CodeBlock
              code={code.code}
              value={code.value}
              deadline={code.deadline}
              line="Vul hem in bij het boeken."
              advice={first ? `Je code staat klaar voor ${name}.` : "Je code staat klaar voor je favoriet."}
            />
            <Section style={{ marginTop: "24px" }}>
              <PrimaryButton href={first?.url ?? wishlistUrl}>{first ? `Boek ${name}` : "Bekijk je verlanglijst"}</PrimaryButton>
            </Section>
          </Section>

          {/* Twee alternatieven */}
          <Section className="m-pad" style={{ padding: "48px 32px 44px", textAlign: "center" }}>
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
  favorites: [steenenburg, villaRuimzicht, desIndes],
  code: { code: "LIJST10-5TQ9", value: "€10", deadline: "11 november 2026" },
  wishlistUrl: "https://vialuxury.vercel.app/first-release/leden?utm_source=email&utm_medium=crm&utm_campaign=retargeting_addedtowishlist_2",
  alternatives: [vanOys, lauswolt],
} satisfies Props;
