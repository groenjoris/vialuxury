import { Button, Text } from "@react-email/components";
import * as React from "react";
import { font, newsletter } from "./theme";

// Gedeelde bouwstenen van de CRM-mails (concept, alleen desktop + light mode).
// Links naar het prototype gaan naar de R1-dealpagina, zodat de foto, titel en prijs
// uit de mail daar terugkomen (zachte landing).

const c = newsletter.light;

export const site = "https://vialuxury.vercel.app";

export const crmCss = `
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
