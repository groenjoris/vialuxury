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
import MvpLabel from "../components/MvpLabel";
import { hotelBookingRef } from "../lib/hotelBookingRefs";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { baseUrl, font, newsletter, type EmailMode } from "../components/theme";

// Pre-travel: veertien dagen voor vertrek van een multi-hotel vakantie (auto én fiets). Checklist
// ("Niet vergeten": identiteitsbewijs, ViaLuxury Ordernummer, bij de fietsvakantie je fiets), inchecken bij
// het eerste hotel (adres, route, parkeren, opladen of fietsenstalling, wat je nog betaalt; de
// inclusies staan in de incheckmails), de persoonlijke pagina met praktische informatie en tips, "Bekijk je boeking online"
// (inloggen met een code per mail), "Hulp nodig?" en veelgestelde vragen.
// Header en footer zoals in de CRM-mails (zwarte balken over de hele breedte).

type Props = {
  recipientName: string;
  recipientEmail: string;
  /** Annuleringskeuze van de boeking: flexibel annuleren (standaard) of niet terugbetaalbaar. */
  rate?: "flex" | "nonflex";
  /** Uiterste annuleerdatum (30 dagen voor aankomst), bijv. "zo 18 apr". */
  cancelUntil: string;
  bookingNumber: string;
  /** Per hotel het eigen boekingsnummer (10 cijfers), in de volgorde van de reis. */
  hotelBookingRefs: { name: string; ref: string }[];
  tripType: string;
  tripName: string;
  /** Fietsvakantie: "Je fiets" in de checklist, fietsenstalling i.p.v. opladen, fietsen i.p.v. rijden. */
  isBike?: boolean;
  region: string;
  /** "dinsdag 18 mei" — aankomstdag. */
  arrivalDate: string;
  firstHotel: {
    name: string;
    address: string;
    image: string;
    checkInTime: string;
    parking: string;
    mapsUrl: string;
    /** Telefoonnummer van het hotel (prototype: placeholder). */
    phone: string;
    /** Opladen van de elektrische auto (autovakantie; prototype: placeholder). */
    charging?: string;
    /** Fietsenstalling (fietsvakantie). */
    bikeStorage?: string;
  };
  /** Hoofdfoto van de reis bovenin. */
  heroImage: string;
  /** Drie thumbs boven "Praktische informatie en tips": twee uitjes en de routekaart (alle 3:2, even hoog). */
  thumbs: { image: string; alt: string }[];
  routesUrl: string;
  /** Boeking in het account (blok "Bekijk je boeking online"); in de MVP het boekingenoverzicht. */
  bookingUrl: string;
  /** MVP 12-11-2026: label "MHR MVP" bovenin en zonder het blok "Praktische informatie en tips" (de MVP heeft geen tipspagina). */
  mvp?: boolean;
  mode?: EmailMode;
};

const img = (file: string) => `${baseUrl}/images/mail/${file}`;
/** Annuleringsformulier in het prototype (mockup van vialuxury.com/nl-NL/cancel); de MVP-mails linken naar de MVP-kopie. */
const cancelUrl = (bookingNumber: string, mvp: boolean) => `https://vialuxury.vercel.app/${mvp ? "mvp-trip" : "multi-hotel-trip"}/annuleren?bookingId=${encodeURIComponent(bookingNumber)}`;

