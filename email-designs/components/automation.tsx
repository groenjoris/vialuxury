import { Button, Column, Container, Heading, Img, Link, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { type AutomationDeal } from "../lib/automationDeals";
import { IconLine, type Pill, PillGrid, PrimaryButton, s, site, TextLink } from "./crm";
import { baseUrl, font, newsletter } from "./theme";

// Bouwstenen van de automationmails voor Klaviyo.
//
// Bewust los van `components/crm.tsx`: die hoort bij de CRM-mails van Joris en mag door dit werk
// niet veranderen. Wat hier staat is dus een eigen kaart en een eigen briefopening, met alleen de
// kleine, onveranderde dingen (tekststijlen `s`, knoppen, PillGrid, IconLine) uit crm.tsx.

const c = newsletter.light;

/** Donkere modus. Eén HTML die in beide standen werkt: de inline stijlen blijven licht en deze
 *  regels zetten ze om zodra de client donker staat (Apple Mail, iOS Mail, Outlook voor Mac).
 *  Daarom overal `!important`: dat wint het van een inline stijl. Gmail en Outlook op Windows
 *  negeren de mediaquery en tonen gewoon de lichte mail, of draaien zelf kleuren om; daar valt
 *  niets aan te sturen. De foto's blijven zoals ze zijn, de oranje knop en de oranje links ook:
 *  die hebben op donker genoeg contrast. Donkergrijze icoontjes (vergrootglas, kalender, klok)
 *  worden omgekeerd, anders vallen ze weg. */
export const automationDarkCss = `
html, body, .d-bg { background-color: #161616 !important; }
/* React Email zet de achtergrond van de body ook op een cel eromheen; zonder deze regel blijft
   die cel wit en zie je witte tekst op wit. */
td[style*="background-color:#FFFFFF"] { background-color: #161616 !important; }
.d-card { background-color: #212121 !important; border-color: #333333 !important; }
.d-band { background-color: #22201C !important; }
.d-warm { background-color: #2A2119 !important; }
.d-circle { background-color: #3A2E23 !important; }
.d-line { border-color: #333333 !important; }
.d-head, .d-head a { color: #FFFFFF !important; }
.d-text, .d-text strong { color: #F2F2F2 !important; }
.d-muted { color: #ABABAB !important; }
.d-badge { background-color: #FFFFFF !important; color: #141414 !important; }
.d-old { color: #FF8585 !important; }
.d-inv img { filter: invert(1) !important; }
/* De regels in het zoekblok komen uit IconLine (crm.tsx) en hebben zelf geen klasse. */
.d-box p { color: #F2F2F2 !important; }
`;

/** Mobiele regels van de automationmails. Twee breekpunten: onder 600 px stapelen de kolommen,
 *  onder 640 px krimpt de prijsrij (op 16 px vraagt die ruim 400 px en valt de knop buiten de
 *  kaart). Zie CLAUDE.md, sectie Automationmails. */
export const automationCss = `
body { margin: 0 !important; padding: 0 !important; }
@media only screen and (max-width: 600px) {
  .stack { display: block !important; width: 100% !important; padding: 0 0 12px !important; }
  /* De tekst van een dealrij houdt zijn ruimte tot de rand. box-sizing is nodig omdat stack
     width:100% zet: zonder dat telt de padding er nog bij op en steekt de cel buiten de kaart. */
  .m-cardtext { padding: 16px 18px 18px !important; box-sizing: border-box !important; }
  /* De foto van een dealrij staat boven de tekst over de volle breedte; padding-top van 56,25 %
     maakt dat vlak 16:9, want een achtergrondfoto heeft zelf geen hoogte. */
  .m-rowphoto { width: 100% !important; height: 0 !important; min-height: 0 !important; padding-top: 56.25% !important; }
  .m-rowphoto-cell { padding: 0 !important; }
  /* Twee foto's onder elkaar: de halve hoogte vervalt en de tweede foto valt weg, zodat de kaart
     er op een telefoon hetzelfde uitziet als elke andere dealrij. */
  .m-halfphoto { height: auto !important; }
  .m-hide { display: none !important; }
  /* De vaste kaarthoogte vervalt: de foto staat hier boven de tekst, dus de kaart is hoger. */
  .m-auto-h { height: auto !important; }
  .m-pad { padding-left: 16px !important; padding-right: 16px !important; }
  .m-h1 { font-size: 28px !important; }
  /* Gestapelde footer: de 54 px die op desktop onder de quote staat (om de kleine letters op
     gelijke hoogte met de afzenderzin te zetten) is hier een gat. */
  .m-legal { margin-top: 18px !important; }
}
@media only screen and (max-width: 640px) {
  .m-badge-cell { padding-right: 6px !important; }
  .m-badge { font-size: 12px !important; padding: 9px 6px !important; }
  .m-price { font-size: 12px !important; }
  .m-price-big { font-size: 16px !important; }
  .m-cta { font-size: 12px !important; padding: 9px 7px !important; }
}
`;

/** Outlook.com en Outlook op het web volgen `prefers-color-scheme` niet: die draaien in hun
 *  donkere thema zelf kleuren om en zetten dan `data-ogsc` (tekst) of `data-ogsb` (achtergrond)
 *  op wat ze hebben aangepast. Via die haakjes zetten we onze eigen kleuren er alsnog overheen,
 *  zodat die clients niet hun eigen omkering laten zien maar dit ontwerp. Buiten de mediaquery,
 *  want die zien ze niet. In alle andere clients bestaan deze attributen niet, dus daar doet dit
 *  blok niets. */
export const automationOutlookDarkCss = `
[data-ogsb] body, body[data-ogsb], [data-ogsb] .d-bg, .d-bg[data-ogsb] { background-color: #161616 !important; }
[data-ogsb] .d-card, .d-card[data-ogsb] { background-color: #212121 !important; }
[data-ogsb] .d-band, .d-band[data-ogsb] { background-color: #22201C !important; }
[data-ogsb] .d-warm, .d-warm[data-ogsb] { background-color: #2A2119 !important; }
[data-ogsb] .d-circle, .d-circle[data-ogsb] { background-color: #3A2E23 !important; }
[data-ogsb] .d-badge, .d-badge[data-ogsb] { background-color: #FFFFFF !important; }
[data-ogsc] .d-head, .d-head[data-ogsc] { color: #FFFFFF !important; }
[data-ogsc] .d-text, .d-text[data-ogsc], [data-ogsc] .d-text strong { color: #F2F2F2 !important; }
[data-ogsc] .d-muted, .d-muted[data-ogsc] { color: #ABABAB !important; }
[data-ogsc] .d-badge, .d-badge[data-ogsc] { color: #141414 !important; }
[data-ogsc] .d-old, .d-old[data-ogsc] { color: #FF8585 !important; }
[data-ogsc] .d-box p { color: #F2F2F2 !important; }
/* De zwarte kop- en voetbalk moeten zwart blijven: draait Outlook die om, dan valt het witte
   logo weg. Dit zet dezelfde kleur terug. */
[data-ogsb] td[style*="background-color:#141414"], td[style*="background-color:#141414"][data-ogsb] { background-color: #141414 !important; }
`;

/** Kopbalk van de automationmails: het zwarte vlak is zo breed als de mail (626 px), niet zo breed
 *  als het scherm. Eigen versie van `CrmHeader`, zodat de CRM-mails die van hen houden. */
export function AutomationHeader() {
  return (
    <Container style={{ width: "100%", maxWidth: "626px" }}>
      <Section style={{ backgroundColor: c.frame, padding: "20px" }}>
        <Row>
          <Column style={{ verticalAlign: "middle" }}>
            <Img src={`${baseUrl}/images/logo-vialuxury-horizontal.png`} alt="ViaLuxury" width="201" className="m-logo" style={{ height: "auto" }} />
          </Column>
          <Column align="right" style={{ verticalAlign: "middle" }}>
            <Img src={`${baseUrl}/images/mail/trustpilot-16000.png`} alt="Trustpilot 4,5/5, 16.000+ reviews" width="106" height="50" className="m-trustpilot" />
          </Column>
        </Row>
      </Section>
    </Container>
  );
}

/** De donkere regels als mediaquery. Staat alleen in de mails die een donkere versie hebben
 *  (nu alleen winkelmandje 1); de rest blijft licht. */
export const automationDarkMedia = `
@media (prefers-color-scheme: dark) {
${automationDarkCss}
}
`;

/** Band over de hele breedte (beige in de lichte stand). Eigen versie van `BeigeBand`, zodat de
 *  band in de donkere stand mee kan kleuren. */
export function AutomationBand({ children, top = "0" }: { children: React.ReactNode; top?: string }) {
  return (
    <Container style={{ width: "100%", maxWidth: "626px" }}>
      <Section className="d-band m-pad" style={{ backgroundColor: "#F4F1EC", padding: "24px 20px 28px", marginTop: top }}>{children}</Section>
    </Container>
  );
}

/** Briefopening: aanhef en een korte intro. Zonder ondertekening: die laten we voorlopig
 *  helemaal weg (feedback 24-11-2026; "Groetjes Yvette" verviel en er komt voorlopig niets
 *  voor in de plaats). */
export function AutomationLetter({ firstName, children }: { firstName?: string; children: React.ReactNode }) {
  return (
    <>
      <Text className="d-text" style={{ ...s.body, margin: 0 }}>{firstName ? `Beste ${firstName},` : "Beste gast,"}</Text>
      <Text className="d-text" style={{ ...s.body, margin: "8px 0 0" }}>{children}</Text>
    </>
  );
}

// ── Dealkaart ────────────────────────────────────────────────────────────────────────────────
// Elke kaart is op desktop even hoog, want in Klaviyo moet een herhalend blok één hoogte hebben.
// De waarden zijn de hoogste kaart die voorkomt, dus er wordt nooit iets afgesneden; bij een
// kortere kaart valt de ruimte die overblijft tussen de inclusies en de prijsrij: de bovenkant
// staat bovenaan, de prijsrij onderaan. Op mobiel vervalt de hoogte (`m-auto-h`).
export const CARD_HEIGHT_ROW = "425px";
/** Bij de grote kaart staat de hoogte op het tekstblok onder de foto, niet op de kaart zelf: een
 *  vaste hoogte op de kaart verdeelt de overgebleven ruimte over de rijen en zet dan een witte
 *  strook boven de foto. 379 px tekstblok + 315 px foto + 2 px rand = 696 px kaart. */
export const CARD_TEXT_HEIGHT_FEATURED = "379px";
/** Hoogte van het tekstblok binnen de kaart (kaarthoogte minus de padding), zodat de bovenkant
 *  (hotel, dealtitel, inclusies) bovenaan staat en de onderkant (voor wie de prijs geldt en de
 *  prijsrij) onderaan: een mail kan geen meegroeiende kaart hebben, dus de ruimte die overblijft
 *  valt tussen die twee blokken in plaats van eromheen. */
const CARD_TEXT_INNER_ROW = "389px";
const CARD_TEXT_INNER_FEATURED = "343px";
/** Ruimte tussen twee dealkaarten onder elkaar. */
export const cardGap = "24px";

const checkIcon = `${baseUrl}/images/mail/crm/check-groen.png`;
/** Kortingsblokje en knop in de prijsrij: zelfde hoogte en afronding. */
const priceRowBox = { fontSize: "16px", fontWeight: 700, lineHeight: "20px", borderRadius: "6px", color: "#FFFFFF" };

/** Tekstdeel van de kaart, t/m de inclusies. */
function DealText({ d }: { d: AutomationDeal }) {
  return (
    <>
      {d.hotelName && (
        <Text className="d-text" style={{ ...s.name, margin: 0 }}>
          {d.hotelName}
          {d.stars ? <span style={{ letterSpacing: "1px", marginLeft: "8px" }}>{"★".repeat(d.stars)}</span> : null}
        </Text>
      )}
      {d.place && <Text className="d-muted" style={{ ...s.muted, margin: "2px 0 0" }}>{d.place}</Text>}
      {(d.hotelName || d.place) && <Section className="d-line" style={{ borderTop: "1px solid #E5E5E5", marginTop: "12px", fontSize: "1px", lineHeight: "1px" }}>&nbsp;</Section>}
      {d.packageTitle && <Text className="d-head" style={{ ...s.kop, fontSize: "18px", margin: d.hotelName || d.place ? "10px 0 0" : 0 }}>{d.packageTitle}</Text>}
      {d.includes && d.includes.length > 0 && (
        <>
          <Text style={{ fontFamily: font.heading, fontWeight: 600, fontSize: "16px", lineHeight: "1.4", color: c.cta, margin: "12px 0 2px" }}>Arrangement</Text>
          {/* Hangende inspringing: een inclusie over twee regels lijnt op de tweede regel uit met
              de tekst erboven en niet met het vinkje. 22 px = vinkje (14) plus de ruimte (8). */}
          {d.includes.slice(0, 4).map((inc) => (
            <Text key={inc} className="d-muted" style={{ ...s.muted, margin: "4px 0 0", paddingLeft: "22px", textIndent: "-22px" }}>
              <Img src={checkIcon} alt="" width="14" height="14" style={{ display: "inline-block", verticalAlign: "-1px", marginRight: "8px" }} />
              {inc}
            </Text>
          ))}
        </>
      )}
    </>
  );
}

/** Onderkant van de kaart: de gekozen datums, voor wie de prijs geldt en één regel met het
 *  kortingsblokje, de vanafprijs en de knop. Op mobiel krimpt die regel, zodat hij op één regel
 *  blijft en binnen de kaart past. */
function DealPrice({ d, cta }: { d: AutomationDeal; cta: string }) {
  return (
    <>
      {d.lines?.map((l, i) => (
        <Text key={l} className="d-text" style={{ ...s.title, margin: i ? "2px 0 0" : "14px 0 0" }}>{l}</Text>
      ))}
      {d.priceFor && <Text className="d-text" style={{ ...s.name, margin: "14px 0 0" }}>{d.priceFor}</Text>}
      <Row style={{ marginTop: "8px" }}>
        {d.discount && (
          <Column className="m-badge-cell" style={{ verticalAlign: "middle", width: "1%", paddingRight: "12px" }}>
            <span className="m-badge d-badge" style={{ ...priceRowBox, display: "inline-block", whiteSpace: "nowrap", backgroundColor: c.text, fontFamily: font.body, padding: "11px 12px" }}>{d.discount}</span>
          </Column>
        )}
        <Column style={{ verticalAlign: "middle" }}>
          <Text className="m-price d-muted" style={{ fontFamily: font.body, fontSize: "16px", lineHeight: "24px", color: c.muted, margin: 0, whiteSpace: "nowrap" }}>
            Vanaf <span className="m-price-big d-text" style={{ fontSize: "20px", fontWeight: 700, color: c.text }}>{d.price}</span>
            {d.original && <span className="d-old" style={{ color: "#D32F2F", textDecoration: "line-through", marginLeft: "8px" }}>{d.original}</span>}
          </Text>
        </Column>
        <Column style={{ verticalAlign: "middle", textAlign: "right", width: "1%" }}>
          <Button href={d.url} className="m-cta" style={{ ...priceRowBox, backgroundColor: c.cta, fontFamily: font.body, padding: "11px 20px", textDecoration: "none", whiteSpace: "nowrap" }}>
            {cta}
          </Button>
        </Column>
      </Row>
    </>
  );
}

/** Het tekstblok van een kaart met een vaste hoogte: bovenin DealText, onderin DealPrice. Een
 *  tabel met een vaste hoogte, want percentages werken niet in elke mailclient. Op mobiel vervalt
 *  de hoogte (`m-auto-h`) en staat alles gewoon onder elkaar. */
function CardText({ height, top, bottom }: { height?: string; top: React.ReactNode; bottom?: React.ReactNode }) {
  if (!height) return <>{top}{bottom}</>;
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} border={0} className="m-auto-h" style={{ width: "100%", height, borderCollapse: "collapse" }}>
      <tbody>
        <tr>
          <td style={{ verticalAlign: "top" }}>{top}</td>
        </tr>
        <tr>
          <td style={{ verticalAlign: "bottom", height: "1px" }}>{bottom}</td>
        </tr>
      </tbody>
    </table>
  );
}

