import { Button, Column, Img, Link, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { baseUrl, font, newsletter } from "./theme";

// Gedeelde bouwstenen van de CRM-mails (concept, alleen desktop + light mode).
// Links naar het prototype gaan naar de R1-dealpagina, zodat de foto, titel en prijs
// uit de mail daar terugkomen (zachte landing).

const c = newsletter.light;

export const site = "https://vialuxury.vercel.app";

export const crmCss = `
.hdr-mob { display: none; max-height: 0; overflow: hidden; mso-hide: all; }
@media only screen and (max-width: 480px) {
  .hdr-desk { display: none !important; }
  .hdr-mob { display: block !important; max-height: none !important; overflow: visible !important; }
  .stack.deal-col { padding: 0 !important; }
  .deal-img { width: 100% !important; height: 200px !important; }
  .stack { display: block !important; width: 100% !important; padding: 0 0 12px !important; }
  .m-pad { padding-left: 16px !important; padding-right: 16px !important; }
  .m-h1 { font-size: 28px !important; }
  .m-center { text-align: center !important; }
  .m-small { font-size: 10px !important; }
  .m-mt { margin-top: 16px !important; }
  .m-mx-auto { margin-left: auto !important; margin-right: auto !important; }
  .m-only { display: block !important; }
  .m-flogo { width: 178px !important; }
  .qs-cell { width: 50% !important; padding: 0 6px 14px !important; }
  .qs-iconcell { padding-left: 4px !important; padding-right: 6px !important; }
  .qs-label { padding-right: 6px !important; }
}
`;

export const s = {
  h1: { fontFamily: font.heading, fontWeight: 600, fontSize: "34px", lineHeight: "1.2", color: c.heading, margin: 0 },
  kop: { fontFamily: font.heading, fontWeight: 600, fontSize: "22px", lineHeight: "1.3", color: c.heading, margin: 0 },
  body: { fontFamily: font.body, fontSize: "16px", lineHeight: "1.5", color: c.text, margin: "10px 0 0" },
  name: { fontFamily: font.body, fontSize: "16px", fontWeight: 700, lineHeight: "1.3", color: c.text, margin: 0 },
  title: { fontFamily: font.body, fontSize: "14px", lineHeight: "1.4", color: c.text, margin: "2px 0 0" },
  muted: { fontFamily: font.body, fontSize: "13px", lineHeight: "1.4", color: c.muted, margin: "6px 0 0" },
};

/** Eén primaire, oranje knop per mail. */
export function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
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
        padding: "14px 28px",
        textDecoration: "none",
      }}
    >
      {children}
    </Button>
  );
}

/** Secundaire knop: zwart omlijnd, nooit oranje (kleur alleen voor de kern). */
export function SecondaryButton({ href, children, block }: { href: string; children: React.ReactNode; block?: boolean }) {
  return (
    <Button
      href={href}
      style={{
        display: block ? "block" : "inline-block",
        textAlign: "center",
        border: `1px solid ${c.text}`,
        color: c.text,
        fontFamily: font.body,
        fontSize: "14px",
        fontWeight: 700,
        borderRadius: "6px",
        padding: "10px 16px",
        textDecoration: "none",
      }}
    >
      {children}
    </Button>
  );
}

/** Persuasief label op een dealkaart (Populair, Nieuw, Aanbevolen, Samengesteld door ViaLuxury). */
export function DealLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        display: "inline-block",
        backgroundColor: c.badgeBg,
        color: "#FFFFFF",
        fontFamily: font.body,
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        borderRadius: "3px",
        padding: "3px 7px",
        margin: "10px 0 0",
      }}
    >
      {children}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Bouwstenen voor de automation-mails A1, A3, A5, A6 en A7 (concept, light mode).
// ---------------------------------------------------------------------------

/** PNG-icoon uit public/images/mail/crm (24 px weergegeven, 96 px bron). */
export const crmIcon = (name: string) => `${baseUrl}/images/mail/crm/${name}.png`;

export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return <Img src={crmIcon(name)} alt="" width={size} height={size} style={{ display: "inline", verticalAlign: "middle" }} />;
}

/** Kleine "kaart in de mail": foto links, tekst rechts; stapelt op mobiel. */
export type DealLike = {
  hotelName: string;
  packageTitle: string;
  place: string;
  nights: number;
  fromPrice: string;
  discount: string;
  label?: string;
  image: string;
  url: string;
};

