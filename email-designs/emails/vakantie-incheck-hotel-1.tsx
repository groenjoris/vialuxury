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

// Incheck hotel 1: de dag vóór aankomst van een multi-hotel vakantie. Als de pre-travelmail
// maar zonder hoofdfoto: korte aankondiging ("Morgen is het zover"), direct daaronder het blok
// met het eerste hotel (adres, route, telefoon, inchecken, parkeren, opladen, wat je nog
// betaalt), dan de persoonlijke pagina met praktische informatie en tips, en veelgestelde
// vragen. Geen "boeking beheren"-blok. Header, logo, Trustpilot en footer uit het nieuwsbrief-template.

type Props = {
  recipientName: string;
  recipientEmail: string;
  bookingNumber: string;
  tripType: string;
  tripName: string;
  region: string;
  /** "dinsdag 18 mei" — aankomstdag. */
  arrivalDate: string;
  homeCity: string;
  firstHotel: {
    name: string;
    address: string;
    image: string;
    checkInTime: string;
    parking: string;
    mapsUrl: string;
    /** Telefoonnummer van het hotel (prototype: placeholder). */
    phone: string;
    /** Opladen van de elektrische auto (prototype: placeholder). */
    charging: string;
  };
  tollEstimate: string;
  /** Drie thumbs boven "Praktische informatie en tips": twee uitjes en de routekaart (alle 3:2, even hoog). */
  thumbs: { image: string; alt: string }[];
  routesUrl: string;
  bookingUrl: string;
  mode?: EmailMode;
};

const img = (file: string) => `${baseUrl}/images/mail/${file}`;

const responsiveCss = `
@media only screen and (max-width: 480px) {
  .stack { display: block !important; width: 100% !important; }
  .m-h1 { font-size: 26px !important; }
  .m-kop { font-size: 18px !important; }
  .m-small { font-size: 10px !important; }
  .m-pad { padding-left: 16px !important; padding-right: 16px !important; }
  .m-nopad { padding-left: 0 !important; padding-right: 0 !important; }
  .m-mx-auto { margin-left: auto !important; margin-right: auto !important; }
  .m-only { display: block !important; }
  .m-btn { display: block !important; text-align: center !important; }
  .m-logo { width: 143px !important; }
  .m-trustpilot { width: 80px !important; height: auto !important; }
  .m-hotelimg { width: 100% !important; height: auto !important; margin-bottom: 12px !important; }
  .m-thumb { width: 100% !important; height: auto !important; }
}
`;

