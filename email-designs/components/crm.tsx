import { Button, Column, Container, Heading, Img, Link, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import HelpBanner from "./HelpBanner";
import { baseUrl, font, newsletter } from "./theme";
import secondImages from "../lib/secondImages.json";

// Gedeelde bouwstenen van de CRM-mails (concept, alleen desktop + light mode).
//
// Spelregels (zie ook CLAUDE.md, sectie CRM):
// - Drie lettergroottes: titel 32, subtitel/hotelnaam 20, alle overige tekst 16 px. Uitzondering:
//   de dealtitel in een dealkaart is 18 px.
// - Alles links uitgelijnd (alleen de inhoud van de coupon staat gecentreerd).
// - Klaviyo: nooit twee lettertypen naast elkaar op één regel; onder elkaar mag wel.
// - Geen grijze vlakken; beige alleen als highlight, als band over de hele breedte (BeigeBand)
//   achter keuzeblokken en groepen suggesties. Blokken zijn wit met een grijze rand (#E5E5E5, zoals de website).
// - Geen labels ("Populair" e.d.) op deals; prijzen zijn het totaal voor 2 personen.
// - Deals staan op de uitgebreide kaart (zoals de zoekkaart op de website); geen tekst op een foto.
// - Links naar het prototype gaan naar de R1-dealpagina (zachte landing).
// - Elke mail heeft de hulplijn "Hulp nodig?" (CrmHelp), direct na de hoofdboodschap, niet als onderste blok.

const c = newsletter.light;

export const site = "https://vialuxury.vercel.app";

export const crmCss = `
body { margin: 0 !important; padding: 0 !important; }
@media only screen and (max-width: 480px) {
  .stack { display: block !important; width: 100% !important; padding: 0 0 12px !important; }
  .m-pad { padding-left: 16px !important; padding-right: 16px !important; }
  .m-h1 { font-size: 28px !important; }
}
`;

/** Extra mobiele regels voor de commerciële mails (mobiele versie in de preview, 390 px breed). */
export const commercieelCss = `
@media only screen and (max-width: 480px) {
  .m-hero { height: 230px !important; }
  .m-hero-left { padding-left: 16px !important; }
  .m-hero-right { padding-right: 16px !important; }
  .m-hero-title { font-size: 32px !important; }
  .m-head-title { font-size: 18px !important; }
  .m-head-cell { padding: 0 8px !important; }
  .m-head-pad { padding: 12px 16px !important; }
  .m-trustpilot { width: 85px !important; height: auto !important; }
  .m-tcenter { text-align: center !important; }
  .m-only { display: block !important; }
  .m-hide { display: none !important; }
  .m-reason { margin-top: 24px !important; }
  .m-small-print { margin-top: 4px !important; }
  .m-block { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; }
}
`;

export const s = {
  /** Titel: 32 px serif. */
  h1: { fontFamily: font.heading, fontWeight: 600, fontSize: "32px", lineHeight: "1.2", color: c.heading, margin: 0 },
  /** Subtitel en hotelnaam: 20 px serif. */
  kop: { fontFamily: font.heading, fontWeight: 600, fontSize: "20px", lineHeight: "1.3", color: c.heading, margin: 0 },
  /** Lopende tekst: 16 px. */
  body: { fontFamily: font.body, fontSize: "16px", lineHeight: "1.5", color: c.text, margin: "8px 0 0" },
  /** Vette regel (prijs, datums): 16 px. */
  name: { fontFamily: font.body, fontSize: "16px", fontWeight: 700, lineHeight: "1.4", color: c.text, margin: 0 },
  /** Regel in een blok: 16 px. */
  title: { fontFamily: font.body, fontSize: "16px", lineHeight: "1.4", color: c.text, margin: "2px 0 0" },
  /** Bijregel (plaats, toelichting): 16 px grijs. */
  muted: { fontFamily: font.body, fontSize: "16px", lineHeight: "1.4", color: c.muted, margin: "4px 0 0" },
};

/** Briefopening, het vaste begin van een CRM-mail: aanhef ("Beste Sanne," of zonder naam
 *  "Beste gast,"; in elke mail dezelfde aanhef) en een korte intro. Geen ondertekening: er is op dit
 *  moment geen afzender (de ondertekening "Groetjes Yvette" is op 2026-11-25 vervallen). Titels van blokken (bijv. "Anderen boekten ook") komen
 *  ná de brief, direct boven het blok waar ze bij horen. */
export function Letter({ firstName, children }: { firstName?: string; children: React.ReactNode }) {
  const salutation = firstName ? `Beste ${firstName},` : "Beste gast,";
  return (
    <>
      <Text style={{ ...s.body, margin: 0 }}>{salutation}</Text>
      <Text style={{ ...s.body, margin: "8px 0 0" }}>{children}</Text>
    </>
  );
}

/** De gastquote “Dit moeten we vaker doen!”: een uitspraak van een gast, dus vormgegeven als review
 *  (tussen aanhalingstekens, handgeschreven lettertype Caveat). De quote is een afbeelding
 *  (scripts/mail-graphics/guest-quote.py), want een webfont werkt niet in elke mailclient. `tone`:
 *  "donker" op een licht vlak, "wit" in de zwarte footer. Standaard met de afzender eronder
 *  ("— Onze tevreden gasten"); `bare` laat alleen de quote zien. `width`: breedte van de quote in px.
 *  Concept, alleen in de voorbeeldmail "Dit moeten we vaker doen". */
export function GuestQuote({ tone = "donker", bare, width = 367, animated }: { tone?: "donker" | "wit"; bare?: boolean; width?: number; /** Geanimeerde gif (alleen wit, 250 px breed, op de footerkleur): de quote wordt in 1 s geschreven, 3 s rust, herhaalt. */ animated?: boolean }) {
  return (
    <div id="gastquote">
      <Img src={`${baseUrl}/images/mail/crm/gastquote-${tone}.${animated ? "gif" : "png"}`} alt="“Dit moeten we vaker doen!”" width={width} height={Math.round((width * 34) / 367)} style={{ display: "block", width: `${width}px`, maxWidth: "100%", height: "auto" }} />
      {/* De afzender, zoals onder een echte quote: streepje ervoor */}
      {!bare && <Text style={{ ...s.muted, color: tone === "wit" ? "#FFFFFF" : c.muted, margin: "8px 0 0" }}>— Onze tevreden gasten</Text>}
    </div>
  );
}

/** Hulplijn van elke CRM- en commerciële mail, direct na de hoofdboodschap (alleen onderaan als er geen
 *  betere plek is; zie CLAUDE.md): hetzelfde blok "Hulp nodig?" als in de post-bookingmails
 *  (HelpBanner), met 16 px tekst. `top`: witruimte erboven als de sectie ervoor er geen heeft. */
export function CrmHelp({ top = "0", bottom = "40px" }: { top?: string; /** "0" als er nog een blok met eigen bovenmarge onder staat. */ bottom?: string }) {
  return <HelpBanner fontSize="16px" padding={`${top} 32px ${bottom}`} />;
}

/** Primaire, oranje knop. `small`: compacter, voor in een dealblok. */
export function PrimaryButton({ href, children, small }: { href: string; children: React.ReactNode; small?: boolean }) {
  return (
    <Button
      href={href}
      style={{
        backgroundColor: c.cta,
        color: "#FFFFFF",
        fontFamily: font.body,
        fontSize: "16px",
        fontWeight: 700,
        borderRadius: "6px",
        padding: small ? "11px 20px" : "14px 28px",
        textDecoration: "none",
      }}
    >
      {children}
    </Button>
  );
}

/** Secundaire knop: wit met grijze rand (zoals de website), of met `dark` zwart met witte tekst;
 *  nooit oranje (kleur alleen voor de kern). */
export function SecondaryButton({ href, children, block, dark }: { href: string; children: React.ReactNode; block?: boolean; dark?: boolean }) {
  return (
    <Button
      href={href}
      style={{
        display: block ? "block" : "inline-block",
        textAlign: "center",
        backgroundColor: dark ? c.text : "#FFFFFF",
        border: `1px solid ${dark ? c.text : "#E5E5E5"}`,
        color: dark ? "#FFFFFF" : c.text,
        fontFamily: font.body,
        fontSize: "16px",
        fontWeight: 700,
        borderRadius: "6px",
        padding: "10px 20px",
        textDecoration: "none",
      }}
    >
      {children}
    </Button>
  );
}

/** Oranje, onderstreepte tekstlink (bijv. "Bekijk" in een dealrij). */
export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{ display: "inline-block", marginTop: "10px", fontFamily: font.body, fontSize: "16px", fontWeight: 700, color: c.link, textDecoration: "underline" }}>
      {children}
    </Link>
  );
}

