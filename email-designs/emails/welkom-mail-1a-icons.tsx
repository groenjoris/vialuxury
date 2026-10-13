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

const img = (file: string) => `${baseUrl}/images/mail/${file}`;

const responsiveCss = `
@media only screen and (max-width: 480px) {
  .stack { display: block !important; width: 100% !important; }
  .m-center { text-align: center !important; }
  .m-h1 { font-size: 26px !important; }
  .m-kop { font-size: 18px !important; }
  .m-small { font-size: 10px !important; }
  .m-badge { font-size: 10px !important; }
  .m-img { width: 100% !important; height: auto !important; }
  .m-mt { margin-top: 16px !important; }
  .m-pad { padding-left: 16px !important; padding-right: 16px !important; }
  .m-nopad { padding-left: 0 !important; padding-right: 0 !important; }
  .m-mx-auto { margin-left: auto !important; margin-right: auto !important; }
  .m-only { display: block !important; }
  .m-btn { display: block !important; text-align: center !important; }
  .m-logo { width: 143px !important; }
  .m-trustpilot { width: 80px !important; height: auto !important; }
  .m-icon { width: 48px !important; height: 48px !important; }
  .m-iconcol { width: 64px !important; }
}
`;

export default function WelkomMail1AIcons({ recipientName, recipientEmail, mode = "light" }: Props) {
  const c = newsletter[mode];
  const dark = mode === "dark";

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

  // Serviceberichten als lijst: groot icoon links als bullet, tekst rechts.
  const services = [
    {
      icon: dark ? "icon-account-dark.png" : "icon-account.png",
      title: "Al je boekingsgegevens op één plek",
      text: "Log in met je emailadres, je ontvangt direct een inlogcode. Onder je account vind je alles terug: data, arrangement en de details van je verblijf.",
      linkLabel: "Log in en bekijk je boeking >",
      href: "https://vialuxury.nl/login",
    },
    {
      icon: dark ? "icon-faq-dark.png" : "icon-faq.png",
      title: "Vragen over je boeking?",
      text: "Je boeking vind je in je account. Hulp nodig? Bekijk onze FAQ of neem contact op.",
      linkLabel: "Naar FAQ >",
      href: "https://vialuxury.nl/faq",
    },
  ];

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{responsiveCss}</style>
      </Head>
      <Preview>Welkom bij ViaLuxury — dit is handig om te weten</Preview>
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

          {/* Welkom */}
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
              Beste {recipientName}, wat leuk dat je bij ons geboekt hebt. Dit is handig om te weten.
            </Text>
          </Section>

          {/* Serviceberichten met icoon-bullets */}
          {services.map((s) => (
            <Section key={s.title} className="m-pad" style={{ paddingTop: "24px" }}>
              <Row>
                <Column className="m-iconcol" style={{ width: "88px", verticalAlign: "top" }}>
                  <Img src={img(s.icon)} alt="" width="64" height="64" className="m-icon" />
                </Column>
                <Column style={{ verticalAlign: "top" }}>
                  <Text className="m-kop" style={kop}>
                    {s.title}
                  </Text>
                  <Text style={body14}>{s.text}</Text>
                  <Text style={{ margin: "8px 0 0" }}>
                    <Link href={s.href} style={ctaLink}>
                      {s.linkLabel}
                    </Link>
                  </Text>
                </Column>
              </Row>
            </Section>
          ))}

          {/* Mis geen enkele deal */}
          <Section className="m-pad" style={{ paddingTop: "32px", textAlign: "center" }}>
            <Text style={{ margin: 0 }}>
              <span className="m-kop" style={{ ...kop, verticalAlign: "middle" }}>
                Mis geen enkele deal&nbsp;&nbsp;
              </span>
              <span
                className="m-badge"
                style={{
                  backgroundColor: c.badgeBg,
                  borderRadius: "4px",
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
            <Img
              src={img("hero-nature.jpg")}
              alt=""
              width="626"
              height="176"
              className="m-img"
              style={{ ...photo, border: "none", marginTop: "8px", width: "100%" }}
            />
            <Text style={{ ...body14, textAlign: "center" as const, margin: "16px 0 0" }}>
              We sturen je de beste deals voor hotelarrangementen.
              <br />
              Ook niet-hotel deals ontvangen?
            </Text>
            <Text style={{ margin: "8px 0 0" }}>
              <Img
                src={img(dark ? "bell-dark.png" : "bell.png")}
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
                  color: c.heading,
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

WelkomMail1AIcons.PreviewProps = {
  recipientName: "Sanne",
  recipientEmail: "jesse@vialuxury.com",
} satisfies Props;
