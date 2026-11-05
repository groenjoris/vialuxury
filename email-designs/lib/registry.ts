import type * as React from "react";
import VakantieBevestiging from "../emails/vakantie-bevestiging";
import VakantiePreTravel from "../emails/vakantie-pre-travel";
import VakantieIncheckHotel from "../emails/vakantie-incheck-hotel";
import MvpVakantieBevestiging from "../emails/mvp-vakantie-bevestiging";
import CrmNagenieten from "../emails/crm-nagenieten";
import CrmJaarGeleden from "../emails/crm-jaar-geleden";
import CrmWinkelmandje from "../emails/crm-winkelmandje";
import CrmWinkelmandje2Dagen from "../emails/crm-winkelmandje-2-dagen";
import CrmThemaStedentrips from "../emails/crm-thema-stedentrips";
import { incheckMails } from "./incheckMails";

// "crm": concept-mails voor het CRM-project (alleen light, eigen lijst app/data/crm-emails.json).
export type EmailSection = "designs" | "inspiration" | "crm";

export type EmailEntry = {
  slug: string;
  title: string;
  description: string;
  section: EmailSection;
  /** Onderwerpregel (CRM-mails; de preheader staat in de mail zelf). */
  subject?: string;
  preheader?: string;
  // Elke e-mail exporteert PreviewProps met representatieve voorbeelddata
  // en accepteert een optionele `mode`-prop ("light" | "dark").
  Component: React.ComponentType<any> & { PreviewProps?: Record<string, unknown> };
  /** Props voor deze variant (anders de PreviewProps van het component). */
  props?: Record<string, unknown>;
};

// Alleen de e-mails van de multi-hotel vakanties; de overige ViaLuxury-mails
// staan in het losse project vialuxury-emails.
export const emails: EmailEntry[] = [
  {
    slug: "vakantie-bevestiging",
    title: "Boekingsbevestiging vakantie",
    description: "Bevestiging na het boeken van een auto- of fietsvakantie met meerdere hotels: kassabon per hotel (adres, nachten, inclusies, check-in/out), flexibel annuleren, prijs, tips voor je reis, boeking terugvinden, cadeaukaart en FAQ.",
    section: "designs",
    Component: VakantieBevestiging,
  },
  {
    slug: "vakantie-pre-travel",
    title: "Pre-travel (14 dagen voor vertrek)",
    description: "Checklist voor je reis: identiteitsbewijs en boekingsnummer, inchecken bij het eerste hotel (adres, route, parkeren), wat je nog betaalt, de persoonlijke pagina met praktische informatie en tips, inloggen op je account om je boeking te beheren, en veelgestelde vragen.",
    section: "designs",
    Component: VakantiePreTravel,
  },
  // Incheckmails: dag vóór hotel 1, 2 en 3, voor de auto- en de fietsvakantie.
  ...incheckMails.map((m) => ({ slug: m.slug, title: m.title, description: m.description, section: "designs" as const, Component: VakantieIncheckHotel, props: m.props })),
  // MVP 12-11-2026: eigen kopie van de boekingsbevestiging, los van de volledige versie uit te kleden.
  {
    slug: "mvp-vakantie-bevestiging",
    title: "MVP — Boekingsbevestiging vakantie",
    description: "MVP-versie van de boekingsbevestiging: kassabon per hotel (met alle inclusies), flexibel annuleren, prijs, boeking terugvinden, cadeaukaart en FAQ — zonder het blok Tips voor je reis.",
    section: "designs",
    Component: MvpVakantieBevestiging,
  },
  // CRM (concept, desktop + light mode): drie geautomatiseerde mails.
  {
    slug: "crm-nagenieten",
    title: "Nagenietmail (3 dagen na vertrek)",
    description: "Haalt één gegeven op: wanneer de volgende vakantie is, om latere mails te timen. Grote foto van het hotel met \"We hopen dat je genoten hebt van …\", daarna één vraag met vier gelijkwaardige knoppen. Geen deals, geen code.",
    section: "crm",
    subject: "Wanneer ga je weer?",
    preheader: "Eén klik, dan sturen we je op het juiste moment inspiratie.",
    Component: CrmNagenieten,
  },
  {
    slug: "crm-jaar-geleden",
    title: "Precies een jaar geleden",
    description: "On this day-herinnering op de aankomstdatum +1 jaar: grote foto, datum en hotel, één knop naar het arrangement met dezelfde periode en personen vooringevuld. Kortingsregel alleen bij een actieve code; drie deals met frame-titel.",
    section: "crm",
    subject: "Vandaag een jaar geleden",
    preheader: "Landgoed Lauswolt, Beetsterzwaag. Nog een keer?",
    Component: CrmJaarGeleden,
  },
  {
    slug: "crm-winkelmandje",
    title: "Winkelmandje (2 uur na verlaten)",
    description: "Eén doel: de boeking afronden. Winkelmandkaart met concrete datums, nachten, personen en prijs, een beschikbaarheidsregel en één knop terug naar de boeking. Gastenoordeel als er een score is. Geen alternatieve deals.",
    section: "crm",
    subject: "Hotel Winselerhof op 20 nov: nog beschikbaar",
    preheader: "Je boeking staat klaar. Rond af wanneer het jou uitkomt.",
    Component: CrmWinkelmandje,
  },
  {
    slug: "crm-winkelmandje-beschikbaar",
    title: "Winkelmandje (2 uur na verlaten)",
    description: "Variant \"Beschikbaar\": nog geen schaarste, wel populair op de aankomstdatum.",
    section: "crm",
    subject: "Hotel Winselerhof op 20 nov: nog beschikbaar",
    preheader: "Je boeking staat klaar. Rond af wanneer het jou uitkomt.",
    Component: CrmWinkelmandje,
    props: { ...CrmWinkelmandje.PreviewProps, availability: "available" },
  },
  {
    slug: "crm-winkelmandje-2-dagen",
    title: "Winkelmandje (2 dagen na verlaten)",
    description: "Na de mail van 2 uur nu alternatieven: klein de deal uit het winkelmandje, daaronder drie vergelijkbare deals in de list view van de zoekkaarten.",
    section: "crm",
    subject: "Dit zijn 3 deals die lijken op Hotel Winselerhof",
    preheader: "Ook met ontbijt en diner, vanaf €249 voor 2 personen.",
    Component: CrmWinkelmandje2Dagen,
  },
  {
    slug: "crm-thema-stedentrips",
    title: "Themamail stedentrips (A6)",
    description: "Drie populaire stedentrips in list view, daarna een ander thema kiezen met vijf witte snelfilterknoppen.",
    section: "crm",
    subject: "Dit zijn de populairste stedentrips van dit moment",
    preheader: "Parijs, Den Haag en Amsterdam, vanaf €279 voor 2 personen.",
    Component: CrmThemaStedentrips,
  },
  {
    slug: "crm-thema-stedentrips-plaatjes",
    title: "Themamail stedentrips (A6)",
    description: "Variant met plaatjes: per thema een foto, de themanaam en een oranje link \"Meer van dit thema\".",
    section: "crm",
    subject: "Dit zijn de populairste stedentrips van dit moment",
    preheader: "Parijs, Den Haag en Amsterdam, vanaf €279 voor 2 personen.",
    Component: CrmThemaStedentrips,
    props: { ...CrmThemaStedentrips.PreviewProps, variant: "plaatjes" },
  },
];

export function getEmail(slug: string): EmailEntry | undefined {
  return emails.find((e) => e.slug === slug);
}
