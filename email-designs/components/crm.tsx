import { Button, Column, Img, Link, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { baseUrl, font, newsletter } from "./theme";

// Gedeelde bouwstenen van de CRM-mails (concept, alleen desktop + light mode).
//
// Spelregels (zie ook CLAUDE.md, sectie CRM):
// - Drie lettergroottes: titel 32, subtitel/hotelnaam 20, alle overige tekst 16 px.
// - Alles links uitgelijnd (alleen de inhoud van de coupon staat gecentreerd).
// - Klaviyo: nooit twee lettertypen naast elkaar op één regel; onder elkaar mag wel.
// - Geen grijze vlakken; beige alleen als highlight (achter de blokken met keuzeknoppen). Blokken zijn wit met een grijze rand (#E5E5E5, zoals de website).
// - Geen labels ("Populair" e.d.) op deals; prijzen zijn het totaal voor 2 personen.
// - Deals staan op de uitgebreide kaart (zoals de zoekkaart op de website); geen tekst op een foto.
// - Links naar het prototype gaan naar de R1-dealpagina (zachte landing).

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

/** Secundaire knop: wit met grijze rand (zoals de website), nooit oranje (kleur alleen voor de kern). */
export function SecondaryButton({ href, children, block }: { href: string; children: React.ReactNode; block?: boolean }) {
  return (
    <Button
      href={href}
      style={{
        display: block ? "block" : "inline-block",
        textAlign: "center",
        backgroundColor: "#FFFFFF",
        border: `1px solid #E5E5E5`,
        color: c.text,
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
  /** Twee extra foto's voor de collagekaart (rechts naast de hoofdfoto). Zonder deze
   *  valt de collage terug op alleen de hoofdfoto over de volle breedte. */
  extraImages?: string[];
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
      {d.packageTitle && <Text style={{ ...s.kop, margin: d.hotelName || d.place ? "10px 0 0" : 0 }}>{d.packageTitle}</Text>}
      {d.includes && d.includes.length > 0 && (
        <>
          <Text style={{ fontFamily: font.heading, fontWeight: 600, fontSize: "16px", lineHeight: "1.4", color: c.cta, margin: "12px 0 2px" }}>Arrangement</Text>
          {d.includes.slice(0, 4).map((inc) => (
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
    </>
  );
}

/** Dealrij met grijze rand: foto links, tekst rechts. De foto is een gewone `<img>` en geen
 *  CSS-achtergrond, want die laat Outlook weg; hij staat bovenaan in de cel op zijn eigen
 *  verhouding en de beige cel vult de rest als de tekst hoger is. */
export function DealRow({ deal: d, cta }: { deal: RowDeal; cta?: string }) {
  const rich = !!d.price || !!d.includes;
  return (
    <Section style={{ border: `1px solid #E5E5E5`, borderRadius: "8px", marginTop: "12px", overflow: "hidden" }}>
      <Row>
        <Column className="stack" style={{ width: "190px", verticalAlign: "top", backgroundColor: "#F4F1EC" }}>
          <Link href={d.url}>
            <Img src={d.image} alt={d.packageTitle ?? d.hotelName ?? ""} width="190" height="119" style={{ display: "block", width: "100%", height: "auto" }} />
          </Link>
        </Column>
        <Column className="stack" style={{ verticalAlign: "top", padding: rich ? "16px 18px 18px" : "16px 18px" }}>
          {rich ? (
            <>
              <RichDealText d={d} />
              {d.price ? (
                <RichDealPrice d={d} cta={cta ?? "Bekijk"} />
              ) : (
                <>
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

/** Fotocollage bovenaan de kaart: links de hoofdfoto, rechts twee kleinere onder elkaar.
 *
 *  Losse `<img>`-tags in een tabel, geen CSS-achtergrond: Outlook toont achtergronden niet.
 *  Geen `object-fit` — Outlook en Gmail kennen dat niet en zouden de foto uitrekken. In plaats
 *  daarvan hebben alle vakken exact de verhouding van de bronfoto (`?key=card` is 966x604,
 *  oftewel 1,599), zodat er niets bijgesneden hoeft te worden:
 *    groot 372x233, klein 184x115 (115 + 3 tussenruimte + 115 = 233).
 *  De tussenruimte is padding op de cel, niet marge op de foto; marge op een `<img>` is in
 *  Outlook onbetrouwbaar. Breedte- en hoogte-attributen staan erop voor Outlook, de stijl
 *  `height:auto` laat de foto meeschalen in de clients die dat wel kunnen. */
function DealCollage({ d }: { d: RowDeal }) {
  const extra = (d.extraImages ?? []).slice(0, 2);
  const alt = d.packageTitle ?? d.hotelName ?? "";
  const fluid = { display: "block", width: "100%", height: "auto" as const };
  if (extra.length < 2) {
    return (
      <Link href={d.url}>
        <Img src={d.image} alt={alt} width="560" height="350" style={fluid} />
      </Link>
    );
  }
  return (
    <Row>
      <Column className="stack" style={{ width: "372px", verticalAlign: "top", paddingRight: "3px" }}>
        <Link href={d.url}>
          <Img src={d.image} alt={alt} width="372" height="233" style={fluid} />
        </Link>
      </Column>
      <Column className="stack" style={{ width: "184px", verticalAlign: "top" }}>
        {extra.map((src, i) => (
          <Section key={src} style={i ? { paddingTop: "3px" } : undefined}>
            <Link href={d.url}>
              <Img src={src} alt="" width="184" height="115" style={fluid} />
            </Link>
          </Section>
        ))}
      </Column>
    </Row>
  );
}

/** Dealkaart met de fotocollage bovenaan en daaronder de tekst en de prijsrij. Dezelfde
 *  inhoud als `DealRow`, alleen staat het beeld boven de tekst in plaats van ernaast. */
export function CollageDeal({ deal: d, cta, priceRow = true }: { deal: RowDeal; cta?: string; priceRow?: boolean }) {
  return (
    <Section style={{ border: `1px solid #E5E5E5`, borderRadius: "8px", marginTop: "12px", overflow: "hidden" }}>
      <DealCollage d={d} />
      <Section style={{ padding: "16px 20px 20px" }}>
        <RichDealText d={d} />
        {d.price && priceRow ? (
          <RichDealPrice d={d} cta={cta ?? "Bekijk"} />
        ) : (
          <>
            {d.lines?.map((l, i) => (
              <Text key={l} style={{ ...s.title, margin: i ? "2px 0 0" : "14px 0 0" }}>{l}</Text>
            ))}
            <TextLink href={d.url}>{cta ?? "Bekijk"}</TextLink>
          </>
        )}
      </Section>
    </Section>
  );
}

/** Uitgelichte deal over de hele breedte: grote foto, daaronder de tekst en de prijsrij.
 *  `priceRow={false}`: zonder de prijsrij en de knop (winkelmandje: die staan erboven). */
export function FeaturedDeal({ deal: d, cta, priceRow = true }: { deal: RowDeal; cta?: string; priceRow?: boolean }) {
  const rich = !!d.price;
  return (
    <Section style={{ border: `1px solid #E5E5E5`, borderRadius: "8px", marginTop: "12px", overflow: "hidden" }}>
      <Link href={d.url}>
        <Img src={d.image} alt={d.packageTitle ?? d.hotelName ?? ""} width="560" height="350" style={{ display: "block", width: "100%", height: "auto" }} />
      </Link>
      {rich ? (
        <Section style={{ padding: "16px 20px 20px" }}>
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

/** Eén groot, de rest als rij: de vaste opbouw van een rij suggesties. */
export function DealList({ deals }: { deals: RowDeal[] }) {
  const [first, ...rest] = deals;
  return (
    <>
      {first && <FeaturedDeal deal={first} />}
      {rest.map((d) => (
        <DealRow key={d.url} deal={d} />
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
export function CodeBlock({ title, code, label = "Jouw persoonlijke code", deadline, daysLeft }: { title?: string; code: string; label?: string; deadline: string; daysLeft?: number }) {
  const center = { textAlign: "center" as const };
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

/** Beige vlak (highlight) achter een blok met keuzeknoppen: themakiezer en nagenietvraag. */
export const beigeBox = { backgroundColor: "#F4F1EC", borderRadius: "8px", padding: "24px 24px 28px" };

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

/** Themakiezer: de snelfilterknoppen met icoon. Elke keuze gaat naar /crm/thema?keuze=<id>. */
export function ThemePicker({ items = themes }: { items?: Theme[] }) {
  return (
    <Section style={beigeBox}>
      <Text style={s.kop}>Waarover wil je aanbiedingen ontvangen?</Text>
      <Text style={s.body}>Eén klik is genoeg, dan sturen we voortaan wat je zoekt.</Text>
      <PillGrid items={items.map((t) => ({ label: t.label, icon: t.icon, href: `${site}/crm/thema?keuze=${t.id}` }))} />
    </Section>
  );
}