function PriceLine({ d }: { d: DealLike }) {
  return (
    <Text style={{ ...s.title, margin: "8px 0 0" }}>
      <span style={{ color: c.muted }}>{d.nights} {d.nights === 1 ? "nacht" : "nachten"} · vanaf </span>
      <strong style={{ fontSize: "18px", fontFamily: font.heading, fontWeight: 600 }}>{d.fromPrice}</strong>
      <span style={{ color: c.muted }}> p.p.</span>
    </Text>
  );
}

/** Uitgelichte deal: grote foto, eyebrow (label · plaats), naam, pitch, prijs links en knop rechts. */
export function FeaturedDeal({ d, cta = "Bekijk arrangement", primary = false }: { d: DealLike; cta?: string; primary?: boolean }) {
  return (
    <Section style={{ border: `1px solid ${c.border}`, borderRadius: "8px", overflow: "hidden", textAlign: "left", backgroundColor: "#FFFFFF" }}>
      <Link href={d.url}>
        <Img src={d.image} alt={d.packageTitle} width="558" height="300" style={{ display: "block", width: "100%", height: "300px", objectFit: "cover" }} />
      </Link>
      <Section style={{ padding: "20px 20px 22px" }}>
        <DealEyebrow label={d.label} place={d.place} />
        <Text style={{ fontFamily: font.heading, fontWeight: 600, fontSize: "22px", lineHeight: "1.2", color: c.heading, margin: d.label || d.place ? "6px 0 0" : 0 }}>{d.hotelName}</Text>
        <Text style={{ fontFamily: font.body, fontSize: "14px", lineHeight: "1.45", color: "#555555", margin: "6px 0 0" }}>{d.packageTitle}</Text>
        <Text style={{ fontFamily: font.body, fontSize: "13px", color: c.muted, margin: "16px 0 0" }}>
          {d.nights} {d.nights === 1 ? "nacht" : "nachten"} · vanaf <strong style={{ fontFamily: font.heading, fontSize: "22px", fontWeight: 600, color: c.heading }}>{d.fromPrice}</strong> p.p.
        </Text>
        <Section style={{ marginTop: "14px" }}>
          {primary ? <PrimaryButton href={d.url}>{cta}</PrimaryButton> : <DarkButton href={d.url}>{cta}</DarkButton>}
        </Section>
      </Section>
    </Section>
  );
}

/** Kleine donkere knop (secundaire actie in een kaart; oranje blijft voor de ene primaire knop per mail). */
export function DarkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button
      href={href}
      style={{ backgroundColor: c.text, color: "#FFFFFF", fontFamily: font.body, fontSize: "14px", fontWeight: 700, borderRadius: "6px", padding: "11px 20px", textDecoration: "none" }}
    >
      {children}
    </Button>
  );
}

/** Eyebrow boven de hotelnaam: oranje stip + label (als dat er is), dan de plaats; 12 px, hoofdletters. */
export function DealEyebrow({ label, place }: { label?: string; place?: string }) {
  if (!label && !place) return null;
  return (
    <Text style={{ fontFamily: font.body, fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: "16px", color: c.muted, margin: 0 }}>
      {label && (
        <>
          <span style={{ color: c.cta }}>●</span> <span style={{ color: c.text }}>{label}</span>
        </>
      )}
      {label && place ? " · " : ""}
      {place}
    </Text>
  );
}

/**
 * Dealkaart (lijstweergave): foto links over de volle hoogte, rechts in vaste volgorde
 * eyebrow (label · plaats), hotelnaam, pitch, en onderaan de prijs links met een kleine donkere
 * knop rechts. Eén omlijnde kaart (1 px, 8 px hoeken). Op mobiel staat de foto boven de tekst.
 * Zonder label of plaats valt de eyebrow weg.
 */
