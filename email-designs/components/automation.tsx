import { Button, Column, Img, Link, Row, Section, Text } from "@react-email/components";
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
}
@media only screen and (max-width: 640px) {
  .m-badge-cell { padding-right: 6px !important; }
  .m-badge { font-size: 12px !important; padding: 9px 6px !important; }
  .m-price { font-size: 12px !important; }
  .m-price-big { font-size: 16px !important; }
  .m-cta { font-size: 12px !important; padding: 9px 7px !important; }
}
`;

/** Briefopening: aanhef en een korte intro. Zonder ondertekening: die laten we voorlopig
 *  helemaal weg (feedback 24-11-2026; "Groetjes Yvette" verviel en er komt voorlopig niets
 *  voor in de plaats). */
export function AutomationLetter({ firstName, children }: { firstName?: string; children: React.ReactNode }) {
  return (
    <>
      <Text style={{ ...s.body, margin: 0 }}>{firstName ? `Beste ${firstName},` : "Beste gast,"}</Text>
      <Text style={{ ...s.body, margin: "8px 0 0" }}>{children}</Text>
    </>
  );
}

// ── Dealkaart ────────────────────────────────────────────────────────────────────────────────
// Elke kaart is op desktop even hoog, want in Klaviyo moet een herhalend blok één hoogte hebben.
// De waarden zijn de hoogste kaart die voorkomt, dus er wordt nooit iets afgesneden; bij een
// kortere kaart staat de tekst verticaal gecentreerd. Op mobiel vervalt de hoogte (`m-auto-h`).
export const CARD_HEIGHT_ROW = "425px";
/** Bij de grote kaart staat de hoogte op het tekstblok onder de foto, niet op de kaart zelf: een
 *  vaste hoogte op de kaart verdeelt de overgebleven ruimte over de rijen en zet dan een witte
 *  strook boven de foto. 379 px tekstblok + 315 px foto + 2 px rand = 696 px kaart. */
export const CARD_TEXT_HEIGHT_FEATURED = "379px";
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
        <Text style={{ ...s.name, margin: 0 }}>
          {d.hotelName}
          {d.stars ? <span style={{ letterSpacing: "1px", marginLeft: "8px" }}>{"★".repeat(d.stars)}</span> : null}
        </Text>
      )}
      {d.place && <Text style={{ ...s.muted, margin: "2px 0 0" }}>{d.place}</Text>}
      {(d.hotelName || d.place) && <Section style={{ borderTop: "1px solid #E5E5E5", marginTop: "12px", fontSize: "1px", lineHeight: "1px" }}>&nbsp;</Section>}
      {d.packageTitle && <Text style={{ ...s.kop, fontSize: "18px", margin: d.hotelName || d.place ? "10px 0 0" : 0 }}>{d.packageTitle}</Text>}
      {d.includes && d.includes.length > 0 && (
        <>
          <Text style={{ fontFamily: font.heading, fontWeight: 600, fontSize: "16px", lineHeight: "1.4", color: c.cta, margin: "12px 0 2px" }}>Arrangement</Text>
          {/* Hangende inspringing: een inclusie over twee regels lijnt op de tweede regel uit met
              de tekst erboven en niet met het vinkje. 22 px = vinkje (14) plus de ruimte (8). */}
          {d.includes.slice(0, 4).map((inc) => (
            <Text key={inc} style={{ ...s.muted, margin: "4px 0 0", paddingLeft: "22px", textIndent: "-22px" }}>
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
        <Text key={l} style={{ ...s.title, margin: i ? "2px 0 0" : "14px 0 0" }}>{l}</Text>
      ))}
      {d.priceFor && <Text style={{ ...s.name, margin: "14px 0 0" }}>{d.priceFor}</Text>}
      <Row style={{ marginTop: "8px" }}>
        {d.discount && (
          <Column className="m-badge-cell" style={{ verticalAlign: "middle", width: "1%", paddingRight: "12px" }}>
            <span className="m-badge" style={{ ...priceRowBox, display: "inline-block", whiteSpace: "nowrap", backgroundColor: c.text, fontFamily: font.body, padding: "11px 12px" }}>{d.discount}</span>
          </Column>
        )}
        <Column style={{ verticalAlign: "middle" }}>
          <Text className="m-price" style={{ fontFamily: font.body, fontSize: "16px", lineHeight: "24px", color: c.muted, margin: 0, whiteSpace: "nowrap" }}>
            Vanaf <span className="m-price-big" style={{ fontSize: "20px", fontWeight: 700, color: c.text }}>{d.price}</span>
            {d.original && <span style={{ color: "#D32F2F", textDecoration: "line-through", marginLeft: "8px" }}>{d.original}</span>}
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

/** Dealrij: foto links over de volle hoogte, tekst rechts. Heeft de deal een tweede foto, dan
 *  staan er twee foto's onder elkaar met 3 px wit ertussen (samen 211 + 212 = 423 px binnen de
 *  rand). Het randje is een witte bovenrand op de tweede foto; een achtergrondfoto loopt niet
 *  door onder een rand. Op mobiel valt de tweede foto weg. */
export function AutomationDealRow({ deal: d, cta, top = "12px" }: { deal: AutomationDeal; cta?: string; top?: string }) {
  const rich = !!d.price || !!d.includes;
  return (
    <Section className={rich ? "m-auto-h" : undefined} style={{ backgroundColor: "#FFFFFF", border: `1px solid #E5E5E5`, borderRadius: "8px", marginTop: top, overflow: "hidden", height: rich ? CARD_HEIGHT_ROW : undefined }}>
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
        <Column className="stack m-cardtext" style={{ verticalAlign: rich ? "middle" : "top", padding: rich ? "16px 18px 18px" : "16px 18px" }}>
          <DealText d={d} />
          {d.price ? (
            <DealPrice d={d} cta={cta ?? "Bekijk"} />
          ) : (
            <>
              {d.lines?.map((l, i) => (
                <Text key={l} style={{ ...s.title, margin: i ? "2px 0 0" : "14px 0 0" }}>{l}</Text>
              ))}
              <TextLink href={d.url}>{cta ?? "Bekijk"}</TextLink>
            </>
          )}
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
    <Section style={{ backgroundColor: "#FFFFFF", border: `1px solid #E5E5E5`, borderRadius: "8px", marginTop: "12px", overflow: "hidden" }}>
      <Link href={d.url}>
        <Img src={d.image} alt={d.packageTitle ?? d.hotelName ?? ""} width="560" height="315" style={{ display: "block", width: "100%", height: "auto", aspectRatio: "16 / 9", objectFit: "cover" }} />
      </Link>
      <Section className={fixed ? "m-auto-h" : undefined} style={{ padding: "16px 20px 20px", height: fixed ? CARD_TEXT_HEIGHT_FEATURED : undefined }}>
        <DealText d={d} />
        {d.price && priceRow && <DealPrice d={d} cta={cta ?? "Bekijk"} />}
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
export type GuestRating = { average: 3 | 3.5 | 4 | 4.5 | 5; label: string; review?: { text: string; author: string } };

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
      <Text style={{ ...s.body, margin: "6px 0 0" }}>{rating.label}</Text>
      {rating.review && (
        <Section style={{ marginTop: "22px" }}>
          <Text style={{ fontFamily: font.heading, fontSize: "20px", lineHeight: "1.35", color: c.text, margin: 0 }}>&ldquo;{rating.review.text}&rdquo;</Text>
          <Text style={{ ...s.muted, margin: "4px 0 0" }}>{rating.review.author}</Text>
        </Section>
      )}
    </>
  );
}