/** Deal of verblijf in een blok. Elke regel staat op zichzelf (Klaviyo). */
export type RowDeal = {
  hotelName?: string;
  /** Aantal sterren, op een eigen regel onder de hotelnaam. */
  stars?: number;
  place?: string;
  packageTitle?: string;
  /** Vette regel onder de dealtitel: "31 oktober tot 2 november 2026" of "Vanaf €319 voor 2 personen". */
  line?: string;
  /** Gewone bodyregels onder de dealtitel (bekeken deal: aankomst, nachten en personen, besparing). */
  lines?: string[];
  image: string;
  /** Tweede foto (dealrij): de rij heeft altijd twee foto's onder elkaar met 6 px wit ertussen. Leeg → de
   *  volgende foto van hetzelfde arrangement (zie `secondImage`). */
  image2?: string;
  url: string;
  /** Uitgebreide kaart (zoals de zoekkaart op de website); een deal met `price` krijgt die: */
  /** Inclusies met een groen vinkje, maximaal vier. */
  includes?: string[];
  /** Kortingspercentage, als blokje links van de prijs, bijv. "-37%". */
  discount?: string;
  /** Vanafprijs en doorgestreepte kamerprijs, bijv. "€409" en "€645". */
  price?: string;
  original?: string;
  /** Waar de prijs voor geldt, bijv. "2 personen, 2 nachten". */
  priceFor?: string;
  /** Prijs na aftrek van de kortingscode van de ontvanger, bijv. "€499"; regel onder de prijsrij. */
  withCode?: string;
};

