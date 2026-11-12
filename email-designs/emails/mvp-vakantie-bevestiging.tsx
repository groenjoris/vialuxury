import {
  Body,
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
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { baseUrl, font, newsletter, type EmailMode } from "../components/theme";

// MVP 12-11-2026 — kopie van de boekingsbevestiging van Multi Hotel Trip, uitgekleed naar de
// MVP-definitie (wijzigingen alleen hier, de volledige versie blijft staan): geen blok "Tips
// voor je reis" (de MVP heeft geen tipspagina). Subtiel variant-label "MHR MVP" bovenin voor de developers.
//
// Boekingsbevestiging van een multi-hotel vakantie (Multi Hotel Trip). Header, logo,
// Trustpilot en footer zoals in de CRM-mails (zwarte balken over de hele breedte); daartussen dezelfde opbouw als
// de linkerkolom van de bevestigingspagina in het prototype: kop, aanhef, boekings-
// nummer, de kassabon (reis, per hotel foto/naam/sterren/adres, lijst met nachten en
// inclusies, check-in/check-out, flexibel annuleren, prijs), dan Tips voor je reis,
// Boeking terugvinden, de veelgestelde vragen (uitgeklapt) en onderaan het blok "Annuleren of wijzigen"
// (tekst per tarief, oranje tekstlink "Mijn boeking annuleren" naar het annuleringsformulier, daaronder de afsluiting).

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
  /** Annuleringskeuze: flexibel annuleren (standaard) of niet terugbetaalbaar. */
  rate?: "flex" | "nonflex";
  hasBaggage?: boolean;
  tripPrice: string;
  bookingFee: string;
  total: string;
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
  .m-num { margin-bottom: 10px !important; }
  .m-mx-auto { margin-left: auto !important; margin-right: auto !important; }
  .m-only { display: block !important; }
  .m-btn { display: block !important; text-align: center !important; }
  .m-logo { width: 143px !important; }
  .m-trustpilot { width: 80px !important; height: auto !important; }
  .m-hotelimg { width: 100% !important; height: auto !important; margin-bottom: 12px !important; }
}
`;

/** Placeholder voor het bestaande annuleringsformulier (link "Mijn boeking annuleren"). */
const CANCEL_FORM_URL = "https://vialuxury.nl/annuleren";
/** Servicecentrum (veelgestelde vragen). */
const SERVICE_URL = "https://vialuxury.nl/klantenservice";

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
  rate = "flex",
  tripPrice,
  bookingFee,
  total,
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
  const textLink = { color: c.link, textDecoration: "underline", fontWeight: 700 }; // tekstlinks altijd oranje (huisstijl)
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

  /* Veelgestelde vragen — teksten uit "faq mhr.xlsx" (Boekingsbevestiging en boekingspagina); het
     annuleerantwoord volgt het tarief, met de uiterste datum en 23:59 uur. */
  const faq: { q: string; a: React.ReactNode }[] = [
    {
      q: "Hoe kan ik annuleren of wijzigen?",
      a: `Het wijzigen van een boeking is niet mogelijk. ${rate === "nonflex"
        ? "Tijdens het boeken heb je ervoor gekozen om niet-terugbetaalbaar te boeken. Daardoor is het niet mogelijk om zelf je boeking te annuleren. Het kan zijn dat de klantenservice je wel bepaalde opties kan geven; neem daarom tijdens openingstijden contact met hen op."
        : `Omdat je flexibel annuleren hebt aangezet, kun je je boeking annuleren t/m ${cancelUntil}, 23:59 uur. Het is niet mogelijk individuele onderdelen van je boeking aan te passen. Wil je de datum van vertrek aanpassen, dan dien je de gehele boeking te annuleren en opnieuw te boeken. Let op: voor de boekingskosten ontvang je een voucher die je weer kunt gebruiken bij je nieuwe boeking.`}`,
    },
    {
      q: "Hoe log ik in op mijn account?",
      a: (
        <>
          Ga naar <Link href="https://vialuxury.com/nl-NL/inloggen" style={textLink}>vialuxury.com/nl-NL/inloggen</Link>, vul daar het e-mailadres in waarmee je geboekt hebt en je ontvangt direct de inlogcode in de mail.
        </>
      ),
    },
    {
      q: `Hoe werkt het inchecken bij ${hotels.length} hotels?`,
      a: "Je kunt je gewoon bij de receptie melden en inchecken met je naam en je boekingsnummer. De meeste hotels verplichten een identificatiedocument zoals een rijbewijs of een paspoort van de hoofdboeker. Bij sommige hotels moet iedereen zich identificeren. Let op: een kopie volstaat niet en zonder geldig document kan een hotel weigeren je toe te laten.",
    },
    {
      q: "Wat betaal ik nog in de hotels?",
      a: "In principe betaal je bij de hotels niet meer voor hetgeen in het arrangement zit. Verblijf je ergens meerdere dagen, dan kan het dus zijn dat niet alle diners of de lunch in het arrangement zitten. In de meeste gevallen is het arrangement eveneens zonder drankjes en dien je bij het uitchecken deze dus te voldoen. Daarnaast zal je in de meeste gevallen de gemeentelijke toeristenbelasting moeten voldoen en in uitzonderlijke gevallen ook een lokale toeslag. Daarnaast is het mogelijk dat je gevraagd wordt een borg af te geven d.m.v. een reservering op een creditcard of een borg in cash.",
    },
    {
      q: "Zijn de attracties uit de tips inbegrepen?",
      a: "Alle onderdelen van het arrangement vind je terug in je boekingsbevestiging. De tips zijn hier niet vermeld en zijn dus niet inbegrepen of onderdeel van het arrangement. Je kunt dan ook zelf besluiten deze tips onderdeel te laten zijn van je reis.",
    },
    {
      q: "Ik heb mijn e-mailadres verkeerd ingevuld",
      a: "Geen zorgen, neem tijdens openingstijden of via de mail contact op met de klantenservice via info@vialuxury.com of +31 20 705 2222 of via een WhatsApp-bericht naar +31 20 808 8809. Op basis van bijvoorbeeld je adres kunnen zij dan een nieuwe boekingsbevestiging naar je sturen.",
    },
  ];

  /* Annuleren bij het flexibele tarief: drie stappen. */
  const cancelSteps = [
    { title: "Check de annuleringstermijn", text: `Je kunt jouw reservering nog tot 30 dagen voor de dag van aankomst annuleren. In geval van jouw boeking betekent dit dat je annuleringstermijn afloopt om 23:59 uur op ${cancelUntil}. Bij annulering na deze termijn of bij no-show ontvang je geen bedrag retour.` },
    { title: "Klik op de link ‘Mijn boeking annuleren’", text: "Indien je zeker weet dat je wilt annuleren, kun je dit gemakkelijk doen via de onderstaande link ‘Mijn boeking annuleren’. Houd je boekingsnummer en e-mailadres bij de hand." },
    { title: "Ontvang het volledige arrangementsbedrag retour", text: "Indien je de reservering binnen de annuleringstermijn annuleert, krijg je het betaalde arrangementsbedrag van ons teruggestort. Voor de boekingskosten ontvang je een voucher, die je direct kunt gebruiken bij je nieuwe boeking. Je ontvangt binnen twee weken je betaalde arrangementsbedrag retour!" },
  ];

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{responsiveCss}</style>
      </Head>
      <Preview>Boekingsnummer {bookingNumber}. Hieronder alles over je {hotels.length} hotels.</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        {/* Variant-label (niet voor de gast): dezelfde subtiele stijl als het label onder het logo op de
            MVP-pagina's ("MHR MVP"), zodat developers altijd zien dat dit de MVP-variant van de mail is. */}
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          <Section style={{ padding: "8px 12px 6px" }}>
            <span style={{ display: "inline-block", padding: "2px 5px", border: `1px solid ${c.border}`, borderRadius: "3px", color: c.muted, fontFamily: font.body, fontSize: "9px", lineHeight: "11px", fontWeight: 600, letterSpacing: "1.3px", textTransform: "uppercase" }}>
              MHR MVP
            </span>
          </Section>
        </Container>
        <CrmHeader mode={mode} />
        <Container style={{ width: "100%", maxWidth: "626px" }}>

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
                    {/* Mobiel (stack): nummer boven de foto, foto en tekst eronder, alles links uitgelijnd. */}
                    <Row>
                      <Column className="stack" style={{ width: "36px", verticalAlign: "top" }}>
                        <span className="m-num" style={num}>{i + 1}</span>
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
                      <Column className="stack m-nopad" style={{ paddingLeft: "16px", verticalAlign: "top" }}>
                        <Text style={{ ...body14, margin: 0, fontSize: "16px", fontWeight: 700 }}>
                          {h.name}{" "}
                          <span style={{ fontSize: "13px", letterSpacing: "1px", color: c.heading, fontWeight: 400 }}>
                            {"★".repeat(h.stars)}
                          </span>
                        </Text>
                        <Text style={{ ...small, margin: "2px 0 0" }}>{h.address}</Text>
                        {/* Check-in en check-out boven de inclusies */}
                        <Text style={{ ...small, margin: "6px 0 0" }}>
                          <strong style={{ color: c.text }}>Check-in</strong> {h.checkIn}
                          <br />
                          <strong style={{ color: c.text }}>Check-out</strong> {h.checkOut}
                        </Text>
                        <ul style={{ margin: "8px 0 0", paddingLeft: "18px" }}>
                          {h.items.map((item) => (
                            <li key={item} style={{ ...body14, margin: "0 0 2px" }}>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </Column>
                    </Row>
                  </Section>
                ))}

                {/* Annuleringskeuze (flexibel annuleren: groen schild met vinkje; niet terugbetaalbaar: grijs schild met kruis) en bagagetransfer: dezelfde iconen als op de bevestigingspagina */}
                <Section style={{ borderTop: `1px solid ${line}`, marginTop: "20px", paddingTop: "16px" }}>
                  <Row>
                    <Column style={{ width: "36px", verticalAlign: "top" }}>
                      <Img src={img(rate === "flex" ? "icon-shield-green.png" : "icon-shield-grey.png")} alt="" width="26" height="26" />
                    </Column>
                    <Column style={{ verticalAlign: "top" }}>
                      <Text style={{ ...body14, margin: 0, fontSize: "16px", fontWeight: 700 }}>{rate === "flex" ? "Flexibel annuleren" : "Niet terugbetaalbaar"}</Text>
                      <Text style={{ ...small, margin: "2px 0 0" }}>
                        {rate === "flex" ? `Tot ${cancelUntil} 23:59 uur (30 dagen voor aankomst) kosteloos annuleren van de gehele vakantie.` : "De boeking kan niet geannuleerd worden."}
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
                  {priceRow(`${tripType}, ${persons} personen${rate === "flex" ? ", incl. flexibel annuleren" : ""}`, tripPrice)}
                  {priceRow("Boekingskosten", bookingFee)}
                  {priceRow("Totaal", total, true, true)}
                  {priceRow("Betaald", total)}
                  {priceRow("Te betalen", "€0", true)}
                  {/* Wat ter plekke nog komt, direct onder het nulbedrag (zelfde regel als op de bevestigingspagina). */}
                  <Text style={{ ...small, textAlign: "right" as const, margin: "4px 0 0" }}>
                    Bij aankomst betaal je nog wel
                    <br />
                    de lokale toeristenbelasting.
                  </Text>
                </Section>
              </Section>
            </Section>
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


          {/* Annuleren of wijzigen: helemaal onderaan, tekst per tarief en de link "Mijn boeking annuleren"
              (placeholder-link naar het bestaande annuleringsformulier) */}
          <Section className="m-pad" style={{ padding: "0 32px 32px" }}>
            <Section style={{ borderTop: `1px solid ${line}`, paddingTop: "28px" }}>
              <Text className="m-kop" style={kop}>Annuleren of wijzigen van een boeking</Text>
              <Text style={{ ...body14, margin: "16px 0 0", fontWeight: 700, fontSize: "15px" }}>Wijzigen van je verblijf</Text>
              {rate === "nonflex" ? (
                <>
                  <Text style={body14}>
                    Er is een niet-terugbetaalbaar tarief geboekt. Bij zowel wijzigen als annuleren ontvang je geen bedrag retour.
                  </Text>
                  <Text style={{ ...body14, margin: "16px 0 0", fontWeight: 700, fontSize: "15px" }}>Annuleren van je verblijf</Text>
                  <Text style={body14}>
                    Bij annuleren ontvang je geen bedrag retour, omdat je bij het boeken gekozen hebt voor de laagste prijs. Wil je toch
                    annuleren, ondanks het feit dat je geen geld terugkrijgt, neem dan eerst contact op met de klantenservice via telefoon{" "}
                    <Link href="tel:+31207052222" style={textLink}>+31 20 705 2222</Link> of WhatsApp{" "}
                    <Link href="https://wa.me/31208088809" style={textLink}>+31 20 808 8809</Link>. Dan kijken we samen wat er wel mogelijk is.
                  </Text>
                  <Text style={body14}>
                    Klik je toch op de link “Mijn boeking annuleren”, dan is dat niet terug te draaien of achteraf aan te passen. Klik
                    alleen op de link “Mijn boeking annuleren” als je de annuleringsbevestiging nodig hebt voor een beroep op je
                    reisverzekering.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={body14}>
                    Er is een flexibel tarief geboekt. Als je deze boeking wilt wijzigen, annuleer dan de boeking en boek het gewenste
                    arrangement opnieuw. Let op: je ontvangt het bedrag alleen terug als je annuleert voor 23:59 uur op {cancelUntil}.
                  </Text>
                  <Text style={{ ...body14, margin: "16px 0 0", fontWeight: 700, fontSize: "15px" }}>Annuleren van je verblijf</Text>
                  <Text style={body14}>
                    Ook wanneer je niets wilt wijzigen maar simpelweg je verblijf wilt annuleren, volg je de onderstaande stappen:
                  </Text>
                  {cancelSteps.map((step, i) => (
                    <Section key={step.title} style={{ marginTop: "12px" }}>
                      <Row>
                        <Column style={{ width: "36px", verticalAlign: "top" }}>
                          <span style={num}>{i + 1}</span>
                        </Column>
                        <Column style={{ verticalAlign: "top" }}>
                          <Text style={{ ...body14, margin: "4px 0 0", fontWeight: 700 }}>{step.title}</Text>
                          <Text style={{ ...body14, margin: "2px 0 0" }}>{step.text}</Text>
                        </Column>
                      </Row>
                    </Section>
                  ))}
                </>
              )}
              {/* Oranje tekstlink (geen knop) naar het annuleringsformulier; daaronder de afsluiting met de servicecentrumpagina. */}
              <Text style={{ margin: "16px 0 0" }}>
                <Link href={CANCEL_FORM_URL} style={ctaLink}>Mijn boeking annuleren &gt;</Link>
              </Text>
              <Text style={{ ...body14, margin: "16px 0 0" }}>
                Wij vinden het fijn dat je bij ons geboekt hebt en helpen je graag als je nog informatie mist. Op onze{" "}
                <Link href={SERVICE_URL} style={textLink}>servicecentrumpagina</Link> vind je direct antwoord op de meest gestelde vragen.
              </Text>
            </Section>
          </Section>
        </Container>
        <CrmFooter recipientEmail={recipientEmail} reason="omdat je bij ons boekte" transactional mode={mode} />
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
  // MVP: geen detailpagina per boeking, de link gaat naar het boekingenoverzicht.
  bookingUrl: "https://vialuxury.vercel.app/mvp-trip/account/boekingen",
} satisfies Props;
