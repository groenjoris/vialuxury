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
import { baseUrl, font, newsletter, type EmailMode } from "../components/theme";

type Props = {
  recipientEmail: string;
  mode?: EmailMode;
};

const img = (f: string) => `${baseUrl}/images/mail/${f}`;

// Template-specifieke kleuren: in de bron zijn deze in licht én donker gelijk.
const accentOrange = "#FB862C"; // gestippelde rand + kortingscode
const strikeRed = "#C93A32"; // doorgehaalde oude prijs
const badgeBg = "#141414"; // -60%-badge
const aanbodLink = "#E97132"; // "Bekijk ons volledige aanbod >"

// Mobiele opmaak volgt het mobile-frame uit de dc-template:
// kaartkolommen stapelen (foto boven, 160px hoog), kop verkleint,
// kortingscode-box krimpt, prijzen worden 16px, CTA over volle breedte.
const responsiveCss = `
@media only screen and (max-width: 480px) {
  .stack { display: block !important; width: 100% !important; }
  .m-center { text-align: center !important; }
  .m-h1 { font-size: 26px !important; }
  .m-kop { font-size: 18px !important; }
  .m-pad { padding-left: 16px !important; padding-right: 16px !important; }
  .m-btn { display: block !important; text-align: center !important; }
  .m-img-card { width: 100% !important; height: 160px !important; }
  .m-codebox { width: 94px !important; height: 68px !important; padding: 16px !important; }
  .m-codelabel { font-size: 10px !important; }
  .m-code { font-size: 18px !important; }
  .m-price { font-size: 16px !important; }
  .m-small { font-size: 10px !important; }
  .m-mt { margin-top: 16px !important; }
  .m-mx-auto { margin-left: auto !important; margin-right: auto !important; }
  .m-only { display: block !important; }
  .m-logo { width: 143px !important; }
  .m-trustpilot { width: 80px !important; height: auto !important; }
}
`;

