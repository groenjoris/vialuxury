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

// Templatespecifieke kleuren (bron: Mail1AFan.dc.html) — deze staan hard in
// de template en zijn in light én dark identiek.
const codeAccent = "#FB862C"; // gestreept kortingsvak + kortingscode
const cardCta = "#E97132"; // "Bekijk >"-knop op de arrangementkaarten
const strikePrice = "#C93A32"; // doorgehaalde van-prijs

// Mobiele opmaak volgt de mobile-variant uit de template: kolommen stapelen,
// kaartfoto bovenop, koppen verkleinen, knoppen over de volle breedte.
const responsiveCss = `
@media only screen and (max-width: 480px) {
  .stack { display: block !important; width: 100% !important; }
  .m-center { text-align: center !important; }
  .m-h1 { font-size: 26px !important; }
  .m-kop { font-size: 18px !important; }
  .m-small { font-size: 10px !important; }
  .m-badge { font-size: 10px !important; border-radius: 4px !important; }
  .m-img { width: 100% !important; height: auto !important; }
  .m-cardimg { width: 100% !important; height: 160px !important; border-radius: 6px 6px 0 0 !important; }
  .m-heroimg { height: 130px !important; }
  .m-mt { margin-top: 16px !important; }
  .m-pad { padding-left: 16px !important; padding-right: 16px !important; }
  .m-nopad { padding-left: 0 !important; padding-right: 0 !important; }
  .m-mx-auto { margin-left: auto !important; margin-right: auto !important; }
  .m-only { display: block !important; }
  .m-btn { display: block !important; text-align: center !important; }
  .m-logo { width: 143px !important; }
  .m-trustpilot { width: 80px !important; height: auto !important; }
  .m-codebox { width: 104px !important; border-width: 2px !important; padding: 16px !important; }
  .m-codelabel { font-size: 10px !important; }
  .m-code { font-size: 20px !important; }
  .m-price { font-size: 16px !important; }
  .m-txt14 { font-size: 14px !important; }
}
`;

