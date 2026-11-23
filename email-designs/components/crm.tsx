import { Button, Column, Container, Img, Link, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import HelpBanner from "./HelpBanner";
import { baseUrl, font, newsletter } from "./theme";

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
// - Elke mail eindigt met de hulplijn "Hulp nodig?" (CrmHelp).

const c = newsletter.light;

export const site = "https://vialuxury.vercel.app";

export const crmCss = `
body { margin: 0 !important; padding: 0 !important; }
@media only screen and (max-width: 600px) {
  .stack { display: block !important; width: 100% !important; padding: 0 0 12px !important; }
  /* De tekst van een dealrij houdt op mobiel zijn ruimte tot de rand van de kaart. box-sizing is
     nodig omdat stack width:100% zet: zonder dat telt de padding er nog bij op en steekt de cel
     (en dus de knop) buiten de kaart uit. */
  .m-cardtext { padding: 16px 18px 18px !important; box-sizing: border-box !important; }
  /* De foto van een dealrij staat op mobiel boven de tekst over de volle breedte; padding-top van
     56,25 % maakt dat vlak 16:9, want een achtergrondfoto heeft zelf geen hoogte. */
  .m-rowphoto { width: 100% !important; height: 0 !important; min-height: 0 !important; padding-top: 56.25% !important; }
  /* De cel zelf zonder padding, anders komt stack's 12 px onderaan bij de foto en is het vlak
     niet meer precies 16:9. */
  .m-rowphoto-cell { padding: 0 !important; }
  /* Twee foto's onder elkaar: op mobiel vervalt de halve hoogte, elk vlak wordt 16:9. */
  .m-halfphoto { height: auto !important; }
  /* De vaste kaarthoogte vervalt: de foto staat hier boven de tekst, dus de kaart is hoger. */
  .m-auto-h { height: auto !important; }
  .m-pad { padding-left: 16px !important; padding-right: 16px !important; }
  .m-h1 { font-size: 28px !important; }
}
/* Alles smaller dan de volle 626 px: alleen de prijsrij krimpt, de kolommen blijven naast elkaar.
   Op 16 px vraagt die rij ruim 400 px en zou de knop buiten de kaart vallen. */
@media only screen and (max-width: 640px) {
  .m-badge-cell { padding-right: 6px !important; }
  .m-badge { font-size: 12px !important; padding: 9px 6px !important; }
  .m-price { font-size: 12px !important; }
  .m-price-big { font-size: 16px !important; }
  .m-cta { font-size: 12px !important; padding: 9px 7px !important; }
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
 *  "Beste gast,"; in elke mail dezelfde aanhef), een korte intro en de ondertekening "Groetjes Yvette". De ondertekening is een
 *  afbeelding (handgeschreven lettertype Oooh Baby, donkergrijs #555555), zodat hij in elke
 *  mailclient en in Klaviyo hetzelfde is. Titels van blokken (bijv. "Anderen boekten ook") komen
 *  ná de brief, direct boven het blok waar ze bij horen. */
export function Letter({ firstName, children }: { firstName?: string; children: React.ReactNode }) {
  const salutation = firstName ? `Beste ${firstName},` : "Beste gast,";
  return (
    <>
      <Text style={{ ...s.body, margin: 0 }}>{salutation}</Text>
      <Text style={{ ...s.body, margin: "8px 0 0" }}>{children}</Text>
      <Img src={`${baseUrl}/images/mail/crm/groetjes-yvette.png`} alt="Groetjes Yvette" width="133" height="29" style={{ display: "block", width: "133px", height: "29px", marginTop: "14px" }} />
    </>
  );
}

/** Hulplijn onderaan elke CRM-mail: hetzelfde blok "Hulp nodig?" als in de post-bookingmails
 *  (HelpBanner), met 16 px tekst. `top`: witruimte erboven als de sectie ervoor er geen heeft. */
export function CrmHelp({ top = "0" }: { top?: string }) {
  return <HelpBanner fontSize="16px" padding={`${top} 32px 40px`} />;
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
  /** Tweede foto van het arrangement. Staat die erin, dan toont de dealrij twee foto's onder
   *  elkaar in de fotokolom (hoofdbeeld boven) in plaats van één over de volle hoogte. */
  secondImage?: string;
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
function RichDealText({ d }: { d: RowDeal }) {
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
          {/* Hangende inspringing: een inclusie die over twee regels loopt, lijnt op de tweede regel
              uit met de tekst erboven en niet met het vinkje. 22 px = vinkje (14) plus de ruimte (8). */}
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

/** Onderkant van de uitgebreide kaart: voor wie de prijs geldt en daaronder één rij met links het
 *  kortingsblokje, daarnaast de vanafprijs met de doorgestreepte kamerprijs en rechts de knop. */
function RichDealPrice({ d, cta }: { d: RowDeal; cta: string }) {
  return (
    <>
      {/* Winkelmandjekaart: eerst de gekozen datums, nachten en personen, daarna pas de prijsrij. */}
      {d.lines?.map((l, i) => (
        <Text key={l} style={{ ...s.title, margin: i ? "2px 0 0" : "14px 0 0" }}>{l}</Text>
      ))}
      {d.priceFor && <Text style={{ ...s.name, margin: "14px 0 0" }}>{d.priceFor}</Text>}
      {/* Eén regel, ook op mobiel: daar maken de klassen m-badge, m-price en m-cta het blokje,
          de prijs en de knop net genoeg kleiner om samen binnen de kaart te passen. */}
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

/** Vaste hoogte van een dealkaart op desktop. Zonder deze hoogte verschilt elke kaart een paar
 *  regels (de titel loopt over twee of drie regels, een inclusie wel of niet over twee), en in
 *  Klaviyo moet een herhalend blok één hoogte hebben. De waarden zijn de hoogste kaart die in de
 *  mails voorkomt, dus er wordt niets afgesneden; een kortere kaart houdt onderaan wat ruimte over.
 *  Op mobiel vervalt de hoogte (klasse `m-auto-h`), want daar staat de foto boven de tekst. */
export const CARD_HEIGHT_ROW = "425px";
/** Dealrijen met de prijs na aftrek van de code (terugkomactie) hebben een regel extra en dus een
 *  eigen hoogte; binnen die mail zijn ze onderling weer gelijk. */
export const CARD_HEIGHT_ROW_CODE = "457px";
/** Bij de grote kaart staat de hoogte op het tekstblok onder de foto, niet op de kaart zelf: een
 *  vaste hoogte op de kaart verdeelt de overgebleven ruimte over de rijen en zet dan een witte
 *  strook boven en onder de foto. 379 px tekstblok + 315 px foto + 2 px rand = 696 px kaart. */
export const CARD_TEXT_HEIGHT_FEATURED = "379px";

/** Dealrij met grijze rand: foto links tot aan de rand en over de volle hoogte. Met een prijs de
 *  uitgebreide kaart (knop "Bekijk"), anders de tekstregels met een oranje link. Met inclusies maar
 *  zonder prijs (de bekeken deal): de uitgebreide kaart met onderaan de eigen regels en de link.
 *  `top`: 12 px onder een titel (standaard), `cardGap` (24 px) onder een andere kaart. */
export function DealRow({ deal: d, cta, top = "12px" }: { deal: RowDeal; cta?: string; top?: string }) {
  const rich = !!d.price || !!d.includes;
  return (
    <Section className={rich ? "m-auto-h" : undefined} style={{ backgroundColor: "#FFFFFF", border: `1px solid #E5E5E5`, borderRadius: "8px", marginTop: top, overflow: "hidden", height: rich ? (d.withCode ? CARD_HEIGHT_ROW_CODE : CARD_HEIGHT_ROW) : undefined }}>
      <Row>
        {/* Foto als achtergrond: sluit aan op de rand en vult de hele hoogte van het blok */}
        {d.secondImage ? (
          // Twee foto's onder elkaar: het hoofdbeeld boven, het tweede beeld van het arrangement
          // eronder, met een wit randje ertussen. Samen vullen ze de vaste kaarthoogte
          // (211 + 212 = 423 px binnen de rand, waarvan 3 px wit). Het randje is een witte bovenrand op de
          // tweede foto; een achtergrondfoto loopt niet door onder een rand.
          <Column className="stack m-rowphoto-cell" style={{ width: "190px", verticalAlign: "top" }}>
            {[d.image, d.secondImage].map((src, i) => (
              <Section key={src} className="m-halfphoto" style={{ height: i ? "212px" : "211px", borderTop: i ? "3px solid #FFFFFF" : undefined, backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                <Link href={d.url} aria-label={d.hotelName ?? cta ?? "Bekijk"} className="m-rowphoto" style={{ display: "block", width: "190px", minHeight: "107px" }} />
              </Section>
            ))}
          </Column>
        ) : (
          <Column className="stack m-rowphoto-cell" style={{ width: "190px", verticalAlign: "top", backgroundImage: `url(${d.image})`, backgroundSize: "cover", backgroundPosition: "center" }}>
            <Link href={d.url} aria-label={d.hotelName ?? cta ?? "Bekijk"} className="m-rowphoto" style={{ display: "block", width: "190px", minHeight: "107px" }} />
          </Column>
        )}
        {/* Bij een vaste kaarthoogte staat de tekst verticaal gecentreerd: de ruimte die overblijft
            als de kaart korter is dan de hoogte, verdeelt zich dan boven en onder in plaats van als
            een gat onder de prijsrij. Op mobiel (stack) valt de hoogte weg en staat hij weer boven. */}
        <Column className="stack m-cardtext" style={{ verticalAlign: rich ? "middle" : "top", padding: rich ? "16px 18px 18px" : "16px 18px" }}>
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

/** Uitgelichte deal over de hele breedte: grote foto, daaronder met een prijs de uitgebreide kaart
 *  (knop "Bekijk"), anders de tekstregels en een oranje knop "Bekijk arrangement".
 *  `priceRow={false}`: zonder de prijsrij en de knop (winkelmandje: prijs en knop staan erboven). */
export function FeaturedDeal({ deal: d, cta, priceRow = true }: { deal: RowDeal; cta?: string; priceRow?: boolean }) {
  const rich = !!d.price;
  // Alleen de volledige kaart (met inclusies en prijsrij) krijgt de vaste hoogte; de kaart van het
  // winkelmandje heeft geen inclusies en is daarom van zichzelf al overal even hoog.
  const fixed = rich && priceRow && !!d.includes?.length;
  return (
    <Section style={{ backgroundColor: "#FFFFFF", border: `1px solid #E5E5E5`, borderRadius: "8px", marginTop: "12px", overflow: "hidden" }}>
      <Link href={d.url}>
        <Img src={d.image} alt={d.packageTitle ?? d.hotelName ?? ""} width="560" height="315" style={{ display: "block", width: "100%", height: "auto", aspectRatio: "16 / 9", objectFit: "cover" }} />
      </Link>
      {rich ? (
        <Section className={fixed ? "m-auto-h" : undefined} style={{ padding: "16px 20px 20px", height: fixed ? CARD_TEXT_HEIGHT_FEATURED : undefined }}>
          <RichDealText d={d} />
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
export function BeigeBand({ children, top = "0", white }: { children: React.ReactNode; top?: string; white?: boolean }) {
  return (
    <Section style={{ backgroundColor: white ? "#FFFFFF" : "#F4F1EC", width: "100%", marginTop: top }}>
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
export function DealGroup({ title, subtitle, top, white, children }: { title: string; subtitle?: string; top?: string; white?: boolean; children: React.ReactNode }) {
  return (
    <BeigeBand top={top} white={white}>
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

// ── Secties van de automationmails (nummers uit "Automations in kaart.xlsx", tabblad Secties) ──
// S1 header, S2 intro, S4 hoteldeals, S13 footer en S15 service zijn de bestaande bouwstenen
// (CrmHeader, Letter, DealList/DealRow/FeaturedDeal, CrmFooter en CrmHelp); hieronder staan de
// secties die alleen in deze flows voorkomen.

/** S21 Gastenoordeel: de gemiddelde score van het hotel en één korte review, als die er is.
 *  Alleen wat de sheet noemt: score en review, zonder kop eromheen. */
export type GuestRating = { score: string; label: string; review?: { text: string; author: string } };

export function GuestRatingSection({ hotelName, rating }: { hotelName: string; rating: GuestRating }) {
  return (
    <>
      <Text style={{ ...s.name, margin: 0 }}>
        {rating.score} <span style={{ fontWeight: 400, color: c.muted }}>{rating.label}</span>
      </Text>
      {rating.review && (
        <Section style={{ marginTop: "14px" }}>
          <Text style={{ fontFamily: font.heading, fontSize: "20px", lineHeight: "1.35", color: c.text, margin: 0 }}>&ldquo;{rating.review.text}&rdquo;</Text>
          <Text style={{ ...s.muted, margin: "4px 0 0" }}>{rating.review.author}</Text>
        </Section>
      )}
    </>
  );
}

/** S6 Merksectie: waarom ViaLuxury, in één alinea. Geen vlak eromheen (beige blijft voor keuzeknoppen). */
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

/** S18 Zoekopdracht: zoekterm, datum en personen in een omlijnd blok, met de knop naar alle
 *  resultaten. Zelfde blok als in crm-zoekopdracht. */
export function SearchSection({ searchTerm, arrivalDate, persons, resultsUrl }: { searchTerm?: string; arrivalDate?: string; persons?: number; resultsUrl: string }) {
  return (
    <Section style={{ border: `1px solid #E5E5E5`, borderRadius: "8px", padding: "14px 20px 22px" }}>
      <IconLine icon="magnifier-donker" bold>{searchTerm ?? "Jouw zoekopdracht"}</IconLine>
      {arrivalDate && <IconLine icon="calendar-donker">{arrivalDate}</IconLine>}
      {persons && <IconLine icon="users-donker">{persons} {persons === 1 ? "persoon" : "personen"}</IconLine>}
      <Section style={{ marginTop: "18px" }}>
        <PrimaryButton href={resultsUrl}>Bekijk alle resultaten</PrimaryButton>
      </Section>
    </Section>
  );
}

/** S7 Themasectie compact: de themaknoppen met de knop "Alle thema's" (zet hem in een BeigeBand).
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