export function CompactDeal({ d, cta = "Bekijk" }: { d: DealLike; cta?: string }) {
  return (
    <Section style={{ border: `1px solid ${c.border}`, borderRadius: "8px", overflow: "hidden", textAlign: "left", backgroundColor: "#FFFFFF" }}>
      <Row>
        <Column className="stack deal-col" style={{ width: "190px", verticalAlign: "top" }}>
          <Link href={d.url}>
            <Img src={d.image} alt={d.packageTitle} width="190" height="190" className="deal-img" style={{ display: "block", width: "190px", height: "190px", objectFit: "cover" }} />
          </Link>
        </Column>
        <Column className="stack deal-col" style={{ verticalAlign: "top" }}>
          <Section className="deal-body" style={{ padding: "18px 20px 18px" }}>
            <DealEyebrow label={d.label} place={d.place} />
            <Text style={{ fontFamily: font.heading, fontWeight: 600, fontSize: "20px", lineHeight: "1.2", color: c.heading, margin: d.label || d.place ? "6px 0 0" : 0 }}>{d.hotelName}</Text>
            <Text style={{ fontFamily: font.body, fontSize: "14px", lineHeight: "1.45", color: "#555555", margin: "6px 0 0" }}>{d.packageTitle}</Text>
            <Text style={{ fontFamily: font.body, fontSize: "13px", color: c.muted, margin: "12px 0 0" }}>
              vanaf <strong style={{ fontFamily: font.heading, fontSize: "22px", fontWeight: 600, color: c.heading }}>{d.fromPrice}</strong> p.p.
            </Text>
            <Section style={{ marginTop: "10px" }}>
              <DarkButton href={d.url}>{cta}</DarkButton>
            </Section>
          </Section>
        </Column>
      </Row>
    </Section>
  );
}

/** Vijf losse ster-links (?rating=1..5). Elk tapvlak is 48 × 48 px. */
export function StarRating({ baseHref }: { baseHref: string }) {
  const sep = baseHref.includes("?") ? "&" : "?";
  return (
    <Row style={{ width: "auto" }} align="center">
      {[1, 2, 3, 4, 5].map((n) => (
        <Column key={n} style={{ padding: "0 2px" }}>
          <Link href={`${baseHref}${sep}rating=${n}`} style={{ display: "block", width: "48px", height: "48px", textAlign: "center" }}>
            <Img src={crmIcon("ster-oranje-gevuld")} alt={`${n} ${n === 1 ? "ster" : "sterren"}`} width="40" height="40" style={{ display: "block", margin: "4px auto 0" }} />
          </Link>
        </Column>
      ))}
    </Row>
  );
}

/**
 * Codeblok (S10): de code staat als tekst (selecteerbaar, geen afbeelding), met grote waarde en
 * de deadline direct eronder. Zonder `advice` valt die regel weg.
 */
export function CodeBlock({ code, value, deadline, line, advice }: { code: string; value: string; deadline: string; line: string; advice?: string }) {
  return (
    <Section>
      {/* Icoon links naast de waarde, samen gecentreerd */}
      <table role="presentation" align="center" cellPadding={0} cellSpacing={0} style={{ margin: "0 auto" }}>
        <tbody>
          <tr>
            <td style={{ verticalAlign: "middle", paddingRight: "12px" }}>
              <Img src={crmIcon("tag-plus-oranje")} alt="" width="36" height="36" style={{ display: "block" }} />
            </td>
            <td style={{ verticalAlign: "middle", fontFamily: font.heading, fontWeight: 600, fontSize: "32px", lineHeight: "1.15", color: c.heading, textAlign: "left" }}>
              {value} cadeau
            </td>
          </tr>
        </tbody>
      </table>

      {/* Het codevak: oranje gestippelde rand over de volle breedte; "Kortingscode" en de code staan
          erin gecentreerd, als één coupon. De code is tekst (selecteerbaar), geen afbeelding. */}
      <Section style={{ width: "100%", margin: "16px 0 0", border: `2px dashed ${c.cta}`, borderRadius: "8px", padding: "22px 16px", textAlign: "center" }}>
        <Text style={{ fontFamily: font.body, fontSize: "18px", lineHeight: "1.3", color: c.text, margin: 0, textAlign: "center" }}>Kortingscode</Text>
        <Text style={{ fontFamily: font.heading, fontWeight: 700, fontSize: "30px", lineHeight: "1.2", letterSpacing: "0.02em", color: c.cta, margin: "6px 0 0", textAlign: "center", wordBreak: "keep-all" }}>{code}</Text>
      </Section>

      <Text style={{ fontFamily: font.body, fontSize: "16px", fontWeight: 700, color: c.text, margin: "16px 0 0" }}>
        <Icon name="clock-donker" size={18} /> Geldig tot en met {deadline}
      </Text>
      <Text style={{ ...s.title, margin: "4px 0 0" }}>{line}</Text>
      {advice && <Text style={{ ...s.muted, margin: "4px 0 0" }}>{advice}</Text>}
    </Section>
  );
}

export type ThemeTile = { label: string; icon: string; url: string; all?: boolean };