export default function WelkomMail1Fan({ recipientEmail, mode = "light" }: Props) {
  const c = newsletter[mode];
  const icon = (n: string) => img(mode === "dark" ? `${n}-dark.png` : `${n}.png`);

  const kop = {
    fontFamily: font.heading,
    fontWeight: 600,
    fontSize: "24px",
    lineHeight: "1.3",
    color: c.heading,
    margin: 0,
  };

  const body14 = {
    fontFamily: font.body,
    fontSize: "14px",
    lineHeight: "1.3",
    color: c.text,
    margin: "8px 0 0",
  };

  const check = (label: string) => (
    <Text style={{ ...body14, margin: "4px 0 0" }}>
      <Img
        src={icon("check")}
        alt=""
        width="12"
        height="12"
        style={{ display: "inline", verticalAlign: "middle", marginRight: "8px" }}
      />
      {label}
    </Text>
  );

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{responsiveCss}</style>
      </Head>
      <Preview>Welkom bij ViaLuxury — je €10 welkomstkorting staat klaar</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          <NewsletterHeader mode={mode} />

          {/* Welkom + kortingscode */}
          <Section className="m-pad" style={{ padding: "32px 10px 0", textAlign: "center" }}>
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
              Welkom bij ViaLuxury
            </Heading>
            <Text style={{ ...body14, textAlign: "center" as const, margin: "16px 0 0" }}>
              Je inschrijving is gelukt! Vanaf nu ontvang je onze beste deals als eerste.
              <br />
              Als welkom krijg je €10 korting op je volgende boeking.
            </Text>
            <div
              className="m-codebox"
              style={{
                display: "inline-block",
                width: "134px",
                boxSizing: "border-box",
                border: `1px dashed ${codeAccent}`,
                borderRadius: "6px",
                padding: "16px 24px",
                marginTop: "16px",
                textAlign: "center",
              }}
            >
              <Text
                className="m-codelabel"
                style={{ fontFamily: font.body, fontSize: "14px", lineHeight: "1.3", color: c.text, margin: 0 }}
              >
                Kortingscode
              </Text>
              <Text
                className="m-code"
                style={{
                  fontFamily: font.body,
                  fontSize: "24px",
                  fontWeight: 700,
                  lineHeight: "1.3",
                  color: codeAccent,
                  textTransform: "uppercase" as const,
                  margin: 0,
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
                padding: "8px 16px",
                textDecoration: "none",
                marginTop: "16px",
              }}
            >
              Verzilver je €10 korting &gt;
            </Button>
          </Section>

          {/* Arrangementen */}
          <Section className="m-pad" style={{ paddingTop: "32px", textAlign: "center" }}>
            <Heading as="h2" className="m-kop" style={{ ...kop, textAlign: "center" as const }}>
              Alvast wat moois voor je korting
            </Heading>
            <Text style={{ ...body14, textAlign: "center" as const, margin: 0 }}>
              Onze selectie van de populairste arrangementen
            </Text>
          </Section>

          {["arr-1.jpg", "arr-2.jpg", "arr-3.jpg"].map((image) => (
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
                  <Column className="stack" style={{ width: "312px", verticalAlign: "top" }}>
                    <Img
                      src={img(image)}
                      alt=""
                      width="312"
                      height="213"
                      className="m-cardimg"
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "213px",
                        display: "block",
                        borderRadius: "6px 0 0 6px",
                      }}
                    />
                  </Column>
                  <Column
                    className="stack"
                    style={{ width: "312px", padding: "16px", verticalAlign: "top" }}
                  >
                    <Text style={{ ...kop, fontSize: "18px", textAlign: "left" as const }}>
                      Beschrijving van het arrangement in zijn geheel
                    </Text>
                    <Text style={{ ...body14, margin: "6px 0 0" }}>
                      Voco® The Hague
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Img
                          key={i}
                          src={icon("star")}
                          alt=""
                          width="12"
                          height="12"
                          style={{
                            display: "inline",
                            verticalAlign: "middle",
                            marginLeft: i === 1 ? "4px" : "1px",
                          }}
                        />
                      ))}
                    </Text>
                    {check("1x overnachting")}
                    {check("Gastronomisch 5-gangendiner")}
                    {check("Late check-out")}
                    <Row style={{ marginTop: "12px" }}>
                      <Column>
                        <span
                          style={{
                            backgroundColor: "#000000",
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
                        </span>
                        <span
                          className="m-price"
                          style={{
                            fontFamily: font.body,
                            fontSize: "14px",
                            lineHeight: "1.3",
                            color: strikePrice,
                            textDecoration: "line-through",
                            marginLeft: "8px",
                            verticalAlign: "middle",
                          }}
                        >
                          €667
                        </span>
                        <span
                          className="m-price"
                          style={{
                            fontFamily: font.body,
                            fontSize: "14px",
                            fontWeight: 700,
                            lineHeight: "1.3",
                            color: c.heading,
                            marginLeft: "8px",
                            verticalAlign: "middle",
                          }}
                        >
                          €479
                        </span>
                      </Column>
                      <Column align="right">
                        <Button
                          href="https://vialuxury.nl"
                          style={{
                            backgroundColor: cardCta,
                            borderRadius: "6px",
                            color: "#FFFFFF",
                            fontFamily: font.body,
                            fontSize: "16px",
                            fontWeight: 700,
                            padding: "8px 16px",
                            textDecoration: "none",
                          }}
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

          <Section className="m-pad" style={{ paddingTop: "16px", textAlign: "center" }}>
            <Link
              href="https://vialuxury.nl"
              className="m-txt14"
              style={{
                fontFamily: font.body,
                fontSize: "16px",
                fontWeight: 700,
                lineHeight: "1.3",
                textDecoration: "underline",
                color: c.link,
              }}
            >
              Bekijk ons volledige aanbod &gt;
            </Link>
          </Section>

          {/* Mis geen enkele deal */}
          <Section className="m-pad" style={{ padding: "32px 0", textAlign: "center" }}>
            <Text style={{ margin: 0 }}>
              <span className="m-kop" style={{ ...kop, verticalAlign: "middle" }}>
                Mis geen enkele deal&nbsp;&nbsp;
              </span>
              <span
                className="m-badge"
                style={{
                  backgroundColor: c.badgeBg,
                  borderRadius: "6px",
                  color: "#FFFFFF",
                  fontFamily: font.body,
                  fontSize: "16px",
                  fontWeight: 700,
                  padding: "8px",
                  verticalAlign: "middle",
                  display: "inline-block",
                }}
              >
                Tot -65%
              </span>
            </Text>
            <div
              style={{
                backgroundColor: c.card,
                border: `1px solid ${c.border}`,
                borderRadius: "6px",
                overflow: "hidden",
                marginTop: "8px",
              }}
            >
              <Img
                src={img("hero-nature.jpg")}
                alt=""
                width="626"
                height="176"
                className="m-heroimg"
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "176px",
                  display: "block",
                  borderRadius: "6px",
                }}
              />
              <div className="m-pad" style={{ padding: "16px 0", textAlign: "center" }}>
                <Text style={{ ...body14, margin: 0, textAlign: "center" as const }}>
                  We sturen je de beste deals voor hotelarrangementen.
                  <br />
                  Ook niet-hotel deals ontvangen?
                </Text>
                <Text style={{ margin: "8px 0 0" }}>
                  <Img
                    src={icon("bell")}
                    alt=""
                    width="20"
                    height="20"
                    style={{ display: "inline", verticalAlign: "middle", marginRight: "8px" }}
                  />
                  <span
                    style={{
                      fontFamily: font.body,
                      fontSize: "14px",
                      fontWeight: 700,
                      lineHeight: "1.3",
                      color: c.text,
                      verticalAlign: "middle",
                    }}
                  >
                    Eén klik is genoeg!
                  </span>
                </Text>
                <Button
                  href="https://vialuxury.nl/deals"
                  className="m-btn m-txt14"
                  style={{
                    backgroundColor: c.cta,
                    borderRadius: "6px",
                    color: "#FFFFFF",
                    fontFamily: font.body,
                    fontSize: "16px",
                    fontWeight: 700,
                    padding: "8px 16px",
                    textDecoration: "none",
                    marginTop: "8px",
                  }}
                >
                  Ontvang alle deals &gt;
                </Button>
              </div>
            </div>
          </Section>

          <NewsletterFooter recipientEmail={recipientEmail} mode={mode} />
        </Container>
      </Body>
    </Html>
  );
}

WelkomMail1Fan.PreviewProps = {
  recipientEmail: "jesse@vialuxury.com",
} satisfies Props;
