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
import HelpBanner from "../components/HelpBanner";
import NewsletterFooter from "../components/NewsletterFooter";
import NewsletterHeader from "../components/NewsletterHeader";
import { baseUrl, font, newsletter, type EmailMode } from "../components/theme";

// Incheckmail: de dag vóór het inchecken bij hotel 1, 2 of 3 van een multi-hotel vakantie
// (auto of fiets). Kort, met de belangrijkste dingen benadrukt: korte intro (bij hotel 2 en 3
// terugblik op het vorige hotel en bij de fietsvakantie de bagage vóór 9:00 uur bij de
// receptie), "Morgen in het kort", het blok met het komende hotel (adres, route, telefoon,
// inchecken, parkeren/stalling, opladen/bagagetransfer), de persoonlijke pagina met praktische
// informatie en tips, "Hulp nodig?" en veelgestelde vragen. Geen hoofdfoto, geen "boeking
// beheren"-blok. Data per reis en hotel staat in lib/incheckMails.ts.

export type IncheckHotel = {
  name: string;
  city: string;
  address: string;
  image: string;
  phone: string;
  mapsUrl: string;
  checkInTime: string;
  checkOutTime: string;
  /** Auto: parkeren en opladen. */
  parking?: string;
  charging?: string;
  /** Fiets: stalling. */
  bikeStorage?: string;
};