/** S6 Merksectie: waarom ViaLuxury, in één alinea. */
export function BrandSection({ children }: { children: React.ReactNode }) {
  return <Text style={{ ...s.body, margin: 0 }}>{children}</Text>;
}

/** S15 Servicesectie: de regel uit de sheet, met de link naar de klantenservice. */
export function ServiceSection() {
  return (
    <Text style={{ ...s.title, margin: 0 }}>
      Vragen over dit arrangement? Onze{" "}
      <Link href="https://vialuxury.com/nl-NL/klantenservice" style={{ color: c.link, textDecoration: "underline" }}>klantenservice</Link>{" "}
      helpt je graag.
    </Text>
  );
}

/** S18 Zoekopdracht: zoekterm, datum en personen in een wit, omlijnd blok met de knop. */
export function SearchSection({ searchTerm, arrivalDate, persons, resultsUrl }: { searchTerm?: string; arrivalDate?: string; persons?: number; resultsUrl: string }) {
  return (
    <Section style={{ backgroundColor: "#FFFFFF", border: `1px solid #E5E5E5`, borderRadius: "8px", padding: "14px 20px 22px" }}>
      <IconLine icon="magnifier-donker" bold>{searchTerm ?? "Jouw zoekopdracht"}</IconLine>
      {arrivalDate && <IconLine icon="calendar-donker">{arrivalDate}</IconLine>}
      {persons && <IconLine icon="users-donker">{persons} {persons === 1 ? "persoon" : "personen"}</IconLine>}
      <Section style={{ marginTop: "18px" }}>
        <PrimaryButton href={resultsUrl}>Bekijk alle resultaten</PrimaryButton>
      </Section>
    </Section>
  );
}

/** S7 Themasectie: de themaknoppen met de knop "Alle thema's" (zet hem in een BeigeBand).
 *  De tegels en hun landingspagina's komen uit het tabblad Themategels, de keuze volgt de
 *  seizoensthema's van de verzendmaand (tabblad Seizoensthema's). */
export function ThemeSection({ title, note, items }: { title: string; note: string; items: Pill[] }) {
  return (
    <>
      <Text style={s.kop}>{title}</Text>
      <PillGrid items={[...items, { label: "Alle thema's", href: "https://vialuxury.com/nl-NL/zoeken" }]} />
      <Text style={{ ...s.muted, margin: "14px 0 0" }}>{note}</Text>
    </>
  );
}

export { site };