/** De tekstregels van een dealblok: hotelnaam (20 serif), sterren, plaats, dealtitel en de vette regel. */
function DealText({ d }: { d: RowDeal }) {
  return (
    <>
      {d.hotelName && <Text style={s.kop}>{d.hotelName}</Text>}
      {d.stars && <Text style={{ ...s.title, letterSpacing: "2px", margin: "2px 0 0" }}>{"★".repeat(d.stars)}</Text>}
      {d.place && <Text style={{ ...s.muted, margin: "2px 0 0" }}>{d.place}</Text>}
      {d.packageTitle && <Text style={{ ...s.title, margin: "8px 0 0" }}>{d.packageTitle}</Text>}
      {d.line && <Text style={{ ...s.name, margin: "8px 0 0" }}>{d.line}</Text>}
      {d.lines?.map((l, i) => (
        <Text key={l} style={{ ...s.title, margin: i ? "2px 0 0" : "8px 0 0" }}>{l}</Text>
      ))}
    </>
  );
}

// ── Dealkaart: de zoekkaart van de website als e-mail ───────────────────────────────────────
// Een deal met een prijs (`price`) krijgt de uitgebreide kaart, in dezelfde volgorde als de
// zoekkaart: hotel met sterren en plaats (ondergeschikt), lijntje, de dealtitel als meest
// prominente regel, "Arrangement" met de inclusies, voor wie de prijs geldt en onderaan één rij:
// links het kortingsblokje, daarnaast de vanafprijs met de doorgestreepte kamerprijs, rechts de knop.
// Klaviyo: geen tekst op een foto (de korting staat daarom naast de prijs) en elke regel één
// lettertype: hotelnaam en sterren in de sans, de prijsrij helemaal sans.
// Zonder `price` (een verblijf met datums, de deal uit het winkelmandje) blijft het de kale kaart.

const checkIcon = `${baseUrl}/images/mail/crm/check-groen.png`;
/** Kortingsblokje en knop in de prijsrij: zelfde hoogte (42 px) en zelfde afronding. */
const priceRowBox = { fontSize: "16px", fontWeight: 700, lineHeight: "20px", borderRadius: "6px", color: "#FFFFFF" };

/** Tekstdeel van de uitgebreide kaart, t/m de inclusies. */
function RichDealText({ d, allIncludes }: { d: RowDeal; /** Alle inclusies in plaats van de eerste vier. */ allIncludes?: boolean }) {
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
          {(allIncludes ? d.includes : d.includes.slice(0, 4)).map((inc) => (
            <Text key={inc} style={{ ...s.muted, margin: "4px 0 0" }}>
              <Img src={checkIcon} alt="" width="14" height="14" style={{ display: "inline-block", verticalAlign: "-1px", marginRight: "8px" }} />
              {inc}
            </Text>
          ))}
        </>
      )}
    </>
  );
}

/** Onderkant van de uitgebreide kaart: voor wie de prijs geldt en daaronder één rij met links het
 *  kortingsblokje, daarnaast de vanafprijs met de doorgestreepte kamerprijs en rechts de knop. */
function RichDealPrice({ d, cta }: { d: RowDeal; cta: string }) {
  return (
    <>
      {d.priceFor && <Text style={{ ...s.name, margin: "14px 0 0" }}>{d.priceFor}</Text>}
      <Row style={{ marginTop: "8px" }}>
        {d.discount && (
          <Column style={{ verticalAlign: "middle", width: "1%", paddingRight: "12px" }}>
            <span style={{ ...priceRowBox, display: "inline-block", whiteSpace: "nowrap", backgroundColor: c.text, fontFamily: font.body, padding: "11px 12px" }}>{d.discount}</span>
          </Column>
        )}
        <Column style={{ verticalAlign: "middle" }}>
          <Text style={{ fontFamily: font.body, fontSize: "16px", lineHeight: "24px", color: c.muted, margin: 0, whiteSpace: "nowrap" }}>
            Vanaf <span style={{ fontSize: "20px", fontWeight: 700, color: c.text }}>{d.price}</span>
            {d.original && <span style={{ color: "#D32F2F", textDecoration: "line-through", marginLeft: "8px" }}>{d.original}</span>}
          </Text>
        </Column>
        <Column style={{ verticalAlign: "middle", textAlign: "right", width: "1%" }}>
          <Button href={d.url} style={{ ...priceRowBox, backgroundColor: c.cta, fontFamily: font.body, padding: "11px 20px", textDecoration: "none", whiteSpace: "nowrap" }}>
            {cta}
          </Button>
        </Column>
      </Row>
      {d.withCode && (
        <Text style={{ ...s.title, margin: "10px 0 0" }}>
          Met jouw code: <span style={{ fontWeight: 700 }}>{d.withCode}</span>
        </Text>
      )}
    </>
  );
}

/** Prijs van een deal na aftrek van een kortingsbedrag: ("€519", 20) → "€499". */
export const priceWithCode = (price: string | undefined, discount: number) => {
  const n = Number((price ?? "").replace(/[^0-9]/g, ""));
  return n > discount ? `€${n - discount}` : undefined;
};

/** Ruimte tussen twee dealkaarten onder elkaar. */
export const cardGap = "24px";

