import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import NewsletterFooter from "../components/NewsletterFooter";
import NewsletterHeader from "../components/NewsletterHeader";
import { baseUrl, brand, font, newsletter, type EmailMode } from "../components/theme";

type Props = {
  recipientEmail: string;
  mode?: EmailMode;
};

const img = (f: string) => `${baseUrl}/images/mail/${f}`;

// Mobiele opmaak volgt het mobile-frame uit de template:
// kolommen stapelen, tekst centreert, koppen verkleinen, knop volle breedte,
// kortingscodeblok en kaarttitels verkleinen.
const responsiveCss = `
@media only screen and (max-width: 480px) {
  .stack { display: block !important; width: 100% !important; }
  .m-center { text-align: center !important; }
  .m-h1 { font-size: 26px !important; }
  .m-kop { font-size: 18px !important; }
  .m-card-title { font-size: 14px !important; }
  .m-small { font-size: 10px !important; }
  .m-img { width: 100% !important; height: auto !important; }
  .m-mt { margin-top: 16px !important; }
  .m-pad { padding-left: 16px !important; padding-right: 16px !important; }
  .m-nopad { padding-left: 0 !important; padding-right: 0 !important; }
  .m-mx-auto { margin-left: auto !important; margin-right: auto !important; }
  .m-only { display: block !important; }
  .m-btn { display: block !important; text-align: center !important; }
  .m-code-box { width: 94px !important; padding: 12px 8px !important; }
  .m-code-label { font-size: 10px !important; }
  .m-code { font-size: 18px !important; }
  .m-logo { width: 143px !important; }
  .m-trustpilot { width: 80px !important; height: auto !important; }
}
`;

export default function Mail2Reminder({ recipientEmail, mode = "light" }: Props) {
  const c = newsletter[mode];
  // Kortingscodeblok is in de template in beide modes ember (#FB862C).
  const codeColor = brand.ember;

  const body14 = {
    fontFamily: font.body,
    fontSize: "14px",
    lineHeight: "1.3",
    color: c.text,
    margin: "16px auto 0",
    maxWidth: "418px",
  };

  const kop = {
    fontFamily: font.heading,
    fontWeight: 600,
    color: c.heading,
    margin: 0,
  };

  const ctaLink = {
    fontFamily: font.body,
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: "1.3",
    color: c.link,
    textDecoration: "underline",
  };

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{responsiveCss}</style>
      </Head>
      <Preview>Je €10 welkomstkorting staat nog voor je klaar</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          <NewsletterHeader mode={mode} />

          {/* Welkomstcadeau */}
          <Section className="m-pad" style={{ padding: "32px 10px 0", textAlign: "center" }}>
            <Heading
              as="h1"
              className="m-h1"
              style={{ ...kop, fontSize: "36px", lineHeight: "1.2" }}
            >
              Je €10 welkomstcadeau wacht op je
            </Heading>
            <Text style={{ ...body14, textAlign: "center" as const }}>
              Leuk dat je erbij bent. Alleen je welkomstkorting ligt nog ongebruikt te wachten.
              Maar geen zorgen, hij staat gewoon klaar voor je volgende boeking.
            </Text>

            {/* Kortingscode */}
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              border={0}
              align="center"
              className="m-code-box"
              style={{
                width: "134px",
                border: `1px dashed ${codeColor}`,
                borderRadius: "6px",
                marginTop: "16px",
                padding: "16px 8px",
              }}
            >
              <tbody>
                <tr>
                  <td align="center">
                    <Text
                      className="m-code-label"
                      style={{
                        fontFamily: font.body,
                        fontSize: "14px",
                        lineHeight: "1.3",
                        color: c.text,
                        margin: 0,
                      }}
                    >
                      Kortingscode
                    </Text>
                    <Text
                      className="m-code"
                      style={{
                        fontFamily: font.heading,
                        fontWeight: 600,
                        fontSize: "24px",
                        lineHeight: "1.3",
                        color: codeColor,
                        margin: 0,
                      }}
                    >
                      [CODE]
                    </Text>
                  </td>
                </tr>
              </tbody>
            </table>

            <Text style={{ ...body14, textAlign: "center" as const }}>
              Gebruik de code bij het afrekenen. Hij is geldig t/m [dd-mm-jjjj], kan eenmalig
              worden gebruikt en geldt voor één boeking.
            </Text>
            <Button
              href="https://vialuxury.nl"
              className="m-btn"
              style={{
                backgroundColor: c.cta,
                borderRadius: "6px",
                color: "#FFFFFF",
                fontFamily: font.body,
                fontSize: "14px",
                fontWeight: 700,
                lineHeight: "1.3",
                padding: "8px 16px",
                textDecoration: "none",
                marginTop: "16px",
              }}
            >
              Verzilver je €10 korting &gt;
            </Button>
          </Section>

          {/* Laat je inspireren */}
          <Section className="m-pad" style={{ paddingTop: "32px", textAlign: "center" }}>
            <Text className="m-kop" style={{ ...kop, fontSize: "24px", lineHeight: "1.3" }}>
              Laat je inspireren!
            </Text>
            <Text style={{ ...body14, textAlign: "center" as const, margin: 0 }}>
              Onze selectie, van zee tot stad tot pure ontspanning
            </Text>
          </Section>
          <Section className="m-pad" style={{ paddingTop: "16px", paddingBottom: "32px" }}>
            <Row>
              {[
                { image: "theme-sea.jpg", title: "Aan zee", href: "https://vialuxury.nl/aan-zee" },
                { image: "theme-city.jpg", title: "Stedentrip", href: "https://vialuxury.nl/stedentrip" },
                { image: "hero-nature.jpg", title: "In de natuur", href: "https://vialuxury.nl/natuur" },
              ].map((card, i) => (
                <Column
                  key={card.title}
                  className="stack m-nopad m-mt"
                  style={{ width: "198px", paddingLeft: i === 0 ? 0 : "16px", verticalAlign: "top" }}
                >
                  <div
                    style={{
                      backgroundColor: c.card,
                      border: `1px solid ${c.border}`,
                      borderRadius: "6px",
                      overflow: "hidden",
                    }}
                  >
                    <Img
                      src={img(card.image)}
                      alt={card.title}
                      width="198"
                      height="182"
                      className="m-img"
                      style={{ objectFit: "cover", width: "100%", display: "block" }}
                    />
                    <div style={{ padding: "16px", textAlign: "left" }}>
                      <Text
                        className="m-card-title"
                        style={{ ...kop, fontSize: "18px", lineHeight: "1.3" }}
                      >
                        {card.title}
                      </Text>
                      <Text style={{ margin: "8px 0 0" }}>
                        <Link href={card.href} style={ctaLink}>
                          Ontdek aanbod &gt;
                        </Link>
                      </Text>
                    </div>
                  </div>
                </Column>
              ))}
            </Row>
          </Section>

          <NewsletterFooter recipientEmail={recipientEmail} mode={mode} />
        </Container>
      </Body>
    </Html>
  );
}

Mail2Reminder.PreviewProps = {
  recipientEmail: "jesse@vialuxury.com",
} satisfies Props;
