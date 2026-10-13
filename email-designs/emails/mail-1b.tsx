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
  recipientName: string;
  recipientEmail: string;
  mode?: EmailMode;
};

const img = (f: string) => `${baseUrl}/images/mail/${f}`;

// Mobiele opmaak volgt het mobile-frame uit de template:
// kolommen stapelen, tekst centreert, koppen verkleinen, knop volle breedte.
const responsiveCss = `
@media only screen and (max-width: 480px) {
  .stack { display: block !important; width: 100% !important; }
  .m-center { text-align: center !important; }
  .m-h1 { font-size: 26px !important; }
  .m-kop { font-size: 18px !important; }
  .m-small { font-size: 10px !important; }
  .m-bell { font-size: 14px !important; }
  .m-img { width: 100% !important; height: auto !important; }
  .m-mt { margin-top: 16px !important; }
  .m-pad { padding-left: 16px !important; padding-right: 16px !important; }
  .m-nopad { padding-left: 0 !important; padding-right: 0 !important; }
  .m-mx-auto { margin-left: auto !important; margin-right: auto !important; }
  .m-only { display: block !important; }
  .m-btn { display: block !important; text-align: center !important; font-size: 14px !important; }
  .m-logo { width: 143px !important; }
  .m-trustpilot { width: 80px !important; height: auto !important; }
}
`;

export default function Mail1B({ recipientName, recipientEmail, mode = "light" }: Props) {
  const c = newsletter[mode];

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

  const ctaLink = {
    fontFamily: font.body,
    fontSize: "14px",
    fontWeight: 700,
    color: c.link,
    textDecoration: "underline",
  };

  const photo = {
    border: `1px solid ${c.border}`,
    borderRadius: "6px",
    objectFit: "cover" as const,
  };

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{responsiveCss}</style>
      </Head>
      <Preview>Welkom bij ViaLuxury — we houden je op de hoogte van onze mooiste hoteldeals</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          <NewsletterHeader mode={mode} />

          {/* Fotostrip */}
          <Section className="m-pad" style={{ paddingTop: "24px" }}>
            <Row>
              <Column style={{ width: "30%" }}>
                <Img src={img("strip-1.jpg")} alt="" width="188" style={{ ...photo, borderRadius: "3px", width: "100%", height: "auto" }} />
              </Column>
              <Column style={{ width: "37.4%", paddingLeft: "8px", paddingRight: "8px" }}>
                <Img src={img("strip-2.jpg")} alt="" width="234" style={{ ...photo, borderRadius: "3px", width: "100%", height: "auto" }} />
              </Column>
              <Column style={{ width: "30%" }}>
                <Img src={img("strip-3.jpg")} alt="" width="188" style={{ ...photo, borderRadius: "3px", width: "100%", height: "auto" }} />
              </Column>
            </Row>
          </Section>

          {/* Welkom + deals-CTA */}
          <Section className="m-pad" style={{ padding: "24px 10px 0", textAlign: "center" }}>
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
            <Text style={{ ...body14, textAlign: "center" as const }}>
              Beste {recipientName}, als klant houden we je voortaan op de hoogte van onze mooiste
              hoteldeals.
              <br />
              Wil je ook andere deals van ViaLuxury zien?
            </Text>
            <Text style={{ margin: "8px 0 0" }}>
              <Img
                src={img(mode === "dark" ? "bell-dark.png" : "bell.png")}
                alt=""
                width="20"
                height="20"
                style={{ display: "inline", verticalAlign: "middle", marginRight: "8px" }}
              />
              <span
                className="m-bell"
                style={{
                  fontFamily: font.body,
                  fontSize: "16px",
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
              className="m-btn"
              style={{
                backgroundColor: c.cta,
                borderRadius: "6px",
                color: "#FFFFFF",
                fontFamily: font.body,
                fontSize: "16px",
                fontWeight: 700,
                padding: "8px 16px",
                textDecoration: "none",
                marginTop: "10px",
              }}
            >
              Alle ViaLuxury deals ontvangen &gt;
            </Button>
          </Section>

          {/* Boekingsgegevens */}
          <Section className="m-pad" style={{ paddingTop: "32px" }}>
            <Row>
              <Column className="stack" style={{ width: "301px", verticalAlign: "top" }}>
                <Img src={img("hero-nature.jpg")} alt="" width="301" height="190" className="m-img" style={photo} />
              </Column>
              <Column
                className="stack m-center m-mt m-nopad"
                style={{ width: "301px", paddingLeft: "24px", verticalAlign: "top" }}
              >
                <Text className="m-kop m-center" style={{ ...kop, margin: 0 }}>
                  Al je boekingsgegevens op één plek
                </Text>
                <Text className="m-center" style={body14}>
                  Log in met je emailadres, je ontvangt direct een inlogcode. Onder je account vind
                  je alles terug: data, arrangement en de details van je verblijf.
                </Text>
                <Text className="m-center" style={{ margin: "8px 0 0" }}>
                  <Link href="https://vialuxury.nl/login" style={ctaLink}>
                    Log in en bekijk je boeking &gt;
                  </Link>
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Vragen / FAQ — tekst links, foto rechts; mobiel stapelt tekst boven foto */}
          <Section className="m-pad" style={{ paddingTop: "32px" }}>
            <Row>
              <Column
                className="stack m-center m-nopad"
                style={{ width: "301px", paddingRight: "24px", verticalAlign: "middle" }}
              >
                <Text className="m-kop m-center" style={{ ...kop, margin: 0 }}>
                  Vragen over je boeking?
                </Text>
                <Text className="m-center" style={body14}>
                  Je boeking vind je in je account. Hulp nodig? Bekijk onze FAQ of neem contact op.
                </Text>
                <Text className="m-center" style={{ margin: "8px 0 0" }}>
                  <Link href="https://vialuxury.nl/faq" style={ctaLink}>
                    Naar FAQ &gt;
                  </Link>
                </Text>
              </Column>
              <Column className="stack m-mt" style={{ width: "301px", verticalAlign: "middle" }}>
                <Img src={img("hotel.jpg")} alt="" width="301" height="200" className="m-img" style={photo} />
              </Column>
            </Row>
          </Section>

          {/* Thema's */}
          <Section className="m-pad" style={{ paddingTop: "32px", textAlign: "center" }}>
            <Text className="m-kop" style={{ ...kop, textAlign: "center" as const }}>
              Alvast dromen over een volgende keer?
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
                      <Text style={{ ...kop, fontSize: "18px", margin: 0 }}>{card.title}</Text>
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

Mail1B.PreviewProps = {
  recipientName: "Sanne",
  recipientEmail: "jesse@vialuxury.com",
} satisfies Props;
