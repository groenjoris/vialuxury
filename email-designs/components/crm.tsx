import { Button, Column, Img, Link, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { baseUrl, font, newsletter } from "./theme";

// Gedeelde bouwstenen van de CRM-mails (concept, alleen desktop + light mode).
//
// Spelregels (zie ook CLAUDE.md, sectie CRM):
// - Drie lettergroottes: titel 32, subtitel/hotelnaam 20, alle overige tekst 16 px.
// - Alles links uitgelijnd (alleen de inhoud van de coupon staat gecentreerd).
// - Klaviyo: nooit twee lettertypen naast elkaar op één regel; onder elkaar mag wel.
// - Geen grijze vlakken; beige alleen als highlight. Blokken zijn wit met een grijze rand (#E5E5E5, zoals de website).
// - Geen labels ("Populair" e.d.) op deals; prijzen zijn het totaal voor 2 personen.
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
  image: string;
  url: string;
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
    </>
  );
}

/** Dealrij met grijze rand: foto links tot aan de rand en over de volle hoogte; rechts de
 *  tekstregels en een oranje link. */
export function DealRow({ deal: d, cta = "Bekijk" }: { deal: RowDeal; cta?: string }) {
  return (
    <Section style={{ border: `1px solid #E5E5E5`, borderRadius: "8px", marginTop: "12px", overflow: "hidden" }}>
      <Row>
        {/* Foto als achtergrond: sluit aan op de rand en vult de hele hoogte van het blok */}
        <Column className="stack" style={{ width: "190px", verticalAlign: "top", backgroundImage: `url(${d.image})`, backgroundSize: "cover", backgroundPosition: "center" }}>
          <Link href={d.url} aria-label={d.hotelName ?? cta} style={{ display: "block", width: "190px", minHeight: "150px" }} />
        </Column>
        <Column className="stack" style={{ verticalAlign: "top", padding: "16px 18px" }}>
          <DealText d={d} />
          <TextLink href={d.url}>{cta}</TextLink>
        </Column>
      </Row>
    </Section>
  );
}

/** Uitgelichte deal over de hele breedte (naar Jesse's FeaturedDeal): grote foto, daaronder de
 *  tekstregels en een knop. `primary={false}`: omlijnde knop, voor mails die al een oranje
 *  hoofdknop hebben. */
export function FeaturedDeal({ deal: d, cta = "Bekijk arrangement", primary = true }: { deal: RowDeal; cta?: string; primary?: boolean }) {
  return (
    <Section style={{ border: `1px solid #E5E5E5`, borderRadius: "8px", marginTop: "12px", overflow: "hidden" }}>
      <Link href={d.url}>
        <Img src={d.image} alt={d.packageTitle ?? d.hotelName ?? ""} width="560" height="300" style={{ display: "block", width: "100%", height: "300px", objectFit: "cover" }} />
      </Link>
      <Section style={{ padding: "18px 20px 22px" }}>
        <DealText d={d} />
        <Section style={{ marginTop: "14px" }}>
          {primary ? <PrimaryButton href={d.url} small>{cta}</PrimaryButton> : <SecondaryButton href={d.url}>{cta}</SecondaryButton>}
        </Section>
      </Section>
    </Section>
  );
}

/** Eén groot, de rest als rij: de vaste opbouw van een rij suggesties. */
export function DealList({ deals, primary = true }: { deals: RowDeal[]; primary?: boolean }) {
  const [first, ...rest] = deals;
  return (
    <>
      {first && <FeaturedDeal deal={first} primary={primary} />}
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
    <Section>
      <Text style={s.kop}>Waarover wil je aanbiedingen ontvangen?</Text>
      <Text style={s.body}>Eén klik is genoeg, dan sturen we voortaan wat je zoekt.</Text>
      <PillGrid items={items.map((t) => ({ label: t.label, icon: t.icon, href: `${site}/crm/thema?keuze=${t.id}` }))} />
    </Section>
  );
}