/** Dealrij: foto links over de volle hoogte, tekst rechts. Heeft de deal een tweede foto, dan
 *  staan er twee foto's onder elkaar met 3 px wit ertussen (samen 211 + 212 = 423 px binnen de
 *  rand). Het randje is een witte bovenrand op de tweede foto; een achtergrondfoto loopt niet
 *  door onder een rand. Op mobiel valt de tweede foto weg. */
export function AutomationDealRow({ deal: d, cta, top = "12px" }: { deal: AutomationDeal; cta?: string; top?: string }) {
  const rich = !!d.price || !!d.includes;
  return (
    <Section className={`d-card${rich ? " m-auto-h" : ""}`} style={{ backgroundColor: "#FFFFFF", border: `1px solid #E5E5E5`, borderRadius: "8px", marginTop: top, overflow: "hidden", height: rich ? CARD_HEIGHT_ROW : undefined }}>
      <Row>
        {d.secondImage ? (
          <Column className="stack m-rowphoto-cell" style={{ width: "190px", verticalAlign: "top" }}>
            {[d.image, d.secondImage].map((src, i) => (
              <Section key={src} className={`m-halfphoto${i ? " m-hide" : ""}`} style={{ height: i ? "212px" : "211px", borderTop: i ? "3px solid #FFFFFF" : undefined, backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                <Link href={d.url} aria-label={d.hotelName ?? cta ?? "Bekijk"} className="m-rowphoto" style={{ display: "block", width: "190px", minHeight: "107px" }} />
              </Section>
            ))}
          </Column>
        ) : (
          <Column className="stack m-rowphoto-cell" style={{ width: "190px", verticalAlign: "top", backgroundImage: `url(${d.image})`, backgroundSize: "cover", backgroundPosition: "center" }}>
            <Link href={d.url} aria-label={d.hotelName ?? cta ?? "Bekijk"} className="m-rowphoto" style={{ display: "block", width: "190px", minHeight: "107px" }} />
          </Column>
        )}
        <Column className="stack m-cardtext" style={{ verticalAlign: "top", padding: rich ? "16px 18px 18px" : "16px 18px" }}>
          <CardText
            height={rich ? CARD_TEXT_INNER_ROW : undefined}
            top={<DealText d={d} />}
            bottom={d.price ? (
              <DealPrice d={d} cta={cta ?? "Bekijk"} />
            ) : (
              <>
                {d.lines?.map((l, i) => (
                  <Text key={l} style={{ ...s.title, margin: i ? "2px 0 0" : "14px 0 0" }}>{l}</Text>
                ))}
                <TextLink href={d.url}>{cta ?? "Bekijk"}</TextLink>
              </>
            )}
          />
        </Column>
      </Row>
    </Section>
  );
}

/** Grote kaart: foto over de hele breedte op 16:9, daaronder de tekst en de prijsrij.
 *  `priceRow={false}`: zonder de prijsrij (het winkelmandje; die staan erboven). */
export function AutomationFeaturedDeal({ deal: d, cta, priceRow = true }: { deal: AutomationDeal; cta?: string; priceRow?: boolean }) {
  const fixed = !!d.price && priceRow && !!d.includes?.length;
  return (
    <Section className="d-card" style={{ backgroundColor: "#FFFFFF", border: `1px solid #E5E5E5`, borderRadius: "8px", marginTop: "12px", overflow: "hidden" }}>
      <Link href={d.url}>
        <Img src={d.image} alt={d.packageTitle ?? d.hotelName ?? ""} width="560" height="315" style={{ display: "block", width: "100%", height: "auto", aspectRatio: "16 / 9", objectFit: "cover" }} />
      </Link>
      <Section className={fixed ? "m-auto-h" : undefined} style={{ padding: "16px 20px 20px", height: fixed ? CARD_TEXT_HEIGHT_FEATURED : undefined }}>
        <CardText
          height={fixed ? CARD_TEXT_INNER_FEATURED : undefined}
          top={<DealText d={d} />}
          bottom={d.price && priceRow ? <DealPrice d={d} cta={cta ?? "Bekijk"} /> : undefined}
        />
      </Section>
    </Section>
  );
}

/** Eén groot, de rest als rij. */
export function AutomationDealList({ deals }: { deals: AutomationDeal[] }) {
  const [first, ...rest] = deals;
  return (
    <>
      {first && <AutomationFeaturedDeal deal={first} />}
      {rest.map((d, i) => (
        <AutomationDealRow key={d.url} deal={d} top={i ? cardGap : cardGap} />
      ))}
    </>
  );
}

// ── Secties uit de sheet ("Automations in kaart.xlsx", tabblad Secties) ─────────────────────

/** S21 Gastenoordeel: de score met de Trustpilot-sterren en één korte review, als die er is. */
export type GuestRating = {
  average: 3 | 3.5 | 4 | 4.5 | 5;
  label: string;
  /** Maximaal drie korte reviews, zoals in de eerste winkelmandjemail van het CRM. */
  reviews?: { text: string; author: string }[];
};

export function GuestRatingSection({ rating }: { rating: GuestRating }) {
  return (
    <>
      <Img
        src={`${baseUrl}/images/mail/crm/trustpilot-sterren-${String(rating.average).replace(".", "-")}.png`}
        alt={`${String(rating.average).replace(".", ",")} van 5 sterren`}
        width="152"
        height="28"
        style={{ display: "block", width: "152px", height: "28px" }}
      />
      <Text className="d-text" style={{ ...s.body, margin: "6px 0 0" }}>{rating.label}</Text>
      {rating.reviews?.slice(0, 3).map((r) => (
        <Section key={r.author} style={{ marginTop: "22px" }}>
          <Text className="d-head" style={{ fontFamily: font.heading, fontSize: "20px", lineHeight: "1.35", color: c.text, margin: 0 }}>&ldquo;{r.text}&rdquo;</Text>
          <Text className="d-muted" style={{ ...s.muted, margin: "4px 0 0" }}>{r.author}</Text>
        </Section>
      ))}
    </>
  );
}

/** S6 Merksectie. Feedback 24-11-2026 (derde ronde): een merkblok dat vertrouwen opbouwt, met de
 *  toekomstige pay-off als kop. Beige band over de hele breedte met de kop, de merktekst, vier
 *  punten (het laatste met de Trustpilot-ster), de groet en een tekstlink. */
export function BrandSection({ children, greeting, link, top = "40px" }: { children: React.ReactNode; greeting?: string; link?: { href: string; label: string }; top?: string }) {
  const punten: { icon: string; lead: string; text: string }[] = [
    { icon: checkIcon, lead: "Persoonlijk geselecteerd:", text: "we kennen onze hotels en kiezen alleen wat we zelf zouden boeken." },
    { icon: checkIcon, lead: "Alles al geregeld:", text: "overnachting, ontbijt en extra’s zitten in één arrangement." },
    { icon: checkIcon, lead: "Altijd een aanspreekpunt:", text: "vragen voor of na je boeking? Ons team helpt je graag." },
    { icon: `${baseUrl}/images/mail/crm/trustpilot-ster-groen.png`, lead: "Trustpilot score:", text: "4.5/5 met 16.000+ reviews" },
  ];
  return (
    <AutomationBand top={top}>
      <Text className="d-head" style={{ ...s.kop, margin: 0 }}>Zorgvuldig samengestelde hotelervaringen</Text>
      <Text className="d-text" style={{ ...s.body, margin: "10px 0 0" }}>{children}</Text>
      <Section style={{ marginTop: "14px" }}>
        {punten.map((p) => (
          <Text key={p.lead} className="d-text" style={{ ...s.body, margin: "8px 0 0", paddingLeft: "26px", textIndent: "-26px" }}>
            <Img src={p.icon} alt="" width="16" height="16" style={{ display: "inline-block", verticalAlign: "-2px", marginRight: "10px" }} />
            <strong>{p.lead}</strong> {p.text}
          </Text>
        ))}
      </Section>
      {greeting && <Text className="d-text" style={{ ...s.body, margin: "18px 0 0" }}>{greeting}</Text>}
      {link && <TextLink href={link.href}>{link.label}</TextLink>}
    </AutomationBand>
  );
}

/** S15 Servicesectie: de regel uit de sheet, met de link naar de klantenservice. */
export function ServiceSection() {
  return (
    <Text className="d-text" style={{ ...s.title, margin: 0 }}>
      Vragen over dit arrangement? Onze{" "}
      <Link href="https://vialuxury.com/nl-NL/klantenservice" style={{ color: c.link, textDecoration: "underline" }}>klantenservice</Link>{" "}
      helpt je graag.
    </Text>
  );
}

/** S18 Zoekopdracht: zoekterm, datum en personen in een wit, omlijnd blok met de knop. */
export function SearchSection({ searchTerm, arrivalDate, persons, resultsUrl }: { searchTerm?: string; arrivalDate?: string; persons?: number; resultsUrl: string }) {
  return (
    <Section className="d-card d-inv d-box" style={{ backgroundColor: "#FFFFFF", border: `1px solid #E5E5E5`, borderRadius: "8px", padding: "14px 20px 22px" }}>
      <IconLine icon="magnifier-donker" bold>{searchTerm ?? "Jouw zoekopdracht"}</IconLine>
      {arrivalDate && <IconLine icon="calendar-donker">{arrivalDate}</IconLine>}
      {persons && <IconLine icon="users-donker">{persons} {persons === 1 ? "persoon" : "personen"}</IconLine>}
      <Section style={{ marginTop: "18px" }}>
        <PrimaryButton href={resultsUrl}>Bekijk alle resultaten</PrimaryButton>
      </Section>
    </Section>
  );
}

/** S10 Codesectie: de coupon met het bedrag, de code, de geldigheid en de instructie.
 *  De inhoud staat gecentreerd: een coupon is een ding op zichzelf en de enige uitzondering op
 *  "alles links" in de automationmails (afstemming 24-11-2026). */
export function AutomationCodeBlock({ title, code, label = "Jouw persoonlijke code", deadline }: { title?: string; code: string; label?: string; deadline: string }) {
  const center = { textAlign: "center" as const };
  return (
    <Section className="d-inv" style={{ width: "100%", border: `2px dashed ${c.cta}`, borderRadius: "8px", padding: "22px 22px 24px", textAlign: "center" }}>
      {title && <Text style={{ ...s.h1, fontWeight: 700, color: c.cta, ...center, margin: "0 0 12px" }}>{title}</Text>}
      <Text className="d-text" style={{ ...s.title, ...center, margin: 0 }}>{label}</Text>
      <Text style={{ fontFamily: font.heading, fontWeight: 700, fontSize: "20px", lineHeight: "1.3", letterSpacing: "0.02em", color: c.text, margin: "4px 0 0", ...center }} className="d-head">{code}</Text>
      <Text className="d-text" style={{ ...s.name, ...center, margin: "14px 0 0" }}>
        <Img src={`${baseUrl}/images/mail/crm/clock-donker.png`} alt="" width="18" height="18" style={{ display: "inline-block", verticalAlign: "-3px", marginRight: "8px" }} />
        Geldig tot en met {deadline}
      </Text>
      <Text className="d-muted" style={{ ...s.muted, ...center, margin: "2px 0 0" }}>Vul de code in bij het boeken.</Text>
    </Section>
  );
}

/** S7 Themasectie: de themaknoppen met de knop "Alle thema's" (zet hem in een BeigeBand).
 *  De tegels en hun landingspagina's komen uit het tabblad Themategels, de keuze volgt de
 *  seizoensthema's van de verzendmaand (tabblad Seizoensthema's). */
/** Een themategel: een foto (16:9), de naam van het thema en een link. */
export type ThemeTile = Pill & { image?: string; note?: string };

/** S7 Themasectie. Feedback 24-11-2026: de thema's zijn beeldend, dus elk thema is een tegel met
 *  een foto, de naam en een link eronder. Zonder foto's valt hij terug op de kale keuzeknoppen. */
export function ThemeSection({ title, note, items, cta = "Bekijk" }: { title: string; note: string; items: ThemeTile[]; cta?: string }) {
  const withImages = items.filter((t) => t.image);
  const perRow = 2;
  const rows = Array.from({ length: Math.ceil(withImages.length / perRow) }, (_, i) => withImages.slice(i * perRow, (i + 1) * perRow));
  return (
    <>
      <Heading as="h2" className="m-h1 d-head" style={{ ...s.h1, marginBottom: "16px" }}>{title}</Heading>
      {withImages.length === items.length ? (
        <Section>
          {rows.map((row, ri) => (
            <Row key={ri} style={{ marginTop: ri ? "16px" : 0 }}>
              {Array.from({ length: perRow }, (_, i) => {
                const t = row[i];
                return (
                  <Column key={i} className="stack" style={{ width: `${100 / perRow}%`, verticalAlign: "top", paddingLeft: i ? "8px" : 0, paddingRight: i < perRow - 1 ? "8px" : 0 }}>
                    {t && (
                      <Section className="d-card" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: "4px", overflow: "hidden" }}>
                        <Link href={t.href}>
                          <Img src={t.image} alt="" width="271" height="152" style={{ display: "block", width: "100%", height: "auto", aspectRatio: "16 / 9", objectFit: "cover" }} />
                        </Link>
                        <Section style={{ padding: "12px 16px 14px" }}>
                          <Text className="d-text" style={{ ...s.body, fontWeight: 700, color: c.text, margin: 0 }}>{t.label}</Text>
                          {t.note && <Text className="d-muted" style={{ ...s.muted, margin: "2px 0 0" }}>{t.note}</Text>}
                          <Link href={t.href} style={{ display: "inline-block", marginTop: "8px", fontFamily: font.body, fontSize: "16px", fontWeight: 700, color: c.link, textDecoration: "underline" }}>{cta}</Link>
                        </Section>
                      </Section>
                    )}
                  </Column>
                );
              })}
            </Row>
          ))}
        </Section>
      ) : (
        <PillGrid items={[...items, { label: "Alle thema's", href: "https://vialuxury.com/nl-NL/zoeken" }]} />
      )}
      <Text className="d-muted" style={{ ...s.muted, margin: "16px 0 0" }}>{note}</Text>
    </>
  );
}