export default function VakantieIncheckHotel1({
  recipientName,
  recipientEmail,
  bookingNumber,
  tripType,
  tripName,
  region,
  arrivalDate,
  homeCity,
  firstHotel,
  tollEstimate,
  thumbs,
  routesUrl,
  bookingUrl,
  mode = "light",
}: Props) {
  const c = newsletter[mode];
  const dark = mode === "dark";
  const beige = dark ? "#3A3A3A" : "#F4F1EC";
  const line = c.border;

  const h1 = { fontFamily: font.heading, fontWeight: 600, fontSize: "36px", lineHeight: "1.2", color: c.heading, margin: 0 };
  const kop = { fontFamily: font.heading, fontWeight: 600, fontSize: "24px", lineHeight: "1.3", color: c.heading, margin: 0 };
  const subkop = { fontFamily: font.body, fontWeight: 700, fontSize: "16px", lineHeight: "1.3", color: c.heading, margin: "16px 0 0" };
  const body14 = { fontFamily: font.body, fontSize: "14px", lineHeight: "1.45", color: c.text, margin: "8px 0 0" };
  const small = { fontFamily: font.body, fontSize: "13px", lineHeight: "1.4", color: c.muted, margin: 0 };
  const ctaLink = { fontFamily: font.body, fontSize: "14px", fontWeight: 700, color: c.link, textDecoration: "underline" };

  const faq = [
    {
      q: "Hoe laat kan ik inchecken en uitchecken?",
      a: `Bij ${firstHotel.name} kun je inchecken vanaf ${firstHotel.checkInTime} uur. Bij elk hotel staat de inchecktijd in je boeking; uitchecken kan tot 14:00 uur, zodat je rustig naar het volgende hotel rijdt.`,
    },
    {
      q: "Wat als ik later aankom dan gepland?",
      a: "Geen probleem. Kom je na 19:00 uur aan, bel dan even het hotel (het nummer staat op je persoonlijke reispagina), dan houden ze je kamer en het diner voor je vast.",
    },
    {
      q: "Zijn de diners op een vaste tijd?",
      a: "Het 3-gangendiner op de dag van aankomst reserveert het hotel voor je; je hoort bij het inchecken hoe laat. Wil je liever een ander tijdstip, zeg het dan bij aankomst.",
    },
    {
      q: "Kan ik nog wijzigen of annuleren?",
      a: `Kosteloos annuleren kon tot 30 dagen voor aankomst. Wijzigen van een datum of het aantal personen is vaak nog mogelijk: regel het in je account (log in met je e-mail) of mail ons op service@vialuxury.com met boekingsnummer ${bookingNumber}.`,
    },
    {
      q: "Hoe werkt het doorreizen naar het volgende hotel?",
      a: "Je checkt uit, rijdt de route van die dag (op je reispagina als GPX, PDF of in Google Maps) en meldt je bij de receptie van het volgende hotel met je naam en boekingsnummer. Onderweg kun je de tips van die dag volgen.",
    },
  ];

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{responsiveCss}</style>
      </Head>
      <Preview>Morgen begint je vakantie: de gegevens van je eerste hotel</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          <NewsletterHeader mode={mode} />

          {/* Kop + intro */}
          <Section className="m-pad" style={{ padding: "28px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={h1}>
              Morgen is het zover!
            </Heading>
            <Text style={{ ...body14, margin: "16px 0 0" }}>Beste {recipientName},</Text>
            <Text style={body14}>
              Morgen begint je {tripType.toLowerCase()} <strong>{tripName}</strong>. Hieronder nogmaals de gegevens van je
              eerste hotel. Vergeet je identiteitsbewijs niet!
            </Text>
          </Section>

          {/* Inchecken bij het eerste hotel */}
          <Section className="m-pad" style={{ padding: "24px 32px 0" }}>
            <Text className="m-kop" style={kop}>Je eerste hotel</Text>
            <Section style={{ border: `1px solid ${line}`, borderRadius: "8px", padding: "18px", marginTop: "12px" }}>
              <Row>
                <Column className="stack" style={{ width: "140px", verticalAlign: "top" }}>
                  <Img src={firstHotel.image} alt={firstHotel.name} width="140" height="100" className="m-hotelimg" style={{ borderRadius: "4px", objectFit: "cover", display: "block" }} />
                </Column>
                <Column className="stack m-nopad" style={{ paddingLeft: "18px", verticalAlign: "top" }}>
                  <Text style={{ ...body14, margin: 0, fontSize: "16px", fontWeight: 700 }}>{firstHotel.name}</Text>
                  <Text style={{ ...small, margin: "2px 0 0" }}>
                    <strong style={{ color: c.text }}>Adres</strong> {firstHotel.address}
                  </Text>
                  <Text style={{ margin: "6px 0 0" }}>
                    <Link href={firstHotel.mapsUrl} style={ctaLink}>Route in Google Maps &gt;</Link>
                  </Text>
                  <Text style={{ ...small, margin: "6px 0 0" }}>
                    <strong style={{ color: c.text }}>Telefoon</strong>{" "}
                    <Link href={`tel:${firstHotel.phone.replace(/\s/g, "")}`} style={{ color: c.text, textDecoration: "underline" }}>{firstHotel.phone}</Link>
                  </Text>
                  <Text style={{ ...small, margin: "10px 0 0" }}>
                    <strong style={{ color: c.text }}>Inchecken</strong> morgen, {arrivalDate}, vanaf {firstHotel.checkInTime} uur. Neem je identiteitsbewijs mee.
                  </Text>
                </Column>
              </Row>
              <Text style={subkop}>Parkeren bij het hotel</Text>
              <Text style={{ ...body14, margin: "4px 0 0" }}>{firstHotel.parking}</Text>
              <Text style={subkop}>Opladen van de elektrische auto</Text>
              <Text style={{ ...body14, margin: "4px 0 0" }}>{firstHotel.charging}</Text>
              <Text style={subkop}>Wat moet ik nog betalen?</Text>
              <Text style={{ ...body14, margin: "4px 0 0" }}>
                Niets voor de reis zelf: die is volledig betaald. Ter plekke betaal je alleen nog de lokale toeristenbelasting,
                die rekent elk hotel bij het uitchecken af.
              </Text>
              <Text style={{ ...body14, margin: "6px 0 0" }}>
                Vertrek je vanuit {homeCity}, houd dan rekening met tolwegen (ongeveer {tollEstimate} voor de heen- en terugreis).
              </Text>
            </Section>
          </Section>

          {/* Praktische informatie en tips: de persoonlijke reispagina */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Section style={{ backgroundColor: beige, borderRadius: "8px", padding: "20px" }}>
              <Row>
                {thumbs.map((th, i) => (
                  <Column key={th.alt} className="stack m-nopad" style={{ width: "33.33%", paddingLeft: i === 0 ? 0 : i === thumbs.length - 1 ? "8px" : "4px", paddingRight: i === thumbs.length - 1 ? 0 : i === 0 ? "8px" : "4px", verticalAlign: "top" }}>
                    <Img src={th.image} alt={th.alt} width="178" height="119" className="m-thumb" style={{ display: "block", width: "100%", height: "auto", borderRadius: "6px", objectFit: "cover", marginBottom: "8px" }} />
                  </Column>
                ))}
              </Row>
              <Text className="m-kop" style={{ ...kop, marginTop: "8px" }}>Praktische informatie en tips</Text>
              <Text style={body14}>
                We hebben een pagina speciaal voor jouw reis gemaakt: per hotel de praktische informatie (inchecken, adres,
                parkeren en telefoon), het voorbeeld reisschema met de kaart, de weersverwachting en onze tips voor in de buurt.
              </Text>
              <Button
                href={routesUrl}
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
                Bekijk jouw speciale pagina &gt;
              </Button>
            </Section>
          </Section>

          {/* Veelgestelde vragen */}
          <Section className="m-pad" style={{ padding: "32px 32px 32px" }}>
            <Text className="m-kop" style={kop}>Veelgestelde vragen</Text>
            {faq.map((f) => (
              <Section key={f.q} style={{ borderTop: `1px solid ${line}`, marginTop: "12px", paddingTop: "12px" }}>
                <Text style={{ ...body14, margin: 0, fontWeight: 700, fontSize: "15px" }}>{f.q}</Text>
                <Text style={{ ...body14, margin: "4px 0 0", color: c.muted }}>{f.a}</Text>
              </Section>
            ))}
            <Text style={{ ...body14, margin: "16px 0 0" }}>
              Je volledige boeking bekijken?{" "}
              <Link href={bookingUrl} style={ctaLink}>Bekijk je boeking &gt;</Link>
            </Text>
          </Section>

          <NewsletterFooter recipientEmail={recipientEmail} mode={mode} />
        </Container>
      </Body>
    </Html>
  );
}

VakantieIncheckHotel1.PreviewProps = {
  recipientName: "Rijo Verburg",
  recipientEmail: "rijo.verburg@gmail.com",
  bookingNumber: "VL-11 851 812",
  tripType: "Autovakantie",
  tripName: "Ontdek Noord-Frankrijk en de Opaalkust in 7 dagen",
  region: "Noord-Frankrijk",
  arrivalDate: "dinsdag 18 mei",
  homeCity: "Utrecht",
  firstHotel: {
    name: "Château Tilques",
    address: "Rue du Château, 62500 Tilques, Frankrijk",
    image: `${baseUrl}/images/mail/vakantie/tilques-t2.jpg`,
    checkInTime: "15:00",
    parking: "Je kunt gratis parkeren op het terrein van het kasteel, direct bij de ingang.",
    phone: "+33 3 21 12 34 51",
    charging: "Er is een laadpunt bij het hotel (type 2, 11 kW); meld bij het inchecken dat je wilt laden. Snelladers vind je langs de A26 bij Saint-Omer.",
    mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=Ch%C3%A2teau+Tilques%2C+Rue+du+Ch%C3%A2teau%2C+62500+Tilques",
  },
  tollEstimate: "€24",
  thumbs: [
    { image: `${baseUrl}/images/mail/vakantie/uitje-blancnez-3x2.jpg`, alt: "Cap Blanc-Nez" },
    { image: `${baseUrl}/images/mail/vakantie/uitje-boulogne-3x2.jpg`, alt: "Boulogne-sur-Mer" },
    { image: `${baseUrl}/images/mail/vakantie/routekaart-3x2.jpg`, alt: "Routekaart van de vakantie" },
  ],
  routesUrl: "https://vialuxury.vercel.app/multi-hotel-trip/checkout/routes",
  bookingUrl: "https://vialuxury.vercel.app/multi-hotel-trip/account/boekingen/ontdek-noord-frankrijk-en-de-opaalkust-in-7-dagen",
} satisfies Props;