export type IncheckProps = {
  recipientName: string;
  recipientEmail: string;
  bookingNumber: string;
  tripType: string;
  tripName: string;
  isBike: boolean;
  /** 1, 2 of 3. */
  hotelIndex: number;
  hotelCount: number;
  /** Het hotel waar je morgen incheckt. */
  hotel: IncheckHotel;
  /** Het hotel waar je morgen uitcheckt (vanaf hotel 2). */
  previousHotel?: IncheckHotel;
  /** "dinsdag 18 mei" — de incheckdag (morgen). */
  arrivalDate: string;
  /** Etappe vanaf het vorige hotel (vanaf hotel 2). */
  travel?: { km: number; duration: string };
  /** Hotel 1: reistijd vanuit huis, bv. "ca. 3 uur 45 min vanuit Utrecht". */
  homeTravel?: string;
  /** Hotel 1, auto: tolkosten heen en terug. */
  tollEstimate?: string;
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

export default function VakantieIncheckHotel({
  recipientName,
  recipientEmail,
  bookingNumber,
  tripType,
  tripName,
  isBike,
  hotelIndex,
  hotelCount,
  hotel,
  previousHotel,
  arrivalDate,
  travel,
  homeTravel,
  tollEstimate,
  thumbs,
  routesUrl,
  bookingUrl,
  mode = "light",
}: IncheckProps) {
  const c = newsletter[mode];
  const dark = mode === "dark";
  const beige = dark ? "#3A3A3A" : "#F4F1EC";
  const line = c.border;
  const first = hotelIndex === 1;
  const last = hotelIndex === hotelCount;
  const typeWord = tripType.toLowerCase();

  const h1 = { fontFamily: font.heading, fontWeight: 600, fontSize: "36px", lineHeight: "1.2", color: c.heading, margin: 0 };
  const kop = { fontFamily: font.heading, fontWeight: 600, fontSize: "24px", lineHeight: "1.3", color: c.heading, margin: 0 };
  const subkop = { fontFamily: font.body, fontWeight: 700, fontSize: "16px", lineHeight: "1.3", color: c.heading, margin: "16px 0 0" };
  const body14 = { fontFamily: font.body, fontSize: "14px", lineHeight: "1.45", color: c.text, margin: "8px 0 0" };
  const small = { fontFamily: font.body, fontSize: "13px", lineHeight: "1.4", color: c.muted, margin: 0 };
  const ctaLink = { fontFamily: font.body, fontSize: "14px", fontWeight: 700, color: c.link, textDecoration: "underline" };
  const check = img(dark ? "check-dark.png" : "check.png");

  /* Morgen in het kort: de dingen die je niet mag missen. */
  const bullets: { title: string; text?: string }[] = first
    ? [
        { title: `Inchecken bij ${hotel.name} vanaf ${hotel.checkInTime} uur`, text: homeTravel ? `Reistijd ${homeTravel}.` : undefined },
        { title: "Neem je identiteitsbewijs mee", text: "Paspoort, rijbewijs of ID-kaart; het hotel vraagt ernaar bij het inchecken." },
        { title: `Je boekingsnummer: ${bookingNumber}`, text: "Hetzelfde nummer voor alle hotels." },
      ]
    : [
        ...(isBike && previousHotel
          ? [{ title: `Bagage vóór 9:00 uur bij de receptie van ${previousHotel.name}`, text: "Eén koffer of tas per persoon; die reist vooruit en staat 's middags klaar in je volgende hotel." }]
          : []),
        ...(previousHotel ? [{ title: `Uitchecken bij ${previousHotel.name} tot ${previousHotel.checkOutTime} uur` }] : []),
        ...(travel ? [{ title: `${travel.km} km naar ${hotel.city}`, text: `${travel.duration}. De route staat op je persoonlijke reispagina.` }] : []),
        { title: `Inchecken bij ${hotel.name} vanaf ${hotel.checkInTime} uur`, text: "Neem je identiteitsbewijs mee." },
      ];

  const faq = first
    ? [
        {
          q: "Hoe laat kan ik inchecken en uitchecken?",
          a: `Bij ${hotel.name} kun je inchecken vanaf ${hotel.checkInTime} uur en uitchecken tot ${hotel.checkOutTime} uur. Bij elk hotel staat de tijd in je boeking.`,
        },
        {
          q: "Wat als ik later aankom dan gepland?",
          a: `Geen probleem. Kom je na 19:00 uur aan, bel dan even het hotel (${hotel.phone}), dan houden ze je kamer en het diner voor je vast.`,
        },
        {
          q: "Zijn de diners op een vaste tijd?",
          a: "Het diner op de dag van aankomst reserveert het hotel voor je; je hoort bij het inchecken hoe laat. Wil je liever een ander tijdstip, zeg het dan bij aankomst.",
        },
        {
          q: "Wat betaal ik nog in het hotel?",
          a: "Alleen de lokale toeristenbelasting, die rekent het hotel bij het uitchecken af. De rest van je vakantie is al betaald.",
        },
      ]
    : [
        {
          q: "Hoe laat moet ik uitchecken?",
          a: `Bij ${previousHotel?.name ?? "je hotel"} kun je uitchecken tot ${previousHotel?.checkOutTime ?? "11:00"} uur. Je meldt je bij de receptie; de toeristenbelasting reken je daar af.`,
        },
        ...(isBike
          ? [{
              q: "Hoe werkt de bagagetransfer?",
              a: `Zet morgen vóór 9:00 uur per persoon één koffer of tas bij de receptie van ${previousHotel?.name ?? "je hotel"}. Hij wordt opgehaald en staat 's middags klaar in ${hotel.name}. Jij fietst met alleen een dagtas.`,
            }]
          : []),
        {
          q: "Wat als ik later aankom dan gepland?",
          a: `Geen probleem. Kom je na 19:00 uur aan, bel dan even ${hotel.name} (${hotel.phone}), dan houden ze je kamer en het diner voor je vast.`,
        },
        {
          q: "Is het diner op een vaste tijd?",
          a: "Het diner op de dag van aankomst reserveert het hotel voor je; je hoort bij het inchecken hoe laat.",
        },
      ];

  const preview = first ? "Morgen begint je vakantie: de gegevens van je eerste hotel" : `Morgen naar ${hotel.name} in ${hotel.city}`;

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{responsiveCss}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          <NewsletterHeader mode={mode} />

          {/* Kop + intro */}
          <Section className="m-pad" style={{ padding: "28px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={h1}>
              {first ? "Morgen is het zover!" : `Morgen naar ${hotel.city}`}
            </Heading>
            <Text style={{ ...body14, margin: "16px 0 0" }}>Beste {recipientName},</Text>
            {first ? (
              <Text style={body14}>
                Morgen begint je {typeWord} <strong>{tripName}</strong>. Hieronder nogmaals de gegevens van je eerste hotel.
                Vergeet je identiteitsbewijs niet!
              </Text>
            ) : (
              <>
                <Text style={body14}>
                  Hopelijk heb je genoten van {previousHotel?.name} in {previousHotel?.city}, deel {hotelIndex - 1} van je {typeWord}.
                  Morgen {isBike ? "fiets" : "rijd"} je door naar <strong>{hotel.name}</strong> in {hotel.city}
                  {last ? ", het laatste hotel van je reis" : ""}. Hieronder nogmaals de gegevens.
                </Text>
                {isBike && (
                  <Text style={{ ...body14, fontWeight: 700 }}>
                    Zorg dat morgen je bagage vóór 9:00 uur bij de receptie staat voor de bagagetransfer.
                  </Text>
                )}
              </>
            )}
          </Section>

          {/* Morgen in het kort */}
          <Section className="m-pad" style={{ padding: "24px 32px 0" }}>
            <Text className="m-kop" style={kop}>Morgen in het kort</Text>
            <Section style={{ backgroundColor: beige, borderRadius: "8px", padding: "16px 18px", marginTop: "12px" }}>
              {bullets.map((b, i) => (
                <Row key={b.title} style={{ marginTop: i === 0 ? 0 : "12px" }}>
                  <Column style={{ width: "32px", verticalAlign: "top" }}>
                    <Img src={check} alt="" width="22" height="22" />
                  </Column>
                  <Column style={{ verticalAlign: "top" }}>
                    <Text style={{ ...body14, margin: 0, fontWeight: 700 }}>{b.title}</Text>
                    {b.text && <Text style={{ ...small, margin: "2px 0 0" }}>{b.text}</Text>}
                  </Column>
                </Row>
              ))}
            </Section>
          </Section>

          {/* Het komende hotel */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Text className="m-kop" style={kop}>{first ? "Je eerste hotel" : last ? "Je laatste hotel" : "Je volgende hotel"}</Text>
            <Section style={{ border: `1px solid ${line}`, borderRadius: "8px", padding: "18px", marginTop: "12px" }}>
              <Row>
                <Column className="stack" style={{ width: "140px", verticalAlign: "top" }}>
                  <Img src={hotel.image} alt={hotel.name} width="140" height="100" className="m-hotelimg" style={{ borderRadius: "4px", objectFit: "cover", display: "block" }} />
                </Column>
                <Column className="stack m-nopad" style={{ paddingLeft: "18px", verticalAlign: "top" }}>
                  <Text style={{ ...body14, margin: 0, fontSize: "16px", fontWeight: 700 }}>{hotel.name}</Text>
                  <Text style={{ ...small, margin: "2px 0 0" }}>
                    <strong style={{ color: c.text }}>Adres</strong> {hotel.address}
                  </Text>
                  <Text style={{ margin: "6px 0 0" }}>
                    <Link href={hotel.mapsUrl} style={ctaLink}>Route in Google Maps &gt;</Link>
                  </Text>
                  <Text style={{ ...small, margin: "6px 0 0" }}>
                    <strong style={{ color: c.text }}>Telefoon</strong>{" "}
                    <Link href={`tel:${hotel.phone.replace(/\s/g, "")}`} style={{ color: c.text, textDecoration: "underline" }}>{hotel.phone}</Link>
                  </Text>
                  <Text style={{ ...small, margin: "10px 0 0" }}>
                    <strong style={{ color: c.text }}>Inchecken</strong> morgen, {arrivalDate}, vanaf {hotel.checkInTime} uur. Neem je identiteitsbewijs mee.
                  </Text>
                </Column>
              </Row>
              {isBike ? (
                <>
                  {hotel.bikeStorage && (
                    <>
                      <Text style={subkop}>Fietsenstalling</Text>
                      <Text style={{ ...body14, margin: "4px 0 0" }}>{hotel.bikeStorage}</Text>
                    </>
                  )}
                  <Text style={subkop}>Bagagetransfer</Text>
                  <Text style={{ ...body14, margin: "4px 0 0" }}>
                    {first
                      ? "Op elke wisseldag zet je per persoon één koffer of tas vóór 9:00 uur bij de receptie; die reist vooruit naar je volgende hotel. Bij het hotel krijg je er meer informatie over."
                      : `Je koffer wordt morgen vóór 9:00 uur opgehaald bij de receptie van ${previousHotel?.name} en staat 's middags klaar in ${hotel.name}. Jij fietst met alleen een dagtas.`}
                  </Text>
                </>
              ) : (
                <>
                  {hotel.parking && (
                    <>
                      <Text style={subkop}>Parkeren bij het hotel</Text>
                      <Text style={{ ...body14, margin: "4px 0 0" }}>{hotel.parking}</Text>
                    </>
                  )}
                  {hotel.charging && (
                    <>
                      <Text style={subkop}>Opladen van de elektrische auto</Text>
                      <Text style={{ ...body14, margin: "4px 0 0" }}>{hotel.charging}</Text>
                    </>
                  )}
                </>
              )}
              {first && (
                <>
                  <Text style={subkop}>Wat moet ik nog betalen?</Text>
                  <Text style={{ ...body14, margin: "4px 0 0" }}>
                    Niets voor de reis zelf: die is volledig betaald. Ter plekke betaal je alleen nog de lokale toeristenbelasting,
                    die rekent elk hotel bij het uitchecken af.
                  </Text>
                  {tollEstimate && (
                    <Text style={{ ...body14, margin: "6px 0 0" }}>
                      Houd onderweg rekening met tolwegen (ongeveer {tollEstimate} voor de heen- en terugreis).
                    </Text>
                  )}
                </>
              )}
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
                Op jouw persoonlijke reispagina staat alles bij elkaar: per hotel de praktische informatie (inchecken, adres,
                {isBike ? " stalling" : " parkeren"} en telefoon), de {isBike ? "fietsroutes" : "routes"}, het reisschema met de kaart, het weer en onze tips voor in de buurt
                {first ? "" : ` van ${hotel.city}`}.
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

          <HelpBanner mode={mode} />

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