export { site };

/** Footer van de automationmails. Opzet zoals in het ontwerp van Joris (afstemming 26-11-2026):
 *  een lichtoranje band met de klantenservice over de hele breedte direct boven de zwarte footer
 *  (bellen en WhatsApp op een regel), en daaronder twee kolommen: links het logo met "Volg ons op",
 *  de social-icoontjes en de afzenderzin, rechts de gastquote "Dit moeten we vaker doen!"
 *  (handgeschreven, Caveat, als afbeelding) op dezelfde hoogte als het logo met daaronder de kleine
 *  letters. Eigen component, zodat de CRM-mails hun eigen footer houden. */
export function AutomationFooter({ recipientEmail, reason }: { recipientEmail: string; reason: string }) {
  const text = { fontFamily: font.body, color: "#FFFFFF", fontSize: "12px", lineHeight: "16px", margin: "0 0 8px" };
  const bold = { ...text, fontWeight: 700 };
  const link = { color: "#FFFFFF", textDecoration: "underline" };
  const serif = { fontFamily: font.heading, fontWeight: 600, fontSize: "20px", lineHeight: "1.3", margin: 0 };
  const body16 = { fontFamily: font.body, fontSize: "16px", lineHeight: "1.45", margin: 0 };
  const orangeLink = { color: c.link, textDecoration: "underline", fontWeight: 700 };

  return (
    <>
      {/* Klantenservice: lichtoranje band over de hele breedte, direct boven de footer */}
      <Container style={{ width: "100%", maxWidth: "626px" }}>
        <Section className="d-warm m-pad" style={{ backgroundColor: "#FFF0E4", padding: "26px 20px 28px" }}>
          {/* Het cirkeltje staat boven de tekst, zodat de kop en de regels eronder op dezelfde lijn
              staan als het logo en de rest van de mail. */}
          <table role="presentation" cellPadding={0} cellSpacing={0} border={0} style={{ width: "44px", height: "44px", borderCollapse: "separate", marginBottom: "14px" }}>
            <tbody>
              <tr>
                <td className="d-circle" style={{ width: "44px", height: "44px", padding: 0, borderRadius: "22px", backgroundColor: "#FFFFFF", textAlign: "center", verticalAlign: "middle" }}>
                  <Img src={`${baseUrl}/images/mail/icon-phone-orange.png`} alt="" width="22" height="22" style={{ display: "block", margin: "0 auto" }} />
                </td>
              </tr>
            </tbody>
          </table>
          <Text className="d-head" style={{ ...serif, color: c.heading }}>Hulp nodig?</Text>
          <Text className="d-text" style={{ ...body16, color: c.text, marginTop: "2px" }}>
            Bel <Link href="tel:+31207052222" style={orangeLink}>+31 20 705 2222</Link> of WhatsApp <Link href="https://wa.me/31208088809" style={orangeLink}>+31 20 808 8809</Link>
          </Text>
          <Text className="d-muted" style={{ ...body16, color: c.muted, marginTop: "2px" }}>Bereikbaar ma t/m vr 8:00 – 18:00</Text>
        </Section>
      </Container>

      <Container style={{ width: "100%", maxWidth: "626px" }}>
        <Section className="m-pad" style={{ backgroundColor: c.frame, padding: "32px 20px" }}>
            <Row>
              <Column className="stack m-center" style={{ width: "50%", verticalAlign: "top", paddingRight: "24px" }}>
                <Img src={`${baseUrl}/images/logo-vialuxury-horizontal.png`} alt="ViaLuxury" width="201" className="m-mx-auto" style={{ height: "auto" }} />
                <Text className="m-center" style={{ ...bold, margin: "22px 0 10px" }}>Volg ons op</Text>
                <Link href="https://www.instagram.com/vialuxury">
                  <Img src={`${baseUrl}/images/mail/icon-instagram.png`} alt="Instagram" width="19" height="19" style={{ display: "inline", marginRight: "10px" }} />
                </Link>
                <Link href="https://www.facebook.com/vialuxury">
                  <Img src={`${baseUrl}/images/mail/icon-facebook.png`} alt="Facebook" width="19" height="19" style={{ display: "inline" }} />
                </Link>
                <Text className="m-center m-small" style={{ ...text, margin: "26px 0 0" }}>
                  Je ontvangt deze e-mail op <strong>{recipientEmail}</strong> {reason}.
                </Text>
              </Column>
              {/* Rechts: de gastquote bovenaan, op dezelfde hoogte als het logo, met daaronder de kleine letters */}
              <Column className="stack m-center m-mt" style={{ width: "50%", verticalAlign: "top" }}>
                <Img src={`${baseUrl}/images/mail/crm/gastquote-wit.png`} alt="“Dit moeten we vaker doen!”" width="253" height="23" className="m-mx-auto" style={{ display: "block", width: "253px", maxWidth: "100%", height: "auto" }} />
                <Text className="m-center m-small m-legal" style={{ ...text, margin: "54px 0 8px" }}>Prijswijzigingen en/of zetfouten voorbehouden.</Text>
                <Text className="m-center m-small" style={text}>Copyright © ViaLuxury, All Rights Reserved</Text>
                <Text className="m-center m-small" style={text}>Liever geen updates meer? Ontvang onze nieuwsbrief minder vaak, of helemaal niet meer.</Text>
                <Text className="m-center m-small" style={{ ...text, margin: 0 }}>
                  <Link href="https://vialuxury.nl" style={link}>Wijzig e-mailvoorkeuren</Link> |{" "}
                  <Link href="https://vialuxury.nl" style={link}>Uitschrijven</Link> |{" "}
                  <Link href="https://vialuxury.nl" style={link}>Webversie</Link>
                </Text>
              </Column>
            </Row>
        </Section>
      </Container>
    </>
  );
}
