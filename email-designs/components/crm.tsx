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
  .stack { display: block !important; width: 100% !important; padding: 0 0 12px !important; }
  .m-pad { padding-left: 16px !important; padding-right: 16px !important; }
  .m-h1 { font-size: 28px !important; }
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

/** Uitgelichte deal: grote foto, label, naam, plaats, prijs, één knop. */
export function FeaturedDeal({ d, cta = "Bekijk arrangement", primary = false }: { d: DealLike; cta?: string; primary?: boolean }) {
  return (
    <Section style={{ border: `1px solid ${c.border}`, borderRadius: "8px", overflow: "hidden" }}>
      <Link href={d.url}>
        <Img src={d.image} alt={d.packageTitle} width="558" height="300" style={{ display: "block", width: "100%", height: "300px", objectFit: "cover" }} />
      </Link>
      <Section style={{ padding: "18px 20px 22px" }}>
        {d.label && <DealLabel>{d.label}</DealLabel>}
        <Text style={{ ...s.name, fontFamily: font.heading, fontWeight: 600, fontSize: "20px", margin: d.label ? "10px 0 0" : 0 }}>{d.hotelName}</Text>
        <Text style={{ ...s.muted, margin: "4px 0 0" }}>
          <Icon name="map-pin-donker" size={14} /> {d.place}
        </Text>
        <Text style={{ ...s.title, margin: "10px 0 0" }}>{d.packageTitle}</Text>
        <PriceLine d={d} />
        <Section style={{ marginTop: "16px" }}>
          {primary ? <PrimaryButton href={d.url}>{cta}</PrimaryButton> : <SecondaryButton href={d.url}>{cta}</SecondaryButton>}
        </Section>
      </Section>
    </Section>
  );
}

/** Compacte deal: foto links (180 px), tekst rechts. Zonder plaats of prijs valt de regel weg. */
export function CompactDeal({ d, cta = "Bekijk" }: { d: DealLike; cta?: string }) {
  return (
    <Row>
      <Column className="stack" style={{ width: "180px", verticalAlign: "top" }}>
        <Link href={d.url}>
          <Img src={d.image} alt={d.packageTitle} width="180" height="120" style={{ display: "block", width: "100%", height: "120px", objectFit: "cover", borderRadius: "6px" }} />
        </Link>
      </Column>
      <Column className="stack" style={{ verticalAlign: "top", paddingLeft: "16px" }}>
        <Text style={{ ...s.name, margin: 0 }}>{d.hotelName}</Text>
        {d.place && <Text style={{ ...s.muted, margin: "2px 0 0" }}>{d.place}</Text>}
        <Text style={{ ...s.title, fontSize: "13px", margin: "6px 0 0" }}>{d.packageTitle}</Text>
        <Text style={{ ...s.title, margin: "6px 0 10px" }}>
          <span style={{ color: c.muted }}>vanaf </span><strong>{d.fromPrice}</strong><span style={{ color: c.muted }}> p.p.</span>
        </Text>
        <SecondaryButton href={d.url}>{cta}</SecondaryButton>
      </Column>
    </Row>
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
    <Section style={{ border: `2px dashed ${c.border}`, borderRadius: "8px", padding: "28px 20px", textAlign: "center" }}>
      <Text style={{ margin: 0, textAlign: "center" }}><Icon name="tag-plus-oranje" size={32} /></Text>
      <Text style={{ fontFamily: font.body, fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: c.muted, margin: "8px 0 0", textAlign: "center" }}>Jouw unieke code</Text>
      <Text style={{ fontFamily: font.heading, fontWeight: 600, fontSize: "40px", lineHeight: "1.1", color: c.heading, margin: "6px 0 0", textAlign: "center" }}>{value} cadeau</Text>
      <Text style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: "26px", fontWeight: 700, letterSpacing: "0.12em", color: c.text, backgroundColor: "#F5F5F5", borderRadius: "6px", padding: "12px 20px", margin: "16px auto 0", display: "inline-block", textAlign: "center" }}>{code}</Text>
      <Text style={{ fontFamily: font.body, fontSize: "16px", fontWeight: 700, color: c.text, margin: "16px 0 0", textAlign: "center" }}>
        <Icon name="clock-donker" size={18} /> Geldig tot en met {deadline}
      </Text>
      <Text style={{ ...s.title, margin: "6px 0 0", textAlign: "center" }}>{line}</Text>
      {advice && <Text style={{ ...s.muted, margin: "6px 0 0", textAlign: "center" }}>{advice}</Text>}
    </Section>
  );
}

export type ThemeTile = { label: string; icon: string; url: string };

/** Standaard zes themategels (vijf thema's + Alle thema's), vierkant, drie per rij. */
export const themeUrl = "https://vialuxury.com/nl-NL/zoeken?theme=";
export const novemberThemes: ThemeTile[] = [
  { label: "Wellness", icon: "wellness-donker", url: `${themeUrl}arrangementen-wellness-overnachting` },
  { label: "Stedentrips", icon: "stedentrips-donker", url: `${themeUrl}luxe-hotels-stad` },
  { label: "Culinaire experiences", icon: "culinaire-experiences-donker", url: `${themeUrl}arrangementen-culinair-genieten` },
  { label: "Kasteelhotels en landgoederen", icon: "kasteelhotels-en-landgoederen-donker", url: `${themeUrl}arrangementen-kasteel-landgoed-overnachting` },
  { label: "Bubbelbad op kamer", icon: "bubbelbad-op-kamer-donker", url: `${themeUrl}hotelkamer-jacuzzi` },
];

export function ThemeTiles({ title, note, themes = novemberThemes }: { title: string; note: string; themes?: ThemeTile[] }) {
  const tiles: (ThemeTile & { all?: boolean })[] = [...themes, { label: "Alle thema's", icon: "", url: "https://vialuxury.com/nl-NL/zoeken", all: true }];
  const rows = [tiles.slice(0, 3), tiles.slice(3, 6)];
  const cell = { border: `1px solid ${c.border}`, borderRadius: "6px", padding: "14px 6px", textAlign: "center" as const, height: "96px", verticalAlign: "middle" as const };
  return (
    <Section>
      <Text style={s.kop}>{title}</Text>
      {rows.map((row, ri) => (
        <Row key={ri} style={{ marginTop: "10px" }}>
          {row.map((t, i) => (
            <Column key={t.label} style={{ width: "33.33%", paddingLeft: i ? "5px" : 0, paddingRight: i < row.length - 1 ? "5px" : 0, verticalAlign: "top" }}>
              <Link href={t.url} style={{ display: "block", textDecoration: "none" }}>
                <Section style={cell}>
                  <Text style={{ margin: 0, textAlign: "center" }}>
                    {t.all ? <Img src={crmIcon("arrow-right-donker")} alt="" width="28" height="28" style={{ display: "inline" }} /> : <Img src={`${baseUrl}/images/mail/crm/thema/${t.icon}.png`} alt="" width="28" height="28" style={{ display: "inline" }} />}
                  </Text>
                  <Text style={{ fontFamily: font.body, fontSize: "13px", fontWeight: 700, lineHeight: "1.25", color: c.text, margin: "8px 0 0", textAlign: "center" }}>{t.label}</Text>
                </Section>
              </Link>
            </Column>
          ))}
        </Row>
      ))}
      <Text style={{ ...s.muted, margin: "12px 0 0" }}>{note}</Text>
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