/**
 * Themasectie (S7, "snelle scan"): zes knoppen met het icoon links van het label, zwarte rand van
 * 1 px en 8 px hoeken. Desktop 3 per rij, mobiel 2 per rij (tegels zijn inline-block-divs; in
 * Outlook voor Windows stapelen ze, wat prima leesbaar blijft). De vijf thema's passen bij de
 * seizoensthema's van de maand; de zesde tegel is altijd "Alle thema's".
 */
export const themeUrl = "https://vialuxury.com/nl-NL/zoeken?theme=";
export const novemberThemes: ThemeTile[] = [
  { label: "Wellness", icon: "wellness-donker", url: `${themeUrl}arrangementen-wellness-overnachting` },
  { label: "Stedentrips", icon: "stedentrips-donker", url: `${themeUrl}luxe-hotels-stad` },
  { label: "Culinaire experiences", icon: "culinaire-experiences-donker", url: `${themeUrl}arrangementen-culinair-genieten` },
  { label: "Kasteelhotels en landgoederen", icon: "kasteelhotels-en-landgoederen-donker", url: `${themeUrl}arrangementen-kasteel-landgoed-overnachting` },
  { label: "Bubbelbad op kamer", icon: "bubbelbad-op-kamer-donker", url: `${themeUrl}hotelkamer-jacuzzi` },
];

export function ThemeTiles({ title, note, themes = novemberThemes }: { title: string; note: string; themes?: ThemeTile[] }) {
  const tiles: ThemeTile[] = [...themes, { label: "Alle thema's", icon: "", url: "https://vialuxury.com/nl-NL/zoeken", all: true }];
  return (
    <Section>
      <Text style={s.kop}>{title}</Text>
      <div style={{ fontSize: 0, lineHeight: 0, textAlign: "center", margin: "12px -5px 0" }}>
        {tiles.map((t) => (
          <div key={t.label} className="qs-cell" style={{ display: "inline-block", width: "33.33%", verticalAlign: "top", boxSizing: "border-box", padding: "0 5px 10px" }}>
            <Link href={t.url} style={{ display: "block", border: `1.5px solid ${c.text}`, borderRadius: "10px", textDecoration: "none", color: c.text, backgroundColor: "#FFFFFF" }}>
              <table role="presentation" align="center" cellPadding={0} cellSpacing={0} style={{ height: "60px", margin: "0 auto" }}>
                <tbody>
                  <tr>
                    <td className="qs-iconcell" style={{ verticalAlign: "middle", width: "24px", paddingLeft: "8px", paddingRight: "8px" }}>
                      <Img src={t.all ? crmIcon("arrow-right-donker") : `${baseUrl}/images/mail/crm/thema/${t.icon}.png`} alt="" width="24" height="24" style={{ display: "block" }} />
                    </td>
                    <td className="qs-label" style={{ verticalAlign: "middle", textAlign: "center", paddingRight: "8px", fontFamily: font.body, fontSize: "15px", fontWeight: 700, lineHeight: "20px", color: c.text }}>
                      {t.label}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Link>
          </div>
        ))}
      </div>
      <Text style={{ ...s.muted, margin: "4px 0 0" }}>{note}</Text>
    </Section>
  );
}

/** Eén regel met twee links (S15 Servicesectie). */
export function ServiceLine({ children }: { children: React.ReactNode }) {
  return <Text style={{ ...s.title, margin: 0, color: c.muted }}>{children}</Text>;
}
export const faqUrl = `${site}/veelgestelde-vragen`;
export const serviceUrl = `${site}/klantenservice`;

/**
 * Header van alle CRM-mails: logo links, Trustpilot rechts, in één afbeelding (PNG @2x).
 * Desktop 626 × 83, mobiel 320 × 72; de mobiele variant wordt met een media query getoond.
 * Het Trustpilot-cijfer ("16.000+ reviews") zit in de afbeelding: bij een update beide PNG's vervangen.
 */
export function CrmHeader() {
  const alt = "ViaLuxury. Trustpilot 4,5/5, 16.000+ reviews";
  return (
    <Section style={{ backgroundColor: c.frame }}>
      <Img className="hdr-desk" src={`${baseUrl}/images/mail/crm-header-desktop.png`} alt={alt} width="626" height="83" style={{ display: "block", width: "100%", height: "auto" }} />
      <Img className="hdr-mob" src={`${baseUrl}/images/mail/crm-header-mobile.png`} alt={alt} width="320" height="72" style={{ display: "none", width: "100%", height: "auto", maxHeight: 0, overflow: "hidden" }} />
    </Section>
  );
}