export default function Mail3Reminder({ recipientEmail, mode = "light" }: Props) {
  const c = newsletter[mode];

  // Iconen wisselen per modus, exact zoals renderVals() in de dc-template.
  const checkSrc = img(mode === "dark" ? "check-dark.png" : "check.png");
  const starSrc = img(mode === "dark" ? "star-dark.png" : "star.png");

  const body14 = {
    fontFamily: font.body,
    fontSize: "14px",
    lineHeight: "1.3",
    color: c.text,
    margin: 0,
  };

  const kop = {
    fontFamily: font.heading,
    fontWeight: 600,
    lineHeight: "1.3",
    color: c.heading,
    margin: 0,
  };

  const ctaButton = {
    backgroundColor: c.cta,
    borderRadius: "6px",
    color: "#FFFFFF",
    fontFamily: font.body,
    fontWeight: 700,
    lineHeight: "1.3",
    textDecoration: "none",
  };

  const cards = ["arr-1.jpg", "arr-2.jpg", "arr-3.jpg"];

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{responsiveCss}</style>
      </Head>
      <Preview>Wat kies jij met jouw cadeau van €10?</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          <NewsletterHeader mode={mode} />

          {/* Hero: kop, intro, kortingscode, geldigheid, CTA */}
          <Section className="m-pad" style={{ paddingTop: "32px", textAlign: "center" }}>
            <Heading
              as="h1"
              className="m-h1"
              style={{
                fontFamily: font.heading,
                fontWeight: 600,
                fontSize: "36px",
                lineHeight: "1.2",
                color: c.heading,
                margin: 0,
              }}
            >
              Wat kies jij met jouw cadeau van €10?
            </Heading>
            <Text
              style={{
                ...body14,
                maxWidth: "418px",
                margin: "16px auto 0",
                textAlign: "center" as const,
              }}
            >
              Van een luxe stedentrip tot een wellnessweekend aan zee. Kies je favoriet en en jouw
              welkomstkorting gaat er direct vanaf.
            </Text>
            <div
              className="m-codebox"
              style={{
                width: "134px",
                height: "81px",
                boxSizing: "border-box" as const,
                border: `1px dashed ${accentOrange}`,
                borderRadius: "6px",
                padding: "16px 24px",
                margin: "16px auto 0",
                textAlign: "center" as const,
              }}
            >
              <Text className="m-codelabel" style={{ ...body14, textAlign: "center" as const }}>
                Kortingscode
              </Text>
              <Text
                className="m-code"
                style={{
                  fontFamily: font.heading,
                  fontWeight: 600,
                  fontSize: "24px",
                  lineHeight: "1.3",
                  color: accentOrange,
                  margin: 0,
                  textAlign: "center" as const,
                }}
              >
                [CODE]
              </Text>
            </div>
            <Text
              style={{
                ...body14,
                maxWidth: "418px",
                margin: "16px auto 0",
                textAlign: "center" as const,
              }}
            >
              Gebruik de code bij het afrekenen. Hij is geldig t/m [dd-mm-jjjj], kan eenmalig worden
              gebruikt en geldt voor één boeking.
            </Text>
            <Button
              href="https://vialuxury.nl"
              className="m-btn"
              style={{ ...ctaButton, fontSize: "14px", padding: "8px 16px", marginTop: "16px" }}
            >
              Verzilver je €10 korting &gt;
            </Button>
          </Section>

          {/* Tussenkop */}
          <Section className="m-pad" style={{ paddingTop: "32px", textAlign: "center" }}>
            <Text className="m-kop" style={{ ...kop, fontSize: "24px", textAlign: "center" as const }}>
              Gebruik je kortingscode
            </Text>
            <Text style={{ ...body14, textAlign: "center" as const }}>
              Drie totaal verschillende ervaringen, voor elke stemming iets
            </Text>
          </Section>

          {/* Arrangementkaarten */}
          {cards.map((image) => (
            <Section key={image} className="m-pad" style={{ paddingTop: "16px" }}>
              <div
                style={{
                  backgroundColor: c.card,
                  border: `1px solid ${c.border}`,
                  borderRadius: "6px",
                  overflow: "hidden",
                }}
              >
                <Row>
                  <Column className="stack" style={{ width: "50%", verticalAlign: "top" }}>
                    <Img
                      src={img(image)}
                      alt=""
                      width="312"
                      height="213"
                      className="m-img-card"
                      style={{ objectFit: "cover", width: "100%", display: "block" }}
                    />
                  </Column>
                  <Column
                    className="stack"
                    style={{ width: "50%", padding: "16px", verticalAlign: "top" }}
                  >
                    <Text className="m-kop" style={{ ...kop, fontSize: "18px" }}>
                      Beschrijving van het arrangement in zijn geheel
                    </Text>
                    <Text style={{ ...body14, margin: "6px 0 0" }}>
                      Voco® The Hague{" "}
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Img
                          key={n}
                          src={starSrc}
                          alt=""
                          width="12"
                          height="12"
                          style={{
                            display: "inline",
                            verticalAlign: "middle",
                            marginLeft: n === 1 ? "4px" : "1px",
                          }}
                        />
                      ))}
                    </Text>
                    {["1x overnachting", "Gastronomisch 5-gangendiner", "Late check-out"].map(
                      (item) => (
                        <Text key={item} style={{ ...body14, margin: "4px 0 0" }}>
                          <Img
                            src={checkSrc}
                            alt=""
                            width="12"
                            height="12"
                            style={{
                              display: "inline",
                              verticalAlign: "middle",
                              marginRight: "8px",
                            }}
                          />
                          {item}
                        </Text>
                      ),
                    )}
                    <Row style={{ marginTop: "12px" }}>
                      <Column>
                        <span
                          style={{
                            backgroundColor: badgeBg,
                            borderRadius: "6px",
                            color: "#FFFFFF",
                            fontFamily: font.body,
                            fontSize: "14px",
                            fontWeight: 700,
                            lineHeight: "1.3",
                            padding: "8px",
                            display: "inline-block",
                            verticalAlign: "middle",
                          }}
                        >
                          -60%
                        </span>{" "}
                        <span
                          className="m-price"
                          style={{
                            fontFamily: font.body,
                            fontSize: "14px",
                            lineHeight: "1.3",
                            color: strikeRed,
                            textDecoration: "line-through",
                            verticalAlign: "middle",
                            marginLeft: "4px",
                          }}
                        >
                          €667
                        </span>{" "}
                        <span
                          className="m-price"
                          style={{
                            fontFamily: font.body,
                            fontSize: "14px",
                            fontWeight: 700,
                            lineHeight: "1.3",
                            color: c.heading,
                            verticalAlign: "middle",
                            marginLeft: "4px",
                          }}
                        >
                          €479
                        </span>
                      </Column>
                      <Column align="right">
                        <Button
                          href="https://vialuxury.nl"
                          style={{ ...ctaButton, fontSize: "16px", padding: "8px 16px" }}
                        >
                          Bekijk &gt;
                        </Button>
                      </Column>
                    </Row>
                  </Column>
                </Row>
              </div>
            </Section>
          ))}

          {/* Volledig aanbod */}
          <Section
            className="m-pad"
            style={{ paddingTop: "16px", paddingBottom: "32px", textAlign: "center" }}
          >
            <Text style={{ margin: 0 }}>
              <Link
                href="https://vialuxury.nl"
                style={{
                  fontFamily: font.body,
                  fontSize: "14px",
                  lineHeight: "1.3",
                  color: aanbodLink,
                  textDecoration: "none",
                }}
              >
                Bekijk ons volledige aanbod &gt;
              </Link>
            </Text>
          </Section>

          <NewsletterFooter recipientEmail={recipientEmail} mode={mode} />
        </Container>
      </Body>
    </Html>
  );
}

Mail3Reminder.PreviewProps = {
  recipientEmail: "jesse@vialuxury.com",
} satisfies Props;