const responsiveCss = `
@media only screen and (max-width: 480px) {
  .stack { display: block !important; width: 100% !important; }
  .m-center { text-align: center !important; }
  .m-mt { margin-top: 16px !important; }
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

export default function VakantiePreTravel({
  recipientName,
  recipientEmail,
  rate = "flex",
  cancelUntil,
  bookingNumber,
  hotelBookingRefs,
  tripType,
  tripName,
  isBike = false,
  region,
  arrivalDate,
  firstHotel,
  heroImage,
  thumbs,
  routesUrl,
  bookingUrl,
  mvp = false,
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
  const small = { fontFamily: font.body, fontSize: "14px", lineHeight: "1.4", color: c.muted, margin: 0 };
  const ctaLink = { fontFamily: font.body, fontSize: "14px", fontWeight: 700, color: c.link, textDecoration: "underline" };
  /** Links in het hotelblok (route, telefoon): oranje en onderstreept, zoals alle tekstlinks (huisstijl). */
  const plainLink = { color: c.link, textDecoration: "underline" };
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const check = img(dark ? "check-dark.png" : "check.png");

  const faq = [
    {
      q: "Hoe laat kan ik inchecken en uitchecken?",
      a: `Bij ${firstHotel.name} kun je inchecken vanaf ${firstHotel.checkInTime} uur. Bij elk hotel staan de in- en uitchecktijden in je boeking, zodat je rustig naar het volgende hotel ${isBike ? "fietst" : "rijdt"}.`,
    },
    {
      // Tekst uit "faq mhr.xlsx" (Pre-travel); het annuleerantwoord volgt het tarief. "Wat moet ik nog
      // betalen?" staat niet in de FAQ maar in het blok van het eerste hotel.
      q: "Kan ik nog wijzigen of annuleren?",
      // Flex: onder het antwoord de link naar het annuleringsformulier (zoals op de bevestigingspagina).
      link: rate === "flex" ? { label: "Boeking annuleren", href: cancelUrl(bookingNumber, mvp) } : undefined,
      a: `Het wijzigen van een boeking is niet mogelijk. ${rate === "nonflex"
        ? "Tijdens het boeken heb je ervoor gekozen om niet-terugbetaalbaar te boeken. Daardoor is het niet mogelijk om zelf je boeking te annuleren. Het kan zijn dat de klantenservice je wel bepaalde opties kan geven; neem daarom tijdens openingstijden contact met hen op."
        : `Omdat je flexibel annuleren hebt aangezet, kun je je boeking annuleren t/m ${cancelUntil}, 23:59 uur. Het is niet mogelijk individuele onderdelen van je boeking aan te passen. Wil je de datum van vertrek aanpassen, dan dien je de gehele boeking te annuleren en opnieuw te boeken. Let op: voor de boekingskosten ontvang je een voucher die je weer kunt gebruiken bij je nieuwe boeking.`}`,
    },
  ];

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{responsiveCss}</style>
      </Head>
      <Preview>Je checklist: identiteitsbewijs, ViaLuxury Ordernummer{isBike ? ", je fiets" : ""} en inchecken bij {firstHotel.name}.</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        {mvp && <MvpLabel mode={mode} />}
        <CrmHeader mode={mode} />
        <Container style={{ width: "100%", maxWidth: "626px" }}>

          {/* Hoofdfoto van de reis */}
          <Img src={heroImage} alt={tripName} width="626" height="300" style={{ display: "block", width: "100%", height: "auto", objectFit: "cover" }} />

          {/* Kop + intro */}
          <Section className="m-pad" style={{ padding: "28px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={h1}>
              Ben je klaar voor je vakantie?
            </Heading>
            <Text style={{ ...body14, margin: "16px 0 0" }}>Beste {recipientName},</Text>
            <Text style={body14}>
              Het is bijna zover: op {arrivalDate} begint je {tripType.toLowerCase()} <strong>{tripName}</strong>. Hieronder
              staat alles wat je vooraf wilt weten, zodat je ontspannen kunt vertrekken. Je boeking zelf is helemaal rond.
            </Text>
          </Section>

          {/* Niet vergeten */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Text className="m-kop" style={kop}>Niet vergeten</Text>
            <Section style={{ backgroundColor: beige, borderRadius: "8px", padding: "16px 18px", marginTop: "12px" }}>
              <Row>
                <Column style={{ width: "32px", verticalAlign: "top" }}>
                  <Img src={check} alt="" width="22" height="22" />
                </Column>
                <Column style={{ verticalAlign: "top" }}>
                  <Text style={{ ...body14, margin: 0, fontWeight: 700 }}>Geldig identiteitsbewijs</Text>
                  <Text style={{ ...small, margin: "2px 0 0" }}>Paspoort, rijbewijs of ID-kaart; de hotels vragen ernaar bij het inchecken.</Text>
                </Column>
              </Row>
              <Row style={{ marginTop: "12px" }}>
                <Column style={{ width: "32px", verticalAlign: "top" }}>
                  <Img src={check} alt="" width="22" height="22" />
                </Column>
                <Column style={{ verticalAlign: "top" }}>
                  <Text style={{ ...body14, margin: 0, fontWeight: 700 }}>Je ViaLuxury Ordernummer: {bookingNumber}</Text>
                  <Text style={{ ...small, margin: "2px 0 0" }}>
                    Voor de zekerheid, neem het mee. Het is hetzelfde ViaLuxury Ordernummer voor alle hotels; het staat ook in je account.
                  </Text>
                </Column>
              </Row>
              {/* Hotelboekingsnummers: elk hotel heeft zijn eigen nummer; de drie hotels onder elkaar. */}
              <Row style={{ marginTop: "12px" }}>
                <Column style={{ width: "32px", verticalAlign: "top" }}>
                  <Img src={check} alt="" width="22" height="22" />
                </Column>
                <Column style={{ verticalAlign: "top" }}>
                  <Text style={{ ...body14, margin: 0, fontWeight: 700 }}>Je hotelboekingsnummers</Text>
                  <Text style={{ ...small, margin: "2px 0 0" }}>
                    Elk hotel heeft daarnaast zijn eigen boekingsnummer; noem dat bij het inchecken.
                  </Text>
                  {hotelBookingRefs.map((h) => (
                    <Text key={h.name} style={{ ...small, margin: "4px 0 0" }}>
                      {h.name}: <strong style={{ color: c.text, letterSpacing: "0.04em" }}>{h.ref}</strong>
                    </Text>
                  ))}
                </Column>
              </Row>
              {isBike && (
                <Row style={{ marginTop: "12px" }}>
                  <Column style={{ width: "32px", verticalAlign: "top" }}>
                    <Img src={check} alt="" width="22" height="22" />
                  </Column>
                  <Column style={{ verticalAlign: "top" }}>
                    <Text style={{ ...body14, margin: 0, fontWeight: 700 }}>Je fiets</Text>
                    <Text style={{ ...small, margin: "2px 0 0" }}>
                      Zorg dat je een goed onderhouden fiets bij je hebt; fietshuur is niet bij de boeking inbegrepen. Bij elk hotel is een afgesloten stalling.
                    </Text>
                  </Column>
                </Row>
              )}
            </Section>
          </Section>

          {/* Inchecken bij het eerste hotel */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Text className="m-kop" style={kop}>Inchecken bij je eerste hotel</Text>
            <Section style={{ border: `1px solid ${line}`, borderRadius: "8px", padding: "18px", marginTop: "12px" }}>
              <Row>
                <Column className="stack" style={{ width: "140px", verticalAlign: "top" }}>
                  <Img src={firstHotel.image} alt={firstHotel.name} width="140" height="100" className="m-hotelimg" style={{ borderRadius: "4px", objectFit: "cover", display: "block" }} />
                </Column>
                <Column className="stack m-nopad" style={{ paddingLeft: "18px", verticalAlign: "top" }}>
                  {/* Naast de foto alleen naam en adres (niet hoger dan de foto); de rest als subkopjes eronder. */}
                  <Text style={{ ...body14, margin: 0, fontSize: "16px", fontWeight: 700 }}>{firstHotel.name}</Text>
                  <Text style={{ ...small, margin: "2px 0 0" }}>{firstHotel.address}</Text>
                  {/* Route vlak onder het adres (hoort erbij); de telefoon met wat lucht erboven. */}
                  <Text style={{ ...small, margin: "2px 0 0" }}>
                    <Link href={firstHotel.mapsUrl} style={plainLink}>Routebeschrijving in Google Maps</Link>
                  </Text>
                  <Text style={{ ...small, margin: "10px 0 0" }}>
                    <Link href={`tel:${firstHotel.phone.replace(/\s/g, "")}`} style={plainLink}>{firstHotel.phone}</Link>
                  </Text>
                </Column>
              </Row>
              <Text style={subkop}>Inchecken</Text>
              <Text style={{ ...body14, margin: "4px 0 0" }}>{cap(arrivalDate)} vanaf {firstHotel.checkInTime} uur.</Text>
              <Text style={subkop}>Parkeren bij het hotel</Text>
              <Text style={{ ...body14, margin: "4px 0 0" }}>{firstHotel.parking}</Text>
              {firstHotel.charging && (
                <>
                  <Text style={subkop}>Opladen van de elektrische auto</Text>
                  <Text style={{ ...body14, margin: "4px 0 0" }}>{firstHotel.charging}</Text>
                </>
              )}
              {firstHotel.bikeStorage && (
                <>
                  <Text style={subkop}>Fietsenstalling</Text>
                  <Text style={{ ...body14, margin: "4px 0 0" }}>{firstHotel.bikeStorage}</Text>
                </>
              )}
              <Text style={subkop}>Wat moet ik nog betalen?</Text>
              <Text style={{ ...body14, margin: "4px 0 0" }}>
                Je betaalt bij aankomst toeristenbelasting en eventueel een gemeentelijke of lokale toeslag.
              </Text>
            </Section>
          </Section>

          {/* Praktische informatie en tips: de persoonlijke reispagina (niet in de MVP: geen tipspagina) */}
          {!mvp && (
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
                Bekijk jouw speciale pagina
              </Button>
            </Section>
          </Section>
          )}

          {/* Bekijk je boeking online: simpel beige blok met alleen een link naar het account (inloggen met een
              code per mail, geen wachtwoord). Belooft niets over wijzigen of beheren. */}
          <Section className="m-pad" style={{ padding: "24px 32px 0" }}>
            <Section style={{ backgroundColor: beige, borderRadius: "8px", padding: "20px" }}>
              <Text className="m-kop" style={kop}>Bekijk je boeking online</Text>
              <Text style={body14}>
                Log in bij je account met het e-mailadres waarmee je hebt geboekt. Je ontvangt dan een inlogcode per mail; een
                wachtwoord heb je niet nodig.
              </Text>
              <Text style={{ margin: "12px 0 0" }}>
                <Link href={bookingUrl} style={ctaLink}>Bekijk je boeking online</Link>
              </Text>
            </Section>
          </Section>

          <HelpBanner mode={mode} />

          {/* Veelgestelde vragen */}
          <Section className="m-pad" style={{ padding: "32px 32px 32px" }}>
            <Text className="m-kop" style={kop}>Veelgestelde vragen</Text>
            {faq.map((f) => (
              <Section key={f.q} style={{ borderTop: `1px solid ${line}`, marginTop: "12px", paddingTop: "12px" }}>
                <Text style={{ ...body14, margin: 0, fontWeight: 700, fontSize: "16px" }}>{f.q}</Text>
                <Text style={{ ...body14, margin: "4px 0 0", color: c.muted }}>{f.a}</Text>
                {f.link && (
                  <Text style={{ margin: "8px 0 0" }}>
                    <Link href={f.link.href} style={ctaLink}>{f.link.label}</Link>
                  </Text>
                )}
              </Section>
            ))}
          </Section>

        </Container>
        <CrmFooter recipientEmail={recipientEmail} reason="omdat je bij ons boekte" transactional mode={mode} />
      </Body>
    </Html>
  );
}

VakantiePreTravel.PreviewProps = {
  recipientName: "Rijo Verburg",
  recipientEmail: "rijo.verburg@gmail.com",
  cancelUntil: "zo 18 apr",
  bookingNumber: "VL-11 851 812",
  hotelBookingRefs: ["Château Tilques", "Château Cléry", "Hotel Royal Beaulaincourt"].map((name) => ({ name, ref: hotelBookingRef(name) })),
  tripType: "Autovakantie",
  tripName: "Ontdek Noord-Frankrijk en de Opaalkust in 7 dagen",
  region: "Noord-Frankrijk",
  arrivalDate: "dinsdag 18 mei",
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
  heroImage: `${baseUrl}/images/mail/vakantie/opaalkust-hero.jpg`,
  thumbs: [
    { image: `${baseUrl}/images/mail/vakantie/uitje-blancnez-3x2.jpg`, alt: "Cap Blanc-Nez" },
    { image: `${baseUrl}/images/mail/vakantie/uitje-boulogne-3x2.jpg`, alt: "Boulogne-sur-Mer" },
    { image: `${baseUrl}/images/mail/vakantie/routekaart-3x2.jpg`, alt: "Routekaart van de vakantie" },
  ],
  routesUrl: "https://vialuxury.vercel.app/multi-hotel-trip/checkout/routes",
  bookingUrl: "https://vialuxury.vercel.app/multi-hotel-trip/account/boekingen/ontdek-noord-frankrijk-en-de-opaalkust-in-7-dagen",
} satisfies Props;

/** Fietsvakantie (Twente & Salland): zelfde mail, andere boeking — je fiets in de checklist, stalling i.p.v. opladen, geen tol. */
export const fietsPreviewProps = {
  ...VakantiePreTravel.PreviewProps,
  cancelUntil: "za 8 mei",
  bookingNumber: "VL-85 584 493",
  hotelBookingRefs: ["Hotel Wapen van Delden", "Hotel de Zwaan", "Landhuishotel Herikerberg"].map((name) => ({ name, ref: hotelBookingRef(name) })),
  tripType: "Fietsvakantie",
  tripName: "7-daagse fietsvakantie Twente & Salland: Delden – Raalte – Markelo incl. dagelijks 3-gangendiner",
  isBike: true,
  region: "Twente & Salland",
  arrivalDate: "maandag 7 juni",
  firstHotel: {
    name: "Hotel Wapen van Delden",
    address: "Langestraat 242, 7491 AM Delden",
    image: `${baseUrl}/images/vakanties/007/hotel-wapen-van-delden.jpg`,
    checkInTime: "15:00",
    parking: "Gratis parkeren bij het hotel, de hele vakantie: je auto blijft hier staan terwijl je fietst.",
    phone: "+31 74 376 1234",
    bikeStorage: "Afgesloten fietsenstalling bij het hotel, met laadpunt voor e-bikes.",
    mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=Hotel+Wapen+van+Delden%2C+Delden",
  },
  heroImage: `${baseUrl}/images/vakanties/cover/fietsvakantie-twente-salland-bos.jpg`,
  thumbs: [
    { image: `${baseUrl}/images/mail/vakantie/fiets-twickel-3x2.jpg`, alt: "Kasteel Twickel" },
    { image: `${baseUrl}/images/mail/vakantie/fiets-ijssel-3x2.jpg`, alt: "De IJssel bij Deventer" },
    { image: `${baseUrl}/images/mail/vakantie/fiets-routekaart-3x2.jpg`, alt: "Routekaart van de fietsvakantie" },
  ],
  routesUrl: "https://vialuxury.vercel.app/multi-hotel-trip/checkout/routes?demo=fiets",
  bookingUrl: "https://vialuxury.vercel.app/multi-hotel-trip/account/boekingen/fietsvakantie-twente-en-salland-delden-raalte-markelo?demo=fiets",
} satisfies Props;
