import { Button, Column, Img, Link, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { baseUrl, font, newsletter } from "./theme";

// Gedeelde bouwstenen van de CRM-mails (concept, alleen desktop + light mode).
// Links naar het prototype gaan naar de R1-dealpagina, zodat de foto, titel en prijs
// uit de mail daar terugkomen (zachte landing).

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
  h1: { fontFamily: font.heading, fontWeight: 600, fontSize: "34px", lineHeight: "1.2", color: c.heading, margin: 0 },
  kop: { fontFamily: font.heading, fontWeight: 600, fontSize: "22px", lineHeight: "1.3", color: c.heading, margin: 0 },
  body: { fontFamily: font.body, fontSize: "16px", lineHeight: "1.5", color: c.text, margin: "10px 0 0" },
  name: { fontFamily: font.body, fontSize: "16px", fontWeight: 700, lineHeight: "1.3", color: c.text, margin: 0 },
  title: { fontFamily: font.body, fontSize: "14px", lineHeight: "1.4", color: c.text, margin: "2px 0 0" },
  muted: { fontFamily: font.body, fontSize: "13px", lineHeight: "1.4", color: c.muted, margin: "6px 0 0" },
};

/** Eén primaire, oranje knop per mail. */
export function PrimaryButton({ href, children, small }: { href: string; children: React.ReactNode; small?: boolean }) {
  return (
    <Button
      href={href}
      style={{
        backgroundColor: c.cta,
        color: "#FFFFFF",
        fontFamily: font.body,
        fontSize: small ? "14px" : "16px",
        fontWeight: 700,
        borderRadius: "6px",
        padding: small ? "11px 18px" : "14px 28px",
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

/** Persuasief label op een dealkaart (Populair, Nieuw, Aanbevolen). "Samengesteld door" is geen label maar een regel met de specialist (zie DealListCard). */
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

/** Deal in de list view van de zoekkaarten: foto links over de volle kaarthoogte; rechts
 *  label, hotelnaam, dealtitel, 4 inclusies, vanafprijs met doorgehaalde prijs en Bekijk-knop. */
export type ListDeal = {
  hotelName: string;
  packageTitle: string;
  label?: "Populair" | "Nieuw" | "Aanbevolen";
  includes: string[];
  /** "Samengesteld door": geen label, maar een korte regel met de specialist en één zin. */
  curator?: { name: string; photo: string; role: string; story: string };
  /** "2 personen, 1 nacht" */
  priceMeta: string;
  fromPrice: string;
  originalPrice?: string;
  image: string;
  url: string;
};

export function DealListCard({ deal: d }: { deal: ListDeal }) {
  const check = `${baseUrl}/images/mail/check.png`;
  return (
    <Section style={{ border: `1px solid ${c.border}`, borderRadius: "8px", marginTop: "16px", overflow: "hidden" }}>
      <Row>
        {/* Foto als achtergrond, zodat hij de hele kaarthoogte vult (zoals de list view) */}
        <Column className="stack" style={{ width: "200px", verticalAlign: "top", backgroundImage: `url(${d.image})`, backgroundSize: "cover", backgroundPosition: "center" }}>
          <Link href={d.url} aria-label={d.packageTitle} style={{ display: "block", width: "200px", minHeight: "236px" }} />
        </Column>
        <Column className="stack" style={{ verticalAlign: "top", padding: "16px 18px" }}>
          {d.label && <DealLabel>{d.label}</DealLabel>}
          <Text style={{ ...s.name, margin: d.label ? "8px 0 0" : 0 }}>{d.hotelName}</Text>
          <Text style={{ ...s.title, margin: "2px 0 0" }}>{d.packageTitle}</Text>
          <Section style={{ marginTop: "10px" }}>
            {d.includes.slice(0, 4).map((inc) => (
              <Row key={inc}>
                <Column style={{ width: "20px", verticalAlign: "top", paddingTop: "2px" }}>
                  <Img src={check} alt="" width="14" height="14" />
                </Column>
                <Column style={{ verticalAlign: "top" }}>
                  <Text style={{ ...s.title, fontSize: "13px", margin: "0 0 4px" }}>{inc}</Text>
                </Column>
              </Row>
            ))}
          </Section>
          {d.curator && (
            <Row style={{ marginTop: "8px" }}>
              <Column style={{ width: "40px", verticalAlign: "top" }}>
                <Img src={d.curator.photo} alt={d.curator.name} width="32" height="32" style={{ display: "block", borderRadius: "16px", objectFit: "cover" }} />
              </Column>
              <Column style={{ verticalAlign: "top" }}>
                <Text style={{ ...s.title, fontSize: "13px", margin: 0 }}>
                  <strong>Samengesteld door {d.curator.name}</strong>
                  <span style={{ color: c.muted }}>, {d.curator.role}</span>
                </Text>
                <Text style={{ ...s.muted, fontSize: "13px", fontStyle: "italic", margin: "2px 0 0" }}>"{d.curator.story}"</Text>
              </Column>
            </Row>
          )}
          <Row style={{ marginTop: "10px" }}>
            <Column style={{ verticalAlign: "bottom" }}>
              <Text style={{ ...s.muted, fontSize: "12px", margin: 0 }}>{d.priceMeta}</Text>
              <Text style={{ fontFamily: font.body, fontSize: "14px", color: c.text, margin: "2px 0 0" }}>
                <span style={{ color: c.muted }}>Vanaf </span>
                {d.originalPrice && <span style={{ color: c.muted, textDecoration: "line-through", marginRight: "6px" }}>{d.originalPrice}</span>}
                <strong style={{ fontSize: "20px" }}>{d.fromPrice}</strong>
              </Text>
            </Column>
            <Column align="right" style={{ verticalAlign: "bottom" }}>
              <PrimaryButton href={d.url}>Bekijk</PrimaryButton>
            </Column>
          </Row>
        </Column>
      </Row>
    </Section>
  );
}

/** Dealrij met zwarte rand (zoals "Jouw verblijf" in de reviewmail): foto links tot aan de rand
 *  en over de volle hoogte; rechts hotelnaam, plaats, dealtitel, één vette regel (datums of
 *  vanafprijs) en een oranje link. Geen labels. */
export type RowDeal = {
  hotelName?: string;
  /** Aantal sterren, op een eigen regel onder de hotelnaam (Klaviyo: niet naast de naam). */
  stars?: number;
  place?: string;
  packageTitle?: string;
  /** Vette regel onder de dealtitel: "31 oktober tot 2 november 2026" of "Vanaf €319 voor 2 personen". */
  line?: string;
  image: string;
  url: string;
};

export function DealRow({ deal: d, cta = "Bekijk" }: { deal: RowDeal; cta?: string }) {
  return (
    <Section style={{ border: `1px solid ${c.text}`, borderRadius: "8px", marginTop: "12px", overflow: "hidden" }}>
      <Row>
        {/* Foto als achtergrond: sluit aan op de rand en vult de hele hoogte van het blok */}
        <Column className="stack" style={{ width: "190px", verticalAlign: "top", backgroundImage: `url(${d.image})`, backgroundSize: "cover", backgroundPosition: "center" }}>
          <Link href={d.url} aria-label={d.hotelName ?? cta} style={{ display: "block", width: "190px", minHeight: "150px" }} />
        </Column>
        <Column className="stack" style={{ verticalAlign: "top", padding: "16px 18px" }}>
          {d.hotelName && <Text style={{ fontFamily: font.heading, fontWeight: 600, fontSize: "20px", lineHeight: "1.2", color: c.heading, margin: 0 }}>{d.hotelName}</Text>}
          {d.stars && <Text style={{ fontFamily: font.body, fontSize: "13px", lineHeight: "1.2", letterSpacing: "2px", color: c.text, margin: "4px 0 0" }}>{"★".repeat(d.stars)}</Text>}
          {d.place && <Text style={{ ...s.muted, fontSize: "14px", margin: "2px 0 0" }}>{d.place}</Text>}
          {d.packageTitle && <Text style={{ ...s.title, margin: "8px 0 0" }}>{d.packageTitle}</Text>}
          {d.line && <Text style={{ ...s.title, fontWeight: 700, margin: "8px 0 0" }}>{d.line}</Text>}
          <Link href={d.url} style={{ display: "inline-block", marginTop: "10px", fontFamily: font.body, fontSize: "14px", fontWeight: 700, color: c.link, textDecoration: "underline" }}>
            {cta}
          </Link>
        </Column>
      </Row>
    </Section>
  );
}

/** Kortingscode als coupon (naar het codeblok van Jesse's terugkomactie): oranje gestippelde rand,
 *  de code als selecteerbare tekst in oranje serif, gecentreerd in het vak; de geldigheid eronder staat links. */
export function CodeBlock({ code, label, deadline }: { code: string; label: string; deadline: string }) {
  return (
    <Section>
      <Section style={{ width: "100%", border: `2px dashed ${c.cta}`, borderRadius: "8px", padding: "20px 22px", textAlign: "center" }}>
        <Text style={{ fontFamily: font.body, fontSize: "16px", lineHeight: "1.3", color: c.text, margin: 0, textAlign: "center" }}>{label}</Text>
        <Text style={{ fontFamily: font.heading, fontWeight: 700, fontSize: "32px", lineHeight: "1.2", letterSpacing: "0.02em", color: c.cta, margin: "6px 0 0", textAlign: "center" }}>{code}</Text>
      </Section>
      <Text style={{ fontFamily: font.body, fontSize: "16px", fontWeight: 700, color: c.text, margin: "14px 0 0" }}>
        <Img src={`${baseUrl}/images/mail/crm/clock-donker.png`} alt="" width="18" height="18" style={{ display: "inline-block", verticalAlign: "-3px", marginRight: "6px" }} />
        Geldig tot en met {deadline}
      </Text>
      <Text style={{ ...s.title, margin: "4px 0 0" }}>Vul de code in bij het boeken.</Text>
    </Section>
  );
}

/** Uitgelichte deal over de hele breedte (naar Jesse's FeaturedDeal): grote foto, daaronder alles
 *  onder elkaar: hotelnaam, plaats, dealtitel, vette regel (vanafprijs) en een oranje knop.
 *  Zelfde zwarte rand en tekststijlen als DealRow; geen labels. */
export function FeaturedDeal({ deal: d, cta = "Bekijk arrangement" }: { deal: RowDeal; cta?: string }) {
  return (
    <Section style={{ border: `1px solid ${c.text}`, borderRadius: "8px", marginTop: "12px", overflow: "hidden" }}>
      <Link href={d.url}>
        <Img src={d.image} alt={d.packageTitle ?? d.hotelName ?? ""} width="560" height="300" style={{ display: "block", width: "100%", height: "300px", objectFit: "cover" }} />
      </Link>
      <Section style={{ padding: "18px 20px 22px" }}>
        {d.hotelName && <Text style={{ fontFamily: font.heading, fontWeight: 600, fontSize: "20px", lineHeight: "1.2", color: c.heading, margin: 0 }}>{d.hotelName}</Text>}
        {d.stars && <Text style={{ fontFamily: font.body, fontSize: "13px", lineHeight: "1.2", letterSpacing: "2px", color: c.text, margin: "4px 0 0" }}>{"★".repeat(d.stars)}</Text>}
        {d.place && <Text style={{ ...s.muted, fontSize: "14px", margin: "2px 0 0" }}>{d.place}</Text>}
        {d.packageTitle && <Text style={{ ...s.title, margin: "8px 0 0" }}>{d.packageTitle}</Text>}
        {d.line && <Text style={{ ...s.title, fontWeight: 700, margin: "8px 0 0" }}>{d.line}</Text>}
        <Section style={{ marginTop: "14px" }}>
          <PrimaryButton href={d.url} small>{cta}</PrimaryButton>
        </Section>
      </Section>
    </Section>
  );
}
