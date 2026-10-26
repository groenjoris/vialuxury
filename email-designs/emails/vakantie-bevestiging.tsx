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

// Boekingsbevestiging van een multi-hotel vakantie (Multi Hotel Trip). Header, logo,
// Trustpilot en footer uit het nieuwsbrief-template; daartussen dezelfde opbouw als
// de linkerkolom van de bevestigingspagina in het prototype: kop, aanhef, boekings-
// nummer, de kassabon (reis, per hotel foto/naam/sterren/adres, lijst met nachten en
// inclusies, check-in/check-out, flexibel annuleren, prijs), dan Tips voor je reis,
// Boeking terugvinden, de cadeaukaart en de veelgestelde vragen (uitgeklapt).

type Hotel = {
  name: string;
  stars: number;
  address: string;
  image: string;
  /** Lijst onder het adres: overnachtingen, kamer en álle inclusies van dat hotel (zoals op de dealpagina). */
  items: string[];
  checkIn: string;
  checkOut: string;
};

type Props = {
  recipientName: string;
  recipientEmail: string;
  bookingDate: string;
  bookingNumber: string;
  tripType: string;
  tripName: string;
  dateRange: string;
  nights: number;
  persons: number;
  roomsPerHotel: number;
  hotels: Hotel[];
  cancelUntil: string;
  hasBaggage?: boolean;
  tripPrice: string;
  bookingFee: string;
  total: string;
  routesUrl: string;
  bookingUrl: string;
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
  .m-img { width: 100% !important; height: auto !important; }
  .m-mt { margin-top: 16px !important; }
  .m-pad { padding-left: 16px !important; padding-right: 16px !important; }
  .m-nopad { padding-left: 0 !important; padding-right: 0 !important; }
  .m-mx-auto { margin-left: auto !important; margin-right: auto !important; }
  .m-only { display: block !important; }
  .m-btn { display: block !important; text-align: center !important; }
  .m-logo { width: 143px !important; }
  .m-trustpilot { width: 80px !important; height: auto !important; }
  .m-hotelimg { width: 100% !important; height: auto !important; margin-bottom: 12px !important; }
  .m-giftimg { width: 200px !important; height: auto !important; margin: 0 auto 16px !important; }
}
`;

export default function VakantieBevestiging({
  recipientName,
  recipientEmail,
  bookingDate,
  bookingNumber,
  tripType,
  tripName,
  dateRange,
  nights,
  persons,
  roomsPerHotel,
  hotels,
  cancelUntil,
  hasBaggage = false,
  tripPrice,
  bookingFee,
  total,
  routesUrl,
  bookingUrl,
  mode = "light",
}: Props) {
  const c = newsletter[mode];
  const dark = mode === "dark";
  const frameBg = dark ? "#262626" : "#F7F7F7"; // grijs kader om de kassabon
  const beige = dark ? "#3A3A3A" : "#F4F1EC"; // boekingsnummer, tintvlakken
  const line = c.border;

  const h1 = {
    fontFamily: font.heading,
    fontWeight: 600,
    fontSize: "36px",
    lineHeight: "1.2",
    color: c.heading,
    margin: 0,
  };
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
    lineHeight: "1.45",
    color: c.text,
    margin: "8px 0 0",
  };
  const small = {
    fontFamily: font.body,
    fontSize: "13px",
    lineHeight: "1.4",
    color: c.muted,
    margin: 0,
  };
  const eyebrow = {
    fontFamily: font.body,
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    color: c.muted,
    margin: 0,
  };
  const ctaLink = {
    fontFamily: font.body,
    fontSize: "14px",
    fontWeight: 700,
    color: c.link,
    textDecoration: "underline",
  };
  const num = {
    width: "26px",
    height: "26px",
    borderRadius: "13px",
    backgroundColor: c.badgeBg,
    color: "#FFFFFF",
    fontFamily: font.body,
    fontSize: "13px",
    fontWeight: 700,
    textAlign: "center" as const,
    lineHeight: "26px",
    display: "inline-block",
  };
  const priceRow = (label: string, value: string, bold = false, top = false) => (
    <Row style={top ? { borderTop: `1px solid ${line}` } : undefined}>
      <Column style={{ paddingTop: top ? "10px" : "3px", paddingBottom: "3px" }}>
        <Text style={{ ...body14, margin: 0, fontWeight: bold ? 700 : 400 }}>{label}</Text>
      </Column>
      <Column align="right" style={{ paddingTop: top ? "10px" : "3px", paddingBottom: "3px", whiteSpace: "nowrap" as const }}>
        <Text style={{ ...body14, margin: 0, fontWeight: bold ? 700 : 400, textAlign: "right" as const }}>{value}</Text>
      </Column>
    </Row>
  );

  const faq = [
    {
      q: "Hoe kan ik annuleren of wijzigen?",
      a: `Via je account. Log in met ${recipientEmail}, open deze boeking en kies "Annuleren" of "Datum wijzigen". Tot ${cancelUntil} (30 dagen voor aankomst) is dat kosteloos; je krijgt het volledige bedrag terug.`,
    },
    {
      q: "Hoe log ik in op mijn account?",
      a: "Je hebt geen wachtwoord nodig. Vul op vialuxury.com je e-mailadres in, je ontvangt direct een inloglink per mail. Eén klik en je bent binnen.",
    },
    {
      q: `Hoe werkt het inchecken bij ${hotels.length} hotels?`,
      a: "Elk hotel heeft je naam en boekingsnummer. Je meldt je bij de receptie met een geldig identiteitsbewijs; uitchecken en doorreizen naar het volgende hotel regel je gewoon ter plekke.",
    },
    {
      q: "Wat betaal ik nog in de hotels?",
      a: "Alleen de lokale toeristenbelasting; die rekent elk hotel bij het uitchecken af. Alles wat hierboven bij je hotels staat is al betaald.",
    },
    {
      q: "Zijn de attracties uit de tips inbegrepen?",
      a: "Nee. De tips per hotel zijn inspiratie; entree betaal je ter plaatse en alleen voor wat je zelf kiest. Een Museumkaart of kortingspas loont bij vakanties in Nederland.",
    },
  ];

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{responsiveCss}</style>
      </Head>
      <Preview>Je boeking is bevestigd — {tripName}</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          <NewsletterHeader mode={mode} />

          {/* Kop + aanhef + boekingsnummer */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={h1}>
              Je boeking is bevestigd
            </Heading>
            <Text style={{ ...body14, margin: "16px 0 0" }}>Beste {recipientName},</Text>
            <Text style={body14}>
              Gefeliciteerd! Hierbij de bevestiging van je boeking op {bookingDate} voor{" "}
              <strong>{tripName}</strong>.
            </Text>
            <Section style={{ backgroundColor: beige, borderRadius: "8px", padding: "12px 16px", marginTop: "16px" }}>
              <Row>
                <Column>
                  <Text style={{ ...body14, margin: 0 }}>Je boekingsnummer</Text>
                </Column>
                <Column align="right">
                  <Text style={{ ...body14, margin: 0, fontWeight: 700, fontSize: "16px", letterSpacing: "0.04em", textAlign: "right" as const }}>
                    {bookingNumber}
                  </Text>
                </Column>
              </Row>
            </Section>
          </Section>

          {/* Kassabon: grijs kader met wit vlak */}
          <Section className="m-pad" style={{ padding: "24px 32px 0" }}>
            <Section style={{ backgroundColor: frameBg, borderRadius: "8px", padding: "12px" }}>
              <Section style={{ backgroundColor: c.card, borderRadius: "6px", padding: "24px" }}>
                <Text style={eyebrow}>
                  {tripType} met {hotels.length} hotels
                </Text>
                <Text className="m-kop" style={{ ...kop, fontSize: "22px", margin: "4px 0 0" }}>{tripName}</Text>
                <Text style={{ ...small, color: c.text, margin: "6px 0 0" }}>
                  {dateRange} · {nights} nachten · {persons} personen · {roomsPerHotel} {roomsPerHotel === 1 ? "kamer" : "kamers"} per hotel
                </Text>

                {hotels.map((h, i) => (
                  <Section key={h.name} style={{ borderTop: `1px solid ${line}`, marginTop: "20px", paddingTop: "20px" }}>
                    <Row>
                      <Column style={{ width: "36px", verticalAlign: "top" }}>
                        <span style={num}>{i + 1}</span>
                      </Column>
                      <Column className="stack" style={{ width: "120px", verticalAlign: "top" }}>
                        <Img
                          src={h.image}
                          alt={h.name}
                          width="120"
                          height="86"
                          className="m-hotelimg"
                          style={{ borderRadius: "4px", objectFit: "cover", display: "block" }}
                        />
                      </Column>
                      <Column className="stack" style={{ paddingLeft: "16px", verticalAlign: "top" }}>
                        <Text style={{ ...body14, margin: 0, fontSize: "16px", fontWeight: 700 }}>
                          {h.name}{" "}
                          <span style={{ fontSize: "13px", letterSpacing: "1px", color: c.heading, fontWeight: 400 }}>
                            {"★".repeat(h.stars)}
                          </span>
                        </Text>
                        <Text style={{ ...small, margin: "2px 0 0" }}>{h.address}</Text>
                        <ul style={{ margin: "8px 0 0", paddingLeft: "18px" }}>
                          {h.items.map((item) => (
                            <li key={item} style={{ ...body14, margin: "0 0 2px" }}>
                              {item}
                            </li>
                          ))}
                        </ul>
                        <Text style={{ ...small, margin: "8px 0 0" }}>
                          <strong style={{ color: c.text }}>Check-in</strong> {h.checkIn}
                          <br />
                          <strong style={{ color: c.text }}>Check-out</strong> {h.checkOut}
                        </Text>
                      </Column>
                    </Row>
                  </Section>
                ))}

                {/* Flexibel annuleren (en bagagetransfer): dezelfde groene iconen als op de bevestigingspagina */}
                <Section style={{ borderTop: `1px solid ${line}`, marginTop: "20px", paddingTop: "16px" }}>
                  <Row>
                    <Column style={{ width: "36px", verticalAlign: "top" }}>
                      <Img src={img("icon-shield-green.png")} alt="" width="26" height="26" />
                    </Column>
                    <Column style={{ verticalAlign: "top" }}>
                      <Text style={{ ...body14, margin: 0, fontSize: "16px", fontWeight: 700 }}>Flexibel annuleren</Text>
                      <Text style={{ ...small, margin: "2px 0 0" }}>
                        Tot {cancelUntil} (30 dagen voor aankomst) kosteloos annuleren van de gehele vakantie.
                      </Text>
                    </Column>
                  </Row>
                  {hasBaggage && (
                    <Row style={{ marginTop: "12px" }}>
                      <Column style={{ width: "36px", verticalAlign: "top" }}>
                        <Img src={img("icon-suitcase-green.png")} alt="" width="26" height="26" />
                      </Column>
                      <Column style={{ verticalAlign: "top" }}>
                        <Text style={{ ...body14, margin: 0, fontSize: "16px", fontWeight: 700 }}>Bagagetransfer</Text>
                        <Text style={{ ...small, margin: "2px 0 0" }}>
                          Je bagage reist elke etappe vooruit naar het volgende hotel; jij fietst met alleen een dagtas.
                        </Text>
                      </Column>
                    </Row>
                  )}
                </Section>

                {/* Prijs */}
                <Section style={{ borderTop: `1px solid ${line}`, marginTop: "16px", paddingTop: "12px" }}>
                  {priceRow(`${tripType}, ${persons} personen, incl. flexibel annuleren`, tripPrice)}
                  {priceRow("Boekingskosten", bookingFee)}
                  {priceRow("Totaal", total, true, true)}
                  {priceRow("Betaald", total)}
                  {priceRow("Te betalen", "€0", true)}
                  <Text style={{ ...small, textAlign: "right" as const, margin: "4px 0 0" }}>
                    In de hotels betaal je alleen
                    <br />
                    de lokale toeristenbelasting.
                  </Text>
                </Section>
              </Section>
            </Section>
          </Section>

          {/* Tips voor je reis: de persoonlijke reispagina (zelfde tekst als op de bevestigingspagina) */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Text className="m-kop" style={kop}>Tips voor je reis</Text>
            <Text style={body14}>
              We hebben de tips en routes voor je vakantie op een speciale pagina voor je klaargezet: per hotel de praktische
              informatie, het reisschema met de kaart en onze tips voor in de buurt. De link sturen we je ook nog per mail.
            </Text>
            <Text style={{ margin: "8px 0 0" }}>
              <Link href={routesUrl} style={ctaLink}>
                Bekijk de tips &gt;
              </Link>
            </Text>
          </Section>

          {/* Boeking terugvinden */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Text className="m-kop" style={kop}>Boeking terugvinden</Text>
            <Text style={body14}>
              Je boeking staat in je ViaLuxury-account op <strong>{recipientEmail}</strong>. Inloggen doe je zonder wachtwoord:
              je krijgt een inloglink per mail.
            </Text>
            <Text style={{ margin: "8px 0 0" }}>
              <Link href={bookingUrl} style={ctaLink}>
                Bekijk je boeking &gt;
              </Link>
            </Text>
          </Section>

          {/* Cadeaukaart */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Section style={{ border: `1px solid ${line}`, borderRadius: "8px", padding: "20px" }}>
              <Row>
                <Column className="stack" style={{ width: "180px", verticalAlign: "middle" }}>
                  <Img
                    src={img("vakantie/giftcard.jpg")}
                    alt="ViaLuxury cadeaukaart"
                    width="180"
                    height="180"
                    className="m-giftimg"
                    style={{ display: "block", borderRadius: "4px" }}
                  />
                </Column>
                <Column className="stack m-nopad" style={{ paddingLeft: "20px", verticalAlign: "middle" }}>
                  <Text style={eyebrow}>Cadeautip</Text>
                  <Text className="m-kop" style={{ ...kop, fontSize: "20px", margin: "4px 0 0" }}>
                    Maak iemand anders blij met een ViaLuxury-experience
                  </Text>
                  <Text style={body14}>
                    Een verjaardag, een jubileum of gewoon omdat het kan: met een cadeaukaart geef je een verblijf in een van
                    onze handgekozen hotels, met alle extra's erbij. De ontvanger kiest zelf het hotel en de datum.
                  </Text>
                  <Button
                    href="https://cadeaukaart.vialuxury.com/Product/Products"
                    className="m-btn"
                    style={{
                      backgroundColor: c.cta,
                      borderRadius: "6px",
                      color: "#FFFFFF",
                      fontFamily: font.body,
                      fontSize: "14px",
                      fontWeight: 700,
                      padding: "10px 16px",
                      textDecoration: "none",
                      marginTop: "12px",
                    }}
                  >
                    Bekijk onze cadeaukaarten &gt;
                  </Button>
                </Column>
              </Row>
            </Section>
          </Section>

          {/* Veelgestelde vragen (uitgeklapt) */}
          <Section className="m-pad" style={{ padding: "32px 32px 32px" }}>
            <Text className="m-kop" style={kop}>Veelgestelde vragen</Text>
            {faq.map((f) => (
              <Section key={f.q} style={{ borderTop: `1px solid ${line}`, marginTop: "12px", paddingTop: "12px" }}>
                <Text style={{ ...body14, margin: 0, fontWeight: 700, fontSize: "15px" }}>{f.q}</Text>
                <Text style={{ ...body14, margin: "4px 0 0", color: c.muted }}>{f.a}</Text>
              </Section>
            ))}
          </Section>

          <NewsletterFooter recipientEmail={recipientEmail} mode={mode} />
        </Container>
      </Body>
    </Html>
  );
}

VakantieBevestiging.PreviewProps = {
  recipientName: "Rijo Verburg",
  recipientEmail: "rijo.verburg@gmail.com",
  bookingDate: "dinsdag 13 oktober 2026",
  bookingNumber: "VL-11 851 812",
  tripType: "Autovakantie",
  tripName: "Ontdek Noord-Frankrijk en de Opaalkust in 7 dagen",
  dateRange: "dinsdag 18 mei t/m maandag 24 mei 2027",
  nights: 6,
  persons: 2,
  roomsPerHotel: 1,
  hotels: [
    {
      name: "Château Tilques",
      stars: 3,
      address: "Rue du Château, 62500 Tilques, Frankrijk",
      image: `${baseUrl}/images/mail/vakantie/tilques-t2.jpg`,
      items: ["2 overnachtingen", "1× Chambre Charme", "Dagelijks uitgebreid ontbijtbuffet", "3-gangendiner bij Le Vert Mesnil (dag van aankomst)", "Gebruik van het binnenzwembad", "Tennis & jeu de boules", "Late check-out tot 14:00 uur", "Gratis parkeren"],
      checkIn: "di 18 mei · vanaf 15:00 uur",
      checkOut: "do 20 mei · tot 14:00 uur",
    },
    {
      name: "Château Cléry",
      stars: 3,
      address: "Rue du Château, 62360 Hesdin-l'Abbé, Frankrijk",
      image: `${baseUrl}/images/mail/vakantie/clery-c2.jpg`,
      items: ["2 overnachtingen", "1× Chambre Charme", "Dagelijks uitgebreid ontbijtbuffet", "3-gangendiner bij Le Berthier (dag van aankomst)", "Gebruik van de sauna", "Late check-out tot 14:00 uur", "Gratis parkeren"],
      checkIn: "do 20 mei · vanaf 15:00 uur",
      checkOut: "za 22 mei · tot 14:00 uur",
    },
    {
      name: "Hotel Royal Beaulaincourt",
      stars: 4,
      address: "Rue de Beaulaincourt, 62400 Béthune, Frankrijk",
      image: `${baseUrl}/images/mail/vakantie/beaulaincourt-b2.jpg`,
      items: ["2 overnachtingen", "1× Privilege Room", "Dagelijks ontbijt", "3-gangendiner in het restaurant van het hotel (dag van aankomst)", "Welkomstbubbels", "Late check-out tot 15:00 uur"],
      checkIn: "za 22 mei · vanaf 14:00 uur",
      checkOut: "ma 24 mei · tot 15:00 uur",
    },
  ],
  cancelUntil: "zo 18 apr",
  hasBaggage: false,
  tripPrice: "€964",
  bookingFee: "€27,50",
  total: "€991,50",
  routesUrl: "https://vialuxury.vercel.app/multi-hotel-trip/checkout/routes",
  bookingUrl: "https://vialuxury.vercel.app/multi-hotel-trip/account/boekingen/ontdek-noord-frankrijk-en-de-opaalkust-in-7-dagen",
} satisfies Props;