/** Dealrij met grijze rand: foto links tot aan de rand en over de volle hoogte. Met een prijs de
 *  uitgebreide kaart (knop "Bekijk"), anders de tekstregels met een oranje link. Met inclusies maar
 *  zonder prijs (de bekeken deal): de uitgebreide kaart met onderaan de eigen regels en de link.
 *  `top`: 12 px onder een titel (standaard), `cardGap` (24 px) onder een andere kaart. */
/** Tweede foto van een deal voor de dealrij: `image2`, anders de volgende foto van hetzelfde
 *  arrangement (lib/secondImages.json: asset-id → volgende asset-id, gemaakt uit app/data/deals.json). */
function secondImage(d: RowDeal): string | undefined {
  if (d.image2) return d.image2;
  const id = d.image.match(/assets\/([0-9a-f-]{36})/)?.[1];
  const next = id ? (secondImages as Record<string, string>)[id] : undefined;
  return next ? d.image.replace(id!, next) : undefined;
}

export function DealRow({ deal: d, cta, top = "12px" }: { deal: RowDeal; cta?: string; top?: string }) {
  const rich = !!d.price || !!d.includes;
  // De uitgebreide rij heeft altijd twee foto's onder elkaar; de kale kaart ("Jouw verblijf") één
  const image2 = rich ? secondImage(d) : undefined;
  return (
    <Section style={{ backgroundColor: "#FFFFFF", border: `1px solid #E5E5E5`, borderRadius: "8px", marginTop: top, overflow: "hidden" }}>
      <Row>
        {/* Foto als achtergrond: sluit aan op de rand en vult de hele hoogte van het blok */}
        {image2 ? (
          // Twee foto's onder elkaar met 6 px wit ertussen; samen vullen ze de hele hoogte van het blok
          <Column className="stack" style={{ width: "190px", height: "1px", verticalAlign: "top", padding: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", width: "190px", height: "100%", minHeight: "240px" }}>
              {[d.image, image2].map((src, i) => (
                <Link key={src} href={d.url} aria-label={d.hotelName ?? cta ?? "Bekijk"} style={{ display: "block", flex: "1 1 0", marginTop: i ? "6px" : 0, backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center" }} />
              ))}
            </div>
          </Column>
        ) : (
          <Column className="stack" style={{ width: "190px", verticalAlign: "top", backgroundImage: `url(${d.image})`, backgroundSize: "cover", backgroundPosition: "center" }}>
            <Link href={d.url} aria-label={d.hotelName ?? cta ?? "Bekijk"} style={{ display: "block", width: "190px", minHeight: "150px" }} />
          </Column>
        )}
        <Column className="stack" style={{ verticalAlign: "top", padding: rich ? "16px 18px 18px" : "16px 18px" }}>
          {rich ? (
            <>
              <RichDealText d={d} />
              {d.price ? (
                <RichDealPrice d={d} cta={cta ?? "Bekijk"} />
              ) : (
                <>
                  {/* Bekeken deal: geen prijsrij maar de eigen regels en een link */}
                  {d.lines?.map((l, i) => (
                    <Text key={l} style={{ ...s.title, margin: i ? "2px 0 0" : "14px 0 0" }}>{l}</Text>
                  ))}
                  <TextLink href={d.url}>{cta ?? "Bekijk"}</TextLink>
                </>
              )}
            </>
          ) : (
            <>
              <DealText d={d} />
              <TextLink href={d.url}>{cta ?? "Bekijk"}</TextLink>
            </>
          )}
        </Column>
      </Row>
    </Section>
  );
}

/** Hoogte van de dealrij met vaste hoogte (zonder rand) en de witruimte tussen de twee foto's. */
export const fixedRowHeight = 416;
const fixedPhotoGap = 6;

/** Dealrij met VASTE hoogte (concept): links twee foto's onder elkaar met wat witruimte ertussen
 *  in plaats van één langwerpige foto, rechts de uitgebreide kaart. De kaart is altijd even hoog,
 *  hoe lang de dealtitel ook is: de prijsrij staat onderaan vast en de ruimte tussen de laatste
 *  inclusie en de prijsrij vangt het verschil op (titel van drie regels → minder witruimte).
 *  Voorwaarde: elke inclusie past op één regel en de titel is maximaal drie regels. */
export function DealRowFixed({ deal: d, image2, cta, top = "12px" }: { deal: RowDeal; /** Tweede foto, onder de eerste. */ image2: string; cta?: string; top?: string }) {
  const h = fixedRowHeight;
  const photoH = (h - fixedPhotoGap) / 2;
  const photo = (src: string) => (
    <Link href={d.url}>
      <Img src={src} alt={d.hotelName ?? ""} width="190" height={photoH} style={{ display: "block", width: "190px", height: `${photoH}px`, objectFit: "cover" }} />
    </Link>
  );
  return (
    <Section style={{ backgroundColor: "#FFFFFF", border: `1px solid #E5E5E5`, borderRadius: "8px", marginTop: top, overflow: "hidden" }}>
      <Row>
        <Column style={{ width: "190px", verticalAlign: "top", fontSize: 0, lineHeight: 0 }}>
          {photo(d.image)}
          <div style={{ height: `${fixedPhotoGap}px`, lineHeight: `${fixedPhotoGap}px`, fontSize: "1px" }}>&nbsp;</div>
          {photo(image2)}
        </Column>
        <Column style={{ verticalAlign: "top", padding: 0 }}>
          {/* Vaste hoogte: bovenste rij groeit mee met de titel, de prijsrij staat onderaan vast */}
          <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={{ width: "100%", height: `${h}px`, borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td valign="top" style={{ padding: "16px 18px 0", verticalAlign: "top" }}>
                  <RichDealText d={d} />
                </td>
              </tr>
              <tr>
                <td valign="bottom" style={{ padding: "0 18px 18px", verticalAlign: "bottom", height: "1px" }}>
                  <RichDealPrice d={d} cta={cta ?? "Bekijk"} />
                </td>
              </tr>
            </tbody>
          </table>
        </Column>
      </Row>
    </Section>
  );
}

/** Uitgelichte deal over de hele breedte: grote foto, daaronder met een prijs de uitgebreide kaart
 *  (knop "Bekijk"), anders de tekstregels en een oranje knop "Bekijk arrangement".
 *  `priceRow={false}`: zonder de prijsrij en de knop (winkelmandje: prijs en knop staan erboven). */
export function FeaturedDeal({ deal: d, cta, priceRow = true, allIncludes }: { deal: RowDeal; cta?: string; priceRow?: boolean; /** Alle inclusies tonen (dedicated mail), niet alleen de eerste vier. */ allIncludes?: boolean }) {
  const rich = !!d.price;
  return (
    <Section style={{ backgroundColor: "#FFFFFF", border: `1px solid #E5E5E5`, borderRadius: "8px", marginTop: "12px", overflow: "hidden" }}>
      <Link href={d.url}>
        <Img src={d.image} alt={d.packageTitle ?? d.hotelName ?? ""} width="560" height="300" style={{ display: "block", width: "100%", height: "300px", objectFit: "cover" }} />
      </Link>
      {rich ? (
        <Section style={{ padding: "16px 20px 20px" }}>
          <RichDealText d={d} allIncludes={allIncludes} />
          {priceRow && <RichDealPrice d={d} cta={cta ?? "Bekijk"} />}
        </Section>
      ) : (
        <Section style={{ padding: "18px 20px 22px" }}>
          <DealText d={d} />
          <Section style={{ marginTop: "14px" }}>
            <PrimaryButton href={d.url} small>{cta ?? "Bekijk arrangement"}</PrimaryButton>
          </Section>
        </Section>
      )}
    </Section>
  );
}

/** Beige band over de hele breedte van de mail (highlight achter een keuzeblok of een groep
 *  suggesties). De inhoud staat in dezelfde kolom van 626 px met 32 px marge als de rest van de
 *  mail, dus tekst en kaarten lijnen uit met wat erboven en eronder staat. Net als de zwarte
 *  header en footer staat de band BUITEN de <Container> van de mail: sluit die ervoor en open er
 *  een nieuwe na. `top`: witte ruimte boven de band. Meerdere banden onder elkaar sluiten zonder
 *  tussenruimte op elkaar aan en wisselen af: beige, wit (`white`), beige. */
export function BeigeBand({ children, top = "0", white, notch }: { children: React.ReactNode; top?: string; white?: boolean; /** Wit driehoekje (punt omlaag) midden in de bovenrand van de band: een hint om verder te scrollen. */ notch?: boolean }) {
  return (
    <Section style={{ backgroundColor: white ? "#FFFFFF" : "#F4F1EC", width: "100%", marginTop: top }}>
      {notch && <div style={{ width: 0, height: 0, margin: "0 auto", borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderTop: "16px solid #FFFFFF", fontSize: 0, lineHeight: 0 }} />}
      <Container style={{ width: "100%", maxWidth: "626px" }}>
        <Section className="m-pad" style={{ padding: "24px 32px 28px" }}>{children}</Section>
      </Container>
    </Section>
  );
}

/** Ruimte tussen twee dealkaarten binnen een DealGroup. */
export const groupGap = "16px";

/** Groep suggesties op een band over de hele breedte (om en om beige en wit: geef de even groepen
 *  `white` mee): subtitel (20 serif) en eventueel een
 *  grijze regel eronder, dan de dealkaarten (wit). Staat net als BeigeBand buiten de <Container>. */
export function DealGroup({ title, subtitle, top, white, notch, children }: { title: string; subtitle?: string; top?: string; white?: boolean; notch?: boolean; children: React.ReactNode }) {
  return (
    <BeigeBand top={top} white={white} notch={notch}>
      <Text style={s.kop}>{title}</Text>
      {subtitle && <Text style={{ ...s.muted, margin: "2px 0 0" }}>{subtitle}</Text>}
      {children}
    </BeigeBand>
  );
}

/** Eén groot, de rest als rij: de vaste opbouw van een rij suggesties. */
export function DealList({ deals }: { deals: RowDeal[] }) {
  const [first, ...rest] = deals;
  return (
    <>
      {first && <FeaturedDeal deal={first} />}
      {rest.map((d) => (
        <DealRow key={d.url} deal={d} top={cardGap} />
      ))}
    </>
  );
}

const mailIcon = (name: string) => `${baseUrl}/images/mail/crm/${name}.png`;

/** Regel met een icoon ervoor (klok, kalender, vergrootglas). */
export function IconLine({ icon, children, bold }: { icon: string; children: React.ReactNode; bold?: boolean }) {
  return (
    <Text style={{ ...(bold ? s.name : s.title), margin: "6px 0 0" }}>
      <Img src={mailIcon(icon)} alt="" width="18" height="18" style={{ display: "inline-block", verticalAlign: "-3px", marginRight: "8px" }} />
      {children}
    </Text>
  );
}

/** Kortingscode als coupon (naar het codeblok van Jesse's terugkomactie): één blok met een oranje
 *  gestippelde rand waarin alles gecentreerd onder elkaar staat: wat je krijgt (`title`, bijv.
 *  "€20 cadeau"), het label, de code als selecteerbare tekst in oranje serif, de geldigheid en de
 *  instructie. Met `daysLeft`: "Nog 14 dagen geldig, tot en met …". */
export function CodeBlock({ title, code, label = "Jouw persoonlijke code", deadline, daysLeft, urgent }: { title?: string; code: string; label?: string; deadline: string; daysLeft?: number; /** Herinnering: de termijn is het grootst ("Nog 14 dagen"), het bedrag staat eronder; geef het bedrag mee als `title` ("€20 cadeau"). */ urgent?: boolean }) {
  const center = { textAlign: "center" as const };
  if (urgent && daysLeft) {
    return (
      <Section style={{ width: "100%", border: `2px dashed ${c.cta}`, borderRadius: "8px", padding: "22px 22px 24px", textAlign: "center" }}>
        <Text style={{ ...s.h1, fontWeight: 700, color: c.cta, ...center, margin: 0 }}>Nog {daysLeft} dagen</Text>
        {title && <Text style={{ ...s.name, ...center, margin: "4px 0 14px" }}>om je {title} te gebruiken</Text>}
        <Text style={{ ...s.title, ...center, margin: 0 }}>{label}</Text>
        <Text style={{ fontFamily: font.heading, fontWeight: 700, fontSize: "20px", lineHeight: "1.3", letterSpacing: "0.02em", color: c.text, margin: "4px 0 0", ...center }}>{code}</Text>
        <Text style={{ ...s.name, ...center, margin: "14px 0 0" }}>
          <Img src={mailIcon("clock-donker")} alt="" width="18" height="18" style={{ display: "inline-block", verticalAlign: "-3px", marginRight: "8px" }} />
          Geldig tot en met {deadline}
        </Text>
        <Text style={{ ...s.muted, ...center, margin: "2px 0 0" }}>Vul de code in bij het boeken.</Text>
      </Section>
    );
  }
  return (
    <Section style={{ width: "100%", border: `2px dashed ${c.cta}`, borderRadius: "8px", padding: "22px 22px 24px", textAlign: "center" }}>
      {title && <Text style={{ ...s.h1, fontWeight: 700, color: c.cta, ...center, margin: "0 0 12px" }}>{title}</Text>}
      <Text style={{ ...s.title, ...center, margin: 0 }}>{label}</Text>
      <Text style={{ fontFamily: font.heading, fontWeight: 700, fontSize: "20px", lineHeight: "1.3", letterSpacing: "0.02em", color: c.text, margin: "4px 0 0", ...center }}>{code}</Text>
      <Text style={{ ...s.name, ...center, margin: "14px 0 0" }}>
        <Img src={mailIcon("clock-donker")} alt="" width="18" height="18" style={{ display: "inline-block", verticalAlign: "-3px", marginRight: "8px" }} />
        {daysLeft ? `Nog ${daysLeft} dagen geldig, tot en met ${deadline}` : `Geldig tot en met ${deadline}`}
      </Text>
      <Text style={{ ...s.muted, ...center, margin: "2px 0 0" }}>Vul de code in bij het boeken.</Text>
    </Section>
  );
}

/** Eén coupon in een CouponPair. `locked`: de code is er nog niet (grijze rand, code deels verborgen). */
export type Coupon = {
  /** "€10 cadeau" */
  title: string;
  /** "Op je 1e boeking" */
  label: string;
  /** "WENS1-387KW", of bij een code die nog komt "WENS2-#####". */
  code: string;
  /** Vette regel met het klokje, bijv. "Nog 24 uur geldig". */
  validity?: string;
  /** Kleine regel onderaan: hoe je de code gebruikt of wanneer je hem krijgt. */
  note: string;
  locked?: boolean;
};

/** Twee coupons naast elkaar, even hoog (favorieten: €10 op de eerste en €15 op de tweede
 *  boeking). Zelfde opbouw als CodeBlock: alles gecentreerd onder elkaar, bedrag het grootst. De
 *  tweede is `locked`: grijze stippelrand en een code waarvan alleen het begin zichtbaar is. */
export function CouponPair({ coupons }: { coupons: [Coupon, Coupon] }) {
  const center = { textAlign: "center" as const };
  const cell = (k: Coupon) => (
    <Column className="stack" width="275" style={{ width: "275px", verticalAlign: "top", border: `2px dashed ${k.locked ? "#BDBDBD" : c.cta}`, borderRadius: "8px", padding: "20px 14px 22px", textAlign: "center" }}>
      <Text style={{ ...s.h1, fontWeight: 700, color: k.locked ? c.muted : c.cta, ...center, margin: "0 0 10px" }}>{k.title}</Text>
      <Text style={{ ...s.title, ...center, margin: 0 }}>{k.label}</Text>
      <Text style={{ fontFamily: font.heading, fontWeight: 700, fontSize: "20px", lineHeight: "1.3", letterSpacing: "0.02em", color: k.locked ? c.muted : c.text, margin: "4px 0 0", whiteSpace: "nowrap", ...center }}>{k.code}</Text>
      {k.validity && (
        <Text style={{ ...s.name, ...center, margin: "14px 0 0" }}>
          <Img src={mailIcon("clock-donker")} alt="" width="18" height="18" style={{ display: "inline-block", verticalAlign: "-3px", marginRight: "8px" }} />
          {k.validity}
        </Text>
      )}
      <Text style={{ ...s.muted, ...center, margin: k.validity ? "2px 0 0" : "14px 0 0" }}>{k.note}</Text>
    </Column>
  );
  return (
    <Section style={{ width: "100%", borderCollapse: "separate" }}>
      <Row style={{ borderCollapse: "separate" }}>
        {cell(coupons[0])}
        <Column width="12" style={{ width: "12px", minWidth: "12px", fontSize: "1px", lineHeight: "1px" }}>&nbsp;</Column>
        {cell(coupons[1])}
      </Row>
    </Section>
  );
}

/** Thema uit de snelfilters van de homepage. */
export type Theme = { id: string; label: string; icon: string };
const themeIcon = (key: string) => `${baseUrl}/images/mail/theme-${key}.png`;
export const themes: Theme[] = [
  { id: "wellness", label: "Wellness", icon: themeIcon("bath") },
  { id: "aan-zee", label: "Aan zee", icon: themeIcon("waves") },
  { id: "natuur", label: "In de natuur", icon: themeIcon("leaf") },
  { id: "culinair", label: "Culinair genieten", icon: themeIcon("wine") },
  { id: "kasteel", label: "Kasteelhotels", icon: themeIcon("castle") },
  { id: "romantisch", label: "Romantisch", icon: themeIcon("heart") },
];

/** Raster van witte snelfilterknoppen (zoals "Snel zoeken" op de homepage): dun randje, optioneel
 *  een icoon, label links; twee even brede kolommen. */
export type Pill = { label: string; href: string; icon?: string };

export function PillGrid({ items }: { items: Pill[] }) {
  const perRow = 2;
  const rows = Array.from({ length: Math.ceil(items.length / perRow) }, (_, i) => items.slice(i * perRow, (i + 1) * perRow));
  return (
    <Section style={{ marginTop: "8px" }}>
      {rows.map((row, ri) => (
        <Row key={ri} style={{ marginTop: "8px" }}>
          {Array.from({ length: perRow }, (_, i) => {
            const t = row[i];
            return (
              <Column key={i} className="stack" style={{ width: `${100 / perRow}%`, verticalAlign: "top", paddingLeft: i ? "4px" : 0, paddingRight: i < perRow - 1 ? "4px" : 0 }}>
                {t && (
                  <Link
                    href={t.href}
                    style={{ display: "block", backgroundColor: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: "4px", padding: "13px 16px", fontFamily: font.body, fontSize: "16px", lineHeight: "20px", color: c.text, textDecoration: "none" }}
                  >
                    {t.icon && <Img src={t.icon} alt="" width="16" height="16" style={{ display: "inline-block", verticalAlign: "-2px", marginRight: "10px" }} />}
                    {t.label}
                  </Link>
                )}
              </Column>
            );
          })}
        </Row>
      ))}
    </Section>
  );
}

/** "Snel zoeken", het blok van de homepage als e-mail (zet het in een BeigeBand): titel en zes
 *  witte snelfilterknoppen met icoon in een raster van twee. Onderaan elke commerciële mail, boven
 *  de hulplijn. Elke knop gaat naar de R1-zoekpagina. */
export const quickSearches: { label: string; icon: string }[] = [
  { label: "Best geboekt", icon: themeIcon("diamond") },
  { label: "Stedentrips", icon: themeIcon("building") },
  { label: "Aan zee", icon: themeIcon("waves") },
  { label: "Romantisch", icon: themeIcon("heart") },
  { label: "Wellness", icon: themeIcon("bath") },
  { label: "Met diner", icon: themeIcon("utensils") },
];
export function QuickSearch() {
  return (
    <>
      <Text style={s.kop}>Snel zoeken</Text>
      <PillGrid items={quickSearches.map((q) => ({ ...q, href: `${site}/first-release/search` }))} />
    </>
  );
}

/** Themakiezer (zet hem in een BeigeBand): de snelfilterknoppen met icoon. Elke keuze gaat naar /crm/thema?keuze=<id>. */
export function ThemePicker({ items = themes }: { items?: Theme[] }) {
  return (
    <>
      <Text style={s.kop}>Waarover wil je aanbiedingen ontvangen?</Text>
      <Text style={{ ...s.body, margin: "2px 0 0" }}>Eén klik is genoeg, dan sturen we voortaan wat je zoekt.</Text>
      <PillGrid items={items.map((t) => ({ label: t.label, icon: t.icon, href: `${site}/crm/thema?keuze=${t.id}` }))} />
    </>
  );
}

/** Opening van een commerciële mail (Content en Dedicated), drie varianten met een schakelaar in de preview. */
export type OpeningVariant = "native" | "header-titel" | "foto-titel";
export const openingVariants = [["native", "", "Native"], ["header-titel", "-header-titel", "Header-titel"], ["foto-titel", "-foto-titel", "Titel op foto"]] as const;

/** Sfeerfoto over de hele breedte van de mail (van rand tot rand, net als de zwarte header; staat dus
 *  BUITEN de <Container>) met de actietitel en de knop; de inhoud van het vlak en de tekst op de foto
 *  staan in de kolom van de mail, links gelijk met het logo (32 px):
 *  - native: onder de foto een beige vlak (rechte hoeken) met een zwarte titel en een oranje knop; op
 *    desktop links, op mobiel gecentreerd (de donkergroene versie is op 2026-11-27 vervallen)
 *  - header-titel: de titel staat in de header (CrmHeader `title`); onder de foto een beige band met
 *    alleen de oranje knop, gecentreerd
 *  - foto-titel: de titel groot linksboven op de foto, de zwarte knop linksonder en rechtsonder een ronde
 *    sticker (`sticker`, bijv. de vanafprijs of de korting); een verloop houdt de witte tekst leesbaar
 *  De hele foto is klikbaar (naar `href`). */
export function CampaignOpening({ variant, hero, heroAlt, title, cta, href, sticker }: { variant: OpeningVariant; hero: string; heroAlt: string; title: string; cta: string; href: string; /** Ronde sticker op de foto (alleen foto-titel): kleine regel en grote regel. */ sticker?: { small?: string; big: string } }) {
  const inHeader = variant === "header-titel";
  return (
    <Section style={{ width: "100%" }}>
      {variant === "foto-titel" ? (
        // De foto als achtergrond over de hele breedte; titel, knop en sticker in de kolom van de mail
        <Section style={{ width: "100%", backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.45) 100%), url(${hero})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <Container style={{ width: "100%", maxWidth: "626px" }}>
        <table role="presentation" className="m-hero" cellPadding={0} cellSpacing={0} width="100%" style={{ width: "100%", height: "352px", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td colSpan={2} valign="top" className="m-pad" style={{ padding: "24px 32px 0", verticalAlign: "top" }}>
                <Heading as="h1" className="m-hero-title" style={{ ...s.h1, fontSize: "44px", lineHeight: "1.1", color: "#FFFFFF", textShadow: "0 1px 12px rgba(0,0,0,0.45)" }}>
                  <Link href={href} style={{ color: "#FFFFFF", textDecoration: "none" }}>{title}</Link>
                </Heading>
              </td>
            </tr>
            <tr>
              <td valign="bottom" className="m-hero-left" style={{ padding: "0 0 24px 32px", verticalAlign: "bottom" }}>
                <SecondaryButton href={href} dark>{cta}</SecondaryButton>
              </td>
              {sticker && (
                <td valign="bottom" align="right" className="m-hero-right" style={{ padding: "0 32px 20px 0", verticalAlign: "bottom", width: "112px" }}>
                  {/* Ronde sticker: oranje, tekst in wit */}
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: "104px", height: "104px", borderCollapse: "separate" }}>
                    <tbody>
                      <tr>
                        <td align="center" valign="middle" style={{ width: "104px", height: "104px", borderRadius: "52px", backgroundColor: c.cta, textAlign: "center", verticalAlign: "middle", boxShadow: "0 2px 10px rgba(0,0,0,0.25)" }}>
                          <Link href={href} style={{ textDecoration: "none", color: "#FFFFFF", fontFamily: font.body }}>
                            {sticker.small && <span style={{ display: "block", fontSize: "14px", lineHeight: "16px" }}>{sticker.small}</span>}
                            <span style={{ display: "block", fontSize: "28px", lineHeight: "30px", fontWeight: 700 }}>{sticker.big}</span>
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              )}
            </tr>
          </tbody>
        </table>
        </Container>
        </Section>
      ) : (
        <Link href={href}>
          <Img className="m-hero" src={hero} alt={heroAlt} width="700" height="352" style={{ display: "block", width: "100%", height: "352px", objectFit: "cover" }} />
        </Link>
      )}
      {inHeader && (
        // Titel staat al in de header: onder de foto een beige band met alleen de knop, gecentreerd
        <Section style={{ width: "100%", backgroundColor: "#F4F1EC" }}>
          <div style={{ padding: "18px 16px", textAlign: "center" }}>
            <PrimaryButton href={href}>{cta}</PrimaryButton>
          </div>
        </Section>
      )}
      {variant === "native" && (
        <Section style={{ width: "100%", backgroundColor: "#F4F1EC" }}>
          <Container style={{ width: "100%", maxWidth: "626px" }}>
            {/* Desktop links (gelijk met het logo), mobiel gecentreerd (klasse m-tcenter) */}
            <div className="m-pad m-tcenter" style={{ padding: "22px 32px 26px" }}>
              <Heading as="h1" className="m-h1 m-tcenter" style={{ ...s.h1, color: c.heading }}>{title}</Heading>
              <div style={{ marginTop: "16px" }}>
                <PrimaryButton href={href}>{cta}</PrimaryButton>
              </div>
            </div>
          </Container>
        </Section>
      )}
    </Section>
  );
}
